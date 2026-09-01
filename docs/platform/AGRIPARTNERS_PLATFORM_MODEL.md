# AgriPartners Platform Model

Status: Canonical integrated overview

Owner: Product

This page is the shortest authoritative introduction to AgriPartners. Detailed facts remain owned
by the linked business, financial, product, release, and engineering documents.

## Platform in one minute

AgriPartners is an Alpha-stage platform for transparent agricultural investment workflows. It
helps investors review Project context, Farmers and operators report progress, and authorized
users track records, returns, expenses, and lifecycle events.

The current **Alpha v1.2** product is a working NEAR Testnet demonstration. It accepts no live
investments and provides no production custody, payout, settlement, or Mainnet investment system.

## Participants

| Participant | Role |
| --- | --- |
| External Investor | Contracts with and funds through AgriPartners OÜ using approved infrastructure. |
| AgriPartners OÜ | Intended central operator and legal counterparty; controls agreements, records, authorization, reconciliation, and reporting. |
| Uzbekistan Feedlot Operator | Receives and returns Project funds only through approved fiat bank or payment channels. |
| Farmer | Non-crypto product role for operations, reporting, evidence, and confirmations. |
| Administrator / authorized operator user | Reviews participants, Projects, evidence, financial states, and exceptions within assigned authority. |
| Project | One separately approved implementation of a reusable Master Investment Model. |

There is no direct contractual or payment relationship between an External Investor and an
Uzbekistan-based Farmer or operator.

## Financial boundary

```text
External Investor
        |
        v
AgriPartners OÜ, Estonia
        |
        | approved crypto-to-fiat infrastructure when applicable
        | cryptocurrency stops in Estonia
        v
Cleared fiat
        |
        | fiat bank or payment transfer
        v
Uzbekistan Feedlot Operator
```

Only AgriPartners OÜ may receive approved crypto assets. Uzbekistan-based operators, Farmers,
suppliers, and employees do not receive, hold, convert, transfer, or return cryptocurrency. They
do not require wallets, tokens, smart-contract payments, or blockchain transactions.

Funding received, conversion, cleared fiat, operator disbursement, receipt confirmation, Project
expenses, proceeds returned, reconciliation, and Investor Settlement are distinct states. An
on-chain event never proves that fiat cleared or that a legal obligation was settled.

The [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md) owns the detailed flow;
the [v2 Operating Model](../business/OPERATING_MODEL.md) owns commercial relationships.

## Product and technical model

```text
Public landing / role portals / Presentation Mode
                         |
                         v
               Vite frontend application
                         |
                         v
              Node.js API and PostgreSQL
                         |
                         v
       approved NEAR Testnet integration and records
```

The Alpha includes a public landing page, opportunity catalog, Investor, Farmer, and Admin
experiences, Presentation Mode, wallet authentication, NEAR Testnet integration, and
non-authoritative treasury and return-record demonstrations.

NEAR may support Estonia-side transparency, timestamped references, audit trails, and approved
automation. It does not replace contracts, banking, accounting, compliance, reconciliation, or
authoritative fiat evidence. Confidential and personal data must not be placed on a public chain.

Legacy Farmer-wallet, withdrawal, NEAR-funding, and smart-contract-payout code is historical
Testnet Alpha evidence, not the target production architecture.

## Demonstration models

- **Feedlot** — completed demonstration of a Project lifecycle, reporting, recorded returns, and
  treasury visibility.
- **Hissar Sheep** — active demonstration of opportunity review, progress reporting, and projected
  return visibility.

These profiles are demonstrations derived from reusable Master Investment Models. They are not
production investment offerings.

## Roadmap boundary

Business maturity progresses through Alpha, Company Registration, Pilot 1.0, Pilot 2.0,
Production Ready, Investor Protection, and Marketplace. Describing a future phase does not
authorize implementation or real-funds activity. Pilot 1.0 means one complete, controlled Project
lifecycle, not a single Production Cycle.

## Where to read next

- Current product status: [Alpha v1.2 Release Notes](../releases/alpha-v1.2-release-notes.md)
- Product direction: [Software Delivery Roadmap](../ROADMAP.md)
- Business relationships: [v2 Operating Model](../business/OPERATING_MODEL.md)
- Financial controls: [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md)
- Pilot scope: [Pilot 1.0 Plan](pilot/PILOT_1_PLAN.md)
- Implementation architecture: [Architecture](../ARCHITECTURE.md)
- All audience routes: [Documentation Index](../DOCUMENTATION_INDEX.md)

Production activation depends on company registration, approved agreements, banking and payment
arrangements, licensed partners where required, accounting, compliance controls, security review,
and legal approval in every relevant jurisdiction.
