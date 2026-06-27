# Phase 11.2 - Investor Portfolio Dashboard Audit & Design

## Purpose

This document audits the current Investor Analytics Dashboard, Marketplace MVP, investor routes, and deal service data model to design an Investor Portfolio Dashboard before implementation.

This is documentation only. It does not change frontend code, backend routes, database schema, migrations, contracts, commits, or pushes.

## Reviewed Sources

- `frontend/app.js`
- `frontend/style.css`
- `backend/src/routes/investor.js`
- `backend/src/services/dealService.js`
- Existing Investor Analytics Dashboard
- Existing Marketplace MVP
- Existing ROI / returns roadmap documents

## Current Dashboard Context

The current investor entry screen is already titled `Investor Analytics Dashboard`. It loads wallet session data, investor profile data, investor deals from `GET /api/investor/deals`, and demo pilot deals when `INVESTOR_DEMO_DATASET_ENABLED = true`.

The current dashboard already includes Portfolio Summary, ROI & Returns Overview, Deal Performance, Reporting Signals, Risk / Attention Panel, Featured Pilot Deals, Active Investments, and Completed Investments.

The requested Portfolio Dashboard is best treated as a focused redesign and data mapping of the existing Investor Analytics Dashboard, not as a new backend feature.

## Existing Portfolio Data

| Metric | Available Now | Source | Notes |
|---|---:|---|---|
| Total Invested | Yes | `deal.amount`, `deal.invested_amount`, demo `amount` | Current frontend sums `amount`. Demo mode uses USD display values. |
| Projected Returns | Yes | `expected_return`, `display_expected_return` | Computed by `dealService.getDealReturnSummary()`. |
| Returned Amount | Yes | `returned_amount`, `display_returned_amount` | Derived from `deal_returns` ledger. |
| Outstanding Returns | Yes | `outstanding_amount`, `display_outstanding_amount` | Derived from projected return minus returned amount. |
| Average ROI | Yes | `projected_roi_pct`, `roi_percent`, demo `roiPercent` | Current frontend averages deal-level ROI fields. |
| Active Deals | Yes | `deal.status.status` or demo status | Current frontend treats non-Completed / non-Terminated as active. |
| Completed Deals | Yes | `deal.status.status === "Completed"` or demo status | Current frontend uses status from NEAR contract or demo profile. |

### Demo Portfolio Values

With the current two pilot demo profiles:

| Metric | Demo Value |
|---|---:|
| Total Invested | `$100,000` |
| Projected Returns | `$163,672` |
| Returned Amount | `$82,000` |
| Outstanding Returns | `$81,672` |
| Average ROI | `63.7%` |
| Active Deals | `1` |
| Completed Deals | `1` |

## Additional Metrics Available Without Backend Changes

| Metric | Available Without Backend Changes | Calculation | Caveat |
|---|---:|---|---|
| Profit Realized | Yes | `max(totalReturned - totalInvested, 0)` or sum per deal | Accurate only when returned includes capital plus profit. Current demo supports this. |
| Return Completion Rate | Yes | `totalReturned / totalProjectedReturn * 100` | Already implemented as `returnCompletionRate(metrics)`. |
| Capital Returned % | Yes | `totalReturned / totalInvested * 100` | Distinct from return completion rate. |
| Portfolio Allocation by Deal | Yes | `deal invested / total invested` | Can use existing enriched deal array. |
| Portfolio Allocation by Farm Type | Yes | Group by `deal_type` or demo `type` | Current data has type, not a full farm taxonomy. |
| Portfolio Allocation by Country | Partial / No | Only if country is present in profile or future deal metadata | Current deal records do not include farm country. Investor profile country is not deal allocation country. |
| Deals Requiring Attention | Yes | Active deals with outstanding returns, no returns, missing report, pending cycle | Basic version exists from financial fields; richer version needs per-deal cycles/reports fanout. |
| Deals With No Returns | Yes | `deriveReturnStatus(deal) === "no_returns"` | Already implemented at dashboard level. |
| Completed Deals % | Yes | `completedDeals / totalDeals * 100` | Straight frontend aggregation. |

### Demo Values for Additional Metrics

| Metric | Demo Value |
|---|---:|
| Profit Realized | `$32,000` |
| Return Completion Rate | `50.1%` |
| Capital Returned % | `82.0%` |
| Portfolio Allocation by Deal | Fidlot 50%, Hissar 50% |
| Portfolio Allocation by Farm Type | Fidlot 50%, Hissar Sheep 50% |
| Portfolio Allocation by Country | Not available |
| Deals Requiring Attention | `1` |
| Deals With No Returns | `1` |
| Completed Deals % | `50.0%` |

## Required Data Sources

### Dashboard-Level Sources

| Source | Current Route / Function | Use |
|---|---|---|
| Investor deals | `GET /api/investor/deals` | Base deal list for the connected investor wallet. |
| Investor deal detail | `GET /api/investor/deals/:id` | Enriched financial return summary for each deal. |
| Investor profile | `GET /api/investor/profile` | Wallet-linked investor identity and display context. |
| Demo pilot dataset | `INVESTOR_DEMO_PILOTS` | Demo-ready portfolio data for Fidlot and Hissar pilot profiles. |
| Marketplace dataset | `marketplaceDeals()` | Available pilot deal comparison and status context. |

### Per-Deal Detail Sources

| Source | Current Route / Function | Use |
|---|---|---|
| Contract status | `GET /api/investor/deals/:id/status` | Active/completed status and current cycle. |
| Contract balances | `GET /api/investor/deals/:id/balances` | Investor available balance in detailed view. |
| Farmer reports | `GET /api/investor/deals/:id/reports` | Latest farmer reports and reporting confidence. |
| Cycles | `GET /api/investor/deals/:id/cycles` | Funding sent, funding confirmed, report submitted signals. |
| Returns ledger | `GET /api/investor/deals/:id/returns` | Latest returns and repayment history. |
| Deal events | `GET /api/investor/deals/:id/events` | Latest deal events and transaction-linked history. |

## Missing Data

| Missing / Weak Field | Impact | MVP Handling |
|---|---|---|
| Deal country / farm location | Blocks true allocation by country. | Hide country allocation or show "Not available". |
| Farm type taxonomy | `deal_type` exists, but values are not normalized. | Use `deal_type` / pilot type as Farm Type. |
| Recent activity feed endpoint | Dashboard can show activity only by calling per-deal reports, returns, and events. | Use frontend fanout for small demo portfolios; defer backend aggregation. |
| Report due date | Cannot reliably classify overdue reports. | Use "missing report" / "waiting for farmer report" instead of overdue claims. |
| Last update timestamp at deal level | Harder to rank stale deals. | Use latest event/report/return timestamp when fetched. |
| Realized profit separated from capital return | Current returned amount is total returned, not split into capital and profit. | Calculate profit as returned minus invested and label carefully. |
| Risk severity model | No formal risk scoring exists. | Use simple attention labels, not risk scores. |

## Dashboard Wireframe

```text
Investor Portfolio Dashboard
Portfolio analytics for connected wallet
[Wallet / Profile strip]

Portfolio Overview
+----------------+----------------+-------------+-----------------+
| Total Invested | Total Returned | Outstanding | Profit Realized |
+----------------+----------------+-------------+-----------------+

Portfolio Performance
+-------------+------------------------+--------------------+
| Average ROI | Return Completion Rate | Capital Returned % |
+-------------+------------------------+--------------------+

Portfolio Allocation
+----------------------+-------------------------+
| Allocation by Deal   | Allocation by Farm Type |
| Fidlot 50%           | Fidlot 50%              |
| Hissar 50%           | Hissar Sheep 50%        |
+----------------------+-------------------------+
| Allocation by Country: Not available in current data |
+------------------------------------------------------+

Portfolio Health
+--------------+-----------------+---------------------------+-----------------------+
| Active Deals | Completed Deals | Deals Requiring Attention | Deals With No Returns |
+--------------+-----------------+---------------------------+-----------------------+

Recent Activity
+-----------------------+----------------+--------------------+
| Latest Farmer Reports | Latest Returns | Latest Deal Events |
+-----------------------+----------------+--------------------+

Deal Performance
+-------------------------------------------------------------------+
| Deal card: status, invested, projected return, returned, ROI, CTA |
+-------------------------------------------------------------------+
```

## Section Design

### A. Portfolio Overview

Fields:

- Total Invested.
- Total Returned.
- Outstanding.
- Profit Realized.

Build status:

- Fully buildable from current enriched deal data.
- Demo mode fully supports this section.

Recommended rule:

- Label `Profit Realized` as calculated from returned amount minus invested amount.
- Keep the projected returns disclaimer visible nearby.

### B. Portfolio Performance

Fields:

- Average ROI.
- Return Completion Rate.
- Capital Returned %.

Build status:

- Fully buildable from current data.
- `Return Completion Rate` already exists.
- `Capital Returned %` is a new frontend-only calculation.

Recommended rule:

- Use `Average Projected ROI` for active portfolios.
- Use `Average ROI` only when all deals are completed, or keep current mixed label with caution.

### C. Portfolio Allocation

Fields:

- By Deal.
- By Farm Type.
- By Country, if available.

Build status:

- By Deal: buildable now.
- By Farm Type: buildable now using `deal_type` / demo `type`.
- By Country: not buildable from current deal data.

Recommended MVP:

- Show Deal and Farm Type allocation.
- Show Country allocation as disabled / unavailable only if useful for transparency.

### D. Portfolio Health

Fields:

- Active Deals.
- Completed Deals.
- Deals Requiring Attention.
- Deals With No Returns Yet.

Build status:

- Basic version is buildable now from current enriched deal data.
- Stronger attention logic can use existing per-deal reports/cycles without backend changes.

Recommended attention signals:

- Active deal with outstanding returns.
- Deal with no returns recorded.
- Cycle waiting for farmer report.
- Funding sent but not confirmed.
- No cycle updates yet.

### E. Recent Activity

Fields:

- Latest Farmer Reports.
- Latest Returns.
- Latest Deal Events.

Build status:

- Buildable without backend changes by fetching existing per-deal endpoints for each investor deal.
- Current dashboard does not aggregate this yet.
- Current detail screens already render reports, returns, and events.

Recommended MVP:

- Include Recent Activity only when using demo data or when the deal count is small.
- For real portfolios, consider adding a backend aggregation endpoint later if portfolios grow.

## Demo Readiness

| Section | Can Be Built Entirely From Existing Data | Demo Ready | Notes |
|---|---:|---:|---|
| Portfolio Overview | Yes | Yes | Current demo pilots provide complete financial values. |
| Portfolio Performance | Yes | Yes | Needs one added frontend calculation for Capital Returned %. |
| Portfolio Allocation by Deal | Yes | Yes | Straight aggregation. |
| Portfolio Allocation by Farm Type | Yes | Yes | Use current `deal_type` / pilot type. |
| Portfolio Allocation by Country | No | No | Missing deal-level country. |
| Portfolio Health | Yes | Yes | Basic health is already supported. |
| Recent Farmer Reports | Yes, with per-deal fanout | Yes | Existing detail endpoints support it. |
| Recent Returns | Yes, with per-deal fanout | Yes | Existing return ledger supports it. |
| Recent Deal Events | Yes, with per-deal fanout | Yes | Existing events endpoint supports it. |

## Recommended MVP Scope

### Include

- Rename or frame the dashboard as `Investor Portfolio Dashboard` while preserving the current analytics intent.
- Portfolio Overview KPI row.
- Portfolio Performance KPI row.
- Portfolio Allocation by Deal and Farm Type.
- Portfolio Health cards.
- Existing Deal Performance cards.
- Existing Featured Pilot Deals or Marketplace link.
- Return disclaimer wherever projected returns are shown.

### Include If Time Allows

- Recent Activity using existing per-deal endpoints.
- Latest report / latest return / latest event cards.
- Lightweight attention labels on deal cards.

### Defer

- Country allocation.
- Backend portfolio aggregation endpoint.
- Formal risk scoring.
- Report overdue logic.
- New database columns.
- Contract changes.

## Risk Assessment

| Risk | Severity | Description | Mitigation |
|---|---|---|---|
| ROI overclaim risk | High | Projected ROI may be read as guaranteed. | Use "Projected ROI" for active deals and keep disclaimer visible. |
| Profit interpretation risk | Medium | Returned amount may include capital plus profit, but no capital/profit split exists. | Label profit as calculated estimate: returned minus invested. |
| Country allocation gap | Low | Requested country allocation is not supported by current deal data. | Exclude from MVP or show unavailable state. |
| Frontend fanout cost | Medium | Recent Activity requires multiple requests per deal. | Use only for small portfolios or defer backend aggregation. |
| Demo vs production mismatch | Medium | Demo mode uses USD pilot data; real route uses NEAR amounts. | Preserve currency note and avoid mixing currencies. |
| Attention logic ambiguity | Medium | No due dates or risk severity model exists. | Use plain operational labels instead of hard risk scores. |

## Readiness Score

Investor Portfolio Dashboard readiness score: 88 / 100.

Reasoning:

- The core financial model is already present through deal return summaries.
- The frontend already aggregates the main portfolio metrics.
- Demo data is complete enough for a strong investor-facing view.
- Existing per-deal endpoints can support recent activity without backend changes.
- The main gaps are country allocation, formal activity aggregation, and careful language around realized profit and projected ROI.

## Recommended Next Step

Implement the MVP as a frontend-only dashboard refinement:

1. Add `Profit Realized`, `Capital Returned %`, `Completed Deals %`, and allocation helpers.
2. Reorganize the existing investor dashboard sections into the Portfolio Overview / Performance / Allocation / Health structure.
3. Keep Recent Activity as a secondary section using existing per-deal endpoints or demo data.
4. Do not change backend routes, database schema, migrations, or contracts for the MVP.
