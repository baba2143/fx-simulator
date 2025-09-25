import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrencyPair, PriceData } from '../../types';

export type Timeframe = '1H' | '4H' | '1D';

export interface ChartState {
  selectedPair: CurrencyPair;
  timeframe: Timeframe;
  chartData: PriceData[];
  loading: boolean;
  error: string | null;
  // Chart display settings
  showGrid: boolean;
  showVolume: boolean;
  candleType: 'candle' | 'line';
  // Indicators (for future implementation)
  indicators: string[];
  // Zoom and pan state
  zoomLevel: number;
  panOffset: number;
}

const initialState: ChartState = {
  selectedPair: 'USDJPY',
  timeframe: '1H',
  chartData: [],
  loading: false,
  error: null,
  showGrid: true,
  showVolume: true,
  candleType: 'candle',
  indicators: [],
  zoomLevel: 1,
  panOffset: 0,
};

export const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    setSelectedPair: (state, action: PayloadAction<CurrencyPair>) => {
      state.selectedPair = action.payload;
      state.chartData = [];
      state.loading = true;
      state.error = null;
    },
    setTimeframe: (state, action: PayloadAction<Timeframe>) => {
      state.timeframe = action.payload;
      state.chartData = [];
      state.loading = true;
      state.error = null;
    },
    setChartData: (state, action: PayloadAction<PriceData[]>) => {
      state.chartData = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    toggleGrid: state => {
      state.showGrid = !state.showGrid;
    },
    toggleVolume: state => {
      state.showVolume = !state.showVolume;
    },
    setCandleType: (state, action: PayloadAction<'candle' | 'line'>) => {
      state.candleType = action.payload;
    },
    setZoomLevel: (state, action: PayloadAction<number>) => {
      state.zoomLevel = Math.max(0.1, Math.min(10, action.payload));
    },
    setPanOffset: (state, action: PayloadAction<number>) => {
      state.panOffset = action.payload;
    },
    resetChart: state => {
      state.zoomLevel = 1;
      state.panOffset = 0;
    },
  },
});

export const {
  setSelectedPair,
  setTimeframe,
  setChartData,
  setLoading,
  setError,
  toggleGrid,
  toggleVolume,
  setCandleType,
  setZoomLevel,
  setPanOffset,
  resetChart,
} = chartSlice.actions;

export default chartSlice.reducer;
