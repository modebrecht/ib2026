from pathlib import Path
import re

p = Path('tk2/tasten.html')
text = p.read_text(encoding='utf-8')

# A9-inspired sticky header overrides. Keep the existing app internals/views,
# but remove sidebar/bottom navigation and make the top header the sole navigation.
css = r'''
/* --- A9-style top navigation ------------------------------------------------ */
.app{height:100dvh;display:block}
.rail,.mobile-nav{display:none!important}
.shell{min-width:0;height:100dvh;display:grid;grid-template-rows:auto minmax(0,1fr)}
.topbar{height:auto;min-height:68px;display:block;position:sticky;top:0;z-index:40;padding:0;border:0;border-bottom:1px solid var(--line);background:color-mix(in srgb,var(--panel) 94%,transparent);backdrop-filter:blur(14px);box-shadow:0 1px 0 rgba(15,23,42,.02)}
.a9-header-main{max-width:1260px;margin:0 auto;padding:10px 16px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:16px}
.a9-brand{min-width:0}.a9-kicker{font-size:.63rem;text-transform:uppercase;font-weight:950;letter-spacing:.16em;color:var(--muted);white-space:nowrap}.a9-brand-row{display:flex;align-items:center;gap:8px;margin-top:2px;min-width:0}.a9-brand-row a{color:var(--blue);font-size:.82rem;font-weight:850;text-decoration:none;white-space:nowrap}.a9-brand-row .dot{color:color-mix(in srgb,var(--muted) 35%,transparent)}.a9-brand-row b{font-size:.94rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.header-nav{min-width:0;display:flex;align-items:center;justify-content:center;gap:6px}.header-nav-btn{min-height:42px;border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 78%,transparent);padding:7px 11px;display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;font-weight:850;font-size:.82rem;color:var(--muted);white-space:nowrap;transition:background .18s ease,border-color .18s ease,color .18s ease,transform .18s ease,box-shadow .18s ease}.header-nav-btn:hover{color:var(--text);border-color:color-mix(in srgb,var(--blue) 30%,var(--line));background:var(--panel);transform:translateY(-1px)}.header-nav-btn.active{color:#fff;border-color:#0078d4;background:#0078d4;box-shadow:0 4px 12px rgba(0,120,212,.22)}.header-nav-ico{font-size:.95rem;line-height:1}
.top-actions{display:flex;align-items:center;gap:7px}.top-actions .icon-btn{width:40px;height:40px;border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel) 75%,transparent);cursor:pointer;display:grid;place-items:center}.top-actions .icon-btn:hover{border-color:color-mix(in srgb,var(--blue) 35%,var(--line));background:var(--panel);color:var(--blue)}
.a9-header-line{height:3px;background:linear-gradient(90deg,#0078d4,#7c3aed,#10b981);background-size:200% 100%;animation:a9HeaderFlow 4s linear infinite}@keyframes a9HeaderFlow{to{background-position:200% 0}}
.settings{top:76px}
.viewport{min-height:0;overflow:hidden;position:relative}
@media(max-width:980px){.a9-header-main{grid-template-columns:minmax(0,1fr) auto;gap:8px 12px;padding:9px 12px}.a9-brand{grid-column:1}.top-actions{grid-column:2}.header-nav{grid-column:1/-1;grid-row:2;justify-content:flex-start;overflow-x:auto;padding:1px 0 2px;scrollbar-width:none}.header-nav::-webkit-scrollbar{display:none}.header-nav-btn{flex:0 0 auto}.shell{grid-template-rows:auto minmax(0,1fr)}.settings{top:123px}}
@media(max-width:600px){.a9-kicker{font-size:.57rem}.a9-brand-row b{font-size:.84rem}.a9-brand-row a{font-size:.77rem}.header-nav{gap:5px}.header-nav-btn{min-height:38px;padding:6px 9px;font-size:.75rem;border-radius:10px}.header-nav-ico{font-size:.86rem}.top-actions .icon-btn{width:36px;height:36px;border-radius:10px}.view{padding:15px 13px 24px}.settings{top:116px;right:12px}.mobile-nav{display:none!important}}
@media(prefers-reduced-motion:reduce){.a9-header-line{animation:none!important}}
'''
if '/* --- A9-style top navigation' not in text:
    text = text.replace('</style>', css + '\n</style>', 1)

shell_pattern = re.compile(r'''<div class="app">\s*<aside class="rail">.*?</aside>\s*<div class="shell">\s*<header class="topbar">.*?</header>''', re.S)
header = '''<div class="app">
  <div class="shell">
    <header class="topbar">
      <div class="a9-header-main">
        <div class="a9-brand">
          <div class="a9-kicker">IB · Tastenkombinationen</div>
          <div class="a9-brand-row"><a href="index.html">← Kurs</a><span class="dot">•</span><b id="crumbTitle">Shortcut Lab</b></div>
        </div>
        <nav class="header-nav" aria-label="Bereiche">
          <button class="header-nav-btn active" data-view="home"><span class="header-nav-ico">⌂</span><span>Start</span></button>
          <button class="header-nav-btn" data-view="learn"><span class="header-nav-ico">⌘</span><span>Lernen</span></button>
          <button class="header-nav-btn" data-view="train"><span class="header-nav-ico">◎</span><span>Challenge</span></button>
          <button class="header-nav-btn" data-view="memory"><span class="header-nav-ico">▦</span><span>Memory</span></button>
          <button class="header-nav-btn" data-view="favorites"><span class="header-nav-ico">★</span><span>Favoriten</span></button>
        </nav>
        <div class="top-actions">
          <button class="icon-btn" id="quickSearch" title="Shortcuts durchsuchen">⌕</button>
          <button class="icon-btn" id="settingsToggle" title="Einstellungen">⚙</button>
        </div>
      </div>
      <div class="a9-header-line" aria-hidden="true"></div>
    </header>'''
text, n = shell_pattern.subn(header, text, count=1)
if n != 1:
    raise SystemExit(f'header/sidebar replacement failed: {n}')

# Remove the old mobile bottom navigation; top navigation now works at all sizes.
text, n = re.subn(r'\s*<nav class="mobile-nav" aria-label="Mobile Navigation">.*?</nav>', '', text, count=1, flags=re.S)
if n != 1:
    raise SystemExit(f'mobile nav removal failed: {n}')

# Sidebar counters no longer exist, so favorites should update only visible UI.
old = "function updateFavoriteUI(){const count=state.favorites.size;$('#railProgress').textContent=`${count} / 44`;$('#railBar').style.width=`${count/44*100}%`;$('#favoriteCount').textContent=`${count} Favorit${count===1?'':'en'}`;"
new = "function updateFavoriteUI(){const count=state.favorites.size;$('#favoriteCount').textContent=`${count} Favorit${count===1?'':'en'}`;"
if old not in text:
    raise SystemExit('favorite UI marker not found')
text = text.replace(old, new, 1)

# Sanity checks.
for bad in ['<aside class="rail">', 'id="railProgress"', 'aria-label="Mobile Navigation"']:
    if bad in text:
        raise SystemExit(f'old navigation remains: {bad}')
for good in ['class="a9-header-main"', '>Challenge</span></button>', 'id="crumbTitle"', 'data-view="memory"']:
    if good not in text:
        raise SystemExit(f'missing new header marker: {good}')

p.write_text(text, encoding='utf-8')
