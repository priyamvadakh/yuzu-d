import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:50467';
const OUT = path.join(__dirname, 'onboarding-exports');

import fs from 'fs';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
// 390×844 @3x = 1170×2532 (iPhone 14 Pro resolution)
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 15000 });

// Wait for fonts/images
await new Promise(r => setTimeout(r, 2000));

// The onboarding is active on load — capture slide by slide
for (let i = 0; i < 4; i++) {
  // Make sure we're on the onboarding screen
  await page.evaluate((idx) => {
    // Ensure onboarding screen is visible
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-onboarding').classList.add('active');
    // Navigate to slide
    if (typeof obGoTo === 'function') obGoTo(idx);
  }, i);

  await new Promise(r => setTimeout(r, 600));

  const file = path.join(OUT, `slide-${i + 1}.png`);
  await page.screenshot({ path: file, type: 'png' });
  console.log(`✓ slide-${i + 1}.png`);
}

// Also capture desktop view at 1440 wide
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.reload({ waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 2000));

for (let i = 0; i < 4; i++) {
  await page.evaluate((idx) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-onboarding').classList.add('active');
    if (typeof obGoTo === 'function') obGoTo(idx);
  }, i);
  await new Promise(r => setTimeout(r, 600));
  const file = path.join(OUT, `slide-${i + 1}-desktop.png`);
  await page.screenshot({ path: file, type: 'png' });
  console.log(`✓ slide-${i + 1}-desktop.png`);
}

await browser.close();
console.log('\nAll done → onboarding-exports/');
