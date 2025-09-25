import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RankingPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time';
export type RankingCategory = 'profit' | 'winRate' | 'profitFactor' | 'consistency' | 'riskReward';

export interface PersonalRecord {
  id: string;
  category: RankingCategory;
  value: number;
  achievedAt: number;
  period: RankingPeriod;
  description: string;
  previousBest?: number;
  improvement?: number; // パーセンテージ
  metadata?: {
    tradesCount?: number;
    currencyPair?: string;
    timeFrame?: string;
    goalId?: string;
  };
}

export interface RankingEntry {
  rank: number;
  period: RankingPeriod;
  category: RankingCategory;
  value: number;
  date: number;
  relatedGoalId?: string;
  badge?: string;
}

export interface PerformanceMetrics {
  totalProfit: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  consistencyScore: number;
  averageRiskReward: number;
  tradesCount: number;
  period: RankingPeriod;
  calculatedAt: number;
}

export interface RankingState {
  personalRecords: PersonalRecord[];
  rankings: { [key in RankingPeriod]: { [key in RankingCategory]: RankingEntry[] } };
  currentMetrics: { [key in RankingPeriod]: PerformanceMetrics | null };
  achievements: {
    newRecord: boolean;
    rankImprovement: boolean;
    consistencyMilestone: boolean;
    profitMilestone: boolean;
  };
  comparisonData: {
    periodComparison: { period: RankingPeriod; metrics: PerformanceMetrics | null }[];
    categoryComparison: { category: RankingCategory; current: number; best: number }[];
  };
  loading: boolean;
  error: string | null;
}

const createEmptyRankings = (): { [key in RankingPeriod]: { [key in RankingCategory]: RankingEntry[] } } => {
  const periods: RankingPeriod[] = ['daily', 'weekly', 'monthly', 'yearly', 'all-time'];
  const categories: RankingCategory[] = ['profit', 'winRate', 'profitFactor', 'consistency', 'riskReward'];

  const rankings: any = {};
  periods.forEach(period => {
    rankings[period] = {};
    categories.forEach(category => {
      rankings[period][category] = [];
    });
  });

  return rankings;
};

const createEmptyMetrics = (): { [key in RankingPeriod]: PerformanceMetrics | null } => {
  const periods: RankingPeriod[] = ['daily', 'weekly', 'monthly', 'yearly', 'all-time'];
  const metrics: any = {};
  periods.forEach(period => {
    metrics[period] = null;
  });
  return metrics;
};

const initialState: RankingState = {
  personalRecords: [],
  rankings: createEmptyRankings(),
  currentMetrics: createEmptyMetrics(),
  achievements: {
    newRecord: false,
    rankImprovement: false,
    consistencyMilestone: false,
    profitMilestone: false,
  },
  comparisonData: {
    periodComparison: [],
    categoryComparison: [],
  },
  loading: false,
  error: null,
};

export const rankingSlice = createSlice({
  name: 'ranking',
  initialState,
  reducers: {
    addPersonalRecord: (state, action: PayloadAction<Omit<PersonalRecord, 'id'>>) => {
      const record: PersonalRecord = {
        ...action.payload,
        id: `record_${Date.now()}_${action.payload.category}`,
      };

      // 同じカテゴリ・期間の古い記録を削除
      state.personalRecords = state.personalRecords.filter(
        r => !(r.category === record.category && r.period === record.period)
      );

      state.personalRecords.push(record);
      state.achievements.newRecord = true;

      // 記録を日時順にソート
      state.personalRecords.sort((a, b) => b.achievedAt - a.achievedAt);
    },

    updateRanking: (state, action: PayloadAction<{ period: RankingPeriod; category: RankingCategory; entries: RankingEntry[] }>) => {
      const { period, category, entries } = action.payload;
      state.rankings[period][category] = entries.sort((a, b) => a.rank - b.rank);
    },

    setCurrentMetrics: (state, action: PayloadAction<{ period: RankingPeriod; metrics: PerformanceMetrics }>) => {
      const { period, metrics } = action.payload;
      state.currentMetrics[period] = metrics;
    },

    updateAchievements: (state, action: PayloadAction<Partial<RankingState['achievements']>>) => {
      state.achievements = { ...state.achievements, ...action.payload };
    },

    clearAchievements: (state) => {
      state.achievements = {
        newRecord: false,
        rankImprovement: false,
        consistencyMilestone: false,
        profitMilestone: false,
      };
    },

    setPeriodComparison: (state, action: PayloadAction<{ period: RankingPeriod; metrics: PerformanceMetrics | null }[]>) => {
      state.comparisonData.periodComparison = action.payload;
    },

    setCategoryComparison: (state, action: PayloadAction<{ category: RankingCategory; current: number; best: number }[]>) => {
      state.comparisonData.categoryComparison = action.payload;
    },

    calculateConsistencyScore: (state, action: PayloadAction<{ period: RankingPeriod; dailyReturns: number[] }>) => {
      const { period, dailyReturns } = action.payload;

      if (dailyReturns.length === 0) return;

      // シャープレシオ的な一貫性スコアを計算
      const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
      const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length;
      const stdDev = Math.sqrt(variance);

      const consistencyScore = stdDev > 0 ? (avgReturn / stdDev) * 100 : 0;

      if (state.currentMetrics[period]) {
        state.currentMetrics[period]!.consistencyScore = Math.max(0, Math.min(100, consistencyScore + 50)); // 0-100スケール
      }
    },

    updatePersonalBest: (state, action: PayloadAction<{ category: RankingCategory; period: RankingPeriod; newValue: number; description: string }>) => {
      const { category, period, newValue, description } = action.payload;

      // 既存の記録を検索
      const existingRecord = state.personalRecords.find(r => r.category === category && r.period === period);

      if (!existingRecord || newValue > existingRecord.value) {
        const previousBest = existingRecord?.value || 0;
        const improvement = previousBest > 0 ? ((newValue - previousBest) / previousBest) * 100 : 100;

        const record: PersonalRecord = {
          id: `record_${Date.now()}_${category}_${period}`,
          category,
          value: newValue,
          achievedAt: Date.now(),
          period,
          description,
          previousBest,
          improvement,
        };

        // 古い記録を削除
        state.personalRecords = state.personalRecords.filter(
          r => !(r.category === category && r.period === period)
        );

        state.personalRecords.push(record);
        state.achievements.newRecord = true;
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    initializeRanking: (state, action: PayloadAction<{ records: PersonalRecord[]; metrics: { [key in RankingPeriod]: PerformanceMetrics | null } }>) => {
      const { records, metrics } = action.payload;
      state.personalRecords = records.sort((a, b) => b.achievedAt - a.achievedAt);
      state.currentMetrics = metrics;
    },

    resetRanking: () => initialState,
  },
});

export const {
  addPersonalRecord,
  updateRanking,
  setCurrentMetrics,
  updateAchievements,
  clearAchievements,
  setPeriodComparison,
  setCategoryComparison,
  calculateConsistencyScore,
  updatePersonalBest,
  setLoading,
  setError,
  initializeRanking,
  resetRanking,
} = rankingSlice.actions;

export default rankingSlice.reducer;