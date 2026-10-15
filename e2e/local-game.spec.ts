import { cell, expect, playMoves, status, test } from './fixtures';

// Desktop layout: Bolt and Ring stand either side of the board with their scores.
const score = (page: import('@playwright/test').Page, side: 'x' | 'o') =>
  page.locator(`app-player-card.side-${side} .score`);

test('X wins on one screen: the line is struck, the board locks, the score counts', async ({
  page,
}) => {
  await page.goto('/');
  await expect(status(page)).toHaveText(/Bolt’s turn/);

  // X takes the top row while O plays the middle row.
  await playMoves(page, [0, 3, 1, 4, 2]);

  await expect(status(page)).toHaveText(/Bolt wins!/);
  await expect(page.locator('app-board .strike')).toBeAttached();
  for (let i = 0; i < 9; i++) await expect(cell(page, i)).toBeDisabled();
  await expect(score(page, 'x')).toHaveText('1');
  await expect(score(page, 'o')).toHaveText('0');
});

test('the next round keeps the score and lets O open', async ({ page }) => {
  await page.goto('/');
  await playMoves(page, [0, 3, 1, 4, 2]);

  await page.getByRole('button', { name: 'Play again' }).click();

  await expect(status(page)).toHaveText(/Ring’s turn/);
  await expect(cell(page, 0)).toBeEnabled();
  await expect(score(page, 'x')).toHaveText('1');
});

test('a full board with no line is a draw', async ({ page }) => {
  await page.goto('/');
  await playMoves(page, [0, 1, 2, 4, 3, 5, 7, 6, 8]);

  await expect(status(page)).toHaveText(/It’s a draw/);
  await expect(page.locator('.draws strong')).toHaveText('1');
});

test('a taken cell cannot be played again', async ({ page }) => {
  await page.goto('/');
  await cell(page, 4).click();

  await expect(cell(page, 4)).toBeDisabled();
  await expect(status(page)).toHaveText(/Ring’s turn/);
});

test('reset score starts over', async ({ page }) => {
  await page.goto('/');
  await playMoves(page, [0, 3, 1, 4, 2]);

  await page.getByRole('button', { name: 'Reset score' }).click();

  await expect(score(page, 'x')).toHaveText('0');
  await expect(status(page)).toHaveText(/Bolt’s turn/);
});
