import { PriceData } from '../types';
import { calculateRSI, calculateSMA, calculateEMA, calculateMACD } from './technicalIndicators';

export interface TradingSignal {
  type: 'buy' | 'sell' | 'neutral';
  strength: 'weak' | 'medium' | 'strong';
  reason: string;
  confidence: number; // 0-100
  timestamp: number;
  price: number;
}

export interface MarketCondition {
  trend: 'bullish' | 'bearish' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  momentum: 'increasing' | 'decreasing' | 'stable';
  support: number | null;
  resistance: number | null;
}

export interface PatternDetection {
  name: string;
  type: 'reversal' | 'continuation';
  reliability: number; // 0-100
  description: string;
  targetPrice?: number;
  stopLoss?: number;
}

/**
 * 市場状況を分析
 */
export const analyzeMarketCondition = (data: PriceData[]): MarketCondition => {
  if (data.length < 20) {
    return {
      trend: 'sideways',
      volatility: 'medium',
      momentum: 'stable',
      support: null,
      resistance: null,
    };
  }

  const recent20 = data.slice(-20);
  const recent50 = data.slice(-50);

  // トレンド分析
  const sma20 = calculateSMA(data, 20);
  const sma50 = calculateSMA(data, 50);

  let trend: 'bullish' | 'bearish' | 'sideways' = 'sideways';

  if (sma20.length > 0 && sma50.length > 0) {
    const latestSma20 = sma20[sma20.length - 1].value;
    const latestSma50 = sma50[sma50.length - 1].value;
    const currentPrice = data[data.length - 1].close;

    if (currentPrice > latestSma20 && latestSma20 > latestSma50) {
      trend = 'bullish';
    } else if (currentPrice < latestSma20 && latestSma20 < latestSma50) {
      trend = 'bearish';
    }
  }

  // ボラティリティ分析（ATR的な計算）
  const trueRanges = recent20.slice(1).map((candle, index) => {
    const prevClose = recent20[index].close;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - prevClose),
      Math.abs(candle.low - prevClose),
    );
  });

  const atr = trueRanges.reduce((sum, tr) => sum + tr, 0) / trueRanges.length;
  const currentPrice = data[data.length - 1].close;
  const volatilityPercent = (atr / currentPrice) * 100;

  let volatility: 'low' | 'medium' | 'high' = 'medium';
  if (volatilityPercent < 0.5) {
    volatility = 'low';
  } else if (volatilityPercent > 1.5) {
    volatility = 'high';
  }

  // モメンタム分析
  const momentum = analyzeMomentum(data);

  // サポート・レジスタンス
  const { support, resistance } = findSupportResistance(recent50);

  return {
    trend,
    volatility,
    momentum,
    support,
    resistance,
  };
};

/**
 * トレーディングシグナルを生成
 */
export const generateTradingSignals = (data: PriceData[]): TradingSignal[] => {
  if (data.length < 50) {
    return [];
  }

  const signals: TradingSignal[] = [];
  const currentPrice = data[data.length - 1];

  // RSI分析
  const rsiSignal = analyzeRSI(data);
  if (rsiSignal) {
    signals.push(rsiSignal);
  }

  // MACD分析
  const macdSignal = analyzeMACD(data);
  if (macdSignal) {
    signals.push(macdSignal);
  }

  // 移動平均クロスオーバー
  const maSignal = analyzeMovingAverageCrossover(data);
  if (maSignal) {
    signals.push(maSignal);
  }

  // サポート・レジスタンスブレイクアウト
  const breakoutSignal = analyzeBreakout(data);
  if (breakoutSignal) {
    signals.push(breakoutSignal);
  }

  return signals.sort((a, b) => b.confidence - a.confidence);
};

/**
 * チャートパターンを検出
 */
export const detectPatterns = (data: PriceData[]): PatternDetection[] => {
  if (data.length < 20) {
    return [];
  }

  const patterns: PatternDetection[] = [];

  // ダブルトップ/ダブルボトム
  const doublePattern = detectDoubleTopBottom(data);
  if (doublePattern) {
    patterns.push(doublePattern);
  }

  // ヘッドアンドショルダー
  const headShoulderPattern = detectHeadAndShoulders(data);
  if (headShoulderPattern) {
    patterns.push(headShoulderPattern);
  }

  // 三角形パターン
  const trianglePattern = detectTriangle(data);
  if (trianglePattern) {
    patterns.push(trianglePattern);
  }

  return patterns;
};

// 以下、補助関数

const analyzeMomentum = (data: PriceData[]): 'increasing' | 'decreasing' | 'stable' => {
  if (data.length < 10) {
    return 'stable';
  }

  const recent10 = data.slice(-10);
  const priceChanges = recent10
    .slice(1)
    .map((candle, index) => candle.close - recent10[index].close);

  const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;

  if (Math.abs(avgChange) < 0.001) {
    return 'stable';
  }
  return avgChange > 0 ? 'increasing' : 'decreasing';
};

const findSupportResistance = (
  data: PriceData[],
): { support: number | null; resistance: number | null } => {
  if (data.length < 10) {
    return { support: null, resistance: null };
  }

  // 直近の高値・安値を検索
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);

  const resistance = Math.max(...highs.slice(-20));
  const support = Math.min(...lows.slice(-20));

  return { support, resistance };
};

const analyzeRSI = (data: PriceData[]): TradingSignal | null => {
  const rsi = calculateRSI(data, 14);
  if (rsi.length === 0) {
    return null;
  }

  const latestRSI = rsi[rsi.length - 1];
  const currentPrice = data[data.length - 1];

  if (latestRSI.rsi <= 30) {
    return {
      type: 'buy',
      strength: latestRSI.rsi <= 20 ? 'strong' : 'medium',
      reason: `RSI oversold (${latestRSI.rsi.toFixed(1)})`,
      confidence: Math.max(0, (30 - latestRSI.rsi) * 3),
      timestamp: currentPrice.date,
      price: currentPrice.close,
    };
  } else if (latestRSI.rsi >= 70) {
    return {
      type: 'sell',
      strength: latestRSI.rsi >= 80 ? 'strong' : 'medium',
      reason: `RSI overbought (${latestRSI.rsi.toFixed(1)})`,
      confidence: Math.max(0, (latestRSI.rsi - 70) * 3),
      timestamp: currentPrice.date,
      price: currentPrice.close,
    };
  }

  return null;
};

const analyzeMACD = (data: PriceData[]): TradingSignal | null => {
  const macd = calculateMACD(data);
  if (macd.length < 2) {
    return null;
  }

  const latest = macd[macd.length - 1];
  const previous = macd[macd.length - 2];
  const currentPrice = data[data.length - 1];

  // MACDクロスオーバー
  if (previous.macd <= previous.signal && latest.macd > latest.signal) {
    return {
      type: 'buy',
      strength: 'medium',
      reason: 'MACD bullish crossover',
      confidence: 65,
      timestamp: currentPrice.date,
      price: currentPrice.close,
    };
  } else if (previous.macd >= previous.signal && latest.macd < latest.signal) {
    return {
      type: 'sell',
      strength: 'medium',
      reason: 'MACD bearish crossover',
      confidence: 65,
      timestamp: currentPrice.date,
      price: currentPrice.close,
    };
  }

  return null;
};

const analyzeMovingAverageCrossover = (data: PriceData[]): TradingSignal | null => {
  const sma20 = calculateSMA(data, 20);
  const sma50 = calculateSMA(data, 50);

  if (sma20.length < 2 || sma50.length < 2) {
    return null;
  }

  const latestSma20 = sma20[sma20.length - 1];
  const latestSma50 = sma50[sma50.length - 1];
  const prevSma20 = sma20[sma20.length - 2];
  const prevSma50 = sma50[sma50.length - 2];
  const currentPrice = data[data.length - 1];

  // ゴールデンクロス
  if (prevSma20.value <= prevSma50.value && latestSma20.value > latestSma50.value) {
    return {
      type: 'buy',
      strength: 'strong',
      reason: 'Golden cross (SMA20 > SMA50)',
      confidence: 80,
      timestamp: currentPrice.date,
      price: currentPrice.close,
    };
  }
  // デッドクロス
  else if (prevSma20.value >= prevSma50.value && latestSma20.value < latestSma50.value) {
    return {
      type: 'sell',
      strength: 'strong',
      reason: 'Death cross (SMA20 < SMA50)',
      confidence: 80,
      timestamp: currentPrice.date,
      price: currentPrice.close,
    };
  }

  return null;
};

const analyzeBreakout = (data: PriceData[]): TradingSignal | null => {
  if (data.length < 20) {
    return null;
  }

  const recent20 = data.slice(-20);
  const currentPrice = data[data.length - 1];

  const resistance = Math.max(...recent20.slice(0, -1).map(d => d.high));
  const support = Math.min(...recent20.slice(0, -1).map(d => d.low));

  // レジスタンスブレイクアウト
  if (currentPrice.high > resistance) {
    return {
      type: 'buy',
      strength: 'strong',
      reason: `Resistance breakout (${resistance.toFixed(4)})`,
      confidence: 75,
      timestamp: currentPrice.date,
      price: currentPrice.close,
    };
  }
  // サポートブレイクダウン
  else if (currentPrice.low < support) {
    return {
      type: 'sell',
      strength: 'strong',
      reason: `Support breakdown (${support.toFixed(4)})`,
      confidence: 75,
      timestamp: currentPrice.date,
      price: currentPrice.close,
    };
  }

  return null;
};

// パターン検出関数（簡略版）
const detectDoubleTopBottom = (data: PriceData[]): PatternDetection | null => {
  // ダブルトップ/ダブルボトムの検出ロジック
  // 実装は複雑になるため、基本的な構造のみ
  return null;
};

const detectHeadAndShoulders = (data: PriceData[]): PatternDetection | null => {
  // ヘッドアンドショルダーの検出ロジック
  return null;
};

const detectTriangle = (data: PriceData[]): PatternDetection | null => {
  // 三角形パターンの検出ロジック
  return null;
};
