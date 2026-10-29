const fs = require('fs');
const {test, expect} = require('@playwright/test');
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const STORAGE = 'onedrive_a14_green_it_scenarios_9sek_v1';

async function openClean(page, fast=true) {
  if(fast) {
    await page.addInitScript(() => {
      const nativeSetTimeout = window.setTimeout.bind(window);
      window.setTimeout = (fn, ms, ...args) => nativeSetTimeout(fn, Math.min(Number(ms) || 0, 60), ...args);
    });
  }
  await page.goto(BASE + '/', {waitUntil:'domcontentloaded'});
  await page.evaluate(() => {
    localStorage.clear();sessionStorage.clear();
    localStorage.setItem('studentVorname','QA A14');
    localStorage.setItem('student_vorname','QA A14');
  });
  await page.goto(BASE + '/hw/A14.html', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.__scoreHistoryPage === 'A14');
}
async function readState(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE);
}
async function answerCurrent(page, correct=true) {
  const current = await page.evaluate(() => ({
    index, id:queue[index].id, correct:queue[index].correct,
    choices:Array.from(document.querySelectorAll('.option-btn')).map(b=>b.dataset.id)
  }));
  const selected=correct?current.correct:current.choices.find(x=>x!==current.correct);
  await page.locator('.option-btn[data-id="'+selected+'"]').click();
  return {...current,selected};
}
async function advance(page, oldIndex) {
  await page.waitForFunction(old => index>old || !document.getElementById('result')?.classList.contains('hidden'),oldIndex);
}

test.use({acceptDownloads:true,trace:'retain-on-failure',screenshot:'only-on-failure'});
test.setTimeout(120000);

test('A14 resumes the identical queue and answer count and records a single completed attempt',async({page})=>{
  await openClean(page);
  const initial = await readState(page);
  expect(initial.version).toBe(2);
  expect(initial.queue).toHaveLength(14);
  expect(new Set(initial.queue).size).toBe(14);
  for(const good of [true,false,true]) {
    const selected=await answerCurrent(page,good);
    await advance(page,selected.index);
  }
  const before = await readState(page);
  expect(before).toMatchObject({version:2,index:3,score:2,answered:false,finished:false});
  expect(before.wrongIds).toHaveLength(1);
  const historyBefore=await page.evaluate(()=>window.__getScoreHistory('',14));
  expect(historyBefore.attempts).toBe(0);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__scoreHistoryPage==='A14');
  const after=await readState(page);
  expect(after.queue).toEqual(before.queue);
  expect(after.index).toBe(3);
  expect(after.score).toBe(2);
  expect(after.wrongIds).toEqual(before.wrongIds);
  expect(await page.evaluate(()=>queue[index].id)).toBe(before.queue[3]);
  await expect(page.locator('#pct')).toHaveText('21% bearbeitet');
  await expect(page.locator('#score')).toContainText('2 richtig');
  await expect(page.locator('#pdf')).toHaveAttribute('title','PDF ab 10/14 richtig');

  for(let i=3;i<14;i++){
    const selected=await answerCurrent(page,true);
    await advance(page,selected.index);
  }
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#resultScore')).toHaveText('13/14');
  const completed=await readState(page);
  expect(completed).toMatchObject({version:2,index:14,score:13,answered:false,finished:true,bestScore:13});
  const h=await page.evaluate(()=>window.__getScoreHistory('',14));
  expect([h.firstScore,h.bestScore,h.attempts,h.passedEver]).toEqual([13,13,1,true]);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__scoreHistoryPage==='A14');
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#resultScore')).toHaveText('13/14');
  const h2=await page.evaluate(()=>window.__getScoreHistory('',14));
  expect([h2.firstScore,h2.bestScore,h2.attempts]).toEqual([13,13,1]);
  const [file]=await Promise.all([page.waitForEvent('download'),page.locator('#pdf').click()]);
  const bytes=fs.readFileSync(await file.path());
  expect(bytes.subarray(0,5).toString('ascii')).toBe('%PDF-');
});

test('A14 reload during answer feedback does not double-score or lose the selected answer',async({page})=>{
  await openClean(page,false);
  const first=await answerCurrent(page,false);
  const pending=await readState(page);
  expect(pending).toMatchObject({index:0,score:0,answered:true,selectedChoice:first.selected,finished:false});
  expect(pending.wrongIds).toEqual([first.id]);
  const oldOrder=pending.optionOrder;
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__scoreHistoryPage==='A14');
  const restored=await readState(page);
  expect(restored).toMatchObject({index:0,score:0,answered:true,selectedChoice:first.selected});
  expect(restored.optionOrder).toEqual(oldOrder);
  await expect(page.locator('#answers .option-btn:disabled')).toHaveCount(3);
  await expect(page.locator('.option-btn.wrong')).toHaveAttribute('data-id',first.selected);
  await expect(page.locator('#feedback')).toContainText('Noch nicht ganz');
  await advance(page,0);
  const after=await readState(page);
  expect(after).toMatchObject({index:1,score:0,answered:false,selectedChoice:null,finished:false});
  expect(after.wrongIds).toEqual([first.id]);
  expect((await page.evaluate(()=>window.__getScoreHistory('',14))).attempts).toBe(0);
});

test('A14 migrates best-score-only storage and leaves PDF unlocked',async({page})=>{
  await openClean(page);
  await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({bestScore:10})),STORAGE);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__scoreHistoryPage==='A14');
  const migrated=await readState(page);
  expect(migrated).toMatchObject({version:2,bestScore:10,index:0,score:0,answered:false,finished:false});
  expect(migrated.queue).toHaveLength(14);
  await expect(page.locator('#pdf')).toHaveAttribute('title','PDF frei · Best 10/14');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__scoreHistoryPage==='A14');
  expect((await readState(page)).bestScore).toBe(10);
});

test('A14 rejects a corrupt partial queue but preserves legitimate best score',async({page})=>{
  await openClean(page);
  await page.evaluate(key=>localStorage.setItem(key,JSON.stringify({
    version:2,bestScore:11,queue:['invalid'],index:4,score:3,
    wrongIds:[],answered:false,optionOrder:[],finished:false
  })),STORAGE);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__scoreHistoryPage==='A14');
  const result=await readState(page);
  expect(result).toMatchObject({version:2,bestScore:11,index:0,score:0,finished:false});
  expect(new Set(result.queue).size).toBe(14);
  await expect(page.locator('#pdf')).toHaveAttribute('title','PDF frei · Best 11/14');
});

test('A14 reset clears the active round but retains best score, PDF and completed attempt history',async({page})=>{
  await openClean(page);
  for(let i=0;i<14;i++){
    const selected=await answerCurrent(page,true);
    await advance(page,selected.index);
  }
  await expect(page.locator('#result')).toBeVisible();
  const history=await page.evaluate(()=>window.__getScoreHistory('',14));
  expect([history.bestScore,history.attempts,history.passedEver]).toEqual([14,1,true]);
  await page.evaluate(()=>startRound());
  const choice=await answerCurrent(page,false);
  await advance(page,choice.index);
  expect((await readState(page)).index).toBe(1);
  page.once('dialog',dialog=>dialog.accept());
  await page.evaluate(()=>resetA14());
  const clean=await readState(page);
  expect(clean).toMatchObject({index:0,score:0,answered:false,finished:false,bestScore:14});
  expect(clean.wrongIds).toEqual([]);
  await expect(page.locator('#pdf')).toHaveAttribute('title','PDF frei · Best 14/14');
  const after=await page.evaluate(()=>window.__getScoreHistory('',14));
  expect([after.bestScore,after.attempts,after.passedEver]).toEqual([14,1,true]);
});
