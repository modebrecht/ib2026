(function(){
  'use strict';

  var startTime=0;
  var timerId=null;
  var running=false;

  function byId(id){return document.getElementById(id);}
  function formatTime(ms){
    var totalSeconds=Math.max(0,Math.floor(ms/1000));
    var minutes=Math.floor(totalSeconds/60);
    var seconds=totalSeconds%60;
    return String(minutes).padStart(2,'0')+':'+String(seconds).padStart(2,'0');
  }
  function render(){if(running)byId('boss-timer').textContent=formatTime(Date.now()-startTime);}

  function startBossChallenge(){
    if(running)return;
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
    byId('boss-timer').textContent=formatTime(elapsed);
    byId('start-boss-btn').style.display='inline-flex';
    byId('start-boss-btn').textContent='↻ Noch einmal messen';
    byId('stop-boss-btn').style.display='none';
    byId('timer-box').classList.remove('is-running');
    byId('result-time-msg').style.display='block';
    byId('result-time-value').textContent=formatTime(elapsed);
    byId('completion-panel').style.display='block';

    addGlobalXP(50);
    saveQuestScore('q7',100);
  }

  document.addEventListener('DOMContentLoaded',function(){
    var unlocked=isQuestUnlocked('q7');
    byId('a3-lock-screen').style.display=unlocked?'none':'flex';
    byId('a3-content-wrap').style.display=unlocked?'block':'none';

    var done=(getQuestScores().q7||0)>=100;
    if(done){
      byId('completion-panel').style.display='block';
      byId('completion-note').textContent='Diese Praxisaufgabe wurde bereits abgeschlossen. Du kannst die Zeit trotzdem erneut messen.';
    }
  });

  window.startBossChallenge=startBossChallenge;
  window.stopBossChallenge=stopBossChallenge;
})();
