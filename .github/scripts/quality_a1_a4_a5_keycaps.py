from pathlib import Path
import re

# 1) Promote the exact A1 key renderers into the already shared sceneKeycaps helper.
p=Path('tk2/sceneKeycaps.js')
s=p.read_text(encoding='utf-8')
if 'function markup(keys,name)' not in s:
    anchor="  function baseOf(key){return key.getAttribute('data-base')||'';}\n"
    assert anchor in s
    block=r'''

  function keyWidth(key,name){
    if(name==='doc'){
      if(key==='Shift')return 78;
      if(key==='Ctrl')return 68;
      return 48;
    }
    return key==='Ctrl'?68:(String(key).length>2?70:48);
  }

  function rowWidth(keys,name){
    return Array.from(keys||[]).reduce(function(total,key){return total+keyWidth(key,name);},0)+Math.max(0,Array.from(keys||[]).length-1)*26;
  }

  function esc(value){
    return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function markup(keys,name){
    var x=0;
    var isDoc=name==='doc';
    var cls=isDoc?'tk2-key':'tk2-u-key';
    return Array.from(keys||[]).map(function(key,index){
      var w=keyWidth(key,name);
      var base='translate('+x+' 0)';
      var dataKey=isDoc?' data-key="'+esc(key)+'"':'';
      var fontSize=String(key).length>4?(isDoc?12:11):14;
      var out='<g class="'+cls+'"'+dataKey+' data-base="'+base+'" transform="'+base+'"><rect width="'+w+'" height="42" rx="10" fill="#172033" stroke="#475569" stroke-width="1.5"/><text x="'+(w/2)+'" y="27" text-anchor="middle" font-family="Arial,sans-serif" font-size="'+fontSize+'" font-weight="800" fill="#dbeafe">'+esc(key)+'</text></g>';
      x+=w;
      if(index<Array.from(keys||[]).length-1){
        out+='<text x="'+(x+9)+'" y="27" font-family="Arial,sans-serif" font-size="16" font-weight="800" fill="#64748b">+</text>';
        x+=26;
      }
      return out;
    }).join('');
  }
'''
    s=s.replace(anchor,anchor+block,1)
s=s.replace("  window.tk2SceneKeycaps={down:down,up:up,reset:reset,resetMany:resetMany,pressSequence:pressSequence};",
            "  window.tk2SceneKeycaps={markup:markup,rowWidth:rowWidth,down:down,up:up,reset:reset,resetMany:resetMany,pressSequence:pressSequence};")
p.write_text(s,encoding='utf-8')

# 2) A1 doc scenes: stop owning a second renderer; call the shared renderer that contains A1's exact rules.
p=Path('tk2/docTextScene.js')
s=p.read_text(encoding='utf-8')
s=re.sub(r"\n    function keyWidth\(key\)\{.*?\n    var keyX = 425;", "\n    var keyX = 425;", s, count=1, flags=re.S)
s=s.replace("+keyMarkup(cfg.keys)+", "+window.tk2SceneKeycaps.markup(cfg.keys,'doc')+")
p.write_text(s,encoding='utf-8')

# 3) A1 utility scenes: same treatment for the utility renderer.
for filename in ['tk2/utilityScenes-base.js','tk2/utilityNavigationScenes.js']:
    p=Path(filename)
    s=p.read_text(encoding='utf-8')
    s=re.sub(r"\n  function keyMarkup\(keys\)\{.*?\n  \}\n", "\n", s, count=1, flags=re.S)
    s=s.replace("+keyMarkup(cfg.keys)+", "+window.tk2SceneKeycaps.markup(cfg.keys,'utility')+")
    s=s.replace("+keyMarkup(['Ctrl',toTop?'Home':'End'])+", "+window.tk2SceneKeycaps.markup(['Ctrl',toTop?'Home':'End'],'utility')+")
    p.write_text(s,encoding='utf-8')

# 4) A4/A5 scene engine: remove its private key renderer and use A1's renderer/mechanics.
p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')
s=re.sub(r"\n  function keyWidth\(key\)\{.*?\n\n  function createWindowResizeScene", "\n\n  function createWindowResizeScene", s, count=1, flags=re.S)

# Window resize uses the exact A1 utility renderer instead of hard-coded resize keys.
pattern=r"      \+'<g class=\"key-row\" transform=\"translate\(449 225\)\">.*?</g></g>'\n      \+'<g class=\"toast\""
replacement="      +'<g class=\"key-row\" transform=\"translate(449 225)\">'+window.tk2SceneKeycaps.markup(['Win',isMax?'↑':'↓'],'utility')+'</g>'\n      +'<g class=\"toast\""
s,n=re.subn(pattern,replacement,s,count=1,flags=re.S)
assert n==1, 'resize key markup anchor missing'
s=s.replace("keys=Array.from(svg.querySelectorAll('.resize-key'))", "keys=Array.from(svg.querySelectorAll('.tk2-u-key'))",1)
old="""    function keyDown(key){window.tk2SceneKeycaps.down(key,transition,'utility');}\n    function keyUp(key){window.tk2SceneKeycaps.up(key);}\n    function reset(){clearTimers();running=false;transition(win,'none');opacity(win,1);opacity(direction,0);opacity(toast,0);transform(win,isMax?'translate(0 0) scale(1)':'translate(-38 -20) scale(1.24 1.16)');keys.forEach(keyUp);}"""
new="""    function pressKeys(){window.tk2SceneKeycaps.pressSequence(keys,later,transition,'utility');}\n    function reset(){clearTimers();running=false;transition(win,'none');opacity(win,1);opacity(direction,0);opacity(toast,0);transform(win,isMax?'translate(0 0) scale(1)':'translate(-38 -20) scale(1.24 1.16)');window.tk2SceneKeycaps.resetMany(keys);}"""
assert old in s, 'resize press helper anchor missing'
s=s.replace(old,new,1)
old_run="function run(){if(reduceMotion){showEndState();return;}reset();running=true;later(350,function(){opacity(direction,1);keyDown(keys[0]);});later(540,function(){keyDown(keys[1]);});later(870,function(){keyUp(keys[1]);keyUp(keys[0]);});later(930,function(){"
new_run="function run(){if(reduceMotion){showEndState();return;}reset();running=true;later(350,function(){opacity(direction,1);pressKeys();});later(930,function(){"
assert old_run in s, 'resize run timing anchor missing'
s=s.replace(old_run,new_run,1)

# Main A4/A5 scenes: choose the same A1 profile by scene family.
anchor="    var mode=options.mode||'newTab',cfg=CONFIG[mode]||CONFIG.newTab,active=options.autoplay!==false,autoLoop=options.loop!==false,reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,uid='tk2a4'+(++counter),timers=[],running=false,controller=null;\n"
assert anchor in s
s=s.replace(anchor,anchor+"    var keyProfile=cfg.family==='doc'?'doc':'utility';\n",1)
s=s.replace("+keyMarkup(cfg.keys)+", "+window.tk2SceneKeycaps.markup(cfg.keys,keyProfile)+")
s=s.replace("keyRowWidth(cfg.keys)", "window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile)")

old_main="""    function keyDown(k){var base=k.getAttribute('data-base');trans(k,'transform 150ms ease, filter 150ms ease');k.setAttribute('transform',base+' translate(0 4)');k.style.filter='drop-shadow(0 0 8px rgba(56,189,248,.75))';}\n    function keyUp(k){var base=k.getAttribute('data-base');trans(k,'transform 140ms ease, filter 140ms ease');k.setAttribute('transform',base);k.style.filter='';}\n    function pressKeys(){var keys=$$('.a4-key');if(keys.length===1){keyDown(keys[0]);later(230,function(){keyUp(keys[0]);});return;}keys.forEach(function(k,i){later(i*190,function(){keyDown(k);});});later(760,function(){keys.slice().reverse().forEach(function(k,i){later(i*110,function(){keyUp(k);});});});}"""
new_main="""    function pressKeys(){window.tk2SceneKeycaps.pressSequence($$('.tk2-key, .tk2-u-key'),later,trans,keyProfile);}"""
assert old_main in s, 'main custom press block missing'
s=s.replace(old_main,new_main,1)
old_reset="$$('.a4-key').forEach(function(k){k.style.filter='';k.style.transition='none';k.setAttribute('transform',k.getAttribute('data-base'));});"
assert old_reset in s, 'main custom reset missing'
s=s.replace(old_reset,"window.tk2SceneKeycaps.resetMany($$('.tk2-key, .tk2-u-key'));",1)
p.write_text(s,encoding='utf-8')

# 5) Match A1's mobile header-key sizing too (same visible key labels at <=520px).
for filename in ['tk2/A4.html','tk2/A5.html']:
    p=Path(filename)
    s=p.read_text(encoding='utf-8')
    mobile="@media(max-width:520px){.lesson-keys kbd{font-size:.7rem;padding:4px 7px}}"
    if mobile not in s:
        s=s.replace("    @media(prefers-reduced-motion:reduce)", "    "+mobile+"\n    @media(prefers-reduced-motion:reduce)",1)
    p.write_text(s,encoding='utf-8')

print('A1/A4/A5 now share renderer, dimensions, press mechanics and finish component')
