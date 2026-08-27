from pathlib import Path

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

def rep(old,new,count=1):
    global s
    found=s.count(old)
    assert found>=count, f'expected at least {count} occurrence(s) of {old!r}, found {found}'
    s=s.replace(old,new,count)

# Match A1's tighter 560px composition so the keycaps sit directly beside the app mockup.
rep('viewBox=\\"0 0 680 320\\"','viewBox=\\"0 0 560 320\\"',1)
rep('<rect width=\\"680\\" height=\\"320\\" rx=\\"24\\" fill=\\"#07101f\\"/>','<rect width=\\"560\\" height=\\"320\\" rx=\\"24\\" fill=\\"#07101f\\"/>',1)
rep('transform=\\"translate(449 225)\\"','transform=\\"translate(404 225)\\"',1)
rep('transform=\\"translate(470 30)\\"','transform=\\"translate(370 30)\\"',1)

rep("keyX=Math.max(410,660-window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile))","keyX=Math.max(404,540-window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile))",1)
rep('viewBox=\\"0 0 680 320\\"','viewBox=\\"0 0 560 320\\"',1)
rep('<rect width=\\"680\\" height=\\"320\\" rx=\\"24\\" fill=\\"#07101f\\"/>','<rect width=\\"560\\" height=\\"320\\" rx=\\"24\\" fill=\\"#07101f\\"/>',1)
rep('cx=\\"620\\" cy=\\"42\\"','cx=\\"500\\" cy=\\"42\\"',1)
rep('transform=\\"translate(514 20)\\"','transform=\\"translate(392 20)\\"',1)

assert 'viewBox=\\"0 0 680 320\\"' not in s
assert 'keyX=Math.max(404,540-window.tk2SceneKeycaps.rowWidth(cfg.keys,keyProfile))' in s
assert 'transform=\\"translate(404 225)\\"' in s
assert 'transform=\\"translate(392 20)\\"' in s
p.write_text(s,encoding='utf-8')
print('Aligned A4/A5 scene geometry to A1')
