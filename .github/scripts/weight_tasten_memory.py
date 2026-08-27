from pathlib import Path
p=Path('tk2/tasten.html')
s=p.read_text(encoding='utf-8')
old="const selected=shuffleArray(pool.slice()).slice(0,pairs),deck=[];selected.forEach(s=>{deck.push({pairId:s.id,kind:'term',emoji:'⌨️',term:s.title});deck.push({pairId:s.id,kind:'desc',shortcut:s})});"
new="const selected=weightedSample(pool,pairs),deck=[];selected.forEach(s=>{markSeen(s.id);deck.push({pairId:s.id,kind:'term',emoji:'⌨️',term:s.title});deck.push({pairId:s.id,kind:'desc',shortcut:s})});"
assert old in s, 'memory selection anchor missing'
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('memory weighted selection patched')
