# AgriPartners Documentation Guide

Status: Accepted

Document owner: Product

Document type: Canonical documentation governance

## Purpose

This guide defines how AgriPartners documentation is created, reviewed, accepted, changed, and
retired. It applies to canonical entry points, specifications, policies, ADRs, plans, release
records, and audience-specific materials.

Existing files are not automatically canonical because they predate this guide. Their authority
depends on an explicit status, scope, and ownership declaration or on an accepted/frozen
document that identifies them as authoritative.

## Document Status

Every new governance-sensitive document must declare one of these statuses near its title.

| Status | Meaning | Permitted use |
| --- | --- | --- |
| **Draft** | Initial work that has not entered formal review | Discussion and authoring only |
| **Review** | Complete enough for named stakeholder review | Review and proposed decisions; not authoritative |
| **Accepted** | Approved for use within its stated scope | Current authority unless a Frozen document has precedence |
| **Frozen** | Approved baseline protected by formal change control | Highest authority within its scope |
| **Archived** | Retained as historical context and no longer active | Historical reference only |
| **Deprecated** | Still present for compatibility but should not guide new work | Transitional reference with a required replacement link |

Status must describe the document itself. A document may discuss completed work while remaining
Draft, or be Accepted while describing a future target.

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

### 1. Propose

Create the document as Draft with a defined purpose, scope, owner, and affected authorities.

### 2. Review

Change the status to Review when the document is internally complete. Identify required
reviewers from every affected ownership domain.

### 3. Accept or Freeze

Record approval and change the status to Accepted or Frozen. Add version, approval date, or
freeze date when required. Update canonical indexes and inbound links.

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

- [Product Book](PRODUCT_BOOK.md)
- [Architecture](ARCHITECTURE.md)
- [Roadmap](ROADMAP.md)
- [Releases](RELEASES.md)
- [Documentation Guide](DOCUMENTATION_GUIDE.md)

The repository [Documentation Index](README.md) remains the broader inventory and navigation
page. These five documents form the canonical operating entry points.

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
