# AgriPartners Pitch Deck v2 Screenshot Capture

This folder is reserved for real AgriPartners platform screenshots used in Pitch Deck v2.

No screenshots are required yet. When captured, save all PNG files directly into:

```text
docs/investor-package/screenshots/
```

## Required Screenshot Filenames

Use these exact filenames:

```text
../../screenshots/investor/03-investment-summary.png
../../screenshots/investor/04-featured-pilot-deals.png
../../screenshots/admin/03-admin-fidlot-profile.png
../../screenshots/admin/06-admin-hissar-profile.png
../../screenshots/farmer/04-farmer-deals.png
../../screenshots/investor/03-investment-summary.png
../../screenshots/admin/01-admin-dashboard.png
../../screenshots/admin/05-admin-fidlot-event-history.png
```

## Local Capture Setup

1. Start the backend.
2. Start the frontend.
3. Open:

```text
http://127.0.0.1:5173
```

4. Use browser zoom `90%` or `100%`.
5. Use a 16:9 browser window.
6. Hide the bookmarks bar.
7. Close console/devtools.
8. Capture clean screenshots without browser notifications, console panels, devtools, or unrelated desktop content.
9. Save screenshots into:

```text
docs/investor-package/screenshots/
```

## Recommended Routes

Use these hash routes where available:

```text
http://127.0.0.1:5173/#investor
http://127.0.0.1:5173/#investor/deals/7
http://127.0.0.1:5173/#investor/deals/8
http://127.0.0.1:5173/#farmer
http://127.0.0.1:5173/#farmer/deals/7
http://127.0.0.1:5173/#admin
http://127.0.0.1:5173/#deals/7
```

## Capture Checklist

### ../../screenshots/investor/03-investment-summary.png

Route:

```text
http://127.0.0.1:5173/#investor
```

Capture the investor dashboard with the Investment Summary visible.

### ../../screenshots/investor/04-featured-pilot-deals.png

Route:

```text
http://127.0.0.1:5173/#investor
```

Scroll to Featured Pilot Deals and capture both pilot cards if possible.

### ../../screenshots/admin/03-admin-fidlot-profile.png

Route:

```text
http://127.0.0.1:5173/#investor/deals/7
```

Capture the Fidlot Livestock Project profile section.

### ../../screenshots/admin/06-admin-hissar-profile.png

Route:

```text
http://127.0.0.1:5173/#investor/deals/8
```

Capture the Hissar Sheep Breeding Project profile section.

### ../../screenshots/farmer/04-farmer-deals.png

Route options:

```text
http://127.0.0.1:5173/#farmer
http://127.0.0.1:5173/#farmer/deals/7
```

Capture farmer reporting or cycle status content.

### ../../screenshots/investor/03-investment-summary.png

Route:

```text
http://127.0.0.1:5173/#investor/deals/7
```

Scroll to Investment Summary, ROI, Returns, or repayment history.

### ../../screenshots/admin/01-admin-dashboard.png

Route:

```text
http://127.0.0.1:5173/#admin
```

Capture the Admin Portal without exposing secrets, credentials, or private environment data.

### ../../screenshots/admin/05-admin-fidlot-event-history.png

Route options:

```text
http://127.0.0.1:5173/#investor/deals/7
http://127.0.0.1:5173/#deals/7
```

Scroll to Event History and capture lifecycle or transaction events.

## Quality Rules

- Use PNG format.
- Keep text readable.
- Keep project names visible.
- Do not include browser devtools.
- Do not include terminal windows.
- Do not include private keys, credentials, environment variables, or wallet seed phrases.
- Use consistent browser size and zoom across all screenshots.
