import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DatabaseService } from '../../services/database/DatabaseService';
import { PriceData, CurrencyPair } from '../../types';

interface PriceState {
  data: PriceData[];
  currentPair: CurrencyPair;
  loading: boolean;
  error: string | null;
}

const initialState: PriceState = {
  data: [],
  currentPair: 'USDJPY',
  loading: false,
  error: null,
};

export const fetchPriceData = createAsyncThunk(
  'price/fetchData',
  async ({ pair, startDate, endDate }: { pair: CurrencyPair; startDate: Date; endDate: Date }) => {
    return await DatabaseService.getPriceData(pair, startDate, endDate);
  },
);

const priceSlice = createSlice({
  name: 'price',
  initialState,
  reducers: {
    setCurrentPair: (state, action: PayloadAction<CurrencyPair>) => {
      state.currentPair = action.payload;
    },
    clearPriceData: state => {
      state.data = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPriceData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPriceData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPriceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch price data';
      });
  },
});

export const { setCurrentPair, clearPriceData } = priceSlice.actions;
export default priceSlice.reducer;
