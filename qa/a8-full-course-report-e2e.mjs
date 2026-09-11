import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.A8_URL || 'https://modebrecht.github.io/ib2026/dev/tk2/A8/';
const outDir = process.env.A8_OUT_DIR || 'qa-artifacts';
const deliberateErrorSections = new Set([3, 5, 9, 15, 22, 25, 29]);

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  acceptDownloads: true,
  viewport: { width: 1440, height: 1000 }
});
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];
page.on('pageerror', error => pageErrors.push(String(error?.stack || error)));
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

async function waitForApp() {
  await page.waitForFunction(() => Array.isArray(window.LEARN_SECTION_BLUEPRINTS) && window.LEARN_SECTION_BLUEPRINTS.length === 30, null, { timeout: 30000 });
  await page.waitForSelector('#learnSections .section[data-section="1"]');
}

async function openSection(id) {
  const stage = Math.floor((id - 1) / 10);
  const stageButton = page.locator(`.section-stage-button[data-stage="${stage}"]`);
  await stageButton.waitFor({ state: 'attached' });
  await page.waitForFunction(stageIndex => {
    const btn = document.querySelector(`.section-stage-button[data-stage="${stageIndex}"]`);
    return btn && !btn.disabled;
  }, stage, { timeout: 15000 });
  await stageButton.click();
  const tab = page.locator(`.section-tab[data-goto="${id}"]`);
  await tab.waitFor({ state: 'visible', timeout: 10000 });
  await tab.click();
  await page.waitForSelector(`.section[data-section="${id}"].active`, { timeout: 5000 });
}

async function setSelectValue(select, value) {
  await select.evaluate((el, nextValue) => {
    el.value = nextValue;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function fillCheckSection(id, makeWrong = false) {
  const section = page.locator(`.section[data-section="${id}"]`);
  let wrongApplied = false;

  const inputs = section.locator('input[data-answer]');
  for (let i = 0; i < await inputs.count(); i += 1) {
    const input = inputs.nth(i);
    const answer = await input.getAttribute('data-answer');
    assert.ok(answer, `Section ${id}: missing input answer`);
    const value = makeWrong && !wrongApplied ? '__WRONG__' : answer;
    if (makeWrong && !wrongApplied) wrongApplied = true;
    await input.fill(value);
  }

  const selects = section.locator('select[data-answer]');
  for (let i = 0; i < await selects.count(); i += 1) {
    const select = selects.nth(i);
    const answer = await select.getAttribute('data-answer');
    assert.ok(answer, `Section ${id}: missing select answer`);
    let value = answer;
    if (makeWrong && !wrongApplied) {
      const options = await select.locator('option').evaluateAll(nodes => nodes.map(node => node.value).filter(Boolean));
      value = options.find(option => option !== answer) || '__WRONG__';
      wrongApplied = true;
    }
    await setSelectValue(select, value);
  }

  const blanks = section.locator('.narrative-blank[data-answer]');
  for (let i = 0; i < await blanks.count(); i += 1) {
    const blank = blanks.nth(i);
    const answer = await blank.getAttribute('data-answer');
    assert.ok(answer, `Section ${id}: missing narrative answer`);
    const value = makeWrong && !wrongApplied ? '__WRONG__' : answer;
    if (makeWrong && !wrongApplied) wrongApplied = true;
    await blank.evaluate((el, nextValue) => {
      el.dataset.value = nextValue;
      el.dataset.filled = 'true';
      el.textContent = nextValue;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }

  const dndTargets = section.locator('.dnd-target[data-answer]');
  const dndAnswers = [];
  for (let i = 0; i < await dndTargets.count(); i += 1) {
    dndAnswers.push(await dndTargets.nth(i).getAttribute('data-answer'));
  }
  for (let i = 0; i < await dndTargets.count(); i += 1) {
    const target = dndTargets.nth(i);
    const answer = dndAnswers[i];
    assert.ok(answer, `Section ${id}: missing DnD answer`);
    let value = answer;
    if (makeWrong && !wrongApplied) {
      value = dndAnswers.find(candidate => candidate && candidate !== answer) || '__WRONG__';
      wrongApplied = true;
    }
    const slot = target.locator('.drop-slot');
    await slot.evaluate((el, nextValue) => {
      el.dataset.value = nextValue;
      el.textContent = nextValue;
      el.dispatchEvent(new Event('drop', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }

  assert.ok(
    (await inputs.count()) + (await selects.count()) + (await blanks.count()) + (await dndTargets.count()) > 0,
    `Section ${id}: no checkable fields found`
  );
  if (makeWrong) assert.ok(wrongApplied, `Section ${id}: deliberate error could not be applied`);

  const check = section.locator(`.check-section[data-check-section="${id}"]`);
  await check.waitFor({ state: 'visible' });
  await check.click();
  await page.waitForTimeout(180);
  return String((await page.locator(`#result-${id}`).textContent()) || '').trim();
}

async function runFastSession(id, makeWrong = false) {
  const section = page.locator(`.section[data-section="${id}"]`);
  const blueprint = await page.evaluate(sectionId => window.LEARN_SECTION_BLUEPRINTS.find(item => Number(item.id) === sectionId), id);
  assert.ok(blueprint?.fastPaced, `Section ${id}: fast-paced blueprint missing`);
  const answerByLabel = new Map(blueprint.fastPaced.combos.map(entry => [String(entry.label), String(entry.combo)]));
  const rounds = Number(blueprint.fastPaced.rounds || 0);
  assert.ok(rounds > 0, `Section ${id}: invalid round count`);

  const start = section.locator('.fast-paced-start');
  await start.waitFor({ state: 'visible' });
  await start.click();

  let errorUsed = false;
  for (let round = 0; round < rounds; round += 1) {
    await page.waitForFunction(sectionId => {
      const root = document.querySelector(`.section[data-section="${sectionId}"]`);
      const prompt = root?.querySelector('.fast-paced-prompt')?.textContent?.trim() || '';
      return root && root.querySelectorAll('.fast-paced-option:not(:disabled)').length > 0 && prompt && !/^Bereit\?|^Ergebnis:/i.test(prompt);
    }, String(id), { timeout: 12000 });

    const prompt = String((await section.locator('.fast-paced-prompt').textContent()) || '').trim();
    const correctCombo = answerByLabel.get(prompt);
    assert.ok(correctCombo, `Section ${id}: no answer mapping for prompt "${prompt}"`);
    const options = section.locator('.fast-paced-option:not(:disabled)');
    let chosen = null;
    for (let i = 0; i < await options.count(); i += 1) {
      const button = options.nth(i);
      const combo = await button.getAttribute('data-combo');
      if (makeWrong && !errorUsed && combo !== correctCombo) {
        chosen = button;
        errorUsed = true;
        break;
      }
      if (!chosen && combo === correctCombo) chosen = button;
    }
    assert.ok(chosen, `Section ${id}: no selectable answer for round ${round + 1}`);
    await chosen.click();
    await page.waitForTimeout(720);
  }

  await page.waitForFunction(sectionId => {
    const text = document.querySelector(`.section[data-section="${sectionId}"] .fast-paced-prompt`)?.textContent?.trim() || '';
    return /^Ergebnis:/i.test(text);
  }, String(id), { timeout: 12000 });
  const result = String((await section.locator('.fast-paced-prompt').textContent()) || '').trim();
  if (makeWrong) assert.ok(errorUsed, `Section ${id}: deliberate fast-paced error not used`);
  return result;
}

async function solveSection(id, deliberateError) {
  await openSection(id);
  const section = page.locator(`.section[data-section="${id}"]`);
  const isFast = (await section.locator('.fast-paced-start').count()) > 0;

  if (isFast) {
    if (deliberateError) {
      const first = await runFastSession(id, true);
      assert.doesNotMatch(first, new RegExp(`Ergebnis:\\s*${(await page.evaluate(sectionId => window.LEARN_SECTION_BLUEPRINTS.find(item => Number(item.id) === sectionId)?.fastPaced?.rounds, id))}\\/`));
      await runFastSession(id, false);
    } else {
      await runFastSession(id, false);
    }
    return;
  }

  if (deliberateError) {
    const wrongResult = await fillCheckSection(id, true);
    assert.ok(!/100%/.test(wrongResult), `Section ${id}: deliberate wrong attempt unexpectedly scored 100%`);
  }
  const correctResult = await fillCheckSection(id, false);
  assert.match(correctResult, /100%/, `Section ${id}: perfect retry did not score 100%: ${correctResult}`);
}

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 45000 });
  await waitForApp();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('shortcutQuest_2026_motion_v1', JSON.stringify({ animations: false }));
  });
  await page.reload({ waitUntil: 'networkidle', timeout: 45000 });
  await waitForApp();

  assert.equal((await page.locator('#a8ProgressBadge').textContent())?.trim(), '0 / 30');

  for (let id = 1; id <= 30; id += 1) {
    const deliberateError = deliberateErrorSections.has(id);
    console.log(`[A8 E2E] Section ${id}/30${deliberateError ? ' (intentional miss first)' : ''}`);
    await solveSection(id, deliberateError);
  }

  const progressText = String((await page.locator('#a8ProgressBadge').textContent()) || '').trim();
  assert.ok(/30\s*\/\s*30|abgeschlossen/i.test(progressText), `Expected 30/30 completion, got: ${progressText}`);

  const stored = await page.evaluate(() => {
    const candidates = ['shortcutRitter_2026_v1', 'shortcutRitter_v1'];
    for (const key of candidates) {
      const raw = localStorage.getItem(key);
      if (raw) return { key, raw };
    }
    return null;
  });
  assert.ok(stored?.raw, 'No Shortcut Quest save found in localStorage');
  const liveState = JSON.parse(stored.raw);
  const reports = liveState.sectionReports || {};
  const reportCount = Object.keys(reports).length;
  assert.ok(reportCount >= 30, `Expected reports for all 30 sections, got ${reportCount}`);
  const missCount = Object.values(reports).reduce((sum, report) => {
    const promptStats = report?.promptStats || {};
    return sum + Object.values(promptStats).reduce((inner, stat) => inner + Number(stat?.misses || 0), 0);
  }, 0);
  assert.ok(missCount >= deliberateErrorSections.size, `Expected at least ${deliberateErrorSections.size} recorded misses, got ${missCount}`);

  await page.locator('.nav-toggle[data-view="report"]').click();
  await page.locator('#reportGenerateBtn').click();
  await page.waitForTimeout(900);
  await page.waitForSelector('#a8PdfReportBtn', { timeout: 10000 });

  const jsonDownloadPromise = page.waitForEvent('download', { timeout: 20000 });
  await page.locator('#reportExportBtn').click();
  const jsonDownload = await jsonDownloadPromise;
  const jsonPath = path.join(outDir, 'A8-E2E-Spielstand.json');
  await jsonDownload.saveAs(jsonPath);

  page.once('dialog', async dialog => {
    assert.equal(dialog.type(), 'prompt');
    await dialog.accept('E2E-Test');
  });
  const pdfDownloadPromise = page.waitForEvent('download', { timeout: 60000 });
  await page.locator('#a8PdfReportBtn').click();
  const pdfDownload = await pdfDownloadPromise;
  const pdfPath = path.join(outDir, 'A8-E2E-Test.pdf');
  await pdfDownload.saveAs(pdfPath);

  const exportedJson = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
  assert.ok(exportedJson && typeof exportedJson === 'object', 'Exported JSON is invalid');
  const pdfMagic = (await fs.readFile(pdfPath)).subarray(0, 5).toString('ascii');
  assert.equal(pdfMagic, '%PDF-', 'Downloaded report is not a PDF');

  const summary = {
    url: baseUrl,
    generatedAt: new Date().toISOString(),
    progress: progressText,
    deliberateErrorSections: [...deliberateErrorSections],
    recordedMisses: missCount,
    sectionReportCount: reportCount,
    saveStorageKey: stored.key,
    pageErrors,
    consoleErrors
  };
  await fs.writeFile(path.join(outDir, 'A8-E2E-Summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));

  assert.deepEqual(pageErrors, [], `Page errors: ${pageErrors.join('\n')}`);
} finally {
  await browser.close();
}
