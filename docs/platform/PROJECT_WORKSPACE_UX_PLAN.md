# Sprint 2: Project Workspace UX Plan

Status: Design and planning only

Architecture baseline: Business Architecture v1.0, frozen 2026-07-02

Pilot scope: One Investor, one Farmer, one AgriPartners-operated Project

## 1. Executive Summary

The Project Workspace is the central product screen for Pilot 1.0. It represents one independent
Project created from an approved Investment Model and follows that Project from preparation
through completion:

```text
Investment Model
        |
        v
Project
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

Investor, Farmer, and Admin must see the same Project identity, lifecycle status, milestones, and
approved facts. They do not receive identical screens or unrestricted access. The Workspace
applies a role-specific lens to one shared Project record:

- the **Investor** monitors the Project, approved Farmer Reports, financial progress, and
  Settlement through AgriPartners;
- the **Farmer** confirms fiat Funding, performs Production Cycles, and submits operational
  reports to AgriPartners;
- the **Admin** acts as the AgriPartners Project Operator and manages assignments, reviews,
  lifecycle controls, financial tracking, exceptions, and completion.

The Workspace replaces fragmented Deal-centered navigation as the user-facing product concept.
It must not imply a direct Investor-to-Farmer contract, payment, instruction, or information
exchange. AgriPartners is the counterparty, operator, information controller, and workflow
coordinator between the parties.

The Workspace is also the primary place where the platform distinguishes:

- projected, reported, reviewed, approved, paid, reconciled, and completed states;
- shared Project facts from role-restricted or confidential information;
- authoritative business and fiat records from optional supplementary NEAR references.

## 2. Shared Project Structure

All role views use the same stable Project identifier and common section model. Section content,
actions, detail level, and document access vary by role and Project stage.

### 2.1 Workspace header

The header provides the minimum shared orientation:

- Project title and stable Project reference;
- Investment Model name and approved version;
- current Project Status;
- Project Operator: AgriPartners;
- planned start and completion dates;
- next required milestone or action;
- last updated time and, where useful, the source or verification state.

The header must never use a contract address, wallet address, or legacy Deal identifier as the
user-facing Project identity.

### 2.2 Common sections

| Section | Shared purpose | Role-specific treatment |
| --- | --- | --- |
| Investment Model | Identify the reusable approved model and version from which the Project was adapted | Investor sees approved economics and assumptions; Farmer sees operating parameters; Admin sees the model reference and Project adaptation controls |
| Project Summary | Explain purpose, scope, amount, currency, duration, participants by approved reference, and Project-specific adaptation | Personal, banking, compliance, and confidential commercial details remain restricted |
| Project Status | Show one authoritative lifecycle state and its meaning | Investor and Farmer see approved participant-facing language; Admin sees control state, blockers, and allowed transitions |
| Timeline | Present completed, current, and upcoming milestones | Investor sees approved monitoring milestones; Farmer sees operational due dates; Admin sees all deadlines, owners, approvals, and exceptions |
| Funding Status | Separate Investor Funding received by AgriPartners from Farmer fiat disbursement and confirmation | Investor sees receipt and allocation status; Farmer sees fiat disbursement/confirmation; Admin sees reconciliation and evidence controls |
| Production Cycles | Show cycle number, planned dates, current state, reporting deadline, and completion state | Investor receives approved progress; Farmer performs and reports; Admin opens, monitors, reviews, escalates, and closes cycles |
| Reports | Hold Farmer submissions, evidence, review status, approved Investor updates, and report history | Investor sees only AgriPartners-approved disclosures; Farmer sees own submissions and feedback; Admin sees review and disclosure controls |
| Financial Summary | Present Project amount, approved budget categories, projections, actual recorded values, and state labels | Farmer sees fiat operating information needed for the Project; Investor sees investment and return information; Admin sees reconciliation and control details |
| Documents | Provide controlled access to Project documents, acknowledgments, summaries, and approved redacted extracts | Availability follows agreement, privacy, confidentiality, and disclosure rules |
| Settlement | Track calculation, review, Farmer fiat return, Investor payment, reconciliation, and final statement | Farmer sees obligations and confirmation; Investor sees Settlement / Returns; Admin manages the controlled process |
| Activity History | Provide a timestamped history of material Project events | Investor and Farmer see approved participant-safe events; Admin sees the full operational audit history and internal references |

### 2.3 Status and information rules

The Workspace must use one authoritative Project lifecycle rather than deriving business status
from a wallet balance, transaction hash, smart contract state, or UI action. Recommended
participant-facing states are:

```text
Preparing
  -> Approved
  -> Funding Pending
  -> Funded
  -> Farmer Confirmation Pending
  -> In Production
  -> Reporting
  -> Settlement Pending
  -> Settled
  -> Completed
```

Admin may additionally see controlled exceptional states such as Suspended, Cancelled,
Defaulted, or Terminated. Such a state requires a reason, authority, timestamp, impact,
participant communication decision, and resolution path.

Every financial or operational value should carry an appropriate state where ambiguity is
possible:

- **Projected** — calculated from approved assumptions; not guaranteed;
- **Reported by Farmer** — submitted but not yet accepted by AgriPartners;
- **Under Review** — being checked by AgriPartners;
- **Approved** — accepted for the stated operational purpose;
- **Recorded** — entered in the platform but not proof of money movement;
- **Received** — matched to approved provider or bank evidence;
- **Paid** — supported by payment evidence;
- **Reconciled** — matched across provider, accounting, agreement, and platform records;
- **Completed** — all Project closeout gates are satisfied.

### 2.4 Shared-object consistency

Role views may simplify or redact information, but they must not contradict one another. A
change to a shared Project fact should update every authorized view from the same source.
Role-specific actions create controlled events on the Project; they do not create separate
Investor, Farmer, or Admin versions of the Project.

## 3. Investor View

### 3.1 Purpose

The Investor Project Workspace answers:

1. What did I invest in through AgriPartners?
2. What is the verified status of the Project?
3. What has happened operationally and financially?
4. What is projected, reported, approved, paid, or reconciled?
5. What happens next before Settlement and completion?

The screen must state that AgriPartners is the Project Operator and the Investor's counterparty.
The Investor does not instruct, pay, contract with, or request information directly from the
Farmer. Farmer information is supplied, reviewed, and disclosed by AgriPartners under the
Information Disclosure Policy.

### 3.2 Information architecture

#### Investment Model

- model name and version;
- approved model summary;
- Project-specific adaptation;
- projected economics and assumptions;
- material risks and non-guarantee statement.

#### Project Status

- current status and plain-language definition;
- current milestone;
- last verified update;
- delay, exception, or attention notice approved for Investor disclosure;
- next expected Project event.

#### Funding Progress

- Investor commitment;
- amount received by AgriPartners;
- receipt/reconciliation state;
- Project funding target for the approved Pilot;
- Farmer disbursement status at an appropriate non-confidential level.

Funding Progress must not imply a direct transfer to the Farmer or treat a blockchain
transaction as sufficient proof of Project Funding.

#### Project Timeline

- approval;
- Investor Funding;
- Farmer disbursement and confirmation;
- Production Cycle milestones;
- report deadlines and accepted updates;
- Settlement milestones;
- Project completion.

#### Farmer Reports

- reports approved by AgriPartners for Investor disclosure;
- report period, submission date, review status, and published date;
- approved photos, videos, summaries, and evidence;
- distinction between Farmer-reported and AgriPartners-verified information;
- correction or supersession history where relevant.

The Investor must not see unreviewed submissions, unnecessary personal data, bank information,
confidential metadata, or the complete Farmer Agreement by default.

#### Financial Summary

- invested amount and currency;
- approved Project budget summary;
- projected return and assumptions;
- recorded and verified financial events;
- fees and deductions disclosed under the Investor Agreement;
- current Settlement status.

#### ROI Progress

- projected ROI clearly labeled as projected and not guaranteed;
- current approved estimate, when one exists;
- actual or realized ROI only after authoritative calculation and reconciliation;
- explanation of variance from the approved plan;
- no false progress derived only from elapsed time or unverified reports.

#### Settlement / Returns

- Settlement calculation status;
- approved principal, profit/loss, fee, and payment components;
- payment status using Recorded, Approved, Paid, and Reconciled language;
- payment date and approved evidence reference;
- final Settlement statement when available;
- remaining conditions or blockers.

#### Documents / Investment Summary

- Investor Agreement and acknowledgments applicable to that Investor;
- approved Project summary;
- risk and fee disclosures;
- Investment Model summary;
- approved Project updates;
- Settlement statement;
- approved redacted Farmer Agreement or verification certificate only when disclosure is
  authorized.

## 4. Farmer View

### 4.1 Purpose and language boundary

The Farmer Workspace is an operational tool titled **My Project**. It helps the Farmer understand
what AgriPartners requires, confirm fiat receipt, perform Production Cycles, submit Project
Reports, respond to review feedback, and complete the Project.

The screen must consistently show:

```text
Project Operator: AgriPartners
```

The Farmer view must not expose or require:

- cryptocurrency or token terminology;
- NEAR, Testnet, blockchain, smart contract, gas, transaction hash, or wallet language;
- Investor wallet or payment infrastructure;
- direct Investor contact or instruction controls;
- Investor-specific confidential or financial information not required by the Farmer Agreement.

All Farmer money amounts and payment actions use the approved fiat currency.

### 4.2 Information architecture

#### My Project

- Project title and reference;
- Investment Model operating summary;
- Project-specific scope, location, duration, and approved budget;
- current Project Status;
- AgriPartners contact and support route;
- next required Farmer action.

#### Funding Confirmation

- approved fiat amount;
- AgriPartners payment reference;
- payment date and status;
- action to confirm receipt;
- action to report a missing, incorrect, or unmatched payment;
- confirmation timestamp and history.

Confirmation means the Farmer confirms receipt through the approved AgriPartners process. It
does not independently establish accounting reconciliation or Project Funding authority.

#### Production Cycles

- current and planned cycle number;
- planned and actual dates;
- operating objectives and allowed use of funds;
- milestones and evidence requirements;
- report deadline;
- current cycle state;
- AgriPartners feedback, hold, or exception notice.

#### Submit Reports

- structured report form for the active cycle;
- required progress, use-of-funds, quantity, quality, cost, issue, and forecast fields;
- evidence upload or approved evidence reference;
- declaration that submitted information is accurate;
- save-draft, submit, and correction workflow;
- clear status: Draft, Submitted, Under Review, Accepted, Changes Required, Rejected, or
  Escalated.

#### Report History

- all Farmer submissions for the Project;
- submission and review timestamps;
- AgriPartners feedback;
- accepted version;
- corrections and superseded versions;
- next report due date.

#### Project Completion

- final operational checklist;
- outstanding reports, evidence, returns, obligations, and issues;
- Farmer fiat return or payment instructions supplied by AgriPartners;
- completion confirmation;
- final Farmer statement or acknowledgment;
- support route for a dispute or correction.

The Farmer view may show that Settlement is being handled by AgriPartners, but it must not expose
Investor payout details or crypto-oriented infrastructure.

## 5. Admin View

### 5.1 Purpose

The Admin Workspace is titled **Manage Project**. Admin acts as the authorized AgriPartners
Project Operator, not as a neutral marketplace administrator and not as a proxy for direct
Investor-to-Farmer interaction.

The Admin view is the control surface for Project preparation, approvals, assignments,
operations, disclosure, financial tracking, exceptions, Settlement, and closeout.

### 5.2 Information architecture

#### Manage Project

- Project identity, status, owner, and current control gate;
- next required action, owner, and deadline;
- unresolved blocker, exception, incident, or complaint count;
- authorized lifecycle transitions with confirmation and reason capture;
- complete participant-safe and internal activity history.

#### Investment Model

- selected model and approved version;
- Project adaptation;
- Project amount, currency, economics, duration, risks, and cycles;
- approval and effective dates;
- controlled change history.

#### Farmer Assignment

- assigned Farmer reference and eligibility status;
- Farmer Agreement status;
- conditions precedent;
- verified fiat payment details status without exposing them outside authorized Admin access;
- onboarding, training, support, and backup contacts.

Investor assignment should also be available to authorized Admin users, but it remains a
separate AgriPartners relationship and must not create a direct Farmer relationship.

#### Funding Status

- Investor Funding expected, received, and reconciled;
- Farmer disbursement approval, initiation, payment, and confirmation;
- amount, currency, provider evidence, accounting reference, and variance;
- segregation of initiation, approval, and reconciliation duties where required;
- exception handling for late, duplicate, excess, wrong-currency, returned, or unmatched funds.

#### Cycle Management

- create or activate approved Production Cycles;
- assign dates, requirements, owners, and report deadlines;
- monitor current cycle;
- record holds, delays, incidents, and exceptions;
- close a cycle only after required reports and evidence pass.

#### Report Review

- review submitted report and evidence;
- classify it as Under Review, Accepted, Changes Required, Rejected, or Escalated;
- request correction with an owner and due date;
- redact or remove restricted information;
- publish an approved Investor-facing version;
- preserve review and version history.

#### Settlement Tracking

- collect approved Settlement inputs;
- record Farmer fiat return and reconciliation;
- prepare and independently review the Settlement calculation;
- record approval, Investor payment, and reconciliation;
- generate role-appropriate statements;
- block completion while required financial evidence or approvals are unresolved.

#### Project Completion

- verify all cycles, reports, payments, exceptions, obligations, access rights, and documents;
- record final Investor and Farmer communications;
- capture closeout evidence and approvals;
- mark Completed only after the closeout gate passes;
- preserve an immutable completion summary and activity history.

## 6. Permissions

### 6.1 Permission principles

Permissions combine role, Project assignment, lifecycle stage, information classification, and
specific action authority. A role name alone is not sufficient authorization.

Legend:

- **R** — read approved information;
- **C** — create or submit;
- **U** — update own draft or perform an authorized operational action;
- **A** — review, approve, publish, reconcile, or transition on behalf of AgriPartners;
- **—** — no routine access.

| Workspace capability | Investor | Farmer | Admin / AgriPartners Operator |
| --- | --- | --- | --- |
| Read shared Project identity and approved status | R | R | R/A |
| Read Investment Model | R, approved investment view | R, operating view | R/A, full controlled version |
| Edit Project structure or adaptation | — | — | U/A |
| Read Project timeline | R, approved milestones | R, Farmer milestones | R/U/A |
| Assign Investor or Farmer | — | — | U/A |
| Read Investor Funding status | R, own Project | Limited to disbursement context | R/U/A |
| Read Farmer fiat disbursement | R, approved summary | R, own payment | R/U/A |
| Confirm Farmer Funding receipt | — | C/U, own confirmation | R/A, verify and resolve |
| Create or activate Production Cycle | — | — | C/U/A |
| Read Production Cycle progress | R, approved view | R, own Project | R/U/A |
| Submit Project Report | — | C/U, own draft/submission | C/U only for documented operator correction or manual fallback |
| Review or approve Farmer Report | — | Read feedback/status | A |
| Publish report to Investor | — | — | A |
| Read Farmer Reports | R, published versions only | R, own submissions and feedback | R/A, complete authorized record |
| Read financial summary | R, Investor view | R, Farmer operating/fiat view | R/A, authorized control detail |
| Change authoritative financial status | — | — | A, subject to segregation of duties |
| Read Settlement | R, own Settlement | R, own obligations/status | R/U/A |
| Approve or reconcile Settlement | — | — | A, subject to control policy |
| Read documents | R, Investor package | R, Farmer package | R/A, according to Admin authority |
| Upload or acknowledge documents | C/U, own required records | C/U, own required records | C/U/A |
| Read complete Farmer Agreement | — by default | R, as party | R, authorized Admin only |
| Read internal risk, compliance, identity, or banking records | — | — except own required submissions | R/A, need-to-know only |
| Read participant-safe Activity History | R | R | R |
| Read full internal audit history | — | — | R/A |
| Transition Project lifecycle | — | Only explicit Farmer actions | A |
| Mark Project Completed | — | — | A, only after closeout gate |

### 6.2 Disclosure and action controls

- Investor access is limited to the Investor's assigned Project and approved disclosures.
- Farmer access is limited to the Farmer's assigned Project, own submissions, required
  operational information, and AgriPartners communications.
- Admin access must follow least privilege; sensitive finance, compliance, identity, and banking
  permissions may require narrower sub-roles.
- A Farmer Report is not Investor-visible merely because it was submitted.
- The complete Farmer Agreement, identity documents, banking information, internal risk
  assessment, compliance documents, and internal financial analysis are not routinely shared.
- Every material write records actor, role, timestamp, prior value or state, new value or state,
  reason, and evidence reference.
- Financial approval, payment, and reconciliation must support segregation of duties even if
  Pilot 1.0 uses a small authorized operating team.

## 7. Pilot 1.0 Minimum Version

Pilot 1.0 needs one complete, reliable Project lifecycle. It does not need a generalized
multi-Project platform or full automation.

### P0 — Required

- One shared Project Workspace identity used by Investor, Farmer, and Admin views.
- Role-based access restricted to the single assigned Project.
- Shared header with Investment Model, Project reference, Project Status, Project Operator,
  next milestone, and last update.
- Project Summary and approved Project-specific terms.
- One authoritative Project Status with controlled Admin transitions.
- Timeline covering Funding, Farmer Confirmation, Production Cycles, Reports, Settlement, and
  Completed.
- Clear separation of Investor Funding, Farmer fiat disbursement, and Farmer Confirmation.
- Farmer workflow with no wallet, crypto, blockchain, smart contract, token, or transaction-hash
  language or action.
- Explicit Production Cycle records with status, dates, report deadline, and current owner.
- Farmer report draft/submission, Admin review, correction, approval, and controlled Investor
  publication.
- Role-appropriate report history.
- Investor Financial Summary, projected ROI labeling, and Settlement / Returns states.
- Admin Settlement tracking for calculation, approval, payment, reconciliation, and evidence.
- Documents section with role-based disclosure and acknowledgment status.
- Participant-safe Activity History and complete Admin audit history.
- Completion gate that cannot pass before required reports, financial reconciliation,
  obligations, exceptions, and closeout evidence are resolved.
- Clear loading, empty, unavailable, access-denied, validation, and stale-data states.
- Participant-visible distinction among Projected, Reported, Approved, Paid, Reconciled, and
  Completed.

### P1 — Important

- Dashboard deep links to the relevant Workspace section and current required action.
- Due-date reminders and overdue indicators.
- Report evidence preview, redaction workflow, and version comparison.
- Document version, effective date, signature/acknowledgment, and expiry indicators.
- Structured exception, incident, complaint, and support panels.
- Exportable Project timeline, report history, financial summary, and Settlement statement.
- Admin task ownership, backup owner, and escalation deadline.
- Investor update publication history.
- Responsive layouts and accessibility review for all three role views.

### P2 — Future

- Multiple Investors, Farmers, or live Projects.
- Configurable role and permission administration beyond the Pilot team.
- Advanced analytics and cross-Project comparison.
- Automated reminders, escalations, and document generation.
- Provider integrations and automated payment reconciliation.
- Optional privacy-safe NEAR event references shown as supplementary infrastructure.
- Localization beyond the languages approved for Pilot 1.0.
- Production-scale workflow configuration, delegation, and bulk operations.

P2 items must not weaken the Pilot 1.0 Farmer fiat-only boundary, disclosure controls, or
AgriPartners counterparty model.

## 8. UI Wireframe Text

The wireframes define hierarchy and content, not final visual styling.

### 8.1 Investor Project Workspace

```text
+--------------------------------------------------------------------------------+
| PROJECT: Hissar Sheep Pilot                         Status: IN PRODUCTION       |
| Investment Model: Hissar Sheep v1.0                Project Ref: AP-P1-001      |
| Project Operator: AgriPartners                     Last verified: 03 Jul 2026 |
| Next milestone: Cycle 1 report due 15 Jul 2026                                |
+--------------------------------------------------------------------------------+
| [Overview] [Timeline] [Farmer Reports] [Financials] [Documents] [Settlement]   |
+--------------------------------------------------------------------------------+
| PROJECT SUMMARY                     | PROJECT STATUS                            |
| Approved scope, duration, currency  | Current milestone and approved update    |
| Project-specific model adaptation  | Attention notice / next expected event   |
+-------------------------------------+------------------------------------------+
| FUNDING PROGRESS                                                               |
| Commitment | Received by AgriPartners | Reconciled | Farmer disbursement status |
+--------------------------------------------------------------------------------+
| PROJECT TIMELINE                                                               |
| Approved -> Funded -> Farmer Confirmed -> Cycle 1 -> Reports -> Settlement     |
+--------------------------------------------------------------------------------+
| FARMER REPORTS                                                                 |
| Cycle 1 | Published by AgriPartners | Verified status | [Open approved report] |
+--------------------------------------------------------------------------------+
| FINANCIAL SUMMARY / ROI PROGRESS                                                |
| Invested | Projected return (not guaranteed) | Approved actuals | Variance      |
+--------------------------------------------------------------------------------+
| SETTLEMENT / RETURNS                                                           |
| Calculation status | Approved amount | Paid status | Reconciliation | Statement |
+--------------------------------------------------------------------------------+
| DOCUMENTS / INVESTMENT SUMMARY                                                  |
| Agreement | Risk disclosure | Model summary | Updates | Settlement statement   |
+--------------------------------------------------------------------------------+
```

### 8.2 Farmer Project Workspace

```text
+--------------------------------------------------------------------------------+
| MY PROJECT: Hissar Sheep Pilot                     Status: IN PRODUCTION       |
| Project Operator: AgriPartners                     Project Ref: AP-P1-001      |
| Support: [Contact AgriPartners]                    Next action: Submit report |
+--------------------------------------------------------------------------------+
| [Overview] [Funding Confirmation] [Production Cycles] [Reports] [Completion]   |
+--------------------------------------------------------------------------------+
| PROJECT SUMMARY                                                               |
| Operating scope | Approved fiat budget | Duration | Current milestone          |
+--------------------------------------------------------------------------------+
| FUNDING CONFIRMATION                                                           |
| Fiat amount: USD 1,000 | Payment status: Sent | [Confirm receipt] [Report issue]|
+--------------------------------------------------------------------------------+
| PRODUCTION CYCLES                                                              |
| Cycle 1: Active | Dates | Objectives | Evidence required | Report due date      |
| Cycle 2: Planned                                                              |
+--------------------------------------------------------------------------------+
| SUBMIT PROJECT REPORT                                                         |
| Progress | Use of funds | Results | Issues | Forecast | Evidence               |
| [Save draft] [Submit to AgriPartners]                                          |
+--------------------------------------------------------------------------------+
| REPORT HISTORY                                                                 |
| Draft / Submitted / Under Review / Accepted / Changes Required                 |
+--------------------------------------------------------------------------------+
| PROJECT COMPLETION                                                             |
| Outstanding actions | Final report | Fiat obligations | Completion confirmation |
+--------------------------------------------------------------------------------+
```

No Farmer screen contains crypto, wallet, blockchain, smart contract, NEAR, Testnet, gas, token,
or transaction-hash terminology.

### 8.3 Admin Project Workspace

```text
+--------------------------------------------------------------------------------+
| MANAGE PROJECT: Hissar Sheep Pilot                 Status: REPORTING           |
| Investment Model: Hissar Sheep v1.0               Project Ref: AP-P1-001      |
| Operator: AgriPartners | Owner: Pilot Manager     Next gate: Accept report    |
| Blockers: 1 | Exceptions: 0 | Overdue actions: 0                              |
+--------------------------------------------------------------------------------+
| [Control] [Participants] [Funding] [Cycles] [Reports] [Finance] [Documents]    |
| [Settlement] [Activity]                                                        |
+--------------------------------------------------------------------------------+
| PROJECT CONTROL                                                               |
| Current state | Allowed transition | Reason/evidence | Owner | Due date         |
| [Advance status] [Suspend] [Record exception]                                  |
+--------------------------------------------------------------------------------+
| INVESTMENT MODEL / PROJECT ADAPTATION                                          |
| Version | Amount | Currency | Duration | Risks | Approval history              |
+--------------------------------------------------------------------------------+
| FARMER ASSIGNMENT / PARTICIPANTS                                               |
| Farmer readiness | Agreement | Conditions precedent | Investor assignment      |
+--------------------------------------------------------------------------------+
| FUNDING STATUS                                                                 |
| Investor receipt/reconciliation | Farmer fiat disbursement/confirmation        |
+--------------------------------------------------------------------------------+
| CYCLE MANAGEMENT                                                               |
| Cycle | Status | Dates | Report due | Owner | Hold/close actions               |
+--------------------------------------------------------------------------------+
| REPORT REVIEW                                                                  |
| Submission | Evidence | Review notes | [Request changes] [Accept] [Publish]    |
+--------------------------------------------------------------------------------+
| SETTLEMENT TRACKING                                                           |
| Farmer return | Calculation | Review | Investor payment | Reconciliation        |
+--------------------------------------------------------------------------------+
| PROJECT COMPLETION GATE                                                       |
| Cycles | Reports | Finance | Exceptions | Documents | Communications | Closeout |
| [Mark Completed] disabled until all required controls pass                     |
+--------------------------------------------------------------------------------+
| FULL ACTIVITY HISTORY                                                          |
| Timestamp | Actor | Action | Previous/New state | Reason | Evidence reference   |
+--------------------------------------------------------------------------------+
```

## 9. Implementation Guidance

This plan defines the target user experience and does not authorize application changes.

During the controlled migration, backend routes, service names, database tables, database
columns, API fields, tests, and compatibility interfaces may continue to use historical Deal
terminology, including identifiers such as:

- `deals`;
- `deal_id`;
- `/api/deals`;
- `/api/investor/deals`;
- `/api/farmer/deals`;
- legacy hash routes containing `deals`.

The frontend should translate those internal compatibility terms into **Project** terminology
for users. Internal names must not leak into headings, labels, help text, validation messages,
empty states, confirmation dialogs, reports, exports, or participant-facing error messages.

Implementation should:

1. establish one role-independent Project Workspace information model;
2. define a shared section contract and role-specific disclosure rules before building screens;
3. retain existing route and API compatibility until a separately approved backend migration;
4. avoid global search-and-replace changes to internal Deal identifiers;
5. treat Project status as an authoritative business state, not a renamed contract state;
6. keep Farmer access and workflows independent from wallets and blockchain;
7. use AgriPartners-mediated language for all Investor/Farmer relationships;
8. label optional NEAR information as supplementary infrastructure and never as financial or
   completion authority;
9. preserve audit history, access controls, disclosure review, and evidence references for every
   material action;
10. add role-based UX and authorization tests for shared facts, restricted fields, Farmer
    language, report publication, Settlement states, and completion gates.

The safest delivery order is:

```text
Shared Project information model
        |
        v
Permissions and disclosure contract
        |
        v
Shared Workspace shell and status language
        |
        v
Admin control view
        |
        v
Farmer operating view
        |
        v
Investor monitoring view
        |
        v
Cross-role consistency and authorization tests
```

## 10. Out of Scope

The following are outside Sprint 2 and Pilot 1.0 Workspace design:

- **Marketplace** — no public Marketplace, unrestricted self-service investment, or market
  transaction workflow. The pre-Marketplace Opportunity Catalog is a separate discovery
  surface.
- **Protection Reserve** — no reserve activation, reserve funding, protection claim, or
  protected-return representation.
- **Smart Contract v2** — no contract redesign, upgrade, Mainnet migration, or on-chain
  lifecycle authority.
- **Full legal document automation** — no automated legal drafting, legal approval, negotiation,
  redaction decision, electronic-signature orchestration, or jurisdictional rules engine.

Also out of scope are direct Investor-to-Farmer messaging or payments, Farmer crypto access,
multi-Project portfolio design, multiple participants per role, institutional workflows,
production payment automation, and replacing legal, accounting, compliance, or provider records
with a platform or blockchain status.

## Design Acceptance Criteria

This plan is ready to guide implementation planning when:

- all three role views use one shared Project identity and lifecycle;
- every shared section has a defined role-specific disclosure treatment;
- the permissions matrix has no direct Investor-to-Farmer action path;
- the Farmer view contains no crypto-oriented language or dependency;
- Investor reporting flows through AgriPartners review and publication;
- Admin is clearly represented as the AgriPartners Project Operator;
- P0 covers one complete Project through reconciled Settlement and closeout;
- internal Deal compatibility is explicitly separated from user-facing Project terminology;
- Marketplace, Protection Reserve, Smart Contract v2, and full legal document automation remain
  outside scope.

## Related Documents

- [Business Architecture v1.0 Freeze](../business/BUSINESS_ARCHITECTURE_V1_FREEZE.md)
- [Information Disclosure Policy](../business/INFORMATION_DISCLOSURE_POLICY.md)
- [Project Lifecycle Refactoring Plan](PROJECT_LIFECYCLE_REFACTORING_PLAN.md)
- [Pilot 1.0 Implementation Roadmap](PILOT_1_IMPLEMENTATION_ROADMAP.md)
- [Pilot 1.0 Plan](pilot/PILOT_1_PLAN.md)
- [Pilot Readiness Checklist](pilot/PILOT_READINESS_CHECKLIST.md)
- [Pilot Operations Guide](pilot/PILOT_OPERATIONS_GUIDE.md)
