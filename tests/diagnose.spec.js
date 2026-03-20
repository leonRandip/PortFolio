import { test } from '@playwright/test';

test('diagnose Miss Minutes rendering', async ({ page }) => {
  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
    else consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => consoleErrors.push(`PAGE ERROR: ${err.message}`));

  await page.goto('http://localhost:5174');
  await page.waitForTimeout(6000);

  // Type theme tva using keyboard
  await page.locator('.terminal-container').first().click();
  await page.keyboard.type('theme tva');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);

  // Check DOM
  const mmInfo = await page.evaluate(() => {
    const mm = document.querySelector('.miss-minutes');
    const avatar = document.querySelector('.miss-minutes-avatar');
    const canvas = document.querySelector('.miss-minutes-avatar canvas');
    return {
      mmExists: !!mm,
      mmVisible: mm ? getComputedStyle(mm).display !== 'none' : false,
      avatarExists: !!avatar,
      canvasExists: !!canvas,
      canvasWidth: canvas?.width,
      canvasHeight: canvas?.height,
      avatarHTML: avatar?.innerHTML?.substring(0, 300),
    };
  });

  console.log('DOM info:', JSON.stringify(mmInfo, null, 2));
  console.log('\n--- Console Logs (last 20) ---');
  consoleLogs.slice(-20).forEach(l => console.log(l));
  console.log('\n--- Console Errors ---');
  consoleErrors.forEach(e => console.log(e));

  await page.screenshot({ path: 'artifacts/diagnose.png', fullPage: true });
});
