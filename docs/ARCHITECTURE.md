# AgriPartners Architecture

Status: Accepted

Document owner: Engineering

Document type: Canonical high-level architecture

## Purpose

This document is the high-level architecture entry point for AgriPartners. It describes the
current Alpha system and the canonical product boundaries that future delivery must preserve.
Detailed implementation and product rules remain in the linked sources.

> **Legacy implementation boundary:** Farmer-wallet authentication, Farmer withdrawal, NEAR
> funding, and smart-contract payout behavior in the current code are **Legacy Testnet Alpha —
> historical technical demonstration, not the target production financial architecture**. They
> remain documented as implementation evidence until Stage 2 migration and must not be read as an
> approved production flow.

## Ecosystem Overview

AgriPartners combines a browser application, REST API, PostgreSQL database, and NEAR Testnet
integration:

```text
Users
  |
  v
Vite browser application
  |
  | HTTPS / JSON / bearer JWT
  v
Express API --------------------> PostgreSQL
  |
  | near-api-js
  v
NEAR Testnet
  ^
  |
Wallet-signed messages and selected transactions
```

The current Alpha is a hybrid system. PostgreSQL stores operational application data, while
NEAR Testnet supports wallet authentication, contract state, selected lifecycle actions, and
transaction references. Contracts, banking, accounting, compliance, and reconciliation records
remain outside the authority of this architecture summary.

The business boundary is defined by the
[Operating Model](business/OPERATING_MODEL.md) and
[Financial Operating Model](business/FINANCIAL_OPERATING_MODEL.md).

The target financial boundary is:

```text
External Investor
        |
        | approved fiat or approved crypto assets
        v
AgriPartners OÜ — Estonia
        |
        | approved crypto-to-fiat infrastructure
        | cryptocurrency stops here
        v
Cleared fiat in AgriPartners OÜ account
        |
        | fiat bank or payment transfer
        v
Uzbekistan Feedlot Operator
        |
        v
Farmer product role / suppliers / employees
        (fiat-only; no wallet or on-chain requirement)
```

## Frontend

The frontend is a Vite-built single-page browser application using JavaScript, HTML, and CSS.
It provides public discovery, authentication and onboarding, role dashboards, Project views,
reporting flows, administrative controls, Treasury visibility, and Presentation Mode.

The current implementation uses hash-based routing and communicates with the backend through
JSON REST requests. It also integrates with NEAR Wallet Selector and MyNearWallet for signed
authentication messages and selected contract transactions.

Live and demonstration experiences must remain visibly separate. The accepted decision is
recorded in [ADR-001: Live-first Architecture](architecture/ADR-001-live-first-architecture.md).

## Backend

The backend is a Node.js and Express REST API. Its responsibilities include:

- authentication and role-scoped authorization;
- profile, Project/deal, report, cycle, event, return, and administrative APIs;
- PostgreSQL migration and data access;
- NEAR view calls, signed calls, and contract deployment workflows;
- coordination between off-chain application records and on-chain references.

The backend currently retains centralized operational responsibilities, including administrative
signing and lifecycle coordination. This is an explicit Alpha trust boundary, not a claim of a
fully decentralized or production-ready system.

## Database

PostgreSQL is the current application data store. Ordered SQL migrations are the schema
authority.

The database stores application and operational data including:

- users and role/profile records;
- indexed Project/deal records;
- Farmer cycle updates and reports;
- application event history;
- return records and related financial presentation data.

Some participant and economic data also exists in NEAR contracts. Synchronization,
reconciliation, and conflict handling between duplicated records remain engineering concerns
for later releases.

## NEAR Integration

The current integration targets NEAR Testnet. It supports:

- wallet-signature authentication;
- contract account creation and deployment;
- contract initialization;
- status and balance reads;
- selected funding, lifecycle, reporting, and withdrawal calls;
- transaction references recorded in PostgreSQL.

These funding and withdrawal calls are Legacy Testnet Alpha behavior. Target production NEAR
audit and automation infrastructure is limited to the External Investor and Estonia side and may
record approved hashes, workflow states, transparency references, and audit events. It must not
initiate or require an Uzbekistan-facing crypto transaction.

NEAR records are supplementary to approved business, legal, banking, accounting, and
reconciliation evidence. Mainnet use, audited contracts, production custody, and production
Settlement are not part of Alpha v1.2.

## Authentication

The Alpha contains two authentication paths:

- legacy username/password authentication with role-bearing JWTs;
- wallet-signature authentication with wallet-linked JWTs.

The wallet flow uses a backend-issued challenge, a signed NEAR message, access-key verification,
and a time-limited JWT. Current Alpha limitations such as process-local challenges,
browser-accessible token storage, and Testnet-specific configuration must be resolved through
future security work before production consideration.

## Project Workspace

Project is the canonical product object, and the Project Workspace is the shared operational
context for authorized participants. Dashboards and portfolios summarize and route into a
Workspace; they do not become independent sources of Project truth.

The Workspace structure and role behavior are governed by:

- the [Product Operating Model](platform/PRODUCT_OPERATING_MODEL_V1.md);
- the [Canonical Project Workspace Specification](platform/CANONICAL_PROJECT_WORKSPACE_SPEC.md);
- the [Canonical Farmer Experience Specification](platform/CANONICAL_FARMER_EXPERIENCE_SPEC.md).

The current application still contains legacy `deal` terminology and multiple screen
compositions. Product convergence on the canonical Workspace is roadmap work, not a statement
that the target composition is already fully implemented.

## Investor View

The Investor view provides approved opportunity, Project, progress, reporting, and financial
information. It may show projected economics and recorded activity only with clear status and
authority labels.

The Investor interacts with AgriPartners, not directly with the Farmer. Investor-visible
information is constrained by role, approval, Project state, and the
[Information Disclosure Policy](business/INFORMATION_DISCLOSURE_POLICY.md).

## Farmer View

The Farmer view supports fiat funding confirmation, Production Cycle work, tasks, reports,
evidence, feedback, and Farmer-relevant Settlement obligations.

The Farmer experience is fiat-only and must not require or present cryptocurrency, wallets,
tokens, smart contracts, blockchain transactions, or Investor-only return metrics. Detailed
rules are defined in the
[Canonical Farmer Experience Specification](platform/CANONICAL_FARMER_EXPERIENCE_SPEC.md) and
[Farmer Daily Workflow Specification](platform/FARMER_DAILY_WORKFLOW_SPEC.md).

## Operator View

The AgriPartners Operator view supports Project preparation and control, participant
coordination, lifecycle transitions, funding and fiat-disbursement verification, report review,
disclosure control, exceptions, reconciliation, and Settlement coordination.

Operator authority in the product does not replace required legal authority, dual approvals,
banking controls, accounting review, or Pilot governance.

## Data Flow

A typical Project interaction follows this high-level path:

```text
Participant action
        |
        v
Role-aware frontend
        |
        v
Authenticated API request
        |
        +----> PostgreSQL application record
        |
        +----> NEAR view or transaction, when required
        |
        v
API response with status and references
        |
        v
Role-filtered Project Workspace
```

This diagram describes the current hybrid Alpha application. For the target architecture, any
NEAR branch is available only to an authorized External Investor or AgriPartners OÜ actor in the
Estonia layer. Uzbekistan Feedlot Operator and Farmer actions terminate in authoritative
application, agreement, bank/payment, accounting, and reconciliation records; they do not require
a NEAR transaction.

Not every Project event is on-chain. Profiles, reports, presentation events, and recorded
returns may be off-chain, while selected contract status, balances, and transactions are
on-chain. The interface must preserve the distinction between projected, recorded, approved,
paid, reconciled, and completed states.

Financial terminology remains subject to
[ADR-002: Financial Semantics](architecture/ADR-002-financial-semantics.md), which is currently
Proposed and must not be treated as an accepted decision until its status changes.

## Security and Project Expense API boundary

Authentication entry points are rate-limited and NEP-413 challenges are stored in PostgreSQL as
single-use, expiring records so multiple backend instances share replay state. Public 5xx
responses are redacted and carry a request ID; internal diagnostics remain server-side. The
backend applies security headers, an explicit CORS allowlist, and a bounded JSON body parser.

The admin-only Project Expense API supports category discovery, listing, request creation,
approval, rejection, cancellation, evidence attachment, and paid-state recording. Its
application policy is additional to the database's immutable-event, segregation-of-duties,
budget, fiat-only, and evidence constraints. It records financial workflow state but never
executes a bank or crypto payment and never substitutes for verified corporate authority.

Migrations acquire a PostgreSQL advisory lock to prevent concurrent application by parallel
instances. `/health/live` is process liveness; `/health` is deployment readiness and verifies the
database and migration registry.

## Architecture Decision Records

- [ADR-001: Live-first Architecture](architecture/ADR-001-live-first-architecture.md) —
  Accepted
- [ADR-002: Financial Semantics](architecture/ADR-002-financial-semantics.md) — Proposed

ADRs own their decisions. This overview links to them and does not restate their detailed
rationale or acceptance criteria.
