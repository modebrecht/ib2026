from pathlib import Path

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

# Fix 1: fit 3-key shortcut rows inside the 560px scene without changing key timing.
old="var main=cfg.family==='browser'?browserMarkup():(cfg.family==='doc'?docMarkup():windowsMarkup()),keyX=Math.max(404,540-window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile));"
new="var main=cfg.family==='browser'?browserMarkup():(cfg.family==='doc'?docMarkup():windowsMarkup()),keyRowWidth=window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile),keyScale=cfg.keys.length>=3?.68:1,keyX=552-keyRowWidth*keyScale;"
assert old in s, 'key row calculation marker not found'
s=s.replace(old,new,1)

old="'<g class=\"keys\" transform=\"translate('+keyX+' 244)\">'+window.tk2SceneKeycaps.markup(cfg.keys,keyProfile)+'</g>"
new="'<g class=\"keys\" transform=\"translate('+keyX+' 244) scale('+keyScale+')\">'+window.tk2SceneKeycaps.markup(cfg.keys,keyProfile)+'</g>"
assert old in s, 'key row transform marker not found'
s=s.replace(old,new,1)

# Fix 2: replace the awkward reload arrow with a clean circular-arrow glyph.
old="'<g class=\"refresh-ring\" opacity=\"0\" transform=\"translate(210 185)\"><circle r=\"30\" fill=\"#fff\" stroke=\"#cbd5e1\"/><path d=\"M0 -15A15 15 0 1 1-12 9\" fill=\"none\" stroke=\"#2563eb\" stroke-width=\"5\" stroke-linecap=\"round\"/><path d=\"M-16 4l4 8 7-5\" fill=\"none\" stroke=\"#2563eb\" stroke-width=\"4\" stroke-linecap=\"round\"/></g></g>';"
new="'<g class=\"refresh-ring\" opacity=\"0\" transform=\"translate(210 185)\"><circle r=\"30\" fill=\"#fff\" stroke=\"#cbd5e1\"/><g class=\"refresh-icon\"><path d=\"M14 -16 A21 21 0 1 0 20 7\" fill=\"none\" stroke=\"#2563eb\" stroke-width=\"5\" stroke-linecap=\"round\"/><path d=\"M20 7 L20 -3 M20 7 L10 5\" fill=\"none\" stroke=\"#2563eb\" stroke-width=\"5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g></g></g>';"
assert old in s, 'refresh icon marker not found'
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('patched A4 key row + refresh icon')
