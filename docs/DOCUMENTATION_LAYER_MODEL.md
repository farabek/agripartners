# AgriPartners Documentation Layer Model

Status: Draft v1

Owner: AgriPartners

Version: Draft v1

Language: English

Last reviewed: 2026-07-07

Document type: Master documentation information architecture

## Part 1 - Purpose

This document defines the complete documentation architecture for AgriPartners. It describes how
project documentation should be organized, how document layers relate to each other, which audiences
each layer serves, and how future documentation should mature as AgriPartners moves from Alpha
prototype to Beta platform, production marketplace, and regional agricultural investment
infrastructure.

Documentation supports AgriPartners across seven major functions:

- **Product Development** - product direction, Project Workspace rules, role experience, roadmap,
  release boundaries, and implementation priorities.
- **Investor Readiness** - investor decision materials, project disclosures, financial models,
  risk explanations, capital flow, and presentation materials.
- **Farmer Operations** - farmer workflow, production duties, reporting, funding confirmation,
  settlement duties, and operational evidence.
- **Legal Framework** - platform contract architecture, Investment Participation Agreement, Farm
  Operating Agreement, disclosure documents, platform policies, and legal-package review.
- **Platform Governance** - documentation status, ownership, canonical authority, review process,
  versioning, and lifecycle control.
- **NEAR Ecosystem** - Testnet evidence, NEAR positioning, partnership materials, grant/outreach
  documentation, and blockchain transparency boundaries.
- **Business Development** - operating model, financial model, investor relations, partner
  readiness, pilot expansion, and market-facing narratives.

This layer model does not move, archive, or rename files. It defines the logical structure that
future documentation work should follow.

## Part 2 - Documentation Layers

### Level 1 - Investor Decision Package

Purpose: documents reviewed before making an investment decision.

The Investor Decision Package helps an investor understand a specific Project before signing an
Investment Participation Agreement. It should explain project facts, projected economics, major
risks, and expected capital movement in plain investor-facing language.

Included documents:

- Project Disclosure Sheet
- Financial Model
- Risk Disclosure
- Capital Flow Guide

### Level 2 - Legal Package

Purpose: documents governing legal participation.

The Legal Package defines the legal relationship between Investor, AgriPartners Platform Operator,
and Farmer / Pilot Farm. It must preserve the platform model where the Investor contracts with
AgriPartners and the Farmer contracts separately with AgriPartners.

Included documents:

- Investment Participation Agreement
- Farm Operating Agreement
- Terms of Use
- Privacy Policy

### Level 3 - Operational Package

Purpose: documents supporting platform execution.

The Operational Package supports daily and lifecycle execution after project approval. It tells
AgriPartners, Farmers, Operators, and supporting teams how funding, reporting, treasury records,
settlement, exceptions, and evidence should be handled.

Included documents:

- Reporting Framework
- Settlement Framework
- Treasury Process
- Operator Procedures
- Farmer Workflow

### Level 4 - Product & Technical Documentation

Purpose: documents defining product direction, technical architecture, delivery governance, release
history, and documentation authority.

Included documents:

- PRODUCT_BOOK
- ARCHITECTURE
- ROADMAP
- RELEASES
- DOCUMENTATION_GUIDE
- DOCUMENTATION_AUTHORITY_MATRIX
- MASTER_ROADMAP_V2

## Part 3 - Audience Matrix

| Documentation layer | Primary audience | Secondary audience |
| --- | --- | --- |
| Level 1 - Investor Decision Package | Investor | Investor Relations, Legal, Business, Operator |
| Level 2 - Legal Package | Investor, Farmer, Legal | Operator, Business, Investor Relations |
| Level 3 - Operational Package | Operator, Farmer, Operations | Business, Engineering, Legal |
| Level 4 - Product & Technical Documentation | Product, Engineering, Business | Legal, Operations, Investor Relations, NEAR Partners |

### Audience Roles

| Audience | Documentation needs |
| --- | --- |
| Investor | Project facts, risks, financial model, legal participation, reporting, settlement, capital flow |
| Farmer | Funding confirmation, production duties, reporting duties, operating agreement, settlement duties |
| Operator | Project status, document checklist, reports, treasury, settlement, exceptions, governance |
| Engineering | Architecture, APIs, database, smart contracts, release boundaries, implementation evidence |
| Business | Operating model, financial model, pilot scope, investor readiness, market development |
| Legal | Agreement architecture, disclosures, policies, legal readiness, counsel-review status |
| NEAR Partners | Technical evidence, ecosystem positioning, transparency role, Testnet/Mainnet boundaries |

## Part 4 - Document Lifecycle

AgriPartners documentation should follow this lifecycle:

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
Released
|
v
Archived
```

| Stage | Meaning |
| --- | --- |
| Draft | Initial authoring stage; not authoritative |
| Review | Complete enough for stakeholder review; proposed but not final |
| Accepted | Approved for use within its stated scope |
| Frozen | Protected baseline requiring formal change control |
| Released | Published as a distributed package, PDF, deck, or release record |
| Archived | Retained for historical context and no longer active |

Not every document must pass through every stage. For example, a living roadmap may remain Accepted
or Living without becoming Frozen. A generated PDF may be Released while its editable Markdown,
DOCX, or numeric source remains the authority.

## Part 5 - Cross References

Documents should connect through clear references rather than duplicating authority.

Example investor-to-operations path:

```text
Project Disclosure Sheet
|
v
Risk Disclosure
|
v
Investment Participation Agreement
|
v
Farm Operating Agreement
|
v
Reporting Framework
|
v
Settlement Framework
```

### Cross-reference Rules

- The Project Disclosure Sheet should reference the Financial Model, Risk Disclosure, Investment
  Participation Agreement, and project reports.
- The Risk Disclosure should support the Project Disclosure Sheet and Investment Participation
  Agreement.
- The Investment Participation Agreement should reference the Project Disclosure Sheet, Risk
  Disclosure, Financial Model, Settlement Schedule, and Reporting Framework.
- The Farm Operating Agreement should reference farmer duties, production schedules, reporting
  duties, settlement mechanics, and operational evidence.
- The Reporting Framework should support Farmer workflow, Operator review, Investor reporting, and
  Project Workspace status.
- The Settlement Framework should connect Treasury records, legal documents, financial model,
  investor distributions, and Operator approvals.

## Part 6 - Repository Structure

Current files should not be moved as part of this model. The following is a logical future
organization recommendation only:

```text
docs/
  legal/
  investor/
  operations/
  architecture/
  presentations/
  releases/
  business/
  platform/
  near/
  assets/
  archive/
```

### Future Organization Recommendations

| Folder | Logical purpose |
| --- | --- |
| `docs/legal/` | Contract architecture, legal drafts, disclosures, policies, legal reviews |
| `docs/investor/` | Investor decision package, investor FAQs, data room guides, investor-ready PDFs |
| `docs/operations/` | Reporting, settlement, treasury, farmer workflow, operator procedures |
| `docs/architecture/` | ADRs and detailed architecture decisions |
| `docs/presentations/` | Decks, scripts, demo narratives, external presentation sources |
| `docs/releases/` | Release records and released-scope evidence |
| `docs/business/` | Operating model, financial model, business architecture, investment models |
| `docs/platform/` | Product operating model, Project Workspace specs, role experiences |
| `docs/near/` | NEAR positioning, evidence, ecosystem, outreach, and partner materials |
| `docs/assets/` | Screenshots, generated PDFs, generated decks, publication outputs |
| `docs/archive/` | Historical documents no longer governing current work |

No folder changes are recommended until link impact, external references, generated assets, and
archive strategy are reviewed.

## Part 7 - Governance

Documentation ownership should follow clear accountability boundaries.

| Owner | Responsibilities |
| --- | --- |
| Product | Product vision, Project Workspace, role experience, product roadmap, documentation layer model |
| Business | Operating model, financial model, pilot economics, Investment Models, business roadmap |
| Engineering | Architecture, ADRs, technical evidence, release records, implementation boundaries |
| Legal | Agreement architecture, disclosures, platform policies, counsel-review readiness |
| Investor Relations | Investor materials, pitch materials, data room, external presentation consistency |
| Operations | Farmer workflow, reporting procedures, settlement operations, treasury process, pilot readiness |

### Governance Principles

- One topic should have one clearly named source of authority.
- Audience-specific documents must derive factual claims from accepted or frozen sources.
- Legal drafts must not be presented as production contracts until reviewed by qualified legal
  counsel.
- Generated PDFs and decks should identify their editable source.
- Historical pilot agreements and financial models remain historical or business-model references
  unless separately converted into platform legal documents.

## Part 8 - Documentation Maturity

| Documentation layer | Current maturity | Completion estimate | Remaining work |
| --- | --- | ---: | --- |
| Level 1 - Investor Decision Package | Early draft package | 35% | Risk Disclosure, Capital Flow Guide, project-specific Financial Model links, investor-ready PDF package |
| Level 2 - Legal Package | Architecture and IPA draft exist | 45% | Farm Operating Agreement v2, Terms of Use, Privacy Policy, counsel review, production metadata |
| Level 3 - Operational Package | Product and pilot foundations exist | 50% | Reporting Framework, Settlement Framework, Treasury Process, Operator Procedures, Farmer Workflow package |
| Level 4 - Product & Technical Documentation | Strong canonical foundation | 85% | Link refresh, authority updates, release evidence refresh, PDF publication plan |

### Current Strengths

- Product, business, technical, release, and governance entry points exist.
- Platform contract architecture is documented.
- Investment Participation Agreement draft exists.
- Project Disclosure Sheet template exists.
- Documentation Authority Matrix and Documentation Guide provide governance foundation.

### Current Gaps

- Risk Disclosure is not yet created.
- Capital Flow Guide is not yet created.
- Farm Operating Agreement v2 is not yet created.
- Terms of Use and Privacy Policy are not yet created.
- Operational framework documents are not yet consolidated into a single package.
- Investor, legal, and platform PDF packages are not yet generated.

## Part 9 - Future Roadmap

Recommended next documentation priorities:

| Priority | Document/package | Purpose |
| --- | --- | --- |
| 1 | Risk Disclosure | Define investor-facing risk categories and no-guarantee language |
| 2 | Capital Flow Guide | Explain investment, funding, treasury, farmer disbursement, settlement, and distribution flows |
| 3 | Farm Operating Agreement v2 | Define farmer-side platform operating agreement architecture and draft |
| 4 | Terms of Use | Define general platform access and use terms |
| 5 | Privacy Policy | Define data collection, use, storage, sharing, and retention principles |
| 6 | Investor Package PDF | Package Project Disclosure Sheet, Financial Model, Risk Disclosure, and Capital Flow Guide |
| 7 | Legal Package PDF | Package IPA, Farm Operating Agreement, Terms, Privacy, and supporting legal notes |
| 8 | Platform Documentation PDF | Package Product Book, Master Roadmap, Architecture, and documentation governance summaries |

PDF packages should not be generated until source documents pass metadata, link, disclaimer, and
owner review.

## Part 10 - Executive Summary

AgriPartners documentation should operate as a layered system.

The **Investor Decision Package** helps investors evaluate a project before signing. It contains the
Project Disclosure Sheet, Financial Model, Risk Disclosure, and Capital Flow Guide.

The **Legal Package** governs participation and platform relationships. It contains the Investment
Participation Agreement, Farm Operating Agreement, Terms of Use, and Privacy Policy. This layer must
preserve the platform model:

```text
Investor
-> Investment Participation Agreement
-> AgriPartners Platform Operator
-> Farm Operating Agreement
-> Farmer
```

The **Operational Package** supports execution after project approval. It covers reporting,
settlement, treasury processes, operator procedures, and farmer workflow.

The **Product & Technical Documentation** layer defines the canonical foundation for product,
architecture, release, roadmap, governance, and strategic planning.

Together these layers support the full AgriPartners platform lifecycle: investor evaluation,
agreement signing, farmer onboarding, project funding, production, reporting, treasury review,
settlement, distribution, release evidence, governance, and business development. The documentation
architecture should keep legal authority, business facts, product behavior, technical evidence, and
audience-specific communication clearly separated but connected through explicit references.

## Disclaimer

This document is a documentation architecture planning document. It is not legal advice, investment
advice, or production approval. Future legal, investor, operational, and PDF packages must be
reviewed by the appropriate owner and qualified legal counsel where required.
