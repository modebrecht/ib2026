from pathlib import Path

p = Path('tk2/tasten.html')
text = p.read_text(encoding='utf-8')

# Add category selector to Challenge side card.
old = '''<div><h3>Challenge</h3><p style="color:var(--muted);font-size:.86rem;line-height:1.45;margin-bottom:12px">10 zufällige Kürzel. Ziel: alle am Ende sicher erkennen.</p><button class="soft-btn" id="challengeRestart">Neue Challenge</button></div>'''
new = '''<div><h3>Challenge</h3><select class="mode-select" id="challengeCategory" aria-label="Challenge-Kategorie"></select><p style="color:var(--muted);font-size:.86rem;line-height:1.45;margin:10px 0 12px">Bis zu 10 Kürzel aus der gewählten Kategorie. Falsche Antworten kommen später nochmals.</p><button class="soft-btn" id="challengeRestart">Neue Challenge</button></div>'''
if old not in text:
    raise SystemExit('challenge card marker not found')
text = text.replace(old, new, 1)

# Replace memory category helpers with shared category helpers + conditional favorites.
old = '''function fillMemoryCategories(){const s=$('#memoryCategory');s.innerHTML='<option value="all">Alle Kategorien</option>'+Object.entries(categories).map(([id,c])=>`<option value="${id}">${c.label}</option>`).join('')}
function memoryPool(){const cat=$('#memoryCategory').value;return shortcuts.filter(s=>cat==='all'||s.cat===cat)}'''
new = '''function activityCategoryOptions(){return '<option value="all">Alle Kategorien</option>'+Object.entries(categories).map(([id,c])=>`<option value="${id}">${c.label}</option>`).join('')+(state.favorites.size>1?'<option value="favorites">★ Favoriten</option>':'')}
function fillActivityCategories(){['memoryCategory','challengeCategory'].forEach(id=>{const s=$('#'+id);if(!s)return;const current=s.value||'all';s.innerHTML=activityCategoryOptions();s.value=[...s.options].some(o=>o.value===current)?current:'all'})}
function fillMemoryCategories(){fillActivityCategories()}
function poolForCategory(cat){if(cat==='favorites')return shortcuts.filter(s=>state.favorites.has(s.id));return shortcuts.filter(s=>cat==='all'||s.cat===cat)}
function memoryPool(){return poolForCategory($('#memoryCategory').value)}'''
if old not in text:
    raise SystemExit('memory category helper marker not found')
text = text.replace(old, new, 1)

# Replace challenge core with category-aware, dynamic-total version.
start = text.index("const challenge={queue:[]")
end = text.index("const MEMORY_DIFFS=", start)
old_block = text[start:end]
new_block = '''const challenge={queue:[],index:0,phase:'main',score:0,directCorrect:0,streak:0,bestStreak:0,retries:0,answered:false,total:10};
function challengePool(){const s=$('#challengeCategory');return poolForCategory(s?s.value:'all')}
function challengeDistractors(item,n=3){const preferred=shuffleArray(challengePool().filter(s=>s.id!==item.id).slice()).slice(0,n);if(preferred.length<n){const used=new Set([item.id,...preferred.map(s=>s.id)]),fallback=shuffleArray(shortcuts.filter(s=>!used.has(s.id)).slice()).slice(0,n-preferred.length);preferred.push(...fallback)}return preferred}
function startChallenge(firstId=null){let pool=challengePool();if(!pool.length)pool=shortcuts.slice();let ids=shuffleArray(pool.map(s=>s.id));if(firstId&&ids.includes(firstId)){ids=ids.filter(id=>id!==firstId);ids.unshift(firstId)}const total=Math.min(10,ids.length);challenge.queue=ids.slice(0,total).map(id=>({id,main:true}));Object.assign(challenge,{index:0,phase:'main',score:0,directCorrect:0,streak:0,bestStreak:0,retries:0,answered:false,total});renderChallengeHUD();renderChallenge()}
function renderChallengeHUD(){$('#challengeScore').textContent=`${challenge.score} / ${challenge.total*100}`;$('#challengeDirect').textContent=`${challenge.directCorrect} / ${challenge.total}`;$('#streak').textContent=challenge.streak;$('#challengeRetries').textContent=challenge.retries}
function challengeItem(){const q=challenge.queue[challenge.index];return q?shortcuts.find(s=>s.id===q.id):null}
function renderChallenge(){if(challenge.index>=challenge.queue.length){finishChallenge();return}challenge.answered=false;const q=challenge.queue[challenge.index],item=challengeItem();if(!item){challenge.index++;renderChallenge();return}const mainDone=challenge.queue.slice(0,challenge.index).filter(x=>x.main).length;$('#roundPill').textContent=q.main?`${Math.min(mainDone+1,challenge.total)} / ${challenge.total}`:'Wiederholung';$('#practiceLabel').textContent=q.main?'Welche Tastenkombination passt?':'Nochmals: Welche Kombination passt?';$('#practicePrompt').textContent=item.title;$('#practiceAnswer').classList.remove('show');$('#practiceAnswer').innerHTML='';$('#challengeNext').hidden=true;const host=$('#quizOptions');host.innerHTML='';[item,...challengeDistractors(item)].sort(()=>Math.random()-.5).forEach(choice=>{const b=document.createElement('button');b.className='quiz-option';b.textContent=keyText(choice);b.dataset.correct=choice.id===item.id?'1':'0';b.onclick=()=>gradeChallenge(b,choice.id===item.id,item,q);host.appendChild(b)})}
function gradeChallenge(btn,correct,item,q){if(challenge.answered)return;challenge.answered=true;$$('.quiz-option').forEach(b=>b.disabled=true);btn.classList.add(correct?'correct':'wrong');if(!correct){const right=$('.quiz-option[data-correct="1"]');if(right)right.classList.add('correct')}if(correct){challenge.streak++;challenge.bestStreak=Math.max(challenge.bestStreak,challenge.streak);if(q.main){challenge.directCorrect++;challenge.score+=100}haptic([12,24,18]);toast('Richtig ✓')}else{challenge.streak=0;challenge.retries++;challenge.queue.push({id:item.id,main:false});haptic([24,34,24]);toast('Kommt später nochmals')}renderChallengeHUD();$('#practiceAnswer').innerHTML=`<div class="keys">${keyMarkup(item)}</div><p>${escapeHtml(item.desc)}</p>`;$('#practiceAnswer').classList.add('show');$('#challengeNext').hidden=false}
function nextChallenge(){if(!challenge.answered)return;challenge.index++;renderChallenge()}
function finishChallenge(){$('#roundPill').textContent='Geschafft ✓';$('#practiceLabel').textContent='Challenge abgeschlossen';$('#practicePrompt').textContent=`${challenge.total} / ${challenge.total} gemeistert 🎯`;$('#quizOptions').innerHTML='';$('#practiceAnswer').innerHTML=`<p><strong>${challenge.directCorrect} von ${challenge.total}</strong> direkt richtig · ${challenge.retries} Wiederholung${challenge.retries===1?'':'en'} · beste Serie ${challenge.bestStreak}.</p>`;$('#practiceAnswer').classList.add('show');$('#challengeNext').hidden=true;haptic([20,35,20,35,50])}
'''
text = text[:start] + new_block + text[end:]

# Refresh category dropdowns whenever favorites change, so ★ Favoriten appears/disappears live.
old = "function updateFavoriteUI(){const count=state.favorites.size;$('#favoriteCount').textContent=`${count} Favorit${count===1?'':'en'}`;"
new = "function updateFavoriteUI(){const count=state.favorites.size;fillActivityCategories();$('#favoriteCount').textContent=`${count} Favorit${count===1?'':'en'}`;"
if old not in text:
    raise SystemExit('updateFavoriteUI marker not found')
text = text.replace(old, new, 1)

# Challenge category change starts a fresh round.
old = "$('#challengeNext').onclick=nextChallenge;$('#challengeRestart').onclick=()=>startChallenge();"
new = "$('#challengeNext').onclick=nextChallenge;$('#challengeRestart').onclick=()=>startChallenge();$('#challengeCategory').onchange=()=>startChallenge();"
if old not in text:
    raise SystemExit('challenge event marker not found')
text = text.replace(old, new, 1)

# Checks.
for marker in ['id="challengeCategory"','value="favorites"','function poolForCategory','challenge.total*100',"$('#challengeCategory').onchange"]:
    if marker not in text:
        raise SystemExit(f'missing marker: {marker}')

p.write_text(text, encoding='utf-8')
