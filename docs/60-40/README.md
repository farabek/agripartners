# 60/40 financial model source of truth

This directory is the business source of truth for the two AgriPartners 60/40 pilot models.

## Authority and file structure

- Numeric source: `scripts/build_60_40_documents.py`.
- Editable canonical documents: `source/en/*.docx` and `source/ru/*.docx`.
- Published documents: `pdf/en/*.pdf` and `pdf/ru/*.pdf`.
- Platform copies: `frontend/public/assets/financial-models/{en,ru}/*.pdf`.

PDF files are generated from the DOCX documents and must not be edited independently. A financial change must update the numeric source, regenerate all RU/EN DOCX and PDF files, update the platform mirror and tests, and be committed together.

## Canonical investor economics

| Pilot | Investment | Projected payout | Net ROI | Annual APR | Cycles | Cycle duration |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Fidlot v5.9 | $50,000 | $82,000 | 64.0% | 21.9% | 7 | 5 months |
| Hissar / VariantB v2.1 | $50,000 | $81,672 | 63.3% | 21.1% | 6 | 6 months |

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

## Publication policy

Public PDFs must use AgriPartners branding, contain no “Confidential” label, and include the disclaimer that figures are projections, do not guarantee returns, and do not constitute a public offer to invest. Legal review remains a separate pre-production requirement.
