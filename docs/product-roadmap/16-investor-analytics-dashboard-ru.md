# Investor Analytics Dashboard RU

## Цель

Этот документ описывает product roadmap для Investor Analytics Dashboard в AgriPartners Alpha v1.

Цель - усилить investor-facing demo: перейти от базовой видимости сделок к более понятной portfolio analytics, ROI tracking, repayment visibility, risk signals и pilot comparison.

Это только planning document. Он не меняет frontend code, backend code, smart contracts, database schema, tests, deployment configuration, commits или pushes.

## Product Goal

Investor Analytics Dashboard должен помогать investors быстро отвечать на пять вопросов:

- Сколько capital allocated?
- Какие deals active или completed?
- Какой return projected?
- Какая amount returned?
- Какие risk или reporting signals требуют внимания?

## Target Audiences

### Investors

Investors нужна понятная картина capital allocation, ROI, returned amount, outstanding amount и deal status.

### NEAR Ecosystem Reviewers

NEAR reviewers должны видеть, как investor analytics связаны с transparent real-world asset workflows.

### Accelerators

Accelerators должны видеть, есть ли у продукта clear dashboard value proposition и measurable validation path.

### Strategic Partners

Partners должны понимать, какие pilot deals active, какие completed и какие operational signals поддерживают trust.

## Core Dashboard Sections

### Portfolio Summary

Purpose:

- Показать overall investor position по pilot deals.

Recommended fields:

- Total allocated capital.
- Active deals.
- Completed deals.
- Projected returns.
- Returned amount.
- Outstanding amount.
- Average projected ROI.

### Deal Performance Cards

Purpose:

- Сравнивать active и completed agricultural pilot deals.

Recommended fields:

- Deal title.
- Region.
- Activity or livestock type.
- Funding amount.
- Projected ROI.
- Projected return.
- Returned amount.
- Outstanding amount.
- Status.
- Report status.

### ROI and Returns Panel

Purpose:

- Сделать projected ROI и repayment visibility понятными.

Recommended fields:

- Projected ROI.
- Projected return.
- Returned amount.
- Outstanding return.
- Return status.
- Return ledger summary.
- Disclaimer that projected returns are estimates and are not guaranteed.

### Reporting Signals Panel

Purpose:

- Показать, поддерживает ли farmer reporting investor confidence.

Recommended fields:

- Reports submitted.
- Reports pending.
- Next report due.
- Latest farmer report summary.
- Active cycle status.
- Report completeness signal.

### Risk and Attention Panel

Purpose:

- Помочь investors понять, какие deals требуют review.

Recommended signals:

- Missing report.
- Outstanding return.
- Active deal without recent update.
- Funding not confirmed.
- Cycle pending.
- Legal or audit disclaimer where relevant.

## Data Sources

Сначала использовать existing APIs и frontend aggregation, прежде чем добавлять backend changes.

Potential existing data sources:

- Investor deals endpoint.
- Investor deal detail endpoint.
- Investor reports endpoint.
- Investor cycles endpoint.
- Return summary fields.
- Return ledger fields.
- Demo pilot dataset.

Не менять smart contracts для этой phase.

## MVP Scope

### In Scope

- Investor dashboard analytics layout.
- Portfolio KPI cards.
- Deal comparison cards.
- ROI and returns summary.
- Reporting signal summary.
- Risk and attention labels.
- Demo-safe fallback values.
- Screenshot-ready layout for investor demos.

### Out of Scope

- Smart contract changes.
- NEAR redeploy.
- New financial execution logic.
- New legal investment claims.
- Database migrations unless separately approved.
- Admin dashboard changes unless required for data consistency.
- Farmer dashboard changes unless required for investor reporting context.

## Suggested UI Structure

1. Page title: Investor Analytics Dashboard.
2. Subtitle: Portfolio analytics for agricultural pilot deals.
3. Wallet or investor account display.
4. Portfolio Summary KPI row.
5. ROI and Returns Panel.
6. Deal Performance Cards.
7. Reporting Signals Panel.
8. Risk and Attention Panel.
9. Link to detailed deal view.

## Demo Screenshot Target

Potential future screenshot:

- `docs/screenshots/demo-v1/09-investor-analytics-dashboard.png`

Screenshot requirements:

- Dashboard title visible.
- Portfolio KPI cards visible.
- At least one active deal and one completed deal visible.
- ROI and returns panel visible.
- Reporting signals visible.
- Risk or attention labels visible.
- No private credentials or sensitive data visible.

## Analytics Metrics

Track the following dashboard metrics:

|Metric|Source|Fallback|
|---|---|---|
|Total allocated capital|Deal amount fields|Demo pilot totals|
|Active deals|Deal status|0|
|Completed deals|Deal status|0|
|Projected returns|Return summary or expected return|Not available|
|Returned amount|Return summary or ledger|0|
|Outstanding amount|Return summary|Not available|
|Average projected ROI|Deal-level projected ROI|Not available|
|Reports submitted|Cycle or report data|0|
|Reports pending|Cycle or report data|0|

## Success Criteria

Investor Analytics Dashboard готов, когда:

- Investors могут понять portfolio status within 30 seconds.
- Active и completed deals visually distinct.
- ROI and returns visible without implying guaranteed returns.
- Reporting signals visible at dashboard level.
- Risk or attention states clear.
- Existing investor deal detail flow remains intact.
- Existing wallet login remains intact.
- Existing admin and farmer flows are not changed.

## Risk Assessment

### ROI Overclaim Risk

Risk: Users могут воспринять projected ROI как guaranteed return.

Mitigation:

- Держать projected return disclaimer visible.
- Использовать "Projected ROI" для active deals.
- Использовать completed return language только для completed deals.

### Data Availability Risk

Risk: Некоторые analytics fields могут отсутствовать для части deal records.

Mitigation:

- Использовать safe display helpers.
- Prefer existing fields when available.
- Показывать "Not available" вместо invented precise values.

### Dashboard Complexity Risk

Risk: Слишком много metrics может сделать investor demo сложнее.

Mitigation:

- Держать first screen focused on capital, status, ROI, returns и reporting.
- Переносить detailed data в deal detail views.

### Backend Scope Risk

Risk: Analytics могут потребовать backend changes, если frontend aggregation недостаточна.

Mitigation:

- Начать с existing APIs.
- Добавлять backend aggregation только после ясного понимания frontend limits.
- Avoid database migrations unless separately approved.

## Implementation Order

1. Audit current investor dashboard data.
2. Define portfolio KPI helpers.
3. Add Investor Analytics Dashboard title and subtitle.
4. Add portfolio KPI cards.
5. Add ROI and Returns Panel.
6. Add deal performance cards.
7. Add reporting signals.
8. Add risk and attention labels.
9. Preserve existing investor detail navigation.
10. Add or update frontend tests.
11. Run backend tests.
12. Run frontend build.
13. Capture screenshot when authenticated demo state is ready.

## Readiness Score

Planning readiness score: 83 / 100.

Reasoning:

- ROI and Returns MVP уже дает core financial fields для investor analytics.
- Existing investor dashboard и deal detail flows дают strong base.
- Remaining work - UI composition, fallback handling, reporting signal aggregation и authenticated visual validation.

## Recommended Next Step

Audit current Investor Portal data flow и сопоставить каждый proposed KPI с existing frontend field или API response до implementation UI changes.
