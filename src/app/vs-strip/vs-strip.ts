import { Component, computed, input } from '@angular/core';

import { Mark } from '../game/game-logic';
import { Mood, Robot } from '../robot/robot';

export interface StripSide {
  mark: Mark;
  score: number;
  /** As short as fits beside the head: "Bolt · X" on one screen, "You" or "Friend" online. */
  tag: string;
  mood: Mood;
}

/**
 * The phone scoreboard: both robots' heads and scores in one strip, with the
 * draws in the middle. The side not in play fades back.
 */
@Component({
  selector: 'app-vs-strip',
  imports: [Robot],
  template: `
    <section class="strip" aria-label="Score">
      @for (side of sides(); track side.mark; let last = $last) {
        <div class="side" [class.o]="side.mark === 'O'" [class.dim]="dimmed(side)">
          <app-robot class="head" [mark]="side.mark" [mood]="side.mood" [head]="true" />
          <div class="text">
            <span class="score" [class.x]="side.mark === 'X'" [class.o]="side.mark === 'O'">
              {{ side.score }}
            </span>
            <span class="tag" [class.turn]="side.mood === 'turn'">{{ side.tag }}</span>
          </div>
        </div>
        @if (!last) {
          <div class="middle">
            <span class="vs" aria-hidden="true">VS</span>
            <span class="draws">Draws {{ draws() }}</span>
          </div>
        }
      }
    </section>
  `,
  styleUrl: './vs-strip.scss',
})
export class VsStrip {
  readonly sides = input.required<StripSide[]>();
  readonly draws = input.required<number>();

  /** Someone is in the spotlight: to move, or the winner. */
  private readonly spotlight = computed(() =>
    this.sides().some((side) => side.mood === 'turn' || side.mood === 'won'),
  );

  protected dimmed(side: StripSide): boolean {
    return side.mood === 'lost' || (side.mood === 'idle' && this.spotlight());
  }
}
