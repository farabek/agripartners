# AgriPartners Documentation Architecture Audit

## Purpose

This folder documents the current information architecture of the AgriPartners documentation set and proposes a safer future reading order and numbering convention.

This is an audit only. No files have been renamed, moved, deleted, or rewritten as part of this workstream.

## Files

- [Documentation Inventory](documentation-inventory.md)
- [Reading Order Map](reading-order-map.md)
- [Proposed Renaming Plan](proposed-renaming-plan.md)
- [Link Impact Analysis](link-impact-analysis.md)

## Scope

Primary scope:

- `docs/`
- `docs/investor-package/`
- `docs/near-outreach/`
- `docs/near-ecosystem/`
- `docs/near-outreach-toolkit/`

Supporting scope:

- `docs/screenshots/`
- `docs/60-40/`
- `docs/superpowers/`
- root-level PDFs and HTML files under `docs/`
- empty placeholder folders under `docs/`

## Inventory Summary

Current documentation tree contains 110 files:

| Type | Count |
| --- | ---: |
| Markdown | 77 |
| HTML | 5 |
| PDF | 8 |
| PNG screenshots | 18 |
| PowerPoint | 2 |

Grouped by workstream:

| Group | Count | Notes |
| --- | ---: | --- |
| Core Project Docs | 11 | Main product README and role docs. |
| Investor Package | 25 | Investor-facing scripts, decks, one-pagers, screenshots guidance. |
| NEAR Outreach | 11 | Project summaries, founder intros, pitches, NEAR use case. |
| NEAR Ecosystem | 4 | Ecosystem map, targets, engagement plan. |
| NEAR Outreach Toolkit | 11 | Practical message and email templates. |
| Screenshots | 18 | Investor, farmer, and admin screenshots. |
| Other | 30 | Legacy NEAR docs, PDFs, HTML exports, 60-40 PDFs, superpowers plans/specs. |

## Recommended Final Structure

Recommended high-level structure:

```text
docs/
  00-start-here/
  01-product-overview/
  02-role-guides/
  03-investor-package/
  04-near-track/
  05-farmer-workflow/
  06-screenshots/
  07-contracts-and-pdfs/
  08-archive/
  documentation-architecture/
```

This final structure should not be implemented until link updates are prepared and reviewed.

## Recommended Reading Order

For a new reader:

1. `docs/README.md`
2. `docs/near-outreach/project-summary-en.md`
3. `docs/investor-package/investor-one-pager-en-v2.md`
4. `docs/near-outreach/near-use-case-en.md`
5. `docs/near-ecosystem/near-priority-targets.md`
6. `docs/near-outreach-toolkit/project-introduction-email-en.md`

For Russian-language outreach, use the matching `-ru` files in the same order.

## Recommended Rename Sequence

1. Freeze content changes during rename execution.
2. Rename only one folder at a time.
3. Start with low-risk folders that have internal README links only:
   - `docs/near-ecosystem/`
   - `docs/near-outreach-toolkit/`
   - `docs/near-outreach/`
4. Rename investor-package files after screenshot/deck references are mapped.
5. Rename root docs last because screenshots and root README references are externally useful.
6. Run link validation after each folder.
7. Update README files in the same change as the rename.

## Safest Execution Plan

- Step 1: Review this audit.
- Step 2: Approve the numbering convention.
- Step 3: Generate a mechanical rename checklist.
- Step 4: Apply renames in small batches.
- Step 5: Update Markdown links and inline path references.
- Step 6: Run a link/path validation pass.
- Step 7: Review git diff before commit.

## Risk Assessment Summary

| Folder | Rename Risk |
| --- | --- |
| `docs/` root docs | Medium |
| `docs/investor-package/` | High |
| `docs/near-outreach/` | Medium |
| `docs/near-ecosystem/` | Low |
| `docs/near-outreach-toolkit/` | Low |
| `docs/screenshots/` | High |
| `docs/60-40/` | Low |
| `docs/superpowers/` | Low |

The two highest-risk areas are `docs/screenshots/` and `docs/investor-package/` because many documents reference exact screenshot paths and planned deck asset names.
