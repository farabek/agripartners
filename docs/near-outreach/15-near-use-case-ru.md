# AgriPartners: NEAR use case

## Почему NEAR

AgriPartners использует NEAR потому, что агроинвестиционным workflows нужны низкие transaction costs, понятные accounts, быстрый finality и инфраструктура, которая может поддерживать real-world asset use cases без слишком сложного пользовательского опыта.

NEAR подходит по нескольким причинам:

- Transaction costs достаточно низкие для повторяющихся lifecycle events.
- Account-based UX легче объяснять non-crypto пользователям.
- Testnet позволяет быстро итерироваться до mainnet launch.
- В ecosystem есть интерес к RWA, impact, emerging markets и практическому blockchain adoption.
- Smart contracts могут быть auditable state layer для агросделок.

## Как используются smart contracts

Smart contract layer отражает жизненный цикл агроинвестиционной сделки. В MVP NEAR Testnet используется для демонстрации contract-aware workflows, а не production financial settlement.

Contract-backed concepts включают:

- Deal creation и parameter tracking.
- Funding confirmation.
- Cycle activation.
- Farmer reporting.
- Return recording.
- Withdrawal или settlement-related actions.
- Lifecycle status changes: active, pending, completed.

Приложение переводит эти события в business-readable language для investors, farmers и partners.

## Investor workflow

Investor workflow сфокусирован на ясности и проверяемости:

1. Investor входит в portal через role-specific account.
2. Investor смотрит portfolio metrics и featured pilot deals.
3. Investor открывает pilot project, например Fidlot или Hissar.
4. Investor проверяет investment size, ROI, APR, cycle count, expected returns, returned amount и outstanding amount.
5. Investor смотрит reporting и event history, чтобы понимать lifecycle progress.
6. В future mainnet version funding и settlement могут быть связаны с audited smart contract flows.

## Farmer workflow

Farmer workflow сфокусирован на операционной видимости:

1. Farmer входит в portal через role-specific account.
2. Farmer видит назначенные pilot projects.
3. Farmer видит funding confirmation и current cycle status.
4. Farmer отслеживает active и completed deals.
5. Farmer отправляет или отслеживает reporting status.
6. Lifecycle events становятся видимыми для investors и admins через общий workflow.

## Reporting workflow

Reporting - ключевая trust function. MVP показывает, как farm progress может стать частью структурированной инвестиционной записи.

Reporting workflow включает:

- Funding confirmed.
- Cycle active.
- Report submitted.
- Next report due.
- Return recorded.
- Pending или completed status.

В текущей Alpha v1 этот reporting workflow демонстрируется через product layer и NEAR Testnet lifecycle concepts. Будущие версии могут усилить verification через project evidence, partner attestations, photos, documents и on-chain references.

## Future Mainnet vision

Mainnet vision - перейти от controlled Alpha v1 demos к audited, legally structured и production-ready агроинвестиционным workflows.

Будущие mainnet milestones:

- Independent smart contract security audit.
- Legal и compliance review для investment structures.
- Wallet UX improvements для non-technical investors и farmers.
- Audited mainnet deployment.
- Первые live pilot deals с documented partner validation.
- Более сильный evidence package для farm operations.
- Transparent settlement и withdrawal workflows.
- Scalable templates для дополнительных livestock и agricultural models.

Долгосрочная возможность - сделать NEAR практическим infrastructure layer для real-world agricultural finance в emerging markets.
