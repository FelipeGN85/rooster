import { Injectable, computed, effect, inject, signal } from '@angular/core';
import type { DataConnection, Peer } from 'peerjs';

import { GameState, Mark, isGameState } from './game-logic';
import { GameStore } from './game.store';

export type Role = 'local' | 'host' | 'guest';

/**
 * `opening`: asking the broker for a room. `waiting`: the host's room is open
 * and nobody is in it. `lost`: the other player was there and has gone.
 */
export type LinkStatus =
  'idle' | 'opening' | 'waiting' | 'connecting' | 'connected' | 'lost' | 'failed';

/** The guest sends what it wants to do; the host answers with the whole game. */
type Message =
  | { type: 'move'; index: number }
  | { type: 'new-round' }
  | { type: 'reset-score' }
  | { type: 'state'; state: GameState };

const ROOM_PATTERN = /^rooster-[a-z0-9]{10}$/;
const ROOM_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

/** WebRTC can take a few seconds; past this the two browsers are not getting through. */
const JOIN_TIMEOUT_MS = 20_000;

const FAILURES: Record<string, string> = {
  'peer-unavailable': 'That game has ended or the link is wrong. Ask your friend for a new link.',
  'browser-incompatible': 'This browser can’t play online. Try a recent Chrome, Firefox or Safari.',
  network: 'Couldn’t reach the matchmaking server. Check your connection and try again.',
  'server-error': 'Couldn’t reach the matchmaking server. Check your connection and try again.',
  'socket-error': 'Couldn’t reach the matchmaking server. Check your connection and try again.',
  'socket-closed': 'Couldn’t reach the matchmaking server. Check your connection and try again.',
  timeout: 'Couldn’t reach your friend’s game. Check the link, or ask them for a new one.',
};

export const isRoomId = (value: string | null): value is string =>
  value !== null && ROOM_PATTERN.test(value);

/** `crypto.getRandomValues`, unlike `randomUUID`, also works over plain http on a LAN. */
function newRoomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return (
    'rooster-' + Array.from(bytes, (byte) => ROOM_ALPHABET[byte % ROOM_ALPHABET.length]).join('')
  );
}

/** Anything from the other browser is untrusted until it has this shape. */
function parseMessage(data: unknown): Message | null {
  if (typeof data !== 'object' || data === null) return null;
  const message = data as Record<string, unknown>;
  switch (message['type']) {
    case 'move':
      return typeof message['index'] === 'number'
        ? { type: 'move', index: message['index'] }
        : null;
    case 'new-round':
    case 'reset-score':
      return { type: message['type'] };
    case 'state':
      return isGameState(message['state']) ? { type: 'state', state: message['state'] } : null;
    default:
      return null;
  }
}

/**
 * Two browsers playing one game over WebRTC, with no server of ours. The public
 * PeerJS broker only introduces them; moves then go browser to browser.
 *
 * Whoever creates the invite hosts: they play X and own the game. The guest
 * plays O, sends its moves over and shows whatever the host sends back, so the
 * two screens can never disagree.
 */
@Injectable({ providedIn: 'root' })
export class OnlineService {
  private readonly store = inject(GameStore);

  readonly role = signal<Role>('local');
  readonly status = signal<LinkStatus>('idle');
  readonly roomId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly myMark = computed<Mark | null>(() => {
    const role = this.role();
    return role === 'host' ? 'X' : role === 'guest' ? 'O' : null;
  });

  readonly inviteUrl = computed(() => {
    const roomId = this.roomId();
    if (this.role() !== 'host' || !roomId) return null;
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set('join', roomId);
    return url.toString();
  });

  /** Whether the person at this screen may put a mark down right now. */
  readonly canMove = computed(() => {
    if (this.store.over()) return false;
    if (this.role() === 'local') return true;
    return this.status() === 'connected' && this.store.turn() === this.myMark();
  });

  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private joinTimer: ReturnType<typeof setTimeout> | undefined;

  /** Bumped on every teardown, so a peer still loading for an old session is dropped. */
  private session = 0;

  constructor() {
    effect(() => {
      const state = this.store.state();
      if (this.role() === 'host') this.send({ type: 'state', state });
    });
  }

  play(index: number): void {
    if (!this.canMove()) return;
    if (this.role() === 'guest') this.send({ type: 'move', index });
    else this.store.play(index);
  }

  newRound(): void {
    if (this.role() === 'guest') this.send({ type: 'new-round' });
    else this.store.newRound();
  }

  resetScore(): void {
    if (this.role() === 'guest') this.send({ type: 'reset-score' });
    else this.store.resetScore();
  }

  async host(): Promise<void> {
    this.teardown();
    this.role.set('host');
    this.status.set('opening');

    const peer = await this.createPeer(newRoomId());
    if (!peer) return;

    peer.on('open', (id) => {
      this.roomId.set(id);
      this.status.set('waiting');
    });
    peer.on('connection', (connection) => this.adopt(connection));
  }

  async join(roomId: string): Promise<void> {
    this.teardown();
    this.role.set('guest');
    this.roomId.set(roomId);
    this.status.set('connecting');

    const peer = await this.createPeer();
    if (!peer) return;

    peer.on('open', () => {
      this.adopt(peer.connect(roomId, { reliable: true, serialization: 'json' }));
    });
    this.joinTimer = setTimeout(() => {
      if (this.status() === 'connecting') this.fail('timeout');
    }, JOIN_TIMEOUT_MS);
  }

  /** Back to a game on this screen only, with the invite dropped from the address bar. */
  leave(): void {
    this.teardown();
    if (location.search) history.replaceState(history.state, '', location.pathname);
  }

  private async createPeer(id?: string): Promise<Peer | null> {
    const session = this.session;
    // Loaded on demand: most visits never go online.
    const { Peer } = await import('peerjs');
    const peer = id ? new Peer(id) : new Peer();

    if (session !== this.session) {
      peer.destroy();
      return null;
    }

    peer.on('error', (error) => {
      // A broker hiccup does not matter once the two browsers are talking directly.
      if (this.status() !== 'connected') this.fail(error.type);
    });
    peer.on('disconnected', () => {
      if (!peer.destroyed) peer.reconnect();
    });
    this.peer = peer;
    return peer;
  }

  /**
   * Takes over a connection. The host keeps only the newest guest, so a friend
   * who reloads the page gets back in.
   */
  private adopt(connection: DataConnection): void {
    this.connection?.close();
    this.connection = connection;

    connection.on('open', () => {
      if (connection !== this.connection) return;
      clearTimeout(this.joinTimer);
      this.status.set('connected');
      this.error.set(null);
      if (this.role() === 'host') this.send({ type: 'state', state: this.store.state() });
    });
    connection.on('data', (data) => {
      if (connection === this.connection) this.receive(data);
    });
    connection.on('close', () => {
      if (connection !== this.connection) return;
      this.connection = null;
      this.status.set('lost');
    });
  }

  private receive(data: unknown): void {
    const message = parseMessage(data);
    if (!message) return;

    if (this.role() === 'guest') {
      if (message.type === 'state') this.store.load(message.state);
      return;
    }

    switch (message.type) {
      case 'move':
        if (this.store.turn() === 'O') this.store.play(message.index);
        break;
      case 'new-round':
        this.store.newRound();
        break;
      case 'reset-score':
        this.store.resetScore();
        break;
    }
  }

  private send(message: Message): void {
    if (this.connection?.open) void this.connection.send(message);
  }

  private fail(reason: string): void {
    const role = this.role();
    const roomId = this.roomId();
    this.teardown();
    this.role.set(role);
    this.roomId.set(roomId);
    this.status.set('failed');
    this.error.set(FAILURES[reason] ?? 'Something went wrong with the online game. Try again.');
  }

  private teardown(): void {
    this.session++;
    clearTimeout(this.joinTimer);
    this.connection?.close();
    this.peer?.destroy();
    this.connection = null;
    this.peer = null;
    this.role.set('local');
    this.status.set('idle');
    this.roomId.set(null);
    this.error.set(null);
    this.store.resetScore();
  }
}
