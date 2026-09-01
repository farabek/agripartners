# AgriPartners Alpha v1 Public Deployment Plan

> Farmer signer credentials and Uzbekistan-facing wallet, funding, withdrawal, or contract-payout
> routes are **Legacy Testnet Alpha — historical technical demonstration, not the target production
> financial architecture**. Stage 2 must remove them from target deployment configuration.

Plan date: 2026-06-19

Target environment: public Alpha v1 on NEAR Testnet

Status: planning only; no deployment is performed by this document.

## Purpose and Current Position

This plan describes how to publish the current AgriPartners repository using GitHub, Vercel, Railway, Railway PostgreSQL, and NEAR Testnet.

The target is a public technical demonstration, not a production financial service. It must continue to state:

- Alpha v1;
- NEAR Testnet only;
- unaudited smart contract;
- no Mainnet or production investment claims.

### Current blockers before deployment

- `frontend/app.js` is hardcoded to `https://agripartners.onrender.com` outside local development. That URL currently returns HTTP 404 and cannot point to a generated Railway domain without a code change.
- CORS is unrestricted in the backend.
- The tracked backend environment example omits required `JWT_SECRET` and production `ADMIN_PASSWORD`.
- No canonical Testnet contract, transaction evidence set, or reproducible WASM provenance is published.
- Contract tests do not yet have a verified passing Linux CI result.
- Existing lifecycle demo scripts are not fully aligned with the current authentication and contract interfaces.

These are pre-deployment work items. This plan documents them but does not modify the application.

## 1. Deployment Topology

```text
GitHub: farabek/agripartners, main branch
  |
  +--> Vercel project, root directory: frontend/
  |      |
  |      +--> Public Vite SPA
  |      +--> MyNearWallet / NEAR Testnet RPC
  |      +--> HTTPS REST calls to Railway backend
  |
  +--> Railway backend service, root directory: backend/
         |
         +--> Express API and startup migrations
         +--> Railway PostgreSQL through DATABASE_URL
         +--> FastNEAR or configured NEAR Testnet RPC
         +--> NEAR Testnet contract view/call/deploy operations
```

### Component responsibilities

| Component | Responsibility | Deployment source |
| --- | --- | --- |
| GitHub | Canonical source, branch protection, deployment trigger | Repository `main` branch |
| Vercel | Build and serve the static Vite frontend over HTTPS | `frontend/` |
| Railway backend | Run Express, migrations, API, wallet verification, and NEAR service | `backend/` |
| Railway PostgreSQL | Store users, profiles, deals, reports, cycles, events, and return records | `DATABASE_URL` |
| NEAR Testnet | Wallet accounts, deal contracts, lifecycle state, balances, and test transactions | Configured Testnet accounts and RPC |

### Trust boundary

The backend remains a trusted component. It stores JWT secrets, connects to PostgreSQL, holds configured Testnet signer keys, deploys contracts, and submits admin actions. The public Alpha must not be described as fully decentralized.

## 2. Environment Variables

### Frontend variables

| Variable | Required | Current support | Planned value or handling |
| --- | --- | --- | --- |
| `VITE_NEAR_RPC_URL` | Recommended | Implemented | Public NEAR Testnet RPC URL |
| `VITE_API_BASE_URL` | Required for Railway topology | **Not implemented** | Railway backend HTTPS origin; wire into frontend before deployment |
| NEAR network selector | Required conceptually | Hardcoded to `testnet` | Keep Testnet for Alpha; do not expose Mainnet switch |

Vercel must not receive backend private keys, JWT secrets, database credentials, or admin passwords. Variables prefixed with `VITE_` are embedded into the public browser bundle and are not secrets.

### Backend variables

| Variable | Required | Purpose | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection | Inject from Railway PostgreSQL service |
| `NODE_ENV` | Yes | Production behavior | Set to `production` |
| `PORT` | Platform-managed | Express listener | Use Railway-provided value |
| `API_KEY` | Yes by current startup check | Legacy API-key configuration | Middleware is not mounted; resolve this inconsistency before release |
| `JWT_SECRET` | Yes | Sign and verify legacy and wallet JWTs | Generate a long random secret; never reuse elsewhere |
| `NEAR_NETWORK` | Yes | NEAR network | Set to `testnet` |
| `NEAR_RPC_URL` | Recommended | Backend NEAR RPC | Use the verified Testnet RPC endpoint |
| `FASTNEAR_API_KEY` | Optional | Authenticated FastNEAR requests | Store only in Railway if used |
| `NEAR_ADMIN_ACCOUNT` | Yes | Contract deployment and admin signer | Dedicated Testnet account recommended |
| `NEAR_ADMIN_PRIVATE_KEY` | Yes | Backend Testnet signing | Secret; restrict access and rotate after exposure |
| `WASM_PATH` | Yes operationally | Contract artifact for deployment | `./contract/agripartners.wasm` under backend root |
| `ADMIN_EMAIL` | Recommended | Seeded admin identity | Do not use a placeholder public address |
| `ADMIN_PASSWORD` | Required when production seed runs on an empty database | Initial legacy admin password | Strong secret; rotate after first login or disable legacy path |
| `ADMIN_WALLET_ALLOWLIST` | Required for wallet-admin access | Comma-separated Testnet accounts | Use explicit least-privilege list |
| `RUN_SEED` | No | Force seed in production | Leave unset/false unless deliberately initializing an empty database |
| `NEAR_INVESTOR_SIGNER_ACCOUNT_ID` | Conditional | Investor withdrawal signer | Include only if the current signer model is retained |
| `NEAR_INVESTOR_SIGNER_PRIVATE_KEY` | Conditional | Investor signer key | Railway secret |
| `NEAR_FARMER_SIGNER_ACCOUNT_ID` | Demo-only/conditional | Backend farmer signer | Avoid in public Alpha where direct wallet signing is available |
| `NEAR_FARMER_SIGNER_PRIVATE_KEY` | Demo-only/conditional | Farmer signer key | Do not configure unless explicitly required |
| `NEAR_PLATFORM_SIGNER_ACCOUNT_ID` | Conditional | Platform signer | Document role before enabling |
| `NEAR_PLATFORM_SIGNER_PRIVATE_KEY` | Conditional | Platform signer key | Railway secret |

### Database variables

The application directly consumes only `DATABASE_URL`. Railway PostgreSQL may expose additional `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE` values, but current code does not read them individually.

Database requirements:

- private service-to-service connection where Railway supports it;
- encrypted external connection if an external administration client is used;
- automated backup or snapshot before each schema-changing release;
- restricted access to production-like data;
- no real investor or farmer personal data in the public Alpha.

### NEAR variables and assets

The deployment requires:

- a dedicated NEAR Testnet admin account;
- enough Testnet NEAR for subaccount creation, contract deployment, gas, and demo transactions;
- a reviewed Testnet signer strategy;
- a WASM artifact with source commit and SHA-256 checksum;
- canonical contract and transaction evidence after deployment.

Do not use a Mainnet key or real funds in this environment.

## 3. Deployment Order

### Step 0: Resolve pre-deployment blockers

Before connecting hosting platforms:

1. make the frontend API base configurable with a Vercel variable;
2. replace unrestricted CORS with an allowlist for the Vercel origin and local development;
3. complete and verify `backend/.env.example`;
4. align or retire the outdated demo scripts;
5. establish Linux CI for backend tests, frontend build, contract tests, and WASM build;
6. record WASM provenance;
7. decide the canonical signer and withdrawal model.

### Step 1: Prepare GitHub

1. use `main` as the deployment branch;
2. require pull-request review and passing CI before deployment;
3. confirm no `.env`, key, token, database dump, or personal data is tracked;
4. tag the release candidate;
5. record the commit SHA in the deployment log.

### Step 2: Run release gates locally and in CI

Required results:

- backend: all 20 suites and 226 tests pass;
- frontend: Vite production build passes;
- contract: unit and sandbox tests pass in Linux;
- WASM: release artifact builds and checksum is recorded;
- internal documentation links pass;
- dependency and secret scans have no unresolved critical findings.

### Step 3: Create Railway project and PostgreSQL

1. create one Railway project for the public Alpha;
2. add a PostgreSQL service;
3. create a backend service from the GitHub repository;
4. set the backend root directory to `backend`;
5. use `npm install` or the lockfile-aware Railway build and `node server.js` start command;
6. attach the PostgreSQL `DATABASE_URL` to the backend service;
7. configure health check path `/health`;
8. enter all backend and NEAR secrets in Railway variables.

### Step 4: Deploy and verify backend first

1. deploy the backend without deploying the frontend;
2. confirm startup migrations complete;
3. confirm `/health` returns HTTP 200 and `{ "status": "ok" }`;
4. confirm `/api/deals` returns valid JSON;
5. verify logs contain no private keys, JWTs, raw signatures, or sensitive personal data;
6. record the generated `*.up.railway.app` URL;
7. do not proceed if the database or NEAR RPC is unavailable.

### Step 5: Prepare NEAR Testnet evidence

1. verify the dedicated admin account and RPC configuration;
2. deploy one disposable review contract from the recorded WASM;
3. record contract ID, deployment hash, source commit, and WASM checksum;
4. run read-only `get_params`, `get_status`, and `get_balances` checks;
5. execute only the minimum safe Testnet lifecycle needed for verification;
6. record explorer links and expected results.

### Step 6: Create Vercel project

1. import the same GitHub repository into Vercel;
2. set root directory to `frontend`;
3. use `npm run build:wallet-poc` as the build command;
4. use `dist` as the output directory;
5. set `VITE_API_BASE_URL` to the verified Railway HTTPS URL after frontend support exists;
6. set `VITE_NEAR_RPC_URL` to the selected Testnet RPC;
7. deploy a preview first, then promote the verified deployment.

### Step 7: Apply origin and callback configuration

1. add the final Vercel origin to backend CORS allowlist;
2. confirm wallet callback URLs use the Vercel HTTPS origin;
3. confirm Testnet helper, explorer, and RPC URLs;
4. confirm no localhost URL is used by the public build.

### Step 8: Execute end-to-end verification

Test in this order:

1. frontend loads;
2. backend health and public API work;
3. wallet login and onboarding work;
4. role-specific portals load only authorized data;
5. contract status and balances are visible;
6. one safe Testnet transaction completes;
7. transaction hash and explorer link are displayed or recorded;
8. database events and reports remain consistent after refresh.

### Step 9: Publish the Alpha evidence record

Record:

- Git commit;
- Vercel deployment URL;
- Railway deployment URL;
- database migration version;
- Testnet contract ID and transaction links;
- WASM checksum;
- test/CI links;
- known limitations and rollback owner.

## 4. Required Accounts

| Account | Required access | Recommended controls |
| --- | --- | --- |
| GitHub | Repository admin and deployment integration | MFA, protected `main`, limited app permissions |
| Railway | Project owner, backend service, PostgreSQL | MFA, least-privilege team access, billing alerts |
| Vercel | Project owner and GitHub integration | MFA, preview/production separation, limited team access |
| NEAR Wallet | Dedicated Testnet admin/signer account | Separate from personal wallet, backed up securely, Testnet only |

Do not share one person's root credentials. Add named collaborators with the minimum role required.

## 5. Domain Strategy

### Temporary public URLs

- frontend: `https://<project>.vercel.app`;
- backend: `https://<service>.up.railway.app`;
- Testnet explorer: canonical links for accounts and transactions.

Use temporary URLs through technical review and pilot validation. Do not purchase or redirect a production brand domain until the API, wallet callback, CORS, and rollback process are stable.

### Future custom domain

Recommended structure:

- `app.<domain>` for Vercel frontend;
- `api.<domain>` for Railway backend;
- `docs.<domain>` only if documentation is intentionally published.

Before migration:

1. lower DNS TTL;
2. verify TLS certificates;
3. update CORS and wallet callback origins;
4. update the frontend API variable;
5. keep temporary platform URLs available during transition;
6. verify both old and new origins before removing the old route.

## 6. Security Checklist

### CORS and HTTPS

- [ ] Replace `cors()` default behavior with explicit allowed origins.
- [ ] Allow the production Vercel origin and approved preview/local origins only.
- [ ] Require HTTPS for all public frontend and API requests.
- [ ] Do not place credentials in query strings.

### JWT and authentication

- [ ] Generate a strong unique `JWT_SECRET`.
- [ ] Rotate the initial admin password.
- [ ] Review one-day wallet and seven-day legacy token lifetimes.
- [ ] Decide whether legacy username/password login remains enabled.
- [ ] Move wallet nonces from process memory before horizontal scaling.
- [ ] Redact wallet signature and token diagnostics from production logs.

### Secrets and environment variables

- [ ] Store private keys and secrets only in Railway secret variables.
- [ ] Never expose secrets through `VITE_` variables.
- [ ] Use a dedicated Testnet signer with minimum funds.
- [ ] Restrict who can view or edit Railway and Vercel variables.
- [ ] Rotate any secret shown in logs, chat, screenshots, or local history.
- [ ] Confirm `.env` and private key files remain ignored by Git.

### Application and database

- [x] Add rate limiting and request-size limits.
- [ ] Validate all state-changing payloads.
- [ ] Confirm public deal fields contain no confidential information.
- [ ] Back up PostgreSQL before migrations.
- [ ] Test restore procedure.
- [ ] Add monitoring for health, errors, RPC failures, and database saturation.

## 7. Verification Checklist

### Frontend

- [ ] Vercel build passes from a clean clone.
- [ ] Main application and wallet POC assets load without 404 errors.
- [ ] Hash routing survives refresh and direct links.
- [ ] Production bundle uses Railway API URL, not Render or localhost.
- [ ] Browser console has no blocking errors.

### Backend and API

- [ ] Railway deployment is healthy.
- [ ] `/health` returns HTTP 200.
- [ ] `/api/deals` returns JSON.
- [ ] Unauthorized protected requests return 401/403.
- [ ] Admin, investor, and farmer routes enforce role ownership.
- [ ] Logs are redacted.

### Database

- [ ] Migrations run once in filename order.
- [ ] `_migrations` records the applied files.
- [ ] Seed behavior is intentional and secure.
- [ ] Restart preserves data.
- [ ] Backup and restore are tested.

### Wallet login

- [ ] MyNearWallet opens on Testnet.
- [ ] Challenge nonce is 32 bytes and expires.
- [ ] Signature verification succeeds for the correct account.
- [ ] Reuse and invalid signatures fail.
- [ ] Onboarding routes to the correct portal.

### NEAR

- [ ] Network is Testnet everywhere.
- [ ] RPC reads succeed.
- [ ] Contract ID and deployment hash are recorded.
- [ ] `get_params`, `get_status`, and `get_balances` match expectations.
- [ ] One safe signed transaction succeeds.
- [ ] Explorer link resolves to the expected account and transaction.

## 8. Rollback Plan

### Frontend rollback

1. promote the previous known-good Vercel deployment;
2. restore the prior environment-variable set if it changed;
3. verify API and wallet callback origins;
4. keep the failed deployment for logs but do not expose it publicly.

### Backend rollback

1. stop state-changing admin operations;
2. redeploy the previous known-good Git commit in Railway;
3. restore the previous variable set if configuration caused the failure;
4. verify `/health`, API reads, and database connectivity;
5. rotate secrets if compromise is suspected.

### Database rollback

Current migrations are forward-only and no down migrations are provided.

1. take a backup before every migration release;
2. prefer backward-compatible additive migrations;
3. if rollback is required, restore into a new Railway PostgreSQL service;
4. point the rolled-back backend to the restored database;
5. validate counts and critical records before reopening writes.

Never improvise destructive SQL against the only database copy.

### Release-specific rollback for migration 018

Migration `018_wallet_auth_challenges.sql` is additive: it creates the shared,
expiring wallet-auth challenge store used by the hardened backend. Before the
release, record the current frontend and backend revisions and take a verified
PostgreSQL backup. Deploy the backend before the frontend and require both
`/health/live` and `/health` to pass before enabling traffic.

If the release must be rolled back, promote the recorded frontend revision and
redeploy the recorded backend revision. The previous backend safely ignores the
new table, so leave migration 018 and its `_migrations` row in place. If database
restoration is required, restore the pre-release backup into a new PostgreSQL
service, point the rolled-back backend at it, validate critical row counts, and
only then reopen writes. Never drop the wallet challenge table or delete the
migration record in place.

### NEAR rollback

Deployed contract code and completed transactions cannot be rolled back like a web deployment.

1. stop frontend/backend actions targeting the affected contract;
2. preserve contract ID and transaction evidence;
3. assess balances and authorized withdrawal paths;
4. deploy a corrected Testnet contract only after review;
5. update the database registry and UI explicitly;
6. never present a replacement contract as the original history.

## 9. Known Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Frontend API URL is misconfigured at deployment | Public application cannot reach the backend | `VITE_API_BASE_URL` is implemented; verify the deployed value before promotion |
| CORS allowlist is misconfigured | Legitimate clients fail or an unintended origin is accepted | Restricted `ALLOWED_ORIGINS`; verify accepted and rejected origins in staging |
| Centralized backend signer keys | Key compromise can submit privileged Testnet calls | Dedicated low-balance account, managed secrets, signer redesign |
| Wallet challenge cleanup or database outage | Login can fail while readiness is degraded | Shared PostgreSQL challenge store, expiry cleanup, readiness checks, and alerting |
| No public backend currently | End-to-end deployment is unverified | Deploy backend first and gate frontend release on health |
| Forward-only migrations | Unsafe rollback after schema change | Backups, additive migrations, restore drill |
| Chain/database non-atomicity | Deployed contract may not be indexed after partial failure | Idempotency and reconciliation tooling |
| WASM provenance missing | Reviewer cannot prove deployed code matches source | CI build manifest and checksum |
| Contract tests lack a successful Linux release run | Contract verification is incomplete | Required Linux CI gate is configured; require it to pass on the release PR |
| Demo scripts are outdated | Deployment validation may fail or mislead | Align scripts before release |
| No smart contract audit | Production finance risk remains unknown | Keep Testnet-only disclaimer; audit before Mainnet |
| Public Alpha may expose demo data as real | Reputation and compliance confusion | Clear labels and synthetic/redacted data only |

## 10. Final Readiness Checklist

### Release blockers

- [x] Frontend API base is configurable; verify that the release environment points to the selected backend.
- [ ] Backend health endpoint works publicly.
- [x] CORS is restricted.
- [x] Complete backend environment template is verified locally from a clean checkout state.
- [ ] Linux contract tests pass.
- [ ] WASM source commit and checksum are recorded.
- [ ] Canonical Testnet evidence is published.
- [ ] Demo scripts match current authentication and contract interfaces.

### Release approval

- [ ] GitHub release commit is recorded.
- [ ] Railway PostgreSQL backup exists.
- [ ] Railway backend variables are complete.
- [ ] Vercel frontend variables are complete.
- [ ] Wallet login and onboarding pass.
- [ ] Investor, farmer, and admin smoke tests pass.
- [ ] One Testnet lifecycle is verified.
- [ ] Rollback owners and steps are assigned.
- [ ] Alpha/Testnet/unaudited disclaimers are visible.

## Deployment Readiness Assessment

**Current assessment: release candidate pending CI, preview/staging verification, and external approval gates.**

The repository now has configurable API routing, restricted CORS, shared wallet
challenges, health/readiness endpoints, browser security checks, and required CI
gates. Local application verification and the disposable PostgreSQL migration
lifecycle pass. Public promotion still depends on a successful release PR,
preview/staging smoke tests, production backup and restore evidence, canonical
Testnet provenance, and independent security and legal/compliance approval.

Recommended next action: complete the release PR gates, deploy PostgreSQL and the
backend first, verify health and authorization in staging, then promote the
frontend only after the rollback evidence and canonical Testnet evidence are
recorded.

## References

Current repository sources:

- `frontend/app.js`
- `frontend/package.json`
- `frontend/vite.config.js`
- `backend/src/app.js`
- `backend/server.js`
- `backend/.env.example`
- `backend/railway.toml`
- `backend/src/db/`
- `backend/src/near/client.js`
- `backend/src/services/nearService.js`
- `contract/src/lib.rs`
- `docs/developer-review/08-testnet-evidence-packet.md`

Platform references accessed 2026-06-19:

- [Railway monorepo deployments](https://docs.railway.com/deployments/monorepo)
- [Railway PostgreSQL](https://docs.railway.com/databases/postgresql)
- [Railway variables](https://docs.railway.com/variables)
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
