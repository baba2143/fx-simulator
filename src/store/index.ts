import { configureStore } from '@reduxjs/toolkit';
import priceReducer from './slices/priceSlice';
import tradeReducer from './slices/tradeSlice';
import accountReducer from './slices/accountSlice';

export const store = configureStore({
  reducer: {
    price: priceReducer,
    trade: tradeReducer,
    account: accountReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
