from pathlib import Path

# Shared chord hold: once the last key in a shortcut is down, keep the full
# combination visibly pressed for exactly 800 ms, then release in reverse.
p=Path('tk2/sceneKeycaps.js')
s=p.read_text(encoding='utf-8')
if 'var CHORD_HOLD_MS=800;' not in s:
    s=s.replace("  var PROFILES={\n", "  var CHORD_HOLD_MS=800;\n  var RELEASE_STEP_MS=100;\n\n  var PROFILES={\n", 1)
old="""  function pressSequence(keys,later,trans,name){
    var p=profile(name);
    Array.from(keys||[]).forEach(function(key,index){
      later(index*p.step,function(){
        down(key,trans,name);
        later(p.hold,function(){up(key);});
      });
    });
  }

  window.tk2SceneKeycaps={markup:markup,rowWidth:rowWidth,down:down,up:up,reset:reset,resetMany:resetMany,pressSequence:pressSequence};
"""
new="""  function pressSequence(keys,later,trans,name){
    var p=profile(name);
    var list=Array.from(keys||[]);
    if(!list.length)return;

    list.forEach(function(key,index){
      later(index*p.step,function(){
        down(key,trans,name);
      });
    });

    var allDownAt=Math.max(0,(list.length-1)*p.step);
    later(allDownAt+CHORD_HOLD_MS,function(){
      list.slice().reverse().forEach(function(key,index){
        later(index*RELEASE_STEP_MS,function(){up(key);});
      });
    });
  }

  window.tk2SceneKeycaps={markup:markup,rowWidth:rowWidth,down:down,up:up,reset:reset,resetMany:resetMany,pressSequence:pressSequence,chordHoldMs:CHORD_HOLD_MS};
"""
assert old in s or 'chordHoldMs:CHORD_HOLD_MS' in s, 'sceneKeycaps pressSequence anchor missing'
if old in s:
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# A2 keeps its orange AltGr visual treatment, but reads the exact same shared
# 800 ms chord-hold constant. It must therefore load sceneKeycaps first.
p=Path('tk2/A2.html')
s=p.read_text(encoding='utf-8')
if 'sceneKeycaps.js' not in s:
    anchor='  <script src="altGrScene.js"></script>'
    assert anchor in s, 'A2 altGrScene loader missing'
    s=s.replace(anchor,'  <script src="sceneKeycaps.js"></script>\n'+anchor,1)
p.write_text(s,encoding='utf-8')

p=Path('tk2/altGrScene.js')
s=p.read_text(encoding='utf-8')
s=s.replace('  var CHORD_HOLD_MS=500;','  var CHORD_HOLD_MS=window.tk2SceneKeycaps?window.tk2SceneKeycaps.chordHoldMs:800;',1)
assert 'window.tk2SceneKeycaps?window.tk2SceneKeycaps.chordHoldMs:800' in s
p.write_text(s,encoding='utf-8')

print('Standardized visible shortcut chord overlap to 800 ms for animated A1/A2/A4/A5 theory scenes')
