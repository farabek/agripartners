# Farmer Daily Workflow Specification

Status: Accepted

Document type: RFC / Operational UX specification

Applies to: Every AgriPartners Farmer-facing daily workflow

Related specification:
[Canonical Farmer Experience Specification](CANONICAL_FARMER_EXPERIENCE_SPEC.md)

## 1. Purpose

This specification defines how a Farmer interacts with AgriPartners during a normal working day.
It is the operational blueprint for every future Farmer screen and translates the canonical
Farmer Experience into a clear sequence of daily decisions and actions.

The Farmer Workspace must answer one question:

> What do I need to do today?

Every Farmer-facing screen must support that objective. Required work, deadlines, and exceptions
must appear before background information. The Farmer must be able to identify the next action,
understand why it is required, and start it without searching across screens.

This specification works together with the Canonical Farmer Experience Specification. If a
future screen introduces a new daily action, it must fit the priorities, task model, notification
levels, Workspace order, mobile principles, and UX rules defined here.

These requirements govern workflow presentation and information architecture. They do not
redefine business logic, permissions, API contracts, database records, smart contracts,
financial calculations, or routing.

## 2. Daily Workflow

The canonical daily flow is:

**Login**

↓

**Today's Tasks**

↓

**Open Active Project**

↓

**Review Current Cycle**

↓

**Confirm Funding (if required)**

↓

**Complete Production Activities**

↓

**Submit Cycle Report**

↓

**Review Notifications**

↓

**Finish**

Workflow rules:

1. **Login**
   - Successful Farmer login must open the Farmer Dashboard.
   - The first useful content must be today's required work, not general platform information.
2. **Today's Tasks**
   - Show unresolved tasks in priority and due-date order.
   - Make the highest-priority task and its action visually dominant.
   - If no work is required, state **No pending actions** and show the next known milestone.
3. **Open Active Project**
   - Each task must identify its Project and provide a direct route to the relevant Project
     Workspace section.
   - When multiple Projects are active, the Project with the most urgent unresolved task appears
     first.
4. **Review Current Cycle**
   - Show the Cycle name or number, current stage, progress, nearest deadline, and next required
     action.
   - Cycle state must agree across the Dashboard, Project Workspace, tasks, reports, and
     notifications.
5. **Confirm Funding (if required)**
   - Show this step only when funding confirmation requires Farmer attention.
   - State what is being confirmed and what Production activity can begin afterward.
   - A completed confirmation must leave the active task list.
6. **Complete Production Activities**
   - Present activities in the order they should be performed.
   - Distinguish required activities from optional guidance.
   - Completed activities must update the visible Production progress.
7. **Submit Cycle Report**
   - A required report must be reachable directly from the corresponding task.
   - Show the applicable Project, Cycle, due date, required inputs, and supporting documents.
   - After successful submission, confirm receipt and remove the report from pending work.
8. **Review Notifications**
   - Show unresolved actionable notifications before informational updates.
   - Notifications must link to the relevant action, Project section, document, or history event.
9. **Finish**
   - The day is complete when no Critical or due-today tasks remain.
   - Show **No pending actions** and the next known task or milestone when available.

The flow may skip steps that are not required that day, but it must not reorder required work in
a way that conflicts with the Production lifecycle.

## 3. Dashboard Priorities

The Farmer Dashboard must use this priority order:

### Priority 1 — Today's Tasks

Show overdue and due-today work first. The highest-priority unresolved task receives the primary
action. Today's Tasks is the first operational section and must be visible within five seconds.

### Priority 2 — Active Project

Show the Project associated with today's most urgent work. Include its status, current Cycle,
nearest deadline, and a direct route to the Project Workspace. If multiple Projects are active,
order them by unresolved task urgency and then nearest due date.

### Priority 3 — Current Production Cycle

Show the active Cycle, current stage, progress, next milestone, and Farmer responsibility.
Production detail must support the next action rather than compete with it.

### Priority 4 — Pending Reports

Show overdue reports before reports due today, then upcoming reports. Each pending report must
include a due date, status, and direct action.

### Priority 5 — Notifications

Show Critical notifications first, then Important, then Informational. Notifications must not
duplicate tasks or displace a required action.

Everything else is secondary. Documents, complete histories, general Project detail, technical
evidence, and informational summaries must appear after these priorities or behind clear
progressive disclosure.

## 4. Daily Tasks

A daily task is a specific Farmer action associated with a Project, Production Cycle, report, or
document. Tasks must use plain action-led labels.

Canonical task types include:

- **Confirm funding**;
- **Submit cycle report**;
- **Upload supporting document**;
- **Review operator feedback**;
- **Confirm cycle completion**;
- **Resolve overdue report**.

Each task must have:

- **Priority** — Critical, Important, or Standard;
- **Due date** — the authoritative deadline, or a contextual schedule state when no exact date
  exists;
- **Completion status** — Not started, In progress, Completed, or Overdue;
- **Action button** — one clear verb-led action that opens the exact place where work is
  completed.

Each task should also identify the affected Project and Production Cycle when that context is not
already visible.

Task rules:

- Order tasks by overdue state, priority, due date, and then Production sequence.
- Use one authoritative task record wherever the task appears.
- Do not create separate Dashboard and Workspace tasks for the same required action.
- An overdue task must remain actionable and must show its original due date.
- A completed task must leave the active list and remain available in the relevant History.
- A blocked task must explain the dependency and the next expected event.
- Do not mark a task complete from navigation alone; completion must reflect the authoritative
  workflow state.
- Action labels must describe the action, such as **Confirm funding**, **Submit report**,
  **Upload document**, or **Review feedback**.
- Do not use vague labels such as **Continue**, **Manage**, or **View** when a more specific
  action is available.
- Color must not be the only indicator of priority, status, or overdue state.

## 5. Notifications

Notifications use three levels:

### Critical

- **Report overdue**
- **Funding confirmation required**
- **Production deadline today**

Critical notifications indicate required immediate attention. They must appear before all other
notifications, identify the affected Project or Cycle, state the deadline or blocked outcome,
and provide a direct action.

### Important

- **Report due tomorrow**
- **Funding received**
- **Operator requested update**

Important notifications indicate near-term work or a material workflow change. They must state
what changed, what happens next, and whether Farmer action is required.

### Informational

- **New document available**
- **Cycle completed**
- **Settlement completed**

Informational notifications confirm an event or make supporting information available. They
must remain visually secondary and must not displace required work.

Notification rules:

- Order notifications by level, required action, due date, and then recency.
- Do not create a notification that merely repeats a visible task without adding useful context.
- Consolidate notifications for the same event.
- Every actionable notification must link to the relevant action or Workspace section.
- Mark resolved notifications clearly or remove them from the active list.
- Use text labels as well as color to communicate notification level.
- Keep notification language concise, specific, and free of internal technical terms.

## 6. Active Project Workspace

The active Farmer Project Workspace must present:

**Project**

↓

**Current Cycle**

↓

**Today's Tasks**

↓

**Production Progress**

↓

**Reports**

↓

**Documents**

↓

**History**

Workspace rules:

- **Project** identifies the Project, current status, nearest deadline, and primary Farmer
  action.
- **Current Cycle** identifies the active Production Cycle, stage, and next milestone.
- **Today's Tasks** shows the Project's overdue and due-today work before upcoming tasks.
- **Production Progress** shows completed activities, current work, and the next Production
  milestone.
- **Reports** shows overdue, required, submitted, and accepted Cycle Reports with the relevant
  action.
- **Documents** shows Farmer-authorized supporting documents and uploads.
- **History** shows meaningful completed Farmer-visible events in chronological order.

This daily operational sequence is the Farmer's scan order within the broader canonical Project
Workspace. Funding confirmation appears as a task and funding state when relevant; the canonical
Project Timeline and Funding Status remain available in the positions defined by the
Canonical Farmer Experience Specification.

The Workspace must not repeat the same task, status, progress value, report, or document in
multiple competing sections. A summary may link to authoritative detail, but it must not become
a second source of truth.

## 7. Mobile First Principles

Assume most Farmers use mobile devices. The mobile experience defines the primary hierarchy;
larger layouts may add space but must not change the workflow order.

Requirements:

- a one-column layout;
- large touch targets;
- simple navigation;
- minimal scrolling;
- quick access to today's tasks.

Mobile rules:

- Today's highest-priority task and action must appear before secondary information.
- Required actions must remain reachable in one or two taps from the Dashboard or Project
  Workspace.
- Primary buttons must be comfortably tappable and should use the available width.
- Project, Cycle, due date, priority, and status must remain readable without horizontal
  scrolling.
- Long histories, document lists, and secondary detail may collapse behind clear labels.
- Today's Tasks and Critical notifications must not be collapsed by default.
- Sticky navigation or actions must not obscure content or system controls.
- Tables and timelines must adapt to the viewport without horizontal page overflow.
- The mobile layout must not introduce duplicated summaries merely to shorten navigation.

## 8. UX Principles

The Farmer should never search for work. The interface must always make the next required action
obvious, and actions must require as few steps as possible.

Every Farmer-facing screen must follow these principles:

- Lead with required work, not analytics or background detail.
- Use one visually dominant primary action at a time.
- Use plain operational language and action-led labels.
- Avoid unnecessary technical, financial, contract, database, and smart-contract terminology.
- Preserve Project and Production context throughout an action.
- Keep Dashboard summaries brief and route to authoritative Workspace detail.
- Show real workflow states instead of vague placeholders.
- Explain blocked work and the next expected event.
- Confirm successful actions and remove completed work from active queues.
- Keep status, dates, task completion, Production progress, and report state consistent across
  screens.
- Minimize data entry and do not request information already available to the workflow.
- Use progressive disclosure for secondary details and technical evidence.

## 9. Acceptance Criteria

The Farmer Daily Workflow is complete when:

- today's work is visible within five seconds;
- required actions are immediately obvious;
- no duplicated information exists;
- the workflow follows the Production lifecycle;
- mobile usage is prioritized;
- the experience matches the overall AgriPartners design language;
- the Dashboard follows the five defined priorities;
- tasks consistently show priority, due date, completion status, and a clear action button;
- Critical, Important, and Informational notifications follow the defined order and behavior;
- each actionable task or notification opens the relevant work in one or two clicks or taps;
- Project, Current Cycle, Today's Tasks, Production Progress, Reports, Documents, and History
  follow the defined Workspace scan order;
- completed actions leave active queues and remain available as history;
- Farmer-facing labels avoid unnecessary technical language;
- the same workflow can support every current and future Farmer Project without a
  Project-specific daily-flow exception.

Changes to the daily sequence, Dashboard priorities, task model, notification levels, Workspace
scan order, or mobile principles require an explicit revision to this RFC.
