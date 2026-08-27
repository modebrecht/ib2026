(function(){
  'use strict';

  var baseCreate=window.createA4Scene;
  if(typeof baseCreate!=='function')return;

  var activeController=null;
  var sceneCounter=0;

  function normalizeKey(text){return String(text||'').replace(/\s+/g,' ').trim();}

  function createWindowScene(container,type,options){
    options=options||{};
    var active=options.autoplay!==false;
    var loop=options.loop!==false;
    var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timers=[];
    var running=false;
    var controller=null;
    var uid='a5Window'+(++sceneCounter);
    var isMax=type==='maximize';

    container.innerHTML=''
      +'<svg data-a5-window-scene="'+type+'" viewBox="0 0 680 320" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Animation: '+(isMax?'Fenster maximieren':'Fenster verkleinern oder minimieren')+'">'
      +'<defs><filter id="'+uid+'Shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="8" stdDeviation="9" flood-color="#020617" flood-opacity=".38"/></filter></defs>'
      +'<rect width="680" height="320" rx="24" fill="#07101f"/>'
      +'<g class="desktop" filter="url(#'+uid+'Shadow)"><rect x="28" y="25" width="365" height="255" rx="17" fill="#0b5ea8"/><circle cx="315" cy="83" r="94" fill="#60a5fa" opacity=".34"/><rect x="28" y="245" width="365" height="35" fill="#111827" opacity=".94"/><circle cx="205" cy="262" r="10" fill="#2563eb"/></g>'
      +'<g class="window" filter="url(#'+uid+'Shadow)"><rect class="win-body" x="112" y="58" width="225" height="158" rx="12" fill="#f8fafc"/><rect class="win-top" x="112" y="58" width="225" height="28" rx="12" fill="#dbe4ee"/><rect class="win-top-fill" x="112" y="72" width="225" height="14" fill="#dbe4ee"/><text class="win-title" x="130" y="77" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Dokument</text><rect class="line1" x="138" y="112" width="130" height="10" rx="5" fill="#334155"/><rect class="line2" x="138" y="140" width="170" height="7" rx="3.5" fill="#94a3b8"/><rect class="line3" x="138" y="158" width="150" height="7" rx="3.5" fill="#94a3b8"/></g>'
      +'<g class="direction" opacity="0"><circle cx="485" cy="133" r="42" fill="#1d4ed8" opacity=".22"/><path d="'+(isMax?'M485 154V111M469 127l16-16 16 16':'M485 111v43M469 138l16 16 16-16')+'" fill="none" stroke="#93c5fd" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>'
      +'<g class="key-row" transform="translate(449 225)"><g class="key win-key"><rect width="70" height="43" rx="10" fill="#172033" stroke="#475569" stroke-width="1.5"/><text x="35" y="27" text-anchor="middle" font-family="Arial" font-size="14" font-weight="800" fill="#dbeafe">Win</text></g><text x="83" y="27" font-family="Arial" font-size="16" font-weight="900" fill="#64748b">+</text><g class="key arrow-key" transform="translate(102 0)"><rect width="55" height="43" rx="10" fill="#172033" stroke="#475569" stroke-width="1.5"/><text x="27.5" y="28" text-anchor="middle" font-family="Arial" font-size="20" font-weight="800" fill="#dbeafe">'+(isMax?'↑':'↓')+'</text></g></g>'
      +'<g class="toast" transform="translate(470 30)" opacity="0"><rect width="170" height="32" rx="16" fill="#052e2b" stroke="#10b981"/><text x="85" y="21" text-anchor="middle" font-family="Arial" font-size="10" font-weight="800" fill="#a7f3d0">'+(isMax?'Fenster maximiert':'Fenster minimiert')+'</text></g>'
      +'</svg>';

    var svg=container.querySelector('svg');
    var win=svg.querySelector('.window');
    var direction=svg.querySelector('.direction');
    var toast=svg.querySelector('.toast');
    var keys=Array.from(svg.querySelectorAll('.key'));

    function later(ms,fn){timers.push(window.setTimeout(fn,ms));}
    function clearTimers(){timers.forEach(window.clearTimeout);timers=[];}
    function setOpacity(el,val){if(el)el.setAttribute('opacity',String(val));}
    function setTransform(el,val){if(el)el.setAttribute('transform',val);}
    function transition(el,val){if(el)el.style.transition=reduceMotion?'none':val;}

    function keyDown(key){transition(key,'transform 150ms ease,filter 150ms ease');var base=key===keys[1]?'translate(102 0)':'';setTransform(key,base+' translate(0 4)');key.style.filter='drop-shadow(0 0 8px rgba(96,165,250,.8))';}
    function keyUp(key){transition(key,'transform 140ms ease,filter 140ms ease');setTransform(key,key===keys[1]?'translate(102 0)':'');key.style.filter='';}

    function reset(){
      clearTimers();running=false;
      transition(win,'none');
      setOpacity(win,1);setOpacity(direction,0);setOpacity(toast,0);
      setTransform(win,isMax?'translate(0 0) scale(1)':'translate(-38 -20) scale(1.24 1.16)');
      keys.forEach(keyUp);
    }

    function showEnd(){
      reset();
      transition(win,'none');
      if(isMax){setTransform(win,'translate(-61 -31) scale(1.5 1.42)');}
      else{setTransform(win,'translate(126 186) scale(.20 .12)');setOpacity(win,.18);}
      setOpacity(direction,1);setOpacity(toast,1);
    }

    function run(){
      if(reduceMotion){showEnd();return;}
      reset();running=true;
      later(350,function(){setOpacity(direction,1);keyDown(keys[0]);});
      later(540,function(){keyDown(keys[1]);});
      later(870,function(){keyUp(keys[1]);keyUp(keys[0]);});
      later(930,function(){
        transition(win,'transform 650ms cubic-bezier(.2,.8,.2,1),opacity 520ms ease');
        if(isMax){setTransform(win,'translate(-61 -31) scale(1.5 1.42)');}
        else{setTransform(win,'translate(126 186) scale(.20 .12)');setOpacity(win,.18);}
      });
      later(1650,function(){setOpacity(toast,1);});
      later(3900,function(){running=false;if(active&&loop)run();});
    }

    function play(){active=true;if(activeController&&activeController!==controller)activeController.setActive(false);activeController=controller;run();}
    function setActive(value){active=Boolean(value);if(!active){if(activeController===controller)activeController=null;clearTimers();running=false;return;}if(activeController&&activeController!==controller)activeController.setActive(false);activeController=controller;if(!running)run();}

    controller={play:play,reset:reset,setActive:setActive};
    reset();if(active)setActive(true);
    return controller;
  }

  window.createA4Scene=function(container,options){
    var card=container&&container.closest?container.closest('.lesson-anim-card'):null;
    var keyText=card&&card.querySelector('kbd')?normalizeKey(card.querySelector('kbd').textContent):'';
    if(keyText==='Win + ↑')return createWindowScene(container,'maximize',options);
    if(keyText==='Win + ↓')return createWindowScene(container,'minimize',options);
    return baseCreate(container,options);
  };
})();
