# AgriPartners

**Transparent agricultural investment workflows on NEAR Protocol**

[![Alpha](https://img.shields.io/badge/status-Alpha%20v1.2-2d6a4f?style=flat-square)](#current-product-status)
[![NEAR](https://img.shields.io/badge/NEAR-Testnet-black?style=flat-square)](#why-near)
[![Live Demo](https://img.shields.io/badge/demo-agripartners.vercel.app-2d6a4f?style=flat-square)](https://agripartners.vercel.app)

AgriPartners is an Alpha-stage platform for transparent agricultural investment workflows. It helps investors review pilot opportunities, helps farmers report operating progress, and helps platform operators track deals, returns, treasury activity, and lifecycle events. The current product uses NEAR Testnet for wallet-linked workflows and smart contract experimentation while remaining clear that it is not a production investment, custody, payout, or Mainnet settlement system.

AgriPartners v2 introduces a company-centered operating model. The Alpha application remains a technical and product-validation environment; the v2 documentation defines how the future business should operate.

## What Is AgriPartners?

AgriPartners is built around a simple trust problem: once agricultural capital leaves the investor's view, reporting and return visibility often become fragmented. The platform brings opportunity review, farmer reporting, return records, treasury visibility, and guided demos into one role-based product experience.

The Alpha v1.2 product focuses on:

- **Investor transparency:** investors can review pilot profiles, projected economics, recorded returns, and withdrawal-readiness context.
- **Farmer reporting:** farmers can track funding status, production cycles, reporting tasks, and project progress.
- **Operational workflows:** admins can manage deal lifecycle, reporting, return records, and oversight views.
- **Treasury Shadow Accounting:** treasury activity is shown as an Alpha transparency layer before production enforcement.
- **Presentation Mode:** guided demo flows explain the product to investors, NEAR ecosystem reviewers, accelerators, and strategic partners.

## AgriPartners v2 Operating Model

```text
External Investor
        |
        v
AgriPartners OÜ
        |
        v
Farmer
```

Under the target v2 model, AgriPartners OÜ is the legal counterparty for both investors and farmers. Investors interact only with AgriPartners; farmers also interact only with AgriPartners and receive and return funds in fiat currency. Farmers do not use cryptocurrency, wallets, tokens, or blockchain interfaces.

NEAR is limited to technical infrastructure for transparency, audit trails, automation, and settlement records. It does not replace contracts, banking, accounting, compliance, or authoritative fiat settlement records.

See the canonical [AgriPartners v2 Operating Model](docs/business/OPERATING_MODEL.md) and [Pilot 1.0 Plan](docs/platform/pilot/PILOT_1_PLAN.md).

## Current Product Status

AgriPartners Alpha v1.2 currently includes:

| Module | Status |
| --- | --- |
| Public Landing | Implemented |
| Marketplace | Implemented |
| Investor Portal | Implemented |
| Farmer Portal | Implemented |
| Admin Portal | Implemented |
| Treasury Dashboard | Implemented |
| Presentation Mode | Implemented |
| Wallet Authentication | Implemented |
| NEAR Testnet Integration | Implemented |
| Treasury Shadow Accounting | Alpha / non-authoritative |
| Mainnet Launch | Not started |
| Production Investment Offering | Not active |

## Explore The Demo

The fastest way to understand AgriPartners is Presentation Mode. It is a guided walkthrough and does not require backend setup, database access, wallet setup, or testnet funds.

- Investor demo: [agripartners.vercel.app/#demo/presentation/investor](https://agripartners.vercel.app/#demo/presentation/investor)
- NEAR ecosystem demo: [agripartners.vercel.app/#demo/presentation/near](https://agripartners.vercel.app/#demo/presentation/near)
- Accelerator demo: [agripartners.vercel.app/#demo/presentation/accelerator](https://agripartners.vercel.app/#demo/presentation/accelerator)
- Enterprise partner demo: [agripartners.vercel.app/#demo/presentation/enterprise](https://agripartners.vercel.app/#demo/presentation/enterprise)

Local frontend preview:

```bash
cd frontend
npm install
npm run dev:wallet-poc
# Open http://127.0.0.1:5173/#demo/presentation/investor
```

## Product Highlights

### Investor Experience

The Investor Portal presents pilot deal context, projected economics, portfolio visibility, recorded returns, and withdrawal-readiness framing. The goal is to make agricultural opportunities easier to understand and compare without overstating Alpha-stage financial certainty.

### Farmer Workflow

The Farmer Portal gives farmers a structured place to see funding status, production cycles, operational progress, and reporting tasks. It supports the product goal of connecting capital to real-world agricultural activity.

### Returns Tracking

AgriPartners separates projected, recorded, paid, and reconciled language. This matters because Alpha return records are useful for workflow validation, but they should not be presented as audited or production-settled performance.

### Treasury Visibility

The Treasury Dashboard and Treasury Shadow Accounting layer show how capital activity, return records, and operational events can become more transparent. In Alpha v1.2, this is a visibility and discipline layer, not production treasury enforcement.

### Presentation Mode

Presentation Mode turns the product into a guided demo with audience-specific profiles for investors, NEAR ecosystem reviewers, accelerators, and enterprise partners. It is the recommended first entry point for external review.

## Demonstration Models

AgriPartners currently uses two livestock demonstration models to validate workflows and product experience. These are demonstration profiles, not production investment offerings.

| Model | Status | Purpose |
| --- | --- | --- |
| Feedlot / Fidlot | Completed demo | Shows completed workflow, investment terms, reports, recorded returns, return progress, and treasury visibility. |
| Hissar Sheep | Active demo | Shows active opportunity review, farmer progress, reporting context, and projected return visibility. |

## Why NEAR?

NEAR is used as the Alpha testnet environment for wallet-linked workflows, smart contract experimentation, and future transparent workflow patterns. Under the v2 business model, investor-facing blockchain features may be evaluated separately, but farmers remain entirely within AgriPartners-managed fiat workflows. AgriPartners is evaluating how NEAR can support:

- investor and operator infrastructure where legally and operationally appropriate;
- testnet validation before production or Mainnet decisions;
- transparent references for lifecycle, audit, settlement, and reconciliation events;
- developer-friendly smart contract experimentation;
- clearer audit trails for real-world agricultural workflows.

Mainnet evaluation should follow stronger security, custody, reconciliation, treasury enforcement, monitoring, and compliance preparation.

## Architecture

```text
Users
  |
  |-- Public Landing / Marketplace
  |-- Investor Portal
  |-- Farmer Portal
  |-- Admin Portal
  |-- Presentation Mode
        |
        v
Frontend (Vanilla JS + Vite)
        |
        v
Backend API (Node.js + Express)
        |
        |-- PostgreSQL data model
        |-- Auth and role-scoped routes
        |-- Deal, profile, reporting, return, and treasury services
        |
        v
NEAR Testnet integration
        |
        v
Rust smart contract experiments
```

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | Vanilla JavaScript, Vite, Tailwind CSS, Chart.js |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT, wallet authentication, role-scoped access |
| Blockchain | NEAR Protocol Testnet |
| Smart Contract | Rust, near-sdk, WASM |
| Hosting | Vercel frontend, Render backend |
| Documentation | Markdown docs, investor and NEAR outreach materials |

## Repository Structure

```text
agripartners/
  backend/       Node.js API, services, routes, tests, migrations
  contract/      Rust NEAR smart contract
  docs/          NEAR, investor, release, design, demo, and product docs
  frontend/      Vite frontend application and wallet-auth proof of concept
  outputs/       Generated/local output artifacts
  screenshots/   Local screenshot assets
  scripts/       Utility scripts
  demo.ps1       Legacy full-lifecycle testnet demo script
  render.yaml    Render deployment configuration
```

## Documentation

Useful public entry points:

- [AgriPartners v2 Operating Model](docs/business/OPERATING_MODEL.md)
- [Pilot 1.0 Documentation](docs/platform/pilot/PILOT_1_PLAN.md)
- [NEAR materials](docs/near/)
- [Investor materials](docs/investors/)
- [Release notes](docs/releases/)
- [Main docs index](docs/README.md)

Recommended reading order:

1. [AgriPartners v2 Operating Model](docs/business/OPERATING_MODEL.md)
2. [Pilot 1.0 Plan](docs/platform/pilot/PILOT_1_PLAN.md)
3. [Pilot 1.0 Readiness Checklist](docs/platform/pilot/PILOT_READINESS_CHECKLIST.md)
4. [NEAR executive one-pager](docs/near/executive-one-pager.md)
5. [Investor executive one-pager](docs/investors/investor-executive-one-pager.md)

## Roadmap

The v2 business roadmap replaces the former Alpha/Beta/Pilot Expansion sequence:

| Phase | Name | Primary outcome |
| --- | --- | --- |
| 1 | Alpha | Validate product concepts, workflows, and documentation. |
| 2 | Company Registration | Establish AgriPartners OÜ and its legal, banking, accounting, governance, and contracting foundation. |
| 3 | Pilot 1.0 | Validate one tightly controlled end-to-end cycle with fiat farmer flows. |
| 4 | Pilot 2.0 | Repeat and broaden the operating model using Pilot 1.0 evidence. |
| 5 | Production Ready | Complete production-grade operational, compliance, security, monitoring, and support readiness. |
| 6 | Investor Protection | Finalize and approve investor-protection mechanisms. |
| 7 | Marketplace | Launch controlled Marketplace access after all preceding gates are met. |

The existing Investor Protection documentation remains valid as exploratory work but is deferred to the Marketplace program: design and readiness are handled in Phase 6, while activation can occur only as part of an approved Phase 7 Marketplace.

## Screenshots

TODO: Refresh and embed current Alpha v1.2 screenshots before using screenshots as public evidence. Existing screenshot assets may reflect earlier demo states and should be reviewed before being promoted in the public README.

## Contributing

AgriPartners is currently founder-led and in Alpha. External feedback is welcome, especially around:

- NEAR ecosystem fit;
- wallet UX;
- treasury and reconciliation design;
- farmer reporting workflows;
- investor presentation clarity;
- Beta and Mainnet-readiness expectations.

For discussion or collaboration, contact: `farhodmuhamadiev4@gmail.com`.

## License

No standalone `LICENSE` file is currently present in this repository. Add or confirm the project license before treating the repository as open-source for reuse.
