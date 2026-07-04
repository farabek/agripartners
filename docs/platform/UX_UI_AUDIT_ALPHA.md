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
- Investor Entry / Login;
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
| Hissar Sheep Breeding Project Workspace | Reviewed | 9.0/10 | 0 | 7 | 2 | Strong active-Project Workspace; hierarchy, repetition, contextual states, density, and history polish remain. |
| Project Workspace Standardization | Reviewed | 8.4/10 | 0 | 5 | 2 | Strong shared foundation; live and demo composition, hierarchy, section order, duplication, and presentation framing should be unified. |
| Investor Entry / Login | Reviewed | 8.7/10 | 0 | 6 | 3 | Strong role framing and access separation; first-time path choice, wallet trust, support, post-login expectations, and accessibility need refinement. |
| Farmer Journey | Not Reviewed | — | 0 | 0 | 0 | Full journey review pending. |
| Operator Journey | Not Reviewed | — | 0 | 0 | 0 | Full journey review pending. |
| Project Documents | Reviewed in Fidlot and Hissar Workspaces | — | 0 | 0 | 0 | Structure observed; dedicated role and state review still required. |
| Project Activity Feed | Reviewed in Fidlot and Hissar Workspaces | — | 0 | 0 | 0 | Structure observed; dedicated role and empty-state review still required. |
| Returns / Settlement | Reviewed in Fidlot and Hissar Workspaces | — | 0 | 1 | 0 | Returns Ledger currency and unit wording needs normalization. |
| Reports | Reviewed in Fidlot and Hissar Workspaces | — | 0 | 1 | 0 | “Amount used” fallback wording needs improvement. |
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

## Hissar Sheep Breeding Project Workspace

Status: Reviewed

Overall score: **9.0 / 10**

### Strengths

- Excellent Project Timeline visualization.
- Strong Project Workspace structure.
- Clear Investment Summary.
- Good Financial Overview.
- Effective Funding Progress section.
- Well-organized Project Documents.
- Useful Project Activity Feed.
- Good ROI and Returns visualization.
- Event History improves transparency.

### Recommended Improvements

The review priorities below map to the audit backlog as follows: High and Medium are tracked as
P1, while Low is tracked as P2.

#### Priority High

- **UX-HIS-001 · Open · P1** — Reduce visual repetition between card sections.
- **UX-HIS-002 · Open · P1** — Improve page hierarchy between Workspace, Financials, Reports,
  Documents, and History.

#### Priority Medium

- **UX-HIS-003 · Open · P1** — Replace “Not available” with contextual statuses.
- **UX-HIS-004 · Open · P1** — Replace generic “Coming Soon” with meaningful future states.
- **UX-HIS-005 · Open · P1** — Improve empty states, including Returns Ledger and Amount Used.
- **UX-HIS-006 · Open · P1** — Reduce text density inside informational panels.
- **UX-HIS-007 · Open · P1** — Add subtle visual distinction between major sections.

#### Priority Low

- **UX-HIS-008 · Open · P2** — Add icons to Event History.
- **UX-HIS-009 · Open · P2** — Improve readability of long informational blocks.

## Investor Entry / Login

Status: Reviewed

Overall score: **8.7 / 10**

Review perspective: a first-time international Investor who has never used AgriPartners or its
NEAR Testnet access flow.

### Strengths

- Investor-specific heading and explanatory copy establish the role immediately.
- The Investor Path clearly names Projects, Investment Models, and Portfolio as the intended
  product destinations.
- AgriPartners is identified as Project Operator and counterparty, which reinforces the approved
  operating model.
- Alpha, Pilot, and NEAR Testnet context is visible before authentication.
- Public demo access is distinguished from authenticated Testnet access.
- NEAR Wallet and admin-provided Platform Account access are visually separated.
- Create Testnet Wallet, Import Existing Wallet, and the step-by-step guide provide practical
  onboarding options.
- Username and password fields use familiar form patterns and appropriate autocomplete values.
- The narrow layout, responsive wallet-link grid, Back Home link, and role-entry links provide a
  solid baseline for presentation and mobile adaptation.

### Prioritized Findings

| ID | Status | Priority | Description | Evidence | Recommendation | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| UX-ENT-001 | Open | P1 | The Investor Path items “Projects,” “Investment Models,” and “Portfolio” look like selectable destinations but are non-interactive labels, which may weaken CTA clarity. | Current Investor Path section. | Present them explicitly as a post-login preview, or provide one clear destination CTA with secondary navigation that behaves as labeled. | A first-time Investor can correctly identify the primary next action and understands when those destinations become available. |
| UX-ENT-002 | Open | P1 | The page offers NEAR Wallet and Platform Account access without a concise decision rule explaining which method a new Investor should use. | Wallet block and Platform Account Access block. | Add a short “Choose your access method” explanation: recommended path for new Testnet Investors, path for invited users with credentials, and public-demo path for review-only visitors. | In usability review, a new Investor selects the correct route without external explanation. |
| UX-ENT-003 | Open | P1 | “Login with NEAR Wallet” is visually prominent, but the trust explanation does not state what the wallet interaction requests, whether funds or gas are needed, or what signing in proves. | NEAR Wallet CTA and New to AgriPartners information. | Add plain-language wallet trust copy covering authentication purpose, Testnet-only scope, expected signature/redirect, cost expectations, and what AgriPartners does not access. | Wallet onboarding copy answers purpose, scope, cost, and security questions before the Investor leaves AgriPartners. |
| UX-ENT-004 | Open | P1 | Investors without an admin-provided account have no visible way to request access or contact AgriPartners from the login form. | Platform Account Access information. | Add an approved support or access-request path and explain eligibility or invitation expectations without implying automatic investment access. | A user without credentials can identify the correct support or onboarding next step. |
| UX-ENT-005 | Open | P1 | Important accessibility semantics are incomplete: Username and Password labels are not explicitly associated with inputs, the password visibility control uses an unlabeled icon, and login errors do not expose an obvious live-region announcement. | Username/Password form, password toggle, and login error container. | Associate labels and controls, provide an accessible password-toggle name and state, and announce authentication errors appropriately. | Keyboard and screen-reader review confirms named controls, visible focus, understandable toggle state, and announced errors. |
| UX-ENT-006 | Open | P1 | The flow does not clearly preview what happens after wallet authentication or Platform Account sign-in. | Step-by-step guide and both login methods. | State the next screen and likely next step, such as profile creation, assigned Projects, or Investor Dashboard, including what happens when no Project is assigned. | The Investor can describe the expected post-login outcome before authenticating. |
| UX-ENT-007 | Open | P2 | The mix of Alpha, Pilot Entry, NEAR Testnet, “live testnet portal,” profile creation, and Platform Account terminology creates a high cognitive load for an international first-time user. | Header, environment banner, onboarding copy, and guide. | Standardize terminology and add one short glossary-style explanation for unavoidable Alpha/Testnet terms. | Entry copy uses consistent terms and can be understood without prior NEAR knowledge. |
| UX-ENT-008 | Open | P2 | The page stacks role context, environment context, Investor Path, new-user guidance, wallet actions, a guide, and credential login in one narrow column, creating visual density and repeated explanation. | Complete Investor Entry/Login page hierarchy. | Strengthen grouping and progressive disclosure so the recommended first action remains dominant while help and alternate access remain easy to find. | Desktop and mobile reviews show a clear primary CTA, secondary path, and help path without excessive scrolling or repeated copy. |
| UX-ENT-009 | Open | P2 | Create and Import Wallet actions open an external service without explaining the new-tab transition or how the Investor returns to finish login. | Create Testnet Wallet, Import Existing Wallet, and step-by-step guide. | Label the external Testnet wallet destination, mention that it opens in a new tab, and repeat the return-to-login step near both links. | A first-time user completes wallet setup and returns to AgriPartners without losing the onboarding sequence. |

### Summary

The Investor Entry / Login experience is visually consistent with the previously reviewed Alpha
pages and is structurally suitable for a guided demonstration. It communicates role, operator,
counterparty, Alpha, and Testnet boundaries better than a generic authentication screen.

The primary conversion risk is not visual quality; it is path selection. A first-time
international Investor must quickly understand whether to explore the public demo, authenticate
with a Testnet wallet, create or import a wallet, or use credentials supplied by AgriPartners.
Clarifying that decision, strengthening wallet trust language, adding an access/support path,
previewing the post-login destination, and closing accessibility gaps would materially improve
Investor confidence and self-service onboarding. No P0 blocker was identified in this
documentation-only review.

## Project Workspace Review

Status: Reviewed

Overall score: **8.4 / 10**

Review perspective: an Investor opening every current **View Project** destination and expecting
Fidlot, Hissar, other demo instances, and live assigned Projects to behave as instances of one
professional Project Workspace.

### Coverage and Shared Foundation

The review covered both current Investor workspace compositions:

- demo pilot routes rendered through the shared demo-detail renderer, including Fidlot Livestock
  Project, Hissar Sheep Breeding Project, and any additional pilot instance using the same
  renderer;
- authenticated live Project routes rendered from Investor API data.

Both paths reuse the same Project Workspace header, six-stage Timeline, role-aware Project
Financial Overview, Project Activity Feed, and Project Documents components. This is a strong
technical and visual foundation, but the pages do not yet use one complete shared section
composition. Demo and live routes assemble the remaining Funding, Production, Reports, Returns,
History, Protection, and technical content independently.

### Strengths

- A consistent dark visual system, card language, typography, status badges, and spacing makes
  the workspace recognizably part of AgriPartners.
- The shared Timeline communicates Funding, Farmer Confirmation, Production, Reports,
  Settlement, and Completion as one lifecycle.
- Role-aware financial and activity components protect the Investor view from most
  operator-only detail.
- Funding, Production Cycles, Farmer Reports, Returns, Documents, and Event History are all
  represented in the current experience.
- Fidlot and Hissar use the same demo renderer, so Project-specific content does not require a
  separate page design.
- Live Project navigation preserves clear routes back to the Investor Portal and into the
  important Reports, Returns, Activity, and technical areas.
- Protection language is careful and does not imply guaranteed returns.

### Desired Structure Assessment

| Desired section | Current state | Review |
| --- | --- | --- |
| Project Header | Partial | Project name, status, Farmer, Investment Model, and operator are visible. Location is absent, while Investment, ROI, and APR appear later in Profile or Financial cards instead of the primary header. Status and identity are repeated in the route row, Workspace header, Project Profile, and financial overview. |
| Timeline | Present | The lifecycle is clear and shared, but it is nested inside the large Workspace header card rather than operating as a distinct second section. |
| Financial Overview | Present | Shared and role-aware, but it is also nested inside the header and overlaps with Project Profile metrics and Returns summaries. |
| Funding | Present | Demo and live workspaces both expose Funding, although their renderers and unavailable states differ. |
| Production | Present, inconsistent order | Demo pages show Cycle Status before Farmer Reports. Live pages place Farmer Reports before Production Cycles, which breaks the intended lifecycle reading order. |
| Farmer Reports | Present | Report cards are useful, but the surrounding Workspace already includes report-related timeline, financial, activity, and document signals. |
| Returns | Present, duplicated | Returns Management/Summary and a later Returns Ledger both appear. The distinction is valid, but the current hierarchy reads as repeated Returns content rather than summary followed by evidence. |
| Project Documents | Present, misplaced | Documents are shared and useful, but they render inside the Workspace header before Funding, Production, Reports, and Returns. |
| Event History | Present, duplicated | A curated Project Activity Feed appears inside the header and a raw Event History appears near the bottom. Their different purposes are not explained. |

### Duplicated Information

- Project name, status, Project number or Pilot label, and current cycle appear in the route row
  and again in the Workspace header.
- Project status appears in both the header badge and a header metric card.
- Investment, ROI, cycle, and status information is repeated across Project Profile, Project
  Financial Overview, Funding, and Returns sections.
- The Project Activity Feed and Event History both represent lifecycle events without a clear
  “high-level updates versus audit history” distinction.
- Returns Management, Returns Summary, ROI progress, and the Returns Ledger repeat adjacent
  financial concepts before the user reaches the underlying entries.
- Demo pages add a second presentation disclaimer after the environment banner, while live pages
  add Settlement Infrastructure and NEAR Testnet Infrastructure blocks inside the main Investor
  reading flow.

### Presentation-Hostile Wording

The following wording reduces Investor confidence or exposes internal demonstration mechanics:

- “prepared for presentation and screenshot readiness” describes internal QA intent rather than
  the Project;
- “Run Testnet Settlement Action” presents an infrastructure control inside the Investor
  narrative;
- “NEAR Testnet Infrastructure” and technical fields receive the same section weight as
  investment information;
- generic states such as “Project name unavailable,” “Status unavailable,” “Stage unavailable,”
  “Cycle unavailable,” “Date unavailable,” and “Completion: Not available” are visible in shared
  Workspace components;
- “Pilot Profile,” “demo profile,” and repeated Alpha/Testnet warnings compete with the actual
  Project story when shown in several adjacent blocks.

The fallback wording overlaps existing findings
[UX-INV-001](#53-investor-project-workspace--fidlot),
[UX-INV-002](#53-investor-project-workspace--fidlot), and
[UX-HIS-003](#hissar-sheep-breeding-project-workspace). Those findings remain the primary
backlog entries for contextual availability and date labels.

### Prioritized Findings and Recommendations

| ID | Status | Priority | Finding | Evidence | Recommendation | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| UX-WS-001 | Open | P1 | Demo and live **View Project** pages share primitives but use separate body compositions, so section order and emphasis differ by route. | Demo pilot renderer and authenticated live Project renderer. | Create one frontend Project Workspace composition that receives Project-specific data and optional sections while preserving existing route, auth, and data-loading behavior. | Fidlot, Hissar, another demo instance, and one live Project show the same major-section order and visual hierarchy. |
| UX-WS-002 | Open | P1 | The Workspace header is overloaded and does not match the Investor decision hierarchy. Location is absent, while Investment, ROI, and APR are displaced into later or repeated cards. | Shared Workspace header and Project Profile. | Make the first section a compact Project Header with Project Name, Status, Farmer, Location when available, Investment, ROI, and APR; hide fields with no presentation value rather than inventing placeholders. | A first-screen comparison across representative Projects exposes the same decision-ready fields without duplicated status cards. |
| UX-WS-003 | Open | P1 | Major sections do not follow the intended lifecycle order. Activity and Documents appear before Funding, while live Projects place Farmer Reports before Production. | Shared header composition, demo detail order, and live detail order. | Standardize the order as Header, Timeline, Financial Overview, Funding, Production, Farmer Reports, Returns, Project Documents, and Event History. Place optional Protection content after Financial Overview or Funding without interrupting lifecycle order. | DOM/source and rendered reviews confirm the same ordered headings for every **View Project** route. |
| UX-WS-004 | Open | P1 | Repeated identity, status, financial, activity, and Returns content makes the page longer and weakens the distinction between summary and evidence. | Route row, Workspace header, Project Profile, Financial Overview, Activity Feed, Returns Management, Ledger, and Event History. | Keep one summary for each concept. Treat the Activity Feed as concise updates and Event History as expandable audit evidence; treat Returns Overview as the summary and Returns Ledger as supporting records. | An Investor can identify one authoritative summary and one evidence area for each concept without encountering conflicting values. |
| UX-WS-005 | Open | P1 | Internal demo and Testnet mechanics receive primary-page emphasis and can make the Workspace feel like a QA console. | Demo screenshot-readiness notice, Settlement Infrastructure action, and NEAR Testnet Infrastructure section. | Retain necessary Alpha/Testnet disclosure, but move technical controls and raw infrastructure fields into a clearly secondary expandable area. Remove internal screenshot/QA wording from Investor-facing content. | The default Investor view tells the Project story first; technical evidence remains discoverable without dominating the presentation. |
| UX-WS-006 | Open | P2 | Live Projects provide section shortcuts, while demo Projects do not, and the shortcut labels do not map directly to the desired canonical sections. | Live Project section navigation versus demo Project page. | Use one optional sticky or compact section navigation generated from the canonical Workspace sections on all sufficiently long Project pages. | Demo and live pages expose the same labels, anchors, focus behavior, and responsive wrapping. |
| UX-WS-007 | Open | P2 | Protection, disclaimers, technical details, and dense metric groups create a long continuous scroll even when the core Investor story is complete. | Fidlot and Hissar demo workspaces and live Project detail. | Apply progressive disclosure to secondary risk detail, raw ledger evidence, and technical infrastructure while keeping material disclaimers visible. | A desktop and mobile walkthrough reaches Reports and Returns quickly without hiding required risk or authority context. |

### Recommended Canonical Workspace

1. **Project Header** — Project Name, Status, Farmer, Location when present, Investment, ROI,
   and APR.
2. **Timeline** — lifecycle stage, current cycle, next milestone, and meaningful dates.
3. **Financial Overview** — projected values, recorded values, funding state, and settlement
   state without repeating header metrics.
4. **Funding** — funding goal, confirmed amount, progress, and approved context.
5. **Production** — current Production Cycle and operational progress.
6. **Farmer Reports** — approved or submitted Project reports and evidence.
7. **Returns** — concise Returns Overview followed by ledger entries when present.
8. **Project Documents** — approved documents and clear document states.
9. **Event History** — expandable audit history after the Investor-facing narrative.

Protection content should sit contextually after Financial Overview or Funding. Alpha/Testnet
technical evidence should follow Event History in a secondary disclosure area. These additions
should not become extra competing primary sections.

### Summary

The Project Workspace is structurally strong and already has reusable components suitable for
standardization. Its main presentation risk is composition rather than missing capability.
Investors can find the required information, but they must navigate repeated summaries,
different live/demo ordering, early Documents and Activity content, and internal Testnet
mechanics before completing the Project story.

One shared frontend composition, a decision-ready header, canonical lifecycle order, and clear
summary-versus-evidence boundaries would make every current and future Project feel like an
instance of the same professional Workspace. No P0 blocker or backend dependency was identified
in this documentation-only review.

## 6. Open Backlog

### P0

None currently identified from the Landing, Opportunity Catalog, Fidlot Investor Workspace, and
Hissar active Project Workspace reviews or the Investor Entry / Login review.

### P1

- [UX-LND-001](#51-landing) — reduce Landing Hero height.
- [UX-LND-002](#51-landing) — improve Landing long-section compactness.
- [UX-INV-001](#53-investor-project-workspace--fidlot) — replace vague availability labels in
  Project Workspace.
- [UX-INV-002](#53-investor-project-workspace--fidlot) — improve completion-date wording.
- [UX-RPT-001](#54-reports) — improve “Amount used” wording.
- [UX-RET-001](#55-returns--settlement) — normalize Returns Ledger currency and unit wording.
- [UX-HIS-001](#hissar-sheep-breeding-project-workspace) — reduce visual repetition between
  card sections.
- [UX-HIS-002](#hissar-sheep-breeding-project-workspace) — improve major-section hierarchy.
- [UX-HIS-003](#hissar-sheep-breeding-project-workspace) — replace “Not available” with
  contextual statuses.
- [UX-HIS-004](#hissar-sheep-breeding-project-workspace) — replace generic “Coming Soon” with
  meaningful future states.
- [UX-HIS-005](#hissar-sheep-breeding-project-workspace) — improve empty states.
- [UX-HIS-006](#hissar-sheep-breeding-project-workspace) — reduce informational-panel text
  density.
- [UX-HIS-007](#hissar-sheep-breeding-project-workspace) — distinguish major sections
  visually.
- [UX-WS-001](#project-workspace-review) — use one shared live/demo Project Workspace
  composition.
- [UX-WS-002](#project-workspace-review) — make the Project Header decision-ready and remove
  duplicated header information.
- [UX-WS-003](#project-workspace-review) — standardize major sections in lifecycle order.
- [UX-WS-004](#project-workspace-review) — separate concise summaries from supporting evidence
  and remove repeated sections.
- [UX-WS-005](#project-workspace-review) — move internal demo and Testnet mechanics out of the
  primary Investor narrative.
- [UX-ENT-001](#investor-entry--login) — clarify whether Investor Path items are previews or
  actionable destinations.
- [UX-ENT-002](#investor-entry--login) — explain which access method each Investor should use.
- [UX-ENT-003](#investor-entry--login) — strengthen NEAR Wallet trust and scope explanations.
- [UX-ENT-004](#investor-entry--login) — provide an approved support or access-request path.
- [UX-ENT-005](#investor-entry--login) — improve form, password-toggle, and error accessibility.
- [UX-ENT-006](#investor-entry--login) — explain the expected post-login destination and state.

### P2

- [UX-LND-003](#51-landing) — enrich the footer.
- [UX-PRT-001](#56-protection-reserve) — consider a compact or accordion treatment for
  Protection Reserve detail.
- [UX-GEN-001](#57-mobile--responsive) — complete general spacing polish after the full
  user-journey and responsive review.
- [UX-HIS-008](#hissar-sheep-breeding-project-workspace) — add icons to Event History.
- [UX-HIS-009](#hissar-sheep-breeding-project-workspace) — improve long-block readability.
- [UX-WS-006](#project-workspace-review) — align section navigation across live and demo
  Workspaces.
- [UX-WS-007](#project-workspace-review) — use progressive disclosure for secondary risk,
  ledger, and technical detail.
- [UX-ENT-007](#investor-entry--login) — simplify and standardize Alpha/Testnet terminology.
- [UX-ENT-008](#investor-entry--login) — reduce entry-page density and repeated explanation.
- [UX-ENT-009](#investor-entry--login) — clarify external wallet transitions and return steps.

## 7. Review Log

| Date | Area | Evidence | Result |
| --- | --- | --- | --- |
| 2026-07-04 | Landing | Vercel screenshots | Reviewed; score 9.3–9.5/10; two P1 and one P2 findings logged. |
| 2026-07-04 | Opportunity Catalog | Vercel screenshots | Reviewed; score 9.6/10; no P0 findings identified. |
| 2026-07-04 | Fidlot Investor Project Workspace | Vercel screenshots | Reviewed; score 9.8/10; Workspace, Reports, Returns, and Protection findings logged. |
| 2026-07-04 | Hissar Sheep Breeding Project Workspace | Alpha Workspace review | Reviewed; score 9.0/10; seven P1 and two P2 findings logged. |
| 2026-07-04 | Investor Entry / Login | Current Alpha walkthrough and rendered-content review | Reviewed from a first-time international Investor perspective; score 8.7/10; six P1 and three P2 findings logged; no P0 blocker identified. |
| 2026-07-04 | Project Workspace Standardization | Shared frontend renderers and current demo/live **View Project** routes | Reviewed; score 8.4/10; five P1 and two P2 standardization findings logged; no P0 blocker or backend dependency identified. |

Future entries should record the date, product area, evidence source, and resulting finding or
status changes. Existing entries should not be deleted when a finding is fixed; append a new
verification entry and update the finding status.

## 8. Next Review Steps

1. Review the Investor Dashboard.
2. Review the Investor Portfolio.
3. Review the Farmer Dashboard.
4. Review the Farmer Workspace.
5. Review the Operator Dashboard.
6. Review the Operator Workspace.
7. Complete the Responsive Review.
8. Complete the Mobile Review.
9. Complete Demo Readiness.
