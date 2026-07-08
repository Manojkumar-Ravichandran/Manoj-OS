import { configureStore } from '@reduxjs/toolkit';
import financeReducer from './slices/financeSlice';
import holdingReducer from './slices/holdingSlice';
import noteReducer from './slices/noteSlice';
import calendarReducer from './slices/calendarSlice';

export const store = configureStore({
  reducer: {
    finance: financeReducer,
    holding: holdingReducer,
    note: noteReducer,
    calendar: calendarReducer,
  },
});
