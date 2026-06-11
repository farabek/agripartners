# NEAR Testnet

AgriPartners Pilot MVP использует инфраструктуру NEAR Testnet, чтобы показать wallet-authenticated access, contract-backed deal flows и transaction-oriented project operations.

## NEAR Testnet Deployment

Пилот демонстрируется на NEAR Testnet. Testnet позволяет команде проверить contract operations, wallet authentication, transaction flows и lifecycle transitions до production deployment.

Эта документация фокусируется на product experience, а не на raw contract или account details.

## Wallet Accounts

Wallet authentication связывает пользователей с role-specific portals:

- investor wallet accounts получают доступ к portfolio views;
- farmer wallet accounts получают доступ к operations и reporting views;
- admin wallet accounts получают доступ к dashboard и monitoring views.

Clean demo presentation использует investor-ready labels вроде Pilot Investor и AgriPartners Pilot Farm, сохраняя при этом wallet-based access control.

## Smart Contract Usage

Смарт-контракты поддерживают pilot lifecycle через deal state и financial operations. MVP показывает, как сельскохозяйственные investment workflows могут быть связаны с on-chain lifecycle events.

Contract-backed concepts включают:

- deal funding;
- cycle activation;
- farmer reporting;
- return recording;
- withdrawals или settlement-related actions в testnet workflows.

## Transaction Flow

Типичный pilot transaction flow:

1. Admin создает или мониторит pilot deal.
2. Funding подтверждается.
3. Cycle становится active.
4. Farmer отправляет report или получает Next Report Due.
5. Returns фиксируются, если применимо.
6. Project остается active или получает completed status в зависимости от lifecycle state.

Demo screenshots упрощают этот flow до business-readable labels:

- Funding Confirmed.
- Cycle Active.
- Report Submitted.
- Next Report Due.
- Return Recorded.
- Pending.

## Pilot Lifecycle

Текущий demo lifecycle включает два состояния пилота.

### Fidlot Livestock Project

Fidlot представлен как completed project. Он показывает confirmed funding, submitted report, recorded return и completed status.

### Hissar Sheep Breeding Project

Hissar представлен как active project. Он показывает confirmed funding, active cycle, next report due, pending return status и outstanding expected returns.

## Demo Positioning

NEAR Testnet доказывает, что платформа может поддерживать wallet-authenticated, contract-aware agricultural investment operations. Investor-facing demo layer представляет эти операции понятным business language для screenshots, walkthroughs и fundraising conversations.

