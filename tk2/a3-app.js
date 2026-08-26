(function(){
  'use strict';

  var STORAGE_KEY='tk_a3_progress_v1';
  var SCHEMA_VERSION=2;
  var SHORTCUTS=[
    ['Ctrl + C','Kopieren'],['Ctrl + X','Ausschneiden'],['Ctrl + V','Einfügen'],['Ctrl + Shift + V','Ohne Formatierung einfügen'],
    ['Ctrl + Z','Rückgängig'],['Ctrl + Y','Wiederherstellen'],['Ctrl + S','Speichern'],['Ctrl + A','Alles markieren'],
    ['Ctrl + F','Suchen'],['Ctrl + H','Suchen und ersetzen'],['Ctrl + P','Drucken'],['Ctrl + O','Datei öffnen'],
    ['Ctrl + Home','Zum Anfang'],['Ctrl + End','Zum Ende']
  ];

  function byId(id){return document.getElementById(id);}
  function freshProgress(){return{schemaVersion:SCHEMA_VERSION,downloaded:false,choices:[{shortcut:'',reason:''},{shortcut:'',reason:''},{shortcut:'',reason:''}],completed:false,rewarded:false};}
  function parseProgress(){
    var progress;
    try{progress=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){progress={};}
    // Alte Pizza-Daten (first/second/q7) zählen bewusst nicht mehr als A3-Abschluss.
    if(!progress||progress.schemaVersion!==SCHEMA_VERSION)return freshProgress();
    if(!Array.isArray(progress.choices)||progress.choices.length!==3)progress.choices=freshProgress().choices;
    return progress;
  }
  function saveProgress(progress){
    progress.schemaVersion=SCHEMA_VERSION;
    localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));
    if(window.tk2Pdf&&typeof window.tk2Pdf.sync==='function')window.tk2Pdf.sync();
  }
  function choicesComplete(progress){
    var choices=progress.choices||[];
    if(choices.length!==3)return false;
    var shortcuts=choices.map(function(c){return(c.shortcut||'').trim();});
    if(shortcuts.some(function(v){return!v;}))return false;
    if(new Set(shortcuts).size!==3)return false;
    return choices.every(function(c){return(c.reason||'').trim().length>=2;});
  }
  function isCompleted(progress){return progress.downloaded===true&&choicesComplete(progress);}

  function renderCompleted(progress){
    var card=byId('completion-card'),hint=byId('choice-hint');
    if(card)card.classList.toggle('is-visible',progress.completed===true);
    if(hint){
      if(progress.completed)hint.textContent='✓ Merkblatt gesichert und drei persönliche Kürzel festgelegt.';
      else if(!progress.downloaded)hint.textContent='Lade zuerst das Merkblatt herunter und fülle danach alle drei Zeilen aus.';
      else hint.textContent='Merkblatt gesichert ✓ Jetzt noch drei unterschiedliche Kürzel mit je einem „weil …“ ausfüllen.';
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
    saveProgress(progress);
    renderCompleted(progress);
  }

  function fillSelects(progress){
    document.querySelectorAll('.shortcut-choice').forEach(function(select,index){
      SHORTCUTS.forEach(function(item){
        var option=document.createElement('option');
        option.value=item[0];
        option.textContent=item[0]+' · '+item[1];
        select.appendChild(option);
      });
      select.value=(progress.choices[index]&&progress.choices[index].shortcut)||'';
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    var progress=parseProgress();
    // Überschreibt alte Pizza-Strukturen erst mit dem neuen Schema, sobald A3 geöffnet wird.
    saveProgress(progress);
    fillSelects(progress);

    document.querySelectorAll('.shortcut-reason').forEach(function(input,index){
      input.value=(progress.choices[index]&&progress.choices[index].reason)||'';
    });

    var download=byId('theory-download');
    if(download)download.addEventListener('click',function(){
      progress.downloaded=true;
      if(!progress.downloadedAt)progress.downloadedAt=new Date().toISOString();
      evaluate(progress);
    });

    document.querySelectorAll('.shortcut-choice').forEach(function(select,index){
      select.addEventListener('change',function(){
        progress.choices[index].shortcut=select.value;
        evaluate(progress);
      });
    });
    document.querySelectorAll('.shortcut-reason').forEach(function(input,index){
      input.addEventListener('input',function(){
        progress.choices[index].reason=input.value;
        evaluate(progress);
      });
    });

    evaluate(progress);
  });
})();
