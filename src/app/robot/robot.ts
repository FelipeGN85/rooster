import { Component, computed, input } from '@angular/core';

import { Mark } from '../game/game-logic';

export type Mood = 'idle' | 'turn' | 'won' | 'lost';

/**
 * Who plays which mark, and what they say: speech bubbles on wide screens, and
 * the short `quip` tacked onto the status line on phones.
 */
export const ROBOTS: Record<Mark, { name: string; turn: string; win: string; quip: string }> = {
  X: { name: 'Bolt', turn: 'Bzzt! My move!', win: 'Bzzt! Victory!', quip: 'Bzzt!' },
  O: { name: 'Ring', turn: 'Beep boop. My move!', win: 'Beep! I win!', quip: 'Beep boop!' },
};

/**
 * The two players. Bolt (X) is boxy and red with X-shaped eyes; Ring (O) is a
 * round blue hover-bot with one ring for an eye. The mood moves them: the one
 * to play bobs, a winner hops, a loser slumps.
 */
@Component({
  selector: 'app-robot',
  host: {
    '[class.turn]': 'mood() === "turn"',
    '[class.won]': 'mood() === "won"',
    '[class.lost]': 'mood() === "lost"',
    '[class.head]': 'head()',
    '[style.--glow]': 'mark() === "X" ? "#ff6b78" : "#7cc4ff"',
  },
  templateUrl: './robot.html',
  styleUrl: './robot.scss',
})
export class Robot {
  readonly mark = input.required<Mark>();
  readonly mood = input<Mood>('idle');
  /** Just the head, cropped square: the avatar in the phone score strip. */
  readonly head = input(false);

  protected readonly label = computed(() =>
    this.mark() === 'X'
      ? 'Bolt, a boxy red robot with X-shaped eyes, playing X'
      : 'Ring, a round blue hover robot with a ring-shaped eye, playing O',
  );
}
