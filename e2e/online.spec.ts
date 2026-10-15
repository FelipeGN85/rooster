import { PHONES, cell, expect, openFriend, status, test } from './fixtures';

/*
 * Two separate browsers really play each other over WebRTC. They find each
 * other through the public PeerJS broker, so these are the only tests that need
 * the internet; CI retries them in case the broker is slow.
 */
test.describe('online game @online', () => {
  // WebRTC set-up can take a few seconds on a cold start.
  test.setTimeout(60_000);
  test.use({ viewport: PHONES.iPhone13, isMobile: true, hasTouch: true });

  test('a phone invites a friend, they play to a win, and both see the result', async ({
    page,
    browser,
    baseURL,
  }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Play online' }).click();

    // The invite opens as a sheet over the bottom of the phone screen.
    const link = page.getByLabel('Invite link');
    await expect(link).toHaveValue(/\?join=rooster-[a-z0-9]{10}$/, { timeout: 20_000 });
    const inviteUrl = await link.inputValue();

    // The friend is on a laptop. Spelled out: a new context would otherwise copy this test's phone settings.
    const friend = await openFriend(browser, baseURL, {
      viewport: { width: 1280, height: 800 },
      isMobile: false,
      hasTouch: false,
    });
    await friend.goto(inviteUrl);

    await expect(page.getByRole('button', { name: 'Leave game' })).toBeVisible({
      timeout: 30_000,
    });
    await expect(friend.getByText('Connected')).toBeVisible();
    await expect(status(page)).toHaveText(/Your turn/);
    await expect(status(friend)).toHaveText(/Friend’s turn/);

    // The friend may not move out of turn.
    await expect(cell(friend, 0)).toBeDisabled();

    // Host (X) takes the top row; the friend (O) plays the middle row.
    const moves: [typeof page, number][] = [
      [page, 0],
      [friend, 3],
      [page, 1],
      [friend, 4],
      [page, 2],
    ];
    for (const [player, index] of moves) {
      await cell(player, index).click();
      const other = player === page ? friend : page;
      await expect(cell(other, index).locator('svg')).toBeVisible();
    }

    await expect(status(page)).toHaveText(/You win!/);
    await expect(status(friend)).toHaveText(/Friend wins!/);

    await friend.context().close();
  });

  test('a link to a game that does not exist says so', async ({ page }) => {
    await page.goto('/?join=rooster-zzzzzzzzzz');

    // The broker may say "no such game", or stay silent until the app's own
    // 20-second timeout gives up: two different messages, one outcome.
    const failed = page.getByRole('heading', { name: 'Couldn’t start the online game' });
    await expect(failed).toBeVisible({ timeout: 30_000 });
    await expect(status(page)).toHaveText('Not connected');
    await expect(page.getByRole('button', { name: 'Play on this screen' })).toBeVisible();
  });
});
