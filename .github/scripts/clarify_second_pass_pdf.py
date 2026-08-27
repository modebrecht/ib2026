from pathlib import Path

for name in ('A4.html','A5.html'):
    p=Path('tk2')/name
    s=p.read_text(encoding='utf-8')
    old='''    <h2>Noch ein Durchgang ↻</h2>\n    <p>Im zweiten Durchgang wird die Theorie ausgeblendet. Die Alltagssituation bleibt sichtbar – erinnere dich an das passende Kürzel.</p>\n    <button type="button" class="tk-btn-primary" id="startSecondPassBtn">2. Durchgang starten</button>'''
    new='''    <h2>Noch ein Durchgang bis zur PDF ↻</h2>\n    <p>Bearbeite die Quest ein zweites Mal ohne eingeblendete Theorie. Danach wird deine Auswertungs-PDF freigeschaltet.</p>\n    <button type="button" class="tk-btn-primary" id="startSecondPassBtn">2. Durchgang starten → PDF freischalten</button>'''
    assert old in s, f'{name}: second-pass block not found'
    s=s.replace(old,new,1)
    p.write_text(s,encoding='utf-8')

print('Updated A4/A5 second-pass PDF guidance')
