from pathlib import Path

p=Path('tk2/A7.html')
s=p.read_text(encoding='utf-8')

# Emoji must stay gone from memory term cards.
assert '⌨️' not in s, 'keyboard emoji unexpectedly present'
assert 'mem-term-emoji' not in s, 'old emoji class unexpectedly present'

old_css=".mem-desc-text{font-size:var(--card-text,15px);font-weight:700;line-height:1.35;text-align:center;padding:0 6px}.mem-desc-text .keys{justify-content:center;margin:0}.mem-desc-text kbd{font-size:calc(var(--card-text,15px)*.78);padding:.55em .65em}"
new_css=".mem-desc-text{width:100%;font-size:var(--card-text,15px);font-weight:700;line-height:1.35;text-align:center;padding:0 2px}.mem-desc-text .keys{width:100%;justify-content:center;margin:0;gap:clamp(5px,.55vw,9px);flex-wrap:nowrap}.mem-desc-text kbd{font-size:clamp(1rem,calc(var(--card-text,15px)*1.32),1.55rem);padding:.88em 1.02em;min-width:clamp(58px,5vw,92px);border-radius:14px;box-shadow:0 5px 0 color-mix(in srgb,var(--line) 90%,#94a3b8),0 8px 15px rgba(15,23,42,.12)}.mem-desc-text .plus{font-size:clamp(1rem,calc(var(--card-text,15px)*1.12),1.35rem)}.mem-desc-text.key-count-3 .keys{gap:clamp(3px,.35vw,6px)}.mem-desc-text.key-count-3 kbd{font-size:clamp(.82rem,calc(var(--card-text,15px)*1.02),1.12rem);padding:.78em .62em;min-width:clamp(43px,3.8vw,62px);border-radius:12px}.mem-desc-text.key-count-3 .plus{font-size:clamp(.8rem,calc(var(--card-text,15px)*.92),1rem)}"
assert old_css in s, 'memory key CSS marker missing'
s=s.replace(old_css,new_css,1)

old_render="front.innerHTML=`<div class=\"mem-desc-text\"><div class=\"keys\">${keyMarkup(c.shortcut)}</div></div>`"
new_render="front.innerHTML=`<div class=\"mem-desc-text key-count-${Math.min(3,c.shortcut.keys.length)}\"><div class=\"keys\">${keyMarkup(c.shortcut)}</div></div>`"
assert old_render in s, 'memory desc renderer marker missing'
s=s.replace(old_render,new_render,1)

assert 'key-count-${Math.min(3,c.shortcut.keys.length)}' in s
assert 'font-size:clamp(1rem,calc(var(--card-text,15px)*1.32),1.55rem)' in s
assert 'key-count-3 kbd' in s
assert '⌨️' not in s

p.write_text(s,encoding='utf-8')
print('patched A7 memory keys: large card-filling keycaps, 3-key overflow guard, emoji remains removed')
