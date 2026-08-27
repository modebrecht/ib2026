from pathlib import Path

p=Path('tk2/A5.html')
s=p.read_text(encoding='utf-8')

# Remove A5-local clone of the green theory action box.
s=s.replace("    .theory-action{display:flex;justify-content:flex-end;margin-top:14px;padding:18px;border-radius:18px;background:rgba(16,185,129,.045);border:1px solid rgba(16,185,129,.14)}",'')

# Use the exact shared A1 theory-finish component.
old='<div class="theory-action"><button class="tk-btn-primary" id="toQ9QuestBtn">Weiter zur Quest 9 ↓</button></div>'
new='<div class="theory-finish"><p>Alle zwölf gesehen? Dann probierst du die Kürzel selbst in Quest 9 aus.</p><button class="tk-btn-primary" id="toQ9QuestBtn">Weiter zur Quest 9 ↓</button></div>'
assert old in s or 'class="theory-finish"' in s, 'A5 theory action anchor missing'
if old in s:
    s=s.replace(old,new,1)

# A5 reuses a4Scenes.js. Since that scene implementation now delegates to the
# shared A1 keycap mechanics, A5 must load the same shared helper first.
if 'sceneKeycaps.js' not in s:
    anchor='<script src="a4Scenes.js"></script>'
    assert anchor in s, 'A5 a4Scenes loader missing'
    s=s.replace(anchor,'<script src="sceneKeycaps.js"></script>\n'+anchor,1)

p.write_text(s,encoding='utf-8')
print('A5 now reuses A1 keycap mechanics and theory finish component')
