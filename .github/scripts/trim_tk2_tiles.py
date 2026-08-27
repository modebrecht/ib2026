from pathlib import Path
p=Path('tk2/index.html')
s=p.read_text(encoding='utf-8')
repls={
'14 Alltagskürzel mit animierten Dokument-, Browser- und Datei-Szenen.':'14 wichtige Alltagskürzel mit kurzen Animationen und Übungen.',
'<div class="module-tags"><span>14 Animationen</span><span>Geführt</span><span>50/50</span><span>Memory</span></div>':'<div class="module-tags"><span>14 Kürzel</span><span>Animationen</span><span>Memory</span></div>',
'10 Sonderzeichen mit Tastendruck und echter Anwendung: E-Mail, Code, Dateipfade und Temperatur.':'10 AltGr-Sonderzeichen für Alltag, E-Mail und Code.',
'Lade das Merkblatt herunter und wähle drei Kürzel, die du ab heute wirklich benutzen möchtest – jeweils mit einem kurzen „weil“.':'Merkblatt sichern und drei persönliche Tastenkürzel auswählen.',
'<div class="module-tags"><span>Merkblatt</span><span>3 Kürzel</span><span>je 1 Begründung</span></div>':'<div class="module-tags"><span>Merkblatt</span><span>3 Kürzel</span><span>Reflexion</span></div>',
'<span class="module-meta">Immer offen · persönliche Auswahl</span>':'<span class="module-meta">persönliche Auswahl</span>',
'9 neue Tastenkombinationen: kurze Animationen, Quest 8 und danach ein zweiter Durchgang.':'Programme & Browser: neue Kürzel lernen und zweimal anwenden.',
'<div class="module-tags"><span>9 Animationen</span><span>Theorie → Quest</span><span>2 Durchgänge</span></div>':'<div class="module-tags"><span>9 Animationen</span><span>Quest 8</span><span>2 Durchgänge</span></div>',
'<span class="module-meta">Immer offen · Ctrl + T, L, Tab …</span>':'<span class="module-meta">Ctrl + T, L, Tab …</span>',
'10 neue Windows-Kürzel: Theorie, Quest 9 und danach ein zweiter Durchgang.':'Windows-Kürzel für schnelleres Arbeiten im Alltag.',
'<div class="module-tags"><span>10 Animationen</span><span>Theorie → Quest</span><span>2 Durchgänge</span></div>':'<div class="module-tags"><span>10 Animationen</span><span>Quest 9</span><span>2 Durchgänge</span></div>',
'<span class="module-meta">Immer offen · Win + V, Alt + F4 …</span>':'<span class="module-meta">Win + V, Alt + F4 …</span>',
'Kein neuer Stoff: Wiederabruf aus A1, A2, A4 und A5. Q12 wiederholt alle 19 Tastenkombinationen aus A4 und A5.':'Alle bisherigen Tastenkürzel gemischt wiederholen.',
'<div class="module-tags"><span>A1 wiederholen</span><span>A2 wiederholen</span><span>A4 + A5</span><span>Alles gemischt</span><span>PDF</span></div>':'<div class="module-tags"><span>Wiederholung</span><span>Q10–Q13</span><span>Gemischt</span></div>',
'<span class="module-meta">Immer offen · Wiederholung</span>':'<span class="module-meta">A1–A5 festigen</span>',
'Challenge, Fehlerjagd und Memory. A7 sammelt abgeschlossene Trainingsrunden und deine Genauigkeit für den PDF-Nachweis.':'Challenge, Fehlerjagd und Memory zum freien Training.',
'<div class="module-tags"><span>Challenge</span><span>Fehlerjagd</span><span>Memory</span><span>Statistik</span><span>PDF</span></div>':'<div class="module-tags"><span>Challenge</span><span>Fehlerjagd</span><span>Memory</span><span>Statistik</span></div>'
}
for old,new in repls.items():
    assert old in s, old
    s=s.replace(old,new,1)
# No PDF wording in module tile section.
section=s.split('<section class="modules">',1)[1].split('</section>',1)[0]
assert 'PDF' not in section
assert 'Immer offen' not in section
p.write_text(s,encoding='utf-8')
print('TK2 tile copy trimmed')
