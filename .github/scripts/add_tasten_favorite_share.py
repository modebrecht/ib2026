from pathlib import Path

p = Path('tk2/tasten.html')
text = p.read_text(encoding='utf-8')

css_marker = ".fav-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}"
share_css = r'''.favorite-sharebar{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;margin:0 0 14px;border:1px solid var(--line);border-radius:18px;background:var(--panel);box-shadow:0 8px 24px rgba(24,39,75,.045)}.favorite-sharebar[hidden]{display:none}.favorite-share-copy{min-width:0}.favorite-share-copy strong{display:block;font-size:.92rem}.favorite-share-copy small{display:block;margin-top:3px;color:var(--muted);font:750 .78rem/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.favorite-share-actions{display:flex;gap:8px;flex-wrap:wrap}.share-btn{border:1px solid var(--line);border-radius:12px;background:var(--panel2);padding:9px 12px;font-weight:850;cursor:pointer}.share-btn:hover{border-color:color-mix(in srgb,var(--blue) 45%,var(--line));color:var(--blue)}.share-btn.primary{background:var(--blue);border-color:var(--blue);color:#fff}.shared-banner{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 14px;padding:14px 16px;border:1px solid color-mix(in srgb,var(--blue) 38%,var(--line));border-radius:18px;background:color-mix(in srgb,var(--blue) 8%,var(--panel))}.shared-banner[hidden]{display:none}.shared-banner strong{display:block}.shared-banner p{margin:3px 0 0;color:var(--muted);font-size:.84rem}.shared-actions{display:flex;gap:7px;flex-wrap:wrap}.share-modal{position:fixed;inset:0;z-index:95;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.64);backdrop-filter:blur(5px)}.share-modal[hidden]{display:none}.share-dialog{position:relative;width:min(440px,100%);padding:24px;border:1px solid var(--line);border-radius:22px;background:var(--panel);box-shadow:0 28px 75px rgba(0,0,0,.3);text-align:center}.share-close{position:absolute;right:12px;top:12px;width:36px;height:36px;border:1px solid var(--line);border-radius:11px;background:var(--panel2);cursor:pointer;font-size:1.25rem}.share-dialog .eyebrow{display:block;margin-bottom:8px}.share-dialog h3{font-size:1.35rem;margin:0 36px 16px}.favorite-qr{width:244px;min-height:244px;margin:0 auto 14px;padding:12px;border-radius:18px;background:#fff;border:1px solid #e5e7eb;display:grid;place-items:center}.favorite-qr img,.favorite-qr canvas{display:block;max-width:220px!important;max-height:220px!important}.share-url{padding:10px 12px;margin:0 0 12px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);color:var(--muted);font:750 .75rem/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere;text-align:left}.share-dialog-actions{display:flex;justify-content:center;gap:8px}.share-note{margin:10px 0 0;color:var(--muted);font-size:.76rem;line-height:1.4}@media(max-width:620px){.favorite-sharebar,.shared-banner{align-items:stretch;flex-direction:column}.favorite-share-actions,.shared-actions{width:100%}.favorite-share-actions .share-btn,.shared-actions .share-btn{flex:1}.favorite-qr{width:224px;min-height:224px}.favorite-qr img,.favorite-qr canvas{max-width:200px!important;max-height:200px!important}}
'''
if css_marker not in text:
    raise SystemExit('favorite CSS marker not found')
text = text.replace(css_marker, share_css + css_marker, 1)

old_favs = '''          <div class="view-head"><div><span class="eyebrow">Persönliche Auswahl</span><h1>Meine Favoriten</h1><p>Deine wichtigsten Kürzel bleiben lokal in diesem Browser gespeichert.</p></div><span class="count-pill" id="favoriteCount">0 Favoriten</span></div>
          <div class="fav-grid" id="favoriteGrid"></div>'''
new_favs = '''          <div class="view-head"><div><span class="eyebrow">Persönliche Auswahl</span><h1>Meine Favoriten</h1><p>Deine wichtigsten Kürzel bleiben lokal in diesem Browser gespeichert.</p></div><span class="count-pill" id="favoriteCount">0 Favoriten</span></div>
          <div class="shared-banner" id="sharedFavorites" hidden>
            <div><strong id="sharedFavoriteTitle">Geteilte Favoriten</strong><p>Dieser Link ändert deine gespeicherten Favoriten erst nach deiner Bestätigung.</p></div>
            <div class="shared-actions"><button class="share-btn primary" id="sharedImport">Zu Favoriten hinzufügen</button><button class="share-btn" id="sharedDismiss">Nicht übernehmen</button></div>
          </div>
          <div class="favorite-sharebar" id="favoriteSharebar" hidden>
            <div class="favorite-share-copy"><strong>Favoriten teilen</strong><small id="favoriteShareCode">#f=</small></div>
            <div class="favorite-share-actions"><button class="share-btn" id="favoriteCopyLink">🔗 Link kopieren</button><button class="share-btn primary" id="favoriteQr">▦ QR-Code</button></div>
          </div>
          <div class="fav-grid" id="favoriteGrid"></div>'''
if old_favs not in text:
    raise SystemExit('favorites HTML marker not found')
text = text.replace(old_favs, new_favs, 1)

old_settings = '''<div class="settings" id="settings" hidden>
  <div class="setting"><strong>Darstellung</strong><div class="seg"><button data-theme="light">Hell</button><button data-theme="dark">Dunkel</button></div></div>
  <div class="setting"><strong>Schriftgrösse</strong><div class="seg"><button data-size="small">Klein</button><button data-size="normal">Normal</button><button data-size="large">Gross</button></div></div>
</div>
<div class="toast" id="toast"></div>

<script>'''
new_settings = '''<div class="settings" id="settings" hidden>
  <div class="setting"><strong>Darstellung</strong><div class="seg"><button data-theme="light">Hell</button><button data-theme="dark">Dunkel</button></div></div>
  <div class="setting"><strong>Schriftgrösse</strong><div class="seg"><button data-size="small">Klein</button><button data-size="normal">Normal</button><button data-size="large">Gross</button></div></div>
</div>
<div class="share-modal" id="favoriteShareModal" hidden role="dialog" aria-modal="true" aria-labelledby="favoriteShareTitle">
  <div class="share-dialog">
    <button class="share-close" id="shareClose" aria-label="Schliessen">×</button>
    <span class="eyebrow">Favoriten teilen</span>
    <h3 id="favoriteShareTitle">QR-Code</h3>
    <div class="favorite-qr" id="favoriteQrCanvas"></div>
    <div class="share-url" id="favoriteShareUrl"></div>
    <div class="share-dialog-actions"><button class="share-btn primary" id="shareCopyModal">🔗 Link kopieren</button></div>
    <p class="share-note">Der QR enthält nur den kurzen Favoriten-Code in der URL. Deine LocalStorage-Daten werden nicht übertragen.</p>
  </div>
</div>
<div class="toast" id="toast"></div>
<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>

<script>'''
if old_settings not in text:
    raise SystemExit('settings/script marker not found')
text = text.replace(old_settings, new_settings, 1)

store_marker = "const STORE={favorites:'ib-shortcut-favorites-v4',theme:'ib-shortcut-theme-v4',size:'ib-shortcut-size-v4',best:'ib-shortcut-best-v4'};"
share_map = """const SHARE_CODES={copy:'A',cut:'B',paste:'C','paste-plain':'D',undo:'E',redo:'F',save:'G','select-all':'H',find:'I',home:'J',end:'K',new:'L',replace:'M',print:'N',open:'O','new-tab':'P','close-tab':'Q','reopen-tab':'R','next-tab':'S','prev-tab':'T',refresh:'U',address:'V',lock:'W',desktop:'X',explorer:'Y',snip:'Z',switch:'a',task:'b',clipboard:'c','close-app':'d','snap-left':'e','snap-right':'f',maximize:'g',minimize:'h',at:'i',hash:'j',euro:'k',pipe:'l',backslash:'m','bracket-open':'n','bracket-close':'o','brace-open':'p','brace-close':'q',degree:'r'};
const SHARE_IDS=Object.fromEntries(Object.entries(SHARE_CODES).map(([id,code])=>[code,id]));
"""
if store_marker not in text:
    raise SystemExit('STORE marker not found')
text = text.replace(store_marker, share_map + store_marker, 1)

old_state = "const state={view:'home',cat:'all',query:'',favorites:new Set(read(STORE.favorites,[]).filter(id=>shortcuts.some(s=>s.id===id))),practiceOrder:[],practiceIndex:0,streak:0,best:read(STORE.best,0)};"
new_state = "const state={view:'home',cat:'all',query:'',favorites:new Set(read(STORE.favorites,[]).filter(id=>shortcuts.some(s=>s.id===id))),sharedIncoming:[],practiceOrder:[],practiceIndex:0,streak:0,best:read(STORE.best,0)};"
if old_state not in text:
    raise SystemExit('state marker not found')
text = text.replace(old_state, new_state, 1)

old_save = "function saveFavorites(){localStorage.setItem(STORE.favorites,JSON.stringify([...state.favorites]));updateFavoriteUI()}\nfunction keyText"
share_functions = r'''function saveFavorites(){localStorage.setItem(STORE.favorites,JSON.stringify([...state.favorites]));updateFavoriteUI()}
function favoriteShareIds(){return shortcuts.filter(s=>state.favorites.has(s.id)).map(s=>s.id)}
function encodeFavoriteIds(ids){return ids.map(id=>SHARE_CODES[id]).filter(Boolean).join('')}
function decodeFavoriteCode(code){const seen=new Set();return [...String(code||'')].map(c=>SHARE_IDS[c]).filter(id=>id&&!seen.has(id)&&seen.add(id))}
function favoriteShareUrl(ids=favoriteShareIds()){const u=new URL(location.href);u.search='';u.hash=`f=${encodeFavoriteIds(ids)}`;return u.toString()}
function updateFavoriteShareUI(){const ids=favoriteShareIds(),bar=$('#favoriteSharebar');if(!bar)return;bar.hidden=!ids.length;if(ids.length)$('#favoriteShareCode').textContent=`#f=${encodeFavoriteIds(ids)}`}
async function copyShareText(text){try{await navigator.clipboard.writeText(text);toast('Link kopiert ✓')}catch(_){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Link kopiert ✓')}}
function copyFavoriteShareLink(){const ids=favoriteShareIds();if(!ids.length)return;copyShareText(favoriteShareUrl(ids))}
function openFavoriteQr(){const ids=favoriteShareIds();if(!ids.length)return;const url=favoriteShareUrl(ids),host=$('#favoriteQrCanvas');$('#favoriteShareUrl').textContent=url;host.innerHTML='';if(typeof QRCode!=='function'){toast('QR-Code konnte nicht geladen werden');return}new QRCode(host,{text:url,width:220,height:220,colorDark:'#111827',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});$('#favoriteShareModal').hidden=false}
function closeFavoriteQr(){$('#favoriteShareModal').hidden=true}
function clearFavoriteShareHash(){if(location.hash.startsWith('#f='))history.replaceState(null,'',location.pathname+location.search)}
function renderSharedFavoritesBanner(){const box=$('#sharedFavorites');if(!box)return;box.hidden=!state.sharedIncoming.length;if(state.sharedIncoming.length)$('#sharedFavoriteTitle').textContent=`Geteilte Favoriten: ${state.sharedIncoming.length}`}
function readSharedFavoritesFromHash(){const m=location.hash.match(/^#f=([A-Za-z]+)$/);state.sharedIncoming=m?decodeFavoriteCode(m[1]):[];renderSharedFavoritesBanner();if(state.sharedIncoming.length)showView('favorites')}
function importSharedFavorites(){if(!state.sharedIncoming.length)return;state.sharedIncoming.forEach(id=>state.favorites.add(id));const count=state.sharedIncoming.length;state.sharedIncoming=[];clearFavoriteShareHash();saveFavorites();renderSharedFavoritesBanner();renderFavorites();toast(`${count} Favorit${count===1?'':'en'} hinzugefügt`)}
function dismissSharedFavorites(){state.sharedIncoming=[];clearFavoriteShareHash();renderSharedFavoritesBanner();toast('Geteilte Favoriten nicht übernommen')}
function keyText'''
if old_save not in text:
    raise SystemExit('saveFavorites marker not found')
text = text.replace(old_save, share_functions, 1)

old_update = "function updateFavoriteUI(){const count=state.favorites.size;fillActivityCategories();$('#favoriteCount').textContent=`${count} Favorit${count===1?'':'en'}`;$$('[data-fav]').forEach(b=>{const on=state.favorites.has(b.dataset.fav);b.classList.toggle('active',on);b.textContent=on?'★':'☆'});if(state.view==='favorites')renderFavorites()}"
new_update = "function updateFavoriteUI(){const count=state.favorites.size;fillActivityCategories();$('#favoriteCount').textContent=`${count} Favorit${count===1?'':'en'}`;$$('[data-fav]').forEach(b=>{const on=state.favorites.has(b.dataset.fav);b.classList.toggle('active',on);b.textContent=on?'★':'☆'});updateFavoriteShareUI();if(state.view==='favorites')renderFavorites()}"
if old_update not in text:
    raise SystemExit('updateFavoriteUI marker not found')
text = text.replace(old_update, new_update, 1)

listener_marker = "$('#memoryRestart').onclick=initMemory;$('#memoryCategory').onchange=initMemory;$('#memoryAgain').onclick=initMemory;$$('[data-memory-diff]').forEach(b=>b.onclick=()=>setMemoryDifficulty(b.dataset.memoryDiff));window.addEventListener('resize',()=>{if(memory.cards.length)updateMemoryDimensions()});"
listener_new = listener_marker + "\n$('#favoriteCopyLink').onclick=copyFavoriteShareLink;$('#favoriteQr').onclick=openFavoriteQr;$('#shareCopyModal').onclick=copyFavoriteShareLink;$('#shareClose').onclick=closeFavoriteQr;$('#favoriteShareModal').addEventListener('click',e=>{if(e.target.id==='favoriteShareModal')closeFavoriteQr()});$('#sharedImport').onclick=importSharedFavorites;$('#sharedDismiss').onclick=dismissSharedFavorites;"
if listener_marker not in text:
    raise SystemExit('listener marker not found')
text = text.replace(listener_marker, listener_new, 1)

init_marker = "renderHome();renderLearn();fillMemoryCategories();startChallenge();renderFavorites();updateFavoriteUI();$('#best').textContent=state.best;applyPrefs();"
init_new = init_marker + "readSharedFavoritesFromHash();"
if init_marker not in text:
    raise SystemExit('init marker not found')
text = text.replace(init_marker, init_new, 1)

checks = [
    "const SHARE_CODES={copy:'A'",
    "degree:'r'",
    "id=\"favoriteQr\"",
    "qrcodejs@1.0.0/qrcode.min.js",
    "function readSharedFavoritesFromHash()",
    "#f=${encodeFavoriteIds(ids)}",
]
for marker in checks:
    if marker not in text:
        raise SystemExit(f'missing marker: {marker}')

p.write_text(text, encoding='utf-8')
