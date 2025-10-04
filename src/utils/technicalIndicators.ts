import { PriceData } from '../types';

export interface TechnicalIndicatorValue {
  date: number;
  value: number;
}

export interface RSIValue {
  date: number;
  rsi: number;
}

export interface MACDValue {
  date: number;
  macd: number;
  signal: number;
  histogram: number;
}

/**
 * Simple Moving Average (単純移動平均)
 * @param data 価格データ配列
 * @param period 期間
 * @returns SMA値の配列
 */
export const calculateSMA = (data: PriceData[], period: number): TechnicalIndicatorValue[] => {
  if (data.length < period) {
    return [];
  }

  const smaValues: TechnicalIndicatorValue[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    const sma = sum / period;

    smaValues.push({
      date: data[i].date,
      value: sma,
    });
  }

  return smaValues;
};

/**
 * Exponential Moving Average (指数移動平均)
 * @param data 価格データ配列
 * @param period 期間
 * @returns EMA値の配列
 */
export const calculateEMA = (data: PriceData[], period: number): TechnicalIndicatorValue[] => {
  if (data.length < period) {
    return [];
  }

  const emaValues: TechnicalIndicatorValue[] = [];
  const multiplier = 2 / (period + 1);

  // 最初のEMAは最初のperiod個の平均値
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;

  emaValues.push({
    date: data[period - 1].date,
    value: ema,
  });

  // 以降は指数移動平均の計算
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * multiplier + ema * (1 - multiplier);
    emaValues.push({
      date: data[i].date,
      value: ema,
    });
  }

  return emaValues;
};

/**
 * Relative Strength Index (相対力指数)
 * @param data 価格データ配列
 * @param period 期間（通常14）
 * @returns RSI値の配列
 */
export const calculateRSI = (data: PriceData[], period: number = 14): RSIValue[] => {
  if (data.length < period + 1) {
    return [];
  }

  const rsiValues: RSIValue[] = [];

  for (let i = period; i < data.length; i++) {
    let gains = 0;
    let losses = 0;

    // 過去period期間の値上がり・値下がりを計算
    for (let j = i - period + 1; j <= i; j++) {
      const change = data[j].close - data[j - 1].close;
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    let rsi = 50; // デフォルト値
    if (avgLoss !== 0) {
      const rs = avgGain / avgLoss;
      rsi = 100 - 100 / (1 + rs);
    }

    rsiValues.push({
      date: data[i].date,
      rsi: rsi,
    });
  }

  return rsiValues;
};

/**
 * Moving Average Convergence Divergence (MACD)
 * @param data 価格データ配列
 * @param fastPeriod 短期EMAの期間（通常12）
 * @param slowPeriod 長期EMAの期間（通常26）
 * @param signalPeriod シグナルラインの期間（通常9）
 * @returns MACD値の配列
 */
export const calculateMACD = (
  data: PriceData[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9,
): MACDValue[] => {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  if (fastEMA.length === 0 || slowEMA.length === 0) {
    return [];
  }

  // MACDライン = 短期EMA - 長期EMA
  const macdLine: TechnicalIndicatorValue[] = [];
  const startIndex = slowPeriod - fastPeriod;

  for (let i = startIndex; i < fastEMA.length; i++) {
    const slowIndex = i - startIndex;
    if (slowIndex < slowEMA.length) {
      macdLine.push({
        date: fastEMA[i].date,
        value: fastEMA[i].value - slowEMA[slowIndex].value,
      });
    }
  }

  // シグナルライン = MACDラインのEMA
  const signalLine = calculateEMAFromValues(macdLine, signalPeriod);

  // ヒストグラム = MACDライン - シグナルライン
  const macdValues: MACDValue[] = [];
  const signalStartIndex = signalPeriod - 1;

  for (let i = signalStartIndex; i < macdLine.length; i++) {
    const signalIndex = i - signalStartIndex;
    if (signalIndex < signalLine.length) {
      macdValues.push({
        date: macdLine[i].date,
        macd: macdLine[i].value,
        signal: signalLine[signalIndex].value,
        histogram: macdLine[i].value - signalLine[signalIndex].value,
      });
    }
  }

  return macdValues;
};

/**
 * TechnicalIndicatorValue配列からEMAを計算
 * @param data インジケーター値配列
 * @param period 期間
 * @returns EMA値の配列
 */
const calculateEMAFromValues = (
  data: TechnicalIndicatorValue[],
  period: number,
): TechnicalIndicatorValue[] => {
  if (data.length < period) {
    return [];
  }

  const emaValues: TechnicalIndicatorValue[] = [];
  const multiplier = 2 / (period + 1);

  // 最初のEMAは最初のperiod個の平均値
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].value;
  }
  let ema = sum / period;

  emaValues.push({
    date: data[period - 1].date,
    value: ema,
  });

  // 以降は指数移動平均の計算
  for (let i = period; i < data.length; i++) {
    ema = data[i].value * multiplier + ema * (1 - multiplier);
    emaValues.push({
      date: data[i].date,
      value: ema,
    });
  }

  return emaValues;
};

/**
 * ボリンジャーバンド
 * @param data 価格データ配列
 * @param period 期間（通常20）
 * @param deviation 標準偏差の倍数（通常2）
 * @returns ボリンジャーバンド値の配列
 */
export const calculateBollingerBands = (
  data: PriceData[],
  period: number = 20,
  deviation: number = 2,
) => {
  if (data.length < period) {
    return [];
  }

  const bands = [];

  for (let i = period - 1; i < data.length; i++) {
    // SMA計算
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    const sma = sum / period;

    // 標準偏差計算
    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) {
      variance += Math.pow(data[j].close - sma, 2);
    }
    const standardDeviation = Math.sqrt(variance / period);

    bands.push({
      date: data[i].date,
      upper: sma + deviation * standardDeviation,
      middle: sma,
      lower: sma - deviation * standardDeviation,
    });
  }

  return bands;
};

/**
 * ストキャスティクス
 * @param data 価格データ配列
 * @param kPeriod %K期間（通常14）
 * @param dPeriod %D期間（通常3）
 * @returns ストキャスティクス値の配列
 */
export const calculateStochastic = (
  data: PriceData[],
  kPeriod: number = 14,
  dPeriod: number = 3,
) => {
  if (data.length < kPeriod) {
    return [];
  }

  const stochValues = [];

  for (let i = kPeriod - 1; i < data.length; i++) {
    // 過去kPeriod期間の最高値と最安値を求める
    let highest = data[i - kPeriod + 1].high;
    let lowest = data[i - kPeriod + 1].low;

    for (let j = i - kPeriod + 2; j <= i; j++) {
      if (data[j].high > highest) {
        highest = data[j].high;
      }
      if (data[j].low < lowest) {
        lowest = data[j].low;
      }
    }

    // %K計算
    const k = ((data[i].close - lowest) / (highest - lowest)) * 100;

    stochValues.push({
      date: data[i].date,
      k: k,
      d: 0, // 後で計算
    });
  }

  // %D計算（%Kの移動平均）
  for (let i = dPeriod - 1; i < stochValues.length; i++) {
    let sum = 0;
    for (let j = i - dPeriod + 1; j <= i; j++) {
      sum += stochValues[j].k;
    }
    stochValues[i].d = sum / dPeriod;
  }

  return stochValues.slice(dPeriod - 1);
};
