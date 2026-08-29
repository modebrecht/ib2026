from pathlib import Path
import re

from docx import Document
from docx.shared import Cm, Pt
from docx.enum.text import WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

PATH = Path('hw/P1.docx')
SAFE_WIDTH_CM = 17.2


def set_cell_width(cell, width_cm):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_w = tc_pr.find(qn('w:tcW'))
    if tc_w is None:
        tc_w = OxmlElement('w:tcW')
        tc_pr.append(tc_w)
    tc_w.set(qn('w:type'), 'dxa')
    tc_w.set(qn('w:w'), str(Cm(width_cm).twips))
    cell.width = Cm(width_cm)


def set_table_widths(table, widths_cm):
    table.autofit = False
    tbl_pr = table._tbl.tblPr

    layout = tbl_pr.find(qn('w:tblLayout'))
    if layout is None:
        layout = OxmlElement('w:tblLayout')
        tbl_pr.append(layout)
    layout.set(qn('w:type'), 'fixed')

    tbl_w = tbl_pr.find(qn('w:tblW'))
    if tbl_w is None:
        tbl_w = OxmlElement('w:tblW')
        tbl_pr.append(tbl_w)
    tbl_w.set(qn('w:type'), 'dxa')
    tbl_w.set(qn('w:w'), str(Cm(sum(widths_cm)).twips))

    grid_cols = table._tbl.tblGrid.gridCol_lst
    for i, width in enumerate(widths_cm):
        table.columns[i].width = Cm(width)
        if i < len(grid_cols):
            grid_cols[i].set(qn('w:w'), str(Cm(width).twips))

    for row in table.rows:
        tr_pr = row._tr.get_or_add_trPr()
        if tr_pr.find(qn('w:cantSplit')) is None:
            tr_pr.append(OxmlElement('w:cantSplit'))
        for i, cell in enumerate(row.cells):
            if i < len(widths_cm):
                set_cell_width(cell, widths_cm[i])


def set_paragraph_bottom_border(paragraph, color='94A3B8', size='6'):
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = p_pr.find(qn('w:pBdr'))
    if p_bdr is None:
        p_bdr = OxmlElement('w:pBdr')
        p_pr.append(p_bdr)
    bottom = p_bdr.find(qn('w:bottom'))
    if bottom is None:
        bottom = OxmlElement('w:bottom')
        p_bdr.append(bottom)
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), size)
    bottom.set(qn('w:space'), '1')
    bottom.set(qn('w:color'), color)


def replace_body_rule(paragraph):
    paragraph.clear()
    paragraph.paragraph_format.tab_stops.clear_all()
    paragraph.paragraph_format.tab_stops.add_tab_stop(
        Cm(SAFE_WIDTH_CM), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.LINES
    )
    paragraph.add_run('\t')


def replace_cell_rule(paragraph):
    paragraph.clear()
    run = paragraph.add_run('\u00A0')
    run.font.size = Pt(8)
    set_paragraph_bottom_border(paragraph)


def walk_paragraphs(container, in_cell=False):
    for paragraph in container.paragraphs:
        yield paragraph, in_cell
    for table in container.tables:
        for row in table.rows:
            for cell in row.cells:
                yield from walk_paragraphs(cell, True)


def table_width_profile(table):
    columns = len(table.columns)
    text = ' | '.join(cell.text for row in table.rows for cell in row.cells)

    if columns == 1:
        return [SAFE_WIDTH_CM]
    if columns == 3:
        return [7.9, 4.0, 5.3]
    if columns == 6:
        return [2.86] * 6
    if columns == 2:
        if 'Situation' in text and 'Antwort (E / V / A)' in text:
            return [13.7, 3.5]
        if 'Moderner Monitor oder Fernseher' in text or 'Interne SSD direkt auf dem Mainboard' in text:
            return [13.6, 3.6]
        return [8.6, 8.6]

    # Future-proof fallback: split the safe width equally instead of allowing Word autofit.
    return [SAFE_WIDTH_CM / columns] * columns


if not PATH.exists():
    raise SystemExit(f'{PATH} not found')

doc = Document(PATH)

for table in doc.tables:
    set_table_widths(table, table_width_profile(table))

for paragraph, in_cell in walk_paragraphs(doc):
    if re.search(r'_{40,}', paragraph.text):
        replace_body_rule(paragraph)
    elif in_cell and re.search(r'_{13,}', paragraph.text):
        replace_cell_rule(paragraph)

# A literal page-break paragraph can become a blank page if earlier content reflows.
# Put the break on the Green IT heading instead, which is stable across Word/LibreOffice.
green_heading = next((p for p in doc.paragraphs if p.text.strip().startswith('8. Green IT')), None)
if green_heading is not None:
    for paragraph in list(doc.paragraphs):
        page_breaks = paragraph._p.xpath('.//w:br[@w:type="page"]')
        if not page_breaks:
            continue
        for br in page_breaks:
            br.getparent().remove(br)
        if not paragraph.text.strip() and not paragraph._p.xpath('.//w:drawing'):
            paragraph._element.getparent().remove(paragraph._element)
    green_heading.paragraph_format.page_break_before = True

doc.save(PATH)
print(PATH)
