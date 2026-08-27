from pathlib import Path

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

# A4 gets a slightly longer common loop; Windows/A5 cadence stays unchanged.
old="var mode=options.mode||'newTab',cfg=CONFIG[mode]||CONFIG.newTab,active=options.autoplay!==false,autoLoop=options.loop!==false,reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,uid='tk2a4'+(++counter),timers=[],running=false,controller=null,sceneLoopMs=cfg.family==='windows'?5600:LOOP_MS;"
new="var mode=options.mode||'newTab',cfg=CONFIG[mode]||CONFIG.newTab,active=options.autoplay!==false,autoLoop=options.loop!==false,reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,uid='tk2a4'+(++counter),timers=[],running=false,controller=null,isA4Mode=['newDoc','newTab','closeTab','reopenTab','refresh','addressBar','nextTab','prevTab'].indexOf(mode)>=0,sceneLoopMs=cfg.family==='windows'?5600:(isA4Mode?4600:LOOP_MS);"
assert old in s, 'scene timing declaration not found'
s=s.replace(old,new,1)

# Browser visual primitives: group first tab + distinct alternate page for real page switches.
old='''<g class=\"tabs\"><rect class=\"tab-one-bg\" x=\"47\" y=\"35\" width=\"112\" height=\"28\" rx=\"9\" fill=\"#fff\"/><text x=\"103\" y=\"53\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"9\" font-weight=\"700\" fill=\"#475569\">Schulportal</text>'''
new='''<g class=\"tabs\"><g class=\"tab-one\"><rect class=\"tab-one-bg\" x=\"47\" y=\"35\" width=\"112\" height=\"28\" rx=\"9\" fill=\"#fff\"/><text x=\"103\" y=\"53\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"9\" font-weight=\"700\" fill=\"#475569\">Schulportal</text></g>'''
assert old in s, 'first tab markup not found'
s=s.replace(old,new,1)

old='''<g class=\"page-content\"><rect x=\"54\" y=\"142\" width=\"132\" height=\"13\" rx=\"6\" fill=\"#0f172a\" opacity=\".85\"/><rect x=\"54\" y=\"172\" width=\"275\" height=\"8\" rx=\"4\" fill=\"#94a3b8\"/><rect x=\"54\" y=\"191\" width=\"238\" height=\"8\" rx=\"4\" fill=\"#94a3b8\"/><rect x=\"54\" y=\"210\" width=\"264\" height=\"8\" rx=\"4\" fill=\"#94a3b8\"/><rect x=\"54\" y=\"238\" width=\"82\" height=\"22\" rx=\"8\" fill=\"#3b82f6\" opacity=\".85\"/></g>'''
new='''<g class=\"page-content\"><rect class=\"page-title\" x=\"54\" y=\"142\" width=\"132\" height=\"13\" rx=\"6\" fill=\"#0f172a\" opacity=\".85\"/><rect class=\"page-line page-line-1\" x=\"54\" y=\"172\" width=\"275\" height=\"8\" rx=\"4\" fill=\"#94a3b8\"/><rect class=\"page-line page-line-2\" x=\"54\" y=\"191\" width=\"238\" height=\"8\" rx=\"4\" fill=\"#94a3b8\"/><rect class=\"page-line page-line-3\" x=\"54\" y=\"210\" width=\"264\" height=\"8\" rx=\"4\" fill=\"#94a3b8\"/><rect class=\"page-action\" x=\"54\" y=\"238\" width=\"82\" height=\"22\" rx=\"8\" fill=\"#3b82f6\" opacity=\".85\"/></g><g class=\"page-content-alt\" opacity=\"0\" transform=\"translate(16 0)\"><rect x=\"54\" y=\"142\" width=\"104\" height=\"13\" rx=\"6\" fill=\"#0f172a\" opacity=\".82\"/><rect x=\"54\" y=\"172\" width=\"226\" height=\"8\" rx=\"4\" fill=\"#64748b\"/><rect x=\"54\" y=\"191\" width=\"286\" height=\"8\" rx=\"4\" fill=\"#94a3b8\"/><rect x=\"54\" y=\"210\" width=\"204\" height=\"8\" rx=\"4\" fill=\"#94a3b8\"/><rect x=\"54\" y=\"238\" width=\"106\" height=\"22\" rx=\"8\" fill=\"#14b8a6\" opacity=\".85\"/></g>'''
assert old in s, 'page-content markup not found'
s=s.replace(old,new,1)

# Dim layer sits below the new sheet so old/new document states separate clearly.
old='''<g class=\"new-doc-sheet\" opacity=\"0\"><rect x=\"48\" y=\"76\" width=\"322\" height=\"183\" rx=\"9\" fill=\"#fff\" stroke=\"#cbd5e1\"/>'''
new='''<rect class=\"doc-dim\" x=\"28\" y=\"63\" width=\"365\" height=\"217\" rx=\"0\" fill=\"#0f172a\" opacity=\"0\"/><g class=\"new-doc-sheet\" opacity=\"0\"><rect x=\"48\" y=\"76\" width=\"322\" height=\"183\" rx=\"9\" fill=\"#fff\" stroke=\"#cbd5e1\"/>'''
assert old in s, 'new doc sheet markup not found'
s=s.replace(old,new,1)

# Helpers: real page crossfade/slide; does not touch keycap timing.
old="function later(ms,fn){timers.push(window.setTimeout(fn,ms));}function clearTimers(){timers.forEach(window.clearTimeout);timers=[];}function trans(el,val){if(el)el.style.transition=reduceMotion?'none':val;}function opacity(el,val){if(el)el.setAttribute('opacity',String(val));}function toast(text){if($('.toast-text'))$('.toast-text').textContent=text;opacity($('.toast'),1);}function fill(el,val){if(el)el.setAttribute('fill',val);}"
new="function later(ms,fn){timers.push(window.setTimeout(fn,ms));}function clearTimers(){timers.forEach(window.clearTimeout);timers=[];}function trans(el,val){if(el)el.style.transition=reduceMotion?'none':val;}function opacity(el,val){if(el)el.setAttribute('opacity',String(val));}function toast(text){if($('.toast-text'))$('.toast-text').textContent=text;opacity($('.toast'),1);}function fill(el,val){if(el)el.setAttribute('fill',val);}function switchPage(toAlt,direction){var from=toAlt?$('.page-content'):$('.page-content-alt'),to=toAlt?$('.page-content-alt'):$('.page-content'),dx=direction>=0?14:-14;if(!from||!to)return;trans(from,'transform 500ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');trans(to,'transform 540ms cubic-bezier(.2,.8,.2,1),opacity 400ms ease');from.setAttribute('transform','translate('+(-dx)+' 0)');opacity(from,0);to.setAttribute('transform','translate('+dx+' 0)');opacity(to,1);later(30,function(){to.setAttribute('transform','translate(0 0)');});}"
assert old in s, 'helper block not found'
s=s.replace(old,new,1)

# Extend reset with page-state, tab-one and document dim reset.
old="opacity($('.new-doc-sheet'),0);opacity($('.new-doc-caret'),0);"
new="opacity($('.new-doc-sheet'),0);opacity($('.new-doc-caret'),0);opacity($('.doc-dim'),0);"
assert old in s, 'new doc reset prefix not found'
s=s.replace(old,new,1)

old="if($('.tab-new'))$('.tab-new').setAttribute('transform','translate(116 0) scale(.18 1)');"
new="if($('.tab-new'))$('.tab-new').setAttribute('transform','translate(116 0) scale(.18 1)');if($('.tab-one'))$('.tab-one').setAttribute('transform','translate(0 0) scale(1)');"
assert old in s, 'tab reset marker not found'
s=s.replace(old,new,1)

old="if($('.address-text'))$('.address-text').setAttribute('fill','#64748b');if($('.page-content')){opacity($('.page-content'),1);$('.page-content').setAttribute('transform','translate(0 0)');}"
new="if($('.address-text'))$('.address-text').setAttribute('fill','#64748b');var altFirst=mode==='reopenTab'||mode==='prevTab';if($('.page-content')){opacity($('.page-content'),altFirst?0:1);$('.page-content').setAttribute('transform',altFirst?'translate(-14 0)':'translate(0 0)');}if($('.page-content-alt')){opacity($('.page-content-alt'),altFirst?1:0);$('.page-content-alt').setAttribute('transform',altFirst?'translate(0 0)':'translate(14 0)');}$$('.page-title,.page-line,.page-action').forEach(function(el){opacity(el,1);el.setAttribute('transform','translate(0 0)');});"
assert old in s, 'page reset block not found'
s=s.replace(old,new,1)

old="[$('.new-doc-sheet'),$('.new-doc-caret'),$('.tab-new'),$('.tab-two'),$('.tab-three'),$('.tab-plus'),$('.active-tab-indicator'),$('.tabs'),$('.refresh-ring'),$('.address-highlight'),$('.address-box'),$('.page-content'),$('.switcher'),$('.snip-overlay'),$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')]"
new="[$('.new-doc-sheet'),$('.new-doc-caret'),$('.doc-dim'),$('.tab-one'),$('.tab-new'),$('.tab-two'),$('.tab-three'),$('.tab-plus'),$('.active-tab-indicator'),$('.tabs'),$('.refresh-ring'),$('.address-highlight'),$('.address-box'),$('.page-content'),$('.page-content-alt'),$('.switcher'),$('.snip-overlay'),$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')]"
assert old in s, 'transition reset list not found'
s=s.replace(old,new,1)

# 1) Close / reopen: tab movement AND page reaction.
old="if(mode==='closeTab'){later(actionAt,function(){var closing=$('.tab-two'),next=$('.tab-three');trans(closing,'transform 500ms cubic-bezier(.2,.8,.2,1),opacity 340ms ease');trans(next,'transform 560ms cubic-bezier(.2,.8,.2,1)');closing.setAttribute('transform','translate(-8 -9) scale(.84)');opacity(closing,0);next.setAttribute('transform','translate(-117 0)');});later(actionAt+620,function(){toast('Tab geschlossen');});return;}"
new="if(mode==='closeTab'){later(actionAt,function(){var closing=$('.tab-two'),next=$('.tab-three');trans(closing,'transform 500ms cubic-bezier(.2,.8,.2,1),opacity 340ms ease');trans(next,'transform 560ms cubic-bezier(.2,.8,.2,1)');closing.setAttribute('transform','translate(-8 -9) scale(.84)');opacity(closing,0);next.setAttribute('transform','translate(-117 0)');switchPage(true,1);});later(actionAt+650,function(){toast('Tab geschlossen');});return;}"
assert old in s, 'closeTab choreography not found'
s=s.replace(old,new,1)

old="if(mode==='reopenTab'){later(actionAt,function(){var restored=$('.tab-two'),next=$('.tab-three');trans(next,'transform 560ms cubic-bezier(.2,.8,.2,1)');trans(restored,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');next.setAttribute('transform','translate(0 0)');opacity(restored,1);later(35,function(){restored.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Tab wieder geöffnet');});return;}"
new="if(mode==='reopenTab'){later(actionAt,function(){var restored=$('.tab-two'),next=$('.tab-three');trans(next,'transform 560ms cubic-bezier(.2,.8,.2,1)');trans(restored,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');next.setAttribute('transform','translate(0 0)');opacity(restored,1);later(35,function(){restored.setAttribute('transform','translate(0 0) scale(1)');});switchPage(false,-1);});later(actionAt+650,function(){toast('Tab wieder geöffnet');});return;}"
assert old in s, 'reopen choreography not found'
s=s.replace(old,new,1)

# 2) F5: dim -> loader -> staggered content return.
start=s.index("if(mode==='refresh'){later(930,function()")
end=s.index("return;}",start)+len("return;}")
old=s[start:end]
new="if(mode==='refresh'){later(930,function(){var page=$('.page-content'),ring=$('.refresh-ring');trans(page,'transform 420ms ease,opacity 340ms ease');page.setAttribute('transform','translate(0 4)');opacity(page,.16);trans(ring,'transform 760ms linear,opacity 220ms ease');opacity(ring,1);later(30,function(){ring.setAttribute('transform','translate(210 185) rotate(360)');});});later(1580,function(){var page=$('.page-content'),parts=$$('.page-title,.page-line,.page-action');trans(page,'transform 320ms ease,opacity 220ms ease');page.setAttribute('transform','translate(0 0)');opacity(page,1);parts.forEach(function(el){trans(el,'none');opacity(el,0);el.setAttribute('transform','translate(0 7)');});parts.forEach(function(el,index){later(index*110,function(){trans(el,'transform 360ms cubic-bezier(.2,.8,.2,1),opacity 300ms ease');opacity(el,1);el.setAttribute('transform','translate(0 0)');});});});later(2160,function(){opacity($('.refresh-ring'),0);toast('Seite aktualisiert');});return;}"
s=s[:start]+new+s[end:]

# 3) Ctrl+Tab / Shift+Tab: tab indicator and actual page crossfade/slide.
old="if(mode==='nextTab'||mode==='prevTab'){later(actionAt,function(){var one=$('.tab-one-bg'),two=$('.tab-two-bg'),indicator=$('.active-tab-indicator'),tabs=$('.tabs');trans(one,'fill 520ms ease');trans(two,'fill 520ms ease');trans(indicator,'transform 560ms cubic-bezier(.2,.8,.2,1)');trans(tabs,'transform 260ms ease');tabs.setAttribute('transform',mode==='nextTab'?'translate(-4 0)':'translate(4 0)');indicator.setAttribute('transform',mode==='nextTab'?'translate(117 0)':'translate(0 0)');if(mode==='nextTab'){fill(one,'#dbe4ee');fill(two,'#fff');}else{fill(one,'#fff');fill(two,'#dbe4ee');}later(270,function(){tabs.setAttribute('transform','translate(0 0)');});});later(actionAt+620,function(){toast(mode==='nextTab'?'Nächster Tab':'Vorheriger Tab');});return;}"
new="if(mode==='nextTab'||mode==='prevTab'){later(actionAt,function(){var one=$('.tab-one-bg'),two=$('.tab-two-bg'),indicator=$('.active-tab-indicator'),tabs=$('.tabs');trans(one,'fill 520ms ease');trans(two,'fill 520ms ease');trans(indicator,'transform 560ms cubic-bezier(.2,.8,.2,1)');trans(tabs,'transform 260ms ease');tabs.setAttribute('transform',mode==='nextTab'?'translate(-4 0)':'translate(4 0)');indicator.setAttribute('transform',mode==='nextTab'?'translate(117 0)':'translate(0 0)');if(mode==='nextTab'){fill(one,'#dbe4ee');fill(two,'#fff');switchPage(true,1);}else{fill(one,'#fff');fill(two,'#dbe4ee');switchPage(false,-1);}later(270,function(){tabs.setAttribute('transform','translate(0 0)');});});later(actionAt+650,function(){toast(mode==='nextTab'?'Nächster Tab':'Vorheriger Tab');});return;}"
assert old in s, 'tab switch choreography not found'
s=s.replace(old,new,1)

# 4) Ctrl+N: old state dims before the new sheet takes focus.
old="if(mode==='newDoc'){later(actionAt,function(){var sheet=$('.new-doc-sheet');sheet.setAttribute('transform','translate(0 18) scale(.95)');trans(sheet,'transform 580ms cubic-bezier(.2,.8,.2,1),opacity 400ms ease');opacity(sheet,1);later(35,function(){sheet.setAttribute('transform','translate(0 0) scale(1)');});});"
new="if(mode==='newDoc'){later(actionAt-140,function(){var dim=$('.doc-dim');trans(dim,'opacity 360ms ease');opacity(dim,.52);});later(actionAt,function(){var sheet=$('.new-doc-sheet');sheet.setAttribute('transform','translate(0 18) scale(.95)');trans(sheet,'transform 580ms cubic-bezier(.2,.8,.2,1),opacity 400ms ease');opacity(sheet,1);later(35,function(){sheet.setAttribute('transform','translate(0 0) scale(1)');});});"
assert old in s, 'newDoc choreography not found'
s=s.replace(old,new,1)

# 5a) Ctrl+T: existing tab subtly makes room while the new one grows out of +.
old="if(mode==='newTab'){later(actionAt,function(){var tab=$('.tab-new'),plus=$('.tab-plus');trans(tab,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');trans(plus,'transform 300ms ease,opacity 260ms ease');plus.setAttribute('transform','scale(.72)');opacity(plus,0);opacity(tab,1);later(35,function(){tab.setAttribute('transform','translate(0 0) scale(1)');});});"
new="if(mode==='newTab'){later(actionAt,function(){var tab=$('.tab-new'),plus=$('.tab-plus'),first=$('.tab-one');trans(first,'transform 360ms ease');first.setAttribute('transform','translate(-5 0) scale(.985)');trans(tab,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');trans(plus,'transform 300ms ease,opacity 260ms ease');plus.setAttribute('transform','scale(.72)');opacity(plus,0);opacity(tab,1);later(35,function(){tab.setAttribute('transform','translate(0 0) scale(1)');});later(430,function(){first.setAttribute('transform','translate(0 0) scale(1)');});});"
assert old in s, 'newTab choreography not found'
s=s.replace(old,new,1)

# 5b) Ctrl+L: focus ring pulses, selection sweeps, then holds calmly.
old="if(mode==='addressBar'){later(actionAt,function(){var box=$('.address-box'),mark=$('.address-highlight');trans(box,'stroke 360ms ease,stroke-width 360ms ease');box.setAttribute('stroke','#3b82f6');box.setAttribute('stroke-width','2');trans(mark,'width 520ms cubic-bezier(.2,.8,.2,1),opacity 220ms ease');opacity(mark,1);mark.setAttribute('width','286');if($('.address-text')){trans($('.address-text'),'fill 420ms ease');$('.address-text').setAttribute('fill','#1e3a8a');}});later(actionAt+590,function(){toast('Adresse markiert');});return;}"
new="if(mode==='addressBar'){later(actionAt,function(){var box=$('.address-box'),mark=$('.address-highlight');trans(box,'stroke 220ms ease,stroke-width 220ms ease');box.setAttribute('stroke','#60a5fa');box.setAttribute('stroke-width','4');later(240,function(){trans(box,'stroke 300ms ease,stroke-width 300ms ease');box.setAttribute('stroke','#3b82f6');box.setAttribute('stroke-width','2');});trans(mark,'width 560ms cubic-bezier(.2,.8,.2,1),opacity 220ms ease');opacity(mark,1);mark.setAttribute('width','286');if($('.address-text')){trans($('.address-text'),'fill 420ms ease');$('.address-text').setAttribute('fill','#1e3a8a');}});later(actionAt+650,function(){toast('Adresse markiert');});return;}"
assert old in s, 'addressBar choreography not found'
s=s.replace(old,new,1)

# Hard guarantees: key timing untouched; A4 rhythm & all requested 2/2 effects present.
assert "CHORD_HOLD_MS" not in s, 'a4Scenes must not redefine key hold timing'
checks=[
    "sceneLoopMs=cfg.family==='windows'?5600:(isA4Mode?4600:LOOP_MS)",
    "function switchPage(toAlt,direction)",
    "class=\"page-content-alt\"",
    "switchPage(true,1)",
    "switchPage(false,-1)",
    "parts.forEach(function(el,index)",
    "class=\"doc-dim\"",
    "opacity(dim,.52)",
    "first.setAttribute('transform','translate(-5 0) scale(.985)')",
    "box.setAttribute('stroke-width','4')",
    "window.tk2SceneKeycaps.pressSequence"
]
for c in checks: assert c in s,c

p.write_text(s,encoding='utf-8')
print('A4 premium pass 2/2 applied; sceneKeycaps timing untouched')
