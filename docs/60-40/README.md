# 60/40 financial model source of truth

This directory contains the concise public briefs for the two AgriPartners 60/40 pilot models.

## Authority and publication

- Numeric and document source: `scripts/build_60_40_documents.py`.
- Editable canonical documents: `source/{en,ru}/*.docx`.
- Published canonical documents: `pdf/{en,ru}/*.pdf`.
- Website copies are generated during the frontend build by `frontend/scripts/sync-public-pdfs.mjs`; they are not tracked separately.

PDF files must not be edited independently. A financial change must update the generator, regenerate all EN/RU DOCX and PDF files, update tests, and be committed together.

## Mandatory business boundary

```text
External Investor
  -> AgriPartners OÜ (Estonia)
  -> approved conversion and cleared fiat
  -> Uzbekistan Feedlot Operator under a separate written Operator Agreement
  -> Farmer / farm operations
```

- Crypto activity stops at AgriPartners OÜ in Estonia.
- The Uzbekistan Feedlot Operator and farmers are fiat-only and use no wallets.
- NEAR is limited to the Estonia/investor-side technical record layer and never replaces contracts, bank records, accounting, reconciliation, or legal evidence.

## Canonical investor economics

| Pilot | Investment | Projected payout | Net ROI | Simple annualized ROI | Cycles | Duration |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Fidlot v5.9 | $50,000 | $82,000 | 64.0% | 21.9% | 7 | 35 months |
| Hissar / VariantB v2.1 | $50,000 | $81,672 | 63.3% | 21.1% | 6 | 36 months |

Simple annualized ROI divides total model ROI by model duration in years. It is not APR or IRR and does not account for compounding or interim-payment timing.

## Canonical operator outcomes

| Pilot | Projected cash | Projected property transfer | Projected total benefit |
| --- | ---: | ---: | ---: |
| Fidlot v5.9 | $96,250 | $18,000 | $114,250 |
| Hissar / VariantB v2.1 | $83,160 | $18,000 | $101,160 |

These are demonstration projections, not guarantees, offers, final legal terms, or evidence of completed payments. Reserve mechanics remain exploratory and require approved agreements, custody, loss, dispute, accounting, and release rules before production use.

## Public files

- Investor: `Agri-Investor-{Fidlot-v5.9,VariantB-v2.1}-6040-{EN,RU}.pdf`
- Uzbekistan operator: `Agri-Operator-{Fidlot-v5.9,VariantB-v2.1}-6040-{EN,RU}.pdf`

Every public PDF must use AgriPartners branding, disclose Alpha v1.2 status, preserve the mandatory boundary, and state that projections do not guarantee returns or constitute a public offer to invest.
