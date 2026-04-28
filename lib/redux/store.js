import { configureStore } from '@reduxjs/toolkit';
import financeReducer from './slices/financeSlice';
import holdingReducer from './slices/holdingSlice';

export const store = configureStore({
  reducer: {
    finance: financeReducer,
    holding: holdingReducer,
  },
});
