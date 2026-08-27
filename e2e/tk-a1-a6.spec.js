const fs = require('fs');
const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'https://ib2026.vercel.app').replace(/\/$/, '');
const TEST_STUDENT = 'E2E Smoke';

async function seedStudent(page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((student) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('studentVorname', student);
    localStorage.setItem('student_vorname', student);
    localStorage.setItem('tk_student_name_v1', student);
  }, TEST_STUDENT);
}

async function openTk(page, path) {
  await seedStudent(page);
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
}

function collectPageErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

function expectNoPageErrors(errors) {
  expect(errors, `Uncaught browser errors: ${errors.join(' | ')}`).toEqual([]);
}

async function setQuestScores(page, scores) {
  await page.evaluate((nextScores) => {
    localStorage.setItem('tk_quest_scores_v1', JSON.stringify(nextScores));
  }, scores);
}

async function assertDownload(download, extension, magic, expectedFilename) {
  const filename = download.suggestedFilename();
  expect(filename).toMatch(new RegExp(`\\.${extension}$`, 'i'));
  if (expectedFilename) expect(filename).toBe(expectedFilename);

  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const bytes = fs.readFileSync(downloadPath);
  expect(bytes.length).toBeGreaterThan(1000);
  expect(bytes.subarray(0, magic.length).toString('ascii')).toBe(magic);
}

async function downloadFrom(page, selector, extension, magic, expectedFilename) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    page.locator(selector).click({ force: true }),
  ]);
  await assertDownload(download, extension, magic, expectedFilename);
}

async function answerAllCorrect(page, selector) {
  const selects = page.locator(selector);
  const count = await selects.count();
  expect(count).toBeGreaterThan(0);
  const correct = await selects.evaluateAll((nodes) => nodes.map((node) => node.dataset.correct));
  expect(correct).toHaveLength(count);
  for (let i = 0; i < count; i += 1) {
    expect(correct[i]).toBeTruthy();
    await selects.nth(i).selectOption(correct[i]);
  }
}

test.use({
  acceptDownloads: true,
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
});

test.setTimeout(180_000);

test.describe('TK2 production smoke: A1-A6', () => {
  test('A1: all worksheets stay open while Q1 -> Q2 -> Q3 remains gated', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openTk(page, '/tk2/index.html');

    for (let i = 1; i <= 6; i += 1) {
      const card = page.locator(`#module-a${i}`);
      await expect(card).toBeVisible();
      await expect(card).not.toHaveClass(/locked/);
      const link = card.locator('.module-btn');
      await expect(link).toBeVisible();
      await expect(link).not.toHaveAttribute('aria-disabled', 'true');
      await expect(link).toHaveAttribute('href', `A${i}.html`);
    }

    await page.goto(`${BASE_URL}/tk2/A1.html`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/A1: Allgemeine Tastenkürzel/);

    await page.locator('#tab-3').click();
    await expect(page.locator('#q2-lock-screen')).toBeVisible();
    await expect(page.locator('#q2-game-screen')).toBeHidden();

    await setQuestScores(page, { q1: 80 });
    await page.locator('#tab-2').click();
    await page.locator('#tab-3').click();
    await expect(page.locator('#q2-lock-screen')).toBeHidden();
    await expect(page.locator('#q2-game-screen')).toBeVisible();

    await page.locator('#tab-4').click();
    await expect(page.locator('#q3-lock-screen')).toBeVisible();
    await expect(page.locator('#q3-game-screen')).toBeHidden();

    await setQuestScores(page, { q1: 80, q2: 70 });
    await page.locator('#tab-3').click();
    await page.locator('#tab-4').click();
    await expect(page.locator('#q3-lock-screen')).toBeHidden();
    await expect(page.locator('#q3-game-screen')).toBeVisible();
    expectNoPageErrors(errors);
  });

  test('A2: worksheet is open while Q4 -> Q5 -> Q6 remains gated', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openTk(page, '/tk2/A2.html');

    await expect(page).toHaveTitle(/A2: Sonderzeichen mit AltGr/);
    await expect(page.locator('#a2-lock-screen')).toBeHidden();
    await expect(page.locator('#a2-content-wrap')).toBeVisible();

    await page.locator('#tab-3').click();
    await expect(page.locator('#q5-lock-screen')).toBeVisible();
    await expect(page.locator('#q5-game-screen')).toBeHidden();

    await setQuestScores(page, { q4: 80 });
    await page.locator('#tab-2').click();
    await page.locator('#tab-3').click();
    await expect(page.locator('#q5-lock-screen')).toBeHidden();
    await expect(page.locator('#q5-game-screen')).toBeVisible();

    await page.locator('#tab-4').click();
    await expect(page.locator('#q6-lock-screen')).toBeVisible();
    await expect(page.locator('#q6-game-screen')).toBeHidden();

    await setQuestScores(page, { q4: 80, q5: 70 });
    await page.locator('#tab-3').click();
    await page.locator('#tab-4').click();
    await expect(page.locator('#q6-lock-screen')).toBeHidden();
    await expect(page.locator('#q6-game-screen')).toBeVisible();
    expectNoPageErrors(errors);
  });

  test('A3: follows PDF -> three shortcuts -> OneDrive and persists Done', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openTk(page, '/tk2/A3.html');

    await expect(page).toHaveTitle(/A3: Tastenkürzel – Merkblatt/);
    await expect(page.locator('#completion-card')).toBeHidden();
    await expect(page.locator('#theory-download')).toHaveAttribute('href', 'Tastenkombinationen_Theorie.pdf');
    await expect(page.locator('select.shortcut-choice')).toHaveCount(0);
    await expect(page.locator('input.shortcut-choice')).toHaveCount(3);
    await expect(page.locator('.shortcut-choice').nth(0)).toHaveAttribute('placeholder', 'z. B. Ctrl + C');
    await expect(page.locator('.shortcut-choice').nth(1)).not.toHaveAttribute('placeholder');
    await expect(page.locator('.shortcut-choice').nth(2)).not.toHaveAttribute('placeholder');
    await expect(page.locator('.shortcut-choice').nth(0)).toBeDisabled();
    await expect(page.locator('.shortcut-reason').nth(0)).toBeDisabled();
    await expect(page.locator('#onedrive-confirm')).toBeVisible();
    await expect(page.locator('#onedrive-confirm')).toBeDisabled();

    await downloadFrom(page, '#theory-download', 'pdf', '%PDF-', 'Tastenkombinationen_Theorie.pdf');
    let progress = await page.evaluate(() => JSON.parse(localStorage.getItem('tk_a3_progress_v1') || '{}'));
    expect(progress.schemaVersion).toBe(2);
    expect(progress.downloaded).toBe(true);
    expect(progress.onedriveStored).toBe(false);
    expect(progress.completed).toBe(false);
    await expect(page.locator('.shortcut-choice').nth(0)).toBeEnabled();
    await expect(page.locator('.shortcut-reason').nth(0)).toBeEnabled();
    await expect(page.locator('#onedrive-confirm')).toBeDisabled();

    const shortcuts = ['Ctrl + C', 'Ctrl + Z', 'Win + L'];
    const reasons = [
      'ich damit schneller kopieren kann',
      'ich Fehler schnell rückgängig machen kann',
      'ich meinen Computer schnell sperren kann',
    ];

    for (let i = 0; i < 3; i += 1) {
      await page.locator('.shortcut-choice').nth(i).fill(shortcuts[i]);
      await page.locator('.shortcut-reason').nth(i).fill(reasons[i]);
    }

    await expect(page.locator('#onedrive-confirm')).toBeEnabled();
    progress = await page.evaluate(() => JSON.parse(localStorage.getItem('tk_a3_progress_v1') || '{}'));
    expect(progress.onedriveStored).toBe(false);
    expect(progress.completed).toBe(false);

    await page.locator('#onedrive-confirm').check();
    await expect(page.locator('#completion-card')).toBeVisible();
    await expect(page.locator('#next-a4')).toHaveAttribute('href', 'A4.html');

    progress = await page.evaluate(() => JSON.parse(localStorage.getItem('tk_a3_progress_v1') || '{}'));
    expect(progress.schemaVersion).toBe(2);
    expect(progress.downloaded).toBe(true);
    expect(progress.onedriveStored).toBe(true);
    expect(progress.completed).toBe(true);
    expect(progress.rewarded).toBe(true);
    expect(progress.choices.map((choice) => choice.shortcut)).toEqual(shortcuts);
    expect(new Set(progress.choices.map((choice) => choice.shortcut)).size).toBe(3);
    expect(progress.choices.every((choice) => choice.reason.trim().length >= 5)).toBe(true);

    const scores = await page.evaluate(() => JSON.parse(localStorage.getItem('tk_quest_scores_v1') || '{}'));
    expect(scores.q7).toBe(100);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#completion-card')).toBeVisible();
    await expect(page.locator('#onedrive-confirm')).toBeChecked();
    for (let i = 0; i < 3; i += 1) {
      await expect(page.locator('.shortcut-choice').nth(i)).toHaveValue(shortcuts[i]);
      await expect(page.locator('.shortcut-reason').nth(i)).toHaveValue(reasons[i]);
    }

    await page.goto(`${BASE_URL}/tk2/index.html`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#module-a3')).toHaveClass(/done/);
    await expect(page.locator('#module-a3 .module-state')).toHaveText('Done');
    expectNoPageErrors(errors);
  });

  test('A4: completes both Q8 passes at 100% and persists 2/2', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openTk(page, '/tk2/A4.html');

    await expect(page).toHaveTitle(/A4:/);
    await answerAllCorrect(page, '#q8Questions .answer-select');
    await page.locator('#q8CheckBtn').click();
    await expect(page.locator('#a4SecondPassCard')).toBeVisible();

    await page.locator('#startSecondPassBtn').click();
    await answerAllCorrect(page, '#q8Questions .answer-select');
    await page.locator('#q8CheckBtn').click();
    await expect(page.locator('#a4DoneCard')).toBeVisible();
    await expect(page.locator('#q8CheckBtn')).toContainText('2/2');

    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tk_a4_progress_v1') || '{}'));
    expect(saved.A.attempts).toBe(2);
    expect(saved.A.first).toBe(100);
    expect(saved.A.second).toBe(100);
    expect(saved.A.best).toBe(100);
    expectNoPageErrors(errors);
  });

  test('A5: completes both Q9 passes at 100% and persists 2/2', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openTk(page, '/tk2/A5.html');

    await expect(page).toHaveTitle(/A5:/);
    await answerAllCorrect(page, '#q9Questions .answer-select');
    await page.locator('#q9CheckBtn').click();
    await expect(page.locator('#a5SecondPassCard')).toBeVisible();

    await page.locator('#startSecondPassBtn').click();
    await answerAllCorrect(page, '#q9Questions .answer-select');
    await page.locator('#q9CheckBtn').click();
    await expect(page.locator('#a5DoneCard')).toBeVisible();
    await expect(page.locator('#q9CheckBtn')).toContainText('2/2');

    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tk_a5_progress_v1') || '{}'));
    expect(saved.A.attempts).toBe(2);
    expect(saved.A.first).toBe(100);
    expect(saved.A.second).toBe(100);
    expect(saved.A.best).toBe(100);
    expectNoPageErrors(errors);
  });

  test('A6: completes all four repetition sets and persists Q10-Q13', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openTk(page, '/tk2/A6.html');

    await expect(page).toHaveTitle(/A6:/);
    await expect(page.locator('.set-tab')).toHaveCount(4);

    for (let i = 0; i < 4; i += 1) {
      if (i > 0) await page.locator('.set-tab').nth(i).click();
      await answerAllCorrect(page, '#questionsContainer .answer-select');
      await page.locator('#checkBtn').click();
    }

    await expect(page.locator('#finishCard')).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('tk_a6_progress_v1') || '{}'));
    for (const key of ['A', 'B', 'C', 'D']) {
      expect(saved[key]).toBeTruthy();
      expect(saved[key].first).toBe(100);
      expect(saved[key].best).toBe(100);
    }

    const scores = await page.evaluate(() => JSON.parse(localStorage.getItem('tk_quest_scores_v1') || '{}'));
    for (const q of ['q10', 'q11', 'q12', 'q13']) expect(scores[q]).toBe(100);
    expectNoPageErrors(errors);
  });
});
