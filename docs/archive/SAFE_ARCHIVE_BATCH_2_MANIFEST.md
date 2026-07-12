<!-- markdownlint-configure-file { "MD013": false } -->

# Safe Archive Batch 2 Manifest

Status: Approved for execution

Owner: Product

Prepared: 2026-07-12

This manifest authorizes exactly 13 P4, non-canonical files identified by the Remaining P4 Review.
No P1, P2, P3, stable-path, current-authority, or authority-gated file is included.

| Old path | New path | Reason | Previous priority / status | Final status | Links updated | Validation result |
| --- | --- | --- | --- | --- | --- | --- |
| `docs/documentation-architecture/01-readme.md` | `docs/archive/deprecated/documentation-architecture/01-readme.md` | Superseded documentation architecture audit; Authority Matrix is current | P4 / Living | Archived | Cleanup Plan and Authority Matrix; internal relative links preserved | Passed |
| `docs/documentation-architecture/02-documentation-inventory.md` | `docs/archive/deprecated/documentation-architecture/02-documentation-inventory.md` | Superseded documentation architecture audit; Authority Matrix is current | P4 / Archived Candidate | Archived | Cleanup Plan and Authority Matrix; internal relative links preserved | Passed |
| `docs/documentation-architecture/03-reading-order-map.md` | `docs/archive/deprecated/documentation-architecture/03-reading-order-map.md` | Superseded documentation architecture audit; Authority Matrix is current | P4 / Archived Candidate | Archived | Cleanup Plan and Authority Matrix; internal relative links preserved | Passed |
| `docs/documentation-architecture/04-proposed-renaming-plan.md` | `docs/archive/deprecated/documentation-architecture/04-proposed-renaming-plan.md` | Superseded documentation architecture audit; Authority Matrix is current | P4 / Archived Candidate | Archived | Cleanup Plan and Authority Matrix; internal relative links preserved | Passed |
| `docs/documentation-architecture/05-link-impact-analysis.md` | `docs/archive/deprecated/documentation-architecture/05-link-impact-analysis.md` | Superseded documentation architecture audit; Authority Matrix is current | P4 / Archived Candidate | Archived | Cleanup Plan and Authority Matrix; internal relative links preserved | Passed |
| `docs/documentation-architecture/11-readme-ru.md` | `docs/archive/deprecated/documentation-architecture/11-readme-ru.md` | Superseded documentation architecture audit; Authority Matrix is current | P4 / Living | Archived | Cleanup Plan and Authority Matrix; internal relative links preserved | Passed |
| `docs/documentation-architecture/12-documentation-inventory-ru.md` | `docs/archive/deprecated/documentation-architecture/12-documentation-inventory-ru.md` | Superseded documentation architecture audit; Authority Matrix is current | P4 / Archived Candidate | Archived | Cleanup Plan and Authority Matrix; internal relative links preserved | Passed |
| `docs/documentation-architecture/13-reading-order-map-ru.md` | `docs/archive/deprecated/documentation-architecture/13-reading-order-map-ru.md` | Superseded documentation architecture audit; Authority Matrix is current | P4 / Archived Candidate | Archived | Cleanup Plan and Authority Matrix; internal relative links preserved | Passed |
| `docs/documentation-architecture/14-proposed-renaming-plan-ru.md` | `docs/archive/deprecated/documentation-architecture/14-proposed-renaming-plan-ru.md` | Superseded documentation architecture audit; Authority Matrix is current | P4 / Archived Candidate | Archived | Cleanup Plan and Authority Matrix; internal relative links preserved | Passed |
| `docs/documentation-architecture/15-link-impact-analysis-ru.md` | `docs/archive/deprecated/documentation-architecture/15-link-impact-analysis-ru.md` | Superseded documentation architecture audit; Authority Matrix is current | P4 / Archived Candidate | Archived | Cleanup Plan and Authority Matrix; internal relative links preserved | Passed |
| `docs/audits/01-alpha-v1-full-repository-audit.md` | `docs/archive/releases/alpha-v1/01-alpha-v1-full-repository-audit.md` | Point-in-time Alpha v1 historical evidence | P4 / Archived Candidate | Archived | Documentation READMEs, Cleanup Plan, Authority Matrix | Passed |
| `docs/audits/11-alpha-v1-full-repository-audit-ru.md` | `docs/archive/releases/alpha-v1/11-alpha-v1-full-repository-audit-ru.md` | Russian companion to Alpha v1 historical evidence | P4 / Archived Candidate | Archived | Documentation READMEs, Cleanup Plan, Authority Matrix | Passed |
| `docs/outreach/near-ecosystem-crm.md` | `docs/archive/near/alpha-v1.2/near-ecosystem-crm.md` | Deprecated lightweight CRM replaced by canonical Relationship CRM | P4 / Deprecated | Archived | Documentation README, Cleanup Plan, canonical CRM relative link | Passed |

## Explicit Exclusions

- `docs/near/near-ecosystem-crm.md` — authority approval required.
- `docs/investor-package/presentation-outline-ru.md` — reclassified P3 Reference.
- `docs/investor-package/screenshot-checklist-ru.md` — reclassified P3 Reference.
- `docs/archive/checklist.html` — already Archived at the correct path.

## Execution Boundary

Only the 13 rows above may move. Validation results must be changed from Pending to Passed only
after Markdownlint, local-link validation, old-path search, move-count validation, and
`git diff --check` succeed.
