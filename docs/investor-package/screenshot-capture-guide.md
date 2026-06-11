# Screenshot Capture Guide

## Purpose

Use this guide to capture a consistent AgriPartners Alpha v1 screenshot set for external demos, investor decks, and NEAR ecosystem review.

This guide covers presentation assets only. Do not change smart contracts, backend APIs, database schema, or business logic for screenshot preparation.

## Recommended Browser Setup

- Browser: Chrome, Edge, or another Chromium-based browser.
- Window size: 1440 x 900 px.
- Zoom level: 100%.
- Device mode: desktop, not responsive/mobile mode.
- Theme: use the default application theme.
- Browser chrome: hide bookmarks bar if possible.
- Capture format: PNG.
- Capture area: browser viewport only, unless a full-page screenshot is specifically needed.

Before capture, confirm:

- No technical error banners are visible.
- No dashboard section is blank unless the empty state is intentional.
- Project names are visible before technical deal data.
- Fidlot and Hissar economics match the checklist.
- Text is readable on a laptop screen.

## Base URL

Use the deployed demo URL when preparing public materials:

```text
https://agripartners.vercel.app
```

Use the local demo URL when preparing internal materials:

```text
http://localhost:5500
```

If the local frontend is served on another port, keep the same hash routes and replace only the host and port.

## Session Setup

1. Open the application.
2. Log in with the prepared demo account for the role being captured.
3. Confirm the navigation reflects the correct role:
   - Investor captures: investor account.
   - Farmer report captures: farmer account.
   - Admin captures: admin account.
4. Refresh once after login to confirm the session is stable.

## Screenshot Naming Convention

Use two-digit ordering, lowercase words, and hyphens:

```text
../screenshots/investor/03-investment-summary.png
../screenshots/investor/04-featured-pilot-deals.png
../screenshots/admin/03-admin-fidlot-profile.png
../screenshots/admin/06-admin-hissar-profile.png
../screenshots/farmer/04-farmer-deals.png
../screenshots/investor/03-investment-summary.png
../screenshots/admin/01-admin-dashboard.png
../screenshots/admin/05-admin-fidlot-event-history.png
```

Optional variants may use a suffix:

```text
../screenshots/admin/03-admin-fidlot-profile.png
../screenshots/investor/03-investment-summary.png
```

## Capture Sequence

### ../screenshots/investor/03-investment-summary.png

Open:

```text
https://agripartners.vercel.app/#investor
```

Local:

```text
http://localhost:5500/#investor
```

Capture the top of the investor portal with:

- Investment Summary visible.
- Featured Pilot Deals visible, or the top of the section visible below the summary.
- Active Deals, Completed Deals, or Demo Portfolio visible if the viewport allows.

Recommended framing:

- Start at the top of the page.
- Keep the role/navigation bar visible.
- Do not scroll past the Investment Summary before capture.

### ../screenshots/investor/04-featured-pilot-deals.png

Open:

```text
https://agripartners.vercel.app/#investor
```

Local:

```text
http://localhost:5500/#investor
```

Capture the Featured Pilot Deals section with both cards visible:

- Fidlot Livestock Project.
- Hissar Sheep Breeding Project.
- Investment: $50,000 for each.
- ROI and APR visible for both projects.
- Cycle count visible for both projects.

Recommended framing:

- Scroll so the section title is near the top of the viewport.
- Include both cards in one screenshot.
- Avoid cutting off the bottom row of deal metrics.

### ../screenshots/admin/03-admin-fidlot-profile.png

Open:

```text
https://agripartners.vercel.app/#investor/deals/1
```

Local:

```text
http://localhost:5500/#investor/deals/1
```

If the seeded Fidlot deal uses another ID in the demo environment, open the Fidlot deal from the Investor Portal card and keep the screenshot name unchanged.

Capture:

- Project Profile section at the top.
- Fidlot Livestock Project title.
- Investment: $50,000.
- ROI: 64%.
- APR: 21.9%.
- Cycles: 7.
- Deal ID only as secondary information.

Recommended framing:

- Keep the project profile above the fold.
- Avoid making Technical Deal Data the main visual focus.

### ../screenshots/admin/06-admin-hissar-profile.png

Open:

```text
https://agripartners.vercel.app/#investor/deals/2
```

Local:

```text
http://localhost:5500/#investor/deals/2
```

If the seeded Hissar deal uses another ID in the demo environment, open the Hissar deal from the Investor Portal card and keep the screenshot name unchanged.

Capture:

- Hissar Sheep Breeding Project title.
- Investment: $50,000.
- Projected ROI: 63.3%.
- APR: 21.1%.
- Cycles: 6.
- Deal ID only as secondary information.

Recommended framing:

- Keep the same framing as the Fidlot profile for easy deck comparison.
- Capture the project profile, not only the technical data table.

### ../screenshots/farmer/04-farmer-deals.png

Open:

```text
https://agripartners.vercel.app/#farmer/deals/1
```

Local:

```text
http://localhost:5500/#farmer/deals/1
```

Capture:

- Farmer deal detail page.
- Report or cycle reporting section.
- Operational report content, cycle status, or completed report summary.

Recommended framing:

- Use a farmer account.
- Scroll until the report content is visible.
- Include enough surrounding UI to show this is part of the AgriPartners workflow.

### ../screenshots/investor/03-investment-summary.png

Open:

```text
https://agripartners.vercel.app/#investor/deals/1
```

Local:

```text
http://localhost:5500/#investor/deals/1
```

Capture:

- Investment Summary.
- ROI metric.
- Returns section or repayment history.
- Returned and Outstanding amounts if visible.

Recommended framing:

- Scroll below the project profile.
- Keep section headers visible.
- Prefer Fidlot for the primary returns screenshot because it is the lead pilot model.

### ../screenshots/admin/01-admin-dashboard.png

Open:

```text
https://agripartners.vercel.app/#admin
```

Local:

```text
http://localhost:5500/#admin
```

Capture:

- Admin Portal title.
- Create deal form or operational controls.
- Farmer and investor selectors if visible.

Recommended framing:

- Use an admin account.
- Do not expose private keys, secrets, or environment configuration.
- Crop only if needed to remove browser autofill suggestions or unrelated desktop content.

### ../screenshots/admin/05-admin-fidlot-event-history.png

Open:

```text
https://agripartners.vercel.app/#investor/deals/1
```

Local:

```text
http://localhost:5500/#investor/deals/1
```

Alternative admin route:

```text
https://agripartners.vercel.app/#deals/1
```

Local:

```text
http://localhost:5500/#deals/1
```

Capture:

- Event History section.
- Visible lifecycle events, transaction references, or status updates.
- Enough context to show the events belong to a specific project.

Recommended framing:

- Use the investor route for investor-facing materials.
- Use the admin route only for operational demos.

## Final Quality Check

After capture, review the screenshots as a set:

- Filenames match the naming convention.
- All images are PNG files.
- No screenshot shows credentials, private keys, local environment variables, or browser notifications.
- Fidlot and Hissar screenshots use consistent framing.
- The first three screenshots tell the story without requiring technical explanation.
- The admin screenshot is used only where operational capability is relevant.
