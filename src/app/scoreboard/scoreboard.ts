import { Component, computed, input } from '@angular/core';

import { Mark, Score } from '../game/game-logic';

/** Big outlined scores either side, draws small in the middle; the player to move is underlined. */
@Component({
  selector: 'app-scoreboard',
  template: `
    <section class="board" aria-label="Score">
      <div class="side">
        <span class="count x">{{ score().x }}</span>
        <span class="name" [class.turn]="turn() === 'X'">{{ names().x }}</span>
      </div>
      <div class="side draws">
        <span class="count">{{ score().draw }}</span>
        <span class="name">Draws</span>
      </div>
      <div class="side">
        <span class="count o">{{ score().o }}</span>
        <span class="name" [class.turn]="turn() === 'O'">{{ names().o }}</span>
      </div>
    </section>
  `,
  styles: `
    .board {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: end;
      gap: 8px;
      width: 100%;
      max-width: 440px;
      margin: 0 auto;
    }
    .side {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .count {
      font-family: var(--font-display);
      font-size: clamp(48px, 12vw, 72px);
      line-height: 1;
      /* An offset shadow, not an outline: a stroke would fill Bungee's narrow 0. */
      text-shadow: 4px 4px 0 var(--ink);
    }
    .x {
      color: var(--x);
    }
    .o {
      color: var(--o);
    }
    .draws {
      gap: 6px;
    }
    .draws .count {
      font-size: 28px;
      text-shadow: none;
    }
    .name {
      padding-bottom: 2px;
      border-bottom: 3px solid transparent;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .draws .name {
      color: var(--ink-soft);
    }
    .turn {
      border-bottom-color: var(--ink);
    }
  `,
})
export class Scoreboard {
  readonly score = input.required<Score>();
  /** Whose move it is, or null once the round is over. */
  readonly turn = input<Mark | null>(null);
  /** Online, which side this screen plays; the labels then say You and Friend. */
  readonly myMark = input<Mark | null>(null);

  protected readonly names = computed(() => {
    const mine = this.myMark();
    if (!mine) return { x: 'Player X', o: 'Player O' };
    return mine === 'X' ? { x: 'You · X', o: 'Friend · O' } : { x: 'Friend · X', o: 'You · O' };
  });
}
