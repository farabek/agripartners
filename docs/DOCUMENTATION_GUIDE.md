# AgriPartners Documentation Guide

Status: Accepted

Document owner: Product

Document type: Documentation governance procedure

Last reviewed: 2026-07-30

## Purpose

This guide defines how AgriPartners documentation is created, reviewed, accepted, changed, and
retired. It applies to canonical entry points, specifications, policies, ADRs, plans, release
records, and audience-specific materials.

Existing files are not automatically canonical because they predate this guide. Their authority
is registered in the [Documentation Authority Matrix](DOCUMENTATION_AUTHORITY_MATRIX.md). This
guide owns documentation procedure; it does not assign canonical classification or redefine
Product, Business, Engineering, Operations, release, legal, or other domain facts.

## Governance Responsibilities

AgriPartners uses a scoped authority model rather than a strict numbered hierarchy:

| Scope | Responsible source |
| --- | --- |
| Contributor and compatible-agent instructions | Repository-root `AGENTS.md` |
| Documentation status, ownership, canonical classification, supersession, replacement, and archive boundaries | [Documentation Authority Matrix](DOCUMENTATION_AUTHORITY_MATRIX.md) |
| Lifecycle, metadata, review, publication, translation, generated assets, and archive procedures | This guide |
| Official navigation, discovery, publication readiness, and access labels | [Documentation Index](DOCUMENTATION_INDEX.md) |
| Product, Business, Engineering, Operations, release, legal, and other subject matter | The registered canonical document for that domain and scope |
| Current implementation behavior | Current code, migrations, configuration, and executable tests |

When sources appear inconsistent, first identify the subject in dispute and then use the
authority for that scope. Navigation does not assign authority, registry classification does not
create domain facts, and ownership does not by itself prove approval.

## Document Status

Every new governance-sensitive document must declare one of these statuses near its title.

| Status | Meaning | Permitted use |
| --- | --- | --- |
| **Draft** | Initial work that has not entered formal review | Discussion and authoring only |
| **Review** | Complete enough for named stakeholder review | Review and proposed decisions; not authoritative |
| **Accepted** | Approved for use within its stated scope | Current authority unless a Frozen document has precedence |
| **Frozen** | Approved baseline protected by formal change control | Highest authority within its scope |
| **Living** | Accepted, maintained document that changes without becoming a new release | Current within its registered scope; material changes return through review |
| **Archived** | Retained as historical context and no longer active | Historical reference only |
| **Deprecated** | Still present for compatibility but should not guide new work | Transitional reference with a required replacement link |

Status must describe the document itself. A document may discuss completed work while remaining
Draft, or be Accepted while describing a future target. Living is a maintained form of accepted
use, not a higher authority level: the Authority Matrix must register its scope, ownership, and
canonical classification, and material changes follow the same affected-domain review rules.

### Related Terminology

- **Historical** describes point-in-time evidence or past context. It is not a lifecycle status.
- **Archived** is a lifecycle status: the material is retained for historical reference and has
  no authority over current work.
- **Legacy** describes an older implementation, workflow, asset, or term. Its metadata must still
  identify whether it is active, Deprecated, or Archived.
- **Deprecated** is a lifecycle status for compatibility material that must not guide new work;
  it requires a replacement and transition or archival criteria.
- **Superseded** records that a newer authority displaced all or part of an older source. It does
  not substitute for assigning the older source an explicit lifecycle status.

All Archived documents are historical; not all historical documents are Archived.

## Document Ownership

Each canonical document must name one accountable owner.

### Product

Owns:

- product vision and principles;
- user roles and interaction models;
- Project Workspace and experience specifications;
- product review and software delivery priorities;
- cross-domain product navigation.

### Business

Owns:

- participant and counterparty relationships;
- operating and financial models;
- policies, Investment Models, and Project business rules;
- Pilot business scope and operating controls;
- legal/compliance-dependent business assumptions.

### Engineering

Owns:

- high-level system architecture;
- ADRs and technical specifications;
- APIs, data, authentication, infrastructure, and security documentation;
- technical validation and release evidence;
- release records.

### Investor Relations

Owns:

- investor one-pagers, decks, briefs, and approved outreach material;
- audience-specific presentation of canonical Product and Business facts;
- communication versioning and publication review.

Investor Relations documents do not own Product, Business, financial, legal, release, or
technical facts. They must link to or be validated against the documents that do.

### Product / Legal

Owns planning drafts for:

- platform contract architecture;
- investment participation agreement specifications and drafts;
- farmer operating agreement planning;
- risk disclosure and project disclosure planning;
- legal-package checklists and review findings.

Product / Legal planning documents are not final legal advice or production legal contracts.
Production legal documents require qualified legal counsel review and approval before use.

## Canonical Document Rules

1. A canonical document must declare its status, owner, type, and scope.
2. One topic must have one clearly named authority. Other documents summarize and link to it.
3. A summary must not redefine a detailed accepted or frozen specification.
4. Frozen documents take precedence over Accepted documents within the frozen scope.
5. Accepted documents take precedence over Review and Draft documents.
6. Archived and Deprecated documents must not be used as current implementation or public-claim
   authority.
7. Proposed technical designs and ADRs must not be described as implemented or accepted.
8. Audience-specific documents must derive factual claims from current canonical sources.
9. English and Russian versions must identify which version controls if their approvals or
   update dates differ.
10. Generated PDF, DOCX, HTML, presentation, and screenshot assets must identify their editable
    or numeric source where applicable.
11. Canonical documents must link to affected authorities rather than copying large sections.
12. A conflict must be resolved in the owning canonical document, not patched independently in
    every summary.

## Versioning Rules

Use versioning according to document purpose:

- **Frozen architecture or policy:** explicit version and freeze date, for example `v1.0`.
- **Accepted specification:** version when compatibility or implementation depends on it;
  otherwise use status and last-reviewed date.
- **Living roadmap or index:** stable filename with a `Last reviewed` date; history belongs in
  Git and release records.
- **Release record:** immutable release identifier such as `alpha-v1.2`.
- **Audience publication:** explicit edition or version when distributed outside the
  repository.

Version increments:

- major version: changes authority, scope, participant model, lifecycle, or compatibility;
- minor version: adds approved behavior without breaking the existing model;
- patch or editorial update: clarifies language, repairs links, or corrects non-material errors.

A Frozen document may change materially only through its declared change-control process.

## Naming Conventions

These conventions apply to new files and do not require immediate renaming of existing files.

- Use stable uppercase names for repository-level canonical entry points:
  `PRODUCT_BOOK.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `RELEASES.md`, and
  `DOCUMENTATION_GUIDE.md`.
- Use descriptive uppercase names for major canonical policies and specifications when that
  folder already follows the convention.
- Use lowercase kebab-case for supporting guides, plans, reviews, and release records.
- Use an `ADR-NNN-short-title.md` name for Architecture Decision Records.
- Use lowercase language suffixes for translations: `-en.md` and `-ru.md`.
- Put the version in the filename only when multiple distributed or historical versions must
  coexist.
- Do not use ambiguous names such as `final`, `latest`, `new`, `copy`, or `updated`.
- Preserve stable filenames for living entry points and update their metadata.

## Documentation Lifecycle

The guide owns the procedures below. The Authority Matrix owns the registered status,
classification, ownership, supersession, replacement, and archive boundary for each document.

### 1. Propose

Create the document as Draft with a defined purpose, scope, owner, and affected authorities.

### 2. Review

Change the status to Review when the document is internally complete. Identify required
reviewers from every affected ownership domain.

### 3. Accept or Freeze

Record approval and change the status to Accepted or Frozen. Add version, approval date, or
freeze date when required. Update the Authority Matrix, Documentation Index, and inbound links as
applicable.

### 4. Maintain

The owner keeps links, terminology, release claims, and cross-document dependencies current.
Material changes trigger another review; editorial corrections follow the document's change
rules.

### 5. Deprecate

Use Deprecated when an old path or interface must remain temporarily. State why it is
deprecated, name the replacement, and define removal or archival criteria.

### 6. Archive

Use Archived when the document is no longer active but retains historical value. Preserve its
original context and link to the current authority. Archival movement must include link updates
and validation.

## Canonical Entry Points

The [Documentation Index](DOCUMENTATION_INDEX.md) is the official navigation and audience entry
point. The [Product Book](PRODUCT_BOOK.md), [Architecture](ARCHITECTURE.md),
[Roadmap](ROADMAP.md), [Releases](RELEASES.md), and other registered domain documents remain
authoritative only within their declared scopes. This guide is the procedural entry point, and
the [Authority Matrix](DOCUMENTATION_AUTHORITY_MATRIX.md) is the controlling registry.

## Governance Review and Approval

Material changes to repository-root `AGENTS.md`, the Authority Matrix, this guide, the
Documentation Index, or the Workstream Operating Model require:

1. the Product Governance Approver role designated through AgriPartners' existing Product
   decision authority for repository governance, with the current role-holder or approving
   authority identified in durable approval evidence;
2. review by every ownership domain materially affected by the change;
3. Engineering review when implementation authority, generated assets, verification, or release
   evidence is affected;
4. durable approval evidence identifying the approver, reviewers, affected authorities,
   validation, and unresolved follow-up; and
5. compliance with any stricter change control declared by an affected Accepted or Frozen
   document.

A reviewed pull request may provide the durable approval record. An owner field alone does not
prove approval. If reviewers cannot agree, preserve current authority, classify the dispute by
scope, and escalate to the affected domain owner and Product governance approver. Qualified
legal, compliance, accounting, or security review is required when resolution depends on that
expertise. The Product governance approver decides registry, procedure, and navigation mechanics
but cannot override another domain's Accepted or Frozen subject matter. Cross-domain substantive
changes require approval from every affected accountable domain owner. A material `AGENTS.md`
change additionally requires review by every domain whose contributor instructions or authority
boundary would change.

## Legal Documentation Folder

Legal-package planning documents live under `docs/legal/`. New legal planning, audit, draft, and
review documents should use descriptive uppercase names and must state whether they are Planning,
Analysis, Architecture Draft, Review, Accepted, or another approved status. Draft legal documents
must clearly distinguish architecture/product planning from production legal agreements.

## Change Checklist

Before accepting a documentation change:

- confirm the correct owner and status;
- identify affected Frozen and Accepted documents;
- avoid creating a second source of truth;
- update links and indexes;
- validate language variants and generated publications;
- run available Markdown lint and local-link validation;
- run `git diff --check`;
- review `git status` and the complete documentation diff;
- record the change in release notes when it affects a release claim.
