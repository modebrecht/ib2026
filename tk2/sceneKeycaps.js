(function(){
  'use strict';

  var PROFILES={
    doc:{step:150,hold:240,duration:160},
    utility:{step:115,hold:170,duration:100}
  };

  function profile(name){return PROFILES[name]||PROFILES.utility;}
  function baseOf(key){return key.getAttribute('data-base')||'';}

  function down(key,trans,name){
    if(!key)return;
    var p=profile(name);
    var base=baseOf(key);
    if(typeof trans==='function')trans(key,'transform '+p.duration+'ms ease, filter '+p.duration+'ms ease');
    else key.style.transition='transform '+p.duration+'ms ease, filter '+p.duration+'ms ease';
    key.setAttribute('transform',base+' translate(0 4)');
    key.style.filter='drop-shadow(0 0 8px rgba(56,189,248,.75))';
  }

  function up(key){
    if(!key)return;
    key.setAttribute('transform',baseOf(key));
    key.style.filter='';
  }

  function reset(key){
    if(!key)return;
    key.style.transition='none';
    key.style.filter='';
    key.setAttribute('transform',baseOf(key));
  }

  function resetMany(keys){Array.from(keys||[]).forEach(reset);}

  function pressSequence(keys,later,trans,name){
    var p=profile(name);
    Array.from(keys||[]).forEach(function(key,index){
      later(index*p.step,function(){
        down(key,trans,name);
        later(p.hold,function(){up(key);});
      });
    });
  }

  window.tk2SceneKeycaps={down:down,up:up,reset:reset,resetMany:resetMany,pressSequence:pressSequence};
})();
