(function(){
  'use strict';

  function byId(id){return document.getElementById(id);}
  function addStyles(){
    if(byId('tk2-keyboard-recall-style'))return;
    var style=document.createElement('style');
    style.id='tk2-keyboard-recall-style';
    style.textContent=''
      +'.kbd-recall-banner{margin:12px 0 2px;padding:10px 12px;border:1px solid rgba(var(--sheet-rgb,var(--stage-rgb,6,182,212)),.28);background:rgba(var(--sheet-rgb,var(--stage-rgb,6,182,212)),.07);border-radius:12px;color:var(--text-muted);font-size:.88rem;font-weight:700;line-height:1.45}'
      +'.kbd-recall-wrap{display:grid;gap:7px;min-width:0}'
      +'.kbd-recall-note{color:var(--text-muted);font-size:.82rem;font-weight:700}'
      +'.kbd-recall-keys{display:flex;align-items:center;gap:7px;flex-wrap:wrap}'
      +'.kbd-recall-plus{color:#64748b;font-family:\'Space Grotesk\',sans-serif;font-weight:900}'
      +'.kbd-recall-capture{min-width:78px;min-height:43px;padding:8px 14px;border-radius:11px;border:1px dashed rgba(var(--sheet-rgb,var(--stage-rgb,6,182,212)),.65);background:rgba(var(--sheet-rgb,var(--stage-rgb,6,182,212)),.08);color:#f8fafc;font-family:\'Space Grotesk\',monospace;font-size:1rem;font-weight:900;display:inline-grid;place-items:center;outline:none;cursor:text;box-shadow:0 3px 0 rgba(0,0,0,.35)}'
      +'.kbd-recall-capture:focus{border-style:solid;box-shadow:0 0 0 3px rgba(var(--sheet-rgb,var(--stage-rgb,6,182,212)),.18),0 3px 0 rgba(0,0,0,.35)}'
      +'.kbd-recall-capture.is-set{border-style:solid}'
      +'.kbd-recall-capture.is-correct{border-color:var(--accent-green);background:rgba(16,185,129,.14);color:#a7f3d0}'
      +'.kbd-recall-capture.is-wrong{border-color:var(--accent-red);background:rgba(239,68,68,.14);color:#fecaca}'
      +'.kbd-recall-status{min-height:1.15em;color:#94a3b8;font-size:.8rem;font-weight:700}'
      +'@media(max-width:640px){.kbd-recall-capture{min-width:66px}.kbd-recall-banner{font-size:.82rem}}';
    document.head.appendChild(style);
  }

  function parts(shortcut){
    var p=String(shortcut||'').split(/\s+\+\s+/);
    return{prefix:p.slice(0,-1),last:p[p.length-1]||''};
  }
  function expectedKey(token){
    if(token==='←')return'ArrowLeft';
    if(token==='→')return'ArrowRight';
    if(token==='Esc')return'Escape';
    return token;
  }
  function eventKey(e){
    var k=e.key||'';
    if(k==='Esc')k='Escape';
    if(k.length===1)k=k.toUpperCase();
    return k;
  }
  function shownKey(k){
    if(k==='ArrowLeft')return'←';
    if(k==='ArrowRight')return'→';
    if(k==='Escape')return'Esc';
    if(k===' ')return'Leertaste';
    return k||'?';
  }
  function isModifier(k){return k==='Control'||k==='Shift'||k==='Alt'||k==='Meta'||k==='AltGraph';}
  function setWrongValue(select,key){
    var old=select.querySelector('option[data-kbd-temp="1"]');
    if(old)old.remove();
    var o=document.createElement('option');
    o.dataset.kbdTemp='1';
    o.value='__kbd__'+key+'__';
    o.textContent=key;
    select.appendChild(o);
    select.value=o.value;
  }
  function nextCapture(current){
    var all=Array.from(document.querySelectorAll('.kbd-recall-capture'));
    var i=all.indexOf(current);
    for(var n=i+1;n<all.length;n++){
      if(!all[n].dataset.done){all[n].focus();return;}
    }
  }
  function refreshHint(hint){
    if(!hint)return;
    var xp=typeof getGlobalXP==='function'?getGlobalXP():0;
    if(hint.dataset.used==='true')return;
    hint.disabled=xp<30;
    hint.textContent=xp<30?'💡 Tipp (-30 XP | Zu wenig XP)':'💡 Tipp (-30 XP)';
  }

  function enhanceRow(row){
    if(row.dataset.kbdEnhanced==='1')return;
    var select=row.querySelector('select.answer-select');
    if(!select||select.disabled)return;
    var card=row.closest('.question-card');
    var symbol=card&&card.querySelector('.big-symbol-kbd');
    var correct=select.dataset.correct||'';
    var p=parts(correct);
    var target=symbol?symbol.textContent:'';
    var expected=symbol?target:expectedKey(p.last);

    row.dataset.kbdEnhanced='1';
    select.style.display='none';

    var wrap=document.createElement('div');
    wrap.className='kbd-recall-wrap';
    var note=document.createElement('div');
    note.className='kbd-recall-note';
    note.textContent=symbol?'Tippe das Zielzeichen mit deiner Tastatur.':'Drücke die fehlende Taste auf deiner Tastatur.';
    var keys=document.createElement('div');
    keys.className='kbd-recall-keys';
    if(!symbol&&p.prefix.length){
      p.prefix.forEach(function(k,i){
        if(i){var plus=document.createElement('span');plus.className='kbd-recall-plus';plus.textContent='+';keys.appendChild(plus);}
        var key=document.createElement('kbd');key.textContent=k;keys.appendChild(key);
      });
      var plus=document.createElement('span');plus.className='kbd-recall-plus';plus.textContent='+';keys.appendChild(plus);
    }
    var capture=document.createElement('div');
    capture.className='kbd-recall-capture';
    capture.tabIndex=0;
    capture.setAttribute('role','textbox');
    capture.setAttribute('aria-label',symbol?'Zielzeichen mit der Tastatur eingeben':'Fehlende Taste eingeben');
    capture.textContent='?';
    keys.appendChild(capture);
    var status=document.createElement('div');
    status.className='kbd-recall-status';
    status.textContent='Feld fokussieren und Taste drücken.';
    wrap.appendChild(note);wrap.appendChild(keys);wrap.appendChild(status);
    row.insertBefore(wrap,select);

    capture.addEventListener('keydown',function(e){
      var raw=e.key||'';
      if(isModifier(raw))return;
      e.preventDefault();e.stopPropagation();
      var k=symbol?raw:eventKey(e);
      var ok=symbol?k===target:k===expected;
      if(ok)select.value=correct;else setWrongValue(select,symbol?raw:eventKey(e));
      capture.textContent=symbol?shownKey(raw):shownKey(eventKey(e));
      capture.classList.add('is-set');
      capture.classList.remove('is-correct','is-wrong');
      capture.dataset.done='1';
      status.textContent='Taste gespeichert.';
      select.dispatchEvent(new Event('change',{bubbles:true}));
      setTimeout(function(){nextCapture(capture);},60);
    });

    var oldHint=row.querySelector('.btn-hint');
    if(oldHint){
      var hint=oldHint.cloneNode(true);
      oldHint.replaceWith(hint);
      hint.dataset.used='false';
      refreshHint(hint);
      hint.addEventListener('click',function(){
        if(hint.disabled||hint.dataset.used==='true')return;
        var xp=typeof getGlobalXP==='function'?getGlobalXP():0;
        if(xp<30){refreshHint(hint);return;}
        if(typeof addGlobalXP==='function')addGlobalXP(-30);
        if(typeof playSound==='function')playSound('hint');
        hint.dataset.used='true';hint.disabled=true;hint.textContent='💡 Tipp genutzt (-30 XP)';
        status.textContent='Tipp: '+correct;
      });
    }
  }

  function ensureBanner(container,text){
    if(!container||byId(container.id+'-kbd-banner'))return;
    var banner=document.createElement('div');
    banner.id=container.id+'-kbd-banner';
    banner.className='kbd-recall-banner';
    banner.textContent='⌨️ '+text;
    container.parentNode.insertBefore(banner,container);
  }
  function enhanceContainer(container,text){
    if(!container)return;
    addStyles();
    ensureBanner(container,text);
    container.querySelectorAll('.answer-row').forEach(enhanceRow);
    var first=container.querySelector('.kbd-recall-capture:not([data-done])');
    if(first)setTimeout(function(){first.focus();},80);
  }
  function markResult(container){
    if(!container)return;
    container.querySelectorAll('.answer-row[data-kbd-enhanced="1"]').forEach(function(row){
      var select=row.querySelector('select.answer-select'),capture=row.querySelector('.kbd-recall-capture'),status=row.querySelector('.kbd-recall-status');
      if(!select||!capture||!select.disabled)return;
      var ok=select.value===select.dataset.correct;
      capture.classList.remove('is-correct','is-wrong');
      capture.classList.add(ok?'is-correct':'is-wrong');
      status.textContent=ok?'✅ Richtig':'❌ Richtig wäre: '+select.dataset.correct;
    });
  }

  function setupSecondPass(startId,questionsId,checkId,theoryId){
    var start=byId(startId),container=byId(questionsId),check=byId(checkId),theory=byId(theoryId);
    if(!start||!container||!check)return;
    start.addEventListener('click',function(){
      setTimeout(function(){
        if(theory&&theory.style.display==='none'&&!check.disabled){
          enhanceContainer(container,'2. Durchgang: Die Modifiertasten bleiben sichtbar. Drücke jeweils die fehlende Taste – so löst du keine echten Browser- oder Systemaktionen aus.');
        }
      },0);
    });
    check.addEventListener('click',function(){setTimeout(function(){markResult(container);},0);});
  }

  function setupA6(){
    var container=byId('questionsContainer'),check=byId('checkBtn');
    if(!container||!check)return;
    var text='Tastaturmodus: Bei allgemeinen, Browser- und Windows-Kürzeln bleiben die Modifiertasten sichtbar; du drückst die fehlende Taste. Bei AltGr-Zeichen tippst du das echte Zeichen.';
    function scan(){enhanceContainer(container,text);}
    new MutationObserver(function(){setTimeout(scan,0);}).observe(container,{childList:true});
    check.addEventListener('click',function(){setTimeout(function(){markResult(container);scan();},0);});
    scan();
  }

  setupSecondPass('startSecondPassBtn','q8Questions','q8CheckBtn','q8TheoryCard');
  setupSecondPass('startSecondPassBtn','q9Questions','q9CheckBtn','q9TheoryCard');
  setupA6();
})();