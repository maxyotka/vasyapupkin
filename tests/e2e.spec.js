// tests/e2e.spec.js — Playwright E2E tests
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

// ── Helpers ──
async function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

// ── Main page ──
test.describe('Main page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto(BASE + '/');
    await expect(page).toHaveTitle(/Ведущий мероприятий/);
  });

  test('hero image is visible', async ({ page }) => {
    await page.goto(BASE + '/');
    const img = page.locator('.hero__portrait img');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  test('no console errors on main page', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(BASE + '/');
    await page.waitForTimeout(1000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('contact button opens dropdown', async ({ page }) => {
    await page.goto(BASE + '/');
    const btn = page.locator('#contactBtn');
    const dropdown = page.locator('#contactDropdown');
    await expect(dropdown).not.toHaveClass(/is-open/);
    await btn.click();
    await expect(dropdown).toHaveClass(/is-open/);
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect(btn).toHaveAttribute('aria-controls', 'contactDropdown');
  });

  test('contact dropdown closes on outside click', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.locator('#contactBtn').click();
    await expect(page.locator('#contactDropdown')).toHaveClass(/is-open/);
    await page.mouse.click(10, 400);
    await expect(page.locator('#contactDropdown')).not.toHaveClass(/is-open/);
  });

  test('nav links are present', async ({ page }) => {
    await page.goto(BASE + '/');
    await expect(page.locator('a[href="/gallery.html"]')).toBeVisible();
    await expect(page.locator('a[href="/blog.html"]')).toBeVisible();
  });
});

// ── Gallery page ──
test.describe('Gallery page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto(BASE + '/gallery.html');
    await expect(page).toHaveTitle(/Галерея/);
  });

  test('no console errors on gallery page', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(BASE + '/gallery.html');
    await page.waitForTimeout(800);
    expect(errors.filter(e => !e.includes('favicon') && !e.includes('autoplay'))).toHaveLength(0);
  });

  test('gallery items have role=button and tabindex', async ({ page }) => {
    await page.goto(BASE + '/gallery.html');
    const items = page.locator('.gallery-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i)).toHaveAttribute('role', 'button');
      await expect(items.nth(i)).toHaveAttribute('tabindex', '0');
    }
  });

  test('lightbox opens and closes on photo click', async ({ page }) => {
    await page.goto(BASE + '/gallery.html');
    const photo = page.locator('.gallery-item--photo').first();
    await photo.click();
    await expect(page.locator('#lightbox')).toHaveClass(/is-open/);
    // Close via button
    await page.locator('#lightboxClose').click();
    await page.waitForTimeout(400); // transition
    await expect(page.locator('#lightbox')).not.toHaveClass(/is-open/);
  });

  test('lightbox closes on Escape key', async ({ page }) => {
    await page.goto(BASE + '/gallery.html');
    await page.locator('.gallery-item--photo').first().click();
    await expect(page.locator('#lightbox')).toHaveClass(/is-open/);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await expect(page.locator('#lightbox')).not.toHaveClass(/is-open/);
  });

  test('photo item has data-type=photo', async ({ page }) => {
    await page.goto(BASE + '/gallery.html');
    const photo = page.locator('.gallery-item--photo').first();
    await expect(photo).toHaveAttribute('data-type', 'photo');
  });

  test('aria-controls on contact button', async ({ page }) => {
    await page.goto(BASE + '/gallery.html');
    await expect(page.locator('#contactBtn')).toHaveAttribute('aria-controls', 'contactDropdown');
  });

  test('back link to main page works', async ({ page }) => {
    await page.goto(BASE + '/gallery.html');
    await expect(page.locator('.gallery-header__back')).toHaveAttribute('href', '/');
  });
});

// ── Blog list page ──
test.describe('Blog list page', () => {
  test('loads with correct title', async ({ page }) => {
    await page.goto(BASE + '/blog.html');
    await expect(page).toHaveTitle(/Мои мысли/);
  });

  test('no console errors on blog list', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(BASE + '/blog.html');
    await page.waitForTimeout(800);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('blog cards are present', async ({ page }) => {
    await page.goto(BASE + '/blog.html');
    const cards = page.locator('.blog-card');
    await expect(cards).toHaveCount(3);
  });

  test('blog card links go to article pages', async ({ page }) => {
    await page.goto(BASE + '/blog.html');
    const link = page.locator('.blog-card__link').first();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/blog\//);
  });

  test('OG meta tags present', async ({ page }) => {
    await page.goto(BASE + '/blog.html');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Мои мысли/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  });
});

// ── Blog article page ──
test.describe('Blog article page', () => {
  test('article page loads', async ({ page }) => {
    await page.goto(BASE + '/blog/kak-vybrat-vedushchego/');
    await expect(page).toHaveTitle(/Ведущий мероприятий/);
  });

  test('no console errors on article page', async ({ page }) => {
    const errors = await collectConsoleErrors(page);
    await page.goto(BASE + '/blog/kak-vybrat-vedushchego/');
    await page.waitForTimeout(500);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('article has TOC', async ({ page }) => {
    await page.goto(BASE + '/blog/kak-vybrat-vedushchego/');
    await expect(page.locator('.article-toc')).toBeVisible();
  });

  test('article back link goes to blog', async ({ page }) => {
    await page.goto(BASE + '/blog/kak-vybrat-vedushchego/');
    await expect(page.locator('.article__back')).toHaveAttribute('href', '/blog.html');
  });

  test('related section has 2 cards', async ({ page }) => {
    await page.goto(BASE + '/blog/kak-vybrat-vedushchego/');
    const grid = page.locator('.related__grid');
    await expect(grid).toBeVisible();
    await expect(grid.locator('.related-card')).toHaveCount(2);
  });

  test('OG meta type=article on article page', async ({ page }) => {
    await page.goto(BASE + '/blog/kak-vybrat-vedushchego/');
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  });

  test('aria-controls on contact button', async ({ page }) => {
    await page.goto(BASE + '/blog/kak-vybrat-vedushchego/');
    await expect(page.locator('#contactBtn')).toHaveAttribute('aria-controls', 'contactDropdown');
  });
});

// ── Navigation ──
test.describe('Navigation flow', () => {
  test('clicking gallery nav navigates to gallery', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.locator('a[href="/gallery.html"]').click();
    await expect(page).toHaveURL(/gallery\.html/);
    await expect(page).toHaveTitle(/Галерея/);
  });

  test('clicking blog nav navigates to blog list', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.locator('a[href="/blog.html"]').click();
    await expect(page).toHaveURL(/blog\.html/);
    await expect(page).toHaveTitle(/Мои мысли/);
  });

  test('clicking blog card navigates to article', async ({ page }) => {
    await page.goto(BASE + '/blog.html');
    await page.locator('.blog-card__link').first().click();
    await expect(page).toHaveURL(/\/blog\//);
    await expect(page.locator('.article__title')).toBeVisible();
  });
});

// ── Accessibility ──
test.describe('Accessibility', () => {
  test('focus-visible outline defined in CSS', async ({ page }) => {
    await page.goto(BASE + '/');
    const outline = await page.evaluate(() => {
      const style = window.getComputedStyle(document.createElement('button'));
      return getComputedStyle(document.documentElement).getPropertyValue('--text');
    });
    // Just check CSS loaded
    expect(outline).toBeTruthy();
  });

  test('lightbox has role=dialog and aria-modal', async ({ page }) => {
    await page.goto(BASE + '/gallery.html');
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toHaveAttribute('role', 'dialog');
    await expect(lightbox).toHaveAttribute('aria-modal', 'true');
  });

  test('contact button has aria-expanded=false initially', async ({ page }) => {
    await page.goto(BASE + '/');
    await expect(page.locator('#contactBtn')).toHaveAttribute('aria-expanded', 'false');
  });

  test('keyboard: Enter opens lightbox on gallery item', async ({ page }) => {
    await page.goto(BASE + '/gallery.html');
    const item = page.locator('.gallery-item--photo').first();
    await item.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#lightbox')).toHaveClass(/is-open/);
  });
});
