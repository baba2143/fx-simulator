import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GoalType = 'daily' | 'weekly' | 'monthly';
export type GoalStatus = 'active' | 'completed' | 'failed' | 'paused';

export interface Goal {
  id: string;
  type: GoalType;
  targetAmount: number; // 目標損益額
  currentAmount: number; // 現在の損益額
  startDate: number; // タイムスタンプ
  endDate: number; // タイムスタンプ
  status: GoalStatus;
  description?: string;
  createdAt: number;
  completedAt?: number;
}

export interface GoalProgress {
  goalId: string;
  date: number;
  dailyProfit: number;
  cumulativeProfit: number;
  tradesCount: number;
  winRate: number;
}

export interface GoalState {
  goals: Goal[];
  goalProgress: GoalProgress[];
  activeGoals: {
    daily: Goal | null;
    weekly: Goal | null;
    monthly: Goal | null;
  };
  statistics: {
    totalGoalsCreated: number;
    goalsCompleted: number;
    goalsSuccessRate: number;
    bestStreak: number;
    currentStreak: number;
  };
  notifications: {
    enabled: boolean;
    achievementAlerts: boolean;
    progressReminders: boolean;
    deadlineWarnings: boolean;
  };
  loading: boolean;
  error: string | null;
}

const initialState: GoalState = {
  goals: [],
  goalProgress: [],
  activeGoals: {
    daily: null,
    weekly: null,
    monthly: null,
  },
  statistics: {
    totalGoalsCreated: 0,
    goalsCompleted: 0,
    goalsSuccessRate: 0,
    bestStreak: 0,
    currentStreak: 0,
  },
  notifications: {
    enabled: true,
    achievementAlerts: true,
    progressReminders: true,
    deadlineWarnings: true,
  },
  loading: false,
  error: null,
};

export const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    createGoal: (
      state,
      action: PayloadAction<Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>>,
    ) => {
      const goal: Goal = {
        ...action.payload,
        id: `goal_${Date.now()}`,
        currentAmount: 0,
        createdAt: Date.now(),
      };

      state.goals.push(goal);
      state.activeGoals[goal.type] = goal;
      state.statistics.totalGoalsCreated += 1;
    },

    updateGoalProgress: (
      state,
      action: PayloadAction<{
        goalId: string;
        profit: number;
        tradesCount: number;
        winRate: number;
      }>,
    ) => {
      const { goalId, profit, tradesCount, winRate } = action.payload;
      const goal = state.goals.find(g => g.id === goalId);

      if (goal) {
        goal.currentAmount = profit;

        // 進捗記録を追加
        const today = new Date().setHours(0, 0, 0, 0);
        const existingProgress = state.goalProgress.find(
          p => p.goalId === goalId && p.date === today,
        );

        if (existingProgress) {
          existingProgress.dailyProfit = profit;
          existingProgress.cumulativeProfit = profit;
          existingProgress.tradesCount = tradesCount;
          existingProgress.winRate = winRate;
        } else {
          state.goalProgress.push({
            goalId,
            date: today,
            dailyProfit: profit,
            cumulativeProfit: profit,
            tradesCount,
            winRate,
          });
        }

        // 目標達成チェック
        if (goal.status === 'active' && profit >= goal.targetAmount) {
          goal.status = 'completed';
          goal.completedAt = Date.now();
          state.statistics.goalsCompleted += 1;
          state.statistics.currentStreak += 1;

          if (state.statistics.currentStreak > state.statistics.bestStreak) {
            state.statistics.bestStreak = state.statistics.currentStreak;
          }

          // アクティブゴールから削除
          if (state.activeGoals[goal.type]?.id === goalId) {
            state.activeGoals[goal.type] = null;
          }
        } else if (goal.status === 'active' && Date.now() > goal.endDate) {
          // 期限切れチェック
          goal.status = 'failed';
          state.statistics.currentStreak = 0;

          if (state.activeGoals[goal.type]?.id === goalId) {
            state.activeGoals[goal.type] = null;
          }
        }

        // 成功率を計算
        const completedGoals = state.goals.filter(
          g => g.status === 'completed' || g.status === 'failed',
        ).length;
        if (completedGoals > 0) {
          state.statistics.goalsSuccessRate =
            (state.statistics.goalsCompleted / completedGoals) * 100;
        }
      }
    },

    pauseGoal: (state, action: PayloadAction<string>) => {
      const goal = state.goals.find(g => g.id === action.payload);
      if (goal && goal.status === 'active') {
        goal.status = 'paused';
      }
    },

    resumeGoal: (state, action: PayloadAction<string>) => {
      const goal = state.goals.find(g => g.id === action.payload);
      if (goal && goal.status === 'paused') {
        goal.status = 'active';
        state.activeGoals[goal.type] = goal;
      }
    },

    deleteGoal: (state, action: PayloadAction<string>) => {
      const goalId = action.payload;
      const goal = state.goals.find(g => g.id === goalId);

      if (goal) {
        state.goals = state.goals.filter(g => g.id !== goalId);
        state.goalProgress = state.goalProgress.filter(p => p.goalId !== goalId);

        // アクティブゴールから削除
        if (state.activeGoals[goal.type]?.id === goalId) {
          state.activeGoals[goal.type] = null;
        }
      }
    },

    updateGoal: (state, action: PayloadAction<{ id: string; updates: Partial<Goal> }>) => {
      const { id, updates } = action.payload;
      const goalIndex = state.goals.findIndex(g => g.id === id);

      if (goalIndex !== -1) {
        state.goals[goalIndex] = { ...state.goals[goalIndex], ...updates };

        // アクティブゴールも更新
        const goal = state.goals[goalIndex];
        if (state.activeGoals[goal.type]?.id === id) {
          state.activeGoals[goal.type] = goal;
        }
      }
    },

    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<GoalState['notifications']>>,
    ) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },

    resetStreak: state => {
      state.statistics.currentStreak = 0;
    },

    clearGoalHistory: state => {
      state.goals = state.goals.filter(g => g.status === 'active' || g.status === 'paused');
      state.goalProgress = [];
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    initializeGoals: (
      state,
      action: PayloadAction<{ goals: Goal[]; progress: GoalProgress[] }>,
    ) => {
      const { goals, progress } = action.payload;
      state.goals = goals;
      state.goalProgress = progress;

      // アクティブゴールを設定
      goals.forEach(goal => {
        if (goal.status === 'active') {
          state.activeGoals[goal.type] = goal;
        }
      });
    },
  },
});

export const {
  createGoal,
  updateGoalProgress,
  pauseGoal,
  resumeGoal,
  deleteGoal,
  updateGoal,
  updateNotificationSettings,
  resetStreak,
  clearGoalHistory,
  setLoading,
  setError,
  initializeGoals,
} = goalSlice.actions;

export default goalSlice.reducer;
