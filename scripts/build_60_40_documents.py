from __future__ import annotations

import argparse
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


GREEN = "00695C"
GREEN_DARK = "004D40"
GREEN_LIGHT = "E5F3F0"
NAVY = "001555"
INK = "17212B"
MUTED = "667085"
GRAY = "F2F4F7"
WHITE = "FFFFFF"
BORDER = "B8C2CC"
CONTENT_WIDTH_DXA = 9360
TABLE_INDENT_DXA = 120


def money(value: int) -> str:
    return f"${value:,.0f}"


def pct(value: float) -> str:
    return f"{value:.1f}%"


MODELS = {
    "fidlot": {
        "version": "v5.9",
        "cycles": 7,
        "cycle_months": 5,
        "duration_months": 35,
        "investment": 50_000,
        "investor_payout": 82_000,
        "investor_profit": 32_000,
        "roi": 64.0,
        "apr": 21.9,
        "farmer_cash": 96_250,
        "farmer_asset": 18_000,
        "farmer_total": 114_250,
    },
    "hissar": {
        "version": "VariantB v2.1",
        "cycles": 6,
        "cycle_months": 6,
        "duration_months": 36,
        "investment": 50_000,
        "investor_payout": 81_672,
        "investor_profit": 31_672,
        "roi": 63.3,
        "apr": 21.1,
        "farmer_cash": 83_160,
        "farmer_asset": 18_000,
        "farmer_total": 101_160,
    },
}


TEXT = {
    "ru": {
        "language": "RU",
        "investor": "Инвестиционная модель",
        "farmer": "Руководство фермера",
        "fidlot_title": "Откормочный комплекс Fidlot",
        "hissar_title": "Разведение гиссарской породы",
        "disclaimer": (
            "Демонстрационная финансовая модель. Все показатели являются прогнозными, "
            "не гарантируют доходность и не являются публичным предложением инвестировать."
        ),
        "section_mechanics": "1. Механика модели",
        "section_economics": "2. Экономика циклов",
        "section_cashflow": "3. График денежных потоков",
        "section_outcome": "4. Итоговый результат",
        "section_notes": "5. Ключевые условия",
        "source_note": "Источник модели: AgriPartners 60/40 financial model.",
        "metric_investment": "Стартовая инвестиция",
        "metric_payout": "Возврат инвестору",
        "metric_apr": "APR годовых",
        "metric_roi": "Чистый ROI",
        "metric_first": "Первая выплата",
        "metric_cash": "Денежные выплаты",
        "metric_total": "Общая выгода",
        "metric_cycles": "Циклы",
        "cycle": "Цикл",
        "period": "Период",
        "pool": "Чистая прибыль",
        "payment": "Выплата",
        "cumulative": "Накоплено",
        "comment": "Комментарий",
        "item": "Статья",
        "amount": "Сумма",
        "revenue": "Выручка",
        "costs": "Затраты до раздела",
        "farmer_share": "Доля фермера 60%",
        "investor_gross": "Доля инвестора 40%",
        "fee": "Fee 20%",
        "investor_net": "Инвестору на руки",
        "farmer_takehome": "Фермеру на руки",
        "salary_transport": "Зарплата + транспорт",
        "capital_return": "Возврат капитала",
        "herd_payment": "Плата за стадо",
        "herd_sale": "Продажа стада",
        "property": "Имущество фермеру",
        "total": "ИТОГО",
        "months": "мес.",
        "completion": "По завершении",
        "company_reserve": "Из резерва инвестора",
        "from_revenue": "Из выручки",
        "mechanics_fidlot_investor": (
            "Инвестор финансирует закупку первых партий молодняка, откормочную базу и оборотный "
            "резерв. Партия из 50 голов откармливается 5 месяцев и продаётся по $1,000 за голову. "
            "Чистая прибыль делится 60/40. Performance Fee 20% удерживается только из доли инвестора."
        ),
        "mechanics_fidlot_farmer": (
            "Компания финансирует закупку 50 голов молодняка, откормочную базу и оборотный резерв. "
            "Фермер предоставляет землю, труд и операционное управление. Его доля составляет 60% "
            "чистой прибыли; зарплата работника и транспорт оплачиваются из доли фермера."
        ),
        "mechanics_hissar_investor": (
            "Инвестор финансирует 38 овцематок по $700, кошару и OpEx-резерв. Фермер продаёт "
            "34 головы молодняка каждые 6 месяцев. Чистая прибыль делится 60/40. Performance Fee "
            "20% удерживается только из доли инвестора; плата за стадо возвращает часть капитала без комиссии."
        ),
        "mechanics_hissar_farmer": (
            "Компания финансирует маточное стадо из 38 овцематок, кошару и OpEx-резерв. Фермер "
            "предоставляет землю, труд и управление стадом. Его доля составляет 60% чистой прибыли; "
            "зарплата и транспорт оплачиваются из доли фермера."
        ),
    },
    "en": {
        "language": "EN",
        "investor": "Investment Model",
        "farmer": "Farmer Guide",
        "fidlot_title": "Fidlot Livestock Fattening",
        "hissar_title": "Hissar Sheep Breeding",
        "disclaimer": (
            "Demonstration financial model. All figures are projections, do not guarantee returns, "
            "and do not constitute a public offer to invest."
        ),
        "section_mechanics": "1. Model mechanics",
        "section_economics": "2. Cycle economics",
        "section_cashflow": "3. Cash-flow schedule",
        "section_outcome": "4. Final outcome",
        "section_notes": "5. Key terms",
        "source_note": "Model source: AgriPartners 60/40 financial model.",
        "metric_investment": "Initial investment",
        "metric_payout": "Investor payout",
        "metric_apr": "Annual APR",
        "metric_roi": "Net ROI",
        "metric_first": "First payment",
        "metric_cash": "Cash received",
        "metric_total": "Total benefit",
        "metric_cycles": "Cycles",
        "cycle": "Cycle",
        "period": "Period",
        "pool": "Net profit",
        "payment": "Payment",
        "cumulative": "Cumulative",
        "comment": "Comment",
        "item": "Item",
        "amount": "Amount",
        "revenue": "Revenue",
        "costs": "Pre-split costs",
        "farmer_share": "Farmer share 60%",
        "investor_gross": "Investor share 40%",
        "fee": "Fee 20%",
        "investor_net": "Investor net payment",
        "farmer_takehome": "Farmer take-home",
        "salary_transport": "Salary + transport",
        "capital_return": "Capital return",
        "herd_payment": "Herd payment",
        "herd_sale": "Herd sale",
        "property": "Property transferred to farmer",
        "total": "TOTAL",
        "months": "months",
        "completion": "At completion",
        "company_reserve": "From investor reserve",
        "from_revenue": "From cycle revenue",
        "mechanics_fidlot_investor": (
            "The investor funds the initial livestock batches, the feedlot facility, and working "
            "capital. A batch of 50 animals is fattened for five months and sold at $1,000 per head. "
            "Net profit is split 60/40. A 20% performance fee applies only to the investor share."
        ),
        "mechanics_fidlot_farmer": (
            "The company funds 50 young animals, the feedlot facility, and working capital. The farmer "
            "provides land, labor, and operating management. The farmer receives 60% of net profit and "
            "pays worker salary and transport from the farmer share."
        ),
        "mechanics_hissar_investor": (
            "The investor funds 38 breeding ewes at $700 each, a sheep shelter, and an OpEx reserve. "
            "The farmer sells 34 young animals every six months. Net profit is split 60/40. A 20% "
            "performance fee applies only to the investor share; herd payments return capital without a fee."
        ),
        "mechanics_hissar_farmer": (
            "The company funds 38 breeding ewes, a sheep shelter, and an OpEx reserve. The farmer provides "
            "land, labor, and herd management. The farmer receives 60% of net profit and pays salary and "
            "transport from the farmer share."
        ),
    },
}


def set_cell_shading(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=100, start=120, bottom=100, end=120) -> None:
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_geometry(table, widths_dxa: list[int], indent_dxa: int = TABLE_INDENT_DXA) -> None:
    table.autofit = False
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(sum(widths_dxa)))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), str(indent_dxa))
    tbl_ind.set(qn("w:type"), "dxa")
    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            width = widths_dxa[min(idx, len(widths_dxa) - 1)]
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(width))
            tc_w.set(qn("w:type"), "dxa")
            cell.width = Inches(width / 1440)
            set_cell_margins(cell)


def set_repeat_table_header(row) -> None:
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_run_font(run, name="Calibri", size=11, color=INK, bold=False, italic=False) -> None:
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    run.bold = bold
    run.italic = italic


def set_paragraph(paragraph, before=0, after=6, line=1.25, align=None) -> None:
    paragraph.paragraph_format.space_before = Pt(before)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing = line
    if align is not None:
        paragraph.alignment = align


def add_text(doc, text, size=11, color=INK, bold=False, italic=False, before=0, after=6, align=None):
    paragraph = doc.add_paragraph()
    set_paragraph(paragraph, before=before, after=after, line=1.25, align=align)
    run = paragraph.add_run(text)
    set_run_font(run, size=size, color=color, bold=bold, italic=italic)
    return paragraph


def add_heading(doc, text, level=1):
    paragraph = doc.add_paragraph(style=f"Heading {level}")
    paragraph.add_run(text)
    return paragraph


def add_bullet(doc, text):
    paragraph = doc.add_paragraph(style="List Bullet")
    run = paragraph.add_run(text)
    set_run_font(run, size=10.5)
    set_paragraph(paragraph, after=4, line=1.2)
    return paragraph


def add_page_number(paragraph) -> None:
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run()
    fld_char = OxmlElement("w:fldChar")
    fld_char.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = " PAGE "
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    text = OxmlElement("w:t")
    text.text = "1"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_char, instr_text, fld_sep, text, fld_end])
    set_run_font(run, size=8, color=MUTED)


def configure_styles(doc: Document) -> None:
    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Calibri"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    normal.font.size = Pt(11)
    normal.font.color.rgb = RGBColor.from_string(INK)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.25
    for name, size, before, after in (
        ("Heading 1", 16, 18, 10),
        ("Heading 2", 13, 14, 7),
        ("Heading 3", 12, 10, 5),
    ):
        style = styles[name]
        style.font.name = "Calibri"
        style._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
        style._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(GREEN)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True
    bullet = styles["List Bullet"]
    bullet.font.name = "Calibri"
    bullet.font.size = Pt(10.5)
    bullet.paragraph_format.left_indent = Inches(0.375)
    bullet.paragraph_format.first_line_indent = Inches(-0.188)
    bullet.paragraph_format.space_after = Pt(4)
    bullet.paragraph_format.line_spacing = 1.25


def configure_page(doc: Document, running_label: str) -> None:
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)
    header = section.header
    hp = header.paragraphs[0]
    set_paragraph(hp, after=0, line=1, align=WD_ALIGN_PARAGRAPH.LEFT)
    hr = hp.add_run(running_label)
    set_run_font(hr, size=8, color=MUTED, bold=True)
    footer = section.footer
    fp = footer.paragraphs[0]
    add_page_number(fp)


def add_title_block(doc: Document, kicker: str, title: str, subtitle: str) -> None:
    add_text(doc, kicker.upper(), size=9, color=GREEN, bold=True, after=4, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_text(doc, "AgriPartners", size=24, color=GREEN_DARK, bold=True, after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_text(doc, title, size=15, color=INK, bold=True, after=3, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_text(doc, subtitle, size=10, color=MUTED, after=12, align=WD_ALIGN_PARAGRAPH.CENTER)


def add_disclaimer(doc: Document, text: str) -> None:
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_shading(cell, GREEN_LIGHT)
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    p = cell.paragraphs[0]
    set_paragraph(p, before=0, after=0, line=1.15)
    run = p.add_run(text)
    set_run_font(run, size=9, color=GREEN_DARK, bold=True)
    set_table_geometry(table, [CONTENT_WIDTH_DXA])
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def add_metric_strip(doc: Document, metrics: list[tuple[str, str]]) -> None:
    table = doc.add_table(rows=2, cols=len(metrics))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    widths = [CONTENT_WIDTH_DXA // len(metrics)] * len(metrics)
    widths[-1] += CONTENT_WIDTH_DXA - sum(widths)
    for idx, (label, value) in enumerate(metrics):
        label_cell = table.cell(0, idx)
        value_cell = table.cell(1, idx)
        set_cell_shading(label_cell, GRAY)
        for cell in (label_cell, value_cell):
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            for p in cell.paragraphs:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                set_paragraph(p, after=0, line=1)
        lr = label_cell.paragraphs[0].add_run(label)
        set_run_font(lr, size=8.5, color=MUTED, bold=True)
        vr = value_cell.paragraphs[0].add_run(value)
        set_run_font(vr, size=17, color=GREEN_DARK, bold=True)
    set_table_geometry(table, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def add_data_table(doc: Document, headers: list[str], rows: list[list[str]], widths: list[int]) -> None:
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header = table.rows[0]
    set_repeat_table_header(header)
    for idx, text in enumerate(headers):
        cell = header.cells[idx]
        set_cell_shading(cell, GREEN)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_paragraph(p, after=0, line=1.05)
        run = p.add_run(text)
        set_run_font(run, size=8.5, color=WHITE, bold=True)
    for ridx, row in enumerate(rows):
        cells = table.add_row().cells
        if ridx % 2 == 1:
            for cell in cells:
                set_cell_shading(cell, "FAFBFC")
        for idx, text in enumerate(row):
            cell = cells[idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if idx > 0 else WD_ALIGN_PARAGRAPH.LEFT
            set_paragraph(p, after=0, line=1.1)
            run = p.add_run(str(text))
            set_run_font(run, size=8.8, color=INK, bold=(str(text).upper() in {"TOTAL", "ИТОГО"}))
    set_table_geometry(table, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def fidlot_investor_tables(t):
    cycle_rows = [
        ["1-2", money(50_000), money(20_000), money(30_000), money(18_000), money(12_000), money(2_400), money(9_600)],
        ["3-7", money(50_000), money(23_500), money(26_500), money(15_900), money(10_600), money(2_120), money(8_480)],
    ]
    cash = []
    cumulative = 0
    for cycle in range(1, 8):
        payment = 9_600 if cycle <= 2 else 8_480
        pool = 30_000 if cycle <= 2 else 26_500
        cumulative += payment
        start, end = (cycle - 1) * 5, cycle * 5
        cash.append([str(cycle), f"{start}-{end} {t['months']}", money(pool), money(payment), money(cumulative)])
    cash.append([t["completion"], f"35 {t['months']}", "-", money(20_400), money(82_000)])
    return cycle_rows, cash


def hissar_investor_tables(t):
    cycle_rows = [
        ["1-2", money(30_600), money(0), money(30_600), money(18_360), money(12_240), money(2_448), money(9_792)],
        ["3-6", money(30_600), money(6_000), money(24_600), money(14_760), money(9_840), money(1_968), f"{money(7_872)} + {money(2_500)}"],
    ]
    cash = []
    cumulative = 0
    for cycle in range(1, 7):
        payment = 9_792 if cycle <= 2 else 10_372
        pool = 30_600 if cycle <= 2 else 24_600
        cumulative += payment
        start, end = (cycle - 1) * 6, cycle * 6
        cash.append([str(cycle), f"{start}-{end} {t['months']}", money(pool), money(payment), money(cumulative)])
    cash.append([t["completion"], f"36 {t['months']}", "-", money(20_600), money(81_672)])
    return cycle_rows, cash


def fidlot_farmer_tables(t):
    cycle_rows = [
        ["1-2", money(50_000), money(30_000), money(18_000), money(2_750), money(15_250)],
        ["3-7", money(50_000), money(26_500), money(15_900), money(2_750), money(13_150)],
    ]
    cash = []
    cumulative = 0
    for cycle in range(1, 8):
        payment = 15_250 if cycle <= 2 else 13_150
        cumulative += payment
        start, end = (cycle - 1) * 5, cycle * 5
        cash.append([str(cycle), f"{start}-{end} {t['months']}", money(payment), money(cumulative)])
    return cycle_rows, cash


def hissar_farmer_tables(t):
    cycle_rows = [
        ["1-2", money(30_600), money(30_600), money(18_360), money(3_100), money(15_260)],
        ["3-6", money(30_600), money(24_600), money(14_760), money(3_100), money(11_660)],
    ]
    cash = []
    cumulative = 0
    for cycle in range(1, 7):
        payment = 15_260 if cycle <= 2 else 11_660
        cumulative += payment
        start, end = (cycle - 1) * 6, cycle * 6
        cash.append([str(cycle), f"{start}-{end} {t['months']}", money(payment), money(cumulative)])
    cash.append([t["herd_sale"], f"36 {t['months']}", money(6_000), money(83_160)])
    return cycle_rows, cash


def build_document(model_key: str, audience: str, lang: str, output: Path) -> None:
    m = MODELS[model_key]
    t = TEXT[lang]
    doc = Document()
    configure_styles(doc)
    title_name = t["fidlot_title"] if model_key == "fidlot" else t["hissar_title"]
    role_name = t[audience]
    running_label = f"AgriPartners | {role_name} | {m['version']} | 60/40"
    configure_page(doc, running_label)
    subtitle = (
        f"{m['cycles']} cycles x {m['cycle_months']} months | 60/40 split | Fee 20% | {t['language']}"
        if lang == "en"
        else f"{m['cycles']} циклов x {m['cycle_months']} мес. | Сплит 60/40 | Fee 20% | {t['language']}"
    )
    add_title_block(doc, role_name, title_name, f"{m['version']} | {subtitle}")
    add_disclaimer(doc, t["disclaimer"])
    if audience == "investor":
        metrics = [
            (t["metric_investment"], money(m["investment"])),
            (t["metric_payout"], money(m["investor_payout"])),
            (t["metric_apr"], f"~{pct(m['apr'])}"),
            (t["metric_roi"], f"+{pct(m['roi'])}"),
        ]
    else:
        first = 15_250 if model_key == "fidlot" else 15_260
        metrics = [
            (t["metric_first"], money(first)),
            (t["metric_cash"], money(m["farmer_cash"])),
            (t["metric_total"], money(m["farmer_total"])),
            (t["metric_cycles"], f"{m['cycles']} x {m['cycle_months']}"),
        ]
    add_metric_strip(doc, metrics)

    add_heading(doc, t["section_mechanics"], 1)
    mechanics = t[f"mechanics_{model_key}_{audience}"]
    add_text(doc, mechanics, size=10.5, after=8)

    if model_key == "fidlot":
        labels = (
            ["Initial livestock", "Feedlot facility", "Working reserve"]
            if lang == "en"
            else ["Начальный молодняк", "Откормочная база", "Оборотный резерв"]
        )
        capital_rows = [
            (money(20_000), labels[0]),
            (money(18_000), labels[1]),
            (money(12_000), labels[2]),
        ]
    else:
        labels = (
            ["38 breeding ewes", "Sheep shelter", "OpEx reserve"]
            if lang == "en"
            else ["38 овцематок", "Кошара", "OpEx-резерв"]
        )
        capital_rows = [
            (money(26_600), labels[0]),
            (money(18_000), labels[1]),
            (money(5_400), labels[2]),
        ]
    add_data_table(
        doc,
        [t["amount"], t["item"]],
        [[amount, label] for amount, label in capital_rows] + [[money(50_000), t["total"]]],
        [1900, 7460],
    )

    add_heading(doc, t["section_economics"], 1)
    if audience == "investor":
        cycle_rows, cash = (
            fidlot_investor_tables(t) if model_key == "fidlot" else hissar_investor_tables(t)
        )
        add_data_table(
            doc,
            [
                t["cycle"],
                t["revenue"],
                t["costs"],
                t["pool"],
                t["farmer_share"],
                t["investor_gross"],
                t["fee"],
                t["investor_net"],
            ],
            cycle_rows,
            [750, 1150, 1150, 1150, 1200, 1200, 1050, 1710],
        )
    else:
        cycle_rows, cash = (
            fidlot_farmer_tables(t) if model_key == "fidlot" else hissar_farmer_tables(t)
        )
        add_data_table(
            doc,
            [t["cycle"], t["revenue"], t["pool"], t["farmer_share"], t["salary_transport"], t["farmer_takehome"]],
            cycle_rows,
            [850, 1400, 1500, 1700, 1700, 2210],
        )

    doc.add_page_break()
    add_heading(doc, t["section_cashflow"], 1)
    if audience == "investor":
        add_data_table(
            doc,
            [t["cycle"], t["period"], t["pool"], t["payment"], t["cumulative"]],
            cash,
            [1400, 1900, 1900, 1900, 2260],
        )
    else:
        add_data_table(
            doc,
            [t["cycle"], t["period"], t["farmer_takehome"], t["cumulative"]],
            cash,
            [1800, 2300, 2500, 2760],
        )

    add_heading(doc, t["section_outcome"], 1)
    if audience == "investor":
        outcome = [
            [t["metric_investment"], money(m["investment"])],
            [t["metric_payout"], money(m["investor_payout"])],
            ["Investor profit" if lang == "en" else "Прибыль инвестора", money(m["investor_profit"])],
            [t["metric_roi"], f"+{pct(m['roi'])}"],
            [t["metric_apr"], f"~{pct(m['apr'])}"],
        ]
    elif model_key == "fidlot":
        outcome = [
            ["Farmer gross share" if lang == "en" else "Доля фермера до расходов", money(115_500)],
            ["Worker salary" if lang == "en" else "Зарплата работника", f"-{money(12_250)}"],
            ["Transport" if lang == "en" else "Транспорт", f"-{money(7_000)}"],
            [t["metric_cash"], money(96_250)],
            [t["property"], money(18_000)],
            [t["metric_total"], money(114_250)],
        ]
    else:
        outcome = [
            ["Farmer cycle cash" if lang == "en" else "Выплаты по циклам", money(77_160)],
            [t["herd_sale"], money(6_000)],
            [t["metric_cash"], money(83_160)],
            [t["property"], money(18_000)],
            [t["metric_total"], money(101_160)],
        ]
    add_data_table(doc, [t["item"], t["amount"]], outcome, [6500, 2860])

    add_heading(doc, t["section_notes"], 1)
    if lang == "ru":
        notes = [
            "Сплит 60/40 применяется к чистой прибыли после затрат до раздела.",
            "Performance Fee 20% удерживается только из инвесторской доли 40%.",
            "Показатели округлены до доллара; фактические результаты могут отличаться.",
            f"Расчётный срок модели: {m['duration_months']} месяцев.",
        ]
    else:
        notes = [
            "The 60/40 split applies to net profit after pre-split costs.",
            "The 20% performance fee applies only to the investor's 40% share.",
            "Figures are rounded to the nearest dollar; actual results may differ.",
            f"Model duration: {m['duration_months']} months.",
        ]
    for note in notes:
        add_bullet(doc, note)
    add_text(doc, t["source_note"], size=8.5, color=MUTED, italic=True, before=8, after=4)
    add_disclaimer(doc, t["disclaimer"])

    doc.core_properties.title = f"AgriPartners {role_name} - {title_name} - {t['language']}"
    doc.core_properties.subject = "AgriPartners 60/40 demonstration financial model"
    doc.core_properties.author = "AgriPartners"
    doc.core_properties.last_modified_by = "AgriPartners"
    doc.core_properties.keywords = "AgriPartners, 60/40, agriculture, financial model"
    output.parent.mkdir(parents=True, exist_ok=True)
    doc.save(output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=str(Path(__file__).resolve().parents[1]))
    args = parser.parse_args()
    root = Path(args.root).resolve()
    base = root / "docs" / "60-40" / "source"
    for lang in ("ru", "en"):
        for audience in ("investor", "farmer"):
            for model_key in ("fidlot", "hissar"):
                model_label = "Fidlot-v5.9" if model_key == "fidlot" else "VariantB-v2.1"
                filename = f"Agri-{audience.title()}-{model_label}-6040-{lang.upper()}.docx"
                output = base / lang / filename
                build_document(model_key, audience, lang, output)
                print(output)


if __name__ == "__main__":
    main()
