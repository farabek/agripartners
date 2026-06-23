# Документация AgriPartners Pilot MVP

AgriPartners - пилотная платформа для прозрачных сельскохозяйственных инвестиционных процессов на NEAR. Текущий MVP показывает, как капитал, фермерские операции, отчетность и возвраты могут быть представлены через отдельные порталы для инвесторов, фермеров и администраторов.

## Обзор проекта

Pilot MVP сфокусирован на двух сельскохозяйственных пилотных проектах:

- Fidlot Livestock Project - завершенный пилот по откорму скота.
- Hissar Sheep Breeding Project - активный пилот по разведению гиссарских овец.

Демо показывает чистый операционный вид этих проектов, сохраняя при этом testnet-данные и product-development workflows в системе. Цель этого пакета документации - помочь инвесторам, партнерам и внутренним стейкхолдерам понять продуктовый опыт без необходимости читать исходный код или разбирать сырые тестовые данные.

## Видение AgriPartners

AgriPartners создается для соединения сельскохозяйственных операторов с прозрачным инвестиционным капиталом. Долгосрочная цель - сделать финансирование фермерских проектов более понятным, контролируемым и доверительным.

Платформа объединяет:

- операционную отчетность для фермеров;
- портфельную прозрачность для инвесторов;
- мониторинг проектов для администраторов;
- NEAR-based contract и wallet infrastructure.

## Архитектура Pilot MVP

MVP организован как простое role-based web application:

- Frontend-порталы показывают dashboard, project и reporting views.
- Backend APIs управляют profile, deal, reporting и testnet integration flows.
- NEAR Testnet smart contracts поддерживают deal lifecycle operations.
- Wallet authentication контролирует доступ к role-specific portal views.

Текущий demo presentation layer показывает чистые пилотные проекты для screenshots и investor walkthroughs. Реальные testnet и development data могут оставаться в системе, пока demo experience фокусируется на двух пилотных проектах.

## Роли пользователей

### Investor

Инвесторы просматривают pilot opportunities, investment summaries, active and completed deals, projected или recorded ROI и returns.

### Farmer

Фермеры видят профиль пилотной фермы, funding confirmation, cycle status, reporting status и assigned project cards.

### Admin

Администраторы отслеживают pilot funding, deal status, farmer reporting, repayment status и event history по pilot portfolio.

## Страницы документации

- [Investor Portal](investor-portal-ru.md)
- [Farmer Portal](farmer-portal-ru.md)
- [Admin Dashboard](admin-dashboard-ru.md)
- [NEAR Testnet](near-testnet-ru.md)
- [Обзор релиза Alpha v1.1](releases/alpha-v1.1-release-review-ru.md)
- [Typed Return Model Design and Migration Specification](design/typed-return-model-spec.md)
- [Reconciliation Engine Design Specification](design/reconciliation-engine-spec.md)
- [Treasury Engine Architecture Specification](design/treasury-engine-spec.md)
- [Treasury Accounting Model Specification](design/treasury-accounting-model.md)
- [Treasury Operating Modes Specification](design/treasury-operating-modes-spec.md)
- [ADR-001 - Live-first Architecture](architecture/ADR-001-live-first-architecture.md)
- [ADR-002 - Financial Semantics](architecture/ADR-002-financial-semantics.md)

## Дополнительные папки

- [Screenshots](screenshots/)
- [Architecture](architecture/)
- [Investor Deck](investor-deck/)
- [Business Model](business-model/)
- [Workflows](workflows/)
- [Demo Guide](demo-guide/)
