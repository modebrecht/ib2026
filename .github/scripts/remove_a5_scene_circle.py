from pathlib import Path
p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')
old='<circle cx="312" cy="87" r="92" fill="#60a5fa" opacity=".35"/>'
assert old in s, 'A5 decorative circle not found'
s=s.replace(old,'',1)
assert old not in s
p.write_text(s,encoding='utf-8')
print('Removed A5 Windows decorative circle')
