from pathlib import Path
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

OUT = Path('tk2/P1.docx')
ACCENT='1D4ED8'; DARK='0F172A'; MUTED='64748B'; LIGHT='EFF6FF'; BORDER='CBD5E1'; GREEN='15803D'

def shade(cell, fill):
    pr=cell._tc.get_or_add_tcPr(); shd=pr.find(qn('w:shd'))
    if shd is None: shd=OxmlElement('w:shd'); pr.append(shd)
    shd.set(qn('w:fill'),fill)

def borders(cell, **edges):
    pr=cell._tc.get_or_add_tcPr(); b=pr.first_child_found_in('w:tcBorders')
    if b is None: b=OxmlElement('w:tcBorders'); pr.append(b)
    for edge,data in edges.items():
        el=b.find(qn('w:'+edge))
        if el is None: el=OxmlElement('w:'+edge); b.append(el)
        for k,v in data.items(): el.set(qn('w:'+k),str(v))

def margins(cell, top=90, start=90, bottom=90, end=90):
    pr=cell._tc.get_or_add_tcPr(); m=pr.first_child_found_in('w:tcMar')
    if m is None: m=OxmlElement('w:tcMar'); pr.append(m)
    for name,val in [('top',top),('start',start),('bottom',bottom),('end',end)]:
        el=m.find(qn('w:'+name))
        if el is None: el=OxmlElement('w:'+name); m.append(el)
        el.set(qn('w:w'),str(val)); el.set(qn('w:type'),'dxa')

def cant_split(row):
    pr=row._tr.get_or_add_trPr()
    if pr.find(qn('w:cantSplit')) is None: pr.append(OxmlElement('w:cantSplit'))

def keep_next(p):
    pr=p._p.get_or_add_pPr()
    if pr.find(qn('w:keepNext')) is None: pr.append(OxmlElement('w:keepNext'))

def widths(table, values):
    table.autofit=False; pr=table._tbl.tblPr
    lay=pr.find(qn('w:tblLayout'))
    if lay is None: lay=OxmlElement('w:tblLayout'); pr.append(lay)
    lay.set(qn('w:type'),'fixed')
    tw=pr.find(qn('w:tblW'))
    if tw is None: tw=OxmlElement('w:tblW'); pr.append(tw)
    tw.set(qn('w:type'),'dxa'); tw.set(qn('w:w'),str(Cm(sum(values)).twips))
    for i,w in enumerate(values):
        table.columns[i].width=Cm(w)
        for row in table.rows: row.cells[i].width=Cm(w); cant_split(row)

def page_field(p):
    r=p.add_run('Seite '); r.font.size=Pt(8); r.font.color.rgb=RGBColor.from_string(MUTED)
    a=OxmlElement('w:fldChar'); a.set(qn('w:fldCharType'),'begin')
    t=OxmlElement('w:instrText'); t.set(qn('xml:space'),'preserve'); t.text=' PAGE '
    z=OxmlElement('w:fldChar'); z.set(qn('w:fldCharType'),'end')
    r._r.extend([a,t,z])

def rules(doc,n=1):
    for _ in range(n):
        p=doc.add_paragraph('________________________________________________________________________________')
        p.paragraph_format.space_after=Pt(3); p.runs[0].font.size=Pt(9); p.runs[0].font.color.rgb=RGBColor.from_string('94A3B8')

doc=Document(); sec=doc.sections[0]
sec.page_width=Cm(21); sec.page_height=Cm(29.7); sec.top_margin=Cm(1.25); sec.bottom_margin=Cm(1.25); sec.left_margin=Cm(1.55); sec.right_margin=Cm(1.55)
styles=doc.styles; styles['Normal'].font.name='Arial'; styles['Normal']._element.rPr.rFonts.set(qn('w:eastAsia'),'Arial'); styles['Normal'].font.size=Pt(10); styles['Normal'].paragraph_format.space_after=Pt(4)
for name in ['Heading 1','Heading 2','Heading 3']:
    styles[name].font.name='Arial'; styles[name]._element.rPr.rFonts.set(qn('w:eastAsia'),'Arial')
styles['Heading 1'].font.size=Pt(15); styles['Heading 1'].font.bold=True; styles['Heading 1'].font.color.rgb=RGBColor.from_string(DARK); styles['Heading 1'].paragraph_format.space_before=Pt(9); styles['Heading 1'].paragraph_format.space_after=Pt(5)
styles['Heading 2'].font.size=Pt(11.5); styles['Heading 2'].font.bold=True; styles['Heading 2'].font.color.rgb=RGBColor.from_string(ACCENT); styles['Heading 2'].paragraph_format.space_before=Pt(6); styles['Heading 2'].paragraph_format.space_after=Pt(3)

p=sec.footer.paragraphs[0]; p.text='P1 · Übungstest Tastenkombinationen · '; p.runs[0].font.name='Arial'; p.runs[0].font.size=Pt(8); p.runs[0].font.color.rgb=RGBColor.from_string(MUTED); page_field(p)

band=doc.add_table(rows=1,cols=1); band.alignment=WD_TABLE_ALIGNMENT.CENTER; widths(band,[17.2]); c=band.cell(0,0); shade(c,DARK); margins(c,190,220,190,220)
p=c.paragraphs[0]; r=p.add_run('P1  |  ÜBUNGSTEST TASTENKOMBINATIONEN'); r.bold=True; r.font.size=Pt(19); r.font.color.rgb=RGBColor(255,255,255); r.font.name='Arial'
p=c.add_paragraph(); p.paragraph_format.space_before=Pt(2); p.paragraph_format.space_after=Pt(0); r=p.add_run('Tastenkombinationen A1-A7  ·  ca. 35-40 Minuten  ·  ohne Kursseiten oder Merkblatt'); r.font.size=Pt(9.2); r.font.color.rgb=RGBColor(203,213,225); r.font.name='Arial'
doc.add_paragraph().paragraph_format.space_after=Pt(0)

meta=doc.add_table(rows=1,cols=3); meta.alignment=WD_TABLE_ALIGNMENT.CENTER; widths(meta,[8.0,4.0,5.2])
for i,label in enumerate(['Vorname / Name','Klasse','Datum']):
    c=meta.cell(0,i); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER; margins(c,110,120,120,120); borders(c,bottom={'val':'single','sz':'8','color':BORDER})
    p=c.paragraphs[0]; r=p.add_run(label.upper()); r.font.size=Pt(7.5); r.bold=True; r.font.color.rgb=RGBColor.from_string(MUTED)
    p=c.add_paragraph('____________________________'); p.paragraph_format.space_before=Pt(5); p.paragraph_format.space_after=Pt(0); p.runs[0].font.size=Pt(8); p.runs[0].font.color.rgb=RGBColor.from_string('94A3B8')

score=doc.add_table(rows=1,cols=3); score.alignment=WD_TABLE_ALIGNMENT.CENTER; widths(score,[8.0,4.0,5.2])
for i,(lab,val) in enumerate([('ERREICHTE PUNKTE','_____ / 41'),('GESAMTPUNKTE','41'),('NOTE','_____')]):
    c=score.cell(0,i); shade(c,LIGHT if i!=2 else 'ECFDF5'); margins(c,120,120,120,120)
    edge={'val':'single','sz':'5','color':'BFDBFE'}; borders(c,top=edge,bottom=edge,left=edge,right=edge)
    p=c.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run(lab+'\n'); r.font.size=Pt(7.5); r.bold=True; r.font.color.rgb=RGBColor.from_string(MUTED)
    r=p.add_run(val); r.font.size=Pt(15); r.bold=True; r.font.color.rgb=RGBColor.from_string(GREEN if i==2 else DARK)

p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(7); p.paragraph_format.space_after=Pt(3); r=p.add_run('NOTENSCHLÜSSEL'); r.bold=True; r.font.size=Pt(8); r.font.color.rgb=RGBColor.from_string(MUTED)
t=doc.add_table(rows=2,cols=6); t.alignment=WD_TABLE_ALIGNMENT.CENTER; widths(t,[17.2/6]*6)
for j,(pts,grade) in enumerate(zip(['41 P','33 P','25 P','17 P','9 P','0 P'],['6.0','5.0','4.0','3.0','2.0','1.0'])):
    for i,text in enumerate([pts,grade]):
        c=t.cell(i,j); margins(c,65,50,65,50); edge={'val':'single','sz':'4','color':BORDER}; borders(c,top=edge,bottom=edge,left=edge,right=edge)
        if i==0: shade(c,'F8FAFC')
        p=c.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run(text); r.font.size=Pt(8.5); r.bold=(i==1); r.font.color.rgb=RGBColor.from_string(DARK if i else MUTED)
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.RIGHT; p.paragraph_format.space_before=Pt(2); p.paragraph_format.space_after=Pt(7); r=p.add_run('Linear: Note = 1 + 5 × (erreichte Punkte / 41)  ·  60 % = Note 4.0'); r.font.size=Pt(7.5); r.font.color.rgb=RGBColor.from_string(MUTED)

def heading(n,title,pts,break_before=False):
    p=doc.add_paragraph(style='Heading 1'); p.paragraph_format.page_break_before=break_before; keep_next(p); p.add_run(f'{n}. {title}'); r=p.add_run(f'   {pts} P'); r.font.size=Pt(10); r.font.color.rgb=RGBColor.from_string(ACCENT)

def instruction(text):
    p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(5); keep_next(p); r=p.add_run(text); r.font.size=Pt(9.5); r.font.color.rgb=RGBColor.from_string(MUTED)

def mc(title,opts):
    p=doc.add_paragraph(style='Heading 2'); p.add_run(title); keep_next(p)
    for opt in opts:
        p=doc.add_paragraph(); p.paragraph_format.left_indent=Cm(.15); p.paragraph_format.space_after=Pt(1.4); p.add_run('☐  '+opt).font.size=Pt(8.9)

def scenario(title,text,opts):
    p=doc.add_paragraph(style='Heading 2'); p.add_run(title); keep_next(p)
    p=doc.add_paragraph(text); p.paragraph_format.space_after=Pt(2.5); p.runs[0].font.size=Pt(9.1)
    for opt in opts:
        p=doc.add_paragraph(); p.paragraph_format.left_indent=Cm(.18); p.paragraph_format.space_after=Pt(1.3); p.add_run('☐  '+opt).font.size=Pt(9.1)

heading(1,'Was macht dieses Tastenkürzel?',4); instruction('Kreuze jeweils die richtige Aussage an. Genau eine Aussage ist korrekt.')
for title,opts in [
('Ctrl + C',['Kopiert markierte Inhalte.','Fügt kopierte Inhalte ein.','Schliesst die aktuelle Anwendung.']),
('Ctrl + V',['Speichert das Dokument.','Fügt kopierte oder ausgeschnittene Inhalte ein.','Macht den letzten Schritt rückgängig.']),
('Ctrl + X',['Schneidet markierte Inhalte aus.','Sucht nach einem Begriff.','Öffnet eine Datei.']),
('Ctrl + Z',['Macht den letzten Schritt rückgängig.','Markiert alles.','Druckt das Dokument.'])]: mc(title,opts)

heading(2,'Tastenkombinationen im Alltag',6,True); instruction('Wähle jeweils die sinnvollste Tastenkombination.')
for row in [
('1. Dokument sichern','Elena arbeitet seit längerer Zeit an einem wichtigen Dokument. Bevor sie weiterarbeitet, möchte sie den aktuellen Stand speichern.',['Ctrl + S','Ctrl + P','Ctrl + O']),
('2. Alles formatieren','Jan möchte den gesamten Text seines Dokuments markieren, um die Schriftart für alles gleichzeitig zu ändern.',['Ctrl + A','Ctrl + F','Ctrl + C']),
('3. Begriff finden','Amir hat ein sechsseitiges Dokument geöffnet. Er sucht darin nach dem Begriff „Datenschutz“.',['Ctrl + F','Ctrl + H','Ctrl + L']),
('4. Direkt ans Ende','Sophie arbeitet an einem sehr langen Bericht. Sie befindet sich weit oben und möchte direkt ganz ans Ende des Dokuments springen.',['Ctrl + End','Ctrl + Home','Ctrl + ↓']),
('5. Ohne fremde Formatierung','Tim kopiert Text von einer Webseite nach Word. Die fremde Schriftart und Formatierung soll möglichst nicht übernommen werden.',['Ctrl + Shift + V','Ctrl + V','Ctrl + Shift + C']),
('6. Doch wiederherstellen','Luca hat einen Schritt rückgängig gemacht und merkt, dass er ihn doch behalten wollte.',['Ctrl + Y','Ctrl + Z','Ctrl + S'])]: scenario(*row)

heading(3,'Sonderzeichen mit AltGr',8,True); instruction('Ergänze jeweils die zweite Taste auf einer Schweizer Tastatur.')
t=doc.add_table(rows=0,cols=2); t.alignment=WD_TABLE_ALIGNMENT.CENTER; widths(t,[7.6,9.6])
for i,char in enumerate(['@','#','€','|','\\','[','{','°'],1):
    cells=t.add_row().cells
    for c in cells: margins(c,70,90,70,90); borders(c,bottom={'val':'single','sz':'4','color':BORDER}); cant_split(t.rows[-1])
    cells[0].paragraphs[0].add_run(f'{i}.  {char}').font.size=Pt(9.3); cells[1].paragraphs[0].add_run('AltGr + __________________').font.size=Pt(9.3)

heading(4,'Programme & Browser',4); instruction('Wähle die passendste Tastenkombination.')
for row in [
('1. Neues Word-Dokument','Du möchtest in Word ein neues Dokument erstellen.',['Ctrl + N','Ctrl + T','Ctrl + W']),
('2. Neuer Browser-Tab','Du möchtest im Browser einen neuen Tab öffnen.',['Ctrl + N','Ctrl + T','Ctrl + L']),
('3. Webseite neu laden','Du möchtest die aktuelle Webseite neu laden.',['F5','Ctrl + F','Win + D']),
('4. Adresse markieren','Du möchtest sofort die gesamte Adresse im Browser markieren.',['Ctrl + L','Ctrl + F','Ctrl + T'])]: scenario(*row)

heading(5,'Windows & Arbeitsalltag',5,True); instruction('Schreibe die passende Tastenkombination auf.')
t=doc.add_table(rows=0,cols=2); t.alignment=WD_TABLE_ALIGNMENT.CENTER; widths(t,[12.5,4.7])
for i,text in enumerate(['Desktop anzeigen','Datei-Explorer öffnen','Einen Bildschirmausschnitt aufnehmen','Task-Manager direkt öffnen','Verlauf der Zwischenablage öffnen'],1):
    cells=t.add_row().cells
    for c in cells: margins(c,75,90,75,90); borders(c,bottom={'val':'single','sz':'4','color':BORDER}); cant_split(t.rows[-1])
    cells[0].paragraphs[0].add_run(f'{i}. {text}').font.size=Pt(9.1); cells[1].paragraphs[0].add_run('________________').font.size=Pt(9.1)

heading(6,'In eigenen Sätzen',6); instruction('Erkläre jeweils in einem eigenen Satz, was die Tastenkombination bewirkt. Je 1 Punkt.')
t=doc.add_table(rows=0,cols=2); t.alignment=WD_TABLE_ALIGNMENT.CENTER; widths(t,[3.3,13.9])
for i,key in enumerate(['Ctrl + H','Ctrl + P','Ctrl + O','Win + ←','Win + ↑','Win + ↓'],1):
    cells=t.add_row().cells
    for c in cells: margins(c,105,90,105,90); borders(c,bottom={'val':'single','sz':'4','color':BORDER}); cant_split(t.rows[-1])
    r=cells[0].paragraphs[0].add_run(f'{i}. {key}'); r.bold=True; r.font.size=Pt(9.2); r.font.color.rgb=RGBColor.from_string(ACCENT)
    cells[1].paragraphs[0].add_run('________________________________________________________________').font.size=Pt(8.8)

heading(7,'Nicht verwechseln',4); instruction('Erkläre jeweils kurz den Unterschied. Pro Teilaufgabe sind 2 Punkte möglich.')
p=doc.add_paragraph(style='Heading 2'); p.add_run('A) Ctrl + Tab und Alt + Tab'); keep_next(p)
p=doc.add_paragraph('Du hast mehrere Browser-Tabs geöffnet und gleichzeitig Word und PowerPoint gestartet. Wann verwendest du Ctrl + Tab und wann Alt + Tab?'); p.runs[0].font.size=Pt(9.3); rules(doc,3)
p=doc.add_paragraph(style='Heading 2'); p.add_run('B) Ctrl + W und Alt + F4'); keep_next(p)
p=doc.add_paragraph('Du arbeitest in einem Browser mit mehreren Tabs. Was schliesst Ctrl + W typischerweise und was schliesst Alt + F4?'); p.runs[0].font.size=Pt(9.3); rules(doc,3)

heading(8,'Transfer',4,True); instruction('Nenne jeweils die sinnvollste Tastenkombination und begründe kurz.')
for title,text in [
('A) Präsentation vorbereiten - 2 P','Nina bereitet eine Präsentation vor. Im Browser recherchiert sie Informationen und in PowerPoint erstellt sie gleichzeitig ihre Folien. Sie möchte möglichst schnell zwischen Browser und PowerPoint wechseln, ohne die Maus zu verwenden.'),
('B) Arbeitsplatz verlassen - 2 P','David arbeitet im Schulzimmer an mehreren geöffneten Dokumenten. Er geht für zwei Minuten aus dem Raum. Die Programme sollen geöffnet bleiben, aber niemand soll seinen Computer benutzen können.')]:
    p=doc.add_paragraph(style='Heading 2'); p.add_run(title); keep_next(p); p=doc.add_paragraph(text); p.runs[0].font.size=Pt(9.3)
    p=doc.add_paragraph('Tastenkombination: ____________________'); p.runs[0].font.size=Pt(9.3)
    p=doc.add_paragraph('Begründung:'); p.runs[0].bold=True; p.runs[0].font.size=Pt(9.3); rules(doc,2)

p=doc.add_paragraph(style='Heading 1'); p.paragraph_format.space_before=Pt(12); p.add_run('Bonus - max. +2 P')
p=doc.add_paragraph('Zwei freiwillige Transferfragen. Jede richtige Lösung gibt +1 Bonuspunkt.'); p.runs[0].font.size=Pt(9.5); p.runs[0].font.color.rgb=RGBColor.from_string(MUTED)
p=doc.add_paragraph(style='Heading 2'); p.add_run('Bonus 1 - Rettung nach Fehlklick (+1 P)')
p=doc.add_paragraph('Lena recherchiert für eine Arbeit und schliesst versehentlich einen wichtigen Browser-Tab. Welche Tastenkombination bringt den zuletzt geschlossenen Tab zurück?'); p.runs[0].font.size=Pt(9.3); rules(doc,1)
p=doc.add_paragraph(style='Heading 2'); p.add_run('Bonus 2 - Wo war der Anfang? (+1 P)')
p=doc.add_paragraph('Marco arbeitet an einem sehr langen Dokument und befindet sich fast ganz am Ende. Er möchte sofort wieder ganz an den Anfang springen. Welche Tastenkombination verwendet er?'); p.runs[0].font.size=Pt(9.3); rules(doc,1)
p=doc.add_paragraph('Bonuspunkte zählen zusätzlich zu den 41 regulären Punkten. Maximalnote: 6.0.'); p.runs[0].font.size=Pt(8.2); p.runs[0].font.color.rgb=RGBColor.from_string(MUTED)
p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(10); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run('Viel Erfolg!'); r.bold=True; r.font.size=Pt(11); r.font.color.rgb=RGBColor.from_string(ACCENT)

doc.core_properties.title='P1 - Übungstest Tastenkombinationen'; doc.core_properties.subject='Tastenkombinationen A1-A7'; doc.core_properties.author=''; doc.core_properties.keywords='Tastenkombinationen, Übungstest, Informatik'
OUT.parent.mkdir(parents=True,exist_ok=True); doc.save(OUT); print(OUT)
