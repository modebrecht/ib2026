/*
 * Standalone PDF direct-download engine (canvas + jsPDF, no window.print()).
 * Same technique as tk/xp.js: draw onto an offscreen canvas, embed it into a
 * jsPDF document, and trigger pdf.save() directly - no OS print dialog, no
 * "Save as PDF" destination picker. That dialog is what confuses students
 * into thinking the download failed or into printing a physical page.
 *
 * Deliberately has zero page-lifecycle side effects (no DOMContentLoaded
 * listeners, no globals besides the functions below) so it can be included
 * on any worksheet - including ones that don't use worksheet-common.js -
 * without risking double-initialization.
 */

var PDF_PAGE_W = 1240;   // A4 @ ~150dpi, portrait
var PDF_PAGE_H = 1754;
var PDF_MARGIN = 70;

function pdfWrapText(ctx, text, maxWidth) {
    var paragraphs = String(text || '').split('\n');
    var lines = [];
    paragraphs.forEach(function (para) {
        if (para.trim() === '') { lines.push(''); return; }
        var words = para.split(' ');
        var current = '';
        words.forEach(function (word) {
            var test = current ? current + ' ' + word : word;
            if (current && ctx.measureText(test).width > maxWidth) {
                lines.push(current);
                current = word;
            } else {
                current = test;
            }
        });
        if (current) lines.push(current);
    });
    return lines;
}

function pdfCreatePageCanvas() {
    var canvas = document.createElement('canvas');
    canvas.width = PDF_PAGE_W;
    canvas.height = PDF_PAGE_H;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PDF_PAGE_W, PDF_PAGE_H);
    return { canvas: canvas, ctx: ctx };
}

function pdfEnsureJsPdfLoaded(callback) {
    if (window.jspdf) { callback(); return; }
    var script = document.createElement('script');
    script.src = 'assets/js/jspdf.umd.min.js';
    script.onload = callback;
    document.head.appendChild(script);
}

/*
 * Rendert ein vollständiges Arbeitsblatt als direkt herunterladbares,
 * mehrseitiges PDF - kein window.print(), kein Druckdialog.
 *
 * opts = {
 *   title: 'Aufbau eines Computers',
 *   filenamePrefix: 'A3_Computeraufbau',
 *   sections: [
 *     { heading: '1. Prozessor (CPU)', fields: [
 *       { label: 'Funktion', value: '...' },
 *       { label: 'Analogie', value: '...', optional: true }
 *     ] }
 *   ]
 * }
 */
function downloadTextWorksheetPDF(opts) {
    var studentName = (document.getElementById('studentName') || {}).value || '';
    var studentClass = (document.getElementById('studentClass') || {}).value || 'B24';
    var studentDate = (document.getElementById('studentDate') || {}).value || '';

    pdfEnsureJsPdfLoaded(function () {
        var pages = [];
        var page = pdfCreatePageCanvas();
        var ctx = page.ctx;
        var contentW = PDF_PAGE_W - PDF_MARGIN * 2;
        var y;

        function drawPageHeader(isFirst) {
            ctx.textAlign = 'left';
            ctx.fillStyle = '#0f172a';
            ctx.font = '700 15px "Segoe UI", Arial, sans-serif';
            ctx.fillText('INFORMATIK B25', PDF_MARGIN, 40);

            ctx.textAlign = 'right';
            ctx.fillStyle = '#64748b';
            ctx.font = '600 13px "Segoe UI", Arial, sans-serif';
            ctx.fillText((studentName || 'Unbenannt') + '  ·  Klasse ' + studentClass + '  ·  ' + studentDate, PDF_PAGE_W - PDF_MARGIN, 40);

            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(PDF_MARGIN, 55);
            ctx.lineTo(PDF_PAGE_W - PDF_MARGIN, 55);
            ctx.stroke();

            ctx.textAlign = 'left'; // reset - all content below is left-aligned, regardless of page

            if (isFirst) {
                ctx.fillStyle = '#0f172a';
                ctx.font = '800 30px "Segoe UI", Arial, sans-serif';
                ctx.fillText(opts.title, PDF_MARGIN, 100);
                return 130;
            }
            return 80;
        }

        y = drawPageHeader(true);

        function finalizePage() {
            pages.push(page.canvas.toDataURL('image/png'));
        }

        function newPage() {
            finalizePage();
            page = pdfCreatePageCanvas();
            ctx = page.ctx;
            y = drawPageHeader(false);
        }

        function ensureSpace(neededHeight) {
            if (y + neededHeight > PDF_PAGE_H - PDF_MARGIN) newPage();
        }

        (opts.sections || []).forEach(function (section) {
            ctx.font = '800 16px "Segoe UI", Arial, sans-serif';
            var headingLines = pdfWrapText(ctx, section.heading, contentW);
            ensureSpace(22 * headingLines.length + 6);
            ctx.fillStyle = '#1d4ed8';
            headingLines.forEach(function (line) {
                ensureSpace(22);
                ctx.fillText(line, PDF_MARGIN, y);
                y += 22;
            });
            y += 6;

            (section.fields || []).forEach(function (field) {
                var value = (field.value || '').trim();
                if (!value && field.optional) return; // leere optionale Felder werden ausgelassen

                ctx.font = '700 12px "Segoe UI", Arial, sans-serif';
                ensureSpace(18);
                ctx.fillStyle = '#475569';
                ctx.fillText(field.label + ':', PDF_MARGIN, y);
                y += 18;

                ctx.font = '400 13px "Segoe UI", Arial, sans-serif';
                var lines = pdfWrapText(ctx, value || '(keine Angabe)', contentW - 10);
                ctx.fillStyle = value ? '#0f172a' : '#94a3b8';
                lines.forEach(function (line) {
                    ensureSpace(19);
                    ctx.fillText(line, PDF_MARGIN + 10, y);
                    y += 19;
                });
                y += 10;
            });

            y += 12;
            ensureSpace(1);
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(PDF_MARGIN, y);
            ctx.lineTo(PDF_PAGE_W - PDF_MARGIN, y);
            ctx.stroke();
            y += 18;
        });

        finalizePage();

        var jsPDF = window.jspdf.jsPDF;
        var pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pages.forEach(function (imgData, i) {
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        });

        var safeName = (studentName || 'Unbenannt').replace(/[^a-zA-Z0-9]/g, '_');
        pdf.save((opts.filenamePrefix || 'Arbeitsblatt') + '_' + safeName + '.pdf');
    });
}

/*
 * Rendert ein kompaktes Ergebnis-Zertifikat (Kopf + Schüler-Info + beliebige
 * Ergebnis-Blöcke: Tabelle / Statistik-Kacheln / Zusammenfassung / Fliesstext)
 * als direkt herunterladbares PDF - kein window.print(). Gedacht für
 * Spiel-/Quiz-Auswertungen wie A1 (Memory) und A4 (Kabel-Quiz), im Gegensatz
 * zu downloadTextWorksheetPDF() für volle Arbeitsblätter mit Freitextfeldern.
 *
 * opts = {
 *   icon: '🏆', title: 'Leistungsnachweis • IT-Hardware Memory',
 *   subtitle: 'Informatische Bildung • IT-Hardware • A1',
 *   badge: '✅ Modi absolviert', badgeOk: true,
 *   filenamePrefix: 'A1_Leistungsnachweis',
 *   blocks: [
 *     { type: 'table', heading: '...', headers: [...], colWidths: [...], rows: [[...], ...] },
 *     { type: 'stats', items: [{ label, value, color }] },
 *     { type: 'summary', label: '...', value: '...', note: '...' },
 *     { type: 'text', heading: '...', lines: ['...'] }
 *   ]
 * }
 */
function downloadCertificatePDF(opts) {
    var studentName = (document.getElementById('studentName') || {}).value || 'Unbekannt';
    var studentClass = (document.getElementById('studentClass') || {}).value || 'B24';
    var studentDate = (document.getElementById('studentDate') || {}).value || '';

    pdfEnsureJsPdfLoaded(function () {
        var pages = [];
        var page = pdfCreatePageCanvas();
        var ctx = page.ctx;
        var contentW = PDF_PAGE_W - PDF_MARGIN * 2;
        var y = PDF_MARGIN;

        function drawFooter() {
            var footerY = PDF_PAGE_H - PDF_MARGIN - 12;
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(PDF_MARGIN, footerY - 18);
            ctx.lineTo(PDF_PAGE_W - PDF_MARGIN, footerY - 18);
            ctx.stroke();

            ctx.textAlign = 'left';
            ctx.fillStyle = '#94a3b8';
            ctx.font = '400 9px "Segoe UI", Arial, sans-serif';
            ctx.fillText('Generiert am ' + new Date().toLocaleString('de-CH') + ' • Digitaler Leistungsnachweis IB2026', PDF_MARGIN, footerY);

            ctx.textAlign = 'right';
            ctx.fillText('Unterschrift Lehrperson: ______________________', PDF_PAGE_W - PDF_MARGIN, footerY);
            ctx.textAlign = 'left';
        }

        function finalizePage() {
            drawFooter();
            pages.push(page.canvas.toDataURL('image/png'));
        }

        function newPage() {
            finalizePage();
            page = pdfCreatePageCanvas();
            ctx = page.ctx;
            y = PDF_MARGIN;
        }

        function ensureSpace(neededHeight) {
            if (y + neededHeight > PDF_PAGE_H - PDF_MARGIN - 40) newPage(); // -40: Platz fuer Fusszeile reservieren
        }

        // Kopfbereich: Icon + Titel/Untertitel links, Status-Badge rechts
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 22px "Segoe UI", Arial, sans-serif';
        ctx.fillText((opts.icon ? opts.icon + '  ' : '') + opts.title, PDF_MARGIN, y + 18);
        ctx.font = '600 12px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(opts.subtitle || '', PDF_MARGIN, y + 38);

        ctx.textAlign = 'right';
        ctx.fillStyle = opts.badgeOk ? '#059669' : '#dc2626';
        ctx.font = '700 13px "Segoe UI", Arial, sans-serif';
        ctx.fillText(opts.badge || '', PDF_PAGE_W - PDF_MARGIN, y + 18);
        ctx.textAlign = 'left';

        y += 55;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(PDF_MARGIN, y);
        ctx.lineTo(PDF_PAGE_W - PDF_MARGIN, y);
        ctx.stroke();
        y += 30;

        // Schüler-Info-Zeile (Name / Klasse / Datum)
        var infoColW = contentW / 3;
        [['Schüler / Schülerin', studentName], ['Klasse', studentClass], ['Datum', studentDate]].forEach(function (pair, i) {
            var x = PDF_MARGIN + i * infoColW;
            ctx.fillStyle = '#94a3b8';
            ctx.font = '700 10px "Segoe UI", Arial, sans-serif';
            ctx.fillText(pair[0].toUpperCase(), x, y);
            ctx.fillStyle = '#0f172a';
            ctx.font = '800 14px "Segoe UI", Arial, sans-serif';
            ctx.fillText(pair[1], x, y + 20);
        });
        y += 50;

        (opts.blocks || []).forEach(function (block) {
            if (block.type === 'table') {
                if (block.heading) {
                    ensureSpace(24);
                    ctx.fillStyle = '#0f172a';
                    ctx.font = '800 14px "Segoe UI", Arial, sans-serif';
                    ctx.fillText(block.heading, PDF_MARGIN, y);
                    y += 24;
                }
                var cols = block.headers.length;
                var colWidths = block.colWidths || block.headers.map(function () { return contentW / cols; });
                var rowH = 26;

                ensureSpace(rowH);
                ctx.fillStyle = '#1d4ed8';
                ctx.fillRect(PDF_MARGIN, y - 17, contentW, rowH);
                ctx.fillStyle = '#ffffff';
                ctx.font = '700 10px "Segoe UI", Arial, sans-serif';
                var hx = PDF_MARGIN + 8;
                block.headers.forEach(function (h, i) {
                    ctx.fillText(h, hx, y);
                    hx += colWidths[i];
                });
                y += rowH;

                block.rows.forEach(function (row, ri) {
                    ensureSpace(rowH);
                    if (ri % 2 === 1) {
                        ctx.fillStyle = '#f8fafc';
                        ctx.fillRect(PDF_MARGIN, y - 17, contentW, rowH);
                    }
                    ctx.fillStyle = '#1e293b';
                    ctx.font = '600 10px "Segoe UI", Arial, sans-serif';
                    var cx = PDF_MARGIN + 8;
                    row.forEach(function (cell, i) {
                        ctx.fillText(String(cell), cx, y);
                        cx += colWidths[i];
                    });
                    y += rowH;
                });
                y += 20;

            } else if (block.type === 'stats') {
                ensureSpace(55);
                var n = block.items.length;
                var sw = contentW / n;
                ctx.textAlign = 'center';
                block.items.forEach(function (item, i) {
                    var x = PDF_MARGIN + i * sw + sw / 2;
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '700 10px "Segoe UI", Arial, sans-serif';
                    ctx.fillText(String(item.label).toUpperCase(), x, y);
                    ctx.fillStyle = item.color || '#0f172a';
                    ctx.font = '800 20px "Segoe UI", Arial, sans-serif';
                    ctx.fillText(String(item.value), x, y + 26);
                });
                ctx.textAlign = 'left';
                y += 60;

            } else if (block.type === 'summary') {
                ensureSpace(55);
                ctx.fillStyle = '#eff6ff';
                ctx.fillRect(PDF_MARGIN, y - 15, contentW, 50);
                ctx.fillStyle = '#0f172a';
                ctx.font = '700 11px "Segoe UI", Arial, sans-serif';
                ctx.fillText(block.label || '', PDF_MARGIN + 14, y + 3);
                ctx.font = '400 10px "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = '#475569';
                ctx.fillText(block.note || '', PDF_MARGIN + 14, y + 22);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#1d4ed8';
                ctx.font = '800 19px "Segoe UI", Arial, sans-serif';
                ctx.fillText(block.value || '', PDF_PAGE_W - PDF_MARGIN - 14, y + 15);
                ctx.textAlign = 'left';
                y += 65;

            } else if (block.type === 'text') {
                if (block.heading) {
                    ensureSpace(22);
                    ctx.fillStyle = '#be123c';
                    ctx.font = '800 12px "Segoe UI", Arial, sans-serif';
                    ctx.fillText(block.heading, PDF_MARGIN, y);
                    y += 22;
                }
                ctx.font = '400 11px "Segoe UI", Arial, sans-serif';
                ctx.fillStyle = '#334155';
                (block.lines || []).forEach(function (line) {
                    var wrapped = pdfWrapText(ctx, line, contentW - 10);
                    wrapped.forEach(function (l) {
                        ensureSpace(17);
                        ctx.fillText(l, PDF_MARGIN + 10, y);
                        y += 17;
                    });
                    y += 5;
                });
                y += 8;
            }
        });

        finalizePage();

        var jsPDF = window.jspdf.jsPDF;
        var pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pages.forEach(function (imgData, i) {
            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        });

        var safeName = (studentName || 'Unbenannt').replace(/[^a-zA-Z0-9]/g, '_');
        pdf.save((opts.filenamePrefix || 'Zertifikat') + '_' + safeName + '.pdf');
    });
}
