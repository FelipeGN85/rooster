import { Component, computed, input, output } from '@angular/core';

import { Cell, Win } from '../game/game-logic';

const ROWS = ['Top', 'Middle', 'Bottom'];
const COLUMNS = ['left', 'centre', 'right'];

/** Centre of each row and column in the 300-unit drawing of the board. */
const MIDS = [50, 150, 250];

/** Where the strike runs for each of `LINES`, in the same order. */
function strikePath(index: number): string {
  if (index < 3) return `M22 ${MIDS[index]} H278`;
  if (index < 6) return `M${MIDS[index - 3]} 22 V278`;
  return index === 6 ? 'M30 30 L270 270' : 'M270 30 L30 270';
}

/** The black handheld: a dark screen, a white grid and glowing marks. */
@Component({
  selector: 'app-board',
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  readonly cells = input.required<readonly Cell[]>();
  readonly win = input<Win | null>(null);
  /** True when this screen may not move: not its turn, or the round is over. */
  readonly locked = input(false);

  readonly play = output<number>();

  protected readonly strike = computed(() => {
    const win = this.win();
    return win ? { d: strikePath(win.index), mark: win.mark } : null;
  });

  protected dimmed(index: number): boolean {
    const win = this.win();
    return win !== null && !win.line.includes(index);
  }

  protected label(index: number, cell: Cell): string {
    return `${ROWS[Math.floor(index / 3)]} ${COLUMNS[index % 3]}: ${cell ?? 'empty'}`;
  }
}
