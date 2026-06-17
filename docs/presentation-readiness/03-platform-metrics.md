# Platform Metrics

## Scope

These metrics use the current AgriPartners Alpha v1 demo data only.

## Demo Portfolio Metrics

| Metric | Value |
|---|---:|
| Active Deals | `1` |
| Completed Deals | `1` |
| Total Capital Listed | `$100,000` |
| Total Capital Returned | `$82,000` |
| Average ROI | `63.7%` |
| Average APR | `21.5%` |

## Pilot Deal Inputs

| Deal | Capital Listed | Returned | ROI | APR | Status |
|---|---:|---:|---:|---:|---|
| Feedlot Livestock Project | `$50,000` | `$82,000` | `64%` | `21.9%` | Completed |
| Hissar Sheep Breeding Project | `$50,000` | `$0` | `63.3%` | `21.1%` | Active |

## Derived Calculations

Total Capital Listed:

```text
$50,000 + $50,000 = $100,000
```

Total Capital Returned:

```text
$82,000 + $0 = $82,000
```

Average ROI:

```text
(64.0% + 63.3%) / 2 = 63.65%, rounded to 63.7%
```

Average APR:

```text
(21.9% + 21.1%) / 2 = 21.5%
```

## Demo Interpretation

The metrics are intended for presentation and validation. They show the platform workflow and investor-facing visibility across one completed deal and one active deal. They should not be presented as live production portfolio performance.
