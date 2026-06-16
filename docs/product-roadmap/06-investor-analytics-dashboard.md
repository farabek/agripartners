# Investor Analytics Dashboard

## Purpose

This document defines the product roadmap for an Investor Analytics Dashboard in AgriPartners Alpha v1.

The goal is to strengthen the investor-facing demo by moving from basic deal visibility toward clearer portfolio analytics, ROI tracking, repayment visibility, risk signals, and pilot comparison.

This is a planning document only. It does not change frontend code, backend code, smart contracts, database schema, tests, deployment configuration, commits, or pushes.

## Product Goal

The Investor Analytics Dashboard should help investors answer five questions quickly:

- How much capital is allocated?
- Which deals are active or completed?
- What return is projected?
- What amount has been returned?
- What risk or reporting signals need attention?

## Target Audiences

### Investors

Investors need a clear view of capital allocation, ROI, returned amount, outstanding amount, and deal status.

### NEAR Ecosystem Reviewers

NEAR reviewers need to see how investor analytics connect to transparent real-world asset workflows.

### Accelerators

Accelerators need to see whether the product has a clear dashboard value proposition and measurable validation path.

### Strategic Partners

Partners need to understand which pilot deals are active, which are completed, and which operational signals support trust.

## Core Dashboard Sections

### Portfolio Summary

Purpose:

- Show the investor's overall position across pilot deals.

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

- Compare active and completed agricultural pilot deals.

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

- Make projected ROI and repayment visibility easy to understand.

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

- Show whether farmer reporting is supporting investor confidence.

Recommended fields:

- Reports submitted.
- Reports pending.
- Next report due.
- Latest farmer report summary.
- Active cycle status.
- Report completeness signal.

### Risk and Attention Panel

Purpose:

- Help investors identify which deals need review.

Recommended signals:

- Missing report.
- Outstanding return.
- Active deal without recent update.
- Funding not confirmed.
- Cycle pending.
- Legal or audit disclaimer where relevant.

## Data Sources

Prefer existing APIs and frontend aggregation before adding backend changes.

Potential existing data sources:

- Investor deals endpoint.
- Investor deal detail endpoint.
- Investor reports endpoint.
- Investor cycles endpoint.
- Return summary fields.
- Return ledger fields.
- Demo pilot dataset.

Do not change smart contracts for this phase.

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

The Investor Analytics Dashboard is ready when:

- Investors can understand portfolio status within 30 seconds.
- Active and completed deals are visually distinct.
- ROI and returns are visible without implying guaranteed returns.
- Reporting signals are visible at dashboard level.
- Risk or attention states are clear.
- Existing investor deal detail flow remains intact.
- Existing wallet login remains intact.
- Existing admin and farmer flows are not changed.

## Risk Assessment

### ROI Overclaim Risk

Risk: Users may interpret projected ROI as guaranteed return.

Mitigation:

- Keep the projected return disclaimer visible.
- Use "Projected ROI" for active deals.
- Use completed return language only for completed deals.

### Data Availability Risk

Risk: Some analytics fields may not exist for all deal records.

Mitigation:

- Use safe display helpers.
- Prefer existing fields when available.
- Show "Not available" instead of inventing precise values.

### Dashboard Complexity Risk

Risk: Too many metrics may make the investor demo harder to understand.

Mitigation:

- Keep the first screen focused on capital, status, ROI, returns, and reporting.
- Move detailed data into deal detail views.

### Backend Scope Risk

Risk: Analytics may require backend changes if frontend aggregation is insufficient.

Mitigation:

- Start with existing APIs.
- Add backend aggregation only after frontend limits are clear.
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

- ROI and Returns MVP already provides the core financial fields needed for investor analytics.
- Existing investor dashboard and deal detail flows provide a strong base.
- The remaining work is UI composition, fallback handling, reporting signal aggregation, and authenticated visual validation.

## Recommended Next Step

Audit the current Investor Portal data flow and map each proposed KPI to an existing frontend field or API response before implementing UI changes.
