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
  for (let i = 0; i < await narrativeCards.count(); i++) {
    await narrativeCards.nth(i).locator('.narrative-option').first().click();
  }
  assert.ok(await page.locator('.narrative-fly').count() > 0, 'shortcut fly animation no longer appears');
  await page.locator('.section-tab[data-goto="2"]').click();
  await page.waitForTimeout(650);
  assert.equal(await page.locator('.narrative-fly').count(), 0, 'section switch leaked narrative-fly nodes');

  await page.locator('.section-tab[data-goto="1"]').click();
  await narrativeCards.first().locator('.narrative-blank').evaluate(blank => {
    blank.textContent = ''; blank.dataset.value = ''; blank.dataset.filled = 'false';
  });
  await narrativeCards.first().locator('.narrative-option').first().click();
  await page.locator('.narrative-fly').evaluateAll(nodes => nodes.forEach(node => node.getAnimations().forEach(animation => animation.pause())));
  await page.waitForTimeout(650);
  assert.equal(await page.locator('.narrative-fly').count(), 0, 'interrupted animation leaked narrative-fly nodes');

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

  assert.equal(consoleErrors.length, 0, `console errors: ${consoleErrors.join('\n')}`);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mobileBad = [];
  mobile.on('response', r => { if (r.status() >= 400) mobileBad.push(`${r.status()} ${r.url()}`); });
  const mobileResponse = await mobile.goto(url, { waitUntil: 'networkidle' });
  assert.ok(mobileResponse?.ok());
  assert.equal(mobileBad.length, 0, `mobile request errors: ${mobileBad.join('\n')}`);
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2), false, 'mobile viewport introduced horizontal overflow');
  await mobile.close();

  console.log('OK: direct-local A8 load, assets, narrative cleanup, training shell, state, inventory, skills, balance, battle, report, desktop and mobile verified');
} finally {
  await browser.close();
}
