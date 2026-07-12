<!-- markdownlint-configure-file { "MD013": false, "MD036": false } -->

# Beta Product Readiness Audit v1.0

Status: Ready for Product review

Audit date: 2026-07-12

Perspective: First-time investor

Scope: Home → Opportunity Catalog → Hissar Demonstration Project → Project Workspace → Project
Reports → Project Documents → Returns → Investor Dashboard

## 1. Executive Summary

AgriPartners has a credible self-guided product skeleton. A first-time investor can understand
that it is an Alpha demonstration on NEAR Testnet, that AgriPartners is the central Project
Operator, and that Projects are intended to progress through funding, production, reporting,
returns, and settlement. Home, the Opportunity Catalog, the canonical Project Workspace tabs,
and the Portfolio Dashboard form a coherent journey without requiring registration.

The product is not yet ready for an unsupported investor demonstration where trust must come from
the evidence on screen. The active Hissar Project is the most important proof point, but its
Reports tab contains no submitted Farmer Report, no photographs, no dated operational evidence,
and no attachments. Its Documents tab mostly exposes draft previews or unavailable records, and
its Returns view shows projected totals without explaining the underlying calculation or payout
schedule. These gaps make the product describe the intended workflow more convincingly than it
demonstrates a real Project progressing through that workflow.

Overall investor readiness score: **6.8/10**.

Recommended demonstration posture: suitable for a founder-led Alpha walkthrough; not yet strong
enough for a first-time investor to complete the full journey alone and leave with diligence-level
confidence.

### Audit method and limitation

The frontend was launched successfully from the current repository. The audit reviewed the
rendered route structure, visible labels, actions, status states, Project data, navigation, and
responsive presentation rules represented by the running frontend implementation. Interactive
browser control was unavailable in the audit environment, so visual-first judgments are based on
the rendered component hierarchy and styles rather than captured browser screenshots. No product
or data state was changed.

## 2. Investor Journey

| Step | Route or surface | Investor question | Current answer |
| --- | --- | --- | --- |
| 1 | Home | What is AgriPartners and can I explore safely? | Clear: agricultural Project operations platform, Alpha v1.1, NEAR Testnet, no live investment, no registration required. |
| 2 | Opportunity Catalog | What can I compare? | Two $50,000 livestock Projects with ROI, APR, cycles, funding, status, and protection links. |
| 3 | Hissar Project | Why is this the active example? | Active Project, cycle 1 of 6, projected 63.3% ROI and 21.1% APR; the reason to choose it first is not explained on the catalog. |
| 4 | Project Workspace | What am I investing in and what is happening now? | Sheep breeding Project with operator, farmer identifier, financial dashboard, six-stage timeline, and tabbed operating record. |
| 5 | Project Reports | Is the Project demonstrably progressing? | No report is yet submitted; the page explains the future location but provides no operational evidence. |
| 6 | Project Documents | Can I perform diligence? | Document categories and legal previews are organized, but most key items remain Draft, Review, or Not Yet Published. |
| 7 | Returns | When and how do I earn money? | Projected payout and current outstanding balance are visible; calculation, cash-flow schedule, and payment mechanics are not sufficiently explained. |
| 8 | Investor Dashboard | Where do I monitor my portfolio? | Strong portfolio home with aggregate metrics, Project cards, allocation, events, activity, and quick actions. |

### Journey continuity

The requested sequence can be completed through existing links and Workspace tabs. However, the
primary Home action, **Explore Investor Demo**, opens the Investor Dashboard rather than the
Opportunity Catalog. That is a sensible product entry, but it differs from the intended audit
story. The catalog and dashboard also use overlapping comparison functions, which makes the
preferred first path ambiguous.

## 3. Screen-by-Screen Audit

### 3.1 Home

**Purpose and first impression**

Within 10 seconds, a visitor can understand that AgriPartners is a transparent operating platform
for agricultural investment Projects and that a self-guided investor demo is available without
registration. Alpha and Testnet guardrails are prominent and correctly limit expectations.

**Visual hierarchy**

The hero, environment badges, one-sentence value proposition, and primary CTA lead attention in
the correct order. Three competing hero actions remain understandable because only **Explore
Investor Demo** is primary.

**Navigation and interaction**

The visitor can open the Dashboard, Opportunity Catalog, or Presentation Mode. The next step is
clear, although the primary CTA skips the catalog-based narrative requested for this journey.

**Business story and trust**

Home clearly explains the separate Investor–AgriPartners and Farmer–AgriPartners contractual
relationships. It also identifies AgriPartners as Project Operator and avoids implying live
contracts. Role cards, the contractual diagram, and the Alpha notice materially increase trust.

**Data and terminology**

The page stays concise in its default flow. The use of **Alpha v1.1** conflicts with repository
and release material describing Alpha v1.2. This version inconsistency is visible before any
investor enters the product.

**Unclear after 10 seconds**

- Whether the visitor should start with the Dashboard or Opportunity Catalog.
- Whether Alpha v1.1 or Alpha v1.2 is the current product version.
- What evidence will be available inside the active Hissar Project.

**Scores:** Understanding 9/10 · Trust 8/10 · Navigation 9/10 · Investor Readiness 8/10 ·
**Overall 8.5/10**

### 3.2 Opportunity Catalog

**Purpose and first impression**

The catalog immediately identifies itself as a curated Alpha catalog rather than a live
transaction venue. It exposes two flagship Project profiles and aggregate metrics.

**Visual hierarchy**

The page title, Alpha environment banner, catalog metrics, filters, and two Project cards create a
logical hierarchy. The metric density is useful but places average ROI and annualized ROI ahead of
an explanation of why the two Projects represent different lifecycle states.

**Comparison and navigation**

Investors can compare investment amount, ROI, simple annualized ROI, cycles, funding progress,
status, and modeled protection. Each card has a direct **View Project** action.

Hissar is not positioned as the recommended first Project. Alphabetical ordering places Fidlot
first, and the catalog does not explain that Hissar demonstrates an active workflow while Fidlot
demonstrates a completed workflow until the visitor reaches other surfaces. The spelling
**Fidlot** also resembles a typo for **Feedlot** and is used alongside “Feedlot/Fidlot” elsewhere.

**Business story and trust**

The active/completed comparison is valuable. Trust is reduced by strong projected return figures
without an adjacent compact statement of calculation basis, risk, time horizon, or “not
guaranteed” guardrail on each card.

**Scores:** Understanding 8/10 · Trust 7/10 · Navigation 8/10 · Investor Readiness 7/10 ·
**Overall 7.5/10**

### 3.3 Hissar Demonstration Project / Project Workspace

**Purpose and first impression**

The Workspace clearly acts as the single operating record for a Project. The Hissar profile shows
a $50,000 sheep-breeding Project, six cycles, cycle 1 active, $81,672 projected payout, 63.3%
projected ROI, 21.1% APR, $0 returned, and $81,672 outstanding.

**Does it answer “What exactly am I investing in?”**

Partially. The Project type, capital amount, cycle count, status, farmer identifier, operator, and
financial outcome are visible. It does not sufficiently describe the underlying productive asset,
flock size, location, use of proceeds, unit economics, farmer identity, operating assumptions, or
specific investor economic rights. Those details require a financial PDF or future disclosure
document rather than being summarized in the Workspace.

**Visual hierarchy and navigation**

The canonical hierarchy is strong: Project header, lifecycle timeline, financial dashboard, and
tabs for Overview, Production, Project Reports, Returns, Project Documents, and History. Back links
to Portfolio, Investor Pilots, and Home are explicit.

**Trust and interaction**

The timeline and separation of projected, returned, outstanding, ROI, APR, and settlement status
are good trust signals. Confidence falls when the “farmer” is a demo Testnet identifier rather
than an investor-readable farmer profile and when live-looking financial metrics are not paired
with a visible source/calculation link.

**Scores:** Understanding 8/10 · Trust 7/10 · Navigation 9/10 · Investor Readiness 7/10 ·
**Overall 7.8/10**

### 3.4 Project Reports

**Purpose and first impression**

The tab explains that Farmer reports and Production Cycle reports belong here, including approval
state and submission date. For Hissar, both sections are empty because the active demonstration
dataset has no submitted report.

**Chronology, evidence, and progress**

The intended structure supports chronology, status, and report descriptions. It does not provide:

- a Hissar report or dated production update;
- photographs or captions;
- receipts, veterinary evidence, inventory counts, or attachments;
- author/reviewer identity;
- evidence URLs;
- a comparison against plan or explanation of variance.

The History and Activity surfaces can show that a cycle started and an update is due, but these
system-generated events are not evidence that agricultural activity occurred.

**Would an investor believe the Project is actually progressing?**

Not from this screen alone. It proves the reporting workflow exists, not that Hissar is progressing.

**Scores:** Understanding 7/10 · Trust 4/10 · Navigation 8/10 · Investor Readiness 5/10 ·
**Overall 6.0/10**

### 3.5 Project Documents

**Purpose and first impression**

The document library is logically grouped into Project disclosure, Investment Participation
Agreement, Risk Disclosure, Farmer Reports, and Settlement Records. Cards consistently show
category, lifecycle status, availability, description, action, source, and helper text.

**Download flow and legal clarity**

Legal previews correctly state that they are drafts and that production versions require further
review. The Investment Participation Agreement preview also correctly states that the Investor
participates through AgriPartners and the Farmer is not a party to that agreement.

However, the key legal documents are preview anchors rather than downloadable, versioned Project
files. Farmer Reports and Settlement Records are unavailable for active Hissar. There is no
single diligence checklist, upload/publication date, document owner, version, signature state, or
“download all” path.

**Can the investor find all important Project documents?**

The investor can find where they should be, but cannot yet obtain a complete Project document set.

**Scores:** Understanding 8/10 · Trust 6/10 · Navigation 8/10 · Investor Readiness 6/10 ·
**Overall 7.0/10**

### 3.6 Returns

**Purpose and first impression**

The screen cleanly separates invested amount, projected payout, cash returned, outstanding payout,
return status, ROI progress, settlement, and payout history. A “projected returns are estimates and
are not guaranteed” disclaimer is present.

**When and how does the investor earn money?**

The current answer is incomplete. For Hissar the investor can see $50,000 invested, $81,672
projected payout, $0 returned, and $81,672 outstanding. The screen does not explain:

- the 60/40 profit split in the immediate Returns context;
- capital-return timing across cycles;
- expected payout dates or frequency;
- the derivation of 63.3% ROI and 21.1% APR;
- fees, reserve effects, taxes, loss cases, or early termination;
- who approves and executes fiat payment;
- the distinction between projected payout and legally due payment.

The ledger is empty for Hissar, which is accurate for an active Project, but a projected cash-flow
schedule would make the future journey understandable without presenting a payment as completed.

**Scores:** Understanding 7/10 · Trust 6/10 · Navigation 8/10 · Investor Readiness 6/10 ·
**Overall 6.8/10**

### 3.7 Investor Dashboard

**Purpose and first impression**

This is the strongest “home screen” in the investor experience. It immediately provides total
capital, projected payout, projected profit, average ROI, average APR, Project count, Project cards,
allocation, upcoming events, recent activity, and quick actions.

**Multiple Projects and navigation**

The completed Fidlot and active Hissar states are easy to compare, and each Project can be opened
directly. The dashboard also links to the pilot selector and Home.

**Trust and data**

The statement that figures are demonstration estimates is valuable. However, the aggregate
projected payout combines one completed demonstration with one active projection; the headline
can therefore look more portfolio-authoritative than its mixed evidence basis. There is no “as of”
date, data-source label, realized-versus-projected split, document alert, or reporting completeness
indicator.

**Does this feel like the home screen of an investor?**

Yes. It needs stronger evidence and data-authority cues rather than a structural redesign.

**Scores:** Understanding 9/10 · Trust 7/10 · Navigation 9/10 · Investor Readiness 8/10 ·
**Overall 8.3/10**

### 3.8 Journey Completion and Global Navigation

The journey is technically navigable, but there is no persistent investor-oriented “next step”
across Workspace tabs. A visitor must understand the tab order independently. The investor can
return to Portfolio, Projects, or Home, but the product does not acknowledge completion of the
recommended learning sequence.

**Scores:** Understanding 7/10 · Trust 7/10 · Navigation 8/10 · Investor Readiness 7/10 ·
**Overall 7.3/10**

## 4. Cross-Cutting Review

### Terminology

Generally consistent terms include Project, Project Workspace, Project Reports, Project Documents,
Returns, Settlement, Investor, Farmer, and Project Operator. Remaining inconsistencies:

- Alpha v1.1 in the product versus Alpha v1.2 in current repository material.
- Fidlot versus Feedlot/Fidlot.
- Funding is sometimes the investment amount and sometimes a workflow status.
- ROI can mean projected ROI on active Hissar and realized/completed ROI on Fidlot.
- “Returns,” “Settlement,” “payout,” and “cash returned” are related but not explicitly defined.
- “Investment Model,” “Pilot Project,” and “Project profile” are used closely without a glossary.

### Visual hierarchy and components

Strengths include consistent dark cards, green primary actions, metric blocks, status badges,
progress indicators, tab patterns, and warning colors. The hierarchy becomes dense in the Project
Workspace, where timeline, financial dashboard, tabs, settlement card, treasury timeline, and
disabled settlement actions compete for attention.

### Status labels and warnings

Alpha banners and “not guaranteed” language are strong. Draft/Review/Accepted/Published states are
useful but should have a short legend. “Outstanding payout” on an active projected Project may be
read as a current liability rather than a projected amount; “Projected outstanding payout” would
be safer and clearer.

## 5. Overall Story

| Question | Can a first-time visitor answer it? | Missing explanation |
| --- | --- | --- |
| What is AgriPartners? | Yes | None material; Home is concise and role-oriented. |
| Who contracts with whom? | Yes | Production legal documents are still drafts, but the intended structure is explicit. |
| What happens after investing? | Partially | The timeline names stages but does not explain investor actions, decision gates, or exceptions at each stage. |
| How do farmers report progress? | Partially | Report submission and approval are represented, but Hissar contains no real example, evidence, reviewer, or variance analysis. |
| How are returns calculated? | No | The 60/40 economics, cycle cash flows, reserve effect, APR formula, fees, and loss scenarios are not explained in the Returns journey. |
| Where are documents stored? | Yes | The Project Documents tab is clear, but the active Project package is incomplete and mostly preview-only. |
| Where is investment status tracked? | Yes | Portfolio Dashboard, Workspace timeline, Financial Dashboard, and History provide complementary status views. |

## 6. Trust Review

### Trust increases

- Alpha/Testnet/no-live-investment guardrails on Home and catalog surfaces.
- Separate Investor and Farmer contractual relationships with AgriPartners as central operator.
- Clear distinction between active Hissar and completed Fidlot demonstrations.
- Consistent projected-versus-recorded financial terminology.
- Project lifecycle timeline and canonical Workspace tabs.
- Explicit Project Operator and Farmer fields.
- Legal document lifecycle statuses and draft disclaimers.
- Risk Disclosure preview and “returns are not guaranteed” warning.
- Portfolio-level and Project-level navigation.
- Empty states that avoid inventing completed reports or returns.

### Trust decreases

- Hissar has no visible report, photo, attachment, or operational evidence.
- Demo events and report dates are generated at runtime, weakening chronological credibility.
- Hissar Farmer is represented by a demo Testnet-style account instead of a qualified profile.
- Key legal and Project documents are drafts or unavailable.
- ROI and APR are presented without an in-context calculation.
- No projected cash-flow or payout schedule in Returns.
- Version mismatch between Alpha v1.1 and Alpha v1.2.
- Fidlot/Feedlot naming inconsistency.
- Portfolio totals combine projected and completed demonstration states.
- No data “as of” date, source, reviewer, or evidence freshness indicator.

## 7. Strengths

1. Home now explains the product and contractual structure without a presenter.
2. Alpha guardrails are visible and avoid implying a live investment service.
3. The Project Workspace provides a scalable, role-aware information architecture.
4. Investor Dashboard feels like a credible portfolio home.
5. Active and completed Project examples demonstrate different lifecycle states.
6. Returns terminology separates projected, returned, and outstanding values.
7. Documents are grouped by investor purpose and lifecycle status.
8. Navigation provides direct recovery paths to Portfolio, Projects, Catalog, and Home.

## 8. Weaknesses

1. The active Project does not contain the evidence needed to prove operational progress.
2. The financial story presents results more clearly than it explains their derivation.
3. The Project summary does not answer the underlying asset and use-of-funds question deeply enough.
4. The document room is structurally complete but operationally incomplete.
5. Product version and Project naming inconsistencies reduce polish.
6. The preferred first-time journey is not consistently signposted.
7. Demo chronology uses current runtime timestamps instead of stable historical evidence dates.

## 9. Quick Wins — Under One Hour

1. Align all visible product badges to the canonical current Alpha version.
2. Add “Start with Hissar — active Project” and “Then review Fidlot — completed Project” guidance.
3. Standardize Fidlot/Feedlot naming and add one explanatory alias if Fidlot is intentional.
4. Rename Hissar “Outstanding Payout” to “Projected Outstanding Payout.”
5. Add one sentence above Hissar Returns explaining the 60/40 model and where to view its calculation.
6. Add “as of” and “demo data” labels to portfolio and Project financial summaries.
7. Add a compact Draft/Review/Accepted/Published legend in Project Documents.
8. Add Previous/Next tab guidance for the self-guided Workspace journey.

## 10. Medium Improvements — One Sprint

1. Create a stable Hissar Cycle 1 report with date, author, AgriPartners review state, progress
   summary, planned-versus-actual comparison, and evidence attachments.
2. Add a compact “What you are funding” Project brief covering asset, geography, farmer,
   use of funds, cycle plan, and operating assumptions.
3. Add a projected cash-flow schedule and transparent ROI/APR calculation to Returns.
4. Separate realized, recorded, and projected figures in the Portfolio Dashboard aggregates.
5. Add document version, owner, publication date, signature state, and download behavior.
6. Add a first-time investor journey indicator spanning Catalog, Workspace tabs, and Dashboard.
7. Replace generated demo dates with stable, intentionally labeled demonstration chronology.

## 11. Major Improvements — Multiple Sprints

1. Build a complete evidence pipeline for Farmer reports, photographs, invoices, veterinary
   records, inventory, approvals, and immutable references.
2. Publish a legally reviewed pilot document package with signed-state and access controls.
3. Implement authoritative settlement and reconciliation evidence with bank/payment references.
4. Add Project-level risk monitoring, variance reporting, alerts, and mitigation status.
5. Create investor-ready historical performance and methodology only after sufficient validated
   operational evidence exists.

## 12. Scoring Summary

| Screen | Understanding | Trust | Navigation | Investor Readiness | Overall |
| --- | ---: | ---: | ---: | ---: | ---: |
| Home | 9 | 8 | 9 | 8 | 8.5 |
| Opportunity Catalog | 8 | 7 | 8 | 7 | 7.5 |
| Hissar Project Workspace | 8 | 7 | 9 | 7 | 7.8 |
| Project Reports | 7 | 4 | 8 | 5 | 6.0 |
| Project Documents | 8 | 6 | 8 | 6 | 7.0 |
| Returns | 7 | 6 | 8 | 6 | 6.8 |
| Investor Dashboard | 9 | 7 | 9 | 8 | 8.3 |
| Journey Completion / Navigation | 7 | 7 | 8 | 7 | 7.3 |
| **Overall readiness** | **7.9** | **6.5** | **8.4** | **6.8** | **6.8** |

The overall readiness score weights evidence, trust, and unsupported investor comprehension more
heavily than the arithmetic mean of screen scores.

## 13. Top 10 Improvements Before Investor Demonstrations

1. Add one complete, stable, evidence-backed Hissar production report.
2. Add Hissar photographs or other labeled operational evidence with dates and review status.
3. Explain ROI, APR, 60/40 allocation, reserve effects, and payout timing inside Returns.
4. Add a concise “What exactly you are funding” panel to the Project Overview.
5. Publish or clearly package the minimum Project diligence document set.
6. Split projected and realized values in Dashboard totals and labels.
7. Make Hissar the explicitly recommended first Project and Fidlot the completed comparison.
8. Standardize Alpha version and Fidlot/Feedlot terminology across all public screens.
9. Replace runtime-generated demo chronology with fixed, credible demonstration dates.
10. Add an investor journey stepper or Previous/Next guidance across the Workspace.

## 14. Readiness Decision

**Decision: Conditionally ready for founder-led Alpha demonstrations.**

The current product can support a structured presentation because its business architecture and
navigation are coherent. Before self-guided investor demonstrations, AgriPartners should complete
the active Hissar evidence story, explain the return calculation in context, and strengthen the
Project document package. Those three changes would address the largest gap between a polished
workflow prototype and an investor-trustworthy product demonstration.
