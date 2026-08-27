from pathlib import Path

old_path=Path('e2e/tk-a1-a6.spec.js')
new_path=Path('e2e/tk-a1-a7.spec.js')
s=old_path.read_text(encoding='utf-8')

s=s.replace("test.describe('TK2 production smoke: A1-A6'", "test.describe('TK2 production smoke: A1-A7'", 1)
s=s.replace('for (let i = 1; i <= 6; i += 1)', 'for (let i = 1; i <= 7; i += 1)', 1)

marker="""async function answerAllCorrect(page, selector) {
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
"""
assert marker in s
helper=marker+"""
async function answerAllCorrectButtons(page, containerSelector) {
  const cards = page.locator(`${containerSelector} .question-card`);
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    const correct = await card.getAttribute('data-correct');
    expect(correct).toBeTruthy();
    await card.getByRole('button', { name: correct, exact: true }).click();
  }
}
"""
s=s.replace(marker,helper,1)
s=s.replace("await answerAllCorrect(page, '#questionsContainer .answer-select');", "await answerAllCorrectButtons(page, '#questionsContainer');", 1)

insert="""

  test('A7: challenge, Fehlerjagd, Memory UI and evidence PDF unlock', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openTk(page, '/tk2/A7.html');

    await expect(page).toHaveTitle(/A7: Tastenkombinationen/);
    await expect(page.locator('[data-view="train"]')).toBeVisible();
    await expect(page.locator('[data-view="hunt"]')).toBeVisible();
    await expect(page.locator('[data-view="memory"]')).toBeVisible();
    await expect(page.locator('[data-view="evidence"]')).toBeVisible();

    // Challenge: correct answer must auto-advance after 2 seconds and keep round label.
    await page.locator('[data-view="train"]').first().click();
    await expect(page.locator('#practiceLabel')).toContainText('1 / 10');
    await page.locator('.quiz-option[data-correct="1"]').click();
    await expect(page.locator('#practiceLabel')).toContainText('2 / 10', { timeout: 6_000 });

    // Fehlerjagd: find the wrong mapping and advance one round.
    await page.locator('[data-view="hunt"]').first().click();
    await expect(page.locator('#huntPromptLabel')).toContainText('1 / 10');
    const huntOptions = page.locator('.hunt-option');
    let caught = false;
    for (let i = 0; i < 4; i += 1) {
      const option = huntOptions.nth(i);
      if (await option.isDisabled()) continue;
      await option.click();
      if (await option.evaluate((el) => el.classList.contains('caught'))) { caught = true; break; }
    }
    expect(caught).toBe(true);
    await expect(page.locator('#huntNext')).toBeVisible();
    await page.locator('#huntNext').click();
    await expect(page.locator('#huntPromptLabel')).toContainText('2 / 10');

    // Memory: cards render, keyboard emoji is gone, first card flips.
    await page.locator('[data-view="memory"]').first().click();
    const memoryCards = page.locator('#memoryBoard .mem-card');
    await expect(memoryCards.first()).toBeVisible();
    expect(await memoryCards.count()).toBeGreaterThanOrEqual(8);
    await expect(page.locator('#memoryBoard')).not.toContainText('⌨️');
    await memoryCards.first().click();
    await expect(memoryCards.first()).toHaveClass(/flipped/);

    // Seed one completed run per station to verify persisted completion + PDF generation.
    await page.evaluate(() => {
      const now = new Date().toISOString();
      localStorage.setItem('tk_a7_training_v1', JSON.stringify({
        schemaVersion: 1,
        modes: {
          challenge: { all: { completedRuns: 1, correct: 10, wrong: 0, lastAccuracy: 100, bestAccuracy: 100, lastAt: now, retries: 0 } },
          hunt: { all: { completedRuns: 1, correct: 10, wrong: 0, lastAccuracy: 100, bestAccuracy: 100, lastAt: now, retries: 0 } },
          memory: { all: { completedRuns: 1, pairs: 4, moves: 4, points: 80, lastEfficiency: 100, bestEfficiency: 100, lastDiff: 'easy', lastElapsed: 1000, lastAt: now } },
        },
      }));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('[data-view="evidence"]').first().click();
    await expect(page.locator('#evidenceStatus')).toHaveText('PDF bereit ✓');
    await expect(page.locator('#downloadEvidencePdf')).toBeEnabled();
    await downloadFrom(page, '#downloadEvidencePdf', 'pdf', '%PDF-');

    const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('tk_a7_progress_v1') || '{}'));
    expect(progress.schemaVersion).toBe(2);
    expect(progress.completed).toBe(true);
    expect(progress.completedStations).toBe(3);
    expect(progress.pdfReady).toBe(true);
    expectNoPageErrors(errors);
  });
"""
assert s.rstrip().endswith('});')
pos=s.rfind('\n});')
assert pos!=-1
s=s[:pos]+insert+s[pos:]

assert "TK2 production smoke: A1-A7" in s
assert "answerAllCorrectButtons" in s
assert "A7: challenge, Fehlerjagd, Memory UI and evidence PDF unlock" in s
assert "#questionsContainer .answer-select" not in s

new_path.write_text(s,encoding='utf-8')
old_path.unlink()

wf=Path('.github/workflows/e2e-smoke-tk.yml')
w=wf.read_text(encoding='utf-8')
w=w.replace('E2E Smoke TK A1-A6','E2E Smoke TK A1-A7')
w=w.replace('e2e-smoke-tk-a1-a6','e2e-smoke-tk-a1-a7')
w=w.replace('Chromium smoke TK A1-A6','Chromium smoke TK A1-A7')
w=w.replace('Run TK A1-A6 production smoke','Run TK A1-A7 production smoke')
w=w.replace('e2e/tk-a1-a6.spec.js','e2e/tk-a1-a7.spec.js')
wf.write_text(w,encoding='utf-8')
print('upgraded permanent TK smoke to A1-A7')
