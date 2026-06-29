from __future__ import annotations

import argparse
from decimal import Decimal
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
GREEN_BRIGHT = "2E9D45"
BLUE = "1769C2"
BLUE_DARK = "0B4F9C"
BLUE_LIGHT = "EAF3FC"
NAVY = "102A43"
GOLD = "D7A52A"
INK = "17212B"
MUTED = "667085"
GRAY = "F2F4F7"
WHITE = "FFFFFF"
BORDER = "B8C2CC"
CONTENT_WIDTH_DXA = 10656
TABLE_INDENT_DXA = 120


def money(value: int) -> str:
    return f"${value:,.0f}"


def reserve_money(value: Decimal | int) -> str:
    amount = Decimal(value)
    return f"${amount:,.0f}" if amount == amount.to_integral() else f"${amount:,.2f}"


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
        "reserve_pct": 44,
        "reserve_total": Decimal("50820"),
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
        "reserve_pct": 53,
        "reserve_total": Decimal("50752.80"),
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
        "metric_apr": "Простой годовой ROI",
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
        "metric_apr": "Simple annualized ROI",
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


def set_run_font(run, name="Arial", size=11, color=INK, bold=False, italic=False) -> None:
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
    normal.font.name = "Arial"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Arial")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Arial")
    normal.font.size = Pt(9.5)
    normal.font.color.rgb = RGBColor.from_string(INK)
    normal.paragraph_format.space_after = Pt(4)
    normal.paragraph_format.line_spacing = 1.12
    for name, size, before, after in (
        ("Heading 1", 15, 12, 7),
        ("Heading 2", 12, 9, 5),
        ("Heading 3", 10.5, 7, 4),
    ):
        style = styles[name]
        style.font.name = "Arial"
        style._element.rPr.rFonts.set(qn("w:ascii"), "Arial")
        style._element.rPr.rFonts.set(qn("w:hAnsi"), "Arial")
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(GREEN)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True
    bullet = styles["List Bullet"]
    bullet.font.name = "Arial"
    bullet.font.size = Pt(9.5)
    bullet.paragraph_format.left_indent = Inches(0.375)
    bullet.paragraph_format.first_line_indent = Inches(-0.188)
    bullet.paragraph_format.space_after = Pt(3)
    bullet.paragraph_format.line_spacing = 1.12


def configure_page(doc: Document, running_label: str) -> None:
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.62)
    section.bottom_margin = Inches(0.62)
    section.left_margin = Inches(0.55)
    section.right_margin = Inches(0.55)
    section.header_distance = Inches(0.28)
    section.footer_distance = Inches(0.3)
    header = section.header
    hp = header.paragraphs[0]
    set_paragraph(hp, after=0, line=1, align=WD_ALIGN_PARAGRAPH.LEFT)
    hr = hp.add_run(running_label)
    set_run_font(hr, name="Arial", size=7.5, color=MUTED, bold=True)
    footer = section.footer
    fp = footer.paragraphs[0]
    add_page_number(fp)


def add_title_block(doc: Document, kicker: str, title: str, subtitle: str) -> None:
    add_text(doc, kicker.upper(), size=8.5, color=GREEN, bold=True, after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_text(doc, "AgriPartners", size=27, color=GREEN_DARK, bold=True, after=1, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_text(doc, title, size=16, color=NAVY, bold=True, after=2, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_text(doc, subtitle, size=8.7, color=MUTED, after=7, align=WD_ALIGN_PARAGRAPH.CENTER)


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


def add_metric_strip(doc: Document, metrics: list[tuple[str, str]], accent: str = GREEN) -> None:
    table = doc.add_table(rows=2, cols=len(metrics))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    widths = [CONTENT_WIDTH_DXA // len(metrics)] * len(metrics)
    widths[-1] += CONTENT_WIDTH_DXA - sum(widths)
    for idx, (label, value) in enumerate(metrics):
        label_cell = table.cell(0, idx)
        value_cell = table.cell(1, idx)
        set_cell_shading(label_cell, accent)
        for cell in (label_cell, value_cell):
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            for p in cell.paragraphs:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                set_paragraph(p, after=0, line=1)
        lr = label_cell.paragraphs[0].add_run(label)
        set_run_font(lr, name="Arial", size=8, color=WHITE, bold=True)
        vr = value_cell.paragraphs[0].add_run(value)
        set_run_font(vr, name="Arial", size=17, color=GREEN_DARK, bold=True)
    set_table_geometry(table, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def add_data_table(
    doc: Document,
    headers: list[str],
    rows: list[list[str]],
    widths: list[int],
    header_fill: str = GREEN,
    total_fill: str = GREEN_LIGHT,
    font_size: float = 8.8,
) -> None:
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    header = table.rows[0]
    set_repeat_table_header(header)
    for idx, text in enumerate(headers):
        cell = header.cells[idx]
        set_cell_shading(cell, header_fill)
        cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_paragraph(p, after=0, line=1.05)
        run = p.add_run(text)
        set_run_font(run, size=8.5, color=WHITE, bold=True)
    for ridx, row in enumerate(rows):
        cells = table.add_row().cells
        is_total = str(row[0]).upper() in {"TOTAL", "ИТОГО"} or str(row[-1]).upper() in {"TOTAL", "ИТОГО"}
        if is_total:
            for cell in cells:
                set_cell_shading(cell, total_fill)
        elif ridx % 2 == 1:
            for cell in cells:
                set_cell_shading(cell, "FAFBFC")
        for idx, text in enumerate(row):
            cell = cells[idx]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if idx > 0 else WD_ALIGN_PARAGRAPH.LEFT
            set_paragraph(p, after=0, line=1.1)
            run = p.add_run(str(text))
            set_run_font(run, size=font_size, color=INK, bold=is_total or str(text).upper() in {"TOTAL", "ИТОГО"})
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
    cumulative = Decimal(0)
    for cycle, reserve_row in enumerate(reserve_schedule("fidlot")[:-1], start=1):
        payment = Decimal(reserve_row["farmer_available"])
        cumulative += payment
        start, end = (cycle - 1) * 5, cycle * 5
        cash.append([str(cycle), f"{start}-{end} {t['months']}", reserve_money(payment), reserve_money(cumulative)])
    completion = Decimal(reserve_schedule("fidlot")[-1]["farmer_available"])
    cumulative += completion
    cash.append([t["completion"], f"35 {t['months']}", reserve_money(completion), reserve_money(cumulative)])
    return cycle_rows, cash


def hissar_farmer_tables(t):
    cycle_rows = [
        ["1-2", money(30_600), money(30_600), money(18_360), money(3_100), money(15_260)],
        ["3-6", money(30_600), money(24_600), money(14_760), money(3_100), money(11_660)],
    ]
    cash = []
    cumulative = Decimal(0)
    for cycle, reserve_row in enumerate(reserve_schedule("hissar")[:-1], start=1):
        payment = Decimal(reserve_row["farmer_available"])
        cumulative += payment
        start, end = (cycle - 1) * 6, cycle * 6
        cash.append([str(cycle), f"{start}-{end} {t['months']}", reserve_money(payment), reserve_money(cumulative)])
    completion = Decimal(reserve_schedule("hissar")[-1]["farmer_available"])
    cumulative += completion
    cash.append([t["completion"], f"36 {t['months']}", reserve_money(completion), reserve_money(cumulative)])
    return cycle_rows, cash


def detail_text(lang: str) -> dict[str, str]:
    if lang == "ru":
        return {
            "overview": "Обзор программы",
            "cycle_breakdown": "Подробный разбор по циклам",
            "cash_summary": "Сводная матрица денежных потоков",
            "final_balance": "Итоговый финансовый баланс",
            "responsibilities": "Распределение ролей и ценности",
            "company": "AgriPartners",
            "farmer": "Фермер",
            "funds": "Финансирует активы и оборотный капитал",
            "operates": "Предоставляет землю, труд и управление",
            "revenue": "Выручка от продаж",
            "livestock": "Закупка молодняка",
            "feed": "Корма и операционные расходы",
            "herd_payment": "Плата за стадо",
            "net_profit": "Чистая прибыль",
            "farmer_share": "Доля фермера 60%",
            "investor_share": "Доля инвестора 40%",
            "performance_fee": "Performance Fee 20%",
            "investor_dividend": "Дивиденд инвестору",
            "capital_component": "Возврат капитала за стадо",
            "investor_total": "ИТОГО инвестору за цикл",
            "farmer_gross": "Доля фермера до расходов",
            "farmer_before_reserve": "Фермеру до резерва",
            "salary": "Зарплата работника",
            "transport": "Транспорт",
            "farmer_total": "ДОХОД ФЕРМЕРА НА РУКИ",
            "reserve_schedule": "Резерв защиты инвестора",
            "reserve_contribution": "Взнос в резерв",
            "reserve_release": "Разблокировано фермеру",
            "reserve_balance": "Остаток резерва",
            "farmer_available": "Доступно фермеру",
            "investor_received": "Получено инвестором",
            "completion": "Завершение",
            "from_company": "Из фонда компании",
            "from_revenue": "Из выручки цикла",
            "protected_partner": "Защищённая доля партнёра",
            "investor_only": "Удерживается только из доли инвестора",
            "farmer_expense": "Вычитается из доли фермера",
            "paid_usdc": "Выплата в USDC",
            "cycle": "Цикл",
            "period": "Период",
            "cash": "Выплата",
            "cumulative": "Накоплено",
            "final": "Итог",
            "model_value": "Показатель",
            "comment": "Комментарий",
            "investor_profit": "Чистая прибыль инвестора",
            "gross_share": "Доля фермера до расходов",
            "cash_received": "Денежные выплаты",
            "asset_transfer": "Имущество фермеру",
            "total_benefit": "Общая выгода",
            "role": "Сторона",
            "contribution": "Вклад",
            "benefit": "Результат",
            "duration": "Срок модели",
            "cycle_word": "Цикл",
            "months_short": "мес.",
        }
    return {
        "overview": "Program overview",
        "cycle_breakdown": "Detailed cycle breakdown",
        "cash_summary": "Cash-flow summary",
        "final_balance": "Final financial outcome",
        "responsibilities": "Roles and value exchange",
        "company": "AgriPartners",
        "farmer": "Farmer",
        "funds": "Funds assets and working capital",
        "operates": "Provides land, labor, and operations",
        "revenue": "Sales revenue",
        "livestock": "Livestock purchase",
        "feed": "Feed and operating costs",
        "herd_payment": "Herd capital payment",
        "net_profit": "Net profit",
        "farmer_share": "Farmer share 60%",
        "investor_share": "Investor share 40%",
        "performance_fee": "Performance Fee 20%",
        "investor_dividend": "Investor dividend",
        "capital_component": "Herd capital component",
        "investor_total": "TOTAL TO INVESTOR",
        "farmer_gross": "Farmer share before expenses",
        "farmer_before_reserve": "Farmer cash before reserve",
        "salary": "Worker salary",
        "transport": "Transport",
        "farmer_total": "FARMER TAKE-HOME",
        "reserve_schedule": "Investor Protection Reserve",
        "reserve_contribution": "Reserve contribution",
        "reserve_release": "Released to farmer",
        "reserve_balance": "Reserve balance",
        "farmer_available": "Farmer cash available",
        "investor_received": "Investor cash received",
        "completion": "Completion",
        "from_company": "From company reserve",
        "from_revenue": "From cycle revenue",
        "protected_partner": "Protected partner share",
        "investor_only": "Charged only to investor share",
        "farmer_expense": "Deducted from farmer share",
        "paid_usdc": "Paid in USDC",
        "cycle": "Cycle",
        "period": "Period",
        "cash": "Payment",
        "cumulative": "Cumulative",
        "final": "Total",
        "model_value": "Metric",
        "comment": "Comment",
        "investor_profit": "Investor net profit",
        "gross_share": "Farmer gross share",
        "cash_received": "Cash received",
        "asset_transfer": "Property transferred",
        "total_benefit": "Total benefit",
        "role": "Party",
        "contribution": "Contribution",
        "benefit": "Outcome",
        "duration": "Model duration",
        "cycle_word": "Cycle",
        "months_short": "mo.",
    }


def add_section_banner(doc: Document, text: str, accent: str) -> None:
    table = doc.add_table(rows=1, cols=1)
    cell = table.cell(0, 0)
    set_cell_shading(cell, accent)
    set_cell_margins(cell, top=90, start=160, bottom=90, end=160)
    p = cell.paragraphs[0]
    set_paragraph(p, after=0, line=1)
    run = p.add_run(text)
    set_run_font(run, size=11, color=WHITE, bold=True)
    set_table_geometry(table, [CONTENT_WIDTH_DXA])
    spacer = doc.add_paragraph()
    set_paragraph(spacer, after=1, line=1)


def start_new_page(doc: Document) -> None:
    marker = doc.add_paragraph()
    marker.paragraph_format.page_break_before = True
    marker.paragraph_format.space_before = Pt(0)
    marker.paragraph_format.space_after = Pt(0)
    marker.paragraph_format.line_spacing = 0.1
    run = marker.add_run("")
    set_run_font(run, size=1, color=WHITE)


def cycle_values(model_key: str, cycle: int) -> dict[str, int]:
    if model_key == "fidlot":
        early = cycle <= 2
        return {
            "revenue": 50_000,
            "livestock": 20_000,
            "feed": 0 if early else 3_500,
            "herd_payment": 0,
            "net": 30_000 if early else 26_500,
            "farmer": 18_000 if early else 15_900,
            "investor_gross": 12_000 if early else 10_600,
            "fee": 2_400 if early else 2_120,
            "investor_dividend": 9_600 if early else 8_480,
            "capital_component": 0,
            "investor_total": 9_600 if early else 8_480,
            "salary": 1_750,
            "transport": 1_000,
            "farmer_takehome": 15_250 if early else 13_150,
        }
    early = cycle <= 2
    return {
        "revenue": 30_600,
        "livestock": 0,
        "feed": 0 if early else 3_500,
        "herd_payment": 0 if early else 2_500,
        "net": 30_600 if early else 24_600,
        "farmer": 18_360 if early else 14_760,
        "investor_gross": 12_240 if early else 9_840,
        "fee": 2_448 if early else 1_968,
        "investor_dividend": 9_792 if early else 7_872,
        "capital_component": 0 if early else 2_500,
        "investor_total": 9_792 if early else 10_372,
        "salary": 2_100,
        "transport": 1_000,
        "farmer_takehome": 15_260 if early else 11_660,
    }


def reserve_schedule(model_key: str) -> list[dict[str, Decimal | int | str]]:
    model = MODELS[model_key]
    rate = Decimal(model["reserve_pct"]) / Decimal(100)
    ending_reserve = Decimal(0)
    cumulative_investor = Decimal(0)
    rows: list[dict[str, Decimal | int | str]] = []

    for cycle in range(1, model["cycles"] + 1):
        values = cycle_values(model_key, cycle)
        contribution = Decimal(values["farmer"]) * rate
        cumulative_investor += Decimal(values["investor_total"])
        reserve_before_release = ending_reserve + contribution
        required_reserve = max(Decimal("10000"), Decimal(model["investment"]) - cumulative_investor)
        release = max(Decimal(0), reserve_before_release - required_reserve)
        ending_reserve = reserve_before_release - release
        farmer_available = Decimal(values["farmer_takehome"]) - contribution + release
        rows.append(
            {
                "stage": str(cycle),
                "investor_received": cumulative_investor,
                "contribution": contribution,
                "release": release,
                "ending_reserve": ending_reserve,
                "farmer_available": farmer_available,
            }
        )

    completion_investor = Decimal("20400") if model_key == "fidlot" else Decimal("20600")
    completion_farmer = Decimal(0) if model_key == "fidlot" else Decimal("6000")
    cumulative_investor += completion_investor
    rows.append(
        {
            "stage": "completion",
            "investor_received": cumulative_investor,
            "contribution": Decimal(0),
            "release": ending_reserve,
            "ending_reserve": Decimal(0),
            "farmer_available": completion_farmer + ending_reserve,
        }
    )
    return rows


def reserve_table_rows(model_key: str, lang: str) -> list[list[str]]:
    d = detail_text(lang)
    rows = reserve_schedule(model_key)
    result = []
    for row in rows:
        stage = d["completion"] if row["stage"] == "completion" else f"{d['cycle_word']} {row['stage']}"
        result.append(
            [
                stage,
                reserve_money(row["investor_received"]),
                reserve_money(row["contribution"]),
                reserve_money(row["release"]),
                reserve_money(row["ending_reserve"]),
                reserve_money(row["farmer_available"]),
            ]
        )
    result.append(
        [
            d["final"],
            reserve_money(rows[-1]["investor_received"]),
            reserve_money(sum(Decimal(row["contribution"]) for row in rows)),
            reserve_money(sum(Decimal(row["release"]) for row in rows)),
            reserve_money(rows[-1]["ending_reserve"]),
            money(MODELS[model_key]["farmer_cash"]),
        ]
    )
    return result


def add_cycle_card(
    doc: Document,
    model_key: str,
    audience: str,
    lang: str,
    cycle: int,
    accent: str,
) -> None:
    d = detail_text(lang)
    m = MODELS[model_key]
    v = cycle_values(model_key, cycle)
    start = (cycle - 1) * m["cycle_months"]
    end = cycle * m["cycle_months"]
    title = f"{d['cycle_word']} {cycle}  |  {start}-{end} {d['months_short']}"
    title_table = doc.add_table(rows=1, cols=1)
    title_table.style = "Table Grid"
    title_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    title_cell = title_table.cell(0, 0)
    set_cell_shading(title_cell, accent)
    set_cell_margins(title_cell, top=75, start=140, bottom=75, end=140)
    hp = title_cell.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    set_paragraph(hp, after=0, line=1)
    hr = hp.add_run(title)
    set_run_font(hr, size=9.2, color=WHITE, bold=True)
    set_table_geometry(title_table, [CONTENT_WIDTH_DXA])
    table = doc.add_table(rows=0, cols=3)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    source = d["from_company"] if cycle <= 2 else d["from_revenue"]
    if model_key == "fidlot":
        cost_rows = [
            (d["revenue"], "50 x $1,000" if lang == "en" else "50 гол. x $1,000", money(v["revenue"])),
            (d["livestock"], source, f"-{money(v['livestock'])}"),
        ]
        if cycle > 2:
            cost_rows.append((d["feed"], d["from_revenue"], f"-{money(v['feed'])}"))
    else:
        cost_rows = [
            (d["revenue"], "34 x $900" if lang == "en" else "34 гол. x $900", money(v["revenue"])),
        ]
        if cycle > 2:
            cost_rows.extend(
                [
                    (d["feed"], d["from_revenue"], f"-{money(v['feed'])}"),
                    (d["herd_payment"], d["from_revenue"], f"-{money(v['herd_payment'])}"),
                ]
            )
    if audience == "investor":
        rows = cost_rows + [
            (d["net_profit"], "60/40", money(v["net"])),
            (d["farmer_share"], d["protected_partner"], money(v["farmer"])),
            (d["investor_share"], "Before fee" if lang == "en" else "До удержания Fee", money(v["investor_gross"])),
            (d["performance_fee"], d["investor_only"], f"-{money(v['fee'])}"),
            (d["investor_dividend"], d["paid_usdc"], money(v["investor_dividend"])),
        ]
        if v["capital_component"]:
            rows.append((d["capital_component"], "No fee" if lang == "en" else "Без комиссии", money(v["capital_component"])))
        rows.append((d["investor_total"], d["paid_usdc"], money(v["investor_total"])))
    else:
        rows = cost_rows + [
            (d["net_profit"], "60/40", money(v["net"])),
            (d["investor_share"], d["investor_only"], money(v["investor_gross"])),
            (d["performance_fee"], d["investor_only"], f"-{money(v['fee'])}"),
            (d["farmer_gross"], d["protected_partner"], money(v["farmer"])),
            (d["salary"], d["farmer_expense"], f"-{money(v['salary'])}"),
            (d["transport"], d["farmer_expense"], f"-{money(v['transport'])}"),
            (
                d["farmer_before_reserve"],
                "Before reserve" if lang == "en" else "До взноса в резерв",
                money(v["farmer_takehome"]),
            ),
        ]

    for idx, (label, note, amount) in enumerate(rows):
        cells = table.add_row().cells
        is_last = idx == len(rows) - 1
        is_share = label in {d["farmer_share"], d["farmer_gross"]}
        if is_last:
            for cell in cells:
                set_cell_shading(cell, GREEN_BRIGHT if audience == "farmer" else GREEN_DARK)
        elif is_share:
            for cell in cells:
                set_cell_shading(cell, GREEN_LIGHT)
        elif idx % 2:
            for cell in cells:
                set_cell_shading(cell, "F8FAFC")
        for col, value in enumerate((label, note, amount)):
            cell = cells[col]
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=45, start=100, bottom=45, end=100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if col == 2 else WD_ALIGN_PARAGRAPH.LEFT
            set_paragraph(p, after=0, line=1)
            run = p.add_run(value)
            set_run_font(
                run,
                size=7.4,
                color=WHITE if is_last else INK,
                bold=is_last or is_share or col == 2,
            )
    set_table_geometry(table, [3100, 5356, 2200])
    spacer = doc.add_paragraph()
    set_paragraph(spacer, after=2, line=1)


def add_role_table(doc: Document, lang: str, accent: str) -> None:
    d = detail_text(lang)
    add_data_table(
        doc,
        [d["role"], d["contribution"], d["benefit"]],
        [
            [d["company"], d["funds"], "40% investor share less fee" if lang == "en" else "40% доли инвестора за вычетом Fee"],
            [d["farmer"], d["operates"], "60% share plus transferred property" if lang == "en" else "60% доли и передаваемое имущество"],
        ],
        [1700, 4650, 4306],
        header_fill=accent,
        font_size=8.3,
    )


def outcome_rows(model_key: str, audience: str, lang: str) -> list[list[str]]:
    d = detail_text(lang)
    m = MODELS[model_key]
    if audience == "investor":
        return [
            [TEXT[lang]["metric_investment"], money(m["investment"]), "Initial capital" if lang == "en" else "Стартовый капитал"],
            [TEXT[lang]["metric_payout"], money(m["investor_payout"]), f"{m['duration_months']} {TEXT[lang]['months']}"],
            [d["investor_profit"], money(m["investor_profit"]), f"ROI +{pct(m['roi'])}"],
            [
                TEXT[lang]["metric_apr"],
                f"~{pct(m['apr'])}",
                "Total ROI divided by model duration"
                if lang == "en"
                else "Общий ROI, делённый на срок модели",
            ],
        ]
    gross = 115_500 if model_key == "fidlot" else 95_760
    expenses = 19_250 if model_key == "fidlot" else 18_600
    rows = [
        [d["gross_share"], money(gross), "Before farmer expenses" if lang == "en" else "До расходов фермера"],
        ["Salary + transport" if lang == "en" else "Зарплата + транспорт", f"-{money(expenses)}", "Farmer operating costs" if lang == "en" else "Операционные расходы фермера"],
        [
            f"{d['reserve_contribution']} ({m['reserve_pct']}%)",
            f"-{reserve_money(m['reserve_total'])}",
            "Temporarily allocated from farmer share" if lang == "en" else "Временно из доли фермера",
        ],
        [
            d["reserve_release"],
            reserve_money(m["reserve_total"]),
            "No-loss modeled release" if lang == "en" else "Расчётное разблокирование без убытка",
        ],
    ]
    if model_key == "hissar":
        rows.append([
            TEXT[lang]["herd_sale"],
            money(6_000),
            "Farmer share of herd sale at completion"
            if lang == "en"
            else "Доля фермера от продажи стада при завершении",
        ])
    return rows + [
        [
            d["cash_received"],
            money(m["farmer_cash"]),
            "Cycle cash plus herd sale" if model_key == "hissar" and lang == "en"
            else "Выплаты по циклам плюс продажа стада" if model_key == "hissar"
            else "Cash over the model term" if lang == "en"
            else "Деньгами за срок модели",
        ],
        [d["asset_transfer"], money(m["farmer_asset"]), "At model completion" if lang == "en" else "После завершения модели"],
        [d["total_benefit"], money(m["farmer_total"]), "Cash + property" if lang == "en" else "Деньги + имущество"],
    ]


def build_document(model_key: str, audience: str, lang: str, output: Path) -> None:
    m = MODELS[model_key]
    t = TEXT[lang]
    d = detail_text(lang)
    accent = GREEN if audience == "investor" else BLUE
    doc = Document()
    configure_styles(doc)
    title_name = t["fidlot_title"] if model_key == "fidlot" else t["hissar_title"]
    role_name = t[audience]
    running_label = f"AgriPartners | {role_name} | {m['version']} | 60/40"
    configure_page(doc, running_label)
    subtitle = (
        f"{m['cycles']} cycles x {m['cycle_months']} months | 60/40 split | Reserve {m['reserve_pct']}% | Fee 20% | {t['language']}"
        if lang == "en"
        else f"{m['cycles']} циклов x {m['cycle_months']} мес. | Сплит 60/40 | Резерв {m['reserve_pct']}% | Fee 20% | {t['language']}"
    )
    add_title_block(doc, role_name, title_name, f"{m['version']} | {subtitle}")
    if audience == "investor":
        metrics = [
            (t["metric_investment"], money(m["investment"])),
            (t["metric_payout"], money(m["investor_payout"])),
            (t["metric_apr"], f"~{pct(m['apr'])}"),
            (t["metric_roi"], f"+{pct(m['roi'])}"),
        ]
    else:
        first = Decimal(reserve_schedule(model_key)[0]["farmer_available"])
        metrics = [
            (t["metric_first"], reserve_money(first)),
            (t["metric_cash"], money(m["farmer_cash"])),
            (t["metric_total"], money(m["farmer_total"])),
            (t["metric_cycles"], f"{m['cycles']} x {m['cycle_months']}"),
        ]
    add_metric_strip(doc, metrics, accent=accent)
    add_disclaimer(doc, t["disclaimer"])

    add_section_banner(doc, d["overview"], accent)
    mechanics = t[f"mechanics_{model_key}_{audience}"]
    add_text(doc, mechanics, size=9.2, after=5)

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
        [2100, 8556],
        header_fill=accent,
        font_size=8.1,
    )
    add_role_table(doc, lang, accent)

    if audience == "investor":
        add_section_banner(doc, d["cycle_breakdown"], accent)
        add_cycle_card(doc, model_key, audience, lang, 1, accent)

        start_new_page(doc)
        add_section_banner(doc, d["cycle_breakdown"], accent)
        for cycle in range(2, min(m["cycles"], 4) + 1):
            add_cycle_card(doc, model_key, audience, lang, cycle, accent)

        start_new_page(doc)
        add_section_banner(doc, d["cycle_breakdown"], accent)
        for cycle in range(5, m["cycles"] + 1):
            add_cycle_card(doc, model_key, audience, lang, cycle, accent)
        cycle_rows, cash = (
            fidlot_investor_tables(t) if model_key == "fidlot" else hissar_investor_tables(t)
        )
    else:
        cycle_rows, cash = (
            fidlot_farmer_tables(t) if model_key == "fidlot" else hissar_farmer_tables(t)
        )
        add_heading(doc, t["section_economics"], 1)
        add_data_table(
            doc,
            [t["cycle"], t["revenue"], t["pool"], t["farmer_share"], t["salary_transport"], d["farmer_before_reserve"]],
            cycle_rows,
            [1050, 1700, 1850, 2100, 2050, 1906],
            header_fill=accent,
            font_size=7.8,
        )
        start_new_page(doc)
        add_section_banner(doc, d["cycle_breakdown"], accent)
        for cycle in range(1, min(m["cycles"], 3) + 1):
            add_cycle_card(doc, model_key, audience, lang, cycle, accent)

        start_new_page(doc)
        add_section_banner(doc, d["cycle_breakdown"], accent)
        for cycle in range(4, min(m["cycles"], 5) + 1):
            add_cycle_card(doc, model_key, audience, lang, cycle, accent)

        start_new_page(doc)
        add_section_banner(doc, d["cycle_breakdown"], accent)
        for cycle in range(6, m["cycles"] + 1):
            add_cycle_card(doc, model_key, audience, lang, cycle, accent)

    start_new_page(doc)
    add_section_banner(doc, d["reserve_schedule"], accent)
    reserve_explanation = (
        f"Rate: {m['reserve_pct']}% of the farmer share. Required reserve after each successful cycle: "
        "max($10,000; $50,000 - investor cash actually received). The final $10,000 is released only "
        "after completion and performance of all obligations."
        if lang == "en"
        else f"Ставка: {m['reserve_pct']}% от доли фермера. Необходимый резерв после каждого успешного цикла: "
        "max($10,000; $50,000 - фактически полученные инвестором выплаты). Последние $10,000 "
        "разблокируются только после завершения и исполнения всех обязательств."
    )
    add_text(doc, reserve_explanation, size=8.7, after=5)
    add_data_table(
        doc,
        [
            d["cycle"],
            d["investor_received"],
            d["reserve_contribution"],
            d["reserve_release"],
            d["reserve_balance"],
            d["farmer_available"],
        ],
        reserve_table_rows(model_key, lang),
        [1250, 1850, 1750, 1750, 1700, 2356],
        header_fill=accent,
        total_fill=GREEN_LIGHT,
        font_size=7.2,
    )
    reserve_warning = (
        "No-loss projection only. A Confirmed Loss, overdue mandatory report, default, or open dispute "
        "may reduce or suspend release. The reserve is not insurance or a guarantee, and this model does "
        "not determine legal ownership while funds are locked."
        if lang == "en"
        else "Только расчётный сценарий без убытка. Подтверждённый убыток, просроченный обязательный отчёт, "
        "дефолт или открытый спор могут уменьшить или приостановить разблокирование. Резерв не является "
        "страховкой или гарантией; модель не определяет юридическую принадлежность заблокированных средств."
    )
    add_text(doc, reserve_warning, size=8.4, color=MUTED, italic=True, before=6, after=4)

    start_new_page(doc)
    add_section_banner(doc, d["final_balance"], accent)
    if audience == "investor":
        add_heading(doc, d["cash_summary"], 1)
        add_data_table(
            doc,
            [t["cycle"], t["period"], t["pool"], t["payment"], t["cumulative"]],
            cash,
            [1150, 2150, 2200, 2200, 2956],
            header_fill=BLUE,
            font_size=7.7,
        )
    add_metric_strip(doc, metrics, accent=accent)
    add_data_table(
        doc,
        [d["model_value"], d["final"], d["comment"]],
        outcome_rows(model_key, audience, lang),
        [4000, 2300, 4356],
        header_fill=BLUE,
        total_fill=GREEN_LIGHT,
        font_size=8.4,
    )
    add_heading(doc, t["section_notes"], 1)
    if lang == "ru":
        notes = [
            "Сплит 60/40 применяется к чистой прибыли после затрат до раздела.",
            "Performance Fee 20% удерживается только из инвесторской доли 40%.",
            f"Резерв {m['reserve_pct']}% формируется из доли фермера; неиспользованный остаток предполагается вернуть фермеру по установленным правилам.",
            "Поэтапное разблокирование рассчитано для сценария без подтверждённых убытков и может быть приостановлено при отчётности, дефолте или споре.",
            "Простой годовой ROI — это общий ROI, делённый на срок модели в годах; показатель не учитывает сложный процент и даты промежуточных выплат.",
        ]
    else:
        notes = [
            "The 60/40 split applies to net profit after pre-split costs.",
            "The 20% performance fee applies only to the investor's 40% share.",
            f"The {m['reserve_pct']}% reserve is formed from the farmer share; the unused balance is intended to be returned to the farmer under established rules.",
            "Staged release is modeled for a no-Confirmed-Loss scenario and may be suspended by reporting failure, default, or dispute.",
            "Simple annualized ROI divides total ROI by the model duration in years; it does not account for compounding or the timing of interim payments.",
        ]
    if model_key == "hissar":
        notes.insert(
            2,
            "$2,500 в циклах 3–6 возвращаются инвестору до сплита как частичный возврат капитала; Performance Fee не применяется."
            if lang == "ru"
            else "$2,500 in cycles 3–6 is returned to the investor before the split as partial capital return; no Performance Fee applies.",
        )
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
