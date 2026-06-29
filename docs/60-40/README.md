# 60/40 financial model source of truth

This directory is the business source of truth for the two AgriPartners 60/40 pilot models.

## Authority and file structure

- Numeric source: `scripts/build_60_40_documents.py`.
- Editable canonical documents: `source/en/*.docx` and `source/ru/*.docx`.
- Published documents: `pdf/en/*.pdf` and `pdf/ru/*.pdf`.
- Platform copies: `frontend/public/assets/financial-models/{en,ru}/*.pdf`.

PDF files are generated from the DOCX documents and must not be edited independently. A financial change must update the numeric source, regenerate all RU/EN DOCX and PDF files, update the platform mirror and tests, and be committed together.

## Canonical investor economics

| Pilot | Investment | Projected payout | Net ROI | Simple annualized ROI | Cycles | Cycle duration |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Fidlot v5.9 | $50,000 | $82,000 | 64.0% | 21.9% | 7 | 5 months |
| Hissar / VariantB v2.1 | $50,000 | $81,672 | 63.3% | 21.1% | 6 | 6 months |

Simple annualized ROI is calculated as total model ROI divided by the model duration in years. It does not account for compounding or the timing of interim payments and must not be interpreted as APR or IRR.

Portfolio aggregates:

- total pilot funding: $100,000;
- total projected payout: $163,672;
- completed Fidlot return: $82,000;
- active Hissar outstanding payout: $81,672.

## Canonical farmer outcomes

| Pilot | Cash received | Property transferred | Total projected benefit |
| --- | ---: | ---: | ---: |
| Fidlot v5.9 | $96,250 | $18,000 | $114,250 |
| Hissar / VariantB v2.1 | $83,160 | $18,000 | $101,160 |

These farmer cash outcomes use the modeled no-Confirmed-Loss schedule and include release of the full unused reserve.

## Canonical protection reserve

| Pilot | Rate from farmer share | Scheduled contributions | Minimum until completion |
| --- | ---: | ---: | ---: |
| Fidlot v5.9 | 44% | $50,820 | $10,000 |
| Hissar / VariantB v2.1 | 53% | $50,752.80 | $10,000 |

After each successful cycle, the modeled release is the amount above
`max($10,000; $50,000 − investor cash actually received)`. Investor cash includes profit distributions and capital returns. In VariantB cycles 3–6, $2,500 per cycle is returned before the 60/40 split as partial capital return, without a Performance Fee.

The schedule is not insurance or a guarantee. A Confirmed Loss, overdue mandatory report, default, or open dispute may reduce or suspend release. The financial model does not determine legal ownership while reserve funds are locked.

## Publication policy

Public PDFs must use AgriPartners branding, contain no “Confidential” label, and include the disclaimer that figures are projections, do not guarantee returns, and do not constitute a public offer to invest. Legal review remains a separate pre-production requirement.
