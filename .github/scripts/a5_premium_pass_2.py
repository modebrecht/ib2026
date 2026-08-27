from pathlib import Path
import re

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

# ---------------------------------------------------------------------------
# A5 PREMIUM PASS 2/2
# Only Windows/A5 choreography is upgraded here. sceneKeycaps.js is untouched.
# ---------------------------------------------------------------------------

# 1) Snipping Tool: toolbar + crosshair + completion badge.
old='''<g class="snip-overlay" opacity="0"><rect x="28" y="25" width="365" height="220" rx="17" fill="#020617" opacity=".58"/><rect class="snip-box" x="116" y="82" width="0" height="0" rx="5" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/></g>'''
new='''<g class="snip-overlay" opacity="0"><rect x="28" y="25" width="365" height="220" rx="17" fill="#020617" opacity=".58"/><g class="snip-toolbar" opacity="0" transform="translate(0 -10)"><rect x="129" y="39" width="166" height="32" rx="16" fill="#f8fafc" stroke="#cbd5e1"/><rect x="144" y="48" width="22" height="14" rx="3" fill="none" stroke="#2563eb" stroke-width="2"/><path d="M184 48h18v14h-18zM220 48h20v14M258 48l18 14M276 48l-18 14" fill="none" stroke="#64748b" stroke-width="1.7" stroke-linecap="round"/></g><g class="snip-cursor" opacity="0" transform="translate(126 92)"><path d="M-7 0h14M0-7v14" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle r="3" fill="#38bdf8"/></g><rect class="snip-box" x="116" y="82" width="0" height="0" rx="5" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/><g class="snip-confirm" opacity="0" transform="translate(274 190) scale(.8)"><circle r="17" fill="#052e2b" stroke="#10b981" stroke-width="2"/><path d="M-7 0l5 5 10-11" fill="none" stroke="#a7f3d0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g></g>'''
assert old in s, 'snip markup not found'
s=s.replace(old,new,1)

# 2) Alt+Tab: moving focus frame, 3 previews, explicit selected-app caption.
old='''<g class="switcher" opacity="0"><rect x="86" y="101" width="260" height="91" rx="18" fill="#111827" opacity=".96"/><g class="switch-a"><rect x="103" y="118" width="66" height="54" rx="8" fill="#fff" stroke="#60a5fa" stroke-width="3"/><text x="136" y="150" text-anchor="middle" font-family="Arial" font-size="9" fill="#334155">Word</text></g><g class="switch-b"><rect x="183" y="118" width="66" height="54" rx="8" fill="#fff" stroke="#334155"/><text x="216" y="150" text-anchor="middle" font-family="Arial" font-size="9" fill="#334155">Browser</text></g></g>'''
new='''<g class="switcher" opacity="0"><rect x="73" y="91" width="286" height="116" rx="18" fill="#111827" opacity=".97"/><rect class="switch-focus" x="96" y="111" width="72" height="60" rx="10" fill="none" stroke="#60a5fa" stroke-width="3"/><g class="switch-a"><rect x="99" y="114" width="66" height="54" rx="8" fill="#fff" stroke="#334155"/><text x="132" y="146" text-anchor="middle" font-family="Arial" font-size="9" fill="#334155">Word</text></g><g class="switch-b"><rect x="181" y="114" width="66" height="54" rx="8" fill="#fff" stroke="#334155"/><text x="214" y="146" text-anchor="middle" font-family="Arial" font-size="9" fill="#334155">Browser</text></g><g class="switch-c"><rect x="263" y="114" width="66" height="54" rx="8" fill="#fff" stroke="#334155"/><text x="296" y="146" text-anchor="middle" font-family="Arial" font-size="9" fill="#334155">Explorer</text></g><text class="switch-caption" x="216" y="190" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#93c5fd">Word</text></g>'''
assert old in s, 'switcher markup not found'
s=s.replace(old,new,1)

# 3) Snap Assist: visible target zones before the window lands.
marker='''<g class="snap-left-window" opacity="0">'''
insert='''<g class="snap-zone snap-zone-left" opacity="0"><rect x="35" y="36" width="177" height="205" rx="12" fill="#38bdf8" opacity=".18" stroke="#7dd3fc" stroke-width="2" stroke-dasharray="6 5"/><path d="M212 43v191" stroke="#7dd3fc" stroke-width="1.5" opacity=".65"/></g><g class="snap-zone snap-zone-right" opacity="0"><rect x="209" y="36" width="177" height="205" rx="12" fill="#38bdf8" opacity=".18" stroke="#7dd3fc" stroke-width="2" stroke-dasharray="6 5"/><path d="M209 43v191" stroke="#7dd3fc" stroke-width="1.5" opacity=".65"/></g><g class="snap-left-window" opacity="0">'''
assert marker in s, 'snap window marker not found'
s=s.replace(marker,insert,1)

# 4) Reset the new premium elements without changing any keycap state/timing.
old="opacity($('.scene-lock'),0);opacity($('.lock-details'),0);opacity($('.app-windows'),1);opacity($('.desktop-extra-window'),mode==='desktop'?.74:0);opacity($('.explorer-window'),0);opacity($('.explorer-active-dot'),0);opacity($('.active-app-dot'),mode==='closeWindow'?1:0);opacity($('.close-affordance'),mode==='closeWindow'?1:0);opacity($('.hung-badge'),0);opacity($('.tm-problem-row'),0);opacity($('.snip-overlay'),0);if($('.desktop-icons')){opacity($('.desktop-icons'),1);$('.desktop-icons').setAttribute('transform','translate(0 0) scale(1)');}$$('.clip-item').forEach(function(el){opacity(el,0);el.setAttribute('transform','translate(0 8)');});"
new="opacity($('.scene-lock'),0);opacity($('.lock-details'),0);opacity($('.app-windows'),1);opacity($('.app-one'),1);opacity($('.desktop-extra-window'),mode==='desktop'?.74:0);opacity($('.explorer-window'),0);opacity($('.explorer-active-dot'),0);opacity($('.active-app-dot'),mode==='closeWindow'?1:0);opacity($('.close-affordance'),mode==='closeWindow'?1:0);opacity($('.hung-badge'),0);opacity($('.tm-problem-row'),0);opacity($('.snip-overlay'),0);opacity($('.snip-toolbar'),0);opacity($('.snip-cursor'),0);opacity($('.snip-confirm'),0);opacity($('.snap-zone-left'),0);opacity($('.snap-zone-right'),0);if($('.snip-toolbar'))$('.snip-toolbar').setAttribute('transform','translate(0 -10)');if($('.snip-cursor'))$('.snip-cursor').setAttribute('transform','translate(126 92)');if($('.snip-confirm'))$('.snip-confirm').setAttribute('transform','translate(274 190) scale(.8)');if($('.switch-focus'))$('.switch-focus').setAttribute('transform','translate(0 0)');if($('.switch-caption'))$('.switch-caption').textContent='Word';if($('.app-one'))$('.app-one').setAttribute('transform','translate(0 0) scale(1)');if($('.desktop-icons')){opacity($('.desktop-icons'),1);$('.desktop-icons').setAttribute('transform','translate(0 0) scale(1)');}$$('.clip-item').forEach(function(el){opacity(el,0);el.setAttribute('transform','translate(0 8)');});"
assert old in s, 'premium reset marker not found'
s=s.replace(old,new,1)

# Include new elements in transition cleanup.
old="$('.switcher'),$('.snip-overlay'),$('.app-windows')"
new="$('.switcher'),$('.switch-focus'),$('.snip-overlay'),$('.snip-toolbar'),$('.snip-cursor'),$('.snip-confirm'),$('.snap-zone-left'),$('.snap-zone-right'),$('.app-one'),$('.app-windows')"
assert old in s, 'transition reset list marker not found'
s=s.replace(old,new,1)

# 5) Reduced-motion/end-state semantics.
old="else if(mode==='snip'){opacity($('.snip-overlay'),1);$('.snip-box').setAttribute('width','180');$('.snip-box').setAttribute('height','104');toast('Ausschnitt gewählt');}"
new="else if(mode==='snip'){opacity($('.snip-overlay'),1);opacity($('.snip-toolbar'),1);opacity($('.snip-confirm'),1);$('.snip-box').setAttribute('width','180');$('.snip-box').setAttribute('height','104');toast('Ausschnitt gewählt');}"
assert old in s, 'snip applyEnd not found'
s=s.replace(old,new,1)

old="else if(mode==='appSwitch'){opacity($('.switcher'),1);$('.switch-a rect').setAttribute('stroke','#334155');$('.switch-b rect').setAttribute('stroke','#60a5fa');toast('Zum Browser gewechselt');}"
new="else if(mode==='appSwitch'){opacity($('.switcher'),0);opacity($('.app-one'),0);opacity($('.desktop-extra-window'),1);if($('.switch-caption'))$('.switch-caption').textContent='Browser';toast('Zum Browser gewechselt');}"
assert old in s, 'appSwitch applyEnd not found'
s=s.replace(old,new,1)

# 6) Win+Shift+S choreography: tool appears, crosshair travels, box grows, check confirms.
pat=re.compile(r"      if\(mode==='snip'\)\{.*?return;\}",re.S)
m=pat.search(s)
assert m, 'snip playMode block not found'
new_snip="""      if(mode==='snip'){later(900,function(){var overlay=$('.snip-overlay'),toolbar=$('.snip-toolbar');trans(overlay,'opacity 380ms ease');opacity(overlay,1);trans(toolbar,'transform 460ms cubic-bezier(.2,.8,.2,1),opacity 320ms ease');opacity(toolbar,1);later(30,function(){toolbar.setAttribute('transform','translate(0 0)');});});later(1260,function(){var cursor=$('.snip-cursor');trans(cursor,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 220ms ease');opacity(cursor,1);cursor.setAttribute('transform','translate(126 92)');later(30,function(){cursor.setAttribute('transform','translate(292 190)');});});later(1450,function(){var box=$('.snip-box');trans(box,'width 650ms cubic-bezier(.2,.8,.2,1),height 650ms cubic-bezier(.2,.8,.2,1)');box.setAttribute('width','180');box.setAttribute('height','104');});later(2180,function(){opacity($('.snip-cursor'),0);var ok=$('.snip-confirm');trans(ok,'transform 380ms cubic-bezier(.2,.8,.2,1),opacity 260ms ease');opacity(ok,1);ok.setAttribute('transform','translate(274 190) scale(1)');toast('Ausschnitt gewählt');});return;}"""
s=s[:m.start()]+new_snip+s[m.end():]

# 7) Alt+Tab choreography: overview -> focus glides -> overview leaves -> selected app comes forward.
pat=re.compile(r"      if\(mode==='appSwitch'\)\{.*?return;\}",re.S)
m=pat.search(s)
assert m, 'appSwitch playMode block not found'
new_switch="""      if(mode==='appSwitch'){later(900,function(){var sw=$('.switcher');sw.setAttribute('transform','translate(0 14) scale(.95)');trans(sw,'transform 460ms cubic-bezier(.2,.8,.2,1),opacity 340ms ease');opacity(sw,1);later(30,function(){sw.setAttribute('transform','translate(0 0) scale(1)');});});later(1430,function(){var focus=$('.switch-focus');trans(focus,'transform 540ms cubic-bezier(.2,.8,.2,1)');focus.setAttribute('transform','translate(82 0)');if($('.switch-caption'))$('.switch-caption').textContent='Browser';});later(2070,function(){var sw=$('.switcher'),word=$('.app-one'),browser=$('.desktop-extra-window');trans(sw,'transform 360ms ease,opacity 300ms ease');sw.setAttribute('transform','translate(0 -8) scale(.98)');opacity(sw,0);trans(word,'transform 440ms ease,opacity 320ms ease');word.setAttribute('transform','translate(-16 7) scale(.96)');opacity(word,.18);browser.setAttribute('transform','translate(18 8) scale(.96)');trans(browser,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 400ms ease');opacity(browser,1);later(30,function(){browser.setAttribute('transform','translate(0 0) scale(1)');});});later(2700,function(){toast('Zum Browser gewechselt');});return;}"""
s=s[:m.start()]+new_switch+s[m.end():]

# 8) Snap choreography: preview target first, then the window travels into it.
pat=re.compile(r"      if\(mode==='snapLeft'\|\|mode==='snapRight'\)\{.*?return;\}",re.S)
m=pat.search(s)
assert m, 'snap playMode block not found'
new_snap="""      if(mode==='snapLeft'||mode==='snapRight'){later(actionAt-180,function(){var zone=mode==='snapLeft'?$('.snap-zone-left'):$('.snap-zone-right');trans(zone,'opacity 300ms ease');opacity(zone,1);});later(actionAt,function(){var w=$('.app-windows'),target=mode==='snapLeft'?$('.snap-left-window'):$('.snap-right-window'),zone=mode==='snapLeft'?$('.snap-zone-left'):$('.snap-zone-right');trans(w,'transform 620ms cubic-bezier(.2,.8,.2,1),opacity 440ms ease');w.setAttribute('transform',mode==='snapLeft'?'translate(-89 4) scale(.76)':'translate(89 4) scale(.76)');opacity(w,.10);target.setAttribute('transform',mode==='snapLeft'?'translate(-28 0) scale(.92)':'translate(28 0) scale(.92)');trans(target,'transform 620ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(target,1);later(30,function(){target.setAttribute('transform','translate(0 0) scale(1)');});later(520,function(){trans(zone,'opacity 320ms ease');opacity(zone,0);});});later(actionAt+700,function(){toast(mode==='snapLeft'?'Links angedockt':'Rechts angedockt');});return;}"""
s=s[:m.start()]+new_snap+s[m.end():]

# ---------------------------------------------------------------------------
# 9) Win+Up / Win+Down special renderer: target guide + taskbar landing + same loop.
# ---------------------------------------------------------------------------
resize_start=s.index('function createWindowResizeScene')
main_start=s.index('function createA4Scene')
resize=s[resize_start:main_start]

# Insert guide just before the key row.
old="      +'<g class=\"key-row\" transform=\"translate(404 225)\">'+window.tk2SceneKeycaps.markup(['Win',isMax?'↑':'↓'],'utility')+'</g>'"
new="      +'<g class=\"resize-guide\" opacity=\"0\">'+(isMax?'<rect x=\"43\" y=\"38\" width=\"340\" height=\"198\" rx=\"13\" fill=\"#38bdf8\" opacity=\".10\" stroke=\"#7dd3fc\" stroke-width=\"2\" stroke-dasharray=\"7 5\"/>':'<path d=\"M225 188Q225 224 205 254\" fill=\"none\" stroke=\"#7dd3fc\" stroke-width=\"2.5\" stroke-dasharray=\"6 5\"/><circle class=\"task-target\" cx=\"205\" cy=\"262\" r=\"17\" fill=\"#38bdf8\" opacity=\".18\" stroke=\"#7dd3fc\" stroke-width=\"2\"/>')+'</g>'\n      +'<g class=\"key-row\" transform=\"translate(404 225)\">'+window.tk2SceneKeycaps.markup(['Win',isMax?'↑':'↓'],'utility')+'</g>'"
assert old in resize, 'resize key-row marker not found'
resize=resize.replace(old,new,1)

old="var svg=container.querySelector('svg'),win=svg.querySelector('.window'),direction=svg.querySelector('.direction'),toast=svg.querySelector('.toast'),keys=Array.from(svg.querySelectorAll('.tk2-u-key'));"
new="var svg=container.querySelector('svg'),win=svg.querySelector('.window'),direction=svg.querySelector('.direction'),guide=svg.querySelector('.resize-guide'),toast=svg.querySelector('.toast'),keys=Array.from(svg.querySelectorAll('.tk2-u-key'));"
assert old in resize, 'resize vars not found'
resize=resize.replace(old,new,1)

old="function reset(){clearTimers();running=false;transition(win,'none');opacity(win,1);opacity(direction,0);opacity(toast,0);transform(win,isMax?'translate(0 0) scale(1)':'translate(-38 -20) scale(1.24 1.16)');window.tk2SceneKeycaps.resetMany(keys);}"
new="function reset(){clearTimers();running=false;transition(win,'none');if(guide)guide.style.transition='none';opacity(win,1);opacity(direction,0);opacity(guide,0);opacity(toast,0);transform(win,isMax?'translate(0 0) scale(1)':'translate(-38 -20) scale(1.24 1.16)');window.tk2SceneKeycaps.resetMany(keys);}"
assert old in resize, 'resize reset not found'
resize=resize.replace(old,new,1)

old="function applyEnd(){transition(win,'none');if(isMax)transform(win,'translate(-61 -31) scale(1.5 1.42)');else{transform(win,'translate(126 186) scale(.20 .12)');opacity(win,.18);}opacity(direction,1);opacity(toast,1);}"
new="function applyEnd(){transition(win,'none');if(isMax)transform(win,'translate(-61 -31) scale(1.5 1.42)');else{transform(win,'translate(126 186) scale(.20 .12)');opacity(win,.18);}opacity(direction,1);opacity(guide,0);opacity(toast,1);}"
assert old in resize, 'resize applyEnd not found'
resize=resize.replace(old,new,1)

pat=re.compile(r"function run\(\)\{if\(reduceMotion\)\{showEndState\(\);return;\}reset\(\);running=true;.*?\}\n    function play",re.S)
m=pat.search(resize)
assert m, 'resize run not found'
new_run="""function run(){if(reduceMotion){showEndState();return;}reset();running=true;later(350,function(){opacity(direction,1);pressKeys();});later(760,function(){if(guide){transition(guide,'opacity 320ms ease');opacity(guide,1);}});later(1030,function(){transition(win,'transform 680ms cubic-bezier(.2,.8,.2,1),opacity 540ms ease');if(isMax)transform(win,'translate(-61 -31) scale(1.5 1.42)');else{transform(win,'translate(126 186) scale(.20 .12)');opacity(win,.18);}});later(1770,function(){if(guide){transition(guide,'opacity 300ms ease');opacity(guide,0);}opacity(toast,1);});later(5600,function(){running=false;if(active&&autoLoop)run();});}
    function play"""
resize=resize[:m.start()]+new_run+resize[m.end():]

s=s[:resize_start]+resize+s[main_start:]

# Hard semantic assertions.
checks=[
    'class="snip-toolbar"','class="snip-cursor"','class="snip-confirm"',
    'class="switch-focus"','class="switch-c"','class="snap-zone snap-zone-left"',
    "focus.setAttribute('transform','translate(82 0)')",
    "browser.setAttribute('transform','translate(18 8) scale(.96)')",
    "later(actionAt-180,function()",
    'class="resize-guide"',
    "later(5600,function(){running=false;if(active&&autoLoop)run();})",
    'window.tk2SceneKeycaps.pressSequence'
]
for token in checks:
    assert token in s, token

# Keep the special renderer scoped: no A4 browser/doc selectors in its reset.
resize_now=s[s.index('function createWindowResizeScene'):s.index('function createA4Scene')]
rm=re.search(r"function reset\(\)\{(.*?)\}\n    function applyEnd",resize_now,re.S)
assert rm and 'resetMany(keys)' in rm.group(1)
assert "$('." not in rm.group(1) and 'mode===' not in rm.group(1)

p.write_text(s,encoding='utf-8')
print('A5 premium pass 2/2 applied; 800ms shared key timing untouched')
