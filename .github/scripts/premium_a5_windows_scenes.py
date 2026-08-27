from pathlib import Path

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

# Windows scenes need a longer readable loop than browser/document scenes.
s=s.replace("var mode=options.mode||'newTab',cfg=CONFIG[mode]||CONFIG.newTab,active=options.autoplay!==false,autoLoop=options.loop!==false,reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,uid='tk2a4'+(++counter),timers=[],running=false,controller=null;",
            "var mode=options.mode||'newTab',cfg=CONFIG[mode]||CONFIG.newTab,active=options.autoplay!==false,autoLoop=options.loop!==false,reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,uid='tk2a4'+(++counter),timers=[],running=false,controller=null,sceneLoopMs=cfg.family==='windows'?5600:LOOP_MS;",1)

old_reset="function reset(){clearTimers();running=false;window.tk2SceneKeycaps.resetMany($$('.tk2-key, .tk2-u-key'));opacity($('.toast'),0);if($('.bold-word'))$('.bold-word').setAttribute('font-weight','400');opacity($('.bold-selection'),0);opacity($('.new-doc-sheet'),0);var tabsVisible=['closeTab','nextTab','prevTab'].indexOf(mode)>=0;opacity($('.tab-two'),tabsVisible?1:0);opacity($('.tab-new'),0);opacity($('.refresh-ring'),0);opacity($('.address-highlight'),0);if($('.address-text'))$('.address-text').setAttribute('fill','#64748b');if($('.page-content'))opacity($('.page-content'),1);fill($('.tab-one-bg'),mode==='prevTab'?'#dbe4ee':'#fff');fill($('.tab-two-bg'),mode==='prevTab'?'#fff':'#dbe4ee');opacity($('.scene-lock'),0);opacity($('.app-windows'),1);opacity($('.explorer-window'),0);opacity($('.snip-overlay'),0);if($('.snip-box')){$('.snip-box').setAttribute('width','0');$('.snip-box').setAttribute('height','0');}opacity($('.switcher'),0);opacity($('.task-manager'),0);opacity($('.clipboard-panel'),0);opacity($('.snap-left-window'),0);opacity($('.snap-right-window'),0);if($('.switch-a rect'))$('.switch-a rect').setAttribute('stroke','#60a5fa');if($('.switch-b rect'))$('.switch-b rect').setAttribute('stroke','#334155');}"
new_reset="function reset(){clearTimers();running=false;window.tk2SceneKeycaps.resetMany($$('.tk2-key, .tk2-u-key'));opacity($('.toast'),0);if($('.bold-word'))$('.bold-word').setAttribute('font-weight','400');opacity($('.bold-selection'),0);opacity($('.new-doc-sheet'),0);var tabsVisible=['closeTab','nextTab','prevTab'].indexOf(mode)>=0;opacity($('.tab-two'),tabsVisible?1:0);opacity($('.tab-new'),0);opacity($('.refresh-ring'),0);opacity($('.address-highlight'),0);if($('.address-text'))$('.address-text').setAttribute('fill','#64748b');if($('.page-content'))opacity($('.page-content'),1);fill($('.tab-one-bg'),mode==='prevTab'?'#dbe4ee':'#fff');fill($('.tab-two-bg'),mode==='prevTab'?'#fff':'#dbe4ee');opacity($('.scene-lock'),0);opacity($('.app-windows'),1);opacity($('.explorer-window'),0);opacity($('.snip-overlay'),0);if($('.snip-box')){$('.snip-box').setAttribute('width','0');$('.snip-box').setAttribute('height','0');}opacity($('.switcher'),0);opacity($('.task-manager'),0);opacity($('.clipboard-panel'),0);opacity($('.snap-left-window'),0);opacity($('.snap-right-window'),0);[$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')].forEach(function(el){if(!el)return;trans(el,'none');el.setAttribute('transform','translate(0 0) scale(1)');});if($('.switch-a rect'))$('.switch-a rect').setAttribute('stroke','#60a5fa');if($('.switch-b rect'))$('.switch-b rect').setAttribute('stroke','#334155');}"
assert old_reset in s
s=s.replace(old_reset,new_reset,1)

old_play="""      if(mode==='refresh'){later(980,function(){opacity($('.page-content'),.25);opacity($('.refresh-ring'),1);});later(1670,function(){opacity($('.refresh-ring'),0);opacity($('.page-content'),1);toast('Seite aktualisiert');});return;}
      if(mode==='snip'){later(950,function(){opacity($('.snip-overlay'),1);});later(1250,function(){trans($('.snip-box'),'width 520ms ease,height 520ms ease');$('.snip-box').setAttribute('width','180');$('.snip-box').setAttribute('height','104');});later(1900,function(){toast('Ausschnitt gewählt');});return;}
      if(mode==='appSwitch'){later(900,function(){opacity($('.switcher'),1);});later(1450,function(){$('.switch-a rect').setAttribute('stroke','#334155');$('.switch-b rect').setAttribute('stroke','#60a5fa');toast('Zum Browser gewechselt');});return;}
      later(actionAt,applyEnd);
    }
    function run(){if(reduceMotion){showEndState();return;}reset();running=true;playMode();later(LOOP_MS,function(){running=false;if(active&&autoLoop)run();});}"""
new_play="""      if(mode==='refresh'){later(980,function(){opacity($('.page-content'),.25);opacity($('.refresh-ring'),1);});later(1670,function(){opacity($('.refresh-ring'),0);opacity($('.page-content'),1);toast('Seite aktualisiert');});return;}
      if(mode==='snip'){later(950,function(){opacity($('.snip-overlay'),1);});later(1250,function(){trans($('.snip-box'),'width 520ms ease,height 520ms ease');$('.snip-box').setAttribute('width','180');$('.snip-box').setAttribute('height','104');});later(1900,function(){toast('Ausschnitt gewählt');});return;}
      if(mode==='appSwitch'){later(900,function(){opacity($('.switcher'),1);});later(1450,function(){$('.switch-a rect').setAttribute('stroke','#334155');$('.switch-b rect').setAttribute('stroke','#60a5fa');toast('Zum Browser gewechselt');});return;}
      if(mode==='desktop'){later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 620ms cubic-bezier(.2,.8,.2,1),opacity 520ms ease');w.setAttribute('transform','translate(0 118) scale(.72)');opacity(w,0);});later(actionAt+680,function(){toast('Desktop sichtbar');});return;}
      if(mode==='lock'){later(actionAt,function(){var lock=$('.scene-lock');trans(lock,'opacity 520ms ease');opacity(lock,1);});later(actionAt+560,function(){toast('Computer gesperrt');});return;}
      if(mode==='explorer'){later(actionAt,function(){var panel=$('.explorer-window');panel.setAttribute('transform','translate(0 18) scale(.96)');trans(panel,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Explorer geöffnet');});return;}
      if(mode==='taskManager'){later(actionAt,function(){var panel=$('.task-manager');panel.setAttribute('transform','translate(0 18) scale(.96)');trans(panel,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Task-Manager geöffnet');});return;}
      if(mode==='clipboard'){later(actionAt,function(){var panel=$('.clipboard-panel');panel.setAttribute('transform','translate(16 0) scale(.97)');trans(panel,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+580,function(){toast('Verlauf geöffnet');});return;}
      if(mode==='closeWindow'){later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');w.setAttribute('transform','translate(0 -12) scale(.92)');opacity(w,0);});later(actionAt+580,function(){toast('Fenster geschlossen');});return;}
      if(mode==='snapLeft'||mode==='snapRight'){later(actionAt,function(){var w=$('.app-windows'),target=mode==='snapLeft'?$('.snap-left-window'):$('.snap-right-window');trans(w,'transform 420ms ease,opacity 320ms ease');w.setAttribute('transform',mode==='snapLeft'?'translate(-82 0) scale(.82)':'translate(82 0) scale(.82)');opacity(w,.12);target.setAttribute('transform',mode==='snapLeft'?'translate(-24 0) scale(.94)':'translate(24 0) scale(.94)');trans(target,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(target,1);later(30,function(){target.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast(mode==='snapLeft'?'Links angedockt':'Rechts angedockt');});return;}
      later(actionAt,applyEnd);
    }
    function run(){if(reduceMotion){showEndState();return;}reset();running=true;playMode();later(sceneLoopMs,function(){running=false;if(active&&autoLoop)run();});}"""
assert old_play in s
s=s.replace(old_play,new_play,1)

# Give maximize/minimize the same readable hold cadence.
s=s.replace("later(3900,function(){running=false;if(active&&autoLoop)run();});","later(5200,function(){running=false;if(active&&autoLoop)run();});",1)

# Hard checks
assert "sceneLoopMs=cfg.family==='windows'?5600:LOOP_MS" in s
assert "mode==='desktop'" in s and "translate(0 118) scale(.72)" in s
assert "mode==='snapLeft'||mode==='snapRight'" in s
assert "later(5200,function(){running=false;if(active&&autoLoop)run();});" in s
p.write_text(s,encoding='utf-8')
print('Premium A5 Windows scene motion applied')
