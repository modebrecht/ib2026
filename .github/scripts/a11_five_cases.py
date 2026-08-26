from pathlib import Path
import re

p=Path('hw/A11.html')
s=p.read_text(encoding='utf-8')

# Header/result copy: six -> five.
repls={
    '6 Kund:innen':'5 Kund:innen',
    'Kundschaft 1 / 6':'Kundschaft 1 / 5',
    'Sechs Kund:innen erfolgreich beraten.':'Fünf Kund:innen erfolgreich beraten.',
    "const K='onedrive_a11_shop_9sek_v3';":"const K='onedrive_a11_shop_9sek_v4';",
    "PDF erst nach allen vier erfolgreichen Beratungen.":"PDF erst nach allen fünf erfolgreichen Beratungen."
}
for a,b in repls.items():
    assert a in s, f'missing: {a}'
    s=s.replace(a,b)

# Remove the home-office case so the sequence becomes:
# school -> gaming -> creator -> pen -> final CAD boss.
home_pattern=r"\n\{id:'homeoffice'.*?\},\n\n(?=\{id:'pen')"
s,n=re.subn(home_pattern,'\n',s,count=1,flags=re.S)
assert n==1, f'homeoffice removal count={n}'

# Replace the old easy CAD ending with three genuinely plausible workstation builds.
cad_pattern=r"\{id:'cad',hello:'Guten Abend!'.*?\n\];"
new_cad=r"""{id:'cad',hello:'Guten Abend!',speech:'Ich arbeite stationär mit grossen CAD-Modellen und 3D-Renderings. Meine Projekte brauchen viel RAM. Mir sind stabile professionelle Grafiktreiber, Zuverlässigkeit und spätere Erweiterbarkeit wichtiger als Gaming-Leistung oder Mobilität.',correct:'cadpro',options:[
{id:'cadfast',build:'Build A · Workstation',name:'Render Station X',price:'CHF 2’299',icon:'fa-microchip',cpu:'AMD Ryzen 9 7900',ram:'32 GB DDR5',storage:'2 TB NVMe-SSD',gpu:'GeForce RTX 4070 SUPER 12 GB',display:'kein Display · Monitor separat',weight:'12.4 kg',power:'Netzbetrieb · 750 W Netzteil',ports:'USB-C · 8× USB-A · HDMI · 3× DP · LAN',note:'Sehr schnelle CPU/GPU-Kombination und stark beim Rendering, aber nur 32 GB RAM und eine Gaming-GPU.'},
{id:'cadpro',build:'Build B · CAD-Workstation',name:'CAD Station Pro',price:'CHF 2’899',icon:'fa-drafting-compass',cpu:'Intel Core i7-14700',ram:'64 GB DDR5',storage:'2 TB NVMe-SSD',gpu:'NVIDIA RTX A2000 12 GB',display:'kein Display · Monitor separat',weight:'13.0 kg',power:'Netzbetrieb · 750 W Netzteil',ports:'USB-C · 8× USB-A · 4× DP · LAN',note:'64 GB RAM, professionelle GPU/Treiber und gute Erweiterbarkeit – auf CAD-Zuverlässigkeit ausgelegt.'},
{id:'cadmax',build:'Build C · High-End Workstation',name:'Render Titan 4080',price:'CHF 3’799',icon:'fa-server',cpu:'AMD Ryzen 9 7950X',ram:'64 GB DDR5',storage:'4 TB NVMe-SSD',gpu:'GeForce RTX 4080 SUPER 16 GB',display:'kein Display · Monitor separat',weight:'15.1 kg',power:'Netzbetrieb · 1000 W Netzteil',ports:'USB-C · 10× USB-A · HDMI · 3× DP · 2.5G LAN',note:'Extrem schnell und 64 GB RAM, aber deutlich teurer und auf maximale Gaming-/Renderleistung statt professionelle CAD-Treiber optimiert.'}],why:'Build B passt am besten zum Auftrag: 64 GB RAM, professionelle RTX-A-GPU mit auf CAD ausgerichteten Treibern und gute Erweiterbarkeit. A und C sind ebenfalls stark – deshalb musst du hier Anforderungen statt nur Leistungszahlen vergleichen.'}
];"""
s,n=re.subn(cad_pattern,new_cad,s,count=1,flags=re.S)
assert n==1, f'cad replacement count={n}'

# Make the PDF labels match the five remaining cases.
old="sections:CASES.map(c=>({heading:c.id==='school'?'Schule':c.id==='gaming'?'Gaming':c.id==='creator'?'Videoschnitt & Kreativarbeit':'PC-Upgrade',fields:"
new="sections:CASES.map(c=>({heading:({school:'Schule & Mobilität',gaming:'Gaming & Aufrüstbarkeit',creator:'Videoschnitt & Kreativarbeit',pen:'2-in-1 & Stift',cad:'Finale · CAD-Workstation'})[c.id]||c.id,fields:"
assert old in s, 'PDF heading mapping anchor missing'
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('A11 changed to five progressively harder cases')