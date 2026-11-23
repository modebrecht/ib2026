const { test, expect } = require('@playwright/test');

const BASE_URL = (process.env.BASE_URL || 'https://ib2026.vercel.app').replace(/\/$/, '');

async function openGate(page) {
  await page.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded' });
  const hardware = page.locator('#hwKachel');
  if (!(await hardware.evaluate((el) => el.classList.contains('open')))) {
    await hardware.locator('.kachel-header').click();
  }
  await page.locator('#erzweltAccessButton').click();
}

test('Erzwelt entry requires a teacher code and explains A1–A14 review', async ({ page }) => {
  await openGate(page);
  const dialog = page.locator('#erzweltAccessDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('A1–A14 fertigstellen');
  await expect(dialog).toContainText('Bei der Lehrperson vorbeikommen');
  await expect(dialog).toContainText('Abgabeschluss für die Fleissnote: 31.12.2026.');
  await expect(page.locator('#erzweltAccessLaunch')).toBeHidden();
  await page.locator('#erzweltAccessCode').fill('ungültiger code');
  await page.locator('#erzweltAccessForm button[type="submit"]').click();
  await expect(page.locator('#erzweltAccessFeedback')).toContainText('Code nicht erkannt');
  await expect(page.locator('#erzweltAccessLaunch')).toBeHidden();
  expect(await page.evaluate(() => sessionStorage.getItem('ib2026-erzwelt-approved-v1'))).not.toBe('true');
});

test('Correct teacher code enables the existing Erzwelt destination', async ({ page }) => {
  const code = process.env.ERZWELT_TEST_CODE;
  test.skip(!code, 'Pass ERZWELT_TEST_CODE privately to run the positive access test');
  await openGate(page);
  await page.locator('#erzweltAccessCode').fill(code);
  await page.locator('#erzweltAccessForm button[type="submit"]').click();
  const link = page.locator('#erzweltAccessLaunch');
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute('href', 'https://erzwelt.vercel.app/');
  expect(await page.evaluate(() => sessionStorage.getItem('ib2026-erzwelt-approved-v1'))).toBe('true');
});
