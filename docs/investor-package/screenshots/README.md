# AgriPartners Pitch Deck v2 Screenshot Capture

This folder is reserved for real AgriPartners platform screenshots used in Pitch Deck v2.

No screenshots are required yet. When captured, save all PNG files directly into:

```text
docs/investor-package/screenshots/
```

## Required Screenshot Filenames

Use these exact filenames:

```text
01-investor-dashboard.png
02-featured-pilot-deals.png
03-fidlot-project-profile.png
04-hissar-project-profile.png
05-farmer-report.png
06-roi-and-returns.png
07-admin-portal.png
08-event-history.png
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

### 01-investor-dashboard.png

Route:

```text
http://127.0.0.1:5173/#investor
```

Capture the investor dashboard with the Investment Summary visible.

### 02-featured-pilot-deals.png

Route:

```text
http://127.0.0.1:5173/#investor
```

Scroll to Featured Pilot Deals and capture both pilot cards if possible.

### 03-fidlot-project-profile.png

Route:

```text
http://127.0.0.1:5173/#investor/deals/7
```

Capture the Fidlot Livestock Project profile section.

### 04-hissar-project-profile.png

Route:

```text
http://127.0.0.1:5173/#investor/deals/8
```

Capture the Hissar Sheep Breeding Project profile section.

### 05-farmer-report.png

Route options:

```text
http://127.0.0.1:5173/#farmer
http://127.0.0.1:5173/#farmer/deals/7
```

Capture farmer reporting or cycle status content.

### 06-roi-and-returns.png

Route:

```text
http://127.0.0.1:5173/#investor/deals/7
```

Scroll to Investment Summary, ROI, Returns, or repayment history.

### 07-admin-portal.png

Route:

```text
http://127.0.0.1:5173/#admin
```

Capture the Admin Portal without exposing secrets, credentials, or private environment data.

### 08-event-history.png

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
