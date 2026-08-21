(function(){
  'use strict';

  // All course sections and quests are intentionally accessible at all times.
  window.isQuestUnlocked=function(){return true;};

  function openIndexCards(){
    document.querySelectorAll('.module[id^="module-a"]').forEach(function(card){
      card.classList.remove('locked');
      var state=card.querySelector('.module-state');
      if(state&&!card.classList.contains('done'))state.textContent='offen';
      var btn=card.querySelector('.module-btn');
      if(btn){
        btn.removeAttribute('aria-disabled');
        btn.style.display='inline-flex';
        var id=(card.id||'').replace('module-','').toUpperCase();
        if(/^A[1-6]$/.test(id))btn.textContent=id+' öffnen ➔';
      }
    });
  }

  document.addEventListener('DOMContentLoaded',function(){
    openIndexCards();

    ['a2-lock-screen','a3-lock-screen'].forEach(function(id){
      var el=document.getElementById(id);
      if(el)el.style.display='none';
    });
    ['a2-content-wrap','a3-content-wrap'].forEach(function(id){
      var el=document.getElementById(id);
      if(el)el.style.display='block';
    });
  });
})();
