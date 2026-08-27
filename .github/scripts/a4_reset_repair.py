from pathlib import Path
import re

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

resize_start=s.index('function createWindowResizeScene')
a4_start=s.index('function createA4Scene')
resize=s[resize_start:a4_start]
a4=s[a4_start:]

resize_pat=re.compile(r"    function reset\(\)\{.*?\n    function applyEnd\(\)\{",re.S)
m=resize_pat.search(resize)
assert m, 'resize reset block not found'
resize_reset="""    function reset(){clearTimers();running=false;transition(win,'none');opacity(win,1);opacity(direction,0);opacity(toast,0);transform(win,isMax?'translate(0 0) scale(1)':'translate(-38 -20) scale(1.24 1.16)');window.tk2SceneKeycaps.resetMany(keys);}
    function applyEnd(){"""
resize=resize[:m.start()]+resize_reset+resize[m.end():]

# Replace the main A4/A5 reset with the complete current state model.
a4_pat=re.compile(r"    function reset\(\)\{.*?\n    function applyEnd\(\)\{",re.S)
m=a4_pat.search(a4)
assert m, 'main reset block not found'
main_reset="""    function reset(){
      clearTimers();running=false;
      window.tk2SceneKeycaps.resetMany($$('.tk2-key, .tk2-u-key'));
      opacity($('.toast'),0);
      if($('.bold-word'))$('.bold-word').setAttribute('font-weight','400');
      opacity($('.bold-selection'),0);opacity($('.new-doc-sheet'),0);opacity($('.new-doc-caret'),0);opacity($('.doc-dim'),0);

      var tabTwoVisible=['closeTab','nextTab','prevTab'].indexOf(mode)>=0;
      var tabThreeVisible=['closeTab','reopenTab'].indexOf(mode)>=0;
      opacity($('.tab-two'),tabTwoVisible?1:0);opacity($('.tab-three'),tabThreeVisible?1:0);opacity($('.tab-new'),0);opacity($('.tab-plus'),mode==='newTab'?1:0);opacity($('.active-tab-indicator'),['nextTab','prevTab'].indexOf(mode)>=0?1:0);
      if($('.tab-three'))$('.tab-three').setAttribute('transform',mode==='reopenTab'?'translate(-117 0)':'translate(0 0)');
      if($('.tab-two'))$('.tab-two').setAttribute('transform',mode==='reopenTab'?'translate(22 -8) scale(.92)':'translate(0 0) scale(1)');
      if($('.tab-new'))$('.tab-new').setAttribute('transform','translate(116 0) scale(.18 1)');
      if($('.tab-one'))$('.tab-one').setAttribute('transform','translate(0 0) scale(1)');
      if($('.active-tab-indicator'))$('.active-tab-indicator').setAttribute('transform',mode==='prevTab'?'translate(117 0)':'translate(0 0)');
      if($('.tabs'))$('.tabs').setAttribute('transform','translate(0 0)');

      opacity($('.refresh-ring'),0);if($('.refresh-ring'))$('.refresh-ring').setAttribute('transform','translate(210 185) rotate(0)');
      opacity($('.address-highlight'),0);if($('.address-highlight'))$('.address-highlight').setAttribute('width','0');
      if($('.address-box')){$('.address-box').setAttribute('stroke','#cbd5e1');$('.address-box').setAttribute('stroke-width','1');}
      if($('.address-text'))$('.address-text').setAttribute('fill','#64748b');

      var altFirst=mode==='reopenTab'||mode==='prevTab';
      if($('.page-content')){opacity($('.page-content'),altFirst?0:1);$('.page-content').setAttribute('transform',altFirst?'translate(-14 0)':'translate(0 0)');}
      if($('.page-content-alt')){opacity($('.page-content-alt'),altFirst?1:0);$('.page-content-alt').setAttribute('transform',altFirst?'translate(0 0)':'translate(14 0)');}
      $$('.page-title,.page-line,.page-action').forEach(function(el){opacity(el,1);el.setAttribute('transform','translate(0 0)');});

      fill($('.tab-one-bg'),mode==='prevTab'?'#dbe4ee':'#fff');fill($('.tab-two-bg'),mode==='prevTab'?'#fff':'#dbe4ee');
      opacity($('.scene-lock'),0);opacity($('.app-windows'),1);opacity($('.explorer-window'),0);opacity($('.snip-overlay'),0);
      if($('.snip-box')){$('.snip-box').setAttribute('width','0');$('.snip-box').setAttribute('height','0');}
      opacity($('.switcher'),0);opacity($('.task-manager'),0);opacity($('.clipboard-panel'),0);opacity($('.snap-left-window'),0);opacity($('.snap-right-window'),0);

      [$('.new-doc-sheet'),$('.new-doc-caret'),$('.doc-dim'),$('.tab-one'),$('.tab-new'),$('.tab-two'),$('.tab-three'),$('.tab-plus'),$('.active-tab-indicator'),$('.tabs'),$('.refresh-ring'),$('.address-highlight'),$('.address-box'),$('.page-content'),$('.page-content-alt'),$('.switcher'),$('.snip-overlay'),$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')].forEach(function(el){if(el)trans(el,'none');});
      [$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')].forEach(function(el){if(el)el.setAttribute('transform','translate(0 0) scale(1)');});
      if($('.switch-a rect')){$('.switch-a rect').style.transition='none';$('.switch-a rect').setAttribute('stroke','#60a5fa');}
      if($('.switch-b rect')){$('.switch-b rect').style.transition='none';$('.switch-b rect').setAttribute('stroke','#334155');}
    }
    function applyEnd(){"""
a4=a4[:m.start()]+main_reset+a4[m.end():]

s=s[:resize_start]+resize+a4

# Semantic safety checks.
resize_now=s[s.index('function createWindowResizeScene'):s.index('function createA4Scene')]
rm=re.search(r"function reset\(\)\{(.*?)\}\n    function applyEnd",resize_now,re.S)
assert rm, 'repaired resize reset missing'
assert 'resetMany(keys)' in rm.group(1)
assert "$('." not in rm.group(1)
assert 'mode===' not in rm.group(1)

main_now=s[s.index('function createA4Scene'):]
mm=re.search(r"function reset\(\)\{(.*?)\n    \}\n    function applyEnd",main_now,re.S)
assert mm, 'repaired main reset missing'
for token in ['page-content-alt','doc-dim','tab-one','altFirst']:
    assert token in mm.group(1), token
assert "window.tk2SceneKeycaps.pressSequence" in s
assert "sceneLoopMs=cfg.family==='windows'?5600:(isA4Mode?4600:LOOP_MS)" in s

p.write_text(s,encoding='utf-8')
print('Reset scopes repaired; A4 premium 2/2 preserved')
