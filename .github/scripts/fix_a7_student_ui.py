from pathlib import Path

p=Path('tk2/A7.html')
s=p.read_text(encoding='utf-8')

# 1) Hero keycaps: force strong contrast on the blue hero.
old_css='.key-demo span{font-size:.82rem;color:rgba(255,255,255,.76)}'
new_css=old_css+".hero .challenge-key{background:linear-gradient(180deg,#fff 0%,#f8fafc 58%,#eaf0f7 100%);color:#172033!important;border-color:#d8e1ec;box-shadow:0 5px 0 #b8c3d1,0 8px 12px rgba(15,23,42,.18),inset 0 1px 0 rgba(255,255,255,.98)}.hero .challenge-plus{color:#fff!important;opacity:.95}.hero .key-demo>span{color:#fff;font-weight:750}"
assert old_css in s, 'hero key-demo CSS marker missing'
s=s.replace(old_css,new_css,1)

# 2) Plain student-facing hero copy + useful third shortcut.
old_hero='''              <span class="hero-kicker">A7 · Training & Nachweis</span>\n              <h1>Tastenkürzel,<br>die hängen bleiben.</h1>\n              <p>Trainiere den gesamten Stoff aus dem TK2-Kurs. Abgeschlossene Runden und deine Genauigkeit werden lokal gespeichert und können als PDF-Nachweis exportiert werden.</p>'''
new_hero='''              <span class="hero-kicker">A7 · Tastenkürzel trainieren</span>\n              <h1>Tastenkürzel<br>trainieren.</h1>\n              <p>Hier übst du die Tastenkürzel aus A1–A6. Wähle eine Übung und starte. Deine Ergebnisse werden auf diesem Gerät gespeichert. Nach Challenge, Fehlerjagd und Memory kannst du deine Auswertung als PDF herunterladen.</p>'''
assert old_hero in s, 'old hero copy missing'
s=s.replace(old_hero,new_hero,1)

old_demo='''              <div class="key-demo"><div class="keys"><span class="challenge-key extra-wide">AltGr</span><span class="challenge-plus">+</span><span class="challenge-key">2</span></div><span>@ schreiben</span></div>'''
new_demo='''              <div class="key-demo"><div class="keys"><span class="challenge-key wide">Alt</span><span class="challenge-plus">+</span><span class="challenge-key wide">Tab</span></div><span>Programme wechseln</span></div>'''
assert old_demo in s, 'old @ hero demo missing'
s=s.replace(old_demo,new_demo,1)

# 3) Challenge: no duplicate answer block / manual next. Auto-advance 2s correct, 3s wrong.
old_const="const challenge={queue:[],index:0,phase:'main',score:0,directCorrect:0,streak:0,bestStreak:0,retries:0,answered:false,total:10,recorded:false};"
new_const="const challenge={queue:[],index:0,phase:'main',score:0,directCorrect:0,streak:0,bestStreak:0,retries:0,answered:false,total:10,recorded:false,advanceTimer:null};"
assert old_const in s, 'challenge state marker missing'
s=s.replace(old_const,new_const,1)

old_start='function startChallenge(firstId=null){let pool=challengePool();'
new_start="function startChallenge(firstId=null){if(challenge.advanceTimer){clearTimeout(challenge.advanceTimer);challenge.advanceTimer=null}let pool=challengePool();"
assert old_start in s, 'startChallenge marker missing'
s=s.replace(old_start,new_start,1)

old_grade="renderChallengeHUD();$('#practiceAnswer').innerHTML=`<div class=\"keys\">${keyMarkup(item)}</div><p>${escapeHtml(item.desc)}</p>`;$('#practiceAnswer').classList.add('show');$('#challengeNext').hidden=false}"
new_grade="renderChallengeHUD();$('#practiceAnswer').classList.remove('show');$('#practiceAnswer').innerHTML='';$('#challengeNext').hidden=true;challenge.advanceTimer=window.setTimeout(()=>{challenge.advanceTimer=null;nextChallenge()},correct?2000:3000)}"
assert old_grade in s, 'challenge grade footer marker missing'
s=s.replace(old_grade,new_grade,1)

old_next="function nextChallenge(){if(!challenge.answered)return;challenge.index++;renderChallenge()}"
new_next="function nextChallenge(){if(!challenge.answered)return;if(challenge.advanceTimer){clearTimeout(challenge.advanceTimer);challenge.advanceTimer=null}challenge.index++;renderChallenge()}"
assert old_next in s, 'nextChallenge marker missing'
s=s.replace(old_next,new_next,1)

old_finish='function finishChallenge(){if(!challenge.recorded)'
new_finish="function finishChallenge(){if(challenge.advanceTimer){clearTimeout(challenge.advanceTimer);challenge.advanceTimer=null}if(!challenge.recorded)"
assert old_finish in s, 'finishChallenge marker missing'
s=s.replace(old_finish,new_finish,1)

# Hard assertions for requested behavior.
assert 'TK2-Kurs' not in s
assert 'die hängen bleiben' not in s
assert '@ schreiben' not in s
assert 'correct?2000:3000' in s
assert "$('#challengeNext').hidden=true;challenge.advanceTimer" in s
assert "$('#practiceAnswer').innerHTML=`<div class=\"keys\">${keyMarkup(item)}</div>" not in s

p.write_text(s,encoding='utf-8')
print('patched A7 student copy, hero key contrast, and auto-advance challenge')
