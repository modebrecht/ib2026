from pathlib import Path

p = Path('tk2/tasten.html')
text = p.read_text(encoding='utf-8')

old_css = ".quiz-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;width:min(680px,100%);margin-top:8px}.quiz-option{border:1px solid var(--line);border-radius:14px;background:var(--panel2);padding:13px;cursor:pointer;font-weight:800}.quiz-option:hover{border-color:var(--blue)}.quiz-option.correct{border-color:var(--green);background:color-mix(in srgb,var(--green) 10%,var(--panel))}.quiz-option.wrong{border-color:var(--red);background:color-mix(in srgb,var(--red) 9%,var(--panel))}.quiz-option:disabled{cursor:default}"
new_css = r'''.quiz-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;width:min(760px,100%);margin-top:12px}
.quiz-option{position:relative;min-height:104px;border:1px solid var(--line);border-radius:18px;background:color-mix(in srgb,var(--panel) 88%,var(--panel2));padding:17px 14px 20px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(15,23,42,.06);transition:border-color .18s ease,background .18s ease,box-shadow .18s ease,transform .18s ease;-webkit-tap-highlight-color:transparent}
.quiz-option:hover:not(:disabled){border-color:color-mix(in srgb,var(--blue) 48%,var(--line));background:var(--panel);box-shadow:0 12px 28px rgba(15,23,42,.10);transform:translateY(-1px)}
.challenge-keyset{display:flex;align-items:center;justify-content:center;gap:7px;flex-wrap:wrap;pointer-events:none}
.challenge-plus{font-size:1rem;font-weight:950;color:var(--muted);opacity:.72;margin:0 -1px}
.challenge-key{--key-bottom:#b8c3d1;min-width:52px;height:52px;padding:0 13px;border:1px solid #cbd5e1;border-bottom-color:#aebac9;border-radius:11px;background:linear-gradient(180deg,#ffffff 0%,#f8fafc 58%,#eef2f7 100%);color:#172033;box-shadow:0 5px 0 var(--key-bottom),0 8px 12px rgba(15,23,42,.12),inset 0 1px 0 rgba(255,255,255,.95);display:inline-flex;align-items:center;justify-content:center;font:900 .92rem/1 "Segoe UI",system-ui,sans-serif;letter-spacing:.01em;white-space:nowrap;transform:translateY(0);transition:transform .12s ease,box-shadow .12s ease,border-color .18s ease,background .18s ease,color .18s ease}
.challenge-key.wide{min-width:68px}.challenge-key.extra-wide{min-width:82px}.challenge-key.arrow{min-width:52px;font-size:1.2rem}.challenge-key.function{min-width:56px}
html[data-theme="dark"] .challenge-key{--key-bottom:#182337;border-color:#52617a;border-bottom-color:#26344b;background:linear-gradient(180deg,#334155 0%,#27364b 58%,#1e293b 100%);color:#f8fafc;box-shadow:0 5px 0 var(--key-bottom),0 8px 13px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.10)}
.quiz-option:active:not(:disabled) .challenge-key{transform:translateY(4px);box-shadow:0 1px 0 var(--key-bottom),0 3px 5px rgba(15,23,42,.12),inset 0 1px 0 rgba(255,255,255,.75)}
.quiz-option.correct{border-color:#10b981;background:color-mix(in srgb,#10b981 8%,var(--panel));box-shadow:0 0 0 3px rgba(16,185,129,.10),0 12px 28px rgba(16,185,129,.12);animation:challengeCorrect .32s cubic-bezier(.2,.9,.2,1)}
.quiz-option.correct .challenge-key{--key-bottom:#059669;border-color:#34d399;border-bottom-color:#059669;background:linear-gradient(180deg,#ecfdf5 0%,#d1fae5 60%,#a7f3d0 100%);color:#065f46;box-shadow:0 5px 0 var(--key-bottom),0 8px 14px rgba(16,185,129,.24),inset 0 1px 0 #fff}
html[data-theme="dark"] .quiz-option.correct .challenge-key{--key-bottom:#064e3b;border-color:#34d399;background:linear-gradient(180deg,#047857,#065f46);color:#ecfdf5}
.quiz-option.wrong{border-color:#ef4444;background:color-mix(in srgb,#ef4444 7%,var(--panel));animation:challengeWrong .38s ease}
.quiz-option.wrong .challenge-key{--key-bottom:#b91c1c;border-color:#f87171;border-bottom-color:#b91c1c;background:linear-gradient(180deg,#fef2f2 0%,#fee2e2 60%,#fecaca 100%);color:#991b1b;box-shadow:0 5px 0 var(--key-bottom),0 8px 14px rgba(239,68,68,.2),inset 0 1px 0 #fff}
html[data-theme="dark"] .quiz-option.wrong .challenge-key{--key-bottom:#7f1d1d;border-color:#f87171;background:linear-gradient(180deg,#991b1b,#7f1d1d);color:#fff1f2}
.quiz-option:disabled{cursor:default}.quiz-option:disabled:not(.correct):not(.wrong){opacity:.50}
@keyframes challengeCorrect{50%{transform:scale(1.025)}}@keyframes challengeWrong{20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
@media(max-width:760px){.quiz-options{grid-template-columns:1fr;gap:10px}.quiz-option{min-height:88px;padding:13px 10px 16px}.challenge-key{min-width:46px;height:46px;padding:0 10px;font-size:.84rem;border-radius:9px}.challenge-key.wide{min-width:60px}.challenge-key.extra-wide{min-width:72px}.challenge-key.arrow{min-width:46px}}
@media(max-width:390px){.challenge-keyset{gap:5px}.challenge-key{min-width:42px;height:44px;padding:0 8px;font-size:.78rem}.challenge-key.wide{min-width:56px}.challenge-key.extra-wide{min-width:66px}.challenge-plus{font-size:.85rem}}
'''
if old_css not in text:
    raise SystemExit('quiz CSS marker not found')
text = text.replace(old_css, new_css, 1)

old_helpers = "function keyMarkup(s){return s.keys.map((k,i)=>`<kbd>${escapeHtml(k)}</kbd>${i<s.keys.length-1?'<span class=\"plus\">+</span>':''}`).join('')}\nfunction escapeHtml"
new_helpers = """function keyMarkup(s){return s.keys.map((k,i)=>`<kbd>${escapeHtml(k)}</kbd>${i<s.keys.length-1?'<span class=\\\"plus\\\">+</span>':''}`).join('')}
function challengeKeyLabel(k){const map={CTRL:'Ctrl',SHIFT:'Shift',ALT:'Alt',ALTGR:'AltGr',WIN:'Win',ESC:'Esc',TAB:'Tab',HOME:'Home',END:'End'};return map[String(k).toUpperCase()]||k}
function challengeKeyClass(k){const u=String(k).toUpperCase();if(u==='SHIFT'||u==='ALTGR')return'extra-wide';if(['CTRL','ALT','WIN','HOME','END','TAB','ESC'].includes(u))return'wide';if(/^F\\d+$/.test(u))return'function';if(['←','→','↑','↓'].includes(k))return'arrow';return''}
function challengeKeyMarkup(s){return `<span class=\\\"challenge-keyset\\\">${s.keys.map((k,i)=>`<span class=\\\"challenge-key ${challengeKeyClass(k)}\\\">${escapeHtml(challengeKeyLabel(k))}</span>${i<s.keys.length-1?'<span class=\\\"challenge-plus\\\">+</span>':''}`).join('')}</span>`}
function escapeHtml"""
# Python string above contains escaped JS quotes. Normalize it to desired literal output.
new_helpers = new_helpers.replace('\\\\\"','\\"')
if old_helpers not in text:
    raise SystemExit('key helper marker not found')
text = text.replace(old_helpers, new_helpers, 1)

old_render = "[item,...challengeDistractors(item)].sort(()=>Math.random()-.5).forEach(choice=>{const b=document.createElement('button');b.className='quiz-option';b.textContent=keyText(choice);b.dataset.correct=choice.id===item.id?'1':'0';b.onclick=()=>gradeChallenge(b,choice.id===item.id,item,q);host.appendChild(b)})"
new_render = "[item,...challengeDistractors(item)].sort(()=>Math.random()-.5).forEach(choice=>{const b=document.createElement('button');b.type='button';b.className='quiz-option';b.setAttribute('aria-label',keyText(choice));b.innerHTML=challengeKeyMarkup(choice);b.dataset.correct=choice.id===item.id?'1':'0';b.onclick=()=>gradeChallenge(b,choice.id===item.id,item,q);host.appendChild(b)})"
if old_render not in text:
    raise SystemExit('challenge render marker not found')
text = text.replace(old_render, new_render, 1)

for marker in ['function challengeKeyMarkup', 'class="challenge-keyset"', "b.innerHTML=challengeKeyMarkup(choice)", '@keyframes challengeCorrect']:
    if marker not in text:
        raise SystemExit(f'missing marker: {marker}')

p.write_text(text, encoding='utf-8')
