<!-- markdownlint-configure-file { "MD013": false } -->

# AgriPartners Workstream Operating Model

Status: Accepted

Owner: Product

Document type: Canonical repository operating governance

Last reviewed: 2026-07-18

## Purpose and authority

This document defines how substantial repository work is classified and coordinated across the
three permanent AgriPartners workstreams. Repository-root [`AGENTS.md`](../../AGENTS.md) contains
the short mandatory instructions for compatible AI agents; this document owns the complete
workstream model.

Domain-specific sources retain authority over their facts. This model does not replace product,
release, business, grant-program, planning, or relationship records.

## Current project phase

AgriPartners is in the **Alpha v1.2 Presentation Phase**. The current business objective is to
secure external funding and prepare for the first commercial pilot through three parallel areas
of focus:

- grant readiness and funding opportunities;
- NEAR ecosystem, investor, and partner relationships;
- focused product refinement supporting demonstrations, applications, partnerships, and pilot
  readiness.

These areas are not a mandatory priority ranking and may progress at different speeds. Alpha v1.2
is a Testnet demonstration and presentation release, not a production, Mainnet, real-funds, or
commercially operational release. The [Release Index](../RELEASES.md) and its linked release
records remain authoritative for release status and limitations.

Commercial Beta development, including Beta-02 implementation and new Commercial Operations
backend architecture, remains intentionally postponed unless the user explicitly authorizes it
after funding, grant approval, or confirmation of the first commercial pilot. Planned roadmap
content does not itself authorize implementation.

## Repository philosophy

Repository work should improve funding, investor, grant, partnership, pilot, or demonstration
readiness rather than maximize feature, code, or document count. Do not write code merely to show
progress, begin Beta work merely to expand scope, or create a document when an existing canonical
source can be updated clearly.

When refinement and expansion would both satisfy an authorized request, prefer the smallest
refinement that achieves the requested outcome. This principle guides implementation choices but
does not override an explicit request, expand authorization, or replace a domain-specific source
of truth.

Governance must remain proportionate to a concrete coordination, authority, or consistency need.
It supports the three workstreams; it is not a fourth workstream or a substitute for delivery.

## Permanent workstreams

### AgriPartners Product

Purpose: maintain and improve the product and its demonstration experience.

Scope includes frontend, backend, NEAR smart contracts, UX/UI, product architecture, automated
tests, product documentation, demo workflows, QA, and presentation-readiness improvements.

During the current phase, Product work should emphasize bug fixes, reliability, presentation
clarity, and small improvements supporting grants, relationships, demonstrations, or pilot
readiness. Large production systems, speculative features, Beta-02, and new Commercial Operations
backend architecture require explicit authorization.

### NEAR Ecosystem & Investor Relations

Purpose: build and maintain relationships with NEAR ecosystem participants, investors, partners,
and relevant decision-makers.

Scope includes contact research, LinkedIn outreach, personalized invitations, follow-ups, investor
and ecosystem communication, relationship management, meeting preparation, partnership outreach,
and CRM maintenance.

The [Relationship CRM](../outreach/outreach-crm.md) is the canonical source for outreach activity.
Read it before outreach, preserve permanent IDs and history, record only confirmed interactions,
and reconcile its dashboards after relevant changes. Detailed mandatory rules remain in
`AGENTS.md` and the CRM.

### Grants & Strategy

Purpose: identify, prioritize, prepare, submit, and manage grants and strategic funding
opportunities.

Scope includes research, eligibility, prioritization, applications, executive summaries, budgets,
milestones, KPIs, timelines, deliverables, risks, supporting evidence, submission readiness, and
funding strategy.

Verify current program requirements before relying on them, distinguish verified requirements
from assumptions, reuse canonical product and investor materials, and never promise unsupported
functionality, traction, revenue, legal readiness, or production readiness. Priority opportunities
should record a status, deadline, dependencies, requested amount, and next action.

No canonical grant-opportunity register is currently designated. Existing grant applications,
research, and ecosystem mapping are supporting materials, not a unified operational register.
Creating and registering such a record requires a separate authorized task.

## Workstream decision priority

For a request spanning multiple workstreams:

1. Determine the concrete outcome requested by the user.
2. Select the workstream owning that outcome as primary.
3. Treat the origin of information as context, not automatic ownership.
4. Minimize changes outside the primary workstream.
5. Report secondary implementation as a dependency or follow-up.
6. Never use classification to expand the authorized scope.

Examples:

| Requested outcome | Primary workstream | Secondary or handoff |
| --- | --- | --- |
| Improve Investor Portal UI | AgriPartners Product | None unless outreach material must change |
| Prepare a Protocol Rewards application | Grants & Strategy | Product evidence when required |
| Send a follow-up to a NEAR contact | NEAR Ecosystem & Investor Relations | None |
| Record and assess investor feedback | NEAR Ecosystem & Investor Relations | Product follow-up when warranted |
| Implement an improvement requested by an investor | AgriPartners Product | Investor Relations context |
| Use confirmed investor feedback in a grant application | Grants & Strategy | Investor Relations evidence |

If the outcome remains materially ambiguous after repository review, ask the user before making
material changes.

## Task classification and boundaries

Before material changes on a substantial task, report:

- primary workstream;
- objective;
- canonical documents to read;
- affected secondary workstream, if any.

Formal classification is unnecessary for trivial edits, read-only inspection, conversational
analysis, status questions, or corrections that do not affect project direction. Classification
is informational and does not authorize secondary-workstream changes. Keep unrelated workstreams
out of the same commit and recommend a separate task when a handoff requires material work.

## Canonical planning rule

Planning information should have one clearly designated canonical location. Before creating a
roadmap, opportunity list, release plan, grant tracker, or implementation plan, check whether an
existing canonical document already owns the information.

| Planning scope | Current canonical location |
| --- | --- |
| Software delivery | [Software Delivery Roadmap](../ROADMAP.md) |
| Cross-domain strategic sequencing | [Master Roadmap v2](../MASTER_ROADMAP_V2.md) |
| Release identity and history | [Release Index](../RELEASES.md) |
| Outreach pipeline and next actions | [Relationship CRM](../outreach/outreach-crm.md) |
| Grant-opportunity pipeline | Not currently designated |

Update an existing authority instead of creating a parallel plan unless the user requests a
separate artifact for a distinct purpose or audience. Derived summaries may coexist, but must not
silently become competing sources of truth. When no owner exists, report the gap and recommend an
owner before creating a permanent planning document.

## Parallel workstream model

The workstreams may progress in parallel without receiving equal time or advancing every day.
Optional time allocation is planning guidance, not a schedule, quota, ranking, or authorization.
Do not create unrequested work to fill time or treat inactivity in one workstream as a problem.

## Governance stability

Keep this model stable. Change it only when repository authority, permanent workstream
responsibilities, project phase, workstream boundaries, release governance, canonical planning
ownership, or a permanent operating principle materially changes.

Temporary priorities, individual opportunities, routine statuses, and short-term plans belong in
their domain-specific records. Avoid editorial refinement that does not materially improve
coordination, authority clarity, or execution safety.

## Completion reporting

After a substantial task, report:

1. Primary workstream.
2. Secondary workstream, if any.
3. Objective completed.
4. Files modified.
5. Validation performed.
6. Cross-workstream handoff required.
7. Recommended next action.

Short or read-only tasks may use a shorter report when the full structure adds no useful context.
