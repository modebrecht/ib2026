(function(){
  'use strict';

  var CYAN={accent:'#06b6d4',dark:'#0891b2',rgb:'6,182,212'};
  var BLUE={accent:'#3b82f6',dark:'#1d4ed8',rgb:'59,130,246'};
  var GREEN={accent:'#10b981',dark:'#047857',rgb:'16,185,129'};

  var META={
    A:{q:8,name:'Programme & Browser',title:'Quest 8 – Programme & Browser',desc:'Sechs neue Kürzel für Programme und den Browser.',theme:CYAN,lessonTitle:'Neu in Quest 8',lessonIntro:'Sieh dir zuerst an, was die sechs Kürzel tatsächlich auslösen. Die Fragen darunter prüfen nur diesen Stoff.',lesson:[
      {keys:'Ctrl + B',desc:'Text in Word oder vielen Textprogrammen fett formatieren',mode:'bold',flow:['Text markieren','Ctrl + B','Text wird fett']},
      {keys:'Ctrl + N',desc:'Neues Dokument oder neues Fenster erstellen',mode:'newDoc',flow:['Programm','Ctrl + N','Neues Dokument']},
      {keys:'Ctrl + T',desc:'Neue Browser-Registerkarte öffnen',mode:'newTab',flow:['Browser','Ctrl + T','Neuer Tab']},
      {keys:'Ctrl + W',desc:'Aktuelle Browser-Registerkarte schliessen',mode:'closeTab',flow:['Aktiver Tab','Ctrl + W','Tab schliesst']},
      {keys:'Ctrl + Shift + T',desc:'Zuletzt geschlossenen Browser-Tab wieder öffnen',mode:'reopenTab',flow:['Tab geschlossen','Ctrl + Shift + T','Tab wieder da']},
      {keys:'F5',desc:'Webseite aktualisieren',mode:'refresh',flow:['Webseite','F5','Neu geladen']}
    ]},
    B:{q:9,name:'Windows',title:'Quest 9 – Windows & Arbeitsalltag',desc:'Sechs neue Kürzel für Windows und den Arbeitsalltag.',theme:BLUE,lessonTitle:'Neu in Quest 9',lessonIntro:'Jetzt kommen sechs Windows-Kürzel dazu. Beobachte jeweils den Zustand vorher und nachher.',lesson:[
      {keys:'Win + L',desc:'Computer sperren, wenn du den Platz verlässt',mode:'lock',flow:['Desktop','Win + L','Gesperrt']},
      {keys:'Win + D',desc:'Desktop anzeigen',mode:'desktop',flow:['Fenster offen','Win + D','Desktop sichtbar']},
      {keys:'Win + E',desc:'Datei-Explorer öffnen',mode:'explorer',flow:['Desktop','Win + E','Explorer']},
      {keys:'Win + Shift + S',desc:'Bildschirmausschnitt aufnehmen',mode:'snip',flow:['Bildschirm','Win + Shift + S','Ausschnitt wählen']},
      {keys:'Alt + Tab',desc:'Zwischen geöffneten Programmen wechseln',mode:'appSwitch',flow:['Word aktiv','Alt + Tab','Browser aktiv']},
      {keys:'Ctrl + Shift + Esc',desc:'Task-Manager direkt öffnen',mode:'taskManager',flow:['Programm hängt','Ctrl + Shift + Esc','Task-Manager']}
    ]},
    C:{q:10,name:'Anwendung',title:'Quest 10 – Anwendung',desc:'Die zwölf neuen Kürzel aus Quest 8 und 9 werden gemischt.',theme:GREEN,lessonTitle:'Keine neuen Kürzel',lessonIntro:'Quest 10 ist reine Anwendung. Wiederhole bei Bedarf Q8 oder Q9 – hier kommt kein neuer Stoff dazu.',lesson:[]}
  };

  var DATA={
    A:[
      {text:'Du möchtest Text in Word fett formatieren.',correct:'Ctrl + B',wrong:['Ctrl + F','Ctrl + N']},
      {text:'Du möchtest in Word ein neues Dokument erstellen.',correct:'Ctrl + N',wrong:['Ctrl + T','Ctrl + W']},
      {text:'Du willst im Browser einen neuen Tab öffnen.',correct:'Ctrl + T',wrong:['Ctrl + N','Ctrl + Shift + T']},
      {text:'Du willst den aktuellen Browser-Tab schliessen.',correct:'Ctrl + W',wrong:['Alt + Tab','Ctrl + T']},
      {text:'Du hast einen Browser-Tab versehentlich geschlossen und willst ihn zurückholen.',correct:'Ctrl + Shift + T',wrong:['Ctrl + T','Ctrl + Shift + N']},
      {text:'Du möchtest eine Webseite aktualisieren.',correct:'F5',wrong:['Ctrl + F','Win + D']}
    ],
    B:[
      {text:'Du verlässt deinen Platz kurz und möchtest den Computer sperren.',correct:'Win + L',wrong:['Ctrl + L','Win + D']},
      {text:'Du möchtest schnell den Desktop anzeigen.',correct:'Win + D',wrong:['Win + E','Alt + Tab']},
      {text:'Du möchtest den Datei-Explorer öffnen.',correct:'Win + E',wrong:['Ctrl + E','Win + D']},
      {text:'Du möchtest nur einen Ausschnitt des Bildschirms aufnehmen.',correct:'Win + Shift + S',wrong:['Win + S','Taste Printscreen (Prt Scr)']},
      {text:'Du möchtest zwischen geöffneten Programmen wechseln.',correct:'Alt + Tab',wrong:['Ctrl + Tab','Win + D']},
      {text:'Ein Programm hängt. Du möchtest den Task-Manager direkt öffnen.',correct:'Ctrl + Shift + Esc',wrong:['Ctrl + Alt + Del','Alt + F4']}
    ],
    C:[
      {text:'Du möchtest einen neuen Browser-Tab öffnen.',correct:'Ctrl + T',wrong:['Ctrl + N','Ctrl + W']},
      {text:'Du willst den Datei-Explorer öffnen.',correct:'Win + E',wrong:['Win + D','Ctrl + E']},
      {text:'Du möchtest eine Webseite neu laden.',correct:'F5',wrong:['Ctrl + F','Win + L']},
      {text:'Du willst den Computer sperren.',correct:'Win + L',wrong:['Win + D','Ctrl + L']},
      {text:'Du hast einen Browser-Tab geschlossen und möchtest ihn wieder öffnen.',correct:'Ctrl + Shift + T',wrong:['Ctrl + T','Ctrl + N']},
      {text:'Du möchtest zwischen zwei geöffneten Programmen wechseln.',correct:'Alt + Tab',wrong:['Ctrl + Tab','Ctrl + W']},
      {text:'Du möchtest Text in Word fett formatieren.',correct:'Ctrl + B',wrong:['Ctrl + F','Ctrl + N']},
      {text:'Du möchtest einen Bildschirmausschnitt aufnehmen.',correct:'Win + Shift + S',wrong:['Win + D','F5']},
      {text:'Du möchtest ein neues Dokument erstellen.',correct:'Ctrl + N',wrong:['Ctrl + T','Ctrl + W']},
      {text:'Du möchtest den Task-Manager direkt öffnen.',correct:'Ctrl + Shift + Esc',wrong:['Alt + Tab','Ctrl + Shift + T']},
      {text:'Du möchtest den Desktop anzeigen.',correct:'Win + D',wrong:['Win + E','Win + L']},
      {text:'Du möchtest den aktuellen Browser-Tab schliessen.',correct:'Ctrl + W',wrong:['Ctrl + T','Alt + Tab']}
    ]
  };

  var SETS=Object.keys(DATA),STORAGE_KEY='tk_a4_progress_v1',currentSet='A',attemptFinished=false,freshAttempt=false;
  var setTabs=document.getElementById('setTabs'),lessonTitle=document.getElementById('lessonTitle'),lessonIntro=document.getElementById('lessonIntro'),lessonGrid=document.getElementById('lessonGrid'),sheetTitle=document.getElementById('sheetTitle'),sheetDesc=document.getElementById('sheetDesc'),questionsContainer=document.getElementById('questionsContainer'),answerProgress=document.getElementById('answerProgress'),checkBtn=document.getElementById('checkBtn'),scoreBox=document.getElementById('scoreBox'),overlay=document.getElementById('overlay'),summaryPanel=document.getElementById('summaryPanel'),summaryRows=document.getElementById('summaryRows'),toA5Btn=document.getElementById('toA5Btn');
  var lessonScenes=[],lessonObserver=null;

  function shuffle(arr){return arr.map(function(v){return{v:v,s:Math.random()};}).sort(function(a,b){return a.s-b.s;}).map(function(o){return o.v;});}
  function loadProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){return{};}}
  function attemptCount(entry){if(!entry)return 0;if(typeof entry.attempts==='number')return entry.attempts;return typeof entry.first==='number'?1:0;}
  function saveProgress(key,pct,answers,correct){var data=loadProgress(),old=data[key]||{},previousAttempts=attemptCount(old),attempts=previousAttempts+1,second=typeof old.second==='number'?old.second:(previousAttempts===1?pct:(previousAttempts===2&&typeof old.last==='number'?old.last:null));data[key]={first:typeof old.first==='number'?old.first:pct,second:second,last:pct,best:Math.max(typeof old.best==='number'?old.best:0,pct),answers:answers,lastCorrect:correct,attempts:attempts};localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
  function scoreColor(p){return p>=80?'var(--accent-green)':p>=50?'var(--accent-amber)':'var(--accent-red)';}
  function setTheme(meta){document.documentElement.style.setProperty('--sheet-accent',meta.theme.accent);document.documentElement.style.setProperty('--sheet-rgb',meta.theme.rgb);answerProgress.style.background='linear-gradient(90deg,'+meta.theme.accent+',var(--accent-green))';checkBtn.style.setProperty('--btn-accent',meta.theme.accent);checkBtn.style.setProperty('--btn-accent-dark',meta.theme.dark);checkBtn.style.setProperty('--btn-accent-rgb',meta.theme.rgb);}
  function flowHtml(flow){return flow.map(function(part,index){return (index?'<b>→</b>':'')+'<span>'+part+'</span>';}).join('');}

  function stopLessonScenes(){if(lessonObserver){lessonObserver.disconnect();lessonObserver=null;}lessonScenes.forEach(function(x){x.scene.setActive(false);});lessonScenes=[];}
  function renderTabs(){setTabs.innerHTML='';SETS.forEach(function(key){var m=META[key],b=document.createElement('button');b.className='set-tab'+(key===currentSet?' active':'');b.style.setProperty('--tab-accent',m.theme.accent);b.style.setProperty('--tab-rgb',m.theme.rgb);b.innerHTML='<span class="tab-q">Q'+m.q+'</span><span class="tab-name">'+m.name+'</span>';b.addEventListener('click',function(){currentSet=key;freshAttempt=false;render();});setTabs.appendChild(b);});}
  function renderLesson(){
    stopLessonScenes();
    var m=META[currentSet];lessonTitle.textContent=m.lessonTitle;lessonIntro.textContent=m.lessonIntro;lessonGrid.innerHTML='';
    if(!m.lesson.length){lessonGrid.style.display='none';return;}
    lessonGrid.style.display='grid';
    m.lesson.forEach(function(item,index){
      var card=document.createElement('article');card.className='lesson-anim-card';card.innerHTML='<div class="lesson-anim-head"><div><div class="lesson-count">Kürzel '+(index+1)+' von '+m.lesson.length+'</div><h3>'+item.desc+'</h3></div><kbd>'+item.keys+'</kbd></div><div class="lesson-scene"></div><div class="lesson-anim-foot"><div class="lesson-flow">'+flowHtml(item.flow)+'</div><button type="button" class="lesson-replay">↻ Wiederholen</button></div>';
      lessonGrid.appendChild(card);
      var scene=createA4Scene(card.querySelector('.lesson-scene'),{mode:item.mode,autoplay:false});
      card.querySelector('.lesson-replay').addEventListener('click',function(){scene.play();});
      lessonScenes.push({card:card,scene:scene,visible:false});
    });
    lessonObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){var x=lessonScenes.find(function(v){return v.card===entry.target;});if(!x)return;x.visible=entry.isIntersecting&&entry.intersectionRatio>.18;x.card.classList.toggle('is-visible',x.visible);x.scene.setActive(x.visible);});},{threshold:[0,.18,.4]});
    lessonScenes.forEach(function(x){lessonObserver.observe(x.card);});
  }
  function updateAnswerProgress(){var ss=Array.from(questionsContainer.querySelectorAll('select')),n=ss.filter(function(s){return s.value;}).length;answerProgress.style.width=(ss.length?n/ss.length*100:0)+'%';}
  function showFiftyFifty(select,hint){var row=select.parentNode,wrap=document.createElement('div'),note=document.createElement('div'),options=document.createElement('div');wrap.className='fifty-wrap';note.className='fifty-note';note.textContent='💡 Eine falsche Antwort wurde entfernt.';options.className='fifty-options';Array.from(select.options).filter(function(o){return o.value;}).forEach(function(o){var b=document.createElement('button');b.type='button';b.className='fifty-option'+(select.value===o.value?' selected':'');b.dataset.value=o.value;b.textContent=o.value;b.addEventListener('click',function(){select.value=o.value;options.querySelectorAll('.fifty-option').forEach(function(btn){btn.classList.toggle('selected',btn===b);});select.dispatchEvent(new Event('change',{bubbles:true}));});options.appendChild(b);});wrap.appendChild(note);wrap.appendChild(options);select.style.display='none';row.insertBefore(wrap,hint);}

  function render(forceFresh){
    var m=META[currentSet];setTheme(m);renderTabs();renderLesson();sheetTitle.textContent=m.title;sheetDesc.textContent=m.desc;questionsContainer.innerHTML='';
    var data=loadProgress(),stored=data[currentSet],qs=DATA[currentSet],startFresh=Boolean(forceFresh||freshAttempt),completed=!startFresh&&stored&&typeof stored.last==='number';
    qs.forEach(function(q,i){
      var card=document.createElement('div'),title=document.createElement('div'),label=document.createElement('span'),text=document.createElement('span'),select=document.createElement('select'),empty=document.createElement('option'),hint=document.createElement('button'),row=document.createElement('div'),fb=document.createElement('div');
      card.className='question-card';title.className='question-title';label.className='question-label';label.textContent='Frage '+(i+1);text.className='question-text';text.textContent=q.text;title.appendChild(label);title.appendChild(text);select.className='answer-select';select.dataset.correct=q.correct;empty.value='';empty.textContent='Bitte wählen …';select.appendChild(empty);shuffle([q.correct].concat(q.wrong)).forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;select.appendChild(o);});
      if(!startFresh&&stored&&stored.answers&&stored.answers[i])select.value=stored.answers[i];if(completed)select.disabled=true;
      hint.type='button';hint.className='btn-hint';hint.dataset.used='false';var xp=typeof getGlobalXP==='function'?getGlobalXP():0;hint.textContent=completed?'💡 Tipp':xp<30?'💡 Tipp (-30 XP | Zu wenig XP)':'💡 Tipp (-30 XP)';hint.disabled=completed||xp<30;
      hint.addEventListener('click',function(){if(hint.disabled||hint.dataset.used==='true')return;var now=typeof getGlobalXP==='function'?getGlobalXP():0;if(now<30){hint.disabled=true;return;}var wrong=Array.from(select.options).filter(function(o){return o.value&&o.value!==q.correct&&o.value!==select.value;});if(!wrong.length)wrong=Array.from(select.options).filter(function(o){return o.value&&o.value!==q.correct;});if(!wrong.length)return;wrong[Math.floor(Math.random()*wrong.length)].remove();if(typeof addGlobalXP==='function')addGlobalXP(-30);if(typeof playSound==='function')playSound('hint');hint.dataset.used='true';hint.textContent='💡 Tipp genutzt (-30 XP)';hint.disabled=true;showFiftyFifty(select,hint);});
      row.className='answer-row';row.appendChild(select);row.appendChild(hint);fb.className='q-feedback';select.addEventListener('change',function(){select.classList.remove('correct','wrong');fb.classList.remove('show');updateAnswerProgress();});card.appendChild(title);card.appendChild(row);card.appendChild(fb);questionsContainer.appendChild(card);
    });
    if(completed){var attempts=attemptCount(stored),second=typeof stored.second==='number'?stored.second:null;scoreBox.textContent=attempts>=2?'Mit Lernkarten: '+stored.first+' % · Ohne Lernkarten: '+(second!==null?second+' %':'nicht erfasst')+' · Best: '+stored.best+' % · Durchgänge: '+attempts:'Mit Lernkarten: '+stored.first+' % · Durchgänge: 1/2';scoreBox.style.color=scoreColor(attempts>=2&&second!==null?second:stored.last);checkBtn.textContent='↻ Neuer Versuch';attemptFinished=true;}else{scoreBox.textContent=(startFresh?'Neuer Versuch: ':'')+'0 / '+qs.length+' richtig';scoreBox.style.color='var(--text-muted)';checkBtn.textContent='✅ Überprüfen';attemptFinished=false;}
    updateAnswerProgress();updateA5Link();
  }

  function evaluate(){
    var ss=Array.from(questionsContainer.querySelectorAll('select')),chosen=[],correct=0;
    ss.forEach(function(sel){var card=sel.closest('.question-card'),fb=card.querySelector('.q-feedback'),hint=card.querySelector('.btn-hint'),buttons=card.querySelectorAll('.fifty-option'),c=sel.dataset.correct;chosen.push(sel.value||'');sel.classList.remove('correct','wrong');buttons.forEach(function(b){b.disabled=true;b.classList.remove('correct','wrong');});if(sel.value&&sel.value===c){correct++;sel.classList.add('correct');buttons.forEach(function(b){if(b.dataset.value===c)b.classList.add('correct');});fb.innerHTML='<span style="color:var(--accent-green)">✅ Richtig</span>';}else if(sel.value){sel.classList.add('wrong');buttons.forEach(function(b){if(b.dataset.value===sel.value)b.classList.add('wrong');if(b.dataset.value===c)b.classList.add('correct');});fb.innerHTML='<span style="color:var(--accent-red)">❌ Falsch</span><span style="color:var(--text-muted)">Richtig wäre:</span>';var k=document.createElement('kbd');k.textContent=c;fb.appendChild(k);}else{sel.classList.add('wrong');fb.innerHTML='<span style="color:var(--accent-amber)">⚠️ Keine Antwort</span><span style="color:var(--text-muted)">Wähle beim nächsten Versuch zuerst eine Antwort.</span>';}fb.classList.add('show');sel.disabled=true;hint.disabled=true;});
    var pct=Math.round(correct/ss.length*100);saveProgress(currentSet,pct,chosen,correct);var saved=loadProgress()[currentSet],attempts=attemptCount(saved),second=typeof saved.second==='number'?saved.second:null,qid='q'+META[currentSet].q;if(typeof saveQuestScore==='function')saveQuestScore(qid,pct);var xp=typeof awardQuestImprovementXP==='function'?awardQuestImprovementXP(qid,correct,5):0;
    scoreBox.textContent=attempts===1?'Mit Lernkarten: '+pct+' % · Durchgänge: 1/2':attempts===2?'Ohne Lernkarten: '+(second!==null?second:pct)+' % · Durchgänge: 2/2'+(xp?' · +'+xp+' XP':''):'Durchgang '+attempts+': '+pct+' % · Best: '+saved.best+' %'+(xp?' · +'+xp+' XP':'');scoreBox.style.color=scoreColor(pct);attemptFinished=true;freshAttempt=false;checkBtn.textContent='↻ Neuer Versuch';updateA5Link();renderSummary();
  }

  function renderSummary(){var data=loadProgress();summaryRows.innerHTML='';SETS.forEach(function(key){var m=META[key],s=data[key],row=document.createElement('div'),q=document.createElement('div'),name=document.createElement('div'),vals=document.createElement('div'),attempts=attemptCount(s),second=s&&typeof s.second==='number'?s.second:null;row.className='summary-row';q.className='summary-q';q.textContent='Q'+m.q;q.style.color=m.theme.accent;name.textContent=m.name;vals.className='summary-vals';vals.textContent=s?s.first+' % → '+(second!==null?second+' %':'offen')+' · Best '+s.best+' % · '+attempts+'×':'noch offen · 0/2';vals.style.color=s?scoreColor(second!==null?second:s.first):'var(--text-muted)';row.appendChild(q);row.appendChild(name);row.appendChild(vals);summaryRows.appendChild(row);});}
  function allRequiredAttempts(){var d=loadProgress();return SETS.every(function(k){return attemptCount(d[k])>=2;});}
  function updateA5Link(){var ok=allRequiredAttempts();toA5Btn.setAttribute('aria-disabled',ok?'false':'true');toA5Btn.textContent=ok?'Weiter zu A5 ➔':'A5 nach 2 Durchgängen pro Quest';}

  checkBtn.addEventListener('click',function(){if(attemptFinished){freshAttempt=true;render(true);}else evaluate();});
  document.getElementById('showSummaryBtn').addEventListener('click',function(){renderSummary();overlay.style.display='block';summaryPanel.classList.add('open');});
  document.getElementById('closeSummary').addEventListener('click',function(){overlay.style.display='none';summaryPanel.classList.remove('open');});
  overlay.addEventListener('click',function(){overlay.style.display='none';summaryPanel.classList.remove('open');});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){overlay.style.display='none';summaryPanel.classList.remove('open');}});
  render();renderSummary();
})();
