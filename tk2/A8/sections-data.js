// Shortcut Quest 2026 — TK2 A8 curated learning path
// Authority: 2026/PLAN.md
// Memory is intentionally excluded: TK2 A7 already contains Memory.
(function attachSectionBlueprints(global) {
  const I=(prompt,answer,hint)=>({type:'input',prompt,answer,...(hint?{hint}: {})});
  const compactChoices=(prompt,answer,options)=>{
    const source=[...new Set([...(Array.isArray(options)?options:[]),answer].filter(Boolean))];
    if(source.length<=4)return source;
    const answerIndex=Math.max(0,source.indexOf(answer));
    const picked=[answer];
    for(let offset=1;picked.length<4&&offset<source.length;offset+=1){
      const value=source[(answerIndex+offset)%source.length];
      if(value!==answer&&!picked.includes(value))picked.push(value);
    }
    const seed=Array.from(`${prompt}|${answer}`).reduce((sum,char)=>sum+char.charCodeAt(0),0);
    const shift=seed%picked.length;
    return picked.map((_,index)=>picked[(index+shift)%picked.length]);
  };
  if(typeof document!=='undefined'&&!document.getElementById('a8ChoiceDensityStyle')){
    const style=document.createElement('style');
    style.id='a8ChoiceDensityStyle';
    style.textContent='#learnSections .a8-choice-options{grid-template-columns:repeat(4,minmax(0,1fr))!important;width:100%!important;max-width:none!important}@media(max-width:720px){#learnSections .a8-choice-options{grid-template-columns:repeat(2,minmax(0,1fr))!important}}';
    document.head.appendChild(style);
  }
  const S=(prompt,answer,options)=>({type:'select',prompt,answer,options:compactChoices(prompt,answer,options)});
  const D=(tokens,targets)=>({type:'dnd',tokens,targets:targets.map(([label,answer])=>({label,answer}))});
  const section=(id,title,description,extra={})=>({id:String(id),tabLabel:`Abschnitt ${id}`,title:`${id}. ${title}`,description,...extra});
  const fast=(rounds,timeLimitSeconds,optionsPerRound,combos)=>({rounds,timeLimitSeconds,optionsPerRound,combos:combos.map(([label,combo])=>({label,combo}))});
  const builder=(title,instructions,defaultOptions,combos)=>({title,instructions,defaultOptions,combos:combos.map(([name,prompt,answers])=>({title:name,prompt,answers}))});
  const narrative=(entries)=>({autoCheck:false,entries:entries.map(([scene,prompt,options,answers])=>({scene,prompt,missingSlots:answers.length,options:options.map(v=>({label:v,value:v})),answers}))});

  const A1={
    basic:['Ctrl+C','Ctrl+X','Ctrl+V','Ctrl+Z','Ctrl+Y','Ctrl+S','Ctrl+A','Ctrl+F','Ctrl+P'],
    advanced:['Ctrl+Shift+V','Ctrl+H','Ctrl+O','Ctrl+Home','Ctrl+End']
  };
  const A4=['Ctrl+N','Ctrl+T','Ctrl+W','Ctrl+Shift+T','F5','Ctrl+L','Ctrl+Tab','Ctrl+Shift+Tab'];
  const A5=['Win+L','Win+D','Win+E','Win+Shift+S','Alt+Tab','Ctrl+Shift+Esc','Win+V','Alt+F4','Win+←','Win+→','Win+↑','Win+↓'];
  const ALTGR=['AltGr+2','AltGr+3','AltGr+E','AltGr+4','AltGr+7','AltGr+<','AltGr+ü','AltGr+¨','AltGr+ä','AltGr+$'];

  const sections=[
    section(1,'Mission – Abgabe in 60 Sekunden','Kein Abschreiben: Löse sechs kleine Pannen in einem laufenden Dokumentauftrag.',{narrative:narrative([
      ['Du hast gerade den falschen Absatz gelöscht.','Wähle den Rettungs-Shortcut: ____',['Ctrl+Z','Ctrl+Y','Ctrl+X','Ctrl+S'],['Ctrl+Z']],
      ['Du kopierst Text aus einer Webseite, aber die fremde Formatierung soll weg.','Wähle den sauberen Einfüge-Shortcut: ____',['Ctrl+Shift+V','Ctrl+V','Win+V','Ctrl+C'],['Ctrl+Shift+V']],
      ['Im langen Dokument musst du sofort den Abschnitt „Quellen“ finden.','Wähle den Such-Shortcut: ____',['Ctrl+F','Ctrl+H','Ctrl+S','Ctrl+O'],['Ctrl+F']],
      ['Ein veralteter Begriff kommt überall vor und muss ersetzt werden.','Wähle Suchen & Ersetzen: ____',['Ctrl+H','Ctrl+F','Ctrl+Y','Ctrl+P'],['Ctrl+H']],
      ['Du bist auf Seite 8 und willst direkt ganz nach oben.','Wähle den Sprung zum Dokumentanfang: ____',['Ctrl+Home','Ctrl+End','Ctrl+O','Ctrl+A'],['Ctrl+Home']],
      ['Noch wenige Sekunden bis zur Abgabe. Nichts darf verloren gehen.','Wähle Speichern: ____',['Ctrl+S','Ctrl+P','Ctrl+A','Ctrl+Z'],['Ctrl+S']]
    ]),tasks:[]}),

    section(2,'Reflex-Runde – A1','Situation lesen, passendes Kürzel antippen. Sechs schnelle Entscheidungen – kein Abschreiben.',{fastPaced:fast(6,10,4,[
      ['Text kopieren','Ctrl+C'],['Text ausschneiden','Ctrl+X'],['Text einfügen','Ctrl+V'],['Alles markieren','Ctrl+A'],['Datei öffnen','Ctrl+O'],['Druckdialog öffnen','Ctrl+P'],['Wiederherstellen / erneut ausführen','Ctrl+Y'],['Zum Dokumentende','Ctrl+End']
    ]),tasks:[],hideActions:true}),

    section(3,'Programme & Browser','Die acht Kürzel aus A4 erkennen und unterscheiden.',{tasks:[
      S('Neues Dokument','Ctrl+N',['Ctrl+N','Ctrl+T','Ctrl+O','Ctrl+W']),
      S('Neuer Browser-Tab','Ctrl+T',['Ctrl+T','Ctrl+N','Ctrl+W','Ctrl+Shift+T']),
      S('Aktuellen Tab schliessen','Ctrl+W',['Ctrl+W','Alt+F4','Ctrl+T','Ctrl+Shift+T']),
      S('Geschlossenen Tab zurückholen','Ctrl+Shift+T',['Ctrl+Shift+T','Ctrl+T','Ctrl+Shift+Tab','Ctrl+W']),
      S('Webseite aktualisieren','F5',['F5','Ctrl+F','Ctrl+L','Ctrl+N']),
      S('Adressleiste markieren','Ctrl+L',['Ctrl+L','Win+L','Ctrl+F','Ctrl+T']),
      S('Zum nächsten Browser-Tab','Ctrl+Tab',['Ctrl+Tab','Alt+Tab','Ctrl+T','Ctrl+Shift+Tab']),
      S('Zum vorherigen Browser-Tab','Ctrl+Shift+Tab',['Ctrl+Shift+Tab','Ctrl+Tab','Ctrl+Shift+T','Alt+Tab'])
    ]}),

    section(4,'Windows & Arbeitsalltag','Die Windows-Kürzel aus A5 sicher zuordnen.',{tasks:[
      S('PC sperren','Win+L',['Win+L','Ctrl+L','Win+D','Alt+F4']),
      S('Desktop anzeigen','Win+D',['Win+D','Win+E','Win+L','Alt+Tab']),
      S('Explorer öffnen','Win+E',['Win+E','Win+D','Win+V','Ctrl+O']),
      S('Screenshot-Ausschnitt','Win+Shift+S',['Win+Shift+S','Ctrl+S','Win+S','F5']),
      S('Programme wechseln','Alt+Tab',['Alt+Tab','Ctrl+Tab','Win+D','Alt+F4']),
      S('Task-Manager direkt öffnen','Ctrl+Shift+Esc',['Ctrl+Shift+Esc','Alt+F4','Ctrl+Shift+Tab','Win+E']),
      S('Zwischenablage-Verlauf','Win+V',['Win+V','Ctrl+V','Win+D','Win+E']),
      S('Aktives Fenster schliessen','Alt+F4',['Alt+F4','Ctrl+W','Alt+Tab','Win+L'])
    ]}),

    section(5,'AltGr – Schweizer Tastatur','Alle zehn Sonderzeichen aus A2 in der korrekten CH-Belegung.',{tasks:[
      S('@','AltGr+2',ALTGR),S('#','AltGr+3',ALTGR),S('€','AltGr+E',ALTGR),S('°','AltGr+4',ALTGR),S('|','AltGr+7',ALTGR),
      S('\\','AltGr+<',ALTGR),S('[','AltGr+ü',ALTGR),S(']','AltGr+¨',ALTGR),S('{','AltGr+ä',ALTGR),S('}','AltGr+$',ALTGR)
    ]}),

    section(6,'Drag & Drop – Grundlagen','Grundfunktionen schnell und sauber zuordnen.',{tasks:[D(
      ['Ctrl+C','Ctrl+V','Ctrl+X','Ctrl+Z','Ctrl+Y','Ctrl+S','Ctrl+A','Ctrl+F'],
      [['Kopieren','Ctrl+C'],['Einfügen','Ctrl+V'],['Ausschneiden','Ctrl+X'],['Rückgängig','Ctrl+Z'],['Wiederherstellen','Ctrl+Y'],['Speichern','Ctrl+S'],['Alles markieren','Ctrl+A'],['Suchen','Ctrl+F']]
    )]}),

    section(7,'Drag & Drop – A1 Spezial','Die selteneren allgemeinen Kürzel werden jetzt aktiv zugeordnet.',{tasks:[D(
      ['Ctrl+Shift+V','Ctrl+H','Ctrl+P','Ctrl+O','Ctrl+Home','Ctrl+End'],
      [['Ohne Formatierung einfügen','Ctrl+Shift+V'],['Suchen & Ersetzen','Ctrl+H'],['Druckdialog','Ctrl+P'],['Datei öffnen','Ctrl+O'],['Zum Anfang','Ctrl+Home'],['Zum Ende','Ctrl+End']]
    )]}),

    section(8,'Drag & Drop – Browser','Tabs und Browsernavigation als zusammenhängender Block.',{tasks:[D(
      A4,
      [['Neues Browserfenster','Ctrl+N'],['Neuer Tab','Ctrl+T'],['Tab schliessen','Ctrl+W'],['Tab wiederherstellen','Ctrl+Shift+T'],['Aktualisieren','F5'],['Adressleiste','Ctrl+L'],['Nächster Tab','Ctrl+Tab'],['Vorheriger Tab','Ctrl+Shift+Tab']]
    )]}),

    section(9,'Drag & Drop – Windows','Fenster, Werkzeuge und Schnellzugriffe zuordnen.',{tasks:[D(
      A5,
      [['PC sperren','Win+L'],['Desktop anzeigen','Win+D'],['Explorer','Win+E'],['Screenshot','Win+Shift+S'],['Programme wechseln','Alt+Tab'],['Task-Manager','Ctrl+Shift+Esc'],['Zwischenablage-Verlauf','Win+V'],['Fenster schliessen','Alt+F4'],['Links andocken','Win+←'],['Rechts andocken','Win+→'],['Maximieren','Win+↑'],['Verkleinern / minimieren','Win+↓']]
    )]}),

    section(10,'Combo Builder – Mixed','Baue zwei- und dreiteilige Kombinationen aus Tastenbausteinen.',{comboBuilder:builder(
      'Combo Builder','Wähle die richtigen Tasten in der richtigen Reihenfolge.',
      ['Ctrl','Shift','Win','Alt','C','V','T','W','S','Esc','Tab','F4'],[
        ['Ohne Formatierung','Baue „Einfügen ohne Formatierung“.',['Ctrl','Shift','V']],
        ['Tab zurückholen','Baue „geschlossenen Tab zurückholen“.',['Ctrl','Shift','T']],
        ['Screenshot','Baue den Screenshot-Ausschnitt.',['Win','Shift','S']],
        ['Task-Manager','Baue den direkten Task-Manager-Aufruf.',['Ctrl','Shift','Esc']],
        ['Fenster wechseln','Baue den Programmwechsel.',['Alt','Tab']],
        ['Fenster schliessen','Baue „aktives Fenster schliessen“.',['Alt','F4']]
      ]
    ),tasks:[]}),

    section(11,'Workflow Chain – Browser-Recherche','Mehrere komplette Kürzel als sinnvoller Arbeitsablauf.',{comboBuilder:builder(
      'Workflow Chain','Wähle ganze Tastenkürzel in der richtigen Reihenfolge.',
      ['Ctrl+T','Ctrl+L','Ctrl+F','Ctrl+W','Ctrl+Shift+T','F5','Ctrl+Tab'],[
        ['Recherche starten','Neuer Tab → Adressleiste → auf der Seite suchen → Tab schliessen.',['Ctrl+T','Ctrl+L','Ctrl+F','Ctrl+W']],
        ['Fehler retten','Geschlossenen Tab zurückholen → Seite aktualisieren.',['Ctrl+Shift+T','F5']]
      ]
    ),tasks:[]}),

    section(12,'Workflow Chain – Dokument','Ein echter Dokument-Workflow statt isolierter Einzelabfragen.',{comboBuilder:builder(
      'Workflow Chain','Setze die Arbeitsschritte als Shortcut-Kette zusammen.',
      ['Ctrl+O','Ctrl+A','Ctrl+C','Ctrl+Shift+V','Ctrl+S','Ctrl+Z','Ctrl+P'],[
        ['Dokument bearbeiten','Datei öffnen → alles markieren → kopieren → ohne Formatierung einfügen → speichern.',['Ctrl+O','Ctrl+A','Ctrl+C','Ctrl+Shift+V','Ctrl+S']],
        ['Korrigieren & prüfen','Letzte Aktion rückgängig → speichern → Druckdialog öffnen.',['Ctrl+Z','Ctrl+S','Ctrl+P']]
      ]
    ),tasks:[]}),

    section(13,'Workflow Chain – Langes Dokument','Navigation und Suchen in einem längeren Dokument verbinden.',{comboBuilder:builder(
      'Workflow Chain','Wähle die vollständigen Kürzel in der passenden Reihenfolge.',
      ['Ctrl+Home','Ctrl+F','Ctrl+H','Ctrl+End','Ctrl+S','Ctrl+O'],[
        ['Überarbeiten','Zum Anfang → Begriff suchen → suchen & ersetzen → zum Ende → speichern.',['Ctrl+Home','Ctrl+F','Ctrl+H','Ctrl+End','Ctrl+S']]
      ]
    ),tasks:[]}),

    section(14,'Workflow Chain – Windows Workspace','Fensterorganisation als zusammenhängender Arbeitsablauf.',{comboBuilder:builder(
      'Workflow Chain','Ordne komplette Kürzel zu einem effizienten Desktop-Workflow.',
      ['Win+E','Win+→','Alt+Tab','Win+←','Win+Shift+S','Win+L'],[
        ['Vergleichen & sichern','Explorer öffnen → rechts andocken → Programm wechseln → anderes Fenster links andocken → Screenshot → PC sperren.',['Win+E','Win+→','Alt+Tab','Win+←','Win+Shift+S','Win+L']]
      ]
    ),tasks:[]}),

    section(15,'Szenario – Schulauftrag','Kürzel in einem realistischen Dokumentauftrag auswählen.',{narrative:narrative([
      ['Du öffnest eine bestehende Datei.','Du nutzt ____ + ____.',['Ctrl','O','N','P'],['Ctrl','O']],
      ['Du willst einen Begriff im langen Dokument ersetzen.','Du nutzt ____ + ____.',['Ctrl','H','F','S'],['Ctrl','H']],
      ['Du hast einen Fehler gemacht.','Du nutzt ____ + ____.',['Ctrl','Z','Y','X'],['Ctrl','Z']],
      ['Zum Schluss speicherst du.','Du nutzt ____ + ____.',['Ctrl','S','P','A'],['Ctrl','S']]
    ]),tasks:[]}),

    section(16,'Szenario – Browser unter Druck','Tabs sicher bedienen, auch wenn etwas schiefgeht.',{narrative:narrative([
      ['Du brauchst schnell einen neuen Tab.','Du nutzt ____ + ____.',['Ctrl','T','W','L'],['Ctrl','T']],
      ['Du hast den wichtigen Tab versehentlich geschlossen.','Du nutzt ____ + ____ + ____.',['Ctrl','Shift','T','Tab'],['Ctrl','Shift','T']],
      ['Die Seite zeigt alte Inhalte.','Welche Taste aktualisiert die Webseite? ____',['F5','F4','Esc'],['F5']],
      ['Du wechselst zum vorherigen Browser-Tab.','Du nutzt ____ + ____ + ____.',['Ctrl','Shift','Tab','T'],['Ctrl','Shift','Tab']]
    ]),tasks:[]}),

    section(17,'Shortcut Shuffle I','Allgemein, Browser und Windows ohne Themenhinweis gemischt.',{tasks:[
      S('Einfügen ohne Formatierung','Ctrl+Shift+V',['Ctrl+V','Ctrl+Shift+V','Win+V','Ctrl+C']),
      S('Geschlossenen Tab zurückholen','Ctrl+Shift+T',['Ctrl+T','Ctrl+Shift+T','Ctrl+Shift+Tab','Ctrl+W']),
      S('Task-Manager','Ctrl+Shift+Esc',['Ctrl+Shift+Esc','Alt+F4','Win+E','Ctrl+Shift+Tab']),
      S('Zum Dokumentende','Ctrl+End',['Ctrl+Home','Ctrl+End','Ctrl+O','Ctrl+F']),
      S('Fenster maximieren','Win+↑',['Win+↑','Win+↓','Win+←','Win+→'])
    ]}),

    section(18,'Shortcut Shuffle II','Noch mehr gezielte Verwechslungen quer durch alle Bereiche.',{tasks:[
      S('Tab schliessen','Ctrl+W',['Ctrl+W','Alt+F4','Ctrl+T','Ctrl+Shift+T']),
      S('Fenster schliessen','Alt+F4',['Alt+F4','Ctrl+W','Alt+Tab','F5']),
      S('Nächster Browser-Tab','Ctrl+Tab',['Ctrl+Tab','Alt+Tab','Ctrl+Shift+Tab','Ctrl+T']),
      S('Programme wechseln','Alt+Tab',['Alt+Tab','Ctrl+Tab','Win+D','Ctrl+Shift+Tab']),
      S('Zwischenablage-Verlauf','Win+V',['Win+V','Ctrl+V','Ctrl+Shift+V','Win+D'])
    ]}),

    section(19,'Navigation Puzzle','Dokument-, Browser- und Fensternavigation in einer Aufgabe.',{tasks:[D(
      ['Ctrl+Home','Ctrl+End','Ctrl+Tab','Ctrl+Shift+Tab','Alt+Tab','Win+←','Win+→','Win+↑','Win+↓'],
      [['Dokumentanfang','Ctrl+Home'],['Dokumentende','Ctrl+End'],['Nächster Browser-Tab','Ctrl+Tab'],['Vorheriger Browser-Tab','Ctrl+Shift+Tab'],['Programm wechseln','Alt+Tab'],['Fenster links','Win+←'],['Fenster rechts','Win+→'],['Maximieren','Win+↑'],['Verkleinern / minimieren','Win+↓']]
    )]}),

    section(20,'System Quick Access','Windows-Funktionen und Werkzeuge ohne Maus direkt aufrufen.',{tasks:[
      I('PC sperren','Win+L'),I('Desktop anzeigen','Win+D'),I('Explorer öffnen','Win+E'),I('Screenshot-Ausschnitt','Win+Shift+S'),I('Task-Manager öffnen','Ctrl+Shift+Esc'),I('Zwischenablage-Verlauf','Win+V')
    ]}),

    section(21,'AltGr No-Hint Recall','Jetzt ohne Auswahl: die CH-Sonderzeichen-Kombinationen selbst eingeben.',{tasks:[
      I('@','AltGr+2'),I('€','AltGr+E'),I('|','AltGr+7'),I('\\','AltGr+<'),I('[','AltGr+ü'),I(']','AltGr+¨'),I('{','AltGr+ä'),I('}','AltGr+$')
    ]}),

    section(22,'Fast-Paced Basics','Allgemeine Kürzel unter Zeitdruck abrufen.',{fastPaced:fast(10,8,4,[
      ['Kopieren','Ctrl+C'],['Ausschneiden','Ctrl+X'],['Einfügen','Ctrl+V'],['Ohne Formatierung','Ctrl+Shift+V'],['Rückgängig','Ctrl+Z'],['Wiederherstellen','Ctrl+Y'],['Speichern','Ctrl+S'],['Alles markieren','Ctrl+A'],['Suchen','Ctrl+F'],['Suchen & Ersetzen','Ctrl+H'],['Öffnen','Ctrl+O']
    ]),tasks:[],hideActions:true}),

    section(23,'Fast-Paced Browser','Alle acht Browser-Kürzel in einer schnellen Runde.',{fastPaced:fast(10,7,4,[
      ['Neues Browserfenster','Ctrl+N'],['Neuer Tab','Ctrl+T'],['Tab schliessen','Ctrl+W'],['Tab zurückholen','Ctrl+Shift+T'],['Aktualisieren','F5'],['Adressleiste','Ctrl+L'],['Nächster Tab','Ctrl+Tab'],['Vorheriger Tab','Ctrl+Shift+Tab']
    ]),tasks:[],hideActions:true}),

    section(24,'Fast-Paced Windows','Fenster und Werkzeuge unter Zeitdruck.',{fastPaced:fast(10,7,4,[
      ['PC sperren','Win+L'],['Desktop','Win+D'],['Explorer','Win+E'],['Screenshot','Win+Shift+S'],['Programme wechseln','Alt+Tab'],['Task-Manager','Ctrl+Shift+Esc'],['Zwischenablage-Verlauf','Win+V'],['Fenster schliessen','Alt+F4'],['Links andocken','Win+←'],['Rechts andocken','Win+→'],['Maximieren','Win+↑'],['Minimieren','Win+↓']
    ]),tasks:[],hideActions:true}),

    section(25,'Verwechslungsgefahr','Bewusst ähnliche Kürzel auseinanderhalten.',{tasks:[
      S('Nur aktuellen Browser-Tab schliessen','Ctrl+W',['Ctrl+W','Alt+F4','Ctrl+T','Ctrl+Shift+T']),
      S('Aktives Programmfenster schliessen','Alt+F4',['Alt+F4','Ctrl+W','Alt+Tab','Win+L']),
      S('Browser-Adressleiste','Ctrl+L',['Ctrl+L','Win+L','Ctrl+F','Ctrl+T']),
      S('PC sperren','Win+L',['Win+L','Ctrl+L','Win+D','Alt+F4']),
      S('Einfügen','Ctrl+V',['Ctrl+V','Win+V','Ctrl+Shift+V','Ctrl+C']),
      S('Zwischenablage-Verlauf','Win+V',['Win+V','Ctrl+V','Ctrl+Shift+V','Win+D']),
      S('Nächster Browser-Tab','Ctrl+Tab',['Ctrl+Tab','Alt+Tab','Ctrl+Shift+Tab','Ctrl+T']),
      S('Zwischen Programmen wechseln','Alt+Tab',['Alt+Tab','Ctrl+Tab','Ctrl+Shift+Tab','Win+D'])
    ]}),

    section(26,'Advanced Combo Builder','Anspruchsvolle zwei- und dreiteilige Kombinationen bauen.',{comboBuilder:builder(
      'Advanced Builder','Baue die vollständige Kombination.',
      ['Ctrl','Shift','Win','Alt','V','T','Tab','Esc','S','L','F4'],[
        ['Ohne Formatierung','Einfügen ohne Formatierung.',['Ctrl','Shift','V']],
        ['Tab zurückholen','Geschlossenen Browser-Tab zurückholen.',['Ctrl','Shift','T']],
        ['Vorheriger Tab','Zum vorherigen Browser-Tab wechseln.',['Ctrl','Shift','Tab']],
        ['Screenshot','Screenshot-Ausschnitt öffnen.',['Win','Shift','S']],
        ['Task-Manager','Task-Manager direkt öffnen.',['Ctrl','Shift','Esc']],
        ['Fenster wechseln','Zwischen Programmen wechseln.',['Alt','Tab']],
        ['Fenster schliessen','Aktives Fenster schliessen.',['Alt','F4']]
      ]
    ),tasks:[]}),

    section(27,'Workflow Chain Gauntlet','Drei komplette Arbeitsabläufe direkt hintereinander.',{comboBuilder:builder(
      'Workflow Chain Gauntlet','Wähle ganze Tastenkürzel in der richtigen Reihenfolge.',
      ['Ctrl+T','Ctrl+L','Ctrl+F','Ctrl+W','Ctrl+O','Ctrl+A','Ctrl+C','Ctrl+Shift+V','Ctrl+S','Win+E','Win+→','Alt+Tab','Win+←','Win+Shift+S','Win+L'],[
        ['Browser','Neuer Tab → Adressleiste → suchen → Tab schliessen.',['Ctrl+T','Ctrl+L','Ctrl+F','Ctrl+W']],
        ['Dokument','Datei öffnen → alles markieren → kopieren → ohne Formatierung einfügen → speichern.',['Ctrl+O','Ctrl+A','Ctrl+C','Ctrl+Shift+V','Ctrl+S']],
        ['Windows','Explorer → rechts andocken → Programm wechseln → links andocken → Screenshot → sperren.',['Win+E','Win+→','Alt+Tab','Win+←','Win+Shift+S','Win+L']]
      ]
    ),tasks:[]}),

    section(28,'Real-World Gauntlet','Ein längerer Arbeitsauftrag mit gemischten Kürzeln.',{narrative:narrative([
      ['Du öffnest eine bestehende Datei.','____ + ____',['Ctrl','O','N','P'],['Ctrl','O']],
      ['Du suchst einen Begriff.','____ + ____',['Ctrl','F','H','L'],['Ctrl','F']],
      ['Du wechselst kurz in den Browser.','____ + ____',['Alt','Tab','Ctrl','Win'],['Alt','Tab']],
      ['Du öffnest einen neuen Tab.','____ + ____',['Ctrl','T','W','N'],['Ctrl','T']],
      ['Du markierst die Adressleiste.','____ + ____',['Ctrl','L','F','T'],['Ctrl','L']],
      ['Du machst einen Screenshot-Ausschnitt.','____ + ____ + ____',['Win','Shift','S','Ctrl'],['Win','Shift','S']],
      ['Zurück im Dokument speicherst du.','____ + ____',['Ctrl','S','P','Z'],['Ctrl','S']],
      ['Zum Schluss sperrst du den PC.','____ + ____',['Win','L','D','E'],['Win','L']]
    ]),tasks:[]}),

    section(29,'Mastery Sprint','Eine schnelle, breite Mischung kurz vor dem Finale.',{fastPaced:fast(14,6,5,[
      ['Kopieren','Ctrl+C'],['Ohne Formatierung','Ctrl+Shift+V'],['Suchen & Ersetzen','Ctrl+H'],['Dokumentende','Ctrl+End'],['Neuer Tab','Ctrl+T'],['Tab zurückholen','Ctrl+Shift+T'],['Aktualisieren','F5'],['Vorheriger Tab','Ctrl+Shift+Tab'],['Desktop','Win+D'],['Task-Manager','Ctrl+Shift+Esc'],['Zwischenablage-Verlauf','Win+V'],['Fenster schliessen','Alt+F4'],['Links andocken','Win+←'],['Maximieren','Win+↑']
    ]),tasks:[],hideActions:true}),

    section(30,'Final Mastery','Der letzte gemischte Recall vor dem finalen Battle.',{tasks:[
      I('Einfügen ohne Formatierung','Ctrl+Shift+V'),I('Suchen & Ersetzen','Ctrl+H'),I('Zum Dokumentende','Ctrl+End'),
      I('Geschlossenen Tab zurückholen','Ctrl+Shift+T'),I('Vorheriger Browser-Tab','Ctrl+Shift+Tab'),I('Webseite aktualisieren','F5'),
      I('Task-Manager öffnen','Ctrl+Shift+Esc'),I('Zwischenablage-Verlauf','Win+V'),I('Fenster links andocken','Win+←'),I('Fenster maximieren','Win+↑'),
      I('Backslash auf CH-Tastatur','AltGr+<'),I('Geschweifte Klammer auf','AltGr+ä')
    ]})
  ];

  global.LEARN_SECTION_BLUEPRINTS=sections;
})(typeof window!=='undefined'?window:globalThis);