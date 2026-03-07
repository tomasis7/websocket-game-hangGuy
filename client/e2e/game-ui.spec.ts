import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ── Helpers ────────────────────────────────────────────────────────

const DIALOG_TIMEOUT = 8_000;

// ── Join flow ──────────────────────────────────────────────────────

test.describe('Join flow', () => {
  test.beforeEach(async ({ page }) => {
    // Block socket so app stays in dialog state throughout tests
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');
  });

  test('shows join dialog immediately on load', async ({ page }) => {
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: DIALOG_TIMEOUT });
    await expect(page.locator('#nickname-input')).toBeFocused({ timeout: 5_000 });
  });

  test('submit button is disabled when nickname is empty', async ({ page }) => {
    await page.locator('[role="dialog"]').waitFor({ timeout: DIALOG_TIMEOUT });
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();
  });

  test('submit button enables when nickname is entered', async ({ page }) => {
    await page.locator('[role="dialog"]').waitFor({ timeout: DIALOG_TIMEOUT });
    await page.fill('#nickname-input', 'PlayerOne');
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
  });

  test('avatar selection changes aria-pressed state', async ({ page }) => {
    await page.locator('[role="dialog"]').waitFor({ timeout: DIALOG_TIMEOUT });
    const avatarButtons = page.locator('[role="radiogroup"] button');
    await avatarButtons.nth(2).click();
    await expect(avatarButtons.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(avatarButtons.nth(0)).toHaveAttribute('aria-pressed', 'false');
  });
});

// ── App chrome ─────────────────────────────────────────────────────

test.describe('App chrome (offline mode)', () => {
  test.beforeEach(async ({ page }) => {
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
    await expect(dialog).toBeVisible({ timeout: DIALOG_TIMEOUT });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby');
  });
});

// ── Dark mode ──────────────────────────────────────────────────────

test.describe('Dark mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');
  });

  test('toggles dark class on html element', async ({ page }) => {
    const toggleBtn = page.locator('header button[aria-label*="mode"]');
    await toggleBtn.waitFor({ timeout: 5_000 });

    // Capture initial state
    const hasDarkBefore = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    // The join dialog overlay (fixed inset-0) blocks pointer events on the header.
    // Click via JS to bypass the overlay and trigger React's onClick handler.
    await page.evaluate(() => {
      const btn = document.querySelector<HTMLElement>('header button[aria-label*="mode"]');
      btn?.click();
    });

    // Wait for React to flip the dark class
    await page.waitForFunction(
      (before: boolean) => document.documentElement.classList.contains('dark') !== before,
      hasDarkBefore,
      { timeout: 3_000 }
    );
  });

  test('persists theme preference in localStorage', async ({ page }) => {
    const toggleBtn = page.locator('header button[aria-label*="mode"]');
    await toggleBtn.waitFor({ timeout: 5_000 });
    await toggleBtn.click({ force: true });

    const stored = await page.evaluate(() => localStorage.getItem('hangGuy_theme'));
    expect(stored === 'dark' || stored === 'light').toBe(true);
  });
});

// ── Responsive layouts ─────────────────────────────────────────────

test.describe('Responsive layout', () => {
  test('renders at 375px width without horizontal overflow', async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(overflow).toBe(false);
  });

  test('header is visible at 375px, 768px, and 1280px', async ({ page }) => {
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
  test.beforeEach(async ({ page }) => {
    await page.route('**/socket.io/**', route => route.abort());
    await page.goto('/');
    await page.locator('[role="dialog"]').waitFor({ timeout: DIALOG_TIMEOUT });
  });

  test('join dialog passes axe accessibility audit', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('header passes axe accessibility audit', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('header')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('focus trap: Tab key cycles within dialog', async ({ page }) => {
    const dialog = page.locator('[role="dialog"]');
    const focusableCount = await dialog.locator('button, input').count();

    for (let i = 0; i < focusableCount + 2; i++) {
      await page.keyboard.press('Tab');
    }

    const isInsideDialog = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.closest('[role="dialog"]') !== null;
    });
    expect(isInsideDialog).toBe(true);
  });

  test('page has at least one accessible live or status region', async ({ page }) => {
    const liveOrStatus = page.locator('[aria-live], [role="status"], [role="alert"]');
    const count = await liveOrStatus.count();
    expect(count).toBeGreaterThan(0);
  });
});
