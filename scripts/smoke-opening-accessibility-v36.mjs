import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

// Deterministic isolated-preview regression only. No manual gameplay.
const base = process.env.PINEWOOD_BASE_URL || 'http://127.0.0.1:4173/';
const preview = new URL('review/the-call-v34/', base).href;
const origin = new URL(base).origin;
const report = { preview, cases: {}, passed: false };
const layouts = [
  { name: 'desktop', width: 1280, height: 720, motion: 'no-preference' },
  { name: 'mobile-reduced-motion', width: 390, height: 844, motion: 'reduce' }
];
const assert = (value, detail) => { if (!value) throw new Error(detail); };
await mkdir('production-smoke-artifacts', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=swiftshader',
    '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
});
try {
  for (const layout of layouts) {
    const context = await browser.newContext({
      viewport: { width: layout.width, height: layout.height },
      reducedMotion: layout.motion, deviceScaleFactor: 1
    });
    const page = await context.newPage();
    const pageErrors = [], remoteRequests = [];
    page.on('pageerror', error => pageErrors.push(error.stack || error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      if (['http:', 'https:'].includes(url.protocol) && url.origin !== origin)
        remoteRequests.push(request.url());
    });
    try {
      await page.goto(preview, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForFunction(() => window.__PINEWOOD_OPENING_V34__ &&
        document.querySelector('#titleScreen.show #newBtn'), null, { timeout: 90000 });
      await page.locator('#newBtn').click();
      await page.waitForFunction(() => window.__PINEWOOD_OPENING_V34__?.active &&
        !document.querySelector('#pwm-opening').hidden, null, { timeout: 90000 });
      // v61 keeps an opaque, keyboard-skippable loading screen in front until
      // all scene assets and the FIRST real rendered frame are complete.
      await page.waitForFunction(() =>
        document.querySelector('#pwm-opening')?.dataset.preloadState === 'ready',
        null, { timeout: 90000 });

      const opened = await page.evaluate(() => ({
        titleInert: document.getElementById('titleScreen').inert,
        role: document.getElementById('pwm-opening').getAttribute('role'),
        modal: document.getElementById('pwm-opening').getAttribute('aria-modal'),
        focus: document.activeElement?.getAttribute('data-intro-pause') !== null,
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches
      }));
      assert(opened.titleInert && opened.role === 'dialog' && opened.modal === 'true' && opened.focus,
        layout.name + ': opening lacks isolated dialog or initial focus: ' + JSON.stringify(opened));
      assert(opened.reduced === (layout.motion === 'reduce'),
        layout.name + ': browser motion setting mismatch');

      await page.keyboard.press('Shift+Tab');
      assert(await page.evaluate(() => document.activeElement?.hasAttribute('data-intro-skip')),
        layout.name + ': reverse Tab did not wrap to Skip');
      await page.keyboard.press('Tab');
      assert(await page.evaluate(() => document.activeElement?.hasAttribute('data-intro-pause')),
        layout.name + ': forward Tab did not wrap to Pause');

      // The caption node must not be changed 60 times per second for identical words.
      await page.evaluate(() => {
        window.__captionUpdates = 0;
        window.__captionObserver = new MutationObserver(() => window.__captionUpdates++);
        window.__captionObserver.observe(document.getElementById('pwm-caption'), {
          childList: true, characterData: true, subtree: true
        });
      });
      await page.waitForTimeout(400);
      const captionUpdates = await page.evaluate(() => {
        window.__captionObserver.disconnect();
        return window.__captionUpdates;
      });
      assert(captionUpdates <= 1,
        layout.name + ': repeated identical live-caption mutations: ' + captionUpdates);

      await page.keyboard.press('Escape');
      assert(await page.locator('#pwm-opening').getAttribute('data-paused') === 'true' &&
        await page.locator('[data-intro-pause]').getAttribute('aria-pressed') === 'true',
        layout.name + ': Escape did not pause accessibly');
      await page.keyboard.press('Escape');
      assert(await page.locator('#pwm-opening').getAttribute('data-paused') === 'false',
        layout.name + ': Escape did not resume');

      await page.locator('[data-intro-voice]').click();
      assert(await page.locator('[data-intro-voice]').getAttribute('aria-pressed') === 'false',
        layout.name + ': voice toggle does not expose off state');
      await page.locator('[data-intro-captions]').click();
      assert(await page.locator('[data-intro-captions]').getAttribute('aria-pressed') === 'false' &&
        await page.locator('#pwm-opening').evaluate(el => el.classList.contains('pwm-hide-captions')),
        layout.name + ': caption toggle does not expose off state');
      await page.locator('[data-intro-captions]').click();
      assert(await page.locator('[data-intro-captions]').getAttribute('aria-pressed') === 'true',
        layout.name + ': captions did not reactivate');

      const targets = await page.locator('.pwm-transport button').evaluateAll(elements =>
        elements.map(el => { const r = el.getBoundingClientRect(); return {
          label: el.textContent.trim(), height: r.height, left: r.left, right: r.right
        }; })
      );
      assert(targets.every(t => t.height >= 43.5 && t.left >= -1 && t.right <= layout.width + 1),
        layout.name + ': small or horizontally overflowing preview controls: ' + JSON.stringify(targets));

      await page.keyboard.press('Alt+s');
      // Skip must actually release the dialog, not merely change button text.
      // Allow the browser one focus/paint turn before checking after WebGL.
      await page.waitForFunction(() => {
        const modal = document.getElementById('pwm-opening');
        return modal?.hidden && !document.getElementById('titleScreen').inert &&
          document.activeElement?.id === 'newBtn' && !window.__PINEWOOD_OPENING_V34__.active;
      }, null, { timeout: 7000 }).catch(() => {});
      const release = await page.evaluate(() => ({
        overlayHidden:document.getElementById('pwm-opening').hidden,
        titleInert:document.getElementById('titleScreen').inert,
        focus:document.activeElement?.id,
        active:window.__PINEWOOD_OPENING_V34__.active
      }));
      assert(release.overlayHidden && !release.titleInert && release.focus === 'newBtn' && !release.active,
        layout.name + ': skip did not restore title and keyboard focus: ' + JSON.stringify(release));
      assert(remoteRequests.length === 0, layout.name + ': remote runtime assets: ' + remoteRequests.join(','));
      assert(pageErrors.length === 0, layout.name + ': browser errors: ' + pageErrors.join(' | '));
      report.cases[layout.name] = { passed: true, captionUpdates, controls: targets,
        browserErrors: 0, remoteRequests: 0 };
      console.log('PASS ' + layout.name + ' opening preview keyboard, captions, skip and local assets');
    } catch (error) {
      report.cases[layout.name] = { passed: false, error: error.stack || String(error),
        pageErrors, remoteRequests };
      throw error;
    } finally {
      await context.close();
    }
  }
  report.passed = true;
} finally {
  await browser.close();
  await writeFile('production-smoke-artifacts/opening-accessibility-v36.json',
    JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
