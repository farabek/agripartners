# AgriPartners Alpha v1 Launch Kit

AgriPartners Alpha v1 Launch Kit is the primary navigation point for all launch materials related to the current Alpha v1 demonstration package.

This document is intended for NEAR Foundation, NEAR Horizon, accelerators, strategic partners, and investors reviewing the project. It links the core product, demo, presentation, NEAR, validation, and repository materials in one place.

AgriPartners Alpha v1 is a validation-stage demonstration platform using NEAR Testnet. It does not claim production deployment, audited smart contracts, or live mainnet operations.

## 1. Project Overview

- [Executive Summary](presentation-readiness/01-executive-summary.md) - concise overview of the problem, solution, agriculture focus, blockchain fit, and current Alpha v1 positioning.
- [Core Narrative](demo-readiness/05-core-narrative.md) - the main story used to explain why AgriPartners exists and how the demo should be presented.
- [Platform Metrics](presentation-readiness/03-platform-metrics.md) - current demo portfolio metrics based only on Alpha v1 data, including active deals, completed deals, listed capital, returned capital, ROI, and APR.

These documents are the best starting point for understanding what AgriPartners is, why the project exists, and what the current Alpha v1 package demonstrates.

## 2. Product

- [Marketplace](investor-portal.md) - demonstrates agricultural pilot deal discovery through investor-facing featured deals and project review flows.
- [Investor Portal](investor-portal.md) - shows portfolio metrics, active deals, completed deals, ROI, returns, project profiles, reports, and event history.
- [Farmer Portal](farmer-portal.md) - shows farmer profile information, assigned deals, operational metrics, and reporting visibility.
- [Admin Dashboard](admin-dashboard.md) - shows pilot portfolio monitoring, funding status, report status, repayment status, and event history.
- [Funding Progress](demo-assets/01-demo-assets-inventory.md) - represented in current Alpha v1 screenshots and demo assets as part of deal lifecycle visibility.
- [ROI & Returns](product-roadmap/05-roi-returns-final-audit.md) - documents the ROI and returns feature status and review findings for Alpha v1.
- [Portfolio Dashboard](product-roadmap/07-investor-portfolio-dashboard-audit.md) - documents investor portfolio dashboard status and review findings.

Together, these materials show the current product surface: marketplace discovery, investor review, farmer reporting, admin monitoring, funding progress, ROI visibility, and portfolio-level transparency.

## 3. Pilot Deals

- [Pilot Deals Summary](presentation-readiness/04-pilot-deals-summary.md) - primary pilot deal documentation for the Alpha v1 package.
- [Pitch Deck Pilot Deals Slide](pitch-deck/07-pilot-deals.md) - investor-facing slide version of the two pilot profiles.

Current pilot demonstration profiles:

- Fidlot Livestock - completed-state profile showing returned capital, submitted reporting, recorded return, and event history.
- Hissar Sheep - active-state profile showing active cycle, funding progress, projected return, outstanding amount, and reporting visibility.

These two pilots matter because they demonstrate both sides of the lifecycle: a completed agricultural investment state and an active agricultural investment state. They are demonstration profiles based on real pilot agreements and should not be presented as a mass-market operating product.

## 4. Demo

- [Demo Flow](presentation-readiness/02-demo-flow.md) - recommended walkthrough sequence for the Alpha v1 demo.
- [Demo Script](presentation-readiness/06-demo-script.md) - talk track for presenting the product to reviewers and partners.
- [Screenshot Guide](demo-readiness/06-demo-screenshot-guide.md) - guidance for capturing and explaining screenshots.
- [Demo Assets Inventory](demo-assets/01-demo-assets-inventory.md) - inventory of available screenshots, presentation assets, validation assets, missing assets, and readiness scores.

Recommended demo viewing order:

1. Read the Demo Flow.
2. Review the Demo Script.
3. Open the Demo Assets Inventory.
4. Inspect screenshots in the order of login, marketplace, pilot deal pages, investor dashboard, farmer dashboard, ROI and returns, funding progress, and admin dashboard.

## 5. Presentation

- [Pitch Deck](pitch-deck/README.md) - slide-by-slide Markdown deck for investors, accelerators, NEAR ecosystem reviewers, and strategic partners.
- [Investor Brief](investor-pack/investor-brief.md) - longer written brief for investors, grant reviewers, accelerators, and strategic partners who need more context.
- [Investor One Pager](presentation-readiness/07-investor-one-pager.md) - concise one-page overview for first-touch sharing and quick review.

Use the Pitch Deck for live presentation, the Investor Brief for deeper diligence, and the Investor One Pager for short introductions or follow-up emails.

## 6. NEAR

- [NEAR Use Case](presentation-readiness/05-near-use-case.md) - explains how Alpha v1 uses NEAR for wallet authentication, smart contract interaction, withdrawal demo flows, and verification.
- [Current Testnet Status](near-testnet.md) - describes the current NEAR Testnet positioning, wallet accounts, smart contract usage, transaction flow, and pilot lifecycle.
- [Future Mainnet Roadmap](pitch-deck/09-roadmap.md) - frames tokenization, audit planning, legal review, and NEAR Mainnet deployment as future stages.

Current implementation: AgriPartners Alpha v1 uses NEAR Testnet for wallet-linked access, contract-aware demo flows, transaction-oriented lifecycle actions, and blockchain-verifiable demo signals.

Future roadmap: Mainnet readiness, tokenization, expanded on-chain settlement, and institutional-grade workflows require additional beta validation, legal review, compliance review, smart contract audit planning, and production readiness work.

## 7. Validation

- [Wave 1 Tracking](near-execution/08-wave1-tracking.md) - tracks outreach and validation activity.
- [Validation Log](near-execution/09-validation-log.md) - records validation progress and reviewer feedback.
- [Target List](near-execution/10-wave1-target-list.md) - lists initial outreach targets.
- [Priority Targets](near-execution/12-wave1-priority-targets.md) - identifies higher-priority ecosystem and partner targets.
- [Outreach Messages](near-execution/13-outreach-messages.md) - provides message templates for reviewer, partner, and ecosystem outreach.

Validation workflow:

1. Identify relevant targets.
2. Prioritize NEAR ecosystem, accelerator, strategic partner, and investor contacts.
3. Send structured outreach messages.
4. Track responses and next steps.
5. Log feedback in the validation record.
6. Use feedback to refine the pitch, demo, pilot readiness, and partnership path.

## 8. GitHub

Current repository:

- [https://github.com/farabek/agripartners](https://github.com/farabek/agripartners)

Reviewers should inspect:

- Product documentation in `docs/`.
- Launch materials in `docs/pitch-deck/`, `docs/investor-pack/`, and `docs/presentation-readiness/`.
- NEAR and execution materials in `docs/near-testnet.md`, `docs/near-outreach/`, `docs/near-ecosystem/`, and `docs/near-execution/`.
- Demo assets and screenshots in `docs/demo-assets/` and `docs/screenshots/`.
- Application and contract code only as supporting evidence for the Alpha v1 implementation, not as a claim of production readiness.

## 9. Launch Readiness

Readiness summary based on the current demo assets inventory:

| Area | Readiness | Assessment |
|---|---:|---|
| Product | `92 / 100` | Alpha v1 includes marketplace, investor dashboard, portfolio layer, funding progress, farmer reporting, ROI and returns, and NEAR Testnet flows. |
| Documentation | `Ready` | Executive summary, product docs, NEAR docs, pilot deal summary, demo flow, and investor materials are available. |
| Demo | `82 / 100` | Demo flow and many screenshots exist, while some screenshot assets still need refresh or cleanup. |
| Presentation | `94 / 100` | Pitch deck, investor brief, one pager, and presentation readiness materials are available and grounded in current demo data. |
| Validation | `95 / 100` | Wave 1 tracking, validation log, target lists, priority targets, and outreach messages are available. |
| Overall | `90 / 100` | Ready for first outreach after focused screenshot refresh and asset-link review. |

This readiness assessment should be treated as an internal launch package assessment, not as a production readiness claim.

## 10. Recommended Reading Order

1. [Executive Summary](presentation-readiness/01-executive-summary.md)
2. [Pitch Deck](pitch-deck/README.md)
3. [Investor Brief](investor-pack/investor-brief.md)
4. [Demo Flow](presentation-readiness/02-demo-flow.md)
5. [Demo Assets Inventory](demo-assets/01-demo-assets-inventory.md)
6. [GitHub Repository](https://github.com/farabek/agripartners)
7. [NEAR Use Case](presentation-readiness/05-near-use-case.md)
8. [Current Testnet Status](near-testnet.md)
9. [Validation Package](near-execution/09-validation-log.md)

## Current Status

Current stage:

- AgriPartners Alpha v1.

Current environment:

- NEAR Testnet.

Current purpose:

- Validation.
- Pilot demonstration.
- Strategic partnerships.
- Accelerator applications.

Future:

- Mainnet readiness.
- Expanded pilots.
- Institutional investors.

AgriPartners Alpha v1 is a demonstration and validation package. It should be reviewed as current product evidence, partner-readiness material, and a roadmap foundation, not as an audited or production-deployed financial product.
