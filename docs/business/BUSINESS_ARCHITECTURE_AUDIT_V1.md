# AgriPartners Business Architecture Audit v1.0

Audit date: 2026-07-02

Status: Re-evaluated after RFC-005 Business Architecture Audit Resolution.

This audit does not authorize real-funds activity, change legal agreements, or modify application
behavior.

## Executive Summary

The AgriPartners business documentation forms one consistent architecture around the central
relationship:

```text
External Investor -> AgriPartners OÜ -> Farmer
```

The strongest decisions are consistent across the core documents: AgriPartners OÜ is the
counterparty to both sides, the Farmer is fiat-only, the Investor and Farmer do not transact
directly, NEAR is supporting infrastructure rather than a legal counterparty, and public
Marketplace activity is deferred until later roadmap gates.

RFC-005 resolves the original architecture blockers:

1. The funding flow is provider-neutral. Investors may use supported fiat or crypto-asset routes
   through selected AgriPartners financial infrastructure; Farmers always receive and return
   USD, EUR, or local fiat and never interact with crypto or blockchain.
2. Pilot 1.0 is one complete investment Project lifecycle and explicitly is not one Production
   Cycle.
3. Marketplace is reserved for the future Phase 7 public platform. Current Alpha discovery
   screens are called the Opportunity Catalog.
4. The two official Master Investment Models are linked from the core Business, Pilot, Platform,
   and README documentation and are required inputs to Pilot Project adaptation.
5. The NEAR Track roadmap now follows the no-Farmer-wallet boundary and the seven-phase v2
   roadmap.

Residual documentation debt remains, but it does not change these architectural decisions or
block a foundational freeze.

Overall assessment: **Green/Amber — architecture decisions resolved; ready for v1.0 freeze with
implementation-dependent controls remaining open**.

## Scope and Method

The audit reviewed:

- [AgriPartners v2 Operating Model](OPERATING_MODEL.md);
- [Information Disclosure Policy](INFORMATION_DISCLOSURE_POLICY.md);
- [RFC-003: Financial Operating Model](FINANCIAL_OPERATING_MODEL.md);
- [Feedlot Master Investment Model](investment-models/FEEDLOT_MASTER_INVESTMENT_MODEL.md);
- [Hissar Sheep Master Investment Model](investment-models/HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md);
- [Pilot 1.0 Plan](../platform/pilot/PILOT_1_PLAN.md);
- [Pilot Readiness Checklist](../platform/pilot/PILOT_READINESS_CHECKLIST.md);
- [Pilot Operations Guide](../platform/pilot/PILOT_OPERATIONS_GUIDE.md);
- [Root README](../../README.md);
- [Documentation Index](../README.md);
- [Platform Documentation](../platform/README.md);
- [English Roadmap](../pitch-deck/09-roadmap.md);
- [Russian Roadmap](../pitch-deck/19-roadmap-ru.md);
- [NEAR Track Roadmap](../near/near-track-roadmap.md).

The review compared terminology, decision ownership, financial and operational flows, disclosure
boundaries, pilot controls, roadmap phases, document hierarchy, and Markdown cross references.
It did not assess whether the documented model is legally permissible in any jurisdiction.

## Strengths

### 1. Clear counterparty model

The Operating Model establishes AgriPartners OÜ as the legal counterparty to the External Investor
and the Farmer. The Financial Operating Model, Information Disclosure Policy, Master Investment
Models, and Pilot documents preserve this boundary.

### 2. Strong Farmer fiat-only boundary

The core documents consistently state that Farmers receive and return fiat, do not use
cryptocurrency, and do not require wallets or smart contracts. The Pilot checklist and operations
guide turn this decision into a practical control.

### 3. Separation of legal records and blockchain infrastructure

The architecture consistently treats contracts, banking, accounting, and reconciliation records
as authoritative. NEAR is limited to transparency, event history, audit trail, automation, and
supplementary settlement references.

### 4. Responsible financial-state language

The Pilot Operations Guide distinguishes projected, recorded, received, approved, paid, and
reconciled states. The other documents generally avoid treating a projection or technical event
as completed financial settlement.

### 5. Good disclosure and confidentiality boundary

The Information Disclosure Policy separates pre-investment information, post-investment
monitoring, confidential Farmer Agreements, redacted agreements, verification certificates,
internal documents, and personal data.

### 6. Reusable model versus Project separation

Both Master Investment Models clearly state that one model can generate multiple independent
Projects and that every Project requires separate participants, limits, records, agreements, and
settlement. They also state that a Master Investment Model is not a legal agreement.

### 7. Controlled Pilot 1.0 posture

The Pilot package provides preconditions, dual approval, reconciliation, stop conditions,
evidence requirements, incident handling, sign-off roles, and a no-real-funds fallback using
synthetic data.

### 8. Consistent primary business roadmap

The Operating Model, root README, Platform README, and English/Russian pitch roadmaps use the same
seven phases:

1. Alpha;
2. Company Registration;
3. Pilot 1.0;
4. Pilot 2.0;
5. Production Ready;
6. Investor Protection;
7. Marketplace.

### 9. No broken local links in the audited scope

The RFC-005 re-evaluation checked 193 local Markdown references in the scoped documents. No broken
local file references were found.

## Findings and Resolution Status

### BA-01 — Investor funding route conflict

Status: **Resolved by RFC-005**

The original audit found a conflict between fiat-only Investor receipt in the Operating/Pilot
documents and a specific crypto/CASP route in the Financial Operating Model.

```text
External Investor -> AgriPartners OÜ -> Selected financial infrastructure
-> USD / EUR / Local Currency -> Farmer
```

The [Operating Model](OPERATING_MODEL.md), [Financial Operating
Model](FINANCIAL_OPERATING_MODEL.md), and Pilot documents now use the same provider-neutral
principle. Investors may use supported crypto assets only through approved AgriPartners
infrastructure. Farmers remain fully fiat-only. No bank, payment institution, CASP, exchange, or
other provider is represented as selected before company, partner, and legal approval.

### BA-02 — Pilot unit and Cycle ambiguity

Status: **Resolved by RFC-005**

Pilot 1.0 is now defined throughout the Operating Model, Financial Operating Model, Master
Investment Models, Pilot package, and roadmap as one complete investment Project lifecycle:
Project Creation, Funding, Farmer Confirmation, all approved Production Cycles, Reports,
Settlement, and Project Completion. It is explicitly not one Production Cycle. A smaller amount,
for example USD 1,000, does not reduce the required lifecycle.

### BA-03 — Marketplace has two meanings

Status: **Resolved by RFC-005**

Marketplace now refers only to the future Phase 7 public platform. Current Alpha documentation
uses `Opportunity Catalog` for the demonstration and discovery interface. Pilot 1.0 remains
pre-Marketplace and cannot be described as a Marketplace launch.

### BA-04 — Master Investment Models are not discoverable

Status: **Resolved by RFC-005**

The Feedlot and Hissar Sheep Master Investment Models are linked from the root README, main
Documentation Index, Platform README, Operating Model, Financial Operating Model, Information
Disclosure Policy, and all three Pilot documents.

### BA-05 — Pilot documents do not identify the selected Master Investment Model

Status: **Resolved by RFC-005**

Pilot 1.0 now requires selection of the Feedlot or Hissar Sheep Master Investment Model, an
approved Project-specific adaptation, recalculated Project economics, and a complete Project
lifecycle. The readiness checklist and operations case file require the same evidence.

### BA-06 — Legacy NEAR roadmap conflicts with v2

Status: **Resolved by RFC-005**

The NEAR Track Roadmap now limits wallet infrastructure to Investors and operators, explicitly
states that Farmers do not use wallets or blockchain, uses Opportunity Catalog for the Alpha
discovery demo, and points to alignment with the seven-phase v2 business roadmap instead of Beta.

### BA-07 — Canonical terminology is not defined in one place

Status: **Resolved for architecture freeze**

The architecture uses correct concepts but varies capitalization and scope:

- `External Investor` becomes `Investor`;
- `AgriPartners OÜ` becomes `AgriPartners`;
- `Project` becomes `project`;
- `Farmer Agreement` becomes `farmer agreement`;
- `Pilot` becomes `pilot`;
- `Investment Model` and `Master Investment Model` are not related by a formal definition.

The Operating Model now provides canonical definitions for External Investor/Investor, Master
Investment Model, Project, Investor Funding, Farmer Disbursement, Production Cycle, Settlement,
Pilot 1.0, and Marketplace. Capitalization cleanup may continue as non-blocking editorial debt.

### BA-08 — Funding, Cycle, and Settlement are overloaded

Status: **Resolved for architecture freeze**

- **Funding** can mean Investor funds received by AgriPartners, AgriPartners disbursement to the
  Farmer, or the dashboard funding status.
- **Cycle** can mean an agricultural production Cycle, a financing cycle, or an end-to-end Pilot
  cycle.
- **Settlement** can mean calculation, Investor payment, contractual completion, or an on-chain
  settlement reference.

The Operating Model now separates Investor Funding from Farmer Disbursement, defines Production
Cycle, defines Settlement, and defines Pilot 1.0 as a complete Project lifecycle. The Pilot
Operations Guide remains the detailed owner of financial-state vocabulary.

### BA-09 — Feedlot and Fidlot naming remains dual

Status: **Non-blocking documentation debt**

The Master Investment Model uses `Feedlot (Fidlot)` while Investor Protection and some demo
materials use `Fidlot`. The alias is understandable but no document declares the canonical name
and the legacy alias.

Impact: Project naming, agreement traceability, reporting, and external materials may use
different identifiers for the same model. This does not change the selected Master Investment
Model or block the architecture freeze.

### BA-10 — Agreement provenance is not traceable

Severity: **Medium**

Each Master Investment Model says it is derived from an existing real agricultural agreement but
does not identify a controlled agreement reference, version, date, or internal source record.
The full agreement should remain confidential, but the derivation claim needs traceability to a
controlled source.

### BA-11 — Cross references are valid but asymmetric

Status: **Resolved by RFC-005**

The core Business, Pilot, Platform, and README documents now include bidirectional discovery links
to the Financial Operating Model, Information Disclosure Policy, and both Master Investment
Models where operationally relevant.

### BA-12 — Major decisions are repeated without explicit ownership

Severity: **Medium**

The counterparty decision, Farmer fiat-only rule, and NEAR infrastructure boundary are repeated
in multiple files. Repetition is useful as a safety guardrail, but most copies restate the full
decision rather than naming one normative source.

For example, `legal counterparty` appears across six audited business/Pilot entry-point files, and
the Farmer fiat-only rule appears across six. This creates future drift risk.

### BA-13 — Platform documentation metadata is obsolete

Severity: **Low**

The Platform README says canonical Markdown source is “to be introduced in future,” although
canonical Markdown business documents now exist. Its planned structure also proposes future
funding, treasury, architecture, and roadmap documents without explaining how they relate to the
current canonical Business documents and existing roadmap copies.

### BA-14 — ROI terminology is mostly sound but incomplete

Severity: **Low**

The Master models correctly distinguish target/projected ROI from realized and reconciled ROI and
do not promise fixed returns. The Information Disclosure Policy includes `ROI Progress`, but that
term has no defined calculation or minimum evidence state. The Pilot Operations Guide defines
financial states but not the point at which ROI becomes realized.

### BA-15 — Fee disclosure ownership is incomplete

Severity: **Low**

The Financial Operating Model lists possible platform, project management, success, and future
Marketplace fees. The Information Disclosure Policy does not explicitly list fees and fee
calculation as a mandatory pre-investment disclosure item, although they may be inferred from
Investment Structure and Commercial Terms.

## Terminology Assessment

| Term | Current meaning | Assessment |
| --- | --- | --- |
| Investment Model | Reusable economic and operating pattern; formalized by two Master Investment Models | Green |
| Project | Independent, separately approved and contracted instance created from a Master Investment Model | Green |
| Farmer Agreement | Separate signed agreement between AgriPartners OÜ and the Farmer; confidential by default | Green |
| External Investor | Party investing through and contracting with AgriPartners OÜ; `Investor` is the defined short form | Green |
| AgriPartners OÜ | Legal and operational counterparty to Investor and Farmer | Green, but shorthand `AgriPartners` is not formally scoped |
| Farmer | Agricultural operator contracting only with AgriPartners OÜ and using fiat only | Green |
| Funding | Investor Funding received through selected AgriPartners infrastructure; Farmer Disbursement is separately named | Green |
| Cycle | Production Cycle is one agricultural period inside a Project; Pilot 1.0 is the complete Project | Green |
| Settlement | Approved calculation, reconciliation, and payment process under applicable agreements | Green |
| ROI | Project return metric that must distinguish projected from realized/reconciled | Green/Amber — `ROI Progress` remains undefined |
| Pilot | Controlled pre-Marketplace validation; Pilot 1.0 is one complete Project lifecycle | Green |
| Marketplace | Future Phase 7 public platform only; Alpha discovery UI is the Opportunity Catalog | Green |

## Cross-Reference Assessment

### Broken references

None found in the audited scope.

### RFC-005 reference resolution

The previously missing references are resolved:

- the root README, Documentation Index, and Platform README link both Master Investment Models;
- the Operating, Financial, and Disclosure documents link both models where appropriate;
- the Pilot Plan, Readiness Checklist, and Operations Guide link the Financial Operating Model,
  Information Disclosure Policy, and both Master Investment Models.

## Business Logic Assessment

### Consistent logic

- Investor and Farmer relationships are mediated by AgriPartners OÜ.
- Farmer financial activity is fiat-only.
- There is no direct Investor-to-Farmer payment or agreement.
- AgriPartners controls Project administration, monitoring, reconciliation, reporting, and
  settlement.
- NEAR is supporting infrastructure and does not establish legal settlement by itself.
- Investor reporting must separate projections from completed financial events.
- A Master Investment Model may generate multiple independent Projects.
- Each Project requires separate agreements and approvals.
- Pilot 1.0 excludes the active Investor Protection Framework and a public Marketplace.
- Investor Protection design occurs in Phase 6; activation is gated by Phase 7.

### Resolved architecture logic

- Investor routes may use selected compliant financial infrastructure, including supported
  crypto assets where approved; every Farmer flow remains fiat-only.
- Pilot 1.0 is one complete Project and is not one Production Cycle.
- Marketplace is reserved for Phase 7; the Alpha discovery interface is the Opportunity Catalog.
- Farmers do not use wallets or blockchain, including in current NEAR ecosystem documentation.
- Master Investment Model selection and Project adaptation are required by Pilot documentation.

## Documentation Structure Assessment

### Current hierarchy

```text
README.md
  |
  v
docs/README.md
  |
  +-- docs/business/
  |     +-- OPERATING_MODEL.md
  |     +-- FINANCIAL_OPERATING_MODEL.md
  |     +-- INFORMATION_DISCLOSURE_POLICY.md
  |     `-- investment-models/
  |           +-- FEEDLOT_MASTER_INVESTMENT_MODEL.md
  |           `-- HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md
  |
  +-- docs/platform/
  |     +-- README.md
  |     +-- pilot/
  |     `-- investor-protection/
  |
  `-- roadmap copies and historical technical/product documentation
```

The physical hierarchy is understandable. Business policy belongs under `docs/business`, model
specializations fit under `investment-models`, and Pilot execution is grouped under
`docs/platform/pilot`.

Clearly beneficial remaining improvements:

1. Declare one canonical owner for the business roadmap and label other roadmap files as
   summaries or audience-specific views.
2. Define whether `docs/platform/pilot` is a platform specification or an operations package;
   do not move it until that ownership decision is made.
3. Update obsolete format and planned-structure language in the Platform README.

No file move was required to resolve the RFC-005 architecture blockers.

## Architecture Decisions and Ownership

| Decision | Current normative candidate | Duplication assessment | Verdict |
| --- | --- | --- | --- |
| AgriPartners OÜ is counterparty to both sides | Operating Model | Repeated across core, models, Pilot, and READMEs | Correct but ownership should be explicit |
| Farmer is fiat-only and non-crypto | Operating Model | Repeated broadly as a safety guardrail | Correct and consistent |
| NEAR is infrastructure, not counterparty | Operating Model; financial detail in Financial Operating Model | Repeated in READMEs and Pilot | Correct; split between policy and implementation is reasonable |
| Investor funding and Farmer disbursement route | Financial Operating Model under Operating Model principles | Aligned by RFC-005 | Freezeable at provider-neutral level |
| Disclosure and confidentiality boundary | Information Disclosure Policy | Summarized elsewhere | Clear owner |
| Feedlot reusable model | Feedlot Master Investment Model | Linked from core and Pilot documentation | Integrated |
| Hissar reusable model | Hissar Sheep Master Investment Model | Linked from core and Pilot documentation | Integrated |
| Pilot scope and execution controls | Pilot Plan, Checklist, Operations Guide | Properly split by plan/readiness/procedure | Strong; complete Project and model selection defined |
| Financial-state vocabulary | Pilot Operations Guide | Used implicitly elsewhere | Useful but owner is too narrow |
| Investor Protection deferral | Operating Model business roadmap | Repeated in READMEs and roadmap copies | Consistent |
| Seven-phase business roadmap | Operating Model | Repeated in root, Platform, and pitch roadmaps | Consistent, but canonical ownership is unstated |
| Master Model is not a legal agreement | Each Master Investment Model | Repeated once per model | Appropriate model-specific guardrail |

The architecture now has identifiable normative owners and no remaining conflict among the four
RFC-005 decisions. Safety-critical rules are still repeated in summaries and procedures; this is
acceptable for freeze provided future changes are validated against the Operating Model.

## Technical Debt

### Duplicate concepts

- counterparty relationship repeated across at least six entry-point documents;
- Farmer fiat-only rule repeated across at least six;
- NEAR boundary repeated across Business, Pilot, README, and roadmap documents;
- seven-phase roadmap repeated in four primary locations plus two pitch versions;
- near-identical lifecycle, ROI, risk, and scaling language duplicated between the two Master
  Investment Models.

Some duplication is intentional and safety-relevant. The debt is the absence of a normative-source
label and drift-control rule, not repetition by itself.

### Obsolete wording

- `Beta and Mainnet-readiness expectations` in the root README contribution section;
- canonical Markdown “to be introduced in future” in the Platform README;
- legacy or historical documents outside the canonical architecture may still use earlier product
  terminology and should be updated only when they become current-facing.

### Inconsistent terminology

- Feedlot versus Fidlot;
- AgriPartners OÜ versus AgriPartners;
- capitalization of defined terms in older supporting documents.

### Missing cross references

- No missing cross reference remains among the RFC-005 resolution targets.
- A future authority map may still improve governance across historical and audience-specific
  documents.

### Missing explanations

- authoritative definition of financial Settlement completion;
- `ROI Progress` calculation and evidence state;
- controlled source reference for each original agreement;
- whether possible fees are mandatory pre-investment disclosures.

## Recommendations

### Priority 0 — Architecture freeze gates

All original Priority 0 gates are resolved by RFC-005:

1. Provider-neutral Investor funding route aligned across the architecture.
2. Pilot 1.0 defined as one complete Project lifecycle.
3. Marketplace reserved for Phase 7 and Opportunity Catalog used for Alpha.
4. NEAR Track aligned with Farmer non-crypto and seven-phase roadmap principles.
5. Master Investment Model selection and adaptation integrated into Pilot controls.

### Priority 1 — Resolve before Pilot 1.0 go/no-go

1. Require a controlled source identifier and version for the original agreement behind each
   Master Investment Model without exposing confidential agreement content.
2. Assign the financial-state vocabulary to a business-wide normative source.
3. Make fees and their calculation basis an explicit pre-investment disclosure requirement when
   applicable.
4. Define final operational evidence for completed Settlement and realized ROI.

### Priority 2 — Documentation governance

1. Name one canonical business roadmap source and label other versions as summaries.
2. Add status metadata such as `canonical`, `supporting`, `audience summary`, `historical`, or
   `superseded` to architecture-sensitive documents.
3. Update obsolete Platform README format and planned-structure text.
4. Define a lightweight review rule: a change to a canonical decision must update or validate all
   dependent summaries.
5. Keep common Master Investment Model language aligned while preserving model-specific
   agricultural differences.

## Future Documentation Recommendations

These are recommended document categories, not new business decisions. No document is created by
this audit.

### Business

- Business architecture index and document authority map;
- canonical terminology glossary;
- Master Investment Model governance and Project adaptation standard;
- canonical business roadmap;
- revenue and fee policy once commercial decisions are approved.

### Legal

- controlled Investor Agreement template;
- controlled Farmer Agreement template and Project schedule structure;
- agreement register with identifiers, versions, governing law, and approval status;
- banking/CASP contractual responsibility and custody analysis;
- legal disclosures and risk acknowledgment package.

### Operations

- Project creation and Master Model adaptation procedure;
- Project reporting and evidence standard;
- treasury reconciliation procedure;
- exception, default, complaint, and incident procedures;
- Pilot 2.0 plan and readiness checklist;
- Project closeout and lessons-learned template.

### Platform

- source-of-truth and record-authority map;
- Project/Cycle/Settlement state model;
- on-chain event and data-minimization specification;
- role and access-control mapping;
- business-to-platform traceability matrix.

### Compliance

- jurisdiction and licensing applicability matrix;
- KYC/KYB, sanctions, and source-of-funds policy;
- safeguarding and segregation policy;
- privacy, retention, and data-subject procedure;
- transaction monitoring and suspicious-activity escalation;
- complaints and regulatory reporting procedure.

### Marketplace

- Project admission and listing policy;
- public Marketplace disclosure standard;
- Investor eligibility and access policy;
- Project suspension, default, and delisting policy;
- approved Investor Protection and escrow policy when Phase 6 is complete;
- institutional participation and capital-pool rules when authorized.

## Overall Readiness

| Area | Rating | Reason |
| --- | --- | --- |
| Counterparty architecture | Green | Clear and consistently repeated |
| Farmer fiat-only boundary | Green | Clear in policy and Pilot controls |
| NEAR role | Green | Core and NEAR Track documents preserve the Farmer non-crypto boundary |
| Disclosure architecture | Green | Strong default disclosure and confidentiality rules |
| Master Investment Models | Green | Discoverable and integrated into Pilot selection and adaptation |
| Pilot operations | Green/Amber | Complete Project scope is clear; implementation approvals remain required |
| Financial architecture | Green/Amber | Provider-neutral flow is consistent; final providers and rails remain approval-dependent |
| Terminology | Green/Amber | Freeze-critical terms are controlled; minor editorial normalization remains |
| Cross references | Green | No broken links and RFC-005 inbound references are complete |
| Roadmap | Green | Primary and NEAR Track current-facing language aligns with seven phases |
| Architecture governance | Green/Amber | Normative owners are identifiable; authority-map documentation remains beneficial |

Overall readiness: **Green/Amber — ready for Business Architecture v1.0 Freeze**.

The four RFC-005 architecture decisions are consistent and deterministic enough for a
foundational Business Architecture v1.0 Freeze. This readiness does not authorize real-funds
Pilot execution. Company registration, agreements, provider selection, legal review, compliance,
banking, accounting, safeguarding, and Pilot go/no-go controls remain separate prerequisites.

## Architecture Freeze Recommendation

**Recommendation: Freeze the foundational Business Architecture v1.0 decisions.**

The original freeze gates are resolved:

- the Investor funding route is provider-neutral and supports approved fiat or crypto-asset
  infrastructure while keeping every Farmer flow fiat-only;
- Pilot 1.0 is one complete Project lifecycle and not one Production Cycle;
- Marketplace is reserved for the future Phase 7 public platform;
- Master Investment Model selection and adaptation are integrated into Pilot controls;
- current NEAR roadmap language follows the v2 architecture;
- Master Investment Models are included in the main documentation hierarchy;
- freeze-critical terminology is defined in the Operating Model.

Freeze the following foundational decisions:

- AgriPartners OÜ as the central counterparty;
- Farmer fiat-only participation;
- NEAR as supporting technical infrastructure;
- Investment Model -> independent Project instantiation;
- separate Project agreements;
- disclosure and confidentiality boundaries;
- controlled Pilot-before-Marketplace progression.

Project economics, partner selection, legal terms, compliance implementation, and technical
design remain versioned and approval-dependent rather than frozen as universal rules.

Residual BA-09, BA-10, BA-12, BA-13, BA-14, and BA-15 items are documentation or implementation
debt, not architecture blockers. They should be addressed before the relevant Pilot or public
launch gate where applicable.
