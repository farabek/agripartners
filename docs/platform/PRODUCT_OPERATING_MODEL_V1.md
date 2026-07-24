# RFC-006: AgriPartners Product Operating Model v1.0

Status: Frozen

Freeze date: 2026-07-04

Architecture baseline: Business Architecture v1.0 and the Financial Operating Model

## 1. Purpose

This document defines the official Product Operating Model of AgriPartners. It establishes the
product-layer architecture through which Investors, Farmers, and AgriPartners Operators interact
with Projects and with the platform.

This is not a technical specification. It does not define frontend implementation details,
backend services, APIs, database structures, smart contracts, infrastructure, or deployment. It
is the product architecture reference that those implementations must follow.

The Product Operating Model sits beneath the frozen
[Business Architecture v1.0](../business/BUSINESS_ARCHITECTURE_V1_FREEZE.md) and
[Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md). It translates their
participant, Project, information, and financial boundaries into a consistent user experience.
If a product interpretation conflicts with either frozen model, the frozen business and
financial architecture takes precedence.

The **Uzbekistan Feedlot Operator** is the legal and operational fiat recipient under a separate
written agreement with AgriPartners OÜ. The **Farmer** is a non-crypto product role for
operational work, reporting, evidence, tasks, and confirmations. Cryptocurrency stops at
AgriPartners OÜ in Estonia; the Operator and Farmer experience is fiat-only and never requires a
wallet, token, crypto payment or conversion, smart-contract payment action, or on-chain
transaction.

Existing Farmer wallet, withdrawal, NEAR funding, and smart-contract payout behavior is
**Legacy Testnet Alpha — historical technical demonstration, not the target production financial
architecture**.

## 2. Product Vision

AgriPartners is a **project-centric investment platform**.

The platform is organized around real agricultural Projects rather than isolated transactions,
contracts, wallets, dashboards, or technical records. Every participant collaborates through a
shared **Project Workspace**, which provides one consistent place to understand and perform the
participant's part of the Project lifecycle.

The Project Workspace presents the same Project identity and approved facts to all authorized
participants while applying role-based visibility, actions, language, and disclosure controls.
It is the central product experience for Pilot 1.0 and the foundation for future product growth.

## 3. Core Product Object

**Project is the primary product object of AgriPartners.**

An Investment Model is a reusable, approved business and operating model. An Investment Model
creates one or more independent Projects. Each Project is a separately approved implementation
with its own participants, amount, operating plan, Production Cycles, reports, documents,
activity history, financial records, and Settlement.

```text
Investment Model
        |
        +--> Project A
        |
        +--> Project B
        |
        +--> Project C
```

A Project connects three product roles:

- the **Investor**, who invests through AgriPartners and receives approved Project information;
- the **Farmer**, who performs the agricultural work under a separate relationship with
  AgriPartners and uses fiat only;
- the **AgriPartners Operator**, who controls the Project workflow, information, financial
  coordination, reviews, exceptions, and Settlement.

The Project connects these roles through AgriPartners. It does not create a direct contractual,
payment, instruction, or unrestricted information relationship between the Investor and the
Farmer.

Investment Models define reusable structure. Projects contain participant-specific execution.
Project Workspaces expose that execution through the product.

## 4. Product Navigation Model

The canonical product navigation path is:

```text
Landing
   |
   v
Opportunity Catalog
   |
   v
Investment Model
   |
   v
Project Workspace
```

- **Landing** explains AgriPartners and directs users to the appropriate product entry point.
- **Opportunity Catalog** presents discoverable opportunities before a future Marketplace
  exists. It is not itself a live Marketplace.
- **Investment Model** explains the reusable agricultural and financial structure from which a
  specific Project may be created.
- **Project Workspace** is the operational destination for an authorized participant in a
  specific Project.

Dashboards, portfolios, task lists, notifications, and search are entry points into Project
Workspaces. They summarize, prioritize, and route users; they do not replace the Project
Workspace or become separate sources of Project truth.

## 5. Project Workspace Standard

Every Project Workspace must use the same five mandatory sections. Role, Project state, and
approved disclosure rules determine the content visible inside each section, but the section
model remains stable across Projects and Investment Models.

### 5.1 Project Header

The Project Header establishes identity and orientation. It identifies the Project, its
Investment Model, current status, AgriPartners as Project Operator, relevant participant
reference, and other minimum shared context.

The header must make the Project recognizable without relying on a wallet address, smart
contract address, database identifier, or legacy Deal terminology as the primary user-facing
identity.

### 5.2 Project Timeline

The Project Timeline presents the authoritative lifecycle as completed, current, and upcoming
stages:

```text
Funding
   |
   v
Farmer Confirmation
   |
   v
Production
   |
   v
Reports
   |
   v
Settlement
   |
   v
Completed
```

It helps every role understand Project progress. The Investor sees approved milestones and
status, the Farmer sees operational steps and required actions, and the Operator sees controls,
deadlines, reviews, and exceptions.

### 5.3 Project Financial Overview

The Project Financial Overview presents role-appropriate financial and operating status without
changing the meaning or authority of the underlying records.

- Investors see their Investment Amount, Funding Status, Project stage and Production Cycle,
  projected economics, and Settlement Status.
- Farmers see fiat Funding Status, the current Production Cycle, available Project Budget
  information, and the next required action. They do not see Investor ROI, Investor return, APR,
  crypto, wallet, or other Investor-only financial metrics.
- AgriPartners Operators see the Project's funding, Farmer confirmation, cycle, reporting,
  Settlement, and operational-attention state needed to control the workflow.

Projected, reported, approved, paid, reconciled, and completed values must remain visibly
distinct. The Financial Overview is a product summary; approved legal, banking, accounting,
provider, and reconciliation records remain authoritative.

### 5.4 Project Activity Feed

The Project Activity Feed provides a chronological record of material Project events. It helps
participants understand what changed, when it changed, and what happens next.

Investor and Farmer feeds contain only events approved for those roles. The Operator may receive
the fuller operational history, including internal review and exception states. Supplementary
technical or blockchain references may be shown where useful, but they do not replace the
authoritative business event or expose confidential information.

### 5.5 Project Documents

Project Documents provides controlled access to the agreements, acknowledgments, reports,
statements, approved summaries, and other records relevant to the Project.

Document visibility follows participant role, Project stage, legal basis, confidentiality,
privacy, and the Information Disclosure Policy. A shared Workspace does not mean unrestricted
document access. Redacted or participant-specific versions may be required.

## 6. Role Model

All three roles use the same Project Workspace. Role-based visibility changes the information,
actions, and level of detail available inside the shared structure; it does not create separate
Project products.

### Investor

The Investor uses the Workspace to understand the Project, monitor approved progress, review
approved Farmer reporting, follow financial status, and receive Settlement information from
AgriPartners.

The Investor does not directly instruct, pay, contact, or control the Farmer through the
Workspace. Information received by the Investor is provided or approved by AgriPartners under
the applicable disclosure rules.

### Farmer

The Farmer uses the Workspace to confirm fiat Funding, understand the current Production Cycle,
perform required Project actions, submit reports and evidence to AgriPartners, review feedback,
and follow Farmer-relevant Settlement obligations.

The Farmer experience is fiat-only. It must not require or present cryptocurrency, wallets,
tokens, smart contracts, blockchain transactions, Investor ROI, Investor returns, or direct
Investor interaction.

### AgriPartners Operator

The AgriPartners Operator uses the Workspace to prepare and control the Project, coordinate
participants, manage lifecycle transitions, verify Funding and fiat disbursement, review
reports, control disclosures, monitor exceptions, reconcile records, and complete Settlement.

The Operator view contains the control depth required by AgriPartners but remains part of the
same Project Workspace and uses the same Project identity and lifecycle.

## 7. Product Principles

| Principle | Product rule |
| --- | --- |
| **Project First** | Product decisions begin with the Project and its lifecycle, not with a dashboard, transaction, wallet, contract, or technical subsystem. |
| **One Project = One Workspace** | Every Project has one canonical Workspace that contains its product experience and routes participants to the same Project context. |
| **One Workspace = Multiple Roles** | Investor, Farmer, and Operator experiences are role-specific views of one Workspace, not independent products. |
| **Role-based Visibility** | Every field, action, event, and document is displayed according to role, Project state, approval, privacy, confidentiality, and disclosure rules. |
| **Shared Components** | Common Project concepts use common components and semantics across roles. |
| **Consistency Across Projects** | Projects generated from different Investment Models follow the same Workspace structure and interaction patterns. |
| **Farmer Fiat-only Experience** | Farmers use fiat concepts and operational language only and never need crypto, wallets, tokens, smart contracts, or blockchain knowledge. |
| **Investor Transparency** | Investors receive clear, timely, approved Project progress and financial information without overstating projections or bypassing AgriPartners. |
| **Operator Control** | AgriPartners retains control of lifecycle transitions, reporting review, disclosure, exceptions, reconciliation, and Settlement. |

Transparency does not mean unrestricted access. Product transparency must operate within the
approved legal, privacy, confidentiality, commercial, and information-disclosure boundaries.

## 8. UI Composition Rules

Frontend development must implement this model through reusable components and shared layouts.

1. The five mandatory Workspace sections must be reusable across Projects.
2. Role-based differences must be expressed through visibility, content, state, and authorized
   actions inside shared components.
3. New Investment Models must reuse the same Workspace composition.
4. Project-specific data and configuration may vary; the fundamental Workspace structure must
   not.
5. Project lifecycle states and financial terms must use consistent labels and meanings across
   dashboards, portfolios, catalogs, and Workspaces.
6. Dashboards and portfolios must route into the canonical Project Workspace rather than
   recreate full Project experiences.
7. Project-specific UI forks, duplicated role pages, and one-off layouts are not permitted when
   the requirement can be represented by the shared product model.
8. Technical identifiers and infrastructure details must remain secondary to the user-facing
   Project identity and workflow.
9. New components must preserve the Farmer fiat-only boundary and all role-based disclosure
   rules.

Technical implementation may evolve, but it must preserve this product composition unless an
approved Product Operating Model change explicitly replaces it.

## 9. Future Product Evolution

Future capabilities extend the Project-centric model:

- **Portfolio** aggregates an Investor's Projects and routes into their Workspaces.
- **Marketplace** may provide public discovery, comparison, and participation in the approved
  future business phase; it creates or routes into Projects rather than replacing them.
- **Institutional Dashboard** aggregates oversight, allocation, reporting, and controls across
  multiple Projects.
- **Capital Pools** may allocate capital across eligible Projects while each Project retains its
  own identity, records, lifecycle, and Workspace.
- **Escrow** may add approved funding and release controls to Projects.
- **Smart Contract v2** may provide supplementary automation, transparency, and record anchors
  without replacing AgriPartners, authoritative records, or the Farmer fiat-only experience.
- **Mobile application** may provide mobile access to the same role-based Project Workspaces and
  shared product semantics.

These extensions add discovery, aggregation, controls, infrastructure, or new access channels.
They do not replace Project as the primary product object or Project Workspace as the core
participant experience.

Their activation remains subject to the frozen Business Architecture, Financial Operating
Model, roadmap phase, legal and compliance review, and separately approved implementation
decisions.

## 10. Product Operating Model Freeze

AgriPartners Product Operating Model v1.0 is officially frozen as of 2026-07-04.

All future product development must extend this model instead of redesigning it. New frontend
features, Investment Models, participant entry points, portfolio views, institutional tools,
mobile experiences, and future Marketplace capabilities must preserve:

- Project as the primary product object;
- one shared Workspace per Project;
- the five mandatory Workspace sections;
- the shared three-role model;
- role-based visibility and disclosure;
- the Farmer fiat-only experience;
- Investor transparency through AgriPartners;
- AgriPartners Operator control;
- reusable components and consistent layouts.

A proposed change to these frozen product decisions requires documented review and explicit
approval before implementation. Editorial corrections, link repairs, translations, and
clarifications that do not alter the model may be made without redesigning the product
architecture.

## 11. Cross References

### Repository and Documentation Entry Points

- [AgriPartners README](../../README.md)
- [Documentation Index](../README.md)
- [Platform Documentation](README.md)

### Product Planning and Delivery

- [Project Workspace UX Plan](PROJECT_WORKSPACE_UX_PLAN.md)
- [Project Lifecycle Refactoring Plan](PROJECT_LIFECYCLE_REFACTORING_PLAN.md)
- [Pilot 1.0 Implementation Roadmap](PILOT_1_IMPLEMENTATION_ROADMAP.md)

### Frozen Business and Financial Architecture

- [Business Architecture v1.0 Freeze](../business/BUSINESS_ARCHITECTURE_V1_FREEZE.md)
- [AgriPartners v2 Operating Model](../business/OPERATING_MODEL.md)
- [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md)
- [Business Architecture Audit v1.0](../business/BUSINESS_ARCHITECTURE_AUDIT_V1.md)
- [Information Disclosure Policy](../business/INFORMATION_DISCLOSURE_POLICY.md)

This Product Operating Model must be read together with those documents. It defines the product
interaction architecture; it does not supersede their business, financial, legal, operational,
or disclosure boundaries.
