from pathlib import Path

p=Path('tk2/altGrScene.js')
s=p.read_text(encoding='utf-8')

# A2 must not own a separate chord-duration constant anymore.
s=s.replace("  var CHORD_HOLD_MS=window.tk2SceneKeycaps?window.tk2SceneKeycaps.chordHoldMs:800;\n", "", 1)

old_markup="""    function keyMarkup(){
      return '<g class=\"keys\" transform=\"translate(36 219)\" filter=\"url(#'+uid+'Shadow)\">'+
        '<g class=\"key key-alt\" data-base=\"translate(0 0)\" transform=\"translate(0 0)\"><rect width=\"96\" height=\"50\" rx=\"12\" fill=\"#182235\" stroke=\"#f59e0b\" stroke-opacity=\".55\" stroke-width=\"2\"/><text x=\"48\" y=\"31\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"16\" font-weight=\"900\" fill=\"#fde68a\">AltGr</text></g>'+
        '<text x=\"112\" y=\"31\" font-family=\"Arial,sans-serif\" font-size=\"18\" font-weight=\"900\" fill=\"#64748b\">+</text>'+
        '<g class=\"key key-main\" data-base=\"translate(136 0)\" transform=\"translate(136 0)\"><rect width=\"70\" height=\"50\" rx=\"12\" fill=\"#182235\" stroke=\"#f59e0b\" stroke-opacity=\".55\" stroke-width=\"2\"/><text x=\"35\" y=\"31\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"18\" font-weight=\"900\" fill=\"#fde68a\">'+escapeText(cfg.key2)+'</text><text x=\"58\" y=\"44\" text-anchor=\"middle\" font-family=\"Arial,sans-serif\" font-size=\"10\" font-weight=\"900\" fill=\"#fbbf24\">'+escapeText(cfg.char)+'</text></g>'+
      '</g>';
    }
"""
new_markup="""    function keyMarkup(){
      return '<g class=\"keys\" transform=\"translate(36 227)\" filter=\"url(#'+uid+'Shadow)\">'+
        window.tk2SceneKeycaps.markup(['AltGr',cfg.key2],'utility')+
      '</g>';
    }
"""
assert old_markup in s or "window.tk2SceneKeycaps.markup(['AltGr',cfg.key2],'utility')" in s, 'A2 key markup anchor missing'
if old_markup in s:
    s=s.replace(old_markup,new_markup,1)

old_reset="""    function reset(){
      clearTimers();running=false;
      $$('.key').forEach(function(k){k.style.filter='';k.style.transition='none';k.setAttribute('transform',k.getAttribute('data-base'));});
      opacity($('.hero-char'),.28);opacity($('.flying-char'),0);$('.flying-char').setAttribute('transform','translate(0 0) scale(1)');
"""
new_reset="""    function reset(){
      clearTimers();running=false;
      window.tk2SceneKeycaps.resetMany($$('.tk2-u-key'));
      opacity($('.hero-char'),.28);opacity($('.flying-char'),0);$('.flying-char').setAttribute('transform','translate(0 0) scale(1)');
"""
assert old_reset in s or "window.tk2SceneKeycaps.resetMany($$('.tk2-u-key'));" in s, 'A2 reset anchor missing'
if old_reset in s:
    s=s.replace(old_reset,new_reset,1)

old_funcs="""    function keyDown(el){
      var base=el.getAttribute('data-base');
      trans(el,'transform 180ms ease, filter 180ms ease');
      el.setAttribute('transform',base+' translate(0 5)');
      el.style.filter='drop-shadow(0 0 10px rgba(245,158,11,.9))';
    }

    function keyUp(el){
      var base=el.getAttribute('data-base');
      trans(el,'transform 160ms ease, filter 160ms ease');
      el.setAttribute('transform',base);
      el.style.filter='';
    }

"""
s=s.replace(old_funcs,'',1)

old_run="""    function run(){
      if(reduceMotion){showEndState();return;}
      reset();running=true;
      var secondKeyAt=700;
      later(350,function(){keyDown($('.key-alt'));});
      later(secondKeyAt,function(){keyDown($('.key-main'));});
      later(1000,function(){
        trans($('.hero-char'),'opacity 260ms ease');
        opacity($('.hero-char'),1);
        opacity($('.press-label'),1);
      });
      later(1100,function(){
        opacity($('.flying-char'),1);
        trans($('.flying-char'),'transform 820ms cubic-bezier(.2,.78,.24,1), opacity 180ms ease');
        $('.flying-char').setAttribute('transform',flyingTargetTransform());
      });
      later(secondKeyAt+CHORD_HOLD_MS,function(){keyUp($('.key-main'));});
      later(secondKeyAt+CHORD_HOLD_MS+120,function(){keyUp($('.key-alt'));});
      later(1920,function(){opacity($('.flying-char'),0);opacity($('.ctx-char'),1);opacity($('.context-result'),1);});
      later(LOOP_MS,function(){running=false;if(active&&autoLoop)run();});
    }
"""
new_run="""    function run(){
      if(reduceMotion){showEndState();return;}
      reset();running=true;
      later(350,function(){
        window.tk2SceneKeycaps.pressSequence($$('.tk2-u-key'),later,trans,'utility');
      });
      later(1000,function(){
        trans($('.hero-char'),'opacity 260ms ease');
        opacity($('.hero-char'),1);
        opacity($('.press-label'),1);
      });
      later(1100,function(){
        opacity($('.flying-char'),1);
        trans($('.flying-char'),'transform 820ms cubic-bezier(.2,.78,.24,1), opacity 180ms ease');
        $('.flying-char').setAttribute('transform',flyingTargetTransform());
      });
      later(1920,function(){opacity($('.flying-char'),0);opacity($('.ctx-char'),1);opacity($('.context-result'),1);});
      later(LOOP_MS,function(){running=false;if(active&&autoLoop)run();});
    }
"""
assert old_run in s or "window.tk2SceneKeycaps.pressSequence($$('.tk2-u-key'),later,trans,'utility');" in s, 'A2 run anchor missing'
if old_run in s:
    s=s.replace(old_run,new_run,1)

# Hard quality assertions: no A2-owned animated key mechanics remain.
assert 'function keyDown(' not in s
assert 'function keyUp(' not in s
assert 'key-alt' not in s
assert 'key-main' not in s
assert 'CHORD_HOLD_MS' not in s
assert "window.tk2SceneKeycaps.markup(['AltGr',cfg.key2],'utility')" in s
assert "window.tk2SceneKeycaps.pressSequence($$('.tk2-u-key'),later,trans,'utility');" in s
assert "window.tk2SceneKeycaps.resetMany($$('.tk2-u-key'));" in s

p.write_text(s,encoding='utf-8')
print('A2 now uses sceneKeycaps renderer, reset and 800ms pressSequence directly')
