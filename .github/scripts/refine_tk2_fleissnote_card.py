from pathlib import Path
p=Path('tk2/index.html')
s=p.read_text(encoding='utf-8')
old='''  <section class="fleiss-card" aria-label="Fleissnote">\n    <div class="fleiss-card-head"><div><span class="fleiss-card-badge">Fleissnote</span><h2>Deine Arbeit zählt</h2></div></div>\n    <p>Pro Aufgabe zählt die Abgabe als Basis. Der zweite Punkt richtet sich nach dem jeweiligen Zielwert.</p>\n    <div class="fleiss-points"><span>Abgabe = 1 Punkt</span><span>Zielwert = bis +1 Punkt</span><span>Maximum = 2 Punkte</span></div>\n  </section>'''
new='''  <section class="fleiss-card" aria-label="Fleissnote">\n    <div class="fleiss-card-head"><div><span class="fleiss-card-badge">Fleissnote</span><h2>Dranbleiben lohnt sich</h2></div></div>\n    <p>Du darfst so oft üben, wie du möchtest. Für die Fleissnote zählt dein bester erreichter Stand.</p>\n    <div class="fleiss-points"><span>Abgabe = 1 Punkt</span><span>Weiterüben bis 100 % = bis +1 Punkt</span><span>Bester Stand zählt</span></div>\n  </section>'''
assert old in s, 'old Fleissnote card not found'
s=s.replace(old,new,1)
assert 'Zielwert = bis +1 Punkt' not in s
assert 'Bester Stand zählt' in s
assert 'Weiterüben bis 100 % = bis +1 Punkt' in s
p.write_text(s,encoding='utf-8')
print('Fleissnote card refined')
