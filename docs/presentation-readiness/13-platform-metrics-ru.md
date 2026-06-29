# Platform Metrics

## Scope

Эти metrics используют только текущие AgriPartners Alpha v1 demo data.

## Demo Portfolio Metrics

| Metric | Value |
|---|---:|
| Active Deals | `1` |
| Completed Deals | `1` |
| Total Capital Listed | `$100,000` |
| Total Capital Returned | `$82,000` |
| Average ROI | `63.7%` |
| Average simple annualized ROI | `21.5%` |

## Pilot Deal Inputs

| Deal | Capital Listed | Returned | ROI | simple annualized ROI | Status |
|---|---:|---:|---:|---:|---|
| Fidlot Livestock Project | `$50,000` | `$82,000` | `64%` | `21.9%` | Completed |
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

Average simple annualized ROI:

```text
(21.9% + 21.1%) / 2 = 21.5%
```

## Demo Interpretation

Metrics предназначены для presentation и validation. Они показывают platform workflow и investor-facing visibility across one completed deal and one active deal. Их не следует представлять как live production portfolio performance.
