from pathlib import Path

for name in ('A4.html','A5.html'):
    p=Path('tk2')/name
    s=p.read_text(encoding='utf-8')
    old='<p>Bearbeite die Quest ein zweites Mal ohne eingeblendete Theorie. Danach wird deine Auswertungs-PDF freigeschaltet.</p>\n    <button type="button" class="tk-btn-primary" id="startSecondPassBtn">2. Durchgang starten → PDF freischalten</button>'
    new='<p>Bearbeite die Quest ein zweites Mal ohne eingeblendete Theorie. Nach dem Abschliessen wird deine Auswertungs-PDF freigeschaltet.</p>\n    <button type="button" class="tk-btn-primary" id="startSecondPassBtn">2. Durchgang starten</button>'
    assert old in s, f'{name}: wording anchor not found'
    s=s.replace(old,new,1)
    p.write_text(s,encoding='utf-8')

print('Clarified PDF unlock happens after completed second pass')
