# Proposed Renaming Plan

This document proposes a future numbering convention. It does not rename any files.

## Numbering Convention

Use two-digit prefixes within each folder:

```text
00-readme-or-start-here.md
01-primary-context.md
02-secondary-context.md
03-supporting-detail.md
...
90-archive-or-legacy.md
```

Rules:

- Preserve language suffixes: `-en`, `-ru`.
- Keep paired EN/RU files adjacent by number.
- Keep generated binary assets such as PDFs and PPTX stable unless there is a strong reason to rename.
- Do not rename screenshots until all image references are updated.
- Use `90-` series for old versions and historical files.

## Core Project Docs

| Current filename | Proposed filename |
| --- | --- |
| `docs/README.md` | `docs/00-start-here-en.md` |
| `docs/README-ru.md` | `docs/00-start-here-ru.md` |
| `docs/investor-portal.md` | `docs/01-investor-portal-en.md` |
| `docs/investor-portal-ru.md` | `docs/01-investor-portal-ru.md` |
| `docs/farmer-portal.md` | `docs/02-farmer-portal-en.md` |
| `docs/farmer-portal-ru.md` | `docs/02-farmer-portal-ru.md` |
| `docs/admin-dashboard.md` | `docs/03-admin-dashboard-en.md` |
| `docs/admin-dashboard-ru.md` | `docs/03-admin-dashboard-ru.md` |
| `docs/near-testnet.md` | `docs/04-near-testnet-en.md` |
| `docs/near-testnet-ru.md` | `docs/04-near-testnet-ru.md` |
| `docs/contacts.md` | `docs/05-contacts.md` |

## Investor Package

| Current filename | Proposed filename |
| --- | --- |
| `investor-one-pager-en-v2.md` | `01-investor-one-pager-en.md` |
| `investor-one-pager-ru-v2.md` | `01-investor-one-pager-ru.md` |
| `investor-readiness-review.md` | `02-investor-readiness-review.md` |
| `pilot-deals-summary.md` | `03-pilot-deals-summary-en.md` |
| `pilot-deals-summary-ru.md` | `03-pilot-deals-summary-ru.md` |
| `pitch-deck-v2.md` | `04-pitch-deck-v2-en.md` |
| `pitch-deck-v2-ru.md` | `04-pitch-deck-v2-ru.md` |
| `presentation-outline-en.md` | `05-presentation-outline-en.md` |
| `presentation-outline-ru.md` | `05-presentation-outline-ru.md` |
| `presentation-assets-plan.md` | `06-presentation-assets-plan.md` |
| `screenshot-capture-guide.md` | `07-screenshot-capture-guide.md` |
| `screenshot-checklist.md` | `08-screenshot-checklist-en.md` |
| `screenshot-checklist-ru.md` | `08-screenshot-checklist-ru.md` |
| `demo-day-script-en.md` | `09-demo-day-script-en.md` |
| `demo-day-script-ru.md` | `09-demo-day-script-ru.md` |
| `demo-video-script-v2.md` | `10-demo-video-script-v2.md` |
| `AgriPartners_Investor_Deck_v1_EN.pptx` | `11-investor-deck-v1-en.pptx` |
| `AgriPartners_Investor_Deck_v1_RU.pptx` | `11-investor-deck-v1-ru.pptx` |
| `one-pager-v1.md` | `90-one-pager-v1-en.md` |
| `one-pager-v1-ru.md` | `90-one-pager-v1-ru.md` |
| `pitch-deck-v1.md` | `91-pitch-deck-v1-en.md` |
| `pitch-deck-v1-ru.md` | `91-pitch-deck-v1-ru.md` |
| `demo-script-v1.md` | `92-demo-script-v1-en.md` |
| `demo-script-v1-ru.md` | `92-demo-script-v1-ru.md` |
| `screenshots/README.md` | `screenshots/00-readme.md` |

## NEAR Outreach

| Current filename | Proposed filename |
| --- | --- |
| `README.md` | `00-readme.md` |
| `project-summary-en.md` | `01-project-summary-en.md` |
| `project-summary-ru.md` | `01-project-summary-ru.md` |
| `founder-introduction-en.md` | `02-founder-introduction-en.md` |
| `founder-introduction-ru.md` | `02-founder-introduction-ru.md` |
| `elevator-pitch-en.md` | `03-elevator-pitch-en.md` |
| `elevator-pitch-ru.md` | `03-elevator-pitch-ru.md` |
| `near-use-case-en.md` | `04-near-use-case-en.md` |
| `near-use-case-ru.md` | `04-near-use-case-ru.md` |
| `ecosystem-one-pager-en.md` | `05-ecosystem-one-pager-en.md` |
| `ecosystem-one-pager-ru.md` | `05-ecosystem-one-pager-ru.md` |

## NEAR Ecosystem

| Current filename | Proposed filename |
| --- | --- |
| `README.md` | `00-readme.md` |
| `near-priority-targets.md` | `01-near-priority-targets.md` |
| `near-ecosystem-map.md` | `02-near-ecosystem-map.md` |
| `near-engagement-plan.md` | `03-near-engagement-plan.md` |

## NEAR Outreach Toolkit

| Current filename | Proposed filename |
| --- | --- |
| `README.md` | `00-readme.md` |
| `intro-message-en.md` | `01-intro-message-en.md` |
| `intro-message-ru.md` | `01-intro-message-ru.md` |
| `project-introduction-email-en.md` | `02-project-introduction-email-en.md` |
| `project-introduction-email-ru.md` | `02-project-introduction-email-ru.md` |
| `meeting-request-en.md` | `03-meeting-request-en.md` |
| `meeting-request-ru.md` | `03-meeting-request-ru.md` |
| `feedback-request-en.md` | `04-feedback-request-en.md` |
| `feedback-request-ru.md` | `04-feedback-request-ru.md` |
| `followup-message-en.md` | `05-followup-message-en.md` |
| `followup-message-ru.md` | `05-followup-message-ru.md` |

## Screenshots

Screenshots already use a helpful numeric convention. Keep current names unless the visual sequence changes.

| Current filename | Proposed filename |
| --- | --- |
| `screenshots/investor/01-investor-header.png` | keep |
| `screenshots/investor/02-investor-profile.png` | keep |
| `screenshots/investor/03-investment-summary.png` | keep |
| `screenshots/investor/04-featured-pilot-deals.png` | keep |
| `screenshots/investor/05-active-hissar.png` | keep |
| `screenshots/investor/06-completed-fidlot.png` | keep |
| `screenshots/farmer/01-farmer-profile.png` | keep |
| `screenshots/farmer/02-farmer-metrics.png` | keep |
| `screenshots/farmer/03-fidlot-card.png` | keep |
| `screenshots/farmer/04-farmer-deals.png` | keep |
| `screenshots/admin/01-admin-dashboard.png` | keep |
| `screenshots/admin/02-admin-pilot-deals.png` | keep |
| `screenshots/admin/03-admin-fidlot-profile.png` | keep |
| `screenshots/admin/04-admin-fidlot-reporting.png` | keep |
| `screenshots/admin/05-admin-fidlot-event-history.png` | keep |
| `screenshots/admin/06-admin-hissar-profile.png` | keep |
| `screenshots/admin/07-admin-hissar-reporting.png` | keep |
| `screenshots/admin/08-admin-hissar-event-history.png` | keep |

## Other

For Other files, prefer archive grouping before renaming. Suggested convention:

| Current filename | Proposed filename |
| --- | --- |
| `near-grant-application.md` | `near/01-near-grant-application-en.md` |
| `near-grant-application-ru.md` | `near/01-near-grant-application-ru.md` |
| `near-forum-post.md` | `near/02-near-forum-post-en.md` |
| `near-forum-post-ru.md` | `near/02-near-forum-post-ru.md` |
| `near-forum-post.html` | `near/02-near-forum-post.html` |
| `one-pager.html` | `archive/one-pager.html` |
| `pitch-deck.html` | `archive/pitch-deck.html` |
| `funding-strategy.html` | `archive/funding-strategy.html` |
| `checklist.html` | `archive/checklist.html` |
| Root PDFs | move to `contracts-and-pdfs/` with current names |
| `60-40/*.pdf` | keep or move to `contracts-and-pdfs/60-40/` |
| `superpowers/**` | keep as historical planning archive |

## Recommended Rename Batches

1. `docs/near-ecosystem/`
2. `docs/near-outreach-toolkit/`
3. `docs/near-outreach/`
4. `docs/investor-package/` Markdown files.
5. `docs/investor-package/` deck files.
6. Root role docs.
7. Optional archive moves for Other files.
8. Screenshots only if absolutely necessary.
