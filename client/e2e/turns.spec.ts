import { test, expect, type Page } from '@playwright/test';

// The server holds ONE global game room. This must stay the only spec that really connects; other specs block the socket (see game-ui.spec.ts blockSocket).

// Both tests share the server's single game room — never run them in parallel.
test.describe.configure({ mode: 'serial' });

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

  const aliceBanner = alice.locator('[data-testid="turn-banner"]');
  const bobBanner = bob.locator('[data-testid="turn-banner"]');

  // Banner must appear the moment the game becomes multiplayer (fresh join state)
  await expect(alice.locator('[data-testid="turn-banner"]')).toBeVisible({ timeout: T });
  await expect(bob.locator('[data-testid="turn-banner"]')).toBeVisible({ timeout: T });

  // Reset to a known state: fresh word, no guessed letters, turn -> Alice
  await bob.getByRole('button', { name: /^(new game|play again|try again)$/i }).click();

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

test('custom word round: setter spectates while the other player guesses', async ({ browser }) => {
  const ctx1 = await browser.newContext();
  const ctx2 = await browser.newContext();
  const alice = await ctx1.newPage();
  const bob = await ctx2.newPage();

  await joinAs(alice, 'Alice');
  await joinAs(bob, 'Bob');

  // Alice sets a secret word from the Customize panel
  await alice.getByRole('button', { name: /customize game/i }).click();
  await alice.getByLabel('Set your own word').fill('BANANA');
  await alice.getByRole('button', { name: /start with my word/i }).click();

  // Alice spectates: spectator banner, no keyboard
  await expect(alice.locator('[data-testid="turn-banner"]')).toContainText(
    /you set the word/i,
    { timeout: T }
  );
  await expect(alice.getByRole('group', { name: 'Letter keyboard' })).toHaveCount(0);

  // Bob is the only guesser, so it is always his turn
  await expect(bob.locator('[data-testid="turn-banner"]')).toContainText(/your turn/i, {
    timeout: T,
  });

  // Bob solves BANANA letter by letter (spaced to stay under the 2-guesses/sec rate limit).
  // BANANA's unique letters are exactly B, A, N, so the final guess (N) also wins the game;
  // the keyboard unmounts immediately on win (long-standing behavior, see MultiplayerHangGuy.tsx),
  // so we only assert "disabled" (guess acknowledged, keyboard still mounted) for the
  // non-winning guesses and rely on the win banner assertion below for the last one.
  for (const letter of ['B', 'A']) {
    const key = bob.getByRole('button', { name: new RegExp(`^Guess letter ${letter}`) });
    await key.click();
    await expect(key).toBeDisabled({ timeout: T }); // guess acknowledged
    await bob.waitForTimeout(600);
  }
  await bob.getByRole('button', { name: /^Guess letter N/ }).click();

  // Both players see the win
  await expect(bob.getByText('You Won!').first()).toBeVisible({ timeout: T });
  await expect(alice.getByText('You Won!').first()).toBeVisible({ timeout: T });

  await ctx1.close();
  await ctx2.close();
});
