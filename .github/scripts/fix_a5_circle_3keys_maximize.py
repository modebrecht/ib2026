from pathlib import Path

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

# 1) Remove distracting internal A5 decorative circles from Windows scenes.
old="""      +'<g class=\"desktop\" filter=\"url(#'+uid+'Shadow)\"><rect x=\"28\" y=\"25\" width=\"365\" height=\"255\" rx=\"17\" fill=\"#0b5ea8\"/><circle cx=\"315\" cy=\"83\" r=\"94\" fill=\"#60a5fa\" opacity=\".34\"/><rect x=\"28\" y=\"245\" width=\"365\" height=\"35\" fill=\"#111827\" opacity=\".94\"/><circle cx=\"205\" cy=\"262\" r=\"10\" fill=\"#2563eb\"/></g>'"""
new="""      +'<g class=\"desktop\" filter=\"url(#'+uid+'Shadow)\"><rect x=\"28\" y=\"25\" width=\"365\" height=\"255\" rx=\"17\" fill=\"#0b5ea8\"/><rect x=\"28\" y=\"245\" width=\"365\" height=\"35\" fill=\"#111827\" opacity=\".94\"/><circle cx=\"205\" cy=\"262\" r=\"10\" fill=\"#2563eb\"/></g>'"""
assert old in s, 'resize desktop decorative circle marker not found'
s=s.replace(old,new,1)

old="""      '<g class=\"scene-lock\" opacity=\"0\"><rect x=\"28\" y=\"25\" width=\"365\" height=\"255\" rx=\"17\" fill=\"#082f49\"/><circle cx=\"310\" cy=\"76\" r=\"74\" fill=\"#38bdf8\" opacity=\".12\"/><g class=\"lock-details\" opacity=\"0\">"""
new="""      '<g class=\"scene-lock\" opacity=\"0\"><rect x=\"28\" y=\"25\" width=\"365\" height=\"255\" rx=\"17\" fill=\"#082f49\"/><g class=\"lock-details\" opacity=\"0\">"""
assert old in s, 'lock decorative circle marker not found'
s=s.replace(old,new,1)

# 2) Fix ALL generic 3-key rows by removing the wrapper scaling entirely.
# Full-size keys are right-aligned from their actual rowWidth; current widest rows fit 560px.
old="""var main=cfg.family==='browser'?browserMarkup():(cfg.family==='doc'?docMarkup():windowsMarkup()),keyRowWidth=window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile),keyScale=cfg.keys.length>=3?.68:1,keyX=552-keyRowWidth*keyScale;"""
new="""var main=cfg.family==='browser'?browserMarkup():(cfg.family==='doc'?docMarkup():windowsMarkup()),keyRowWidth=window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile),keyX=552-keyRowWidth;"""
assert old in s, 'scaled key-row calculation marker not found'
s=s.replace(old,new,1)

old="""'<g class=\"keys\" transform=\"translate('+keyX+' 244) scale('+keyScale+')\">'+window.tk2SceneKeycaps.markup(cfg.keys,keyProfile)+'</g>"""
new="""'<g class=\"keys\" transform=\"translate('+keyX+' 244)\">'+window.tk2SceneKeycaps.markup(cfg.keys,keyProfile)+'</g>"""
assert old in s, 'scaled key-row transform marker not found'
s=s.replace(old,new,1)

# 3) Keep Win+Up maximized window inside the desktop target area.
old="translate(win,'translate(-61 -31) scale(1.5 1.42)')"
new="translate(win,'translate(-126 -35) scale(1.51 1.25)')"
count=s.count(old)
assert count==2, f'expected 2 maximize transform markers, found {count}'
s=s.replace(old,new)

p.write_text(s,encoding='utf-8')
print('patched A5 circle, full-size 3-key rows, and bounded maximize')
