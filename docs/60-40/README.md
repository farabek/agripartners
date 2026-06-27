# 60/40 financial model source of truth

This directory is the business source of truth for the two 60/40 pilot models.

## Canonical investor economics

| Pilot | Canonical document | Investment | Projected payout | ROI | APR | Cycles | Cycle duration |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Fidlot | `Agri-Investor-Fidlot-v5.9-6040.pdf` | $50,000 | $82,000 | 64.0% | 21.9% | 7 | 150 days / 5 months |
| Hissar / VariantB | `Agri-Investor-VariantB-v2.1-6040.pdf` | $50,000 | $81,672 | 63.3% | 21.1% | 6 | 180 days / 6 months |

Portfolio aggregates must be calculated from these model values:

- total pilot funding: $100,000;
- total projected payout: $163,672;
- completed Fidlot return: $82,000;
- active Hissar outstanding payout: $81,672.

## Derived material

- `Agri-Farmer-Fidlot-v5.9-6040.pdf` is the canonical farmer-facing payout view for Fidlot.
- `Agri-Farmer-VariantB-v2.1-6040.pdf` is the canonical farmer-facing payout view for Hissar / VariantB.
- `frontend/app.js` mirrors the canonical investor values in `INVESTOR_DEMO_PILOTS` for all platform demo surfaces.
- Other platform documentation and presentation material is derived and must not introduce independent financial values.

When values conflict, use the detailed cash-flow arithmetic in the applicable canonical PDF, then update the platform mirror, tests, and derived material together.
