(function () {
  'use strict';

  var PDF_SCRIPT = '../../tk/vendor/jspdf.umd.min.js';
  var BUTTON_ID = 'a8PdfReportBtn';
  var EXPORTING = false;

  function safeText(value) {
    return String(value == null ? '' : value)
      .normalize('NFKC')
      .replace(/[\u200D\uFE0E\uFE0F]/g, '')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2300}-\u{27BF}]/gu, '')
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/[–—−]/g, '-')
      .replace(/[“”„]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/…/g, '...')
      .replace(/€/g, 'Euro')
      .replace(/°/g, 'Grad')
      .replace(/←/g, 'Left')
      .replace(/→/g, 'Right')
      .replace(/↑/g, 'Up')
      .replace(/↓/g, 'Down')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function safeFileName(value) {
    return safeText(value || 'Schueler')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'Schueler';
  }

  function ensureJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve();
    if (window.__a8PdfJsPdfLoading) return window.__a8PdfJsPdfLoading;
    window.__a8PdfJsPdfLoading = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = PDF_SCRIPT;
      script.onload = function () {
        if (window.jspdf && window.jspdf.jsPDF) resolve();
        else reject(new Error('jsPDF wurde geladen, ist aber nicht verfügbar.'));
      };
      script.onerror = function () { reject(new Error('jsPDF konnte nicht geladen werden.')); };
      document.head.appendChild(script);
    });
    return window.__a8PdfJsPdfLoading;
  }

  function readGameState() {
    try {
      if (typeof state !== 'undefined' && state && typeof state === 'object') return state;
    } catch (error) {
      // Fall through to storage. Top-level lexical bindings can differ between builds.
    }
    var keys = ['shortcutRitter_2026_v1', 'shortcutRitter_v1'];
    for (var i = 0; i < keys.length; i += 1) {
      try {
        var raw = localStorage.getItem(keys[i]);
        if (raw) return JSON.parse(raw);
      } catch (error) {
        console.warn('A8 PDF: Spielstand konnte nicht gelesen werden', error);
      }
    }
    return null;
  }

  function sectionTitleMap() {
    var map = {};
    var blueprints = Array.isArray(window.LEARN_SECTION_BLUEPRINTS) ? window.LEARN_SECTION_BLUEPRINTS : [];
    blueprints.forEach(function (section) {
      var id = String(section && section.id != null ? section.id : '');
      if (!id) return;
      var title = safeText(section.title || section.tabLabel || ('Abschnitt ' + id));
      title = title.replace(/^\d+\.\s*/, '');
      map[id] = title || ('Abschnitt ' + id);
    });
    return map;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function percent(correct, total) {
    if (!total) return 0;
    return Math.round((correct / total) * 100);
  }

  function buildReportData(gameState) {
    var titles = sectionTitleMap();
    var sectionReports = gameState.sectionReports || {};
    var sectionClears = gameState.sectionClears || {};
    var sections = [];

    for (var i = 1; i <= 30; i += 1) {
      var id = String(i);
      var report = sectionReports[id] || {};
      var promptStats = report.promptStats || {};
      var attempts = 0;
      var misses = 0;
      Object.keys(promptStats).forEach(function (key) {
        var entry = promptStats[key] || {};
        attempts += Number(entry.attempts) || 0;
        misses += Number(entry.misses) || 0;
      });
      var completed = Number(sectionClears[id]) > 0 || Number(report.successes) > 0;
      var best = clamp(report.bestScore, 0, 100);
      var last = clamp(report.lastScore, 0, 100);
      var accuracy = attempts ? percent(attempts - misses, attempts) : (completed ? (best || 100) : 0);
      sections.push({
        id: i,
        title: titles[id] || ('Abschnitt ' + id),
        checks: Number(report.checks) || 0,
        successes: Number(report.successes) || 0,
        completed: completed,
        attempts: attempts,
        misses: misses,
        accuracy: clamp(accuracy, 0, 100),
        best: best,
        last: last,
        clears: Number(sectionClears[id]) || 0
      });
    }

    var combos = Object.keys(gameState.comboStats || {}).map(function (key) {
      var entry = gameState.comboStats[key] || {};
      var attempts = Number(entry.attempts) || 0;
      var misses = Number(entry.misses) || 0;
      var shortcut = safeText(entry.shortcut || '');
      var label = safeText(entry.label || shortcut || key.replace(/^combo:/, ''));
      if (shortcut && label.toLowerCase().indexOf(shortcut.toLowerCase()) === -1) label += ' (' + shortcut + ')';
      return {
        key: key,
        label: label,
        shortcut: shortcut,
        attempts: attempts,
        misses: misses,
        accuracy: attempts ? percent(attempts - misses, attempts) : 0,
        history: Array.isArray(entry.history) ? entry.history.slice() : [],
        sections: Array.isArray(entry.sections) ? entry.sections.slice() : []
      };
    }).filter(function (item) { return item.attempts > 0; });

    var completedCount = sections.filter(function (item) { return item.completed; }).length;
    var totalAttempts = sections.reduce(function (sum, item) { return sum + item.attempts; }, 0);
    var totalMisses = sections.reduce(function (sum, item) { return sum + item.misses; }, 0);
    var overallAccuracy = totalAttempts ? percent(totalAttempts - totalMisses, totalAttempts) : 0;

    var focusSections = sections.filter(function (item) { return item.misses > 0; }).sort(function (a, b) {
      return b.misses - a.misses || a.accuracy - b.accuracy || a.id - b.id;
    });
    var practicedSections = sections.slice().sort(function (a, b) {
      return b.attempts - a.attempts || b.checks - a.checks || a.id - b.id;
    });
    var problemCombos = combos.filter(function (item) { return item.misses > 0; }).sort(function (a, b) {
      return b.misses - a.misses || a.accuracy - b.accuracy || b.attempts - a.attempts;
    });
    var strongCombos = combos.filter(function (item) { return item.misses === 0 && item.attempts >= 2; }).sort(function (a, b) {
      return b.attempts - a.attempts || a.label.localeCompare(b.label);
    });
    var comboAccuracy = combos.slice().sort(function (a, b) {
      return a.accuracy - b.accuracy || b.misses - a.misses || b.attempts - a.attempts;
    });

    return {
      sections: sections,
      combos: combos,
      completedCount: completedCount,
      totalAttempts: totalAttempts,
      totalMisses: totalMisses,
      overallAccuracy: overallAccuracy,
      focusSections: focusSections,
      practicedSections: practicedSections,
      problemCombos: problemCombos,
      strongCombos: strongCombos,
      comboAccuracy: comboAccuracy
    };
  }

  function drawPdf(student, data) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    var W = 297;
    var H = 210;
    var M = 12;
    var pageNo = 1;
    var C = {
      ink: [20, 31, 48], muted: [92, 108, 128], navy: [15, 23, 42],
      blue: [59, 130, 246], blueSoft: [235, 244, 255], gold: [245, 158, 11], goldSoft: [255, 247, 225],
      green: [34, 197, 94], greenSoft: [236, 253, 245], red: [239, 68, 68], redSoft: [254, 242, 242],
      line: [222, 228, 236], panel: [248, 250, 252], white: [255, 255, 255]
    };

    function setColor(rgb, fill) {
      if (fill) doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      else doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    }
    function lineColor(rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }

    function footer() {
      lineColor(C.line);
      doc.line(M, H - 10, W - M, H - 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      setColor(C.muted);
      doc.text('A8 Shortcut Quest | Lernnachweis', M, H - 5.5);
      doc.text(student + ' | Seite ' + pageNo, W - M, H - 5.5, { align: 'right' });
    }

    function header(title, kicker) {
      setColor(C.navy, true);
      doc.rect(0, 0, W, 24, 'F');
      setColor(C.gold, true);
      doc.rect(0, 0, 4, 24, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(191, 219, 254);
      doc.text(safeText(kicker || 'INFORMATIK B25 | TK2 | A8'), M, 7.5);
      doc.setFontSize(15.5);
      setColor(C.white);
      doc.text(safeText(title), M, 17.2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.6);
      doc.setTextColor(203, 213, 225);
      doc.text(student, W - M, 17.2, { align: 'right' });
    }

    function newPage(title, kicker) {
      footer();
      doc.addPage('a4', 'landscape');
      pageNo += 1;
      header(title, kicker);
    }

    function roundedPanel(x, y, w, h, fill, border) {
      setColor(fill || C.panel, true);
      if (border) {
        lineColor(border);
        doc.roundedRect(x, y, w, h, 2.5, 2.5, 'FD');
      } else doc.roundedRect(x, y, w, h, 2.5, 2.5, 'F');
    }

    function ellipsize(text, maxWidth, fontSize, fontStyle) {
      text = safeText(text);
      doc.setFont('helvetica', fontStyle || 'normal');
      doc.setFontSize(fontSize || 8);
      if (doc.getTextWidth(text) <= maxWidth) return text;
      var suffix = '...';
      while (text.length && doc.getTextWidth(text + suffix) > maxWidth) text = text.slice(0, -1);
      return text + suffix;
    }

    function sectionHeading(text, x, y, accent) {
      setColor(accent || C.blue, true);
      doc.roundedRect(x, y - 4.2, 3, 7.2, 1.2, 1.2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      setColor(C.ink);
      doc.text(safeText(text), x + 6, y);
    }

    function metricCard(x, y, w, h, label, value, tone, detail) {
      var palette = tone === 'red' ? [C.redSoft, C.red] : tone === 'green' ? [C.greenSoft, C.green] : tone === 'gold' ? [C.goldSoft, C.gold] : [C.blueSoft, C.blue];
      roundedPanel(x, y, w, h, palette[0], C.line);
      setColor(palette[1], true);
      doc.roundedRect(x + 4, y + 4, 3, h - 8, 1.2, 1.2, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(16); setColor(C.ink);
      doc.text(String(value), x + 11, y + 13);
      doc.setFontSize(7.6); setColor(C.muted); doc.text(safeText(label), x + 11, y + 20);
      if (detail) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.7);
        doc.text(ellipsize(detail, w - 15, 6.7), x + 11, y + 26);
      }
    }

    function drawFocusRows(rows, x, y, w, maxRows) {
      var count = Math.min(rows.length, maxRows || 6);
      if (!count) {
        roundedPanel(x, y, w, 18, C.greenSoft, C.line);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); setColor(C.green);
        doc.text('Keine Fehlerschwerpunkte registriert.', x + 5, y + 11);
        return 18;
      }
      var rowH = 12;
      for (var i = 0; i < count; i += 1) {
        var row = rows[i];
        roundedPanel(x, y + i * rowH, w, rowH - 1.4, i % 2 ? C.white : C.panel, C.line);
        setColor(C.red, true);
        doc.roundedRect(x + 3.5, y + i * rowH + 3, 5.5, 5.5, 1.3, 1.3, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7); setColor(C.white);
        doc.text(String(row.misses), x + 6.25, y + i * rowH + 6.9, { align: 'center' });
        doc.setFontSize(8.1); setColor(C.ink);
        doc.text(ellipsize(row.id + '. ' + row.title, w - 42, 8.1, 'bold'), x + 12, y + i * rowH + 5.4);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.7); setColor(C.muted);
        doc.text(row.accuracy + '% Treffer | ' + row.attempts + ' Versuche', x + 12, y + i * rowH + 9.1);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.4); setColor(C.red);
        doc.text(row.misses + ' Fehler', x + w - 4, y + i * rowH + 6.8, { align: 'right' });
      }
      return count * rowH;
    }

    function drawSimpleTable(rows, x, y, widths, headers, maxRows) {
      var rowH = 8.2;
      var h = rowH * (Math.min(rows.length, maxRows || rows.length) + 1);
      var totalW = widths.reduce(function (sum, value) { return sum + value; }, 0);
      setColor(C.navy, true); doc.roundedRect(x, y, totalW, rowH, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(6.8); setColor(C.white);
      var cx = x;
      headers.forEach(function (headerText, index) {
        doc.text(ellipsize(headerText, widths[index] - 3, 6.8, 'bold'), cx + 2, y + 5.2);
        cx += widths[index];
      });
      var count = Math.min(rows.length, maxRows || rows.length);
      for (var r = 0; r < count; r += 1) {
        var ry = y + rowH * (r + 1);
        setColor(r % 2 ? C.white : C.panel, true); doc.rect(x, ry, totalW, rowH, 'F');
        lineColor(C.line); doc.line(x, ry + rowH, x + totalW, ry + rowH);
        cx = x;
        for (var c = 0; c < widths.length; c += 1) {
          doc.setFont('helvetica', c === 0 ? 'bold' : 'normal'); doc.setFontSize(6.6);
          setColor(c === widths.length - 1 && String(rows[r][c]).indexOf('Fehler') !== -1 ? C.red : C.ink);
          doc.text(ellipsize(rows[r][c], widths[c] - 3, 6.6, c === 0 ? 'bold' : 'normal'), cx + 2, ry + 5.1);
          cx += widths[c];
        }
      }
      lineColor(C.line); doc.roundedRect(x, y, totalW, h, 1.5, 1.5, 'S');
      return h;
    }

    function drawSectionMatrix(items, x, y, w, h, mode) {
      var colGap = 6;
      var colW = (w - colGap) / 2;
      var rowsPerCol = 15;
      var rowH = h / rowsPerCol;
      for (var i = 0; i < Math.min(items.length, 30); i += 1) {
        var col = i >= rowsPerCol ? 1 : 0;
        var idx = i % rowsPerCol;
        var px = x + col * (colW + colGap);
        var py = y + idx * rowH;
        var item = items[i];
        var value = mode === 'best' ? item.best : mode === 'last' ? item.last : item.accuracy;
        var barX = px + 49;
        var barW = colW - 56;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(5.9); setColor(C.muted);
        doc.text(ellipsize(item.id + '. ' + item.title, 44, 5.9), px, py + 4.2);
        setColor(C.line, true); doc.roundedRect(barX, py + 1.2, barW, 4.3, 1.2, 1.2, 'F');
        var fill = item.misses > 0 && mode === 'accuracy' ? C.red : value >= 80 ? C.green : value >= 60 ? C.gold : C.red;
        setColor(fill, true); doc.roundedRect(barX, py + 1.2, Math.max(0.8, barW * value / 100), 4.3, 1.2, 1.2, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(5.9); setColor(C.ink);
        doc.text(Math.round(value) + '%', px + colW, py + 4.3, { align: 'right' });
      }
    }

    function drawPerformanceMatrix(items, x, y, w, h) {
      var colGap = 6;
      var colW = (w - colGap) / 2;
      var rowsPerCol = 15;
      var rowH = h / rowsPerCol;
      for (var i = 0; i < Math.min(items.length, 30); i += 1) {
        var col = i >= rowsPerCol ? 1 : 0;
        var idx = i % rowsPerCol;
        var px = x + col * (colW + colGap);
        var py = y + idx * rowH;
        var item = items[i];
        var barX = px + 49;
        var barW = colW - 56;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(5.9); setColor(C.muted);
        doc.text(ellipsize(item.id + '. ' + item.title, 44, 5.9), px, py + 4.2);
        setColor(C.line, true); doc.roundedRect(barX, py + 1.0, barW, 2.0, 0.8, 0.8, 'F');
        setColor(C.blue, true); doc.roundedRect(barX, py + 1.0, Math.max(0.7, barW * item.best / 100), 2.0, 0.8, 0.8, 'F');
        setColor(C.line, true); doc.roundedRect(barX, py + 3.7, barW, 2.0, 0.8, 0.8, 'F');
        setColor(item.last + 5 < item.best ? C.gold : C.green, true);
        doc.roundedRect(barX, py + 3.7, Math.max(0.7, barW * item.last / 100), 2.0, 0.8, 0.8, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); setColor(C.ink);
        doc.text(item.best + '/' + item.last, px + colW, py + 4.7, { align: 'right' });
      }
    }

    function drawHorizontalBars(items, x, y, w, h, valueKey, options) {
      options = options || {};
      var count = Math.max(1, Math.min(items.length, options.maxRows || 10));
      var rowH = h / count;
      var labelW = options.labelWidth || 54;
      var barX = x + labelW;
      var barW = w - labelW - 12;
      var values = items.slice(0, count).map(function (item) { return Number(item[valueKey]) || 0; });
      var maxValue = options.maxValue || Math.max.apply(null, values.concat([1]));
      for (var i = 0; i < count; i += 1) {
        var item = items[i];
        if (!item) continue;
        var value = Number(item[valueKey]) || 0;
        var py = y + i * rowH;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(options.fontSize || 6.4); setColor(C.muted);
        doc.text(ellipsize(options.labelFn ? options.labelFn(item) : item.label, labelW - 3, options.fontSize || 6.4), x, py + rowH * 0.62);
        setColor(C.line, true); doc.roundedRect(barX, py + rowH * 0.25, barW, Math.max(2.2, rowH * 0.42), 1, 1, 'F');
        var tone = options.colorFn ? options.colorFn(item) : C.blue;
        setColor(tone, true);
        var width = maxValue ? barW * value / maxValue : 0;
        if (value > 0) doc.roundedRect(barX, py + rowH * 0.25, Math.max(0.8, width), Math.max(2.2, rowH * 0.42), 1, 1, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(options.fontSize || 6.4); setColor(C.ink);
        doc.text(options.valueFn ? options.valueFn(item) : String(value), x + w, py + rowH * 0.62, { align: 'right' });
      }
    }

    function drawComboAccuracy(items, x, y, w, h) {
      var chosen = items.slice(0, 12);
      if (!chosen.length) return;
      drawHorizontalBars(chosen, x, y, w, h, 'accuracy', {
        maxRows: 12, maxValue: 100, labelWidth: 66,
        labelFn: function (item) { return item.label; },
        valueFn: function (item) { return item.accuracy + '%'; },
        colorFn: function (item) { return item.misses ? (item.accuracy >= 80 ? C.gold : C.red) : C.green; },
        fontSize: 6.1
      });
    }

    function drawAttemptHistory(items, x, y, w, h) {
      var chosen = items.filter(function (item) { return item.history && item.history.length; }).slice(0, 8);
      if (!chosen.length) return;
      var labelW = 68;
      var rowH = h / chosen.length;
      var dotArea = w - labelW - 5;
      chosen.forEach(function (item, index) {
        var py = y + index * rowH;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6.3); setColor(C.muted);
        doc.text(ellipsize(item.label, labelW - 4, 6.3), x, py + rowH * 0.58);
        var history = item.history.slice(-14);
        var gap = Math.min(8, dotArea / Math.max(14, history.length));
        history.forEach(function (attempt, idx) {
          var cx = x + labelW + idx * gap + 2.5;
          var cy = py + rowH * 0.48;
          setColor(attempt && attempt.success ? C.green : C.red, true);
          doc.circle(cx, cy, 1.6, 'F');
        });
        lineColor(C.line); doc.line(x + labelW, py + rowH - 1, x + w, py + rowH - 1);
      });
    }

    function sectionDetailRows(items) {
      return items.map(function (item) {
        return [item.id + '. ' + item.title, item.completed ? 'Ja' : '-', String(item.attempts), item.misses ? item.misses + ' Fehler' : '0', item.accuracy + '%', item.best + '%'];
      });
    }

    header('Lernnachweis - Überblick', 'INFORMATIK B25 | TK2 | A8 SHORTCUT QUEST');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(18); setColor(C.ink); doc.text(student, M, 36);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.6); setColor(C.muted);
    doc.text('Stand: ' + new Date().toLocaleString('de-CH') + ' | automatisch aus dem gespeicherten Spielstand', M, 42);

    var cardGap = 5;
    var cardW = (W - 2 * M - 3 * cardGap) / 4;
    metricCard(M, 49, cardW, 31, 'Abschnitte abgeschlossen', data.completedCount + '/30', data.completedCount === 30 ? 'green' : 'blue', 'Fortschritt im A8-Kurs');
    metricCard(M + cardW + cardGap, 49, cardW, 31, 'Antwortversuche', data.totalAttempts, 'blue', 'über alle Aufgaben hinweg');
    metricCard(M + 2 * (cardW + cardGap), 49, cardW, 31, 'Fehlversuche', data.totalMisses, data.totalMisses ? 'red' : 'green', data.focusSections.length + ' Abschnitte betroffen');
    metricCard(M + 3 * (cardW + cardGap), 49, cardW, 31, 'Trefferquote', data.overallAccuracy + '%', data.overallAccuracy >= 90 ? 'green' : data.overallAccuracy >= 75 ? 'gold' : 'red', 'über alle protokollierten Antworten');

    sectionHeading('Wo noch ansetzen', M, 94, C.red);
    drawFocusRows(data.focusSections, M, 100, 132, 6);
    sectionHeading('Starke Kombinationen', 151, 94, C.green);
    var strongRows = data.strongCombos.slice(0, 7).map(function (item) { return [item.label, item.attempts + ' Versuche', '0 Fehler']; });
    if (strongRows.length) drawSimpleTable(strongRows, 151, 100, [83, 25, 25], ['Kombination', 'Praxis', 'Fehler'], 7);
    else {
      roundedPanel(151, 100, 133, 18, C.panel, C.line);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); setColor(C.muted);
      doc.text('Noch zu wenig Daten für eine Stärkenliste.', 156, 111);
    }

    sectionHeading('Lehrpersonen-Fazit', M, 181, C.gold);
    roundedPanel(M, 186, W - 2 * M, 10, C.goldSoft, C.line);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.4); setColor(C.ink);
    var summary = data.totalMisses
      ? 'Fokus zuerst auf ' + data.focusSections.slice(0, 3).map(function (item) { return item.id + '. ' + item.title; }).join(' | ') + '. Fehler bleiben sichtbar, auch wenn ein späterer Versuch 100% erreicht.'
      : 'Aktuell sind keine Fehlversuche registriert. Für eine belastbare Diagnose sind weitere Wiederholungen sinnvoll.';
    doc.text(ellipsize(summary, W - 2 * M - 10, 7.4), M + 5, 192.3);

    newPage('Alle 30 Abschnitte', 'DETAILANSICHT | ABSCHLUSS, FEHLER, TREFFERQUOTE');
    sectionHeading('Abschnitte 1-15', M, 35, C.blue);
    sectionHeading('Abschnitte 16-30', 151, 35, C.blue);
    var detailRows = sectionDetailRows(data.sections);
    drawSimpleTable(detailRows.slice(0, 15), M, 41, [55, 13, 16, 18, 18, 18], ['Abschnitt', 'OK', 'Vers.', 'Fehler', 'Quote', 'Best'], 15);
    drawSimpleTable(detailRows.slice(15), 151, 41, [55, 13, 16, 18, 18, 18], ['Abschnitt', 'OK', 'Vers.', 'Fehler', 'Quote', 'Best'], 15);

    newPage('Kombinationen - Fehler & Trefferquote', 'DIAGNOSE | WORST FIRST');
    sectionHeading('Trefferquote pro Kombination', M, 35, C.gold);
    sectionHeading('Fehlversuche je Kombination', 151, 35, C.red);
    var comboWorst = data.comboAccuracy.filter(function (item) { return item.misses > 0; });
    if (comboWorst.length < 12) {
      data.comboAccuracy.forEach(function (item) { if (comboWorst.length < 12 && comboWorst.indexOf(item) === -1) comboWorst.push(item); });
    }
    drawComboAccuracy(comboWorst, M, 42, 132, 92);
    drawHorizontalBars(data.problemCombos.slice(0, 12), 151, 42, 133, 92, 'misses', {
      maxRows: 12, labelWidth: 72,
      labelFn: function (item) { return item.label; },
      valueFn: function (item) { return item.misses + '/' + item.attempts; },
      colorFn: function () { return C.red; }, fontSize: 6.0
    });
    sectionHeading('Fehlerdetails', M, 146, C.red);
    var problemRows = data.problemCombos.slice(0, 8).map(function (item) { return [item.label, String(item.attempts), String(item.misses), item.accuracy + '%']; });
    if (problemRows.length) drawSimpleTable(problemRows, M, 152, [78, 18, 18, 18], ['Kombination', 'Vers.', 'Fehler', 'Quote'], 8);
    else {
      roundedPanel(M, 152, 132, 18, C.greenSoft, C.line);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); setColor(C.green);
      doc.text('Keine Fehlversuche in Kombinationen.', M + 5, 163);
    }
    sectionHeading('Interpretation', 151, 146, C.blue);
    roundedPanel(151, 152, 133, 36, C.blueSoft, C.line);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2); setColor(C.ink);
    var interp = data.problemCombos.length
      ? 'Die rote Liste zeigt nicht nur das Endergebnis, sondern echte Fehlversuche aus früheren Durchläufen. So bleibt sichtbar, welche Shortcuts erst nach Wiederholung sicher wurden.'
      : 'Alle protokollierten Kombinationen sind aktuell fehlerfrei. Bei wenigen Versuchen ist das noch keine sichere Mastery-Aussage.';
    doc.text(doc.splitTextToSize(interp, 122), 157, 161);

    newPage('Versuchshistorie & Übungsintensität', 'ENTWICKLUNG | WIEDERHOLUNGEN');
    sectionHeading('Versuchshistorie pro Kombination', M, 35, C.blue);
    var historyItems = data.problemCombos.concat(data.strongCombos).filter(function (item, idx, arr) { return arr.indexOf(item) === idx; });
    drawAttemptHistory(historyItems, M, 43, 132, 78);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.6); setColor(C.muted);
    doc.text('Punkt = ein Versuch | grün = richtig | rot = falsch | gezeigt werden die letzten 14 Versuche.', M, 128);
    sectionHeading('Meist geübte Abschnitte', 151, 35, C.blue);
    drawHorizontalBars(data.practicedSections.slice(0, 10), 151, 43, 133, 78, 'attempts', {
      maxRows: 10, labelWidth: 69,
      labelFn: function (item) { return item.id + '. ' + item.title; },
      valueFn: function (item) { return String(item.attempts); },
      colorFn: function (item) { return item.misses ? C.gold : C.blue; }, fontSize: 6.1
    });
    sectionHeading('Was bedeutet das?', M, 147, C.gold);
    roundedPanel(M, 153, W - 2 * M, 35, C.goldSoft, C.line);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.2); setColor(C.ink);
    doc.text(doc.splitTextToSize('Viele Versuche sind nicht automatisch schlecht: Sie zeigen Übungsintensität. Entscheidend ist die Kombination aus Wiederholungen, Fehlversuchen und späterer Trefferquote. Ein Abschnitt mit mehreren Versuchen und steigender Sicherheit kann didaktisch wertvoller sein als ein einmalig perfekter Treffer.', W - 2 * M - 12), M + 6, 163);

    newPage('Trefferquote je Abschnitt', 'ALLE 30 ABSCHNITTE | FEHLER BLEIBEN SICHTBAR');
    sectionHeading('Trefferquote', M, 35, C.green);
    drawSectionMatrix(data.sections, M, 43, W - 2 * M, 137, 'accuracy');
    roundedPanel(M, 184, W - 2 * M, 9, C.panel, C.line);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.7); setColor(C.muted);
    doc.text('Rot/Gold markiert Abschnitte mit Fehlversuchen oder tieferer Quote. 100% kann trotzdem einen früheren Fehler enthalten; dafür siehe Fehler-Spalte auf Seite 2.', M + 5, 189.8);

    newPage('Top-Ergebnisse je Abschnitt', 'BESTES ERGEBNIS | ALLE 30 ABSCHNITTE');
    sectionHeading('Bestes Ergebnis', M, 35, C.green);
    drawSectionMatrix(data.sections, M, 43, W - 2 * M, 137, 'best');
    roundedPanel(M, 184, W - 2 * M, 9, C.greenSoft, C.line);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.7); setColor(C.muted);
    doc.text('Diese Seite zeigt das beste erreichte Ergebnis. Für Diagnose immer zusammen mit Trefferquote und Fehlversuchen lesen.', M + 5, 189.8);

    newPage('Performance pro Abschnitt', 'BESTES / LETZTES ERGEBNIS');
    sectionHeading('Bestwert (blau) vs. letzter Lauf (grün/gold)', M, 35, C.blue);
    drawPerformanceMatrix(data.sections, M, 43, W - 2 * M, 137);
    roundedPanel(M, 184, W - 2 * M, 9, C.blueSoft, C.line);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6.7); setColor(C.muted);
    doc.text('Zahlen rechts: Bestwert / letzter Lauf. Gold zeigt einen letzten Lauf, der klar unter dem persönlichen Bestwert liegt.', M + 5, 189.8);

    footer();
    doc.save('A8_Shortcut_Quest_Lernnachweis_' + safeFileName(student) + '.pdf');
  }

  async function generatePdf(button) {
    if (EXPORTING) return;
    EXPORTING = true;
    var originalText = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'PDF wird erstellt ...';
    }
    try {
      var student = window.prompt('Bitte gib deinen Vornamen für den Lernnachweis ein:', '');
      if (!student) return;
      await ensureJsPdf();
      var gameState = readGameState();
      if (!gameState) throw new Error('Kein gespeicherter A8-Spielstand gefunden.');
      var data = buildReportData(gameState);
      if (!data.sections.length) throw new Error('Keine Reportdaten gefunden.');
      drawPdf(student, data);
      console.info('A8 PDF erstellt: kompakter 7-Seiten-Lernnachweis mit nativen Statistik-Grafiken.');
    } catch (error) {
      console.error('A8 PDF export failed', error);
      window.alert('Das A8-PDF konnte nicht erzeugt werden. Bitte aktualisiere zuerst den Lern-Report und versuche es erneut.');
    } finally {
      EXPORTING = false;
      if (button) {
        button.disabled = false;
        button.textContent = originalText;
      }
    }
  }

  function installButton() {
    if (document.getElementById(BUTTON_ID)) return;
    var actions = document.querySelector('.report-secondary-actions');
    if (!actions) return;
    var button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.className = 'report-action ghost';
    button.textContent = 'PDF Lernnachweis';
    button.title = 'Kompakter Lernnachweis mit Statistiken, Fehlern und Entwicklung';
    button.addEventListener('click', function () { generatePdf(button); });
    actions.insertBefore(button, actions.firstChild);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installButton);
  else installButton();

  var observer = new MutationObserver(function () { installButton(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();