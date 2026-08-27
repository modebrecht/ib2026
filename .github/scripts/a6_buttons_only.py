from pathlib import Path

# --- A6.html CSS ---------------------------------------------------------
p=Path('tk2/A6.html')
s=p.read_text(encoding='utf-8')
old="""    .answer-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}.answer-select{width:100%;padding:11px 14px;border-radius:12px;border:1px solid var(--border-color);background:#0f172a;color:var(--text-main);font-family:'Space Grotesk',monospace;font-size:1rem;font-weight:700;outline:none}.answer-select:focus{border-color:rgba(var(--sheet-rgb),.8);box-shadow:0 0 0 3px rgba(var(--sheet-rgb),.18)}.answer-select.correct{border-color:var(--accent-green);background:rgba(16,185,129,.12)}.answer-select.wrong{border-color:var(--accent-red);background:rgba(239,68,68,.12)}.answer-row .btn-hint{margin-top:0;white-space:nowrap}.fifty-wrap{display:grid;gap:8px;min-width:0}.fifty-note{color:var(--text-muted);font-size:.86rem;font-weight:700}.fifty-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.fifty-option{min-width:0;padding:11px 12px;border-radius:12px;border:1px solid var(--border-color);background:#0f172a;color:var(--text-main);font-family:'Space Grotesk',monospace;font-size:.95rem;font-weight:700;cursor:pointer;transition:.15s}.fifty-option.selected{border-color:var(--sheet-accent);background:rgba(var(--sheet-rgb),.16);box-shadow:0 0 0 2px rgba(var(--sheet-rgb),.12)}.fifty-option.correct{border-color:var(--accent-green);background:rgba(16,185,129,.14)}.fifty-option.wrong{border-color:var(--accent-red);background:rgba(239,68,68,.14)}.q-feedback{display:none;gap:8px;align-items:center;flex-wrap:wrap;font-size:.9rem;font-weight:700}.q-feedback.show{display:flex}.actions{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-top:1.5rem}.score-box{font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--text-muted)}
"""
new="""    .answer-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:start}.answer-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;min-width:0}.answer-option{min-width:0;min-height:58px;padding:11px 12px;border-radius:13px;border:1px solid var(--border-color);background:#0f172a;color:var(--text-main);font-family:'Space Grotesk',monospace;font-size:clamp(.88rem,2vw,1rem);font-weight:800;cursor:pointer;transition:transform .14s ease,border-color .14s ease,background .14s ease,box-shadow .14s ease;box-shadow:0 3px 0 rgba(0,0,0,.32);display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.25}.answer-option:hover:not(:disabled){transform:translateY(-1px);border-color:rgba(var(--sheet-rgb),.7);background:rgba(var(--sheet-rgb),.08)}.answer-option:active:not(:disabled){transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.32)}.answer-option.selected{border-color:var(--sheet-accent);background:rgba(var(--sheet-rgb),.17);box-shadow:0 0 0 2px rgba(var(--sheet-rgb),.13),0 3px 0 rgba(0,0,0,.28)}.answer-option.correct{border-color:var(--accent-green);background:rgba(16,185,129,.16);color:#a7f3d0;box-shadow:0 0 0 2px rgba(16,185,129,.12)}.answer-option.wrong{border-color:var(--accent-red);background:rgba(239,68,68,.15);color:#fecaca;box-shadow:0 0 0 2px rgba(239,68,68,.10)}.answer-option.removed{display:none}.answer-option:disabled{cursor:default}.answer-row .btn-hint{margin-top:0;white-space:nowrap;min-height:58px}.hint-note{grid-column:1/-1;color:var(--text-muted);font-size:.84rem;font-weight:700;margin-top:-2px}.q-feedback{display:none;gap:8px;align-items:center;flex-wrap:wrap;font-size:.9rem;font-weight:700}.q-feedback.show{display:flex}.actions{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-top:1.5rem}.score-box{font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--text-muted)}
"""
assert old in s, 'A6 answer CSS marker not found'
s=s.replace(old,new,1)
s=s.replace("@media(max-width:640px){.tab-name{display:none}.answer-row{grid-template-columns:1fr}.answer-row .btn-hint{justify-self:start}.fifty-options{grid-template-columns:1fr}","@media(max-width:760px){.answer-options{grid-template-columns:1fr}.answer-row{grid-template-columns:1fr}.answer-row .btn-hint{justify-self:stretch;width:100%}}@media(max-width:640px){.tab-name{display:none}",1)
assert '.answer-select' not in s
assert '.fifty-option' not in s
p.write_text(s,encoding='utf-8')

# --- a6-app.js ------------------------------------------------------------
p=Path('tk2/a6-app.js')
s=p.read_text(encoding='utf-8')

old_progress="function updateAnswerProgress(){var ss=Array.from(questionsContainer.querySelectorAll('select')),n=ss.filter(function(s){return s.value;}).length;answerProgress.style.width=(ss.length?n/ss.length*100:0)+'%';}"
new_progress="function updateAnswerProgress(){var cards=Array.from(questionsContainer.querySelectorAll('.question-card')),n=cards.filter(function(card){return Boolean(card.dataset.answer);}).length;answerProgress.style.width=(cards.length?n/cards.length*100:0)+'%';}"
assert old_progress in s
s=s.replace(old_progress,new_progress,1)

start=s.index('  function showFiftyFifty(')
end=s.index('\n\n  function render(forceFresh)',start)
s=s[:start]+"""  function useHint(card,hint,q){
    if(hint.disabled||hint.dataset.used==='true')return;
    var now=typeof getGlobalXP==='function'?getGlobalXP():0;
    if(now<30){hint.disabled=true;return;}
    var selected=card.dataset.answer||'';
    var wrong=Array.from(card.querySelectorAll('.answer-option')).filter(function(b){return b.dataset.value!==q.correct&&b.dataset.value!==selected&&!b.classList.contains('removed');});
    if(!wrong.length)wrong=Array.from(card.querySelectorAll('.answer-option')).filter(function(b){return b.dataset.value!==q.correct&&!b.classList.contains('removed');});
    if(!wrong.length)return;
    wrong[Math.floor(Math.random()*wrong.length)].classList.add('removed');
    if(typeof addGlobalXP==='function')addGlobalXP(-30);
    if(typeof playSound==='function')playSound('hint');
    hint.dataset.used='true';hint.textContent='💡 Tipp genutzt (-30 XP)';hint.disabled=true;
    var note=document.createElement('div');note.className='hint-note';note.textContent='Eine falsche Antwort wurde entfernt.';card.querySelector('.answer-row').appendChild(note);
  }"""+s[end:]

old_block="""      var q=entry.q,sourceIndex=entry.sourceIndex;
      var card=document.createElement('div'),title=document.createElement('div'),label=document.createElement('span'),text=document.createElement('span'),select=document.createElement('select'),empty=document.createElement('option'),hint=document.createElement('button'),row=document.createElement('div'),fb=document.createElement('div');
      card.className='question-card';card.dataset.sourceIndex=String(sourceIndex);
      title.className='question-title';label.className='question-label';label.textContent='Frage '+(visualIndex+1);title.appendChild(label);
      if(q.char){var sym=document.createElement('kbd');sym.className='big-symbol-kbd';sym.textContent=q.char;title.appendChild(sym);}
      text.className='question-text';text.textContent=q.text;title.appendChild(text);
      select.className='answer-select';select.dataset.correct=q.correct;select.dataset.sourceIndex=String(sourceIndex);
      empty.value='';empty.textContent='Bitte wählen …';select.appendChild(empty);
      shuffle([q.correct].concat(q.wrong)).forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;select.appendChild(o);});
      if(!startFresh&&stored&&stored.answers&&stored.answers[sourceIndex])select.value=stored.answers[sourceIndex];
      if(completed)select.disabled=true;
      hint.type='button';hint.className='btn-hint';hint.dataset.used='false';
      var xp=typeof getGlobalXP==='function'?getGlobalXP():0;
      hint.textContent=completed?'💡 Tipp':xp<30?'💡 Tipp (-30 XP | Zu wenig XP)':'💡 Tipp (-30 XP)';
      hint.disabled=completed||xp<30;
      hint.addEventListener('click',function(){
        if(hint.disabled||hint.dataset.used==='true')return;
        var now=typeof getGlobalXP==='function'?getGlobalXP():0;
        if(now<30){hint.disabled=true;return;}
        var wrong=Array.from(select.options).filter(function(o){return o.value&&o.value!==q.correct&&o.value!==select.value;});
        if(!wrong.length)wrong=Array.from(select.options).filter(function(o){return o.value&&o.value!==q.correct;});
        if(!wrong.length)return;
        wrong[Math.floor(Math.random()*wrong.length)].remove();
        if(typeof addGlobalXP==='function')addGlobalXP(-30);
        if(typeof playSound==='function')playSound('hint');
        hint.dataset.used='true';hint.textContent='💡 Tipp genutzt (-30 XP)';hint.disabled=true;showFiftyFifty(select,hint);
      });
      row.className='answer-row';row.appendChild(select);row.appendChild(hint);
      fb.className='q-feedback';
      select.addEventListener('change',function(){select.classList.remove('correct','wrong');fb.classList.remove('show');updateAnswerProgress();});
      card.appendChild(title);card.appendChild(row);card.appendChild(fb);questionsContainer.appendChild(card);
"""
new_block="""      var q=entry.q,sourceIndex=entry.sourceIndex;
      var card=document.createElement('div'),title=document.createElement('div'),label=document.createElement('span'),text=document.createElement('span'),options=document.createElement('div'),hint=document.createElement('button'),row=document.createElement('div'),fb=document.createElement('div');
      card.className='question-card';card.dataset.sourceIndex=String(sourceIndex);card.dataset.correct=q.correct;card.dataset.answer='';
      title.className='question-title';label.className='question-label';label.textContent='Frage '+(visualIndex+1);title.appendChild(label);
      if(q.char){var sym=document.createElement('kbd');sym.className='big-symbol-kbd';sym.textContent=q.char;title.appendChild(sym);}
      text.className='question-text';text.textContent=q.text;title.appendChild(text);
      options.className='answer-options';
      var storedAnswer=!startFresh&&stored&&stored.answers&&stored.answers[sourceIndex]?stored.answers[sourceIndex]:'';
      shuffle([q.correct].concat(q.wrong)).forEach(function(v){
        var b=document.createElement('button');b.type='button';b.className='answer-option';b.dataset.value=v;b.textContent=v;
        if(storedAnswer===v){b.classList.add('selected');card.dataset.answer=v;}
        if(completed)b.disabled=true;
        b.addEventListener('click',function(){
          if(completed)return;
          card.dataset.answer=v;
          options.querySelectorAll('.answer-option').forEach(function(btn){btn.classList.remove('selected','correct','wrong');});
          b.classList.add('selected');fb.classList.remove('show');updateAnswerProgress();
        });
        options.appendChild(b);
      });
      hint.type='button';hint.className='btn-hint';hint.dataset.used='false';
      var xp=typeof getGlobalXP==='function'?getGlobalXP():0;
      hint.textContent=completed?'💡 Tipp':xp<30?'💡 Tipp (-30 XP | Zu wenig XP)':'💡 Tipp (-30 XP)';
      hint.disabled=completed||xp<30;
      hint.addEventListener('click',function(){useHint(card,hint,q);});
      row.className='answer-row';row.appendChild(options);row.appendChild(hint);
      fb.className='q-feedback';
      card.appendChild(title);card.appendChild(row);card.appendChild(fb);questionsContainer.appendChild(card);
"""
assert old_block in s, 'render select block not found'
s=s.replace(old_block,new_block,1)

start=s.index('  function evaluate(){')
end=s.index('\n\n  function renderSummary()',start)
new_eval="""  function evaluate(){
    var cards=Array.from(questionsContainer.querySelectorAll('.question-card')),chosen=Array(DATA[currentSet].length).fill(''),correct=0;
    cards.forEach(function(card){
      var fb=card.querySelector('.q-feedback'),hint=card.querySelector('.btn-hint'),buttons=Array.from(card.querySelectorAll('.answer-option')),c=card.dataset.correct,sourceIndex=Number(card.dataset.sourceIndex),answer=card.dataset.answer||'';
      chosen[sourceIndex]=answer;
      buttons.forEach(function(b){b.disabled=true;b.classList.remove('correct','wrong');});
      if(answer&&answer===c){
        correct++;buttons.forEach(function(b){if(b.dataset.value===c)b.classList.add('correct');});fb.innerHTML='<span style=\"color:var(--accent-green)\">✅ Richtig</span>';
      }else if(answer){
        buttons.forEach(function(b){if(b.dataset.value===answer)b.classList.add('wrong');if(b.dataset.value===c){b.classList.remove('removed');b.classList.add('correct');}});fb.innerHTML='<span style=\"color:var(--accent-red)\">❌ Falsch</span><span style=\"color:var(--text-muted)\">Richtig wäre:</span>';var k=document.createElement('kbd');k.textContent=c;fb.appendChild(k);
      }else{
        buttons.forEach(function(b){if(b.dataset.value===c){b.classList.remove('removed');b.classList.add('correct');}});fb.innerHTML='<span style=\"color:var(--accent-amber)\">⚠️ Keine Antwort</span><span style=\"color:var(--text-muted)\">Wähle beim nächsten Versuch zuerst eine Antwort.</span>';
      }
      fb.classList.add('show');hint.disabled=true;
    });
    var pct=Math.round(correct/cards.length*100);saveProgress(currentSet,pct,chosen,correct);var qid='q'+META[currentSet].q;
    if(typeof saveQuestScore==='function')saveQuestScore(qid,pct);
    var xp=typeof awardQuestImprovementXP==='function'?awardQuestImprovementXP(qid,correct,5):0;
    scoreBox.textContent=correct+' / '+cards.length+' richtig ('+pct+' %)'+(xp?' · +'+xp+' XP':'');scoreBox.style.color=scoreColor(pct);attemptFinished=true;freshAttempt=false;checkBtn.textContent='↻ Neuer Versuch';renderSummary();updateCompletion();
  }"""
s=s[:start]+new_eval+s[end:]

# Hard guards: no dropdown/select implementation remains in A6 app.
for forbidden in ["createElement('select')","querySelectorAll('select')",'.answer-select','showFiftyFifty','select.options','select.value']:
    assert forbidden not in s, f'forbidden select code remains: {forbidden}'
assert "className='answer-options'" in s
assert "className='answer-option'" in s
assert 'function useHint(card,hint,q)' in s
p.write_text(s,encoding='utf-8')
print('A6 migrated to buttons only')
