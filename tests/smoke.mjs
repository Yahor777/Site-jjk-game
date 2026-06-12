import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
await page.waitForSelector('canvas');
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/curse-breaker-menu.png', fullPage: true });
await page.mouse.click(265, 510);
await page.waitForTimeout(900);
await page.screenshot({ path: '/tmp/curse-breaker-game.png', fullPage: true });
if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
const canvas = await page.locator('canvas').boundingBox();
if (!canvas || canvas.width < 900 || canvas.height < 500) throw new Error('Game canvas did not render at the expected size');
console.log(`Smoke test passed; canvas ${canvas.width}x${canvas.height}`);
await browser.close();
