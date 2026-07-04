# AgriPartners Alpha Product Review Checklist

Status: In Progress

Last updated: 2026-07-04

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

| Area | Status | Reviewer | Notes |
| --- | --- | --- | --- |
| Landing | ✓ Reviewed | Product Review | Reviewed from Alpha/Vercel screenshots. Findings are recorded in the UX/UI Audit Log. |
| Opportunity Catalog | ✓ Reviewed | Product Review | Catalog positioning, Project cards, status, funding, ROI, and primary action reviewed. |
| Feedlot Project Workspace | ✓ Reviewed | Product Review | Investor Workspace flow and supporting sections reviewed. |
| Hissar Project Workspace | Pending | — | Review the active Project state and incomplete lifecycle. |
| Investor Dashboard | Pending | — | Review entry points, priorities, navigation, and unavailable states. |
| Investor Portfolio | Pending | — | Review aggregation, financial semantics, and routes into Project Workspaces. |
| Farmer Dashboard | Pending | — | Review Farmer priorities, fiat-only language, and Project entry points. |
| Farmer Workspace | Pending | — | Review funding confirmation, Production Cycles, reports, actions, and role visibility. |
| Operator Dashboard | Pending | — | Review operational prioritization, alerts, pending work, and Project entry points. |
| Operator Workspace | Pending | — | Review controls, approvals, confirmations, exceptions, and internal visibility. |
| Responsive Review | Pending | — | Review supported breakpoints across core product journeys. |
| Mobile Review | Pending | — | Review navigation, density, readability, actions, and overflow on mobile layouts. |
| Demo Readiness | Pending | — | Complete the final cross-role Alpha demonstration walkthrough. |

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
