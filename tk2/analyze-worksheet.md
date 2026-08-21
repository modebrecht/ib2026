# TK2 Analyze Worksheet — 2026-08-21

## Heute geprüft / korrigiert

| Bereich | Ergebnis |
|---|---|
| A1 Animationen | Shortcut-Semantik geprüft/korrigiert |
| A2 Navigation | Link zu A3 korrigiert |
| A1–A6 Mobile | Header/Abstände verbessert |
| Kurszugang | A1–A6 bewusst offen gehalten |
| A2 Fluganimation | Sonderzeichen-Ziel korrigiert |
| A1/A2 Tastendruck | Chord sichtbar 1000 ms gehalten |
| A1 Ctrl+C/X | fliegender Text landet korrekt in Zwischenablage |
| A1 Statusbox | statisch über Zwischenablage zentriert |
| A1 Clipboard | nur C/X/V/Shift+V; bei Z/Y/S/A entfernt |
| A1–A6 Header | einheitlich `← Zurück zur Übersicht` |
| Root B24/B25 Filter | Single-Ansicht zentriert, Breite wie 2er-Ansicht; Mobile 100 % |

## JS Cleanup / Unlock-Logik

| Datei | Status | Obsolet / Cleanup |
|---|---|---|
| `courseAccess.js` | **aktiv** | Unlock-Override, `openIndexCards()` und Lock-Screen-Hide sind Cleanup-Kandidaten. **Noch nicht löschen:** enthält aktuell auch den 1000-ms-Key-Hold. |
| `../tk/xp.js` | **aktiv / shared** | `isQuestUnlocked()` mit Prozent-Schwellen ist in `tk2` zur Laufzeit durch `courseAccess.js` überschrieben; für `tk2` damit faktisch redundant. Datei selbst nicht obsolet. |
| `a1-app.js` | **aktiv** | `checkQ2Unlock()` / `checkQ3Unlock()` und Lock-Zweige sind bei dauerhaft offenen Quests redundant. |
| `a2-app.js` | **aktiv** | A2/Q4-Startlock sowie `checkQ5()` / `checkQ6()` sind bei dauerhaft offenen Quests redundant. |
| `a3-app.js` | **aktiv** | Q7/A3-Unlock-Prüfung ist bei dauerhaft offenem A3 redundant. |
| `pdf.js` | **aktiv** | Lädt aktuell `courseAccess.js` + `pdf-base.js`. Nach Entfernung von `courseAccess.js` kann Wrapper vereinfacht/entfernt und `pdf-base.js` direkt geladen werden. |
| `utilityScenes.js` | **aktiv** | Nur Loader für Utility-Scenes; nicht Unlock-bezogen, aktuell nicht obsolet. |

**Aktuell komplett löschbare JS-Datei wegen Unlock: keine.**

Sauberer Zielzustand: Unlock-Checks nativ aus A1/A2/A3 + Index entfernen → 1000-ms-Timing in Scene-Dateien verschieben → `courseAccess.js` löschen → `pdf.js` vereinfachen.

## QA

- A1 Textflüge code-seitig geprüft; kein weiterer fehlerhafter Flug gefunden.
- A1–A6 Header nach Änderung auf `dev` gegengeprüft.
- Browser-Visual-/Download-Test nicht vollständig durchgeführt.
