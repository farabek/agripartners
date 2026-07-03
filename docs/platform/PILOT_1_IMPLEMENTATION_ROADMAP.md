# RFC-006: Pilot 1.0 Implementation Roadmap

Status: Draft master execution plan

Architecture baseline: Business Architecture v1.0, frozen 2026-07-02

Scope: Phase 3 — Pilot 1.0

## Purpose

This roadmap defines the minimum implementation required to launch and complete one real
AgriPartners Pilot 1.0 Project. It is the master execution plan after the Business Architecture
v1.0 Freeze.

The roadmap does not redesign the platform or authorize real-funds activity. Real-funds activity
may begin only after every launch gate in this document is satisfied and the authorized
decision-makers record a go decision.

Pilot 1.0 applies the frozen architecture:

- one Investor contracts with and funds AgriPartners OÜ;
- AgriPartners OÜ contracts separately with one Farmer;
- there is no direct Investor-to-Farmer agreement or payment;
- the Farmer receives and returns fiat only and does not use a wallet or blockchain;
- legal agreements, approved provider records, banking records, accounting records, and
  reconciliations are authoritative;
- NEAR, if used, provides supplementary technical records only;
- the Pilot implements one complete Project derived from one approved Master Investment Model.

Priority meanings used in this roadmap:

| Priority | Meaning |
| --- | --- |
| P0 | Required before the relevant Pilot launch or lifecycle gate; unresolved P0 work blocks progression. |
| P1 | Important for control quality and operational resilience; complete before launch where feasible, or record an owner, deadline, and accepted residual risk. |
| P2 | Future enhancement; not required to complete Pilot 1.0. |

## 1. Current Status

### Business Architecture v1.0

Business Architecture v1.0 is frozen. It defines AgriPartners OÜ as the central legal and
operational counterparty, the provider-neutral financial flow, the Farmer fiat-only boundary,
the supporting role of NEAR, the Master Investment Model-to-Project relationship, and Pilot 1.0
as one complete Project lifecycle.

The freeze is a stable implementation baseline, not a launch approval. Company formation,
provider selection, legal terms, compliance implementation, Project economics, participant
eligibility, and Pilot go/no-go approval remain open implementation decisions.

### Platform status

AgriPartners is an Alpha/Testnet demonstration platform, not a production investment, custody,
payout, or settlement system. The repository contains implemented backend, PostgreSQL,
role-scoped API, wallet authentication, portal, and NEAR contract capabilities. However, the
current primary portal dashboards are demo-first, use static pilot datasets in important paths,
and do not yet constitute an authoritative end-to-end real-funds Project record.

Treasury Shadow Accounting, return records, and technical event history demonstrate workflows
but are not production accounting or settlement evidence. Production security, monitoring,
provider integration, financial reconciliation, data governance, and operational controls must
be proven for the narrow Pilot scope.

### NEAR integration

NEAR Testnet supports wallet authentication, contract-backed demo lifecycle actions, and
transaction-oriented records. The current smart contracts are unaudited, canonical Testnet
lifecycle evidence is incomplete, and NEAR Mainnet work has not started.

Some legacy demo material describes Farmer wallets and Farmer blockchain actions. That behavior
is incompatible with the frozen architecture and must not be required or presented as part of
the real Pilot. For Pilot 1.0, the Investor and authorized AgriPartners operators may use approved
wallet infrastructure. The Farmer must remain entirely fiat-only and non-blockchain. Any Pilot
NEAR record is supplementary to the authoritative legal, bank, provider, accounting, and
reconciliation records.

### Investor Portal

The Investor Portal demonstrates wallet-authenticated portfolio, Project, reporting, projected
ROI, return, and event views. Backend ownership-scoped workflows exist, but the main dashboard
currently substitutes static demo Projects for authenticated live Project data. Before Pilot
use, the single Investor must see only the approved live Project and accurate financial states,
with projections clearly separated from received, paid, realized, and reconciled amounts.

### Farmer Portal

The Farmer Portal demonstrates assigned deals, funding status, Production Cycle progress, and
reporting responsibilities. Backend Farmer reporting and ownership-scoped workflows exist, but
the main experience is demo-first and currently assumes wallet-based access. The real Pilot
cannot depend on a Farmer wallet, cryptocurrency, smart contract, or blockchain interface. A
controlled non-blockchain Farmer reporting and confirmation process is required; it may be a
minimal portal path or an approved manual process with operator entry and independent review.

### Admin

Admin capabilities include Project creation, lifecycle operations, reporting visibility,
returns records, and event monitoring. The primary dashboard remains partly static, and current
records do not provide production-grade treasury, reconciliation, evidence review, exception,
or settlement control. Pilot use requires a live single-Project operating view, role separation,
dual approval outside or inside the platform as approved, and exportable evidence.

### Documentation

The canonical Business, Pilot plan, readiness checklist, operations guide, disclosure policy,
financial model, and Master Investment Models provide a strong planning baseline. The remaining
work is to convert these controls into approved company, legal, finance, operations, and
Project-specific artifacts.

Documentation debt remains: overlapping or historical documents contain obsolete terminology,
demo claims, Marketplace language, and Farmer-wallet assumptions. The frozen architecture and
this roadmap take precedence for Pilot execution. Controlled versions, owners, approvals, and
evidence locations must be assigned before launch.

## 2. Pilot Success Definition

Pilot 1.0 is successful only when one complete, controlled Project follows this path:

```text
One Investor
      |
      v
AgriPartners OÜ
      |
      v
One Farmer
      |
      v
Funding
      |
      v
Production
      |
      v
Reports
      |
      v
Settlement
      |
      v
Project Completed
```

Success means that:

1. one eligible Investor and one eligible Farmer are separately onboarded and contracted with
   AgriPartners OÜ;
2. one Project is adapted from one approved Master Investment Model;
3. Investor Funding is received by AgriPartners OÜ through an approved route and fully
   reconciled;
4. Farmer Disbursement is made in fiat after all conditions are met;
5. every approved Production Cycle and reporting milestone is completed or formally resolved;
6. Farmer returns are received by AgriPartners OÜ in fiat and reconciled;
7. the Investor is settled through the approved route with an approved settlement statement;
8. every fund movement, decision, report, exception, and financial state has reviewable
   evidence;
9. no unresolved material legal, compliance, safeguarding, accounting, security, privacy, or
   reconciliation issue remains; and
10. a signed closeout report marks the Project completed and records the post-Pilot decision.

Commercial return by itself does not define success. A loss, delay, or underperformance may still
produce a valid Pilot result if agreements and controls are followed, records are accurate,
participants are treated correctly, and all exceptions and obligations are resolved. Conversely,
a profitable Project is not successful if its controls or evidence fail.

## 3. Implementation Workstreams

| ID | Workstream | Outcome | Accountable role |
| --- | --- | --- | --- |
| A | Platform Alignment | A narrow, secure, live single-Project workflow aligned with the frozen architecture | Product/Technical Lead |
| B | Company Readiness | AgriPartners OÜ can lawfully authorize, receive, disburse, account for, and settle Pilot funds | Company Director |
| C | Legal Preparation | The structure, participants, agreements, disclosures, and compliance controls are approved | Legal/Compliance Lead |
| D | Payment Infrastructure | Approved Investor Funding, Farmer fiat, safeguarding, reconciliation, and settlement routes operate end to end | Finance/Treasury Lead |
| E | Pilot Operations | The Project, Farmer, reporting, support, incident, settlement, and closeout procedures are executable | Pilot Operations Lead |
| F | Investor Readiness | The single Investor is eligible, informed, contracted, supported, and ready to fund | Investor Operations Lead |
| G | Risk, Security, and Data | Pilot risks, access, privacy, evidence, incidents, continuity, and stop conditions are controlled | Risk/Security Lead |
| H | Governance and Assurance | Owners, approvals, evidence, dry runs, go/no-go, and closeout decisions are independently reviewable | Pilot Director |

One named person and one backup must be assigned to each workstream. A person may hold more than
one role in the small Pilot team, but payment initiation, payment approval, reconciliation
review, and final go/no-go approval must be separated as required by the approved control model.

## 4. Platform Alignment

The goal is the minimum reliable implementation for one Investor, one Farmer, and one Project.
Pilot 1.0 does not require broad feature expansion.

### P0 — Required

- Define the authoritative source for each Project, participant, agreement, funding, reporting,
  settlement, and completion state; document how platform records reconcile to it.
- Introduce an explicit operational separation between demo data and Pilot data. No static demo
  Project may appear in a live Pilot participant or operator view.
- Configure the Investor experience to show only the approved Investor's live Project and
  evidence-backed financial states.
- Provide a Farmer workflow that requires no wallet, token, cryptocurrency, smart contract, or
  blockchain action. If the platform cannot provide this safely, use an approved manual
  reporting process with operator entry, source evidence, and independent review.
- Provide an Admin operating view or controlled register for the one live Project, including
  lifecycle state, reporting deadlines, payment state, approvals, exceptions, and evidence
  references.
- Enforce or procedurally control role-based access and least privilege for the Investor,
  operators, reviewers, and administrators.
- Remove Pilot dependence on delegated Farmer withdrawals or any backend-signed Farmer
  blockchain transaction.
- Define the Pilot financial state model using at least `Projected`, `Recorded`, `Received`,
  `Approved`, `Paid`, and `Reconciled`; define the evidence required to enter each state.
- Ensure projected ROI cannot be displayed as realized or reconciled ROI. Realized ROI may be
  shown only after approved settlement calculation and supporting financial evidence.
- Make all required Pilot records exportable in a stable, readable format for reconciliation,
  legal review, accounting, and closeout.
- Establish backups and complete one documented restore test for Pilot records before launch.
- Verify that personal data, bank details, compliance evidence, and full agreements cannot be
  written to a public blockchain.
- Decide and approve the exact NEAR scope for Pilot 1.0: no on-chain use, or a minimal list of
  supplementary events, authorized signers, payload rules, reconciliation steps, and failure
  handling.
- If NEAR is used, record a canonical Testnet contract identifier, source/WASM version,
  authorized signer list, and one reproducible dry-run lifecycle with transaction references.
- Ensure a NEAR, portal, API, or database outage cannot bypass a payment approval or change an
  authoritative financial record.
- Resolve Pilot-critical authentication, secret handling, sensitive logging, and access-review
  issues identified by technical review.
- Run and retain evidence for the approved backend test suite, frontend production build, and
  Pilot-specific end-to-end rehearsal against the release candidate.
- Freeze the Pilot release candidate and record its source revision, configuration inventory,
  known limitations, approvers, and rollback procedure.

### P1 — Important

- Add a clear audit history for material Project, participant, report, payment, and settlement
  state changes, including actor and timestamp.
- Provide operator queues for due reports, exceptions, reconciliation items, and settlement
  actions.
- Add dependency-aware health checks and alerts for the Pilot deployment, database, approved
  integrations, and any selected NEAR components.
- Make the API and environment configuration explicit for Pilot, rehearsal, and demo
  environments.
- Standardize evidence identifiers across the platform, accounting register, agreements, bank
  records, and Project file.
- Provide read-only reviewer access for reconciliation and closeout assurance where allowed.
- Test business continuity for a temporary portal, database, provider, or NEAR outage.

### P2 — Future

- Self-service multi-investor onboarding and allocation.
- Automated provider-to-ledger reconciliation at scale.
- Advanced portfolio analytics, forecasting, and configurable reporting.
- Generalized multi-Project workflow automation.
- Mainnet deployment or broader smart contract automation.
- Public Project discovery beyond the existing Alpha Opportunity Catalog.

## 5. Company Readiness

### Company registration

- Complete AgriPartners OÜ registration and retain the registry extract, articles, beneficial
  ownership information, registered address, and tax identifiers.
- Record directors, authorized representatives, signing rules, delegated authorities, approval
  limits, and conflicts of interest.
- Approve a board/director resolution authorizing the defined Pilot, its maximum funding amount,
  currency, participants, duration, and named Pilot Director.
- Confirm that company status, authority, insurance requirements, and any required registrations
  remain valid on the launch date.

### Corporate wallet

- Decide whether a corporate wallet is needed for the approved Investor route or supplementary
  NEAR records.
- If needed, create wallet ownership and signer records in the name/control of AgriPartners OÜ,
  document key custody, approval thresholds, recovery, rotation, monitoring, and incident
  procedures, and test them with no real Pilot funds.
- Separate corporate, test, demo, operator, and personal wallets. Personal wallets must not hold
  or route company or participant funds.
- Ensure no corporate wallet is required for any Farmer action.

### Banking

- Open and activate the approved AgriPartners OÜ bank or payment account required for Investor
  Funding, Farmer Disbursement, Farmer returns, refunds, fees, and Investor Settlement.
- Confirm account ownership, supported currencies, transaction limits, cut-off times, fees,
  statements, payment references, dual-control options, and bank-detail verification.
- Approve the safeguarding or segregation treatment for participant money.
- Test low-value inbound and outbound payments and obtain usable statement evidence before
  accepting Pilot Funding.

### Accounting

- Appoint the accounting owner or provider and approve the Pilot chart of accounts and posting
  rules.
- Define treatment for Investor Funding, Farmer Disbursement, Farmer return, Investor
  Settlement, revenue, fees, tax, foreign exchange, rounding, refunds, write-offs, and residual
  balances.
- Define bank/provider-to-ledger reconciliation frequency, evidence, reviewer, exception
  tolerance, and close period.
- Confirm participant-level and Project-level statements can be produced.
- Approve tax and statutory reporting responsibilities for AgriPartners OÜ and the Project.

### Internal procedures

- Approve authority, dual-approval, bank-detail change, reconciliation, record retention,
  privacy, security, incident, complaint, conflict, default, business continuity, and stop
  procedures.
- Assign primary and backup owners and train each operator on the procedures they execute.
- Maintain one controlled Pilot file and one decision log with stable identifiers.
- Complete a tabletop exercise and a full dry run from onboarding through settlement and
  closeout.

## 6. Legal Readiness

The following documents or documented determinations are required. This roadmap does not draft
them, determine their legal sufficiency, or replace qualified legal advice.

### Corporate and authority

- AgriPartners OÜ formation and beneficial ownership records.
- Board/director Pilot authorization and delegated authority schedule.
- Authorized signatory and payment approval matrix.
- Conflicts-of-interest declarations and management record.

### Structure and regulatory analysis

- Written legal analysis of the Pilot structure in every relevant jurisdiction.
- Licensing, registration, exemption, solicitation, financial-promotion, and participant
  eligibility determination.
- Approved Investor and Farmer KYC/KYB, sanctions, beneficial ownership, source-of-funds, and
  source-of-wealth requirements as applicable.
- Approved custody, safeguarding, segregation, payment, crypto-asset, and conversion analysis
  for the selected route.
- Tax analysis and allocation of tax reporting responsibilities.

### Project and participant documents

- Project-specific Investor Agreement between the Investor and AgriPartners OÜ.
- Project-specific Farmer Agreement between the Farmer and AgriPartners OÜ.
- Approved Project schedule or term sheet derived from the selected Master Investment Model.
- Controlled reference to the source agricultural agreement used for the selected Master
  Investment Model, without exposing confidential content.
- Project budget, permitted use of funds, conditions precedent, reporting schedule, settlement
  method, default terms, dispute process, and governing-law records.
- Investor risk disclosure and acknowledgment, including loss, illiquidity, delay,
  agricultural, counterparty, operational, currency, technology, and non-guarantee risks.
- Clear fee and fee-calculation disclosure, including a statement when no fee applies.
- Investor payment instructions and Farmer bank-detail confirmation in approved form.

### Data, communications, and disputes

- Privacy notice and approved legal bases/consents for participant and Project data.
- Data processing agreements and international-transfer documentation where required.
- Record retention and deletion schedule.
- Confidentiality and information-disclosure rules aligned with the Information Disclosure
  Policy.
- Approved Investor and Farmer communications and financial-state wording.
- Complaints, disputes, defaults, late payment, fraud, incident notification, and data-subject
  request procedures.

Every required document must have a controlled identifier, version, owner, approval status,
effective date, storage location, and participant signature or acknowledgment where applicable.

## 7. Operational Readiness

### Farmer onboarding

1. Select one Farmer and verify identity, ownership, authority, operating history, capacity,
   bank account, and required compliance information.
2. Select one Master Investment Model and complete a Project adaptation covering economics,
   budget, currency, duration, all Production Cycles, permitted use, evidence, risks, and
   settlement.
3. Capture baseline farm, livestock/asset, supplier, cost, and site evidence appropriate to the
   selected model.
4. Execute the Farmer Agreement and independently verify all conditions precedent.
5. Train the Farmer on fiat-only payment, confirmation, reporting, support, escalation, and
   evidence procedures.
6. Obtain written confirmation that no Farmer wallet, cryptocurrency, blockchain, or direct
   Investor relationship is required.

### Investor onboarding

1. Select one Investor under the approved eligibility rules.
2. Complete identity, eligibility, sanctions, bank, source-of-funds, and any suitability or
   appropriateness checks required by the approved legal analysis.
3. Provide the Project terms, risk disclosure, fees, reporting calendar, complaint route, and
   settlement method.
4. Execute the Investor Agreement before accepting funds.
5. Confirm that the Investor understands AgriPartners OÜ is the counterparty and that the
   Investor has no direct payment or instruction relationship with the Farmer.
6. Verify the Investor's approved funding and settlement details through an independent method.

### Reporting process

- Approve a calendar containing every Farmer report, operator review, Investor update, financial
  reconciliation, and escalation deadline.
- Define the fields and evidence required for each milestone and who may submit, review,
  approve, reject, or correct them.
- Record each report as received on time, received late, accepted, conditionally accepted,
  rejected, or escalated.
- Send Investor updates only after evidence review and distinguish projections from actual
  financial events.
- Escalate every missing or inconsistent report with an owner, due date, consequence, and
  recorded decision.

### Settlement process

- Approve the contractual settlement calculation, required inputs, fees, taxes, foreign
  exchange, rounding, loss allocation, and residual-balance treatment.
- Receive Farmer returns only in fiat through the verified AgriPartners OÜ channel.
- Reconcile the Farmer receipt to the bank/provider record, Project, agreement, ledger, and
  calculation before Investor payment.
- Separate calculation preparation, calculation approval, payment initiation, and payment
  approval as required by the control model.
- Settle the Investor through the verified approved route and issue a participant-level
  settlement statement.
- Mark Settlement `Reconciled` only when bank/provider, accounting, agreement, calculation,
  approval, and platform records agree.

### Support process

- Publish one approved support route and service hours for each participant.
- Maintain named primary and backup contacts and an escalation tree.
- Log every request, complaint, dispute, incident, and exception with severity, owner, response
  deadline, action, and closure evidence.
- Define emergency stop, participant notification, data breach, suspected fraud, payment error,
  agricultural event, and operator absence procedures.
- Test support intake and one simulated high-severity escalation before launch.

## 8. Pilot Checklist

Each checkbox requires an owner, completion date, and evidence reference. `Complete` means the
measurable acceptance condition is met; a statement of intent is not sufficient.

### Business and Project

- [ ] One Master Investment Model is named and its approved version is recorded.
- [ ] One Project adaptation has a controlled ID, version, approval, amount, currency, start
      date, planned completion date, and all Production Cycles.
- [ ] The Pilot funding cap and participant exposure equal or remain below the approved company
      resolution limits.
- [ ] One Investor and one Farmer are named in the controlled participant register; no additional
      participant is enabled.
- [ ] The Pilot Director and all eight workstream owners and backups are recorded.

### Company and legal

- [ ] A current registry extract and beneficial ownership record prove AgriPartners OÜ
      registration.
- [ ] Legal counsel has issued a written launch approval or a written no-objection covering all
      relevant jurisdictions and the selected financial route.
- [ ] The licensing/exemption, tax, privacy, safeguarding, and participant eligibility
      determinations have controlled references and no open launch blocker.
- [ ] The Investor Agreement and Farmer Agreement are signed before any related real-funds
      movement.
- [ ] Every disclosure and fee applicable to the Project is acknowledged by the Investor.
- [ ] All personal-data, retention, complaint, dispute, default, and incident procedures are
      approved and accessible to their operators.

### Banking, payments, and accounting

- [ ] Every bank, payment, or licensed crypto-asset provider used in the Pilot has a signed
      approval record and an active AgriPartners OÜ account.
- [ ] The approved account has passed at least one documented low-value inbound and outbound
      payment test.
- [ ] Initiation and approval access is assigned to separate authorized people and has been
      demonstrated in the rehearsal.
- [ ] The chart of accounts and posting rules cover 100% of planned Pilot money-movement types.
- [ ] The reconciliation rehearsal ends with zero unexplained variance.
- [ ] Procedures exist and have been tested for unmatched, excess, late, failed, returned,
      duplicate, third-party, and wrong-currency payments.
- [ ] The approved settlement calculation reproduces the expected result from the rehearsal
      inputs with reviewer sign-off.

### Platform, NEAR, security, and data

- [ ] Live Pilot and demo environments/data are visibly and technically separated; the Pilot
      views contain zero static demo Projects.
- [ ] The Investor can access only the approved Project and cannot access another participant's
      record in authorization tests.
- [ ] The Farmer completes the rehearsed workflow without a wallet, token, cryptocurrency, smart
      contract, or blockchain action.
- [ ] The Admin operating record contains all required Project states, deadlines, approvals,
      exceptions, and evidence references.
- [ ] Access review confirms every Pilot account has an owner, required role, least privilege,
      and removal date where temporary.
- [ ] Backup restoration has been completed once and the restored record count/checksum matches
      the approved source.
- [ ] Export testing produces readable participant, Project, reporting, event, and financial
      records with no required field missing.
- [ ] Security review has zero unresolved critical or high-severity Pilot finding.
- [ ] Backend tests, frontend production build, and Pilot end-to-end rehearsal pass on the frozen
      release candidate, with results retained.
- [ ] If NEAR is used, 100% of approved on-chain payload types contain no personal, bank,
      agreement, or confidential evidence data.
- [ ] If NEAR is used, each rehearsal transaction maps to exactly one approved internal event;
      if NEAR is not used, a signed scope decision records that choice.
- [ ] A simulated platform or NEAR outage does not prevent manual control, reconciliation, or
      safe suspension of payments.

### Participants and operations

- [ ] Investor onboarding is complete with zero expired or unresolved required check.
- [ ] Farmer onboarding, bank verification, baseline evidence, and conditions precedent are
      complete with zero unresolved required item.
- [ ] The reporting calendar contains an owner and due date for 100% of reports and Investor
      updates.
- [ ] The support and escalation test records correct routing, acknowledgment, owner, and
      resolution decision within the approved target times.
- [ ] The full dry run covers onboarding, Funding, Farmer Disbursement, one representative
      Production Cycle, reporting, Farmer return, Investor Settlement, reconciliation, and
      closeout.
- [ ] Every dry-run exception is closed or has a documented non-blocking classification, owner,
      deadline, and accepted residual risk.

### Final go/no-go

- [ ] All P0 tasks and all checklist items are complete with evidence.
- [ ] The risk register contains no unaccepted critical or high risk.
- [ ] Legal/Compliance, Finance/Treasury, Pilot Operations, Product/Technical, Risk/Security, and
      the Company Director have signed their readiness decisions.
- [ ] The Pilot Director has recorded `GO`, the exact release revision, approved amount,
      currency, participants, providers, launch date, stop conditions, and approvers.

## 9. Post-Pilot

### Lessons learned

- Complete structured interviews with the Investor, Farmer, every workstream owner, and at least
  one independent reviewer.
- Compare actual dates, amounts, reports, support cases, incidents, exceptions, and control
  results with the approved plan.
- Document what worked, what failed, root causes, workarounds, unresolved obligations, and
  recommended owners and deadlines.
- Record whether the Pilot should stop, be repeated after remediation, or progress to Pilot 2.0.

### Platform improvements

- Convert every confirmed platform gap into a prioritized backlog item linked to Pilot evidence.
- Correct inaccurate states, terminology, data ownership, access, audit, export, backup,
  reconciliation, monitoring, and usability issues found during the Pilot.
- Decide which manual controls remain appropriate and which should be automated for the next
  phase.
- Preserve the Pilot release, configuration, data export, and technical evidence for audit and
  regression testing.

### Preparation for Production

- Do not treat Pilot completion as Production Ready approval.
- Reassess legal, licensing, compliance, safeguarding, accounting, security, privacy, provider,
  operational, and technical requirements for Pilot 2.0 and Production Ready.
- Define the additional scale, resilience, security, monitoring, participant, reconciliation,
  and support controls required beyond the single-Project Pilot.
- Approve a separate roadmap and go/no-go process for Pilot 2.0 and, later, Production Ready.
- Keep Investor Protection and Marketplace work behind their frozen roadmap gates.

## 10. Out of Scope

The following are explicitly outside Pilot 1.0:

- **Marketplace** — no public Marketplace, unrestricted solicitation, public self-service
  investment, or multi-Project market. The Alpha Opportunity Catalog is not a live Marketplace.
- **Protection Reserve** — no reserve is funded, activated, advertised, or represented as
  protecting principal or returns.
- **Institutional Investors** — Pilot 1.0 is limited to the one approved Investor and does not
  implement institutional onboarding, mandates, pooled capital, or institutional reporting.
- **Escrow** — Pilot 1.0 does not implement or claim an escrow arrangement. Any approved
  safeguarding or segregation control must be described accurately and must not be called
  escrow unless separately authorized in a future phase.
- **Smart Contract v2** — no v2 redesign, upgrade, Mainnet migration, or expanded on-chain
  financial automation is required.

Also outside scope are multiple Investors, multiple Farmers, multiple live Projects, automated
Farmer payments, Farmer wallets, direct Investor-to-Farmer transfers, guaranteed returns,
insurance claims, public token issuance, governance, and production-scale automation.

## 11. Milestones

Milestones are evidence gates, not target dates. A milestone is complete only when its exit
criteria are approved. No downstream milestone may waive an unresolved upstream P0 item.

```text
Business Ready
      |
      v
Platform Ready
      |
      v
Legal Ready
      |
      v
Pilot Ready
      |
      v
Pilot Running
      |
      v
Pilot Completed
```

### M1 — Business Ready

Entry: Business Architecture v1.0 is frozen.

Exit criteria:

- AgriPartners OÜ registration, authority, banking direction, and accounting ownership are
  evidenced;
- one Investor, one Farmer, one Master Investment Model, and one Project adaptation are selected;
- Project amount, currency, economics, duration, Production Cycles, limits, and responsible
  owners are approved;
- the legal, provider, accounting, and operations implementation paths have no unidentified
  dependency.

### M2 — Platform Ready

Entry: M1 complete and the Project data set is approved.

Exit criteria:

- the frozen Pilot release uses live Project data and respects the Farmer non-blockchain
  boundary;
- access, financial states, evidence, export, backup/restore, security, monitoring, and failure
  controls pass;
- the technical and operational rehearsal passes with retained evidence;
- any selected NEAR scope is approved, supplementary, privacy-safe, and reproducible.

### M3 — Legal Ready

Entry: M1 complete; selected participants, jurisdictions, Project terms, and payment routes are
known.

Exit criteria:

- legal and regulatory determinations are approved;
- company, participant, provider, privacy, disclosure, tax, safeguarding, complaints, disputes,
  and incident documents are complete;
- Investor and Farmer agreements are ready for signature;
- no legal or compliance launch blocker remains.

M2 and M3 may progress in parallel after M1, but both must complete before M4.

### M4 — Pilot Ready

Entry: M1, M2, and M3 complete.

Exit criteria:

- company, providers, participants, Project, operations, support, and settlement are ready;
- agreements are executed and conditions for accepting Investor Funding are met;
- the full dry run and checklist pass;
- all residual risks are accepted by authorized owners;
- the Pilot Director records the final go decision.

### M5 — Pilot Running

Entry: M4 go decision recorded.

Exit criteria:

- Investor Funding, Farmer Disbursement, Production, reporting, Farmer return, and Investor
  Settlement follow approved procedures;
- every movement and state transition is reconciled and evidenced;
- every exception is resolved or formally carried into closeout;
- the final Production Cycle and Settlement are complete.

### M6 — Pilot Completed

Entry: M5 lifecycle complete.

Exit criteria:

- all participant, bank/provider, accounting, agreement, platform, and any NEAR records reconcile;
- every remaining obligation, complaint, incident, exception, and access right is closed or
  formally transferred;
- the Investor and Farmer receive required final statements and communications;
- metrics, feedback, lessons learned, and remediation actions are approved;
- the signed closeout report marks the Project completed and records the next-phase decision.

## 12. Success Metrics

The closeout report must record each metric, its evidence source, actual result, target result,
variance, and approver.

| Category | KPI | Pilot 1.0 target |
| --- | --- | --- |
| Scope | Live Projects completed | Exactly 1 |
| Scope | Investors/Farmers | Exactly 1 approved Investor and 1 approved Farmer |
| Architecture | Direct Investor-to-Farmer agreements or payments | 0 |
| Architecture | Farmer wallet, crypto, smart contract, or blockchain actions | 0 |
| Onboarding | Required Investor and Farmer checks complete before agreement/funding | 100% |
| Agreements | Required agreements executed before related funds move | 100% |
| Funding | Investor Funding matched to Investor, agreement, Project, amount, currency, and provider record | 100% |
| Payments | Money movements with required evidence and approvals | 100% |
| Fiat boundary | Farmer receipts and returns executed in approved fiat | 100% |
| Reconciliation | Bank/provider movements mapped to approved ledger entries | 100% |
| Reconciliation | Unexplained financial variance at each gate and closeout | 0 |
| Reporting | Required Farmer reports received | 100%, or every miss formally escalated and resolved |
| Reporting | Accepted reports supported by the required evidence | 100% |
| Communications | Investor updates using approved financial-state terminology | 100% |
| Settlement | Settlement calculation independently reviewed before payment | 100% |
| Settlement | Investor payment supported by bank/provider evidence and final reconciliation | 100% |
| Records | Required Pilot records exportable and linked to stable identifiers | 100% |
| NEAR | Approved on-chain events reconciled to internal events, if NEAR is used | 100% |
| Privacy | Personal, bank, agreement, or confidential evidence written to public chain | 0 |
| Security | Unresolved critical or high-severity security incidents at closeout | 0 |
| Compliance | Unresolved material legal, compliance, safeguarding, privacy, or sanctions issue at closeout | 0 |
| Operations | Critical control bypasses | 0 |
| Support | Complaints, incidents, and exceptions with owner and disposition | 100% |
| Availability | Outages causing an unauthorized or unreconciled fund movement | 0 |
| Closeout | Required participant and operator feedback responses received | 100% |
| Governance | Signed go/no-go and signed closeout decisions retained | 100% |

Schedule variance, financial performance, report lateness, support response time, and platform
availability must also be measured against the Project-specific targets approved at M1. They are
not assigned universal targets here because the selected Master Investment Model, jurisdiction,
provider, and Project terms are not yet fixed.

## Execution Authority and Related Documents

This roadmap coordinates execution. It does not replace the detailed controls in:

- [Business Architecture v1.0 Freeze](../business/BUSINESS_ARCHITECTURE_V1_FREEZE.md)
- [Business Architecture Audit v1.0](../business/BUSINESS_ARCHITECTURE_AUDIT_V1.md)
- [AgriPartners v2 Operating Model](../business/OPERATING_MODEL.md)
- [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md)
- [Information Disclosure Policy](../business/INFORMATION_DISCLOSURE_POLICY.md)
- [Feedlot Master Investment Model](../business/investment-models/FEEDLOT_MASTER_INVESTMENT_MODEL.md)
- [Hissar Sheep Master Investment Model](../business/investment-models/HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md)
- [Pilot 1.0 Plan](pilot/PILOT_1_PLAN.md)
- [Pilot Readiness Checklist](pilot/PILOT_READINESS_CHECKLIST.md)
- [Pilot Operations Guide](pilot/PILOT_OPERATIONS_GUIDE.md)

If a conflict is found, the frozen Business Architecture v1.0 decisions govern business
architecture. Legal counsel and authorized company decision-makers govern launch authorization.
The conflict must be recorded and resolved before the affected gate is approved.
