from pathlib import Path

# A1 HTML: load shared keycap mechanics and move theory-finish styling to shared.css
p=Path('tk2/A1.html')
s=p.read_text(encoding='utf-8')
s=s.replace("    .theory-finish{max-width:1040px;text-align:center;margin:1.5rem auto 0;padding:18px;border-radius:18px;background:rgba(16,185,129,.045);border:1px solid rgba(16,185,129,.14)}\n    .theory-finish p{color:var(--text-muted);margin:0 0 .5rem}\n",'')
if 'sceneKeycaps.js' not in s:
    assert '  <script src="docTextScene.js"></script>' in s
    s=s.replace('  <script src="docTextScene.js"></script>','  <script src="sceneKeycaps.js"></script>\n  <script src="docTextScene.js"></script>',1)
p.write_text(s,encoding='utf-8')

# Shared component styling: exact A1 finish box now comes from shared.css
p=Path('tk/shared.css')
s=p.read_text(encoding='utf-8')
block='''\n/* Shared A1 theory completion component. */\n.theory-finish {\n    max-width: 1040px;\n    text-align: center;\n    margin: 1.5rem auto 0;\n    padding: 18px;\n    border-radius: 18px;\n    background: rgba(16, 185, 129, 0.045);\n    border: 1px solid rgba(16, 185, 129, 0.14);\n}\n\n.theory-finish p {\n    color: var(--text-muted);\n    margin: 0 0 0.5rem;\n}\n'''
if '.theory-finish {' not in s:
    s += block
p.write_text(s,encoding='utf-8')

# A4 HTML: use same shared scene keycaps + same theory-finish component
p=Path('tk2/A4.html')
s=p.read_text(encoding='utf-8')
s=s.replace("    .theory-action{display:flex;justify-content:flex-end;margin-top:14px;padding:18px;border-radius:18px;background:rgba(16,185,129,.045);border:1px solid rgba(16,185,129,.14)}",'')
s=s.replace('<div class="theory-action"><button class="tk-btn-primary" id="toQ8QuestBtn">Weiter zur Quest 8 ↓</button></div>', '<div class="theory-finish"><p>Alle acht gesehen? Dann probierst du die Kürzel selbst in Quest 8 aus.</p><button class="tk-btn-primary" id="toQ8QuestBtn">Weiter zur Quest 8 ↓</button></div>',1)
if 'sceneKeycaps.js' not in s:
    assert '<script src="a4Scenes.js"></script>' in s
    s=s.replace('<script src="a4Scenes.js"></script>','<script src="sceneKeycaps.js"></script>\n<script src="a4Scenes.js"></script>',1)
p.write_text(s,encoding='utf-8')

# A1 doc scene: use shared mechanics directly
p=Path('tk2/docTextScene.js')
s=p.read_text(encoding='utf-8')
if 'window.tk2SceneKeycaps.pressSequence' not in s:
    old='''    function pressKeys(){\n      $$('.tk2-key').forEach(function(key, i){\n        later(i*150, function(){\n          var base = key.getAttribute('data-base');\n          trans(key,'transform 160ms ease, filter 160ms ease');\n          key.setAttribute('transform', base + ' translate(0 4)');\n          key.style.filter='drop-shadow(0 0 8px rgba(56,189,248,.75))';\n          later(240,function(){ key.setAttribute('transform',base); key.style.filter=''; });\n        });\n      });\n    }'''
    new="""    function pressKeys(){\n      window.tk2SceneKeycaps.pressSequence($$('.tk2-key'),later,trans,'doc');\n    }"""
    assert old in s, 'doc pressKeys anchor missing'
    s=s.replace(old,new,1)
    old="      $$('.tk2-key').forEach(function(k){k.style.transition='none';k.style.filter='';k.setAttribute('transform',k.getAttribute('data-base'));});"
    assert old in s, 'doc reset anchor missing'
    s=s.replace(old,"      window.tk2SceneKeycaps.resetMany($$('.tk2-key'));",1)
p.write_text(s,encoding='utf-8')

# A1 utility base: use shared A1 utility profile
p=Path('tk2/utilityScenes-base.js')
s=p.read_text(encoding='utf-8')
if 'window.tk2SceneKeycaps.pressSequence' not in s:
    old='''    function pressKeys(){\n      $$('.tk2-u-key').forEach(function(k,i){\n        later(i*115,function(){\n          var base=k.getAttribute('data-base');\n          trans(k,'transform 100ms ease, filter 100ms ease');\n          k.setAttribute('transform',base+' translate(0 4)');\n          k.style.filter='drop-shadow(0 0 8px rgba(56,189,248,.75))';\n          later(170,function(){k.setAttribute('transform',base);k.style.filter='';});\n        });\n      });\n    }'''
    new="""    function pressKeys(){\n      window.tk2SceneKeycaps.pressSequence($$('.tk2-u-key'),later,trans,'utility');\n    }"""
    assert old in s, 'utility base pressKeys anchor missing'
    s=s.replace(old,new,1)
    old="      $$('.tk2-u-key').forEach(function(k){k.style.transition='none';k.style.filter='';k.setAttribute('transform',k.getAttribute('data-base'));});"
    assert old in s, 'utility base reset anchor missing'
    s=s.replace(old,"      window.tk2SceneKeycaps.resetMany($$('.tk2-u-key'));",1)
p.write_text(s,encoding='utf-8')

# A1 navigation utility: same shared profile
p=Path('tk2/utilityNavigationScenes.js')
s=p.read_text(encoding='utf-8')
if 'window.tk2SceneKeycaps.pressSequence' not in s:
    old='''    function pressKeys(){\n      $$('.tk2-u-key').forEach(function(k,i){\n        later(i*115,function(){\n          var base=k.getAttribute('data-base');\n          trans(k,'transform 100ms ease, filter 100ms ease');\n          k.setAttribute('transform',base+' translate(0 4)');\n          k.style.filter='drop-shadow(0 0 8px rgba(56,189,248,.75))';\n          later(170,function(){k.setAttribute('transform',base);k.style.filter='';});\n        });\n      });\n    }'''
    new="""    function pressKeys(){\n      window.tk2SceneKeycaps.pressSequence($$('.tk2-u-key'),later,trans,'utility');\n    }"""
    assert old in s, 'navigation pressKeys anchor missing'
    s=s.replace(old,new,1)
    old="      $$('.tk2-u-key').forEach(function(k){k.style.transition='none';k.style.filter='';k.setAttribute('transform',k.getAttribute('data-base'));});"
    assert old in s, 'navigation reset anchor missing'
    s=s.replace(old,"      window.tk2SceneKeycaps.resetMany($$('.tk2-u-key'));",1)
p.write_text(s,encoding='utf-8')

# A4 scenes: delegate key down/up to the exact shared A1 mechanics.
p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')
old_down="function keyDown(key){var base=key.getAttribute('data-base')||'';transition(key,'transform 150ms ease,filter 150ms ease');transform(key,base+' translate(0 4)');key.style.filter='drop-shadow(0 0 8px rgba(96,165,250,.8))';}"
old_up="function keyUp(key){var base=key.getAttribute('data-base')||'';transition(key,'transform 140ms ease,filter 140ms ease');transform(key,base);key.style.filter='';}"
s=s.replace(old_down,"function keyDown(key){window.tk2SceneKeycaps.down(key,transition,'utility');}")
s=s.replace(old_up,"function keyUp(key){window.tk2SceneKeycaps.up(key);}")
assert 'window.tk2SceneKeycaps.down' in s, 'A4 keyDown reuse missing'
p.write_text(s,encoding='utf-8')

print('A4 now reuses A1 keycap mechanics and theory finish component')
