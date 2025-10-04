import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TechnicalIndicatorValue, RSIValue, MACDValue } from '../../utils/technicalIndicators';

export type IndicatorType = 'sma' | 'ema' | 'rsi' | 'macd' | 'bollinger' | 'stochastic';

export interface IndicatorConfig {
  id: string;
  type: IndicatorType;
  period?: number;
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
  deviation?: number;
  visible: boolean;
  color: string;
}

export interface BollingerBandValue {
  date: number;
  upper: number;
  middle: number;
  lower: number;
}

export interface StochasticValue {
  date: number;
  k: number;
  d: number;
}

export interface IndicatorData {
  sma: { [key: string]: TechnicalIndicatorValue[] };
  ema: { [key: string]: TechnicalIndicatorValue[] };
  rsi: { [key: string]: RSIValue[] };
  macd: { [key: string]: MACDValue[] };
  bollinger: { [key: string]: BollingerBandValue[] };
  stochastic: { [key: string]: StochasticValue[] };
}

export interface IndicatorState {
  activeIndicators: IndicatorConfig[];
  data: IndicatorData;
  loading: boolean;
  error: string | null;
}

const initialState: IndicatorState = {
  activeIndicators: [
    // デフォルトで一部のインジケーターを有効化
    {
      id: 'sma20',
      type: 'sma',
      period: 20,
      visible: true,
      color: '#FF6B6B',
    },
    {
      id: 'ema12',
      type: 'ema',
      period: 12,
      visible: true,
      color: '#4ECDC4',
    },
    {
      id: 'rsi14',
      type: 'rsi',
      period: 14,
      visible: false,
      color: '#45B7D1',
    },
  ],
  data: {
    sma: {},
    ema: {},
    rsi: {},
    macd: {},
    bollinger: {},
    stochastic: {},
  },
  loading: false,
  error: null,
};

export const indicatorSlice = createSlice({
  name: 'indicators',
  initialState,
  reducers: {
    addIndicator: (state, action: PayloadAction<IndicatorConfig>) => {
      const exists = state.activeIndicators.find(ind => ind.id === action.payload.id);
      if (!exists) {
        state.activeIndicators.push(action.payload);
      }
    },
    removeIndicator: (state, action: PayloadAction<string>) => {
      state.activeIndicators = state.activeIndicators.filter(ind => ind.id !== action.payload);
      // データも削除
      Object.keys(state.data).forEach(type => {
        if (state.data[type as keyof IndicatorData][action.payload]) {
          delete state.data[type as keyof IndicatorData][action.payload];
        }
      });
    },
    updateIndicator: (
      state,
      action: PayloadAction<{ id: string; config: Partial<IndicatorConfig> }>,
    ) => {
      const { id, config } = action.payload;
      const indicator = state.activeIndicators.find(ind => ind.id === id);
      if (indicator) {
        Object.assign(indicator, config);
      }
    },
    toggleIndicatorVisibility: (state, action: PayloadAction<string>) => {
      const indicator = state.activeIndicators.find(ind => ind.id === action.payload);
      if (indicator) {
        indicator.visible = !indicator.visible;
      }
    },
    setSMAData: (state, action: PayloadAction<{ id: string; data: TechnicalIndicatorValue[] }>) => {
      state.data.sma[action.payload.id] = action.payload.data;
    },
    setEMAData: (state, action: PayloadAction<{ id: string; data: TechnicalIndicatorValue[] }>) => {
      state.data.ema[action.payload.id] = action.payload.data;
    },
    setRSIData: (state, action: PayloadAction<{ id: string; data: RSIValue[] }>) => {
      state.data.rsi[action.payload.id] = action.payload.data;
    },
    setMACDData: (state, action: PayloadAction<{ id: string; data: MACDValue[] }>) => {
      state.data.macd[action.payload.id] = action.payload.data;
    },
    setBollingerData: (
      state,
      action: PayloadAction<{ id: string; data: BollingerBandValue[] }>,
    ) => {
      state.data.bollinger[action.payload.id] = action.payload.data;
    },
    setStochasticData: (state, action: PayloadAction<{ id: string; data: StochasticValue[] }>) => {
      state.data.stochastic[action.payload.id] = action.payload.data;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAllIndicatorData: state => {
      state.data = {
        sma: {},
        ema: {},
        rsi: {},
        macd: {},
        bollinger: {},
        stochastic: {},
      };
    },
    resetIndicators: () => initialState,
  },
});

export const {
  addIndicator,
  removeIndicator,
  updateIndicator,
  toggleIndicatorVisibility,
  setSMAData,
  setEMAData,
  setRSIData,
  setMACDData,
  setBollingerData,
  setStochasticData,
  setLoading,
  setError,
  clearAllIndicatorData,
  resetIndicators,
} = indicatorSlice.actions;

export default indicatorSlice.reducer;
