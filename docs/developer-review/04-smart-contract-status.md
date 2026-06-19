# Smart Contract Status

## Current Contract Model

AgriPartners deploys one Rust contract per deal. The contract stores participants, economic parameters, lifecycle state, pull-payment balances, and an internal escrow pool.

Source of truth: `contract/src/lib.rs`.

## Implemented State

The enum contains six states:

```text
Initialized
  -> Funded
  -> CycleActive
  -> CycleSettlement
       -> CycleActive for another cycle
       -> Completed after the final cycle
       -> Terminated when losses exceed escrow
```

## Implemented Methods

| Method | Authorization | State or value effect |
| --- | --- | --- |
| `new(...)` | Initialization | Stores accounts and deal economics; validates splits and basic ranges. |
| `fund()` | Investor only; payable | Requires the exact configured investment amount and moves status to `Funded`. |
| `start_cycle()` | Admin only | Moves `Funded` or `CycleSettlement` to `CycleActive` and increments the cycle. |
| `report_cycle(losses_near)` | Admin only; payable | Treats attached deposit as profit, distributes balances, applies losses, and settles or completes the cycle. |
| `withdraw()` | Farmer, investor, investor withdrawal signer, or platform | Transfers the caller's available balance to the configured recipient. |
| `get_status()` | View | Returns status and current cycle. |
| `get_balances()` | View | Returns farmer, investor, platform, and escrow balances. |
| `get_params()` | View | Returns stored deal configuration. |

## Implemented Accounting

For each reported profit deposit:

1. gross profit is divided by farmer and investor percentages;
2. platform performance fee is deducted from the investor share;
3. escrow contribution is deducted from the farmer share;
4. net balances become withdrawable;
5. declared losses consume escrow;
6. final-cycle completion releases remaining escrow to the farmer and adds the configured capital return to the investor balance.

All monetary values are native yoctoNEAR integers.

## Authorization Model

- investor funds the contract;
- admin starts and reports cycles;
- farmer withdraws farmer balance;
- investor or `investor_withdraw_signer` triggers payment to the investor account;
- platform withdraws platform fees.

The backend currently initializes both admin and platform from `NEAR_ADMIN_ACCOUNT`. It may also configure the backend admin as the investor withdrawal signer.

## Deployment Implementation

`backend/src/services/nearService.js`:

1. creates `ap<timestamp>.<admin-account>`;
2. transfers 2 NEAR to the account;
3. installs a generated FullAccess key;
4. deploys the WASM file;
5. calls `new` with deal parameters;
6. returns the contract ID and deployment transaction hash.

A compiled artifact is included at `backend/contract/agripartners.wasm`. The repository does not currently document a reproducible check that this binary matches the current Rust source.

## Test Status

Implemented test coverage includes:

- initialization validation;
- funding authorization and exact deposit;
- cycle authorization and transitions;
- profit, fee, escrow, loss, completion, and termination calculations;
- role withdrawals;
- investor withdrawal signer behavior;
- status, balance, and parameter views;
- sandbox happy path and unauthorized calls.

There are 22 unit tests and 4 sandbox integration tests in source. The current Windows verification was blocked before test execution by a transitive `near-vm-runner`/`rustix` compatibility issue. Linux CI evidence is still required.

## Implemented Versus Off-Chain

| Capability | Current status |
| --- | --- |
| Deal economics and participants | Implemented on-chain |
| Funding and contract balance | Implemented on-chain |
| Lifecycle status and cycle number | Implemented on-chain |
| Profit distribution accounting | Implemented on-chain |
| Native NEAR withdrawals | Implemented on-chain |
| Farmer narrative reports and evidence | PostgreSQL only |
| Farmer funding-received confirmation | PostgreSQL only |
| Application event feed | PostgreSQL; may reference transaction hashes |
| Manual return ledger and ROI summary | PostgreSQL only |
| Identity, KYC, and compliance | Not enforced by contract |
| Real-world outcome verification | Not implemented on-chain |

## Security and Design Gaps

These are review topics, not exploit conclusions:

- no independent audit;
- no explicit pause, emergency, dispute, or governance mechanism;
- no upgrade or state-migration strategy;
- centralized admin determines cycle start, profit deposit, and losses;
- no on-chain evidence or oracle proves reported farm outcomes;
- no contract-emitted structured events for indexing;
- direct `Promise` withdrawal clears internal balance before asynchronous transfer completion and has no callback recovery path;
- timestamp-based subaccount naming and generated FullAccess keys require lifecycle and key-custody documentation;
- deployment and database indexing are not atomic;
- no explicit invariant test proves contract solvency across every loss/profit/capital-return combination;
- integer percentage division can leave rounding dust;
- no fungible-token or stable-value settlement;
- no storage-management or multi-investor model;
- duplicated contract and database parameters can drift.

## Planned Roadmap

The following items are recommendations and are **not implemented**:

### Before public beta

- Linux CI for unit, WASM, and sandbox tests;
- reproducible WASM builds and checksums;
- structured NEP-297 event logs;
- signer and key-management redesign;
- withdrawal failure recovery;
- contract/database reconciliation tooling;
- explicit invariants and property-based accounting tests;
- threat model and external security review.

### Before Mainnet

- independent contract audit;
- legal and compliance architecture;
- stable-value asset decision and token standards review;
- emergency controls with transparent governance;
- deployment registry and upgrade policy;
- production monitoring and incident response;
- real-world attestation or oracle design;
- decision on single-investor-per-contract versus pooled funding.

## Contract Readiness Assessment

The contract is suitable for Alpha lifecycle demonstration and technical review. It is not ready to secure production investment capital. The priority is to validate accounting, signer trust, event standards, failure recovery, and the desired on-chain boundary before expanding functionality.
