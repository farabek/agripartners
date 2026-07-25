<!-- markdownlint-configure-file { "MD013": false, "MD036": false } -->

# AgriPartners

**Transparent agricultural investment workflows on NEAR Protocol**

[![Alpha](https://img.shields.io/badge/status-Alpha%20v1.2-2d6a4f?style=flat-square)](#current-status-and-guardrails)
[![NEAR](https://img.shields.io/badge/NEAR-Testnet-black?style=flat-square)](#why-near)
[![Live Demo](https://img.shields.io/badge/demo-agripartners.vercel.app-2d6a4f?style=flat-square)](https://agripartners.vercel.app)

AgriPartners is an Alpha-stage platform for transparent agricultural investment workflows. It
helps investors review pilot opportunities, farmers report operating progress, and platform
operators track deals, returns, treasury activity, and lifecycle events.

## Start Here — Platform Model

Read the [Canonical AgriPartners Platform Model](docs/platform/AGRIPARTNERS_PLATFORM_MODEL.md)
first. It connects participants, legal relationships, the crypto/fiat boundary, financial
workflows, technical architecture, pilot mappings, implementation status, safe verification,
accepted limitations, and the roadmap.

Current status: Alpha / working prototype on NEAR Testnet. Stage 2 Slice 2 is merged at the
verified `main` checkpoint; Stage 2 Slice 3 and the Project Expense API are not implemented.

## Current Status and Guardrails

**Current product — Alpha v1.2 demonstration**

- Runs on NEAR Testnet for wallet-linked workflows and smart contract experimentation.
- Accepts no live investments.
- Provides no production custody, payout, settlement, or Mainnet investment system.

[Alpha v1.2](docs/releases/alpha-v1.2-release-notes.md) is the current presentation release.
[Alpha v1.1](docs/releases/ALPHA_V1_1_RELEASE.md) remains an official completed milestone and the
foundation of the current presentation release; it is not the current product version.

**Future operating model**

- AgriPartners OÜ in Estonia is the central operating company and legal counterparty for External
  Investors.
- Cryptocurrency stops at AgriPartners OÜ in Estonia and is converted through approved
  crypto-to-fiat infrastructure before any Uzbekistan activity is financed.
- AgriPartners OÜ and the Uzbekistan Feedlot Operator contract separately; every disbursement,
  proceed, repayment, and return crossing the Estonia-to-Uzbekistan boundary uses a fiat bank or
  payment transfer.
- The Uzbekistan Feedlot Operator and Farmer product role are fiat-only and non-crypto.
- Production implementation depends on legal, banking, compliance, and partner setup.

The current farmer-wallet, farmer-withdrawal, NEAR-funding, and smart-contract-payout
implementation is **Legacy Testnet Alpha — historical technical demonstration, not the target
production financial architecture**. It is retained as Alpha evidence and must not be interpreted
as an approved production flow.

> **Business Architecture v1.0 is frozen as of 2026-07-02.** Future architectural changes require
> RFC review. See the [Business Architecture v1.0 Freeze](docs/business/BUSINESS_ARCHITECTURE_V1_FREEZE.md).

## Quick Links

- [Start with the Canonical Platform Model](docs/platform/AGRIPARTNERS_PLATFORM_MODEL.md)
- [Explore the live Investor Demo](https://agripartners.vercel.app/#demo/presentation/investor)
- [Open Presentation Mode](https://agripartners.vercel.app/#demo/presentation/near)
- [Start with Documentation](docs/README.md)
- [Review the Investor Package](docs/investor/README.md)
- [Read the Product Book](docs/PRODUCT_BOOK.md)
- [View the Current Roadmap](docs/ROADMAP.md)
- [Review Current and Historical Releases](docs/RELEASES.md)

## Documentation

New to the project?

1. Open the [documentation landing page](docs/README.md).
2. Continue to the [official Documentation Index](docs/DOCUMENTATION_INDEX.md).
3. Choose the relevant Product, Investor, Farmer, NEAR, Partnerships, Internal, or Archive path.

The Documentation Index is the canonical documentation map. This README remains a lightweight
repository landing page and does not duplicate the detailed index.

## Product Overview and Highlights

AgriPartners addresses a simple trust problem: once agricultural capital leaves the investor's
view, reporting and return visibility often become fragmented. The platform brings opportunity
review, farmer reporting, return records, treasury visibility, and guided demos into one
role-based product experience.

Alpha v1.2 currently includes:

| Module | Status |
| --- | --- |
| Public Landing | Implemented |
| Opportunity Catalog (Alpha demo) | Implemented |
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

### Investor Experience

The Investor Portal presents pilot deal context, projected economics, portfolio visibility,
recorded returns, and withdrawal-readiness framing. It makes agricultural opportunities easier
to understand and compare without overstating Alpha-stage financial certainty.

### Farmer Workflow

The Farmer Portal gives farmers a structured place to see funding status, production cycles,
operational progress, and reporting tasks. It supports the product goal of connecting capital to
real-world agricultural activity.

### Returns Tracking

AgriPartners separates projected, recorded, paid, and reconciled language. Alpha return records
are useful for workflow validation but are not audited or production-settled performance.

### Treasury Visibility

The Treasury Dashboard and Treasury Shadow Accounting layer show how capital activity, return
records, and operational events can become more transparent. In Alpha v1.2, this is a visibility
and discipline layer, not production treasury enforcement.

### Presentation Mode

Presentation Mode provides guided, audience-specific demos for investors, NEAR ecosystem
reviewers, accelerators, and enterprise partners. It is the recommended first entry point for
external review.

### Master Investment Models and Alpha Demonstrations

Feedlot and Hissar Sheep are the official reusable Master Investment Models. The current Alpha
uses demonstration Project profiles derived from them to validate workflows and product
experience. The Alpha profiles are not production investment offerings.

| Model | Alpha demonstration status | Purpose |
| --- | --- | --- |
| [Feedlot Master Investment Model](docs/business/investment-models/FEEDLOT_MASTER_INVESTMENT_MODEL.md) | Completed demo Project | Shows completed workflow, investment terms, reports, recorded returns, return progress, and treasury visibility. |
| [Hissar Sheep Master Investment Model](docs/business/investment-models/HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md) | Active demo Project | Shows active opportunity review, farmer progress, reporting context, and projected return visibility. |

## Demo Access

The fastest way to understand AgriPartners is Presentation Mode. The guided walkthrough does not
require backend setup, database access, wallet setup, registration, or testnet funds.

- [Investor demo](https://agripartners.vercel.app/#demo/presentation/investor)
- [NEAR ecosystem demo](https://agripartners.vercel.app/#demo/presentation/near)
- [Accelerator demo](https://agripartners.vercel.app/#demo/presentation/accelerator)
- [Enterprise partner demo](https://agripartners.vercel.app/#demo/presentation/enterprise)

Local frontend preview:

```bash
cd frontend
npm install
npm run dev:wallet-poc
# Open http://127.0.0.1:5173/#demo/presentation/investor
```

## Operating Model

AgriPartners v2 defines the intended company-centered business model. It is future commercial
architecture, while the current Alpha remains a technical and product-validation environment.

```text
External Investor
        |
        v
AgriPartners OÜ
        |
        | approved crypto-to-fiat infrastructure
        | cryptocurrency stops in Estonia
        v
Fiat bank or payment transfer
        |
        v
Uzbekistan Feedlot Operator
```

Under the target model, AgriPartners OÜ is the legal counterparty for External Investors and signs
a separate operating agreement with the Uzbekistan Feedlot Operator. The Operator receives and
returns funds only in fiat currency. `Farmer` is a non-crypto product role for operational work,
reporting, evidence, and confirmations; it is not a wallet owner or on-chain financial actor.

Investors may use supported crypto assets through selected AgriPartners financial infrastructure.
Cryptocurrency is limited to the External Investor and AgriPartners OÜ Estonia layer and stops at
AgriPartners OÜ. The final
bank, payment institution, licensed CASP, or other compliant provider depends on company
registration, partner setup, and legal review; this documentation selects no provider.

NEAR is limited to technical infrastructure for transparency, audit trails, automation, and
settlement records. It does not replace contracts, banking, accounting, compliance, or
authoritative fiat settlement records.

See the canonical [AgriPartners v2 Operating Model](docs/business/OPERATING_MODEL.md) and
[Pilot 1.0 Plan](docs/platform/pilot/PILOT_1_PLAN.md).

## Architecture and Technology

```text
Users
  |
  |-- Public Landing / Opportunity Catalog
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

### Why NEAR?

NEAR is the Alpha testnet environment for wallet-linked workflows, smart contract
experimentation, and future transparent workflow patterns. Under the v2 business model,
investor-facing blockchain features may be evaluated separately, but farmers remain entirely
within AgriPartners-managed fiat workflows. AgriPartners is evaluating NEAR for:

- investor and operator infrastructure where legally and operationally appropriate;
- testnet validation before production or Mainnet decisions;
- transparent references for lifecycle, audit, settlement, and reconciliation events;
- developer-friendly smart contract experimentation;
- clearer audit trails for real-world agricultural workflows.

Mainnet evaluation should follow stronger security, custody, reconciliation, treasury
enforcement, monitoring, and compliance preparation.

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

## Roadmap

The v2 business roadmap replaces the former Alpha/Beta/Pilot Expansion sequence:

| Phase | Name | Primary outcome |
| --- | --- | --- |
| 1 | Alpha | Validate product concepts, workflows, and documentation. |
| 2 | Company Registration | Establish AgriPartners OÜ and its legal, banking, accounting, governance, and contracting foundation. |
| 3 | Pilot 1.0 | Validate one complete, tightly controlled investment Project lifecycle with fiat-only Farmer flows. |
| 4 | Pilot 2.0 | Repeat and broaden the operating model using Pilot 1.0 evidence. |
| 5 | Production Ready | Complete production-grade operational, compliance, security, monitoring, and support readiness. |
| 6 | Investor Protection | Finalize and approve investor-protection mechanisms. |
| 7 | Marketplace | Launch controlled Marketplace access after all preceding gates are met. |

The existing Investor Protection documentation remains valid as exploratory work but is deferred
to the Marketplace program: design and readiness are handled in Phase 6, while activation can
occur only as part of an approved Phase 7 Marketplace.

## Screenshots

TODO: Refresh and embed current Alpha v1.2 screenshots before using screenshots as public
evidence. Existing screenshot assets may reflect earlier demo states and should be reviewed
before being promoted in the public README.

## Contributing

AgriPartners is currently founder-led and in Alpha. External feedback is welcome, especially
around:

- NEAR ecosystem fit;
- wallet UX;
- treasury and reconciliation design;
- farmer reporting workflows;
- investor presentation clarity;
- Beta and Mainnet-readiness expectations.

For discussion or collaboration, contact: `farhodmuhamadiev4@gmail.com`.

## License

No standalone `LICENSE` file is currently present in this repository. Add or confirm the project
license before treating the repository as open-source for reuse.
