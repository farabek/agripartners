# AgriPartners Software Delivery Roadmap

Status: Accepted

Document owner: Product

Document type: Canonical living roadmap

Last reviewed: 2026-07-06

## Purpose and Scope

This document is the single living roadmap for AgriPartners software delivery. It records
release objectives, completed work, and planned work at a level suitable for cross-functional
coordination.

This delivery roadmap does not replace the frozen business roadmap. Alpha, Company
Registration, Pilot 1.0, Pilot 2.0, Production Ready, Investor Protection, and Marketplace are
business maturity phases defined by the
[Business Architecture v1.0 Freeze](business/BUSINESS_ARCHITECTURE_V1_FREEZE.md). A software
release does not authorize progression through a business phase or real-funds activity.

Items are complete only when supported by current implementation or an accepted release record.
Planned items are directional and require normal review, acceptance criteria, and validation.

## Alpha v1.2

### Objectives

- Provide a working Alpha demonstration of transparent agricultural investment workflows.
- Present Investor, Farmer, and Operator/Admin experiences.
- Validate wallet-linked and NEAR Testnet workflow concepts.
- Make product limitations and non-production boundaries explicit.

### Completed Work

- Public landing and Opportunity Catalog demonstration.
- Investor, Farmer, and Admin portals.
- Wallet authentication and NEAR Testnet integration.
- Project/deal lifecycle, reporting, and return-record workflows.
- Treasury Dashboard and non-authoritative Treasury Shadow Accounting.
- Presentation Mode for stakeholder-specific demonstrations.
- Alpha v1.2 release, investor, NEAR, and developer-review documentation.
- Frozen Business Architecture v1.0 and Product Operating Model v1.0.
- Accepted canonical Project Workspace and Farmer Experience specifications.

See the [Alpha v1.2 Release Notes](releases/alpha-v1.2-release-notes.md) for the release record.

### Planned Work

- Complete the Alpha Product Review and record all unresolved findings.
- Keep public claims, demonstration data, and current technical evidence synchronized.
- Establish these top-level canonical documentation entry points and governance rules.
- Convert accepted product specifications into a prioritized Beta backlog.

## Beta v1.0

### Objectives

- Establish a coherent project-centric product experience.
- Converge dashboards and Project views on the canonical Project Workspace.
- Strengthen role clarity, navigation, responsive behavior, and demo/live separation.

### Completed Work

- Product Operating Model v1.0 is frozen.
- Canonical Investor Project Workspace and Farmer Experience specifications are accepted.
- Farmer daily workflow and Product Review foundations are documented.

These are design and governance foundations; they do not mean Beta v1.0 is released.

### Planned Work

- Complete Product Review across Investor, Farmer, Operator, responsive, mobile, and demo areas.
- Implement one stable Project identity and lifecycle vocabulary across roles.
- Align role dashboards with the canonical Project Workspace.
- Implement role visibility, empty states, documents, activity, tasks, and status semantics from
  accepted specifications.
- Remove inappropriate legacy `deal`, Marketplace, crypto, and Investor-return language from
  Farmer-facing workflows.
- Improve frontend maintainability and preserve strict separation between live and demonstration
  data.
- Define Beta v1.0 acceptance evidence and publish release notes when complete.

## Beta v1.1

### Objectives

- Improve trust, evidence, and financial-state clarity.
- Make operational status and exceptions reviewable.
- Strengthen reconciliation and Treasury confidence without overstating authority.

### Completed Work

- Treasury, typed-return, and reconciliation design documents exist.
- ADR-001 establishes the accepted live-first boundary.
- ADR-002 provides a proposed financial-semantics model for review.

These documents are design inputs; proposed decisions and unimplemented designs are not
completed product work.

### Planned Work

- Review and accept or revise financial semantics before presenting authoritative realized
  metrics.
- Define typed return and payment lifecycle acceptance criteria.
- Implement evidence/reference handling and reconciliation status where approved.
- Add Operator queues, filters, review states, exception handling, and audit-ready history.
- Improve PostgreSQL/NEAR synchronization visibility and recovery from partial failures.
- Add shared authentication challenge storage, stricter security controls, redacted logging,
  rate limits, and environment-safe configuration.
- Add reproducible CI and canonical Testnet contract/build/transaction evidence.

## Beta v1.2

### Objectives

- Prepare the software and operating workflows for controlled Pilot 1.0 readiness review.
- Validate a complete Project lifecycle in a constrained environment.
- Produce reliable operational, support, and stakeholder evidence.

### Completed Work

- The Pilot 1.0 Plan, mandatory readiness checklist, and working operations guide exist.
- Business and Product architecture baselines are frozen.
- Master Investment Models and financial-model publications exist.

These are prerequisites and plans; Pilot approval and execution are not complete.

### Planned Work

- Satisfy the applicable
  [Pilot Readiness Checklist](platform/pilot/PILOT_READINESS_CHECKLIST.md) with named owners and
  reviewable evidence.
- Adapt the
  [Pilot Operations Guide](platform/pilot/PILOT_OPERATIONS_GUIDE.md) to approved legal, banking,
  accounting, compliance, and operational requirements.
- Rehearse one complete Project lifecycle with controlled data and documented exceptions.
- Validate role permissions, disclosures, reports, financial states, reconciliation, and
  Settlement handoffs.
- Establish monitoring, incident response, backup, recovery, support, and operational ownership.
- Resolve deployment ownership and publish reproducible environment validation evidence.
- Complete legal, security, compliance, and smart-contract reviews required by the Pilot
  go/no-go process.

## Release Candidate

### Objectives

- Freeze a reviewable candidate for the approved delivery scope.
- Demonstrate repeatable validation and documented operational readiness.
- Support an explicit go/no-go decision without implying Production Ready or Mainnet approval.

### Completed Work

- No Release Candidate has been declared.

### Planned Work

- Freeze source revision, dependencies, migrations, configuration inventory, and release
  artifacts.
- Pass backend tests, frontend build, contract validation, link checks, and security review
  required for the candidate.
- Complete end-to-end role and Project lifecycle acceptance testing.
- Verify data migration, backup, recovery, observability, alerting, and rollback procedures.
- Publish known limitations, unresolved risks, and release notes.
- Record approvals and evidence required by the relevant Pilot or business go/no-go process.
- Keep Mainnet, production investment, custody, and real-funds claims out of scope unless
  separately authorized.

## Roadmap Governance

- Product owns this roadmap and coordinates cross-domain updates.
- Completed work must link to implementation or an accepted release record.
- Business, financial, legal, and Pilot gates remain owned by their canonical documents.
- Engineering design documents may inform planned work but do not mark it complete.
- Material scope changes must update this roadmap and affected canonical documents together.
- Release history belongs in [Releases](RELEASES.md); detailed specifications belong in their
  owning documents.
