# NEAR Testnet

> **Legacy Testnet Alpha:** The Farmer wallet, Farmer withdrawal, NEAR funding, and smart-contract
> payout mechanics described here are a historical technical demonstration, not the target
> production financial architecture. Target production keeps cryptocurrency at AgriPartners OÜ
> in Estonia. The Uzbekistan Feedlot Operator and Farmer product role use fiat-only workflows and
> never require a wallet, token, smart contract, or on-chain transaction.

The AgriPartners Pilot MVP uses NEAR Testnet infrastructure to demonstrate wallet-authenticated access, contract-backed deal flows, and transaction-oriented project operations.

## NEAR Testnet Deployment

The pilot is demonstrated on NEAR Testnet. Testnet allows the team to validate contract operations, wallet authentication, transaction flows, and lifecycle transitions before any production deployment.

The demo documentation focuses on the product experience rather than raw contract or account details.

## Wallet Accounts

Wallet authentication connects users to role-specific portals:

- Investor wallet accounts access investor portfolio views.
- Farmer wallet accounts access legacy Alpha operations and reporting views; this requirement must
  be removed in Stage 2 and must not be copied into target design.
- Admin wallet accounts access dashboard and monitoring views.

The clean demo presentation uses investor-ready labels such as Pilot Investor and AgriPartners Pilot Farm while preserving wallet-based access control.

## Smart Contract Usage

Smart contracts support the pilot lifecycle by representing deal state and financial operations. The MVP demonstrates how agricultural investment workflows can be connected to on-chain lifecycle events.

Contract-backed concepts include:

- Deal funding.
- Cycle activation.
- Farmer reporting.
- Return recording.
- Withdrawals or settlement-related actions in testnet workflows.

## Transaction Flow

A typical pilot transaction flow is:

1. Admin creates or monitors a pilot deal.
2. Funding is confirmed.
3. A cycle becomes active.
4. The farmer submits a report or the next report becomes due.
5. Returns are recorded when applicable.
6. The project is marked active or completed depending on lifecycle state.

The demo screenshots simplify this flow into business-readable labels:

- Funding Confirmed.
- Cycle Active.
- Report Submitted.
- Next Report Due.
- Return Recorded.
- Pending.

## Pilot Lifecycle

The current demo lifecycle includes two pilot states:

### Fidlot Livestock Project

Fidlot is presented as a completed project. It shows confirmed funding, submitted report, recorded return, and completed status.

### Hissar Sheep Breeding Project

Hissar is presented as an active project. It shows confirmed funding, active cycle, next report due, pending return status, and outstanding expected returns.

## Demo Positioning

NEAR Testnet proves that the platform can support wallet-authenticated, contract-aware agricultural investment operations. The investor-facing demo layer presents those operations in clear business language for screenshots, walkthroughs, and fundraising conversations.
