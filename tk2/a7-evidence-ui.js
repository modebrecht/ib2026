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

    var rows = rowData(data);
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
    ctx.fillText('INFORMATIK B25 – A7', 600, 88);
    ctx.fillStyle = '#fff';
    ctx.font = '800 36px sans-serif';
    ctx.fillText('TRAININGSNACHWEIS TASTENKÜRZEL', 600, 145);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 17px sans-serif';
    ctx.fillText('Abgeschlossene Trainingsrunden', 600, 180);

    ctx.fillStyle = 'rgba(56,189,248,.13)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(235, 205, 730, 64, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#bae6fd';
    ctx.font = '800 27px sans-serif';
    ctx.fillText(student, 600, 246);

    ctx.fillStyle = '#34d399';
    ctx.font = '800 23px sans-serif';
    ctx.fillText('3/3 Stationen abgeschlossen', 600, 306);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '700 18px sans-serif';
    ctx.fillText('Challenge ' + s.challenge + '× · Fehlerjagd ' + s.hunt + '× · Memory ' + s.memory + '× · Gesamt ' + s.total + ' Runden', 600, 340);

    ctx.fillStyle = 'rgba(15,23,42,.72)';
    ctx.beginPath();
    ctx.roundRect(85, 375, 1030, 355, 20);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 14px sans-serif';
    ctx.fillText('SET', 125, 410);
    ctx.fillText('CHALLENGE', 485, 410);
    ctx.fillText('FEHLERJAGD', 650, 410);
    ctx.fillText('MEMORY', 830, 410);
    ctx.fillText('GESAMT', 990, 410);

    var y = 450;
    rows.slice(0, 7).forEach(function(row){
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '700 17px sans-serif';
      ctx.fillText(row.label, 125, y);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 16px sans-serif';
      ctx.fillText(String(row.challenge), 520, y);
      ctx.fillText(String(row.hunt), 690, y);
      ctx.fillText(String(row.memory), 855, y);
      ctx.fillText(String(row.total), 1015, y);
      y += 40;
    });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 14px sans-serif';
    ctx.fillText('PDF-Freigabe nach je 1 vollständigen Runde: Challenge · Fehlerjagd · Memory · ' + new Date().toLocaleDateString('de-CH'), 600, 790);

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
