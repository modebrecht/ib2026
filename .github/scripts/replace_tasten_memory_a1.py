from pathlib import Path
import re

p = Path('tk2/tasten.html')
text = p.read_text(encoding='utf-8')

# Replace the custom Shortcut-Lab memory styling with the HW A1 memory styling.
css_start = text.index('.memory-toolbar{')
css_end = text.index('.fav-grid{', css_start)
a1_css = r'''.memory-toolbar{display:flex;flex-direction:column;gap:10px;margin-bottom:12px;padding:12px;background:var(--panel);border:1px solid var(--line);border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.memory-controls-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.memory-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.memory-category{height:38px;padding:0 10px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);color:var(--text);font-weight:700}.memory-diffs{display:flex;gap:4px;padding:4px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;box-shadow:inset 0 1px 2px rgba(0,0,0,.04)}.memory-diff{border:0;background:transparent;color:var(--muted);padding:7px 11px;border-radius:9px;font-weight:800;font-size:.83rem;cursor:pointer;white-space:nowrap;transition:.2s}.memory-diff:hover{background:color-mix(in srgb,var(--line) 45%,transparent);color:var(--text)}.memory-diff.active{background:#0078d4;color:#fff;box-shadow:0 4px 12px rgba(2,132,199,.3);animation:a1Pulse 1.8s ease-in-out infinite}.memory-new{border:0;border-radius:11px;background:#0078d4;color:white;padding:9px 13px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(2,132,199,.3);transition:.2s}.memory-new:hover{transform:translateY(-2px);background:#106ebe}.memory-stats{display:grid;grid-template-columns:repeat(4,minmax(72px,1fr));gap:8px;flex:1;max-width:520px}.memory-stat{padding:8px;border-radius:12px;background:var(--panel2);border:1px solid var(--line);text-align:center}.memory-stat small{display:block;font-size:.58rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}.memory-stat strong{display:block;margin-top:2px;font-size:1rem;font-weight:950}.memory-stat.points strong{color:#0078d4}.memory-stat.hits strong{color:#10b981}.memory-stat.time strong{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.memory-note{font-size:.78rem;color:var(--muted);display:none}
:root{--card-min:160px;--card-text:15px}
@keyframes flyInCard{0%{opacity:0;transform:translateY(60px) scale(.8) rotateX(-20deg)}100%{opacity:1;transform:translateY(0) scale(1) rotateX(0)}}.card-fly-in{animation:flyInCard .6s cubic-bezier(.34,1.56,.64,1) backwards}
.mem-board{display:grid;gap:8px;width:100%;transition:all .3s cubic-bezier(.4,0,.2,1);padding:2px 0 18px}.mem-card{width:100%;aspect-ratio:4/5;perspective:1000px;transform-style:preserve-3d;position:relative;cursor:pointer;user-select:none;box-sizing:border-box;transition:transform .25s ease;background:transparent;border:0;padding:0;-webkit-tap-highlight-color:transparent}.mem-card:hover{transform:scale(1.02)}.mem-card:active{transform:scale(.985)}.mem-face{position:absolute;inset:0;width:100%;height:100%;border-radius:1.25rem;border:2px solid rgba(226,232,240,.9);box-sizing:border-box!important;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important;transform-style:preserve-3d;box-shadow:0 6px 20px rgba(0,0,0,.07);transition:transform .45s cubic-bezier(.34,1.56,.64,1),border-color .2s ease,box-shadow .2s ease}.mem-term-emoji{font-size:calc(var(--card-text,15px)*2.6);line-height:1;margin-bottom:.35rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.1))}.mem-term-label{font-size:calc(var(--card-text,15px)*1.15);font-weight:900;line-height:1.25;text-align:center}.mem-desc-text{font-size:var(--card-text,15px);font-weight:700;line-height:1.35;text-align:center;padding:0 6px}.mem-desc-text .keys{justify-content:center;margin:0}.mem-desc-text kbd{font-size:calc(var(--card-text,15px)*.78);padding:.55em .65em}.mem-front{background:linear-gradient(180deg,#fff 0%,#f8fafc 100%);color:#0f172a;transform:rotateY(180deg)}html[data-theme="dark"] .mem-front{background:linear-gradient(180deg,#334155 0%,#1e293b 100%);color:#f8fafc}html[data-theme="dark"] .mem-face{border-color:rgba(51,65,85,.8)}.mem-back{background-image:url("data:image/svg+xml,%3Csvg width='18' height='18' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 9 0 L 18 9 L 9 18 L 0 9 Z' fill='none' stroke='rgba(251,191,36,0.18)' stroke-width='1.2'/%3E%3Ccircle cx='9' cy='9' r='1.8' fill='rgba(251,191,36,0.24)'/%3E%3C/svg%3E"),radial-gradient(ellipse at center,#1e1b4b 0%,#090d16 100%);color:#fff;font-weight:700;border:2px solid #f59e0b!important;box-shadow:inset 0 0 0 1px rgba(251,191,36,.4),inset 0 0 24px rgba(245,158,11,.3),0 8px 25px rgba(0,0,0,.4);transform:rotateY(0)}html[data-theme="dark"] .mem-back{background-image:url("data:image/svg+xml,%3Csvg width='18' height='18' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 9 0 L 18 9 L 9 18 L 0 9 Z' fill='none' stroke='rgba(251,191,36,0.18)' stroke-width='1.2'/%3E%3Ccircle cx='9' cy='9' r='1.8' fill='rgba(251,191,36,0.24)'/%3E%3C/svg%3E"),radial-gradient(ellipse at center,#172554 0%,#020617 100%);border:2px solid #f59e0b!important;box-shadow:inset 0 0 0 1px rgba(251,191,36,.5),inset 0 0 28px rgba(245,158,11,.35),0 8px 30px rgba(0,0,0,.6)}.mem-card.flipped .mem-front{transform:rotateY(0);z-index:2}.mem-card.flipped .mem-back{transform:rotateY(180deg);z-index:1}.mem-card.matched .mem-front{border:2px solid #10b981!important;box-shadow:0 0 0 2px #10b981,0 10px 25px rgba(16,185,129,.4)!important;background:linear-gradient(180deg,#ecfdf5 0%,#d1fae5 100%)!important}html[data-theme="dark"] .mem-card.matched .mem-front{background:linear-gradient(180deg,#047857 0%,#064e3b 100%)!important;color:#ecfdf5!important}.mem-card.shake{animation:memShake .4s linear}.mem-card.shake .mem-front{border:2px solid #ef4444!important;box-shadow:0 0 0 2px #ef4444,0 10px 25px rgba(239,68,68,.4)!important;background:linear-gradient(180deg,#fef2f2 0%,#fee2e2 100%)!important;color:#7f1d1d!important}html[data-theme="dark"] .mem-card.shake .mem-front{background:linear-gradient(180deg,#991b1b 0%,#7f1d1d 100%)!important;color:#fef2f2!important}@keyframes memShake{20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}@keyframes a1Pulse{50%{filter:brightness(1.08);box-shadow:0 4px 16px rgba(2,132,199,.42)}}
.memory-modal{position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);z-index:80;display:flex;align-items:center;justify-content:center;padding:16px}.memory-modal[hidden]{display:none}.memory-dialog{width:min(500px,100%);background:var(--panel);border:1px solid var(--line);border-radius:18px;box-shadow:0 25px 65px rgba(0,0,0,.28);padding:24px;text-align:center}.memory-trophy{width:56px;height:56px;border-radius:16px;background:#d1fae5;color:#059669;display:grid;place-items:center;font-size:1.8rem;margin:0 auto 12px}.memory-dialog h3{font-size:1.3rem;margin:0 0 10px}.memory-summary{font-size:.82rem;color:var(--muted);line-height:1.55;background:var(--panel2);padding:13px;border:1px solid var(--line);border-radius:12px}.memory-stars{font-size:1.6rem;color:#f59e0b;letter-spacing:.14em;margin:12px 0}.memory-dialog-actions{display:flex;justify-content:center;gap:8px}.memory-dialog-actions button{border:0;border-radius:10px;padding:9px 13px;font-weight:800;cursor:pointer}.memory-again{background:var(--panel2);color:var(--text);border:1px solid var(--line)!important}
@media(max-width:760px){.memory-controls-row{align-items:stretch}.memory-actions{width:100%}.memory-category{flex:1;min-width:0}.memory-diffs{width:100%;overflow-x:auto}.memory-diff{flex:1}.memory-stats{width:100%;max-width:none;grid-template-columns:repeat(4,1fr)}.memory-stat{padding:7px 4px}.mem-board{gap:6px}}@media(prefers-reduced-motion:reduce){.card-fly-in,.memory-diff.active{animation:none!important}.mem-face,.mem-card{transition:none!important}}
'''
text = text[:css_start] + a1_css + text[css_end:]

html_pattern = re.compile(r'<section class="view" id="view-memory">.*?</section>', re.S)
html_replacement = '''<section class="view" id="view-memory">
        <div class="view-inner">
          <div class="view-head"><div><span class="eyebrow">Zuordnen</span><h1>Memory</h1><p>Begriff und Tastenkombination als Paar finden.</p></div><span class="count-pill" id="memoryBest">Best: –</span></div>
          <div class="memory-toolbar">
            <div class="memory-controls-row">
              <div class="memory-actions">
                <select class="memory-category" id="memoryCategory" aria-label="Kategorie"></select>
                <div class="memory-diffs" id="memoryDiffs">
                  <button class="memory-diff active" data-memory-diff="easy">Einfach</button>
                  <button class="memory-diff" data-memory-diff="medium">Mittel</button>
                  <button class="memory-diff" data-memory-diff="hard">Schwer</button>
                  <button class="memory-diff" data-memory-diff="ultra">Ultra</button>
                </div>
                <button class="memory-new" id="memoryRestart">↻ <span>Neues Spiel</span></button>
              </div>
              <div class="memory-stats">
                <div class="memory-stat points"><small>Punkte</small><strong id="memoryPoints">0</strong></div>
                <div class="memory-stat"><small>Züge</small><strong id="memoryMoves">0</strong></div>
                <div class="memory-stat hits"><small>Treffer</small><strong id="memoryHits">0</strong></div>
                <div class="memory-stat time"><small>Zeit</small><strong id="memoryTime">00:00</strong></div>
              </div>
            </div>
            <div class="memory-note" id="memoryMessage"></div>
          </div>
          <section class="mem-board" id="memoryBoard" aria-live="polite"></section>
        </div>
        <div class="memory-modal" id="memoryModal" hidden role="dialog" aria-modal="true">
          <div class="memory-dialog">
            <div class="memory-trophy">🏆</div>
            <h3>Runde geschafft! 🎉</h3>
            <div class="memory-summary" id="memorySummary"></div>
            <div class="memory-stars" id="memoryStars"></div>
            <div class="memory-dialog-actions"><button class="memory-again" id="memoryAgain">Nochmal</button></div>
          </div>
        </div>
      </section>'''
text, n = html_pattern.subn(lambda _: html_replacement, text, count=1)
if n != 1:
    raise SystemExit('memory HTML replace failed')

js_pattern = re.compile(r'const memory=\{.*?function applyPrefs\(\)\{', re.S)
js = r'''const MEMORY_DIFFS={easy:{label:'Einfach',pairs:4,max:80,exp:.30},medium:{label:'Mittel',pairs:8,max:120,exp:.45},hard:{label:'Schwer',pairs:10,max:140,exp:.55},ultra:{label:'Ultra',pairs:12,max:160,exp:.65}};
const memory={cards:[],first:null,lock:false,moves:0,hits:0,points:0,start:null,timer:null,diff:'easy',pairCount:4};
function haptic(pattern){try{if(navigator.vibrate)navigator.vibrate(pattern)}catch(_){}}
function shuffleArray(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function formatMemoryTime(ms){const s=Math.floor(ms/1000),m=Math.floor(s/60),r=s%60;return `${m<10?'0'+m:m}:${r<10?'0'+r:r}`}
function fillMemoryCategories(){const s=$('#memoryCategory');s.innerHTML='<option value="all">Alle Kategorien</option>'+Object.entries(categories).map(([id,c])=>`<option value="${id}">${c.label}</option>`).join('')}
function memoryPool(){const cat=$('#memoryCategory').value;return shortcuts.filter(s=>cat==='all'||s.cat===cat)}
function memoryBestKey(){return `ib-shortcut-memory-a1-${$('#memoryCategory').value}-${memory.diff}`}
function updateMemoryBest(){const b=read(memoryBestKey(),null);$('#memoryBest').textContent=b?`Best: ${b.points} Pkt. · ${b.moves} Züge`:'Best: –'}
function updateMemoryDiffButtons(){$$('[data-memory-diff]').forEach(b=>b.classList.toggle('active',b.dataset.memoryDiff===memory.diff))}
function setMemoryDifficulty(diff){memory.diff=MEMORY_DIFFS[diff]?diff:'easy';updateMemoryDiffButtons();initMemory()}
function updateMemoryDimensions(){const board=$('#memoryBoard'),count=memory.cards.length;if(!board||!count)return;const boardWidth=board.clientWidth||window.innerWidth-48;const reserved=window.innerWidth<768?300:230;const availHeight=Math.max(300,window.innerHeight-reserved);const gap=boardWidth<480?6:10;let valid=[4];if(count===8)valid=[2,4];if(count===16)valid=[4,8];if(count===20)valid=[4,5,10];if(count===24)valid=[4,6,8];let bestCols=4,bestFit=0,bestScore=0;for(const cols of valid){const rows=count/cols,maxW=(boardWidth-gap*(cols-1))/cols,maxH=(availHeight-gap*(rows-1))/rows;let fit,score;if(window.innerWidth>=768){fit=Math.min(maxW,220);fit=Math.min(fit,(maxH*1.5)/1.25);score=fit*cols}else{fit=Math.min(maxW,maxH/1.25);score=fit}if(score>bestScore){bestScore=score;bestFit=fit;bestCols=cols}}const absolute=(boardWidth-gap*(bestCols-1))/bestCols,minW=window.innerWidth<768?75:120;bestFit=Math.min(Math.max(minW,bestFit),absolute);const h=bestFit*1.25;board.style.gridTemplateColumns=`repeat(${bestCols},${Math.floor(bestFit)}px)`;board.style.justifyContent='center';board.style.gap=`${gap}px`;const font=Math.max(12,Math.min(28,Math.round(bestFit*.115)));document.documentElement.style.setProperty('--card-text',`${font}px`);$$('.mem-card',board).forEach(c=>{c.style.width=`${Math.floor(bestFit)}px`;c.style.height=`${Math.floor(h)}px`})}
function crownSvg(){return `<div style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;pointer-events:none"><svg viewBox="0 0 100 100" style="width:58%;height:58%;filter:drop-shadow(0 4px 12px rgba(245,158,11,.8))" aria-hidden="true"><defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FEF08A"/><stop offset="50%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#B45309"/></linearGradient></defs><path d="M 50 12 C 34 26 14 20 6 36 C 16 38 28 45 38 50 C 44 42 56 42 62 50 C 72 45 84 38 94 36 C 86 20 66 26 50 12 Z" fill="url(#goldGrad)"/><circle cx="6" cy="36" r="4.5" fill="#FEF08A"/><circle cx="50" cy="12" r="4.5" fill="#FEF08A"/><circle cx="94" cy="36" r="4.5" fill="#FEF08A"/><path d="M 28 54 Q 50 48 72 54 Q 66 84 50 92 Q 34 84 28 54 Z" fill="url(#goldGrad)" opacity=".95"/><path d="M 38 64 Q 44 60 47 64" stroke="#451A03" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 53 64 Q 56 60 62 64" stroke="#451A03" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M 40 76 Q 50 84 60 76" stroke="#451A03" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg></div>`}
function recomputeMemoryPoints(){const p=MEMORY_DIFFS[memory.diff],eff=memory.moves?memory.hits/memory.moves:0;memory.points=Math.max(0,Math.round(p.max*Math.pow(eff,p.exp)));$('#memoryPoints').textContent=memory.points}
function setMemoryStats(){$('#memoryMoves').textContent=memory.moves;$('#memoryHits').textContent=memory.hits;$('#memoryPoints').textContent=memory.points}
function startMemoryTimer(){if(memory.timer)return;memory.start=performance.now();memory.timer=setInterval(()=>{$('#memoryTime').textContent=formatMemoryTime(performance.now()-memory.start)},250)}
function stopMemoryTimer(){if(memory.timer){clearInterval(memory.timer);memory.timer=null}}
function initMemory(){stopMemoryTimer();Object.assign(memory,{cards:[],first:null,lock:false,moves:0,hits:0,points:0,start:null,timer:null});$('#memoryTime').textContent='00:00';$('#memoryModal').hidden=true;const pool=memoryPool();let requested=MEMORY_DIFFS[memory.diff].pairs,pairs=Math.min(requested,pool.length);memory.pairCount=pairs;const note=$('#memoryMessage');if(pairs<requested){note.style.display='block';note.textContent=`Diese Kategorie enthält ${pool.length} Kürzel – gespielt wird mit allen.`}else{note.style.display='none';note.textContent=''}const selected=shuffleArray(pool.slice()).slice(0,pairs),deck=[];selected.forEach(s=>{deck.push({pairId:s.id,kind:'term',emoji:'⌨️',term:s.title});deck.push({pairId:s.id,kind:'desc',shortcut:s})});memory.cards=shuffleArray(deck);setMemoryStats();const board=$('#memoryBoard');board.innerHTML='';memory.cards.forEach((c,i)=>{const el=document.createElement('button');el.type='button';el.className='mem-card card-fly-in';el.style.animationDelay=`${i*.04}s`;el.dataset.index=i;const front=document.createElement('div');front.className='mem-face mem-front';if(c.kind==='term'){front.innerHTML=`<div class="mem-term-emoji">${c.emoji}</div><div class="mem-term-label">${escapeHtml(c.term)}</div>`}else{front.innerHTML=`<div class="mem-desc-text"><div class="keys">${keyMarkup(c.shortcut)}</div></div>`}const back=document.createElement('div');back.className='mem-face mem-back';back.innerHTML=crownSvg();el.append(front,back);el.onclick=onMemoryFlip;board.appendChild(el)});requestAnimationFrame(updateMemoryDimensions);setTimeout(()=>$$('.card-fly-in',board).forEach(c=>{c.classList.remove('card-fly-in');c.style.animationDelay=''}),2500);updateMemoryBest()}
function onMemoryFlip(e){if(memory.lock)return;const btn=e.currentTarget,idx=Number(btn.dataset.index),model=memory.cards[idx];if(btn.classList.contains('flipped')||btn.classList.contains('matched'))return;if(!memory.start)startMemoryTimer();haptic(8);btn.classList.add('flipped');if(!memory.first){memory.first={idx,model,btn};return}const a=memory.first,b={idx,model,btn};memory.moves++;const match=a.model.pairId===b.model.pairId&&a.idx!==b.idx&&a.model.kind!==b.model.kind;if(match){a.btn.classList.add('matched');b.btn.classList.add('matched');memory.hits++;recomputeMemoryPoints();setMemoryStats();haptic([18,30,24]);memory.first=null;if(memory.hits===memory.pairCount){stopMemoryTimer();setTimeout(showMemorySummary,350)}}else{memory.lock=true;a.btn.classList.add('shake');b.btn.classList.add('shake');haptic([25,35,25]);setTimeout(()=>{a.btn.classList.remove('flipped','shake');b.btn.classList.remove('flipped','shake');memory.first=null;memory.lock=false},1800)}}
function showMemorySummary(){const elapsed=memory.start?performance.now()-memory.start:0,ratio=memory.moves/Math.max(1,memory.pairCount);let stars=1;if(ratio<=3)stars=2;if(ratio<=2&&elapsed<=180000)stars=3;const starStr='★'.repeat(stars)+'☆'.repeat(3-stars),current={points:memory.points,time:elapsed,moves:memory.moves,hits:memory.hits,date:new Date().toISOString()},old=read(memoryBestKey(),null),better=!old||current.points>old.points||(current.points===old.points&&current.time<old.time);if(better)localStorage.setItem(memoryBestKey(),JSON.stringify(current));updateMemoryBest();$('#memorySummary').textContent=`Modus: ${MEMORY_DIFFS[memory.diff].label} · Zeit: ${formatMemoryTime(elapsed)} · Züge: ${memory.moves} · Treffer: ${memory.hits} · Punkte: ${memory.points}${better?' · Neuer Rekord!':''}`;$('#memoryStars').textContent=starStr;$('#memoryModal').hidden=false;haptic([25,45,25,45,60])}
function applyPrefs(){'''
text, n = js_pattern.subn(lambda _: js, text, count=1)
if n != 1:
    raise SystemExit('memory JS replace failed')

text, n = re.subn(
    r"\$\('#memoryRestart'\)\.onclick=initMemory;[^\n]*\n",
    "$('#memoryRestart').onclick=initMemory;$('#memoryCategory').onchange=initMemory;$('#memoryAgain').onclick=initMemory;$$('[data-memory-diff]').forEach(b=>b.onclick=()=>setMemoryDifficulty(b.dataset.memoryDiff));window.addEventListener('resize',()=>{if(memory.cards.length)updateMemoryDimensions()});\n",
    text,
    count=1,
)
if n != 1:
    raise SystemExit('memory listeners replace failed')

for marker in ['class="mem-card card-fly-in"','crownSvg()','mem-card.shake','aspect-ratio:4/5','MEMORY_DIFFS','memoryAgain']:
    if marker not in text:
        raise SystemExit('missing marker: ' + marker)

p.write_text(text, encoding='utf-8')
