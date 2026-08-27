from pathlib import Path

p = Path('tk2/tasten.html')
text = p.read_text(encoding='utf-8')

# 1) Add final CSS overrides before </style> so they win over legacy compact keycap rules.
css = r'''
/* --- Large keycaps for Lernen + Favoriten ------------------------------- */
.shortcut .keys .challenge-keyset,
.favorite-card .keys .challenge-keyset{justify-content:flex-start;gap:7px;flex-wrap:wrap}
.shortcut .keys .challenge-plus,
.favorite-card .keys .challenge-plus{font-size:1rem;margin:0 -1px;color:var(--muted)}
.shortcut .keys .challenge-key,
.favorite-card .keys .challenge-key{min-width:52px;height:52px;padding:0 13px;border-radius:11px;font-size:.92rem;box-shadow:0 5px 0 var(--key-bottom),0 8px 12px rgba(15,23,42,.12),inset 0 1px 0 rgba(255,255,255,.95)}
.shortcut .keys .challenge-key.wide,
.favorite-card .keys .challenge-key.wide{min-width:68px}
.shortcut .keys .challenge-key.extra-wide,
.favorite-card .keys .challenge-key.extra-wide{min-width:82px}
.shortcut .keys .challenge-key.arrow,
.favorite-card .keys .challenge-key.arrow{min-width:52px;font-size:1.2rem}
.shortcut .keys .challenge-key.function,
.favorite-card .keys .challenge-key.function{min-width:56px}
html[data-theme="dark"] .shortcut .keys .challenge-key,
html[data-theme="dark"] .favorite-card .keys .challenge-key{box-shadow:0 5px 0 var(--key-bottom),0 8px 13px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.10)}

/* --- Favoriten actions + destructive corner ----------------------------- */
.favorite-view-head{align-items:center}
.favorite-head-actions{display:flex;align-items:center;justify-content:flex-end;gap:9px;flex-wrap:wrap}
.favorite-head-share{display:flex;align-items:center;gap:8px}
.favorite-head-share[hidden]{display:none}
.favorite-head-share .share-btn{min-height:40px;padding:9px 13px;box-shadow:0 6px 16px rgba(15,23,42,.06)}
.favorite-head-share .favorite-qr-head{box-shadow:0 8px 18px rgba(37,99,235,.22)}
.favorite-card{position:relative;overflow:hidden;padding:18px;min-height:210px}
.favorite-card .tag{margin-right:42px}
.favorite-bomb{position:absolute;top:0;right:0;width:54px;height:48px;border:0;border-radius:0 0 0 17px;background:linear-gradient(145deg,#fb7185,#dc2626);color:#fff;display:grid;place-items:center;font-size:1.2rem;cursor:pointer;box-shadow:-5px 6px 16px rgba(220,38,38,.20);transition:filter .16s ease,transform .16s ease,box-shadow .16s ease;-webkit-tap-highlight-color:transparent}
.favorite-bomb:hover{filter:brightness(1.06);box-shadow:-7px 8px 20px rgba(220,38,38,.28)}
.favorite-bomb:active{transform:scale(.94);box-shadow:-3px 4px 10px rgba(220,38,38,.18)}
html[data-theme="dark"] .favorite-bomb{background:linear-gradient(145deg,#e11d48,#991b1b);box-shadow:-5px 6px 18px rgba(0,0,0,.28)}

@media(max-width:760px){
  .shortcut .keys .challenge-key,.favorite-card .keys .challenge-key{min-width:46px;height:46px;padding:0 10px;font-size:.84rem;border-radius:9px}
  .shortcut .keys .challenge-key.wide,.favorite-card .keys .challenge-key.wide{min-width:60px}
  .shortcut .keys .challenge-key.extra-wide,.favorite-card .keys .challenge-key.extra-wide{min-width:72px}
  .shortcut .keys .challenge-key.arrow,.favorite-card .keys .challenge-key.arrow{min-width:46px}
  .shortcut .keys .challenge-key.function,.favorite-card .keys .challenge-key.function{min-width:50px}
  .favorite-view-head{gap:12px}
  .favorite-head-actions{width:100%;justify-content:flex-start}
}
@media(max-width:390px){
  .shortcut .keys .challenge-key,.favorite-card .keys .challenge-key{min-width:42px;height:44px;padding:0 8px;font-size:.78rem}
  .shortcut .keys .challenge-key.wide,.favorite-card .keys .challenge-key.wide{min-width:56px}
  .shortcut .keys .challenge-key.extra-wide,.favorite-card .keys .challenge-key.extra-wide{min-width:66px}
  .shortcut .keys .challenge-key.arrow,.favorite-card .keys .challenge-key.arrow{min-width:42px}
}
'''
if '/* --- Large keycaps for Lernen + Favoriten' not in text:
    if '</style>' not in text:
        raise SystemExit('style close marker missing')
    text = text.replace('</style>', css + '\n</style>', 1)

# 2) Move QR/link controls into the favorites heading, remove the separate share strip.
old_html = '''          <div class="view-head"><div><span class="eyebrow">Persönliche Auswahl</span><h1>Meine Favoriten</h1><p>Deine wichtigsten Kürzel bleiben lokal in diesem Browser gespeichert.</p></div><span class="count-pill" id="favoriteCount">0 Favoriten</span></div>
          <div class="shared-banner" id="sharedFavorites" hidden>
            <div><strong id="sharedFavoriteTitle">Geteilte Favoriten</strong><p>Dieser Link ändert deine gespeicherten Favoriten erst nach deiner Bestätigung.</p></div>
            <div class="shared-actions"><button class="share-btn primary" id="sharedImport">Zu Favoriten hinzufügen</button><button class="share-btn" id="sharedDismiss">Nicht übernehmen</button></div>
          </div>
          <div class="favorite-sharebar" id="favoriteSharebar" hidden>
            <div class="favorite-share-copy"><strong>Favoriten teilen</strong><small id="favoriteShareCode">#f=</small></div>
            <div class="favorite-share-actions"><button class="share-btn" id="favoriteCopyLink">🔗 Link kopieren</button><button class="share-btn primary" id="favoriteQr">▦ QR-Code</button></div>
          </div>'''
new_html = '''          <div class="view-head favorite-view-head">
            <div><span class="eyebrow">Persönliche Auswahl</span><h1>Meine Favoriten</h1><p>Deine wichtigsten Kürzel bleiben lokal in diesem Browser gespeichert.</p></div>
            <div class="favorite-head-actions">
              <span class="count-pill" id="favoriteCount">0 Favoriten</span>
              <div class="favorite-head-share" id="favoriteSharebar" hidden>
                <button class="share-btn" id="favoriteCopyLink" title="Favoriten-Link kopieren">🔗 Link</button>
                <button class="share-btn primary favorite-qr-head" id="favoriteQr" title="Favoriten als QR-Code teilen">▦ QR-Code</button>
              </div>
            </div>
          </div>
          <div class="shared-banner" id="sharedFavorites" hidden>
            <div><strong id="sharedFavoriteTitle">Geteilte Favoriten</strong><p>Dieser Link ändert deine gespeicherten Favoriten erst nach deiner Bestätigung.</p></div>
            <div class="shared-actions"><button class="share-btn primary" id="sharedImport">Zu Favoriten hinzufügen</button><button class="share-btn" id="sharedDismiss">Nicht übernehmen</button></div>
          </div>'''
if old_html not in text:
    raise SystemExit('favorites html marker missing')
text = text.replace(old_html, new_html, 1)

# 3) Share UI no longer has a separate visible code label.
old_share = "function updateFavoriteShareUI(){const ids=favoriteShareIds(),bar=$('#favoriteSharebar');if(!bar)return;bar.hidden=!ids.length;if(ids.length)$('#favoriteShareCode').textContent=`#f=${encodeFavoriteIds(ids)}`}"
new_share = "function updateFavoriteShareUI(){const ids=favoriteShareIds(),bar=$('#favoriteSharebar');if(!bar)return;bar.hidden=!ids.length}"
if old_share not in text:
    raise SystemExit('share ui function marker missing')
text = text.replace(old_share, new_share, 1)

# 4) Replace bottom text removal action with a bomb control glued to the top-right corner.
old_render = "function renderFavorites(){const grid=$('#favoriteGrid');grid.innerHTML='';const list=shortcuts.filter(s=>state.favorites.has(s.id));list.forEach(s=>{const card=document.createElement('article');card.className='favorite-card';card.innerHTML=`<span class=\"tag\">${escapeHtml(categories[s.cat].short)}</span><h3>${escapeHtml(s.title)}</h3><div class=\"keys\">${keyMarkup(s)}</div><p>${escapeHtml(s.desc)}</p><button class=\"remove-btn\" data-remove=\"${s.id}\">Aus Favoriten entfernen</button>`;grid.appendChild(card)});$('#favoriteEmpty').style.display=list.length?'none':'block';$('#favoriteCount').textContent=`${list.length} Favorit${list.length===1?'':'en'}`}"
new_render = "function renderFavorites(){const grid=$('#favoriteGrid');grid.innerHTML='';const list=shortcuts.filter(s=>state.favorites.has(s.id));list.forEach(s=>{const card=document.createElement('article');card.className='favorite-card';card.innerHTML=`<button class=\"favorite-bomb\" data-remove=\"${s.id}\" title=\"Aus Favoriten entfernen\" aria-label=\"${escapeHtml(s.title)} aus Favoriten entfernen\">💣</button><span class=\"tag\">${escapeHtml(categories[s.cat].short)}</span><h3>${escapeHtml(s.title)}</h3><div class=\"keys\">${keyMarkup(s)}</div><p>${escapeHtml(s.desc)}</p>`;grid.appendChild(card)});$('#favoriteEmpty').style.display=list.length?'none':'block';$('#favoriteCount').textContent=`${list.length} Favorit${list.length===1?'':'en'}`}"
if old_render not in text:
    raise SystemExit('renderFavorites marker missing')
text = text.replace(old_render, new_render, 1)

# Sanity checks
for marker in [
    'favorite-qr-head',
    'favorite-bomb',
    'id="favoriteQr"',
    'shortcut .keys .challenge-key',
    'function updateFavoriteShareUI(){const ids=favoriteShareIds()'
]:
    if marker not in text:
        raise SystemExit(f'missing marker after patch: {marker}')
if 'id="favoriteShareCode"' in text:
    raise SystemExit('legacy favorite share code strip still present')

p.write_text(text, encoding='utf-8')
