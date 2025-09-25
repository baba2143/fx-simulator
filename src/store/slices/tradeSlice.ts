import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DatabaseService } from '../../services/database/DatabaseService';
import { Trade, TradeType, CurrencyPair } from '../../types';

interface TradeState {
  openTrades: Trade[];
  closedTrades: Trade[];
  loading: boolean;
  error: string | null;
}

const initialState: TradeState = {
  openTrades: [],
  closedTrades: [],
  loading: false,
  error: null,
};

export const fetchOpenTrades = createAsyncThunk('trade/fetchOpen', async () => {
  return await DatabaseService.getOpenTrades();
});

export const fetchClosedTrades = createAsyncThunk('trade/fetchClosed', async () => {
  return await DatabaseService.getClosedTrades();
});

export const createTrade = createAsyncThunk(
  'trade/create',
  async (tradeData: {
    currencyPair: CurrencyPair;
    tradeType: TradeType;
    amount: number;
    price: number;
  }) => {
    return await DatabaseService.createTrade(
      tradeData.currencyPair,
      tradeData.tradeType,
      tradeData.amount,
      tradeData.price,
    );
  },
);

export const closeTrade = createAsyncThunk(
  'trade/close',
  async ({ tradeId, closePrice }: { tradeId: string; closePrice: number }) => {
    return await DatabaseService.closeTrade(tradeId, closePrice);
  },
);

const tradeSlice = createSlice({
  name: 'trade',
  initialState,
  reducers: {
    clearTradeError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOpenTrades.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpenTrades.fulfilled, (state, action) => {
        state.loading = false;
        state.openTrades = action.payload;
      })
      .addCase(fetchOpenTrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch open trades';
      })
      .addCase(fetchClosedTrades.fulfilled, (state, action) => {
        state.closedTrades = action.payload;
      })
      .addCase(createTrade.fulfilled, (state, action) => {
        state.openTrades.push(action.payload);
      })
      .addCase(closeTrade.fulfilled, (state, action) => {
        const closedTrade = action.payload;
        state.openTrades = state.openTrades.filter(trade => trade.id !== closedTrade.id);
        state.closedTrades.push(closedTrade);
      });
  },
});

export const { clearTradeError } = tradeSlice.actions;
export default tradeSlice.reducer;
