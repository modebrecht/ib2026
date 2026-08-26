# TK2 Analyze Worksheet — 2026-08-26

## Aktueller Entscheid

- **A1–A6 sind jederzeit frei anwählbar.**
- **A1 intern:** Q1 → Q2 → Q3 als Progression.
- **A2 intern:** Q4 → Q5 → Q6 als Progression.
- A3 ist keine Praxis-/Timer-Aufgabe mehr, sondern eine kurze Merkblatt-/Download-Station.

## Heute geprüft / korrigiert

| Bereich | Ergebnis |
|---|---|
| A1 Animationen | Shortcut-Semantik geprüft/korrigiert |
| A2 Navigation | Link zu A3 korrigiert |
| A1–A6 Mobile | Header/Abstände verbessert |
| Kurszugang | A1–A6 offen; interne Quest-Progression in A1/A2 bleibt erhalten |
| A2 Fluganimation | Sonderzeichen-Ziel korrigiert |
| A1/A2 Tastendruck | Chord sichtbar 1000 ms gehalten |
| A1 Ctrl+C/X | fliegender Text landet korrekt in Zwischenablage |
| A1 Statusbox | statisch über Zwischenablage zentriert |
| A1 Clipboard | nur C/X/V/Shift+V; bei Z/Y/S/A entfernt |
| A1–A6 Header | einheitlich `← Zurück zur Übersicht` |
| A3 | Pizza/Timer entfernt; Merkblatt-Download; alte A3-Abschlüsse werden migriert |
| A3 PDF | neues Merkblatt-Schema statt alter `first/second`-Zeiten |
| Root B24/B25 Filter | Single-Ansicht zentriert, Breite wie 2er-Ansicht; Mobile 100 % |

## JS Cleanup / Progress-Logik

| Datei | Status | Aufgabe |
|---|---|---|
| `courseAccess.js` | **aktiv / zentral** | 1000-ms-Key-Hold + offene A1–A6-Karten. Kein globaler Quest-Unlock mehr. |
| `../tk/xp.js` | **aktiv / shared** | XP, Scores und interne Quest-Freischaltung für A1/A2. |
| `a1-app.js` | **aktiv** | Q1 → Q2 → Q3. |
| `a2-app.js` | **aktiv** | Q4 → Q5 → Q6; A2 selbst bleibt offen. |
| `a3-app.js` | **aktiv** | Merkblatt-Download, Abschluss, XP-Einmalvergabe und Legacy-Migration. |
| `a3-docx.js` | **gelöscht** | Alte Pizza-DOCX-Datei nicht mehr benötigt. |
| `pdf.js` | **aktiv** | Lädt `courseAccess.js` + `pdf-base.js`. |
| `pdf-base.js` | **aktiv** | A3 wird als gesichertes Merkblatt exportiert. |
| `utilityScenes.js` | **aktiv** | Loader für Utility-Scenes; nicht obsolet. |

## A3 Legacy-Migration

Der LocalStorage-Key `tk_a3_progress_v1` bleibt absichtlich erhalten, damit bestehende Browserdaten nicht verloren gehen.

- Neues Schema: `downloaded`, `completed`, `completedAt`, `rewarded`.
- Ein alter abgeschlossener zweiter Pizza-Durchgang oder ein bestehendes `q7 = 100` wird als A3-Abschluss übernommen.
- Bei der Migration wird `rewarded = true` gesetzt, damit keine zusätzlichen 50 XP vergeben werden.
- Der PDF-Exporter erkennt sowohl das neue Schema als auch bestehende Legacy-Abschlüsse.

## Deployment / Branches

- `dev` = Entwicklung, kein Produktions-Deploy.
- `render` = OnRender/Staging (`ib2026.onrender.com`), **nicht Vercel**.
- `main` = Vercel/Production.
- Promotion bewusst: `dev → render → main`; kein automatisches Überspringen.

## QA

- A1–A6 müssen von der Übersicht jederzeit anklickbar bleiben.
- Q2/Q3 und Q5/Q6 müssen innerhalb ihrer Arbeitsblätter weiterhin von den vorherigen Quests abhängen.
- A3 darf keinerlei Voraussetzung aus A2 haben.
- A3 gilt nach Merkblatt-Download als abgeschlossen.
- Alte abgeschlossene A3-Spielstände dürfen nach dem Umbau nicht auf „offen“ zurückfallen und keine neuen XP erzeugen.
