(function(){
  'use strict';

  if (!/\/tk2\/A7\.html$/i.test(location.pathname)) return;

  var TRAINING_KEY = 'tk_a7_training_v1';
  var LABELS = {
    all: 'Alle Kategorien',
    general: 'Allgemein',
    programs: 'Word / Programme',
    browser: 'Browser & Tabs',
    windows: 'Windows & Fenster',
    altgr: 'Sonderzeichen mit AltGr',
    favorites: 'Favoriten'
  };
  var ORDER = ['all', 'general', 'programs', 'browser', 'windows', 'altgr', 'favorites'];
  var painting = false;

  function readTraining(){
    try {
      var data = JSON.parse(localStorage.getItem(TRAINING_KEY) || '{}');
      if (!data.modes) data.modes = {};
      return data;
    } catch (e) {
      return {modes:{}};
    }
  }

  function runsInBucket(bucket){
    return bucket ? Number(bucket.completedRuns) || 0 : 0;
  }

  function modeRuns(data, mode){
    return Object.values((data.modes && data.modes[mode]) || {}).reduce(function(sum, bucket){
      return sum + runsInBucket(bucket);
    }, 0);
  }

  function summary(data){
    var challenge = modeRuns(data, 'challenge');
    var hunt = modeRuns(data, 'hunt');
    var memory = modeRuns(data, 'memory');
    var completed = [challenge, hunt, memory].filter(function(n){ return n > 0; }).length;
    return {
      challenge: challenge,
      hunt: hunt,
      memory: memory,
      total: challenge + hunt + memory,
      completed: completed,
      ready: completed === 3
    };
  }

  function stationDetail(data, mode){
    var buckets = Object.values((data.modes && data.modes[mode]) || {});
    var runs = buckets.reduce(function(sum, b){ return sum + (Number(b.completedRuns) || 0); }, 0);
    var correct = buckets.reduce(function(sum, b){ return sum + (Number(b.correct) || 0); }, 0);
    var wrong = buckets.reduce(function(sum, b){ return sum + (Number(b.wrong) || 0); }, 0);
    var attempts = correct + wrong;
    var moves = buckets.reduce(function(sum, b){ return sum + (Number(b.moves) || 0); }, 0);
    var pairs = buckets.reduce(function(sum, b){ return sum + (Number(b.pairs) || 0); }, 0);
    return {
      runs: runs,
      correct: correct,
      wrong: wrong,
      attempts: attempts,
      accuracy: attempts ? Math.round(correct / attempts * 100) : null,
      moves: moves,
      pairs: pairs
    };
  }

  function statisticsData(data){
    var challenge = stationDetail(data, 'challenge');
    var hunt = stationDetail(data, 'hunt');
    var memory = stationDetail(data, 'memory');
    var overallCorrect = challenge.correct + hunt.correct;
    var overallWrong = challenge.wrong + hunt.wrong;
    var overallAttempts = overallCorrect + overallWrong;
    return {
      challenge: challenge,
      hunt: hunt,
      memory: memory,
      overallAttempts: overallAttempts,
      overallAccuracy: overallAttempts ? Math.round(overallCorrect / overallAttempts * 100) : null
    };
  }

  function rowData(data){
    var modes = ['challenge', 'hunt', 'memory'];
    var ids = new Set();
    modes.forEach(function(mode){
      Object.keys((data.modes && data.modes[mode]) || {}).forEach(function(id){ ids.add(id); });
    });

    var ordered = ORDER.filter(function(id){ return ids.has(id); });
    Array.from(ids).forEach(function(id){ if (ordered.indexOf(id) === -1) ordered.push(id); });

    return ordered.map(function(id){
      var challenge = runsInBucket(data.modes && data.modes.challenge && data.modes.challenge[id]);
      var hunt = runsInBucket(data.modes && data.modes.hunt && data.modes.hunt[id]);
      var memory = runsInBucket(data.modes && data.modes.memory && data.modes.memory[id]);
      return {
        id: id,
        label: LABELS[id] || id,
        challenge: challenge,
        hunt: hunt,
        memory: memory,
        total: challenge + hunt + memory
      };
    }).filter(function(row){ return row.total > 0; });
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function missingStations(s){
    return [s.challenge ? '' : 'Challenge', s.hunt ? '' : 'Fehlerjagd', s.memory ? '' : 'Memory'].filter(Boolean);
  }

  function renderEvidenceClear(){
    var view = document.getElementById('view-evidence');
    if (!view || painting) return;
    painting = true;

    try {
      var data = readTraining();
      var s = summary(data);
      var rows = rowData(data);
      var head = view.querySelector('.view-head');
      var title = head && head.querySelector('h1');
      var desc = head && head.querySelector('p');
      var status = document.getElementById('evidenceStatus');
      var grid = view.querySelector('.evidence-summary-grid');
      var note = view.querySelector('.evidence-note');
      var host = document.getElementById('evidenceRows');
      var button = document.getElementById('downloadEvidencePdf');
      var hint = document.getElementById('evidenceHint');

      if (title) title.textContent = 'Trainingsnachweis';
      if (desc) desc.textContent = 'Hier siehst du, welche Stationen du wie oft vollständig abgeschlossen hast.';
      if (status) status.textContent = s.ready ? 'PDF bereit ✓' : s.completed + ' / 3 Stationen';

      if (grid) {
        grid.innerHTML =
          '<div class="evidence-summary"><span>Challenge</span><strong>' + s.challenge + '× gespielt</strong></div>' +
          '<div class="evidence-summary"><span>Fehlerjagd</span><strong>' + s.hunt + '× gespielt</strong></div>' +
          '<div class="evidence-summary"><span>Memory</span><strong>' + s.memory + '× gespielt</strong></div>' +
          '<div class="evidence-summary"><span>Gesamt</span><strong>' + s.total + ' Runden</strong></div>';
      }

      if (note) {
        note.innerHTML = '<strong>PDF-Freigabe:</strong> Spiele Challenge, Fehlerjagd und Memory jeweils mindestens einmal vollständig. Danach kannst du den Trainingsnachweis herunterladen.';
      }

      if (host) {
        host.innerHTML = rows.length ? rows.map(function(row){
          return '<div class="evidence-row">' +
            '<div class="set-name">' + escapeHtml(row.label) + '</div>' +
            '<div class="evidence-cell"><span>Challenge</span><strong>' + row.challenge + '×</strong></div>' +
            '<div class="evidence-cell"><span>Fehlerjagd</span><strong>' + row.hunt + '×</strong></div>' +
            '<div class="evidence-cell"><span>Memory</span><strong>' + row.memory + '×</strong></div>' +
            '<div class="evidence-cell"><span>Gesamt</span><strong>' + row.total + '×</strong></div>' +
          '</div>';
        }).join('') : '<div class="evidence-empty">Noch keine Runde abgeschlossen. Starte eine Challenge, Fehlerjagd oder ein Memory.</div>';
      }

      if (button) button.disabled = !s.ready;
      if (hint) {
        var missing = missingStations(s);
        hint.textContent = missing.length ? 'Noch offen: ' + missing.join(', ') + '.' : 'PDF freigeschaltet · ' + s.total + ' Runden gespielt.';
      }
    } finally {
      painting = false;
    }
  }

  function downloadClearPdf(){
    var data = readTraining();
    var s = summary(data);
    if (!s.ready) {
      alert('Schliesse zuerst Challenge, Fehlerjagd und Memory jeweils mindestens einmal vollständig ab.');
      return;
    }

    var student = typeof requireStudentName === 'function' ? requireStudentName() : '';
    if (!student) return;

    var stats = statisticsData(data);
    var canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    var ctx = canvas.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 1200, 850);
    g.addColorStop(0, '#0f172a');
    g.addColorStop(1, '#1e3a5f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1200, 850);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1140, 790);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '800 20px sans-serif';
    ctx.fillText('INFORMATIK B25 – A7', 600, 82);
    ctx.fillStyle = '#fff';
    ctx.font = '800 36px sans-serif';
    ctx.fillText('TRAININGSNACHWEIS TASTENKÜRZEL', 600, 136);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 17px sans-serif';
    ctx.fillText('Statistik des abgeschlossenen Trainings', 600, 168);

    ctx.fillStyle = 'rgba(56,189,248,.13)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(235, 190, 730, 58, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#bae6fd';
    ctx.font = '800 26px sans-serif';
    ctx.fillText(student, 600, 228);

    function card(x, title, detail, isMemory){
      ctx.fillStyle = 'rgba(15,23,42,.78)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, 285, 315, 300, 20);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 24px sans-serif';
      ctx.fillText(title, x + 24, 328);
      ctx.fillStyle = detail.runs > 0 ? '#34d399' : '#94a3b8';
      ctx.font = '700 14px sans-serif';
      ctx.fillText(detail.runs > 0 ? 'erledigt ✓' : 'noch offen', x + 24, 355);

      var labels = isMemory ?
        [['Runden', String(detail.runs)], ['Paare', String(detail.pairs)], ['Züge', String(detail.moves)], ['Genauigkeit', 'separat']] :
        [['Runden', String(detail.runs)], ['Genauigkeit', detail.accuracy === null ? '–' : detail.accuracy + ' %'], ['richtig', String(detail.correct)], ['falsch', String(detail.wrong)]];

      labels.forEach(function(item, index){
        var col = index % 2;
        var row = Math.floor(index / 2);
        var bx = x + 24 + col * 140;
        var by = 390 + row * 86;
        ctx.fillStyle = 'rgba(148,163,184,.08)';
        ctx.beginPath();
        ctx.roundRect(bx, by, 125, 68, 12);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 13px sans-serif';
        ctx.fillText(item[0], bx + 12, by + 24);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '800 20px sans-serif';
        ctx.fillText(item[1], bx + 12, by + 52);
      });
    }

    card(85, 'Challenge', stats.challenge, false);
    card(443, 'Fehlerjagd', stats.hunt, false);
    card(801, 'Memory', stats.memory, true);

    ctx.fillStyle = 'rgba(15,23,42,.78)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(85, 620, 1030, 105, 18);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 15px sans-serif';
    ctx.fillText('Gesamtgenauigkeit aus Challenge + Fehlerjagd', 120, 657);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 28px sans-serif';
    ctx.fillText(stats.overallAccuracy === null ? '–' : stats.overallAccuracy + ' %', 120, 697);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 15px sans-serif';
    ctx.fillText('Gesammelte Antworten / Entscheidungen', 665, 657);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 28px sans-serif';
    ctx.fillText(String(stats.overallAttempts), 665, 697);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 14px sans-serif';
    ctx.fillText('3/3 Stationen abgeschlossen · ' + new Date().toLocaleDateString('de-CH'), 600, 782);

    function makePdf(){
      var pdf = new window.jspdf.jsPDF({orientation:'landscape', unit:'mm', format:[297,210]});
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 297, 210);
      var safe = typeof sanitizeStudentNameForFileName === 'function' ? sanitizeStudentNameForFileName(student) : student.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save('A7_Trainingsnachweis_' + safe + '.pdf');
    }

    if (window.jspdf) {
      makePdf();
    } else {
      var script = document.createElement('script');
      script.src = '../tk/vendor/jspdf.umd.min.js';
      script.onload = makePdf;
      document.head.appendChild(script);
    }
  }

  function install(){
    var view = document.getElementById('view-evidence');
    if (!view) return;

    try { window.renderEvidence = renderEvidenceClear; } catch (e) {}
    try { window.downloadTrainingPdf = downloadClearPdf; } catch (e) {}

    var button = document.getElementById('downloadEvidencePdf');
    if (button) button.onclick = downloadClearPdf;

    renderEvidenceClear();

    var observer = new MutationObserver(function(){
      if (painting) return;
      var text = view.textContent || '';
      if (text.indexOf('Zielgenauigkeit') !== -1 || text.indexOf('Abgeschlossene Runden') !== -1) {
        queueMicrotask(renderEvidenceClear);
      }
    });
    observer.observe(view, {subtree:true, childList:true, characterData:true});
  }

  window.addEventListener('load', install, {once:true});
})();
