(function(){
  'use strict';

  // All course sections and quests are intentionally accessible at all times.
  window.isQuestUnlocked=function(){return true;};

  function installChordKeyHoldStyles(){
    if(document.getElementById('tk2-chord-key-hold'))return;
    var style=document.createElement('style');
    style.id='tk2-chord-key-hold';
    style.textContent=''
      // A1: keep Ctrl visibly held for the whole chord, including Ctrl+Shift+V.
      +'.tk2-doc-scene .keys:has(.tk2-key:not(:first-of-type)[style*="drop-shadow"]) .tk2-key:first-of-type,'
      +'.tk2-utility-scene .keys:has(.tk2-u-key:not(:first-of-type)[style*="drop-shadow"]) .tk2-u-key:first-of-type{filter:drop-shadow(0 0 11px rgba(56,189,248,.95))!important}'
      +'.tk2-doc-scene .keys:has(.tk2-key:not(:first-of-type)[style*="drop-shadow"]) .tk2-key:first-of-type rect,'
      +'.tk2-utility-scene .keys:has(.tk2-u-key:not(:first-of-type)[style*="drop-shadow"]) .tk2-u-key:first-of-type rect{fill:#1d4ed8!important;stroke:#93c5fd!important;stroke-width:2!important}'
      +'.tk2-doc-scene .tk2-key[style*="drop-shadow"] rect,'
      +'.tk2-utility-scene .tk2-u-key[style*="drop-shadow"] rect{fill:#1d4ed8!important;stroke:#93c5fd!important;stroke-width:2!important}'
      +'.tk2-doc-scene .keys:has(.tk2-key:nth-of-type(3)[style*="drop-shadow"]) .tk2-key:nth-of-type(2){filter:drop-shadow(0 0 11px rgba(56,189,248,.95))!important}'
      +'.tk2-doc-scene .keys:has(.tk2-key:nth-of-type(3)[style*="drop-shadow"]) .tk2-key:nth-of-type(2) rect{fill:#1d4ed8!important;stroke:#93c5fd!important;stroke-width:2!important}'
      // A2: AltGr stays visibly active while the character key is pressed.
      +'.tk2-altgr-scene .keys:has(.key-main[style*="drop-shadow"]) .key-alt{filter:drop-shadow(0 0 12px rgba(245,158,11,.98))!important}'
      +'.tk2-altgr-scene .keys:has(.key-main[style*="drop-shadow"]) .key-alt rect,'
      +'.tk2-altgr-scene .key[style*="drop-shadow"] rect{fill:#78350f!important;stroke:#fbbf24!important;stroke-opacity:1!important;stroke-width:2.5!important}';
    document.head.appendChild(style);
  }

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

  installChordKeyHoldStyles();

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
