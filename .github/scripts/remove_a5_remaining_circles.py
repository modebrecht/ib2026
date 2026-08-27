from pathlib import Path

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

# A5 resize arrow: keep the directional cue, remove the distracting circular backdrop.
old="""      +'<g class=\"direction\" opacity=\"0\"><circle cx=\"485\" cy=\"133\" r=\"42\" fill=\"#1d4ed8\" opacity=\".22\"/><path d=\"'+(isMax?'M485 154V111M469 127l16-16 16 16':'M485 111v43M469 138l16 16 16-16')+'\" fill=\"none\" stroke=\"#93c5fd\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g>'"""
new="""      +'<g class=\"direction\" opacity=\"0\"><rect x=\"447\" y=\"95\" width=\"76\" height=\"76\" rx=\"20\" fill=\"#0f2746\" opacity=\".92\" stroke=\"#1d4ed8\" stroke-width=\"1.5\"/><path d=\"'+(isMax?'M485 154V111M469 127l16-16 16 16':'M485 111v43M469 138l16 16 16-16')+'\" fill=\"none\" stroke=\"#93c5fd\" stroke-width=\"7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g>'"""
assert old in s, 'direction circle marker not found'
s=s.replace(old,new,1)

# Keep A4's subtle decoration, but remove it from every A5/Windows scene.
old="var main=cfg.family==='browser'?browserMarkup():(cfg.family==='doc'?docMarkup():windowsMarkup()),keyRowWidth=window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile),keyX=552-keyRowWidth;"
new="var main=cfg.family==='browser'?browserMarkup():(cfg.family==='doc'?docMarkup():windowsMarkup()),keyRowWidth=window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile),keyX=552-keyRowWidth,sceneDecoration=cfg.family==='windows'?'':'<circle cx=\"500\" cy=\"42\" r=\"100\" fill=\"#06b6d4\" opacity=\".045\"/>';"
assert old in s, 'key row / decoration marker not found'
s=s.replace(old,new,1)

old="<rect width=\"560\" height=\"320\" rx=\"24\" fill=\"#07101f\"/><circle cx=\"500\" cy=\"42\" r=\"100\" fill=\"#06b6d4\" opacity=\".045\"/>'+main+"
new="<rect width=\"560\" height=\"320\" rx=\"24\" fill=\"#07101f\"/>'+sceneDecoration+main+"
assert old in s, 'generic background circle marker not found'
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('removed remaining A5 decorative circles')
