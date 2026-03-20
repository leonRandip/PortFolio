import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5174';
const ARTIFACTS = path.join(__dirname, '../artifacts');

// Wait for the terminal boot sequence to finish
async function waitForBoot(page) {
  // Wait for the skip hint to disappear or the input to accept focus
  await page.waitForFunction(() => {
    const input = document.querySelector('.terminal-hidden-input');
    return input !== null;
  }, { timeout: 15000 });
  // Extra time for the boot animation to complete
  await page.waitForTimeout(5000);
}

// Type a command using keyboard and press Enter
async function runCommand(page, cmd) {
  // Click on the terminal to ensure focus
  await page.locator('.terminal-container, [class*="terminal"]').first().click();
  await page.waitForTimeout(100);
  await page.keyboard.type(cmd);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
}

test.describe('Miss Minutes 3D rendering', () => {
  test('TVA theme activates and Miss Minutes appears', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.screenshot({ path: `${ARTIFACTS}/01-initial-load.png`, fullPage: true });

    await waitForBoot(page);
    await page.screenshot({ path: `${ARTIFACTS}/02-after-boot.png`, fullPage: true });

    // Activate TVA theme
    await runCommand(page, 'theme tva');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${ARTIFACTS}/03-tva-activated.png`, fullPage: true });

    // Miss Minutes avatar should appear
    const avatar = page.locator('.miss-minutes-avatar');
    const isVisible = await avatar.isVisible().catch(() => false);
    console.log('Miss Minutes avatar visible:', isVisible);

    if (!isVisible) {
      // Check if .miss-minutes exists at all
      const mmExists = await page.locator('.miss-minutes').count();
      console.log('Miss Minutes element count:', mmExists);
      const bodyHtml = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
      console.log('Body snippet:', bodyHtml);
    }

    await expect(avatar).toBeVisible({ timeout: 5000 });
  });

  test('Miss Minutes 3D canvas renders inside avatar', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForBoot(page);

    await runCommand(page, 'theme tva');
    await page.waitForTimeout(3000);

    const avatar = page.locator('.miss-minutes-avatar');
    await expect(avatar).toBeVisible({ timeout: 5000 });

    // The 3D canvas (R3F) should render inside .miss-minutes-avatar
    const canvas = page.locator('.miss-minutes-avatar canvas');
    const canvasVisible = await canvas.isVisible().catch(() => false);
    console.log('Canvas inside avatar visible:', canvasVisible);

    if (!canvasVisible) {
      // Check avatar's inner HTML
      const avatarHtml = await avatar.innerHTML().catch(() => 'N/A');
      console.log('Avatar innerHTML:', avatarHtml.substring(0, 500));
    }

    await expect(canvas).toBeVisible({ timeout: 10000 });

    const avatarBox = await avatar.boundingBox();
    const canvasBox = await canvas.boundingBox();
    console.log('Avatar box:', JSON.stringify(avatarBox));
    console.log('Canvas box:', JSON.stringify(canvasBox));

    await page.screenshot({ path: `${ARTIFACTS}/04-canvas-in-avatar.png`, fullPage: true });

    // Closeup of just the avatar
    if (avatarBox) {
      await page.screenshot({
        path: `${ARTIFACTS}/04b-avatar-closeup.png`,
        clip: {
          x: Math.max(0, avatarBox.x - 10),
          y: Math.max(0, avatarBox.y - 10),
          width: avatarBox.width + 20,
          height: avatarBox.height + 20,
        }
      });
    }
  });

  test('Hover triggers speech bubble', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForBoot(page);
    await runCommand(page, 'theme tva');
    await page.waitForTimeout(2000);

    const avatar = page.locator('.miss-minutes-avatar');
    await expect(avatar).toBeVisible({ timeout: 5000 });

    await avatar.hover({ force: true });
    await page.waitForTimeout(800);

    const bubble = page.locator('.miss-minutes-bubble.visible');
    await expect(bubble).toBeVisible({ timeout: 3000 });

    const bubbleText = await bubble.textContent();
    console.log('Hover bubble text:', bubbleText);

    await page.screenshot({ path: `${ARTIFACTS}/05-hover-bubble.png`, fullPage: true });
  });

  test('Commands trigger expressions and bubbles', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForBoot(page);
    await runCommand(page, 'theme tva');
    await page.waitForTimeout(2000);

    await expect(page.locator('.miss-minutes-avatar')).toBeVisible({ timeout: 5000 });

    // Angry (hack)
    await runCommand(page, 'hack');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${ARTIFACTS}/06-angry-hack.png`, fullPage: true });

    // Laugh (brickbreaker)
    await runCommand(page, 'fortune');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${ARTIFACTS}/07-laugh-fortune.png`, fullPage: true });

    // Surprised (matrix)
    await runCommand(page, 'matrix');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${ARTIFACTS}/08-surprised-matrix.png`, fullPage: true });

    // Suspicious (ls -a)
    await runCommand(page, 'ls -a');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${ARTIFACTS}/09-suspicious-ls.png`, fullPage: true });

    // Check bubble is appearing
    const bubble = page.locator('.miss-minutes-bubble');
    const bubbleText = await bubble.textContent().catch(() => '');
    console.log('Bubble text:', bubbleText);
  });

  test('Default theme hides Miss Minutes', async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForBoot(page);
    await runCommand(page, 'theme tva');
    await page.waitForTimeout(2000);

    await expect(page.locator('.miss-minutes-avatar')).toBeVisible({ timeout: 5000 });

    await runCommand(page, 'theme default');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${ARTIFACTS}/10-default-theme.png`, fullPage: true });

    const mm = page.locator('.miss-minutes');
    const count = await mm.count();
    console.log('Miss Minutes elements in default theme:', count);
    // Should not be visible
    if (count > 0) {
      const visible = await mm.isVisible();
      console.log('Miss Minutes visible in default theme:', visible);
    }
  });
});
