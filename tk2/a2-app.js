(function(){
  'use strict';

  var altgrItems=[
    {title:'Klammeraffe',char:'@',key2:'2',desc:'Wichtig für E-Mail-Adressen.'},
    {title:'Hashtag / Raute',char:'#',key2:'3',desc:'Für Hashtags, Social Media und Code.'},
    {title:'Euro-Zeichen',char:'€',key2:'E',desc:'Das Währungszeichen für Euro.'},
    {title:'Senkrechter Strich (Pipe)',char:'|',key2:'7',desc:'Wird häufig in Informatik und Befehlszeilen verwendet.'},
    {title:'Backslash',char:'\\',key2:'<',desc:'Kommt zum Beispiel in Windows-Dateipfaden vor.'},
    {title:'Eckige Klammer auf',char:'[',key2:'ü',desc:'Öffnet eine eckige Klammer, zum Beispiel bei Listen im Code.'},
    {title:'Eckige Klammer zu',char:']',key2:'¨',desc:'Schliesst eine eckige Klammer.'},
    {title:'Geschweifte Klammer auf',char:'{',key2:'ä',desc:'Öffnet häufig einen Codeblock.'},
    {title:'Geschweifte Klammer zu',char:'}',key2:'$',desc:'Schliesst häufig einen Codeblock.'},
    {title:'Gradzeichen',char:'°',key2:'4',desc:'Für Temperaturangaben wie 21 °C.'}
  ];

  function byId(id){return document.getElementById(id);}
  function shuffle(arr){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function accuracy(c,t){return t===0?100:Math.round(c/t*100);}
  function comboHtml(item,mode){
    if(mode==='guided')return '<div class="big-kbd">AltGr</div><div class="plus-sign">+</div><div class="big-kbd">'+item.key2+'</div>';
    if(mode==='partial')return '<div class="big-kbd">AltGr</div><div class="plus-sign">+</div><div class="big-kbd">?</div>';
    return '<div class="big-kbd">?</div><div class="plus-sign">+</div><div class="big-kbd">?</div>';
  }

  var activePhase=1;
  var q4Items=shuffle(altgrItems),q4Index=0,q4Correct=0,q4Attempts=0,q4Locked=false;
  var q5Items=shuffle(altgrItems),q5Index=0,q5Correct=0,q5Attempts=0,q5Locked=false,q5Hint=false;
  var q6Items=shuffle(altgrItems),q6Index=0,q6Correct=0,q6Attempts=0,q6Locked=false,q6Hint=false;

  document.addEventListener('DOMContentLoaded',function(){
    var unlocked=isQuestUnlocked('q4');
    byId('a2-lock-screen').style.display=unlocked?'none':'flex';
    byId('a2-content-wrap').style.display=unlocked?'block':'none';
    ['q4-char-input','q5-char-input','q6-char-input'].forEach(function(id){
      var input=byId(id);if(!input)return;
      input.addEventListener('paste',function(e){e.preventDefault();});
      input.addEventListener('drop',function(e){e.preventDefault();});
      input.addEventListener('contextmenu',function(e){e.preventDefault();});
    });
  });

  function switchPhase(n){
    activePhase=n;
    [1,2,3,4].forEach(function(i){byId('phase-'+i).style.display=i===n?'block':'none';byId('tab-'+i).classList.toggle('active',i===n);});
    if(n===2)updateQ4();else if(n===3)checkQ5();else if(n===4)checkQ6();
    if(window.tk2SetTheoryActive)window.tk2SetTheoryActive(n===1);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function finishQuest(prefix,questId,correct,attempts,pass,toNext,nextLabel){
    var pct=accuracy(correct,attempts);saveQuestScore(questId,pct);
    byId(prefix+'-card').style.display='none';byId(prefix+'-trophy-view').style.display='flex';
    if(pct>=pass){byId(prefix+'-result-title').textContent='🏆 '+prefix.toUpperCase()+' bestanden!';byId(prefix+'-result-title').style.color='var(--accent-green)';byId(prefix+'-result-desc').textContent='Du hast '+pct+' % richtig. '+nextLabel+' ist freigeschaltet.';if(toNext)byId(toNext).style.display='inline-block';}
    else{byId(prefix+'-result-title').textContent='⚠️ Noch nicht ganz';byId(prefix+'-result-title').style.color='var(--accent-amber)';byId(prefix+'-result-desc').textContent='Du hast '+pct+' % richtig. Du brauchst mindestens '+pass+' %.';if(toNext)byId(toNext).style.display='none';}
  }

  function setCommon(prefix,item,index,total,correct,attempts){
    byId(prefix+'-symbol-box').textContent=item.char;byId(prefix+'-title').textContent=item.title;byId(prefix+'-desc').textContent=item.desc;
    byId(prefix+'-counter-label').textContent='Zeichen '+(index+1)+' von '+total;byId(prefix+'-progress-bar').style.width=((index+1)/total*100)+'%';byId(prefix+'-score-live').textContent='Richtig: '+accuracy(correct,attempts)+' %';
    var input=byId(prefix+'-char-input');input.value='';setTimeout(function(){input.focus();},0);
  }

  function handleInput(prefix,item,onCorrect,onWrong){
    var input=byId(prefix+'-char-input');
    input.addEventListener('input',function(e){
      if(!e.target.value)return;
      var ok=e.target.value.indexOf(item().char)!==-1;
      if(ok)onCorrect(e);else onWrong(e);
    });
  }

  function resetQ4(){q4Items=shuffle(altgrItems);q4Index=0;q4Correct=0;q4Attempts=0;q4Locked=false;byId('q4-card').style.display='block';byId('q4-trophy-view').style.display='none';updateQ4();}
  function updateQ4(){
    q4Locked=false;if(q4Index>=q4Items.length){finishQuest('q4','q4',q4Correct,q4Attempts,80,'q4-to-q5-btn','Quest 5');return;}
    var item=q4Items[q4Index];setCommon('q4',item,q4Index,q4Items.length,q4Correct,q4Attempts);byId('q4-shortcut-display').innerHTML=comboHtml(item,'guided');byId('q4-status-msg').textContent='Tippe das gezeigte Sonderzeichen selbst mit AltGr.';byId('q4-card').classList.remove('success-flash','error-flash');
  }
  byId('q4-char-input').addEventListener('input',function(e){if(activePhase!==2||q4Locked||q4Index>=q4Items.length||!e.target.value)return;var item=q4Items[q4Index];q4Locked=true;q4Attempts++;if(e.target.value.indexOf(item.char)!==-1){q4Correct++;addGlobalXP(10);playSound('correct');byId('q4-card').classList.add('success-flash');byId('q4-status-msg').innerHTML='✨ <span style="color:var(--accent-green)">+10 XP</span>';setTimeout(function(){q4Index++;updateQ4();},600);}else{addGlobalXP(-10);playSound('wrong');byId('q4-card').classList.add('error-flash');byId('q4-status-msg').innerHTML='❌ <span style="color:var(--accent-red)">-10 XP</span>';setTimeout(function(){byId('q4-card').classList.remove('error-flash');e.target.value='';q4Locked=false;},600);}});

  function checkQ5(){var ok=isQuestUnlocked('q5');byId('q5-lock-screen').style.display=ok?'none':'flex';byId('q5-game-screen').style.display=ok?'flex':'none';if(ok)updateQ5();}
  function resetQ5(){q5Items=shuffle(altgrItems);q5Index=0;q5Correct=0;q5Attempts=0;q5Locked=false;q5Hint=false;byId('q5-card').style.display='block';byId('q5-trophy-view').style.display='none';updateQ5();}
  function updateQ5(){
    q5Locked=false;if(q5Index>=q5Items.length){finishQuest('q5','q5',q5Correct,q5Attempts,70,'q5-to-q6-btn','Quest 6');return;}
    q5Hint=false;var item=q5Items[q5Index];setCommon('q5',item,q5Index,q5Items.length,q5Correct,q5Attempts);byId('q5-shortcut-display').innerHTML=comboHtml(item,'partial');
    var hint=byId('q5-hint-btn'),xp=getGlobalXP();hint.disabled=xp<30;hint.textContent=xp<30?'💡 Tipp (-30 XP | Zu wenig XP)':'💡 Tipp (-30 XP)';byId('q5-status-msg').textContent='Das Zielzeichen ist sichtbar. Welche zweite Taste gehört zu AltGr?';byId('q5-card').classList.remove('success-flash','error-flash');
  }
  function useQ5Hint(){if(q5Hint)return;if(getGlobalXP()<30){playSound('wrong');return;}q5Hint=true;addGlobalXP(-30);playSound('hint');var item=q5Items[q5Index];byId('q5-shortcut-display').innerHTML=comboHtml(item,'guided');byId('q5-hint-btn').disabled=true;byId('q5-hint-btn').textContent='💡 Tipp genutzt (-30 XP)';}
  byId('q5-char-input').addEventListener('input',function(e){if(activePhase!==3||q5Locked||q5Index>=q5Items.length||!e.target.value)return;var item=q5Items[q5Index];q5Locked=true;q5Attempts++;if(e.target.value.indexOf(item.char)!==-1){q5Correct++;addGlobalXP(10);playSound('correct');byId('q5-shortcut-display').innerHTML=comboHtml(item,'guided');byId('q5-card').classList.add('success-flash');byId('q5-status-msg').innerHTML='✨ <span style="color:var(--accent-green)">+10 XP</span>';setTimeout(function(){q5Index++;updateQ5();},600);}else{addGlobalXP(-10);playSound('wrong');byId('q5-card').classList.add('error-flash');byId('q5-status-msg').innerHTML='❌ <span style="color:var(--accent-red)">-10 XP</span>';setTimeout(function(){byId('q5-card').classList.remove('error-flash');e.target.value='';q5Locked=false;},600);}});

  function checkQ6(){var ok=isQuestUnlocked('q6');byId('q6-lock-screen').style.display=ok?'none':'flex';byId('q6-game-screen').style.display=ok?'flex':'none';if(ok)updateQ6();}
  function resetQ6(){q6Items=shuffle(altgrItems);q6Index=0;q6Correct=0;q6Attempts=0;q6Locked=false;q6Hint=false;byId('q6-card').style.display='block';byId('q6-trophy-view').style.display='none';updateQ6();}
  function updateQ6(){
    q6Locked=false;if(q6Index>=q6Items.length){finishQuest('q6','q6',q6Correct,q6Attempts,70,'q6-to-a3-btn','A3');return;}
    q6Hint=false;var item=q6Items[q6Index];setCommon('q6',item,q6Index,q6Items.length,q6Correct,q6Attempts);byId('q6-shortcut-display').innerHTML=comboHtml(item,'blind');
    var hint=byId('q6-hint-btn'),xp=getGlobalXP();hint.disabled=xp<30;hint.textContent=xp<30?'💡 Tipp (-30 XP | Zu wenig XP)':'💡 Tipp (-30 XP)';byId('q6-status-msg').textContent='Das Zielzeichen bleibt sichtbar. Erinnere dich an beide Tasten.';byId('q6-card').classList.remove('success-flash','error-flash');
  }
  function useQ6Hint(){if(q6Hint)return;if(getGlobalXP()<30){playSound('wrong');return;}q6Hint=true;addGlobalXP(-30);playSound('hint');var item=q6Items[q6Index];byId('q6-shortcut-display').innerHTML=comboHtml(item,'guided');byId('q6-hint-btn').disabled=true;byId('q6-hint-btn').textContent='💡 Tipp genutzt (-30 XP)';}
  byId('q6-char-input').addEventListener('input',function(e){if(activePhase!==4||q6Locked||q6Index>=q6Items.length||!e.target.value)return;var item=q6Items[q6Index];q6Locked=true;q6Attempts++;if(e.target.value.indexOf(item.char)!==-1){q6Correct++;addGlobalXP(10);playSound('correct');byId('q6-shortcut-display').innerHTML=comboHtml(item,'guided');document.querySelectorAll('#q6-shortcut-display .big-kbd').forEach(function(k){k.classList.add('pressed-success');});byId('q6-card').classList.add('success-flash');byId('q6-status-msg').innerHTML='✨ <span style="color:var(--accent-green)">+10 XP</span>';setTimeout(function(){q6Index++;updateQ6();},600);}else{addGlobalXP(-10);playSound('wrong');byId('q6-card').classList.add('error-flash');byId('q6-status-msg').innerHTML='❌ <span style="color:var(--accent-red)">-10 XP</span>';setTimeout(function(){byId('q6-card').classList.remove('error-flash');e.target.value='';q6Locked=false;},600);}});

  window.switchPhase=switchPhase;window.resetQ4=resetQ4;window.resetQ5=resetQ5;window.resetQ6=resetQ6;window.useQ5Hint=useQ5Hint;window.useQ6Hint=useQ6Hint;
})();