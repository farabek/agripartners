# Canonical Farmer Experience Specification

Status: Accepted

Document type: RFC / Product UX specification

Applies to: Every AgriPartners Farmer-facing screen

## 1. Purpose

This specification is the single source of truth for the AgriPartners Farmer Experience. It
defines the journey, information hierarchy, role visibility, empty states, notifications,
responsive behavior, and acceptance criteria for every Farmer-facing screen.

The Farmer Workspace has one primary responsibility:

> What does the farmer need to do today?

Every screen must help the Farmer answer that question quickly and act with confidence. Current
work, deadlines, and exceptions take priority over background detail. The experience must use
plain operational language and must not require the Farmer to interpret Investor metrics,
technical implementation details, or internal platform states.

The Farmer Experience must share the design language of the Investor Workspace while presenting
Farmer-specific priorities and authorized information. Project data and lifecycle state may
change, but navigation, hierarchy, section order, visual language, action placement, and
role-visibility rules must remain consistent.

These requirements govern presentation and information architecture. They do not redefine
business logic, permissions, API contracts, database records, smart contracts, financial
calculations, or routing.

## 2. Farmer Journey

The canonical Farmer journey is:

**Login**

↓

**Farmer Dashboard**

↓

**My Projects**

↓

**Project Workspace**

↓

**Funding Confirmation**

↓

**Production Cycle**

↓

**Submit Report**

↓

**Cycle Complete**

↓

**Settlement**

Journey rules:

- Login must take the Farmer directly to the Farmer Dashboard.
- The Dashboard must identify the next required action and provide a direct route to it.
- My Projects must show only Projects available to the Farmer under existing permissions.
- Selecting a Project must open its canonical Farmer Project Workspace.
- Funding Confirmation must make the funding state and any Farmer action explicit.
- Production Cycle must show the active Cycle, current progress, today's work, and next deadline.
- Submit Report must be reachable from the relevant task and Project Workspace in no more than
  two clicks.
- Cycle Complete must confirm completion and explain what happens next.
- Settlement must show the operational settlement state without exposing Investor-only returns
  or portfolio analytics.
- Completed steps must remain available as history without competing with current tasks.
- A Farmer returning at any point must resume from the Dashboard with the most important
  current action visible.

## 3. Canonical Farmer Dashboard

The Farmer Dashboard is a daily action surface, not a cross-Project analytics page. It must
answer, within five seconds: what is active, what is due, and what the Farmer should do next.

### 3.1 Top Section

The top section must present:

- **Welcome** — a concise role-appropriate greeting;
- **Farm Name** — the farm or operating identity associated with the Farmer;
- **Active Projects** — the number of Projects currently requiring or tracking production work;
- **Current Cycle** — the active Production Cycle and its current state;
- **Pending Actions** — the number of actions currently requiring Farmer attention.

The most urgent pending action must be visually dominant and include one clear primary action.
Summary values must link to the relevant list or Workspace when a useful destination exists.
The top section must not contain Investor ROI, APR, portfolio performance, or Investor Returns.

### 3.2 Main Sections

Dashboard sections must appear in this order:

1. **My Projects**
   - Show active Projects first.
   - Include Project Name, status, active Cycle, next action, and nearest relevant deadline.
   - Provide one clear route to each Farmer Project Workspace.
2. **Current Tasks**
   - Order tasks by urgency, then due date.
   - Distinguish overdue, due today, upcoming, and completed work with text as well as color.
   - Each actionable task must link directly to the place where it can be completed.
3. **Production Calendar**
   - Show relevant Cycle milestones, report dates, and deadlines.
   - Default to the smallest useful time range for current work.
   - Do not display dates that are not authoritative.
4. **Recent Reports**
   - Show the latest submitted reports and their current status.
   - Provide a route to report details and to submit a report when one is required.
5. **Notifications**
   - Show unresolved Farmer notifications in priority order.
   - Keep informational updates visually secondary to required actions.

The Dashboard must not duplicate full Project timelines, document libraries, report histories,
or production records. Those details belong in the Project Workspace.

## 4. Canonical Farmer Project Workspace

Every Farmer Project Workspace must render the following sections in this order:

1. **Project Header**
2. **Project Timeline**
3. **Today's Tasks**
4. **Funding Status**
5. **Production Progress**
6. **Reports**
7. **Documents**
8. **History**

Sections must not be reordered for a specific Project. A section with no records must retain its
canonical position when its workflow state is useful and apply the empty-state rules in this
specification. A section may be omitted only when it is inapplicable or prohibited by existing
permissions.

### 4.1 Project Header

The Project Header must show Project Name, current status, farm or operator context, active
Production Cycle, nearest deadline, and the primary Farmer action. Status must agree with the
Project Timeline and Production Progress.

### 4.2 Project Timeline

The Project Timeline must show completed, current, and upcoming Farmer-relevant stages using the
shared lifecycle vocabulary. The current stage must be visually dominant. Color must not be the
only state indicator, and dates must appear only when valid dates exist.

### 4.3 Today's Tasks

Today's Tasks is the primary action section. It must show required actions first, including
overdue work, work due today, and the next upcoming action. Each task must state what to do, for
which Cycle, and by when. If no action is required, show **No pending actions**.

### 4.4 Funding Status

Funding Status must state whether funding is waiting, confirmed, or requires Farmer action. It
may show the approved Project budget and amount approved or received when authorized and useful
to the Farmer. It must not expose Investor identity, portfolio totals, ROI, APR, or Investor
Returns.

### 4.5 Production Progress

Production Progress must show the active Cycle, current milestone, completed work, next
milestone, and relevant operational dates. Progress must be based on authoritative Project
records and must never be inferred from missing data.

### 4.6 Reports

Reports must show required, upcoming, overdue, submitted, and accepted reports. The primary
report action must be available from this section and from any corresponding current task.
Submitted reports must not continue to appear as pending.

### 4.7 Documents

Documents must contain only Farmer-authorized Project and production documents. Each document
must have a clear name, type or purpose, and available date when known.

### 4.8 History

History must present a chronological record of meaningful Farmer-visible events. It must remain
secondary to current work and must not expose internal QA, contract, database, or administrative
events.

## 5. Farmer Priorities

The Farmer must immediately understand:

- What Project is active?
- Which Production Cycle is active?
- What action is required?
- Is funding confirmed?
- Is a report waiting?
- Is anything overdue?

Priority rules:

- Required work appears before informational content.
- Overdue work appears before work due today; work due today appears before upcoming work.
- The highest-priority action receives one visually dominant primary button.
- Each screen must have one clear primary action at a time.
- Project, Cycle, task, funding, and report states must agree everywhere they are shown.
- Dates must include enough context to avoid ambiguity.
- Completed actions must leave the active queue and remain accessible through Reports or History.
- Technical evidence and secondary details must use progressive disclosure.
- No screen may require the Farmer to compare repeated cards to determine the authoritative
  state.

## 6. Role Visibility

The Farmer may see:

- Project identity, status, and Farmer-relevant lifecycle;
- Production Cycles, tasks, milestones, and progress;
- required and submitted Reports;
- Funding Confirmation and Farmer-relevant approved or received funding information;
- Farmer-authorized Documents;
- Farmer-visible Project History;
- Settlement status and Farmer actions when applicable.

The Farmer must not see:

- Investor ROI;
- APR;
- Portfolio Analytics;
- Investor Returns;
- Investor portfolio totals or allocation;
- other participants' private financial information;
- internal treasury, administrative, QA, contract, database, or smart-contract controls.

Role visibility must follow the existing permission model. Visual hiding is not a substitute for
authorization. Shared concepts must use the same labels, state vocabulary, and visual treatment
used elsewhere in AgriPartners, even when the Farmer sees fewer fields.

## 7. Empty State Rules

Empty states must explain the actual workflow state and, when known, what happens next.

Avoid:

- **Unknown**;
- **Unavailable**;
- **Not Available**.

Prefer:

- **Waiting for funding confirmation**;
- **No report required today**;
- **Next production cycle begins soon**;
- **No pending actions**.

Additional contextual messages may include:

- **Production begins after funding confirmation**;
- **Reports will appear when the production cycle begins**;
- **No documents have been shared for this Project**;
- **No Project history yet**;
- **Settlement begins after the production cycle is complete**.

Rules:

- Do not render empty metric cards solely to preserve a layout.
- Do not convert missing values to zero.
- Do not infer a status, date, deadline, amount, or completion result.
- Hide a field when it has no presentation value and no useful workflow message.
- Distinguish a legitimate empty state from an error.
- Error messages must explain a recovery action without exposing raw technical language.
- Use sentence case and concise, calm wording.

## 8. Notifications

Notifications must be ordered by action priority, not only by creation time.

| Priority | Notification | Presentation rule |
| --- | --- | --- |
| High | Funding waiting | Show prominently when Farmer action or a blocked Production start requires attention. |
| High | Report overdue | Show the due date and a direct **Submit report** action. |
| High | Cycle deadline | Show the deadline, affected Cycle, and required action. |
| Medium | Upcoming report | Show the due date and route to report preparation or details. |
| Medium | Funding confirmed | Confirm the state and identify the next Production step. |
| Low | Document available | Link to the relevant document without displacing required work. |
| Low | History updated | Link to the relevant event and keep the update visually secondary. |

Notification rules:

- High-priority notifications appear before Medium and Low notifications.
- Unresolved actionable notifications appear before informational updates of the same priority.
- Notifications for the same event must be consolidated.
- A resolved notification must leave the active queue or become visibly resolved.
- Every actionable notification must link directly to the relevant action or Project section.
- Color must not be the only priority indicator.
- Notifications must identify the affected Project or Cycle when context is not already clear.

## 9. Mobile Experience

The Farmer Workspace must be mobile-first. Desktop layouts may add space or side-by-side
presentation, but must preserve the same hierarchy, section order, labels, and actions.

Prioritize:

- a one-column layout;
- large, easy-to-tap buttons;
- simple navigation;
- minimal scrolling.

Mobile rules:

- The current task and primary action must appear before secondary Project detail.
- Critical status, active Cycle, nearest deadline, and overdue state must be visible without
  horizontal scrolling.
- Primary actions must use full-width or otherwise comfortably tappable controls.
- Navigation labels must be plain, short, and consistent.
- Long timelines, calendars, tables, and document lists must adapt without horizontal page
  overflow.
- Secondary detail may collapse behind clear labels, but required work must never be hidden by
  default.
- Repeated summaries must not be added solely for mobile convenience.
- Persistent navigation or action controls must not obscure content.
- All core actions must remain reachable in one or two taps from the Dashboard or Project
  Workspace.

## 10. Acceptance Criteria

The Farmer Experience is complete when:

- daily tasks are obvious within five seconds;
- navigation is simple and uses consistent labels;
- no duplicated information exists;
- all actions are accessible within one or two clicks or taps;
- the layout matches the design language of the Investor Workspace;
- the Farmer can identify the active Project, active Cycle, required action, funding state,
  report state, and overdue work without opening secondary detail;
- every Farmer Project Workspace uses the canonical eight-section order when applicable;
- Project, Cycle, funding, task, report, and timeline states agree across screens;
- Investor ROI, APR, Portfolio Analytics, and Investor Returns are absent;
- empty states use contextual Farmer language and do not use **Unknown**, **Unavailable**, or
  **Not Available**;
- notifications follow the defined priority order and route to the relevant action;
- required report submission is reachable within two clicks or taps;
- the experience is presentation-ready in supported mobile and desktop layouts;
- current and future Farmer Projects can pass the same visual and structural review without
  Project-specific layout exceptions.

Changes to the canonical journey, hierarchy, section order, role visibility, or required content
require an explicit revision to this RFC. Adding a new Project type does not.
