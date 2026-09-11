(function () {
  'use strict';

  var PDF_SCRIPT = '../../tk/vendor/jspdf.umd.min.js';
  var BUTTON_ID = 'a8PdfReportBtn';
  var EXPORTING = false;

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function cleanText(value) {
    return String(value == null ? '' : value)
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function safeFileName(value) {
    return cleanText(value || 'Schueler')
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

  async function waitForCharts() {
    var started = Date.now();
    while (Date.now() - started < 1800) {
      var expected = (typeof activeReportCharts !== 'undefined' && activeReportCharts) ? activeReportCharts.length : 0;
      var actual = document.querySelectorAll('#reportContent .apexcharts-svg').length;
      if (!expected || actual >= expected) break;
      await sleep(60);
    }
    await sleep(90);
  }

  function collectCurrentTab(tabId, label) {
    var root = document.getElementById('reportContent');
    var snapshot = {
      id: tabId,
      label: label,
      blocks: [],
      charts: []
    };
    if (!root) return snapshot;

    Array.prototype.forEach.call(root.children, function (node) {
      if (!(node instanceof HTMLElement)) return;

      if (node.classList.contains('report-chart-grid') || node.classList.contains('report-chart-column')) {
        Array.prototype.forEach.call(node.querySelectorAll('.chart-card'), function (card) {
          snapshot.charts.push(card);
        });
        return;
      }

      if (node.classList.contains('chart-card')) {
        snapshot.charts.push(node);
        return;
      }

      if (node.classList.contains('report-block')) {
        snapshot.blocks.push(node);
        return;
      }

      var text = cleanText(node.textContent);
      if (text) snapshot.blocks.push(node);
    });

    return snapshot;
  }

  async function captureAllReportTabs() {
    if (typeof renderReport !== 'function') throw new Error('A8-Reportfunktion ist nicht verfügbar.');
    var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.report-tab[data-report-tab]'));
    var tabs = tabButtons.map(function (button) {
      return {
        id: button.getAttribute('data-report-tab'),
        label: cleanText(button.textContent) || button.getAttribute('data-report-tab')
      };
    }).filter(function (tab) { return tab.id; });

    if (!tabs.length) {
      tabs = [
        { id: 'overview', label: 'Überblick' },
        { id: 'combos', label: 'Kombinationen' },
        { id: 'sections', label: 'Abschnitte' }
      ];
    }

    var originalTab = (typeof activeReportTab !== 'undefined' && activeReportTab) ? activeReportTab : 'overview';
    var snapshots = [];

    for (var i = 0; i < tabs.length; i += 1) {
      activeReportTab = tabs[i].id;
      renderReport();
      await waitForCharts();

      var snapshot = collectCurrentTab(tabs[i].id, tabs[i].label);
      var chartCards = snapshot.charts.slice();
      var chartInstances = (typeof activeReportCharts !== 'undefined' && activeReportCharts)
        ? activeReportCharts.slice()
        : [];
      snapshot.chartImages = [];

      for (var c = 0; c < chartCards.length; c += 1) {
        var card = chartCards[c];
        var instance = chartInstances[c];
        if (!instance || typeof instance.dataURI !== 'function') continue;
        try {
          var image = await instance.dataURI({ scale: 2 });
          snapshot.chartImages.push({
            title: cleanText((card.querySelector('h3') || {}).textContent) || ('Grafik ' + (c + 1)),
            imgURI: image && image.imgURI ? image.imgURI : null,
            width: Math.max(1, card.clientWidth || 900),
            height: Math.max(1, card.clientHeight || 420)
          });
        } catch (error) {
          console.warn('A8 PDF: Grafik konnte nicht exportiert werden', error);
        }
      }

      snapshots.push(snapshot);
    }

    activeReportTab = originalTab;
    renderReport();
    await waitForCharts();
    return snapshots;
  }

  function nodeSnapshot(node) {
    var data = {
      title: '',
      highlights: [],
      paragraphs: [],
      lists: [],
      tables: []
    };
    if (!(node instanceof HTMLElement)) return data;

    var heading = node.querySelector('h3, h2, h4');
    if (heading) data.title = cleanText(heading.textContent);

    Array.prototype.forEach.call(node.querySelectorAll('.highlight-card'), function (card) {
      var label = card.querySelector('.highlight-label');
      var value = card.querySelector('.highlight-value');
      var text = cleanText(card.textContent);
      data.highlights.push({
        label: cleanText(label ? label.textContent : ''),
        value: cleanText(value ? value.textContent : text)
      });
    });

    Array.prototype.forEach.call(node.querySelectorAll('p'), function (p) {
      var text = cleanText(p.textContent);
      if (text && text !== data.title) data.paragraphs.push(text);
    });

    Array.prototype.forEach.call(node.querySelectorAll('ul.report-insights, ol.report-insights'), function (list) {
      var rows = Array.prototype.map.call(list.querySelectorAll('li'), function (li) {
        return cleanText(li.textContent);
      }).filter(Boolean);
      if (rows.length) data.lists.push(rows);
    });

    Array.prototype.forEach.call(node.querySelectorAll('table'), function (table) {
      var rows = Array.prototype.map.call(table.querySelectorAll('tr'), function (tr) {
        return Array.prototype.map.call(tr.querySelectorAll('th,td'), function (cell) {
          return cleanText(cell.textContent);
        });
      }).filter(function (row) { return row.some(Boolean); });
      if (rows.length) data.tables.push(rows);
    });

    if (!data.title && !data.highlights.length && !data.paragraphs.length && !data.lists.length && !data.tables.length) {
      var fallback = cleanText(node.textContent);
      if (fallback) data.paragraphs.push(fallback);
    }
    return data;
  }

  function drawPdf(student, snapshots) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    var W = 297;
    var H = 210;
    var M = 14;
    var CONTENT_W = W - M * 2;
    var y = 16;
    var pageNo = 1;

    function pageHeader(title, subtitle) {
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, W, 28, 'F');
      doc.setTextColor(186, 230, 253);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('INFORMATIK B25 · TK2 · A8 SHORTCUT QUEST', M, 9);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(cleanText(title), M, 19);
      if (subtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(203, 213, 225);
        doc.text(cleanText(subtitle), W - M, 18, { align: 'right' });
      }
      y = 36;
    }

    function footer() {
      doc.setDrawColor(226, 232, 240);
      doc.line(M, H - 10, W - M, H - 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('A8 Lernnachweis · automatisch aus dem gespeicherten Shortcut-Quest-Fortschritt', M, H - 5.5);
      doc.text('Seite ' + pageNo, W - M, H - 5.5, { align: 'right' });
    }

    function newPage(title, subtitle) {
      footer();
      doc.addPage('a4', 'landscape');
      pageNo += 1;
      pageHeader(title, subtitle);
    }

    function ensure(height, title, subtitle) {
      if (y + height > H - 15) newPage(title || 'A8 Lernnachweis', subtitle || student);
    }

    function heading(text, level) {
      if (!text) return;
      ensure(level === 1 ? 12 : 9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(level === 1 ? 13 : 10.5);
      doc.text(cleanText(text), M, y);
      y += level === 1 ? 8 : 6.5;
    }

    function paragraph(text) {
      text = cleanText(text);
      if (!text) return;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      var lines = doc.splitTextToSize(text, CONTENT_W);
      ensure(lines.length * 4 + 3);
      doc.text(lines, M, y);
      y += lines.length * 4 + 3;
    }

    function keyValueRows(items) {
      if (!items || !items.length) return;
      var colW = (CONTENT_W - 6) / 2;
      for (var i = 0; i < items.length; i += 2) {
        ensure(13);
        for (var j = 0; j < 2; j += 1) {
          var item = items[i + j];
          if (!item) continue;
          var x = M + j * (colW + 6);
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(x, y - 4.5, colW, 11, 2, 2, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139);
          doc.text(cleanText(item.label || 'Wert'), x + 3, y);
          doc.setFontSize(10);
          doc.setTextColor(15, 23, 42);
          doc.text(doc.splitTextToSize(cleanText(item.value), colW - 6), x + 3, y + 4.5);
        }
        y += 14;
      }
    }

    function bulletList(rows) {
      rows.forEach(function (text) {
        text = cleanText(text);
        if (!text) return;
        var lines = doc.splitTextToSize(text, CONTENT_W - 6);
        ensure(lines.length * 4 + 2);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.3);
        doc.setTextColor(51, 65, 85);
        doc.text('•', M + 1, y);
        doc.text(lines, M + 5, y);
        y += lines.length * 4 + 2;
      });
      y += 1;
    }

    function table(rows, sectionTitle) {
      if (!rows || !rows.length) return;
      var maxCols = rows.reduce(function (max, row) { return Math.max(max, row.length); }, 1);
      var colW = CONTENT_W / maxCols;
      var header = rows[0];
      var body = rows.slice(1);

      function drawRow(row, isHeader) {
        var wrapped = row.map(function (cell) {
          return doc.splitTextToSize(cleanText(cell), Math.max(16, colW - 4));
        });
        var lines = wrapped.reduce(function (max, item) { return Math.max(max, item.length); }, 1);
        var rowH = Math.max(7, lines * 3.5 + 3);
        ensure(rowH + 1, sectionTitle || 'A8 Lernnachweis', student);
        if (isHeader) doc.setFillColor(226, 232, 240);
        else doc.setFillColor(248, 250, 252);
        doc.rect(M, y - 4.5, CONTENT_W, rowH, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(M, y - 4.5, CONTENT_W, rowH);
        for (var c = 0; c < maxCols; c += 1) {
          var x = M + c * colW;
          if (c) doc.line(x, y - 4.5, x, y - 4.5 + rowH);
          doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
          doc.setFontSize(isHeader ? 7.5 : 7.2);
          doc.setTextColor(isHeader ? 30 : 71, isHeader ? 41 : 85, isHeader ? 59 : 105);
          doc.text(wrapped[c] || [''], x + 2, y);
        }
        y += rowH;
      }

      drawRow(header, true);
      body.forEach(function (row) { drawRow(row, false); });
      y += 4;
    }

    function renderBlock(block, sectionTitle) {
      var data = nodeSnapshot(block);
      if (data.title) heading(data.title, 2);
      keyValueRows(data.highlights);
      data.paragraphs.forEach(paragraph);
      data.lists.forEach(bulletList);
      data.tables.forEach(function (rows) { table(rows, sectionTitle); });
      y += 2;
    }

    pageHeader('A8 · Shortcut Quest – Lernnachweis', student);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(student, M, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Erstellt am ' + new Date().toLocaleString('de-CH') + ' · vollständiger Diagnose-Export aller Report-Tabs', M, y);
    y += 10;
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(M, y - 5, CONTENT_W, 17, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(5, 150, 105);
    doc.text('Enthalten: Überblick · Kombinationen · Abschnitte · alle Tabellen · alle verfügbaren Statistik-Grafiken', M + 4, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(71, 85, 105);
    doc.text('So sind Stärken, Fehlerschwerpunkte, Übungsbedarf und Entwicklung direkt sichtbar.', M + 4, y + 7);
    y += 20;

    snapshots.forEach(function (snapshot, index) {
      if (index > 0 || y > 55) newPage('A8 · ' + snapshot.label, student);
      else heading(snapshot.label, 1);
      snapshot.blocks.forEach(function (block) { renderBlock(block, 'A8 · ' + snapshot.label); });
    });

    snapshots.forEach(function (snapshot) {
      (snapshot.chartImages || []).forEach(function (chart) {
        if (!chart.imgURI) return;
        newPage('Statistik-Grafik · ' + chart.title, snapshot.label + ' · ' + student);
        var maxW = CONTENT_W;
        var maxH = H - y - 18;
        var ratio = chart.width / Math.max(1, chart.height);
        var drawW = maxW;
        var drawH = drawW / ratio;
        if (drawH > maxH) {
          drawH = maxH;
          drawW = drawH * ratio;
        }
        var x = M + (CONTENT_W - drawW) / 2;
        doc.addImage(chart.imgURI, 'PNG', x, y, drawW, drawH, undefined, 'FAST');
        y += drawH + 5;
      });
    });

    footer();
    doc.save('A8_Shortcut_Quest_Lernnachweis_' + safeFileName(student) + '.pdf');
  }

  async function generatePdf(button) {
    if (EXPORTING) return;
    EXPORTING = true;
    var originalText = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'PDF wird erstellt …';
    }

    try {
      var student = window.prompt('Bitte gib deinen Vornamen für den Lernnachweis ein:', '');
      if (!student) return;
      await ensureJsPdf();
      var snapshots = await captureAllReportTabs();
      var chartCount = snapshots.reduce(function (sum, tab) { return sum + ((tab.chartImages || []).length); }, 0);
      if (!snapshots.length) throw new Error('Keine Reportdaten gefunden.');
      drawPdf(student, snapshots);
      console.info('A8 PDF erstellt:', snapshots.length + ' Report-Tabs, ' + chartCount + ' Grafiken.');
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
    button.textContent = '📄 PDF Lernnachweis';
    button.title = 'Alle Statistiken, Tabellen und Grafiken als PDF exportieren';
    button.addEventListener('click', function () { generatePdf(button); });
    actions.insertBefore(button, actions.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installButton);
  } else {
    installButton();
  }

  var observer = new MutationObserver(function () { installButton(); });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
