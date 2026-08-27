from pathlib import Path
p=Path('tk2/A7.html')
s=p.read_text(encoding='utf-8')

old='<span class="prompt-label" id="practiceLabel">Welche Tastenkombination passt?</span>'
new='<span class="prompt-label" id="practiceLabel">Welche Tastenkombination passt? · 1 / 10</span>'
assert old in s
s=s.replace(old,new,1)

old='<span class="prompt-label">Welche Zuordnung stimmt nicht?</span>'
new='<span class="prompt-label" id="huntPromptLabel">Welche Zuordnung stimmt nicht? · 1 / 10</span>'
assert old in s
s=s.replace(old,new,1)

old="$('#practiceLabel').textContent=q.main?'Welche Tastenkombination passt?':'Nochmals: Welche Kombination passt?';"
new="$('#practiceLabel').textContent=q.main?`Welche Tastenkombination passt? · ${Math.min(mainDone+1,challenge.total)} / ${challenge.total}`:'Nochmals: Welche Kombination passt? · Wiederholung';"
assert old in s
s=s.replace(old,new,1)

old="function updateHuntHUD(){$('#huntRound').textContent=hunt.round>=hunt.total?'Geschafft ✓':`${hunt.round+1} / ${hunt.total}`;$('#huntScore').textContent=`${hunt.score} / ${hunt.total*100}`;$('#huntCaught').textContent=`${hunt.caught} / ${hunt.total}`;$('#huntStreak').textContent=hunt.streak;$('#huntMisses').textContent=hunt.misses}"
new="function updateHuntHUD(){const done=hunt.round>=hunt.total;$('#huntRound').textContent=done?'Geschafft ✓':`${hunt.round+1} / ${hunt.total}`;$('#huntPromptLabel').textContent=done?'Fehlerjagd abgeschlossen':`Welche Zuordnung stimmt nicht? · ${hunt.round+1} / ${hunt.total}`;$('#huntScore').textContent=`${hunt.score} / ${hunt.total*100}`;$('#huntCaught').textContent=`${hunt.caught} / ${hunt.total}`;$('#huntStreak').textContent=hunt.streak;$('#huntMisses').textContent=hunt.misses}"
assert old in s
s=s.replace(old,new,1)

assert 'Welche Tastenkombination passt? · 1 / 10' in s
assert 'id="huntPromptLabel"' in s
assert 'Welche Zuordnung stimmt nicht? · ${hunt.round+1} / ${hunt.total}' in s
assert 'Nochmals: Welche Kombination passt? · Wiederholung' in s
p.write_text(s,encoding='utf-8')
print('A7 round labels added')
