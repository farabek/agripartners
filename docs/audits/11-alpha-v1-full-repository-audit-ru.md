# Полный аудит репозитория AgriPartners Alpha v1

Дата аудита: 2026-06-21  
Базовая версия: `f943c41` (`main`, тег `alpha-v1.0`)  
Область: backend, frontend, PostgreSQL schema/migrations, NEAR smart contract, тесты, deployment configuration, документация и Git history.

## 1. Методика и статусы

Отчёт составлен по текущему репозиторию. Названия roadmap, старые планы и предыдущие заявления не принимались как доказательство реализации без подтверждения текущим кодом, миграциями, тестами или deployment-конфигурацией.

Приоритет доказательств:

1. текущий код и миграции;
2. текущие тесты и результаты сборки;
3. deployment manifests;
4. Git history и теги;
5. документация.

| Статус | Значение |
| --- | --- |
| Implemented | Рабочая вертикаль существует в текущем коде. Публичное поведение может требовать отдельной проверки. |
| Partially implemented | Существенные части есть, но end-to-end путь неполон, заменён demo data или содержит известный дефект. |
| Frontend-only | Есть в browser code без соответствующего устойчивого backend workflow. |
| Backend-only | API/service реализован, но актуальный UI-путь отсутствует. |
| Database-only | Persistence есть без полного service/UI workflow. |
| Documentation-only | Возможность заявлена только в документации. |
| Planned only | Это будущая работа без текущей реализации. |

Состояние репозитория во время аудита:

- branch: `main`;
- HEAD: `f943c41`;
- tags: `alpha-v1.0`, `v0.6-wallet-investor`;
- до создания отчётов working tree был чистым;
- Git history содержит 163 commit;
- GitHub Actions workflows отсутствуют.

## 2. Итоговый вывод

AgriPartners Alpha v1 — содержательное Testnet demo-приложение с тестируемыми Express/PostgreSQL workflow, wallet-signature authentication, role-scoped API, Rust-контрактом NEAR, backend-интеграцией с контрактом и investor/farmer/admin интерфейсами.

Это не production investment platform. Текущий frontend намеренно подменяет API-сделки статическими pilot datasets во всех трёх основных portal dashboard. Marketplace полностью статический. ROI returns и farmer reports хранятся off-chain в PostgreSQL. Канонические contract ID/transactions отсутствуют, Rust tests не воспроизводятся в текущей Windows-среде, а deployment-документация не соответствует последней Render/Vercel topology.

Наиболее точное описание релиза: **Alpha v1 public-demo candidate с реализованными backend workflow и demo-first frontend; не готов к Beta и Mainnet.**

## 3. Аудит product modules

| Модуль | Классификация | Вывод по репозиторию |
| --- | --- | --- |
| Wallet auth / NEP-413 | Implemented, нужна production verification | Есть challenge, NEP-413 serialization/signature verification, TTL и защита от повторного nonce, RPC-проверка FullAccess key, JWT, MyNearWallet redirect, callback и тесты. Nonce хранится в памяти процесса; recipient/message/network hardcoded; production logs содержат подробности signature. |
| Investor Portal | Partially implemented | Есть wallet-scoped API, ownership, profile, deal details, reports, cycles, returns, balances, events и withdraw. Но `INVESTOR_DEMO_DATASET_ENABLED = true` заменяет реальные API deals двумя static pilots. |
| Marketplace | Frontend-only | Есть filters/cards/details, но данные берутся из `INVESTOR_DEMO_PILOTS`. Нет catalog API, application/invest workflow и публичного unauthenticated route. |
| Farmer Portal | Partially implemented | Реальные wallet-owned APIs, funding confirmation, reports, cycles и withdraw существуют. Main frontend заменяет fetched deals статическими pilots из-за `FARMER_DEMO_DATASET_ENABLED = true`. |
| Admin Dashboard | Partially implemented | Admin auth и lifecycle API реализованы. Реальный create-deal screen доступен по `#admin/create`, но главные admin portal/dashboard используют static demo data из-за `ADMIN_DEMO_DATASET_ENABLED = true`. |
| Onboarding / Profiles | Implemented, нужна production verification | Wallet onboarding создаёт farmer/investor profile с immutable role; update validation есть. Отдельная таблица investor profile создаёт два пересекающихся profile store. |
| Farmer Reports | Implemented off-chain | Реализованы farmer ownership, one-report-per-cycle, API reads, UI и тесты. Reports/evidence URL — PostgreSQL records, не contract state и не проверенная внешняя evidence. |
| Cycle Tracking | Partially implemented | Contract status/current cycle объединяются с PostgreSQL events, confirmations и reports. `cycle_duration_days` хранится, но не обеспечивает timing enforcement. |
| Funding Progress | Partially implemented | Есть UI progress и contract status/balance reads. Нет отдельного funding ledger, partial/multi-investor funding и универсального authoritative progress calculation; demo использует fixed values. |
| ROI & Returns | Partially implemented | Есть projected ROI, return ledger, expected/returned/outstanding calculation, statuses, admin entry, investor UI и tests. Return entry off-chain и не выполняет/не сверяет smart-contract transfer. |
| Investor Portfolio Dashboard | Partially implemented | Есть rich browser analytics: metrics, health, activity, ROI, risk, active/completed views. Но dashboard получает forced static pilot dataset вместо API portfolio пользователя. |
| Withdraw flows | Partially implemented | Есть contract method и admin/investor/farmer endpoints. Browser вызывает backend signer, а не wallet transaction. `withdrawContractAs(accountId, ...)` игнорирует `accountId` и всегда подписывает admin; delegated investor flow может работать, farmer flow обычно не имеет подходящего signer. |
| Smart contract integration | Implemented in code; evidence incomplete | Backend умеет deploy/fund/start/report/read/withdraw. Нет canonical contract registry, transaction set, explorer evidence и current Linux CI result. |
| Public deployment | Partially implemented | Есть Render/Vercel manifests, production API URL, health, Neon-compatible PostgreSQL и CORS origin. Нет committed smoke evidence для текущих URL; docs устарели. |
| Demo data | Implemented, frontend-first | Два static pilots управляют Marketplace и dashboard всех ролей. DB seed создаёт только admin user. Demo contract addresses — явные noncanonical placeholders. |
| Launch documentation | Implemented, overlapping | Есть launch kit, demo packs, pitch/investor materials, screenshots и EN/RU versions. Часть claims/links устарела или сильнее доступной evidence. |
| Developer review documentation | Implemented, partly stale | Review kit структурирован и честно отмечает многие gaps. Commit baseline, test counts, frontend dependencies, CORS и public URLs уже неактуальны. |

## 4. Backend audit

### 4.1 Архитектура

Backend использует Express 4, PostgreSQL (`pg`), Jest/Supertest, `near-api-js`, bcrypt, JWT и CORS. `server.js` запускает миграции до открытия порта. Seed выполняется при `RUN_SEED=true` либо вне production.

### 4.2 Routes

| Base path | Endpoints | Доступ |
| --- | --- | --- |
| `/health` | `GET /health` | Public; process metadata без проверки DB/RPC. |
| `/api/wallet-auth` | `POST /challenge`, `POST /verify` | Public. |
| `/api/auth` | `POST /login`, `POST /register` | Login public; register требует legacy admin JWT. |
| `/api/deals` | list/detail/status/balances/events | Public, включая DB records и NEAR reads. |
| `/api/profile` | `GET /me`, `POST /onboarding`, `PUT /me` | Wallet JWT. |
| `/api/investor` | identity/profile/owned deals/status/balances/events/cycles/reports/returns/withdraw | Wallet JWT и investor ownership. |
| `/api/farmer` | owned deals/details/cycles/withdraw/funding confirmation/report submission | Wallet JWT и farmer ownership. |
| `/api/admin` | profile lists/deploy/lifecycle/funding/returns/withdraw | Legacy admin JWT или allowlisted Testnet wallet JWT. |
| `/api/me` | `GET /deals` | Legacy JWT; filter по role и `near_account`. |

Admin API включает:

- `GET /farmers`, `GET /investors`;
- `POST /deals`;
- `POST /deals/:id/start-cycle`, `/report-cycle`, `/fund`, `/withdraw`;
- `GET /deals/:id/cycles`, `/return-summary`, `/returns`;
- `POST /deals/:id/returns`;
- только вне production: `POST /fund-as`, `/withdraw-as`.

### 4.3 Services

| Service | Ответственность |
| --- | --- |
| `walletAuthService` | In-memory challenges, NEP-413 serialization, Ed25519 verification, FullAccess RPC check, JWT. |
| `dealService` | Deals/events, ownership, cycles aggregation, reports, returns и ROI summary. |
| `nearService` | Contract deploy, views, fund/start/report/withdraw transactions. |
| `profileService` | Wallet onboarding profiles. |
| `investorProfileService` | Отдельные investor metadata/risk profiles. |
| `userService` | Legacy password users. |
| `near/client` | In-memory keystore и configured backend signers. |

### 4.4 Auth model и role checks

Параллельно работают две модели:

1. legacy username/password JWT с role и optional `near_account`;
2. NEP-413 wallet JWT на один день с `type=wallet-auth-poc`, Testnet account и public key.

`requireWalletAuth` проверяет token type/network, но не загружает profile role. Investor/farmer security основана прежде всего на совпадении wallet account с `deals.investor`/`deals.farmer`. Admin принимает legacy `role=admin` или wallet из `ADMIN_WALLET_ALLOWLIST`. Local fallback `farab.testnet` отключён в production.

### 4.5 Deployment readiness и backend issues

- Startup требует `API_KEY`, хотя API-key middleware нигде не mounted.
- `DATABASE_URL` нужен для runtime, но `/health` не проверяет DB.
- Nonces находятся в process memory и не поддерживают restart/multi-instance scaling.
- Wallet verification логирует callback values, decoded signatures, payload bytes и token prefixes.
- Нет rate limiting, Helmet policy, request correlation и operational monitoring.
- Public deal routes возвращают полные rows/events без специально ограниченного public DTO.
- Contract deploy и DB insert/events не atomic.
- Admin create не принимает `projected_roi_pct`; используется default 20%.
- Manual return records не имеют tx hash/reconciliation fields.
- `withdrawContractAs` всегда использует admin signer.
- Signer/environment variable names частично расходятся между runtime, `.env.example` и `render.yaml`.
- `render.yaml` содержит plaintext demo `API_KEY`; сейчас key не используется, но его нельзя считать secret.

## 5. Frontend audit

### 5.1 Architecture и routes

Frontend — framework-free Vite SPA с hash routing и одним большим `app.js`. Tailwind и Chart.js загружаются с CDN.

| Route | View | Видимость |
| --- | --- | --- |
| `#login` | Login и NEAR wallet | Public entry. |
| `#/onboarding`, `#onboarding` | Role/profile onboarding | Redirect после первого wallet login. |
| `#investor` | Investor dashboard | Visible navigation. |
| `#/marketplace`, `#marketplace` | Marketplace | Visible, но требует auth. |
| `#investor/deals/:id` | Real investor deal detail | Обычно не достигается из forced demo dashboard. |
| `#/investor/pilots/:key` | Static pilot detail | Используется Marketplace/demo. |
| `#farmer` | Farmer dashboard | Visible navigation. |
| `#farmer/deals/:id` | Real farmer deal detail | Обычно не достигается из forced demo dashboard. |
| `#farmer/pilots/:key` | Static farmer pilot | Demo route. |
| `#admin` | Admin portal | Только admin; сейчас static overview. |
| `#admin/create` | Real deal deployment form | Hidden/detail route, доступен напрямую/через demo dashboard. |
| `#deals` | Legacy/admin dashboard | Static для admin. |
| `#deals/:id` | Real admin lifecycle detail | Detail route. |
| `#deals/pilots/:key` | Static admin pilot | Demo route. |

### 5.2 API и auth flow

- API hardcoded как `https://agripartners-zlp2.onrender.com` в двух frontend entry scripts.
- `.env.example` обещает `VITE_API_BASE_URL`, но текущий код его не использует.
- NEP-413 flow открывает `https://testnet.mynearwallet.com/sign-message`, затем передаёт callback backend verification.
- JWT одновременно сохраняется в `localStorage` и `sessionStorage`.
- Callback URL строится из текущих origin/path.
- Legacy password login остаётся в app рядом с wallet auth.

### 5.3 Реальное visible behavior

В коде есть настоящие API integration для profiles, deal deployment, lifecycle, detail pages, reports, returns и withdrawals. Но одновременно включены:

- `INVESTOR_DEMO_DATASET_ENABLED = true`;
- `FARMER_DEMO_DATASET_ENABLED = true`;
- `ADMIN_DEMO_DATASET_ENABLED = true`.

Следовательно:

- investor API deals загружаются и затем заменяются Fidlot/Hissar;
- farmer API deals также заменяются;
- main admin dashboard статический;
- Marketplace статический;
- показанные USD, ROI, APR, reports, returns, addresses и statuses могут быть presentation data, а не DB/chain state.

### 5.4 UI issues

- Нет browser E2E, DOM/component и accessibility tests; frontend tests в основном проверяют strings/helpers.
- Нет последовательно enforced Alpha/Testnet/unaudited disclaimer.
- Tailwind/Chart.js CDN создают CSP, offline и version-control risk.
- `app.js` превышает 4,000 lines и содержит параллельные real/demo render paths.
- Static demo addresses не являются canonical contracts.
- Wallet-auth POC entry всё ещё включён в production bundle.
- Configurable API base был удалён последней auth migration.

## 6. Database audit

### 6.1 Runtime model

Runtime использует PostgreSQL и ordered migrations. `_migrations` создаётся runtime и обеспечивает idempotency; каждый migration file выполняется в transaction.

Источник истины — migrations, не `schema.sql`. `schema.sql` использует SQLite-style `AUTOINCREMENT`, не содержит `users` и `_migrations` и расходится по timestamp types. Как PostgreSQL bootstrap он устарел/несовместим.

### 6.2 Tables

| Table | Ключевые поля | Features |
| --- | --- | --- |
| `_migrations` | filename/run_at | Migration tracking. |
| `deals` | contract, parties, amount, splits, escrow/fee, cycles, capital return, metadata, projected ROI | Все portals, contract mapping, funding и ROI. |
| `events` | deal/type/cycle/profit/loss/tx hash/time | Activity history и off-chain lifecycle index. |
| `users` | username/email/password hash/role/NEAR account | Legacy auth и admin seed. |
| `investor_profiles` | account/display/country/type/risk/KYC | Investor profile. KYC workflow отсутствует. |
| `farmer_cycle_updates` | cycle/funding confirmation/duplicate report fields | Cycle state и backward compatibility. |
| `user_profiles` | wallet/role/contact/org/bio | Wallet onboarding. |
| `reports` | deal/cycle/farmer/content/amount/evidence | Farmer reporting. |
| `deal_returns` | deal/NEAR amount/note/time | Manual returns и ROI summary. |

### 6.3 Migrations

| Migration | Изменение |
| --- | --- |
| `001_initial` | `deals`, `events`. |
| `002_users` | Legacy users. |
| `003_reset_admin` | Намеренно пустой после удаления destructive behavior. |
| `004_investor_profiles` | Investor metadata. |
| `005_farmer_cycle_updates` | Cycle funding/report state. |
| `006_user_onboarding_profiles` | Wallet profiles и backfill. |
| `007_farmer_reports` | Dedicated reports и backfill. |
| `008_deal_admin_metadata` | Title/description. |
| `009_deal_returns` | Manual returns. |
| `010_projected_roi_pct` | Projected ROI default 20%. |

### 6.4 DB limitations

- Две investor profile models могут расходиться.
- Report data дублируется в двух tables.
- Financial/yocto values хранятся как text.
- Return rows не имеют currency, chain tx, actor, approval или reconciliation.
- Нет migration indexes для частых foreign-key/order queries, кроме PK/unique constraints.
- Нет committed backup/restore automation или evidence.
- Seed не создаёт воспроизводимые pilot deals.

## 7. Smart contract audit

### 7.1 Реализованные methods

| Method | Поведение |
| --- | --- |
| `new` | Один farmer/investor, delegated investor signer, admin/platform и fixed economics. |
| `fund` | Exact deposit только от configured investor. |
| `start_cycle` | Admin-only lifecycle transition. |
| `report_cycle` | Admin прикладывает profit, сообщает losses и распределяет balances. |
| `withdraw` | Farmer, investor/delegated signer или platform получает available balance. |
| `get_status` | Status и current cycle. |
| `get_balances` | Farmer/investor/platform/escrow balances. |
| `get_params` | Immutable deal params. |

### 7.2 Testnet/deployment status

- Backend содержит per-deal subaccount deployment и committed `backend/contract/agripartners.wasm`.
- Docs/scripts называют Testnet accounts, но repository не содержит canonical contract ID, deploy/lifecycle tx hashes, explorer links или checksum WASM для `f943c41`.
- Поэтому “deployed on Testnet” — documented claim, не воспроизводимая current evidence.
- Mainnet не готов.

### 7.3 Contract tests

- 22 unit tests declared в `contract/src/lib.rs`.
- 4 sandbox integration tests declared в `contract/tests/integration.rs`.
- Покрыты init, fund auth/amount, cycles, distributions, losses, completion/termination, withdrawals, delegated investor signer и views.
- На Windows `cargo test` упал при compilation: `near-vm-runner 0.28.0` импортирует Unix-only `rustix::fs`; выполнено 0 Rust tests.
- Linux CI workflow/result отсутствует.

### 7.4 Ограничения и off-chain boundary

- Один investor и farmer на contract; pooled investment отсутствует.
- Нет upgrade/pause/emergency/dispute/governance/oracle.
- Cycle timing не enforced.
- Reports, evidence, return ledger, profiles, KYC metadata и analytics off-chain.
- Events — PostgreSQL, не NEP-297.
- Profit/loss вводит admin; real-world performance не attested.
- Нет callback/recovery для failed transfer после обнуления internal balance.
- Сгенерированный contract-account key не сохраняется; upgrade/recovery authority не задокументирован.
- Backend signer custody остаётся centralized trust point.

## 8. Tests audit

### 8.1 Воспроизведённые результаты

| Проверка | Результат |
| --- | --- |
| Backend `npm test` | 21/21 suites, 231/231 tests, 0 snapshots. |
| Frontend `npm run build` | Passed, Vite 8.0.16, 9 modules, оба HTML entry. |
| Contract `cargo test` | Windows compile failure; 0 tests executed. |

### 8.2 Состав и ограничения

- 21 Jest file покрывает routes/services/auth/ownership/CORS/DB calls/NEAR call construction/frontend source behavior.
- 5 frontend-oriented files содержат 52 tests, читают `app.js` и проверяют strings/helpers; browser не запускается.
- NEAR backend tests используют mocks, а не live Testnet.
- DB tests mock pool; нет PostgreSQL integration test с реальными migrations.
- Нет deployment smoke, browser E2E, accessibility, visual regression, load или security tests.
- Нет Linux CI.
- README counts (`38` backend, `21` contract) устарели.

## 9. Deployment audit

### 9.1 Current topology

| Компонент | Repository evidence | Статус |
| --- | --- | --- |
| Backend | `render.yaml`, `/health` | Configured for Render. Current code URL: `https://agripartners-zlp2.onrender.com`. Нужен production smoke test. |
| Frontend | `frontend/vercel.json`, Vite build | Configured for Vercel. CORS origin: `https://frontend-omega-woad-90.vercel.app`. Нужна end-to-end verification. |
| Database | `DATABASE_URL`, PostgreSQL migrations | Neon-compatible. Нет Neon-specific manifest, backup/restore или production migration evidence. |
| NEAR | Testnet RPC/signers/deploy code | Integration есть, public evidence incomplete. |

README всё ещё ссылается на `https://agripartners.vercel.app` и `https://agripartners.onrender.com`; deployment plans описывают Railway. Это не текущие source-of-truth URLs.

### 9.2 Environment variables

Фактически используемые:

- core: `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`;
- CORS: `CORS_ORIGIN`;
- legacy admin: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RUN_SEED`;
- wallet admin: `ADMIN_WALLET_ALLOWLIST`;
- NEAR: `NEAR_NETWORK`, `NEAR_RPC_URL`, optional `FASTNEAR_API_KEY`, `NEAR_ADMIN_ACCOUNT`, `NEAR_ADMIN_PRIVATE_KEY`, `WASM_PATH`;
- role signers: `NEAR_FARMER_SIGNER_*`, `NEAR_INVESTOR_SIGNER_*`, `NEAR_PLATFORM_SIGNER_*`;
- required, но не mounted: `API_KEY`.

`.env.example` также содержит `NEAR_NETWORK_ID`, `NEAR_NODE_URL`, `NEAR_CONTRACT_ID` и другие names, которые runtime не читает.

### 9.3 CORS

- Built-in origins: `localhost:3000`, `localhost:5173`, `127.0.0.1:5173` и current Vercel.
- `CORS_ORIGIN` добавляет origins, не заменяет built-ins.
- OPTIONS preflight для wallet challenge покрыт passing test.
- Credentials support не включён; app использует bearer tokens, не cookies.
- Public deployment не проверялся сетью в этом repository-only audit: статус “configured, needs production verification”.

### 9.4 Deployment risks

- Нет committed smoke artifact для Render/Vercel/Neon.
- `render.yaml` не устанавливает `ADMIN_WALLET_ALLOWLIST`.
- Health не проверяет DB/migrations/RPC/signer.
- Frontend API hardcoded; preview/staging требует code change.
- Нет CI/CD gates, backup gate, rollback automation, monitoring/alerts.
- Render free-tier cold start может ломать timing demo/login.
- Contract deployment требует backend custody funded Testnet private key.

## 10. Documentation audit

В `docs` находится 268 files.

| Набор | Состояние |
| --- | --- |
| Launch docs | `LAUNCH_KIT` EN/RU — полезные indexes; URLs/status claims требуют обновления. |
| Pitch deck | EN/RU markdown, HTML и PPTX есть; financial/pilot claims должны быть marked demo/projection. |
| Investor pack/package | Briefs, decks, one-pagers, scripts и screenshot plans есть; много version duplication. |
| Developer review kit | Хорошая структура architecture/API/evidence; stale commit, counts, frontend deps, CORS и URLs. |
| Deployment docs | Детальные, но planning-only и Railway-oriented; не отражают current Render/Vercel code. |
| Outreach docs | NEAR maps/messages/tracking/EN-RU collateral; это operational content, не implementation evidence. |
| Product roadmap | Полезная история решений; “final audit” filenames не означают current truth. |
| Screenshots/demo assets | Широкое покрытие, но часть `.png.png`, и screenshots могут отражать static demo state. |

Главные overlaps:

- `demo-readiness`, `presentation-readiness`, `investor-package` повторяют scripts/flows/metrics/pilots;
- `near-ecosystem`, `near-execution`, `near-outreach`, `near-outreach-toolkit`, `outreach` повторяют ecosystem content;
- `pitch-deck`, `investor-pack`, `investor-package` повторяют product/investment narrative;
- portal docs, product-roadmap audits и developer-review имеют разные dates/status claims.

Documentation-only/planned-only: Mainnet, audited contract, production KYC/AML, real-world oracle/attestation, pooled investors, stable-value settlement, governance/disputes, incident recovery и canonical chain evidence registry.

## 11. Feature matrix

Legend: I = implemented, P = partial, F = frontend-only, — = отсутствует/not applicable.

| Feature | Status | Backend | Frontend | DB | Contract | Tests | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NEP-413 wallet auth | Implemented; verify production | I | I | — | — | I | In-memory nonce, hardcoded Testnet recipient, verbose logs. |
| Legacy password auth | Implemented | I | I | I | — | I | Вторая auth model остаётся enabled. |
| Wallet onboarding | Implemented; verify production | I | I | I | — | I | Farmer/investor only, immutable role. |
| Investor profile | Implemented | I | I | I | — | I | Дублирует general profile model. |
| Investor Portal | Partially implemented | I | P | I | P | I | Dashboard заменяет API deals static pilots. |
| Marketplace | Frontend-only | — | F | — | — | P | Static authenticated catalog. |
| Farmer Portal | Partially implemented | I | P | I | P | I | Dashboard заменяет API deals. |
| Admin Dashboard | Partially implemented | I | P | I | I | I | Real actions есть, main dashboard static. |
| Deal deploy | Implemented; verify Testnet | I | I | I | I | I | Chain/DB non-atomic. |
| Farmer reports | Implemented off-chain | I | I | I | — | I | Evidence URL не verified. |
| Cycle tracking | Partially implemented | I | I | I | I | I | Hybrid state, timing не enforced. |
| Funding progress | Partially implemented | P | I | P | P | P | Нет funding ledger/partial funding. |
| ROI & returns | Partially implemented | I | I | I | P | I | Manual off-chain records. |
| Portfolio analytics | Partially implemented | P | I | P | — | P | Browser calculations по demo data. |
| Investor withdraw | Partially implemented | I | I | event only | I | I | Delegated backend signer. |
| Farmer withdraw | Partial / signer defect | I | I | event only | I | I | Backend always signs as admin. |
| Platform withdraw | Implemented; verify Testnet | I | I | event only | I | I | Admin/platform обычно один account. |
| Event history | Implemented off-chain | I | I | I | — | I | Не NEP-297. |
| Public deals API | Implemented | I | I | I | reads | I | Возвращает full rows/events. |
| Demo pilots | Frontend-only | — | F | — | — | P | Forced во всех dashboards. |
| Render | Configured; verify production | I | — | P | P | P | Нет production smoke artifact. |
| Vercel | Configured; verify production | — | I | — | — | build only | Origin разрешён CORS. |
| Neon PostgreSQL | Generic config; verify production | I | — | I | — | P | Нет live migration/backup test. |
| Mainnet | Planned only | — | — | — | — | — | Требует security/legal/operations readiness. |

## 12. Release readiness

| Цель | Оценка | Обоснование |
| --- | --- | --- |
| Alpha v1 | Готов как tagged snapshot с caveats | Core code/migrations/backend tests/build/demo/tag есть. Нужно явно приложить contract/public evidence limitations. |
| Public demo | Conditional | Подходит для guided demo после wallet/CORS smoke test. Demo figures/addresses нельзя представлять как live truth. |
| NEAR DevHub review | Пока не готов к сильному technical review | Нужны Linux contract CI, canonical Testnet lifecycle evidence, current deployment docs и чёткая off-chain boundary. |
| Investor demo | Готов для controlled presentation | UI/narrative/pilots/deck есть. Нужны explicit demo/projection labels и осторожные financial claims. |
| Beta v1 | Не готов | Нужны live-data portals, signer fix, security/observability, data cleanup, contract CI/evidence и legal/operational gates. |

## 13. Главные риски

1. **Demo/live ambiguity:** static pilots незаметно заменяют authenticated API portfolios.
2. **Centralized/flawed signing:** backend custody обязательна; farmer withdraw подписывается обычно неавторизованным admin account.
3. **Wallet auth security/scale:** process-local nonces и raw signature diagnostics.
4. **Невоспроизводимая chain evidence:** нет Linux CI и canonical Testnet contract/transaction registry.
5. **Configuration/docs drift:** Render/Vercel URLs и hardcoded API расходятся с README/env examples/Railway docs.

## 14. Top 5 recommended actions

1. **Ввести явный demo/live mode и использовать API data end to end в live mode.** Demo records должны иметь заметную маркировку и не заменять portfolio молча.
2. **Исправить и переработать withdrawal signing.** Использовать signer по роли, хранить tx/reconciliation, проверить Testnet withdrawal и документировать custody.
3. **Добавить Linux CI и canonical Testnet evidence.** Pin Rust, запускать backend/build/contract suites, публиковать contract ID, source/WASM checksum и explorer-linked lifecycle.
4. **Усилить public auth/operations.** Persist nonce, redaction logs, rate limits/security headers/monitoring, dependency-aware health, review legacy auth/API key.
5. **Синхронизировать deployment и docs.** Вернуть configurable API base, обновить Render/Vercel/Neon URLs/instructions, counts/review kit и пометить superseded docs.

## 15. Финальное заключение

AgriPartners Alpha v1 — не documentation prototype: в репозитории есть реальный функциональный backend и 231 passing Jest test, а frontend production build проходит. Самая слабая часть — production/on-chain evidence: UI остаётся demo-first, Rust tests не выполнились на audit host, canonical Testnet evidence отсутствует. Следующий релиз должен прежде всего убрать неоднозначность между demonstration data и live state, а не добавлять новые dashboard sections.
