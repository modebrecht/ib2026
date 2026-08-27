from pathlib import Path

p=Path('tk2/a4Scenes.js')
s=p.read_text(encoding='utf-8')

# Only enrich the Windows markup used by A5. Keep A4 browser/doc markup untouched.
wm_start=s.index('    function windowsMarkup()')
wm_end=s.index('\n\n    var main=',wm_start)
wm=s[wm_start:wm_end]

# Taskbar affordances for Explorer launch + active app close feedback.
old='<circle cx="205" cy="262" r="10" fill="#2563eb"/>'
new='<circle cx="205" cy="262" r="10" fill="#2563eb"/><rect class="active-app-dot" x="197" y="276" width="16" height="2.5" rx="1.25" fill="#93c5fd" opacity="0"/><g class="taskbar-explorer"><rect x="235" y="252" width="25" height="20" rx="5" fill="#1e293b" stroke="#64748b"/><path d="M240 259h7l3-3h5v11h-15z" fill="#fbbf24"/></g><rect class="explorer-active-dot" x="240" y="276" width="15" height="2.5" rx="1.25" fill="#60a5fa" opacity="0"/>'
assert old in wm, 'taskbar anchor not found'
wm=wm.replace(old,new,1)

# Group desktop icons so the revealed desktop can visibly settle after Win+D.
old='<rect x="58" y="62" width="34" height="28" rx="5" fill="#f8fafc" opacity=".9"/><text x="75" y="104" text-anchor="middle" font-family="Arial" font-size="8" fill="#fff">Dateien</text><rect x="58" y="126" width="34" height="28" rx="5" fill="#f8fafc" opacity=".9"/><text x="75" y="168" text-anchor="middle" font-family="Arial" font-size="8" fill="#fff">Browser</text>'
new='<g class="desktop-icons"><rect x="58" y="62" width="34" height="28" rx="5" fill="#f8fafc" opacity=".9"/><text x="75" y="104" text-anchor="middle" font-family="Arial" font-size="8" fill="#fff">Dateien</text><rect x="58" y="126" width="34" height="28" rx="5" fill="#f8fafc" opacity=".9"/><text x="75" y="168" text-anchor="middle" font-family="Arial" font-size="8" fill="#fff">Browser</text></g>'
assert old in wm, 'desktop icons not found'
wm=wm.replace(old,new,1)

# Win+D gets a second visible window so "all windows" minimising is immediately readable.
old='<g class="app-windows"><g class="app-one">'
new='<g class="app-windows"><g class="desktop-extra-window" opacity="0" transform="translate(-30 24) scale(.88)"><rect x="118" y="55" width="220" height="154" rx="12" fill="#e0f2fe"/><rect x="118" y="55" width="220" height="27" rx="12" fill="#bae6fd"/><rect x="118" y="69" width="220" height="13" fill="#bae6fd"/><text x="136" y="73" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Browser</text><rect x="140" y="103" width="158" height="10" rx="5" fill="#0ea5e9" opacity=".65"/><rect x="140" y="130" width="170" height="7" rx="3.5" fill="#94a3b8"/></g><g class="app-one">'
assert old in wm, 'app windows opening not found'
wm=wm.replace(old,new,1)

# Active-window micro states used by Task Manager and Alt+F4.
old='<text x="136" y="73" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Dokument</text><rect x="140" y="103" width="130" height="10" rx="5" fill="#334155"/>'
new='<text x="136" y="73" font-family="Arial" font-size="9" font-weight="700" fill="#475569">Dokument</text><g class="close-affordance" opacity="0"><circle cx="323" cy="68" r="8" fill="#ef4444"/><path d="M319 64l8 8M327 64l-8 8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g><g class="hung-badge" opacity="0"><rect x="224" y="91" width="101" height="20" rx="10" fill="#fee2e2" stroke="#ef4444"/><text x="274.5" y="104" text-anchor="middle" font-family="Arial" font-size="7.8" font-weight="800" fill="#991b1b">Keine Rückmeldung</text></g><rect x="140" y="103" width="130" height="10" rx="5" fill="#334155"/>'
assert old in wm, 'active app title not found'
wm=wm.replace(old,new,1)

# Lock screen: real destination state with clock/date and staged details.
old='<g class="scene-lock" opacity="0"><rect x="28" y="25" width="365" height="255" rx="17" fill="#082f49"/><circle cx="210" cy="100" r="36" fill="#cbd5e1" opacity=".9"/><circle cx="210" cy="90" r="13" fill="#64748b"/><path d="M184 126Q210 101 236 126" fill="#64748b"/><text x="210" y="166" text-anchor="middle" font-family="Arial" font-size="20" font-weight="800" fill="#fff">Gesperrt</text></g>'
new='<g class="scene-lock" opacity="0"><rect x="28" y="25" width="365" height="255" rx="17" fill="#082f49"/><circle cx="310" cy="76" r="74" fill="#38bdf8" opacity=".12"/><g class="lock-details" opacity="0"><text x="210" y="91" text-anchor="middle" font-family="Arial" font-size="34" font-weight="300" fill="#fff">10:42</text><text x="210" y="112" text-anchor="middle" font-family="Arial" font-size="9" fill="#bae6fd">Donnerstag · 27. August</text><circle cx="210" cy="154" r="22" fill="#cbd5e1" opacity=".9"/><circle cx="210" cy="147" r="8" fill="#64748b"/><path d="M194 171Q210 157 226 171" fill="#64748b"/><text x="210" y="198" text-anchor="middle" font-family="Arial" font-size="12" font-weight="800" fill="#fff">Computer gesperrt</text></g></g>'
assert old in wm, 'lock markup not found'
wm=wm.replace(old,new,1)

# Task Manager: explicitly identify the non-responsive process.
old='<g class="task-manager" opacity="0"><rect x="79" y="44" width="282" height="184" rx="14" fill="#f8fafc"/><rect x="79" y="44" width="282" height="32" rx="14" fill="#dbe4ee"/><text x="101" y="65" font-family="Arial" font-size="10" font-weight="700" fill="#475569">Task-Manager</text><text x="103" y="98" font-family="Arial" font-size="9" font-weight="700" fill="#64748b">Prozesse</text><text x="103" y="126" font-family="Arial" font-size="9" fill="#334155">Browser</text><text x="103" y="151" font-family="Arial" font-size="9" fill="#334155">Word</text><rect x="192" y="118" width="112" height="10" rx="5" fill="#cbd5e1"/><rect x="192" y="143" width="72" height="10" rx="5" fill="#cbd5e1"/></g>'
new='<g class="task-manager" opacity="0"><rect x="79" y="44" width="282" height="184" rx="14" fill="#f8fafc"/><rect x="79" y="44" width="282" height="32" rx="14" fill="#dbe4ee"/><text x="101" y="65" font-family="Arial" font-size="10" font-weight="700" fill="#475569">Task-Manager</text><text x="103" y="98" font-family="Arial" font-size="9" font-weight="700" fill="#64748b">Prozesse</text><text x="103" y="126" font-family="Arial" font-size="9" fill="#334155">Browser</text><rect x="192" y="118" width="112" height="10" rx="5" fill="#cbd5e1"/><g class="tm-problem-row" opacity="0"><rect x="94" y="135" width="246" height="29" rx="7" fill="#fee2e2" stroke="#fecaca"/><text x="103" y="153" font-family="Arial" font-size="9" font-weight="700" fill="#991b1b">Word · Keine Rückmeldung</text><rect x="261" y="144" width="66" height="10" rx="5" fill="#f87171" opacity=".72"/></g></g>'
assert old in wm, 'task manager markup not found'
wm=wm.replace(old,new,1)

# Clipboard: the panel rises from the taskbar and entries appear one after another.
old='<g class="clipboard-panel" opacity="0"><rect x="118" y="44" width="220" height="184" rx="15" fill="#f8fafc"/><text x="139" y="70" font-family="Arial" font-size="11" font-weight="800" fill="#334155">Zwischenablage</text><g fill="#e2e8f0"><rect x="137" y="88" width="182" height="34" rx="8"/><rect x="137" y="132" width="182" height="34" rx="8"/><rect x="137" y="176" width="182" height="34" rx="8"/></g><text x="149" y="109" font-family="Arial" font-size="9" fill="#475569">Projektgruppe B25</text><text x="149" y="153" font-family="Arial" font-size="9" fill="#475569">https://schule.example</text><text x="149" y="197" font-family="Arial" font-size="9" fill="#475569">Montag 08:10</text></g>'
new='<g class="clipboard-panel" opacity="0"><rect x="118" y="44" width="220" height="184" rx="15" fill="#f8fafc"/><text x="139" y="70" font-family="Arial" font-size="11" font-weight="800" fill="#334155">Zwischenablage</text><g class="clip-item clip-item-1" opacity="0"><rect x="137" y="88" width="182" height="34" rx="8" fill="#e2e8f0"/><text x="149" y="109" font-family="Arial" font-size="9" fill="#475569">Projektgruppe B25</text></g><g class="clip-item clip-item-2" opacity="0"><rect x="137" y="132" width="182" height="34" rx="8" fill="#e2e8f0"/><text x="149" y="153" font-family="Arial" font-size="9" fill="#475569">https://schule.example</text></g><g class="clip-item clip-item-3" opacity="0"><rect x="137" y="176" width="182" height="34" rx="8" fill="#e2e8f0"/><text x="149" y="197" font-family="Arial" font-size="9" fill="#475569">Montag 08:10</text></g></g>'
assert old in wm, 'clipboard markup not found'
wm=wm.replace(old,new,1)

s=s[:wm_start]+wm+s[wm_end:]

# Reset only new Windows-specific micro states. Do not touch the keycap controller.
old="      opacity($('.scene-lock'),0);opacity($('.app-windows'),1);opacity($('.explorer-window'),0);opacity($('.snip-overlay'),0);"
new="      opacity($('.scene-lock'),0);opacity($('.lock-details'),0);opacity($('.app-windows'),1);opacity($('.desktop-extra-window'),mode==='desktop'?.74:0);opacity($('.explorer-window'),0);opacity($('.explorer-active-dot'),0);opacity($('.active-app-dot'),mode==='closeWindow'?1:0);opacity($('.close-affordance'),mode==='closeWindow'?1:0);opacity($('.hung-badge'),0);opacity($('.tm-problem-row'),0);opacity($('.snip-overlay'),0);if($('.desktop-icons')){opacity($('.desktop-icons'),1);$('.desktop-icons').setAttribute('transform','translate(0 0) scale(1)');}$$('.clip-item').forEach(function(el){opacity(el,0);el.setAttribute('transform','translate(0 8)');});"
assert old in s, 'Windows reset marker not found'
s=s.replace(old,new,1)

old="      [$('.new-doc-sheet'),$('.new-doc-caret'),$('.doc-dim'),$('.tab-one'),$('.tab-new'),$('.tab-two'),$('.tab-three'),$('.tab-plus'),$('.active-tab-indicator'),$('.tabs'),$('.refresh-ring'),$('.address-highlight'),$('.address-box'),$('.page-content'),$('.page-content-alt'),$('.switcher'),$('.snip-overlay'),$('.app-windows'),$('.scene-lock'),$('.explorer-window'),$('.task-manager'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')].forEach(function(el){if(el)trans(el,'none');});"
new="      [$('.new-doc-sheet'),$('.new-doc-caret'),$('.doc-dim'),$('.tab-one'),$('.tab-new'),$('.tab-two'),$('.tab-three'),$('.tab-plus'),$('.active-tab-indicator'),$('.tabs'),$('.refresh-ring'),$('.address-highlight'),$('.address-box'),$('.page-content'),$('.page-content-alt'),$('.switcher'),$('.snip-overlay'),$('.app-windows'),$('.scene-lock'),$('.lock-details'),$('.desktop-icons'),$('.taskbar-explorer'),$('.explorer-active-dot'),$('.active-app-dot'),$('.close-affordance'),$('.hung-badge'),$('.task-manager'),$('.tm-problem-row'),$('.clipboard-panel'),$('.snap-left-window'),$('.snap-right-window')].forEach(function(el){if(el)trans(el,'none');});$$('.clip-item').forEach(function(el){trans(el,'none');});"
assert old in s, 'transition reset list not found'
s=s.replace(old,new,1)

# Reduced-motion end states remain complete/readable.
s=s.replace("else if(mode==='lock'){opacity($('.scene-lock'),1);toast('Computer gesperrt');}","else if(mode==='lock'){opacity($('.scene-lock'),1);opacity($('.lock-details'),1);toast('Computer gesperrt');}",1)
s=s.replace("else if(mode==='explorer'){opacity($('.explorer-window'),1);toast('Explorer geöffnet');}","else if(mode==='explorer'){opacity($('.explorer-window'),1);opacity($('.explorer-active-dot'),1);toast('Explorer geöffnet');}",1)
s=s.replace("else if(mode==='taskManager'){opacity($('.task-manager'),1);toast('Task-Manager geöffnet');}","else if(mode==='taskManager'){opacity($('.task-manager'),1);opacity($('.hung-badge'),1);opacity($('.tm-problem-row'),1);toast('Task-Manager geöffnet');}",1)
s=s.replace("else if(mode==='clipboard'){opacity($('.clipboard-panel'),1);toast('Verlauf geöffnet');}","else if(mode==='clipboard'){opacity($('.clipboard-panel'),1);$$('.clip-item').forEach(function(el){opacity(el,1);el.setAttribute('transform','translate(0 0)');});toast('Verlauf geöffnet');}",1)
s=s.replace("else if(mode==='closeWindow'){opacity($('.app-windows'),0);toast('Fenster geschlossen');}","else if(mode==='closeWindow'){opacity($('.app-windows'),0);opacity($('.active-app-dot'),0);opacity($('.close-affordance'),0);toast('Fenster geschlossen');}",1)

# Premium 1/2 choreography: six highest-value Windows scenes.
old="if(mode==='desktop'){later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 620ms cubic-bezier(.2,.8,.2,1),opacity 520ms ease');w.setAttribute('transform','translate(0 118) scale(.72)');opacity(w,0);});later(actionAt+680,function(){toast('Desktop sichtbar');});return;}"
new="if(mode==='desktop'){later(actionAt-150,function(){var icons=$('.desktop-icons');trans(icons,'transform 420ms ease,opacity 320ms ease');icons.setAttribute('transform','translate(0 7) scale(.985)');opacity(icons,.68);});later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 680ms cubic-bezier(.2,.8,.2,1),opacity 540ms ease');w.setAttribute('transform','translate(0 124) scale(.64)');opacity(w,0);});later(actionAt+500,function(){var icons=$('.desktop-icons');trans(icons,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');icons.setAttribute('transform','translate(0 0) scale(1)');opacity(icons,1);});later(actionAt+760,function(){toast('Desktop sichtbar');});return;}"
assert old in s, 'desktop choreography not found'
s=s.replace(old,new,1)

old="if(mode==='lock'){later(actionAt,function(){var lock=$('.scene-lock');trans(lock,'opacity 520ms ease');opacity(lock,1);});later(actionAt+560,function(){toast('Computer gesperrt');});return;}"
new="if(mode==='lock'){later(actionAt-170,function(){var w=$('.app-windows');trans(w,'transform 360ms ease,opacity 320ms ease');w.setAttribute('transform','translate(0 5) scale(.985)');opacity(w,.28);});later(actionAt,function(){var lock=$('.scene-lock'),details=$('.lock-details');lock.setAttribute('transform','translate(0 10) scale(1.018)');trans(lock,'transform 620ms cubic-bezier(.2,.8,.2,1),opacity 480ms ease');opacity(lock,1);later(30,function(){lock.setAttribute('transform','translate(0 0) scale(1)');});later(260,function(){trans(details,'transform 460ms cubic-bezier(.2,.8,.2,1),opacity 360ms ease');details.setAttribute('transform','translate(0 8)');opacity(details,1);later(30,function(){details.setAttribute('transform','translate(0 0)');});});});later(actionAt+760,function(){toast('Computer gesperrt');});return;}"
assert old in s, 'lock choreography not found'
s=s.replace(old,new,1)

old="if(mode==='explorer'){later(actionAt,function(){var panel=$('.explorer-window');panel.setAttribute('transform','translate(0 18) scale(.96)');trans(panel,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Explorer geöffnet');});return;}"
new="if(mode==='explorer'){later(actionAt-120,function(){var icon=$('.taskbar-explorer'),dot=$('.explorer-active-dot');trans(icon,'transform 260ms ease');icon.setAttribute('transform','translate(-2 -2) scale(1.12)');opacity(dot,1);later(260,function(){icon.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt,function(){var panel=$('.explorer-window');panel.setAttribute('transform','translate(215 182) scale(.20)');trans(panel,'transform 680ms cubic-bezier(.16,.84,.22,1),opacity 440ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+740,function(){toast('Explorer geöffnet');});return;}"
assert old in s, 'explorer choreography not found'
s=s.replace(old,new,1)

old="if(mode==='taskManager'){later(actionAt,function(){var panel=$('.task-manager');panel.setAttribute('transform','translate(0 18) scale(.96)');trans(panel,'transform 560ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+620,function(){toast('Task-Manager geöffnet');});return;}"
new="if(mode==='taskManager'){later(actionAt-260,function(){var badge=$('.hung-badge');badge.setAttribute('transform','scale(.94)');trans(badge,'transform 320ms cubic-bezier(.2,.8,.2,1),opacity 260ms ease');opacity(badge,1);later(30,function(){badge.setAttribute('transform','scale(1)');});});later(actionAt,function(){var panel=$('.task-manager');panel.setAttribute('transform','translate(0 20) scale(.95)');trans(panel,'transform 600ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+520,function(){var row=$('.tm-problem-row');trans(row,'opacity 360ms ease');opacity(row,1);});later(actionAt+820,function(){toast('Task-Manager geöffnet');});return;}"
assert old in s, 'task manager choreography not found'
s=s.replace(old,new,1)

old="if(mode==='clipboard'){later(actionAt,function(){var panel=$('.clipboard-panel');panel.setAttribute('transform','translate(16 0) scale(.97)');trans(panel,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});later(actionAt+580,function(){toast('Verlauf geöffnet');});return;}"
new="if(mode==='clipboard'){later(actionAt,function(){var panel=$('.clipboard-panel');panel.setAttribute('transform','translate(0 82) scale(.96)');trans(panel,'transform 620ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');opacity(panel,1);later(30,function(){panel.setAttribute('transform','translate(0 0) scale(1)');});});$$('.clip-item').forEach(function(item,index){later(actionAt+360+index*130,function(){trans(item,'transform 360ms cubic-bezier(.2,.8,.2,1),opacity 300ms ease');opacity(item,1);item.setAttribute('transform','translate(0 0)');});});later(actionAt+860,function(){toast('Verlauf geöffnet');});return;}"
assert old in s, 'clipboard choreography not found'
s=s.replace(old,new,1)

old="if(mode==='closeWindow'){later(actionAt,function(){var w=$('.app-windows');trans(w,'transform 520ms cubic-bezier(.2,.8,.2,1),opacity 420ms ease');w.setAttribute('transform','translate(0 -12) scale(.92)');opacity(w,0);});later(actionAt+580,function(){toast('Fenster geschlossen');});return;}"
new="if(mode==='closeWindow'){later(actionAt-180,function(){var close=$('.close-affordance');trans(close,'transform 260ms ease,opacity 220ms ease');close.setAttribute('transform','scale(1.22)');later(220,function(){close.setAttribute('transform','scale(1)');});});later(actionAt,function(){var w=$('.app-windows'),dot=$('.active-app-dot');trans(w,'transform 680ms cubic-bezier(.2,.8,.2,1),opacity 500ms ease');w.setAttribute('transform','translate(72 154) scale(.30)');opacity(w,0);later(380,function(){trans(dot,'opacity 260ms ease');opacity(dot,0);});});later(actionAt+760,function(){opacity($('.close-affordance'),0);toast('Fenster geschlossen');});return;}"
assert old in s, 'close window choreography not found'
s=s.replace(old,new,1)

# Hard safety: shared key choreography is still called, not replaced locally.
checks=[
    'class="desktop-extra-window"',
    'class="lock-details"',
    'class="hung-badge"',
    'class="tm-problem-row"',
    'class="clip-item clip-item-1"',
    'class="explorer-active-dot"',
    "translate(0 124) scale(.64)",
    "translate(215 182) scale(.20)",
    "translate(0 82) scale(.96)",
    "translate(72 154) scale(.30)",
    "window.tk2SceneKeycaps.pressSequence"
]
for c in checks:
    assert c in s,c

p.write_text(s,encoding='utf-8')
print('A5 premium pass 1/2 applied; key choreography untouched')
