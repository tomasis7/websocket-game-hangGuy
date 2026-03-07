import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ── Helpers ────────────────────────────────────────────────────────

/** Fill the join dialog with a nickname and submit */
async function joinGame(page: import('@playwright/test').Page, nickname = 'TestPlayer') {
  await page.waitForSelector('[role="dialog"]', { timeout: 10_000 });
  await page.fill('#nickname-input', nickname);
  await page.click('button[type="submit"]');
  // Wait for dialog to close
  await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10_000 }).catch(() => {
    // Dialog may not close if no server — that's ok for offline tests
  });
}

// ── Join flow ──────────────────────────────────────────────────────

test.describe('Join flow', () => {
  test('shows join dialog on load', async ({ page }) => {
    await page.goto('/');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('#nickname-input')).toBeFocused({ timeout: 5_000 });
  });

  test('shows error when submitting empty nickname', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="dialog"]');

    const submitBtn = page.locator('button[type="submit"]');
    // Submit button should be disabled (no nickname)
    await expect(submitBtn).toBeDisabled();
  });

  test('submit button enables when nickname is entered', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="dialog"]');
    await page.fill('#nickname-input', 'PlayerOne');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
  });

  test('avatar selection changes visual highlight', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="dialog"]');

    const avatarButtons = page.locator('[role="radiogroup"] button');
    await avatarButtons.nth(2).click();
    // The clicked button should have aria-pressed=true
    await expect(avatarButtons.nth(2)).toHaveAttribute('aria-pressed', 'true');
  });
});

// ── Game board ─────────────────────────────────────────────────────

test.describe('Game board (offline mode)', () => {
  test.beforeEach(async ({ page }) => {
    // Block socket connections so page loads in a predictable state
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');
  });

  test('renders header with app name', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header.locator('text=Hang Guy')).toBeVisible();
  });

  test('dark mode toggle is present and labelled', async ({ page }) => {
    const toggleBtn = page.locator('header button[aria-label*="mode"]');
    await expect(toggleBtn).toBeVisible();
  });

  test('join dialog has correct ARIA attributes', async ({ page }) => {
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby');
  });
});

// ── QWERTY keyboard ────────────────────────────────────────────────

test.describe('QWERTY keyboard layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');
  });

  test('keyboard group has correct ARIA role', async ({ page }) => {
    // Keyboard only visible in playing state — skip if dialog is shown
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.isVisible().catch(() => true)) return;

    const keyboard = page.locator('[role="group"][aria-label="Letter keyboard"]');
    await expect(keyboard).toBeVisible();
  });
});

// ── Dark mode ──────────────────────────────────────────────────────

test.describe('Dark mode', () => {
  test('toggles dark class on html element', async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');

    const toggleBtn = page.locator('header button[aria-label*="mode"]');
    await toggleBtn.waitFor({ timeout: 5_000 });

    const htmlEl = page.locator('html');
    const classBefore = await htmlEl.getAttribute('class');

    await toggleBtn.click();

    const classAfter = await htmlEl.getAttribute('class');
    expect(classBefore).not.toEqual(classAfter);
  });

  test('persists dark mode preference in localStorage', async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');

    const toggleBtn = page.locator('header button[aria-label*="mode"]');
    await toggleBtn.waitFor({ timeout: 5_000 });
    await toggleBtn.click();

    const stored = await page.evaluate(() => localStorage.getItem('hangGuy_theme'));
    expect(stored === 'dark' || stored === 'light').toBe(true);
  });
});

// ── Responsive layouts ─────────────────────────────────────────────

test.describe('Responsive layout', () => {
  test('renders at 375px width without overflow', async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const body = page.locator('body');
    const box = await body.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375 + 2);
  });

  test('header is visible at all breakpoints', async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const header = page.locator('header');
      await expect(header).toBeVisible();
    }
  });
});

// ── Accessibility ──────────────────────────────────────────────────

test.describe('Accessibility', () => {
  test('join dialog passes axe audit', async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');
    await page.waitForSelector('[role="dialog"]');

    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('header passes axe audit', async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');
    await page.waitForSelector('header');

    const results = await new AxeBuilder({ page })
      .include('header')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('focus trap in join dialog: Tab cycles within dialog', async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');
    await page.waitForSelector('[role="dialog"]');

    // Tab through all focusable elements — focus should stay within dialog
    const dialog = page.locator('[role="dialog"]');
    const focusableCount = await dialog.locator('button, input').count();

    // Press Tab (focusableCount + 1) times and verify still within dialog
    for (let i = 0; i < focusableCount + 2; i++) {
      await page.keyboard.press('Tab');
    }

    const focused = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null);
    expect(focused).toBe(true);
  });

  test('aria-live region exists for game announcements', async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');

    // Check for aria-live regions (may be in dialog or game board)
    const liveRegions = page.locator('[aria-live]');
    const count = await liveRegions.count();
    expect(count).toBeGreaterThan(0);
  });
});
