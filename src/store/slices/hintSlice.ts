import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type HintType =
  | 'trading_signal'
  | 'risk_warning'
  | 'market_insight'
  | 'technique_tip'
  | 'goal_progress'
  | 'performance_improvement';

export type HintPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Hint {
  id: string;
  type: HintType;
  priority: HintPriority;
  title: string;
  message: string;
  actionText?: string;
  actionType?: 'navigate' | 'external' | 'modal';
  actionData?: any;
  createdAt: number;
  expiresAt?: number;
  isRead: boolean;
  isActionable: boolean;
  metadata?: {
    currencyPair?: string;
    indicatorName?: string;
    goalId?: string;
    confidence?: number; // 0-100
    relatedData?: any;
  };
}

export interface MarketCondition {
  trend: 'bullish' | 'bearish' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  momentum: 'strong' | 'weak' | 'neutral';
  rsiOverbought: boolean;
  rsiOversold: boolean;
  breakoutDetected: boolean;
  majorSupportResistance: boolean;
}

export interface LearningProgress {
  totalHintsViewed: number;
  hintsActedUpon: number;
  successfulActions: number;
  preferredHintTypes: HintType[];
  learningScore: number; // 0-100
  lastLearningUpdate: number;
}

export interface HintState {
  hints: Hint[];
  currentMarketCondition: MarketCondition | null;
  learningProgress: LearningProgress;
  settings: {
    enabled: boolean;
    autoShow: boolean;
    priority: HintPriority[];
    types: HintType[];
    frequency: 'real-time' | 'moderate' | 'minimal';
    showOnlyActionable: boolean;
  };
  displayState: {
    currentHint: Hint | null;
    hintHistory: Hint[];
    unreadCount: number;
    lastShownAt: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: HintState = {
  hints: [],
  currentMarketCondition: null,
  learningProgress: {
    totalHintsViewed: 0,
    hintsActedUpon: 0,
    successfulActions: 0,
    preferredHintTypes: [],
    learningScore: 0,
    lastLearningUpdate: 0,
  },
  settings: {
    enabled: true,
    autoShow: true,
    priority: ['critical', 'high', 'medium', 'low'],
    types: [
      'trading_signal',
      'risk_warning',
      'market_insight',
      'technique_tip',
      'goal_progress',
      'performance_improvement',
    ],
    frequency: 'moderate',
    showOnlyActionable: false,
  },
  displayState: {
    currentHint: null,
    hintHistory: [],
    unreadCount: 0,
    lastShownAt: 0,
  },
  loading: false,
  error: null,
};

export const hintSlice = createSlice({
  name: 'hints',
  initialState,
  reducers: {
    addHint: (state, action: PayloadAction<Omit<Hint, 'id' | 'createdAt' | 'isRead'>>) => {
      const hint: Hint = {
        ...action.payload,
        id: `hint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        isRead: false,
      };

      // 重複チェック（同じタイプ・メッセージの場合は更新）
      const existingIndex = state.hints.findIndex(
        h => h.type === hint.type && h.message === hint.message && !h.isRead,
      );

      if (existingIndex !== -1) {
        state.hints[existingIndex] = {
          ...state.hints[existingIndex],
          ...hint,
          id: state.hints[existingIndex].id,
        };
      } else {
        state.hints.push(hint);
      }

      // 優先度順にソート
      state.hints.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority] || b.createdAt - a.createdAt;
      });

      // 古いヒントを削除（最大50件）
      state.hints = state.hints.slice(0, 50);

      // 未読カウント更新
      state.displayState.unreadCount = state.hints.filter(h => !h.isRead).length;

      // 自動表示設定の場合、現在のヒントを設定
      if (state.settings.autoShow && !state.displayState.currentHint) {
        const nextHint = state.hints.find(h => !h.isRead && state.settings.types.includes(h.type));
        if (nextHint) {
          state.displayState.currentHint = nextHint;
        }
      }
    },

    markHintAsRead: (state, action: PayloadAction<string>) => {
      const hint = state.hints.find(h => h.id === action.payload);
      if (hint && !hint.isRead) {
        hint.isRead = true;
        state.learningProgress.totalHintsViewed += 1;

        // 未読カウント更新
        state.displayState.unreadCount = state.hints.filter(h => !h.isRead).length;

        // 現在のヒントをクリア
        if (state.displayState.currentHint?.id === action.payload) {
          state.displayState.currentHint = null;
        }
      }
    },

    markHintActionTaken: (
      state,
      action: PayloadAction<{ hintId: string; successful: boolean }>,
    ) => {
      const { hintId, successful } = action.payload;
      const hint = state.hints.find(h => h.id === hintId);

      if (hint) {
        state.learningProgress.hintsActedUpon += 1;
        if (successful) {
          state.learningProgress.successfulActions += 1;
        }

        // 学習スコア更新
        const successRate =
          state.learningProgress.hintsActedUpon > 0
            ? (state.learningProgress.successfulActions / state.learningProgress.hintsActedUpon) *
              100
            : 0;
        state.learningProgress.learningScore = successRate;
        state.learningProgress.lastLearningUpdate = Date.now();

        // 好みのヒントタイプを学習
        if (successful) {
          const existingIndex = state.learningProgress.preferredHintTypes.indexOf(hint.type);
          if (existingIndex !== -1) {
            // 既存のタイプを先頭に移動
            state.learningProgress.preferredHintTypes.splice(existingIndex, 1);
          }
          state.learningProgress.preferredHintTypes.unshift(hint.type);
          // 最大5つまで保持
          state.learningProgress.preferredHintTypes =
            state.learningProgress.preferredHintTypes.slice(0, 5);
        }
      }
    },

    dismissHint: (state, action: PayloadAction<string>) => {
      const hint = state.hints.find(h => h.id === action.payload);
      if (hint) {
        hint.isRead = true;
        state.displayState.unreadCount = state.hints.filter(h => !h.isRead).length;

        if (state.displayState.currentHint?.id === action.payload) {
          state.displayState.currentHint = null;
        }
      }
    },

    showNextHint: state => {
      const nextHint = state.hints.find(
        h =>
          !h.isRead &&
          state.settings.types.includes(h.type) &&
          state.settings.priority.includes(h.priority),
      );

      if (nextHint) {
        state.displayState.currentHint = nextHint;
        state.displayState.lastShownAt = Date.now();
      }
    },

    setCurrentHint: (state, action: PayloadAction<Hint | null>) => {
      state.displayState.currentHint = action.payload;
      if (action.payload) {
        state.displayState.lastShownAt = Date.now();
      }
    },

    updateMarketCondition: (state, action: PayloadAction<MarketCondition>) => {
      state.currentMarketCondition = action.payload;
    },

    updateSettings: (state, action: PayloadAction<Partial<HintState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    clearHintHistory: state => {
      state.hints = state.hints.filter(h => !h.isRead);
      state.displayState.hintHistory = [];
    },

    removeExpiredHints: state => {
      const now = Date.now();
      state.hints = state.hints.filter(h => !h.expiresAt || h.expiresAt > now);
      state.displayState.unreadCount = state.hints.filter(h => !h.isRead).length;

      // 現在のヒントが期限切れの場合はクリア
      if (
        state.displayState.currentHint &&
        state.displayState.currentHint.expiresAt &&
        state.displayState.currentHint.expiresAt <= now
      ) {
        state.displayState.currentHint = null;
      }
    },

    generateMarketInsightHint: (
      state,
      action: PayloadAction<{
        condition: MarketCondition;
        currencyPair: string;
        confidence: number;
      }>,
    ) => {
      const { condition, currencyPair, confidence } = action.payload;

      let message = '';
      let priority: HintPriority = 'medium';

      if (condition.rsiOverbought) {
        message = `${currencyPair}のRSIが買われすぎ領域です。売りを検討するタイミングかもしれません。`;
        priority = 'high';
      } else if (condition.rsiOversold) {
        message = `${currencyPair}のRSIが売られすぎ領域です。買いを検討するタイミングかもしれません。`;
        priority = 'high';
      } else if (condition.breakoutDetected) {
        message = `${currencyPair}でブレイクアウトが検出されました。トレンドフォローの機会かもしれません。`;
        priority = 'critical';
      } else if (condition.volatility === 'high') {
        message = `${currencyPair}の値動きが激しくなっています。リスク管理にご注意ください。`;
        priority = 'high';
      }

      if (message) {
        const hint: Omit<Hint, 'id' | 'createdAt' | 'isRead'> = {
          type: 'market_insight',
          priority,
          title: 'マーケット分析',
          message,
          isActionable: true,
          actionText: 'チャートを確認',
          actionType: 'navigate',
          actionData: { screen: 'Chart', currencyPair },
          expiresAt: Date.now() + 30 * 60 * 1000, // 30分後に期限切れ
          metadata: {
            currencyPair,
            confidence,
            relatedData: condition,
          },
        };

        // 重複チェック
        const existingHint = state.hints.find(
          h => h.type === hint.type && h.metadata?.currencyPair === currencyPair && !h.isRead,
        );

        if (!existingHint) {
          // addHint ロジックを直接実行
          const newHint: Hint = {
            ...hint,
            id: `hint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            isRead: false,
          };

          state.hints.push(newHint);
          state.hints.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return (
              priorityOrder[b.priority] - priorityOrder[a.priority] || b.createdAt - a.createdAt
            );
          });
          state.hints = state.hints.slice(0, 50);
          state.displayState.unreadCount = state.hints.filter(h => !h.isRead).length;
        }
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    resetHints: () => initialState,
  },
});

export const {
  addHint,
  markHintAsRead,
  markHintActionTaken,
  dismissHint,
  showNextHint,
  setCurrentHint,
  updateMarketCondition,
  updateSettings,
  clearHintHistory,
  removeExpiredHints,
  generateMarketInsightHint,
  setLoading,
  setError,
  resetHints,
} = hintSlice.actions;

export default hintSlice.reducer;
