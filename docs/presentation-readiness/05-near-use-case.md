# NEAR Use Case

## Current Alpha v1 Use

AgriPartners Alpha v1 uses NEAR testnet to demonstrate how agricultural investment workflows can connect to blockchain-based identity, contract interaction, and verification.

### Wallet Auth

The investor and farmer portals require wallet-linked access. The demo uses NEAR wallet authentication to connect a user session to a wallet account and route the user into the correct portal experience.

Current value:

- Wallet-based identity.
- Investor portal access control.
- Farmer portal access control.
- Demo-ready NEAR account context.

### Smart Contract

AgriPartners includes smart contract interaction for deal lifecycle actions on NEAR testnet. The contract layer supports the technical direction for escrow-like agricultural finance workflows.

Current value:

- Contract-linked deal profiles.
- Testnet interaction path.
- Deal status and balance visibility.
- Foundation for future funding and return distribution logic.

### Withdraw Flow

The investor and farmer detail views include withdrawal flows. In Alpha v1, withdrawal demonstrates smart-contract interaction and wallet-linked fund movement on testnet.

Current value:

- Investor withdrawal action.
- Farmer withdrawal action.
- Transaction hash visibility where available.
- Clear separation between demo/testnet execution and production finance claims.

### Blockchain Verification

Deal events, wallet accounts, contract addresses, and transaction hashes create a verification layer for the demo. This gives reviewers a way to connect UI state with blockchain-backed activity.

Current value:

- Contract address visible in deal detail.
- Event history visible in deal views.
- Transaction hash links where available.
- NEAR testnet as a transparent validation environment.

## Future NEAR Use

### Funding Pools

Future versions can support pooled investor funding for agricultural deals. Investors could allocate capital into deal-specific or category-specific pools, with smart contracts tracking commitments, funding thresholds, and closing status.

### Return Distribution

Future versions can move return logic closer to on-chain settlement. Smart contracts could distribute returned capital and investor yield according to deal terms, investor allocation, and verified cycle results.

### Cycle Events

Future versions can record farm cycle milestones as structured events. Examples include funding sent, funding confirmed, report submitted, cycle closed, return recorded, and investor withdrawal completed.

### Mainnet Readiness Path

Before production deployment, AgriPartners should complete legal review, contract audit, mainnet deployment planning, and clearer separation between informational reporting and contract-enforced settlement.

## NEAR Fit

NEAR fits AgriPartners because the product needs low-cost transaction infrastructure, wallet-based UX, contract programmability, and a credible ecosystem for real-world asset experimentation.

AgriPartners is a practical NEAR RWA use case because it maps an existing real-world workflow - agricultural financing - into a transparent, verifiable, investor-facing digital system.
