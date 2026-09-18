const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'https://ib2026.vercel.app').replace(/\/$/, '');

async function openClean(page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('studentVorname', 'David E2E');
    localStorage.setItem('student_vorname', 'David E2E');
    localStorage.setItem('tk_student_name_v1', 'David E2E');
  });
  await page.goto(`${BASE_URL}/tk2/A7.html`, { waitUntil: 'load' });
}

test('A7 Fleissnote and PDF use the best result per scored station', async ({ page }) => {
  await openClean(page);

  const now = '2026-09-18T09:25:41.975Z';
  await page.evaluate((timestamp) => {
    localStorage.setItem('tk_a7_training_v1', JSON.stringify({
      schemaVersion: 1,
      modes: {
        challenge: {
          all: {
            completedRuns: 2,
            correct: 19,
            wrong: 1,
            lastAccuracy: 100,
            bestAccuracy: 100,
            lastAt: timestamp,
            retries: 1,
          },
        },
        hunt: {
          all: {
            completedRuns: 1,
            correct: 10,
            wrong: 2,
            lastAccuracy: 83,
            bestAccuracy: 83,
            lastAt: timestamp,
            retries: 0,
          },
        },
        memory: {
          all: {
            completedRuns: 2,
            pairs: 8,
            moves: 20,
            points: 124,
            lastEfficiency: 57,
            bestEfficiency: 57,
            lastAt: timestamp,
            lastDiff: 'easy',
            lastElapsed: 15238,
          },
        },
      },
      updatedAt: timestamp,
    }));

    localStorage.setItem('tk_a7_progress_v1', JSON.stringify({
      schemaVersion: 2,
      completed: true,
      completedStations: 3,
      stations: { challenge: 2, hunt: 1, memory: 2 },
      completedRuns: 5,
      accuracy: 91,
      target: 70,
      targetReached: true,
      pdfReady: true,
      updatedAt: timestamp,
    }));
  }, now);

  await page.reload({ waitUntil: 'load' });

  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('tk_a7_progress_v1') || '{}').accuracy)).toBe(92);

  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('tk_a7_progress_v1') || '{}'));
  expect(progress.trainingAccuracy).toBe(91);
  expect(progress.bestAccuracyByMode).toEqual({ challenge: 100, hunt: 83 });
  expect(progress.gradingRule).toBe('best-result-per-station');
  expect(progress.targetReached).toBe(true);

  await page.evaluate(() => {
    window.__a7PdfTexts = [];
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function(text, ...args) {
      window.__a7PdfTexts.push(String(text));
      return originalFillText.call(this, text, ...args);
    };
    window.jspdf = {
      jsPDF: function() {
        return { addImage() {}, save() {} };
      },
    };
  });

  await expect(page.locator('#downloadEvidencePdf')).toBeEnabled();
  await page.locator('#downloadEvidencePdf').click();

  const pdfTexts = await page.evaluate(() => window.__a7PdfTexts || []);
  expect(pdfTexts).toContain('100 %');
  expect(pdfTexts).toContain('83 %');
  expect(pdfTexts).toContain('92 %');
  expect(pdfTexts).toContain('Fleissnoten-Genauigkeit · bestes Resultat je Station');
});
