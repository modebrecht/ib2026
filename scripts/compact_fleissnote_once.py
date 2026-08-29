from pathlib import Path


def replace_once(path, old, new, label):
    p = Path(path)
    text = p.read_text(encoding='utf-8')
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one match, found {count}')
    p.write_text(text.replace(old, new), encoding='utf-8')


replace_once(
    'index.html',
    '''              <div style="padding: 14px; background: var(--blue-soft); border: 1px solid rgba(37,99,235,.22); border-radius: 10px; color: var(--text); font-size: calc(13px * var(--font-scale)); line-height: 1.45;">
                <div style="font-weight: 800; color: var(--blue); margin-bottom: 8px;">So funktioniert die Fleissnote</div>
                <div><strong>1 P</strong> = Abgabe / Nachweis im OneDrive-Ordner <strong>IB</strong></div>
                <div><strong>+ bis 1 P</strong> für Vollständigkeit / Qualität der Bearbeitung</div>
                <div>Bei Prozentresultaten: <strong>bestes Resultat ÷ 100</strong> (z. B. 80 % = +0.80 P · 100 % = +1.00 P).</div>
                <div>Ohne Prozentwert gilt: <strong>vollständig erledigt = +1 P</strong>.</div>
                <div style="margin-top: 6px;"><strong>Unbegrenzt viele Versuche:</strong> Du darfst Aufgaben verbessern und erneut abgeben.</div>
                <div><strong>Nur das beste Resultat pro Aufgabe zählt</strong> für die Fleissnote.</div>
                <div style="margin-top: 6px; color: var(--muted);">Maximal 2 P pro A-Aufgabe · A1–A14 = maximal 28 P.</div>
              </div>''',
    '''              <div style="padding: 14px; background: var(--blue-soft); border: 1px solid rgba(37,99,235,.22); border-radius: 10px; color: var(--text); font-size: calc(13px * var(--font-scale)); line-height: 1.45;">
                <div style="font-weight: 800; color: var(--blue); margin-bottom: 8px;">So funktioniert die Fleissnote</div>
                <div><strong>1 P</strong> = Abgabe / Nachweis im OneDrive-Ordner <strong>IB</strong></div>
                <div>Bei <strong>100 % Genauigkeit</strong> gibt es einen vollen Zusatzpunkt. Sonst wird der Zusatzpunkt anteilig berechnet.</div>
                <div>Verbessern erlaubt – <strong>nur das beste Resultat zählt.</strong></div>
                <div style="margin-top: 6px; color: var(--muted);">Maximal 2 P pro A-Aufgabe · A1–A14 = maximal 28 P.</div>
              </div>''',
    'HW Fleissnote',
)

replace_once(
    'tk2/index.html',
    '''  <section class="fleiss-card" aria-label="Fleissnote">
    <div class="fleiss-card-head"><div><span class="fleiss-card-badge">Fleissnote</span><h2>Jede Quest zählt gleich viel</h2></div></div>
    <p>Für die Fleissnote zählt <strong>jede Quest einzeln</strong>. Die Abgabe zählt, sobald die zugehörige Datei oder der Nachweis in deinem OneDrive-Ordner <strong>IB</strong> liegt. Teile diesen Ordner einmal mit deiner Informatiklehrperson. Du darfst Quests unbegrenzt oft verbessern und erneut abgeben; <strong>nur dein bestes Resultat pro Quest zählt.</strong></p>
    <div class="fleiss-points"><span>Jede Quest = max. 2 Punkte</span><span>1 P = Abgabe im OneDrive-Ordner IB</span><span>+ bis 1 P = Vollständigkeit / Qualität</span><span>100 % = +1.00 P · 80 % = +0.80 P</span><span>Zusatzpunkt = bestes Resultat ÷ 100</span><span>Unbegrenzt viele Versuche</span><span>Q1–Q14 = max. 28 Punkte</span></div>
  </section>''',
    '''  <section class="fleiss-card" aria-label="Fleissnote">
    <div class="fleiss-card-head"><div><span class="fleiss-card-badge">Fleissnote</span><h2>Jede Quest zählt gleich viel</h2></div></div>
    <p><strong>1 P</strong> = Abgabe / Nachweis im OneDrive-Ordner <strong>IB</strong> (einmal mit der Lehrperson teilen). Bei <strong>100 % Genauigkeit</strong> gibt es einen vollen Zusatzpunkt. Sonst wird der Zusatzpunkt anteilig berechnet.</p>
    <div class="fleiss-points"><span>Verbessern erlaubt – bestes Resultat zählt</span><span>Max. 2 P pro Quest · Q1–Q14 = max. 28 P</span></div>
  </section>''',
    'TK2 Fleissnote',
)
