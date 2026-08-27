(function(){
  'use strict';

  var counter=0,LOOP_MS=4300;
  var CONFIG={
    bold:{keys:['Ctrl','B'],label:'Fett formatieren',family:'doc'},
    newDoc:{keys:['Ctrl','N'],label:'Neues Dokument',family:'doc'},
    newTab:{keys:['Ctrl','T'],label:'Neuer Browser-Tab',family:'browser'},
    closeTab:{keys:['Ctrl','W'],label:'Browser-Tab schliessen',family:'browser'},
    reopenTab:{keys:['Ctrl','Shift','T'],label:'Tab wieder öffnen',family:'browser'},
    refresh:{keys:['F5'],label:'Webseite aktualisieren',family:'browser'},
    addressBar:{keys:['Ctrl','L'],label:'Adressleiste markieren',family:'browser'},
    nextTab:{keys:['Ctrl','Tab'],label:'Nächster Browser-Tab',family:'browser'},
    prevTab:{keys:['Ctrl','Shift','Tab'],label:'Vorheriger Browser-Tab',family:'browser'},
    lock:{keys:['Win','L'],label:'Computer sperren',family:'windows'},
    desktop:{keys:['Win','D'],label:'Desktop anzeigen',family:'windows'},
    explorer:{keys:['Win','E'],label:'Datei-Explorer öffnen',family:'windows'},
    snip:{keys:['Win','Shift','S'],label:'Bildschirmausschnitt',family:'windows'},
    appSwitch:{keys:['Alt','Tab'],label:'Programme wechseln',family:'windows'},
    taskManager:{keys:['Ctrl','Shift','Esc'],label:'Task-Manager öffnen',family:'windows'},
    clipboard:{keys:['Win','V'],label:'Zwischenablageverlauf',family:'windows'},
    closeWindow:{keys:['Alt','F4'],label:'Fenster schliessen',family:'windows'},
    snapLeft:{keys:['Win','←'],label:'Fenster links andocken',family:'windows'},
    snapRight:{keys:['Win','→'],label:'Fenster rechts andocken',family:'windows'}
  };

  function esc(v){return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  function createWindowResizeScene(container,type,options){
    options=options||{};
    var active=options.autoplay!==false,autoLoop=options.loop!==false,reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,timers=[],running=false,controller=null,uid='tk2a4resize'+(++counter),isMax=type==='maximize';

    container.innerHTML=''
      +'<svg data-window-resize-scene="'+type+'" viewBox="0 0 560 320" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Animation: '+(isMax?'Fenster maximieren':'Fenster verkleinern oder minimieren')+'">'
      +'<defs><filter id="'+uid+'Shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#020617" flood-opacity=".38"/></filter></defs>'
      +'<rect width="560" height="320" rx="24" fill="#07101f"/>'
      +'<g class="desktop" filter="url(#'+uid+'Shadow)"><rect x="28" y="25" width="365" height="255" rx="17" fill="#0b5ea8"/><circle cx="315" cy="83" r="94" fill="#60a5fa" opacity=".34"/><rect x="28" y="245" width="365" height="35" fill="#111827" opacity=".94"/><circle cx="205" cy="262" r="10" fill="#2563eb"/></g>'
      +'<g class="window" filter="url(#'+uid+'Shadow)"><rect x="112" y="58" width="225" height="158" rx="12" fill="#f8fafc"/><rect x="112" y="58" width="225" height="28" rx="12" fill="#dbe4ee"/><rect x="112" y="72" width="225" height="14" fill="#dbe4ee"/><text x="130" y="77" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Dokument</text><rect x="138" y="112" width="130" height="10" rx="5" fill="#334155"/><rect x="138" y="140" width="170" height="7" rx="3.5" fill="#94a3b8"/><rect x="138" y="158" width="150" height="7" rx="3.5" fill="#94a3b8"/></g>'
      +'<g class="direction" opacity="0"><circle cx="485" cy="133" r="42" fill="#1d4ed8" opacity=".22"/><path d="'+(isMax?'M485 154V111M469 127l16-16 16 16':'M485 111v43M469 138l16 16 16-16')+'" fill="none" stroke="#93c5fd" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>'
      +'<g class="key-row" transform="translate(404 225)">'+window.tk2SceneKeycaps.markup(['Win',isMax?'↑':'↓'],'utility')+'</g>'
      +'<g class="toast" transform="translate(370 30)" opacity="0"><rect width="170" height="32" rx="16" fill="#052e2b" stroke="#10b981"/><text x="85" y="21" text-anchor="middle" font-family="Arial" font-size="10" font-weight="800" fill="#a7f3d0">'+(isMax?'Fenster maximiert':'Fenster minimiert')+'</text></g>'
      +'</svg>';

    var svg=container.querySelector('svg'),win=svg.querySelector('.window'),direction=svg.querySelector('.direction'),toast=svg.querySelector('.toast'),keys=Array.from(svg.querySelectorAll('.tk2-u-key'));
    function later(ms,fn){timers.push(window.setTimeout(fn,ms));}
    function clearTimers(){timers.forEach(window.clearTimeout);timers=[];}
    function opacity(el,val){if(el)el.setAttribute('opacity',String(val));}
    function transform(el,val){if(el)el.setAttribute('transform',val);}
    function transition(el,val){if(el)el.style.transition=reduceMotion?'none':val;}
    function pressKeys(){window.tk2SceneKeycaps.pressSequence(keys,later,transition,'utility');}
    function reset(){clearTimers();running=false;transition(win,'none');opacity(win,1);opacity(direction,0);opacity(toast,0);transform(win,isMax?'translate(0 0) scale(1)':'translate(-38 -20) scale(1.24 1.16)');window.tk2SceneKeycaps.resetMany(keys);}
    function applyEnd(){transition(win,'none');if(isMax)transform(win,'translate(-61 -31) scale(1.5 1.42)');else{transform(win,'translate(126 186) scale(.20 .12)');opacity(win,.18);}opacity(direction,1);opacity(toast,1);}
    function showEndState(){reset();applyEnd();}
    function run(){if(reduceMotion){showEndState();return;}reset();running=true;later(350,function(){opacity(direction,1);pressKeys();});later(930,function(){transition(win,'transform 650ms cubic-bezier(.2,.8,.2,1),opacity 520ms ease');if(isMax)transform(win,'translate(-61 -31) scale(1.5 1.42)');else{transform(win,'translate(126 186) scale(.20 .12)');opacity(win,.18);}});later(1650,function(){opacity(toast,1);});later(5200,function(){running=false;if(active&&autoLoop)run();});}
    function play(){active=true;run();}
    function setActive(v){active=Boolean(v);if(!active){clearTimers();running=false;return;}if(!running)run();}
    controller={play:play,reset:reset,setActive:setActive};reset();if(active)setActive(true);return controller;
  }

  function createA4Scene(container,options){
    options=options||{};
    if(options.mode==='maximize'||options.mode==='minimize')return createWindowResizeScene(container,options.mode,options);
    var mode=options.mode||'newTab',cfg=CONFIG[mode]||CONFIG.newTab,active=options.autoplay!==false,autoLoop=options.loop!==false,reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,uid='tk2a4'+(++counter),timers=[],running=false,controller=null,sceneLoopMs=cfg.family==='windows'?5600:LOOP_MS;
    var keyProfile=cfg.family==='doc'?'doc':'utility';

    function browserMarkup(){return '<g class="browser" filter="url(#'+uid+'Shadow)"><rect x="28" y="25" width="365" height="255" rx="17" fill="#f8fafc"/><rect x="28" y="25" width="365" height="54" rx="17" fill="#dbe4ee"/><rect x="28" y="58" width="365" height="21" fill="#dbe4ee"/>'+
      '<g class="tabs"><rect class="tab-one-bg" x="47" y="35" width="112" height="28" rx="9" fill="#fff"/><text x="103" y="53" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Schulportal</text><g class="tab-two" opacity="0"><rect class="tab-two-bg" x="164" y="35" width="112" height="28" rx="9" fill="#dbe4ee"/><text x="220" y="53" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Recherche</text></g><g class="tab-new" opacity="0"><rect x="164" y="35" width="112" height="28" rx="9" fill="#fff"/><text x="220" y="53" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Neuer Tab</text></g></g>'+
      '<rect x="48" y="91" width="318" height="28" rx="10" fill="#e2e8f0"/><rect class="address-highlight" x="56" y="97" width="174" height="16" rx="5" fill="#bfdbfe" opacity="0"/><text class="address-text" x="62" y="109" font-family="Arial" font-size="9" fill="#64748b">https://schule.example</text>'+
      '<g class="page-content"><rect x="54" y="142" width="132" height="13" rx="6" fill="#0f172a" opacity=".85"/><rect x="54" y="172" width="275" height="8" rx="4" fill="#94a3b8"/><rect x="54" y="191" width="238" height="8" rx="4" fill="#94a3b8"/><rect x="54" y="210" width="264" height="8" rx="4" fill="#94a3b8"/><rect x="54" y="238" width="82" height="22" rx="8" fill="#3b82f6" opacity=".85"/></g>'+
      '<g class="refresh-ring" opacity="0" transform="translate(210 185)"><circle r="30" fill="#fff" stroke="#cbd5e1"/><path d="M0 -15A15 15 0 1 1-12 9" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round"/><path d="M-16 4l4 8 7-5" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/></g></g>';}

    function docMarkup(){return '<g class="doc" filter="url(#'+uid+'Shadow)"><rect x="28" y="25" width="365" height="255" rx="17" fill="#fff"/><rect x="28" y="25" width="365" height="38" rx="17" fill="#dbe4ee"/><rect x="28" y="46" width="365" height="17" fill="#dbe4ee"/><text x="55" y="49" font-family="Arial" font-size="10" font-weight="700" fill="#475569">Projektbericht.docx</text><rect x="57" y="88" width="148" height="13" rx="6" fill="#0f172a" opacity=".88"/><rect class="bold-selection" x="130" y="115" width="62" height="23" rx="3" fill="#bfdbfe" opacity="0"/><text x="57" y="133" font-family="Arial" font-size="15" fill="#334155">Das ist ein <tspan class="bold-word" font-weight="400">wichtiger</tspan> Satz.</text><rect x="57" y="158" width="260" height="8" rx="4" fill="#94a3b8"/><rect x="57" y="178" width="235" height="8" rx="4" fill="#94a3b8"/><rect x="57" y="198" width="270" height="8" rx="4" fill="#94a3b8"/><g class="new-doc-sheet" opacity="0"><rect x="48" y="76" width="322" height="183" rx="9" fill="#fff" stroke="#cbd5e1"/><text x="72" y="105" font-family="Arial" font-size="12" font-weight="700" fill="#334155">Neues Dokument</text><line x1="72" y1="130" x2="72" y2="151" stroke="#2563eb" stroke-width="2.5"/></g></g>';}

    function windowsMarkup(){return '<g class="desktop-base" filter="url(#'+uid+'Shadow)"><rect x="28" y="25" width="365" height="255" rx="17" fill="#0b5ea8"/><rect x="28" y="245" width="365" height="35" fill="#111827" opacity=".94"/><circle cx="205" cy="262" r="10" fill="#2563eb"/><rect x="58" y="62" width="34" height="28" rx="5" fill="#f8fafc" opacity=".9"/><text x="75" y="104" text-anchor="middle" font-family="Arial" font-size="8" fill="#fff">Dateien</text><rect x="58" y="126" width="34" height="28" rx="5" fill="#f8fafc" opacity=".9"/><text x="75" y="168" text-anchor="middle" font-family="Arial" font-size="8" fill="#fff">Browser</text>'+
      '<g class="app-windows"><g class="app-one"><rect x="118" y="55" width="220" height="154" rx="12" fill="#f8fafc"/><rect x="118" y="55" width="220" height="27" rx="12" fill="#dbe4ee"/><rect x="118" y="69" width="220" height="13" fill="#dbe4ee"/><text x="136" y="73" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Dokument</text><rect x="140" y="103" width="130" height="10" rx="5" fill="#334155"/><rect x="140" y="130" width="170" height="7" rx="3.5" fill="#94a3b8"/><rect x="140" y="148" width="150" height="7" rx="3.5" fill="#94a3b8"/></g></g>'+
      '<g class="explorer-window" opacity="0"><rect x="98" y="48" width="250" height="174" rx="13" fill="#f8fafc"/><rect x="98" y="48" width="250" height="31" rx="13" fill="#dbe4ee"/><text x="118" y="68" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Datei-Explorer</text><rect x="112" y="94" width="60" height="110" rx="8" fill="#eef2f7"/><rect x="188" y="97" width="56" height="44" rx="8" fill="#bfdbfe"/><rect x="258" y="97" width="56" height="44" rx="8" fill="#fde68a"/></g>'+
      '<g class="scene-lock" opacity="0"><rect x="28" y="25" width="365" height="255" rx="17" fill="#082f49"/><circle cx="210" cy="100" r="36" fill="#cbd5e1" opacity=".9"/><circle cx="210" cy="90" r="13" fill="#64748b"/><path d="M184 126Q210 101 236 126" fill="#64748b"/><text x="210" y="166" text-anchor="middle" font-family="Arial" font-size="20" font-weight="800" fill="#fff">Gesperrt</text></g>'+
      '<g class="snip-overlay" opacity="0"><rect x="28" y="25" width="365" height="220" rx="17" fill="#020617" opacity=".58"/><rect class="snip-box" x="116" y="82" width="0" height="0" rx="5" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/></g>'+
      '<g class="switcher" opacity="0"><rect x="86" y="101" width="260" height="91" rx="18" fill="#111827" opacity=".96"/><g class="switch-a"><rect x="103" y="118" width="66" height="54" rx="8" fill="#fff" stroke="#60a5fa" stroke-width="3"/><text x="136" y="150" text-anchor="middle" font-family="Arial" font-size="9" fill="#334155">Word</text></g><g class="switch-b"><rect x="183" y="118" width="66" height="54" rx="8" fill="#fff" stroke="#334155"/><text x="216" y="150" text-anchor="middle" font-family="Arial" font-size="9" fill="#334155">Browser</text></g></g>'+
      '<g class="task-manager" opacity="0"><rect x="79" y="44" width="282" height="184" rx="14" fill="#f8fafc"/><rect x="79" y="44" width="282" height="32" rx="14" fill="#dbe4ee"/><text x="101" y="65" font-family="Arial" font-size="10" font-weight="700" fill="#475569">Task-Manager</text><text x="103" y="98" font-family="Arial" font-size="9" font-weight="700" fill="#64748b">Prozesse</text><text x="103" y="126" font-family="Arial" font-size="9" fill="#334155">Browser</text><text x="103" y="151" font-family="Arial" font-size="9" fill="#334155">Word</text><rect x="192" y="118" width="112" height="10" rx="5" fill="#cbd5e1"/><rect x="192" y="143" width="72" height="10" rx="5" fill="#cbd5e1"/></g>'+
      '<g class="clipboard-panel" opacity="0"><rect x="118" y="44" width="220" height="184" rx="15" fill="#f8fafc"/><text x="139" y="70" font-family="Arial" font-size="11" font-weight="800" fill="#334155">Zwischenablage</text><g fill="#e2e8f0"><rect x="137" y="88" width="182" height="34" rx="8"/><rect x="137" y="132" width="182" height="34" rx="8"/><rect x="137" y="176" width="182" height="34" rx="8"/></g><text x="149" y="109" font-family="Arial" font-size="9" fill="#475569">Projektgruppe B25</text><text x="149" y="153" font-family="Arial" font-size="9" fill="#475569">https://schule.example</text><text x="149" y="197" font-family="Arial" font-size="9" fill="#475569">Montag 08:10</text></g>'+
      '<g class="snap-left-window" opacity="0"><rect x="40" y="43" width="166" height="190" rx="10" fill="#f8fafc"/><rect x="40" y="43" width="166" height="27" rx="10" fill="#dbe4ee"/><text x="56" y="61" font-family="Arial" font-size="8" font-weight="700" fill="#475569">Dokument</text><rect x="58" y="92" width="112" height="8" rx="4" fill="#64748b"/><rect x="58" y="118" width="128" height="6" rx="3" fill="#cbd5e1"/></g>'+
      '<g class="snap-right-window" opacity="0"><rect x="215" y="43" width="166" height="190" rx="10" fill="#f8fafc"/><rect x="215" y="43" width="166" height="27" rx="10" fill="#dbe4ee"/><text x="231" y="61" font-family="Arial" font-size="8" font-weight="700" fill="#475569">Dokument</text><rect x="233" y="92" width="112" height="8" rx="4" fill="#64748b"/><rect x="233" y="118" width="128" height="6" rx="3" fill="#cbd5e1"/></g></g>';}

    var main=cfg.family==='browser'?browserMarkup():(cfg.family==='doc'?docMarkup():windowsMarkup()),keyX=Math.max(404,540-window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile));
    container.innerHTML='<svg class="tk2-a4-scene" viewBox="0 0 560 320" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Animation: '+esc(cfg.label)+'"><defs><filter id="'+uid+'Shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#020617" flood-opacity=".38"/></filter></defs><rect width="560" height="320" rx="24" fill="#07101f"/><circle cx="500" cy="42" r="100" fill="#06b6d4" opacity=".045"/>'+main+'<g class="keys" transform="translate('+keyX+' 244)">'+window.tk2SceneKeycaps.markup(cfg.keys,keyProfile)+'</g><g class="toast" transform="translate(392 20)" opacity="0"><rect width="145" height="30" rx="15" fill="#052e2b" stroke="#10b981"/><text class="toast-text" x="72.5" y="19" text-anchor="middle" font-family="Arial" font-size="10" font-weight="800" fill="#a7f3d0">Fertig</text></g></svg>';

    var svg=container.querySelector('svg'),$=function(sel){return svg.querySelector(sel);},$$=function(sel){return Array.from(svg.querySelectorAll(sel));};
    function later(ms,fn){timers.push(window.setTimeout(fn,ms));}function clearTimers(){timers.forEach(window.clearTimeout);timers=[];}function trans(el,val){if(el)el.style.transition=reduceMotion?'none':val;}function opacity(el,val){if(el)el.setAttribute('opacity',String(val));}function toast(text){if($('.toast-text'))$('.toast-text').textContent=text;opacity($('.toast'),1);}function fill(el,val){if(el)el.setAttribute('fill',val);}
    function pressKeys(){window.tk2SceneKeycaps.pressSequence($$('.tk2-key, .tk2-u-key'),later,trans,keyProfile);}
    function reset(){clearTimers();running=false;window.tk2SceneKeycaps.resetMany($$('.tk2-key, .tk2-u-key'));opacity($('.toast'),0);if($('.bold-word'))$('.bold-word').setAttribute('font-weight','400');opacity($('.bold-selection'),0);opacity($('.new-doc-sheet'),0);var tabsVisible=['closeTab','nextTab','prevTab'].indexOf(mode)>=0;opacity($('.tab-two'),tabsVisible?1:0);opacity($('.tab-new'),0);opacity($('.refresh-ring'),0);opacity($('.address-highlight'),0);if($('.address-text'))$('.address-text').setAttribute('fill','#64748b');if($('.page-content'))opacity($('.page-content'),1);fill($('.tab-one-bg'),mode==='prevTab'?'#dbe4ee':'#fff');fill($('.tab-two-bg'),mode==='prevTab'?'#fff':'#dbe4ee');opacity($('.scene-lock'),0);opacity($('.app-windows'),1);opacity($('.explorer-window'),0);opacity($('.snip-overlay'),0);if($('.snip-box')){$('.snip-box').setAttribute('width','0');$('.snip-box').setAttribute('height','0');}opacity($('.switcher'),0);opacity($('.task-manager'),0);opacity($('.clipboard-panel'),0);opacity($('.snap-left-window'),0);opacity($('.snap-right-window'),0);[$('.new-doc-sheet'),$('.tab-new'),$('.tab-two'),$('.address-highlight'),$('.switcher'),$('.snip-overlay'),$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')].forEach(function(el){if(!el)return;trans(el,'none');el.setAttribute('transform','translate(0 0) scale(1)');});if($('.switch-a rect')){$('.switch-a rect').style.transition='none';$('.switch-a rect').setAttribute('stroke','#60a5fa');}if($('.switch-b rect')){$('.switch-b rect').style.transition='none';$('.switch-b rect').setAttribute('stroke','#334155');}}
    function applyEnd(){
      if(mode==='bold'){opacity($('.bold-selection'),0);$('.bold-word').setAttribute('font-weight','800');toast('Text ist fett');}
      else if(mode==='newDoc'){opacity($('.new-doc-sheet'),1);toast('Neues Dokument');}
      else if(mode==='newTab'){opacity($('.tab-new'),1);toast('Neuer Tab');}
      else if(mode==='closeTab'){opacity($('.tab-two'),0);toast('Tab geschlossen');}
      else if(mode==='reopenTab'){opacity($('.tab-two'),1);toast('Tab wieder geöffnet');}
      else if(mode==='refresh'){toast('Seite aktualisiert');}
      else if(mode==='addressBar'){opacity($('.address-highlight'),1);if($('.address-text'))$('.address-text').setAttribute('fill','#1e3a8a');toast('Adresse markiert');}
      else if(mode==='nextTab'){fill($('.tab-one-bg'),'#dbe4ee');fill($('.tab-two-bg'),'#fff');toast('Nächster Tab');}
      else if(mode==='prevTab'){fill($('.tab-one-bg'),'#fff');fill($('.tab-two-bg'),'#dbe4ee');toast('Vorheriger Tab');}
      else if(mode==='lock'){opacity($('.scene-lock'),1);toast('Computer gesperrt');}
      else if(mode==='desktop'){opacity($('.app-windows'),0);toast('Desktop sichtbar');}
      else if(mode==='explorer'){opacity($('.explorer-window'),1);toast('Explorer geöffnet');}
      else if(mode==='snip'){opacity($('.snip-overlay'),1);$('.snip-box').setAttribute('width','180');$('.snip-box').setAttribute('height','104');toast('Ausschnitt gewählt');}
      else if(mode==='appSwitch'){opacity($('.switcher'),1);$('.switch-a rect').setAttribute('stroke','#334155');$('.switch-b rect').setAttribute('stroke','#60a5fa');toast('Zum Browser gewechselt');}
      else if(mode==='taskManager'){opacity($('.task-manager'),1);toast('Task-Manager geöffnet');}
      else if(mode==='clipboard'){opacity($('.clipboard-panel'),1);toast('Verlauf geöffnet');}
      else if(mode==='closeWindow'){opacity($('.app-windows'),0);toast('Fenster geschlossen');}
      else if(mode==='snapLeft'){opacity($('.app-windows'),0);opacity($('.snap-left-window'),1);toast('Links angedockt');}
      else if(mode==='snapRight'){opacity($('.app-windows'),0);opacity($('.snap-right-window'),1);toast('Rechts angedockt');}
    }
    function showEndState(){reset();applyEnd();}
    function playMode(){
      var keyDelay=mode==='reopenTab'?800:420;
      var actionAt=Math.max(1080,keyDelay+Math.max(0,cfg.keys.length-1)*190+280);
      if(mode==='bold')later(140,function(){opacity($('.bold-selection'),1);});
      later(keyDelay,pressKeys);
      if(mode==='refresh'){later(980,function(){opacity($('.page-content'),.25);opacity($('.refresh-ring'),1);});later(1670,function(){opacity($('.refresh-ring'),0);opacity($('.page-content'),1);toast('Seite aktualisiert');});return;}
      if(mode==='newDoc'){later(actionAt,function(){var sheet=$('.new-doc-sheet');sheet.setAttribute('transform','translate(0 14) scale(.97)');trans(sheet,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 380ms ease');opacity(sheet,1);later(30,function(){sheet.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+580,function(){toast('Neues Dokument');});return;}
      if(mode==='newTab'){later(actionAt,function(){var tab=$('.tab-new');tab.setAttribute('transform','translate(0 -9) scale(.96)');trans(tab,'transform 430ms cubic-bezier(.2,.8,.2,1),opacity 320ms ease');opacity(tab,1);later(30,function(){tab.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+480,function(){toast('Neuer Tab');});return;}
      if(mode==='closeTab'){later(actionAt,function(){var tab=$('.tab-two');trans(tab,'transform 430ms cubic-bezier(.2,.8,.2,1),opacity 320ms ease');tab.setAttribute('transform','translate(0 -10) scale(.96)');opacity(tab,0);});later(actionAt+480,function(){toast('Tab geschlossen');});return;}
      if(mode==='reopenTab'){later(actionAt,function(){var tab=$('.tab-two');tab.setAttribute('transform','translate(0 -10) scale(.96)');trans(tab,'transform 430ms cubic-bezier(.2,.8,.2,1),opacity 320ms ease');opacity(tab,1);later(30,function(){tab.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+480,function(){toast('Tab wieder geöffnet');});return;}
      if(mode==='addressBar'){later(actionAt,function(){var mark=$('.address-highlight');mark.setAttribute('transform','translate(-8 0) scale(.94 1)');trans(mark,'transform 420ms cubic-bezier(.2,.8,.2,1),opacity 340ms ease');opacity(mark,1);if($('.address-text')){trans($('.address-text'),'fill 420ms ease');$('.address-text').setAttribute('fill','#1e3a8a');}later(30,function(){mark.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+470,function(){toast('Adresse markiert');});return;}
      if(mode==='nextTab'||mode==='prevTab'){later(actionAt,function(){var one=$('.tab-one-bg'),two=$('.tab-two-bg');trans(one,'fill 440ms ease');trans(two,'fill 440ms ease');if(mode==='nextTab'){fill(one,'#dbe4ee');fill(two,'#fff');}else{fill(one,'#fff');fill(two,'#dbe4ee');}});later(actionAt+500,function(){toast(mode==='nextTab'?'Nächster Tab':'Vorheriger Tab');});return;}
      if(mode==='snip'){later(950,function(){var overlay=$('.snip-overlay');overlay.setAttribute('transform','scale(.985)');trans(overlay,'transform 420ms ease,opacity 380ms ease');opacity(overlay,1);later(30,function(){overlay.setAttribute('transform','scale(1)');});});later(1250,function(){trans($('.snip-box'),'width 520ms ease,height 520ms ease');$('.snip-box').setAttribute('width','180');$('.snip-box').setAttribute('height','104');});later(1900,function(){toast('Ausschnitt gewählt');});return;}
      if(mode==='appSwitch'){later(900,function(){var sw=$('.switcher');sw.setAttribute('transform','translate(0 12) scale(.96)');trans(sw,'transform 450ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');opacity(sw,1);later(30,function(){sw.setAttribute('transform','translate(0 0) scale(1)');});});later(1450,function(){trans($('.switch-a rect'),'stroke 380ms ease');trans($('.switch-b rect'),'stroke 380ms ease');$('.switch-a rect').setAttribute('stroke','#334155');$('.switch-b rect').setAttribute('stroke','#60a5fa');});later(1900,function(){toast('Zum Browser gewechselt');});return;}
      if(mode==='desktop'){later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 620ms cubic-bezier(.2,.8,.2,1),opacity 520ms ease');w.setAttribute('transform','translate(0 118) scale(.72)');opacity(w,0);});later(actionAt+680,function(){toast('Desktop sichtbar');});return;}
      if(mode==='lock'){later(actionAt,function(){var lock=$('.scene-lock');trans(lock,'opacity 520ms ease');opacity(lock,1);});later(actionAt+560,function(){toast('Computer gesperrt');});return;}
      if(mode==='explorer'){later(actionAt,function(){var panel=$('.explorer-window');panel.setAttribute('transform','translate(0 18) scale(.96)');trans(panel,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Explorer geöffnet');});return;}
      if(mode==='taskManager'){later(actionAt,function(){var panel=$('.task-manager');panel.setAttribute('transform','translate(0 18) scale(.96)');trans(panel,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Task-Manager geöffnet');});return;}
      if(mode==='clipboard'){later(actionAt,function(){var panel=$('.clipboard-panel');panel.setAttribute('transform','translate(16 0) scale(.97)');trans(panel,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+580,function(){toast('Verlauf geöffnet');});return;}
      if(mode==='closeWindow'){later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');w.setAttribute('transform','translate(0 -12) scale(.92)');opacity(w,0);});later(actionAt+580,function(){toast('Fenster geschlossen');});return;}
      if(mode==='snapLeft'||mode==='snapRight'){later(actionAt,function(){var w=$('.app-windows'),target=mode==='snapLeft'?$('.snap-left-window'):$('.snap-right-window');trans(w,'transform 420ms ease,opacity 320ms ease');w.setAttribute('transform',mode==='snapLeft'?'translate(-82 0) scale(.82)':'translate(82 0) scale(.82)');opacity(w,.12);target.setAttribute('transform',mode==='snapLeft'?'translate(-24 0) scale(.94)':'translate(24 0) scale(.94)');trans(target,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(target,1);later(30,function(){target.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast(mode==='snapLeft'?'Links angedockt':'Rechts angedockt');});return;}
      later(actionAt,applyEnd);
    }
    function run(){if(reduceMotion){showEndState();return;}reset();running=true;playMode();later(sceneLoopMs,function(){running=false;if(active&&autoLoop)run();});}
    function play(){active=true;run();}
    function setActive(v){active=Boolean(v);if(!active){clearTimers();running=false;return;}if(!running)run();}
    controller={play:play,reset:reset,setActive:setActive};
    reset();if(active)setActive(true);return controller;
  }

  window.createA4Scene=createA4Scene;
})();