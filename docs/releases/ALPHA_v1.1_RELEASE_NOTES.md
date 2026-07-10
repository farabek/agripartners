# AgriPartners Alpha v1.1 Release Notes

Status: Released

Language: English

Owner: Product

## 1. Release Overview

| Field | Value |
| --- | --- |
| Release name | AgriPartners Alpha v1.1 |
| Version | Alpha v1.1 |
| Status | Released |
| Release objective | Deliver the first complete investor demonstration release for AgriPartners, combining portfolio visibility, pilot comparison, project workspaces, document review, farmer reporting context, operator workflows, Treasury and settlement visibility, and NEAR Testnet integration. |

Alpha v1.1 is an Alpha/Testnet demonstration release. It is not a production investment offering,
custody system, payout system, settlement system, Mainnet deployment, or live-funds operating
environment.

## 2. Executive Summary

Alpha v1.1 is the first complete investor demonstration release of AgriPartners. It presents a
coherent end-to-end story for a first-time investor: entering the Investor Demo, reviewing the
Portfolio Dashboard, comparing the two flagship pilot projects, opening either project workspace,
reviewing financials, reports, returns, documents, and settlement context, and understanding the
role of farmer and operator workflows behind the investor-facing experience.

The release is designed for guided stakeholder demonstrations, investor conversations, NEAR
ecosystem review, accelerator review, and controlled pilot-readiness discussions. It demonstrates
the intended product model while preserving clear Alpha boundaries: demo data is illustrative,
NEAR activity is Testnet-only, legal materials remain drafts, and no live investment or production
settlement is enabled.

## 3. Highlights

- Investor Portfolio Dashboard with capital, projected payout, profit, ROI, APR, project status,
  allocation, upcoming events, recent activity, and quick actions.
- Pilot Selection page allowing investors to compare and open the Fidlot Livestock Project and
  Hissar Sheep Breeding Project.
- Fidlot Workspace representing a completed demonstration workflow with financial dashboard,
  production history, published report state, returns, documents, history, and settlement context.
- Hissar Workspace representing an active demonstration workflow with current cycle context,
  next production update framing, documents, and active project status.
- Investor Document Center with Project Disclosure Sheet, Investment Participation Agreement,
  Risk Disclosure, Farmer Reports, and Settlement Records.
- Farmer Workspace for assigned project context, funding status, production cycle visibility, and
  farmer reporting workflows.
- Operator Workspace for project oversight, reporting context, lifecycle management, return
  recording, and administrative review flows.
- Treasury & Settlement visibility for Alpha-stage settlement context, return records, and
  non-production Treasury framing.
- NEAR Testnet integration supporting wallet-aware flows, testnet transaction context, and
  blockchain-backed demonstration infrastructure.
- Legal Package foundation aligning the product with the Investment Participation Agreement,
  Project Disclosure Sheet, Risk Disclosure, and Platform Contract Architecture.

## 4. Product Capabilities

### Investor

- Enter the Investor Demo from the landing experience.
- Review portfolio-level metrics and the two flagship demonstration pilots.
- Compare completed and active pilot workflows.
- Open project workspaces for Fidlot and Hissar.
- Review financial dashboard, investment summary, production cycle context, farmer reports,
  returns, project documents, history, and settlement context.
- Access Alpha-stage document cards and lifecycle badges for core investor documentation.

### Farmer

- Review assigned project context and current cycle status.
- See funding confirmation and production workflow context.
- Submit or review farmer report information in Alpha workflows.
- Understand that farmers operate through AgriPartners rather than contracting directly with
  individual investors.

### Operator

- Review pilot project state across investor, farmer, and settlement workflows.
- Manage project lifecycle context for demonstration deals.
- Review reports, returns, and status history.
- Maintain the platform operator role defined in the contract architecture.

### Administration

- Inspect platform records and demo deal state.
- Review lifecycle information, reporting context, return records, and Treasury/settlement
  framing.
- Support guided Alpha demonstrations and internal product review.
- Use automated tests and documented workflows to validate release behavior.

## 5. Technical Foundation

### Frontend

The frontend provides a role-based single-page Alpha experience covering public landing, investor
dashboard, pilot selection, investor project workspaces, farmer surfaces, operator/admin surfaces,
document center views, and demo-safe navigation. Alpha v1.1 prioritizes presentation clarity and
guided demonstration quality over production modularity.

### Backend

The backend supports authentication, role-aware routes, deal data, farmer reporting, investor
views, admin operations, return records, status history, and service-level logic used by the
Alpha workflows. Backend behavior remains separate from presentation-only demo polish.

### PostgreSQL

PostgreSQL is the application data foundation for users, profiles, deals, cycles, reports, returns,
status history, Treasury foundations, and related platform records. Alpha v1.1 does not represent
production accounting authority.

### NEAR Testnet

NEAR Testnet integration supports wallet-aware authentication, testnet contract context, and
demonstration transaction references. Testnet activity is used for product validation and ecosystem
review only.

### Smart Contracts

Smart contracts support the Alpha/Testnet demonstration model and are not presented as audited
production Mainnet infrastructure. Contract activity is execution evidence for Alpha workflows, not
standalone production accounting or settlement authority.

### Automated Testing

Automated tests cover backend services, routes, migrations, role navigation, investor portal
behavior, farmer workflows, admin behavior, public landing behavior, presentation mode, and
frontend static expectations. Tests are part of the release-readiness evidence for Alpha v1.1.

## 6. Documentation

Canonical documentation for Alpha v1.1 and related platform context includes:

- [Documentation Index](../README.md)
- [Release Index](../RELEASES.md)
- [Alpha v1.1 Release Review](alpha-v1.1-release-review.md)
- [Business Architecture v1.0 Freeze](../business/BUSINESS_ARCHITECTURE_V1_FREEZE.md)
- [AgriPartners v2 Operating Model](../business/OPERATING_MODEL.md)
- [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md)
- [Information Disclosure Policy](../business/INFORMATION_DISCLOSURE_POLICY.md)
- [Investor Portal](../investor-portal.md)
- [Farmer Portal](../farmer-portal.md)
- [Admin Dashboard](../admin-dashboard.md)
- [ADR-001 - Live-first Architecture](../architecture/ADR-001-live-first-architecture.md)
- [ADR-002 - Financial Semantics](../architecture/ADR-002-financial-semantics.md)

## 7. Legal Foundation

Alpha v1.1 includes a legal-package foundation for investor demonstration and product
architecture planning. The documents are not production legal contracts unless separately reviewed
and approved by qualified counsel.

- [Investment Participation Agreement](../legal/INVESTMENT_PARTICIPATION_AGREEMENT.md) describes
  the intended investor-facing agreement between the investor and AgriPartners Platform Operator.
- [Project Disclosure Sheet](../legal/PROJECT_DISCLOSURE_SHEET.md) provides the intended
  project-level disclosure template for investor review.
- [Risk Disclosure](../legal/RISK_DISCLOSURE.md) summarizes major agricultural, operational,
  financial, market, regulatory, technology, blockchain, and force majeure risks.
- [Platform Contract Architecture](../legal/PLATFORM_CONTRACT_ARCHITECTURE.md) defines the
  company-centered model: Investor -> AgriPartners Platform Operator -> Farmer / Pilot Farm.

## 8. Known Alpha Limitations

- Demo data is illustrative and should not be treated as live portfolio, farm, accounting, or
  settlement data.
- NEAR integration is Testnet-only; Mainnet readiness is not claimed.
- No live investments, capital acceptance, custody, payout, or production settlement are enabled.
- Legal documents are drafts and architecture materials, not production contracts.
- Production PDF delivery, document hosting, signed agreements, immutable evidence storage, and
  legal-package workflow automation are not implemented.
- Smart contracts are not presented as audited production infrastructure.
- Treasury and settlement views are Alpha context, not authoritative production accounting.
- KYC, AML, accreditation, investor suitability, bank rails, custody, fiat payout processing, and
  production compliance workflows are outside Alpha v1.1.
- Reconciliation validation against production evidence is not complete.
- The frontend remains optimized for Alpha demonstration speed rather than long-term modularity.

## 9. Next Release

The next release is Alpha v1.2.

High-level goals:

- Improve public presentation and external-review readiness.
- Strengthen demo/live separation and role-specific entry paths.
- Expand Treasury visibility and reconciliation presentation.
- Improve stakeholder-facing documentation for NEAR ecosystem, investors, accelerators, and
  technical reviewers.
- Continue clarifying Alpha/Testnet boundaries and production limitations.
- Prepare the product path toward Beta reviewability, trust, and controlled pilot readiness.

## 10. Metadata

| Field | Value |
| --- | --- |
| Version | Alpha v1.1 |
| Status | Released |
| Language | English |
| Owner | Product |
| Last Review | 2026-07-10 |
