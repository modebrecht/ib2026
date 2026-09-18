import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = process.env.A8_LOCAL_URL || 'http://127.0.0.1:8765/';
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  const badResponses = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('response', response => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  assert.ok(response?.ok(), `local A8 failed to load: ${response?.status()}`);
  assert.equal(badResponses.length, 0, `asset/request errors: ${badResponses.join('\n')}`);

  for (const view of ['learn', 'inventory', 'skills', 'shop', 'battle', 'report']) {
    assert.equal(await page.locator(`.nav-toggle[data-view="${view}"]`).count(), 1, `missing ${view} view`);
  }
  assert.ok(await page.locator('.section').count() >= 10, 'major learning sections did not render');
  assert.ok(await page.locator('.fast-paced').count() > 0, 'fast-paced training missing');

  const narrativeCards = page.locator('.section[data-section="1"] .narrative-card');
  assert.ok(await narrativeCards.count() >= 4, 'narrative cards missing');
  const resetFirstNarrative = async () => {
    await narrativeCards.first().locator('.narrative-blank').evaluate(blank => {
      blank.textContent = ''; blank.dataset.value = ''; blank.dataset.filled = 'false';
    });
  };

  // Normal animation completion.
  for (let i = 0; i < await narrativeCards.count(); i++) {
    await narrativeCards.nth(i).locator('.narrative-option').first().click();
  }
  assert.ok(await page.locator('.narrative-fly').count() > 0, 'shortcut fly animation no longer appears');
  await page.waitForTimeout(650);
  assert.equal(await page.locator('.narrative-fly').count(), 0, 'normally completed narrative flies leaked');

  // Section switching cleanup, then exercise the real fast-paced drill in section 2.
  await resetFirstNarrative();
  await narrativeCards.first().locator('.narrative-option').first().click();
  await page.locator('.section-tab[data-goto="2"]').click();
  await page.waitForTimeout(80);
  assert.equal(await page.locator('.narrative-fly').count(), 0, 'section switch leaked narrative-fly nodes');
  const fastPaced = page.locator('.section[data-section="2"] .fast-paced');
  assert.ok(await fastPaced.isVisible(), 'fast-paced training section failed to open');
  const fastConfig = await page.evaluate(() => {
    const section = window.LEARN_SECTION_BLUEPRINTS?.find(candidate => String(candidate?.id) === '2');
    const config = section?.fastPaced;
    return config ? {
      rounds: Number(config.rounds) || 0,
      combos: config.combos.map(item => ({ label: item.label || item.display, combo: item.combo }))
    } : null;
  });
  assert.ok(fastConfig && fastConfig.rounds > 0 && fastConfig.combos.length >= fastConfig.rounds, 'fast-paced config missing');
  await fastPaced.locator('.fast-paced-start').click();
  let previousPrompt = '';
  for (let round = 0; round < fastConfig.rounds; round += 1) {
    await page.waitForFunction(previous => {
      const root = document.querySelector('.section[data-section="2"] .fast-paced');
      const prompt = root?.querySelector('.fast-paced-prompt')?.textContent?.trim() || '';
      const enabledOptions = root?.querySelectorAll('.fast-paced-option:not([disabled])').length || 0;
      return prompt && prompt !== previous && !prompt.startsWith('Ergebnis:') && enabledOptions > 0;
    }, previousPrompt);
    const prompt = (await fastPaced.locator('.fast-paced-prompt').textContent() || '').trim();
    const expected = fastConfig.combos.find(item => item.label === prompt);
    assert.ok(expected, `no fast-paced answer mapping for prompt: ${prompt}`);
    const answer = fastPaced.locator('.fast-paced-option').filter({ hasText: expected.combo });
    assert.equal(await answer.count(), 1, `expected exactly one fast-paced option for ${expected.combo}`);
    await answer.click();
    previousPrompt = prompt;
  }
  await page.waitForFunction(rounds => {
    const prompt = document.querySelector('.section[data-section="2"] .fast-paced .fast-paced-prompt')?.textContent?.trim();
    return prompt === `Ergebnis: ${rounds}/${rounds}`;
  }, fastConfig.rounds);
  assert.equal((await fastPaced.locator('.fast-paced-prompt').textContent() || '').trim(), `Ergebnis: ${fastConfig.rounds}/${fastConfig.rounds}`);

  // Interrupted/paused animation cleanup.
  await page.locator('.section-tab[data-goto="1"]').click();
  await resetFirstNarrative();
  await narrativeCards.first().locator('.narrative-option').first().click();
  await page.locator('.narrative-fly').evaluateAll(nodes => nodes.forEach(node => node.getAnimations().forEach(animation => animation.pause())));
  await page.waitForTimeout(650);
  assert.equal(await page.locator('.narrative-fly').count(), 0, 'interrupted animation leaked narrative-fly nodes');

  // Repeated rapid interactions cannot accumulate stale DOM pills.
  for (let repeat = 0; repeat < 6; repeat++) {
    await resetFirstNarrative();
    await narrativeCards.first().locator('.narrative-option').first().click();
    await page.waitForTimeout(60);
  }
  assert.ok(await page.locator('.narrative-fly').count() > 0, 'repeated shortcut fly animation stopped rendering');
  await page.waitForTimeout(650);
  assert.equal(await page.locator('.narrative-fly').count(), 0, 'repeated narrative interactions accumulated stale fly nodes');

  const balance = await page.evaluate(() => ({
    installed: window.SHORTCUT_QUEST_BATTLE_BALANCE?.installed,
    multiplier: window.SHORTCUT_QUEST_BATTLE_BALANCE?.heroAutoAttackMultiplier,
    cooldown: window.SHORTCUT_QUEST_BATTLE_BALANCE?.cooldownTurns,
    cap: window.SHORTCUT_QUEST_BATTLE_BALANCE?.shortcutCoinCap,
    powers: ['sturm_hieb','schutzwall','kampfrausch','lichtbrunnen'].map(key => window.SHORTCUT_QUEST_BATTLE_BALANCE?.getSkillBasePower(key, 1))
  }));
  assert.deepEqual(balance, { installed: true, multiplier: 0.45, cooldown: 4, cap: 4, powers: [12, 7, 4, 18] });

  await page.evaluate(() => {
    const now = Date.now();
    const item = (key, name, icon, slot, category, atk=0, def=0, hp=0) => ({ id:`${key}-${now}`, key,name,icon,slot,category,theme:'knight',description:'',baseAtk:atk,baseDef:def,baseHp:hp,atk,def,hp,tier:1,totalCopies:1,createdAt:now,lastObtainedAt:now });
    const sectionClears = {}; for (let i=1;i<=30;i++) sectionClears[String(i)] = 1;
    const skills = SKILL_POOL.map(skill => ({ ...skill, tier:1, totalCopies:1, overcapBonusPercent:0 }));
    localStorage.setItem('shortcutRitter_v1', JSON.stringify({
      sectionClears, battleClears:{'1':true,'2':true,'3':true,'4':true}, battleUnlocked:5, coins:40, skills,
      items:[
        item('feuer_klinge','Feuerklinge','sword_fire','weapon','weapon',4),
        item('stahl_sword','Stahlklinge','sword_steel','weapon','weapon',3),
        item('taktik_helm','Taktikhelm','helm','helm','armor',1,1),
        item('panzerhandschuhe','Panzerhandschuhe','panzerhandschuhe','gloves','armor',0,1),
        item('runen_amulet','Runen-Amulett','talisman','necklace','accessory'),
        item('stahl_stiefel','Stahl-Stiefel','stahl-stiefel','boots','armor',0,2),
        item('lebens_ring','Lebensring','lebensring','ring_left','accessory',0,0,20),
        item('gluecks_ring','Glücksring','gluecksring','ring_right','accessory')
      ], equipment:{}
    }));
  });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.evaluate(() => state.skills?.length || 0), 4, 'localStorage/state compatibility broke');

  await page.locator('.nav-toggle[data-view="inventory"]').click();
  await page.waitForTimeout(200);
  assert.equal(await page.locator('#autoEquipBtn').textContent(), 'Alles anziehen');
  await page.locator('#autoEquipBtn').click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('#inventoryView [data-equip-slot]')).length === 8 && Array.from(document.querySelectorAll('#inventoryView [data-equip-slot]')).every(slot => slot.classList.contains('equipped')));

  await page.locator('.nav-toggle[data-view="skills"]').click();
  await page.waitForTimeout(150);
  assert.ok(await page.locator('#skillsView').isVisible(), 'skill system view failed');

  await page.locator('.nav-toggle[data-view="battle"]').click();
  await page.waitForFunction(() => document.getElementById('battleStagePreview')?.classList.contains('arena-svg-composed'));
  await page.locator('#battleButtons .battle-btn[data-enemy="5"]').click();
  await page.waitForFunction(() => document.querySelector('.a8-preview-enemy-item')?.getAttribute('title') === 'Steinschild');
  await page.locator('#battleStartBtn').click();
  await page.waitForFunction(() => window.SHORTCUT_QUEST_BATTLE_ENGINE_V2?.phase === 'fighting');
  assert.ok(await page.locator('#battleArena').isVisible(), 'battle arena failed');

  await page.locator('.nav-toggle[data-view="report"]').click();
  await page.waitForTimeout(150);
  assert.ok(await page.locator('#reportView').isVisible(), 'report view failed');
  assert.equal(await page.evaluate(() => typeof window.jspdf !== 'undefined' || typeof window.jsPDF !== 'undefined' || document.querySelector('script[src="pdf-report.js"]') !== null), true, 'PDF/report integration missing');
  const pdfButton = page.locator('#a8PdfReportBtn');
  await pdfButton.waitFor({ state: 'visible' });
  page.once('dialog', dialog => dialog.accept('David'));
  const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
  await pdfButton.click();
  const pdfDownload = await downloadPromise;
  assert.equal(pdfDownload.suggestedFilename(), 'A8-David.pdf', 'PDF download filename contract changed');

  assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join('\n')}`);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobileBad = [];
  mobile.on('response', r => { if (r.status() >= 400) mobileBad.push(`${r.status()} ${r.url()}`); });
  const mobileResponse = await mobile.goto(url, { waitUntil: 'networkidle' });
  assert.ok(mobileResponse?.ok());
  assert.equal(mobileBad.length, 0, `mobile request errors: ${mobileBad.join('\n')}`);
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2), false, 'mobile viewport introduced horizontal overflow');
  await mobile.close();

  console.log('OK: A8 load, assets, narrative lifecycle, complete fast-paced run, state, inventory, skills, balance, battle, real PDF download filename, desktop and mobile verified');
} finally {
  await browser.close();
}
