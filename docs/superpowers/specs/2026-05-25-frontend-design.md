# Frontend Design: AgriPartners Dashboard

**Date:** 2026-05-25  
**Status:** Approved  
**Audience:** Investors/farmers (public read-only) + NEAR Protocol pitch demo

---

## Overview

A single-page static dashboard for AgriPartners — an RWA agro-investment platform on NEAR Protocol. Shows deals, blockchain status, balances, and event history. No authentication required. Built as a static HTML/CSS/JS app (no build step).

---

## Architecture

### File Structure

```
E:\agripartners\frontend\
  index.html     — structure, CDN imports
  style.css      — dark theme, status badge colors
  app.js         — API calls, hash routing, rendering
```

### CDN Dependencies

- **Tailwind CSS v3** — utility-first styling for dark theme
- **Chart.js v4** — donut chart for balance visualization

### Configuration

Single constant at the top of `app.js`:

```js
const API_BASE = 'http://localhost:3000';
```

Changed to testnet URL when deployed.

---

## Routing

Hash-based SPA — works as a static file, no server needed.

| Hash | View |
|---|---|
| `#deals` | Deals list |
| `#deals/:id` | Deal detail |
| (default/empty) | Redirect to `#deals` |

---

## Views

### View 1 — Deals List (`#deals`)

**Data source:** `GET /api/deals`

**Layout:**
- Header: "AgriPartners" title + subtitle "Агро-инвестиции на NEAR Protocol"
- Cards grid: one card per deal
- Each card shows: deal type badge (Fidlot/Hissar), status badge, farmer address, investor address, total cycles × cycle duration, investment amount in NEAR, "Открыть →" button

**Empty state:** "Нет сделок" message when array is empty.

### View 2 — Deal Detail (`#deals/:id`)

**Data sources (loaded in parallel):**
- `GET /api/deals/:id` — deal parameters (from DB, static)
- `GET /api/deals/:id/status` — current status + cycle number (blockchain)
- `GET /api/deals/:id/balances` — four balance values (blockchain)
- `GET /api/deals/:id/events` — event history (from DB)

**Layout:**
- Header: "← Назад" link, deal type, status badge, current cycle number
- Two-column section:
  - Left: deal parameters (farmer, investor, admin, platform addresses; split 60/40; escrow %; performance fee %; cycle duration; total cycles; investment amount; capital return)
  - Right: donut chart (Chart.js) — farmer / investor / platform / escrow balances in NEAR
- Events timeline: chronological list (event type, cycle number, profit/loss NEAR, tx hash, date)
- "Обновить" button — re-fetches `/status` and `/balances` only (parameters don't change)

---

## Status Badge Colors

| Status | Color |
|---|---|
| Initialized | Gray |
| Funded | Yellow |
| CycleActive | Blue |
| CycleSettlement | Orange |
| Completed | Green |
| Terminated | Red |

---

## Data Flow

### Deals List Load
1. Show spinner
2. `GET /api/deals`
3. Render cards or empty state

### Deal Detail Load
1. Show spinner
2. Parallel: `GET /api/deals/:id` + `/status` + `/balances` + `/events`
3. Render all sections; if blockchain calls fail, show "—" for status/balances, still show DB data

### Refresh Button (Detail view)
1. Show spinner on status/balances section only
2. Parallel: `GET /api/deals/:id/status` + `/balances`
3. Update status badge, cycle number, chart

---

## Error Handling

| Scenario | UI behavior |
|---|---|
| Backend unreachable | Red error banner: "Backend недоступен" |
| Blockchain RPC fails | Status and balances show "—", DB data still visible |
| Deal not found (404) | "Сделка не найдена" message |
| Empty deals list | "Нет сделок" message |

---

## Unit Conversions

All monetary values from the API are **yoctoNEAR strings** (too large for JS Number).  
Use BigInt to convert for display:

```js
function yoctoToNear(yocto) {
  if (!yocto || yocto === '0') return '0';
  const n = BigInt(yocto);
  const one = BigInt('1000000000000000000000000');
  const whole = n / one;
  const frac = (n % one) * 100n / one;
  return `${whole}.${frac.toString().padStart(2, '0')} NEAR`;
}
```

Applies to: `investment_amount`, `capital_return_near` (deals table), all four balance fields, `profit_near`, `losses_near` (events table).

---

## Address Display

NEAR addresses displayed in full if ≤ 20 chars (e.g. `alice.testnet`).  
Long hex hashes truncated: first 6 + `…` + last 4 characters.

---

## Visual Style

- **Theme:** Dark (dark gray/slate backgrounds)
- **Accent colors:** green for positive states, per-status badge colors
- **Typography:** Tailwind defaults (Inter/system font)
- **Chart:** Chart.js donut chart with 4 segments (farmer=blue, investor=green, platform=yellow, escrow=red)

---

## Out of Scope (v2)

- Admin UI (deploy contract, start cycle, report cycle) — done via API directly
- Authentication (NEAR Wallet login, JWT)
- Auto-refresh / WebSocket live updates
- Analytics / statistics across all deals
- Mobile-optimized layout
