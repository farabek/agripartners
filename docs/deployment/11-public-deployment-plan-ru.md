# План публичного развертывания AgriPartners Alpha v1

Дата плана: 2026-06-19

Целевая среда: публичная Alpha v1 в NEAR Testnet

Статус: только планирование; этот документ не выполняет deployment.

## Назначение и текущая позиция

Этот план описывает публикацию текущего репозитория AgriPartners с использованием GitHub, Vercel, Railway, Railway PostgreSQL и NEAR Testnet.

Цель — публичная техническая демонстрация, а не production financial service. Необходимо сохранять следующие формулировки:

- Alpha v1;
- только NEAR Testnet;
- smart contract не проходил audit;
- отсутствуют заявления о Mainnet или production investments.

### Текущие блокеры перед deployment

- Вне local development `frontend/app.js` hardcoded на `https://agripartners.onrender.com`. Сейчас этот URL возвращает HTTP 404 и не может указывать на сгенерированный Railway domain без изменения кода.
- CORS в backend не ограничен.
- Tracked backend environment example не содержит обязательные `JWT_SECRET` и production `ADMIN_PASSWORD`.
- Не опубликованы canonical Testnet contract, набор transaction evidence или воспроизводимый WASM provenance.
- Для contract tests еще нет проверенного успешного результата Linux CI.
- Существующие lifecycle demo scripts не полностью соответствуют текущим authentication и contract interfaces.

Это pre-deployment задачи. План документирует их, но не изменяет приложение.

## 1. Топология deployment

```text
GitHub: farabek/agripartners, branch main
  |
  +--> Vercel project, root directory: frontend/
  |      |
  |      +--> Public Vite SPA
  |      +--> MyNearWallet / NEAR Testnet RPC
  |      +--> HTTPS REST calls к Railway backend
  |
  +--> Railway backend service, root directory: backend/
         |
         +--> Express API и startup migrations
         +--> Railway PostgreSQL через DATABASE_URL
         +--> FastNEAR или configured NEAR Testnet RPC
         +--> NEAR Testnet contract view/call/deploy operations
```

### Ответственность компонентов

| Компонент | Ответственность | Источник deployment |
| --- | --- | --- |
| GitHub | Канонический source, branch protection, deployment trigger | Branch `main` репозитория |
| Vercel | Build и раздача static Vite frontend через HTTPS | `frontend/` |
| Railway backend | Запуск Express, migrations, API, wallet verification и NEAR service | `backend/` |
| Railway PostgreSQL | Хранение users, profiles, deals, reports, cycles, events и return records | `DATABASE_URL` |
| NEAR Testnet | Wallet accounts, deal contracts, lifecycle state, balances и test transactions | Настроенные Testnet accounts и RPC |

### Граница доверия

Backend остается trusted component. Он хранит JWT secrets, подключается к PostgreSQL, содержит configured Testnet signer keys, разворачивает contracts и отправляет admin actions. Публичную Alpha нельзя описывать как полностью decentralized.

## 2. Environment variables

### Frontend variables

| Variable | Обязательность | Текущая поддержка | Планируемое значение или handling |
| --- | --- | --- | --- |
| `VITE_NEAR_RPC_URL` | Рекомендуется | Реализовано | Public NEAR Testnet RPC URL |
| `VITE_API_BASE_URL` | Требуется для topology с Railway | **Не реализовано** | HTTPS origin Railway backend; подключить во frontend до deployment |
| NEAR network selector | Требуется концептуально | Hardcoded как `testnet` | Сохранить Testnet для Alpha; не добавлять Mainnet switch |

Vercel не должен получать backend private keys, JWT secrets, database credentials или admin passwords. Variables с префиксом `VITE_` встраиваются в публичный browser bundle и не являются secrets.

### Backend variables

| Variable | Обязательность | Назначение | Примечания |
| --- | --- | --- | --- |
| `DATABASE_URL` | Да | Подключение PostgreSQL | Inject из Railway PostgreSQL service |
| `NODE_ENV` | Да | Production behavior | Установить `production` |
| `PORT` | Управляется платформой | Express listener | Использовать значение Railway |
| `API_KEY` | Да по текущей startup check | Legacy API-key configuration | Middleware не подключен; устранить несогласованность до release |
| `JWT_SECRET` | Да | Подпись и проверка legacy и wallet JWT | Создать длинный случайный secret; нигде не переиспользовать |
| `NEAR_NETWORK` | Да | Сеть NEAR | Установить `testnet` |
| `NEAR_RPC_URL` | Рекомендуется | Backend NEAR RPC | Использовать проверенный Testnet RPC endpoint |
| `FASTNEAR_API_KEY` | Опционально | Authenticated FastNEAR requests | Хранить только в Railway при использовании |
| `NEAR_ADMIN_ACCOUNT` | Да | Contract deployment и admin signer | Рекомендуется отдельный Testnet account |
| `NEAR_ADMIN_PRIVATE_KEY` | Да | Backend Testnet signing | Secret; ограничить доступ и ротировать после exposure |
| `WASM_PATH` | Операционно требуется | Contract artifact для deployment | `./contract/agripartners.wasm` относительно backend root |
| `ADMIN_EMAIL` | Рекомендуется | Seeded admin identity | Не использовать placeholder public address |
| `ADMIN_PASSWORD` | Требуется при production seed на пустой database | Initial legacy admin password | Сильный secret; ротировать после первого входа или отключить legacy path |
| `ADMIN_WALLET_ALLOWLIST` | Требуется для wallet-admin access | Список Testnet accounts через запятую | Использовать явный least-privilege list |
| `RUN_SEED` | Нет | Принудительный seed в production | Оставить unset/false, кроме намеренной инициализации пустой database |
| `NEAR_INVESTOR_SIGNER_ACCOUNT_ID` | Условно | Investor withdrawal signer | Добавлять только при сохранении текущей signer model |
| `NEAR_INVESTOR_SIGNER_PRIVATE_KEY` | Условно | Investor signer key | Railway secret |
| `NEAR_FARMER_SIGNER_ACCOUNT_ID` | Legacy Testnet Alpha | Backend farmer signer | Историческая демонстрация; удалить из целевой Stage 2 deployment configuration |
| `NEAR_FARMER_SIGNER_PRIVATE_KEY` | Legacy Testnet Alpha | Farmer signer key | Не настраивать; удалить и выполнить approved secrets rotation в Stage 2 |
| `NEAR_PLATFORM_SIGNER_ACCOUNT_ID` | Условно | Platform signer | Задокументировать роль до включения |
| `NEAR_PLATFORM_SIGNER_PRIVATE_KEY` | Условно | Platform signer key | Railway secret |

### Database variables

Приложение напрямую использует только `DATABASE_URL`. Railway PostgreSQL может предоставлять дополнительные `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD` и `PGDATABASE`, но текущий код не читает их по отдельности.

Требования database:

- private service-to-service connection, где Railway это поддерживает;
- encrypted external connection при использовании внешнего administration client;
- автоматический backup или snapshot перед каждым release с изменением schema;
- ограниченный доступ к production-like данным;
- отсутствие реальных personal data investors или farmers в публичной Alpha.

### NEAR variables и assets

Для deployment требуются:

- отдельный NEAR Testnet admin account;
- достаточное количество Testnet NEAR для создания subaccounts, contract deployment, gas и demo transactions;
- проверенная Testnet signer strategy;
- WASM artifact с source commit и SHA-256 checksum;
- canonical contract и transaction evidence после deployment.

Не используйте Mainnet key или реальные средства в этой среде.

## 3. Порядок deployment

### Шаг 0: Устранить pre-deployment blockers

До подключения hosting platforms:

1. сделать frontend API base настраиваемым через Vercel variable;
2. заменить unrestricted CORS на allowlist для Vercel origin и local development;
3. дополнить и проверить `backend/.env.example`;
4. согласовать или вывести из использования устаревшие demo scripts;
5. создать Linux CI для backend tests, frontend build, contract tests и WASM build;
6. зафиксировать WASM provenance;
7. определить canonical signer и withdrawal model.

### Шаг 1: Подготовить GitHub

1. использовать `main` как deployment branch;
2. требовать pull-request review и passing CI перед deployment;
3. убедиться, что `.env`, key, token, database dump и personal data не tracked;
4. создать tag release candidate;
5. зафиксировать commit SHA в deployment log.

### Шаг 2: Выполнить release gates локально и в CI

Требуемые результаты:

- backend: проходят все 20 suites и 226 tests;
- frontend: проходит Vite production build;
- contract: unit и sandbox tests проходят в Linux;
- WASM: release artifact собирается, checksum зафиксирован;
- internal documentation links проходят проверку;
- dependency и secret scans не содержат нерешенных critical findings.

### Шаг 3: Создать Railway project и PostgreSQL

1. создать один Railway project для public Alpha;
2. добавить PostgreSQL service;
3. создать backend service из GitHub repository;
4. установить root directory backend как `backend`;
5. использовать `npm install` или Railway build с lockfile и start command `node server.js`;
6. подключить PostgreSQL `DATABASE_URL` к backend service;
7. настроить health check path `/health`;
8. внести все backend и NEAR secrets в Railway variables.

### Шаг 4: Сначала развернуть и проверить backend

1. развернуть backend без deployment frontend;
2. подтвердить завершение startup migrations;
3. подтвердить, что `/health` возвращает HTTP 200 и `{ "status": "ok" }`;
4. подтвердить, что `/api/deals` возвращает valid JSON;
5. убедиться, что logs не содержат private keys, JWTs, raw signatures или sensitive personal data;
6. зафиксировать сгенерированный URL `*.up.railway.app`;
7. не продолжать при недоступности database или NEAR RPC.

### Шаг 5: Подготовить NEAR Testnet evidence

1. проверить dedicated admin account и RPC configuration;
2. развернуть один disposable review contract из зафиксированного WASM;
3. зафиксировать contract ID, deployment hash, source commit и WASM checksum;
4. выполнить read-only проверки `get_params`, `get_status` и `get_balances`;
5. выполнить только минимальный безопасный Testnet lifecycle для verification;
6. зафиксировать explorer links и ожидаемые результаты.

### Шаг 6: Создать Vercel project

1. импортировать тот же GitHub repository в Vercel;
2. установить root directory как `frontend`;
3. использовать `npm run build:wallet-poc` как build command;
4. использовать `dist` как output directory;
5. после реализации frontend support установить `VITE_API_BASE_URL` на проверенный Railway HTTPS URL;
6. установить `VITE_NEAR_RPC_URL` на выбранный Testnet RPC;
7. сначала развернуть preview, затем promote проверенный deployment.

### Шаг 7: Применить origin и callback configuration

1. добавить final Vercel origin в backend CORS allowlist;
2. подтвердить, что wallet callback URLs используют Vercel HTTPS origin;
3. подтвердить Testnet helper, explorer и RPC URLs;
4. убедиться, что public build не использует localhost URL.

### Шаг 8: Выполнить end-to-end verification

Тестировать в следующем порядке:

1. frontend загружается;
2. backend health и public API работают;
3. wallet login и onboarding работают;
4. role-specific portals загружают только authorized data;
5. contract status и balances отображаются;
6. выполняется одна безопасная Testnet transaction;
7. transaction hash и explorer link отображаются или фиксируются;
8. database events и reports остаются согласованными после refresh.

### Шаг 9: Опубликовать Alpha evidence record

Зафиксировать:

- Git commit;
- Vercel deployment URL;
- Railway deployment URL;
- версию database migrations;
- Testnet contract ID и transaction links;
- WASM checksum;
- test/CI links;
- known limitations и rollback owner.

## 4. Требуемые accounts

| Account | Необходимый доступ | Рекомендуемые controls |
| --- | --- | --- |
| GitHub | Repository admin и deployment integration | MFA, protected `main`, ограниченные app permissions |
| Railway | Project owner, backend service, PostgreSQL | MFA, least-privilege team access, billing alerts |
| Vercel | Project owner и GitHub integration | MFA, разделение preview/production, ограниченный team access |
| NEAR Wallet | Отдельный Testnet admin/signer account | Отделить от personal wallet, безопасный backup, только Testnet |

Не передавайте root credentials одного человека. Добавляйте named collaborators с минимально необходимой ролью.

## 5. Стратегия domains

### Временные публичные URLs

- frontend: `https://<project>.vercel.app`;
- backend: `https://<service>.up.railway.app`;
- Testnet explorer: canonical links для accounts и transactions.

Используйте временные URLs в период technical review и pilot validation. Не приобретайте и не перенаправляйте production brand domain до стабилизации API, wallet callback, CORS и rollback process.

### Будущий custom domain

Рекомендуемая структура:

- `app.<domain>` для Vercel frontend;
- `api.<domain>` для Railway backend;
- `docs.<domain>` только при намеренной публикации документации.

Перед миграцией:

1. уменьшить DNS TTL;
2. проверить TLS certificates;
3. обновить CORS и wallet callback origins;
4. обновить frontend API variable;
5. сохранить доступность временных platform URLs во время transition;
6. проверить старый и новый origins до удаления старого route.

## 6. Security checklist

### CORS и HTTPS

- [ ] Заменить default behavior `cors()` на explicit allowed origins.
- [ ] Разрешить только production Vercel origin и approved preview/local origins.
- [ ] Требовать HTTPS для всех public frontend и API requests.
- [ ] Не размещать credentials в query strings.

### JWT и authentication

- [ ] Создать сильный уникальный `JWT_SECRET`.
- [ ] Ротировать initial admin password.
- [ ] Проверить сроки one-day wallet и seven-day legacy tokens.
- [ ] Решить, остается ли legacy username/password login включенным.
- [ ] Перенести wallet nonces из process memory до horizontal scaling.
- [ ] Удалить wallet signature и token diagnostics из production logs или выполнять redaction.

### Secrets и environment variables

- [ ] Хранить private keys и secrets только в Railway secret variables.
- [ ] Никогда не раскрывать secrets через `VITE_` variables.
- [ ] Использовать отдельный Testnet signer с минимальным балансом.
- [ ] Ограничить круг лиц, которые могут просматривать или изменять Railway и Vercel variables.
- [ ] Ротировать любой secret, показанный в logs, chat, screenshots или local history.
- [ ] Подтвердить, что `.env` и private key files остаются ignored в Git.

### Application и database

- [ ] Добавить rate limiting и request-size limits.
- [ ] Валидировать все state-changing payloads.
- [ ] Подтвердить отсутствие confidential information в public deal fields.
- [ ] Выполнять backup PostgreSQL перед migrations.
- [ ] Протестировать restore procedure.
- [ ] Добавить monitoring health, errors, RPC failures и database saturation.

## 7. Verification checklist

### Frontend

- [ ] Vercel build проходит из clean clone.
- [ ] Main application и wallet POC assets загружаются без 404 errors.
- [ ] Hash routing сохраняет работу при refresh и direct links.
- [ ] Production bundle использует Railway API URL, а не Render или localhost.
- [ ] Browser console не содержит blocking errors.

### Backend и API

- [ ] Railway deployment healthy.
- [ ] `/health` возвращает HTTP 200.
- [ ] `/api/deals` возвращает JSON.
- [ ] Unauthorized protected requests возвращают 401/403.
- [ ] Admin, investor и farmer routes обеспечивают role ownership.
- [ ] Logs используют redaction.

### Database

- [ ] Migrations выполняются один раз в порядке filenames.
- [ ] `_migrations` фиксирует примененные files.
- [ ] Seed behavior является намеренным и безопасным.
- [ ] Restart сохраняет данные.
- [ ] Backup и restore протестированы.

### Wallet login

- [ ] MyNearWallet открывается в Testnet.
- [ ] Challenge nonce имеет 32 bytes и истекает.
- [ ] Signature verification проходит для правильного account.
- [ ] Reuse и invalid signatures завершаются ошибкой.
- [ ] Onboarding направляет в правильный portal.

### NEAR

- [ ] Везде используется Testnet.
- [ ] RPC reads проходят успешно.
- [ ] Contract ID и deployment hash зафиксированы.
- [ ] `get_params`, `get_status` и `get_balances` соответствуют ожиданиям.
- [ ] Одна безопасная signed transaction проходит успешно.
- [ ] Explorer link открывает ожидаемые account и transaction.

## 8. План rollback

### Rollback frontend

1. promote предыдущий known-good Vercel deployment;
2. восстановить предыдущий набор environment variables, если он изменился;
3. проверить API и wallet callback origins;
4. сохранить failed deployment для logs, но не публиковать его.

### Rollback backend

1. остановить state-changing admin operations;
2. redeploy предыдущий known-good Git commit в Railway;
3. восстановить предыдущий набор variables, если причиной сбоя была configuration;
4. проверить `/health`, API reads и database connectivity;
5. ротировать secrets при подозрении на compromise.

### Rollback database

Текущие migrations являются forward-only, down migrations отсутствуют.

1. создавать backup перед каждым release с migrations;
2. предпочитать backward-compatible additive migrations;
3. при необходимости rollback восстановить backup в новый Railway PostgreSQL service;
4. направить rolled-back backend на восстановленную database;
5. проверить counts и critical records до повторного открытия writes.

Никогда не выполняйте импровизированный destructive SQL против единственной копии database.

### Rollback NEAR

Deployed contract code и completed transactions нельзя откатить как web deployment.

1. остановить frontend/backend actions, направленные на affected contract;
2. сохранить contract ID и transaction evidence;
3. проверить balances и authorized withdrawal paths;
4. развернуть corrected Testnet contract только после review;
5. явно обновить database registry и UI;
6. никогда не представлять replacement contract как исходную историю.

## 9. Известные риски

| Риск | Влияние | Mitigation |
| --- | --- | --- |
| Frontend API URL hardcoded на неработающий Render endpoint | Public application не может использовать Railway backend | Реализовать `VITE_API_BASE_URL` до deployment |
| Unrestricted CORS | Любой origin может обращаться к browser-accessible API paths | Explicit origin allowlist |
| Централизованные backend signer keys | Компрометация key позволяет отправлять privileged Testnet calls | Отдельный low-balance account, managed secrets, signer redesign |
| Process-local wallet nonces | Login failures после restart или scale-out | Shared expiring nonce store |
| Public backend сейчас отсутствует | End-to-end deployment не проверен | Сначала deploy backend; frontend release зависит от health |
| Forward-only migrations | Небезопасный rollback после изменения schema | Backups, additive migrations, restore drill |
| Неатомарность chain/database | Deployed contract может не индексироваться после partial failure | Idempotency и reconciliation tooling |
| Отсутствует WASM provenance | Reviewer не может доказать соответствие deployed code исходникам | CI build manifest и checksum |
| Нет Linux CI evidence для contract tests | Contract verification неполна | Обязательный Linux CI gate |
| Demo scripts устарели | Deployment validation может завершиться ошибкой или ввести в заблуждение | Согласовать scripts до release |
| Нет smart contract audit | Production finance risk остается неизвестным | Сохранить Testnet-only disclaimer; audit до Mainnet |
| Public Alpha может показывать demo data как реальные | Репутационная и compliance неоднозначность | Четкие labels и только synthetic/redacted data |

## 10. Финальный checklist готовности

### Release blockers

- [ ] Frontend API base настраивается и указывает на Railway.
- [ ] Backend health endpoint работает публично.
- [ ] CORS ограничен.
- [ ] Полный backend environment template проверен из clean clone.
- [ ] Linux contract tests проходят.
- [ ] WASM source commit и checksum зафиксированы.
- [ ] Canonical Testnet evidence опубликован.
- [ ] Demo scripts соответствуют текущим authentication и contract interfaces.

### Release approval

- [ ] GitHub release commit зафиксирован.
- [ ] Railway PostgreSQL backup существует.
- [ ] Railway backend variables заполнены.
- [ ] Vercel frontend variables заполнены.
- [ ] Wallet login и onboarding проходят.
- [ ] Investor, farmer и admin smoke tests проходят.
- [ ] Один Testnet lifecycle проверен.
- [ ] Rollback owners и steps назначены.
- [ ] Disclaimers Alpha/Testnet/unaudited видимы.

## Оценка готовности deployment

**Текущая оценка: не готово к публичному deployment без pre-deployment fixes.**

Репозиторий достаточно зрелый для подготовки deployment candidate: backend tests проходят, frontend собирается, architecture задокументирована, а Testnet integration присутствует в исходном коде. Текущая public topology не готова к release, потому что frontend обращается к недоступному Render API, Railway API origin не настраивается, CORS не ограничен, contract evidence неполна, а rollback/provenance gates еще не реализованы.

Рекомендуемый следующий шаг: устранить Step 0, сначала развернуть Railway backend и PostgreSQL, а затем потребовать healthy API и canonical Testnet evidence до создания public Vercel release.

## References

Текущие источники репозитория:

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

Platform references, accessed 2026-06-19:

- [Railway monorepo deployments](https://docs.railway.com/deployments/monorepo)
- [Railway PostgreSQL](https://docs.railway.com/databases/postgresql)
- [Railway variables](https://docs.railway.com/variables)
- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
