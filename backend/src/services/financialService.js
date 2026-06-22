const YOCTO_PER_NEAR = 10n ** 24n;
const ROI_SCALE = 10000n;
const PERCENT_DENOMINATOR = 100n * ROI_SCALE;

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function parseNearToYocto(value) {
  const raw = String(value ?? '').trim();
  if (!/^\d+(\.\d{1,24})?$/.test(raw)) {
    throw new Error('amount_near must be a valid NEAR amount');
  }
  const [whole, fraction = ''] = raw.split('.');
  return BigInt(whole) * YOCTO_PER_NEAR + BigInt(fraction.padEnd(24, '0'));
}

function parseStoredYocto(value) {
  if (!hasValue(value)) return null;
  const raw = String(value).trim();
  if (!/^\d+$/.test(raw)) throw new Error('investment_amount must be a valid yoctoNEAR amount');
  return BigInt(raw);
}

function formatYoctoToNear(value) {
  const yocto = BigInt(value);
  const whole = yocto / YOCTO_PER_NEAR;
  const fraction = yocto % YOCTO_PER_NEAR;
  const fractionText = fraction.toString().padStart(24, '0').replace(/0+$/, '');
  return `${whole}.${(fractionText || '').padEnd(2, '0')}`;
}

function parseProjectedRoiPct(value) {
  if (!hasValue(value)) return null;
  const raw = String(value).trim();
  if (!/^\d+(\.\d{1,4})?$/.test(raw)) {
    throw new Error('projected_roi_pct must be a valid percentage with up to 4 decimal places');
  }
  const [whole, fraction = ''] = raw.split('.');
  return BigInt(whole) * ROI_SCALE + BigInt(fraction.padEnd(4, '0'));
}

function formatProjectedRoiPct(scaled) {
  if (scaled == null) return null;
  const whole = scaled / ROI_SCALE;
  const fraction = (scaled % ROI_SCALE).toString().padStart(4, '0').replace(/0+$/, '');
  return Number(`${whole}${fraction ? `.${fraction}` : ''}`);
}

function financialReturnStatus(recordedYocto, projectedPayoutYocto) {
  if (projectedPayoutYocto == null) return null;
  if (recordedYocto <= 0n) return 'no_returns';
  if (recordedYocto < projectedPayoutYocto) return 'partial';
  return 'completed';
}

function countsTowardRecordedReturns(entry) {
  const entryType = entry.entry_type ?? null;
  return entryType === null || entryType === 'principal' || entryType === 'profit';
}

function calculateDealFinancialSummary({ investmentAmountYocto, projectedRoiPct, returns = [] }) {
  const investmentYocto = parseStoredYocto(investmentAmountYocto);
  const projectedRoiScaled = parseProjectedRoiPct(projectedRoiPct);
  const recordedYocto = returns.filter(countsTowardRecordedReturns).reduce(
    (sum, entry) => sum + parseNearToYocto(entry.amount_near),
    0n
  );
  const hasProjection = investmentYocto != null && projectedRoiScaled != null;
  const projectedProfitYocto = hasProjection
    ? investmentYocto * projectedRoiScaled / PERCENT_DENOMINATOR
    : null;
  const projectedPayoutYocto = hasProjection
    ? investmentYocto + projectedProfitYocto
    : null;
  const outstandingYocto = projectedPayoutYocto == null
    ? null
    : (projectedPayoutYocto > recordedYocto ? projectedPayoutYocto - recordedYocto : 0n);

  return {
    investmentAmount: investmentYocto == null ? null : formatYoctoToNear(investmentYocto),
    projectedRoi: formatProjectedRoiPct(projectedRoiScaled),
    projectedProfit: projectedProfitYocto == null ? null : formatYoctoToNear(projectedProfitYocto),
    projectedTotalPayout: projectedPayoutYocto == null ? null : formatYoctoToNear(projectedPayoutYocto),
    recordedReturns: formatYoctoToNear(recordedYocto),
    projectedOutstanding: outstandingYocto == null ? null : formatYoctoToNear(outstandingYocto),
    returnStatus: financialReturnStatus(recordedYocto, projectedPayoutYocto),
  };
}

function sumKnownNear(summaries, field) {
  if (!summaries.every((summary) => hasValue(summary[field]))) return null;
  return summaries.reduce((sum, summary) => sum + parseNearToYocto(summary[field]), 0n);
}

function calculatePortfolioFinancialSummary(summaries = []) {
  if (!summaries.length) {
    return {
      totalInvested: '0.00',
      totalProjectedProfit: '0.00',
      totalProjectedPayout: '0.00',
      totalRecordedReturns: '0.00',
      totalOutstanding: '0.00',
      weightedProjectedRoi: null,
    };
  }

  const totalInvestedYocto = sumKnownNear(summaries, 'investmentAmount');
  const totalProjectedProfitYocto = sumKnownNear(summaries, 'projectedProfit');
  const totalProjectedPayoutYocto = sumKnownNear(summaries, 'projectedTotalPayout');
  const totalRecordedReturnsYocto = sumKnownNear(summaries, 'recordedReturns');
  const totalOutstandingYocto = sumKnownNear(summaries, 'projectedOutstanding');
  const canWeightRoi = totalInvestedYocto != null
    && totalInvestedYocto > 0n
    && summaries.every((summary) => summary.projectedRoi != null);
  const weightedRoiScaled = canWeightRoi
    ? summaries.reduce(
      (sum, summary) => sum + parseNearToYocto(summary.investmentAmount) * parseProjectedRoiPct(summary.projectedRoi),
      0n
    ) / totalInvestedYocto
    : null;

  return {
    totalInvested: totalInvestedYocto == null ? null : formatYoctoToNear(totalInvestedYocto),
    totalProjectedProfit: totalProjectedProfitYocto == null ? null : formatYoctoToNear(totalProjectedProfitYocto),
    totalProjectedPayout: totalProjectedPayoutYocto == null ? null : formatYoctoToNear(totalProjectedPayoutYocto),
    totalRecordedReturns: totalRecordedReturnsYocto == null ? null : formatYoctoToNear(totalRecordedReturnsYocto),
    totalOutstanding: totalOutstandingYocto == null ? null : formatYoctoToNear(totalOutstandingYocto),
    weightedProjectedRoi: formatProjectedRoiPct(weightedRoiScaled),
  };
}

module.exports = {
  parseNearToYocto,
  formatYoctoToNear,
  calculateDealFinancialSummary,
  calculatePortfolioFinancialSummary,
};
