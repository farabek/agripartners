# Canonical Project Workspace Specification

Status: Accepted

Document type: RFC / Product UX specification

Applies to: Every AgriPartners **View Project** experience

## 1. Purpose

This specification is the single source of truth for the investor-facing Project Workspace used
across AgriPartners.

Every Project Workspace must use one shared layout regardless of Project type, lifecycle state,
participant, Investment Model, or environment. This includes:

- Fidlot Livestock Project;
- Hissar Sheep Breeding Project;
- Greenhouse Projects;
- Poultry Projects;
- future Pilot Projects;
- future approved Investment Models and Project types.

Project data may change. The Workspace layout, information hierarchy, section order, visual
language, and core actions must not change between Projects.

The canonical Workspace is a reusable product surface, not a Project-specific landing page. A
new Project must be represented by supplying data and approved optional states to the same
Workspace composition. It must not introduce a separate page design.

The requirements in this RFC are frontend presentation requirements. They do not redefine
business logic, financial calculations, permissions, API contracts, database records, smart
contracts, or routing.

## 2. Workspace Structure

Every **View Project** page must render the following sections in this order:

1. **Project Header**
   - Project Name
   - Status
   - Farmer
   - Location
   - Investment
   - ROI
   - APR
2. **Lifecycle Timeline**
3. **Financial Overview**
4. **Production Status**
5. **Farmer Reports**
6. **Returns**
7. **Project Documents**
8. **Event History**
9. **Footer Actions**

Sections must not be reordered for a specific Project. When a section has no records, it must
retain its canonical position and apply the empty-state rules in this RFC. A section may be
omitted only when it is explicitly inapplicable to the user's role or prohibited by permissions.

Protection, risk, compliance, and infrastructure information may appear as contextual supporting
content, but must not interrupt the canonical order. Secondary technical evidence should use
progressive disclosure after the relevant primary content.

## 3. Header Rules

### 3.1 Hierarchy

The Project Header must answer, within one scan:

1. What Project is this?
2. What is its current status?
3. Who operates it?
4. Where is it located?
5. What are its primary Investor metrics?

The Project Name is the primary heading. Status is the primary state indicator. Farmer and
Location provide operational context. Investment, ROI, and APR are the primary financial
metrics.

The header may include a compact breadcrumb or Back to Portfolio action, but navigation must not
repeat the complete Project identity row.

### 3.2 Primary Metrics

Investment, ROI, and APR must:

- use the same approved currency and percentage formatting throughout the Workspace;
- state whether a value is projected or recorded when that distinction matters;
- use consistent precision across Projects;
- avoid implying realized performance when only projected data exists;
- be hidden when no meaningful presentation value exists.

APR must use one approved label across all Projects. Project-specific aliases such as “Simple
annualized ROI” must not create a second competing APR metric.

### 3.3 Status

Status must:

- use the canonical Project lifecycle vocabulary;
- use the same badge treatment in every Workspace;
- agree with the current Timeline stage;
- avoid internal contract, database, or QA state names;
- appear once as the authoritative header status.

### 3.4 No Duplicated Profile Cards

The Workspace must not render a second Project Profile card that repeats Project Name, Status,
Farmer, Investment, ROI, APR, or lifecycle information already present in the header.

Supporting Project description, Investment Model, operator, and risk context may appear below
the primary header content when they add information rather than repeat it.

## 4. Timeline Rules

The Lifecycle Timeline must use one shared stage model and one visual language across all
Projects.

Each stage must be represented as one of:

- **Completed** — the stage is finished and supported by the available Project record;
- **Current** — the stage is the Project's active focus;
- **Upcoming** — the stage has not started.

Rules:

- Completed stages use the approved success color.
- The Current stage uses the approved active color and must be visually dominant.
- Upcoming stages use the approved neutral color.
- Color must never be the only state indicator; every stage requires a text label.
- Dates appear only when a valid date exists.
- Missing dates must not produce “Date unavailable” or similar filler.
- The Timeline status must agree with the header status and Production Status section.
- Future Projects may extend the lifecycle model only through an approved revision of this RFC;
  individual pages must not invent their own stages.

## 5. Financial Rules

The Financial Overview uses the same card system and section position for every role, but the
visible fields are role-based.

### 5.1 Investor View

The Investor view may show:

- invested amount;
- projected profit;
- projected total payout;
- projected ROI and APR;
- recorded returns;
- projected outstanding amount;
- funding confirmation;
- settlement status.

Projected and recorded values must be visibly distinguished. Realized metrics must not be shown
unless authoritative data and an approved calculation exist.

### 5.2 Farmer View

The Farmer view may show:

- approved Project budget;
- funding confirmation;
- current Production Cycle;
- amount approved or received for the current workflow;
- reporting status;
- next required financial or reporting action.

Investor portfolio totals, Investor-only returns, and internal treasury data must not appear.

### 5.3 Operator View

The Operator view may show:

- approved investment and funding state;
- Farmer funding confirmation;
- current Production Cycle;
- pending reports or approvals;
- settlement state;
- operational exceptions requiring attention.

Internal controls must remain visually distinct from participant-facing information.

### 5.4 Role-Based Visibility

Role-based visibility must be enforced by the existing permission model. The Workspace must not
use visual hiding as a substitute for authorization.

The same concept must use the same label, unit, precision, and card treatment wherever it is
visible. A role may see fewer fields, but it must not receive a different Workspace structure.

## 6. Information Hierarchy

Each product surface has a separate responsibility.

| Surface | Information that belongs there |
| --- | --- |
| Project Workspace | One Project's identity, lifecycle, financial state, production progress, Farmer Reports, Returns, documents, and event evidence. |
| Dashboard | Role-specific priorities, next actions, alerts, recently changed Projects, and entry points into individual Workspaces. |
| Portfolio | Cross-Project aggregation, allocation, totals, comparison, performance summaries, and routes into individual Workspaces. |

The Project Workspace must not contain:

- cross-Project totals or comparison tables;
- global Investor alerts unrelated to the current Project;
- unrelated Projects;
- dashboard onboarding or product explanation;
- internal QA controls;
- duplicate Portfolio summaries.

The Dashboard and Portfolio must not reproduce the full Project Timeline, report history,
document library, Returns ledger, or Event History. They should link to the Workspace for those
details.

## 7. Empty State Rules

Empty states must explain the real workflow state without sounding broken or incomplete.

Avoid:

- “Unavailable”;
- “Unknown”;
- “Not available”;
- “Not yet authoritative”.

Prefer contextual messages such as:

- “Waiting for first Farmer Report”;
- “Settlement pending”;
- “Available after funding confirmation”;
- “No action required”;
- “No Returns recorded yet”;
- “Project documents will appear after approval”;
- “Production begins after funding confirmation”.

Rules:

- If a field has no presentation value and no useful workflow message, hide the field.
- Do not render empty metric cards solely to preserve a grid.
- Do not convert missing values to zero.
- Do not infer a status, date, return, or financial result.
- Empty-state wording must identify what happens next when that is known.
- Error states must be distinct from legitimate empty states.
- Technical failures may be reported without exposing raw internal error language to Investors.

## 8. Demo Rules

AgriPartners must distinguish four contexts:

| Context | Rule |
| --- | --- |
| Pilot | Uses approved Pilot data and the canonical Workspace. Pilot status must not imply production operation. |
| Demo | Uses approved demonstration data and the canonical Workspace. A concise disclosure may identify demonstration data. |
| Production | Uses authorized production data and approved production actions only. Demo or Testnet language must not appear. |
| Internal QA | May use synthetic records and diagnostic controls only in internal QA surfaces. |

Internal QA data must never appear in Investor-facing Dashboard, Portfolio, search, navigation,
or Project Workspace UI.

Projects whose title or name begins with QA, Test, or Demo QA are not presentation Projects and
must be excluded from Investor-facing lists and Workspaces.

Demo pages must not use wording such as “screenshot readiness,” “test record,” or “QA check.”
Required Testnet or demonstration disclosures must be concise, factual, and secondary to the
Project story.

Demo and Pilot Projects must not receive custom layout exceptions. Only their data and approved
environment disclosure may differ.

## 9. Consistency Rules

Every **View Project** page must use:

- the same section order;
- the same responsive spacing scale;
- the same typography hierarchy;
- the same card components;
- the same status colors and labels;
- the same metric formatting;
- the same empty-state patterns;
- the same section navigation behavior;
- the same primary and secondary actions;
- the same responsive and mobile behavior.

Only Project data, lifecycle state, role-authorized fields, and approved optional content may
differ.

Shared sections must be rendered from shared components. Project-specific conditional markup
must not create a parallel Workspace layout.

Footer Actions must use one consistent location and priority:

- primary action: the next permitted Project action, when one exists;
- secondary action: return to Dashboard or Portfolio;
- optional action: approved document, support, or technical-evidence access;
- destructive, administrative, Testnet, or internal QA actions must not appear as Investor
  primary actions.

## 10. Acceptance Criteria

A Project Workspace is complete when:

- every current and future Project uses the same canonical layout;
- all nine sections appear in the canonical order when applicable;
- no duplicated profile, status, financial, activity, report, or Returns sections exist;
- no presentation-hostile placeholder wording appears;
- Project Header status agrees with the Timeline and Production Status;
- role-based visibility follows existing permissions;
- no QA or test Project data appears in Investor-facing UI;
- the Investor can understand Project identity, status, operator context, and primary financial
  position within five seconds;
- the default page tells the Project story before exposing secondary technical evidence;
- the layout is presentation-ready on supported desktop and mobile breakpoints;
- Fidlot, Hissar, Greenhouse, Poultry, a future Pilot Project, and a live assigned Project can
  pass the same visual and structural acceptance review without Project-specific exceptions.

Changes to the canonical order, hierarchy, or required content require an explicit revision to
this RFC. Adding a new Project type does not.
