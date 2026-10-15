import { Component, computed, inject } from '@angular/core';

import { AppFooter } from './app-footer/app-footer';
import { AppHeader } from './app-header/app-header';
import { Board } from './board/board';
import { Mark } from './game/game-logic';
import { GameStore } from './game/game.store';
import { OnlineService, isRoomId } from './game/online.service';
import { OnlinePanel } from './online-panel/online-panel';
import { PlayerCard } from './player-card/player-card';
import { Mood, ROBOTS } from './robot/robot';
import { VsStrip } from './vs-strip/vs-strip';

interface Side {
  mark: Mark;
  score: number;
  name: string;
  /** The shorter label the phone strip has room for. */
  tag: string;
  mood: Mood;
  bubble: string | null;
}

@Component({
  selector: 'app-root',
  imports: [AppHeader, AppFooter, Board, OnlinePanel, PlayerCard, VsStrip],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly store = inject(GameStore);
  protected readonly online = inject(OnlineService);

  /** False while an online game has nobody to play against yet. */
  private readonly live = computed(
    () => this.online.role() === 'local' || this.online.status() === 'connected',
  );

  /** The one line that says what is going on; it doubles as the live region. */
  protected readonly status = computed(() => {
    const win = this.store.win();
    const mine = this.online.myMark();

    if (win) {
      if (!mine) return `${ROBOTS[win.mark].name} wins!`;
      return win.mark === mine ? 'You win!' : 'Friend wins!';
    }
    if (this.store.draw()) return 'It’s a draw';

    switch (this.online.status()) {
      case 'opening':
      case 'waiting':
        return 'Waiting for a friend';
      case 'connecting':
        return 'Joining…';
      case 'lost':
        return 'Friend disconnected';
      case 'failed':
        return 'Not connected';
    }

    const turn = this.store.turn();
    if (!mine || !this.live()) return `${ROBOTS[turn].name}’s turn`;
    return turn === mine ? 'Your turn' : 'Friend’s turn';
  });

  /** The status badge's offset shadow takes the colour of whoever it is about. */
  protected readonly statusAccent = computed(() => {
    if (this.store.draw()) return 'var(--white)';
    const mark = this.store.win()?.mark ?? this.store.turn();
    return mark === 'X' ? 'var(--x)' : 'var(--o)';
  });

  protected readonly sides = computed<Side[]>(() => {
    const { score } = this.store.state();
    return [this.side('X', score.x), this.side('O', score.o)];
  });

  /** On phones the speech bubbles are gone; the speaker's catchphrase rides along in the status. */
  protected readonly quip = computed(() => {
    const speaker = this.sides().find((side) => side.bubble !== null);
    return speaker ? ROBOTS[speaker.mark].quip : null;
  });

  constructor() {
    const roomId = new URLSearchParams(location.search).get('join');
    if (isRoomId(roomId)) void this.online.join(roomId);
  }

  private side(mark: Mark, score: number): Side {
    const robot = ROBOTS[mark];
    const win = this.store.win();
    const mine = this.online.myMark();

    const who = mine === null ? mark : mark === mine ? 'You' : 'Friend';
    const name = `${robot.name} · ${who}`;
    const tag = mine === null ? name : who;

    if (win) {
      const won = win.mark === mark;
      return { mark, score, name, tag, mood: won ? 'won' : 'lost', bubble: won ? robot.win : null };
    }

    const turn = this.live() && !this.store.over() && this.store.turn() === mark;
    return {
      mark,
      score,
      name,
      tag,
      mood: turn ? 'turn' : 'idle',
      bubble: turn ? robot.turn : null,
    };
  }
}
