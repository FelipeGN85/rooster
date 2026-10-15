import { type Page } from '@playwright/test';

import { PHONES, expect, playMoves, test } from './fixtures';

/** Everything you play with: on a phone it must all be on screen without scrolling. */
async function expectWholeGameOnScreen(page: Page): Promise<void> {
  const controls = [
    page.getByRole('button', { name: 'Start a new round' }),
    page.locator('app-vs-strip'),
    page.locator('.status'),
    page.locator('app-board'),
    page.getByRole('button', { name: 'Play online' }),
    page.getByRole('button', { name: 'Reset score' }),
  ];
  for (const control of controls) await expect(control).toBeInViewport({ ratio: 1 });

  const sideScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(sideScroll, 'the page must not scroll sideways').toBe(false);
}

for (const [name, viewport] of Object.entries(PHONES)) {
  test.describe(`${name} (${viewport.width}×${viewport.height})`, () => {
    test.use({ viewport, isMobile: true, hasTouch: true });

    test('the whole game fits on one screen', async ({ page }) => {
      await page.goto('/');
      await playMoves(page, [0, 2, 4]);
      await expectWholeGameOnScreen(page);
    });

    test('the header stays pinned while scrolling to the footer', async ({ page }) => {
      await page.goto('/');
      await page.locator('app-footer').scrollIntoViewIfNeeded();

      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      const header = await page.locator('app-header').boundingBox();
      expect(header?.y).toBe(0);
    });
  });
}

test.describe('a phone on its side', () => {
  test.use({ viewport: { width: 844, height: 340 }, isMobile: true, hasTouch: true });

  test('puts the controls beside a board that is still playable', async ({ page }) => {
    await page.goto('/');
    await expectWholeGameOnScreen(page);

    const board = await page.locator('app-board').boundingBox();
    expect(board?.width).toBeGreaterThanOrEqual(200);
  });
});
