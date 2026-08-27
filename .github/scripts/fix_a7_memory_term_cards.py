from pathlib import Path

p=Path('tk2/A7.html')
s=p.read_text(encoding='utf-8')

old_css=".mem-term-emoji{font-size:calc(var(--card-text,15px)*2.6);line-height:1;margin-bottom:.35rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.1))}.mem-term-label{font-size:calc(var(--card-text,15px)*1.15);font-weight:900;line-height:1.25;text-align:center}"
new_css=".mem-term-symbol{width:72px;height:72px;border-radius:18px;display:grid;place-items:center;margin:0 auto .55rem;background:rgba(245,158,11,.12);border:2px solid #f59e0b;color:#b45309;font:950 calc(var(--card-text,15px)*2.4)/1 'Segoe UI Symbol','Space Grotesk',monospace;box-shadow:0 0 22px rgba(245,158,11,.18)}html[data-theme=\"dark\"] .mem-term-symbol{background:rgba(245,158,11,.13);border-color:#f59e0b;color:#fde047}.mem-term-label{font-size:calc(var(--card-text,15px)*1.15);font-weight:850;line-height:1.25;text-align:center;color:inherit}"
assert old_css in s, 'memory term CSS marker missing'
s=s.replace(old_css,new_css,1)

marker="function initMemory(){stopMemoryTimer();"
helper="function memoryTermMarkup(item){const title=String(item?.title||'');if(item?.cat==='altgr'){const parts=title.split(' · '),symbol=parts.shift()||'',label=parts.join(' · ')||title;return `<div class=\"mem-term-symbol\">${escapeHtml(symbol)}</div><div class=\"mem-term-label\">${escapeHtml(label)}</div>`}return `<div class=\"mem-term-label\">${escapeHtml(title)}</div>`}\n"
assert marker in s, 'initMemory marker missing'
s=s.replace(marker,helper+marker,1)

old_deck="selected.forEach(s=>{markSeen(s.id);deck.push({pairId:s.id,kind:'term',emoji:'⌨️',term:s.title});deck.push({pairId:s.id,kind:'desc',shortcut:s})});"
new_deck="selected.forEach(s=>{markSeen(s.id);deck.push({pairId:s.id,kind:'term',shortcut:s});deck.push({pairId:s.id,kind:'desc',shortcut:s})});"
assert old_deck in s, 'old memory term deck marker missing'
s=s.replace(old_deck,new_deck,1)

old_render="if(c.kind==='term'){front.innerHTML=`<div class=\"mem-term-emoji\">${c.emoji}</div><div class=\"mem-term-label\">${escapeHtml(c.term)}</div>`}else{"
new_render="if(c.kind==='term'){front.innerHTML=memoryTermMarkup(c.shortcut)}else{"
assert old_render in s, 'old memory term renderer missing'
s=s.replace(old_render,new_render,1)

assert '⌨️' not in s
assert 'mem-term-emoji' not in s
assert 'function memoryTermMarkup(item)' in s
assert "item?.cat==='altgr'" in s
assert 'class=\"mem-term-symbol\"' in s
assert "kind:'term',shortcut:s" in s

p.write_text(s,encoding='utf-8')
print('patched A7 memory term cards: emoji removed, A2-style AltGr symbols')
