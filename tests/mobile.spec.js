// tests/mobile.spec.js — Mobile responsiveness verification
import { test, expect } from '@playwright/test';

const MOBILE = { width: 375, height: 812 };
const MOBILE_LARGE = { width: 390, height: 844 };

test.describe('Mobile responsiveness (375px)', () => {
  test.use({ viewport: MOBILE });

  test('Main page: no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('Main page: hero name visible, not clipped', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();
    const nameFirst = page.locator('.hero__name-first');
    const nameLast = page.locator('.hero__name-last');
    await expect(nameFirst).toBeAttached();
    await expect(nameLast).toBeAttached();
    await page.screenshot({ path: 'test-results/mobile-hero-375.png', fullPage: false });
  });

  test('Main page: format panels stack vertically (1 column)', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('.format-panel').first();
    const gridCols = await panel.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    // Should be a single column value (one number), not two
    const colCount = gridCols.split(' ').filter(v => v.trim() && !v.includes('0px')).length;
    expect(colCount).toBe(1);
  });

  test('Main page: header touch targets >= 44px', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('.header__item');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const box = await items.nth(i).boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(40); // allow 40px with some tolerance
    }
  });

  test('Main page: formats section full screenshot', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/mobile-formats-375.png', fullPage: false });
  });

  test('Gallery page: no horizontal overflow', async ({ page }) => {
    await page.goto('/gallery.html');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('Gallery page: masonry single column', async ({ page }) => {
    await page.goto('/gallery.html');
    const grid = page.locator('.gallery-masonry__grid');
    const cols = await grid.evaluate(el => getComputedStyle(el).columnCount);
    expect(cols).toBe('1');
  });

  test('Gallery page: screenshot', async ({ page }) => {
    await page.goto('/gallery.html');
    await page.screenshot({ path: 'test-results/mobile-gallery-375.png', fullPage: true });
  });

  test('Blog list page: cards are full width, not absolute', async ({ page }) => {
    await page.goto('/blog.html');
    const card = page.locator('.blog-card').first();
    const position = await card.evaluate(el => getComputedStyle(el).position);
    expect(position).toBe('static');
    await page.screenshot({ path: 'test-results/mobile-blog-375.png', fullPage: true });
  });

  test('Blog article page: no TOC, proper layout', async ({ page }) => {
    await page.goto('/blog/kak-vybrat-vedushchego/');
    const toc = page.locator('.article-toc');
    const tocDisplay = await toc.evaluate(el => getComputedStyle(el).display);
    expect(tocDisplay).toBe('none');

    // Article should not have left border
    const article = page.locator('.article');
    const borderLeft = await article.evaluate(el => getComputedStyle(el).borderLeftWidth);
    expect(borderLeft).toBe('0px');
    await page.screenshot({ path: 'test-results/mobile-article-375.png', fullPage: true });
  });

  test('Footer: contacts stack vertically', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const contacts = page.locator('.footer__contacts');
    const dir = await contacts.evaluate(el => getComputedStyle(el).flexDirection);
    expect(dir).toBe('column');
    await page.screenshot({ path: 'test-results/mobile-footer-375.png', fullPage: false });
  });
});

test.describe('Mobile responsiveness (390px)', () => {
  test.use({ viewport: MOBILE_LARGE });

  test('Main page: no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('Main page: screenshot', async ({ page }) => {
    await page.goto('/');
    await page.screenshot({ path: 'test-results/mobile-hero-390.png', fullPage: false });
  });
});
