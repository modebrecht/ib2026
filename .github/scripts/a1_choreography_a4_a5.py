from pathlib import Path

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

old_reset="function reset(){clearTimers();running=false;window.tk2SceneKeycaps.resetMany($$('.tk2-key, .tk2-u-key'));opacity($('.toast'),0);if($('.bold-word'))$('.bold-word').setAttribute('font-weight','400');opacity($('.bold-selection'),0);opacity($('.new-doc-sheet'),0);var tabsVisible=['closeTab','nextTab','prevTab'].indexOf(mode)>=0;opacity($('.tab-two'),tabsVisible?1:0);opacity($('.tab-new'),0);opacity($('.refresh-ring'),0);opacity($('.address-highlight'),0);if($('.address-text'))$('.address-text').setAttribute('fill','#64748b');if($('.page-content'))opacity($('.page-content'),1);fill($('.tab-one-bg'),mode==='prevTab'?'#dbe4ee':'#fff');fill($('.tab-two-bg'),mode==='prevTab'?'#fff':'#dbe4ee');opacity($('.scene-lock'),0);opacity($('.app-windows'),1);opacity($('.explorer-window'),0);opacity($('.snip-overlay'),0);if($('.snip-box')){$('.snip-box').setAttribute('width','0');$('.snip-box').setAttribute('height','0');}opacity($('.switcher'),0);opacity($('.task-manager'),0);opacity($('.clipboard-panel'),0);opacity($('.snap-left-window'),0);opacity($('.snap-right-window'),0);[$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')].forEach(function(el){if(!el)return;trans(el,'none');el.setAttribute('transform','translate(0 0) scale(1)');});if($('.switch-a rect'))$('.switch-a rect').setAttribute('stroke','#60a5fa');if($('.switch-b rect'))$('.switch-b rect').setAttribute('stroke','#334155');}"
new_reset="function reset(){clearTimers();running=false;window.tk2SceneKeycaps.resetMany($$('.tk2-key, .tk2-u-key'));opacity($('.toast'),0);if($('.bold-word'))$('.bold-word').setAttribute('font-weight','400');opacity($('.bold-selection'),0);opacity($('.new-doc-sheet'),0);var tabsVisible=['closeTab','nextTab','prevTab'].indexOf(mode)>=0;opacity($('.tab-two'),tabsVisible?1:0);opacity($('.tab-new'),0);opacity($('.refresh-ring'),0);opacity($('.address-highlight'),0);if($('.address-text'))$('.address-text').setAttribute('fill','#64748b');if($('.page-content'))opacity($('.page-content'),1);fill($('.tab-one-bg'),mode==='prevTab'?'#dbe4ee':'#fff');fill($('.tab-two-bg'),mode==='prevTab'?'#fff':'#dbe4ee');opacity($('.scene-lock'),0);opacity($('.app-windows'),1);opacity($('.explorer-window'),0);opacity($('.snip-overlay'),0);if($('.snip-box')){$('.snip-box').setAttribute('width','0');$('.snip-box').setAttribute('height','0');}opacity($('.switcher'),0);opacity($('.task-manager'),0);opacity($('.clipboard-panel'),0);opacity($('.snap-left-window'),0);opacity($('.snap-right-window'),0);[$('.new-doc-sheet'),$('.tab-new'),$('.tab-two'),$('.address-highlight'),$('.switcher'),$('.snip-overlay'),$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')].forEach(function(el){if(!el)return;trans(el,'none');el.setAttribute('transform','translate(0 0) scale(1)');});if($('.switch-a rect')){$('.switch-a rect').style.transition='none';$('.switch-a rect').setAttribute('stroke','#60a5fa');}if($('.switch-b rect')){$('.switch-b rect').style.transition='none';$('.switch-b rect').setAttribute('stroke','#334155');}}"
assert old_reset in s, 'reset block not found'
s=s.replace(old_reset,new_reset,1)

old_play="""      if(mode==='refresh'){later(980,function(){opacity($('.page-content'),.25);opacity($('.refresh-ring'),1);});later(1670,function(){opacity($('.refresh-ring'),0);opacity($('.page-content'),1);toast('Seite aktualisiert');});return;}
      if(mode==='snip'){later(950,function(){opacity($('.snip-overlay'),1);});later(1250,function(){trans($('.snip-box'),'width 520ms ease,height 520ms ease');$('.snip-box').setAttribute('width','180');$('.snip-box').setAttribute('height','104');});later(1900,function(){toast('Ausschnitt gewählt');});return;}
      if(mode==='appSwitch'){later(900,function(){opacity($('.switcher'),1);});later(1450,function(){$('.switch-a rect').setAttribute('stroke','#334155');$('.switch-b rect').setAttribute('stroke','#60a5fa');toast('Zum Browser gewechselt');});return;}
      if(mode==='desktop'){later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 620ms cubic-bezier(.2,.8,.2,1),opacity 520ms ease');w.setAttribute('transform','translate(0 118) scale(.72)');opacity(w,0);});later(actionAt+680,function(){toast('Desktop sichtbar');});return;}
"""
new_play="""      if(mode==='refresh'){later(980,function(){opacity($('.page-content'),.25);opacity($('.refresh-ring'),1);});later(1670,function(){opacity($('.refresh-ring'),0);opacity($('.page-content'),1);toast('Seite aktualisiert');});return;}
      if(mode==='newDoc'){later(actionAt,function(){var sheet=$('.new-doc-sheet');sheet.setAttribute('transform','translate(0 14) scale(.97)');trans(sheet,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 380ms ease');opacity(sheet,1);later(30,function(){sheet.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+580,function(){toast('Neues Dokument');});return;}
      if(mode==='newTab'){later(actionAt,function(){var tab=$('.tab-new');tab.setAttribute('transform','translate(0 -9) scale(.96)');trans(tab,'transform 430ms cubic-bezier(.2,.8,.2,1),opacity 320ms ease');opacity(tab,1);later(30,function(){tab.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+480,function(){toast('Neuer Tab');});return;}
      if(mode==='closeTab'){later(actionAt,function(){var tab=$('.tab-two');trans(tab,'transform 430ms cubic-bezier(.2,.8,.2,1),opacity 320ms ease');tab.setAttribute('transform','translate(0 -10) scale(.96)');opacity(tab,0);});later(actionAt+480,function(){toast('Tab geschlossen');});return;}
      if(mode==='reopenTab'){later(actionAt,function(){var tab=$('.tab-two');tab.setAttribute('transform','translate(0 -10) scale(.96)');trans(tab,'transform 430ms cubic-bezier(.2,.8,.2,1),opacity 320ms ease');opacity(tab,1);later(30,function(){tab.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+480,function(){toast('Tab wieder geöffnet');});return;}
      if(mode==='addressBar'){later(actionAt,function(){var mark=$('.address-highlight');mark.setAttribute('transform','translate(-8 0) scale(.94 1)');trans(mark,'transform 420ms cubic-bezier(.2,.8,.2,1),opacity 340ms ease');opacity(mark,1);if($('.address-text')){trans($('.address-text'),'fill 420ms ease');$('.address-text').setAttribute('fill','#1e3a8a');}later(30,function(){mark.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+470,function(){toast('Adresse markiert');});return;}
      if(mode==='nextTab'||mode==='prevTab'){later(actionAt,function(){var one=$('.tab-one-bg'),two=$('.tab-two-bg');trans(one,'fill 440ms ease');trans(two,'fill 440ms ease');if(mode==='nextTab'){fill(one,'#dbe4ee');fill(two,'#fff');}else{fill(one,'#fff');fill(two,'#dbe4ee');}});later(actionAt+500,function(){toast(mode==='nextTab'?'Nächster Tab':'Vorheriger Tab');});return;}
      if(mode==='snip'){later(950,function(){var overlay=$('.snip-overlay');overlay.setAttribute('transform','scale(.985)');trans(overlay,'transform 420ms ease,opacity 380ms ease');opacity(overlay,1);later(30,function(){overlay.setAttribute('transform','scale(1)');});});later(1250,function(){trans($('.snip-box'),'width 520ms ease,height 520ms ease');$('.snip-box').setAttribute('width','180');$('.snip-box').setAttribute('height','104');});later(1900,function(){toast('Ausschnitt gewählt');});return;}
      if(mode==='appSwitch'){later(900,function(){var sw=$('.switcher');sw.setAttribute('transform','translate(0 12) scale(.96)');trans(sw,'transform 450ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');opacity(sw,1);later(30,function(){sw.setAttribute('transform','translate(0 0) scale(1)');});});later(1450,function(){trans($('.switch-a rect'),'stroke 380ms ease');trans($('.switch-b rect'),'stroke 380ms ease');$('.switch-a rect').setAttribute('stroke','#334155');$('.switch-b rect').setAttribute('stroke','#60a5fa');});later(1900,function(){toast('Zum Browser gewechselt');});return;}
      if(mode==='desktop'){later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 620ms cubic-bezier(.2,.8,.2,1),opacity 520ms ease');w.setAttribute('transform','translate(0 118) scale(.72)');opacity(w,0);});later(actionAt+680,function(){toast('Desktop sichtbar');});return;}
"""
assert old_play in s, 'play block not found'
s=s.replace(old_play,new_play,1)

# Hard semantic checks: every formerly abrupt A4 action now has a transition path.
checks=[
    "if(mode==='newDoc')",
    "transform 520ms cubic-bezier(.2,.8,.2,1),opacity 380ms ease",
    "if(mode==='newTab')",
    "if(mode==='closeTab')",
    "if(mode==='reopenTab')",
    "if(mode==='addressBar')",
    "if(mode==='nextTab'||mode==='prevTab')",
    "fill 440ms ease",
    "if(mode==='snip')",
    "transform 420ms ease,opacity 380ms ease",
    "if(mode==='appSwitch')",
    "stroke 380ms ease",
]
for c in checks:
    assert c in s, c
p.write_text(s,encoding='utf-8')
print('A1 choreography principle applied to A4 + A5 residual scenes')
