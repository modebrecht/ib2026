from pathlib import Path
import re

p=Path('hw/A11.html')
s=p.read_text(encoding='utf-8')

# Full-width worksheet / shop.
s=s.replace('<div class="max-w-5xl mx-auto p-3 flex items-center justify-between gap-3">','<div class="w-full max-w-none px-3 sm:px-5 lg:px-6 py-3 flex items-center justify-between gap-3">',1)
s=s.replace('<main class="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">','<main class="w-full max-w-none px-3 sm:px-5 lg:px-6 py-4 sm:py-6 space-y-5">',1)
s=s.replace('4 Kund:innen','6 Kund:innen')
s=s.replace('Kundschaft 1 / 4','Kundschaft 1 / 6')
s=s.replace('Vier Kund:innen erfolgreich beraten.','Sechs Kund:innen erfolgreich beraten.')
s=s.replace('Höre genau zu, was die Kundschaft braucht, und empfehle das passende Gerät.','Vergleiche echte Beispiel-Builds mit vollständigen technischen Daten und empfehle die passendste Konfiguration.',1)
s=s.replace("const K='onedrive_a11_shop_9sek_v2';","const K='onedrive_a11_shop_9sek_v3';",1)

# Wide, information-dense product cards. Added as overrides so the existing visual shop remains intact.
extra_css=r'''
/* A11 real-build comparison: deliberately uses the full available viewport width. */
.shop-shell{width:100%;border-radius:1.5rem}
.shop-stage{height:470px}
.shelf{width:18%;min-width:190px;max-width:285px}.shelf-a{left:2.2%}.shelf-b{left:22%}.shelf-c{right:2.2%}
.speech{right:20%;width:min(560px,42%)}
.choice-area{padding:1.2rem 1.35rem 1.35rem}.choice-title{font-size:.82rem;margin-bottom:1rem}
.choices{grid-template-columns:repeat(3,minmax(0,1fr));gap:1rem;align-items:stretch}
.device-card{min-height:330px;padding:0;display:block;overflow:hidden;border-radius:1.35rem}
.device-card-head{display:grid;grid-template-columns:58px minmax(0,1fr) auto;align-items:center;gap:.8rem;padding:1rem;border-bottom:1px solid #e2e8f0;background:linear-gradient(135deg,#f8fafc,#fff)}
.dark .device-card-head{border-color:#334155;background:linear-gradient(135deg,#0f172a,#111827)}
.device-icon{width:58px;height:58px;border-radius:1rem;font-size:1.45rem}
.device-build{font-size:.61rem;line-height:1;font-weight:950;letter-spacing:.1em;text-transform:uppercase;color:#64748b}.dark .device-build{color:#94a3b8}
.device-name{font-size:1.02rem;line-height:1.1;margin-top:.25rem}.device-price{font-size:.92rem;font-weight:950;white-space:nowrap;color:#2563eb}.dark .device-price{color:#60a5fa}
.spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:0;padding:.45rem .9rem 1rem}
.spec-item{min-width:0;padding:.58rem .45rem;border-bottom:1px solid #eef2f7}.dark .spec-item{border-color:#253247}
.spec-item:nth-last-child(-n+2){border-bottom:0}.spec-label{display:block;font-size:.56rem;font-weight:950;letter-spacing:.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:.17rem}.spec-value{display:block;font-size:.71rem;line-height:1.24;font-weight:800;color:#334155;overflow-wrap:anywhere}.dark .spec-value{color:#dbeafe}
.build-note{margin:.15rem .9rem .95rem;padding:.6rem .7rem;border-radius:.8rem;background:#f1f5f9;color:#475569;font-size:.66rem;font-weight:750;line-height:1.28}.dark .build-note{background:#1e293b;color:#cbd5e1}
.example-note{font-size:.68rem;color:#64748b;font-weight:700;margin-top:.45rem}.dark .example-note{color:#94a3b8}
@media(max-width:1180px){.choices{grid-template-columns:repeat(2,minmax(0,1fr))}.device-card{min-height:315px}.shelf-b{display:none}.speech{right:20%;width:min(500px,48%)}}
@media(max-width:760px){.shop-stage{height:410px}.choices{grid-template-columns:1fr}.device-card{min-height:0}.spec-grid{grid-template-columns:1fr 1fr}.speech{right:3%;width:61%;top:24px}.shelf{width:180px;min-width:0}.shelf-a{left:12px}.shelf-c{right:12px}.device-card-head{grid-template-columns:52px minmax(0,1fr) auto}.device-icon{width:52px;height:52px}}
@media(max-width:470px){.spec-grid{grid-template-columns:1fr}.spec-item:nth-last-child(-n+2){border-bottom:1px solid #eef2f7}.spec-item:last-child{border-bottom:0}.device-price{font-size:.78rem}.device-card-head{grid-template-columns:48px minmax(0,1fr);}.device-price{grid-column:2}.customer-zone{right:-12%;}.speech{width:68%}}
'''
assert '</style>' in s
s=s.replace('</style>', extra_css+'\n</style>',1)

cases=r'''const CASES=[
{id:'school',hello:'Hallo!',speech:'Ich brauche jeden Tag einen Computer für die Schule. Ich fahre mit Bus und Velo, schreibe Texte, mache Präsentationen und möchte möglichst wenig Gewicht schleppen. Gaming ist nicht wichtig.',correct:'campus14',options:[
{id:'campus14',build:'Build A · Notebook',name:'CampusBook 14',price:'CHF 849',icon:'fa-laptop',cpu:'AMD Ryzen 5 8640U',ram:'16 GB LPDDR5X',storage:'512 GB NVMe-SSD',gpu:'Radeon 760M',display:'14″ · 1920×1200 IPS',weight:'1.28 kg',power:'60 Wh · ca. 12 h',ports:'2× USB-C · 2× USB-A · HDMI',note:'Leicht, ausdauernd und für typische Schulaufgaben mehr als schnell genug.'},
{id:'power16',build:'Build B · Notebook',name:'PowerBook 16',price:'CHF 1’599',icon:'fa-laptop',cpu:'AMD Ryzen 7 8845HS',ram:'32 GB DDR5',storage:'1 TB NVMe-SSD',gpu:'GeForce RTX 4050 6 GB',display:'16″ · 2560×1600 · 165 Hz',weight:'2.35 kg',power:'80 Wh · ca. 6 h',ports:'USB-C · 3× USB-A · HDMI · LAN',note:'Deutlich stärker, aber schwerer, teurer und für den Schulalltag unnötig leistungsstark.'},
{id:'studybox',build:'Build C · Desktop',name:'StudyBox SFF',price:'CHF 749',icon:'fa-computer',cpu:'Intel Core i5-14500',ram:'16 GB DDR5',storage:'512 GB NVMe-SSD',gpu:'Intel UHD 770',display:'kein Display · Monitor separat',weight:'5.2 kg',power:'Netzbetrieb · 300 W Netzteil',ports:'USB-C · 6× USB-A · HDMI · DP · LAN',note:'Guter Schreibtisch-PC, aber ungeeignet zum täglichen Mitnehmen.'}],why:'Build A passt am besten: 1.28 kg, lange Akkulaufzeit und genügend Leistung. Build B wäre schneller, bringt für diesen Bedarf aber vor allem Gewicht, Preis und Stromverbrauch.'},

{id:'gaming',hello:'Hoi!',speech:'Der Rechner bleibt zuhause. Ich spiele neue Games auf einem 1440p-Monitor und möchte hohe Bildraten. Später will ich Grafikkarte oder Speicher aufrüsten können.',correct:'gametower',options:[
{id:'gametower',build:'Build A · Gaming-Tower',name:'GameTower 1440',price:'CHF 1’899',icon:'fa-gamepad',cpu:'AMD Ryzen 7 7800X3D',ram:'32 GB DDR5',storage:'2 TB NVMe-SSD',gpu:'GeForce RTX 4070 SUPER 12 GB',display:'kein Display · Monitor separat',weight:'11.8 kg',power:'Netzbetrieb · 750 W Netzteil',ports:'USB-C · 7× USB-A · HDMI · DP · LAN',note:'Starke 1440p-Gaming-Leistung und sehr gut aufrüstbar.'},
{id:'gamebook',build:'Build B · Gaming-Notebook',name:'GameBook 16',price:'CHF 1’499',icon:'fa-laptop',cpu:'AMD Ryzen 7 8845HS',ram:'16 GB DDR5',storage:'1 TB NVMe-SSD',gpu:'GeForce RTX 4060 Laptop 8 GB',display:'16″ · 2560×1600 · 165 Hz',weight:'2.45 kg',power:'90 Wh · Gaming am Netzteil',ports:'USB-C · 3× USB-A · HDMI · LAN',note:'Mobil und schnell, aber weniger aufrüstbar und bei gleicher Last schwächer als der Tower.'},
{id:'minibox',build:'Build C · Mini-PC',name:'MiniBox Office',price:'CHF 699',icon:'fa-cube',cpu:'Intel Core Ultra 5 125H',ram:'16 GB DDR5',storage:'512 GB NVMe-SSD',gpu:'Intel Arc integriert',display:'kein Display · Monitor separat',weight:'0.9 kg',power:'Netzbetrieb · 120 W',ports:'2× USB-C · 3× USB-A · HDMI · LAN',note:'Kompakt und sparsam, aber die integrierte Grafik ist nicht für anspruchsvolles 1440p-Gaming gedacht.'}],why:'Build A erfüllt das Ziel am direktesten: starke dedizierte GPU, Desktop-Leistung und gute Aufrüstbarkeit. Mobilität wurde ausdrücklich nicht verlangt.'},

{id:'creator',hello:'Guten Tag!',speech:'Ich schneide unterwegs 4K-Videos und bearbeite RAW-Fotos. Premiere, Browser und Photoshop laufen oft gleichzeitig. Ich brauche trotzdem ein Gerät, das ich mitnehmen kann.',correct:'creator16',options:[
{id:'creator16',build:'Build A · Creator-Notebook',name:'CreatorBook 16 OLED',price:'CHF 2’199',icon:'fa-wand-magic-sparkles',cpu:'Intel Core Ultra 7 155H',ram:'32 GB DDR5',storage:'1 TB NVMe-SSD',gpu:'GeForce RTX 4060 Laptop 8 GB',display:'16″ · 3200×2000 OLED',weight:'1.95 kg',power:'90 Wh · ca. 7 h Office',ports:'Thunderbolt 4 · USB-A · HDMI · SD',note:'Viel RAM, starke GPU und farbstarkes Display für mobile Medienarbeit.'},
{id:'air14',build:'Build B · Ultrabook',name:'AirBook 14',price:'CHF 1’099',icon:'fa-laptop',cpu:'Intel Core Ultra 5 125U',ram:'16 GB LPDDR5X',storage:'512 GB NVMe-SSD',gpu:'Intel Graphics integriert',display:'14″ · 2240×1400 IPS',weight:'1.18 kg',power:'65 Wh · ca. 13 h',ports:'2× USB-C · USB-A · HDMI',note:'Sehr mobil, aber RAM, GPU und Speicher sind für regelmässigen 4K-Schnitt knapper.'},
{id:'workmini',build:'Build C · Mini-PC',name:'WorkMini 32',price:'CHF 999',icon:'fa-cube',cpu:'AMD Ryzen 7 7840HS',ram:'32 GB DDR5',storage:'1 TB NVMe-SSD',gpu:'Radeon 780M integriert',display:'kein Display · Monitor separat',weight:'0.75 kg',power:'Netzbetrieb · 120 W',ports:'USB4 · 4× USB-A · HDMI · DP · LAN',note:'Viel CPU/RAM auf kleinem Raum, aber ohne eingebauten Bildschirm und ohne starke dedizierte GPU.'}],why:'Build A kombiniert Mobilität mit 32 GB RAM, schneller SSD, dedizierter GPU und einem hochwertigen Display – genau passend für mobile Medienarbeit.'},

{id:'homeoffice',hello:'Grüezi!',speech:'Ich habe bereits einen guten Monitor, Tastatur und Maus. Für Office, Browser und Videokonferenzen möchte ich einen leisen, kleinen und sparsamen Rechner auf dem Schreibtisch.',correct:'ecomini',options:[
{id:'ecomini',build:'Build A · Mini-PC',name:'EcoMini 6',price:'CHF 579',icon:'fa-cube',cpu:'AMD Ryzen 5 7640U',ram:'16 GB DDR5',storage:'512 GB NVMe-SSD',gpu:'Radeon 760M integriert',display:'kein Display · vorhandener Monitor',weight:'0.7 kg',power:'Netzbetrieb · 65 W',ports:'USB-C · 4× USB-A · HDMI · DP · LAN',note:'Klein, leise, sparsam und stark genug für Office und Videokonferenzen.'},
{id:'aio27',build:'Build B · All-in-One',name:'Vision AIO 27',price:'CHF 999',icon:'fa-desktop',cpu:'Intel Core i5-13420H',ram:'16 GB DDR5',storage:'512 GB NVMe-SSD',gpu:'Intel UHD integriert',display:'27″ · 2560×1440 IPS',weight:'7.8 kg',power:'Netzbetrieb · 135 W',ports:'USB-C · 4× USB-A · HDMI · LAN',note:'Kompletter Rechner mit Display – hier aber doppelt, weil bereits ein guter Monitor vorhanden ist.'},
{id:'towerpro',build:'Build C · Performance-Tower',name:'Tower Pro 4060',price:'CHF 1’399',icon:'fa-computer',cpu:'Intel Core i5-14600K',ram:'32 GB DDR5',storage:'1 TB NVMe-SSD',gpu:'GeForce RTX 4060 8 GB',display:'kein Display · vorhandener Monitor',weight:'10.2 kg',power:'Netzbetrieb · 650 W Netzteil',ports:'USB-C · 7× USB-A · HDMI · DP · LAN',note:'Sehr leistungsfähig, aber für Office unnötig gross, teuer und energiehungrig.'}],why:'Build A nutzt den vorhandenen Monitor, braucht kaum Platz und liefert für Office genügend Leistung ohne unnötige Gaming-Hardware.'},

{id:'pen',hello:'Hallo zusammen!',speech:'Ich möchte im Unterricht direkt auf dem Bildschirm handschriftliche Notizen und Skizzen machen. Das Gerät soll in den Rucksack passen und auch wie ein normales Notebook funktionieren.',correct:'flexpen',options:[
{id:'flexpen',build:'Build A · 2-in-1',name:'FlexPen 13',price:'CHF 1’199',icon:'fa-tablet-screen-button',cpu:'Intel Core Ultra 5 125U',ram:'16 GB LPDDR5X',storage:'512 GB NVMe-SSD',gpu:'Intel Graphics integriert',display:'13.3″ Touch · 360° · Stift',weight:'1.25 kg',power:'60 Wh · ca. 11 h',ports:'2× USB-C · USB-A · HDMI',note:'Touch, Stift und 360°-Scharnier machen handschriftliche Arbeit direkt möglich.'},
{id:'ultra14',build:'Build B · Ultrabook',name:'UltraBook 14',price:'CHF 1’299',icon:'fa-laptop',cpu:'AMD Ryzen 7 8840U',ram:'16 GB LPDDR5X',storage:'1 TB NVMe-SSD',gpu:'Radeon 780M integriert',display:'14″ · 2880×1800 · kein Touch',weight:'1.19 kg',power:'70 Wh · ca. 13 h',ports:'2× USB4 · USB-A · HDMI',note:'Sehr leicht und schnell, aber ohne Touchscreen und Stifteingabe.'},
{id:'detach12',build:'Build C · Detachable',name:'TabKey 12',price:'CHF 799',icon:'fa-tablet',cpu:'Intel Core i3-N305',ram:'8 GB LPDDR5',storage:'256 GB SSD',gpu:'Intel UHD integriert',display:'12.3″ Touch · Stift',weight:'0.95 kg inkl. Tastatur',power:'42 Wh · ca. 9 h',ports:'2× USB-C',note:'Sehr mobil und stiftfähig, aber deutlich weniger Leistungsreserve und kleinere Tastatur.'}],why:'Build A ist der beste Kompromiss: vollwertiges Notebook, Touch, Stift und 360°-Modus bei weiterhin guter Mobilität.'},

{id:'cad',hello:'Guten Abend!',speech:'Ich arbeite stationär mit grossen CAD-Modellen und 3D-Renderings. Die Projekte brauchen viel RAM, und Zuverlässigkeit sowie Erweiterbarkeit sind wichtiger als Mobilität.',correct:'cadstation',options:[
{id:'cadstation',build:'Build A · Workstation',name:'CAD Station Pro',price:'CHF 2’899',icon:'fa-microchip',cpu:'Intel Core i7-14700',ram:'64 GB DDR5',storage:'2 TB NVMe-SSD',gpu:'NVIDIA RTX A2000 12 GB',display:'kein Display · Monitor separat',weight:'13.0 kg',power:'Netzbetrieb · 750 W Netzteil',ports:'USB-C · 8× USB-A · 4× DP · LAN',note:'Viel RAM, professionelle GPU und gute Erweiterbarkeit für grosse CAD-/3D-Projekte.'},
{id:'office15',build:'Build B · Office-Notebook',name:'OfficeBook 15',price:'CHF 799',icon:'fa-laptop',cpu:'Intel Core i5-1335U',ram:'16 GB DDR5',storage:'512 GB NVMe-SSD',gpu:'Intel Iris Xe integriert',display:'15.6″ · 1920×1080 IPS',weight:'1.65 kg',power:'54 Wh · ca. 9 h',ports:'USB-C · 2× USB-A · HDMI',note:'Für Office gut, aber RAM und integrierte Grafik sind für grosse CAD-/Rendering-Projekte zu knapp.'},
{id:'aio4k',build:'Build C · All-in-One',name:'Studio AIO 27 4K',price:'CHF 1’699',icon:'fa-desktop',cpu:'Intel Core Ultra 7 155H',ram:'32 GB DDR5',storage:'1 TB NVMe-SSD',gpu:'Intel Arc integriert',display:'27″ · 3840×2160 IPS',weight:'9.4 kg',power:'Netzbetrieb · 180 W',ports:'Thunderbolt 4 · USB-A · HDMI · LAN',note:'Schönes Komplettsystem, aber weniger aufrüstbar und ohne professionelle dedizierte GPU.'}],why:'Build A ist für stationäre CAD-/3D-Arbeit klar am passendsten: 64 GB RAM, professionelle GPU und Erweiterbarkeit sind hier wichtiger als Gewicht oder Akku.'}
];'''

pattern=r"const CASES=\[.*?\n\];\nconst CUSTOMER_STYLES="
assert re.search(pattern,s,re.S), 'CASES block not found'
s=re.sub(pattern,cases+'\nconst CUSTOMER_STYLES=',s,count=1,flags=re.S)

# Render every device as a complete build card.
old="$('choices').innerHTML=c.options.map(o=>`<button type=\"button\" class=\"device-card\" data-id=\"${o.id}\" onclick=\"choose('${o.id}',this)\"><span class=\"device-icon\"><i class=\"fa-solid ${o.icon}\"></i></span><span><span class=\"device-name\">${o.name}</span><span class=\"device-spec\">${o.spec}</span></span></button>`).join('');updateProgress()}"
new="$('choices').innerHTML=c.options.map(o=>`<button type=\"button\" class=\"device-card\" data-id=\"${o.id}\" onclick=\"choose('${o.id}',this)\"><span class=\"device-card-head\"><span class=\"device-icon\"><i class=\"fa-solid ${o.icon}\"></i></span><span><span class=\"device-build\">${o.build}</span><span class=\"device-name\">${o.name}</span></span><span class=\"device-price\">${o.price}</span></span><span class=\"spec-grid\">${[['CPU',o.cpu],['RAM',o.ram],['Speicher',o.storage],['Grafik',o.gpu],['Display',o.display],['Gewicht',o.weight],['Akku / Strom',o.power],['Anschlüsse',o.ports]].map(([l,v])=>`<span class=\"spec-item\"><span class=\"spec-label\">${l}</span><span class=\"spec-value\">${v}</span></span>`).join('')}</span><span class=\"build-note\">${o.note}</span></button>`).join('');updateProgress()}"
assert old in s, 'choice renderer not found'
s=s.replace(old,new,1)

# Clarify that these are comparison configurations, not live shop listings.
s=s.replace('</h1><p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Vergleiche echte Beispiel-Builds mit vollständigen technischen Daten und empfehle die passendste Konfiguration.</p>', '</h1><p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Vergleiche echte Beispiel-Builds mit vollständigen technischen Daten und empfehle die passendste Konfiguration.</p><p class="example-note">Beispielkonfigurationen für den Unterricht · Preise und Laufzeiten dienen dem Vergleich.</p>',1)

# Sanity checks.
assert s.count("{id:'school'")==1
assert s.count("{id:'gaming'")==1
assert s.count("{id:'creator'")==1
assert s.count("{id:'homeoffice'")==1
assert s.count("{id:'pen'")==1
assert s.count("{id:'cad'")==1
assert 'max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5' not in s
assert 'CPU' in s and 'Gewicht' in s and 'Anschlüsse' in s and 'CHF 2’899' in s

p.write_text(s,encoding='utf-8')
print('A11 upgraded to six full-width real-build comparison scenarios')