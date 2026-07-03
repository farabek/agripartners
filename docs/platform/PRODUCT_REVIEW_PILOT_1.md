# Sprint 2A: Product Review and Pilot 1.0 P0 Backlog

Status: Product review and implementation-priority recommendation

Review date: 2026-07-03

Architecture baseline: Business Architecture v1.0, frozen 2026-07-02

Pilot scope: one approved Investor, one approved Farmer, one AgriPartners-operated Project

## 1. Review Purpose and Method

This review evaluates the current AgriPartners product as it would be experienced by real Pilot
users. It is not a code audit, architecture review, security review, or launch authorization.
Business Architecture v1.0 is treated as fixed.

The review covers:

- the current public, authenticated, demo, and live product journeys;
- current user-facing labels, actions, empty states, errors, and navigation;
- the current working-tree Project Workspace Header implementation;
- the existing Investor, Farmer, and Admin screenshot sets;
- comparison with [Project Workspace UX Plan](PROJECT_WORKSPACE_UX_PLAN.md);
- work required for one complete Pilot 1.0 lifecycle.

The interactive browser could not be used because the local browser-control environment was
unavailable. Findings were therefore cross-checked against current rendered UI definitions,
routes, tests, product documentation, and screenshots. Older screenshots are used as evidence of
the established experience, not as proof that every pixel matches the current working tree.

## 2. Executive Product Assessment

AgriPartners currently explains its Alpha concept better than it supports a real Pilot
operation. A first-time reviewer can understand that the platform connects agricultural
Projects, Farmers, Investors, reports, projected returns, and NEAR-based infrastructure.
The public demos and financial examples make the concept tangible.

Pilot 1.0, however, requires a single controlled operational path. The current experience still
mixes three product generations:

1. public Alpha presentation and Investment Model demonstrations;
2. legacy Deal and NEAR Testnet workflows;
3. the target AgriPartners-operated Project lifecycle.

This mixture creates the central product risk. Users can see many relevant screens, but they
cannot yet rely on one Project identity, one authoritative status, one next action, and one
controlled path from Funding through Completion.

### Overall conclusion

| Question | Assessment |
| --- | --- |
| Can the product demonstrate the AgriPartners concept? | Yes |
| Can an Investor understand the broad proposition? | Yes, with material ambiguity around Pilot versus demo and projected versus payable values |
| Can a Farmer complete the Pilot without understanding blockchain? | No |
| Can Admin monitor Alpha records? | Yes |
| Can AgriPartners safely operate one complete real Pilot in-product? | No |
| Is Pilot 1.0 launch-ready? | No |

The P0 effort should not be a visual redesign. It should turn the existing screens into one
role-specific, evidence-based Project workflow and remove legacy infrastructure actions from the
participant experience.

## 3. Investor Journey Review

### 3.1 Landing

#### What works

- The landing experience explains agriculture, Investment Models, Project progress, reports,
  returns, and AgriPartners' use of NEAR.
- Public demos let a first-time visitor explore without registration.
- The Opportunity Catalog explicitly says it is an Alpha catalog rather than a live transaction
  venue.
- Projected-return disclaimers are visible on key Investor screens.
- Investor, Farmer, and Admin demos help reviewers understand the intended multi-role product.

#### What a first-time Investor would understand

A first-time Investor would understand that:

- AgriPartners organizes agricultural Projects;
- Projects are based on Investment Models;
- an Investor can review Project economics, funding progress, reports, and returns;
- AgriPartners uses NEAR infrastructure;
- the current product is an Alpha or Pilot demonstration.

#### What is confusing

- Public Project cards, Opportunity Catalog filters, protection schedules, financial PDFs, and
  demo Projects look close to an investable marketplace even though Pilot 1.0 is not a public
  marketplace.
- "Protection reserve" is prominent despite being outside Pilot 1.0 and not active protection.
- The public experience presents two demonstration Projects while Pilot 1.0 is defined as one
  selected Project.
- Alpha, demo, Pilot Project, live Project, Investment Model, and legacy Deal concepts remain
  visible in adjacent journeys.
- Strong ROI and return figures appear before the user reaches the full explanation of which
  values are projected, recorded, paid, or reconciled.

### 3.2 Authentication

#### What works

- Public demos do not require authentication.
- The login page explains that platform accounts are issued by an Admin.
- Login errors and unavailable-server states are explicit.
- Wallet and username/password access are visually separated.

#### What is confusing

- NEAR Wallet is the dominant first option and introduces Testnet, wallet creation, wallet
  import, and infrastructure language before the Investor understands the approved Pilot access
  method.
- A Pilot Investor cannot tell whether to use a wallet or wait for an AgriPartners-provided
  account.
- The onboarding journey is wallet-oriented and does not present the actual Pilot readiness
  steps: identity checks, agreement, disclosures, payment instructions, and support.
- Authentication confirms technical identity but does not tell the Investor whether the account
  is eligible, approved, assigned to the Pilot, or ready to fund.

### 3.3 Investor Dashboard and Portfolio

#### What works

- Active and completed Projects are separated.
- Portfolio metrics distinguish projected and recorded values more carefully than earlier demo
  screens.
- Empty, unavailable, attention, and resource-error states exist.
- Project cards provide a direct route into Project detail.

#### What is confusing

- Wallet/session context can dominate the business purpose of the dashboard.
- Portfolio Summary, Portfolio Performance, Recent Activity, Reporting Information, and
  Attention Required can appear even when the authoritative inputs are unavailable.
- The dashboard does not lead with the Investor's next decision or the next verified Project
  milestone.
- Demonstration portfolio totals and live Investor-assigned Projects are separate experiences,
  but the navigation does not make that boundary unmistakable.
- A first-time Investor has no clear document checklist for agreement, risk acknowledgment,
  payment instructions, updates, and final statement.

### 3.4 Investor Project Pages

#### What works

- The shared Project Workspace Header now provides Project name, Investment Model, Project
  Status, AgriPartners as Project Operator, and the six-stage timeline.
- Project detail already contains funding, reports, cycles, financial summaries, return records,
  event history, and unavailable states.
- Projected returns are labeled as estimates and not guaranteed.
- Recorded return states are not automatically described as realized performance.

#### What is confusing

- The page remains long and combines business information with NEAR Testnet infrastructure.
- "Run Testnet Settlement Action", technical balances, withdrawal concepts, transaction
  references, and technical sections compete with the real Settlement story.
- The visible status can still originate from a legacy contract or Deal state rather than one
  authoritative Project state.
- The timeline is a useful orientation component, but its current stage is inferred from
  available legacy data and is not yet a controlled business record.
- There is no stable user-facing Project reference, planned dates, next milestone, last verified
  update, or source/verification state in the header.

### 3.5 Reports

#### What works

- Investor Project pages can show Farmer report summaries and report evidence links.
- Empty and unavailable report states are distinguished.

#### What is confusing

- The Investor cannot reliably tell whether a report is Farmer-reported, under review, accepted
  by AgriPartners, or approved for Investor publication.
- Review date, publisher, correction history, superseded versions, and disclosure status are
  missing.
- Report visibility is not yet clearly separated from internal Farmer/Admin report content.

### 3.6 Returns

#### What works

- The product distinguishes recorded, approved, paid, and reconciled return-entry states in
  parts of the Admin and Investor experience.
- The Investor sees projected-return disclaimers and an explicit ledger empty state.

#### What is confusing

- Return rows are not a complete Project Settlement.
- There is no Investor-facing Settlement calculation, component breakdown, approval state,
  payment evidence state, reconciliation result, final statement, or blocker list.
- Testnet withdrawal language can be mistaken for a production payment action.
- A "recorded return" may still look like money received unless every surface repeats the state
  definition consistently.

### 3.7 Investor Pilot blockers

The Investor journey blocks Pilot 1.0 because it lacks:

- one approved Pilot entry and onboarding path;
- one authoritative Project state and verified timeline;
- approved Investor-only reports;
- agreement, disclosure, acknowledgment, and payment-instruction documents;
- a production-appropriate Settlement view;
- a clean separation between supplementary NEAR information and authoritative business records.

## 4. Farmer Journey Review

### 4.1 Login

#### What works

- The login page states that Farmers use AgriPartners-managed onboarding and future fiat
  workflows.
- Admin-provided username/password accounts are supported.
- Authentication failures are visible.

#### What is confusing

- The same page prominently offers NEAR Wallet login, Testnet wallet creation, and wallet import.
- The Farmer is not given a dedicated instruction such as "Use the account provided by
  AgriPartners."
- Existing screens and screenshots use wallet or secure-account references as identity.

### 4.2 Farmer Dashboard and My Projects

#### What works

- The dashboard shows assigned Projects, Funding Confirmation, Production Cycle, report status,
  Project Operator, and a next-action line.
- The empty state explains that AgriPartners must assign a Project.
- Active Project cards provide a direct "Open Project" action.

#### What is confusing

- The authenticated navigation exposes Investor Portal and Opportunity Catalog to the Farmer.
- The Farmer can encounter projected Investor ROI, protection schedules, wallet references, and
  cross-role demo links that are not needed to perform farm work.
- "Review submitted report and cycle status" is presented as a Farmer next action even though
  AgriPartners should review the submission.
- The dashboard does not provide a persistent support contact, due date, overdue state, or
  escalation action.

### 4.3 Funding Confirmation

#### What works

- Funding confirmation exists as a visible concept.
- Cycle data can show whether Funding was sent and confirmed.

#### What is missing or confusing

- The Farmer does not receive a complete fiat payment record with approved amount, currency,
  AgriPartners payment reference, payment date, status, and confirmation history.
- There is no clear action to report a missing, incorrect, duplicate, or unmatched payment.
- Funding received by AgriPartners, Farmer fiat disbursement, Farmer confirmation, and accounting
  reconciliation are not consistently separated.

### 4.4 Production Cycles

#### What works

- Current cycle, funding state, report state, timeline, and history are visible.
- The Farmer can see when a report is due and when one has been submitted.

#### What is missing

- Planned and actual dates;
- cycle objectives and permitted use of funds;
- evidence requirements;
- report deadline and overdue state;
- AgriPartners owner and support contact;
- hold, delay, incident, and exception notices;
- a controlled cycle-completion action and completion criteria.

### 4.5 Reports

#### What works

- The Farmer can submit a report for an eligible cycle.
- Submitted reports and a basic report history can be displayed.
- Empty and unavailable states are explicit.

#### What is missing

- save draft;
- structured required fields;
- evidence upload or controlled evidence reference;
- submission declaration;
- Under Review, Changes Required, Accepted, Rejected, and Escalated states;
- AgriPartners feedback and correction workflow;
- version and supersession history;
- explicit next report deadline.

### 4.6 Project Completion

There is no complete Farmer closeout experience. The Farmer cannot see a final checklist,
outstanding obligations, required final report, fiat return instructions, issue/dispute route,
completion acknowledgment, or final statement.

### 4.7 Can the Farmer complete the workflow without blockchain knowledge?

No. The product copy intends a fiat-only Farmer boundary, but the current experience still
contains or leads to:

- NEAR Wallet and Testnet access;
- wallet or account references;
- technical balances;
- Alpha demo payout or withdrawal actions;
- public protection and Investor-oriented financial content;
- cross-role navigation.

### 4.8 Is every required Farmer action obvious?

No. The dashboard has a useful next-action line, but it is not backed by a complete task model,
deadline, owner, status, or escalation route. Funding exceptions, report corrections, cycle
completion, final obligations, and Project closeout are not actionable end to end.

## 5. Admin Journey Review

### 5.1 Project Creation and Assignment

#### What works

- Admin can create participant accounts.
- Existing Farmer and Investor profiles can be selected during Project creation.
- Project creation has success and error handling.
- Live Admin lists and Project detail screens exist.

#### What is missing or confusing

- Project creation still reflects legacy Deal parameters and contract deployment assumptions.
- Admin cannot select a controlled approved Investment Model version and record a Project-specific
  adaptation.
- Creation and approval are not separate controlled steps.
- Farmer eligibility, agreement status, conditions precedent, payment-detail verification,
  training, and support readiness are not part of assignment.
- There is no clear draft-to-approved Project preparation checklist.

### 5.2 Project Monitoring

#### What works

- Admin can see Project lists, statuses, balances, cycles, reports, return summaries, return
  entries, and event history.
- Optional resource failures do not collapse the whole Project screen.
- Treasury and participant-account screens exist.

#### What is missing or confusing

- Admin Portal, Manage Projects, Dashboard, Treasury, and demo Admin pages form several adjacent
  operating surfaces without one task queue.
- Admin lacks a single view of next action, owner, deadline, blockers, exceptions, incidents,
  complaints, and overdue items.
- Status transitions are based on legacy lifecycle actions rather than the approved Project
  control gates.
- Technical balances and contract actions are visually close to authoritative operational and
  financial records.

### 5.3 Reports

Admin can see report-related information and can invoke legacy cycle reporting actions, but
cannot operate the required review workflow:

- receive and inspect a Farmer submission;
- mark it Under Review;
- request changes with an owner and deadline;
- accept or reject it with a reason;
- redact restricted information;
- publish a controlled Investor version;
- preserve versions and review history.

### 5.4 Settlement

Return-entry status transitions provide a useful prototype for recorded, approved, paid, and
reconciled states. They are not sufficient to operate Settlement because the product lacks:

- a single Project Settlement record;
- approved calculation inputs and component breakdown;
- independent review and approval;
- Farmer fiat-return reconciliation;
- Investor payment instruction and evidence;
- accounting/provider reconciliation;
- variance and blocker handling;
- Investor and Farmer statements.

### 5.5 Completion

The current product can display a Completed status, but it does not enforce a Pilot closeout
gate covering cycles, reports, money movements, reconciliation, documents, exceptions,
complaints, communications, access, and final approvals.

### 5.6 Can AgriPartners realistically operate one Pilot Project?

Not fully in-product. AgriPartners could demonstrate and manually monitor parts of one Project,
but real operation would depend on parallel spreadsheets, files, messaging, banking records, and
manual judgment. That would leave the platform status incomplete or potentially contradictory.

The Pilot becomes operable when the product can answer, for every gate:

- what must happen next;
- who owns it;
- when it is due;
- what evidence is required;
- who reviews or approves it;
- what blocks progress;
- what each participant is allowed to see.

## 6. Navigation Review

### 6.1 Duplicate or overlapping pages

| Current surfaces | Product issue | Pilot treatment |
| --- | --- | --- |
| Admin Portal, Manage Projects, Admin Dashboard, demo Admin | Multiple entry points for the same operator | Use one authenticated Admin home and one Project Workspace; keep demo routes explicitly outside Pilot navigation |
| Opportunity Catalog and Investor portfolio Project lists | Discovery and owned-Project management look similar | Keep the public catalog outside the authenticated Pilot path |
| Public Investor, Farmer, and Admin Project demos | Useful for presentation but easy to confuse with live records | Add an unmistakable persistent Demo banner and separate demo navigation |
| Project Profile blocks plus shared Project Workspace Header | Repeated identity, status, and model information | Keep one shared header and reduce duplicate identity fields in later UI cleanup |
| Event History, cycle timeline, status history, Recent Activity | Several partial histories | Define one role-filtered Project Activity model and link specialist histories from it |

### 6.2 Obsolete or risky terminology

| Terminology | Issue |
| --- | --- |
| Deal | Legacy implementation term; the product concept is Project |
| Marketplace | Pilot 1.0 has no public live marketplace |
| Protection reserve | Outside Pilot 1.0 and may imply active principal protection |
| Escrow | Must not be used without an approved legal arrangement |
| Wallet, Testnet, NEAR balance, withdraw | Not appropriate in the Farmer workflow and not authoritative financial language |
| Return recorded | Must not be interpreted as received, paid, reconciled, or realized |
| Completed | Must not be shown as authoritative before the closeout gate passes |

### 6.3 Dead ends and weak handoffs

- Login does not route each Pilot role through a role-specific readiness or onboarding checklist.
- Public Project exploration does not clearly hand an approved Investor to the Pilot onboarding
  process.
- Farmer payment problems have no dedicated report-issue path.
- Submitted Farmer reports do not lead into a complete Admin review and correction workflow.
- Approved reports do not lead into controlled Investor publication.
- Return records do not lead into a complete Settlement statement.
- Completed technical or demo states do not lead into participant closeout and acknowledgment.
- Unknown or obsolete routes do not have a dedicated not-found experience.

### 6.4 Navigation conclusion

Navigation is broad enough for an Alpha showcase but too permissive and cross-role for a real
Pilot. Authenticated navigation should be task-oriented and role-specific:

- Investor: Portfolio, My Project, Reports, Documents, Settlement, Support;
- Farmer: My Project, Funding Confirmation, Production Cycles, Reports, Completion, Support;
- Admin: Operator Home, Manage Project, Tasks, Participants, Treasury, Documents, Audit.

## 7. Project Workspace P0 Gap Review

The current shared header is a useful Sprint 2.1 foundation. It is present across live and demo
Admin, Farmer, and Investor Project details and displays Project name, Investment Model, status,
operator, and the six requested stages.

It is not yet the complete Project Workspace defined by the UX plan.

| UX Plan P0 element | Current product assessment | Gap |
| --- | --- | --- |
| One shared Project identity | Partial | UI adapts legacy Deal data; no stable participant-facing Project reference shared authoritatively across roles |
| Role access restricted to assigned Project | Partial | Live Investor/Farmer endpoints are scoped, but navigation remains cross-role and demo/live boundaries are porous |
| Shared header | Partial | Name, model, status, operator, and stage labels exist; reference, dates, next milestone, last update, and verification state are missing |
| Project Summary and approved terms | Missing | No controlled Project adaptation, approved scope, or terms summary |
| One authoritative Project Status | Missing | Current UI can infer or mirror legacy contract/Deal status |
| Controlled lifecycle transitions | Missing | No complete Project-level gate, reason, authority, evidence, and idempotency workflow |
| Project timeline | Partial | Six stages are visible; dates, owners, evidence, exceptions, and authoritative milestone records are missing |
| Funding separation | Missing | Investor receipt, reconciliation, Farmer fiat disbursement, and Farmer confirmation are not one controlled workflow |
| Farmer non-blockchain boundary | Fails | Wallet/Testnet/balance/payout concepts remain reachable or visible |
| Production Cycle records | Partial | Cycle and report state exist; planned/actual dates, requirements, deadline, owner, holds, and close criteria are incomplete |
| Farmer report workflow | Partial | Submission exists; draft, structured evidence, review, correction, acceptance, publication, and versioning are incomplete |
| Role-appropriate report history | Partial | Basic histories exist without complete review/publication semantics |
| Investor Financial Summary | Partial | Projected and recorded values exist; approved actuals, variance, fees, and authoritative Settlement inputs are incomplete |
| Admin Settlement tracking | Partial | Return-entry transitions exist; Project Settlement aggregate, calculation, approvals, payment, reconciliation, and statements are missing |
| Documents and acknowledgments | Missing | No role-based Project document workspace |
| Participant-safe Activity History | Partial | Events exist, but disclosure rules and one shared Project event model are incomplete |
| Exceptions, incidents, complaints, support | Missing | No Project-level operational workflow |
| Completion gate | Missing | Completed can be displayed without all closeout evidence |
| Loading, empty, unavailable, denied, stale states | Partial | Many resource states exist; stale/verification state and consistent task recovery are incomplete |
| State vocabulary | Partial | Projected and recorded labels improved; reported, reviewed, approved, received, paid, reconciled, and completed are not consistent everywhere |
| Export, backup, and audit evidence | Missing from user journey | Required before Pilot go/no-go |

## 8. Pilot Readiness

Readiness labels:

- **Green**: usable for Pilot with only minor non-blocking refinement;
- **Amber**: meaningful foundation exists, but P0 workflow gaps remain;
- **Red**: cannot support the required Pilot outcome safely or clearly.

| Area | Status | Assessment |
| --- | --- | --- |
| Product Readiness | Red | Strong Alpha demonstration, but no single authoritative end-to-end Project workflow |
| Investor Readiness | Amber/Red | Proposition and portfolio are understandable; onboarding, approved disclosure, documents, and Settlement are incomplete |
| Farmer Readiness | Red | Required actions are incomplete and the fiat-only/no-blockchain boundary fails |
| Operator Readiness | Red | Monitoring exists, but controlled Funding, review, Settlement, exceptions, and closeout cannot be operated end to end |

### Minimum evidence required to change the overall status

Product Readiness can move out of Red only after:

1. one selected Project has one authoritative identity and lifecycle;
2. all three roles use the same approved facts through role-specific views;
3. the Farmer path is fiat-only and contains every required action;
4. report review and Investor publication work end to end;
5. Settlement and Completion have enforceable evidence gates;
6. a no-real-funds rehearsal completes without an undocumented workaround.

## 9. One Prioritized Pilot 1.0 P0 Backlog

Every item below is required before Pilot launch. Priority order reflects dependency and risk,
not estimated engineering effort.

| Priority | Backlog item | Estimated impact | Reason | Dependencies |
| ---: | --- | --- | --- | --- |
| P0-1 | Freeze one Pilot product path and separate public demo/catalog/protection experiences from authenticated Pilot navigation | Critical | Prevents participants and operators from confusing presentation data, future features, and live Pilot records | Approved Pilot scope, selected participants, selected Project |
| P0-2 | Establish one stable Project identity and one authoritative Project lifecycle status shared across Investor, Farmer, and Admin | Critical | Every downstream action, timeline, permission, and closeout decision requires one source of truth | Approved Investment Model version and Project adaptation; lifecycle transition rules |
| P0-3 | Enforce role-specific access and navigation, including a Farmer fiat-only experience with no wallet, Testnet, blockchain, balance, withdrawal, Investor ROI, or protection workflow | Critical | The current Farmer experience violates the Pilot boundary and is not usable without blockchain context | P0-1; approved Farmer authentication method; role/assignment rules |
| P0-4 | Complete the shared Project Workspace header with stable reference, planned dates, next action/milestone, last verified update, and verification state | High | Gives all users the same orientation and makes unavailable data explicit | P0-2; approved Project schedule |
| P0-5 | Implement controlled Investor Funding, receipt, reconciliation, Farmer fiat disbursement, Farmer confirmation, and payment-exception states | Critical | Funding is the first real money gate and must not be inferred from a transaction or balance | P0-2; approved bank/provider process; evidence and reconciliation rules |
| P0-6 | Implement Farmer Production Cycle tasks with planned/actual dates, objectives, permitted use, evidence requirements, report deadline, owner, holds, issues, and close criteria | Critical | The Farmer and operator need an executable operating plan, not only a cycle label | P0-2, P0-3, P0-5; approved Project schedule and reporting standard |
| P0-7 | Implement Farmer report draft, structured submission, declaration, evidence, status, feedback, correction, and version history | Critical | Reports are the primary operational evidence and cannot be a one-step free-text submission | P0-6; approved report schema and evidence rules |
| P0-8 | Implement Admin report review, changes request, acceptance/rejection, redaction, Investor publication, and immutable review history | Critical | Investor disclosure must be controlled by AgriPartners and separated from raw Farmer submissions | P0-7; Information Disclosure Policy; Admin authority rules |
| P0-9 | Implement the Investor Project view for verified status, approved reports, documents, projected-versus-approved financials, next milestone, attention state, and support | High | The Investor needs a trustworthy monitoring experience without technical infrastructure actions | P0-2, P0-4, P0-5, P0-8; approved Investor disclosures |
| P0-10 | Implement the Admin operating queue with next action, owner, deadline, blockers, exceptions, incidents, complaints, and controlled lifecycle transitions | Critical | AgriPartners cannot operate one Pilot reliably from disconnected dashboards and manual memory | P0-2; owner/escalation matrix; transition authority rules |
| P0-11 | Implement one Project Settlement covering calculation inputs, independent review, approval, Farmer return reconciliation, Investor payment, evidence, reconciliation, blockers, and participant statements | Critical | Return rows and Testnet withdrawals cannot authorize or prove Settlement | P0-5, P0-8, P0-10; approved accounting, provider, payment, fee, and evidence rules |
| P0-12 | Implement the Project Completion gate and closeout checklist for cycles, reports, payments, reconciliation, documents, obligations, exceptions, communications, access, and final approvals | Critical | Completed must mean the whole Project is closed, not that a technical cycle ended | P0-6 through P0-11; approved closeout procedure |
| P0-13 | Add role-based Project documents, acknowledgments, support/escalation routes, and participant-safe Activity History | High | Agreements, disclosures, statements, issues, and approved communications must be available in context | P0-2, P0-3; approved document set, retention, disclosure, and support rules |
| P0-14 | Deliver Project export, audit trail, backup/restore evidence, stale-data indicators, and failure recovery for the Pilot record | Critical | Pilot go/no-go and closeout require recoverable, reviewable, complete records | P0-2 and all record-producing workflows; retention and backup procedure |
| P0-15 | Run a role-based no-real-funds rehearsal from onboarding through closeout and close every blocking usability finding | Critical | The product is not Pilot-ready until one Investor, one Farmer, and Admin can complete the exact lifecycle without undocumented workarounds | P0-1 through P0-14; approved rehearsal script and acceptance owners |

## 10. Recommended Sprint Order

Each sprint is intentionally narrow. A sprint should end with a demonstrable role journey and
retained acceptance evidence.

### Sprint 2.1 — Shared Project Workspace Header

Scope:

- shared Project name, Investment Model, status, operator, and lifecycle stages;
- stable Project reference;
- planned dates;
- next milestone/action;
- last verified update and verification state;
- consistent placeholders.

Current position: the first UI slice exists in the working tree; the remaining header fields
depend on authoritative Project data.

Backlog coverage: P0-2 foundation and P0-4.

### Sprint 2.2 — Pilot Navigation and Role Entry

Scope:

- separate Demo from Pilot;
- one role-specific landing page after login;
- remove cross-role Farmer navigation;
- hide Marketplace/protection concepts from Pilot navigation;
- clarify approved Investor and Farmer login methods;
- add not-found and access-denied recovery.

Backlog coverage: P0-1 and P0-3 navigation slice.

### Sprint 2.3 — Project Identity and Lifecycle Control

Scope:

- stable Project reference;
- approved Investment Model version link;
- authoritative lifecycle state;
- controlled transition reason, actor, authority, timestamp, and evidence;
- role-safe state labels.

Backlog coverage: P0-2.

### Sprint 2.4 — Funding and Farmer Confirmation

Scope:

- Investor Funding expected/received/reconciled;
- Farmer fiat disbursement approved/sent;
- Farmer receipt confirmation;
- payment issue reporting;
- evidence and variance states.

Backlog coverage: P0-5.

### Sprint 2.5 — Farmer My Project and Production Cycles

Scope:

- Farmer fiat-only workspace;
- cycle schedule, objectives, allowed use, evidence, deadline, owner, and status;
- next-action task;
- hold, delay, and issue reporting.

Backlog coverage: P0-3 and P0-6.

### Sprint 2.6 — Farmer Report Submission

Scope:

- draft and submit;
- structured fields and declaration;
- evidence;
- submission state;
- correction and version history.

Backlog coverage: P0-7.

### Sprint 2.7 — Admin Report Review and Investor Publication

Scope:

- review queue;
- changes request;
- accept/reject/escalate;
- redaction;
- publish approved Investor update;
- audit history.

Backlog coverage: P0-8 and the reporting slice of P0-10.

### Sprint 2.8 — Investor Monitoring and Documents

Scope:

- verified Project status and next milestone;
- approved reports only;
- projected versus approved financial labels;
- agreement, disclosures, acknowledgments, updates, and support;
- remove production-facing Testnet Settlement actions.

Backlog coverage: P0-9 and the Investor slice of P0-13.

### Sprint 2.9 — Admin Operating Queue and Exceptions

Scope:

- next action, owner, due date, and overdue state;
- blockers, exceptions, incidents, complaints, and escalation;
- participant communication decision;
- role-safe Activity History.

Backlog coverage: P0-10 and the operational slice of P0-13.

### Sprint 2.10 — Project Settlement

Scope:

- calculation;
- independent review and approval;
- Farmer return reconciliation;
- Investor payment and evidence;
- reconciliation and variance;
- participant statements.

Backlog coverage: P0-11.

### Sprint 2.11 — Completion and Closeout

Scope:

- final operational and financial checklist;
- unresolved-obligation blockers;
- participant acknowledgments and final communications;
- access closeout;
- controlled Completed transition and immutable completion summary.

Backlog coverage: P0-12.

### Sprint 2.12 — Records, Recovery, and Pilot Rehearsal

Scope:

- export;
- audit;
- backup/restore;
- stale-data and failure recovery;
- role-based end-to-end rehearsal;
- P0 usability remediation and go/no-go evidence.

Backlog coverage: P0-14 and P0-15.

## 11. Pilot 1.0 Product Acceptance Test

The product portion of Pilot readiness should pass only when:

1. the Investor signs in through the approved path and sees exactly one assigned Project;
2. the Farmer signs in without a wallet and sees exactly one My Project workflow;
3. Admin sees one Project, one task queue, and every unresolved blocker;
4. Investor Funding, Farmer fiat disbursement, and Farmer confirmation remain distinct;
5. the Farmer completes one representative Production Cycle and submits required evidence;
6. Admin requests a correction, accepts the corrected report, and publishes an approved update;
7. the Investor sees only the approved report and correct information-state labels;
8. Admin completes reviewed Settlement, payment evidence, and reconciliation;
9. Investor and Farmer receive the correct statements;
10. Completed remains blocked until every required closeout item passes;
11. all three roles can recover from an unavailable optional resource without losing the main
    Project context;
12. export and restored records reproduce the approved Project history;
13. no participant requires an undocumented workaround;
14. no Farmer screen or action requires blockchain understanding;
15. no demo, protection, Marketplace, or legacy Deal state is mistaken for Pilot authority.

## 12. Final Recommendation

Do not launch Pilot 1.0 from the current Alpha journey.

Continue with small Project Workspace sprints, beginning with the shared identity/header
foundation and role-specific navigation. Prioritize operational truth over additional demo
features. The launch candidate should contain one Investor, one Farmer, one Project, one
authoritative lifecycle, one controlled reporting path, one Settlement, and one closeout.

Public demos, Opportunity Catalog, NEAR infrastructure, and future protection concepts may
remain useful for presentation, but they must be visibly and operationally outside the Pilot
workflow.
