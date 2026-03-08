export const SA_RETIREMENT_LUMP_SUM_TAX_2024 = [
  { limit: 550000, rate: 0, deduction: 0 },
  { limit: 770000, rate: 0.18, deduction: 99000 },
  { limit: 1155000, rate: 0.27, deduction: 168300 },
  { limit: Infinity, rate: 0.36, deduction: 272250 },
];

export const calculateSATax = (lumpSum: number) => {
  const bracket = SA_RETIREMENT_LUMP_SUM_TAX_2024.find((b) => lumpSum <= b.limit) || SA_RETIREMENT_LUMP_SUM_TAX_2024[3];
  return (lumpSum * bracket.rate) - bracket.deduction;
};

export const NL_AOW_AGE = 67;
export const NL_AOW_MONTHLY_SINGLE = 1459.53;

export const DE_PENSION_POINT_VALUE = 39.32;
