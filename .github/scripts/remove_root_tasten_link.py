from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='''              <div class="unterkachel">\n                <div class="unterkachel-head">\n                  <h4 class="unterkachel-title"><span>⌨️</span> Tastenkürzel · Lernen &amp; Trainieren</h4>\n                  <a href="tk2/tasten.html" target="_blank" rel="noopener" class="btn-link" title="Tastenkürzel-Trainer in neuem Tab öffnen" aria-label="Tastenkürzel-Trainer in neuem Tab öffnen"></a>\n                </div>\n              </div>\n'''
assert old in s, 'tasten link block not found'
s=s.replace(old,'',1)
assert 'href="tk2/tasten.html"' not in s
assert 'href="tk2/index.html"' in s
p.write_text(s,encoding='utf-8')
print('Removed root tasten trainer link')
