from pathlib import Path

p = Path('tk2/tasten.html')
text = p.read_text(encoding='utf-8')

old = "function keyMarkup(s){return s.keys.map((k,i)=>`<kbd>${escapeHtml(k)}</kbd>${i<s.keys.length-1?'<span class=\\\"plus\\\">+</span>':''}`).join('')}"
new = "function keyMarkup(s){return challengeKeyMarkup(s)}"
if old not in text:
    raise SystemExit('keyMarkup marker not found')
text = text.replace(old, new, 1)

hero_replacements = {
    '<kbd>CTRL</kbd>': '<span class="challenge-key wide">Ctrl</span>',
    '<kbd>WIN</kbd>': '<span class="challenge-key wide">Win</span>',
    '<kbd>ALTGR</kbd>': '<span class="challenge-key extra-wide">AltGr</span>',
    '<kbd>C</kbd>': '<span class="challenge-key">C</span>',
    '<kbd>V</kbd>': '<span class="challenge-key">V</span>',
    '<kbd>2</kbd>': '<span class="challenge-key">2</span>',
}
for src, dst in hero_replacements.items():
    if src not in text:
        raise SystemExit(f'hero key marker not found: {src}')
    text = text.replace(src, dst, 1)

text = text.replace('<span class="plus">+</span>', '<span class="challenge-plus">+</span>', 3)

marker = 'html[data-theme="dark"] .quiz-option.wrong .challenge-key{--key-bottom:#7f1d1d;border-color:#f87171;background:linear-gradient(180deg,#991b1b,#7f1d1d);color:#fff1f2}\n'
compact_css = r'''.keys .challenge-keyset{justify-content:flex-start;gap:5px;flex-wrap:wrap}
.keys .challenge-plus{font-size:.78rem;margin:0;color:var(--muted)}
.keys .challenge-key{--key-bottom:#b8c3d1;min-width:38px;height:36px;padding:0 9px;border-radius:8px;font-size:.76rem;box-shadow:0 3px 0 var(--key-bottom),0 5px 8px rgba(15,23,42,.11),inset 0 1px 0 rgba(255,255,255,.95)}
.keys .challenge-key.wide{min-width:49px}.keys .challenge-key.extra-wide{min-width:58px}.keys .challenge-key.arrow{min-width:38px;font-size:1rem}.keys .challenge-key.function{min-width:42px}
html[data-theme="dark"] .keys .challenge-key{--key-bottom:#182337;box-shadow:0 3px 0 var(--key-bottom),0 5px 9px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.10)}
.answer .keys .challenge-keyset{justify-content:center;gap:7px}
.answer .keys .challenge-key{min-width:48px;height:46px;padding:0 12px;border-radius:10px;font-size:.88rem;box-shadow:0 4px 0 var(--key-bottom),0 7px 11px rgba(15,23,42,.12),inset 0 1px 0 rgba(255,255,255,.95)}
.answer .keys .challenge-key.wide{min-width:62px}.answer .keys .challenge-key.extra-wide{min-width:74px}.answer .keys .challenge-key.arrow{min-width:48px}.answer .keys .challenge-key.function{min-width:52px}
html[data-theme="dark"] .answer .keys .challenge-key{box-shadow:0 4px 0 var(--key-bottom),0 7px 11px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.10)}
.key-demo .challenge-plus{color:rgba(255,255,255,.78)}
'''
if marker not in text:
    raise SystemExit('challenge dark marker not found')
text = text.replace(marker, marker + compact_css, 1)

if '<kbd>' in text:
    raise SystemExit('legacy kbd markup still present')
for required in [
    'function keyMarkup(s){return challengeKeyMarkup(s)}',
    '.keys .challenge-key{',
    '<span class="challenge-key wide">Ctrl</span>',
    '${keyMarkup(s)}',
    '${keyMarkup(c.shortcut)}',
    '${keyMarkup(item)}',
]:
    if required not in text:
        raise SystemExit(f'missing required marker: {required}')

p.write_text(text, encoding='utf-8')
