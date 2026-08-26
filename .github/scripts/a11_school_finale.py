from pathlib import Path
import re

p=Path('hw/A11.html')
s=p.read_text(encoding='utf-8')

old_key="const K='onedrive_a11_shop_9sek_v4';"
assert old_key in s
s=s.replace(old_key,"const K='onedrive_a11_shop_9sek_v5';",1)

pattern=r"\{id:'cad',hello:'Guten Abend!'.*?\n\];"
replacement=r"""{id:'schoolfinal',hello:'Hoi!',speech:'Ich brauche für die Schule ein Notebook, das ich jeden Tag im Rucksack dabeihabe. Es muss mindestens etwa 6 Stunden durchhalten. Mir ist vor allem wichtig, möglichst wenig Gewicht zu schleppen. Für Word, Teams, Browser und Präsentationen reicht normale Leistung.',correct:'feather13',options:[
{id:'feather13',build:'Build A · leichtes Notebook',name:'FeatherBook 13',price:'CHF 999',icon:'fa-laptop',cpu:'AMD Ryzen 5 8640U',ram:'16 GB LPDDR5X',storage:'512 GB NVMe-SSD',gpu:'Radeon 760M',display:'13.3″ · 1920×1200 IPS',weight:'1.08 kg',power:'52 Wh · ca. 6.5 h',ports:'2× USB-C · USB-A · HDMI',note:'Das leichteste Gerät im Vergleich. Der Akku reicht knapp über die geforderten 6 Stunden, die Leistung genügt für Schule klar.'},
{id:'budget14',build:'Build B · Budget-Notebook',name:'ValueBook 14',price:'CHF 599',icon:'fa-laptop',cpu:'Intel Core i5-1335U',ram:'16 GB DDR5',storage:'512 GB NVMe-SSD',gpu:'Intel Iris Xe',display:'14″ · 1920×1200 IPS',weight:'1.55 kg',power:'60 Wh · ca. 10 h',ports:'USB-C · 2× USB-A · HDMI',note:'Deutlich günstiger und mit langer Akkulaufzeit – dafür jeden Tag fast ein halbes Kilo schwerer im Rucksack.'},
{id:'refurb14',build:'Build C · Refurbished Notebook',name:'ProBook 14 Refurbished',price:'CHF 699',icon:'fa-recycle',cpu:'Intel Core i7-1265U',ram:'16 GB DDR4',storage:'512 GB NVMe-SSD',gpu:'Intel Iris Xe',display:'14″ · 1920×1080 IPS',weight:'1.36 kg',power:'gebrauchter Akku · ca. 7.5 h',ports:'2× USB-C · 2× USB-A · HDMI',note:'Refurbished ist preislich und ökologisch attraktiv und der Akku reicht. Es ist aber schwerer als Build A, obwohl Gewicht hier die höchste Priorität hat.'}],why:'Build A erfüllt die Prioritäten am genauesten: Mit 1.08 kg ist es klar am leichtesten und erreicht trotzdem die geforderten mindestens etwa 6 Stunden Akku. Build B lockt mit dem tiefen Preis und Build C mit Refurbished – beide sind sinnvoll, aber beim wichtigsten Kriterium Gewicht schlechter.'}
];"""
s,n=re.subn(pattern,replacement,s,count=1,flags=re.S)
assert n==1, f'final case replacement count={n}'

old="cad:'Finale · CAD-Workstation'"
new="schoolfinal:'Finale · Schulnotebooks'"
assert old in s
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('A11 final case changed from CAD to school notebook tradeoff')
