from pathlib import Path

specs = {
    'tk2/A4.html': {
        'accent':'#67e8f9',
        'title':'Programme & Browser',
        'desc':'Du lernst acht neue Tastenkombinationen in drei Gruppen. Wie in A1 und A2 zeigt jede Karte zuerst die Ausgangssituation, dann den Tastendruck und danach die sichtbare Wirkung.',
        'quest':'Quest 8',
    },
    'tk2/A5.html': {
        'accent':'#93c5fd',
        'title':'Windows & Arbeitsalltag',
        'desc':'Du lernst zwölf neue Tastenkombinationen in drei Gruppen. Wie in A1 bis A4 zeigt jede Karte die Ausgangssituation, den Tastendruck und danach die sichtbare Wirkung.',
        'quest':'Quest 9',
    },
}

for file, cfg in specs.items():
    p=Path(file)
    s=p.read_text(encoding='utf-8')

    old_css=(
        ".flow-strip{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}"
        ".flow-strip span{padding:6px 9px;border-radius:999px;background:rgba(148,163,184,.07);border:1px solid rgba(148,163,184,.13);font-size:.76rem;font-weight:800;color:#cbd5e1}"
        f".flow-strip b{{color:{cfg['accent']}}}"
    )
    new_css=(
        ".flow-strip{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:20px}"
        ".flow-step{display:inline-flex;align-items:center;gap:10px;min-height:54px;padding:10px 16px;border-radius:16px;background:rgba(148,163,184,.075);border:1px solid rgba(148,163,184,.18);font-size:.98rem;font-weight:800;color:#e2e8f0;line-height:1.15;white-space:nowrap}"
        ".flow-step b{display:grid;place-items:center;width:30px;height:30px;flex:0 0 30px;border-radius:999px;background:rgba(var(--stage-rgb,59,130,246),.14);color:var(--stage-accent,"+cfg['accent']+");font-family:'Space Grotesk',sans-serif;font-size:1rem}"
        ".flow-arrow{display:grid;place-items:center;width:38px;height:38px;flex:0 0 38px;padding:0!important;border-radius:999px;background:rgba(148,163,184,.055);border:1px solid rgba(148,163,184,.14);color:#94a3b8!important;font-size:1rem!important;font-weight:900!important}"
        ".flow-final{font-family:inherit;cursor:pointer;background:rgba(16,185,129,.09);border-color:rgba(16,185,129,.30);color:#d1fae5;transition:background .16s ease,border-color .16s ease,transform .16s ease}"
        ".flow-final b{background:rgba(16,185,129,.15);color:#6ee7b7}.flow-final:hover{background:rgba(16,185,129,.14);border-color:rgba(16,185,129,.48);transform:translateY(-1px)}"
    )
    assert old_css in s, f'{file}: old flow CSS not found'
    s=s.replace(old_css,new_css,1)

    old_html=(
        '    <div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap">\n'
        f'      <div><h1>{cfg["title"]}</h1><p>{cfg["desc"]}</p></div>\n'
        '      <button class="tk-btn-secondary" id="showSummaryBtn">📊 Auswertung</button>\n'
        '    </div>\n'
        f'    <div class="flow-strip"><span><b>1</b> Theorie</span><span>→</span><span><b>2</b> {cfg["quest"]}</span><span>→</span><span><b>3</b> 2. Durchgang</span></div>'
    )
    new_html=(
        f'    <div><h1>{cfg["title"]}</h1><p>{cfg["desc"]}</p></div>\n'
        '    <div class="flow-strip" aria-label="Arbeitsablauf">\n'
        '      <span class="flow-step"><b>1</b> Theorie</span>\n'
        '      <span class="flow-arrow" aria-hidden="true">→</span>\n'
        f'      <span class="flow-step"><b>2</b> {cfg["quest"]}</span>\n'
        '      <span class="flow-arrow" aria-hidden="true">→</span>\n'
        '      <span class="flow-step"><b>3</b> 2. Durchgang</span>\n'
        '      <span class="flow-arrow" aria-hidden="true">→</span>\n'
        '      <button type="button" class="flow-step flow-final" id="showSummaryBtn"><b>4</b> 📊 Auswertung</button>\n'
        '    </div>'
    )
    assert old_html in s, f'{file}: old intro/flow block not found'
    s=s.replace(old_html,new_html,1)

    mobile='@media(max-width:520px){.lesson-keys kbd{font-size:.7rem;padding:4px 7px}}'
    mobile_new='@media(max-width:520px){.lesson-keys kbd{font-size:.7rem;padding:4px 7px}.flow-strip{gap:8px}.flow-step{min-height:50px;padding:9px 12px;font-size:.9rem}.flow-step b{width:28px;height:28px;flex-basis:28px}.flow-arrow{width:32px;height:32px;flex-basis:32px}}'
    assert mobile in s, f'{file}: mobile marker not found'
    s=s.replace(mobile,mobile_new,1)

    assert s.count('id="showSummaryBtn"') == 1, f'{file}: summary button id count wrong'
    assert '<b>4</b> 📊 Auswertung' in s, f'{file}: final evaluation step missing'
    p.write_text(s,encoding='utf-8')
    print('patched', file)
