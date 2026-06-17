# Demo Script

## Audience

This script is written for NEAR ecosystem reviewers, investors, accelerators, and strategic partners.

Target duration: 5-7 minutes.

## Script

Hello, this is AgriPartners Alpha v1.

AgriPartners is an agricultural real-world asset platform that connects investors with vetted farm projects and gives both sides a transparent workflow for funding, reporting, ROI tracking, and NEAR-based verification.

The problem we are solving is simple: farmers need working capital, but investors often cannot see what is happening after money leaves their account. Agricultural deals are usually tracked through private documents, manual reports, and offline trust. AgriPartners turns that into a structured digital workflow.

I will show the demo in nine steps: login, marketplace, two pilot deals, farmer reports, ROI dashboard, portfolio dashboard, funding progress, and withdraw.

First, we start with NEAR wallet login. The investor enters through a wallet-linked session, which gives us account-based access without creating a traditional username-password investor system. This is important because the long-term product needs blockchain-linked identity, contract interaction, and transaction verification.

Now we open the Marketplace. Here investors can review agricultural pilot opportunities. The current demo has two profiles: the Feedlot Livestock Project and the Hissar Sheep Breeding Project. The marketplace shows investment amount, ROI, APR, cycles, status, and compact funding progress.

The first pilot is the Feedlot Livestock Project. This is the completed-state example. It shows a $50,000 investment, 7 cycles, 64% ROI, 21.9% APR, and completed status. In the investor view we can see funding progress, farmer reporting, returned capital, and event history. The returned amount is $82,000, with $0 outstanding. This is the clean example of a completed agricultural cycle.

The second pilot is the Hissar Sheep Breeding Project. This is the active-state example. It also has a $50,000 investment amount, with 6 cycles, 63.3% projected ROI, and 21.1% APR. It is active, so the dashboard shows outstanding projected returns and an operating-cycle view. This is where investors can understand what is still in progress rather than only seeing a static deal document.

Next, farmer reports. AgriPartners is not only a financial dashboard. It connects capital to farm execution. In the deal detail view, investors can see cycle status, report status, submitted farmer reports, amount used, evidence links when available, and event history. This is the operational transparency layer.

Now we return to the Investor Analytics Dashboard. The ROI and returns section summarizes projected portfolio return, capital returned, outstanding returns, return completion rate, and average projected ROI. The important point is that projected returns are clearly presented as projections, not guarantees.

The dashboard also includes the portfolio management layer. It shows total invested, projected returns, returned capital, outstanding amount, profit realized, capital returned percentage, portfolio performance, portfolio health, recent activity, deal performance, active investments, and completed investments. This gives the investor a 30-second answer to: how much is allocated, what has returned, what is outstanding, and which deals need attention.

Funding progress is visible both on marketplace cards and inside deal detail. In the full funding panel, investors can see funding goal, amount raised, remaining amount, funding percentage, investor count, and days remaining. If live funding data is unavailable in Alpha v1, the UI derives demo-safe values from existing deal data. This keeps the demo clear without requiring new backend or contract logic.

Finally, withdraw. The investor detail view includes a withdrawal action that demonstrates smart contract interaction on NEAR testnet. Where available, the flow can show a transaction hash. This is not positioned as a final production finance workflow; it is a testnet validation of the direction.

The reason NEAR matters is that this product needs wallet identity, low-cost transactions, contract programmability, and verifiable deal events. Today we show wallet auth, smart contract interaction, withdrawal, and verification. Future phases can extend this into funding pools, return distribution, and on-chain cycle events.

In summary, AgriPartners Alpha v1 demonstrates the full shape of an agricultural RWA platform: investors discover farm deals, inspect funding progress, track farmer reports, monitor ROI and returns, manage portfolio health, and verify blockchain-linked activity on NEAR.
