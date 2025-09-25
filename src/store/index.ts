import { configureStore } from '@reduxjs/toolkit';
import priceReducer from './slices/priceSlice';
import tradeReducer from './slices/tradeSlice';
import accountReducer from './slices/accountSlice';
import chartReducer from './slices/chartSlice';

export const store = configureStore({
  reducer: {
    price: priceReducer,
    trade: tradeReducer,
    account: accountReducer,
    chart: chartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
