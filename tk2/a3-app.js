(function(){
  'use strict';

  var STORAGE_KEY='tk_a3_progress_v1';

  function byId(id){return document.getElementById(id);}
  function parseProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){return{};}}
  function saveProgress(progress){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));
    if(window.tk2Pdf&&typeof window.tk2Pdf.sync==='function')window.tk2Pdf.sync();
  }

  function markCompleted(){
    var progress=parseProgress();
    progress.downloaded=true;
    progress.completed=true;

    if(typeof saveQuestScore==='function')saveQuestScore('q7',100);

    if(!progress.rewarded){
      if(typeof addGlobalXP==='function')addGlobalXP(50);
      progress.rewarded=true;
    }

    saveProgress(progress);
    showCompleted();
  }

  function showCompleted(){
    var card=byId('completion-card');
    if(card)card.classList.add('is-visible');
  }

  document.addEventListener('DOMContentLoaded',function(){
    var unlocked=typeof isQuestUnlocked==='function'?isQuestUnlocked('q7'):true;
    var lock=byId('a3-lock-screen');
    var content=byId('a3-content-wrap');

    if(lock)lock.style.display=unlocked?'none':'flex';
    if(content)content.style.display=unlocked?'block':'none';
    if(!unlocked)return;

    var progress=parseProgress();
    if(progress.completed){
      if(typeof saveQuestScore==='function')saveQuestScore('q7',100);
      showCompleted();
    }

    var download=byId('theory-download');
    if(download)download.addEventListener('click',markCompleted);
  });
})();
