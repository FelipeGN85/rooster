import { expect, test as base, type Browser, type Page } from '@playwright/test';

/** Hosts the online game needs: the PeerJS broker that introduces two browsers. */
const PEERJS = /(^|\.)peerjs\.com$/;

/**
 * Nothing leaves the local server except calls to the PeerJS broker. Fonts and
 * other third parties are blocked: they are not needed to test behaviour, and
 * blocking them keeps runs fast and repeatable.
 */
async function localOnly(page: Page, baseURL: string | undefined): Promise<void> {
  const local = new URL(baseURL ?? 'http://localhost').origin;
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin === local || PEERJS.test(url.hostname)) return route.continue();
    return route.abort('blockedbyclient');
  });
}

export const test = base.extend<{ localOnly: void }>({
  localOnly: [
    async ({ page, baseURL }, use) => {
      await localOnly(page, baseURL);
      await use();
    },
    { auto: true },
  ],
});

/** A second, separate browser profile (its own storage), for the friend in an online game. */
export async function openFriend(
  browser: Browser,
  baseURL: string | undefined,
  options: Parameters<Browser['newContext']>[0] = {},
): Promise<Page> {
  const context = await browser.newContext({ ...options, baseURL });
  const page = await context.newPage();
  await localOnly(page, baseURL);
  return page;
}

/** A phone's visible area in Safari, with the address bar and toolbar taken off. */
export const PHONES = {
  iPhoneSE: { width: 375, height: 553 },
  iPhone13: { width: 390, height: 664 },
} as const;

export const cell = (page: Page, index: number) => page.locator('app-board .cell').nth(index);
export const status = (page: Page) => page.locator('.status');

/** Plays the moves in order, alternating X and O, on one screen. */
export async function playMoves(page: Page, moves: number[]): Promise<void> {
  for (const index of moves) await cell(page, index).click();
}

export { expect };
