# Analyse: ib2026 Repo & /hw Arbeitsblätter

Stand: 2026-08-11. Geprüft von Claude auf Anfrage (Korrekturlauf für index.html, A1, A2, A3).

## Repo-Überblick

- `index.html` – Startseite/Übersicht, verlinkt alle Arbeitsblätter (`hw/A1.html` … `hw/A7.html`, `hw/memory.html`, `hw/vortrag.html`). Enthält eine automatische "Erledigt"-Erkennung (`checkCompletionStatus()`, ab Zeile 1526), die beim Laden/Fokussieren der Seite den `localStorage` jedes Arbeitsblatts liest und den Öffnen-Button grün/Häkchen markiert, wenn ein Arbeitsblatt fertig ist. **Es gibt keinen manuellen "done"-Schalter** – die Markierung ist vollautomatisch und hängt exakt vom `localStorage`-Format ab, das jedes Arbeitsblatt selbst schreibt.
- `hw/A1.html` – A1: IT-Hardware Memory (Kartenspiel, 4 Schwierigkeitsstufen)
- `hw/A2.html` – A2: Das EVA-Prinzip
- `hw/A3.html` (+ `A3_backup.html`, `A3_merged.html`, siehe unten) – A3: Computeraufbau
- `hw/A4.html`–`A7.html`, `memory.html`, `vortrag.html` – weitere Arbeitsblätter, **noch nicht auditiert** (nicht Teil des heutigen Durchgangs)
- `hw/A6.pdf`, `hw/A6a.pdf`, `hw/A6b.pdf`, Python-Skripte (`convert_to_webp.py`, `create_hq_webp.py`, `create_favicon.py`) – Hilfsdateien, nicht auditiert

### Bekannte Lücke in index.html

`checkCompletionStatus()` prüft A1, A2, A3, A4, A6, A7 — **A5 fehlt** (kein `markDone('title-A5')`-Block), obwohl A5 als Kachel existiert (`title-A5`, Zeile ~906). Falls A5.html fertig gespielt wird, bleibt die Kachel für immer unmarkiert. → Sollte ergänzt werden, sobald A5 auditiert wird (nicht heute im Scope, nur als Fund notiert).

---

## A1: IT-Hardware Memory — ✅ Geprüft, ein Bug gefunden & behoben

### Checkliste

| Punkt | Ergebnis |
|---|---|
| Progression (Spiellogik) | ✅ Solide. Deck-Aufbau, Shuffle, Match-Logik (`kind` term/desc, `pairId`), Punkte-/Sterne-Berechnung, Combo-Bonus, Zeitbonus — alles konsistent, keine Off-by-one- oder Dead-End-Bugs gefunden. |
| Rechtschreibung | ✅ Keine Fehler gefunden (Kartentexte, Buttons, Alerts, Modal-Texte alle geprüft). |
| PDF-Erstellung | 🔧 **Bug gefunden & behoben** (siehe unten) |
| localStorage speichern/laden | ✅ Konsistent. Highscores (`memScores_<diff>`, `memHigh_<diff>`), abgeschlossene Modi (`memCompletedModes`), Einstellungen (`memFlipDelay`, `memCardMin`, `memTextSize`) — alles wird beim Laden korrekt wiederhergestellt. |
| Autofill Vorname/Klasse/Datum | ✅ Per Screenshot-Test verifiziert: Vorname wird aus globalem `studentVorname`/`student_vorname` übernommen, Klasse defaultet auf `B24`, Datum wird automatisch auf heute gesetzt. |
| index.html "done"-Erkennung | ✅ Stimmt überein: `memCompletedModes.length >= 3` — genau das, was A1 selbst schreibt. |

### Gefundener & behobener Bug: PDF-Export sah "kaputt" aus (schlimmer bei Ultra)

**Ursache:** Die Print-CSS (`@media print`) nutzte `body * { visibility: hidden }`. Das versteckt nur *Nachfahren* von `<body>`, nicht `<body>` selbst. Der dunkle Hintergrund der Seite (Dark Mode) und ihre `min-height: 100%` blieben aktiv, sodass unter dem Zertifikat eine große schwarze Fläche übrig blieb — das Zertifikat wirkte "nach oben links verschoben". Bei Ultra (24 Karten im unsichtbaren Spielfeld) war die übrig gebliebene Fläche am größten, daher dort am auffälligsten kaputt — der Bug betraf aber alle Schwierigkeitsstufen.

**Fix** ([hw/A1.html:197-201](hw/A1.html#L197-L201), committed als `5a92fa1`): Alles außer `#printCertificate` wird jetzt per `display: none` komplett aus dem Layout entfernt (statt nur unsichtbar gemacht), `html`/`body` werden im Druck auf `height: auto` + weißen Hintergrund zurückgesetzt.

**Verifiziert:** Vorher/Nachher-PDFs für Einfach und Ultra per Headless-Chrome gerendert und verglichen — vorher beide mit schwarzer Fläche kaputt, nachher beide sauber (identisches, kompaktes Ein-Seiten-Zertifikat).

### Kleinere Beobachtung (kein Fix nötig, nur zur Kenntnis)

Der "Vorname"-Sync-Code kommt in `A1.html` gleich **dreifach** vor (Zeilen ~987-1007, ~1084-1094, ~1140-1150, plus ein eigener IIFE-Block ~1163-1225). Funktioniert (getestet), aber redundant/schwer wartbar. Dasselbe Muster existiert identisch in *allen* anderen Arbeitsblättern (A2, A3, A4, A5, A6, A7, vortrag.html) — offenbar bewusst als Kopier-Vorlage für die eigenständigen HTML-Dateien gewählt (kein gemeinsames JS-Modul). Da es überall gleich ist und nachweislich funktioniert, keine Änderung vorgenommen.

---

## A2: Das EVA-Prinzip — ✅ Geprüft, 4 Bugs gefunden & behoben

### Checkliste

| Punkt | Ergebnis |
|---|---|
| Progression | ✅ Solide. 3 Abschnitte (Hero-Animation → Video → 6 Praxis-Beispiele), Fortschritt korrekt aus 27 Feldern berechnet, erreicht sauber 100 %. |
| Rechtschreibung | 🔧 1 Tippfehler behoben ("Youtube" → "YouTube"). Rest sauber. |
| PDF-Erstellung | 🔧 1 Risiko behoben (siehe unten) |
| localStorage speichern/laden | 🔧 **Kritischer Bug gefunden & behoben** (siehe unten) |
| Autofill Vorname/Klasse/Datum | ✅ Funktioniert (Feld ist readonly, wird über globalen `studentVorname`-Key befüllt; beim ersten Besuch fragt ein `prompt()` nach dem Namen). 🔧 kleiner Nachbesserung: Fortschrittsanzeige aktualisierte sich nicht sofort nach dem Prompt — behoben. |
| index.html "done"-Erkennung | 🔧 War **kaputt**, jetzt behoben (siehe unten) |

### Bug 1 (kritisch): A2 konnte auf der Startseite nie als "erledigt" markiert werden

**Ursache:** `saveProgressToStorage()` ([hw/A2.html:833](hw/A2.html#L833) alt) speicherte `{ form: {...} }` — ganz ohne `percent`-Feld. `index.html` prüft aber exakt `parsed.percent === 100`. Da `percent` nie gespeichert wurde, war das immer `false`, egal wie vollständig das Arbeitsblatt ausgefüllt war.

**Fix:** `updateProgress()` übergibt den bereits berechneten Prozentwert jetzt an `saveProgressToStorage(false, percent)`, welches ihn als `data.percent` mitspeichert. Verifiziert per Headless-Test: nach vollständigem Ausfüllen steht `percent: 100` im gespeicherten Objekt.

### Bug 2: "Zurücksetzen" konnte durch Neuladen rückgängig gemacht werden

**Ursache:** Es gibt zwei parallele Speichermechanismen — `onedrive_a2_eva_worksheet_8sek` (eigene Logik) und `hw_autosave_A2.html` (generisches Autosave, das *alle* Formularfelder spiegelt). `confirmReset()` löschte nur den ersten Key. Nach einem Reload holte das generische Autosave die alten Antworten aus dem zweiten Key zurück — der Reset wirkte nur bis zum nächsten Laden der Seite.

**Fix** ([hw/A2.html:869-882](hw/A2.html#L869-L882)): `confirmReset()` löscht jetzt auch `hw_autosave_A2.html` und stellt Klasse/Datum/Vorname aus den bekannten Defaults wieder her.

### Bug 3: Tippfehler "Youtube" → "YouTube" ([hw/A2.html:473](hw/A2.html#L473))

### Risiko behoben: Dunkle Hero-Sektion konnte beim Drucken schwarz/riesig mitgedruckt werden

Die dekorative "E-V-A"-Animationssektion hat einen fest codierten fast-schwarzen Hintergrund (`bg-[#050914]`) und war nicht von der `.no-print`-Regel ausgenommen. Da `body { print-color-adjust: exact }` gesetzt ist, hätte dieser dunkle Block beim Drucken/PDF-Export mitgedruckt — unnötiger Tintenverbrauch, sieht nicht nach "Arbeitsblatt" aus. Sie zeigt ausserdem keine eingegebenen Antworten (rein dekorativ). **Fix:** Abschnitt bekommt jetzt `no-print` ([hw/A2.html:352](hw/A2.html#L352)) und wird beim Drucken komplett ausgeblendet, genau wie Header und Video-Sektion.

---

## A3: Aufbau eines Computers — ✅ Geprüft, 3 Bugs gefunden & behoben (davon 1 strukturell)

### 0. Zur Klärung: `A3_backup.html` / `A3_merged.html`

Diese beiden Dateien sind **nicht** eingecheckt (untracked) und **nicht** identisch mit dem aktuellen `A3.html`. Sie stammen aus einer früheren Überarbeitung (altes dunkles "Hero"-Design, nur 10 statt 16 Bauteile) und wurden beim Umbau auf das aktuelle helle Karten-Design offenbar als Zwischenstände liegengelassen. `A3.html` selbst hat aktuell **keine** uncommitteten Änderungen (`git diff` ist leer, letzter Commit `bb83d82 "fix A3"`).

Ich habe aus `A3_backup.html` das Markup für das fehlende Vorname/Klasse/Datum-Formular übernommen (siehe Bug 2 unten) — danach haben die beiden Dateien keinen bekannten offenen Zweck mehr. **Ich habe sie nicht gelöscht**, da ich nicht sicher weiss, ob sie absichtlich als Sicherung aufbewahrt werden sollten. Sag Bescheid, falls ich sie entfernen soll.

### Checkliste

| Punkt | Ergebnis |
|---|---|
| Progression | ✅ Solide (5 Aufträge: Hardware-Analyse, EVA-Drag&Drop, Speichervergleich, Kaufberater, Quiz). Fortschritt aus 62 Feldern korrekt berechnet, erreicht sauber 100 %. Einzige Schwäche: die Drag&Drop-Zuordnung im EVA-Auftrag prüft nicht, ob ein Gerät in die *richtige* Zone gezogen wurde — jede Zone zählt als "erledigt". Kein neuer Bug (schon in den alten Zwischenständen so), aber erwähnenswert fürs Lernziel. |
| Rechtschreibung | 🔧 1 Darstellungsfehler behoben (siehe Bug 3). Rest sauber, inkl. aller 10 Quiz-Fragen mit korrekt markierten richtigen Antworten. |
| PDF-Erstellung | ✅ Nutzt bereits das robuste Muster (kein `visibility:hidden`-Bug wie ursprünglich A1) |
| localStorage speichern/laden | 🔧 **Kritischer Bug gefunden & behoben** — gleiches Problem wie A2 |
| Autofill Vorname/Klasse/Datum | 🔧 **Fehlte komplett im HTML** — kritischer Fund, behoben (siehe Bug 2) |
| index.html "done"-Erkennung | 🔧 War kaputt, jetzt behoben |

### Bug 1 (kritisch, strukturell): Fehlende schliessende `</div>` zerstörte das Seiten-Layout

Beim Ersetzen des alten dunklen Headers durch den aktuellen hellen wurde die schliessende `</div>` der "Titel & Metadaten"-Karte vergessen. Dadurch waren **der komplette Rest der Seite (alle 5 Aufträge) fälschlich in dieser einen Karte verschachtelt** — im Browser hätte das bedeutet: eine zusätzliche dicke weisse/graue Umrandung um die ganze Seite und **kein Abstand mehr zwischen den Auftrags-Karten** (das `space-y-6`-Spacing griff nicht mehr, weil `<main>` dadurch nur noch ein einziges verschachteltes Kind statt 6 Geschwister-Elemente hatte). Das ist genau die Art von "sieht komisch/kaputt aus"-Symptom, nach der ursprünglich gefragt wurde — nur eben in A3 statt A1.

**Fix** ([hw/A3.html:313-350](hw/A3.html#L313-L350)): schliessende `</div>` ergänzt, direkt im selben Zug das fehlende Metadaten-Formular eingefügt (siehe Bug 2). Per Screenshot verifiziert: Karten sind jetzt wieder sauber getrennt mit korrektem Abstand.

### Bug 2 (kritisch): Vorname/Klasse/Datum-Felder fehlten komplett im HTML

Die komplette JS-Logik für Autofill (globaler Vorname-Sync, Klasse-Default "B24", Tagesdatum, Erstbesuch-`prompt()`) war vorhanden und aktiv — aber es gab **keine** `studentName`/`studentClass`/`studentDate`-Inputs im HTML, an die sie sich hätten hängen können (im Gegensatz zu A1, A2, A4, die alle dieses Formular haben). Der `prompt()` fragte also weiterhin nach dem Namen, aber nirgends auf der Seite wurde er angezeigt.

**Fix:** Formular aus `A3_backup.html` übernommen und ans aktuelle helle Kartendesign angepasst (identisch zum Muster in A1/A2), eingefügt in [hw/A3.html:327-345](hw/A3.html#L327-L345). Per Screenshot verifiziert: Vorname, Klasse ("B24") und Datum werden jetzt korrekt angezeigt und automatisch befüllt.

### Bug 3: Unverarbeiteter LaTeX-Code sichtbar statt Pfeilen

[hw/A3.html:761](hw/A3.html#L761) zeigte wortwörtlich `Eingabe $\rightarrow$ Verarbeitung $\rightarrow$ Ausgabe` an (es ist kein MathJax/KaTeX eingebunden, das diese Syntax rendern würde). **Fix:** durch echte Pfeilzeichen (`&rarr;`) ersetzt → "Eingabe → Verarbeitung → Ausgabe".

### Bug 4 (kritisch): Gleicher "done"-Bug wie bei A2

`saveProgressToStorage()` speicherte `{ form, devices, quiz }` ohne `percent`-Feld, obwohl `index.html` genau das prüft. **Fix** ([hw/A3.html:1592-1597](hw/A3.html#L1592-L1597)): `percent: currentPercentage` ergänzt.

---

## Zusammenfassung heute

- **index.html**: nur geprüft, nicht verändert. Automatische "erledigt"-Erkennung für A1/A2/A3 funktioniert jetzt tatsächlich (vorher A2 & A3 strukturell nie erreichbar). Bekannte Lücke notiert: A5 fehlt im Completion-Check (nicht heute behoben, ausserhalb des Scopes).
- **A1.html**: 1 Bug behoben (PDF-Druck-Layout).
- **A2.html**: 4 Fixes (percent-Feld, Reset-Leck, Youtube-Tippfehler, Print-Hintergrund).
- **A3.html**: 4 Fixes (kaputtes Layout durch fehlendes `</div>`, fehlendes Metadaten-Formular, LaTeX-Darstellungsfehler, percent-Feld).
- Offene Punkte zur Entscheidung: `A3_backup.html`/`A3_merged.html` behalten oder löschen? A5 in index.html ergänzen (nicht heute im Scope)?
- **A4-A7, memory.html, vortrag.html**: noch nicht auditiert.

---

## Nachtrag: gemeinsame JS-Datei für Theme/Autofill/Autosave (A1 & A2)

A1.html und A2.html enthielten je **~300 Zeilen fast wortwörtlich dupliziertes Boilerplate** für Dark Mode, Schriftgrössen-Sync, den globalen Vorname-Abgleich (inkl. Erstbesuch-`prompt()`) und das generische Formular-Autosave (`hw_autosave_<Datei>.html`). Teilweise sogar doppelt *innerhalb derselben Datei* (z. B. `initTheme()`/`toggleDarkMode()` je zweimal definiert, wobei die zweite Definition die erste unbemerkt überschrieb — totes Code).

Dieser Code wurde nach [hw/assets/js/worksheet-common.js](hw/assets/js/worksheet-common.js) ausgelagert (Theme, Font-Size, Vorname-Sync, `applyDefaultClassAndDate()`, `setupUniversalAutoSave()`). A1.html und A2.html binden die Datei jetzt per `<script src="assets/js/worksheet-common.js">` ein, die lokalen Kopien wurden entfernt (−599 Zeilen in Summe, ein 234-Zeilen-Modul statt zwei Kopien). Verhalten ist unverändert — vor/nach dem Refactor per Headless-Screenshot pixelgleich verifiziert (Vorname/Klasse/Datum-Autofill, Fortschritt, Dark Mode).

`index.html` wurde **nicht** angefasst: es hat kein Vorname/Klasse/Datum-Formular (keine Autofill-Logik nötig) und sein Theme/Font-Size-System ist an ein eigenes, andersartiges Einstellungs-Panel gekoppelt (eigene Element-IDs, kein einfacher Toggle-Button wie bei den Arbeitsblättern) — eine Umstellung auf die gemeinsame Datei wäre kein reines Auslagern identischen Codes, sondern ein separates, riskanteres Refactoring. Nicht vorgenommen.

A3.html, A4-A7 etc. haben denselben dupliziertes-Boilerplate-Bug (siehe A3-Abschnitt oben), wurden aber wie vom Nutzer vorgegeben heute nicht angefasst — `worksheet-common.js` ist so geschrieben, dass sie later einfach denselben `<script src="assets/js/worksheet-common.js">`-Tag einbinden könnten, um denselben Code-Duplizierungs-Bug zu beheben.

### Nachträglich gefundener & behobener Bug im Refactor selbst

Bei der Verifikation fiel auf: A2.html initialisiert über `document.addEventListener('DOMContentLoaded', ...)` (deferred), A1.html dagegen über eine sofort ausgeführte IIFE (synchron). Die gemeinsame Datei wurde zunächst bei beiden **vor** dem Haupt-Script eingebunden. Für A1 ist das korrekt (synchroner Code braucht die Funktionen sofort). Für A2 hätte das aber die Registrierungsreihenfolge zweier `DOMContentLoaded`-Listener vertauscht: die gemeinsame Datei (Vorname-Prompt) wäre jetzt **vor** A2s eigenem Code gelaufen, statt wie ursprünglich danach. In einem Randfall (lokale Fortschrittsdaten fürs Arbeitsblatt bereits vorhanden, aber der globale Vorname-Key fehlt) hätte das einen unnötigen `prompt()` ausgelöst, obwohl der Name eigentlich schon lokal bekannt war.

**Fix:** `<script src="assets/js/worksheet-common.js">` bei A2.html ans Dateiende verschoben (genau dort, wo die alten "Global Unified"-Blöcke ursprünglich standen) — stellt die ursprüngliche Reihenfolge wieder her. Per Headless-Test verifiziert: mit lokalen Daten aber fehlendem globalem Key erscheint jetzt kein Prompt mehr, der Name wird korrekt aus den lokalen Daten übernommen.

### End-to-End-Verifikation (heute durchgeführt)

Mit einem persistenten Browser-Profil wurde der komplette Kreislauf getestet:
1. A1 "gespielt" (3 Modi über die echte `showSummary()`-Funktion abgeschlossen) → Seite neu geladen → Fortschritt (3/3, 100 %, PDF-Button grün, Vorname/Klasse/Datum) bleibt korrekt erhalten.
2. A2 komplett ausgefüllt (echte Input-Events ausgelöst) → Seite neu geladen → 100 % erledigt, PDF-Button grün, alle Felder bleiben erhalten.
3. `index.html` mit demselben Profil geöffnet → **sowohl A1 als auch A2 zeigen jetzt automatisch das grüne Häkchen** in der Übersicht.

Der komplette Kreislauf (Formular ausfüllen/spielen → localStorage speichern → Reload lädt korrekt → Dashboard erkennt "erledigt") funktioniert nachweislich durchgehend für A1 und A2.

///

re analyze current situation of TK 
WHAT ELSE LOOKS OFF ? 

make a new in list ANALYZE.md

check if progression is solid 
check if everything is working as expected (A1.html and mark in index.html as done).
korrigiere ebenfalls rechtschreibung, oder zeige mir auf wenn etwas essentielles fehlen würde.
check if pdf creation is okay 
check if all input fields save into localstorage / and load consistent. (not relevant here i guess)

BUT MAKE SURE PEOPLE cannot do CTRL+V in the GAMES Q1-Q6 ? 

