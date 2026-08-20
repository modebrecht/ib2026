(function(){
  'use strict';

  var STORAGE_KEY='tk_a3_progress_v1';
  var startTime=0;
  var timerId=null;
  var running=false;

  function byId(id){return document.getElementById(id);}
  function parseProgress(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');}catch(e){return{};}}
  function saveProgress(progress){localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));if(window.tk2Pdf&&typeof window.tk2Pdf.sync==='function')window.tk2Pdf.sync();}
  function formatTime(ms){
    var totalSeconds=Math.max(0,Math.floor(ms/1000));
    var minutes=Math.floor(totalSeconds/60);
    var seconds=totalSeconds%60;
    return String(minutes).padStart(2,'0')+':'+String(seconds).padStart(2,'0');
  }
  function render(){if(running)byId('boss-timer').textContent=formatTime(Date.now()-startTime);}
  function legacyRewardAlreadyGranted(){return typeof getQuestScores==='function'&&(getQuestScores().q7||0)>=100;}

  function ensureCompletionReward(progress){
    if(progress.rewarded)return;
    if(!legacyRewardAlreadyGranted())addGlobalXP(50);
    progress.rewarded=true;
    progress.completed=true;
    saveProgress(progress);
  }

  function showFirstReady(progress){
    byId('boss-timer').textContent=progress.first||'00:00';
    byId('run-instruction').textContent='Durchlauf 2: Öffne zuerst eine frische, ungelöste Kopie. Dann Maus weglegen und möglichst nur Tastenkürzel verwenden.';
    byId('start-boss-btn').style.display='inline-flex';
    byId('start-boss-btn').textContent='▶ 2. Durchlauf starten';
    byId('stop-boss-btn').style.display='none';
    byId('result-time-msg').style.display='block';
    byId('result-prefix').textContent='1. Durchlauf: ';
    byId('result-time-value').textContent=progress.first;
    byId('result-next').textContent=' gespeichert. Öffne die Datei jetzt frisch für Durchlauf 2.';
    byId('completion-panel').style.display='none';
  }

  function showCompleted(progress){
    ensureCompletionReward(progress);
    byId('boss-timer').textContent=progress.second||'00:00';
    byId('run-instruction').textContent='Beide Durchläufe sind abgeschlossen. Vergleiche jetzt dein Arbeiten mit und ohne Maus.';
    byId('start-boss-btn').style.display='none';
    byId('stop-boss-btn').style.display='none';
    byId('result-time-msg').style.display='block';
    byId('result-prefix').textContent='2. Durchlauf ohne Maus: ';
    byId('result-time-value').textContent=progress.second;
    byId('result-next').textContent=' · 1. Durchlauf: '+progress.first;
    byId('completion-panel').style.display='block';
    byId('completion-note').textContent='1. Durchlauf: '+progress.first+' · 2. Durchlauf ohne Maus: '+progress.second+'. Vergleiche nicht nur die Zeit, sondern auch wie flüssig du gearbeitet hast.';
  }

  function showInitial(){
    byId('boss-timer').textContent='00:00';
    byId('run-instruction').textContent='Durchlauf 1: Maus ist erlaubt. Starte den Timer erst, wenn das Dokument bereit ist.';
    byId('start-boss-btn').style.display='inline-flex';
    byId('start-boss-btn').textContent='▶ 1. Durchlauf starten';
    byId('stop-boss-btn').style.display='none';
    byId('result-time-msg').style.display='none';
    byId('completion-panel').style.display='none';
  }

  function refreshFromProgress(){
    var progress=parseProgress();
    if(progress.second){showCompleted(progress);return;}
    if(progress.first){showFirstReady(progress);return;}
    showInitial();
  }

  function startBossChallenge(){
    if(running)return;
    var progress=parseProgress();
    if(progress.second)return;
    running=true;
    startTime=Date.now();
    byId('boss-timer').textContent='00:00';
    byId('start-boss-btn').style.display='none';
    byId('stop-boss-btn').style.display='inline-flex';
    byId('result-time-msg').style.display='none';
    byId('completion-panel').style.display='none';
    byId('timer-box').classList.add('is-running');
    timerId=window.setInterval(render,250);
  }

  function stopBossChallenge(){
    if(!running)return;
    running=false;
    if(timerId){window.clearInterval(timerId);timerId=null;}
    var elapsed=Date.now()-startTime;
    var text=formatTime(elapsed);
    var progress=parseProgress();
    byId('timer-box').classList.remove('is-running');

    if(!progress.first){
      progress.first=text;
      progress.firstMs=elapsed;
      progress.attempts=1;
      saveProgress(progress);
      showFirstReady(progress);
      return;
    }

    progress.second=text;
    progress.secondMs=elapsed;
    progress.attempts=2;
    progress.completed=true;
    showCompleted(progress);
  }

  document.addEventListener('DOMContentLoaded',function(){
    var unlocked=isQuestUnlocked('q7');
    byId('a3-lock-screen').style.display=unlocked?'none':'flex';
    byId('a3-content-wrap').style.display=unlocked?'block':'none';

    var links=document.querySelectorAll('.top-bar .back-link');
    if(links.length>1)links[1].setAttribute('href','index.html');
    var next=document.querySelector('#completion-panel .btn-next');
    if(next)next.setAttribute('href','A4.html');

    if(unlocked)refreshFromProgress();
  });

  window.startBossChallenge=startBossChallenge;
  window.stopBossChallenge=stopBossChallenge;
})();
