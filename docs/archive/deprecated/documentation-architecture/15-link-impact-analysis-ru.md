# Link Impact Analysis

Этот analysis определяет Markdown links, screenshot references, relative paths и rename risk.

## Link Summary

Link/reference categories found:

- Root README links to role docs and support folders.
- Role docs embed screenshots from `docs/screenshots/`.
- Investor package docs reference screenshots using `../screenshots/...`.
- NEAR outreach and toolkit docs reference investor deck files.
- NEAR ecosystem, outreach, and toolkit READMEs link to internal files.
- NEAR grant and forum docs link to external demo, API, GitHub, email, and Telegram.
- Superpowers specs link to external NEAR resources and GitHub.

## Files That Would Break If Renamed

### Root Role Docs And Screenshots

If screenshot files are renamed, these files require updates:

- `docs/investor-portal.md`
- `docs/investor-portal-ru.md`
- `docs/farmer-portal.md`
- `docs/farmer-portal-ru.md`
- `docs/admin-dashboard.md`
- `docs/admin-dashboard-ru.md`

If root role docs are renamed, these files require updates:

- `docs/README.md`
- `docs/README-ru.md`

### Investor Package Screenshot References

If screenshots are renamed or moved, these files require updates:

- `docs/investor-package/presentation-outline-en.md`
- `docs/investor-package/presentation-outline-ru.md`
- `docs/investor-package/presentation-assets-plan.md`
- `docs/investor-package/screenshot-capture-guide.md`

These files contain many inline screenshot path references such as:

- `../screenshots/investor/01-investor-header.png`
- `../screenshots/investor/03-investment-summary.png`
- `../screenshots/investor/04-featured-pilot-deals.png`
- `../screenshots/investor/05-active-hissar.png`
- `../screenshots/investor/06-completed-fidlot.png`
- `../screenshots/farmer/02-farmer-metrics.png`
- `../screenshots/farmer/04-farmer-deals.png`
- `../screenshots/admin/01-admin-dashboard.png`
- `../screenshots/admin/02-admin-pilot-deals.png`
- `../screenshots/admin/03-admin-fidlot-profile.png`
- `../screenshots/admin/05-admin-fidlot-event-history.png`
- `../screenshots/admin/06-admin-hissar-profile.png`

### Investor Deck References

If investor deck PPTX files are renamed, these files require updates:

- `docs/near-outreach/README.md`
- `docs/near-outreach/ecosystem-one-pager-en.md`
- `docs/near-outreach/ecosystem-one-pager-ru.md`
- `docs/near-outreach-toolkit/project-introduction-email-en.md`
- `docs/near-outreach-toolkit/project-introduction-email-ru.md`

Current deck paths:

- `docs/investor-package/AgriPartners_Investor_Deck_v1_EN.pptx`
- `docs/investor-package/AgriPartners_Investor_Deck_v1_RU.pptx`

### NEAR Outreach Internal Links

If NEAR outreach files are renamed, update:

- `docs/near-outreach/README.md`

Current internal links:

- `project-summary-en.md`
- `project-summary-ru.md`
- `founder-introduction-en.md`
- `founder-introduction-ru.md`
- `elevator-pitch-en.md`
- `elevator-pitch-ru.md`
- `near-use-case-en.md`
- `near-use-case-ru.md`
- `ecosystem-one-pager-en.md`
- `ecosystem-one-pager-ru.md`

### NEAR Ecosystem Internal Links

If NEAR ecosystem files are renamed, update:

- `docs/near-ecosystem/README.md`

Current internal links:

- `near-ecosystem-map.md`
- `near-priority-targets.md`
- `near-engagement-plan.md`

### NEAR Outreach Toolkit Internal Links

If toolkit files are renamed, update:

- `docs/near-outreach-toolkit/README.md`

Current internal links:

- `intro-message-en.md`
- `intro-message-ru.md`
- `followup-message-en.md`
- `followup-message-ru.md`
- `project-introduction-email-en.md`
- `project-introduction-email-ru.md`
- `meeting-request-en.md`
- `meeting-request-ru.md`
- `feedback-request-en.md`
- `feedback-request-ru.md`

## Relative Path Notes

### Root README Folder Links

`docs/README.md` and `docs/README-ru.md` link to these support folders:

- `screenshots/`
- `architecture/`
- `investor-deck/`
- `business-model/`
- `workflows/`
- `demo-guide/`

All listed folders currently exist. Several are placeholders with no files:

- `architecture/`
- `business-model/`
- `investor-deck/`
- `workflows/`
- `demo-guide/`

These links are not broken as folder links, but they may feel incomplete to readers.

### Investor Package Relative Paths

Investor package docs use `../screenshots/...`, which is correct from `docs/investor-package/` to `docs/screenshots/`.

If investor package files are moved into a deeper subfolder, all `../screenshots/...` references must be recalculated.

### NEAR Outreach Deck Paths

NEAR outreach docs use inline code paths beginning with `docs/investor-package/...`.

These are descriptive paths, not clickable relative Markdown links. They still need updates if deck files are renamed.

## Risk Assessment By Folder

| Folder | Risk | Reason |
| --- | --- | --- |
| `docs/` root docs | Medium | Root README links role docs; role docs embed screenshots. |
| `docs/investor-package/` | High | Many screenshot references, deck references, historical versions, and external-facing assets. |
| `docs/near-outreach/` | Medium | README internal links and deck path references require synchronized updates. |
| `docs/near-ecosystem/` | Low | Only one README with three internal links. |
| `docs/near-outreach-toolkit/` | Low | One README with internal links; project email files reference deck paths. |
| `docs/screenshots/` | High | Exact image paths are embedded in role docs and investor package planning docs. |
| `docs/60-40/` | Low | PDFs are not currently linked from scanned Markdown. |
| `docs/superpowers/` | Low | Historical docs, mostly self-contained and externally linked. |

## Recommended Link Update Strategy

1. Before any rename, create a rename map.
2. Update README links in the same change as file renames.
3. Preserve screenshot filenames during the first rename pass.
4. Preserve PPTX filenames during the first rename pass or update all deck path mentions at once.
5. Use a link scan after each batch:

```powershell
rg -n "\[[^\]]+\]\([^\)]+\)|!\[[^\]]*\]\([^\)]+\)|screenshots/|\.pptx|\.pdf" docs
```

6. Validate important relative paths manually:

- `docs/README.md`
- `docs/README-ru.md`
- `docs/investor-package/presentation-assets-plan.md`
- `docs/investor-package/screenshot-capture-guide.md`
- `docs/near-outreach/README.md`
- `docs/near-outreach-toolkit/project-introduction-email-en.md`
- `docs/near-outreach-toolkit/project-introduction-email-ru.md`

## Safest Rename Principle

Do not rename screenshots or binary deck files until all text documentation has been renumbered and the remaining path references are easy to isolate.
