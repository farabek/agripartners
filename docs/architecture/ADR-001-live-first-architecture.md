# ADR-001 — Live-first Architecture

## Status

Accepted

## Context

AgriPartners Alpha v1 originally used demo and static datasets in several user interface areas. During Phase 18 — Live Data Integration, the Investor, Farmer, and Admin portals were migrated to use live backend data by default.

The platform still needs demo scenarios for presentations, training, and pilot demonstrations. However, demo data must remain separate from operational views so that it cannot replace authoritative data or conceal failures.

## Decision

Live routes must use authoritative backend API data only.

Demo and static data must be isolated to explicit demo or pilot routes. Live views must never fall back to demo data when backend data is empty, missing, unavailable, or inaccessible.

## Rules

- Live routes never silently consume demo datasets.
- Demo data must not mask API, authentication, authorization, or network errors.
- Empty data must render an explicit empty state, not a demo fallback.
- Missing data must render `Unknown` or `Unavailable`.
- The backend API is the source of truth for deals, profiles, cycles, reports, returns, events, balances, and statuses.
- Demo routes are allowed only for presentation, training, and pilot scenarios.

## Current Route Separation

### Live routes

- `#investor`
- `#investor/deals/:id`
- `#farmer`
- `#farmer/deals/:id`
- `#admin`
- `#deals`
- `#deals/:id`

### Demo routes

- `#investor/pilots/:key`
- `#farmer/pilots/:key`
- `#deals/pilots/:key`

## Phase 18 Completion Summary

- Sprint 18.1 — Investor Dashboard Live Data
- Sprint 18.2 — Investor Deal Detail Live Data
- Sprint 18.3 — Farmer Portal Live Data
- Sprint 18.4 — Admin Portal Live Data

## Consequences

### Positive consequences

- Real user data is no longer mixed with demo data.
- Demo scenarios remain available for presentations and training.
- Errors, authorization failures, and empty states are visible.
- The platform is ready for Security Hardening and Phase 19.

### Tradeoffs

- Demo routes must be maintained separately from live routes.
- Live UI components must explicitly handle empty, error, and unavailable states.

## Next Recommended Step

Security Hardening 1 — Review `/api/me/deals` authorization.
