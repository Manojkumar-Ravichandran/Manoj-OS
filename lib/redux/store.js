import { configureStore } from '@reduxjs/toolkit';
import financeReducer from './slices/financeSlice';

export const store = configureStore({
  reducer: {
    finance: financeReducer,
  },
});
