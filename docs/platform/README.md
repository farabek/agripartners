# AgriPartners platform documentation

This directory contains the concise bilingual public overview of the AgriPartners Alpha v1.2 platform.

## Canonical documents

- `PLATFORM_EXPLAINED_EN.docx` and `PLATFORM_EXPLAINED_EN.pdf`
- `PLATFORM_EXPLAINED_RU.docx` and `PLATFORM_EXPLAINED_RU.pdf`
- Generator: `scripts/build_platform_explained.py`

DOCX is the editable review format. PDF is the distribution format and must be regenerated from the DOCX rather than edited independently. Website copies are created from these canonical PDFs during the frontend build.

## Mandatory business boundary

```text
External Investor
  -> AgriPartners OÜ (Estonia)
  -> approved conversion and cleared fiat
  -> Uzbekistan Feedlot Operator under a separate written Operator Agreement
  -> Farmer / farm operations
```

- The investor interacts only with AgriPartners OÜ.
- Any supported crypto activity ends at AgriPartners OÜ in Estonia.
- The Uzbekistan Feedlot Operator and farmers receive and use fiat only; they do not use wallets.
- No financial provider is considered selected until company, partner, compliance, and legal approvals are complete.
- NEAR is limited to Estonia/investor-side technical records and never replaces contracts, banking, accounting, reconciliation, or other authoritative evidence.

The canonical business architecture is defined in the [Operating Model](../business/OPERATING_MODEL.md), the movement of funds in the [Financial Operating Model](../business/FINANCIAL_OPERATING_MODEL.md), and disclosure rules in the [Information Disclosure Policy](../business/INFORMATION_DISCLOSURE_POLICY.md).

## Positioning

AgriPartners is an Alpha v1.2 platform on NEAR Testnet. It is not a production investment platform, custody provider, live payout system, Mainnet financial system, or regulated investment product.

The public overview is intended for investors, strategic partners, accelerators, financial institutions, regulators, government organizations, the NEAR ecosystem, operators, and farmers.

## Related material

- [Feedlot Master Investment Model](../business/investment-models/FEEDLOT_MASTER_INVESTMENT_MODEL.md)
- [Hissar Sheep Master Investment Model](../business/investment-models/HISSAR_SHEEP_MASTER_INVESTMENT_MODEL.md)
- [Pilot 1.0 Plan](pilot/PILOT_1_PLAN.md)
- [Pilot Readiness Checklist](pilot/PILOT_READINESS_CHECKLIST.md)
- [Pilot Operations Guide](pilot/PILOT_OPERATIONS_GUIDE.md)
- [Investor Protection Framework](investor-protection/README.md) — exploratory and deferred; not active in Pilot 1.0, Pilot 2.0, or the initial Production Ready scope.
