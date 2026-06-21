# AgriPartners Alpha v1 Full Repository Audit

Audit date: 2026-06-21  
Repository baseline: `f943c41` (`main`, tag `alpha-v1.0`)  
Scope: backend, frontend, PostgreSQL schema and migrations, NEAR contract, tests, deployment configuration, documentation, and Git history.

## 1. Audit method and status model

This report was produced from the current repository. Historical plans and prior audit claims were not accepted as implementation evidence unless current source, migrations, tests, or deployment configuration supported them.

Evidence priority:

1. current source and migrations;
2. current automated tests and build results;
3. current deployment manifests;
4. Git history and tags;
5. documentation.

Status meanings:

| Status | Meaning |
| --- | --- |
| Implemented | The working vertical exists in current code. Publicly deployed behavior may still need verification. |
| Partially implemented | Material pieces exist, but the end-to-end product path is incomplete, substituted by demo data, or has a known functional gap. |
| Frontend-only | Present in browser code, but without a corresponding durable backend workflow. |
| Backend-only | API/service behavior exists, but no reachable current product UI completes it. |
| Database-only | Persistence exists without a complete service/UI workflow. |
| Documentation-only | Described as current capability only in documentation. |
| Planned only | Explicit future work with no current implementation. |

Repository state during audit:

- branch: `main`;
- HEAD: `f943c41`;
- tags: `alpha-v1.0`, `v0.6-wallet-investor`;
- working tree: clean before report creation;
- commits in history: 163;
- GitHub Actions workflows: none.

## 2. Executive conclusion

AgriPartners Alpha v1 is a substantial, test-backed Testnet demo application. It contains real Express/PostgreSQL workflows, wallet-signature authentication, role-scoped APIs, a Rust NEAR contract, contract-call services, and investor/farmer/admin browser experiences.

It is not a production investment platform. The current frontend deliberately forces static pilot datasets for the investor, farmer, and admin portal summaries. Marketplace data is entirely static. ROI return records and farmer reports are off-chain PostgreSQL records. Public contract evidence is not canonical, contract tests are not currently reproducible on Windows, and the deployment documents do not match the latest Render/Vercel topology.

The most accurate release description is: **Alpha v1 public-demo candidate with implemented backend workflows and a demo-first frontend; not Beta-ready and not Mainnet-ready.**

## 3. Product module audit

| Module | Classification | Repository-based finding |
| --- | --- | --- |
| Wallet auth / NEP-413 | Implemented, needs production verification | Challenge, NEP-413 serialization/signature verification, nonce expiry/reuse protection, FullAccess key RPC check, JWT issuance, MyNearWallet redirect, callback handling, and tests exist. Nonces are process-local; recipient/message/network are hardcoded; production logs include sensitive signature diagnostics. |
| Investor Portal | Partially implemented | Wallet-scoped APIs, ownership checks, profile editing, deal details, reports, cycles, returns, balances, events, and withdraw endpoint exist. However, `INVESTOR_DEMO_DATASET_ENABLED = true` replaces API deal data with two static pilots in the main dashboard. |
| Marketplace | Frontend-only | Filterable marketplace and detail links exist, but the source is the static `INVESTOR_DEMO_PILOTS` array. There is no marketplace/catalog API, application workflow, or public unauthenticated route. |
| Farmer Portal | Partially implemented | Real wallet-owned deal APIs, funding confirmation, reports, cycle views, and withdraw endpoint exist. The main frontend replaces fetched deals with static demo pilots because `FARMER_DEMO_DATASET_ENABLED = true`. |
| Admin Dashboard | Partially implemented | Admin authorization and lifecycle APIs are implemented. A real create-deal screen exists at `#admin/create`, but the main admin portal and dashboard use static demo data because `ADMIN_DEMO_DATASET_ENABLED = true`. |
| Onboarding / Profiles | Implemented, needs production verification | Wallet onboarding creates immutable farmer/investor roles in `user_profiles`; profile edits are validated. A separate investor profile model also exists, creating overlapping profile stores. |
| Farmer Reports | Implemented off-chain | Farmer-owned report submission, one-report-per-cycle constraint, API reads, UI rendering, and tests exist. Reports and evidence URLs are PostgreSQL data, not contract state or independently verified evidence. |
| Cycle Tracking | Partially implemented | Contract status/current cycle and PostgreSQL events, confirmations, and reports are combined into cycle DTOs. `cycle_duration_days` is stored but not enforced on-chain or by backend scheduling. |
| Funding Progress | Partially implemented | UI progress components and contract status/balance reads exist. There is no independent funding ledger, partial/multi-investor funding, or authoritative percentage calculation for general deals; demo pilots use fixed values. |
| ROI & Returns | Partially implemented | Projected ROI field, return ledger, summaries, expected/returned/outstanding calculations, status, admin entry, investor views, and tests exist. Return entries are manually recorded off-chain and do not execute or reconcile a contract transfer. |
| Investor Portfolio Dashboard | Partially implemented | Rich browser-side portfolio metrics, health, recent activity, ROI, reporting, risk, active/completed sections, and tests exist. Current dashboard inputs are forced static pilot data rather than the authenticated investor's API portfolio. |
| Withdraw flows | Partially implemented | Contract withdrawal and admin/investor/farmer endpoints exist. Browser calls backend signers rather than submitting a wallet transaction. `withdrawContractAs(accountId, ...)` ignores `accountId` and always signs as admin; delegated investor withdrawal can work when admin is configured as `investor_withdraw_signer`, but farmer withdrawal will fail unless that signer is also an authorized contract party. |
| Smart contract integration | Implemented in code; evidence incomplete | Backend can deploy, fund, start/report cycles, read state, and withdraw. Source and tests exist. No canonical deployed contract registry, transaction set, explorer evidence, or current Linux CI result is committed. |
| Public deployment | Partially implemented | Render and Vercel manifests, production API URL, health endpoint, Neon-compatible PostgreSQL, and production CORS origin exist. The repository contains no deployment smoke-test evidence for the current URLs, and documentation remains stale. |
| Demo data | Implemented, frontend-first | Two polished static pilots drive all three portal dashboards and Marketplace. Database seed creates only an admin user; it does not seed the pilot portfolio. Demo contract addresses are explicitly noncanonical placeholders. |
| Launch documentation | Implemented, overlapping | Launch kit, demo packs, pitch materials, investor assets, screenshots, and bilingual material exist. Several claims and links are stale or stronger than repository-verifiable evidence. |
| Developer review documentation | Implemented, partly stale | A structured review kit and evidence packet exist and correctly identify many limitations. Counts, deployment URLs, CORS status, frontend architecture, and baseline commit predate the latest changes. |

## 4. Backend audit

### 4.1 Application structure

The backend is Express 4 with PostgreSQL (`pg`), Jest/Supertest, `near-api-js`, bcrypt, JWT, CORS, and startup migrations. `server.js` applies migrations before listening. Seed runs when `RUN_SEED=true` or outside production.

### 4.2 Route inventory

| Base path | Endpoints | Access |
| --- | --- | --- |
| `/health` | `GET /health` | Public; reports process metadata but does not test database or RPC health. |
| `/api/wallet-auth` | `POST /challenge`, `POST /verify` | Public. |
| `/api/auth` | `POST /login`; `POST /register` | Login public; registration requires legacy admin JWT. |
| `/api/deals` | list, detail, status, balances, events | Public, including database deal records and NEAR state reads. |
| `/api/profile` | `GET /me`, `POST /onboarding`, `PUT /me` | Wallet JWT. |
| `/api/investor` | identity, profile, owned deals, status, balances, events, cycles, reports, returns, withdraw | Wallet JWT plus investor ownership for deal routes. |
| `/api/farmer` | owned deals/details/cycles, withdraw, funding confirmation, report submission | Wallet JWT plus farmer ownership. |
| `/api/admin` | profile lists, deploy/create deal, cycle operations, return ledger, funding, withdrawals | Legacy admin JWT or allowlisted Testnet wallet JWT. |
| `/api/me` | `GET /deals` | Legacy JWT; deal filtering depends on JWT role and `near_account`. |

Admin endpoint details:

- `GET /farmers`, `GET /investors`;
- `POST /deals`;
- `POST /deals/:id/start-cycle`, `/report-cycle`, `/fund`, `/withdraw`;
- `GET /deals/:id/cycles`, `/return-summary`, `/returns`;
- `POST /deals/:id/returns`;
- non-production-only `POST /fund-as`, `/withdraw-as`.

### 4.3 Services

| Service | Responsibility |
| --- | --- |
| `walletAuthService` | In-memory challenge store, NEP-413 serialization, Ed25519 verification, FullAccess key RPC check, JWT. |
| `dealService` | Deal/event queries, ownership queries, cycle aggregation, reports, returns, ROI summary. |
| `nearService` | Contract deployment, view calls, fund/start/report/withdraw transactions. |
| `profileService` | Wallet onboarding profile validation and persistence. |
| `investorProfileService` | Separate investor metadata and risk-profile persistence. |
| `userService` | Legacy username/password users. |
| `near/client` | In-memory key store and configured backend signers. |

### 4.4 Authentication and roles

Two authentication models coexist:

1. legacy username/password users receive a JWT with role and optional `near_account`;
2. NEP-413 wallet users receive a one-day JWT with `type=wallet-auth-poc`, Testnet account, and public key.

`requireWalletAuth` validates wallet-token type and Testnet network, but does not itself load profile role. Farmer/investor authorization is primarily wallet-account ownership against `deals.farmer` or `deals.investor`. Admin access accepts a legacy `role=admin` JWT or a wallet token whose account is in `ADMIN_WALLET_ALLOWLIST`. The local `farab.testnet` fallback is intentionally disabled in production.

### 4.5 Deployment readiness and known backend issues

- Production startup requires `API_KEY`, `NEAR_ADMIN_ACCOUNT`, `NEAR_ADMIN_PRIVATE_KEY`, and `JWT_SECRET` even though the API-key middleware is not mounted.
- `DATABASE_URL` is operationally required for migrations and persistence but is not checked by `/health`.
- Wallet nonce state is process memory: restart, multiple instances, and horizontal scaling invalidate or split challenges.
- Wallet verification emits raw callback values, decoded signatures, payload bytes, and token prefixes to logs.
- No rate limiter, Helmet policy, explicit operational monitoring, or request correlation IDs exist.
- Public `/api/deals` endpoints expose complete deal records and event history without an explicit public projection.
- Contract deployment and PostgreSQL insert/event writes are not atomic; partial failures can leave an unindexed contract or incomplete event history.
- Admin deal creation does not accept `projected_roi_pct`; the database default of 20% is used.
- Return records are manual accounting records with no transaction hash or reconciliation field.
- `withdrawContractAs` always uses the admin account, regardless of requested account.
- `getAccountFromConfiguredCredentials` supports several signer variables, while `.env.example` and `render.yaml` use only a subset and include duplicate legacy/future variable names.
- `render.yaml` contains a plaintext demo `API_KEY`; the key is currently unused but should not be treated as a secret.

## 5. Frontend audit

### 5.1 Architecture and routes

The frontend is a Vite-built, framework-free single-page application. It uses hash routing and one large `app.js`. Tailwind and Chart.js are loaded from CDNs.

| Route | View | Navigation status |
| --- | --- | --- |
| `#login` | Login and NEAR wallet entry | Public entry. |
| `#/onboarding`, `#onboarding` | Role/profile onboarding | Redirected after first wallet login. |
| `#investor` | Investor dashboard | Visible navigation. |
| `#/marketplace`, `#marketplace` | Marketplace | Visible navigation; authenticated only. |
| `#investor/deals/:id` | Real investor-owned deal | Detail route; not normally reached while demo dataset is forced. |
| `#/investor/pilots/:key` | Static investor pilot detail | Used by Marketplace/demo dashboard. |
| `#farmer` | Farmer dashboard | Visible navigation. |
| `#farmer/deals/:id` | Real farmer-owned detail | Detail route; not normally reached while demo dataset is forced. |
| `#farmer/pilots/:key` | Static farmer pilot detail | Used by demo dashboard. |
| `#admin` | Admin portal | Visible only to admin; currently static demo overview. |
| `#admin/create` | Real profile-backed deal deployment form | Hidden/detail route reachable by direct link and demo dashboard button. |
| `#deals` | Legacy/admin dashboard | Fallback route; static demo dashboard for admins. |
| `#deals/:id` | Real admin deal lifecycle | Detail route. |
| `#deals/pilots/:key` | Static admin pilot detail | Demo route. |

### 5.2 API integration and authentication

- Production API is hardcoded to `https://agripartners-zlp2.onrender.com` in both frontend entry scripts.
- `frontend/.env.example` advertises `VITE_API_BASE_URL`, but current code does not consume it.
- NEP-413 login redirects directly to `https://testnet.mynearwallet.com/sign-message` and verifies callback parameters through the backend.
- JWT state is duplicated into both `localStorage` and `sessionStorage`.
- The callback URL uses the current origin/path, suitable for the Vercel origin if wallet and CORS behavior are verified.
- Legacy username/password login code remains in the main application alongside wallet auth.

### 5.3 Visible product behavior

The frontend contains real API integrations for profiles, deal deployment, lifecycle actions, owned deal details, reports, returns, and withdrawals. Nevertheless, these constants are all `true`:

- `INVESTOR_DEMO_DATASET_ENABLED`;
- `FARMER_DEMO_DATASET_ENABLED`;
- `ADMIN_DEMO_DATASET_ENABLED`.

Consequences:

- authenticated investor API deals are fetched and then discarded in favor of Fidlot/Hissar demo records;
- authenticated farmer API deals are fetched and then replaced;
- the main admin dashboard is static;
- Marketplace is always static;
- displayed USD totals, ROI, APR, reports, returns, addresses, and statuses may be presentation data rather than database/chain state.

### 5.4 Known frontend issues

- No browser E2E tests or DOM component tests exist; frontend tests inspect source strings/helpers.
- No user-visible global Alpha/Testnet/unaudited disclaimer is consistently enforced by code.
- Tailwind CDN and Chart.js CDN are runtime dependencies and introduce CSP/offline/version-control risk.
- The application is a 4,000+ line single file with duplicated real/demo rendering paths.
- Hash routes are guarded client-side, but backend enforcement is the actual security boundary.
- Static demo addresses use values such as `*.near-testnet-demo`, which are not canonical contracts.
- The separate wallet-auth POC entry is still shipped in production output.
- No configurable API base remains after the latest auth migration.

## 6. Database audit

### 6.1 Runtime model

Runtime persistence is PostgreSQL through `pg`. Ordered migrations are tracked in a runtime-created `_migrations` table and applied transactionally one file at a time.

The migrations, not `schema.sql`, are the source of truth. `schema.sql` uses SQLite-style `INTEGER PRIMARY KEY AUTOINCREMENT`, omits `users` and `_migrations`, and uses different timestamp definitions. It is stale/incompatible as a PostgreSQL bootstrap schema.

### 6.2 Tables and dependencies

| Table | Important fields | Dependent features |
| --- | --- | --- |
| `_migrations` | `filename`, `run_at` | Migration idempotency. Created by runtime, not a numbered migration. |
| `deals` | contract address, parties, amount, splits, escrow/performance fee, cycles, capital return, title/description, projected ROI | All portals, contract mapping, funding, lifecycle, ROI. |
| `events` | deal, event type, cycle, profit/loss, transaction hash, timestamp | Activity history and off-chain lifecycle index. |
| `users` | username/email/password hash/role/NEAR account | Legacy login and admin seeding. |
| `investor_profiles` | account, display/country/type/risk, KYC status | Investor profile panel. KYC status is stored but no KYC workflow exists. |
| `farmer_cycle_updates` | cycle, funding confirmation, denormalized report fields | Cycle status and backward-compatible farmer reporting state. |
| `user_profiles` | wallet account, immutable role, contact/organization/bio | Wallet onboarding and general profiles. |
| `reports` | deal/cycle/farmer/title/body/amount/evidence URL | Farmer reports and investor visibility. |
| `deal_returns` | deal, NEAR amount, note, timestamp | Manual returns ledger and ROI summaries. |

### 6.3 Migration history

| Migration | Effect |
| --- | --- |
| `001_initial` | `deals`, `events`. |
| `002_users` | Legacy users. |
| `003_reset_admin` | Intentionally empty after removal of destructive behavior. |
| `004_investor_profiles` | Investor metadata. |
| `005_farmer_cycle_updates` | Funding/report cycle state. |
| `006_user_onboarding_profiles` | Wallet profiles plus data backfill. |
| `007_farmer_reports` | Dedicated reports plus backfill from cycle updates. |
| `008_deal_admin_metadata` | Deal title and description. |
| `009_deal_returns` | Manual return records. |
| `010_projected_roi_pct` | Projected ROI field, default 20%. |

### 6.4 Database limitations

- Two profile tables overlap for investors and can diverge.
- Report data is duplicated between `reports` and `farmer_cycle_updates`.
- Amounts and yoctoNEAR values are stored as text; interpretation depends on application code.
- Return rows have no currency, chain transaction, actor, approval, or reconciliation fields.
- No migration-level indexes exist for common foreign-key/order queries beyond primary/unique constraints.
- No backup/restore automation or evidence is committed.
- Seed creates only a legacy admin user, not reproducible pilot deals.

## 7. Smart contract audit

### 7.1 Implemented methods

| Method | Behavior |
| --- | --- |
| `new` | Initializes one farmer, one investor, delegated investor withdraw signer, admin/platform, fixed economics and cycle count. |
| `fund` | Requires exact investment deposit from the configured investor. |
| `start_cycle` | Admin-only transition from Funded/Settlement to active cycle. |
| `report_cycle` | Admin attaches profit and reports losses; distributes farmer/investor/platform/escrow accounting and completes/terminates. |
| `withdraw` | Farmer, investor/delegated signer, or platform withdraws its available balance to the configured recipient. |
| `get_status` | Returns lifecycle status and cycle number. |
| `get_balances` | Returns farmer/investor/platform/escrow accounting balances. |
| `get_params` | Returns immutable deal parameters. |

### 7.2 Deployment and evidence status

- The backend contains per-deal subaccount deployment code and a committed WASM at `backend/contract/agripartners.wasm`.
- Scripts and docs refer to Testnet accounts, but no canonical contract ID, deploy hash, lifecycle transactions, explorer links, or WASM checksum tied to `f943c41` are committed.
- Repository claims of “deployed on Testnet” are therefore documented claims, not independently reproducible current evidence.
- Mainnet is not implemented or claimed as ready.

### 7.3 Test coverage

- 22 unit tests are declared in `contract/src/lib.rs`.
- 4 near-workspaces sandbox tests are declared in `contract/tests/integration.rs`.
- Coverage includes initialization, funding authorization/amount, cycle transitions, distributions, losses, completion/termination, withdrawals, delegated investor withdrawal, and views.
- On this Windows audit host, `cargo test` failed during dependency compilation because `near-vm-runner 0.28.0` imports Unix-only `rustix::fs`; zero Rust tests executed.
- No Linux CI workflow or passing CI artifact exists in the repository.

### 7.4 Current limitations and off-chain boundaries

- One investor and one farmer per deployed contract; no pooled/multi-investor model.
- No contract upgrade, pause, emergency stop, dispute, governance, or oracle/attestation mechanism.
- Cycle duration is metadata only; no time enforcement.
- Farmer reports, evidence, return ledger, profiles, KYC metadata, and portfolio analytics remain off-chain.
- Events are PostgreSQL rows, not NEP-297 contract events.
- Profit/loss is admin-reported; real-world performance is not independently verified.
- Transfer failure has no callback/recovery path after internal balance is set to zero.
- The newly generated contract-account key is not persisted, leaving no documented upgrade/recovery authority for that account.
- Backend-held keys and delegated signing are centralized trust points.

## 8. Tests audit

### 8.1 Results reproduced during this audit

| Check | Result |
| --- | --- |
| Backend `npm test` | 21/21 suites passed; 231/231 tests passed; 0 snapshots. |
| Frontend `npm run build` | Passed with Vite 8.0.16; 9 modules; both HTML entries generated. |
| Contract `cargo test` | Failed to compile on Windows; zero tests executed. |

### 8.2 Test composition

- 21 Jest files cover routes, services, auth, ownership, CORS, database calls, NEAR call construction, and frontend source behavior.
- 5 frontend-oriented Jest files contain 52 tests. They read `app.js` and assert strings or helper behavior; they do not launch a browser.
- NEAR backend tests mock accounts/RPC and validate call construction, not live Testnet transactions.
- Database tests mock the pool; there is no committed PostgreSQL integration test against migrated Neon/Postgres.
- No deployment smoke test, browser E2E suite, accessibility test, visual regression suite, load test, or security test exists.
- No GitHub Actions workflow runs the suites on Linux.

The root README test counts (`38` backend, `21` contract) are stale.

## 9. Deployment audit

### 9.1 Current repository topology

| Component | Repository evidence | Audit status |
| --- | --- | --- |
| Backend | `render.yaml`, root `backend`, health path `/health` | Configured for Render. Current code URL: `https://agripartners-zlp2.onrender.com`. Needs production smoke verification. |
| Frontend | `frontend/vercel.json`, Vite build | Configured for Vercel. CORS identifies `https://frontend-omega-woad-90.vercel.app`. Needs end-to-end verification. |
| Database | `DATABASE_URL`, PostgreSQL migrations | Compatible with Neon PostgreSQL. No Neon-specific manifest, backup, restore, or production migration evidence. |
| NEAR | Testnet RPC/signers and per-deal deployment | Code integration present; public evidence incomplete. |

The root README still links to `https://agripartners.vercel.app` and `https://agripartners.onrender.com`. Deployment plans still describe Railway and pre-fix CORS/API blockers. These are not current source-of-truth URLs.

### 9.2 Environment variables

Actively consumed or operationally relevant:

- core: `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`;
- CORS: `CORS_ORIGIN` (additive to built-in local/current Vercel origins);
- legacy admin: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RUN_SEED`;
- wallet admin: `ADMIN_WALLET_ALLOWLIST`;
- NEAR: `NEAR_NETWORK`, `NEAR_RPC_URL`, optional `FASTNEAR_API_KEY`, `NEAR_ADMIN_ACCOUNT`, `NEAR_ADMIN_PRIVATE_KEY`, `WASM_PATH`;
- configured signers: `NEAR_FARMER_SIGNER_*`, `NEAR_INVESTOR_SIGNER_*`, `NEAR_PLATFORM_SIGNER_*`;
- required but currently unused for route protection: `API_KEY`.

`.env.example` also lists names such as `NEAR_NETWORK_ID`, `NEAR_NODE_URL`, and `NEAR_CONTRACT_ID` that current runtime code does not consume.

### 9.3 CORS and public behavior

- Allowed built-ins: `http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:5173`, and the current Vercel origin.
- Additional `CORS_ORIGIN` values extend rather than replace the built-ins.
- Preflight for `/api/wallet-auth/challenge` is covered by a passing test.
- Credentials are not enabled in CORS and the current app uses bearer tokens, not cookies.
- Public deployment was not probed during this repository-only audit; status is “implemented/configured, needs production verification.”

### 9.4 Deployment blockers and risks

- Current Vercel/Render/Neon behavior is not represented by a committed smoke-test artifact.
- `render.yaml` does not configure `ADMIN_WALLET_ALLOWLIST`, so production wallet-admin access depends on an out-of-band variable.
- Health does not verify database, migration, RPC, or signer readiness.
- Frontend API URL is hardcoded; preview/staging deployments cannot select another backend without a code change.
- No CI/CD gates, migration backup gate, rollback automation, monitoring, or alerting are committed.
- Render free-tier cold starts can affect login/demo timing.
- Contract deployment requires backend custody of a funded Testnet private key.

## 10. Documentation audit

The `docs` tree contains 268 files. Major sets include:

| Set | Status and observations |
| --- | --- |
| Launch docs | `LAUNCH_KIT.md` and RU counterpart provide useful navigation; some links/status claims need URL and evidence updates. |
| Pitch deck | Bilingual slide markdown, HTML, and PPTX assets exist. Financial/pilot claims must remain clearly marked as demo/projection. |
| Investor pack/package | Briefs, decks, one-pagers, scripts, screenshot plans, and readiness reviews exist; there is extensive duplication across versions. |
| Developer review kit | Strong architecture/API/evidence structure; currently stale on commit, test count, frontend dependencies, CORS, and public URLs. |
| Deployment docs | Detailed but planning-only and Railway-oriented; they no longer describe the actual Render/Vercel code configuration. |
| Outreach docs | NEAR maps, messages, target tracking, and bilingual collateral exist; they are operational content, not implementation evidence. |
| Product roadmap | Useful historical design/audit record, but filenames such as “final audit” must not be treated as current status without source verification. |
| Screenshots/demo assets | Broad coverage exists; some filenames are duplicated (`.png.png`) and screenshots may represent static demo state rather than live data. |

Primary overlap clusters:

- `demo-readiness`, `presentation-readiness`, and `investor-package` repeat demo scripts, flows, metrics, and pilot summaries;
- `near-ecosystem`, `near-execution`, `near-outreach`, `near-outreach-toolkit`, and `outreach` repeat ecosystem positioning and contact material;
- `pitch-deck`, `investor-pack`, and `investor-package` repeat product and investment narratives;
- root portal docs, product-roadmap audits, and developer-review docs repeat feature status with different evidence dates.

Documentation-only or planned-only capabilities include Mainnet launch, audited contracts, production KYC/AML, real-world attestation/oracles, pooled investors, stable-value settlement, governance/disputes, production incident recovery, and a canonical public chain evidence registry.

## 11. Feature matrix

Legend: I = implemented, P = partial, F = frontend-only, B = backend-only, D = database-only, — = absent/not applicable.

| Feature | Status | Backend | Frontend | DB | Contract | Tests | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NEP-413 wallet auth | Implemented; verify production | I | I | — | — | I | In-memory nonce, hardcoded Testnet recipient, verbose sensitive logs. |
| Legacy password auth | Implemented | I | I | I | — | I | Parallel auth model remains enabled. |
| Wallet onboarding | Implemented; verify production | I | I | I | — | I | Farmer/investor only; role immutable. |
| Investor profile | Implemented | I | I | I | — | I | Separate from general `user_profiles`. |
| Investor Portal | Partially implemented | I | P | I | P | I | Main dashboard replaces API deals with static pilots. |
| Marketplace | Frontend-only | — | F | — | — | P | Static authenticated catalog. |
| Farmer Portal | Partially implemented | I | P | I | P | I | Main dashboard replaces API deals with static pilots. |
| Admin Dashboard | Partially implemented | I | P | I | I | I | Real actions/details exist; main dashboard is static. |
| Deal creation/deployment | Implemented; verify Testnet | I | I | I | I | I | Nonatomic chain/DB operation; hidden under demo-first admin UI. |
| Farmer reports | Implemented off-chain | I | I | I | — | I | URL evidence is not verified. |
| Cycle tracking | Partially implemented | I | I | I | I | I | Hybrid state; no duration enforcement. |
| Funding progress | Partially implemented | P | I | P | P | P | No funding ledger or partial/multi-investor funding. |
| ROI & returns | Partially implemented | I | I | I | P | I | Manual off-chain returns; no transfer reconciliation. |
| Portfolio analytics | Partially implemented | P | I | P | — | P | Browser calculations over forced demo data. |
| Investor withdraw | Partially implemented | I | I | event only | I | I | Delegated backend signer; not browser wallet signed. |
| Farmer withdraw | Partially implemented / known signer defect | I | I | event only | I | I | Backend always signs as admin, which is normally unauthorized for farmer balance. |
| Platform withdraw | Implemented; verify Testnet | I | I | event only | I | I | Admin/platform are configured as same account in deployment path. |
| Event history | Implemented off-chain index | I | I | I | — | I | Not NEP-297; optional transaction hash. |
| Public deals API | Implemented | I | I | I | reads | I | Publicly exposes full rows/events. |
| Demo pilot portfolio | Frontend-only | — | F | — | — | P | Forced across all main dashboards. |
| Render deployment | Configured; verify production | I | — | P | P | P | Health test is local; no deployment smoke artifact. |
| Vercel deployment | Configured; verify production | — | I | — | — | build only | Current origin is in CORS. |
| Neon PostgreSQL | Configured generically; verify production | I | — | I | — | P | No live migration/backup test. |
| Mainnet | Planned only | — | — | — | — | — | Requires security/legal/operational readiness. |

## 12. Release readiness

| Target | Assessment | Rationale |
| --- | --- | --- |
| Alpha v1 readiness | Ready as tagged repository snapshot, with caveats | Core code, migrations, backend tests, Vite build, demo assets, and tag exist. Contract test and public evidence caveats must accompany the tag. |
| Public demo readiness | Conditional | Suitable for a guided demo using static pilots after production wallet/CORS smoke verification. Do not present demo figures or addresses as live chain/database truth. |
| NEAR DevHub review readiness | Not yet ready for strong technical review | Source is reviewable, but needs Linux contract CI, canonical Testnet lifecycle evidence, current architecture/deployment docs, and clearer off-chain boundaries. |
| Investor demo readiness | Ready for a controlled presentation | Polished dashboards, narrative, pilots, and deck exist. Presenter must label projections/demo data and avoid claims of production finance, signed capital, or verified returns without evidence. |
| Beta v1 readiness | Not ready | Requires live-data portal paths, signer/withdraw correction, production security controls, observable deployment, data-model cleanup, contract CI/evidence, and operational/legal gates. |

## 13. Top risks

1. **Demo/live ambiguity:** static pilots override authenticated API portfolios in all main portal dashboards.
2. **Centralized and flawed transaction signing:** backend custody is required, and farmer withdrawal uses an admin signer that is normally unauthorized for farmer funds.
3. **Security/scale gaps in wallet auth:** process-local nonces and raw signature/payload logging are unsuitable for scaled public operation.
4. **Unreproducible chain evidence:** no current Linux CI result or canonical Testnet contract/transaction registry is committed.
5. **Configuration/documentation drift:** current Render/Vercel URLs and hardcoded API behavior conflict with README, environment examples, and Railway-focused deployment docs.

## 14. Top five recommended actions

1. **Add an explicit demo/live mode and make live mode use API data end to end.** Label demo records in the UI and prevent demo constants from silently replacing authenticated portfolio data.
2. **Correct and redesign withdrawal signing.** Use the intended configured signer per role, add transaction/reconciliation records, test real Testnet withdrawals, and document custody boundaries.
3. **Establish Linux CI and canonical Testnet evidence.** Run backend/build/contract suites, pin Rust/toolchain, publish contract ID, source/WASM checksum, and one explorer-linked lifecycle.
4. **Harden public authentication and operations.** Persist nonce state, redact logs, add rate limits/security headers/monitoring, make health dependency-aware, and review legacy auth/API-key requirements.
5. **Reconcile deployment and documentation.** Make API base configurable, update Render/Vercel/Neon instructions and URLs, refresh test counts and review kit, and archive or clearly label superseded documents.

## 15. Final audit statement

AgriPartners Alpha v1 has real implementation depth and is more than a documentation prototype. Its strongest verified layer is the Express/PostgreSQL application behavior: 231 Jest tests pass and the frontend builds. Its weakest evidence layer is production/on-chain verification: the current UI is demo-first, contract tests did not execute on the audit host, and canonical Testnet evidence is absent. The next release should focus on removing ambiguity between demonstration and live data rather than adding more dashboard surface area.
