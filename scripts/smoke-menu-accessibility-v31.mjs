import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

// Automated menu accessibility and responsive regression. Never performs manual gameplay.
const base = process.env.PINEWOOD_BASE_URL || 'http://127.0.0.1:4173/';
const origin = new URL(base).origin;
const output = 'production-smoke-artifacts';
await mkdir(output, { recursive: true });
const report = { base, cases: {}, passed: false };
const expect = (condition, message) => { if (!condition) throw new Error(message); };
const controls = [
  ['brightRange', 'Brightness', 'slider'],
  ['volumeRange', 'Master Volume', 'slider'],
  ['musicRange', 'Muzak Volume', 'slider'],
  ['sensRange', 'Mouse Sensitivity', 'slider'],
  ['qualitySelect', 'Graphics Quality', 'combobox'],
  ['glitchSelect', 'Glitch Intensity', 'combobox']
];
const layouts = [
  { name: 'desktop', width: 1280, height: 720, reducedMotion: 'no-preference' },
  { name: 'mobile-390', width: 390, height: 844, reducedMotion: 'reduce' }
];

const browser = await chromium.launch({
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=swiftshader',
    '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
});
try {
  for (const layout of layouts) {
    const context = await browser.newContext({
      viewport: { width: layout.width, height: layout.height },
      deviceScaleFactor: 1, reducedMotion: layout.reducedMotion
    });
    const page = await context.newPage();
    const errors = [], remote = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => {
      try {
        const url = new URL(request.url());
        if ((url.protocol === 'http:' || url.protocol === 'https:') && url.origin !== origin)
          remote.push(request.url());
      } catch {}
    });
    try {
      await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForFunction(() => window.__PINEWOOD_STORY_V17__?.version === 17
        && document.getElementById('titleScreen')?.classList.contains('show'),
        null, { timeout: 120000 });

      // The first keyboard tab stop on the title screen must be New Game.
      await page.keyboard.press('Tab');
      const initialFocus = await page.evaluate(() => document.activeElement?.id);
      expect(initialFocus === 'newBtn', layout.name + ': first keyboard focus was ' + initialFocus);
      const initialOutline = await page.locator('#newBtn').evaluate(el => ({
        style: getComputedStyle(el).outlineStyle,
        width: parseFloat(getComputedStyle(el).outlineWidth)
      }));
      expect(initialOutline.style !== 'none' && initialOutline.width >= 2,
        layout.name + ': title menu lacks visible keyboard focus');

      await page.click('#settingsBtn');
      await page.waitForFunction(() => document.getElementById('settingsScreen')?.classList.contains('show'));
      for (const [id, labelText, role] of controls) {
        const association = await page.locator('#' + id).evaluate(el => ({
          id: el.id, labelFor: el.labels?.[0]?.htmlFor || '',
          labelText: (el.labels?.[0]?.textContent || '').trim(),
          pointsBack: el.labels?.[0]?.control === el
        }));
        expect(association.labelFor === id && association.pointsBack
          && association.labelText.startsWith(labelText),
          layout.name + ': missing associated label for #' + id + ': ' + JSON.stringify(association));
        expect(await page.getByRole(role, { name: new RegExp('^' + labelText) }).count() === 1,
          layout.name + ': inaccessible ' + role + ' name ' + labelText);
      }

      // Clicking the visual label must focus the corresponding slider.
      await page.locator('#settingsScreen label[for="volumeRange"]').click();
      const focusedSlider = await page.evaluate(() => document.activeElement?.id);
      expect(focusedSlider === 'volumeRange',
        layout.name + ': clicking Master Volume label did not focus the slider');

      // Keyboard focus remains visible when tabbing between controls.
      await page.keyboard.press('Tab');
      const sliderFocus = await page.evaluate(() => ({
        id: document.activeElement?.id,
        style: getComputedStyle(document.activeElement).outlineStyle,
        width: parseFloat(getComputedStyle(document.activeElement).outlineWidth)
      }));
      expect(sliderFocus.id === 'musicRange' && sliderFocus.style !== 'none'
        && sliderFocus.width >= 2,
        layout.name + ': tabbing to Muzak slider lacks visible focus: ' + JSON.stringify(sliderFocus));

      const metrics = await page.evaluate(() => {
        const panel = document.querySelector('#settingsScreen .panel');
        const grid = document.querySelector('#settingsScreen .settingsGrid');
        const buttons = [...document.querySelectorAll('#settingsScreen button')];
        const rect = panel.getBoundingClientRect();
        return {
          panelLeft: rect.left, panelRight: rect.right,
          screenWidth: window.innerWidth,
          panelScrollWidth: panel.scrollWidth, panelClientWidth: panel.clientWidth,
          gridColumns: getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length,
          buttonMinHeight: Math.min(...buttons.map(b => b.getBoundingClientRect().height)),
          transition: getComputedStyle(buttons[0]).transitionDuration
        };
      });
      expect(metrics.panelLeft >= -1 && metrics.panelRight <= metrics.screenWidth + 1,
        layout.name + ': Settings panel runs outside viewport: ' + JSON.stringify(metrics));
      expect(metrics.panelScrollWidth <= metrics.panelClientWidth + 2,
        layout.name + ': Settings panel has horizontal overflow: ' + JSON.stringify(metrics));
      expect(metrics.buttonMinHeight >= 43.5,
        layout.name + ': menu button is below 44px touch target height: ' + JSON.stringify(metrics));
      expect(metrics.gridColumns === (layout.width <= 700 ? 1 : 2),
        layout.name + ': Settings grid has wrong responsive columns: ' + JSON.stringify(metrics));
      if (layout.reducedMotion === 'reduce') {
        expect(metrics.transition.split(',').every(value => parseFloat(value) === 0),
          layout.name + ': menu animation not disabled by reduced motion: ' + metrics.transition);
      }

      await page.locator('#settingsScreen [data-back]').scrollIntoViewIfNeeded();
      await page.locator('#settingsScreen [data-back]').click();
      expect(await page.locator('#titleScreen').evaluate(el => el.classList.contains('show')),
        layout.name + ': Back did not restore title screen');
      expect(errors.length === 0, layout.name + ': browser errors: ' + errors.join(' | '));
      expect(remote.length === 0, layout.name + ': remote asset requests: ' + remote.join(' | '));
      report.cases[layout.name] = { passed: true, controls: controls.length, metrics,
        keyboardFocus: true, remoteRequests: 0, browserErrors: 0 };
      console.log('PASS ' + layout.name + ' menu accessibility and responsive layout');
    } catch (error) {
      report.cases[layout.name] = { passed: false, error: error.stack || String(error), errors, remote };
      throw error;
    } finally {
      await context.close();
    }
  }
  report.passed = true;
} finally {
  await browser.close();
  await writeFile(output + '/menu-accessibility-v31.json', JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
