# AgriPartners Alpha UX/UI Audit Log

Status: Living product-review log

Last updated: 2026-07-04

Product baseline: AgriPartners Alpha

## 1. Purpose

This document tracks UX/UI findings identified during AgriPartners Alpha product walkthroughs,
Vercel screenshot reviews, and role-based journey reviews.

The log is the shared record for observations that should be addressed in focused UX polish
sprints. It separates review findings from immediate implementation work so that issues can be
prioritized, assigned, fixed, and verified without losing their original review context.

This is a product-review artifact, not a launch approval, technical specification, or replacement
for the Project Workspace and Pilot implementation plans. Scores are directional assessments of
the reviewed Alpha experience at the time of review.

## 2. Review Scope

The Alpha review covers:

- Landing;
- Opportunity Catalog;
- Investor Project Workspace;
- Farmer Journey;
- Operator Journey;
- Project Documents;
- Project Activity Feed;
- Returns / Settlement;
- Reports;
- Mobile / Responsive.

Each area should be reviewed across relevant populated, empty, unavailable, restricted, error,
and responsive states. A reviewed desktop screenshot does not by itself complete the mobile or
end-to-end role review.

## 3. Audit Status Summary

| Area | Status | Score | Open P0 | Open P1 | Open P2 | Notes |
| --- | --- | --- | ---: | ---: | ---: | --- |
| Landing | Reviewed | 9.3–9.5/10 | 0 | 2 | 1 | Strong presentation; height, long-section density, and future footer enrichment remain. |
| Opportunity Catalog | Reviewed | 9.6/10 | 0 | 0 | 0 | Clear positioning, strong Project cards, visible status and funding context. |
| Investor Project Workspace — Fidlot | Reviewed | 9.8/10 | 0 | 2 | 0 | Strong end-to-end Workspace structure; some unavailable and date wording needs refinement. |
| Farmer Journey | Not Reviewed | — | 0 | 0 | 0 | Full journey review pending. |
| Operator Journey | Not Reviewed | — | 0 | 0 | 0 | Full journey review pending. |
| Project Documents | Reviewed in Fidlot Workspace | — | 0 | 0 | 0 | Structure observed; dedicated role and state review still required. |
| Project Activity Feed | Reviewed in Fidlot Workspace | — | 0 | 0 | 0 | Structure observed; dedicated role and empty-state review still required. |
| Returns / Settlement | Reviewed in Fidlot Workspace | — | 0 | 1 | 0 | Returns Ledger currency and unit wording needs normalization. |
| Reports | Reviewed in Fidlot Workspace | — | 0 | 1 | 0 | “Amount used” fallback wording needs improvement. |
| Mobile / Responsive | Not Reviewed | — | 0 | 0 | 1 | General spacing polish should follow the complete responsive journey review. |
| Protection Reserve | Reviewed | — | 0 | 0 | 1 | Strong risk language; detailed content may benefit from progressive disclosure. |

Counts represent currently logged findings. Findings should not be duplicated across rows when
one issue affects more than one area; the row containing the issue's primary owner holds the
count.

## 4. Findings Format

Every finding should use the following fields:

| Field | Meaning |
| --- | --- |
| ID | Stable identifier used in backlog, sprint, and verification references. |
| Area | Primary product area that owns the finding. |
| Status | Current resolution state. |
| Priority | Demonstration and product impact. |
| Finding | Concise description of the observed UX/UI issue. |
| Evidence | Screenshot, walkthrough, route, role, or state in which it was observed. |
| Recommendation | Preferred direction for a future fix. |
| Verification | Evidence required before marking the finding Fixed. |

### Finding Statuses

- **Open** — confirmed finding with no completed fix.
- **In Progress** — included in an active implementation or UX polish sprint.
- **Fixed** — implemented and verified against the relevant view and state.
- **Deferred** — intentionally postponed with the reason and future review trigger recorded.

Area-level review statuses such as **Reviewed** and **Not Reviewed** describe audit coverage; they
do not replace the finding statuses above.

### Priorities

- **P0** — blocks the Pilot 1.0 demonstration.
- **P1** — important before an Investor or partner demo.
- **P2** — polish after the demo.

A finding may change priority when new evidence expands or reduces its impact. Any change should
be recorded in the Review Log.

## 5. Current Findings

### 5.1 Landing

Area status: Reviewed

Score: 9.3–9.5/10

| ID | Status | Priority | Finding | Evidence | Recommendation | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| UX-LND-001 | Open | P1 | The Hero section is visually strong but tall. | Vercel Landing screenshots. | Consider reducing its vertical height by approximately 15–20% while preserving hierarchy and primary actions. | Compare desktop before/after screenshots and confirm key content remains above the fold. |
| UX-LND-002 | Open | P1 | Financial Models and Protection sections are strong but long. | Vercel Landing screenshots. | Consider more compact spacing or a collapsible summary treatment in a later polish sprint. | Review the full desktop scroll and confirm no important explanation or disclaimer is hidden. |
| UX-LND-003 | Open | P2 | The footer could provide richer product and project navigation. | Vercel Landing screenshots. | Consider links for Platform, Documentation, GitHub, Version, Contact, and NEAR Testnet. | Verify links, responsive wrapping, and consistency with Alpha positioning. |

### 5.2 Opportunity Catalog

Area status: Reviewed

Score: 9.6/10

Strengths:

- clear Opportunity Catalog positioning;
- strong Project cards;
- visible Project status;
- visible funding progress and ROI;
- clear **View Project** call to action.

No current P0 issues or other open findings are identified from this review.

### 5.3 Investor Project Workspace — Fidlot

Area status: Reviewed

Score: 9.8/10

Strengths:

- strong flow from the Opportunity Catalog to the Project Workspace;
- clear Project Header and Timeline;
- clear Financial Overview and Project Documents;
- visible Funding and Protection context;
- clear Returns, Reports, Ledger, and Event History sections.

| ID | Status | Priority | Finding | Evidence | Recommendation | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| UX-INV-001 | Open | P1 | Some values use the vague fallback “Not available.” | Fidlot Investor Workspace screenshots. | Replace vague values with clearer role-appropriate labels where the state or source is known. | Review all Fidlot Workspace fallback labels in populated and unavailable states. |
| UX-INV-002 | Open | P1 | The Workspace may show “Completion Date unavailable” even when a recorded date exists or a more precise state is possible. | Fidlot Investor Workspace screenshots. | Show the recorded completion date where available; otherwise use “Recorded” when the event exists but its exact date is unavailable. | Verify completed Project timeline and summary dates against the available Project records. |

### 5.4 Reports

| ID | Status | Priority | Finding | Evidence | Recommendation | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| UX-RPT-001 | Open | P1 | “Amount used: Not provided” is vague and may imply missing reporting. | Fidlot Investor Workspace Farmer Report screenshot. | Use clearer wording such as “Available in detailed report” or “Reported by Farmer” where appropriate. | Verify wording against reports with and without a detailed amount breakdown. |

### 5.5 Returns / Settlement

| ID | Status | Priority | Finding | Evidence | Recommendation | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| UX-RET-001 | Open | P1 | The Returns Ledger shows “82000.00 NEAR,” which may confuse users when the Investment Model is presented in USD. | Fidlot Investor Workspace Returns Ledger screenshot. | Normalize the display to USD, an approved USDT equivalent, or an explicit Demo Value label consistent with the Project financial presentation. | Confirm the same unit and authority language across Financial Overview, Returns Summary, Ledger, and Settlement views. |

### 5.6 Protection Reserve

Area status: Reviewed

Strengths:

- strong risk language;
- clear disclaimers;
- does not imply guaranteed returns.

| ID | Status | Priority | Finding | Evidence | Recommendation | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| UX-PRT-001 | Open | P2 | Detailed Protection Reserve content adds substantial page length. | Landing and Fidlot Investor Workspace screenshots. | Consider a more compact or expandable treatment later without weakening risk language or disclaimers. | Verify that all material caveats remain discoverable on desktop and mobile. |

### 5.7 Mobile / Responsive

Area status: Not Reviewed

| ID | Status | Priority | Finding | Evidence | Recommendation | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| UX-GEN-001 | Open | P2 | General spacing polish should follow the complete role and responsive journey review. | Initial desktop screenshot review; responsive evidence pending. | Review spacing as one cross-product pass after all desktop and mobile journeys have been assessed. | Verify representative Landing, Catalog, Workspace, document, activity, report, and Settlement views at supported breakpoints. |

## 6. Open Backlog

### P0

None currently identified from the Landing, Opportunity Catalog, and Fidlot Investor Workspace
review.

### P1

- [UX-LND-001](#51-landing) — reduce Landing Hero height.
- [UX-LND-002](#51-landing) — improve Landing long-section compactness.
- [UX-INV-001](#53-investor-project-workspace--fidlot) — replace vague availability labels in
  Project Workspace.
- [UX-INV-002](#53-investor-project-workspace--fidlot) — improve completion-date wording.
- [UX-RPT-001](#54-reports) — improve “Amount used” wording.
- [UX-RET-001](#55-returns--settlement) — normalize Returns Ledger currency and unit wording.

### P2

- [UX-LND-003](#51-landing) — enrich the footer.
- [UX-PRT-001](#56-protection-reserve) — consider a compact or accordion treatment for
  Protection Reserve detail.
- [UX-GEN-001](#57-mobile--responsive) — complete general spacing polish after the full
  user-journey and responsive review.

## 7. Review Log

| Date | Area | Evidence | Result |
| --- | --- | --- | --- |
| 2026-07-04 | Landing | Vercel screenshots | Reviewed; score 9.3–9.5/10; two P1 and one P2 findings logged. |
| 2026-07-04 | Opportunity Catalog | Vercel screenshots | Reviewed; score 9.6/10; no P0 findings identified. |
| 2026-07-04 | Fidlot Investor Project Workspace | Vercel screenshots | Reviewed; score 9.8/10; Workspace, Reports, Returns, and Protection findings logged. |

Future entries should record the date, product area, evidence source, and resulting finding or
status changes. Existing entries should not be deleted when a finding is fixed; append a new
verification entry and update the finding status.

## 8. Next Review Steps

1. Review the Hissar active Project Workspace.
2. Review the Investor Pilot Entry and dashboard.
3. Review the Farmer Journey.
4. Review the Operator Journey.
5. Review mobile and responsive views.
