import { Component, input } from '@angular/core';

import { Mark } from '../game/game-logic';
import { Mood, Robot } from '../robot/robot';

/** One side of the arena: a player's score and name over their robot. */
@Component({
  selector: 'app-player-card',
  imports: [Robot],
  template: `
    <span class="score" [class.x]="mark() === 'X'" [class.o]="mark() === 'O'">{{ score() }}</span>
    <span class="name" [class.active]="mood() === 'turn'">{{ name() }}</span>
    <div class="figure">
      <!-- An echo of the status line, which screen readers already hear. -->
      @if (bubble(); as text) {
        <p class="bubble" aria-hidden="true">{{ text }}</p>
      }
      <app-robot [mark]="mark()" [mood]="mood()" />
    </div>
  `,
  styleUrl: './player-card.scss',
})
export class PlayerCard {
  readonly mark = input.required<Mark>();
  readonly score = input.required<number>();
  readonly name = input.required<string>();
  readonly mood = input<Mood>('idle');
  readonly bubble = input<string | null>(null);
}
