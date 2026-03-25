// tests/debug.spec.js — diagnose console errors
import { test, expect } from '@playwright/test';

test('capture full console errors on main page', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      errors.push({ type: msg.type(), text: msg.text(), location: msg.location() });
    }
  });
  page.on('pageerror', err => {
    errors.push({ type: 'pageerror', text: err.message, stack: err.stack });
  });

  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);

  console.log('=== ALL ERRORS ===');
  errors.forEach(e => console.log(JSON.stringify(e, null, 2)));
  console.log(`Total: ${errors.length}`);
});
