export type Mark = 'X' | 'O';
export type Cell = Mark | null;

export interface Score {
  x: number;
  o: number;
  draw: number;
}

export interface GameState {
  cells: Cell[];
  xIsNext: boolean;
  /** Rounds finished or abandoned, so the opening move can alternate. */
  round: number;
  score: Score;
}

export interface Win {
  mark: Mark;
  /** Which of `LINES` it is, for drawing the strike. */
  index: number;
  line: readonly number[];
}

/** Rows, then columns, then the two diagonals. */
export const LINES: readonly (readonly number[])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const emptyBoard = (): Cell[] => Array<Cell>(9).fill(null);

export function newGame(): GameState {
  return { cells: emptyBoard(), xIsNext: true, round: 0, score: { x: 0, o: 0, draw: 0 } };
}

export function findWin(cells: readonly Cell[]): Win | null {
  for (let index = 0; index < LINES.length; index++) {
    const line = LINES[index];
    const [a, b, c] = line;
    const mark = cells[a];
    if (mark && mark === cells[b] && mark === cells[c]) {
      return { mark, index, line };
    }
  }
  return null;
}

export function isDraw(cells: readonly Cell[]): boolean {
  return !findWin(cells) && cells.every((cell) => cell !== null);
}

export function isOver(cells: readonly Cell[]): boolean {
  return findWin(cells) !== null || isDraw(cells);
}

/** The state after the player to move takes `index`; unchanged if that move is not allowed. */
export function play(state: GameState, index: number): GameState {
  if (!Number.isInteger(index) || index < 0 || index > 8) return state;
  if (state.cells[index] !== null || isOver(state.cells)) return state;

  const cells = state.cells.slice();
  cells[index] = state.xIsNext ? 'X' : 'O';

  const score = { ...state.score };
  const win = findWin(cells);
  if (win) score[win.mark === 'X' ? 'x' : 'o'] += 1;
  else if (isDraw(cells)) score.draw += 1;

  return { ...state, cells, xIsNext: !state.xIsNext, score };
}

/** A fresh board that keeps the score; X and O take turns to open. */
export function nextRound(state: GameState): GameState {
  const round = state.round + 1;
  return { ...state, cells: emptyBoard(), xIsNext: round % 2 === 0, round };
}

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

/** Checks a state that arrived from the other player before it is trusted. */
export function isGameState(value: unknown): value is GameState {
  if (typeof value !== 'object' || value === null) return false;
  const state = value as Record<string, unknown>;
  const cells = state['cells'];
  const score = state['score'] as Record<string, unknown> | null;

  return (
    Array.isArray(cells) &&
    cells.length === 9 &&
    cells.every((cell) => cell === null || cell === 'X' || cell === 'O') &&
    typeof state['xIsNext'] === 'boolean' &&
    isCount(state['round']) &&
    typeof score === 'object' &&
    score !== null &&
    isCount(score['x']) &&
    isCount(score['o']) &&
    isCount(score['draw'])
  );
}
