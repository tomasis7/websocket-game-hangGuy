import { test, expect, type Page } from '@playwright/test';

const T = 10_000;

async function joinAs(page: Page, name: string) {
  await page.goto('/');
  await page.locator('[role="dialog"]').waitFor({ timeout: T });
  await page.fill('#nickname-input', name);
  await page.locator('button[type="submit"]').click();
  // Joined once the game panel (players sidebar) renders
  await expect(page.getByRole('button', { name: /players/i })).toBeVisible({ timeout: T });
}

test('turn banner rotates between two players', async ({ browser }) => {
  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const alice = await ctx1.newPage();
  const bob = await ctx2.newPage();

  await joinAs(alice, 'Alice');

  // Solo: no turn banner
  await expect(alice.locator('[data-testid="turn-banner"]')).toHaveCount(0);

  await joinAs(bob, 'Bob');

  // Reset to a known state: fresh word, no guessed letters, turn -> Alice
  await bob.getByRole('button', { name: /^(new game|play again|try again)$/i }).click();

  const aliceBanner = alice.locator('[data-testid="turn-banner"]');
  const bobBanner = bob.locator('[data-testid="turn-banner"]');

  await expect(aliceBanner).toContainText(/your turn/i, { timeout: T });
  await expect(bobBanner).toContainText(/waiting for alice/i, { timeout: T });

  // Bob's keyboard is disabled while waiting
  await expect(
    bob.getByRole('button', { name: 'Guess letter Q' })
  ).toBeDisabled();

  // Alice guesses; the turn swaps
  await alice.getByRole('button', { name: 'Guess letter Q' }).click();

  await expect(bobBanner).toContainText(/your turn/i, { timeout: T });
  await expect(aliceBanner).toContainText(/waiting for bob/i, { timeout: T });

  await ctx1.close();
  await ctx2.close();
});
