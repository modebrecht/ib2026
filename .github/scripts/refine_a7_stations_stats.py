from pathlib import Path

p=Path('tk2/A7.html')
s=p.read_text(encoding='utf-8')
idx=Path('tk2/index.html')
i=idx.read_text(encoding='utf-8')

def rep(text,old,new,label):
    assert old in text, f'missing {label}'
    return text.replace(old,new,1)

# Nav: add compact statistics tab before evidence/PDF tab.
s=rep(s,'<button class="header-nav-btn" data-view="memory"><span class="header-nav-ico">▦</span><span>Memory</span></button>\n          <button class="header-nav-btn" data-view="evidence"><span class="header-nav-ico">▤</span><span>Nachweis</span></button>',
'''<button class="header-nav-btn" data-view="memory"><span class="header-nav-ico">▦</span><span>Memory</span></button>\n          <button class="header-nav-btn" data-view="stats"><span class="header-nav-ico">▥</span><span>Statistik</span></button>\n          <button class="header-nav-btn" data-view="evidence"><span class="header-nav-ico">▤</span><span>Nachweis</span></button>''','nav')

# CSS for compact collected-data statistics.
css='''\n.station-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.station-card{border:1px solid var(--line);background:var(--panel);border-radius:20px;padding:18px;box-shadow:0 8px 24px rgba(24,39,75,.045)}.station-card.done{border-color:color-mix(in srgb,var(--green) 42%,var(--line))}.station-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:14px}.station-head h3{margin:0}.station-state{font-size:.76rem;font-weight:850;padding:5px 8px;border-radius:99px;background:var(--panel2);color:var(--muted)}.station-card.done .station-state{color:var(--green);background:color-mix(in srgb,var(--green) 10%,var(--panel))}.station-values{display:grid;grid-template-columns:1fr 1fr;gap:8px}.station-value{padding:11px;border-radius:13px;background:var(--panel2)}.station-value span{display:block;color:var(--muted);font-size:.72rem}.station-value strong{display:block;margin-top:3px;font-size:1.05rem}.stats-overall{margin-top:14px;padding:16px;border:1px solid var(--line);border-radius:18px;background:var(--panel);display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap}.stats-overall strong{font-size:1.35rem}.stats-overall span{color:var(--muted)}\n@media(max-width:820px){.station-grid{grid-template-columns:1fr}}\n'''
s=rep(s,'\n</style>\n</head>',css+'\n</style>\n</head>','css')

# Add a separate, compact statistics view.
stats_view='''\n      <section class="view" id="view-stats">\n        <div class="view-inner">\n          <div class="view-head"><div><span class="eyebrow">A7 · lokal gespeichert</span><h1>Statistik</h1><p>Das wurde beim Training bisher gesammelt.</p></div><span class="count-pill" id="statsStationCount">0 / 3 Stationen</span></div>\n          <div class="station-grid" id="stationStats"></div>\n          <div class="stats-overall"><div><span>Gesamtgenauigkeit aus Challenge + Fehlerjagd</span><br><strong id="statsOverallAccuracy">–</strong></div><div><span>Gesammelte Antworten / Entscheidungen</span><br><strong id="statsOverallAttempts">0</strong></div></div>\n        </div>\n      </section>\n\n'''
s=rep(s,'      <section class="view" id="view-evidence">',stats_view+'      <section class="view" id="view-evidence">','stats view')

# Evidence wording and initial status now require every station once.
s=s.replace('id="evidenceStatus">0 / 2 Runden','id="evidenceStatus">0 / 3 Stationen')
s=s.replace('<div class="evidence-note"><strong>PDF-Freigabe:</strong> Beende mindestens zwei Runden in Challenge oder Fehlerjagd. Die PDF wird danach freigeschaltet – unabhängig davon, ob du die Zielgenauigkeit von 70 % bereits erreicht hast.</div>',
'''<div class="evidence-note"><strong>PDF-Freigabe:</strong> Schliesse jede Station mindestens einmal vollständig ab: Challenge, Fehlerjagd und Memory. Danach wird die PDF freigeschaltet. Die Zielgenauigkeit von 70 % bleibt eine Rückmeldung und ist keine Sperre.</div>''')
s=s.replace('Noch 2 abgeschlossene Runden bis zur PDF.','Noch nicht alle drei Stationen abgeschlossen.')

# Replace old two-run criterion with station completion helpers.
s=rep(s,'const TRAINING_MIN_RUNS=2,TRAINING_TARGET=70;','const TRAINING_TARGET=70;','constant')
needle="function evidenceSummary(){let accuracyRuns=0,correct=0,wrong=0,memoryRuns=0;['challenge','hunt'].forEach(mode=>Object.values(trainingStats.modes[mode]||{}).forEach(b=>{accuracyRuns+=Number(b.completedRuns)||0;correct+=Number(b.correct)||0;wrong+=Number(b.wrong)||0}));Object.values(trainingStats.modes.memory||{}).forEach(b=>memoryRuns+=Number(b.completedRuns)||0);const attempts=correct+wrong;return{accuracyRuns,correct,wrong,attempts,accuracy:attempts?Math.round(correct/attempts*100):0,memoryRuns}}"
replacement=needle+"\nfunction stationRuns(mode){return Object.values(trainingStats.modes[mode]||{}).reduce((sum,b)=>sum+(Number(b.completedRuns)||0),0)}\nfunction stationSummary(){const challenge=stationRuns('challenge'),hunt=stationRuns('hunt'),memory=stationRuns('memory'),completed=[challenge,hunt,memory].filter(n=>n>0).length;return{challenge,hunt,memory,completed,ready:completed===3}}"
s=rep(s,needle,replacement,'station helper')

old="function syncA7Progress(){const s=evidenceSummary();localStorage.setItem(STORE.progress,JSON.stringify({schemaVersion:1,completed:s.accuracyRuns>=TRAINING_MIN_RUNS,completedRuns:s.accuracyRuns,accuracy:s.accuracy,target:TRAINING_TARGET,targetReached:s.attempts>0&&s.accuracy>=TRAINING_TARGET,pdfReady:s.accuracyRuns>=TRAINING_MIN_RUNS,updatedAt:new Date().toISOString()}))}"
new="function syncA7Progress(){const s=evidenceSummary(),stations=stationSummary();localStorage.setItem(STORE.progress,JSON.stringify({schemaVersion:2,completed:stations.ready,completedStations:stations.completed,stations:{challenge:stations.challenge,hunt:stations.hunt,memory:stations.memory},completedRuns:s.accuracyRuns+s.memoryRuns,accuracy:s.accuracy,target:TRAINING_TARGET,targetReached:s.attempts>0&&s.accuracy>=TRAINING_TARGET,pdfReady:stations.ready,updatedAt:new Date().toISOString()}))}"
s=rep(s,old,new,'progress criterion')

# Compact stats renderer.
anchor='function evidenceRowsData(){'
stats_fn='''function renderStats(){const s=evidenceSummary(),st=stationSummary(),host=$(\'#stationStats\');if(!host)return;const modes=[{id:'challenge',label:'Challenge',runs:st.challenge,b:trainingStats.modes.challenge},{id:'hunt',label:'Fehlerjagd',runs:st.hunt,b:trainingStats.modes.hunt},{id:'memory',label:'Memory',runs:st.memory,b:trainingStats.modes.memory}];host.innerHTML=modes.map(m=>{const buckets=Object.values(m.b||{}),correct=buckets.reduce((a,b)=>a+(Number(b.correct)||0),0),wrong=buckets.reduce((a,b)=>a+(Number(b.wrong)||0),0),attempts=correct+wrong,accuracy=attempts?Math.round(correct/attempts*100):null,moves=buckets.reduce((a,b)=>a+(Number(b.moves)||0),0),pairs=buckets.reduce((a,b)=>a+(Number(b.pairs)||0),0);return `<div class="station-card ${m.runs>0?'done':''}"><div class="station-head"><h3>${m.label}</h3><span class="station-state">${m.runs>0?'erledigt ✓':'noch offen'}</span></div><div class="station-values"><div class="station-value"><span>Runden</span><strong>${m.runs}</strong></div>${m.id==='memory'?`<div class="station-value"><span>Paare</span><strong>${pairs}</strong></div><div class="station-value"><span>Züge</span><strong>${moves}</strong></div><div class="station-value"><span>Genauigkeit</span><strong>separat</strong></div>`:`<div class="station-value"><span>Genauigkeit</span><strong>${accuracy===null?'–':accuracy+' %'}</strong></div><div class="station-value"><span>richtig</span><strong>${correct}</strong></div><div class="station-value"><span>falsch</span><strong>${wrong}</strong></div>`}</div></div>`}).join('');$('#statsStationCount').textContent=`${st.completed} / 3 Stationen`;$('#statsOverallAccuracy').textContent=s.attempts?`${s.accuracy} %`:'–';$('#statsOverallAttempts').textContent=s.attempts;}
'''
s=rep(s,anchor,stats_fn+anchor,'render stats')

# Rewrite evidence/PDF gating in a targeted way.
s=s.replace("function renderEvidence(){const s=evidenceSummary(),rows=evidenceRowsData().filter(r=>r.accuracyRuns||r.memoryRuns),host=$('#evidenceRows'),button=$('#downloadEvidencePdf');if(!host||!button)return;", "function renderEvidence(){const s=evidenceSummary(),stations=stationSummary(),rows=evidenceRowsData().filter(r=>r.accuracyRuns||r.memoryRuns),host=$('#evidenceRows'),button=$('#downloadEvidencePdf');if(!host||!button)return;")
s=s.replace("$('#evidenceStatus').textContent=s.accuracyRuns>=TRAINING_MIN_RUNS?'PDF bereit ✓':`${s.accuracyRuns} / ${TRAINING_MIN_RUNS} Runden`;", "$('#evidenceStatus').textContent=stations.ready?'PDF bereit ✓':`${stations.completed} / 3 Stationen`;")
s=s.replace("button.disabled=s.accuracyRuns<TRAINING_MIN_RUNS;const remaining=Math.max(0,TRAINING_MIN_RUNS-s.accuracyRuns);$('#evidenceHint').textContent=remaining?`Noch ${remaining} abgeschlossene Runde${remaining===1?'':'n'} bis zur PDF.`:`PDF freigeschaltet · aktuelle Genauigkeit ${s.accuracy} % · Ziel ${TRAINING_TARGET} %. `;", "button.disabled=!stations.ready;const missing=[stations.challenge?'':'Challenge',stations.hunt?'':'Fehlerjagd',stations.memory?'':'Memory'].filter(Boolean);$('#evidenceHint').textContent=missing.length?`Noch offen: ${missing.join(', ')}.`:`PDF freigeschaltet · aktuelle Genauigkeit ${s.accuracy} % · Ziel ${TRAINING_TARGET} %. `;")
s=s.replace("function downloadTrainingPdf(){const s=evidenceSummary();if(s.accuracyRuns<TRAINING_MIN_RUNS){alert('Beende zuerst mindestens zwei Runden in Challenge oder Fehlerjagd.');return}", "function downloadTrainingPdf(){const s=evidenceSummary(),stations=stationSummary();if(!stations.ready){alert('Schliesse zuerst Challenge, Fehlerjagd und Memory jeweils mindestens einmal vollständig ab.');return}")
s=s.replace("ctx.fillText(`${s.accuracyRuns} Runden · ${s.accuracy} % Genauigkeit · Ziel ${TRAINING_TARGET} %`,600,315);", "ctx.fillText(`3/3 Stationen · ${s.accuracy} % Genauigkeit · Ziel ${TRAINING_TARGET} %`,600,315);")
s=s.replace("ctx.fillText('PDF-Freigabe nach mindestens 2 abgeschlossenen Challenge-/Fehlerjagd-Runden · '+new Date().toLocaleDateString('de-CH'),600,790);", "ctx.fillText('PDF-Freigabe nach je 1 vollständigen Runde: Challenge · Fehlerjagd · Memory · '+new Date().toLocaleDateString('de-CH'),600,790);")

# Ensure stats refreshes whenever data changes and when tab is opened.
s=s.replace("if($('#evidenceRows'))renderEvidence()", "if($('#evidenceRows'))renderEvidence();if($('#stationStats'))renderStats()")
s=s.replace("const titles={home:'Shortcut Lab',learn:'Alle Tastenkürzel',train:'Challenge',hunt:'Fehlerjagd',memory:'Memory',evidence:'Trainingsnachweis',favorites:'Favoriten'};", "const titles={home:'Shortcut Lab',learn:'Alle Tastenkürzel',train:'Challenge',hunt:'Fehlerjagd',memory:'Memory',stats:'Statistik',evidence:'Trainingsnachweis',favorites:'Favoriten'};")
s=s.replace("if(name==='favorites')renderFavorites();if(name==='evidence')renderEvidence();", "if(name==='favorites')renderFavorites();if(name==='stats')renderStats();if(name==='evidence')renderEvidence();")
s=s.replace("renderFavorites();updateFavoriteUI();renderEvidence();$('#best').textContent", "renderFavorites();updateFavoriteUI();renderStats();renderEvidence();$('#best').textContent")

# Index wording.
i=i.replace('<span class="module-meta">PDF ab 2 Runden · Ziel 70 %</span>','<span class="module-meta">jede Station 1× · Ziel 70 %</span>')
i=i.replace('In A7 trainierst du frei und erzeugst nach mindestens zwei abgeschlossenen Runden deinen Trainingsnachweis.','In A7 spielst du Challenge, Fehlerjagd und Memory je mindestens einmal vollständig und erzeugst danach deinen Trainingsnachweis.')

p.write_text(s,encoding='utf-8')
idx.write_text(i,encoding='utf-8')
print('A7 station completion + compact stats tab patched')
