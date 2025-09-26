import { CurrencyPair } from '../types';

/**
 * 通貨ペアの設定情報
 */
export interface CurrencyPairInfo {
  symbol: CurrencyPair;
  displayName: string;
  displayNameJP: string;
  category: 'major' | 'minor' | 'precious';
  basePrice: number;
  volatility: number;
  digits: number; // 小数点以下の桁数
  spread: number; // 一般的なスプレッド
}

/**
 * 全通貨ペアの設定
 */
export const CURRENCY_PAIR_CONFIG: Record<CurrencyPair, CurrencyPairInfo> = {
  USDJPY: {
    symbol: 'USDJPY',
    displayName: 'USD/JPY',
    displayNameJP: 'ドル/円',
    category: 'major',
    basePrice: 110.0,
    volatility: 0.5,
    digits: 3,
    spread: 0.1,
  },
  EURUSD: {
    symbol: 'EURUSD',
    displayName: 'EUR/USD',
    displayNameJP: 'ユーロ/ドル',
    category: 'major',
    basePrice: 1.18,
    volatility: 0.003,
    digits: 5,
    spread: 0.00010,
  },
  EURJPY: {
    symbol: 'EURJPY',
    displayName: 'EUR/JPY',
    displayNameJP: 'ユーロ/円',
    category: 'major',
    basePrice: 130.0,
    volatility: 0.6,
    digits: 3,
    spread: 0.2,
  },
  GBPUSD: {
    symbol: 'GBPUSD',
    displayName: 'GBP/USD',
    displayNameJP: 'ポンド/ドル',
    category: 'major',
    basePrice: 1.38,
    volatility: 0.004,
    digits: 5,
    spread: 0.00015,
  },
  GBPJPY: {
    symbol: 'GBPJPY',
    displayName: 'GBP/JPY',
    displayNameJP: 'ポンド/円',
    category: 'major',
    basePrice: 152.0,
    volatility: 0.7,
    digits: 3,
    spread: 0.3,
  },
  AUDJPY: {
    symbol: 'AUDJPY',
    displayName: 'AUD/JPY',
    displayNameJP: '豪ドル/円',
    category: 'minor',
    basePrice: 82.0,
    volatility: 0.4,
    digits: 3,
    spread: 0.2,
  },
  XAUJPY: {
    symbol: 'XAUJPY',
    displayName: 'XAU/JPY',
    displayNameJP: 'ゴールド/円',
    category: 'precious',
    basePrice: 195000.0,
    volatility: 2000.0,
    digits: 1,
    spread: 50.0,
  },
  XAUUSD: {
    symbol: 'XAUUSD',
    displayName: 'XAU/USD',
    displayNameJP: 'ゴールド/ドル',
    category: 'precious',
    basePrice: 1850.0,
    volatility: 15.0,
    digits: 2,
    spread: 0.50,
  },
};

/**
 * 通貨ペア一覧を取得
 */
export const getAllCurrencyPairs = (): CurrencyPair[] => {
  return Object.keys(CURRENCY_PAIR_CONFIG) as CurrencyPair[];
};

/**
 * カテゴリ別に通貨ペアを取得
 */
export const getCurrencyPairsByCategory = (category: 'major' | 'minor' | 'precious'): CurrencyPair[] => {
  return Object.values(CURRENCY_PAIR_CONFIG)
    .filter(config => config.category === category)
    .map(config => config.symbol);
};

/**
 * 通貨ペアの表示名を取得
 */
export const getCurrencyPairDisplayName = (pair: CurrencyPair, useJapanese = false): string => {
  const config = CURRENCY_PAIR_CONFIG[pair];
  return useJapanese ? config.displayNameJP : config.displayName;
};

/**
 * 通貨ペアの設定情報を取得
 */
export const getCurrencyPairInfo = (pair: CurrencyPair): CurrencyPairInfo => {
  return CURRENCY_PAIR_CONFIG[pair];
};

/**
 * 価格を通貨ペアに適した桁数でフォーマット
 */
export const formatPrice = (price: number, pair: CurrencyPair): string => {
  const config = CURRENCY_PAIR_CONFIG[pair];
  return price.toFixed(config.digits);
};

/**
 * 通貨ペアがゴールド（貴金属）かどうか
 */
export const isPreciousMetal = (pair: CurrencyPair): boolean => {
  return CURRENCY_PAIR_CONFIG[pair].category === 'precious';
};

/**
 * ゴールド取引用の取引単位を取得
 */
export const getTradingUnit = (pair: CurrencyPair): string => {
  if (isPreciousMetal(pair)) {
    return 'オンス'; // ゴールドは1オンス単位
  }
  return '通貨単位';
};