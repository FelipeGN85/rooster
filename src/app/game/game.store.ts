import { Injectable, computed, signal } from '@angular/core';

import { GameState, Mark, findWin, isDraw, newGame, nextRound, play } from './game-logic';

/** The game on this screen. In an online game the host's copy is the real one. */
@Injectable({ providedIn: 'root' })
export class GameStore {
  readonly state = signal<GameState>(newGame());

  readonly win = computed(() => findWin(this.state().cells));
  readonly draw = computed(() => isDraw(this.state().cells));
  readonly over = computed(() => this.win() !== null || this.draw());
  readonly turn = computed<Mark>(() => (this.state().xIsNext ? 'X' : 'O'));

  play(index: number): void {
    this.state.update((state) => play(state, index));
  }

  newRound(): void {
    this.state.update(nextRound);
  }

  resetScore(): void {
    this.state.set(newGame());
  }

  /** Takes the host's state as is: the guest never works it out for itself. */
  load(state: GameState): void {
    this.state.set(state);
  }
}
