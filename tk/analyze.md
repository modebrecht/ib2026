# Analyse: /tk (Tastenkombinationen-Kurs, Klasse B25)

Stand: 2026-08-13. Geprüft von Claude auf Anfrage (nur `tk/`, hw/ nicht betrachtet). **Update:** alle 6 unten gefundenen Bugs wurden im selben Durchgang behoben (siehe Status je Bug). Verifiziert per `node --check` auf allen betroffenen Inline-Scripts sowie per Headless-Chrome-Ladetest aller fünf Seiten (`index.html`, `A1.html`, `A2.html`, `A3.html`, `presentation.html`) — keine Konsolenfehler.

## Überblick

- `index.html` – Startseite, verlinkt A1–A3 + PDF-Export (`downloadCertificatePDF()` aus `xp.js`). Kein "erledigt"-Häkchen-System wie in `hw/index.html` (nur globale XP-Anzeige) — kein Bug, nur weniger Funktionsumfang.
- `start.html` – reine Weiterleitung (`meta refresh`) auf `index.html`. Unauffällig.
- `xp.js` – gemeinsame Engine für alle Seiten: globale XP (`tk_global_xp_v1`), Quest-Scores (`tk_quest_scores_v1`), Freischalt-Logik (`isQuestUnlocked`), Sound-Effekte, Lehrer-Cheatcode (Alt+Shift, "LOKLOK" → alles freischalten), PDF-Zertifikat-Generator.
- `A1.html` – Quest 1–3 (allgemeine Strg-Kürzel: Geführt / 50-50-Rätsel / Blind-Profi).
- `A2.html` – Quest 4–6 (AltGr-Sonderzeichen, gleiches Dreier-Schema).
- `A3.html` – Boss-Challenge: Word-Download (Base64 inline eingebettet, stimmt mit `Tastenkombinationen_A3.docx` überein ✅ geprüft per Hash), Stoppuhr.
- `presentation.html` – Scroll-Snap-Folien für den theoretischen Einstieg, unabhängig vom Quest-System. Keine Bugs gefunden.
- `shared.css` – gemeinsames Design-System (Farbvariablen, Karten, Tabs). Unauffällig.

### Freischalt-Kette (zur Einordnung der Bugs unten)

`q1 →(≥80%)→ q2 →(≥70%)→ q3 →(≥70%)→ q4 →(≥80%)→ q5 →(≥70%)→ q6 →(≥70%)→ q7`. Alle angezeigten Sperrbildschirm-Texte (A1/A2/A3) stimmen mit der tatsächlichen Logik in `isQuestUnlocked()` überein — hier keine Inkonsistenzen gefunden.

---

## ✅ Bug 1 (kritisch, deterministisch, behoben): Quest 5 in A2.html prüft die Eingabe gegen das falsche Array — Quest ist in den meisten Runden gar nicht lösbar

**Fundstelle:** [tk/A2.html:796-798](A2.html#L796-L798)

```js
document.getElementById('q5-char-input').addEventListener('input', (e) => {
    if (activePhase !== 3 || q5Index >= altgrItems.length) return;
    const targetChar = altgrItems[q5Index].char;   // ← falsches Array!
```

`updateQ5Card()` zeigt das Zeichen aus der **gemischten** Kopie `q5Items[q5Index]` an ([Zeile 729](A2.html#L729): `const item = q5Items[q5Index];`). Die Eingabe-Prüfung vergleicht aber gegen `altgrItems[q5Index]` — das **unveränderte Original-Array** in seiner festen Reihenfolge (Klammeraffe, Hashtag, Euro, …). Da `q5Items = shuffleArray(altgrItems)` bei jedem Rundenstart neu gemischt wird, stimmen Anzeige und Prüf-Array nur zufällig überein (im Schnitt ~1 von 10 Positionen bei einer zufälligen Permutation). Das bedeutet: Der Schüler tippt exakt das angezeigte Zeichen ein — und bekommt trotzdem `-10 XP` und "❌ falsch", weil intern ein ganz anderes Zeichen erwartet wird.

Zusätzlich zeigt auch `useQ5Hint()` ([Zeile 782](A2.html#L782)) den Tipp aus `q5Items[q5Index]` (also passend zur Anzeige) — der Tipp hilft also auch nicht, weil er nicht zum tatsächlich geprüften Zeichen passt.

**Vergleich zur Kontrolle:** Quest 4 ([Zeile 637](A2.html#L637): `q4Items[q4Index].char`) und Quest 6 ([Zeile 952](A2.html#L952): `q6Items[q6Index].char`) machen es korrekt — nur Quest 5 hat den Copy-Paste-Fehler. Das ist ein eindeutiger, reproduzierbarer Bug, kein Grenzfall.

**Auswirkung:** Quest 5 lässt sich praktisch nicht mit ≥70% abschliessen (Voraussetzung für Quest 6 und damit für A3), ausser durch Zufall oder wenn ein Schüler das Muster durchschaut und "im Blindflug" die Zeichen in der ursprünglichen Listenreihenfolge eintippt statt die angezeigten.

**Fix:** Beide Zeilen auf die gemischte Kopie umgestellt — [tk/A2.html:804-805](A2.html#L804-L805): `if (... || q5Index >= q5Items.length ...) return; const targetChar = q5Items[q5Index].char;`. Anzeige, Tipp und Prüfung nutzen jetzt konsistent dasselbe (gemischte) Array, genau wie Quest 4 und 6.

---

## ✅ Bug 2 (wichtig, systemisch, behoben): Keine Sperre gegen Tasten-Wiederholung (Autorepeat) — Gedrückthalten kann XP und Fortschritt vervielfachen

**Fundstellen:**
- A1.html, globaler `keydown`-Listener: [tk/A1.html:920-992](A1.html#L920-L992)
- A2.html, `input`-Listener für Q4/Q5/Q6: [tk/A2.html:635-671](A2.html#L635-L671), [796-832](A2.html#L796-L832), [950-992](A2.html#L950-L992)

Keine der Erfolgs-Prüfungen merkt sich "diese Karte wurde bereits gewertet" — sie reagiert bei jedem einzelnen `keydown`- bzw. `input`-Ereignis neu. Hält man die Zielkombination (z. B. Strg+C) oder eine AltGr-Taste etwas zu lange gedrückt, löst die Betriebssystem-/Browser-Tastenwiederholung (Autorepeat) mehrfach dasselbe Ereignis aus, bevor der `setTimeout(..., 600)` die Karte tatsächlich weiterschaltet (`q1Index++` usw.). Jedes dieser Wiederholungs-Events feuert erneut `handleQxSuccess()` (oder bei falscher Kombi `handleQxWrong()`), da `qxIndex` währenddessen noch unverändert ist und somit weiterhin auf dasselbe (bereits "gelöste") Element zeigt.

Folge: mehrfaches `addGlobalXP(±10)` für einen einzigen Tastendruck, mehrfach gezählte `qxCorrectHits`/`qxTotalAttempts`, und mehrere gestapelte `setTimeout`-Aufrufe, die `qxIndex` hintereinander mehrfach erhöhen — die Quest kann dadurch Karten überspringen oder vorzeitig mit einem verzerrten Prozentwert enden. Betrifft alle sechs Quest-Trainer (A1: Q1–Q3, A2: Q4–Q6) gleichermassen, da sie alle demselben Muster folgen (kein `e.repeat`-Check, kein "bereits beantwortet"-Flag).

**Fix:** Zwei Ebenen Schutz ergänzt:
1. `if (e.repeat) return;` ganz am Anfang von A1s globalem `keydown`-Listener ([tk/A1.html:921](A1.html#L921)) — ignoriert Autorepeat-Events der Tastatur direkt.
2. Ein `qxLocked`-Flag pro Quest (`q1Locked`…`q6Locked`), das beim Rendern einer neuen Karte auf `false` gesetzt wird, in `handleQxSuccess()`/dem Erfolgsfall auf `true` (bleibt bis zur nächsten Karte gesperrt) und im Fehlerfall nach Ablauf der 600-ms-Fehleranzeige wieder auf `false` gesetzt wird — für die `input`-Listener in A2.html (Q4/Q5/Q6), wo Autorepeat-Zeichen sonst weiterhin mehrfach `.includes(targetChar)` treffen würden. Beide Listener-Typen (`keydown` in A1, `input` in A2) prüfen das jeweilige `qxLocked` ganz am Anfang und brechen sonst sofort ab.

---

## ✅ Bug 3 (behoben): A1 Quest 2 & Quest 3 zeigten nach richtiger Antwort (bzw. beim Tipp-Kauf) das falsche Kürzel an

**Fundstellen:** [tk/A1.html:679](A1.html#L679) (`useQ2Hint`), [695](A1.html#L695) (`handleQ2Success`), [829](A1.html#L829) (`useQ3Hint`), [845](A1.html#L845) (`handleQ3Success`)

Alle vier Stellen lesen `shortcuts[q2Index]` bzw. `shortcuts[q3Index]` — das globale, **unveränderte** Basis-Array — statt der tatsächlich gerade gespielten, gemischten Kopie `q2Shortcuts[q2Index]` / `q3Shortcuts[q3Index]` (die z. B. `updateQ2Card()` korrekt verwendet). Die eigentliche Treffer-Prüfung (`checkMatch()`) ist davon **nicht** betroffen — sie läuft korrekt gegen die gemischte Kopie, die Wertung bleibt also richtig. Betroffen ist nur die visuelle "richtig!"-Anzeige bzw. der gekaufte Tipp: Es werden Tasten eingeblendet, die nichts mit der gerade gestellten Frage zu tun haben. Für Schüler verwirrend (v. a. beim Tipp: der 30-XP-Tipp zeigt ggf. ein komplett anderes Kürzel als gefragt).

Kleinere Randnotiz: In A2.html tritt derselbe visuelle Fehler bei Quest 5 nicht separat auf, weil dort (Bug 1) bereits die Prüfung selbst kaputt war.

**Fix:** Alle vier Stellen auf `q2Shortcuts[q2Index]` bzw. `q3Shortcuts[q3Index]` umgestellt ([tk/A1.html:687](A1.html#L687), [703](A1.html#L703), [841](A1.html#L841), [857](A1.html#L857)) — Anzeige, Tipp und Erfolgs-Highlight zeigen jetzt konsistent dasselbe Kürzel wie die gerade gestellte Frage.

---

## ✅ Bug 4 (behoben): Doppelte Funktionsdefinition `handleQ3Wrong()` in A1.html (toter Code, gleiche Fehlerklasse wie im hw-Ordner)

**Fundstellen:** [tk/A1.html:860-874](A1.html#L860-L874) und [tk/A1.html:876-889](A1.html#L876-L889)

`handleQ3Wrong()` war zweimal definiert. JavaScript verwendet nur die zweite (spätere) Definition — die erste war toter Code. Aktuell harmlos, weil die *gewinnende* zweite Version sich korrekt verhält (bleibt auf der Karte, kein Indexsprung). Bemerkenswert war aber, dass die **verworfene erste Version** einen echten Bug enthielt: sie erhöhte bei einer falschen Antwort `q3Index` und rief `updateQ3Card()` auf — wäre also bei falscher Antwort trotzdem zur nächsten Karte gesprungen. Das ist exakt das Muster ("Funktion versehentlich zweimal definiert, zweite überschreibt die erste unbemerkt"), das im hw-Ordner bereits mehrfach gefunden wurde (siehe `hw/ANALYZE.md`).

**Fix:** Erste (tote) Definition entfernt, nur die korrekte zweite Version bleibt bestehen (jetzt zusätzlich mit `q3Locked`-Absicherung aus Bug 2).

---

## ✅ Bug 5 (behoben): `playSound('hint')` gab nie einen Ton aus

**Fundstellen:** Aufrufe in [tk/A1.html:677](A1.html#L677), [827](A1.html#L827), [tk/A2.html:780](A2.html#L780), [936](A2.html#L936) — Definition in [tk/xp.js:84-108](xp.js#L84-L108)

`playSound()` in `xp.js` kannte nur `if (type === 'correct')` und `else if (type === 'wrong')`. Für `type === 'hint'` (beim Tipp-Kauf) traf keiner der beiden Zweige zu — es wurde zwar ein `AudioContext` + Oszillator erzeugt, aber nie `osc.start()` aufgerufen, sodass kein Ton erklang. Kein Absturz (alles in `try/catch` gekapselt), aber der beim Tipp-Kauf offensichtlich beabsichtigte Sound-Effekt fehlte komplett, und es wurde bei jedem Tipp-Kauf unnötig ein `AudioContext` angelegt und nie wieder geschlossen.

**Fix:** Dritten Zweig `else if (type === 'hint')` in [tk/xp.js:106-111](xp.js#L106-L111) ergänzt (kurzer, dezenter Ton auf G4) — spielt jetzt bei jedem Tipp-Kauf in A1 (Q2/Q3) und A2 (Q5/Q6).

---

## ✅ Bug 6 (kosmetisch, behoben): Doppelte `DOMContentLoaded`-Sperrprüfung in A3.html

**Fundstellen:** [tk/A3.html:323-336](A3.html#L323-L336) und [tk/A3.html:379-392](A3.html#L379-L392)

Zwei fast identische `DOMContentLoaded`-Listener prüften beide `isQuestUnlocked('q7')` und setzten `display` auf `#a3-lock-screen`/`#a3-content-wrap`. Der zweite (später registrierte) gewann für `#a3-content-wrap` mit `display: 'flex'` + `flexDirection: 'column'`, der erste hatte `display: 'block'` gesetzt — optisch kein Unterschied (Flex-Column stapelt Kinder ähnlich wie Block), aber redundanter/toter Code, wahrscheinlich beim Hinzufügen des Timer-Features ([Git: "A3 timer"](A3.html)) versehentlich stehengelassen statt den alten Block zu entfernen.

**Fix:** Beide Listener zu einem zusammengeführt ([tk/A3.html:323-341](A3.html#L323-L341)) — behält die vollständigere `flex`/`column`-Variante inkl. Docx-Base64-Href-Zuweisung.

---

## Kleinere Beobachtungen (behoben bzw. kein Fix nötig)

- ✅ `let q5HiddenKey = 'key2';` (A2.html:538) war deklariert, aber nie gelesen — entfernt (toter Code).
- `tk/index.html` hat kein automatisches "erledigt"-Häkchen pro Modul wie `hw/index.html` (nur die globale XP-Zahl) — kein Bug, nur ein Funktionsunterschied zwischen den beiden Bereichen. Nicht verändert.

---

## Zusammenfassung

| # | Datei | Schweregrad | Kurzbeschreibung | Status |
|---|---|---|---|---|
| 1 | A2.html | 🔴 Kritisch | Quest 5: Eingabe-Prüfung nutzte falsches (ungemischtes) Array → Quest kaum lösbar | ✅ behoben |
| 2 | A1.html + A2.html | 🔴 Wichtig | Kein Schutz vor Tasten-Autorepeat → XP/Fortschritt bei gehaltener Taste vervielfachbar | ✅ behoben |
| 3 | A1.html | 🟠 Mittel | Q2/Q3: "Richtig"-Anzeige & Tipp zeigten falsches Kürzel (Wertung selbst war korrekt) | ✅ behoben |
| 4 | A1.html | 🟡 Klein | `handleQ3Wrong()` doppelt definiert (toter Code) | ✅ behoben |
| 5 | A1.html + A2.html | 🟡 Klein | `playSound('hint')` gab nie einen Ton aus | ✅ behoben |
| 6 | A3.html | 🟢 Kosmetisch | Doppelte `DOMContentLoaded`-Sperrprüfung | ✅ behoben |

**Alle 6 Bugs wurden behoben.** Verifikation: `node --check` auf allen Inline-Scripts (A1/A2/A3/index.html + xp.js) fehlerfrei; Headless-Chrome-Ladetest aller fünf Seiten ohne Konsolenfehler/-warnungen. Kein manueller Klick-Test im echten Browser durchgeführt — bei Gelegenheit empfehlenswert, insbesondere Quest 5 (Bug 1) einmal live durchzuspielen.
