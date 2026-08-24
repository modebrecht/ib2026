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

async function openWorksheet(page, path) {
  await seedStudent(page);
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
}

async function assertDownload(download, extension, magic, expectedPrefix) {
  const filename = download.suggestedFilename();
  expect(filename).toMatch(new RegExp(`\\.${extension}$`, 'i'));
  if (expectedPrefix) expect(filename).toMatch(new RegExp(`^${expectedPrefix}`, 'i'));

  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const bytes = fs.readFileSync(downloadPath);
  expect(bytes.length).toBeGreaterThan(1000);
  expect(bytes.subarray(0, magic.length).toString('ascii')).toBe(magic);
}

async function downloadFrom(page, selector, extension, magic, expectedPrefix) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    page.locator(selector).click(),
  ]);
  await assertDownload(download, extension, magic, expectedPrefix);
}

async function downloadPdf(page, selector, expectedPrefix) {
  await downloadFrom(page, selector, 'pdf', '%PDF-', expectedPrefix);
}

function collectPageErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

function expectNoPageErrors(errors) {
  expect(errors, `Uncaught browser errors: ${errors.join(' | ')}`).toEqual([]);
}

async function solveCurrentMemory(page) {
  await page.waitForFunction(() => typeof state !== 'undefined' && Array.isArray(state.deck) && state.deck.length > 0);

  const pairs = await page.evaluate(() => {
    const grouped = new Map();
    state.deck.forEach((card, index) => {
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

test.use({
  acceptDownloads: true,
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
});

test.setTimeout(180_000);

test.describe('HW production smoke: A1-A9', () => {
  test('A1: solves three Memory modes and downloads a valid PDF', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openWorksheet(page, '/hw/A1.html');

    await expect(page).toHaveTitle(/A1: IT-Hardware Memory/);
    await expect(page.locator('#studentName')).toHaveValue(TEST_STUDENT);
    await expect(page.locator('#board .mem-card')).toHaveCount(8);

    const modes = ['einfach', 'mittel', 'schwer'];
    for (let i = 0; i < modes.length; i += 1) {
      if (i > 0) await page.locator('#change').click();
      await page.locator(`.diff-btn[data-diff="${modes[i]}"]`).click();
      await solveCurrentMemory(page);
      await expect(page.locator('#completionBadge')).toContainText(`${i + 1} / 3`);
    }

    await expect(page.locator('#modalPdfBtn')).toContainText('PDF herunterladen (3/3)');
    await downloadPdf(page, '#modalPdfBtn', 'A1_Leistungsnachweis');
    expectNoPageErrors(errors);
  });

  test('A2: reveal flow, 100%, persistence and PDF', async ({ page, context }) => {
    const errors = collectPageErrors(page);
    await openWorksheet(page, '/hw/A2.html');

    await expect(page).toHaveTitle(/A2: Das EVA-Prinzip/);
    await expect(page.locator('#studentName')).toHaveValue(TEST_STUDENT);
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
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('onedrive_a2_eva_worksheet_8sek') || '{}'));
    expect(saved.percent).toBe(100);
    expect(saved.form.ex6_out).toContain('Fahrkarte');
    await downloadPdf(page, '#hdrPdfBtn', 'A2_EVA_Prinzip');
    expectNoPageErrors(errors);
  });

  test('A3: completes all 14 component functions and downloads PDF', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openWorksheet(page, '/hw/A3.html');

    const fields = page.locator('textarea[id$="_func"]');
    await expect(fields).toHaveCount(14);
    for (let i = 0; i < 14; i += 1) {
      await fields.nth(i).fill(`E2E Funktionsbeschreibung ${i + 1}`);
    }

    await expect(page.locator('#headerPercentText')).toContainText('14 / 14');
    await downloadPdf(page, '#hdrPdfBtn');
    expectNoPageErrors(errors);
  });

  test('A4: answers all port questions correctly and downloads PDF', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openWorksheet(page, '/hw/A4.html');

    await page.locator('#btnQuiz').click();
    for (let i = 0; i < 15; i += 1) {
      await expect(page.locator('#quizOptions button').first()).toBeVisible({ timeout: 10_000 });
      const correctId = await page.evaluate(() => currentQuestion && currentQuestion.id);
      expect(correctId).toBeTruthy();
      await page.locator(`#quizOptions button[data-id="${correctId}"]`).click();
      await page.waitForFunction(
        (previousIndex) => finished || qIndex > previousIndex,
        i,
        { timeout: 5_000 },
      );
    }

    const result = await page.evaluate(() => ({ finished, correct, wrong }));
    expect(result).toEqual({ finished: true, correct: 15, wrong: 0 });
    await downloadPdf(page, '#hdrPdfBtn');
    expectNoPageErrors(errors);
  });

  test('A5: completes all cable fields, persists and downloads PDF', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openWorksheet(page, '/hw/A5.html');

    const ids = await page.evaluate(() => CABLES.flatMap((cable) => cable.ids));
    expect(ids).toHaveLength(32);
    for (let i = 0; i < ids.length; i += 1) {
      await page.locator(`#${ids[i]}`).fill(`E2E A5 ${i + 1}`);
    }

    await expect(page.locator('#headerPercentText')).toContainText('32 / 32');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('onedrive_a5_cable_worksheet_v3') || '{}'));
    expect(saved).toBeTruthy();
    await downloadPdf(page, '#hdrPdfBtn');
    expectNoPageErrors(errors);
  });

  test('A6: downloads the real DOCX and persists manual completion', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openWorksheet(page, '/hw/A6.html');

    await downloadFrom(page, '#b64DownloadBtn', 'docx', 'PK', 'A6_Mainboard_Anschlusse');
    await page.locator('#manualDoneA5').check();
    expect(await page.evaluate(() => localStorage.getItem('manualDoneA5'))).toBe('true');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#manualDoneA5')).toBeChecked();
    expectNoPageErrors(errors);
  });

  test('A7: launches troubleshooting tool and persists manual completion', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openWorksheet(page, '/hw/A7.html');

    const launcher = page.locator('a[href^="https://ib-ts.vercel.app/"]').first();
    await expect(launcher).toBeVisible();
    const [toolPage] = await Promise.all([
      page.waitForEvent('popup'),
      launcher.click(),
    ]);
    await toolPage.waitForLoadState('domcontentloaded', { timeout: 30_000 });
    await expect(toolPage).toHaveURL(/ib-ts\.vercel\.app/);
    await expect(toolPage.locator('body')).toBeVisible();
    await toolPage.close();

    await page.locator('#manualDoneA7').check();
    expect(await page.evaluate(() => localStorage.getItem('manualDoneA7'))).toBe('true');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#manualDoneA7')).toBeChecked();
    expectNoPageErrors(errors);
  });

  test('A8: answers all device-component questions correctly and downloads PDF', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openWorksheet(page, '/hw/A8.html');

    const total = await page.evaluate(() => ITEMS.length);
    expect(total).toBeGreaterThan(0);
    for (let i = 0; i < total; i += 1) {
      const category = await page.evaluate(() => state.queue[state.idx].cat);
      const option = page.locator(`#options button[onclick="choose('${category}')"]`);
      await expect(option).toBeVisible();
      await option.click();
      await page.waitForFunction(
        (previousIndex) => state.done || state.idx > previousIndex,
        i,
        { timeout: 5_000 },
      );
    }

    const result = await page.evaluate(() => ({ done: state.done, right: state.right, wrong: state.wrong }));
    expect(result.done).toBe(true);
    expect(result.right).toBe(total);
    expect(result.wrong).toBe(0);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('a8_last_result_v3') || '{}'));
    expect(saved.right).toBe(total);
    await downloadPdf(page, '#pdfBtn');
    expectNoPageErrors(errors);
  });

  test('A9: answers all hardware scenarios correctly and downloads PDF', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openWorksheet(page, '/hw/A9.html');

    const total = await page.evaluate(() => SCENES.length);
    expect(total).toBeGreaterThan(0);
    for (let i = 0; i < total; i += 1) {
      const category = await page.evaluate(() => state.order[state.idx].cat);
      const option = page.locator(`#options button[onclick="answer('${category}')"]`);
      await expect(option).toBeVisible();
      await option.click();
      await page.waitForFunction(
        (previousIndex) => state.done || state.idx > previousIndex,
        i,
        { timeout: 5_000 },
      );
    }

    const result = await page.evaluate(() => ({ done: state.done, correct: state.correct, wrong: state.wrong }));
    expect(result.done).toBe(true);
    expect(result.correct).toBe(total);
    expect(result.wrong).toBe(0);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('a9_quiz_progress_v1') || '{}'));
    expect(saved.correct).toBe(total);
    await downloadPdf(page, '#pdfBtn');
    expectNoPageErrors(errors);
  });
});
