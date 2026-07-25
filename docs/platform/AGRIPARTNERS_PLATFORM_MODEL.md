<!-- markdownlint-configure-file { "MD013": false } -->

# AgriPartners Platform Model

Status: Canonical

Owner: AgriPartners Product

Last updated: 2026-07-25

Relevant migrations: [016](../../backend/src/db/migrations/016_fiat_operator_financial_foundation.sql) and [017](../../backend/src/db/migrations/017_project_expense_accounting_foundation.sql)

Verified main commit: `a9158b1b904e08e70a4f16ffa7d1e91420d790ba`

Related pull request: PR #1, verified in the repository merge history at the commit above

Update rule: any pull request that changes financial, contractual, participant, authority, or
platform architecture must update this document in the same pull request.

This document is the canonical entry point for the current AgriPartners platform model. Part I is
a concise overview. Part II provides the evidence-backed technical and operating reference.

## Part I — Platform Overview

## 1. Executive Overview

AgriPartners is an Alpha-stage working prototype for transparent agricultural investment
workflows. It connects investors, AgriPartners, Uzbekistan-based agricultural operations, and
role-specific product experiences around separately approved agricultural Projects. The current
application demonstrates opportunity review, reporting, lifecycle visibility, and financial
workflow foundations; it is not a live investment, custody, banking, or production settlement
system. See the [current release boundary](../releases/alpha-v1.2-release-notes.md) and
[architecture](../ARCHITECTURE.md).

NEAR Testnet supports wallet-linked Alpha workflows, smart-contract experimentation, selected
event references, and transparency demonstrations. It does not prove that fiat cleared, a
contract was executed, or a production settlement occurred. The target operating model keeps
cryptocurrency at AgriPartners OÜ in Estonia and keeps every Uzbekistan-facing financial and
product workflow fiat-only. See the [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md).

The repository implements a browser frontend, an Express backend, PostgreSQL migrations through
017, and NEAR Testnet integration. Stage 2 Slice 1 and Slice 2 add database foundations for the
fiat operator financial workflow and Project Expense accounting. They do not yet add the Project
Expense backend API, its authorization layer, or an operator expense interface.

Live capital intake, production custody, crypto-to-fiat execution, bank integration, KYC/KYB,
fiat disbursement execution, and investor settlement execution remain outside the completed
product scope.

## 2. Platform Participants

### Investor

- **Business role:** reviews a Project, disclosures, projected economics, progress, and settlement information.
- **Legal role:** contracts with AgriPartners OÜ, not directly with a Farmer or Pilot Farm.
- **Technical representation:** Alpha users, profiles, wallet-linked authentication, portfolio views, and legacy Deal records.
- **Current capability:** Alpha investor experience and NEAR Testnet demonstration.
- **Planned boundary:** production onboarding, KYC/KYB, live capital intake, custody, and settlement.

Evidence: [Operating Model](../business/OPERATING_MODEL.md),
[investor routes](../../backend/src/routes/investor.js), and
[wallet authentication](../../backend/src/routes/walletAuth.js).

### AgriPartners OÜ

- **Business role:** central platform company coordinating Projects, approvals, records, reporting, reconciliation, and communication.
- **Legal role:** documented target counterparty for the Investor and Uzbekistan Operator or relevant Farm/Farmer agreement.
- **Technical representation:** no dedicated verified legal-entity registry; its Estonia crypto boundary is constrained in Migration 016.
- **Current capability:** represented in the approved operating model and financial schema foundation.
- **Planned boundary:** company, banking, compliance, signing, custody, and production treasury arrangements.

Evidence: [Operating Model](../business/OPERATING_MODEL.md) and
[Migration 016](../../backend/src/db/migrations/016_fiat_operator_financial_foundation.sql).

### Uzbekistan Operator

- **Business role:** receives Project funding in fiat, pays approved local expenses, coordinates operations, and returns proceeds in fiat.
- **Legal role:** separate legal and operational fiat recipient under a written agreement with AgriPartners OÜ.
- **Technical representation:** operator, assignment, financial workflow, fiat-transfer, and Project Expense records.
- **Current capability:** database representation and constraints; no completed expense API or UI.
- **Planned boundary:** verified entity onboarding, contract execution, bank integration, and payment execution.

Evidence: [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md) and Migrations
[016](../../backend/src/db/migrations/016_fiat_operator_financial_foundation.sql) and
[017](../../backend/src/db/migrations/017_project_expense_accounting_foundation.sql).

### Pilot Farm

- **Business role:** agricultural operating organization or site associated with a Project.
- **Legal role:** must be a named party to an approved operating agreement before live operation.
- **Technical representation:** Farmer, Operator, and Deal/Project records rather than a dedicated legal-entity registry.
- **Current capability:** pilot and demonstration context is documented.
- **Planned boundary:** verified legal identity, authority, and executed agreement records.

Evidence: [Platform Contract Architecture](../legal/PLATFORM_CONTRACT_ARCHITECTURE.md) and
[Pilot Agreement Audit](../legal/PILOT_AGREEMENT_AUDIT.md).

### Farmer

- **Business role:** operational work, reporting, evidence, and confirmations.
- **Legal role:** may represent a named farm-side participant; the product role alone does not prove legal identity.
- **Technical representation:** role/profile and Farmer-facing Alpha routes and views.
- **Current capability:** Alpha reporting, cycle, funding-confirmation, and legacy Testnet workflows.
- **Planned boundary:** target experience is fiat-only and must not require a wallet, crypto, token, smart contract, or on-chain action.

Evidence: [Operating Model](../business/OPERATING_MODEL.md),
[Farmer routes](../../backend/src/routes/farmer.js), and
[Canonical Farmer Experience](CANONICAL_FARMER_EXPERIENCE_SPEC.md).

### Administrator / Authorized Operator User

- **Business role:** prepares and monitors Projects, reviews evidence, and performs approved administrative actions.
- **Legal role:** product authorization does not establish corporate signing, payment, or contractual authority.
- **Technical representation:** admin/JWT roles plus textual actor and authority values.
- **Current capability:** Alpha administrative routes and database actor-separation constraints.
- **Planned boundary:** stronger identity, authority, segregation-of-duties, and legal mandate controls.

Evidence: [admin routes](../../backend/src/routes/admin.js),
[admin authorization](../../backend/src/middleware/adminAuth.js), and Migrations
[016](../../backend/src/db/migrations/016_fiat_operator_financial_foundation.sql) and
[017](../../backend/src/db/migrations/017_project_expense_accounting_foundation.sql).

### Project / Deal

A **Project** is one separately approved implementation of a reusable investment model. `Deal` is
the principal legacy implementation term in the database and API. Target product language uses
Project while Stage 2 records link to the existing `deals` identity.

A Project/Deal is a business and technical object. It is not a legal person, is not itself a
contract, and does not prove agreement execution. Multiple investor, Operator, Farmer,
disclosure, and service-provider agreements may relate to one Project.

Evidence: [Operating Model](../business/OPERATING_MODEL.md),
[Architecture](../ARCHITECTURE.md), and
[Migration 016](../../backend/src/db/migrations/016_fiat_operator_financial_foundation.sql).

## 3. Legal and Contractual Model

```text
Investor
  ↔ Investment Participation Agreement
  ↔ AgriPartners OÜ

AgriPartners OÜ
  ↔ separate written operator agreement
  ↔ Uzbekistan Operator

AgriPartners OÜ / relevant approved operating entity
  ↔ Farm Operating Agreement
  ↔ Pilot Farm / Farmer
```

The Investor participates through AgriPartners, not through a direct agreement with a Farmer.
The Uzbekistan Operator is the legal and operational fiat recipient. Farmer is a non-crypto
product and operating role and is not identical to the Operator.

The repository contains agreement drafts/specifications, risk and disclosure documents, model
materials, and an intended contract architecture. It does not contain a dedicated contract
registry proving execution status for all Project agreements. The Pilot Agreement Audit concludes
that Feedlot and Hissar materials are business-model inputs rather than complete production-ready
legal agreements: named parties, signatures, governing law, notices, authority, default, and
dispute provisions require legal work.

Agreement files and database records may refer to the same Project or participants, but they are
different objects with different authority. Unknown legal entities remain **TBD**. No repository
document authorizes live fund handling without company, legal, banking, compliance, and
operational approval.

Evidence: [Platform Contract Architecture](../legal/PLATFORM_CONTRACT_ARCHITECTURE.md),
[Pilot Agreement Audit](../legal/PILOT_AGREEMENT_AUDIT.md), and
[Investment Participation Agreement](../legal/INVESTMENT_PARTICIPATION_AGREEMENT.md).

## 4. Crypto and Fiat Operating Boundary

```text
Investor
  → AgriPartners OÜ
  → conversion / fiat clearing
  → Uzbekistan Operator
  → approved Project expenses
  → Project proceeds
  → reconciliation
  → Investor settlement
```

| Step | Current classification |
| --- | --- |
| Investor → AgriPartners OÜ | Modeled; legacy wallet/Testnet interaction is implemented for demonstration; production intake is not implemented |
| Conversion / fiat clearing | Modeled in Migration 016; no live provider, custody, conversion, or bank execution |
| Fiat → Uzbekistan Operator | Modeled and database-constrained; production bank/payment execution is outside the product |
| Approved Project expenses | Implemented + Verified as a database foundation; API, UI, and payment execution are planned |
| Project proceeds | Modeled in the financial workflow; production receipt is outside the product |
| Reconciliation | Modeled in Migration 016; production bank/accounting reconciliation is not implemented end to end |
| Investor settlement | Modeled; legacy Testnet actions are historical Alpha evidence, not production settlement |

Only AgriPartners OÜ may receive approved crypto assets. Cryptocurrency stops in Estonia.
AgriPartners OÜ must confirm cleared fiat before financing Uzbekistan activity. The Operator,
Farmer, suppliers, employees, and other local participants receive and return fiat only. NEAR
records are supplementary and never replace agreements, bank statements, accounting records, or
evidence that fiat cleared.

Evidence: [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md),
[Migration 016](../../backend/src/db/migrations/016_fiat_operator_financial_foundation.sql), and
[NEAR Testnet status](../near-testnet.md).

## 5. Technical Architecture

```text
Browser users
  → Vite JavaScript frontend
  → Express JSON API
  → PostgreSQL

Wallet-signed messages / selected legacy actions
  → near-api-js
  → NEAR Testnet
```

- The [frontend](../../frontend/) is a Vite-built JavaScript, HTML, and CSS application with public, Investor, Farmer, admin, and presentation experiences.
- The [backend](../../backend/src/) is a Node.js/Express API with authentication, profiles, Deals, reporting, returns, treasury visibility, administration, and NEAR services.
- [PostgreSQL migrations](../../backend/src/db/migrations/) are the schema authority. Migrations 016 and 017 add the Stage 2 financial foundations.
- [NEAR Testnet](../near-testnet.md) supports wallet authentication, contract experiments, selected lifecycle actions, and references. Mainnet, audited contracts, custody, and production settlement are not part of Alpha.
- Authentication includes username/password JWT and wallet-signature JWT paths. It is not completed production identity, KYC/KYB, or legal authority.

## 6. Current Platform Status

The current state is an Alpha / working prototype on NEAR Testnet. Investor, Farmer, admin,
wallet-authentication, reporting, Deal, return, and demonstration experiences exist. Stage 2
Slice 1 and Slice 2 are merged at PR #1 and provide tested database foundations for fiat
workflows, budgets, Project Expenses, immutable events, evidence, reservations, and concurrency.

The Project Expense API and authorization service, operator expense dashboard, contract registry,
legal-entity registry, production KYC/KYB, bank integration, custody, and live settlement are not
implemented.

## 7. Current Limitations

- Legacy Farmer-wallet, NEAR-funding, withdrawal, and smart-contract payout demonstrations are not the target financial architecture.
- Actor, authority, and evidence identifiers remain textual/declarative.
- Database constraints do not establish legal identity, contract execution, or production authority.
- There is no dedicated contract or legal-entity registry.
- No production banking, conversion, custody, payment, KYC/KYB, or settlement execution exists.
- Project Expense accounting is a verified database foundation without its future API and UI.

## 8. Where to Read Next

- [Architecture](../ARCHITECTURE.md)
- [Operating Model](../business/OPERATING_MODEL.md)
- [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md)
- [Platform Contract Architecture](../legal/PLATFORM_CONTRACT_ARCHITECTURE.md)
- [Feedlot Master Investment Model](../business/investment-models/FEEDLOT_MASTER_INVESTMENT_MODEL.md)
- [Hissar Sheep Master Investment Model](../business/investment-models/HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md)
- [Documentation Index](../DOCUMENTATION_INDEX.md)

## Part II — Detailed Reference

## 9. Financial Workflow Model

```text
Project / Deal
  → Financial Workflow
  → Workflow Budget
  → Project Expense
  → Expense Lifecycle Events
  → Expense Evidence
  → Financial State Events / reconciliation
```

### Migration 016 — Financial Workflow Foundation

[Migration 016](../../backend/src/db/migrations/016_fiat_operator_financial_foundation.sql)
introduces the Uzbekistan Operator, Operator/Farmer/Deal assignment, one financial workflow per
Deal, Estonia-only crypto conversion records, fiat-only Operator transfers, financial evidence,
and immutable financial state events. It enforces ownership, idempotency, allowed transitions,
instruction/authorization separation, event-backed projections, and immutable event history.

The modeled states distinguish Investor funding, conversion, fiat clearing, Operator
disbursement, confirmation, Project expense recording, proceeds, reconciliation, and Investor
settlement. Actor and authority labels are not a verified identity or contract registry.

### Migration 017 — Project Expense Accounting Foundation

[Migration 017](../../backend/src/db/migrations/017_project_expense_accounting_foundation.sql)
adds expense categories, financial workflow budgets, Project Expenses, expense state events, and
expense evidence.

It provides:

- categories for livestock purchase, feed, veterinary, labor, transport, utilities, facility operations, and other approved expenses;
- positive fiat budgets per workflow, category, and currency;
- Expense ownership bound to the same workflow, Deal, Operator, budget, category, and currency;
- states `REQUESTED`, `APPROVED`, `REJECTED`, `CANCELLED`, and `PAID`;
- immutable event-backed state projection and requester/approver/payer separation;
- one authoritative fiat payment evidence record for a paid expense;
- full-payment semantics with no partial-payment model;
- reservations derived from approved and paid Expenses;
- budget locking, capacity checks, and concurrency protection;
- prospective linkage to `PROJECT_EXPENSE_RECORDED`;
- grandfathering of historical workflow events with null expense linkage.

Reservations are derived, not independently editable. Budget reductions cannot move below
current reservations. Runtime tests cover concurrent approvals, competing transitions, budget
reductions, lock ordering, repeat-run behavior, rollback, and immutable history.

Evidence: [migration tests](../../backend/tests/projectExpenseAccountingMigration.test.js) and
[runtime tests](../../backend/tests/projectExpenseAccountingRuntime.test.js).

### How 016 and 017 work together

Migration 016 establishes the financial workflow and its authoritative state history. Migration
017 attaches fiat budgets and Expenses and allows `PROJECT_EXPENSE_RECORDED` only when it
references one paid Expense from the same workflow. It does not rewrite historical events.

These are database guarantees. No Project Expense API, application authorization service, or
operator expense UI exists yet.

## 10. Role → Contract → Technical Data Mapping

| Role/Object | Legal relationship | Technical representation | Current status | Important limitation |
| --- | --- | --- | --- | --- |
| Investor | Investor ↔ AgriPartners OÜ | User/profile, wallet auth, Investor portal, Deal records | Partially Implemented + Verified for Alpha | No production intake, KYC/KYB, custody, or settlement |
| AgriPartners OÜ | Counterparty to Investor and Operator/Farm side | Estonia boundary constraints and textual entity value | Partially Implemented | No legal-entity registry or production setup |
| Uzbekistan Operator | Separate written agreement with AgriPartners OÜ | Operator, assignment, workflow, transfer, and Expense records | Implemented + Verified at database layer | No Expense API/UI or banking execution |
| Pilot Farm | Operating agreement with approved AgriPartners entity | No dedicated legal-entity record | Partially Implemented | Named entity and execution status remain TBD |
| Farmer | Farm-side agreement as applicable | User role/profile, routes, reports | Implemented + Verified for Alpha | Product role is not identical to Operator |
| Project / Deal | May relate to multiple agreements | `deals` and Project-oriented product model | Implemented + Verified for Alpha | Not a legal person or contract |
| Financial Workflow | Supports governing agreements | `financial_workflows` and events | Implemented + Verified at database layer | No production orchestration |
| Workflow Budget | Follows Project budget authority | `financial_workflow_budgets` | Implemented + Verified at database layer | Authority remains declarative |
| Project Expense | Requires operational authority/evidence | `project_expenses` | Implemented + Verified at database layer | No API or UI |
| Evidence | Supports payment/accounting record | `project_expense_evidence` | Implemented + Verified at database layer | Reference is not the underlying document |
| Contract document | Governs relationship when validly executed | Files/templates; no registry | Partially Implemented / Planned | Repository presence does not prove execution |

Evidence for technical rows: Migrations
[016](../../backend/src/db/migrations/016_fiat_operator_financial_foundation.sql) and
[017](../../backend/src/db/migrations/017_project_expense_accounting_foundation.sql), plus
[runtime tests](../../backend/tests/projectExpenseAccountingRuntime.test.js).

## 11. Flagship Pilot Models

### A. Feedlot / Fidlot livestock model

The Feedlot model covers livestock fattening, including acquisition, feeding, husbandry, health
monitoring, sale, reporting, and settlement. Repository economic materials use a **USD 50,000
model amount**, **seven five-month cycles**, approximately **64.0% projected total ROI**, and
approximately **21.9% simple annualized projected ROI**.

These are projections, not guaranteed returns, deployed capital, or audited performance. Expenses
can map to livestock purchase, feed, veterinary, labor, transport, utilities, facility
operations, and other approved categories. The Alpha completed state is demonstration data, not
proof of production settlement. The master model is a reusable business model, not a contract;
the Farmer material is not a complete production legal agreement.

Evidence: [60/40 model summary](../60-40/README.md),
[Feedlot Master Model](../business/investment-models/FEEDLOT_MASTER_INVESTMENT_MODEL.md), and
[Pilot Agreement Audit](../legal/PILOT_AGREEMENT_AUDIT.md).

### B. Hissar sheep breeding model

The Hissar model covers breeding, husbandry, feeding, health, offspring management, sale,
reporting, and settlement. Repository materials use a **USD 50,000 model amount**, **six
six-month cycles**, approximately **63.3% projected total ROI**, and approximately **21.1% simple
annualized projected ROI**.

These are projections, not guaranteed returns. The Alpha active state and outstanding projected
returns are demonstration data, not deployed capital or production performance. The master model
and Farmer guide are not complete executed platform agreements.

Evidence: [60/40 model summary](../60-40/README.md),
[Hissar Master Model](../business/investment-models/HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md), and
[Pilot Agreement Audit](../legal/PILOT_AGREEMENT_AUDIT.md).

## 12. Implementation Status Matrix

| Capability | Status | Evidence / limitation |
| --- | --- | --- |
| Wallet authentication | Implemented + Verified | [service test](../../backend/tests/walletAuthService.test.js); Testnet-oriented Alpha |
| Investor portal | Implemented + Verified | [routes](../../backend/src/routes/investor.js), [tests](../../backend/tests/investor.routes.test.js); no live settlement |
| Farmer portal and reporting | Implemented + Verified | [Farmer routes](../../backend/src/routes/farmer.js); includes legacy Testnet behavior |
| NEAR Testnet workflow demonstration | Implemented + Verified | [NEAR tests](../../backend/tests/nearService.test.js); Testnet only |
| Fiat-only boundary documentation | Implemented | [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md); target model |
| Financial workflows | Implemented + Verified | [Migration 016](../../backend/src/db/migrations/016_fiat_operator_financial_foundation.sql); database layer |
| Workflow budgets | Implemented + Verified | [Migration 017 tests](../../backend/tests/projectExpenseAccountingMigration.test.js); database layer |
| Project Expenses | Implemented + Verified | [runtime tests](../../backend/tests/projectExpenseAccountingRuntime.test.js); database layer |
| Immutable lifecycle and evidence | Implemented + Verified | [Migration 017](../../backend/src/db/migrations/017_project_expense_accounting_foundation.sql) |
| Derived reservations | Implemented + Verified | [runtime tests](../../backend/tests/projectExpenseAccountingRuntime.test.js) |
| Concurrency and overspending protection | Implemented + Verified | [runtime tests](../../backend/tests/projectExpenseAccountingRuntime.test.js) |
| Project Expense API | Not Implemented | No corresponding [backend route](../../backend/src/routes/) |
| Project Expense authorization | Not Implemented | Actor labels are not an application authorization service |
| Operator expense UI | Not Implemented | No corresponding [frontend](../../frontend/) flow |
| Contract registry | Not Implemented | Files in [legal documentation](../legal/) are not registry records |
| Legal-entity registry | Not Implemented | Operator table is not a general verified registry |
| KYC/KYB and e-signatures | Not Implemented | Required before live operation |
| Bank integration and fiat settlement | Not Implemented | [Financial model](../business/FINANCIAL_OPERATING_MODEL.md) is a target design |
| Production custody | Not Implemented | [Release boundary](../releases/alpha-v1.2-release-notes.md) |
| Stablecoin accounting | Not Implemented | Conversion record is not production stablecoin accounting |
| Production deployment readiness | Not Implemented | Alpha is not production ready |

## 13. Accepted Limitations

The Slice 2 completion claim is checkpoint-specific: PR #1 merged Migrations 016 and 017 and
verification tests at `a9158b1b904e08e70a4f16ffa7d1e91420d790ba`. The
[scope test](../../backend/tests/slice2CommitScope.test.js) verifies original implementation and
audit-correction scopes; it is not an unrestricted future branch policy.

Actor IDs, roles, authorities, evidence references, and agreement references are textual or
declarative. Constraints cannot verify a human, mandate, legal entity, signed agreement, bank
statement, or external payment.

There is no contract registry, general legal-entity registry, production payment execution, bank
integration, completed KYC/KYB, production custody, Project Expense API, or expense UI. These do
not invalidate Slice 2 because its scope is an additive PostgreSQL accounting foundation.

No separate Final Closure Audit or authoritative GitHub CI billing-lock record was found in
`main`; this document therefore claims neither a successful GitHub CI run nor a billing lock.

## 14. Repository Guide

| Area | Path |
| --- | --- |
| Entry point | [README.md](../../README.md) |
| Frontend | [frontend/](../../frontend/) |
| Backend | [backend/src/](../../backend/src/) |
| Smart contract | [backend/contract/](../../backend/contract/) |
| Migrations | [backend/src/db/migrations/](../../backend/src/db/migrations/) |
| Tests | [backend/tests/](../../backend/tests/) |
| Platform documentation | [docs/platform/](./) |
| Architecture | [docs/ARCHITECTURE.md](../ARCHITECTURE.md) |
| Business | [docs/business/](../business/) |
| Legal | [docs/legal/](../legal/) |
| Pilot operations | [docs/platform/pilot/](pilot/) |
| Pilot economics | [docs/60-40/](../60-40/) |
| NEAR Testnet | [docs/near-testnet.md](../near-testnet.md) |
| Architecture decisions | [docs/architecture/](../architecture/) |

## 15. Safe Verification Guide

Run commands from the repository root unless noted.

```powershell
Set-Location backend
npm test
```

The backend test script runs Jest in-band. Without explicit PostgreSQL opt-in variables, the
destructive Migration 017 runtime suite is skipped while static migration and application tests
run.

Runtime verification requires `TEST_DATABASE_URL` pointing to a safe administrative test database
whose name starts with `agripartners_ephemeral_`, plus
`AGRIPARTNERS_ALLOW_DESTRUCTIVE_TEST_DB=1`.

```powershell
$env:TEST_DATABASE_URL = 'postgresql://[test-user]:[test-password]@[test-host]/agripartners_ephemeral_admin'
$env:AGRIPARTNERS_ALLOW_DESTRUCTIVE_TEST_DB = '1'
npm test -- --runInBand tests/projectExpenseAccountingRuntime.test.js
```

Never use production, staging, shared, system, or important databases. The
[harness](../../backend/tests/helpers/disposablePostgresHarness.js) validates the name, creates
a uniquely owned child database, records an ownership sentinel, and refuses unsafe cleanup.

Focused and regression commands:

```powershell
npm test -- --runInBand tests/projectExpenseAccountingMigration.test.js
npm test -- --runInBand tests/slice2CommitScope.test.js
npm test -- --runInBand
npm test -- --runInBand --detectOpenHandles
```

The runtime suite applies the full migration sequence and tests repeat-run-safe guarded SQL. The
[migration runner](../../backend/src/db/migrate.js) separately records applied filenames in
`_migrations`. Never expose real connection strings.

## 16. Current Roadmap

Completed and merged at the verified checkpoint:

- Stage 2 Slice 1 — Financial Workflow Foundation
- Stage 2 Slice 2 — Project Expense Accounting Foundation

Current:

- Documentation Milestone D1 — Canonical AgriPartners Platform Documentation

Next:

- Stage 2 Slice 3 — Project Expense Backend API & Authorization

Later, subject to separate approval:

- operator expense dashboard;
- reporting/export layer;
- stronger identity and authority model;
- contract and legal-entity registries;
- production operational readiness;
- KYC/KYB;
- banking, payment, custody, and treasury integrations.

No dates are established here. Roadmap statements are not implementation claims.

## 17. Document Authority and Update Rule

This is the canonical platform overview. Specialized legal, technical, business, pilot, release,
and audit documents remain valid for deeper detail within their status and authority.

Implementation claims are governed by migrations, executable tests, and current code. Target
architecture is governed by approved architecture; legal claims by current legal sources; and
pilot economics by approved business/pilot sources. Uncertainty must remain visible.

Any future pull request changing financial, contractual, participant, authority, or platform
architecture must update this document in the same pull request.
