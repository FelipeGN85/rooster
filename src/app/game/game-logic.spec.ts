import {
  Cell,
  GameState,
  findWin,
  isDraw,
  isGameState,
  newGame,
  nextRound,
  play,
} from './game-logic';

const board = (marks: string): Cell[] =>
  marks.split('').map((mark) => (mark === 'X' || mark === 'O' ? mark : null));

const playAll = (state: GameState, moves: number[]): GameState =>
  moves.reduce((current, index) => play(current, index), state);

describe('findWin', () => {
  it('finds every row, column and diagonal', () => {
    const wins = [
      'XXX......',
      '...XXX...',
      '......XXX',
      'X..X..X..',
      '.X..X..X.',
      '..X..X..X',
      'X...X...X',
      '..X.X.X..',
    ];
    wins.forEach((marks, index) => {
      expect(findWin(board(marks))).toEqual(expect.objectContaining({ mark: 'X', index }));
    });
  });

  it('finds nothing on a board with no line', () => {
    expect(findWin(board('XOXXOOOXX'))).toBeNull();
  });
});

describe('isDraw', () => {
  it('is a draw when the board is full and nobody won', () => {
    expect(isDraw(board('XOXXOOOXX'))).toBe(true);
  });

  it('is not a draw when the last move wins', () => {
    expect(isDraw(board('XXXOOXOXO'))).toBe(false);
  });
});

describe('play', () => {
  it('alternates X and O', () => {
    const state = playAll(newGame(), [0, 4]);
    expect(state.cells[0]).toBe('X');
    expect(state.cells[4]).toBe('O');
    expect(state.xIsNext).toBe(true);
  });

  it('ignores a taken cell and an index off the board', () => {
    const state = play(newGame(), 0);
    expect(play(state, 0)).toBe(state);
    expect(play(state, 9)).toBe(state);
    expect(play(state, 1.5)).toBe(state);
  });

  it('scores a win and then locks the board', () => {
    const won = playAll(newGame(), [0, 3, 1, 4, 2]);
    expect(won.score).toEqual({ x: 1, o: 0, draw: 0 });
    expect(play(won, 8)).toBe(won);
  });

  it('scores a draw', () => {
    const drawn = playAll(newGame(), [0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(drawn.score).toEqual({ x: 0, o: 0, draw: 1 });
  });
});

describe('nextRound', () => {
  it('clears the board, keeps the score and lets O open the second round', () => {
    const won = playAll(newGame(), [0, 3, 1, 4, 2]);
    const second = nextRound(won);
    expect(second.cells.every((cell) => cell === null)).toBe(true);
    expect(second.score).toEqual(won.score);
    expect(second.xIsNext).toBe(false);
    expect(nextRound(second).xIsNext).toBe(true);
  });
});

describe('isGameState', () => {
  it('accepts a real state', () => {
    expect(isGameState(playAll(newGame(), [0, 4]))).toBe(true);
  });

  it('rejects anything malformed', () => {
    const good = newGame();
    expect(isGameState(null)).toBe(false);
    expect(isGameState({ ...good, cells: good.cells.slice(1) })).toBe(false);
    expect(isGameState({ ...good, cells: ['Z', ...good.cells.slice(1)] })).toBe(false);
    expect(isGameState({ ...good, score: { x: -1, o: 0, draw: 0 } })).toBe(false);
    expect(isGameState({ ...good, xIsNext: 'yes' })).toBe(false);
  });
});
