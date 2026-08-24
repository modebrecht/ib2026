const fs = require('fs');
const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'https://ib2026-git-main-modebrechts-projects.vercel.app').replace(/\/$/, '');

const TEST_STUDENT = 'E2E Smoke';

async function seedStudent(page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((student) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('studentVorname', student);
    localStorage.setItem('student_vorname', student);
  }, TEST_STUDENT);
}

async function assertPdf(download, expectedPrefix) {
  const filename = download.suggestedFilename();
  expect(filename).toMatch(new RegExp(`^${expectedPrefix}.*\\.pdf$`, 'i'));

  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();

  const bytes = fs.readFileSync(downloadPath);
  expect(bytes.length).toBeGreaterThan(1000);
  expect(bytes.subarray(0, 5).toString('ascii')).toBe('%PDF-');
}

async function solveCurrentMemory(page) {
  await page.waitForFunction(() => window.state && Array.isArray(window.state.deck) && window.state.deck.length > 0);

  const pairs = await page.evaluate(() => {
    const grouped = new Map();
    window.state.deck.forEach((card, index) => {
      if (!grouped.has(card.pairId)) grouped.set(card.pairId, []);
      grouped.get(card.pairId).push(index);
    });
    return Array.from(grouped.values()).map((indexes) => indexes.slice(0, 2));
  });

  expect(pairs.length).toBeGreaterThan(0);

  for (const [first, second] of pairs) {
    await page.locator(`.mem-card[data-index="${first}"]`).click();
    await page.locator(`.mem-card[data-index="${second}"]`).click();
  }

  await expect(page.locator('#modal')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#modalTitle')).toContainText('Runde geschafft');
}

function collectPageErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

test.use({
  acceptDownloads: true,
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
});

test.describe('HW production smoke: A1-A2', () => {
  test('A1: solves three Memory modes and downloads a valid PDF', async ({ page }) => {
    const pageErrors = collectPageErrors(page);
    await seedStudent(page);
    await page.goto(`${BASE_URL}/hw/A1.html`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/A1: IT-Hardware Memory/);
    await expect(page.locator('#studentName')).toHaveValue(TEST_STUDENT);
    await expect(page.locator('#board .mem-card')).toHaveCount(8);

    const modes = ['einfach', 'mittel', 'schwer'];
    for (let i = 0; i < modes.length; i += 1) {
      if (i > 0) {
        await page.locator('#change').click();
      }

      await page.locator(`.diff-btn[data-diff="${modes[i]}"]`).click();
      await solveCurrentMemory(page);
      await expect(page.locator('#completionBadge')).toContainText(`${i + 1} / 3`);
    }

    await expect(page.locator('#modalPdfBtn')).toContainText('PDF herunterladen (3/3)');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#modalPdfBtn').click(),
    ]);
    await assertPdf(download, 'A1_Leistungsnachweis');

    expect(pageErrors, `Uncaught browser errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });

  test('A2: follows reveal flow, reaches 100%, persists data and downloads a valid PDF', async ({ page, context }) => {
    const pageErrors = collectPageErrors(page);
    await seedStudent(page);
    await page.goto(`${BASE_URL}/hw/A2.html`, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/A2: Das EVA-Prinzip/);
    await expect(page.locator('#studentName')).toHaveValue(TEST_STUDENT);
    await expect(page.locator('#studentClass')).not.toHaveValue('');
    await expect(page.locator('#studentDate')).not.toHaveValue('');

    await page.locator('#play-btn-hd').click();
    await expect(page.locator('#secVideo')).toBeVisible({ timeout: 35_000 });

    context.on('page', async (popup) => {
      if (popup !== page) await popup.close().catch(() => {});
    });
    await page.locator('#ytButton').click({ noWaitAfter: true });
    await expect(page.locator('#secPraxis')).toBeVisible({ timeout: 5_000 });

    const examples = {
      3: ['Smartphone', 'Touch auf App-Symbol', 'App verarbeitet den Touch', 'App wird auf dem Display geöffnet'],
      4: ['Waschmaschine', 'Programm und Start wählen', 'Maschine steuert den Waschgang', 'Saubere Wäsche und Signal'],
      5: ['Türklingel', 'Klingeltaste drücken', 'Signal wird elektrisch verarbeitet', 'Klingelton ertönt'],
      6: ['Fahrkartenautomat', 'Ziel und Zahlungsmittel wählen', 'Automat berechnet und verbucht', 'Fahrkarte wird ausgegeben'],
    };

    for (const [number, values] of Object.entries(examples)) {
      const [name, input, processing, output] = values;
      await page.locator(`#ex${number}_name`).fill(name);
      await page.locator(`#ex${number}_in`).fill(input);
      await page.locator(`#ex${number}_proc`).fill(processing);
      await page.locator(`#ex${number}_out`).fill(output);
    }

    await expect(page.locator('#headerPercentText')).toHaveText('100% erledigt');
    await expect(page.locator('#hdrPdfBtn')).toHaveAttribute('title', 'Arbeitsblatt als PDF herunterladen');

    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('onedrive_a2_eva_worksheet_8sek') || '{}'));
    expect(saved.percent).toBe(100);
    expect(saved.form.ex6_out).toContain('Fahrkarte');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#hdrPdfBtn').click(),
    ]);
    await assertPdf(download, 'A2_EVA_Prinzip');

    expect(pageErrors, `Uncaught browser errors: ${pageErrors.join(' | ')}`).toEqual([]);
  });
});
