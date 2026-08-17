<!-- markdownlint-configure-file { "MD013": false } -->

# AgriPartners Documentation Authority Matrix

Status: Living

Owner: Product

Version: 1.1

Last reviewed: 2026-07-30

Supersedes: Governance registry portions of `docs/DOCUMENTATION_GUIDE.md` and the prior
`docs/archive/deprecated/documentation-architecture/` audit

Replaced by: —

## Purpose

This matrix is the single source of truth for AgriPartners documentation status, ownership, and
canonical authority. It covers every documentation folder under `docs/` and identifies the
documents that may define current Product, Business, Engineering, Operations, release, and
external-communication facts.

The [Documentation Guide](DOCUMENTATION_GUIDE.md) remains the procedural companion for naming,
versioning, review, and lifecycle practices. If its status, ownership, or canonical designation
conflicts with this matrix, this matrix takes precedence.

## Scoped Authority Model

AgriPartners uses a scoped authority model, not a single numbered hierarchy. Authority is
determined by the subject being governed:

| Authority scope | Controlling source | Boundary |
| --- | --- | --- |
| Contributor and compatible-agent instructions | Repository-root `AGENTS.md` | Governs covered repository conduct; does not assign documentation status or redefine domain facts |
| Documentation registry | `docs/DOCUMENTATION_AUTHORITY_MATRIX.md` | Governs documentation status, ownership, canonical classification, supersession, replacement, and archive boundaries |
| Documentation procedures | `docs/DOCUMENTATION_GUIDE.md` | Governs lifecycle, metadata, review, publication, translation, generated assets, and archive procedures |
| Documentation navigation | `docs/DOCUMENTATION_INDEX.md` | Governs official audience navigation, discovery, publication readiness, and access labels; does not assign authority |
| Subject-matter decisions and facts | Registered canonical domain documents | Govern within their declared Product, Business, Engineering, Operations, release, legal, or other domain scope |
| Current implementation behavior | Current code, migrations, configuration, and executable tests | Govern implemented behavior; documentation must accurately describe that evidence |

Cross-references between these sources do not create a universal order of precedence. Resolve a
conflict by identifying its subject, then apply the authority and change control for that scope.
Navigation cannot create factual authority, registry classification cannot create domain facts,
and document ownership does not by itself establish final approval authority.

## How to Read the Matrix

- **Canonical: Yes** means the document owns decisions or facts within its stated purpose.
- **Canonical: No** means the document is supporting, derived, proposed, historical, or an
  audience-specific publication.
- **Living** is used for maintained indexes, roadmaps, checklists, logs, and operational records
  that change without becoming new releases.
- **Frozen** means material changes require the change-control process declared by the owning
  document.
- A folder may contain useful current documents without containing a canonical source.
- `—` means no value has been assigned or the field is not applicable.
- Dates without explicit document metadata use the latest repository review/change date as the
  best available baseline.

## Repository Coverage

| Category | Documentation folders and locations reviewed |
| --- | --- |
| Product | `docs/` entry points, `docs/governance/`, `docs/platform/` product documents, `docs/product-roadmap/`, `docs/workflows/` |
| Architecture | `docs/architecture/`, `docs/design/` |
| Business | `docs/business/`, `docs/business/investment-models/`, `docs/60-40/`, `docs/business-model/` |
| Pilots | `docs/platform/pilot/`, Pilot implementation material in `docs/platform/` |
| Legal | `docs/legal/` |
| Investor | `docs/investors/`, `docs/investor-pack/`, `docs/investor-package/`, `docs/investor-deck/` |
| NEAR | `docs/near/`, `docs/near-ecosystem/`, `docs/near-execution/`, `docs/near-outreach/`, `docs/near-outreach-toolkit/`, `docs/outreach/`, root NEAR documents |
| Platform | Remaining `docs/platform/` material, `docs/platform/investor-protection/`, root role documents |
| Development | `docs/developer-review/`, `docs/deployment/`, `docs/superpowers/` |
| Releases | `docs/releases/` and `docs/RELEASES.md` |
| Presentation | `docs/presentation-readiness/`, `docs/pitch-deck/`, presentation files in `docs/investor-package/`, root presentation HTML |
| Demo | `docs/demo-readiness/`, `docs/demo-assets/`, `docs/demo-guide/` |
| Assets | `docs/screenshots/`, `docs/demo-assets/screenshots/`, generated PDF, DOCX, PPTX, and HTML assets |
| Archive | `docs/archive/`, `docs/audits/`, `docs/archive/deprecated/documentation-architecture/` |

All existing empty documentation folders were reviewed: `docs/business-model/`,
`docs/demo-guide/`, `docs/investor-deck/`, `docs/workflows/`, and the structural parent folders
under `docs/60-40/` and `docs/screenshots/`.

## Product

### Product Purpose

Product documentation defines ecosystem navigation, product direction, Project-centric
interaction rules, user experiences, review state, and software delivery priorities.

### Product Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AgriPartners Product Book | `docs/PRODUCT_BOOK.md` | Top-level ecosystem and canonical-document navigation | Living | Product | Yes | 1.0 | 2026-07-06 | Fragmented top-level product navigation | — | Does not duplicate detailed specifications |
| Documentation Authority Matrix | `docs/DOCUMENTATION_AUTHORITY_MATRIX.md` | Status, ownership, and authority registry | Living | Product | Yes | 1.1 | 2026-07-30 | Prior authority inventories and conflicting registry guidance | — | Highest authority for documentation governance |
| Workstream Operating Model | `docs/governance/WORKSTREAM_OPERATING_MODEL.md` | Repository workstream classification, coordination, and planning boundaries | Accepted | Product | Yes | 1.0 | 2026-07-18 | Ad hoc cross-workstream routing | — | Subordinate to domain authorities for their facts |
| Documentation Guide | `docs/DOCUMENTATION_GUIDE.md` | Documentation procedure, naming, versioning, and lifecycle guidance | Accepted | Product | Yes | — | 2026-07-30 | — | — | Governing procedural source; subordinate to this matrix only for registry decisions |
| Documentation Index | `docs/DOCUMENTATION_INDEX.md` | Official audience navigation, discovery, publication-readiness, and access entry point | Living | Product | Yes | — | 2026-07-30 | Fragmented package navigation | — | Canonical only for navigation; does not define document or domain authority |
| AgriPartners Platform Model | `docs/platform/AGRIPARTNERS_PLATFORM_MODEL.md` | Integrated current platform overview and evidence-backed navigation | — | Product | Yes | — | 2026-07-25 | Fragmented platform overview | — | Source declares canonical classification but no lifecycle status or version; defers specialized facts to the owning domain and implementation authorities |
| Documentation Layer Model | `docs/DOCUMENTATION_LAYER_MODEL.md` | Documentation package and repository-organization planning model | Draft | AgriPartners | No | Draft v1 | 2026-07-07 | — | — | Registered from its declared Draft v1 metadata; does not define governance precedence |
| Documentation Cleanup Plan | `docs/DOCUMENTATION_CLEANUP_PLAN.md` | Documentation inventory, cleanup sequencing, and stable-path planning | Draft | Product | No | — | 2026-07-12 | — | — | Registered from its declared Draft metadata; classifications defer to this matrix |
| Software Delivery Roadmap | `docs/ROADMAP.md` | Living software release roadmap | Living | Product | Yes | 1.0 | 2026-07-06 | Distributed Alpha/Beta delivery plans | — | Does not replace the frozen business roadmap |
| Product Operating Model v1.0 | `docs/platform/PRODUCT_OPERATING_MODEL_V1.md` | Project-centric product architecture and role model | Frozen | Product | Yes | 1.0 | 2026-07-04 | Earlier dashboard/deal-centric product assumptions | — | Frozen under its declared change control |
| Canonical Project Workspace Specification | `docs/platform/CANONICAL_PROJECT_WORKSPACE_SPEC.md` | Investor-facing Project Workspace structure and acceptance rules | Accepted | Product | Yes | 1.0 | 2026-07-04 | Project-specific Workspace layouts | — | Applies to every View Project experience |
| Canonical Farmer Experience Specification | `docs/platform/CANONICAL_FARMER_EXPERIENCE_SPEC.md` | Farmer journey, dashboard, Workspace, visibility, and UX rules | Accepted | Product | Yes | 1.0 | 2026-07-05 | Earlier Farmer portal summaries | — | Single source for Farmer-facing experience |
| Farmer Daily Workflow Specification | `docs/platform/FARMER_DAILY_WORKFLOW_SPEC.md` | Daily Farmer decisions, tasks, and operational sequence | Accepted | Product | Yes | 1.0 | 2026-07-05 | Ad hoc Farmer workflow descriptions | — | Subordinate to the Farmer Experience Specification |
| Alpha Product Review Checklist | `docs/platform/PRODUCT_REVIEW_CHECKLIST.md` | Product Review progress tracker | Living | Product | Yes | Alpha | 2026-07-05 | — | — | Canonical review-completion tracker, not a defect log |
| Alpha UX/UI Audit Log | `docs/platform/UX_UI_AUDIT_ALPHA.md` | Product Review findings and resolution state | Living | Product | Yes | Alpha | 2026-07-04 | Distributed UX findings | — | Canonical Product Review findings log |
| Repository README | `README.md` | Public repository orientation | Living | Product | No | Alpha v1.2 | 2026-07-02 | — | `docs/PRODUCT_BOOK.md` for ecosystem authority | Public summary derived from canonical sources |
| Documentation README | `docs/README.md` | Concise documentation landing page | Living | Product | No | Alpha v1.2 | 2026-07-02 | — | `docs/DOCUMENTATION_INDEX.md` for official navigation | Supporting landing page |
| Russian Documentation README | `docs/README-ru.md` | Russian documentation landing page | Living | Product | No | Alpha v1.2 | 2026-07-02 | — | `docs/DOCUMENTATION_INDEX.md` for official navigation | Translation/navigation companion |

### Product Canonical Documents

The canonical Product set is the Product Book, Authority Matrix, Documentation Index, Workstream
Operating Model, AgriPartners Platform Model, Master Roadmap v2, Software Delivery Roadmap,
Product Operating Model, accepted Workspace and Farmer specifications, Product Review Checklist,
and UX/UI Audit Log. Each remains canonical only within its registered scope.

### Product Supporting Documents

- `docs/platform/PRODUCT_REVIEW_PILOT_1.md`
- `docs/platform/PROJECT_WORKSPACE_UX_PLAN.md`
- `docs/platform/PROJECT_LIFECYCLE_REFACTORING_PLAN.md`
- `docs/product-roadmap/06-investor-analytics-dashboard.md`
- `docs/product-roadmap/07-investor-portfolio-dashboard-audit.md`
- Their Russian companions where present

### Product Historical Documents

- Completed ROI workstream files `docs/product-roadmap/01-*` through `05-*`
- Russian completed ROI workstream files `docs/product-roadmap/11-*` through `15-*`
- Empty legacy placeholders `docs/workflows/`

## Architecture

### Architecture Purpose

Architecture documentation describes the current high-level system, accepted technical
decisions, and proposed designs without confusing proposals with implemented behavior.

### Architecture Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AgriPartners Architecture | `docs/ARCHITECTURE.md` | High-level current system architecture | Living | Engineering | Yes | 1.0 | 2026-07-06 | Distributed architecture summaries | — | Canonical architecture entry point |
| ADR-001: Live-first Architecture | `docs/architecture/ADR-001-live-first-architecture.md` | Authority of live data and separation of demo data | Accepted | Engineering | Yes | ADR-001 | 2026-06-22 | Demo fallback behavior | — | Accepted decision |
| ADR-002: Financial Semantics | `docs/architecture/ADR-002-financial-semantics.md` | Proposed financial-state terminology and formulas | Review | Engineering | No | ADR-002 | 2026-06-22 | — | — | Document says Proposed; Review is the matrix-equivalent status |
| Typed Return Model Specification | `docs/design/typed-return-model-spec.md` | Proposed typed return migration | Review | Engineering | No | — | 2026-06-22 | — | — | Design-only until accepted and implemented |
| Reconciliation Engine Specification | `docs/design/reconciliation-engine-spec.md` | Proposed reconciliation model | Review | Engineering | No | — | 2026-06-22 | — | — | Supporting design |
| Treasury Engine Specification | `docs/design/treasury-engine-spec.md` | Proposed Treasury architecture | Review | Engineering | No | — | 2026-06-23 | — | — | Supporting design |
| Treasury Accounting Model | `docs/design/treasury-accounting-model.md` | Proposed double-entry accounting model | Review | Engineering | No | — | 2026-06-23 | — | — | Requires Business and accounting review |
| Treasury Operating Modes Specification | `docs/design/treasury-operating-modes-spec.md` | Proposed Treasury rollout modes | Review | Engineering | No | — | 2026-06-23 | — | — | Does not authorize enforced Treasury |

### Architecture Canonical Documents

- `docs/ARCHITECTURE.md`
- `docs/architecture/ADR-001-live-first-architecture.md`

### Architecture Supporting Documents

ADR-002 and all five documents in `docs/design/` are active design inputs. Their content becomes
canonical only after explicit acceptance and, where applicable, implementation validation.

### Architecture Historical Documents

No Architecture file is designated Archived. Implementation-era architecture descriptions in
the Developer Review Kit remain historical snapshots rather than current architecture authority.

## Business

### Business Purpose

Business documentation defines participant relationships, financial boundaries, disclosure,
Investment Models, model economics, and the frozen business maturity roadmap.

### Business Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Business Architecture v1.0 Freeze | `docs/business/BUSINESS_ARCHITECTURE_V1_FREEZE.md` | Frozen business baseline and change control | Frozen | Business | Yes | 1.0 | 2026-07-02 | Pre-freeze architecture decisions | — | Highest Business authority |
| AgriPartners v2 Operating Model | `docs/business/OPERATING_MODEL.md` | Counterparty, participant, Project, and business roadmap model | Frozen | Business | Yes | 2.0 / freeze 1.0 | 2026-07-02 | Earlier direct Investor/Farmer assumptions | — | Frozen through the architecture freeze |
| Financial Operating Model | `docs/business/FINANCIAL_OPERATING_MODEL.md` | Provider-neutral funding and Settlement boundaries | Frozen | Business | Yes | RFC-003 / freeze 1.0 | 2026-07-02 | Earlier crypto-first funding descriptions | — | Does not authorize real-funds activity |
| Information Disclosure Policy | `docs/business/INFORMATION_DISCLOSURE_POLICY.md` | Disclosure, confidentiality, and role-access policy | Frozen | Business | Yes | Freeze 1.0 | 2026-07-02 | Informal disclosure assumptions | — | Governs all audience and role documents |
| Feedlot Master Investment Model | `docs/business/investment-models/FEEDLOT_MASTER_INVESTMENT_MODEL.md` | Reusable Feedlot business model | Frozen | Business | Yes | 1.0 | 2026-07-02 | Pilot-specific summaries | — | Project adaptation still requires approval |
| Hissar Sheep Master Investment Model | `docs/business/investment-models/HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md` | Reusable Hissar Sheep business model | Frozen | Business | Yes | 1.0 | 2026-07-02 | Pilot-specific summaries | — | Project adaptation still requires approval |
| 60/40 Financial Model Authority | `docs/60-40/README.md` | Numeric, editable-source, and publication authority rules | Accepted | Business | Yes | Fidlot 5.9 / VariantB 2.1 | 2026-06-29 | Earlier split comparisons | — | Numeric generator is `scripts/build_60_40_documents.py` |
| Farmer Fidlot EN source | `docs/60-40/source/en/Agri-Farmer-Fidlot-v5.9-6040-EN.docx` | Editable English Farmer model | Accepted | Business | Yes | 5.9 | 2026-06-29 | Earlier Fidlot Farmer versions | — | Generated PDF is not editable authority |
| Farmer VariantB EN source | `docs/60-40/source/en/Agri-Farmer-VariantB-v2.1-6040-EN.docx` | Editable English Farmer model | Accepted | Business | Yes | 2.1 | 2026-06-29 | Earlier VariantB Farmer versions | — | Generated PDF is not editable authority |
| Investor Fidlot EN source | `docs/60-40/source/en/Agri-Investor-Fidlot-v5.9-6040-EN.docx` | Editable English Investor model | Accepted | Business | Yes | 5.9 | 2026-06-29 | Earlier Fidlot Investor versions | — | Generated PDF is not editable authority |
| Investor VariantB EN source | `docs/60-40/source/en/Agri-Investor-VariantB-v2.1-6040-EN.docx` | Editable English Investor model | Accepted | Business | Yes | 2.1 | 2026-06-29 | Earlier VariantB Investor versions | — | Generated PDF is not editable authority |
| Farmer Fidlot RU source | `docs/60-40/source/ru/Agri-Farmer-Fidlot-v5.9-6040-RU.docx` | Editable Russian Farmer model | Accepted | Business | Yes | 5.9 | 2026-06-29 | Earlier Fidlot Farmer versions | — | English/Russian figures must remain synchronized |
| Farmer VariantB RU source | `docs/60-40/source/ru/Agri-Farmer-VariantB-v2.1-6040-RU.docx` | Editable Russian Farmer model | Accepted | Business | Yes | 2.1 | 2026-06-29 | Earlier VariantB Farmer versions | — | English/Russian figures must remain synchronized |
| Investor Fidlot RU source | `docs/60-40/source/ru/Agri-Investor-Fidlot-v5.9-6040-RU.docx` | Editable Russian Investor model | Accepted | Business | Yes | 5.9 | 2026-06-29 | Earlier Fidlot Investor versions | — | English/Russian figures must remain synchronized |
| Investor VariantB RU source | `docs/60-40/source/ru/Agri-Investor-VariantB-v2.1-6040-RU.docx` | Editable Russian Investor model | Accepted | Business | Yes | 2.1 | 2026-06-29 | Earlier VariantB Investor versions | — | English/Russian figures must remain synchronized |
| Business Architecture Audit v1.0 | `docs/business/BUSINESS_ARCHITECTURE_AUDIT_V1.md` | Evidence and findings leading to the freeze | Archived | Business | No | 1.0 | 2026-07-02 | — | Business Architecture Freeze | Historical decision evidence |

### Business Canonical Documents

The Frozen business set and the 60/40 authority/source package are canonical. The Master
Investment Models own reusable business structure; the 60/40 numeric generator and source
package own exact published model calculations.

### Business Supporting Documents

- Generated PDFs under `docs/60-40/pdf/{en,ru}/`
- `docs/60-40/ESCROW-44-DEFERRED-TASK-RU.md`

### Business Historical Documents

- `docs/business/BUSINESS_ARCHITECTURE_AUDIT_V1.md`
- Empty placeholder `docs/business-model/`
- Comparison and escrow-analysis PDFs already under `docs/archive/`

## Pilots

### Pilots Purpose

Pilot documentation defines Phase 3 Pilot 1.0 scope, readiness evidence, operations, and
go/no-go boundaries.

### Pilots Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pilot 1.0 Plan | `docs/platform/pilot/PILOT_1_PLAN.md` | Scope and lifecycle of one controlled Pilot Project | Accepted | Business | Yes | 1.0 | 2026-07-02 | Earlier pilot-as-cycle descriptions | — | Does not authorize real funds |
| Pilot Readiness Checklist | `docs/platform/pilot/PILOT_READINESS_CHECKLIST.md` | Mandatory evidence-based go/no-go controls | Living | Operations | Yes | 1.0 | 2026-07-02 | Informal readiness lists | — | Completion requires owner and evidence |
| Pilot Operations Guide | `docs/platform/pilot/PILOT_OPERATIONS_GUIDE.md` | Working Pilot operating procedure | Living | Operations | Yes | 1.0 | 2026-07-02 | Informal Pilot procedures | — | Must be adapted before real-funds use |
| Pilot 1.0 Implementation Roadmap | `docs/platform/PILOT_1_IMPLEMENTATION_ROADMAP.md` | Draft cross-functional execution plan | Draft | Operations | No | RFC-006 draft | 2026-07-05 | — | `docs/ROADMAP.md` for software release priorities | Supporting plan, not authorization |

### Pilots Canonical Documents

The Plan, Readiness Checklist, and Operations Guide form the canonical Pilot set.

### Pilots Supporting Documents

- `docs/platform/PILOT_1_IMPLEMENTATION_ROADMAP.md`
- Pilot-related Product Review findings and accepted Product specifications
- Master Investment Models and Project-specific adaptations when approved

### Pilots Historical Documents

Older pilot summaries in investor, presentation, demo, pitch, and outreach packages are
audience-specific snapshots and do not govern Pilot scope.

## Legal

### Legal Purpose

Legal documentation defines platform contract architecture, legal-package planning, agreement
drafts, pilot agreement analysis, and legal readiness findings. Legal documents in this folder are
planning, analysis, review, or architecture drafts unless explicitly accepted after qualified legal
counsel review.

### Legal Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Platform Contract Architecture | `docs/legal/PLATFORM_CONTRACT_ARCHITECTURE.md` | Platform legal relationship model and required document set | Planning | Product / Legal | No | 1.0 | 2026-07-07 | Direct investor-farmer assumptions in planning materials | TBD | Legal architecture planning; requires counsel review |
| Pilot Agreement Audit | `docs/legal/PILOT_AGREEMENT_AUDIT.md` | Analysis of Fidlot and Hissar pilot materials against platform model | Analysis | Product / Legal | No | 1.0 | 2026-07-07 | TBD | TBD | Historical analysis, not a legal agreement |
| Investment Participation Agreement Specification | `docs/legal/INVESTMENT_PARTICIPATION_AGREEMENT_SPEC.md` | Document architecture for the future investor agreement | Planning | Product / Legal | No | 1.0 | 2026-07-07 | TBD | Final legal agreement after counsel review | Specification only |
| Investment Participation Agreement Draft v1 | `docs/legal/INVESTMENT_PARTICIPATION_AGREEMENT.md` | Architecture draft of investor-facing agreement | Architecture Draft | AgriPartners | No | Draft v1 | 2026-07-07 | TBD | Production agreement after counsel review | Not legal advice or production contract |
| Legal Package Review | `docs/legal/LEGAL_PACKAGE_REVIEW.md` | Legal and strategic documentation consistency review | Review | Product / Legal | No | 1.0 | 2026-07-07 | TBD | TBD | Findings and recommendations |

### Legal Canonical Documents

No legal document is production-canonical yet. The current legal package is planning and review
material. It should guide product and documentation alignment but must not be used as final legal
advice or as a production contract package.

### Legal Supporting Documents

- Future Project Disclosure Sheet
- Future Risk Disclosure
- Future Farm Operating Agreement v2
- Future Terms of Use
- Future Privacy Policy
- Future Capital Flow Guide

### Legal Historical Documents

The current Fidlot and Hissar pilot model documents under `docs/60-40/source/` remain canonical
business-model and editable-source materials. They are historical inputs for future platform legal
documents, not production-ready platform agreements.

## Investor

### Investor Purpose

Investor documentation communicates approved Product and Business facts to investors,
accelerators, grant reviewers, and strategic partners.

### Investor Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Investor Executive One Pager EN | `docs/investors/investor-executive-one-pager.md` | Current English investor summary | Accepted | Investor Relations | No | Alpha v1.2 | 2026-07-30 | Earlier investor one-pagers | — | Current controlled investor publication; derived from canonical Product, Business, and release sources |
| Investor Executive One Pager RU | `docs/investors/investor-executive-one-pager-ru.md` | Current Russian investor summary | Review | Investor Relations | No | Alpha v1.2 | 2026-06-24 | Earlier Russian investor one-pagers | — | Translation companion |
| Investor One-Pager v2 EN | `docs/investor-package/investor-one-pager-en-v2.md` | Investor-package one-page publication source | Review | Investor Relations | No | 2 | 2026-06-29 | v1 one-pager | — | Competes with the executive one-pager; consolidation required |
| Investor One-Pager v2 RU | `docs/investor-package/investor-one-pager-ru-v2.md` | Russian investor-package one-page publication source | Review | Investor Relations | No | 2 | 2026-06-29 | v1 Russian one-pager | — | Consolidation required |
| Investor Brief EN/RU | `docs/investor-pack/investor-brief*.md` | Longer investor narrative | Review | Investor Relations | No | Alpha v1 | 2026-06-29 | — | — | Derived material, not Business authority |

### Investor Canonical Documents

No investor publication is currently canonical. Investor facts must come from the Product Book,
Frozen Business documents, Master Investment Models, 60/40 authority package, Roadmap, and
Releases index.

### Investor Supporting Documents

- Current Alpha v1.2 English summary under `docs/investors/`
- v2 one-pagers, current outlines, readiness review, asset plan, and scripts under
  `docs/investor-package/`
- `docs/investor-pack/`

### Investor Historical Documents

- `docs/investor-package/one-pager-v1*.md`
- `docs/investor-package/pitch-deck-v1*.md`
- `docs/investor-package/demo-script-v1*.md`
- `docs/investor-package/AgriPartners_Investor_Deck_v1_*.pptx`
- Alpha v1.1 materials under `docs/investor/`, except its living package README
- Empty placeholder `docs/investor-deck/`

The v1 PPTX decks contain financial values superseded by the current 60/40 model package.

## Grants & Strategy

### Grants & Strategy Purpose

Grants & Strategy documentation tracks grant, accelerator, and strategic funding opportunities,
applications, requested amounts, dependencies, and next actions without redefining Development
Round authority.

### Grants & Strategy Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Funding Pipeline | `docs/grants/FUNDING_PIPELINE.md` | Active grant, accelerator, and strategic funding-opportunity pipeline | Living | Grants & Strategy | Yes | — | 2026-08-17 | — | — | Canonical operational funding-opportunity register; Development Round facts remain controlled by AME v1.0 R1 |

### Grants & Strategy Supporting Documents

- Opportunity-specific research, checklists, playbooks, and application materials under
  `docs/grants/`.
- Historical grant adaptations under `docs/archive/grants/` are non-authoritative.

## NEAR

### NEAR Purpose

NEAR documentation supports ecosystem positioning, technical review, outreach, relationship
tracking, and partner engagement without redefining Product, Business, or release facts.

### NEAR Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Outreach CRM | `docs/outreach/outreach-crm.md` | Active cross-ecosystem outreach pipeline | Living | Investor Relations | Yes | — | 2026-07-03 | Fragmented contact tracking | — | Canonical operational outreach record |
| Near Directory Index | `docs/outreach/near-directory/README.md` | Directory methodology and navigation | Living | Investor Relations | Yes | — | 2026-06-26 | Ad hoc contact lists | — | Canonical directory method, not Product authority |
| Near Directory Verification Log | `docs/outreach/near-directory/verification-log.md` | Contact/source verification history | Living | Investor Relations | Yes | — | 2026-06-25 | — | — | Supports the directory |
| NEAR Ecosystem CRM | `docs/near/near-ecosystem-crm.md` | Historical Phase 24 outreach strategy | Deprecated | Investor Relations | No | Phase 24 | 2026-07-30 | — | `docs/outreach/outreach-crm.md` | Contact tracking is prohibited here; retained for historical strategy context |
| NEAR Track Roadmap | `docs/near/near-track-roadmap.md` | NEAR-specific planning | Review | Investor Relations | No | Phase 23 | 2026-07-02 | — | `docs/ROADMAP.md` for software delivery | Partner strategy only |
| NEAR Testnet EN/RU | `docs/near-testnet*.md` | Testnet status summaries | Review | Engineering | No | Alpha v1 | 2026-06-27 | — | `docs/ARCHITECTURE.md` and current evidence | Must not override current implementation evidence |

### NEAR Canonical Documents

Only the active Outreach CRM and Near Directory method/verification log are canonical within
their narrow operational scopes. No NEAR narrative or roadmap is canonical for Product,
Business, Architecture, or releases.

### NEAR Supporting Documents

- Current positioning under `docs/near/`
- Ecosystem research under `docs/near-ecosystem/`
- Reusable outreach copy under `docs/near-outreach/` and `docs/near-outreach-toolkit/`
- Active execution and validation records under `docs/near-execution/`
- Research, directory, playbook, shortlist, and LinkedIn materials under `docs/outreach/`
- Root `near-grant-application.md` and `near-testnet*.md`

### NEAR Historical Documents

- Superseded phase snapshots in the multiple NEAR workstream folders
- Root `near-forum-post.md`, `near-forum-post-ru.md`, and `near-forum-post.html`, retained only as
  Historical Legacy Testnet Alpha proposal evidence
- Root `near-grant-application-ru.md`, retained only as a Historical Legacy Testnet Alpha
  translation and not approved for submission
- PDF exports of CRM and shortlist documents once their Markdown source changes

## Platform

### Platform Purpose

Platform documentation explains role surfaces, exploratory frameworks, and stakeholder-facing
platform concepts that are subordinate to Product, Business, and Architecture authority.

### Platform Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Platform Documentation Index | `docs/platform/README.md` | Navigation for Platform documents | Living | Product | No | — | 2026-07-02 | — | `docs/PRODUCT_BOOK.md` for canonical navigation | Contains future-structure language |
| Platform Explained EN/RU | `docs/platform/PLATFORM_EXPLAINED_*.docx` | Editable stakeholder explanation | Review | Investor Relations | No | 2.0 | 2026-06-26 | Earlier platform explanations | — | Must be checked against frozen Business architecture |
| Investor Protection Framework Index | `docs/platform/investor-protection/README.md` | Navigation for exploratory protection work | Review | Business | No | 1 | 2026-06-29 | — | — | Deferred to later business phases |
| Investor Protection Decision Memo | `docs/platform/investor-protection/DECISION_MEMO_V1_RU.md` | Protection-design decision record | Review | Business | No | 1 | 2026-06-29 | Earlier exploratory calculations | — | Not active Pilot scope |
| Investor Portal Guide EN/RU | `docs/investor-portal*.md` | Alpha role-surface summary | Review | Product | No | Alpha v1 | 2026-06-27 | — | Canonical Workspace specifications | Supporting snapshot |
| Farmer Portal Guide EN/RU | `docs/farmer-portal*.md` | Alpha role-surface summary | Deprecated | Product | No | Alpha v1 | 2026-06-27 | — | Canonical Farmer Experience Specification | Retained for links and screenshot context |
| Admin Dashboard Guide EN/RU | `docs/admin-dashboard*.md` | Alpha Operator/Admin surface summary | Review | Product | No | Alpha v1 | 2026-06-27 | — | Future canonical Operator specification | Supporting snapshot |

### Platform Canonical Documents

No document in this residual Platform category is canonical. Canonical product-layer documents
physically located under `docs/platform/` are registered in Product and Pilots above.

### Platform Supporting Documents

- `docs/platform/README.md`
- Platform Explained DOCX/PDF publications
- `docs/platform/investor-protection/` exploratory framework
- Root role guides

### Platform Historical Documents

- Generated Platform Explained PDFs after their DOCX source changes
- Farmer Portal summaries replaced by the accepted Farmer specifications
- Earlier protection analyses already under `docs/archive/`

## Development

### Development Purpose

Development documentation supports technical review, deployment planning, implementation
history, and engineering evidence.

### Development Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Developer Review Kit | `docs/developer-review/README.md` | Entry point for external technical review | Review | Engineering | No | Alpha v1 | 2026-06-19 | — | `docs/ARCHITECTURE.md` for current overview | Review snapshot |
| Technical Overview | `docs/developer-review/01-technical-overview.md` | Detailed Alpha implementation inventory | Review | Engineering | No | Alpha v1 | 2026-06-19 | Earlier technical summaries | `docs/ARCHITECTURE.md` for high-level authority | Source code remains implementation truth |
| Developer Architecture | `docs/developer-review/02-architecture.md` | Detailed Alpha component and risk snapshot | Review | Engineering | No | Alpha v1 | 2026-06-19 | — | `docs/ARCHITECTURE.md` | Useful evidence, not living authority |
| Public Deployment Plan EN/RU | `docs/deployment/*public-deployment-plan*.md` | Proposed deployment process | Draft | Engineering | No | Alpha v1 | 2026-06-19 | — | — | Planning only |
| Testnet Evidence Packet EN/RU | `docs/developer-review/*testnet-evidence-packet*.md` | Collected technical evidence | Review | Engineering | No | Alpha v1 | 2026-06-19 | — | Future canonical evidence registry | Evidence requires refresh |

### Development Canonical Documents

Development has no separate canonical overview beyond `docs/ARCHITECTURE.md` and accepted ADRs.
Source code, migrations, configuration, tests, and deployed evidence remain authoritative for
implemented technical behavior.

### Development Supporting Documents

All files under `docs/developer-review/` and `docs/deployment/` are supporting review or planning
material.

### Development Historical Documents

All dated plans and specifications under `docs/superpowers/` are implementation history. They
must not be used as evidence that planned functionality is currently implemented.

## Releases

### Releases Purpose

Release documentation records shipped scope, validation boundaries, known limitations, and
historical release evidence.

### Releases Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Releases Index | `docs/RELEASES.md` | Current release and release-history index | Living | Engineering | Yes | 1.0 | 2026-07-13 | Distributed release navigation | — | Does not copy detailed release notes |
| Alpha v1.2 Release Notes | `docs/releases/alpha-v1.2-release-notes.md` | Current product and presentation release record | Accepted | Engineering | Yes | Alpha v1.2 | 2026-07-13 | Alpha v1.1 current-release status | — | Current release evidence with stated limitations |
| Alpha v1.1 Completed Release | `docs/releases/ALPHA_V1_1_RELEASE.md` | Official completed Alpha v1.1 milestone | Frozen | Engineering | Yes | Alpha v1.1 | 2026-07-12 | — | Alpha v1.2 Release Notes for current status | Historical foundation of the current Alpha v1.2 presentation release |
| Alpha v1.1 Release Review EN | `docs/releases/alpha-v1.1-release-review.md` | Historical Alpha v1.1 assessment | Frozen | Engineering | Yes | Alpha v1.1 | 2026-06-23 | — | Alpha v1.2 Release Notes for current status | Immutable historical release record |
| Alpha v1.1 Release Review RU | `docs/releases/alpha-v1.1-release-review-ru.md` | Russian historical Alpha v1.1 assessment | Frozen | Engineering | Yes | Alpha v1.1 | 2026-06-23 | — | Alpha v1.2 Release Notes for current status | Translation of historical record |

### Releases Canonical Documents

The Releases index owns release navigation. Each published release record is canonical only for
the historical release it describes.

### Releases Supporting Documents

Roadmap entries, audits, demo evidence, and developer-review evidence may support a release but
do not replace its release record.

### Releases Historical Documents

Alpha v1.1 records are intentionally historical and remain canonical for Alpha v1.1.

## Presentation

### Presentation Purpose

Presentation documentation packages approved facts for decks, speaking, demonstrations, and
stakeholder conversations.

### Presentation Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Presentation Readiness Set EN/RU | `docs/presentation-readiness/` | Executive summary, demo flow, metrics, script, and one-pager | Review | Investor Relations | No | Alpha v1 | 2026-06-29 | Earlier presentation drafts | — | Derived package |
| Pitch Deck Markdown Set EN/RU | `docs/pitch-deck/` | Slide-level pitch sources | Review | Investor Relations | No | 1 | 2026-07-02 | Earlier pitch fragments | — | Must follow canonical roadmap and terminology |
| Pitch Deck v2 EN/RU | `docs/investor-package/pitch-deck-v2*.md` | Current detailed deck source | Review | Investor Relations | No | 2 | 2026-06-29 | Pitch Deck v1 | — | No accepted canonical deck selected |
| Presentation Outlines EN/RU | `docs/investor-package/presentation-outline-*.md` | Detailed speaker/deck structure | Review | Investor Relations | No | 1 | 2026-06-29 | — | — | Supporting source |

### Presentation Canonical Documents

No presentation package is canonical. Presentation claims must be validated against the Product
Book, Frozen Business documents, 60/40 authority package, Roadmap, and Releases index.

### Presentation Supporting Documents

- `docs/presentation-readiness/`
- `docs/pitch-deck/`
- Current v2 and outline material in `docs/investor-package/`

### Presentation Historical Documents

- v1 presentation sources and PPTX decks
- Root `one-pager.html`, `pitch-deck.html`, and `funding-strategy.html`
- `docs/archive/checklist.html`

## Demo

### Demo Purpose

Demo documentation defines controlled walkthroughs, approved demo data, readiness checks, and
capture guidance without representing demo state as live or production state.

### Demo Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Demo Data Pack EN | `docs/demo-readiness/03-demo-data-pack.md` | Approved English Alpha demo scenario data | Living | Product | Yes | Alpha v1.2 | 2026-06-27 | Earlier demo values | — | Must remain synchronized with 60/40 authority |
| Demo Data Pack RU | `docs/demo-readiness/13-demo-data-pack-ru.md` | Approved Russian Alpha demo scenario data | Living | Product | Yes | Alpha v1.2 | 2026-06-27 | Earlier Russian demo values | — | Translation companion |
| Demo Scenario and Script EN/RU | `docs/demo-readiness/*demo-scenario*.md`, `docs/demo-readiness/*demo-script*.md` | Controlled walkthrough and narration | Review | Product | No | Alpha v1.2 | 2026-06-27 | Earlier demo scripts | — | Derived from Product and release facts |
| Demo Checklists EN/RU | `docs/demo-readiness/*demo-checklist*.md` | Demonstration readiness checks | Living | Operations | No | Alpha v1.2 | 2026-06-27 | — | — | Operational support |
| Demo Assets Inventory EN/RU | `docs/demo-assets/*demo-assets-inventory*.md` | Inventory of available demonstration assets | Living | Operations | No | Alpha v1 | 2026-06-18 | — | — | Asset index, not Product authority |

### Demo Canonical Documents

Only the bilingual Demo Data Pack is canonical for the controlled Alpha demonstration dataset.
Business economics remain owned by the 60/40 authority package.

### Demo Supporting Documents

- Remaining files under `docs/demo-readiness/`
- Inventory documents and screenshots under `docs/demo-assets/`

### Demo Historical Documents

- Superseded screenshots and walkthrough sequences
- Empty placeholder `docs/demo-guide/`

## Assets

### Assets Purpose

Asset documentation and generated files support visual review and publication. Assets do not
become canonical merely because they are distributed.

### Assets Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Investor Package Screenshot Guide | `docs/investor-package/screenshots/README.md` | Screenshot requirements and capture paths | Review | Investor Relations | No | Pitch v2 | 2026-06-29 | Earlier capture instructions | — | Supporting capture guide |
| Role Screenshot Sets | `docs/screenshots/{investor,farmer,admin}/` | Visual evidence for role guides and presentations | Review | Product | No | Alpha v1 | 2026-06-11 | — | Current verified captures when selected | Existing assets may show earlier states |
| Demo v1 Screenshot Set | `docs/screenshots/demo-v1/` | Historical demo capture sequence | Archived | Product | No | Demo v1 | 2026-06-16 | — | — | Includes duplicated `.png.png` naming |
| Demo Asset Screenshots | `docs/demo-assets/screenshots/` | Presentation/demo screenshots | Review | Product | No | Alpha v1 | 2026-06-18 | — | — | Requires visual currency review |
| Generated 60/40 PDFs | `docs/60-40/pdf/{en,ru}/` | Published model documents | Accepted | Business | No | Fidlot 5.9 / VariantB 2.1 | 2026-06-29 | Earlier model PDFs | — | Generated from canonical DOCX/numeric sources |

### Assets Canonical Documents

No visual or generated asset is an independent canonical source. Generated 60/40 PDFs are
accepted publications, while their numeric generator and DOCX sources remain authoritative.

### Assets Supporting Documents

- Current role and demo screenshots
- Generated PDF, DOCX, PPTX, and HTML publications
- Screenshot capture and checklist files

### Assets Historical Documents

- `docs/screenshots/demo-v1/`
- v1 investor deck PPTX files
- Root HTML exports
- Any screenshot that no longer matches the current release

## Archive

### Archive Purpose

Archive documentation preserves historical decisions, evidence, exports, and prior audits
without allowing them to govern current work.

### Archive Authority Records

| Document name | Path | Purpose | Status | Owner | Canonical | Version | Last reviewed | Supersedes | Replaced by | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Archive Index | `docs/archive/README.md` | Manifest and use boundary for archived material | Living | Operations | Yes | — | 2026-06-27 | Unlabeled historical files | — | Canonical only as archive manifest |
| Alpha v1 Repository Audit EN/RU | `docs/audits/` | Point-in-time implementation assessment | Archived | Engineering | No | Alpha v1 | 2026-06-21 | Earlier informal audit claims | Current source, Architecture, and Releases | Historical evidence |
| Documentation Architecture Audit EN/RU | `docs/archive/deprecated/documentation-architecture/` | Prior inventory, reading order, rename plan, and link analysis | Archived | Product | No | 1 | 2026-06-27 | — | `docs/DOCUMENTATION_AUTHORITY_MATRIX.md` | Files remain in place but are logically archived |
| Archived Comparison PDF | `docs/archive/deprecated/AgriPartners-Comparison-AllSplits.pdf` | Historical split comparison | Archived | Business | No | — | 2026-06-27 | — | 60/40 authority package | Must not drive current claims |
| Archived Escrow Analysis PDF | `docs/archive/deprecated/AgriPartners-Escrow-Analysis.pdf` | Historical escrow analysis | Archived | Business | No | — | 2026-06-27 | — | Current exploratory protection framework | Internal historical context |
| Archived Checklist HTML | `docs/archive/checklist.html` | Historical outreach checklist | Archived | Investor Relations | No | — | 2026-06-27 | — | Current outreach CRM | Browser-local historical state |

### Archive Canonical Documents

Only `docs/archive/README.md` is canonical, and only for identifying archive contents and their
usage boundary.

### Archive Supporting Documents

None. Archived documents may be cited as historical evidence but are not supporting authority
for current decisions.

### Archive Historical Documents

All remaining files under `docs/archive/`, `docs/audits/`, and
`docs/archive/deprecated/documentation-architecture/`.

## Canonical Documentation Map

```text
DOCUMENTATION_AUTHORITY_MATRIX.md
  |
  +-- governance procedure --> DOCUMENTATION_GUIDE.md
  +-- workstream routing ----> governance/WORKSTREAM_OPERATING_MODEL.md
  |
  +-- ecosystem entry -------> PRODUCT_BOOK.md
  |                              |
  |                              +-- Business Architecture v1.0 Freeze
  |                              |     +-- Operating Model
  |                              |     +-- Financial Operating Model
  |                              |     +-- Information Disclosure Policy
  |                              |     +-- Master Investment Models
  |                              |
  |                              +-- Product Operating Model v1.0
  |                                    +-- Project Workspace Specification
  |                                    +-- Farmer Experience Specification
  |                                          +-- Farmer Daily Workflow
  |
  +-- technical system -------> ARCHITECTURE.md
  |                              +-- ADR-001 (Accepted)
  |                              +-- ADR-002 (Review / not canonical)
  |
  +-- software delivery ------> ROADMAP.md
  |                              +-- accepted Product specifications
  |                              +-- Pilot readiness dependencies
  |
  +-- strategic roadmap ------> MASTER_ROADMAP_V2.md
  |                              +-- Product, legal, investor, NEAR, and launch sequencing
  |
  +-- release history --------> RELEASES.md
  |                              +-- Alpha v1.2 Release Notes
  |                              +-- Alpha v1.1 historical records
  |
  +-- legal package ----------> legal/PLATFORM_CONTRACT_ARCHITECTURE.md
  |                              +-- legal/PILOT_AGREEMENT_AUDIT.md
  |                              +-- legal/INVESTMENT_PARTICIPATION_AGREEMENT_SPEC.md
  |                              +-- legal/INVESTMENT_PARTICIPATION_AGREEMENT.md
  |                              +-- legal/LEGAL_PACKAGE_REVIEW.md
  |
  +-- Pilot authority --------> Pilot 1.0 Plan
  |                              +-- Pilot Readiness Checklist
  |                              +-- Pilot Operations Guide
  |
  +-- exact model economics --> 60-40/README.md
                                 +-- numeric generator
                                 +-- canonical DOCX sources
                                 +-- generated PDF publications
```

Authority flows downward from the owner document. Investor, NEAR, Presentation, Platform, Demo,
and asset packages derive claims from this map and must not reverse that authority.

## Documentation Lifecycle

The standard lifecycle is:

```text
Draft
  |
  v
Review
  |
  v
Accepted
  |
  v
Frozen
  |
  v
Archived
```

Additional lifecycle behavior:

- **Living** documents remain maintained after acceptance and cycle through review as needed.
- **Deprecated** documents remain temporarily available for compatibility and must name their
  replacement.
- Accepted documents do not need to become Frozen.
- Frozen documents require declared change control before material revision.
- Archived documents retain historical context but lose authority over current work.

### Lifecycle and Historical Terminology

These terms are related but not interchangeable:

| Term | Governance meaning |
| --- | --- |
| **Historical** | Describes point-in-time evidence or past context. It is not a lifecycle status and does not by itself determine location or authority. |
| **Archived** | A lifecycle status for material retained as historical context after losing authority over current work. Archived content normally resides under an approved archive path, but location alone does not assign status. |
| **Legacy** | Describes an older implementation, workflow, asset, or terminology retained for compatibility or historical evidence. Legacy material must state whether it remains active, Deprecated, or Archived. |
| **Deprecated** | A lifecycle status for material temporarily retained for compatibility but prohibited as guidance for new work. It must identify its replacement and transition or archival criteria. |
| **Superseded** | A registry relationship showing that a newer authority displaced all or part of an older source. The older source's explicit status still controls its permitted use until it is Deprecated or Archived. |

All Archived documents are historical, but not all historical documents are Archived. A
historical release record or point-in-time audit outside `docs/archive/` may retain only the
evidentiary authority explicitly registered for it; it must not govern current facts by
implication.

## Documentation Ownership Model

| Category | Primary owner | Required collaborators | Maintenance responsibility |
| --- | --- | --- | --- |
| Product | Product | Business, Engineering, Operations | Product direction, UX authority, review state, delivery roadmap |
| Architecture | Engineering | Product, Business where semantics cross domains | Current architecture, ADR status, technical boundaries |
| Business | Business | Product, Operations, legal/accounting reviewers | Operating, financial, disclosure, and Investment Model authority |
| Pilots | Operations | Business, Product, Engineering | Readiness evidence, procedures, controls, go/no-go records |
| Legal | Product / Legal | Business, Operations, Investor Relations, qualified legal counsel | Legal-package architecture, drafts, reviews, and counsel-review readiness |
| Investor | Investor Relations | Business, Product | Investor publications derived from approved facts |
| NEAR | Investor Relations | Engineering, Product | Ecosystem positioning, outreach, and relationship records |
| Platform | Product | Business, Engineering | Supporting platform explanations and role summaries |
| Development | Engineering | Product, Operations | Review kits, deployment plans, implementation evidence |
| Releases | Engineering | Product, Business for claims | Release records, validation evidence, limitations |
| Presentation | Investor Relations | Product, Business | Decks, scripts, presentation consistency |
| Demo | Product | Operations, Engineering | Controlled scenario, demo data, readiness |
| Assets | Owning content domain | Product or Investor Relations | Currency, source traceability, generated-output integrity |
| Archive | Operations | Original document owner | Archive manifest, retention, current-authority links |

Owners must review dependent documents when their canonical source changes. Collaboration does
not transfer authority: for example, Investor Relations may publish financial claims but
Business owns the underlying model.

## Governance Change Approval

The following rules govern material changes to repository-root `AGENTS.md`, the Authority Matrix,
Documentation Guide, Documentation Index, and Workstream Operating Model. They extend the existing
ownership model and do not replace stricter change control declared by an affected domain
authority.

### Approvers and Required Reviewers

- **Accountable approver:** the Product Governance Approver role designated through AgriPartners'
  existing Product decision authority for repository governance. The current role-holder or
  approving authority must be identified in durable approval evidence; document ownership alone
  does not confer this designation.
- **Required reviewers:** the accountable owners of every domain whose authority, classification,
  workflow, publication boundary, or stable path would be materially affected.
- **`AGENTS.md` review:** a material change to contributor or compatible-agent governance requires
  the Product Governance Approver and review by every domain whose instructions or authority
  boundary would change.
- **Engineering review:** required when the change alters implementation-authority language,
  generated-asset validation, repository verification, or release evidence.
- **Business, Operations, Investor Relations, or Product / Legal review:** required when the
  change affects that domain's ownership, publication controls, archive boundaries, or canonical
  records.
- The author may prepare a change but must not be treated as the sole approver when another
  ownership domain is materially affected.

### Approval Evidence

Approval evidence must be reviewable in repository or pull-request history and must identify:

- the governance documents changed and the decision being approved;
- the accountable approver;
- required reviewers and their recorded disposition;
- affected canonical or Frozen documents;
- validation performed; and
- any unresolved exception, follow-up owner, and due condition.

A merged pull request with recorded approval may serve as the evidence. When approval occurs
outside the pull request, the repository change must link to or summarize the durable decision
record. A document owner field alone is not approval evidence.

### Escalation

If reviewers cannot resolve a governance conflict:

1. classify the conflict by subject-matter scope;
2. preserve the current registered authority and status while review continues;
3. escalate to the accountable owner of the affected domain and the Product governance approver;
4. require qualified legal, compliance, accounting, or security review when the conflict depends
   on that expertise; and
5. record the decision and update every affected registry, procedure, or navigation entry in the
   same approved change.

The Product governance approver makes the final decision on documentation-registry, procedure,
and navigation mechanics. That approval cannot override another domain's Accepted or Frozen
subject-matter decision. A proposed cross-domain substantive change remains unapproved until
every affected accountable domain owner and any required specialist reviewer approves it through
the applicable change control.

No governance document may resolve an unresolved cross-domain conflict by silently redefining
another domain's accepted or Frozen decision.

## Safe Refactoring Readiness

### Safe to Archive Later

These documents are low-authority archive candidates after confirming that no open action or
required external reference remains:

- `docs/superpowers/`
- `docs/archive/deprecated/documentation-architecture/`
- completed `docs/product-roadmap/01-*` through `05-*` and `11-*` through `15-*`
- v1 one-pager, pitch-deck, and demo-script files under `docs/investor-package/`
- v1 investor deck PPTX files
- root `one-pager.html`, `pitch-deck.html`, and `funding-strategy.html`
- `docs/screenshots/demo-v1/`
- stale generated CRM, shortlist, presentation, and Platform Explained outputs after their
  editable sources are replaced
- duplicate or superseded NEAR phase packs after CRM and reusable copy are consolidated
- Farmer Portal summaries after all inbound links use the accepted Farmer specifications
- empty placeholders: `docs/business-model/`, `docs/demo-guide/`, `docs/investor-deck/`, and
  `docs/workflows/`

Archival requires `git mv`, an updated archive manifest, replacement links where applicable,
and link validation in the same change.

### Must Never Be Moved

The following are protected stable paths. Treat them as must-not-move unless an explicitly
approved authority migration updates every inbound reference and provides a compatibility
strategy:

- `README.md`
- `docs/README.md`
- `docs/PRODUCT_BOOK.md`
- `docs/DOCUMENTATION_AUTHORITY_MATRIX.md`
- `docs/DOCUMENTATION_GUIDE.md`
- `docs/governance/WORKSTREAM_OPERATING_MODEL.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/RELEASES.md`
- `docs/business/BUSINESS_ARCHITECTURE_V1_FREEZE.md`
- `docs/business/OPERATING_MODEL.md`
- `docs/business/FINANCIAL_OPERATING_MODEL.md`
- `docs/business/INFORMATION_DISCLOSURE_POLICY.md`
- both Master Investment Models under `docs/business/investment-models/`
- `docs/60-40/README.md` and canonical `docs/60-40/source/` files
- `docs/platform/PRODUCT_OPERATING_MODEL_V1.md`
- `docs/platform/CANONICAL_PROJECT_WORKSPACE_SPEC.md`
- `docs/platform/CANONICAL_FARMER_EXPERIENCE_SPEC.md`
- `docs/platform/FARMER_DAILY_WORKFLOW_SPEC.md`
- all three canonical files under `docs/platform/pilot/`
- `docs/architecture/ADR-001-live-first-architecture.md`
- `docs/releases/` published release records

Generated publications and screenshots should also retain their current paths until every
embedding document and external publication dependency has been identified.
