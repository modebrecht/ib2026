(function(){
  'use strict';

  var STORAGE_KEY='tk_a3_progress_v1';
  var QUEST_SCORES_KEY='tk_quest_scores_v1';
  var SCHEMA_VERSION=2;

  function byId(id){return document.getElementById(id);}
  function freshProgress(){return{schemaVersion:SCHEMA_VERSION,downloaded:false,onedriveStored:false,choices:[{shortcut:'',reason:''},{shortcut:'',reason:''},{shortcut:'',reason:''}],completed:false,rewarded:false};}
  function parseProgress(){
    var progress;
    try{progress=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){progress={};}
    // Alte Pizza-Daten (first/second/q7) zählen bewusst nicht mehr als A3-Abschluss.
    if(!progress||progress.schemaVersion!==SCHEMA_VERSION)return freshProgress();
    if(!Array.isArray(progress.choices)||progress.choices.length!==3)progress.choices=freshProgress().choices;
    if(typeof progress.onedriveStored!=='boolean')progress.onedriveStored=false;
    return progress;
  }
  function saveProgress(progress){
    progress.schemaVersion=SCHEMA_VERSION;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));
    if(window.tk2Pdf&&typeof window.tk2Pdf.sync==='function')window.tk2Pdf.sync();
  }
  function shortcutValid(shortcut){
    var text=(shortcut||'').trim();
    return text.length>=2&&/[A-Za-z0-9ÄÖÜäöü]/.test(text);
  }
  function duplicateKey(shortcut){
    return(shortcut||'').trim().replace(/\s+/g,'').toLowerCase();
  }
  function reasonValid(reason){
    var text=(reason||'').trim();
    return text.length>=5&&/[A-Za-zÄÖÜäöüß]/.test(text);
  }
  function choicesComplete(progress){
    var choices=progress.choices||[];
    if(choices.length!==3)return false;
    if(!choices.every(function(c){return shortcutValid(c.shortcut)&&reasonValid(c.reason);})){return false;}
    var keys=choices.map(function(c){return duplicateKey(c.shortcut);});
    return new Set(keys).size===3;
  }
  function isCompleted(progress){return progress.downloaded===true&&progress.onedriveStored===true&&choicesComplete(progress);}

  // q7 bleibt nur als technischer Kompatibilitätsmarker für die alte Root-Anzeige.
  // Ein historischer Pizza-q7 wird entfernt; 100 wird nur für die NEUE A3 vergeben.
  function syncCompatibilityScore(completed){
    try{
      var scores=JSON.parse(localStorage.getItem(QUEST_SCORES_KEY)||'{}');
      if(completed)scores.q7=100;
      else delete scores.q7;
      localStorage.setItem(QUEST_SCORES_KEY,JSON.stringify(scores));
    }catch(e){}
  }

  function ensureOneDriveStep(progress){
    if(byId('onedrive-step'))return;
    var download=byId('theory-download');
    if(!download)return;

    var style=document.createElement('style');
    style.id='a3-onedrive-style';
    style.textContent=''
      +'.onedrive-step{max-width:650px;margin:16px auto 0;padding:14px 16px;border-radius:14px;border:1px solid rgba(96,165,250,.28);background:rgba(37,99,235,.09);display:flex;gap:12px;align-items:flex-start;text-align:left;cursor:pointer}'
      +'.onedrive-step input{width:20px;height:20px;margin:2px 0 0;accent-color:#6366f1;flex:0 0 auto}'
      +'.onedrive-step strong{display:block;color:#dbeafe;font-size:.98rem}'
      +'.onedrive-step small{display:block;margin-top:4px;color:#94a3b8;line-height:1.45;font-size:.86rem}'
      +'.onedrive-step:has(input:checked){border-color:rgba(16,185,129,.42);background:rgba(16,185,129,.08)}'
      +'.onedrive-step:has(input:disabled){opacity:.62;cursor:not-allowed}';
    document.head.appendChild(style);

    var step=document.createElement('label');
    step.className='onedrive-step';
    step.id='onedrive-step';
    step.innerHTML='<input id="onedrive-confirm" type="checkbox"><span><strong>PDF in OneDrive abgelegt</strong><small>Erstelle in deinem OneDrive den Ordner „IB“ (falls er noch nicht existiert) und speichere die PDF dort.</small></span>';
    download.insertAdjacentElement('afterend',step);

    var checkbox=byId('onedrive-confirm');
    checkbox.checked=progress.onedriveStored===true;
    checkbox.disabled=progress.downloaded!==true;
    checkbox.addEventListener('change',function(){
      progress.onedriveStored=checkbox.checked;
      evaluate(progress);
    });
  }

  function syncOneDriveStep(progress){
    var checkbox=byId('onedrive-confirm');
    if(!checkbox)return;
    checkbox.checked=progress.onedriveStored===true;
    checkbox.disabled=progress.downloaded!==true;
  }

  function renderCompleted(progress){
    var card=byId('completion-card'),hint=byId('choice-hint');
    if(card)card.classList.toggle('is-visible',progress.completed===true);
    syncOneDriveStep(progress);
    if(hint){
      if(progress.completed)hint.textContent='✓ Merkblatt im OneDrive-Ordner „IB“ gesichert und drei persönliche Kürzel selbst eingetragen.';
      else if(!progress.downloaded)hint.textContent='Lade zuerst das Merkblatt herunter. Lege es danach im OneDrive-Ordner „IB“ ab und trage drei Kürzel ein.';
      else if(!progress.onedriveStored)hint.textContent='PDF heruntergeladen ✓ Lege sie jetzt im OneDrive-Ordner „IB“ ab und bestätige die Checkbox.';
      else hint.textContent='OneDrive erledigt ✓ Schreibe drei unterschiedliche Kürzel selbst auf und begründe jedes kurz (mind. 5 Zeichen).';
    }
  }

  function evaluate(progress){
    var wasCompleted=progress.completed===true;
    progress.completed=isCompleted(progress);
    if(progress.completed&&!wasCompleted){
      progress.completedAt=new Date().toISOString();
      if(!progress.rewarded&&typeof addGlobalXP==='function'){
        addGlobalXP(50);
        progress.rewarded=true;
      }
    }
    syncCompatibilityScore(progress.completed===true);
    saveProgress(progress);
    renderCompleted(progress);
  }

  document.addEventListener('DOMContentLoaded',function(){
    var progress=parseProgress();
    // Beim ersten Öffnen wird jede alte Pizza-Struktur durch das neue Schema ersetzt.
    saveProgress(progress);
    ensureOneDriveStep(progress);

    document.querySelectorAll('.shortcut-choice').forEach(function(input,index){
      input.value=(progress.choices[index]&&progress.choices[index].shortcut)||'';
      input.addEventListener('input',function(){
        progress.choices[index].shortcut=input.value;
        evaluate(progress);
      });
    });

    document.querySelectorAll('.shortcut-reason').forEach(function(input,index){
      input.value=(progress.choices[index]&&progress.choices[index].reason)||'';
      input.addEventListener('input',function(){
        progress.choices[index].reason=input.value;
        evaluate(progress);
      });
    });

    var download=byId('theory-download');
    if(download)download.addEventListener('click',function(){
      progress.downloaded=true;
      if(!progress.downloadedAt)progress.downloadedAt=new Date().toISOString();
      evaluate(progress);
    });

    evaluate(progress);
  });
})();
