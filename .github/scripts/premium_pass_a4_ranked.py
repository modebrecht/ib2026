from pathlib import Path
import re

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

# --- richer browser scene primitives -------------------------------------------------
old_tabs='''<g class="tabs"><rect class="tab-one-bg" x="47" y="35" width="112" height="28" rx="9" fill="#fff"/><text x="103" y="53" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Schulportal</text><g class="tab-two" opacity="0"><rect class="tab-two-bg" x="164" y="35" width="112" height="28" rx="9" fill="#dbe4ee"/><text x="220" y="53" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Recherche</text></g><g class="tab-new" opacity="0"><rect x="164" y="35" width="112" height="28" rx="9" fill="#fff"/><text x="220" y="53" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Neuer Tab</text></g></g>'''
new_tabs='''<g class="tabs"><rect class="tab-one-bg" x="47" y="35" width="112" height="28" rx="9" fill="#fff"/><text x="103" y="53" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Schulportal</text><g class="tab-two" opacity="0"><rect class="tab-two-bg" x="164" y="35" width="112" height="28" rx="9" fill="#dbe4ee"/><text x="220" y="53" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Recherche</text></g><g class="tab-three" opacity="0"><rect x="281" y="35" width="92" height="28" rx="9" fill="#dbe4ee"/><text x="327" y="53" text-anchor="middle" font-family="Arial" font-size="8.5" font-weight="700" fill="#475569">Aufgaben</text></g><g class="tab-new" opacity="0"><rect x="164" y="35" width="112" height="28" rx="9" fill="#fff"/><text x="220" y="53" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Neuer Tab</text></g><g class="tab-plus" opacity="0"><circle cx="337" cy="49" r="12" fill="#eef2f7" stroke="#cbd5e1"/><path d="M337 43v12M331 49h12" stroke="#64748b" stroke-width="2" stroke-linecap="round"/></g><rect class="active-tab-indicator" x="45" y="33" width="116" height="32" rx="11" fill="none" stroke="#60a5fa" stroke-width="2" opacity="0"/></g>'''
assert old_tabs in s, 'tabs markup not found'
s=s.replace(old_tabs,new_tabs,1)

old_addr='<rect x="48" y="91" width="318" height="28" rx="10" fill="#e2e8f0"/><rect class="address-highlight" x="56" y="97" width="174" height="16" rx="5" fill="#bfdbfe" opacity="0"/>'
new_addr='<rect class="address-box" x="48" y="91" width="318" height="28" rx="10" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1"/><rect class="address-highlight" x="56" y="97" width="0" height="16" rx="5" fill="#bfdbfe" opacity="0"/>'
assert old_addr in s, 'address markup not found'
s=s.replace(old_addr,new_addr,1)

old_caret='<line x1="72" y1="130" x2="72" y2="151" stroke="#2563eb" stroke-width="2.5"/>'
new_caret='<line class="new-doc-caret" x1="72" y1="130" x2="72" y2="151" stroke="#2563eb" stroke-width="2.5" opacity="0"/>'
assert old_caret in s, 'new doc caret not found'
s=s.replace(old_caret,new_caret,1)

# --- reset: explicit visual starting states -----------------------------------------
pat_reset=re.compile(r"    function reset\(\)\{clearTimers\(\);running=false;.*?\}\n    function applyEnd\(\)\{",re.S)
m=pat_reset.search(s)
assert m, 'reset function not found'
new_reset='''    function reset(){clearTimers();running=false;window.tk2SceneKeycaps.resetMany($$('.tk2-key, .tk2-u-key'));opacity($('.toast'),0);if($('.bold-word'))$('.bold-word').setAttribute('font-weight','400');opacity($('.bold-selection'),0);opacity($('.new-doc-sheet'),0);opacity($('.new-doc-caret'),0);
      var tabTwoVisible=['closeTab','nextTab','prevTab'].indexOf(mode)>=0;
      var tabThreeVisible=['closeTab','reopenTab'].indexOf(mode)>=0;
      opacity($('.tab-two'),tabTwoVisible?1:0);opacity($('.tab-three'),tabThreeVisible?1:0);opacity($('.tab-new'),0);opacity($('.tab-plus'),mode==='newTab'?1:0);opacity($('.active-tab-indicator'),['nextTab','prevTab'].indexOf(mode)>=0?1:0);
      if($('.tab-three'))$('.tab-three').setAttribute('transform',mode==='reopenTab'?'translate(-117 0)':'translate(0 0)');
      if($('.tab-two'))$('.tab-two').setAttribute('transform',mode==='reopenTab'?'translate(22 -8) scale(.92)':'translate(0 0) scale(1)');
      if($('.tab-new'))$('.tab-new').setAttribute('transform','translate(116 0) scale(.18 1)');
      if($('.active-tab-indicator'))$('.active-tab-indicator').setAttribute('transform',mode==='prevTab'?'translate(117 0)':'translate(0 0)');
      if($('.tabs'))$('.tabs').setAttribute('transform','translate(0 0)');
      opacity($('.refresh-ring'),0);if($('.refresh-ring'))$('.refresh-ring').setAttribute('transform','translate(210 185) rotate(0)');opacity($('.address-highlight'),0);if($('.address-highlight'))$('.address-highlight').setAttribute('width','0');if($('.address-box')){$('.address-box').setAttribute('stroke','#cbd5e1');$('.address-box').setAttribute('stroke-width','1');}if($('.address-text'))$('.address-text').setAttribute('fill','#64748b');if($('.page-content')){opacity($('.page-content'),1);$('.page-content').setAttribute('transform','translate(0 0)');}
      fill($('.tab-one-bg'),mode==='prevTab'?'#dbe4ee':'#fff');fill($('.tab-two-bg'),mode==='prevTab'?'#fff':'#dbe4ee');opacity($('.scene-lock'),0);opacity($('.app-windows'),1);opacity($('.explorer-window'),0);opacity($('.snip-overlay'),0);if($('.snip-box')){$('.snip-box').setAttribute('width','0');$('.snip-box').setAttribute('height','0');}opacity($('.switcher'),0);opacity($('.task-manager'),0);opacity($('.clipboard-panel'),0);opacity($('.snap-left-window'),0);opacity($('.snap-right-window'),0);
      [$('.new-doc-sheet'),$('.new-doc-caret'),$('.tab-new'),$('.tab-two'),$('.tab-three'),$('.tab-plus'),$('.active-tab-indicator'),$('.tabs'),$('.refresh-ring'),$('.address-highlight'),$('.address-box'),$('.page-content'),$('.switcher'),$('.snip-overlay'),$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')].forEach(function(el){if(!el)return;trans(el,'none');});
      [$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')].forEach(function(el){if(!el)return;el.setAttribute('transform','translate(0 0) scale(1)');});
      if($('.switch-a rect')){$('.switch-a rect').style.transition='none';$('.switch-a rect').setAttribute('stroke','#60a5fa');}if($('.switch-b rect')){$('.switch-b rect').style.transition='none';$('.switch-b rect').setAttribute('stroke','#334155');}}
    function applyEnd(){'''
s=s[:m.start()]+new_reset+s[m.end():]

# --- replace the A4 choreography block, ranked by user priority --------------------
pat_play=re.compile(r"    function playMode\(\)\{.*?\n    \}\n    function run\(\)\{",re.S)
m=pat_play.search(s)
assert m, 'playMode not found'
new_play='''    function playMode(){
      var keyDelay=mode==='reopenTab'?800:420;
      var actionAt=Math.max(1080,keyDelay+Math.max(0,cfg.keys.length-1)*190+280);
      if(mode==='bold')later(140,function(){opacity($('.bold-selection'),1);});
      later(keyDelay,pressKeys);

      // 1) Ctrl+W / Ctrl+Shift+T: the neighbouring tab visibly occupies/frees the slot.
      if(mode==='closeTab'){later(actionAt,function(){var closing=$('.tab-two'),next=$('.tab-three');trans(closing,'transform 500ms cubic-bezier(.2,.8,.2,1),opacity 340ms ease');trans(next,'transform 560ms cubic-bezier(.2,.8,.2,1)');closing.setAttribute('transform','translate(-8 -9) scale(.84)');opacity(closing,0);next.setAttribute('transform','translate(-117 0)');});later(actionAt+620,function(){toast('Tab geschlossen');});return;}
      if(mode==='reopenTab'){later(actionAt,function(){var restored=$('.tab-two'),next=$('.tab-three');trans(next,'transform 560ms cubic-bezier(.2,.8,.2,1)');trans(restored,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');next.setAttribute('transform','translate(0 0)');opacity(restored,1);later(35,function(){restored.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Tab wieder geöffnet');});return;}

      // 2) F5: page fades, loader rotates, content returns instead of a single frame swap.
      if(mode==='refresh'){later(930,function(){var page=$('.page-content'),ring=$('.refresh-ring');trans(page,'transform 420ms ease,opacity 340ms ease');page.setAttribute('transform','translate(0 4)');opacity(page,.18);trans(ring,'transform 760ms linear,opacity 220ms ease');opacity(ring,1);later(30,function(){ring.setAttribute('transform','translate(210 185) rotate(360)');});});later(1760,function(){var page=$('.page-content'),ring=$('.refresh-ring');trans(page,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');page.setAttribute('transform','translate(0 0)');opacity(page,1);opacity(ring,0);toast('Seite aktualisiert');});return;}

      // 3) Ctrl+Tab / Ctrl+Shift+Tab: an outline physically moves to the destination tab.
      if(mode==='nextTab'||mode==='prevTab'){later(actionAt,function(){var one=$('.tab-one-bg'),two=$('.tab-two-bg'),indicator=$('.active-tab-indicator'),tabs=$('.tabs');trans(one,'fill 520ms ease');trans(two,'fill 520ms ease');trans(indicator,'transform 560ms cubic-bezier(.2,.8,.2,1)');trans(tabs,'transform 260ms ease');tabs.setAttribute('transform',mode==='nextTab'?'translate(-4 0)':'translate(4 0)');indicator.setAttribute('transform',mode==='nextTab'?'translate(117 0)':'translate(0 0)');if(mode==='nextTab'){fill(one,'#dbe4ee');fill(two,'#fff');}else{fill(one,'#fff');fill(two,'#dbe4ee');}later(270,function(){tabs.setAttribute('transform','translate(0 0)');});});later(actionAt+620,function(){toast(mode==='nextTab'?'Nächster Tab':'Vorheriger Tab');});return;}

      // 4) Ctrl+N: new sheet comes forward and the caret confirms a live new document.
      if(mode==='newDoc'){later(actionAt,function(){var sheet=$('.new-doc-sheet');sheet.setAttribute('transform','translate(0 18) scale(.95)');trans(sheet,'transform 580ms cubic-bezier(.2,.8,.2,1),opacity 400ms ease');opacity(sheet,1);later(35,function(){sheet.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+610,function(){var caret=$('.new-doc-caret');trans(caret,'opacity 180ms ease');opacity(caret,1);});later(actionAt+930,function(){opacity($('.new-doc-caret'),0);});later(actionAt+1170,function(){opacity($('.new-doc-caret'),1);toast('Neues Dokument');});return;}

      // 5) Ctrl+T: the new tab grows out of the plus area and becomes active.
      if(mode==='newTab'){later(actionAt,function(){var tab=$('.tab-new'),plus=$('.tab-plus');trans(tab,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');trans(plus,'transform 300ms ease,opacity 260ms ease');plus.setAttribute('transform','scale(.72)');opacity(plus,0);opacity(tab,1);later(35,function(){tab.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Neuer Tab');});return;}

      // 6) Ctrl+L: focus ring + a real left-to-right selection sweep across the URL.
      if(mode==='addressBar'){later(actionAt,function(){var box=$('.address-box'),mark=$('.address-highlight');trans(box,'stroke 360ms ease,stroke-width 360ms ease');box.setAttribute('stroke','#3b82f6');box.setAttribute('stroke-width','2');trans(mark,'width 520ms cubic-bezier(.2,.8,.2,1),opacity 220ms ease');opacity(mark,1);mark.setAttribute('width','286');if($('.address-text')){trans($('.address-text'),'fill 420ms ease');$('.address-text').setAttribute('fill','#1e3a8a');}});later(actionAt+590,function(){toast('Adresse markiert');});return;}

      if(mode==='snip'){later(950,function(){var overlay=$('.snip-overlay');overlay.setAttribute('transform','scale(.985)');trans(overlay,'transform 420ms ease,opacity 380ms ease');opacity(overlay,1);later(30,function(){overlay.setAttribute('transform','scale(1)');});});later(1250,function(){trans($('.snip-box'),'width 520ms ease,height 520ms ease');$('.snip-box').setAttribute('width','180');$('.snip-box').setAttribute('height','104');});later(1900,function(){toast('Ausschnitt gewählt');});return;}
      if(mode==='appSwitch'){later(900,function(){var sw=$('.switcher');sw.setAttribute('transform','translate(0 12) scale(.96)');trans(sw,'transform 450ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');opacity(sw,1);later(30,function(){sw.setAttribute('transform','translate(0 0) scale(1)');});});later(1450,function(){trans($('.switch-a rect'),'stroke 380ms ease');trans($('.switch-b rect'),'stroke 380ms ease');$('.switch-a rect').setAttribute('stroke','#334155');$('.switch-b rect').setAttribute('stroke','#60a5fa');});later(1900,function(){toast('Zum Browser gewechselt');});return;}
      if(mode==='desktop'){later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 620ms cubic-bezier(.2,.8,.2,1),opacity 520ms ease');w.setAttribute('transform','translate(0 118) scale(.72)');opacity(w,0);});later(actionAt+680,function(){toast('Desktop sichtbar');});return;}
      if(mode==='lock'){later(actionAt,function(){var lock=$('.scene-lock');trans(lock,'opacity 520ms ease');opacity(lock,1);});later(actionAt+560,function(){toast('Computer gesperrt');});return;}
      if(mode==='explorer'){later(actionAt,function(){var panel=$('.explorer-window');panel.setAttribute('transform','translate(0 18) scale(.96)');trans(panel,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Explorer geöffnet');});return;}
      if(mode==='taskManager'){later(actionAt,function(){var panel=$('.task-manager');panel.setAttribute('transform','translate(0 18) scale(.96)');trans(panel,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Task-Manager geöffnet');});return;}
      if(mode==='clipboard'){later(actionAt,function(){var panel=$('.clipboard-panel');panel.setAttribute('transform','translate(16 0) scale(.97)');trans(panel,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+580,function(){toast('Verlauf geöffnet');});return;}
      if(mode==='closeWindow'){later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');w.setAttribute('transform','translate(0 -12) scale(.92)');opacity(w,0);});later(actionAt+580,function(){toast('Fenster geschlossen');});return;}
      if(mode==='snapLeft'||mode==='snapRight'){later(actionAt,function(){var w=$('.app-windows'),target=mode==='snapLeft'?$('.snap-left-window'):$('.snap-right-window');trans(w,'transform 420ms ease,opacity 320ms ease');w.setAttribute('transform',mode==='snapLeft'?'translate(-82 0) scale(.82)':'translate(82 0) scale(.82)');opacity(w,.12);target.setAttribute('transform',mode==='snapLeft'?'translate(-24 0) scale(.94)':'translate(24 0) scale(.94)');trans(target,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(target,1);later(30,function(){target.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast(mode==='snapLeft'?'Links angedockt':'Rechts angedockt');});return;}
      later(actionAt,applyEnd);
    }
    function run(){'''
s=s[:m.start()]+new_play+s[m.end():]

# Contract checks: every ranked scene must have a visible-motion primitive.
checks=[
    "var tabThreeVisible=['closeTab','reopenTab']",
    "next.setAttribute('transform','translate(-117 0)')",
    "ring.setAttribute('transform','translate(210 185) rotate(360)')",
    "indicator.setAttribute('transform',mode==='nextTab'?'translate(117 0)':'translate(0 0)')",
    "opacity($('.new-doc-caret'),1)",
    "plus.setAttribute('transform','scale(.72)')",
    "mark.setAttribute('width','286')",
]
for c in checks: assert c in s,c

p.write_text(s,encoding='utf-8')
print('Ranked A4 premium pass applied')
