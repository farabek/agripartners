# AgriPartners Alpha Product Review Checklist

Status: In Progress

Last updated: 2026-07-05

## 1. Purpose

This checklist tracks Product Review progress during the AgriPartners Alpha phase. It shows which
product areas have been reviewed and which areas still require review.

Review progress and review findings are maintained separately:

- this checklist records whether each product area has been reviewed;
- the [Alpha UX/UI Audit Log](UX_UI_AUDIT_ALPHA.md) records findings, priorities, evidence,
  recommendations, and resolution status.

Completing an item means the area has been reviewed against the rules below. It does not mean
that every finding for that area has been fixed.

## 2. Review Progress

**Progress:** 6 of 15 review sections completed (**40%**)

**Estimated remaining:** 9 review sections

**Next Review:** → **Investor Dashboard**

| Area | Status | Reviewer | Notes |
| --- | --- | --- | --- |
| Landing | ✓ Reviewed | Product Review | Reviewed from Alpha/Vercel screenshots. Findings are recorded in the UX/UI Audit Log. |
| Opportunity Catalog | ✓ Reviewed | Product Review | Catalog positioning, Project cards, status, funding, ROI, and primary action reviewed. |
| Feedlot Workspace | ✓ Reviewed | Product Review | Investor Workspace flow and supporting sections reviewed. |
| Hissar Active Workspace | ✓ Reviewed | Product Review | Active Project state, lifecycle, financials, documents, activity, returns, and history reviewed. |
| Project Workspace Review | ✓ Reviewed | Product Review | Shared live and demo View Project layouts reviewed for hierarchy, section order, duplication, readability, and presentation quality. |
| Investor Entry / Login | ✓ Reviewed | Product Review | Reviewed from a first-time international Investor perspective; findings recorded in the UX/UI Audit Log. |
| Investor Dashboard | → Next Review | — | Review entry points, priorities, navigation, and unavailable states. |
| Investor Portfolio | Pending | — | Review aggregation, financial semantics, and routes into Project Workspaces. |
| Farmer Dashboard | Pending | — | Review Farmer priorities, fiat-only language, and Project entry points. |
| Farmer Workspace | Pending | — | Review funding confirmation, Production Cycles, reports, actions, and role visibility. |
| Operator Dashboard | Pending | — | Review operational prioritization, alerts, pending work, and Project entry points. |
| Operator Workspace | Pending | — | Review controls, approvals, confirmations, exceptions, and internal visibility. |
| Responsive Review | Pending | — | Review supported breakpoints across core product journeys. |
| Mobile Review | Pending | — | Review navigation, density, readability, actions, and overflow on mobile layouts. |
| Demo Readiness | Pending | — | Complete the final cross-role Alpha demonstration walkthrough. |

### Specification Deliverables

Specification deliverables support the review program but do not change the review-stage
completion percentage above.

| Deliverable | Status | Notes |
| --- | --- | --- |
| [Canonical Workspace Specification](CANONICAL_PROJECT_WORKSPACE_SPEC.md) | ✓ Completed | Single source of truth for the structure, hierarchy, role visibility, empty states, environment rules, consistency, and acceptance criteria of every **View Project** Workspace. |
| [Canonical Farmer Experience Specification](CANONICAL_FARMER_EXPERIENCE_SPEC.md) | ✓ Completed | Single source of truth for the Farmer journey, Dashboard, Project Workspace, daily priorities, role visibility, empty states, notifications, mobile experience, and acceptance criteria. |
| [Farmer Daily Workflow Specification](FARMER_DAILY_WORKFLOW_SPEC.md) | ✓ Completed | Operational blueprint for daily Farmer priorities, tasks, notifications, active Project work, mobile behavior, UX principles, and acceptance criteria. |

## 3. Review Rules

Each product-area review should answer:

- Is the workflow understandable?
- Is navigation clear?
- Are role permissions correct?
- Is information sufficient?
- Are there UX blockers?

Reviewers should record evidence and findings in the
[Alpha UX/UI Audit Log](UX_UI_AUDIT_ALPHA.md). Any P0 finding must be highlighted immediately
because it blocks the Pilot 1.0 demonstration.

## 4. Completion Criteria

Product Review is complete when every checklist item is marked **Reviewed**.

Open P1 or P2 findings may remain after review completion when they are recorded in the audit
log with an owner or future sprint. Open P0 findings prevent Demo Readiness from being marked
Reviewed.
