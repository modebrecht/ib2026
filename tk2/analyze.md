# TK2 Analyze Worksheet — 2026-08-21

## Heute geprüft / korrigiert

| Bereich | Prüfung | Ergebnis / Korrektur |
|---|---|---|
| A1 Animationen | Shortcut-Semantik | korrigierte Semantik übernommen |
| A2 Navigation | Weiter zu A3 | Link korrigiert |
| A1–A6 Mobile | Header / Abstände | Mobile Header und Worksheet-Spacing verbessert |
| Kurszugang | A1–A6 | alle Kursbereiche bewusst offen |
| A2 Fluganimation | Sonderzeichen → Kontext | Zielpunkt korrigiert; Symbol landet im Ziel |
| A1/A2 Tastendruck | Modifier + zweite Taste | beide sichtbar zusammen gehalten; aktuell 1000 ms über `courseAccess.js` |
| A2 Timing intern | AltGr-Scene | nativer Chord-Hold weiterhin 500 ms; sichtbarer Hold wird auf 1000 ms verlängert |
| A1 fliegender Text | Ctrl+C / Ctrl+X | alle Textflüge geprüft; Ziel in Zwischenablage korrigiert |
| A1 Statusbox | grüne Rückmeldung | statisch und zentriert über Zwischenablage; Breite für langen Text angepasst |
| A1 Zwischenablage | fachliche Relevanz | nur bei Ctrl+C, Ctrl+X, Ctrl+V, Ctrl+Shift+V sichtbar; bei Z/Y/S/A entfernt |
| A2 fliegender Inhalt | alle AltGr-Beispiele | nur Sonderzeichen fliegen; Ziel geprüft |
| A1–A6 Header | Navigation oben links | vereinheitlicht auf `← Zurück zur Übersicht` → `index.html` |

## QA-Hinweise

- A1: kein weiterer fehlerhafter Textflug gefunden.
- Clipboard-Regel geprüft: nur Copy/Cut/Paste/Paste ohne Formatierung.
- A1–A6 Header nach Änderung direkt auf `dev` gegengeprüft.
- Browser-Download-Smoke-Test für alle PDFs wurde heute nicht vollständig per Klick verifiziert; frühere HTTP-Checks waren erfolgreich.

## Branch-Stand nach Worksheet

- `dev`: enthält alle obigen Änderungen + diesen QA-Log.
- `render` / `main`: aktuell noch ohne die letzte Header-Vereinheitlichung und dieses Worksheet.
