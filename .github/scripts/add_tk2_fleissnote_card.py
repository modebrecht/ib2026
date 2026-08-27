from pathlib import Path

p=Path('tk2/index.html')
s=p.read_text(encoding='utf-8')

css_anchor="    .modules{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:18px}"
assert css_anchor in s
css_add="""    .fleiss-card{margin-top:18px;padding:20px;border-radius:22px;background:linear-gradient(145deg,rgba(15,23,42,.96),rgba(7,16,31,.99));border:1px solid rgba(245,158,11,.22);box-shadow:0 16px 42px rgba(0,0,0,.16)}.fleiss-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.fleiss-card-badge{display:inline-flex;padding:5px 9px;border-radius:999px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);color:#fbbf24;font-size:.72rem;font-weight:900}.fleiss-card h2{font-family:'Space Grotesk',sans-serif;font-size:1.35rem;margin:0;color:#f8fafc}.fleiss-card p{margin:0;color:var(--text-muted);font-size:.92rem;line-height:1.55}.fleiss-points{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.fleiss-points span{padding:6px 9px;border-radius:9px;background:rgba(245,158,11,.055);border:1px solid rgba(245,158,11,.12);color:#fde68a;font-size:.78rem;font-weight:800}
"""
s=s.replace(css_anchor,css_anchor+'\n'+css_add,1)

anchor='''  </section>\n\n  <section class="course-done" id="courseDone">'''
assert anchor in s
card='''  </section>\n\n  <section class="fleiss-card" aria-label="Fleissnote">\n    <div class="fleiss-card-head"><div><span class="fleiss-card-badge">Fleissnote</span><h2>Deine Arbeit zählt</h2></div></div>\n    <p>Pro Aufgabe zählt die Abgabe als Basis. Der zweite Punkt richtet sich nach dem jeweiligen Zielwert.</p>\n    <div class="fleiss-points"><span>Abgabe = 1 Punkt</span><span>Zielwert = bis +1 Punkt</span><span>Maximum = 2 Punkte</span></div>\n  </section>\n\n  <section class="course-done" id="courseDone">'''
s=s.replace(anchor,card,1)

p.write_text(s,encoding='utf-8')
print('Fleissnote card added')
