const fs = require('fs');
const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'https://ib2026.vercel.app').replace(/\/$/, '');
const TEST_STUDENT = 'E2E Score History';

async function seedStudent(page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((student) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('studentVorname', student);
    localStorage.setItem('student_vorname', student);
  }, TEST_STUDENT);
}

async function openWorksheet(page, path, code) {
  await seedStudent(page);
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
  await page.waitForFunction((expected) => window.__scoreHistoryPage === expected, code, { timeout: 10_000 });
}

async function speedUpTimers(page) {
  await page.evaluate(() => {
    const nativeSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = (fn, delay, ...args) => nativeSetTimeout(fn, Math.min(Number(delay) || 0, 45), ...args);
  });
}

async function history(page, total, suffix = '') {
  return page.evaluate(({ suffix, total }) => window.__getScoreHistory(suffix, total), { suffix, total });
}

async function expectHistory(page, total, first, second, best, suffix = '') {
  const h = await history(page, total, suffix);
  expect(h.firstScore).toBe(first);
  expect(h.secondScore).toBe(second);
  expect(h.bestScore).toBe(best);
  expect(h.attempts).toBeGreaterThanOrEqual(second == null ? 1 : 2);
  return h;
}

async function expectValidPdfAndPayload(page, selector, expectedPrefix) {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20_000 }),
    page.locator(selector).click({ force: true }),
  ]);
  const filename = download.suggestedFilename();
  expect(filename).toMatch(/\.pdf$/i);
  if (expectedPrefix) expect(filename).toMatch(new RegExp(`^${expectedPrefix}`, 'i'));
  const path = await download.path();
  expect(path).toBeTruthy();
  const bytes = fs.readFileSync(path);
  expect(bytes.length).toBeGreaterThan(1000);
  expect(bytes.subarray(0, 5).toString('ascii')).toBe('%PDF-');

  const payload = await page.evaluate(() => window.__scoreHistoryPdfPayload || []);
  const labels = payload.map((x) => x.label);
  expect(labels.some((x) => x.includes('Erster Versuch'))).toBe(true);
  expect(labels.some((x) => x.includes('Zweiter Versuch'))).toBe(true);
  expect(labels.some((x) => x.includes('Bester Versuch'))).toBe(true);
  return payload;
}

function different(value, values) { return values.find((x) => x !== value); }

async function runA4(page, wrongCount) {
  const total = await page.evaluate(() => TOTAL_QUESTIONS);
  for (let i = 0; i < total; i += 1) {
    await expect(page.locator('#quizOptions button').first()).toBeVisible({ timeout: 10_000 });
    const correctId = await page.evaluate(() => currentQuestion && currentQuestion.id);
    const buttons = page.locator('#quizOptions button');
    let button = buttons.filter({ has: page.locator('span') });
    if (i < wrongCount) {
      const ids = await buttons.evaluateAll((els) => els.map((el) => el.dataset.id));
      const wrongId = ids.find((id) => id && id !== correctId);
      await page.locator(`#quizOptions button[data-id="${wrongId}"]`).click();
    } else {
      await page.locator(`#quizOptions button[data-id="${correctId}"]`).click();
    }
    await page.waitForFunction((prev) => !quizActive || (currentQuestion && currentQuestion.id !== prev), correctId, { timeout: 5_000 });
  }
  await expect(page.locator('#modal')).toBeVisible();
  return total - wrongCount;
}

async function runCategoryQuest(page, config, wrongCount) {
  const total = await page.evaluate((totalExpr) => {
    if (totalExpr === 'ITEMS') return ITEMS.length;
    if (totalExpr === 'SCENES') return SCENES.length;
    return TOTAL;
  }, config.totalExpr);
  for (let i = 0; i < total; i += 1) {
    const correct = await page.evaluate((kind) => {
      if (kind === 'a8') return current().cat;
      if (kind === 'a9') return current().cat;
      if (kind === 'a10') return current().cat;
      return queue[index].correct;
    }, config.kind);
    let selector;
    if (config.kind === 'a8' || config.kind === 'a9') {
      const choice = i < wrongCount ? different(correct, ['eingabe','verarbeitung','ausgabe']) : correct;
      selector = `.eva-btn[data-cat="${choice}"]`;
    } else if (config.kind === 'a10') {
      const choice = i < wrongCount ? different(correct, ['ram','hdd','ssd']) : correct;
      selector = `.storage-btn[data-cat="${choice}"]`;
    } else {
      if (i < wrongCount) {
        const ids = await page.locator('.option-btn').evaluateAll((els) => els.map((el) => el.dataset.id));
        selector = `.option-btn[data-id="${ids.find((id) => id !== correct)}"]`;
      } else selector = `.option-btn[data-id="${correct}"]`;
    }
    await page.locator(selector).click();
    await page.waitForFunction((prev) => index > prev || document.getElementById('result')?.classList.contains('hidden') === false, i, { timeout: 5_000 });
  }
  await expect(page.locator('#result')).toBeVisible();
  return total - wrongCount;
}

async function runA11(page, wrongCount) {
  const total = await page.evaluate(() => CASES.length);
  for (let i = 0; i < total; i += 1) {
    await page.locator('#dialogueNext').click({ force: true });
    const correctId = await page.evaluate(() => CASES[index].correct);
    let id = correctId;
    if (i < wrongCount) {
      const ids = await page.locator('.device-card').evaluateAll((els) => els.map((el) => el.dataset.id));
      id = ids.find((x) => x !== correctId);
    }
    await page.locator(`.device-card[data-id="${id}"]`).click();
    await expect(page.locator('#nextBtn')).toHaveClass(/show/);
    // Correct solution must always be shown after the first click.
    await expect(page.locator(`.device-card[data-id="${correctId}"]`)).toHaveClass(/correct/);
    await page.locator('#nextBtn').click();
    await page.waitForFunction((prev) => index > prev || document.getElementById('result')?.classList.contains('hidden') === false, i, { timeout: 5_000 });
  }
  await expect(page.locator('#result')).toBeVisible();
  return total - wrongCount;
}

async function runA12(page, wrongCount) {
  const connectors = await page.evaluate(() => C.map(({ id, category }) => ({ id, category })));
  const values = ['av','data','network','power'];
  for (let i = 0; i < connectors.length; i += 1) {
    const x = connectors[i];
    const value = i < wrongCount ? different(x.category, values) : x.category;
    const select = page.locator(`#choice_${x.id}`);
    await select.selectOption(value);
    await expect(select).toBeDisabled();
  }
  await expect(page.locator('#result')).toBeVisible();
  return connectors.length - wrongCount;
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
  for (const [a, b] of pairs) {
    await page.locator(`.mem-card[data-index="${a}"]`).click();
    await page.locator(`.mem-card[data-index="${b}"]`).click();
  }
  await expect(page.locator('#modal')).toBeVisible({ timeout: 10_000 });
}

async function acceptNextDialog(page) {
  page.once('dialog', (d) => d.accept());
}

test.use({ acceptDownloads: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' });
test.setTimeout(180_000);

test.describe('HW score history standard', () => {
  test('A1 keeps first, second and best per Memory mode; reset preserves history; PDF receives history', async ({ page }) => {
    await openWorksheet(page, '/hw/A1.html', 'A1');
    await page.locator('.diff-btn[data-diff="einfach"]').click();
    await solveCurrentMemory(page);
    const first = (await history(page, null, 'einfach')).firstScore;
    expect(first).not.toBeNull();

    await page.locator('#again').click(); await solveCurrentMemory(page);
    const secondH = await history(page, null, 'einfach');
    expect(secondH.secondScore).not.toBeNull();

    await page.locator('#again').click(); await solveCurrentMemory(page);
    const thirdH = await history(page, null, 'einfach');
    expect(thirdH.attempts).toBe(3);
    expect(thirdH.bestScore).toBeGreaterThanOrEqual(thirdH.firstScore);
    expect(thirdH.bestScore).toBeGreaterThanOrEqual(thirdH.secondScore);

    await page.locator('#change').click();
    await page.locator('.diff-btn[data-diff="mittel"]').click(); await solveCurrentMemory(page);
    await page.locator('#change').click();
    await page.locator('.diff-btn[data-diff="schwer"]').click(); await solveCurrentMemory(page);
    await expect(page.locator('#completionBadge')).toContainText('3 / 3');

    const before = await history(page, null, 'einfach');
    await acceptNextDialog(page); await page.evaluate(() => confirmReset());
    const after = await history(page, null, 'einfach');
    expect(after).toEqual(before);
    await expectValidPdfAndPayload(page, '#hdrPdfBtn', 'A1_Leistungsnachweis');
  });

  test('A4 stores 1st/2nd/best and reset only starts a new test', async ({ page }) => {
    await openWorksheet(page, '/hw/A4.html', 'A4'); await speedUpTimers(page);
    await page.locator('#btnQuiz').click();
    expect(await runA4(page, 2)).toBe(14);
    await page.getByRole('button', { name: 'Nochmal Testen' }).click();
    expect(await runA4(page, 1)).toBe(15);
    await page.getByRole('button', { name: 'Nochmal Testen' }).click();
    expect(await runA4(page, 0)).toBe(16);
    await expectHistory(page, 16, 14, 15, 16);
    const before = await history(page, 16);
    await acceptNextDialog(page); await page.evaluate(() => confirmReset());
    expect(await history(page, 16)).toEqual(before);
    await expectValidPdfAndPayload(page, '#hdrPdfBtn');
  });

  test('A8 stores 12/15, 14/15, best 15/15', async ({ page }) => {
    await openWorksheet(page, '/hw/A8.html', 'A8'); await speedUpTimers(page);
    expect(await runCategoryQuest(page,{kind:'a8',totalExpr:'ITEMS'},3)).toBe(12);
    await page.getByRole('button',{name:/Ganze Runde nochmals/}).click();
    expect(await runCategoryQuest(page,{kind:'a8',totalExpr:'ITEMS'},1)).toBe(14);
    await page.getByRole('button',{name:/Ganze Runde nochmals/}).click();
    expect(await runCategoryQuest(page,{kind:'a8',totalExpr:'ITEMS'},0)).toBe(15);
    await expectHistory(page,15,12,14,15);
    const before=await history(page,15);await acceptNextDialog(page);await page.evaluate(()=>resetA8());expect(await history(page,15)).toEqual(before);
    await expectValidPdfAndPayload(page,'#pdf','A8_EVA_Repetition');
  });

  test('A9 stores 10/12, 11/12, best 12/12', async ({ page }) => {
    await openWorksheet(page, '/hw/A9.html', 'A9'); await speedUpTimers(page);
    expect(await runCategoryQuest(page,{kind:'a9',totalExpr:'SCENES'},2)).toBe(10);
    await page.getByRole('button',{name:/Ganze Runde nochmals|Neue Runde|Noch einmal/}).click();
    expect(await runCategoryQuest(page,{kind:'a9',totalExpr:'SCENES'},1)).toBe(11);
    await page.getByRole('button',{name:/Ganze Runde nochmals|Neue Runde|Noch einmal/}).click();
    expect(await runCategoryQuest(page,{kind:'a9',totalExpr:'SCENES'},0)).toBe(12);
    await expectHistory(page,12,10,11,12);
    const before=await history(page,12);await acceptNextDialog(page);await page.evaluate(()=>resetA9());expect(await history(page,12)).toEqual(before);
    await expectValidPdfAndPayload(page,'#pdf','A9_EVA_Szenarien');
  });

  test('A10 stores 8/10, 9/10, best 10/10', async ({ page }) => {
    await openWorksheet(page, '/hw/A10.html', 'A10'); await speedUpTimers(page);
    expect(await runCategoryQuest(page,{kind:'a10',totalExpr:'SCENES'},2)).toBe(8);
    await page.getByRole('button',{name:/Ganze Runde nochmals|Neue Runde|Noch einmal/}).click();
    expect(await runCategoryQuest(page,{kind:'a10',totalExpr:'SCENES'},1)).toBe(9);
    await page.getByRole('button',{name:/Ganze Runde nochmals|Neue Runde|Noch einmal/}).click();
    expect(await runCategoryQuest(page,{kind:'a10',totalExpr:'SCENES'},0)).toBe(10);
    await expectHistory(page,10,8,9,10);
    const before=await history(page,10);await acceptNextDialog(page);await page.evaluate(()=>resetA10());expect(await history(page,10)).toEqual(before);
    await expectValidPdfAndPayload(page,'#pdf','A10_RAM_HDD_SSD');
  });

  test('A11 first click counts; stores 3/5, 4/5, best 5/5', async ({ page }) => {
    await openWorksheet(page, '/hw/A11.html', 'A11'); await speedUpTimers(page);
    expect(await runA11(page,2)).toBe(3);
    await page.getByRole('button',{name:/Noch einmal beraten/}).click();
    expect(await runA11(page,1)).toBe(4);
    await page.getByRole('button',{name:/Noch einmal beraten/}).click();
    expect(await runA11(page,0)).toBe(5);
    await expectHistory(page,5,3,4,5);
    const before=await history(page,5);await acceptNextDialog(page);await page.evaluate(()=>resetA11());expect(await history(page,5)).toEqual(before);
    await expectValidPdfAndPayload(page,'#pdf','A11_Kaufberatung');
  });

  test('A12 locks first selection; stores 10/12, 11/12, best 12/12', async ({ page }) => {
    await openWorksheet(page, '/hw/A12.html', 'A12');
    expect(await runA12(page,2)).toBe(10);
    await page.locator('#a12Repeat').click();
    expect(await runA12(page,1)).toBe(11);
    await page.locator('#a12Repeat').click();
    expect(await runA12(page,0)).toBe(12);
    await expectHistory(page,12,10,11,12);
    const before=await history(page,12);await acceptNextDialog(page);await page.evaluate(()=>resetA12());expect(await history(page,12)).toEqual(before);
    await expectValidPdfAndPayload(page,'#pdf','A12_Schnittstellen');
  });

  test('A14 stores 11/14, 13/14, best 14/14', async ({ page }) => {
    await openWorksheet(page, '/hw/A14.html', 'A14'); await speedUpTimers(page);
    expect(await runCategoryQuest(page,{kind:'a14',totalExpr:'TOTAL'},3)).toBe(11);
    await page.getByRole('button',{name:/Ganze Runde nochmals|Neue Runde|Noch einmal/}).click();
    expect(await runCategoryQuest(page,{kind:'a14',totalExpr:'TOTAL'},1)).toBe(13);
    await page.getByRole('button',{name:/Ganze Runde nochmals|Neue Runde|Noch einmal/}).click();
    expect(await runCategoryQuest(page,{kind:'a14',totalExpr:'TOTAL'},0)).toBe(14);
    await expectHistory(page,14,11,13,14);
    const before=await history(page,14);await acceptNextDialog(page);await page.evaluate(()=>resetA14());expect(await history(page,14)).toEqual(before);
    await expectValidPdfAndPayload(page,'#pdf','A14_Green_IT_Challenge');
  });

  test('writing/learning pages do not expose reset buttons', async ({ page }) => {
    for (const code of ['A2','A3','A5','A13']) {
      await openWorksheet(page, `/hw/${code}.html`, code);
      const resetCount = await page.locator('button').evaluateAll((buttons) => buttons.filter((b) => {
        const text = `${b.title || ''} ${b.getAttribute('onclick') || ''} ${b.textContent || ''}`.toLowerCase();
        return text.includes('zurücksetzen') || text.includes('confirmreset') || /reset[a-z0-9_]*\(/.test(text);
      }).length);
      expect(resetCount, `${code} must not expose a reset button`).toBe(0);
    }
  });
});
