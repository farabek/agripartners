# AgriPartners Master Roadmap v2

Status: Living

Owner: Product

Document type: Canonical strategic roadmap

Version: 2.0

Last reviewed: 2026-07-07

## Purpose

This document is the strategic roadmap for AgriPartners across product development, business
development, investor readiness, legal readiness, NEAR ecosystem work, and platform launch. It
consolidates direction from existing canonical documents without replacing their detailed authority.

Detailed delivery, architecture, release, business, legal, and documentation decisions remain owned
by their specific source documents.

## Part 1 - Executive Overview

### Vision

AgriPartners makes agricultural investment projects transparent, understandable, and operationally
accountable from opportunity review through funding, production reporting, settlement, and project
completion.

### Mission

AgriPartners builds a project-centric platform where investors receive approved project information,
farmers work through practical fiat-only operating flows, and AgriPartners operators control the
records, reviews, reconciliation, and settlement steps required for disciplined agricultural finance.

### Problem

Agricultural investment is often difficult to review, monitor, and reconcile. Investors lack trusted
visibility into real farm activity. Farmers need practical funding and reporting workflows that do
not force them into complex financial or blockchain tools. Operators need structured controls across
documents, money movement, reports, risks, and project completion.

### Solution

AgriPartners connects investors, pilot farms, operator workflows, treasury controls, and NEAR-based
transparency records through one project workspace. The product separates legal authority, business
records, operating evidence, and blockchain references so no layer pretends to be more authoritative
than it is.

### Platform Model

The target relationship model is:

```text
Investor
-> Investment Participation Agreement
-> AgriPartners Platform Operator
-> Farm Operating Agreement
-> Farmer / Pilot Farm
```

Investors participate through AgriPartners. Farmers contract with AgriPartners. There is no direct
investor-to-farmer contract unless a future approved legal model expressly changes that structure.

### Current Status

AgriPartners is in Alpha/Testnet demonstration status. Alpha v1.2 includes public discovery,
Investor, Farmer, and Operator/Admin experiences, NEAR Testnet wallet authentication, project
views, farmer reporting, treasury visibility, settlement demonstrations, and a mature documentation
foundation. It is not production, Mainnet, real-funds, custody, or legal onboarding ready.

## Part 2 - Platform Architecture

AgriPartners should be understood as five connected layers.

```text
Platform Experience
        |
        v
Investment Platform
        |
        v
Farmer Operations
        |
        v
Treasury & Settlement
        |
        v
NEAR Blockchain Layer
```

| Layer | Role | Current direction |
| --- | --- | --- |
| Platform Experience | Landing, discovery, role portals, dashboards, project workspace, document access, status visibility | Make the Project Workspace the shared role-aware context |
| Investment Platform | Investor opportunity review, investment terms, projected ROI, risk disclosure, reporting access, participation documents | Keep investor participation through AgriPartners |
| Farmer Operations | Fiat funding confirmation, production cycles, reports, evidence, duties, farmer settlement obligations | Keep farmer experience practical, fiat-only, and operational |
| Treasury & Settlement | Funding state, disbursement, return recording, reconciliation, settlement calculation, operator controls | Distinguish projected, recorded, reconciled, paid, and completed states |
| NEAR Blockchain Layer | Wallet authentication, Testnet transactions, selected lifecycle records, transparency references | Use NEAR as infrastructure, not legal, banking, or accounting authority |

The connection principle is simple: the product experience presents role-specific views; the
investment and farmer layers define the business relationship; treasury controls financial state;
NEAR records selected technical events where appropriate.

## Part 3 - Current Product Status

| Category | Status | Completed % | Major deliverables |
| --- | --- | ---: | --- |
| Landing | Alpha complete | 85% | Public landing, opportunity discovery, demo positioning, alpha boundaries |
| Investor Portal | Alpha complete, Beta refinement planned | 80% | Investor dashboard, active/completed projects, ROI visibility, project detail views |
| Farmer Portal | MVP complete, canonical workflow refinement planned | 70% | Farmer dashboard, project cards, cycle/reporting visibility, funding context |
| Operator Workspace | Alpha admin complete, deeper workflow planned | 65% | Admin/project monitoring, event history, report and return visibility |
| Treasury | Demonstration complete, engine planned | 60% | Treasury Dashboard, Treasury Shadow Accounting, non-authoritative visibility |
| Settlement | Demonstration complete, reconciliation planned | 55% | Return records, outstanding/returned states, withdrawal/testnet flow demonstrations |
| Marketplace | Discovery demo complete, business marketplace deferred | 45% | Opportunity catalog and featured pilot presentation; production marketplace not active |
| Authentication | Alpha complete, security hardening planned | 75% | Legacy JWT auth, NEAR wallet-signature authentication, wallet-linked sessions |
| Documentation | Strong foundation complete | 85% | Product, architecture, roadmap, release, business, pilot, legal planning documents |
| Legal | Architecture and audit complete, agreements planned | 40% | Platform Contract Architecture, Pilot Agreement Audit, future legal package defined |
| NEAR Integration | Testnet integrated | 70% | Wallet selector, contract deployment/status flows, selected testnet actions |
| Testing | Alpha evidence exists, release-grade expansion planned | 60% | Release notes, developer review evidence, product review checklist, planned CI/e2e expansion |

## Part 4 - Documentation Status

| Document | Path | Canonical | Role |
| --- | --- | --- | --- |
| PRODUCT_BOOK | `docs/PRODUCT_BOOK.md` | Yes | Top-level ecosystem navigation and product direction |
| ARCHITECTURE | `docs/ARCHITECTURE.md` | Yes | High-level current system architecture |
| ROADMAP | `docs/ROADMAP.md` | Yes | Living software delivery roadmap |
| RELEASES | `docs/RELEASES.md` | Yes | Release history index |
| DOCUMENTATION_GUIDE | `docs/DOCUMENTATION_GUIDE.md` | Procedural companion | Documentation creation, status, ownership, and lifecycle rules |
| DOCUMENTATION_AUTHORITY_MATRIX | `docs/DOCUMENTATION_AUTHORITY_MATRIX.md` | Yes | Highest documentation authority registry |
| PLATFORM_CONTRACT_ARCHITECTURE | `docs/legal/PLATFORM_CONTRACT_ARCHITECTURE.md` | Planning | Platform legal model and document package direction |
| PILOT_AGREEMENT_AUDIT | `docs/legal/PILOT_AGREEMENT_AUDIT.md` | Analysis | Audit of Fidlot and Hissar pilot materials against the platform model |
| INVESTMENT_PARTICIPATION_AGREEMENT_SPEC | `docs/legal/INVESTMENT_PARTICIPATION_AGREEMENT_SPEC.md` | Planning | Product/document architecture for the future investor agreement |
| INVESTMENT_PARTICIPATION_AGREEMENT | `docs/legal/INVESTMENT_PARTICIPATION_AGREEMENT.md` | Draft | Architecture draft of the investor-facing agreement |

This Master Roadmap is strategic. If a detailed implementation, release, business, financial,
architecture, or legal point conflicts with a more specific accepted or frozen authority, the
specific authority controls within its scope.

## Part 5 - Legal Readiness

### Completed

| Item | Status | Result |
| --- | --- | --- |
| Platform Contract Architecture | Complete as planning document | Defines Investor -> AgriPartners and AgriPartners -> Farmer separation |
| Pilot Agreement Audit | Complete as analysis document | Finds strong business compatibility but incomplete legal-agreement readiness |
| Investment Participation Agreement Specification | Complete as planning document | Defines the document architecture for the future investor agreement |
| Investment Participation Agreement Draft v1 | Complete as architecture draft | Provides a non-production product/legal draft for investor readiness |

### Planned

| Item | Purpose |
| --- | --- |
| Operating Agreements v2 | Farmer-facing legal agreements for Fidlot and Hissar pilot farms |
| Risk Disclosure | Investor risk package for agricultural, operational, market, platform, and settlement risks |
| Project Disclosure Sheet | Project-specific summary of parties, economics, risks, reports, and status |
| Terms of Use | General platform access and use terms |
| Privacy Policy | Data collection, use, storage, and handling policy |
| Capital Flow Guide | Investor, farmer, operator, treasury, and settlement flow explanation |

Legal readiness remains incomplete until final documents are reviewed by qualified legal counsel and
aligned with company registration, banking, compliance, tax, and operational controls.

## Part 6 - Alpha Roadmap

| Alpha milestone | Status | Notes |
| --- | --- | --- |
| Wallet Authentication | Complete | NEAR Testnet wallet-signature flow exists |
| Investor Dashboard | Complete | Active/completed project views and metrics are demonstrated |
| Farmer Portal MVP | Complete | Farmer-facing project and reporting views exist |
| Operator Workspace | Complete | Admin/operator monitoring and project status views exist |
| Treasury Demo | Complete | Treasury visibility exists as non-authoritative Alpha functionality |
| Settlement Demo | Complete | Return and withdrawal demonstrations exist in Alpha/Testnet context |
| Documentation Foundation | Complete | Canonical product, architecture, release, business, pilot, and governance docs exist |
| Legal Architecture | Complete for planning | Contract architecture and pilot audit are documented |

Overall Alpha completion estimate: **82%**.

Alpha is strong as a demonstration and planning foundation. Remaining Alpha work is mostly review,
evidence cleanup, terminology convergence, security hardening, and ensuring that no demo surface
implies production, Mainnet, custody, or real-funds readiness.

## Part 7 - Beta Roadmap

| Backlog category | Goal | Key outcomes |
| --- | --- | --- |
| Investor Analytics | Improve investor understanding of project performance | Clear projected vs realized states, portfolio metrics, risk labels |
| Portfolio Dashboard | Make investor holdings easier to scan | Portfolio health, project grouping, route into Project Workspace |
| Capital Flow | Explain funding and settlement paths | Investor -> AgriPartners -> Farmer and Farmer -> AgriPartners -> Investor settlement visibility |
| Legal Package | Prepare onboarding document set | Investment Participation Agreement, Operating Agreements v2, disclosures, terms |
| Project Lifecycle | Standardize project states | Project creation, funding, farmer confirmation, cycles, reports, settlement, completion |
| Notifications | Surface timely work and exceptions | Investor updates, farmer duties, operator review alerts |
| Document Center | Organize agreements and disclosures | Role-based document checklist, status, access, and version references |
| Treasury Engine | Move beyond demo treasury visibility | Typed states, approval controls, ledger/reconciliation design |
| Settlement Engine | Make settlement reviewable | Calculation, reconciliation, exception, payout, and evidence workflow |
| Admin Workflow | Strengthen operator controls | Queues, filters, approvals, exception handling, audit-ready history |

## Part 8 - Production Roadmap

Production milestones are high-level only and require separate business, legal, compliance,
security, engineering, and operational approval.

| Milestone | Outcome |
| --- | --- |
| Mainnet | Move approved blockchain components from Testnet to Mainnet after audit and readiness review |
| Real Investor Onboarding | Enable legally reviewed investor participation with approved disclosures and controls |
| KYC/AML | Implement identity, eligibility, source-of-funds, screening, and monitoring process |
| Payments | Establish compliant fiat and approved crypto-to-fiat payment infrastructure |
| Custody | Define whether and how custody, safeguarding, escrow, or payment partner models apply |
| Insurance | Assess agricultural, operational, platform, and investor-protection coverage options |
| Regulatory Compliance | Complete jurisdictional review for investment, platform, data, and payments obligations |
| Mobile Experience | Optimize investor, farmer, and operator workflows for field and mobile use |
| API | Provide stable partner, reporting, and operational APIs where approved |
| Partner Portal | Support farms, advisors, auditors, service providers, and ecosystem partners |

## Part 9 - Three Strategic Workstreams

### Track 1 - Investor Relations

Objectives:

- Make AgriPartners credible, clear, and investor-ready.
- Convert Alpha evidence into a structured investor narrative.
- Prepare risk-aware materials for pilot and fundraising conversations.

Milestones:

- Investor data room and document index.
- Project Disclosure Sheet template.
- Investor Participation Agreement draft route to legal counsel.
- Updated pitch materials aligned with the platform operator model.
- Investor FAQ covering risk, settlement, NEAR, and farmer relationship boundaries.

Success criteria:

- Investor materials match canonical product, business, legal, and release facts.
- No investor material implies guaranteed returns or direct farmer contracts.
- A qualified investor can understand the model, risks, evidence, and next diligence steps.

### Track 2 - NEAR Ecosystem & Partnerships

Objectives:

- Position NEAR as transparency and workflow infrastructure for agricultural finance.
- Build ecosystem relationships without overstating Mainnet or production readiness.
- Prepare a partnership path for grants, pilots, technical review, and credibility.

Milestones:

- NEAR evidence packet refreshed from Alpha v1.2.
- Testnet transaction and contract evidence organized.
- Partnership outreach sequence and target list maintained.
- Mainnet readiness checklist drafted.
- Smart contract audit and security review requirements defined.

Success criteria:

- NEAR narrative is infrastructure-first and legally accurate.
- Technical evidence is reproducible and separated from business/legal claims.
- Ecosystem partners can see a credible path from Alpha to controlled pilot to Mainnet.

### Track 3 - Farmer Workflow & Product Development

Objectives:

- Make the farmer experience simple, mobile-friendly, operational, and fiat-only.
- Turn pilot economics into practical production duties, reporting, and evidence workflows.
- Give operators the controls required to support real farm execution.

Milestones:

- Farmer Workspace aligned with the canonical Farmer Experience Specification.
- Production Duties and Reporting Duties mapped into product states.
- Farm Operating Agreement document status integrated into the product.
- Operator review queues for reports, exceptions, and settlement.
- Mobile reporting and evidence upload workflow designed.

Success criteria:

- Farmers can understand funding, current cycle, due reports, and next action quickly.
- Farmer screens do not expose investor-only ROI, crypto, wallets, or smart-contract complexity.
- Operators can verify reports, resolve exceptions, and maintain audit-ready records.

## Part 10 - Product Maturity Assessment

| Area | Readiness | Explanation |
| --- | ---: | --- |
| Technology | 70% | Alpha stack works with frontend, backend, PostgreSQL, and NEAR Testnet; production security and reliability remain pending |
| Documentation | 85% | Strong canonical foundation exists; new strategic, legal, and launch documents still need authority integration |
| Legal | 40% | Legal architecture and audit exist, but final agreements, disclosures, and counsel review are pending |
| Investor Presentation | 75% | Strong demo and narrative materials exist; must be aligned with legal package and risk disclosures |
| Farmer Operations | 65% | Farmer MVP and operating models exist; detailed duties, reporting, evidence, and mobile workflow need refinement |
| Operator Workflow | 65% | Admin visibility exists; queues, approvals, exceptions, reconciliation, and document checklist need Beta work |
| Blockchain Integration | 70% | NEAR Testnet integration exists; Mainnet, audits, custody boundaries, and production controls remain pending |
| Overall Platform | 68% | AgriPartners is a strong Alpha platform with clear strategic architecture and significant Beta/legal readiness work ahead |

## Part 11 - Immediate Next Priorities

| Sprint name | Goal | Estimated impact | Dependencies |
| --- | --- | --- | --- |
| Legal Package Sprint 1 | Draft the Investment Participation Agreement outline and clause map | High | Platform Contract Architecture, Pilot Agreement Audit, legal counsel path |
| Document Center Sprint | Define role-based document checklist and status model | High | Legal package inventory, Project Workspace rules |
| Capital Flow Sprint | Create product and documentation views for investor, operator, farmer, and settlement flows | High | Financial Operating Model, Treasury design, legal architecture |
| Farmer Reporting Sprint | Convert farmer duties into reporting cadence, evidence requirements, and UX states | High | Farmer Experience Specification, Operating Agreements v2 direction |
| Operator Controls Sprint | Design agreement status, report review, exception handling, and settlement approval queues | High | Product Operating Model, Treasury/Settlement design, legal package status |

## Part 12 - Vision 2027

AgriPartners should evolve in four stages:

```text
Alpha Prototype
-> Beta Platform
-> Production Marketplace
-> Regional Agricultural Investment Infrastructure
```

### Alpha Prototype

Alpha proves that the core idea can be demonstrated: investors can review projects, farmers can
report progress, operators can monitor activity, and NEAR can support transparent technical records.
The emphasis is learning, evidence, and architecture clarity.

### Beta Platform

Beta turns the demonstration into a coherent project-centric platform. The product converges around
role-aware Project Workspaces, legal document status, capital flow visibility, farmer reporting,
operator controls, treasury states, and settlement review.

### Production Marketplace

Production introduces controlled real onboarding only after legal, compliance, payments, custody,
security, accounting, and operational controls are approved. Marketplace access remains a business
phase, not merely a UI feature.

### Regional Agricultural Investment Infrastructure

By 2027, AgriPartners can become regional agricultural investment infrastructure: a platform where
farms, investors, operators, service providers, auditors, and ecosystem partners coordinate through
trusted project records, approved disclosures, controlled money movement, and transparent lifecycle
evidence.

## Roadmap Governance

- This roadmap owns strategic sequencing across domains.
- Software delivery detail remains in `docs/ROADMAP.md`.
- Release history remains in `docs/RELEASES.md`.
- Architecture detail remains in `docs/ARCHITECTURE.md` and accepted ADRs.
- Business and financial authority remains in the frozen Business documents.
- Legal documents remain planning or analysis until reviewed and approved by qualified counsel.
- No roadmap milestone authorizes real funds, Mainnet, custody, investor onboarding, farmer
  onboarding, or production launch without separate documented approval.
