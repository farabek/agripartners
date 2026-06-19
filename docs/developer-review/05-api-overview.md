# API Overview

## Runtime

- framework: Express 4.18;
- payload format: JSON;
- database: PostgreSQL;
- chain client: `near-api-js`;
- default network: NEAR Testnet;
- default RPC: FastNEAR Testnet RPC;
- documented base URL: `https://agripartners.onrender.com`;
- observed status on 2026-06-19: documented health and deal paths returned HTTP 404.

## Authentication Modes

| Mode | Token | Lifetime | Used by |
| --- | --- | ---: | --- |
| Legacy username/password | JWT with user ID, role, and optional NEAR account | 7 days | `/api/me`, admin access, user registration |
| Wallet signature | JWT with `wallet-auth-poc`, account, public key, and Testnet | 1 day | profile, investor, farmer, and allowlisted admin access |
| API key middleware | `x-api-key` | Not applicable | Implemented but not mounted by `app.js` |

Admin routes accept either a legacy admin JWT or an allowlisted wallet-auth JWT.

## Health and Public Deal Routes

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | PostgreSQL connectivity check |
| GET | `/api/deals` | List all indexed deals |
| GET | `/api/deals/:id` | Read one indexed deal |
| GET | `/api/deals/:id/status` | Read contract status from NEAR |
| GET | `/api/deals/:id/balances` | Read contract balances from NEAR |
| GET | `/api/deals/:id/events` | Read database event history |

These deal routes are currently public and do not enforce wallet ownership.

## Login and Wallet Authentication

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Verify username/password and issue legacy JWT |
| POST | `/api/auth/register` | Admin-only creation of admin, farmer, or investor user |
| POST | `/api/wallet-auth/challenge` | Create five-minute wallet-signing challenge |
| POST | `/api/wallet-auth/verify` | Verify signature and FullAccess key, then issue wallet JWT |

## Profile and Onboarding

Wallet JWT required:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/profile/me` | Read wallet-linked profile or onboarding requirement |
| POST | `/api/profile/onboarding` | Create farmer or investor profile |
| PUT | `/api/profile/me` | Update editable profile fields |

## Investor Flow

Wallet JWT required. Deal routes scope data to `deal.investor === authenticated account_id`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/investor/me` | Return authenticated wallet identity |
| GET | `/api/investor/profile` | Get or create investor profile |
| PUT | `/api/investor/profile` | Update editable investor profile fields |
| GET | `/api/investor/deals` | List wallet-owned investor deals |
| GET | `/api/investor/deals/:id` | Read owned deal with return summary |
| GET | `/api/investor/deals/:id/status` | Read owned deal contract status |
| GET | `/api/investor/deals/:id/balances` | Read owned deal contract balances |
| GET | `/api/investor/deals/:id/events` | Read owned deal database events |
| GET | `/api/investor/deals/:id/cycles` | Read normalized cycle state |
| GET | `/api/investor/deals/:id/reports` | Read farmer reports for owned deal |
| GET | `/api/investor/deals/:id/returns` | Read off-chain return records |
| POST | `/api/investor/deals/:id/withdraw` | Trigger backend-signed contract withdrawal to investor |

## Farmer Flow

Wallet JWT required. The API verifies that the authenticated account matches the deal's farmer.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/farmer/deals` | List wallet-owned farmer deals |
| GET | `/api/farmer/deals/:dealId` | Read one owned farmer deal |
| GET | `/api/farmer/deals/:dealId/cycles` | Read cycle and report state |
| POST | `/api/farmer/deals/:dealId/confirm-funding` | Legacy-form funding confirmation using body cycle ID |
| POST | `/api/farmer/deals/:id/cycles/:cycleId/confirm-funding` | Confirm off-chain receipt of cycle funding |
| POST | `/api/farmer/deals/:dealId/cycles/:cycleId/report` | Store off-chain farmer report and event |

Farmer withdrawal is performed directly by the main frontend through a wallet-signed contract call rather than a farmer API endpoint.

## Admin Flow

Admin JWT or production allowlisted wallet JWT required:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/admin/farmers` | List farmer profiles |
| GET | `/api/admin/investors` | List investor profiles |
| POST | `/api/admin/deals` | Deploy contract and insert indexed deal |
| POST | `/api/admin/deals/:id/start-cycle` | Submit admin-signed cycle start |
| POST | `/api/admin/deals/:id/report-cycle` | Submit admin-signed cycle result and deposit |
| GET | `/api/admin/deals/:id/cycles` | Read off-chain cycle/report state |
| GET | `/api/admin/deals/:id/return-summary` | Read derived return summary |
| GET | `/api/admin/deals/:id/returns` | Read off-chain return ledger |
| POST | `/api/admin/deals/:id/returns` | Add off-chain return record |
| POST | `/api/admin/deals/:id/fund` | Backend-signed funding call |
| POST | `/api/admin/deals/:id/withdraw` | Backend-signed platform withdrawal |

Non-production only:

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/admin/deals/:id/fund-as` | Fund using configured investor signer credentials |
| POST | `/api/admin/deals/:id/withdraw-as` | Demo withdrawal path for a selected deal account |

## Legacy User Route

Legacy JWT required:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/me/deals` | Return deals associated with legacy user's NEAR account and role |

## API Design Observations

- No OpenAPI specification is present.
- Validation is route-local rather than based on shared schemas.
- Error payloads generally use `{ "error": "..." }`, but success shapes vary.
- Several endpoints return raw database rows while others return normalized DTOs.
- Public and role-scoped versions of deal reads coexist.
- API versioning is absent.
- CORS is unrestricted.
- Rate limiting and abuse controls are absent.
- Wallet challenges are stored in process memory.
- Sensitive authentication diagnostics are logged too verbosely.
- `API_KEY` is required at startup even though its middleware is not mounted.
- `withdrawContractAs` does not currently use the requested signer account.
- Admin chain operations and subsequent database event writes are not transactional.

## Recommended API Priorities

1. publish an OpenAPI 3 specification;
2. standardize success and error envelopes;
3. add request schemas and centralized validation;
4. remove or correctly integrate the unused API-key requirement;
5. reduce auth logs and define secure observability;
6. add rate limits and restricted CORS;
7. move nonces to shared expiring storage;
8. simplify legacy and wallet authentication boundaries;
9. make signer behavior explicit and test end to end;
10. add chain/database idempotency and reconciliation.
