# AgriPartners Product Book

Status: Accepted

Document owner: Product

Document type: Canonical ecosystem entry point

## Purpose

This Product Book is the top-level navigation document for the AgriPartners ecosystem. It
explains the product direction, identifies the documents that own detailed decisions, and gives
Product, Business, Engineering, and Investor Relations a shared starting point.

This document does not replace the specifications, policies, plans, or release records linked
below. When a summary here conflicts with a more specific accepted or frozen document, the
specific document takes precedence within its declared scope.

## Vision

AgriPartners makes agricultural investment Projects understandable, reviewable, and
operationally accountable from opportunity assessment through reporting and Settlement.

The long-term product vision is a project-centric ecosystem in which approved participants can
follow one consistent Project identity, lifecycle, and evidence trail without confusing
technical infrastructure with legal or financial authority.

## Mission

AgriPartners builds disciplined workflows that:

- give Investors clear, approved Project information;
- give Farmers a practical, fiat-only operating experience;
- give AgriPartners Operators the controls needed to prepare, monitor, reconcile, and complete
  Projects;
- use digital infrastructure, including NEAR where appropriate, to improve transparency and
  auditability without replacing contracts, banking, accounting, or compliance.

## Product Principles

The canonical product principles are defined by the
[Product Operating Model](platform/PRODUCT_OPERATING_MODEL_V1.md). In summary:

- **Project first:** the Project and its lifecycle are the center of product decisions.
- **One Project, one Workspace:** participants enter the same Project context through
  role-appropriate views.
- **Role-based visibility:** access to information, actions, events, and documents depends on
  role, Project state, approval, and disclosure rules.
- **Farmer fiat-only:** Farmers do not need cryptocurrency, wallets, tokens, smart contracts,
  or blockchain knowledge.
- **Investor transparency:** Investors receive clear and approved information without
  projections being presented as settled outcomes.
- **Operator control:** AgriPartners controls lifecycle transitions, review, disclosure,
  exceptions, reconciliation, and Settlement.
- **Shared semantics:** dashboards and supporting views route into the Project Workspace rather
  than becoming separate sources of Project truth.

## Ecosystem Overview

The target business relationship is:

```text
External Investor
        |
        v
AgriPartners OÜ
        |
        v
Farmer
```

AgriPartners is the legal and operational counterparty between Investors and Farmers. Farmers
receive and return fiat only. NEAR is supporting technical infrastructure for approved
transparency, automation, and supplementary records; it is not the legal or financial source of
truth.

The [Business Architecture v1.0 Freeze](business/BUSINESS_ARCHITECTURE_V1_FREEZE.md),
[Operating Model](business/OPERATING_MODEL.md), and
[Financial Operating Model](business/FINANCIAL_OPERATING_MODEL.md) own the detailed ecosystem
boundaries.

## Project Workspace

Project is the primary product object. Each Project is an independently approved implementation
of an Investment Model, with its own participants, amount, lifecycle, reports, documents,
financial records, and Settlement.

The Project Workspace gives authorized participants one consistent Project context while
adapting information and actions to their roles. Dashboards, portfolios, task lists,
notifications, and catalogs are entry points into Workspaces; they do not replace them.

Detailed Workspace rules are owned by:

- the [Product Operating Model](platform/PRODUCT_OPERATING_MODEL_V1.md);
- the [Canonical Project Workspace Specification](platform/CANONICAL_PROJECT_WORKSPACE_SPEC.md);
- the [Canonical Farmer Experience Specification](platform/CANONICAL_FARMER_EXPERIENCE_SPEC.md);
- the [Farmer Daily Workflow Specification](platform/FARMER_DAILY_WORKFLOW_SPEC.md).

## User Roles

### Investor

The Investor reviews approved opportunities and Project information, follows approved progress,
and receives financial and Settlement information through AgriPartners.

### Farmer

The Farmer confirms fiat funding, performs agricultural work, follows Production Cycles,
submits reports and evidence, responds to AgriPartners, and completes Farmer-relevant
Settlement obligations.

### AgriPartners Operator

The Operator prepares Projects, coordinates participants, controls lifecycle transitions,
reviews reports and evidence, manages disclosures and exceptions, reconciles records, and
coordinates Settlement.

Role boundaries and disclosure rules are defined in the
[Product Operating Model](platform/PRODUCT_OPERATING_MODEL_V1.md) and
[Information Disclosure Policy](business/INFORMATION_DISCLOSURE_POLICY.md).

## Release Strategy

AgriPartners uses named software releases to deliver and validate the product incrementally.
The current delivery sequence is Alpha v1.2, Beta v1.0, Beta v1.1, Beta v1.2, and Release
Candidate.

Software release names do not replace the frozen business roadmap. Company registration,
Pilot 1.0, Pilot 2.0, Production Ready, Investor Protection, and Marketplace remain separate
business maturity phases with their own approval gates.

- The living software delivery plan is maintained in the [Roadmap](ROADMAP.md).
- Published release records are indexed in [Releases](RELEASES.md).
- Pilot approval and execution are governed by the
  [Pilot 1.0 Plan](platform/pilot/PILOT_1_PLAN.md),
  [Pilot Readiness Checklist](platform/pilot/PILOT_READINESS_CHECKLIST.md), and
  [Pilot Operations Guide](platform/pilot/PILOT_OPERATIONS_GUIDE.md).

No software release name by itself authorizes production, Mainnet, custody, investment,
Settlement, or real-funds activity.

## Canonical Documentation

### Entry Points

- [Product Book](PRODUCT_BOOK.md) — ecosystem navigation and product direction
- [Architecture](ARCHITECTURE.md) — high-level technical architecture
- [Roadmap](ROADMAP.md) — living software delivery roadmap
- [Releases](RELEASES.md) — release history index
- [Documentation Guide](DOCUMENTATION_GUIDE.md) — documentation governance

### Business and Financial Authority

- [Business Architecture v1.0 Freeze](business/BUSINESS_ARCHITECTURE_V1_FREEZE.md)
- [AgriPartners v2 Operating Model](business/OPERATING_MODEL.md)
- [Financial Operating Model](business/FINANCIAL_OPERATING_MODEL.md)
- [Information Disclosure Policy](business/INFORMATION_DISCLOSURE_POLICY.md)
- [Feedlot Master Investment Model](business/investment-models/FEEDLOT_MASTER_INVESTMENT_MODEL.md)
- [Hissar Sheep Master Investment Model](business/investment-models/HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md)
- [60/40 Financial Model Authority](60-40/README.md)

### Product and Pilot Authority

- [Product Operating Model](platform/PRODUCT_OPERATING_MODEL_V1.md)
- [Canonical Project Workspace Specification](platform/CANONICAL_PROJECT_WORKSPACE_SPEC.md)
- [Canonical Farmer Experience Specification](platform/CANONICAL_FARMER_EXPERIENCE_SPEC.md)
- [Farmer Daily Workflow Specification](platform/FARMER_DAILY_WORKFLOW_SPEC.md)
- [Pilot 1.0 Plan](platform/pilot/PILOT_1_PLAN.md)
- [Pilot Readiness Checklist](platform/pilot/PILOT_READINESS_CHECKLIST.md)
- [Pilot Operations Guide](platform/pilot/PILOT_OPERATIONS_GUIDE.md)

## Document Ownership Philosophy

Every canonical document has one accountable ownership domain:

- **Product** owns product direction, interaction models, user experience, and delivery
  priorities.
- **Business** owns operating relationships, financial boundaries, policies, Investment Models,
  and Pilot business rules.
- **Engineering** owns system architecture, technical decisions, implementation contracts, and
  release evidence.
- **Investor Relations** owns audience-specific investor communication derived from canonical
  Product and Business facts.

Ownership does not permit a document to redefine another domain's accepted or frozen decision.
Cross-domain changes must identify every affected authority and follow the status and lifecycle
rules in the [Documentation Guide](DOCUMENTATION_GUIDE.md).
