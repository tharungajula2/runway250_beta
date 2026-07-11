export interface RetentionPoint {
  day: number;
  runwayCohort: number; // Runway 250 Target %
  industryMedian: number; // Category Median %
}

// Generate a smooth logarithmic/power-decay curve for Days 1-30
const generateCohortData = (): RetentionPoint[] => {
  const data: RetentionPoint[] = [];

  // Anchor points for Runway 250: Day 1: 38%, Day 7: 22%, Day 30: 14%
  // Anchor points for Industry Median: Day 1: 26%, Day 7: 13%, Day 30: 7%
  for (let day = 1; day <= 30; day++) {
    let runwayCohort = 0;
    let industryMedian = 0;

    if (day === 1) {
      runwayCohort = 38;
      industryMedian = 26;
    } else if (day <= 7) {
      // Interpolate between day 1 and 7
      const t = (day - 1) / 6;
      // Exponential decay interpolation
      runwayCohort = 38 - (38 - 22) * Math.pow(t, 0.7);
      industryMedian = 26 - (26 - 13) * Math.pow(t, 0.7);
    } else {
      // Interpolate between day 7 and 30
      const t = (day - 7) / 23;
      runwayCohort = 22 - (22 - 14) * Math.pow(t, 0.8);
      industryMedian = 13 - (13 - 7) * Math.pow(t, 0.8);
    }

    data.push({
      day,
      runwayCohort: Math.round(runwayCohort * 10) / 10,
      industryMedian: Math.round(industryMedian * 10) / 10,
    });
  }

  return data;
};

export const mockCohortData = generateCohortData();
