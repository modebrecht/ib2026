from pathlib import Path

root = Path('.')
current = root / 'hw' / 'A13.html'
index_path = root / 'index.html'

# Preserve the current premium 14-scenario challenge as A14.
challenge = current.read_text(encoding='utf-8')
challenge = challenge.replace('<title>A13: Green IT Challenge</title>', '<title>A14: Green IT Challenge</title>')
challenge = challenge.replace('A13 · Green-IT-Challenge', 'A14 · Green-IT-Challenge')
challenge = challenge.replace("onedrive_a13_green_it_scenarios_9sek_v2", "onedrive_a14_green_it_scenarios_9sek_v1")
challenge = challenge.replace("title:'A13 · Green IT & Nachhaltigkeit'", "title:'A14 · Green-IT-Challenge'")
challenge = challenge.replace("filenamePrefix:'A13_Green_IT'", "filenamePrefix:'A14_Green_IT_Challenge'")
challenge = challenge.replace('function resetA13()', 'function resetA14()')
challenge = challenge.replace('onclick="resetA13()"', 'onclick="resetA14()"')
challenge = challenge.replace("'A13 vollständig zurücksetzen?'", "'A14 vollständig zurücksetzen?'")
(root / 'hw' / 'A14.html').write_text(challenge, encoding='utf-8')

# Rebuild A13 as the learning worksheet: lifecycle + old Auftrag 2 + old Auftrag 3
# without the Rucksack model + complete old Auftrag 5 with simplified checkbox procurement case.
a13 = r"""<!doctype html>
<html lang="de" class="h-full">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>A13: Grüne IT & Nachhaltigkeit</title>
<script src="assets/js/tailwind.min.js"></script>
<script>tailwind.config={darkMode:'class',theme:{extend:{colors:{eco:{500:'#22c55e',600:'#16a34a',700:'#15803d'},onedrive:{500:'#0078d4',600:'#106ebe'}}}}};</script>
<link rel="stylesheet" href="assets/css/fontawesome.min.css">
<link rel="stylesheet" href="assets/css/worksheet-common.css">
<style>
@import url('assets/fonts/inter.css');
*{box-sizing:border-box}body{font-family:'Segoe UI','Inter',system-ui,sans-serif}.surface{background:rgba(255,255,255,.93);border:1px solid rgba(226,232,240,.92);box-shadow:0 16px 42px rgba(15,23,42,.065);backdrop-filter:blur(14px)}.dark .surface{background:rgba(15,23,42,.91);border-color:#334155;box-shadow:0 18px 46px rgba(0,0,0,.23)}
.progress-glow{background:linear-gradient(90deg,#16a34a,#0ea5e9,#7c3aed);background-size:200% 100%;animation:flow 3.5s linear infinite}@keyframes flow{to{background-position:200% 0}}
.phase{min-height:112px}.task-badge{display:inline-flex;align-items:center;gap:.4rem;border-radius:999px;padding:.35rem .7rem;font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.check-row{display:flex;gap:.7rem;align-items:flex-start;padding:.8rem .9rem;border:1px solid #e2e8f0;border-radius:1rem;background:#fff;transition:.18s}.dark .check-row{background:#0f172a;border-color:#334155}.check-row.good{border-color:#34d399;background:#ecfdf5}.dark .check-row.good{background:rgba(6,78,59,.25)}.check-row.bad{border-color:#fb7185;background:#fff1f2}.dark .check-row.bad{background:rgba(76,5,25,.22)}
.feedback{min-height:44px}.status-dot{width:.65rem;height:.65rem;border-radius:999px;background:#cbd5e1}.status-dot.done{background:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.12)}
input[type=range]{accent-color:#16a34a}.metric{background:linear-gradient(145deg,#052e16,#172554);color:#fff}.reveal{animation:pop .25s cubic-bezier(.2,.9,.2,1)}@keyframes pop{from{opacity:0;transform:translateY(4px) scale(.985)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important}}
</style>
</head>
<body class="min-h-full overflow-x-hidden bg-gradient-to-br from-slate-100 via-emerald-50/45 to-sky-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-slate-800 dark:text-slate-100">
<header class="sticky top-0 z-40 worksheet-header"><div class="max-w-5xl mx-auto p-3 flex items-center justify-between gap-3"><div class="min-w-0"><div class="text-[10px] uppercase font-black tracking-[.16em] text-slate-400">A13 · Grüne IT & Nachhaltigkeit</div><div class="flex items-center gap-2 mt-.5"><div id="pct" class="font-black text-eco-600 dark:text-emerald-400">0% bearbeitet</div><span class="hidden sm:inline text-slate-300 dark:text-slate-700">•</span><div class="hidden sm:block text-xs font-bold text-slate-400">3 Aufträge</div></div></div><div class="flex gap-2 shrink-0"><button class="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900" onclick="toggleDarkMode()" title="Dunkelmodus"><i id="themeIcon" class="fa-solid fa-moon"></i></button><button id="pdf" class="w-10 h-10 rounded-xl bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600" onclick="makePdf()" title="PDF nach Abschluss"><i class="fa-solid fa-lock"></i></button><button class="w-10 h-10 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white/70 dark:bg-slate-900 text-rose-600" onclick="resetA13()" title="Zurücksetzen"><i class="fa-solid fa-rotate-right"></i></button></div></div><div class="h-1 bg-slate-200 dark:bg-slate-800"><div id="bar" class="h-1 progress-glow" style="width:0"></div></div></header>

<main class="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
<section class="surface rounded-[1.6rem] p-5 sm:p-6"><div class="flex items-center gap-4"><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 text-white flex items-center justify-center text-2xl shadow-lg shrink-0"><i class="fa-solid fa-leaf"></i></div><div><div class="text-[10px] uppercase font-black tracking-[.18em] text-emerald-600 dark:text-emerald-400">Green IT</div><h1 class="text-2xl sm:text-3xl font-black tracking-tight mt-1">Technik nachhaltig nutzen und beschaffen</h1><p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Erkunde Rohstoffe, Energieverbrauch und Urban Mining. Danach folgt in A14 die Anwendung in 14 Alltagsszenarien.</p></div></div><div class="hidden"><input id="studentName" readonly><input id="studentClass" readonly value="B24"><input id="studentDate" readonly></div></section>

<section class="surface rounded-[1.6rem] p-5 sm:p-6">
<div class="flex items-start gap-3 mb-4"><div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white flex items-center justify-center shrink-0"><i class="fa-solid fa-arrows-spin"></i></div><div><div class="text-[10px] uppercase font-black tracking-[.18em] text-emerald-600 dark:text-emerald-400">Lebenszyklus</div><h2 class="text-lg sm:text-xl font-black mt-1">Von Rohstoffen bis Urban Mining</h2><p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Green IT betrachtet den ganzen Weg eines Geräts – nicht nur den Stromverbrauch während der Nutzung.</p></div></div>
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
<div class="phase rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 p-3 text-center"><i class="fa-solid fa-mountain text-amber-600 text-xl"></i><div class="text-xs font-black mt-2">1 · Rohstoffe</div><div class="text-[10px] text-slate-500 mt-1">Kobalt, Lithium, Gold</div></div>
<div class="phase rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-900/60 p-3 text-center"><i class="fa-solid fa-industry text-violet-600 text-xl"></i><div class="text-xs font-black mt-2">2 · Herstellung</div><div class="text-[10px] text-slate-500 mt-1">Energie & Wasser</div></div>
<div class="phase rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 p-3 text-center"><i class="fa-solid fa-ship text-blue-600 text-xl"></i><div class="text-xs font-black mt-2">3 · Transport</div><div class="text-[10px] text-slate-500 mt-1">Handel & Lieferwege</div></div>
<div class="phase rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/60 p-3 text-center"><i class="fa-solid fa-laptop text-sky-600 text-xl"></i><div class="text-xs font-black mt-2">4 · Nutzung</div><div class="text-[10px] text-slate-500 mt-1">Strom, Cloud & KI</div></div>
<div class="phase rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 p-3 text-center"><i class="fa-solid fa-screwdriver-wrench text-emerald-600 text-xl"></i><div class="text-xs font-black mt-2">5 · Länger nutzen</div><div class="text-[10px] text-slate-500 mt-1">Reparatur & Refurbished</div></div>
<div class="phase rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 p-3 text-center"><i class="fa-solid fa-recycle text-teal-600 text-xl"></i><div class="text-xs font-black mt-2">6 · Recycling</div><div class="text-[10px] text-slate-500 mt-1">Urban Mining</div></div>
</div></section>

<section id="task2" class="surface rounded-[1.7rem] p-5 sm:p-7 space-y-5">
<div class="flex items-center justify-between gap-3"><div><span class="task-badge bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"><i class="fa-solid fa-cubes-stacked"></i> Auftrag 2</span><h2 class="text-xl sm:text-2xl font-black mt-2">Kritische Rohstoffe & globale Verantwortung</h2><p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Ordne Kobalt, Lithium und Gold ihren typischen Herausforderungen zu.</p></div><span id="dot2" class="status-dot"></span></div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
<label class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-800/40"><span class="font-black text-sm"><i class="fa-solid fa-battery-full text-emerald-500 mr-1"></i>Kobalt</span><span class="text-[11px] text-slate-500 block mt-1">Akkus</span><select id="cobalt" class="w-full mt-3 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"><option value="">Bitte wählen</option><option value="correct">Kongo: schwierige Arbeits- und Schutzbedingungen im Bergbau</option><option value="x">Atacama: hoher Wasserverbrauch durch Verdunstung</option><option value="y">Goldgewinnung mit Quecksilber/Zyanid</option></select></label>
<label class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-800/40"><span class="font-black text-sm"><i class="fa-solid fa-bolt text-amber-500 mr-1"></i>Lithium</span><span class="text-[11px] text-slate-500 block mt-1">Energiespeicher</span><select id="lithium" class="w-full mt-3 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"><option value="">Bitte wählen</option><option value="x">Kongo: schwierige Bergbaubedingungen</option><option value="correct">Atacama: hoher Wasserbedarf in trockenen Regionen</option><option value="y">Goldgewinnung mit Quecksilber/Zyanid</option></select></label>
<label class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-800/40"><span class="font-black text-sm"><i class="fa-solid fa-microchip text-sky-500 mr-1"></i>Gold</span><span class="text-[11px] text-slate-500 block mt-1">Leiterplatten & Kontakte</span><select id="gold" class="w-full mt-3 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"><option value="">Bitte wählen</option><option value="x">Atacama: hoher Wasserbedarf</option><option value="correct">Erzgewinnung kann problematische Chemikalien einsetzen</option><option value="y">Nur Transport per Flugzeug ist problematisch</option></select></label>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><label class="text-sm font-bold">Wer trägt Verantwortung für nachhaltige Lieferketten? Begründe kurz.<textarea id="responsibility" rows="3" class="w-full mt-2 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-normal" placeholder="Hersteller, Gesetzgeber, Konsument:innen ..."></textarea></label><label class="text-sm font-bold">Schätze: Warum kann Urban Mining bei Gold interessant sein?<textarea id="goldEstimate" rows="3" class="w-full mt-2 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-normal" placeholder="Vergleiche alte Smartphones mit Golderz ..."></textarea></label></div>
<div class="flex flex-wrap items-center gap-3"><button class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black" onclick="checkTask2()"><i class="fa-solid fa-check-double mr-1"></i> Überprüfen</button><div id="feedback2" class="feedback text-sm font-bold flex items-center"></div></div>
</section>

<section id="task3" class="surface rounded-[1.7rem] p-5 sm:p-7 space-y-5">
<div class="flex items-center justify-between gap-3"><div><span class="task-badge bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300"><i class="fa-solid fa-calculator"></i> Auftrag 3</span><h2 class="text-xl sm:text-2xl font-black mt-2">Interaktiver IT-Energie-Rechner</h2><p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Verändere die Regler und beobachte, wie sich die geschätzte Jahresbilanz verändert. Kein Rucksackmodell.</p></div><span id="dot3" class="status-dot"></span></div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
<div class="space-y-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5"><div><div class="flex justify-between text-sm font-black"><label for="mobileHours">Smartphone pro Tag</label><span id="mobileVal" class="text-emerald-600">3 Std.</span></div><input id="mobileHours" type="range" min="0" max="12" value="3" class="w-full mt-2"></div><div><div class="flex justify-between text-sm font-black"><label for="pcHours">PC / Konsole pro Tag</label><span id="pcVal" class="text-emerald-600">2 Std.</span></div><input id="pcHours" type="range" min="0" max="14" value="2" class="w-full mt-2"></div><p class="text-xs text-slate-500 dark:text-slate-400">Die Werte sind eine vereinfachte Schätzung für den Unterricht. Geräte, Strommix und Nutzung unterscheiden sich stark.</p></div>
<div class="metric rounded-2xl p-5 sm:p-6 flex flex-col justify-center text-center"><div class="text-[10px] uppercase tracking-[.16em] font-black text-slate-400">geschätzte Jahresbilanz</div><div class="grid grid-cols-2 gap-3 mt-4"><div><div id="kwh" class="text-4xl font-black text-emerald-400">0</div><div class="text-xs text-slate-400 mt-1">kWh / Jahr</div></div><div><div id="co2" class="text-4xl font-black text-sky-400">0</div><div class="text-xs text-slate-400 mt-1">kg CO₂e / Jahr*</div></div></div><div id="energyHint" class="text-xs text-slate-300 mt-5"></div></div>
</div>
<div id="feedback3" class="feedback text-sm font-bold text-emerald-700 dark:text-emerald-300"></div>
</section>

<section id="task5" class="surface rounded-[1.7rem] p-5 sm:p-7 space-y-6">
<div class="flex items-center justify-between gap-3"><div><span class="task-badge bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"><i class="fa-solid fa-building-columns"></i> Auftrag 5</span><h2 class="text-xl sm:text-2xl font-black mt-2">Urban Mining & grüne IT-Kaufberatung</h2><p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Altgeräte zurückgewinnen, nachhaltig beschaffen und Recycling verstehen.</p></div><span id="dot5" class="status-dot"></span></div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 p-5"><h3 class="font-black"><i class="fa-solid fa-box-open text-emerald-600 mr-2"></i>Altgeräte zuhause</h3><p class="text-sm text-slate-600 dark:text-slate-400 mt-2">Wie viele alte Handys, Tablets oder Laptops liegen bei euch ungenutzt herum?</p><div class="flex items-center gap-3 mt-4"><input id="oldDevices" type="number" min="0" max="99" class="w-24 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-center text-xl font-black" placeholder="0"><span class="text-sm text-slate-500">Altgeräte</span></div></div><div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 bg-slate-50/70 dark:bg-slate-800/40"><h3 class="font-black"><i class="fa-solid fa-lightbulb text-amber-500 mr-2"></i>Warum Urban Mining?</h3><p class="text-sm text-slate-600 dark:text-slate-400 mt-2">In Altgeräten stecken bereits konzentrierte Wertstoffe wie Kupfer, Gold und Silber. Korrekte Rückgabe ermöglicht ihre Rückgewinnung und reduziert den Bedarf an neuen Rohstoffen.</p></div></div>

<div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5"><h3 class="font-black text-lg">Fallbeispiel: Eine Schule kauft 30 Laptops</h3><p class="text-sm text-slate-500 mt-1">Welche Kriterien sprechen für eine nachhaltige Beschaffung? Wähle alle passenden Aussagen.</p><div id="procureRows" class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4"></div><div class="flex flex-wrap items-center gap-3 mt-4"><button class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black" onclick="checkProcurement()"><i class="fa-solid fa-check-double mr-1"></i> Überprüfen</button><div id="procureFeedback" class="feedback text-sm font-bold flex items-center"></div></div></div>

<div class="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5"><h3 class="font-black text-lg">Was passiert beim Recycling?</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
<div class="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4"><div class="font-black text-sm">1 · Kupfer, Gold & Silber?</div><label class="block mt-3 text-sm"><input type="radio" name="rq1" value="1" class="mr-2">werden fachgerecht zurückgewonnen</label><label class="block mt-2 text-sm"><input type="radio" name="rq1" value="0" class="mr-2">gehen komplett verloren</label></div>
<div class="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4"><div class="font-black text-sm">2 · Alle Kunststoffe/Klebstoffe?</div><label class="block mt-3 text-sm"><input type="radio" name="rq2" value="0" class="mr-2">können zu 100% recycelt werden</label><label class="block mt-2 text-sm"><input type="radio" name="rq2" value="1" class="mr-2">nein, viele nicht vollständig</label></div>
<div class="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4"><div class="font-black text-sm">3 · Gold: Handys vs. Golderz?</div><label class="block mt-3 text-sm"><input type="radio" name="rq3" value="0" class="mr-2">etwa gleich konzentriert</label><label class="block mt-2 text-sm"><input type="radio" name="rq3" value="1" class="mr-2">Elektroschrott kann deutlich goldreicher sein</label></div>
</div><div class="flex flex-wrap items-center gap-3 mt-4"><button class="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black" onclick="checkRecycle()"><i class="fa-solid fa-check-double mr-1"></i> Überprüfen</button><div id="recycleFeedback" class="feedback text-sm font-bold flex items-center"></div></div></div>
</section>

<section class="surface rounded-[1.6rem] p-5 sm:p-6 text-center"><div class="text-sm font-black">Danach: <a href="A14.html" class="text-emerald-600 dark:text-emerald-400 underline">A14 · Green-IT-Challenge</a></div><p class="text-xs text-slate-500 mt-1">14 Szenarien zum Anwenden und Wiederholen.</p></section>
</main>
<script src="assets/js/worksheet-common.js"></script><script src="assets/js/pdf-engine.js"></script>
<script>
const K='onedrive_a13_green_it_learning_v1';let state={task2:false,task3:false,procure:false,recycle:false};
const procure=[
{id:'repair',text:'Geräte sind reparierbar; Akku/SSD lassen sich ersetzen.',good:true},
{id:'fit',text:'Leistung passt zum tatsächlichen Einsatz.',good:true},
{id:'support',text:'Lange Software- und Sicherheitsupdates sind zugesichert.',good:true},
{id:'refurb',text:'Refurbished-Geräte werden als Option geprüft.',good:true},
{id:'seal',text:'Glaubwürdige Nachhaltigkeitssiegel/-kriterien werden beachtet.',good:true},
{id:'gaming',text:'Möglichst starke Gaming-Laptops kaufen, egal wofür sie gebraucht werden.',good:false},
{id:'cheap',text:'Immer das billigste Modell nehmen, auch bei kurzer Lebensdauer.',good:false},
{id:'replace',text:'Geräte vorsorglich nach zwei Jahren ersetzen.',good:false}
];
const $=id=>document.getElementById(id);function save(){localStorage.setItem(K,JSON.stringify({state,vals:{cobalt:$('cobalt').value,lithium:$('lithium').value,gold:$('gold').value,responsibility:$('responsibility').value,goldEstimate:$('goldEstimate').value,mobileHours:$('mobileHours').value,pcHours:$('pcHours').value,oldDevices:$('oldDevices').value,procure:[...document.querySelectorAll('[data-procure]')].filter(x=>x.checked).map(x=>x.dataset.procure),rq1:document.querySelector('input[name=rq1]:checked')?.value||'',rq2:document.querySelector('input[name=rq2]:checked')?.value||'',rq3:document.querySelector('input[name=rq3]:checked')?.value||''}}))}
function load(){try{const d=JSON.parse(localStorage.getItem(K)||'{}');if(d.state)state=d.state;const v=d.vals||{};['cobalt','lithium','gold','responsibility','goldEstimate','mobileHours','pcHours','oldDevices'].forEach(id=>{if(v[id]!==undefined&&$(id))$(id).value=v[id]});setTimeout(()=>{(v.procure||[]).forEach(id=>{const x=document.querySelector(`[data-procure="${id}"]`);if(x)x.checked=true});['rq1','rq2','rq3'].forEach(n=>{if(v[n]!==''){const x=document.querySelector(`input[name="${n}"][value="${v[n]}"]`);if(x)x.checked=true}})},0)}catch(e){}}
function renderProcure(){ $('procureRows').innerHTML=procure.map(x=>`<label class="check-row" data-row="${x.id}"><input type="checkbox" data-procure="${x.id}" class="mt-1 accent-emerald-600"><span class="text-sm font-semibold">${x.text}</span></label>`).join('');document.querySelectorAll('[data-procure]').forEach(x=>x.addEventListener('change',save)) }
function checkTask2(){const selectOK=['cobalt','lithium','gold'].every(id=>$(id).value==='correct');const textOK=$('responsibility').value.trim().length>=12&&$('goldEstimate').value.trim().length>=8;state.task2=selectOK&&textOK;$('feedback2').innerHTML=state.task2?'<span class="text-emerald-700 dark:text-emerald-300 reveal">✓ Rohstoffe korrekt zugeordnet und begründet.</span>':'<span class="text-amber-700 dark:text-amber-300 reveal">Prüfe die drei Zuordnungen und ergänze beide kurzen Antworten.</span>';save();updateProgress()}
function calc(){const m=+$('mobileHours').value,p=+$('pcHours').value;$('mobileVal').textContent=m+' Std.';$('pcVal').textContent=p+' Std.';const kwh=Math.round((m*0.008+p*0.12)*365);const co2=(kwh*0.12).toFixed(1);$('kwh').textContent=kwh;$('co2').textContent=co2;$('energyHint').textContent=p>6?'Lange PC-/Konsolennutzung dominiert hier die Schätzung.':'Vergleiche verschiedene Nutzungszeiten und beobachte den Unterschied.';state.task3=true;$('feedback3').textContent='✓ Rechner ausprobiert.';save();updateProgress()}
function checkProcurement(){let ok=true;procure.forEach(x=>{const cb=document.querySelector(`[data-procure="${x.id}"]`),row=document.querySelector(`[data-row="${x.id}"]`);row.classList.remove('good','bad');const correct=cb.checked===x.good;if(!correct)ok=false;row.classList.add(correct?'good':'bad')});state.procure=ok;$('procureFeedback').innerHTML=ok?'<span class="text-emerald-700 dark:text-emerald-300 reveal">✓ Alle nachhaltigen Kriterien erkannt.</span>':'<span class="text-rose-700 dark:text-rose-300 reveal">Noch nicht: grün = passend, rot = Auswahl überprüfen.</span>';save();updateProgress()}
function checkRecycle(){const vals=['rq1','rq2','rq3'].map(n=>document.querySelector(`input[name="${n}"]:checked`)?.value);state.recycle=vals.every(v=>v==='1');$('recycleFeedback').innerHTML=state.recycle?'<span class="text-emerald-700 dark:text-emerald-300 reveal">✓ Recycling-Quiz korrekt.</span>':'<span class="text-amber-700 dark:text-amber-300 reveal">Noch nicht ganz – überprüfe die drei Aussagen.</span>';save();updateProgress()}
function updateProgress(){const t5=state.procure&&state.recycle&&$('oldDevices').value!=='';const done=[state.task2,state.task3,t5];const n=done.filter(Boolean).length,p=Math.round(n/3*100);$('pct').textContent=p+'% bearbeitet';$('bar').style.width=p+'%';$('dot2').classList.toggle('done',state.task2);$('dot3').classList.toggle('done',state.task3);$('dot5').classList.toggle('done',t5);const b=$('pdf'),unlocked=n===3;b.className=unlocked?'w-10 h-10 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20':'w-10 h-10 rounded-xl bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600';b.innerHTML=unlocked?'<i class="fa-solid fa-file-pdf"></i>':'<i class="fa-solid fa-lock"></i>';b.dataset.unlocked=unlocked?'1':'0';save()}
function makePdf(){if($('pdf').dataset.unlocked!=='1')return alert('Bearbeite zuerst Auftrag 2, 3 und 5 vollständig.');downloadTextWorksheetPDF({title:'A13 · Grüne IT & Nachhaltigkeit',filenamePrefix:'A13_Gruene_IT',sections:[{heading:'Auftrag 2 · Kritische Rohstoffe',fields:[{label:'Verantwortung',value:$('responsibility').value},{label:'Urban Mining / Gold',value:$('goldEstimate').value}]},{heading:'Auftrag 3 · IT-Energie-Rechner',fields:[{label:'Smartphone',value:$('mobileHours').value+' Std./Tag'},{label:'PC / Konsole',value:$('pcHours').value+' Std./Tag'},{label:'Schätzung',value:$('kwh').textContent+' kWh/Jahr · '+$('co2').textContent+' kg CO₂e/Jahr'}]},{heading:'Auftrag 5 · Urban Mining & Beschaffung',fields:[{label:'Altgeräte zuhause',value:$('oldDevices').value},{label:'Beschaffungscheck',value:'korrekt abgeschlossen'},{label:'Recycling-Quiz',value:'korrekt abgeschlossen'}]}]})}
function resetA13(){if(!confirm('A13 vollständig zurücksetzen?'))return;localStorage.removeItem(K);location.reload()}
renderProcure();load();calc();state.task3=JSON.parse(localStorage.getItem(K)||'{}').state?.task3||false;if(!state.task3)$('feedback3').textContent='Bewege einen Regler, um den Rechner auszuprobieren.';['mobileHours','pcHours'].forEach(id=>$(id).addEventListener('input',calc));['cobalt','lithium','gold','responsibility','goldEstimate','oldDevices'].forEach(id=>$(id).addEventListener('input',()=>{save();updateProgress()}));document.querySelectorAll('input[type=radio]').forEach(x=>x.addEventListener('change',save));updateProgress();if(typeof applyDefaultClassAndDate==='function')applyDefaultClassAndDate();
</script>
</body></html>"""
current.write_text(a13, encoding='utf-8')

# Add A14 to the hardware list directly after A13.
idx = index_path.read_text(encoding='utf-8')
if 'id="title-A14"' not in idx:
    marker = '''    <!-- Unterkachel: A13 Grüne IT -->
    <div class="unterkachel task-card">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <div>
          <h4 class="unterkachel-title" id="title-A13" style="margin-bottom: 2px;">
             <span class="task-number">A13</span><span class="task-name">Grüne IT &amp; Nachhaltigkeit</span>
          </h4>
        </div>
        <a href="hw/A13.html" target="_blank" rel="noopener" class="btn-link" title="In neuem Tab öffnen" aria-label="In neuem Tab öffnen"></a>
      </div>
    </div>'''
    addition = marker + '''

    <!-- Unterkachel: A14 Green-IT-Challenge -->
    <div class="unterkachel task-card">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <div>
          <h4 class="unterkachel-title" id="title-A14" style="margin-bottom: 2px;">
             <span class="task-number">A14</span><span class="task-name">Green-IT-Challenge</span>
          </h4>
        </div>
        <a href="hw/A14.html" target="_blank" rel="noopener" class="btn-link" title="In neuem Tab öffnen" aria-label="In neuem Tab öffnen"></a>
      </div>
    </div>'''
    if marker not in idx:
        raise SystemExit('A13 index card marker not found')
    idx = idx.replace(marker, addition, 1)
    index_path.write_text(idx, encoding='utf-8')

print('Split complete: A13 learning worksheet + A14 14-scenario challenge + index card')
