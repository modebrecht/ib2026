/* Overrides the base PDF renderers so every hardware PDF shares the TK layout. */

function tkResolveMeta(o) {
    var base = tkMeta();
    var src = (o && o.meta) || {};
    return {
        name: src.name || base.name,
        cls: src.cls || src.className || base.cls,
        date: src.date || base.date
    };
}

function tkDrawFieldPanel(pdf, f, m, s, heading, field, imageData) {
    var hi = !!imageData;
    var r = hi && imageData.ratio ? imageData.ratio : 720 / 393;
    var iw = hi ? 72 : 0;
    var ih = hi ? Math.min(52, iw / Math.max(.45, r)) : 0;
    var off = hi ? 79 : 0;
    var tw = TKCW - 12 - off;
    var rv = field.value == null ? '' : String(field.value);
    var lines = pdfWrapText(pdf, rv || '(keine Angabe)', tw, 9.2, 'normal');
    var label = field.label || '';
    var lh = 4;
    var maxBody = Math.max(20, TKBOT - 64);
    var maxLines = Math.max(1, Math.floor((maxBody - 18) / lh));
    var chunks = [];
    for (var i = 0; i < lines.length; i += maxLines) chunks.push(lines.slice(i, i + maxLines));
    if (!chunks.length) chunks.push(['(keine Angabe)']);

    chunks.forEach(function(chunk, ci) {
        var title = heading + (ci ? ' · Fortsetzung' : '');
        var hl = pdfWrapText(pdf, title, TKCW - 12, 11.5, 'bold');
        var hh = Math.max(5.5, hl.length * 5.3);
        var bh = Math.max(ci === 0 ? ih : 0, 4 + chunk.length * 4 + 2, 8);
        var ph = 7 + hh + bh + 6;
        tkSpace(pdf, m.frame, m.meta, s, ph + 4);
        var py = s.y;
        tkPanel(pdf, TKM, py, TKCW, ph);
        var y = py + 7;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11.5);
        tkRgb(pdf, TKC.cyan);
        hl.forEach(function(l) { pdf.text(l, TKM + 6, y); y += 5.3; });
        var by = py + 7 + hh + 2;
        if (ci === 0 && hi) {
            try {
                tkRgb(pdf, TKC.panel2, 'setFillColor');
                pdf.roundedRect(TKM + 6, by, iw, ih, 2, 2, 'F');
                pdf.addImage(imageData.dataUrl, 'JPEG', TKM + 6, by, iw, ih);
                tkRgb(pdf, TKC.line, 'setDrawColor');
                pdf.setLineWidth(.25);
                pdf.roundedRect(TKM + 6, by, iw, ih, 2, 2, 'D');
            } catch (e) {
                console.warn('PDF image add failed:', e);
            }
        }
        var tx = TKM + 6 + (ci === 0 ? off : 0);
        var ty = by;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7.2);
        tkRgb(pdf, TKC.muted);
        pdf.text(pdfSafeText(label).toUpperCase() + (ci ? ' · FORTSETZUNG' : ''), tx, ty + 3.2);
        ty += 4.2;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9.2);
        tkRgb(pdf, rv ? TKC.soft : TKC.muted);
        chunk.forEach(function(l) { pdf.text(l, tx, ty + 3); ty += 4; });
        s.y = py + ph + 4;
    });
}

function downloadTextWorksheetPDF(o) {
    var meta = tkResolveMeta(o);
    pdfEnsureJsPdfLoaded(function() {
        pdfPreloadImages(o.sections || [], function() {
            var P = window.jspdf.jsPDF;
            var pdf = new P({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            var s = { page: 0, y: 0 };
            var frame = {
                title: o.title || 'Arbeitsblatt',
                subtitle: o.subtitle || 'Informatische Bildung · IT-Hardware'
            };
            var ctx = { frame: frame, meta: meta };
            tkNew(pdf, frame, meta, s);

            (o.sections || []).forEach(function(sec) {
                var hi = !!sec._imgData;
                var r = hi && sec._imgData.ratio ? sec._imgData.ratio : 720 / 393;
                var iw = hi ? 72 : 0;
                var ih = hi ? Math.min(52, iw / Math.max(.45, r)) : 0;
                var off = hi ? 79 : 0;
                var tw = TKCW - 12 - off;
                var hl = pdfWrapText(pdf, sec.heading || '', TKCW - 12, 11.5, 'bold');
                var hh = Math.max(5.5, hl.length * 5.3);
                var fd = [];
                var fh = 0;

                (sec.fields || []).forEach(function(x) {
                    var rv = x.value == null ? '' : String(x.value);
                    if (!rv && x.optional) return;
                    var ls = pdfWrapText(pdf, rv || '(keine Angabe)', tw, 9.2, 'normal');
                    var h = 4 + Math.max(1, ls.length) * 4 + 2;
                    fd.push({ label: x.label || '', value: rv, lines: ls, h: h });
                    fh += h;
                });

                var bh = Math.max(ih, fh, 8);
                var ph = 7 + hh + bh + 6;
                var maxPanelH = TKBOT - 58;

                if (ph <= maxPanelH) {
                    tkSpace(pdf, frame, meta, s, ph + 4);
                    var py = s.y;
                    tkPanel(pdf, TKM, py, TKCW, ph);
                    var y = py + 7;
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(11.5);
                    tkRgb(pdf, TKC.cyan);
                    hl.forEach(function(l) { pdf.text(l, TKM + 6, y); y += 5.3; });
                    var by = py + 7 + hh + 2;
                    if (hi) {
                        try {
                            tkRgb(pdf, TKC.panel2, 'setFillColor');
                            pdf.roundedRect(TKM + 6, by, iw, ih, 2, 2, 'F');
                            pdf.addImage(sec._imgData.dataUrl, 'JPEG', TKM + 6, by, iw, ih);
                            tkRgb(pdf, TKC.line, 'setDrawColor');
                            pdf.setLineWidth(.25);
                            pdf.roundedRect(TKM + 6, by, iw, ih, 2, 2, 'D');
                        } catch (e) {
                            console.warn('PDF image add failed:', e);
                        }
                    }
                    var tx = TKM + 6 + off;
                    var ty = by;
                    fd.forEach(function(x) {
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(7.2);
                        tkRgb(pdf, TKC.muted);
                        pdf.text(pdfSafeText(x.label).toUpperCase(), tx, ty + 3.2);
                        ty += 4.2;
                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(9.2);
                        tkRgb(pdf, x.value ? TKC.soft : TKC.muted);
                        x.lines.forEach(function(l) { pdf.text(l, tx, ty + 3); ty += 4; });
                        ty += 2;
                    });
                    s.y = py + ph + 4;
                    return;
                }

                if (!fd.length) {
                    fd.push({ label: '', value: '', lines: ['(keine Angabe)'], h: 10 });
                }
                fd.forEach(function(x, i) {
                    tkDrawFieldPanel(pdf, x, ctx, s, sec.heading || 'Abschnitt', {
                        label: x.label,
                        value: x.value
                    }, i === 0 ? sec._imgData : null);
                });
            });

            pdf.save((o.filenamePrefix || 'Arbeitsblatt') + '_' + tkFile(meta.name) + '.pdf');
        });
    });
}

function downloadCertificatePDF(o) {
    var meta = tkResolveMeta(o);
    pdfEnsureJsPdfLoaded(function() {
        var P = window.jspdf.jsPDF;
        var pdf = new P({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        var s = { page: 0, y: 0 };
        var f = {
            title: o.title || 'Leistungsnachweis',
            subtitle: o.subtitle || 'Informatische Bildung · IT-Hardware',
            badge: o.badge || '',
            badgeOk: o.badgeOk
        };
        tkNew(pdf, f, meta, s);

        (o.blocks || []).forEach(function(b) {
            if (b.type === 'table') {
                if (b.heading) {
                    tkSpace(pdf, f, meta, s, 10);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(10.5);
                    tkRgb(pdf, TKC.cyan);
                    pdf.text(pdfSafeText(b.heading), TKM, s.y + 4);
                    s.y += 9;
                }
                var hs = b.headers || [];
                if (!hs.length) return;
                var ws = (b.colWidths || hs.map(function() { return 1; })).slice();
                while (ws.length < hs.length) ws.push(1);
                var sum = ws.reduce(function(a, v) { return a + Number(v || 0); }, 0) || hs.length;
                ws = ws.map(function(v) { return TKCW * Number(v || 0) / sum; });
                tkSpace(pdf, f, meta, s, 14);
                tkRgb(pdf, TKC.border2, 'setFillColor');
                pdf.roundedRect(TKM, s.y, TKCW, 9, 1.5, 1.5, 'F');
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(7.4);
                pdf.setTextColor(255, 255, 255);
                var hx = TKM;
                hs.forEach(function(h, i) {
                    var l = pdfWrapText(pdf, h, ws[i] - 4, 7.4, 'bold')[0] || '';
                    pdf.text(l, hx + 2, s.y + 5.8);
                    hx += ws[i];
                });
                s.y += 9;
                (b.rows || []).forEach(function(row, ri) {
                    var cells = [];
                    var mx = 1;
                    row.forEach(function(c, i) {
                        var ls = pdfWrapText(pdf, String(c == null ? '' : c), Math.max(8, ws[i] - 4), 7.6, 'normal');
                        cells.push(ls);
                        mx = Math.max(mx, ls.length);
                    });
                    var rh = Math.max(8, 4 + mx * 3.5);
                    tkSpace(pdf, f, meta, s, rh);
                    tkRgb(pdf, ri % 2 ? TKC.panel2 : TKC.panel, 'setFillColor');
                    pdf.rect(TKM, s.y, TKCW, rh, 'F');
                    tkRgb(pdf, TKC.line, 'setDrawColor');
                    pdf.setLineWidth(.15);
                    pdf.line(TKM, s.y + rh, TKPW - TKM, s.y + rh);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(7.6);
                    tkRgb(pdf, TKC.soft);
                    var cx = TKM;
                    cells.forEach(function(ls, i) {
                        ls.forEach(function(l, li) { pdf.text(l, cx + 2, s.y + 5.2 + li * 3.5); });
                        cx += ws[i];
                    });
                    s.y += rh;
                });
                s.y += 6;
            } else if (b.type === 'stats') {
                var it = b.items || [];
                if (!it.length) return;
                var gap = 3;
                var cw = (TKCW - gap * (it.length - 1)) / it.length;
                var ch = 22;
                tkSpace(pdf, f, meta, s, ch + 6);
                it.forEach(function(x, i) {
                    var px = TKM + i * (cw + gap);
                    tkPanel(pdf, px, s.y, cw, ch, TKC.panel2);
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(6.5);
                    tkRgb(pdf, TKC.muted);
                    pdf.text(pdfSafeText(String(x.label || '')).toUpperCase(), px + cw / 2, s.y + 7, { align: 'center' });
                    var c = x.color ? pdfHexToRgb(x.color) : TKC.cyan;
                    pdf.setFontSize(15);
                    tkRgb(pdf, c);
                    pdf.text(pdfSafeText(String(x.value == null ? '' : x.value)), px + cw / 2, s.y + 16.5, { align: 'center' });
                });
                s.y += ch + 6;
            } else if (b.type === 'summary') {
                var nl = pdfWrapText(pdf, b.note || '', TKCW - 65, 7.5, 'normal');
                var sh = Math.max(19, 12 + nl.length * 3.5);
                tkSpace(pdf, f, meta, s, sh + 5);
                tkPanel(pdf, TKM, s.y, TKCW, sh, TKC.panel2);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(8.3);
                tkRgb(pdf, TKC.soft);
                pdf.text(pdfSafeText(b.label || ''), TKM + 5, s.y + 6.5);
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(7.5);
                tkRgb(pdf, TKC.muted);
                nl.forEach(function(l, i) { pdf.text(l, TKM + 5, s.y + 12 + i * 3.5); });
                if (b.value) {
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(15);
                    tkRgb(pdf, TKC.cyan);
                    pdf.text(pdfSafeText(b.value), TKPW - TKM - 5, s.y + 11, { align: 'right' });
                }
                s.y += sh + 5;
            } else if (b.type === 'text') {
                var ls = [];
                (b.lines || []).forEach(function(line) {
                    pdfWrapText(pdf, line, TKCW - 12, 8.5, 'normal').forEach(function(l) { ls.push(l); });
                    ls.push('');
                });
                if (ls.length && ls[ls.length - 1] === '') ls.pop();
                var th = 9 + (b.heading ? 7 : 0) + Math.max(1, ls.length) * 4;
                if (th <= TKBOT - 60) {
                    tkSpace(pdf, f, meta, s, th + 5);
                    tkPanel(pdf, TKM, s.y, TKCW, th);
                    var yy = s.y + 7;
                    if (b.heading) {
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(10);
                        tkRgb(pdf, TKC.cyan);
                        pdf.text(pdfSafeText(b.heading), TKM + 6, yy);
                        yy += 7;
                    }
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8.5);
                    tkRgb(pdf, TKC.soft);
                    ls.forEach(function(l) { pdf.text(l, TKM + 6, yy); yy += 4; });
                    s.y += th + 5;
                } else {
                    if (b.heading) {
                        tkSpace(pdf, f, meta, s, 9);
                        pdf.setFont('helvetica', 'bold');
                        pdf.setFontSize(10);
                        tkRgb(pdf, TKC.cyan);
                        pdf.text(pdfSafeText(b.heading), TKM, s.y + 4);
                        s.y += 9;
                    }
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(8.5);
                    tkRgb(pdf, TKC.soft);
                    ls.forEach(function(l) {
                        tkSpace(pdf, f, meta, s, 5);
                        pdf.text(l, TKM + 5, s.y + 3.5);
                        s.y += 4.5;
                    });
                    s.y += 4;
                }
            }
        });

        pdf.save((o.filenamePrefix || 'Zertifikat') + '_' + tkFile(meta.name) + '.pdf');
    });
}

function pdfDomControlText(el) {
    if (el.tagName === 'SELECT') {
        var opt = el.options && el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null;
        return opt ? opt.textContent : (el.value || '');
    }
    if (el.type === 'checkbox' || el.type === 'radio') {
        return el.checked ? (el.value && el.value !== 'on' ? el.value : 'Ausgewählt') : '';
    }
    return el.value || '';
}

function pdfExtractDomLines(root) {
    if (!root) return [];
    var lines = [];
    var buf = '';
    var win = root.ownerDocument && root.ownerDocument.defaultView;
    var blockTags = { ADDRESS:1, ARTICLE:1, ASIDE:1, BLOCKQUOTE:1, DIV:1, DL:1, DT:1, DD:1, FIELDSET:1, FIGCAPTION:1, FIGURE:1, FOOTER:1, FORM:1, H1:1, H2:1, H3:1, H4:1, H5:1, H6:1, HEADER:1, HR:1, LI:1, MAIN:1, NAV:1, OL:1, P:1, SECTION:1, TABLE:1, TBODY:1, TD:1, TFOOT:1, TH:1, THEAD:1, TR:1, UL:1 };

    function flush() {
        var clean = pdfSafeText(buf).replace(/\s+/g, ' ').trim();
        if (clean && lines[lines.length - 1] !== clean) lines.push(clean);
        buf = '';
    }

    function hidden(el) {
        if (!el || el.nodeType !== 1) return false;
        if (el.hidden || el.classList.contains('hidden') || el.classList.contains('no-print')) return true;
        if (el.getAttribute('aria-hidden') === 'true') return true;
        try {
            var st = win && win.getComputedStyle ? win.getComputedStyle(el) : null;
            return !!st && (st.display === 'none' || st.visibility === 'hidden');
        } catch (e) { return false; }
    }

    function walk(node) {
        if (!node) return;
        if (node.nodeType === 3) {
            buf += ' ' + (node.nodeValue || '');
            return;
        }
        if (node.nodeType !== 1) return;
        var el = node;
        if (hidden(el)) return;
        if (/^(SCRIPT|STYLE|NOSCRIPT|SVG|CANVAS|IMG|VIDEO|AUDIO)$/.test(el.tagName)) return;
        if (/^(BUTTON)$/.test(el.tagName)) return;
        if (el.tagName === 'BR' || el.tagName === 'HR') { flush(); return; }
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) {
            var v = pdfDomControlText(el);
            if (v) buf += ' ' + v;
            return;
        }
        var isBlock = !!blockTags[el.tagName];
        if (isBlock) flush();
        Array.prototype.forEach.call(el.childNodes, walk);
        if (isBlock) flush();
    }

    walk(root);
    flush();
    return lines.filter(function(line) {
        return line && !/^(Zurück|Weiter|Dunkelmodus|Zurücksetzen)$/i.test(line);
    });
}

function downloadDomWorksheetPDF(o) {
    var root = typeof o.root === 'string' ? document.querySelector(o.root) : o.root;
    var lines = pdfExtractDomLines(root);
    downloadCertificatePDF({
        title: o.title || 'Arbeitsblatt',
        subtitle: o.subtitle || 'Informatische Bildung · IT-Hardware',
        filenamePrefix: o.filenamePrefix || 'Arbeitsblatt',
        meta: o.meta,
        badge: o.badge || '',
        badgeOk: o.badgeOk,
        blocks: [{ type: 'text', heading: o.heading || 'Bearbeitete Inhalte', lines: lines }]
    });
}
