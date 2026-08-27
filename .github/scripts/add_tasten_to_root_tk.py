from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old='''        <!-- Tile 1: Tastenkombinationen -->
        <div class="kachel" id="tkKachel">
          <div class="kachel-header" style="cursor: default;">
            <div class="kachel-title-wrap">
              <div class="kachel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/></svg>
              </div>
              <div>
                <h3 class="kachel-title" id="title-TK-Overview">Tastenkombinationen</h3>
              </div>
            </div>
            <a href="tk2/index.html" target="_blank" rel="noopener" class="btn-link" title="Kurs in neuem Tab öffnen" aria-label="Kurs in neuem Tab öffnen">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
            </a>
          </div>
        </div>'''
new='''        <!-- Tile 1: Tastenkombinationen -->
        <div class="kachel" id="tkKachel">
          <div class="kachel-header" onclick="toggleKachel(this)">
            <div class="kachel-title-wrap">
              <div class="kachel-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/></svg>
              </div>
              <div>
                <h3 class="kachel-title" id="title-TK-Overview">Tastenkombinationen</h3>
              </div>
            </div>
            <div class="toggle-arrow">▼</div>
          </div>
          <div class="kachel-body">
            <div class="unterkacheln">
              <div class="unterkachel">
                <div class="unterkachel-head">
                  <h4 class="unterkachel-title"><span>📘</span> Tastenkombinationen · Kurs</h4>
                  <a href="tk2/index.html" target="_blank" rel="noopener" class="btn-link" title="Kurs in neuem Tab öffnen" aria-label="Kurs in neuem Tab öffnen"></a>
                </div>
              </div>
              <div class="unterkachel">
                <div class="unterkachel-head">
                  <h4 class="unterkachel-title"><span>⌨️</span> Tastenkürzel · Lernen &amp; Trainieren</h4>
                  <a href="tk2/tasten.html" target="_blank" rel="noopener" class="btn-link" title="Tastenkürzel-Trainer in neuem Tab öffnen" aria-label="Tastenkürzel-Trainer in neuem Tab öffnen"></a>
                </div>
              </div>
            </div>
          </div>
        </div>'''
if old not in s:
    raise SystemExit('TK root marker not found')
s=s.replace(old,new,1)
for marker in ['href="tk2/index.html"','href="tk2/tasten.html"','id="tkKachel"','Tastenkürzel · Lernen &amp; Trainieren']:
    if marker not in s: raise SystemExit('missing '+marker)
p.write_text(s,encoding='utf-8')
