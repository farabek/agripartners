const {
  calculateDealFinancialSummary,
  calculatePortfolioFinancialSummary,
} = require('../src/services/financialService');

const nearToYocto = (amount) => `${BigInt(amount) * 10n ** 24n}`;

test('deal summary calculates projected profit, payout, recorded returns, and outstanding', () => {
  expect(calculateDealFinancialSummary({
    investmentAmountYocto: nearToYocto(100),
    projectedRoiPct: '20',
    returns: [{ amount_near: '30' }, { amount_near: '15.5' }],
  })).toEqual({
    investmentAmount: '100.00',
    projectedRoi: 20,
    projectedProfit: '20.00',
    projectedTotalPayout: '120.00',
    recordedReturns: '45.50',
    projectedOutstanding: '74.50',
    returnStatus: 'partial',
  });
});

test.each([
  [[], 'no_returns'],
  [[{ amount_near: '119.99' }], 'partial'],
  [[{ amount_near: '120' }], 'completed'],
  [[{ amount_near: '125' }], 'completed'],
])('deal summary derives return status from recorded returns', (returns, returnStatus) => {
  const summary = calculateDealFinancialSummary({
    investmentAmountYocto: nearToYocto(100),
    projectedRoiPct: '20',
    returns,
  });
  expect(summary.returnStatus).toBe(returnStatus);
});

test('deal summary floors projected outstanding at zero', () => {
  const summary = calculateDealFinancialSummary({
    investmentAmountYocto: nearToYocto(100),
    projectedRoiPct: '20',
    returns: [{ amount_near: '125' }],
  });
  expect(summary.projectedOutstanding).toBe('0.00');
});

test.each([
  [{ investmentAmountYocto: null, projectedRoiPct: '20' }, { investmentAmount: null, projectedRoi: 20 }],
  [{ investmentAmountYocto: nearToYocto(100), projectedRoiPct: null }, { investmentAmount: '100.00', projectedRoi: null }],
])('deal summary preserves unknown authoritative inputs as null', (input, expected) => {
  expect(calculateDealFinancialSummary({ ...input, returns: [] })).toEqual(expect.objectContaining({
    ...expected,
    projectedProfit: null,
    projectedTotalPayout: null,
    recordedReturns: '0.00',
    projectedOutstanding: null,
    returnStatus: null,
  }));
});

test('empty portfolio returns known zero totals without inventing weighted ROI', () => {
  expect(calculatePortfolioFinancialSummary([])).toEqual({
    totalInvested: '0.00',
    totalProjectedProfit: '0.00',
    totalProjectedPayout: '0.00',
    totalRecordedReturns: '0.00',
    totalOutstanding: '0.00',
    weightedProjectedRoi: null,
  });
});

test('mixed portfolio uses investment weighting instead of arithmetic average', () => {
  const summaries = [
    calculateDealFinancialSummary({ investmentAmountYocto: nearToYocto(100), projectedRoiPct: '10', returns: [] }),
    calculateDealFinancialSummary({ investmentAmountYocto: nearToYocto(300), projectedRoiPct: '30', returns: [] }),
  ];
  expect(calculatePortfolioFinancialSummary(summaries)).toEqual(expect.objectContaining({
    totalInvested: '400.00',
    totalProjectedProfit: '100.00',
    totalProjectedPayout: '500.00',
    weightedProjectedRoi: 25,
  }));
});

test('incomplete portfolio returns null for totals that include unknown values', () => {
  const summaries = [
    calculateDealFinancialSummary({ investmentAmountYocto: nearToYocto(100), projectedRoiPct: '20', returns: [] }),
    calculateDealFinancialSummary({ investmentAmountYocto: null, projectedRoiPct: '20', returns: [] }),
  ];
  expect(calculatePortfolioFinancialSummary(summaries)).toEqual({
    totalInvested: null,
    totalProjectedProfit: null,
    totalProjectedPayout: null,
    totalRecordedReturns: '0.00',
    totalOutstanding: null,
    weightedProjectedRoi: null,
  });
});
