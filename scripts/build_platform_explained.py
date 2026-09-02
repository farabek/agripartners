"""Build concise four-page Platform Explained documents in English and Russian."""

from __future__ import annotations

import argparse
from pathlib import Path

from docx import Document

from build_60_40_documents import GREEN_DARK, MUTED, bullet, callout, configure
from build_60_40_documents import heading, para, table, title


CONTENT = {
    "en": {
        "name": "AgriPartners Platform Explained",
        "subtitle": "Alpha v1.2 · transparent agricultural investment workflows · NEAR Testnet",
        "lead": "AgriPartners is an Alpha workflow platform for structuring agricultural projects, evidence, reporting and investor visibility. It is a presentation and Testnet demonstration—not a production investment platform, custody provider or live settlement system.",
        "problem": "The problem and the product",
        "problems": [
            "Agricultural projects are hard to evaluate when budgets, milestones, reports and evidence are fragmented.",
            "Investors need timely visibility without becoming direct operators or sending funds to local participants.",
            "Operators need a clear, fiat-only process for receiving funds, documenting work and returning proceeds.",
        ],
        "product": [
            ("Project workspace", "Budget, milestones, evidence, reports, risks and status in one workflow."),
            ("Investor view", "Readable project progress and audit trail without direct operational control."),
            ("Operator workflow", "Fiat receipts, operational confirmations and supporting documents."),
            ("Presentation Mode", "Guided Alpha v1.2 demonstration for investors, partners and grant reviewers."),
        ],
        "release": "What Alpha v1.2 proves",
        "release_items": ["Role-based workflow and public presentation experience.", "Project, expense, evidence and reporting concepts.", "NEAR Testnet events for demo audit and automation on the Estonia/investor side.", "A foundation for partner validation and a future formally approved pilot."],
        "boundary_title": "Mandatory financial and legal boundary",
        "boundary": "External Investor → AgriPartners OÜ (Estonia) → approved conversion and cleared fiat → Uzbekistan Feedlot Operator under a separate written agreement. Cryptocurrency stops in Estonia. The Operator, Farmer product role, suppliers and employees in Uzbekistan receive and return fiat only.",
        "flow_headers": ["Stage", "What happens", "Authoritative evidence"],
        "flow": [
            ("1. Investor funding", "Investor contracts with AgriPartners OÜ; approved funding is received in Estonia.", "Investor agreement, provider and accounting records"),
            ("2. Conversion", "Approved crypto, if used, is converted through approved infrastructure and fiat must clear.", "Provider, bank and reconciliation records"),
            ("3. Operator funding", "AgriPartners OÜ sends fiat to the Uzbekistan Feedlot Operator under a separate agreement.", "Operator agreement and bank/payment records"),
            ("4. Operations", "Operator performs agricultural work and submits reports, invoices and evidence.", "Operational, veterinary, supplier and accounting evidence"),
            ("5. Proceeds", "Uzbekistan returns approved proceeds only through fiat banking/payment channels.", "Bank, accounting and reconciliation records"),
            ("6. Settlement", "AgriPartners OÜ determines investor settlement under governing agreements.", "Agreements, accounting and settlement records"),
        ],
        "never": "NEAR records never replace contracts, bank statements, accounting, reconciliation, invoices or proof that fiat cleared. No direct crypto transfer to any Uzbekistan participant is permitted.",
        "roles_title": "Roles and value",
        "roles": [
            ("External Investor", "Contracts only with AgriPartners OÜ; receives structured visibility and reporting."),
            ("AgriPartners OÜ", "Central legal counterparty; governance, conversion, banking, accounting and reconciliation."),
            ("Uzbekistan Feedlot Operator", "Separate agreement; fiat-only operational entity responsible for delivery and evidence."),
            ("Farmer product role", "Operational work, reporting and confirmations; no wallet or crypto transaction requirements."),
            ("Partners", "Legal, banking, payment, accounting, veterinary and operational services after approval."),
            ("NEAR", "Testnet audit and automation infrastructure on the Estonia/investor side."),
        ],
        "near_title": "Why NEAR—and its limit",
        "near": ["Demonstrable workflow states and timestamped events.", "Automation experiments and verifiable hashes for approved evidence.", "Ecosystem feedback and technical validation during Alpha.", "No custody, no legal title, no replacement for official evidence, and no Uzbekistan-facing wallet requirement."],
        "status_title": "Status, risks and next decision",
        "status": [
            ("Current", "Alpha v1.2 presentation release on NEAR Testnet."),
            ("Not current", "Mainnet, live funds, custody, licensed investment activity or commercial operation."),
            ("Primary risks", "Legal/regulatory, counterparty, livestock, market price, FX, evidence quality, execution and liquidity."),
            ("Gate to pilot", "Funding, named partners, approved agreements, providers, controls and qualified legal review."),
        ],
        "next_title": "Recommended next steps",
        "next": ["Validate the workflow with investors, operators and professional advisers.", "Confirm a named pilot operator, suppliers, veterinary controls and evidence standards.", "Approve Estonia-side banking/payment, accounting, compliance and crypto-to-fiat infrastructure.", "Execute separate Investor and Operator agreements before any real-money movement.", "Keep Alpha v1.2 in Testnet presentation mode until formal pilot approval."],
        "close": "AgriPartners should be evaluated today as a transparent agricultural workflow and evidence platform in Alpha—not as a live investment product.",
    },
    "ru": {
        "name": "Платформа AgriPartners — краткое объяснение",
        "subtitle": "Alpha v1.2 · прозрачные процессы агроинвестирования · NEAR Testnet",
        "lead": "AgriPartners — Alpha-платформа для организации сельскохозяйственных проектов, подтверждений, отчётности и прозрачности для инвестора. Это презентация и Testnet-демонстрация, а не действующая инвестиционная платформа, кастодиальный сервис или система реальных расчётов.",
        "problem": "Проблема и продукт",
        "problems": ["Агропроекты трудно оценивать, когда бюджеты, этапы, отчёты и подтверждения разрознены.", "Инвестору нужна своевременная прозрачность без прямого управления операциями и переводов местным участникам.", "Оператору нужен понятный фиатный процесс получения средств, подтверждения работ и возврата выручки."],
        "product": [("Рабочее пространство проекта", "Бюджет, этапы, подтверждения, отчёты, риски и статус в одном процессе."), ("Кабинет инвестора", "Понятный прогресс и аудиторский след без прямого операционного контроля."), ("Процесс оператора", "Фиатные поступления, операционные подтверждения и документы."), ("Режим презентации", "Управляемая демонстрация Alpha v1.2 для инвесторов, партнёров и грантовых экспертов.")],
        "release": "Что показывает Alpha v1.2",
        "release_items": ["Ролевой процесс и публичную презентацию.", "Концепции проекта, расходов, подтверждений и отчётности.", "События NEAR Testnet для демо-аудита и автоматизации на стороне Эстонии/инвестора.", "Основу для проверки партнёрами и будущего формально утверждённого пилота."],
        "boundary_title": "Обязательная финансовая и юридическая граница",
        "boundary": "Внешний инвестор → AgriPartners OÜ (Эстония) → одобренная конвертация и зачисленный фиат → оператор откормочного комплекса в Узбекистане по отдельному письменному договору. Криптовалюта остаётся в Эстонии. Оператор, роль Farmer, поставщики и сотрудники в Узбекистане получают и возвращают только фиат.",
        "flow_headers": ["Этап", "Что происходит", "Официальные подтверждения"],
        "flow": [("1. Финансирование", "Инвестор заключает договор с AgriPartners OÜ; разрешённые средства поступают в Эстонии.", "Договор, записи провайдера и учёта"), ("2. Конвертация", "Разрешённая криптовалюта конвертируется через одобренную инфраструктуру; фиат должен быть зачислен.", "Провайдер, банк и сверка"), ("3. Финансирование оператора", "AgriPartners OÜ переводит оператору в Узбекистане только фиат по отдельному договору.", "Договор оператора и банковские записи"), ("4. Операции", "Оператор выполняет работы и предоставляет отчёты, счета и подтверждения.", "Операционные, ветеринарные и бухгалтерские документы"), ("5. Выручка", "Узбекистан возвращает разрешённую выручку только по фиатным каналам.", "Банк, бухгалтерия и сверка"), ("6. Расчёт", "AgriPartners OÜ определяет расчёт с инвестором по действующим договорам.", "Договоры, учёт и документы расчёта")],
        "never": "Запись NEAR не заменяет договоры, банковские выписки, бухгалтерский учёт, сверку, счета и доказательство зачисления фиата. Прямые криптопереводы участникам в Узбекистане запрещены.",
        "roles_title": "Роли и ценность",
        "roles": [("Внешний инвестор", "Договор только с AgriPartners OÜ; структурированная прозрачность и отчётность."), ("AgriPartners OÜ", "Центральный юридический контрагент; управление, конвертация, банк, учёт и сверка."), ("Оператор в Узбекистане", "Отдельный договор; фиатная операционная организация, ответственная за результат и документы."), ("Роль Farmer", "Операционная работа, отчёты и подтверждения; без кошелька и криптотранзакций."), ("Партнёры", "Юридические, банковские, платёжные, бухгалтерские, ветеринарные и операционные услуги после утверждения."), ("NEAR", "Testnet-аудит и автоматизация на стороне Эстонии/инвестора.")],
        "near_title": "Зачем NEAR — и где предел",
        "near": ["Демонстрация состояний процесса и событий со временем.", "Эксперименты с автоматизацией и проверяемыми хешами утверждённых подтверждений.", "Обратная связь экосистемы и техническая проверка Alpha.", "Без хранения средств, юридического титула, замены официальных документов и кошельков для Узбекистана."],
        "status_title": "Статус, риски и следующее решение",
        "status": [("Сейчас", "Презентационный релиз Alpha v1.2 на NEAR Testnet."), ("Не сейчас", "Mainnet, реальные средства, custody, лицензированная инвестиционная или коммерческая деятельность."), ("Основные риски", "Право и регулирование, контрагенты, скот, рыночные цены, FX, качество подтверждений, исполнение и ликвидность."), ("Условие пилота", "Финансирование, выбранные партнёры, утверждённые договоры, провайдеры, контроль и юридическая проверка.")],
        "next_title": "Рекомендуемые следующие шаги",
        "next": ["Проверить процесс с инвесторами, операторами и профессиональными консультантами.", "Подтвердить выбранного оператора, поставщиков, ветеринарный контроль и стандарты документов.", "Утвердить банковскую, платёжную, бухгалтерскую, комплаенс- и crypto-to-fiat инфраструктуру в Эстонии.", "Подписать отдельные договоры с инвестором и оператором до движения реальных средств.", "Сохранять Alpha v1.2 в режиме Testnet-презентации до формального утверждения пилота."],
        "close": "Сегодня AgriPartners следует оценивать как прозрачную Alpha-платформу для агропроцессов и подтверждений, а не как действующий инвестиционный продукт.",
    },
}


def build(lang: str, output: Path):
    c = CONTENT[lang]; doc = Document(); configure(doc, f"AgriPartners | Platform Explained | {lang.upper()} | Alpha v1.2")
    title(doc, "AgriPartners", c["name"], c["subtitle"]); callout(doc, c["lead"])
    heading(doc, c["problem"])
    for item in c["problems"]: bullet(doc, item)
    table(doc, ["Capability" if lang == "en" else "Возможность", "Value" if lang == "en" else "Ценность"], c["product"], [2700, 6660], 9.0, GREEN_DARK)
    heading(doc, c["release"])
    for item in c["release_items"]: bullet(doc, item)

    doc.add_page_break(); title(doc, "AgriPartners", c["boundary_title"], c["subtitle"]); callout(doc, c["boundary"])
    table(doc, c["flow_headers"], c["flow"], [1800, 4080, 3480], 8.2, GREEN_DARK); callout(doc, c["never"])

    doc.add_page_break(); title(doc, "AgriPartners", c["roles_title"], c["subtitle"])
    table(doc, ["Role" if lang == "en" else "Роль", "Value and responsibility" if lang == "en" else "Ценность и ответственность"], c["roles"], [2500, 6860], 8.8, GREEN_DARK)
    heading(doc, c["near_title"])
    for item in c["near"]: bullet(doc, item)
    callout(doc, c["never"])

    doc.add_page_break(); title(doc, "AgriPartners", c["status_title"], c["subtitle"])
    table(doc, ["Area" if lang == "en" else "Область", "Position" if lang == "en" else "Положение"], c["status"], [2200, 7160], 9.0, GREEN_DARK)
    heading(doc, c["next_title"])
    for item in c["next"]: bullet(doc, item)
    callout(doc, c["close"])
    para(doc, "agripartners.vercel.app · github.com/farabek/agripartners", 9, MUTED, False, False, 4)
    doc.core_properties.title = c["name"]; doc.core_properties.subject = "AgriPartners Alpha v1.2 public platform overview"
    doc.core_properties.author = "AgriPartners"; output.parent.mkdir(parents=True, exist_ok=True); doc.save(output)


def main():
    parser = argparse.ArgumentParser(); parser.add_argument("--root", default=str(Path(__file__).resolve().parents[1]))
    root = Path(parser.parse_args().root).resolve()
    for lang in ("en", "ru"):
        output = root / "docs" / "platform" / f"PLATFORM_EXPLAINED_{lang.upper()}.docx"; build(lang, output); print(output)


if __name__ == "__main__": main()
