# AgriPartners Pilot MVP Documentation

AgriPartners is a pilot platform for transparent agricultural investment workflows on NEAR. The current MVP demonstrates how capital, farm operations, reporting, and returns can be presented through role-specific portals for investors, farmers, and administrators.

## Project Overview

The Pilot MVP focuses on two agricultural project profiles:

- Fidlot Livestock Project, a completed livestock fattening pilot.
- Hissar Sheep Breeding Project, an active sheep breeding pilot.

The demo shows a clean operating view of these projects while preserving the underlying testnet and product-development workflows. The purpose of this documentation pack is to help investors, partners, and internal stakeholders understand the product experience without needing to inspect source code or raw test data.

## AgriPartners Vision

AgriPartners is designed to connect agricultural operators with transparent investment capital. The long-term vision is to make farm financing easier to monitor, easier to report, and easier to trust.

The platform combines:

- Farmer-facing operational reporting.
- Investor-facing portfolio visibility.
- Admin-facing project monitoring.
- NEAR-based contract and wallet infrastructure.

## Pilot MVP Architecture

The MVP is organized around a simple role-based web application:

- Frontend portals provide dashboard, project, and reporting views.
- Backend APIs manage profile, deal, reporting, and testnet integration flows.
- NEAR Testnet smart contracts support deal lifecycle operations.
- Wallet authentication controls access to role-specific portal views.

The current demo presentation layer shows clean pilot projects for screenshots and investor walkthroughs. Real testnet and development data can remain in the system while the demo experience presents the two pilot projects in a focused way.

## User Roles

### Investor

Investors review pilot opportunities, track investment summaries, monitor active and completed deals, and view projected or realized ROI and returns.

### Farmer

Farmers see their pilot farm profile, funding confirmation, cycle status, reporting status, and assigned project cards.

### Admin

Admins monitor pilot funding, deal status, farmer reporting, repayment status, and event history across the pilot portfolio.

## Documentation Pages

- [Investor Portal](investor-portal.md)
- [Farmer Portal](farmer-portal.md)
- [Admin Dashboard](admin-dashboard.md)
- [NEAR Testnet](near-testnet.md)
- [ADR-001 — Live-first Architecture](architecture/ADR-001-live-first-architecture.md)
- [ADR-002 — Financial Semantics](architecture/ADR-002-financial-semantics.md)

## Supporting Folders

- [Screenshots](screenshots/)
- [Architecture](architecture/)
- [Investor Deck](investor-deck/)
- [Business Model](business-model/)
- [Workflows](workflows/)
- [Demo Guide](demo-guide/)
