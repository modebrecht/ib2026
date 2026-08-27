from pathlib import Path

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

# 1) Remove decorative circles from A5/Windows scenes.
s=s.replace('<circle cx="315" cy="83" r="94" fill="#60a5fa" opacity=".34"/>','',1)
s=s.replace('<circle cx="310" cy="76" r="74" fill="#38bdf8" opacity=".12"/>','',1)

old="""      +'<g class=\"direction\" opacity=\"0\"><circle cx=\"485\" cy=\"133\" r=\"42\" fill=\"#1d4ed8\" opacity=\".22\"/><path d=\"'+(isMax?'M485 154V111M469 127l16-16 16 16':'M485 111v43M469 138l16 16 16-16')+'\" fill=\"none\" stroke=\"#93c5fd\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g>'"""
new="""      +'<g class=\"direction\" opacity=\"0\"><rect x=\"447\" y=\"95\" width=\"76\" height=\"76\" rx=\"20\" fill=\"#0f2746\" opacity=\".92\" stroke=\"#1d4ed8\" stroke-width=\"1.5\"/><path d=\"'+(isMax?'M485 154V111M469 127l16-16 16 16':'M485 111v43M469 138l16 16 16-16')+'\" fill=\"none\" stroke=\"#93c5fd\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g>'"""
assert old in s, 'direction marker not found'
s=s.replace(old,new,1)

# 2) Keep maximized window inside the desktop rectangle.
s=s.replace('<rect x="43" y="38" width="340" height="198" rx="13" fill="#38bdf8" opacity=".10" stroke="#7dd3fc" stroke-width="2" stroke-dasharray="7 5"/>','<rect x="40" y="40" width="345" height="235" rx="13" fill="#38bdf8" opacity=".10" stroke="#7dd3fc" stroke-width="2" stroke-dasharray="7 5"/>',1)
old_transform='translate(-61 -31) scale(1.5 1.42)'
new_transform='translate(-132 -42) scale(1.55 1.48)'
count=s.count(old_transform)
assert count==2, f'expected 2 maximize transforms, got {count}'
s=s.replace(old_transform,new_transform)

# 3) Robust layout for EVERY three-key combination: max 196px rendered width,
#    right edge fixed at x=536 (24px scene margin). Key timing is untouched.
old="var main=cfg.family==='browser'?browserMarkup():(cfg.family==='doc'?docMarkup():windowsMarkup()),keyRowWidth=window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile),keyScale=cfg.keys.length>=3?.68:1,keyX=552-keyRowWidth*keyScale;"
new="var main=cfg.family==='browser'?browserMarkup():(cfg.family==='doc'?docMarkup():windowsMarkup()),keyRowWidth=window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile),keyScale=cfg.keys.length>=3?Math.min(.78,196/keyRowWidth):1,keyX=536-keyRowWidth*keyScale,sceneDecoration=cfg.family==='windows'?'':'<circle cx=\"500\" cy=\"42\" r=\"100\" fill=\"#06b6d4\" opacity=\".045\"/>';"
assert old in s, 'key layout marker not found'
s=s.replace(old,new,1)

# 4) The generic background circle remains for A4 browser/doc scenes only, never A5 Windows.
old="<rect width=\"560\" height=\"320\" rx=\"24\" fill=\"#07101f\"/><circle cx=\"500\" cy=\"42\" r=\"100\" fill=\"#06b6d4\" opacity=\".045\"/>'+main+"
new="<rect width=\"560\" height=\"320\" rx=\"24\" fill=\"#07101f\"/>'+sceneDecoration+main+"
assert old in s, 'generic scene decoration marker not found'
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('patched A5 circles, 3-key rows and maximize bounds')
