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
