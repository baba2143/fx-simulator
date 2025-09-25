import { store } from '../store';
import {
  addHint,
  updateMarketCondition,
  generateMarketInsightHint,
  removeExpiredHints,
  HintType,
  HintPriority,
  MarketCondition,
} from '../store/slices/hintSlice';
import { PriceData } from '../types';
import {
  calculateRSI,
  calculateSMA,
  calculateEMA,
  calculateMACD,
} from '../utils/technicalIndicators';
import {
  generateTradingSignals,
  analyzeMarketCondition,
} from '../utils/marketAnalysis';

export class HintService {
  private static instance: HintService;
  private updateInterval: NodeJS.Timeout | null = null;
  private lastAnalysisTime: number = 0;

  static getInstance(): HintService {
    if (!HintService.instance) {
      HintService.instance = new HintService();
    }
    return HintService.instance;
  }

  start(): void {
    // 定期的にヒントを生成・更新
    this.updateInterval = setInterval(() => {
      this.updateHints();
    }, 30000); // 30秒間隔

    // 期限切れヒントを定期的にクリーンアップ
    setInterval(() => {
      store.dispatch(removeExpiredHints());
    }, 60000); // 1分間隔
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async updateHints(): Promise<void> {
    try {
      const state = store.getState();
      const { settings } = state.hints;
      const { priceData, selectedPair } = state.price;

      if (!settings.enabled || !priceData || priceData.length === 0) {
        return;
      }

      const currentTime = Date.now();
      const timeSinceLastAnalysis = currentTime - this.lastAnalysisTime;

      // 頻度設定に応じて分析頻度を調整
      const minInterval = {
        'real-time': 30000, // 30秒
        'moderate': 120000, // 2分
        'minimal': 300000, // 5分
      }[settings.frequency];

      if (timeSinceLastAnalysis < minInterval) {
        return;
      }

      this.lastAnalysisTime = currentTime;

      // 市場状況を分析
      const marketCondition = this.analyzeCurrentMarketCondition(priceData);
      store.dispatch(updateMarketCondition(marketCondition));

      // 各種ヒントを生成
      await Promise.all([
        this.generateTradingSignalHints(priceData, selectedPair),
        this.generateRiskWarningHints(priceData, selectedPair),
        this.generateMarketInsightHints(marketCondition, selectedPair),
        this.generateTechniqueTips(priceData),
        this.generateGoalProgressHints(),
        this.generatePerformanceImprovementHints(),
      ]);

    } catch (error) {
      console.error('Error updating hints:', error);
    }
  }

  private analyzeCurrentMarketCondition(priceData: PriceData[]): MarketCondition {
    const condition = analyzeMarketCondition(priceData);
    const rsiData = calculateRSI(priceData, 14);
    const latestRSI = rsiData[rsiData.length - 1];

    return {
      trend: condition.trend,
      volatility: condition.volatility,
      momentum: condition.momentum,
      rsiOverbought: latestRSI ? latestRSI.rsi > 70 : false,
      rsiOversold: latestRSI ? latestRSI.rsi < 30 : false,
      breakoutDetected: false, // TODO: ブレイクアウト検出ロジックを実装
      majorSupportResistance: condition.support !== null && condition.resistance !== null,
    };
  }

  private async generateTradingSignalHints(priceData: PriceData[], currencyPair: string): Promise<void> {
    const signals = generateTradingSignals(priceData);

    for (const signal of signals.slice(0, 2)) { // 最大2つのシグナル
      if (signal.confidence >= 70) { // 信頼度70%以上のみ
        store.dispatch(addHint({
          type: 'trading_signal',
          priority: signal.confidence >= 85 ? 'high' : 'medium',
          title: `${signal.type === 'buy' ? '買い' : '売り'}シグナル`,
          message: `${currencyPair}: ${signal.reason} (信頼度: ${signal.confidence}%)`,
          isActionable: true,
          actionText: 'チャートを確認',
          actionType: 'navigate',
          actionData: { screen: 'Chart', currencyPair },
          expiresAt: Date.now() + (15 * 60 * 1000), // 15分後に期限切れ
          metadata: {
            currencyPair,
            confidence: signal.confidence,
            relatedData: signal,
          },
        }));
      }
    }
  }

  private async generateRiskWarningHints(priceData: PriceData[], currencyPair: string): Promise<void> {
    const state = store.getState();
    const { data: accountData } = state.account;

    if (!accountData) return;

    // 残高リスク警告
    const balanceRisk = (accountData.balance / accountData.initialBalance) * 100;
    if (balanceRisk < 80) {
      store.dispatch(addHint({
        type: 'risk_warning',
        priority: balanceRisk < 60 ? 'critical' : 'high',
        title: 'リスク警告',
        message: `現在の残高が初期資金の${balanceRisk.toFixed(1)}%まで減少しています。リスク管理の見直しを検討してください。`,
        isActionable: true,
        actionText: '成績を確認',
        actionType: 'navigate',
        actionData: { screen: 'Performance' },
        expiresAt: Date.now() + (60 * 60 * 1000), // 1時間後に期限切れ
        metadata: {
          balanceRisk: 100 - balanceRisk,
        },
      }));
    }

    // 高ボラティリティ警告
    if (priceData.length >= 20) {
      const recent20 = priceData.slice(-20);
      const ranges = recent20.map(candle => candle.high - candle.low);
      const avgRange = ranges.reduce((sum, range) => sum + range, 0) / ranges.length;
      const currentRange = priceData[priceData.length - 1].high - priceData[priceData.length - 1].low;

      if (currentRange > avgRange * 1.5) {
        store.dispatch(addHint({
          type: 'risk_warning',
          priority: 'medium',
          title: '高ボラティリティ警告',
          message: `${currencyPair}の値動きが通常より激しくなっています。ポジションサイズの調整をご検討ください。`,
          isActionable: false,
          expiresAt: Date.now() + (30 * 60 * 1000),
          metadata: {
            currencyPair,
            volatilityRatio: currentRange / avgRange,
          },
        }));
      }
    }
  }

  private async generateMarketInsightHints(condition: MarketCondition, currencyPair: string): Promise<void> {
    // 市場分析ヒントを生成
    store.dispatch(generateMarketInsightHint({
      condition,
      currencyPair,
      confidence: 75,
    }));

    // トレンド変化の検出
    if (condition.momentum === 'strong') {
      const trendMessage = condition.trend === 'bullish'
        ? '強い上昇トレンドが継続中です。トレンドフォロー戦略が有効かもしれません。'
        : condition.trend === 'bearish'
        ? '強い下降トレンドが継続中です。逆張りよりもトレンドフォローを検討してください。'
        : '横ばい相場ですが、モメンタムが強まっています。ブレイクアウトの可能性に注意してください。';

      store.dispatch(addHint({
        type: 'market_insight',
        priority: 'medium',
        title: 'トレンド分析',
        message: `${currencyPair}: ${trendMessage}`,
        isActionable: true,
        actionText: 'インジケーターを確認',
        actionType: 'navigate',
        actionData: { screen: 'Chart', tab: 'indicators' },
        expiresAt: Date.now() + (45 * 60 * 1000),
        metadata: {
          currencyPair,
          trendData: condition,
        },
      }));
    }
  }

  private async generateTechniqueTips(priceData: PriceData[]): Promise<void> {
    const tips = [
      {
        title: 'RSI活用法',
        message: 'RSIが70を超えたら売り、30を下回ったら買いを検討する基本的な戦略です。ただし、強いトレンド中は逆張りは危険です。',
        actionText: 'RSIを表示',
        actionData: { screen: 'Chart', indicator: 'rsi' },
      },
      {
        title: 'ボリンジャーバンドの使い方',
        message: 'バンドの幅が狭くなった後の拡張は、大きな値動きの前兆です。ブレイクアウトのタイミングを見極めましょう。',
        actionText: 'ボリンジャーバンドを表示',
        actionData: { screen: 'Chart', indicator: 'bollinger' },
      },
      {
        title: 'MACD シグナル',
        message: 'MACDラインがシグナルラインを上抜けした時は買いシグナル、下抜けした時は売りシグナルとされます。',
        actionText: 'MACDを表示',
        actionData: { screen: 'Chart', indicator: 'macd' },
      },
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    const state = store.getState();

    // 同じタイプのヒントが既にある場合はスキップ
    const existingTechniqueTip = state.hints.hints.find(h =>
      h.type === 'technique_tip' &&
      h.title === randomTip.title &&
      !h.isRead
    );

    if (!existingTechniqueTip) {
      store.dispatch(addHint({
        type: 'technique_tip',
        priority: 'low',
        title: randomTip.title,
        message: randomTip.message,
        isActionable: true,
        actionText: randomTip.actionText,
        actionType: 'navigate',
        actionData: randomTip.actionData,
        expiresAt: Date.now() + (2 * 60 * 60 * 1000), // 2時間後に期限切れ
      }));
    }
  }

  private async generateGoalProgressHints(): Promise<void> {
    const state = store.getState();
    const { activeGoals } = state.goals;

    Object.entries(activeGoals).forEach(([period, goal]) => {
      if (!goal) return;

      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const remainingTime = goal.endDate - Date.now();
      const daysRemaining = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

      if (progress >= 80 && progress < 100) {
        store.dispatch(addHint({
          type: 'goal_progress',
          priority: 'medium',
          title: '目標達成まであと少し！',
          message: `${period}目標の${progress.toFixed(1)}%を達成しています。残り${daysRemaining}日で目標達成を目指しましょう！`,
          isActionable: true,
          actionText: '目標を確認',
          actionType: 'navigate',
          actionData: { screen: 'Goals' },
          expiresAt: goal.endDate,
          metadata: {
            goalId: goal.id,
            progress,
            daysRemaining,
          },
        }));
      } else if (daysRemaining <= 1 && progress < 90) {
        store.dispatch(addHint({
          type: 'goal_progress',
          priority: 'high',
          title: '目標期限が迫っています',
          message: `${period}目標の期限まで${daysRemaining}日です。現在の達成率は${progress.toFixed(1)}%です。`,
          isActionable: true,
          actionText: '目標を確認',
          actionType: 'navigate',
          actionData: { screen: 'Goals' },
          expiresAt: goal.endDate,
          metadata: {
            goalId: goal.id,
            progress,
            daysRemaining,
          },
        }));
      }
    });
  }

  private async generatePerformanceImprovementHints(): Promise<void> {
    const state = store.getState();
    const { learningProgress } = state.hints;

    // 学習スコアに基づいてヒントを生成
    if (learningProgress.learningScore < 50 && learningProgress.hintsActedUpon >= 5) {
      store.dispatch(addHint({
        type: 'performance_improvement',
        priority: 'medium',
        title: 'パフォーマンス向上のヒント',
        message: 'ヒントに基づく取引の成功率が低めです。より慎重に市場を分析してから行動することをお勧めします。',
        isActionable: true,
        actionText: '分析画面を確認',
        actionType: 'navigate',
        actionData: { screen: 'Performance' },
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24時間後に期限切れ
        metadata: {
          learningScore: learningProgress.learningScore,
        },
      }));
    } else if (learningProgress.learningScore >= 80) {
      store.dispatch(addHint({
        type: 'performance_improvement',
        priority: 'low',
        title: '素晴らしい成績です！',
        message: 'ヒントに基づく取引で高い成功率を維持しています。この調子で取引を続けましょう！',
        isActionable: false,
        expiresAt: Date.now() + (12 * 60 * 60 * 1000), // 12時間後に期限切れ
        metadata: {
          learningScore: learningProgress.learningScore,
        },
      }));
    }
  }

  // 手動でのヒント生成メソッド
  static generateCustomHint(
    type: HintType,
    priority: HintPriority,
    title: string,
    message: string,
    isActionable: boolean = false,
    actionText?: string,
    actionType?: 'navigate' | 'external' | 'modal',
    actionData?: any,
    expiresAt?: number,
    metadata?: any
  ): void {
    store.dispatch(addHint({
      type,
      priority,
      title,
      message,
      isActionable,
      actionText,
      actionType,
      actionData,
      expiresAt,
      metadata,
    }));
  }
}