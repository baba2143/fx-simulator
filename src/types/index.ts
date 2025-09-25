// 価格データ
export interface PriceData {
  id: string;
  date: number; // Unix timestamp
  currencyPair: CurrencyPair;
  open: number;
  high: number;
  low: number;
  close: number;
  createdAt?: number;
}

// 通貨ペア
export type CurrencyPair = 'USDJPY' | 'EURUSD' | 'EURJPY' | 'GBPUSD' | 'GBPJPY' | 'AUDJPY';

// 取引タイプ
export type TradeType = 'buy' | 'sell';
export type TradeStatus = 'open' | 'closed';

// 取引データ
export interface Trade {
  id: string;
  openDate: number;
  closeDate?: number;
  currencyPair: CurrencyPair;
  tradeType: TradeType;
  amount: number;
  openPrice: number;
  closePrice?: number;
  profit?: number;
  status: TradeStatus;
  createdAt: number;
}

// 口座情報（仮想資金）
export interface Account {
  id: string;
  balance: number;
  initialBalance: number;
  createdAt: number;
  updatedAt: number;
}

// チャート表示期間
export type TimeFrame = '1H' | '4H' | '1D';

// チャート設定
export interface ChartSettings {
  currencyPair: CurrencyPair;
  timeFrame: TimeFrame;
  indicators: string[];
}

// ナビゲーション型定義
export type RootStackParamList = {
  Splash: undefined;
  DataImport: undefined;
  MainTab: undefined;
};

export type MainTabParamList = {
  Chart: undefined;
  Trade: undefined;
  History: undefined;
  Performance: undefined;
  Goals: undefined;
  Settings: undefined;
};
