# NEAR Use Case

## Current Alpha v1 Use

AgriPartners Alpha v1 использует NEAR Testnet, чтобы показать, как agricultural investment workflows могут быть связаны с blockchain-based identity, contract interaction и verification.

### Wallet Auth

Investor и farmer portals требуют wallet-linked access. Demo использует NEAR wallet authentication, чтобы связать user session с wallet account и направить user в правильный portal experience.

Current value:

- Wallet-based identity.
- Investor portal access control.
- Farmer portal access control.
- Demo-ready NEAR account context.

### Smart Contract

AgriPartners включает smart contract interaction для deal lifecycle actions на NEAR Testnet. Contract layer поддерживает technical direction для escrow-like agricultural finance workflows.

Current value:

- Contract-linked deal profiles.
- Testnet interaction path.
- Deal status and balance visibility.
- Foundation for future funding and return distribution logic.

### Withdraw Flow

Investor и farmer detail views включают withdrawal flows. В Alpha v1 withdrawal демонстрирует smart-contract interaction и wallet-linked fund movement на NEAR Testnet.

Current value:

- Investor withdrawal action.
- Farmer withdrawal action.
- Transaction hash visibility where available.
- Clear separation between demo/Testnet execution and production finance claims.

### Blockchain Verification

Deal events, wallet accounts, contract addresses и transaction hashes создают verification layer для demo. Это позволяет reviewers связать UI state с blockchain-backed activity.

Current value:

- Contract address visible in deal detail.
- Event history visible in deal views.
- Transaction hash links where available.
- NEAR Testnet as a transparent validation environment.

## Future NEAR Use

### Funding Pools

Future versions могут поддерживать pooled investor funding для agricultural deals. Investors смогут allocate capital into deal-specific или category-specific pools, а smart contracts смогут track commitments, funding thresholds и closing status.

### Return Distribution

Future versions могут приблизить return logic к on-chain settlement. Smart contracts смогут distribute returned capital и investor yield according to deal terms, investor allocation и verified cycle results.

### Cycle Events

Future versions могут записывать farm cycle milestones как structured events. Examples include funding sent, funding confirmed, report submitted, cycle closed, return recorded и investor withdrawal completed.

### Mainnet Readiness Path

Before production deployment AgriPartners should complete legal review, contract audit, mainnet deployment planning и clearer separation between informational reporting and contract-enforced settlement.

## NEAR Fit

NEAR подходит AgriPartners, потому что product needs low-cost transaction infrastructure, wallet-based UX, contract programmability и credible ecosystem для real-world asset experimentation.

AgriPartners является practical NEAR RWA use case, потому что он maps existing real-world workflow - agricultural financing - into transparent, verifiable, investor-facing digital system.
