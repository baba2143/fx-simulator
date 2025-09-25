import { configureStore } from '@reduxjs/toolkit';
import priceReducer from './slices/priceSlice';
import tradeReducer from './slices/tradeSlice';
import accountReducer from './slices/accountSlice';
import chartReducer from './slices/chartSlice';
import indicatorReducer from './slices/indicatorSlice';
import drawingReducer from './slices/drawingSlice';
import goalReducer from './slices/goalSlice';
import rankingReducer from './slices/rankingSlice';

export const store = configureStore({
  reducer: {
    price: priceReducer,
    trade: tradeReducer,
    account: accountReducer,
    chart: chartReducer,
    indicators: indicatorReducer,
    drawing: drawingReducer,
    goals: goalReducer,
    ranking: rankingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
