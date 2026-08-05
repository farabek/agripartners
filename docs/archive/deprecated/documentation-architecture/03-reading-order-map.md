# Reading Order Map

This map defines entry points, recommended reading order, optional documents, and dependencies for each documentation area.

## Entire Documentation Set

### First Document

Read `docs/README.md` first. It establishes the product, roles, pilot MVP architecture, and main documentation entry points.

### Second Document

Read `docs/near-outreach/project-summary-en.md` second for a concise external-facing explanation of AgriPartners.

### Optional Early Documents

- `docs/README-ru.md` for Russian-language readers.
- `docs/near-outreach/project-summary-ru.md` for Russian-language outreach.
- `docs/investor-package/investor-one-pager-en-v2.md` for investor-facing context.

## Core Project Docs

### Entry Point

- `docs/README.md`
- `docs/README-ru.md` for Russian-language readers.

### Recommended Reading Order

1. `docs/README.md`
2. `docs/investor-portal.md`
3. `docs/farmer-portal.md`
4. `docs/admin-dashboard.md`
5. `docs/near-testnet.md`
6. `docs/contacts.md`

Russian order:

1. `docs/README-ru.md`
2. `docs/investor-portal-ru.md`
3. `docs/farmer-portal-ru.md`
4. `docs/admin-dashboard-ru.md`
5. `docs/near-testnet-ru.md`
6. `docs/contacts.md`

### Dependencies

- Portal documents depend on `docs/screenshots/`.
- `docs/README.md` and `docs/README-ru.md` link to role docs and support folders.
- `docs/near-testnet.md` is a prerequisite for NEAR outreach and NEAR grant materials.

### Optional

- `docs/contacts.md` is optional unless preparing outreach.

## Investor Package

### Entry Point

- `docs/investor-package/investor-one-pager-en-v2.md`
- `docs/investor-package/investor-one-pager-ru-v2.md` for Russian-language readers.

### Recommended Reading Order

1. `docs/investor-package/investor-one-pager-en-v2.md`
2. `docs/investor-package/investor-readiness-review.md`
3. `docs/investor-package/pilot-deals-summary.md`
4. `docs/investor-package/pitch-deck-v2.md`
5. `docs/investor-package/presentation-outline-en.md`
6. `docs/investor-package/presentation-assets-plan.md`
7. `docs/investor-package/screenshot-capture-guide.md`
8. `docs/investor-package/demo-day-script-en.md`
9. `docs/investor-package/demo-video-script-v2.md`

Russian order:

1. `docs/investor-package/investor-one-pager-ru-v2.md`
2. `docs/investor-package/investor-readiness-review.md`
3. `docs/investor-package/pilot-deals-summary-ru.md`
4. `docs/investor-package/pitch-deck-v2-ru.md`
5. `docs/investor-package/presentation-outline-ru.md`
6. `docs/investor-package/presentation-assets-plan.md`
7. `docs/investor-package/screenshot-capture-guide.md`
8. `docs/investor-package/demo-day-script-ru.md`
9. `docs/investor-package/demo-video-script-v2.md`

### Dependencies

- `presentation-outline-*`, `presentation-assets-plan.md`, and `screenshot-capture-guide.md` depend on `docs/screenshots/`.
- `AgriPartners_Investor_Deck_v1_*.pptx` are referenced by NEAR outreach and toolkit docs.
- Older `v1` one-pagers and pitch decks are useful for history but should not be the primary reading path.

### Optional

- `one-pager-v1.md`
- `one-pager-v1-ru.md`
- `pitch-deck-v1.md`
- `pitch-deck-v1-ru.md`
- `demo-script-v1.md`
- `demo-script-v1-ru.md`
- `screenshot-checklist.md`
- `screenshot-checklist-ru.md`
- `docs/investor-package/screenshots/README.md`

## NEAR Outreach

### Entry Point

- `docs/near-outreach/README.md`

### Recommended Reading Order

1. `docs/near-outreach/README.md`
2. `docs/near-outreach/project-summary-en.md`
3. `docs/near-outreach/founder-introduction-en.md`
4. `docs/near-outreach/elevator-pitch-en.md`
5. `docs/near-outreach/near-use-case-en.md`
6. `docs/near-outreach/ecosystem-one-pager-en.md`

Russian order:

1. `docs/near-outreach/README.md`
2. `docs/near-outreach/project-summary-ru.md`
3. `docs/near-outreach/founder-introduction-ru.md`
4. `docs/near-outreach/elevator-pitch-ru.md`
5. `docs/near-outreach/near-use-case-ru.md`
6. `docs/near-outreach/ecosystem-one-pager-ru.md`

### Dependencies

- Depends on current MVP facts from `docs/README.md`, `docs/near-testnet.md`, and `docs/investor-package/investor-one-pager-en-v2.md`.
- References investor deck files in `docs/investor-package/`.

### Optional

- Language counterpart files are optional if the reader only needs one language.

## NEAR Ecosystem

### Entry Point

- `docs/near-ecosystem/README.md`

### Recommended Reading Order

1. `docs/near-ecosystem/README.md`
2. `docs/near-ecosystem/near-priority-targets.md`
3. `docs/near-ecosystem/near-ecosystem-map.md`
4. `docs/near-ecosystem/near-engagement-plan.md`

### Dependencies

- Depends on `docs/near-outreach/` for project explanation.
- Depends on `docs/near-outreach-toolkit/` for message execution.

### Optional

- `near-ecosystem-map.md` can be skimmed after priority targets if the reader only needs action sequencing.

## NEAR Outreach Toolkit

### Entry Point

- `docs/near-outreach-toolkit/README.md`

### Recommended Reading Order

1. `docs/near-outreach-toolkit/README.md`
2. `docs/near-outreach-toolkit/intro-message-en.md`
3. `docs/near-outreach-toolkit/project-introduction-email-en.md`
4. `docs/near-outreach-toolkit/meeting-request-en.md`
5. `docs/near-outreach-toolkit/feedback-request-en.md`
6. `docs/near-outreach-toolkit/followup-message-en.md`

Russian order:

1. `docs/near-outreach-toolkit/README.md`
2. `docs/near-outreach-toolkit/intro-message-ru.md`
3. `docs/near-outreach-toolkit/project-introduction-email-ru.md`
4. `docs/near-outreach-toolkit/meeting-request-ru.md`
5. `docs/near-outreach-toolkit/feedback-request-ru.md`
6. `docs/near-outreach-toolkit/followup-message-ru.md`

### Dependencies

- Depends on `docs/near-outreach/` for source messaging.
- Depends on `docs/near-ecosystem/near-priority-targets.md` for sequencing.

### Optional

- Follow-up templates are optional until there has been no response, a first conversation, or a deck send.

## Screenshots

### Entry Point

- There is no top-level screenshot README.
- Use role docs as the entry point:
  - `docs/investor-portal.md`
  - `docs/farmer-portal.md`
  - `docs/admin-dashboard.md`

### Recommended Reading Order

1. Investor screenshots.
2. Farmer screenshots.
3. Admin screenshots.

### Dependencies

- Root role docs embed screenshot files.
- Investor package planning docs reference screenshot files for presentation creation.

### Optional

- Screenshots are optional for text-only review but required for deck, demo, and visual QA workflows.

## Other

### Entry Point

- No single entry point.

### Recommended Reading Order

1. `docs/archive/grants/near-grant-application.md` if preparing grant materials.
2. `docs/archive/near/legacy-publications/near-forum-post.md` if preparing public NEAR community posting.
3. Root HTML exports only if reviewing older presentation outputs.
4. PDF files only if reviewing legal/financial model artifacts.
5. `docs/superpowers/` only if reviewing historical implementation planning.

### Dependencies

- NEAR grant and forum docs depend on root project facts and MVP status.
- PDFs and HTML files may be externally shared artifacts.
- Superpowers plans/specs are historical and should not drive public outreach unless refreshed.

### Optional

- Most files in Other are optional unless a specific grant, legal, model, or history review is underway.
