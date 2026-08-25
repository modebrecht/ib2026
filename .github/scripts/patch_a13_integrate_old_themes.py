from pathlib import Path

path = Path('hw/A13.html')
text = path.read_text(encoding='utf-8')

text = text.replace('10 Szenarien', '14 Szenarien')
text = text.replace('Entscheide bei 10 Alltagssituationen.', 'Entscheide bei 14 Alltagssituationen.')
text = text.replace('1 / 10', '1 / 14')
text = text.replace("const K='onedrive_a13_green_it_scenarios_9sek_v1',PASS=7,OK_MS=2300,WRONG_MS=3400;", "const K='onedrive_a13_green_it_scenarios_9sek_v2',PASS=10,OK_MS=2300,WRONG_MS=3400;")

lifecycle = '''
<section class="surface rounded-[1.6rem] p-5 sm:p-6">
  <div class="flex items-start gap-3 mb-4">
    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white flex items-center justify-center shrink-0"><i class="fa-solid fa-arrows-spin"></i></div>
    <div>
      <div class="text-[10px] uppercase font-black tracking-[.18em] text-emerald-600 dark:text-emerald-400">Der ganze Lebenszyklus zählt</div>
      <h2 class="text-lg sm:text-xl font-black mt-1">Von Rohstoffen bis Urban Mining</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Green IT betrachtet nicht nur den Stromverbrauch. Auch Rohstoffabbau, Herstellung, Nutzungsdauer, Reparatur, Wiederverwendung und Recycling gehören dazu.</p>
    </div>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
    <div class="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-3 text-center"><i class="fa-solid fa-mountain text-amber-600 text-lg"></i><div class="text-xs font-black mt-1">1 · Rohstoffe</div><div class="text-[10px] text-slate-500 mt-1">Metalle & kritische Rohstoffe</div></div>
    <div class="rounded-xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/70 dark:bg-violet-950/20 p-3 text-center"><i class="fa-solid fa-industry text-violet-600 text-lg"></i><div class="text-xs font-black mt-1">2 · Herstellung</div><div class="text-[10px] text-slate-500 mt-1">Energie, Wasser, CO₂-Rucksack</div></div>
    <div class="rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/20 p-3 text-center"><i class="fa-solid fa-laptop text-sky-600 text-lg"></i><div class="text-xs font-black mt-1">3 · Nutzung</div><div class="text-[10px] text-slate-500 mt-1">Strom, Cloud & KI</div></div>
    <div class="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 p-3 text-center"><i class="fa-solid fa-screwdriver-wrench text-emerald-600 text-lg"></i><div class="text-xs font-black mt-1">4 · Weiter nutzen</div><div class="text-[10px] text-slate-500 mt-1">Reparieren, aufrüsten, refurbished</div></div>
    <div class="rounded-xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/70 dark:bg-teal-950/20 p-3 text-center col-span-2 sm:col-span-1"><i class="fa-solid fa-recycle text-teal-600 text-lg"></i><div class="text-xs font-black mt-1">5 · Recycling</div><div class="text-[10px] text-slate-500 mt-1">Urban Mining & Rückgewinnung</div></div>
  </div>
</section>
'''

if 'Von Rohstoffen bis Urban Mining' not in text:
    marker = '<section id="quest"'
    if marker not in text:
        raise SystemExit('quest marker missing')
    text = text.replace(marker, lifecycle + marker, 1)

new_scenes = r'''
{id:'lifecycle',artId:'updates',title:'Nur der Stromverbrauch zählt?',text:'Du willst beurteilen, wie nachhaltig ein Smartphone ist. Jemand schaut nur darauf, wie viel Strom es beim Laden braucht.',correct:'whole',why:'Zur Umweltwirkung gehört der ganze Lebenszyklus: Rohstoffe, Herstellung, Nutzung, Reparatur/Wiederverwendung und Recycling.',options:[{id:'charge',icon:'fa-plug-circle-bolt',title:'Nur das Laden betrachten',sub:'Herstellung und Entsorgung ignorieren'},{id:'whole',icon:'fa-arrows-spin',title:'Den ganzen Lebenszyklus betrachten',sub:'Von Rohstoffen bis Recycling'},{id:'price',icon:'fa-tag',title:'Nur auf den Kaufpreis schauen',sub:'Ökologische Folgen ausblenden'}]},
{id:'rawmaterials',artId:'ewaste',title:'Im Smartphone stecken wertvolle Rohstoffe',text:'Gold, Kupfer, Lithium, Kobalt und weitere Rohstoffe müssen gewonnen und verarbeitet werden. Einige gelten als kritisch und ihre Gewinnung kann Menschen und Umwelt belasten.',correct:'responsible',why:'Lange Nutzung, Reparierbarkeit, verantwortungsvollere Lieferketten und korrektes Recycling verringern den Druck auf neue Rohstoffe.',options:[{id:'replace',icon:'fa-mobile-screen-button',title:'Möglichst oft ersetzen',sub:'Damit immer das neueste Modell da ist'},{id:'responsible',icon:'fa-earth-europe',title:'Lange nutzen + verantwortungsvoll beschaffen',sub:'Reparierbarkeit, Lieferkette und Recycling mitdenken'},{id:'drawer',icon:'fa-box-archive',title:'Altgeräte einfach sammeln',sub:'Wertstoffe bleiben ungenutzt in der Schublade'}]},
{id:'backpack',artId:'buy',title:'Der ökologische Rucksack entsteht früh',text:'Ein funktionierendes Gerät soll ersetzt werden, obwohl es alle Aufgaben noch erfüllt. Bei der Herstellung wurden bereits Rohstoffe, Wasser und viel Energie eingesetzt.',correct:'longer',why:'Je länger ein geeignetes Gerät genutzt wird, desto länger verteilt sich der Herstellungsaufwand auf seine Nutzungszeit.',options:[{id:'yearly',icon:'fa-calendar-xmark',title:'Jährlich neu kaufen',sub:'Auch ohne technischen Grund'},{id:'longer',icon:'fa-hourglass-half',title:'Das Gerät länger nutzen',sub:'Herstellungsaufwand besser ausnutzen'},{id:'spare',icon:'fa-boxes-stacked',title:'Neues kaufen und altes lagern',sub:'Zwei Geräte besitzen, aber nur eines nutzen'}]},
{id:'datacenter',artId:'cloud',title:'Cloud und KI laufen nicht „in der Luft“',text:'Eine Klasse startet aus Spass immer wieder grosse KI-Aufgaben und lässt unnötige Cloud-Jobs weiterlaufen. Dahinter arbeiten Rechenzentren mit Servern, Kühlung und Stromversorgung.',correct:'purposeful',why:'Cloud- und KI-Dienste benötigen reale Rechenleistung in Rechenzentren. Sinnvolle Nutzung und unnötige Jobs vermeiden spart Ressourcen, ohne digitale Dienste grundsätzlich abzulehnen.',options:[{id:'endless',icon:'fa-repeat',title:'Alles beliebig oft wiederholen',sub:'Rechenaufwand spielt keine Rolle'},{id:'purposeful',icon:'fa-server',title:'Dienste gezielt und sinnvoll nutzen',sub:'Unnötige Berechnungen und Jobs vermeiden'},{id:'offline',icon:'fa-ban',title:'Cloud und KI komplett verbieten',sub:'Nur so sei Green IT möglich'}]}
'''

if "id:'lifecycle'" not in text:
    total_pos = text.find('const TOTAL=SCENES.length;')
    if total_pos < 0:
        raise SystemExit('TOTAL marker missing')
    end = text.rfind('];', 0, total_pos)
    if end < 0:
        raise SystemExit('SCENES end missing')
    text = text[:end] + ',\n' + new_scenes + text[end:]

text = text.replace("$('sceneArt').innerHTML=art(s.id)", "$('sceneArt').innerHTML=art(s.artId||s.id)")
text = text.replace('Elektrogeräte gehören in die Rückgabe- oder Sammelstelle, damit Rohstoffe zurückgewonnen werden können.', 'Elektrogeräte gehören in die Rückgabe- oder Sammelstelle. Beim Urban Mining können Metalle und andere Wertstoffe aus Altgeräten zurückgewonnen werden.')
text = text.replace('Ein Gerät passend zum Bedarf verbraucht bei Herstellung und Betrieb meist weniger Ressourcen als unnötige High-End-Hardware.', 'Nachhaltige IT-Beschaffung bedeutet: passend dimensionieren, lange Nutzungsdauer, Reparierbarkeit und ausreichende Software-Unterstützung statt unnötiger High-End-Hardware.')

required = ["id:'lifecycle'", "id:'rawmaterials'", "id:'backpack'", "id:'datacenter'", '14 Szenarien', 'Von Rohstoffen bis Urban Mining', 'Urban Mining', 'PASS=10', 's.artId||s.id']
for item in required:
    if item not in text:
        raise SystemExit('validation missing: ' + item)

path.write_text(text, encoding='utf-8')
