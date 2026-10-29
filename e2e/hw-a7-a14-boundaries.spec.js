const { test, expect } = require('@playwright/test');

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

async function open(page, code) {
  await page.goto(BASE + '/', {waitUntil:'domcontentloaded'});
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('studentVorname','QA Grenze');
    localStorage.setItem('student_vorname','QA Grenze');
  });
  await page.goto(BASE + '/hw/' + code + '.html', {waitUntil:'domcontentloaded'});
  if (['A8','A9','A10','A11','A12','A14'].includes(code))
    await page.waitForFunction(c => window.__scoreHistoryPage === c, code);
  await page.evaluate(() => {
    const original = window.setTimeout.bind(window);
    window.setTimeout = (fn, ms, ...args) => original(fn, Math.min(Number(ms) || 0, 35), ...args);
  });
}
function other(correct, categories) { return categories.find(x => x !== correct); }

async function roundCategories(page, code, wrong) {
  const is8=code==='A8', is9=code==='A9', is10=code==='A10';
  const total=await page.evaluate(c=>c==='A8'?ITEMS.length:SCENES.length, code);
  for(let i=0;i<total;i++){
    const cat=await page.evaluate(()=>current().cat);
    const choice=i<wrong?other(cat,is10?['ram','hdd','ssd']:['eingabe','verarbeitung','ausgabe']):cat;
    const selector=is10?'.storage-btn':'.eva-btn';
    await page.locator(selector+'[data-cat="'+choice+'"]').click();
    await page.waitForFunction(prev => index>prev || !!document.getElementById('result') && !document.getElementById('result').classList.contains('hidden'),i,{timeout:5000});
  }
  await expect(page.locator('#result')).toBeVisible();
  return total-wrong;
}

async function a11Round(page, wrong) {
  for(let i=0;i<5;i++){
    await page.locator('#dialogueNext').click({force:true});
    const correct=await page.evaluate(()=>CASES[index].correct);
    const ids=await page.locator('.device-card').evaluateAll(es=>es.map(e=>e.dataset.id));
    const id=i<wrong?ids.find(v=>v!==correct):correct;
    await page.locator('.device-card[data-id="'+id+'"]').click();
    await page.locator('#nextBtn').click();
    await page.waitForFunction(prev=>index>prev || !document.getElementById('result')?.classList.contains('hidden'),i,{timeout:5000});
  }
  await expect(page.locator('#result')).toBeVisible();
  return 5-wrong;
}

async function a14Round(page,wrong){
  const total=await page.evaluate(()=>SCENES.length);
  for(let i=0;i<total;i++){
    const correct=await page.evaluate(()=>queue[index].correct);
    const choices=await page.locator('.option-btn').evaluateAll(es=>es.map(e=>e.dataset.id));
    const selected=i<wrong?choices.find(x=>x!==correct):correct;
    await page.locator('.option-btn[data-id="'+selected+'"]').click();
    await page.waitForFunction(prev=>index>prev || !document.getElementById('result')?.classList.contains('hidden'),i,{timeout:5000});
  }
  await expect(page.locator('#result')).toBeVisible();
  return total-wrong;
}

async function assertPdfGate(page, unlocked, required) {
  const pdf=page.locator('#pdf');
  await expect(pdf).toHaveAttribute('title',unlocked?/PDF frei|PDF freigeschaltet/:new RegExp('PDF.*'+required));
  if(!unlocked){
    const dialog=page.waitForEvent('dialog');
    await pdf.click();
    const opened=await dialog;
    expect(opened.message()).toMatch(/PDF|richtig|Bestwert/i);
    await opened.dismiss();
  }
}

test.use({acceptDownloads:true});
test.setTimeout(120000);

for(const t of [
  {code:'A8',total:15,pass:12,run:roundCategories,reset:'startFullRound()'},
  {code:'A9',total:12,pass:8,run:roundCategories,reset:'startRound()'},
  {code:'A10',total:10,pass:7,run:roundCategories,reset:'startRound()'}
]){
  test(t.code+' PDF boundary '+(t.pass-1)+'/'+t.total+' locked, '+t.pass+'/'+t.total+' unlocked', async({page})=>{
    await open(page,t.code);
    expect(await t.run(page,t.code,t.total-t.pass+1)).toBe(t.pass-1);
    await assertPdfGate(page,false,t.pass+'/'+t.total);
    const prior=await page.evaluate(total=>window.__getScoreHistory('',total),t.total);
    expect(prior.passedEver).toBe(false);
    await page.evaluate(c=>{if(c==='A8')startFullRound();else startRound();},t.code);
    expect(await t.run(page,t.code,t.total-t.pass)).toBe(t.pass);
    await assertPdfGate(page,true,t.pass+'/'+t.total);
    const after=await page.evaluate(total=>window.__getScoreHistory('',total),t.total);
    expect(after.firstScore).toBe(t.pass-1);
    expect(after.secondScore).toBe(t.pass);
    expect(after.passedEver).toBe(true);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(c=>window.__scoreHistoryPage===c,t.code);
    await assertPdfGate(page,true,t.pass+'/'+t.total);
  });
}

test('A11 PDF boundary 2/5 locked, 3/5 unlocked and history preserved',async({page})=>{
  await open(page,'A11');
  expect(await a11Round(page,3)).toBe(2);
  await assertPdfGate(page,false,'3/5');
  await page.evaluate(()=>startOver());
  expect(await a11Round(page,2)).toBe(3);
  await assertPdfGate(page,true,'3/5');
  const h=await page.evaluate(()=>window.__getScoreHistory('',5));
  expect([h.firstScore,h.secondScore,h.bestScore,h.passedEver]).toEqual([2,3,3,true]);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__scoreHistoryPage==='A11');
  await assertPdfGate(page,true,'3/5');
});

test('A14 PDF boundary 9/14 locked, 10/14 unlocked and history preserved',async({page})=>{
  await open(page,'A14');
  expect(await a14Round(page,5)).toBe(9);
  await assertPdfGate(page,false,'10/14');
  await page.evaluate(()=>startRound());
  expect(await a14Round(page,4)).toBe(10);
  await assertPdfGate(page,true,'10/14');
  const h=await page.evaluate(()=>window.__getScoreHistory('',14));
  expect([h.firstScore,h.secondScore,h.bestScore,h.passedEver]).toEqual([9,10,10,true]);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__scoreHistoryPage==='A14');
  await assertPdfGate(page,true,'10/14');
});

test('A13 PDF is blocked before all three tasks are finished',async({page})=>{
  await open(page,'A13');
  await expect(page.locator('#pdf')).not.toHaveAttribute('data-unlocked','1');
  const dialog=page.waitForEvent('dialog');
  await page.locator('#pdf').click();
  expect((await dialog).message()).toMatch(/drei Aufträge/);
  await (await dialog).dismiss();
});
