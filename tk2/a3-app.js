(function(){
  'use strict';

  var STORAGE_KEY='tk_a3_progress_v1';

  function byId(id){return document.getElementById(id);}
  function parseProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){return{};}}
  function getScores(){return typeof getQuestScores==='function'?getQuestScores():{};}
  function saveProgress(progress){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));
    if(window.tk2Pdf&&typeof window.tk2Pdf.sync==='function')window.tk2Pdf.sync();
  }
  function hasLegacyCompletion(progress){
    var second=progress&&progress.second;
    var oldSecondDone=(typeof second==='string'&&second.trim().length>0)||(typeof second==='number'&&isFinite(second));
    return oldSecondDone||(getScores().q7||0)>=100;
  }
  function migrateProgress(){
    var progress=parseProgress();
    if(progress.completed===true)return progress;
    if(!hasLegacyCompletion(progress))return progress;

    // Die alte A3-Pizza-Aufgabe war anspruchsvoller als das heutige Merkblatt.
    // Wer sie bereits abgeschlossen hatte, behält deshalb den A3-Abschluss.
    progress.completed=true;
    progress.migratedFromLegacy=true;
    progress.rewarded=true; // verhindert doppelte 50 XP nach der Migration
    saveProgress(progress);
    if(typeof saveQuestScore==='function')saveQuestScore('q7',100);
    return progress;
  }

  function markCompleted(){
    var progress=migrateProgress();
    var alreadyCompleted=progress.completed===true||(getScores().q7||0)>=100;

    progress.downloaded=true;
    progress.completed=true;
    if(!progress.completedAt)progress.completedAt=new Date().toISOString();

    if(!progress.rewarded&&!alreadyCompleted){
      if(typeof addGlobalXP==='function')addGlobalXP(50);
      progress.rewarded=true;
    }else if(alreadyCompleted){
      progress.rewarded=true;
    }

    if(typeof saveQuestScore==='function')saveQuestScore('q7',100);
    saveProgress(progress);
    showCompleted();
  }

  function showCompleted(){
    var card=byId('completion-card');
    if(card)card.classList.add('is-visible');
  }

  document.addEventListener('DOMContentLoaded',function(){
    var progress=migrateProgress();
    if(progress.completed){
      if(typeof saveQuestScore==='function')saveQuestScore('q7',100);
      showCompleted();
    }

    var download=byId('theory-download');
    if(download)download.addEventListener('click',markCompleted);
  });
})();
