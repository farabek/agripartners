<!-- markdownlint-configure-file { "MD013": false, "MD029": false } -->

# Stage 2 Financial Architecture and Project Lifecycle Migration Plan

Status: Approved implementation migration plan; not started

Audit date: 2026-07-03

Repository baseline: `8abb4fc`

Architecture baseline: Business Architecture v1.0, frozen 2026-07-02

## Stage 2 approval and mandatory boundary

This existing plan is the single implementation migration authority for Stage 2; no parallel
roadmap is created. Stage 2 must migrate the Rust contract, backend, database, authentication,
frontend, tests, and deployment configuration to this permanent flow:

```text
External Investor
        |
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
Farmer product role / Project expenses
        (fiat-only; no wallet or on-chain requirement)
```

The Uzbekistan Feedlot Operator is the legal and operational fiat recipient under a separate
written agreement with AgriPartners OÜ. Farmer is a non-crypto product role for operational work,
reporting, evidence, tasks, and confirmations. Target implementation must preserve Investor
Funding receipt, Estonia-layer conversion, cleared fiat, Operator Fiat Disbursement, Operator
confirmation, Project expenses, fiat proceeds returned, reconciliation, and Investor Settlement
as separate states. Governing agreements and authoritative provider, bank/payment, accounting,
and reconciliation evidence control those states; an on-chain record never does so by itself.

Current Farmer wallets, Farmer withdrawals, NEAR funding, and smart-contract payouts must remain
preserved and labeled as **Legacy Testnet Alpha — historical technical demonstration, not the
target production financial architecture** until their Stage 2 retirement or isolation.

Stage 2 is complete only after repository-wide validation confirms that no active
Uzbekistan-facing workflow, route, schema constraint, signer, screen, test, or deployment setting
requires cryptocurrency, a crypto wallet, token, smart contract, crypto conversion, or on-chain
transaction.

## Objective

This document compares the current AgriPartners implementation with the frozen Business
Architecture v1.0 and identifies the changes required to replace the historical Deal-centered
workflow with the approved Investment Model-to-Project lifecycle.

This is a refactoring plan, not an implementation specification or authorization to change the
application. No frontend, backend, API, database, smart contract, or deployment change is made by
this audit.

## Executive Finding

The required change is **not a global rename from `Deal` to `Project`**.

The current `deals` aggregate combines at least four different concepts:

1. a reusable agricultural model, represented loosely by `deal_type`;
2. one participant-specific investment instance;
3. one deployed NEAR financial contract;
4. one lifecycle and return-reporting container.

The frozen architecture requires these concepts to be separated:

```text
Master Investment Model
        |
        v
Independent Project
        |
        v
Approved Project lifecycle and records
        |
        +--> optional supplementary NEAR references
```

The database and API need a controlled migration because `deals` is the root identifier for
events, cycle updates, reports, returns, and treasury entries. The backend and frontend need
semantic changes because they currently treat contract state and wallet identities as lifecycle
authority. The current financial smart contract must not be used as-is for a real Pilot Project:
it requires a Farmer wallet, directly receives NEAR from the Investor, calculates an escrow pool,
and exposes Farmer withdrawals. Those behaviors conflict with the frozen Farmer fiat-only,
AgriPartners-mediated, no-Protection-Reserve Pilot architecture.

For Pilot 1.0, the safest path is to make the Project and approved fiat records authoritative and
remove the current contract from required financial execution. Under that path, a smart contract
code change is not required to launch the Project lifecycle because the legacy contract is not
used for Pilot money movement. If AgriPartners later wants a contract to represent the approved
lifecycle, contract changes are required and should be handled as a separately approved design,
not hidden inside a Deal-to-Project rename.

## Sprint 1 Implementation Note

Sprint 1 performs frontend terminology alignment only. User-facing copy now presents Projects,
Investment Models, the Opportunity Catalog, AgriPartners as Project Operator, Project Progress,
Farmer Reports, Production Cycles, and Settlement / Returns in line with Business Architecture
v1.0.

For migration safety, this step intentionally keeps the existing backend service names, hash
routes, API endpoints, API fields, database tables and columns, smart contract interface, and
business logic unchanged. Terms such as `deal`, `deal_id`, `/api/deals`, and existing contract
actions therefore remain in internal code and compatibility interfaces until the later
implementation phases defined by this plan.

## Audit Scope and Evidence

| Layer | Primary implementation reviewed |
| --- | --- |
| Backend | `backend/src/services`, `backend/src/routes`, authentication middleware, Pilot script |
| Frontend | `frontend/app.js`, route dispatcher, Admin, Investor, Farmer, Treasury, demo, and public views |
| Database | migrations `001` through `014`, `backend/src/db/schema.sql`, foreign-key and field usage |
| API | Express route mounts and all Deal, Investor, Farmer, Admin, return, and treasury endpoints |
| Smart contract integration | `backend/src/services/nearService.js`, `backend/src/near/client.js`, Rust contract and tests |
| Documentation | frozen Business documents, Pilot package, portal documents, NEAR document, design specifications, and current roadmap |

The audit describes the current repository at the stated baseline. Historical plans and old
audits are treated as context, not proof of current behavior.

## 1. Current Platform Lifecycle

### 1.1 Implemented lifecycle

The implemented lifecycle has three overlapping state systems.

#### NEAR contract state

```text
Admin creates Deal and deploys one contract
        |
        v
Initialized
        |
        | Investor sends exact investment amount in NEAR
        v
Funded
        |
        | Admin starts cycle
        v
CycleActive
        |
        | Admin reports profit/loss and attaches profit in NEAR
        v
CycleSettlement
        |
        +--> repeat CycleActive -> CycleSettlement
        |
        +--> Completed after final report
        |
        `--> Terminated when modeled loss exceeds escrow pool
```

Contract `Completed` means the final configured cycle was reported. It does not prove that the
Farmer completed a fiat obligation, that required reports were approved, that AgriPartners
received cleared funds, that the Investor was paid, or that Settlement was reconciled.

#### Off-chain operational records

```text
deals row
   |
   +--> events
   +--> farmer_cycle_updates
   |       `--> Farmer funding confirmation
   +--> reports
   |       `--> Farmer-submitted report
   +--> deal_returns
   |       `--> recorded -> approved -> paid -> reconciled
   `--> treasury_transactions / treasury_ledger_entries
```

The off-chain records are linked by `deal_id`, but the `deals` table has no authoritative
lifecycle status. Lifecycle state is inferred from a mixture of contract status, events, cycle
updates, reports, and return rows.

#### Portal workflow

- Admin creates a Deal and deploys its contract in the same request.
- Investor and Farmer ownership is represented by NEAR account strings stored directly on the
  Deal.
- Investor funding calls the contract and is denominated in NEAR.
- Admin starts a contract cycle.
- Farmer confirms cycle funding in an off-chain record after a `cycle_started` event.
- Farmer submits an off-chain report through a wallet-authenticated route.
- Admin separately calls `report_cycle` on the contract with profit/loss values.
- Contract participants may withdraw available NEAR balances.
- Admin may separately record off-chain returns and advance them through
  `recorded -> approved -> paid -> reconciled`.
- Shadow Treasury entries are created for recorded returns, but they are not authoritative
  payment or accounting records.

The newer live Admin, Investor, and Farmer dashboards call APIs. Static demonstration profiles
still exist on separate Pilot/demo routes. The main mismatch is therefore no longer simply
static data substitution; it is the Deal, wallet, contract, and financial authority model.

### 1.2 Current concept assessment

| Concept | Current implementation | Architecture comparison | Required direction |
| --- | --- | --- | --- |
| Deal | Root table, service, route, UI entity, contract instance, lifecycle container, and treasury reference | No canonical Deal entity exists in Business Architecture v1.0 | Replace business use with Project; preserve legacy identifiers only for migration/compatibility |
| Investor | NEAR wallet string on `deals`; wallet-authenticated portal; contract funder and withdrawal recipient | Investor contracts with and funds AgriPartners OÜ through an approved route | Separate participant identity from wallet; wallet is optional approved infrastructure, not the legal identity |
| Farmer | NEAR wallet string on `deals`; wallet-authenticated portal; contract balance owner and withdrawer | Farmer contracts only with AgriPartners OÜ and is fiat-only/non-blockchain | Remove wallet dependency and all Farmer contract funding/withdrawal requirements |
| Funding | Exact NEAR deposit into the per-Deal contract, plus a generic `funded` event | Investor Funding is received by AgriPartners; Farmer Disbursement is a separate approved fiat movement | Model Investor Funding and Farmer Disbursement as distinct, evidenced states |
| Cycles | Contract `current_cycle`, events, `farmer_cycle_updates`, and reports are combined into a derived DTO | Production Cycles belong to a Project and use approved Project-specific parameters | Create explicit Project Production Cycle records and controlled transitions |
| Reports | Farmer report is off-chain; Admin contract report independently supplies profit/loss and can advance contract state | Reports require evidence, review, status, and traceability; they do not themselves prove financial Settlement | Unify report identity and review state; separate operational reporting from financial posting |
| Withdraw | On-chain balance pull by Farmer, Investor, platform, or delegated Investor signer | Farmer uses fiat; Investor Settlement is an approved AgriPartners payment, not a generic withdrawal | Retire `Withdraw` as a business lifecycle stage; use payment/disbursement/settlement records |
| Settlement | Contract has per-cycle `CycleSettlement`; return rows can become `reconciled`; withdrawals transfer NEAR | Settlement is the approved calculation, reconciliation, and payment process under the agreements | Add one Project Settlement aggregate and completion gate tied to authoritative evidence |

### 1.3 Structural gaps

1. There is no Investment Model registry or immutable model version linked to each instance.
2. `deal_type` is free text and also defaults from the create form title; it is not a controlled
   Master Investment Model reference.
3. There is no Project identifier independent from a contract address.
4. Project approval, agreement versions, currency, jurisdiction, conditions precedent, funding
   cap, and Project adaptation are not first-class records.
5. Investor Funding and Farmer Disbursement are conflated with contract funding/cycle actions.
6. Farmer Confirmation is wallet-authenticated and cycle-local; the target requires confirmation
   of fiat receipt and readiness through an approved non-blockchain process.
7. A Farmer report and an Admin contract `report_cycle` are separate actions with no enforced
   approval dependency between them.
8. The contract may reach `Completed` without completed Investor Settlement or Project closeout.
9. Return rows track useful financial vocabulary, but `recorded` return amounts are NEAR-only and
   do not by themselves represent cleared Farmer receipts or Investor payments.
10. The Treasury schema is Deal-linked, NEAR-seeded, and explicitly shadow/non-authoritative.
11. Protection Reserve/escrow behavior exists in the contract, create flow, UI, schema, and
    documentation even though it is outside Pilot 1.0.
12. Public `/api/deals` endpoints expose Deal rows and events without the target Project
    disclosure and authorization model.

## 2. Target Lifecycle

### 2.1 Target business hierarchy

```text
Master Investment Model
        |
        | approved version selected
        v
Project
        |
        | Project-specific adaptation, participants,
        | agreements, amount, currency, risks, cycles,
        | reporting, approvals, and settlement method
        v
Project lifecycle
```

Feedlot and Hissar Sheep are Master Investment Models. They are reusable definitions, not active
Projects and not legal agreements. Every Project must reference one controlled model version and
contain its own approved terms and records.

### 2.2 Target Project lifecycle

```text
Project Creation
        |
        v
Funding
        |
        v
Farmer Confirmation
        |
        v
Production Cycles
        |
        v
Reports
        |
        v
Settlement
        |
        v
Completed
```

Recommended explicit Project states:

| State | Minimum entry evidence |
| --- | --- |
| `draft` | Project identifier and selected Investment Model version |
| `pending_approval` | Project adaptation, participants, terms, risks, agreements, and planned cycles complete |
| `approved` | Required business, legal, compliance, finance, and operations approvals recorded |
| `funding_pending` | Executed Investor Agreement and approved payment instructions |
| `funded` | Investor Funding received by AgriPartners and reconciled to the authoritative financial record |
| `farmer_disbursement_pending` | Conditions precedent and fiat payment approvals complete |
| `farmer_confirmed` | Farmer fiat receipt and Project readiness confirmed with evidence |
| `in_production` | An approved Production Cycle is active |
| `reporting` | A cycle report is due, submitted, under review, accepted, rejected, or escalated |
| `settlement_pending` | Final Project inputs and Farmer fiat return are being calculated/reconciled |
| `settled` | Approved Investor Settlement is paid and reconciled |
| `completed` | All cycles, reports, payments, exceptions, obligations, access, and closeout evidence are resolved |

Exceptional states such as `suspended`, `cancelled`, `defaulted`, or `terminated` require explicit
reason, authority, effective date, obligations, and resolution rules. They must not be inferred
from a failed blockchain call.

### 2.3 Authority model

| Record | Target authority |
| --- | --- |
| Investment Model definition/version | Controlled Business document or model registry |
| Project terms and obligations | Executed agreements and approved Project adaptation |
| Investor Funding | Approved bank/payment/CASP record plus accounting reconciliation |
| Farmer Disbursement and return | Bank/payment records plus accounting reconciliation |
| Production status and reports | Approved operational evidence and review records |
| Settlement calculation | Approved contractual calculation and reconciliation |
| Investor payment | Approved provider/bank evidence and accounting record |
| Project completion | Signed closeout decision after all required evidence passes |
| NEAR event | Supplementary reference reconciled to an authoritative business event |

No contract status, transaction hash, wallet balance, screenshot, or UI label may independently
establish Funding, Settlement, or Project Completion.

## 3. Terminology Mapping

### 3.1 Entity and field mapping

| Current | Target | Change type | Notes |
| --- | --- | --- | --- |
| Deal | Project | Replace | Business entity changes semantically; do not perform a blind text replacement |
| `deals` | `projects` | Migrate | Use a compatibility period; preserve legacy IDs |
| `deal_id` / `dealId` | `project_id` / `projectId` | Migrate | Applies to database keys, DTOs, filters, events, reports, returns, and treasury |
| `deal_type` | `investment_model_id` plus Project title/type snapshot | Split | Must reference a controlled model and version |
| Deal template/model assumptions | Investment Model version | Extract | Reusable economics and operating logic cannot live only on each Project |
| Deal terms | Project adaptation/terms | Clarify | Project-specific amount, currency, cycles, fees, risks, and agreements |
| Deal status | Project lifecycle status | Replace | Current status comes mainly from the contract |
| Deal contract address | Optional Project NEAR reference | Demote | One optional technical reference, not Project identity |
| Deal events | Project events | Migrate | Add source, authority, actor, evidence, and idempotency semantics |
| `farmer_cycle_updates` | Project Production Cycle confirmations/status | Replace | Funding confirmation and report fields should not be one overloaded row |
| `reports.cycle_id` | `production_cycle_id` | Migrate | Use an actual cycle foreign key, not an unvalidated number |
| `farmer_wallet` | `submitted_by_participant_id` or operator identity | Replace | Farmer submission must not require a wallet |
| `deal_returns` | Project financial/settlement entries | Replace or split | Separate Farmer receipt, allocation, fee, Investor payment, and reconciliation |
| `related_deal_id` | `related_project_id` | Migrate | Applies to both treasury transaction and ledger entry tables |
| Withdraw | Disbursement or Settlement payment | Replace | Name the business movement and its evidence |
| Marketplace | Opportunity Catalog before Phase 7 | Correct | Public discovery must not imply a live Marketplace |
| Escrow / Protection Reserve | Out of Pilot scope | Retire from Pilot | Do not map it into the Pilot Project model |

### 3.2 State mapping

| Current state/event | Target interpretation | Migration rule |
| --- | --- | --- |
| Contract `Initialized` / event `deployed` | Technical contract created | Does not prove Project approval or creation completion |
| Event `funded` / contract `Funded` | Historical on-chain funding event | Does not become target `funded` without authoritative receipt and reconciliation |
| Event `cycle_started` / contract `CycleActive` | Candidate Production Cycle start | Import only with Project cycle identity, approval, and start evidence |
| `funding_received_at` | Farmer confirmation evidence candidate | Rename only after verifying what payment it confirms |
| Farmer report `submitted` | Report submitted | Preserve; add review status and evidence controls |
| Event `cycle_reported` | Historical Admin contract action | Do not treat as report approval or Settlement |
| Contract `CycleSettlement` | On-chain distribution calculation state | No direct target state; target Settlement is Project-level and evidence-based |
| Return `recorded` | Internal record only | Preserve as `recorded`; never infer receipt or payment |
| Return `approved` | Approved return entry | Preserve approval history but identify the approved business object |
| Return `paid` | Claimed/recorded payment state | Require payment evidence before migration as paid |
| Return `reconciled` | Reconciled return row | Does not by itself mean the Project is settled |
| Contract `Completed` | Final configured contract cycle reported | Historical technical state only |
| Event `completed` | Mirrored contract completion | Cannot populate Project `completed` without closeout checks |
| Contract `Terminated` | Historical contract termination | Map to an exception review, not automatically to Project default/termination |

### 3.3 Terms that remain valid

The following terms remain valid but need Project-scoped definitions: Investor, Farmer, Funding,
Production Cycle, Report, projected ROI, realized ROI, fee, reconciliation, and Settlement.

## 4. Backend Impact

### 4.1 Affected services

| Service/file | Current responsibility | Required impact |
| --- | --- | --- |
| `services/dealService.js` | Deal CRUD, ownership, events, cycles, reports, returns, summaries | Replace with a Project-oriented application layer; split lifecycle, reports, settlement, and read-model responsibilities |
| `services/financialService.js` | Deal and portfolio projected/recorded NEAR calculations | Rename DTO semantics and support approved Project currency; keep projected, received, paid, realized, and reconciled values distinct |
| `services/treasuryService.js` | Shadow double-entry records linked to `related_deal_id` | Link to Projects, support approved fiat currencies, and keep authority classification explicit |
| `services/nearService.js` | Deploys and operates one financial contract per Deal | Remove from required Project creation and fiat lifecycle; restrict to optional approved supplementary records |
| `services/profileService.js` | Wallet profile with immutable Farmer/Investor role | Support Farmer identity and access without requiring a NEAR wallet |
| `services/investorProfileService.js` | Investor metadata keyed by wallet account | Separate legal participant identity from optional wallet account |
| `services/walletAuthService.js` | NEP-413 authentication | Retain only for roles/routes where a wallet is approved; it cannot be the only Farmer authentication method |
| `services/userService.js` | Legacy username/password users | Review as a possible transition mechanism, but do not silently make it the target identity model |
| `near/client.js` | Backend signer credentials | Remove Farmer financial execution dependency and document any remaining operator signer scope |
| `scripts/pilot-deal-2-complete.js` | Contract Deal completion by funding, cycles, and withdrawals | Retire as Pilot lifecycle proof; replace later with a Project rehearsal that uses authoritative evidence |

### 4.2 Required backend capabilities

The target backend needs:

- controlled Investment Model list/version reads;
- Project creation independent from contract deployment;
- Project adaptation and approval records;
- participant associations independent from wallet strings;
- explicit lifecycle transition validation with actor, authority, reason, timestamp, and evidence;
- separate Investor Funding and Farmer Disbursement workflows;
- non-wallet Farmer Confirmation and reporting;
- explicit Production Cycle records and report review states;
- Project Settlement calculation, approval, payment, reconciliation, and closeout;
- optional NEAR reference recording that cannot advance authoritative financial state;
- compatibility reads for legacy Deal records during migration;
- audit-safe exports and idempotent financial/event writes.

### 4.3 Backend behavior to retire

- contract deployment as an unconditional prerequisite for creating a business entity;
- free-text `deal_type` as model selection;
- Investor/Farmer wallet strings as the participant master record;
- Farmer withdrawal and Farmer wallet authorization;
- contract status as Project lifecycle authority;
- Admin `report_cycle` as both cycle reporting and financial distribution;
- automatic model reserve rates in Pilot creation;
- generic `withdraw` actions as business payment semantics;
- inferred completion from the number of reported contract cycles.

### 4.4 Tests affected

All Deal service, route, portal contract, migration, treasury, financial summary, and NEAR service
tests are affected. The safest approach is to add Project contract tests alongside legacy tests,
then retire legacy tests only after compatibility routes and data migration are verified.

At minimum, new tests must prove:

- a Project references one approved Investment Model version;
- Project creation can succeed without deploying a contract;
- invalid lifecycle transitions fail;
- Farmer workflows work without a wallet;
- Investor Funding cannot be confused with Farmer Disbursement;
- a report cannot silently advance Settlement;
- `settled` requires approved payment and reconciliation evidence;
- `completed` requires all lifecycle and closeout gates;
- NEAR failure cannot change authoritative Project state;
- legacy Deal IDs resolve consistently during the compatibility period.

## 5. Frontend Impact

### 5.1 Affected pages and routes

| Page/route | Current Deal behavior | Required Project behavior |
| --- | --- | --- |
| Home/navigation | Uses Deal and Marketplace wording in current-facing areas | Use Project and Opportunity Catalog where the frozen architecture applies |
| `#/marketplace` | Static Marketplace of pilot Deals | Relabel as Opportunity Catalog; keep it non-transactional and clearly pre-Marketplace |
| `#admin` / `#deals` | Live Deal dashboard | Project dashboard with lifecycle gates, evidence, exceptions, and authoritative state labels |
| `#admin/create` | Creates Deal and deploys contract | Select Investment Model version, create draft Project, capture adaptation, then approve separately |
| `#deals/:id` | Deal detail driven by contract status/balances and Admin contract actions | Project detail driven by Project state, cycles, reports, payments, Settlement, and evidence |
| `#admin/treasury` | Filters and displays `related_deal_id`, NEAR shadow accounts | Filter by Project; distinguish shadow/technical entries from approved fiat records |
| `#investor` | “My Investments” made from Deal DTOs | Investor's approved Projects with accurate funding, reporting, and settlement states |
| `#investor/deals/:id` | Deal detail, contract balances, withdrawal action | Project detail; remove generic withdrawal and present approved Settlement status/payment evidence |
| `#farmer` | Wallet-required Deal dashboard | Non-blockchain Farmer Project dashboard or approved operator-assisted process |
| `#farmer/deals/:id` | Wallet-owned Deal, confirmation, report, and Farmer withdrawal | Project confirmation/reporting with no wallet or on-chain financial action |
| `#/onboarding` | Wallet-first Farmer/Investor roles | Participant onboarding aligned to approved identity and role model |
| Demo Pilot routes | Static Deal-shaped profiles | May remain demo-only, but labels and disclaimers must not contradict current architecture |
| Presentation Mode | Uses Deal, Marketplace, withdrawal, and protection topics | Update current-facing narrative; preserve historical demo references only when explicitly labeled |

### 5.2 Affected frontend components/functions

The impact includes:

- route parsing for `/deals/` paths;
- Admin create form and `createAdminDeal`;
- live Admin dashboard, Deal cards, Deal detail, action controls, returns, and Treasury filters;
- Farmer dashboard normalization, cards, detail bundle, confirmation, report, and withdrawal
  actions;
- Investor Deal normalization, enrichment, cards, detail bundle, returns, funding progress, and
  withdrawal actions;
- Marketplace filters/cards and public navigation;
- demo adapters that create Deal-shaped objects from Pilot profiles;
- labels such as `Deal #`, `Create Deal`, `View Deal`, `Technical Deal Data`, `Active Deals`, and
  `Completed Deals`;
- error messages and empty states;
- test selectors and frontend source-contract tests.

### 5.3 Frontend migration rule

Routes and labels should not be changed before Project API contracts exist. During compatibility:

- new links should use `/projects/`;
- old `/deals/` links may redirect or resolve through a compatibility adapter;
- DTO adapters should be centralized rather than mixing `deal_id`, `dealId`, `project_id`, and
  `projectId` throughout rendering code;
- demo profiles must remain visibly non-live;
- no UI should synthesize authoritative Project state from contract status alone.

## 6. API Impact

### 6.1 Affected endpoint inventory

All endpoints below are directly affected or return Deal-linked fields.

#### Public/legacy Deal endpoints

| Current endpoint | Target |
| --- | --- |
| `GET /api/deals` | Replace with an authorized/disclosure-controlled Project collection; do not preserve unrestricted row exposure by default |
| `GET /api/deals/:id` | `GET /api/projects/:id` |
| `GET /api/deals/:id/status` | Include Project lifecycle state in Project resource; expose NEAR status only as optional technical data |
| `GET /api/deals/:id/balances` | Remove from business lifecycle; optional technical endpoint only if approved |
| `GET /api/deals/:id/events` | `GET /api/projects/:id/events` with source and authority semantics |
| `GET /api/me/deals` | Replace with role-appropriate `GET /api/me/projects` or retire in favor of role APIs |

#### Investor endpoints

| Current endpoint | Target |
| --- | --- |
| `GET /api/investor/deals` | `GET /api/investor/projects` |
| `GET /api/investor/deals/:id` | `GET /api/investor/projects/:id` |
| `GET /api/investor/deals/:id/status` | Fold into Project lifecycle/read model |
| `GET /api/investor/deals/:id/balances` | Remove or label as optional technical balance; not Settlement authority |
| `GET /api/investor/deals/:id/events` | `GET /api/investor/projects/:id/events` |
| `GET /api/investor/deals/:id/cycles` | `GET /api/investor/projects/:id/cycles` |
| `GET /api/investor/deals/:id/reports` | `GET /api/investor/projects/:id/reports` |
| `GET /api/investor/deals/:id/returns` | Replace with Project Settlement/payment view |
| `POST /api/investor/deals/:id/withdraw` | Retire; Investor Settlement is an approved payment workflow |
| `GET /api/investor/portfolio-summary` | Keep route if desired, but calculate from Project DTOs and approved financial-state semantics |

#### Farmer endpoints

| Current endpoint | Target |
| --- | --- |
| `GET /api/farmer/deals` | `GET /api/farmer/projects` with non-wallet authentication |
| `GET /api/farmer/deals/:dealId` | `GET /api/farmer/projects/:projectId` |
| `GET /api/farmer/deals/:dealId/cycles` | `GET /api/farmer/projects/:projectId/cycles` |
| `POST /api/farmer/deals/:dealId/confirm-funding` | Replace with explicit fiat disbursement receipt/Project readiness confirmation |
| `POST /api/farmer/deals/:id/cycles/:cycleId/confirm-funding` | Remove cycle-funding ambiguity; confirm the defined Farmer Disbursement or milestone |
| `POST /api/farmer/deals/:dealId/cycles/:cycleId/report` | `POST /api/farmer/projects/:projectId/cycles/:cycleId/reports` |
| `POST /api/farmer/deals/:dealId/withdraw` | Retire; Farmer payments use approved fiat rails |

#### Admin endpoints

| Current endpoint | Target |
| --- | --- |
| `POST /api/admin/deals` | Split into model selection, draft Project creation, adaptation, and approval; no automatic contract deployment |
| `POST /api/admin/deals/:id/fund` | Retire from Pilot business flow |
| `POST /api/admin/deals/:id/fund-as` | Retire; currently non-production contract tooling |
| `POST /api/admin/deals/:id/start-cycle` | `POST /api/admin/projects/:id/cycles` or explicit cycle transition |
| `POST /api/admin/deals/:id/report-cycle` | Split report review from financial posting/Settlement |
| `GET /api/admin/deals/:id/cycles` | `GET /api/admin/projects/:id/cycles` |
| `GET /api/admin/deals/:id/return-summary` | Replace with Project financial and Settlement summary |
| `GET /api/admin/deals/:id/returns` | Replace with scoped Project receipts, allocations, payments, and settlement records |
| `POST /api/admin/deals/:id/returns` | Replace with explicit financial event creation; do not use one generic return object |
| `POST /api/admin/deals/:id/withdraw` | Retire from Pilot business flow |
| `POST /api/admin/deals/:id/withdraw-as` | Retire; currently non-production contract tooling |
| `POST /api/admin/returns/:returnId/approve` | Re-scope to the target financial object |
| `POST /api/admin/returns/:returnId/mark-paid` | Re-scope and require payment evidence |
| `POST /api/admin/returns/:returnId/reconcile` | Re-scope and enforce Settlement reconciliation requirements |
| `GET /api/admin/returns/:returnId/status-events` | Keep history concept; rename/re-scope to target object |
| `GET /api/admin/treasury/ledger` | Change `related_deal_id` filter/field to Project semantics |
| `GET /api/admin/treasury/transactions/:id` | Return `related_project_id` and authority/source metadata |

Admin Farmer/Investor profile endpoints are not renamed solely for this lifecycle refactor, but
their participant identifiers and Farmer non-wallet access assumptions are affected.

### 6.2 New API capabilities

The target API will need resources or commands for:

- Investment Model list and approved version detail;
- Project draft, adaptation, approval, suspension, and closeout;
- Project participant/agreement references;
- Investor Funding receipt and reconciliation;
- Farmer Disbursement approval, payment, and confirmation;
- Production Cycle creation, activation, reporting deadline, closure, and exceptions;
- report submission, evidence, review, rejection, correction, and acceptance;
- Farmer return receipt;
- Settlement calculation, approval, Investor payment, reconciliation, and statement;
- Project completion;
- supplementary NEAR reference attachment.

### 6.3 Compatibility strategy

Use additive versioning rather than a flag-day endpoint rename:

1. add Project endpoints and DTOs;
2. make old Deal reads adapt from the Project model where compatibility is needed;
3. reject new writes through legacy Deal endpoints after a published cutover point;
4. migrate frontend callers;
5. monitor legacy endpoint use;
6. remove legacy routes only after data and client verification.

Legacy responses must not silently relabel a contract `Completed` state as Project `completed`.

## 7. Database Impact

### 7.1 Migration decision

**A database migration is required.**

A documentation/UI-only rename cannot satisfy the architecture because:

- `deals` is the root table;
- all lifecycle child records use `deal_id`;
- Investment Models do not exist as controlled entities;
- Project lifecycle status and transition evidence do not exist;
- participant identity is stored as wallet text;
- reports require `farmer_wallet`;
- financial records are Deal-linked and NEAR-oriented;
- Project Settlement and closeout do not exist.

### 7.2 Recommended target data model

Exact DDL requires a separate design review, but the minimum conceptual model is:

| Target record | Purpose |
| --- | --- |
| `investment_models` | Stable model identity such as Feedlot or Hissar Sheep |
| `investment_model_versions` | Controlled, immutable approved model version and source reference |
| `projects` | Independent Project identity, model version, title, status, currency, limits, dates, and adaptation |
| `project_participants` | Project role mapped to a legal participant, with optional technical accounts |
| `project_agreements` | Controlled agreement type, version, status, dates, and secure reference |
| `project_state_events` | Append-only lifecycle transition history with actor, authority, reason, evidence, and idempotency |
| `production_cycles` | Project-scoped planned/actual cycle records and statuses |
| `project_reports` | Cycle/milestone report, submitter, evidence, review status, and reviewer |
| `project_financial_events` | Typed expected/received/approved/paid/reconciled movements in approved currencies |
| `project_settlements` | Project-level calculation, approval, payment, reconciliation, and statement status |
| `project_exceptions` | Exceptions, incidents, complaints, defaults, and resolution |
| `project_technical_references` | Optional NEAR contract/transaction references with non-authoritative classification |

Existing participant/profile tables also require an identity review so a Farmer can exist and
operate without a wallet.

### 7.3 Safest migration pattern

1. Add target tables and stable Project identifiers without altering legacy tables.
2. Seed the two approved Investment Models and controlled versions.
3. Create one Project migration record for every existing Deal, retaining `legacy_deal_id`.
4. Backfill child records into Project-linked structures with provenance and an explicit
   `historical_unverified` classification where evidence is insufficient.
5. Dual-read and compare legacy and Project views.
6. Switch new writes to the Project model.
7. Migrate API and frontend reads.
8. Stop legacy writes.
9. Add constraints only after reconciliation proves full coverage.
10. Retain legacy tables read-only for the approved retention period; remove them only under a
    separate destructive migration decision.

Do not directly rename `deals` to `projects` and all `deal_id` columns in one migration. That
would preserve the current conflation and make rollback, evidence classification, and
compatibility harder.

### 7.4 Data migration cautions

- A Deal cannot be assigned an Investment Model version solely from title text without review.
- Existing `escrow_pct` must not activate a Pilot Protection Reserve.
- Existing wallet fields are technical identifiers, not verified legal participant identities.
- `funded` events do not prove AgriPartners receipt or fiat availability.
- `farmer_cycle_updates.funding_received_at` needs evidence review before mapping to Farmer
  Confirmation.
- Contract status and event history cannot establish Project Completion.
- Legacy `deal_returns` without complete type/evidence must retain their unknown or recorded-only
  status.
- NEAR amounts must not be converted to fiat without an approved rate, timestamp, source, and
  accounting policy.
- `backend/src/db/schema.sql` is not aligned with the PostgreSQL migration history and must not be
  used as the migration source of truth without reconciliation.

## 8. Smart Contract Impact

### 8.1 Current contract conflicts

The current Rust contract:

- identifies the business instance with `deal_type` rather than a Project/model version;
- requires a Farmer NEAR account;
- requires the Investor to fund the contract directly with exact NEAR;
- calculates Farmer, Investor, platform, and escrow balances on-chain;
- applies an escrow percentage and loss coverage behavior;
- allows Farmer withdrawals;
- treats Admin cycle reporting as the trigger for financial distribution;
- marks itself `Completed` after the configured cycle count;
- cannot represent approved fiat receipt, bank reconciliation, agreements, report review,
  Investor Settlement, or closeout.

The integration also deploys one contract before the Deal database insert. That operation is
non-atomic: contract deployment may succeed while database creation fails.

### 8.2 Are smart contract changes required?

**For the recommended Pilot 1.0 implementation: no smart contract code change is required,
provided the current contract is removed from the authoritative and required Pilot financial
workflow.**

The Pilot may run with no on-chain lifecycle, or with separately approved supplementary
references that do not initiate Farmer payments or establish financial state. The current
contract and its funding/withdrawal routes must not be presented as the real Project lifecycle.

**If a smart contract is required to represent or automate the target Project lifecycle: yes,
contract changes are required.** That design must remove Farmer blockchain dependency, remove
out-of-scope escrow/Protection Reserve behavior, use Project/model-version identifiers, avoid
claiming fiat authority, and define migration/versioning. It is effectively a new contract
design and belongs outside this Sprint 1 audit and outside a cosmetic lifecycle refactor.

### 8.3 Immediate contract-integration action

The P0 action is not to build Smart Contract v2. It is to:

- decouple Project creation from contract deployment;
- disable contract fund, Farmer withdraw, and generic withdraw actions for the real Pilot;
- classify any retained contract status/balance as demo or supplementary technical data;
- prevent contract `Completed` from advancing Project status;
- preserve the current contract only for historical Testnet demonstration until a separate
  decision retires or supersedes it.

## Documentation Impact

### Canonical documents already aligned

The Business Architecture Freeze, Operating Model, Financial Operating Model, Information
Disclosure Policy, Master Investment Models, and current Pilot package already define the target
Investment Model-to-Project relationship and Farmer fiat-only boundary.

### Current-facing documents requiring alignment

| Document group | Required correction |
| --- | --- |
| Root README and portal summaries | Replace current business use of Deal with Project while accurately labeling legacy technical resources |
| `docs/near-testnet.md` | Remove Farmer-wallet and contract-finance claims from the approved Pilot narrative |
| Investor/Farmer/Admin portal docs | Describe live Project pages and target authority; remove Farmer withdrawal and wallet dependency |
| Treasury design docs | Migrate Deal references to Project and separate shadow records from authoritative finance |
| Typed return design | Re-scope Deal returns into Project financial and Settlement objects |
| Demo/presentation material | Label historical Deal/contract flows as Alpha Testnet demonstration |
| Marketplace references | Use Opportunity Catalog until Phase 7 |
| Investor Protection documents | Keep exploratory and explicitly outside Pilot 1.0; do not let `escrow_pct` imply activation |
| Tests and developer review docs | Update route/entity inventories after implementation, not before |

Documentation must distinguish:

- canonical business term: Project;
- legacy technical entity/API: Deal;
- historical demonstration: Deal contract;
- future public phase: Marketplace.

## 9. Pilot Priority

### P0 — Required for Pilot 1.0

1. Approve a canonical Project lifecycle state model and transition/evidence matrix.
2. Introduce controlled Investment Model identity/version and Project identity.
3. Create the Project data model through additive migrations with `legacy_deal_id` traceability.
4. Decouple Project creation from smart contract deployment.
5. Make approved Project, bank/provider, accounting, and reconciliation records authoritative.
6. Separate Investor Funding, Farmer Disbursement, Farmer Confirmation, Farmer return, and
   Investor Settlement.
7. Provide a Farmer workflow that requires no wallet, crypto, smart contract, or blockchain.
8. Remove/disable Farmer withdrawal and current contract financial execution from the real Pilot.
9. Implement explicit Production Cycle and report review states.
10. Add Project Settlement and Project Completion gates; contract `Completed` must not satisfy
    either gate.
11. Migrate Admin, Investor, and Farmer live views to Project APIs and terminology.
12. Replace generic withdrawal actions with approved fiat payment/settlement status and evidence.
13. Preserve and reconcile legacy Deal data; do not destructively rename or delete it.
14. Update current-facing Pilot, portal, API, NEAR, and operator documentation.
15. Prove the complete target lifecycle in a no-real-funds rehearsal.

### P1 — Important after the minimum lifecycle works

1. Add lifecycle event history, evidence links, actor/authority, reason, and idempotency.
2. Add Project agreement, participant, exception, incident, complaint, and closeout records.
3. Add provider/bank import or controlled entry and Project-level reconciliation views.
4. Add role separation and approval workflow support.
5. Add Project export, backup/restore, audit, and operational queue capabilities.
6. Add legacy endpoint usage monitoring and published deprecation behavior.
7. Reconcile participant/profile duplication and establish a durable non-wallet identity model.
8. Add optional privacy-safe NEAR reference records after the no-chain path is stable.
9. Update all automated tests and repository evidence for the Project model.

### P2 — Future

1. Remove legacy Deal tables and endpoints after retention, compatibility, and rollback gates.
2. Generalize the model for multiple Investors, Farmers, Projects, and currencies.
3. Automate provider reconciliation and accounting integrations.
4. Design a future supplementary Project smart contract if a separately approved use case
   remains.
5. Implement public Marketplace behavior only in Phase 7.
6. Design Protection Reserve, escrow, or institutional participation only in their approved
   future phases.

## 10. Recommended Implementation Order

### Phase 0 — Freeze semantics

1. Approve the terminology map.
2. Approve Project states, transitions, authority, evidence, exceptional states, and completion
   rules.
3. Decide the Pilot NEAR scope: no-chain or supplementary references only.
4. Freeze new Deal lifecycle feature development except critical fixes.

Exit: one approved business-to-platform lifecycle specification.

### Phase 1 — Add the Project foundation

1. Design additive Investment Model and Project tables.
2. Add Project lifecycle/event, cycle, report, financial, Settlement, and technical-reference
   structures.
3. Add stable Project IDs and `legacy_deal_id`.
4. Seed approved Investment Models/versions.
5. Implement repository/domain services behind internal interfaces.

Exit: Project records can be created and read without a contract.

### Phase 2 — Build compatibility and migrate data

1. Backfill each Deal into a reviewed Project migration record.
2. Classify uncertain historical states rather than inferring authority.
3. Add compatibility readers and comparison reports.
4. Reconcile record counts, identifiers, child links, amounts, and event provenance.
5. Test rollback before enabling Project writes.

Exit: every in-scope legacy record is mapped or explicitly excepted.

### Phase 3 — Implement the authoritative lifecycle

1. Add Project approval and state transition enforcement.
2. Implement Investor Funding and Farmer Disbursement separately.
3. Implement non-wallet Farmer Confirmation.
4. Implement Production Cycles and report review.
5. Implement Farmer return, Settlement calculation, approval, Investor payment,
   reconciliation, and closeout.
6. Ensure NEAR references cannot advance authoritative states.

Exit: backend tests pass for the full target lifecycle without a financial contract.

### Phase 4 — Introduce Project APIs

1. Add Project and Investment Model endpoints.
2. Add role-scoped Admin, Investor, and Farmer Project APIs.
3. Add compatibility responses for legacy reads.
4. Block new legacy Deal writes after verification.
5. Publish and monitor endpoint deprecations.

Exit: target workflows use Project DTOs; legacy routes are read-only compatibility paths.

### Phase 5 — Migrate frontend workflows

1. Migrate Admin create/list/detail and Treasury views.
2. Migrate Farmer access, confirmation, reporting, and support without a wallet.
3. Migrate Investor portfolio/detail and Settlement views.
4. Remove Pilot withdraw and contract-finance actions.
5. Update Opportunity Catalog, navigation, demos, labels, errors, and tests.

Exit: no real Pilot page depends on a Deal DTO, Farmer wallet, or contract financial state.

### Phase 6 — Rehearse and cut over

1. Run automated backend, frontend, migration, authorization, and regression tests.
2. Run a full synthetic lifecycle:

```text
Investment Model selection
        |
        v
Project Creation and approval
        |
        v
Investor Funding receipt/reconciliation
        |
        v
Farmer fiat Disbursement and Confirmation
        |
        v
Production Cycles and Reports
        |
        v
Farmer fiat return
        |
        v
Investor Settlement and reconciliation
        |
        v
Project closeout and Completed
```

3. Verify exports, audit history, backup/restore, failure behavior, and rollback.
4. Obtain business, legal/compliance, finance, operations, product, and technical sign-off.
5. Cut over Pilot users only after all P0 acceptance evidence passes.

Exit: Pilot release candidate approved under the Pilot 1.0 go/no-go process.

### Phase 7 — Retire legacy behavior

1. Observe the compatibility period.
2. Resolve remaining historical exceptions.
3. Remove legacy frontend routes and writes.
4. Archive legacy Testnet Deal-contract demonstrations.
5. Consider destructive database cleanup only through a separate reviewed migration.

Exit: `Deal` remains only in historical evidence or explicit legacy compatibility records.

## Refactoring Acceptance Criteria

The lifecycle refactor is complete only when:

- every live Project references one approved Investment Model version;
- Project creation does not deploy or require a smart contract;
- every lifecycle transition has an authorized actor, time, reason, and required evidence;
- Farmer workflows contain zero wallet, crypto, smart contract, or blockchain dependency;
- Investor Funding and Farmer Disbursement are distinct;
- Reports cannot independently create Settlement or Completion;
- Settlement requires approved calculation, payment evidence, and reconciliation;
- Project `completed` requires all cycles, reports, financial obligations, exceptions, and
  closeout evidence to be resolved;
- contract status and NEAR records are supplementary only;
- live frontend pages and APIs use Project terminology and Project identifiers;
- legacy Deal data remains traceable and reconciled;
- all P0 tests and a full synthetic lifecycle rehearsal pass.

## Related Architecture

- [Business Architecture v1.0 Freeze](../business/BUSINESS_ARCHITECTURE_V1_FREEZE.md)
- [Business Architecture Audit v1.0](../business/BUSINESS_ARCHITECTURE_AUDIT_V1.md)
- [AgriPartners v2 Operating Model](../business/OPERATING_MODEL.md)
- [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md)
- [Information Disclosure Policy](../business/INFORMATION_DISCLOSURE_POLICY.md)
- [Feedlot Master Investment Model](../business/investment-models/FEEDLOT_MASTER_INVESTMENT_MODEL.md)
- [Hissar Sheep Master Investment Model](../business/investment-models/HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md)
- [Pilot 1.0 Implementation Roadmap](PILOT_1_IMPLEMENTATION_ROADMAP.md)
- [Pilot 1.0 Plan](pilot/PILOT_1_PLAN.md)
- [Pilot Readiness Checklist](pilot/PILOT_READINESS_CHECKLIST.md)
- [Pilot Operations Guide](pilot/PILOT_OPERATIONS_GUIDE.md)
