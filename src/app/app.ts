import { Component, computed, inject } from '@angular/core';

import { AppFooter } from './app-footer/app-footer';
import { AppHeader } from './app-header/app-header';
import { Board } from './board/board';
import { GameStore } from './game/game.store';
import { OnlineService, isRoomId } from './game/online.service';
import { OnlinePanel } from './online-panel/online-panel';
import { Scoreboard } from './scoreboard/scoreboard';

@Component({
  selector: 'app-root',
  imports: [AppHeader, AppFooter, Board, OnlinePanel, Scoreboard],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly store = inject(GameStore);
  protected readonly online = inject(OnlineService);

  /** The one line that says what is going on; it doubles as the live region. */
  protected readonly status = computed(() => {
    const win = this.store.win();
    const mine = this.online.myMark();

    if (win) return !mine ? `${win.mark} wins!` : win.mark === mine ? 'You win!' : 'Friend wins!';
    if (this.store.draw()) return 'It’s a draw';

    switch (this.online.status()) {
      case 'opening':
      case 'waiting':
        return 'Waiting for a friend';
      case 'connecting':
        return 'Joining…';
      case 'lost':
        return 'Friend disconnected';
    }

    const turn = this.store.turn();
    if (!mine || this.online.status() !== 'connected') return `${turn}’s turn`;
    return turn === mine ? 'Your turn' : 'Friend’s turn';
  });

  /** The status badge's offset shadow takes the colour of whoever it is about. */
  protected readonly statusAccent = computed(() => {
    if (this.store.draw()) return 'var(--white)';
    const mark = this.store.win()?.mark ?? this.store.turn();
    return mark === 'X' ? 'var(--x)' : 'var(--o)';
  });

  constructor() {
    const roomId = new URLSearchParams(location.search).get('join');
    if (isRoomId(roomId)) void this.online.join(roomId);
  }
}
