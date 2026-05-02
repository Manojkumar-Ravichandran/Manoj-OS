import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchHoldings = createAsyncThunk(
  'holding/fetchHoldings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/holdings');
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addHolding = createAsyncThunk(
  'holding/addHolding',
  async (holding, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holding),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateHolding = createAsyncThunk(
  'holding/updateHolding',
  async ({ id, holding }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/holdings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holding),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteHolding = createAsyncThunk(
  'holding/deleteHolding',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/holdings/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const holdingSlice = createSlice({
  name: 'holding',
  initialState: {
    holdings: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHoldings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHoldings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.holdings = action.payload || [];
      })
      .addCase(fetchHoldings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addHolding.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.holdings.findIndex((h) => h._id === action.payload._id);
          if (index !== -1) {
            state.holdings[index] = action.payload;
          } else {
            state.holdings.unshift(action.payload);
          }
        }
      })
      .addCase(updateHolding.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          const index = state.holdings.findIndex((h) => h._id === action.payload._id);
          if (index !== -1) state.holdings[index] = action.payload;
        }
      })
      .addCase(deleteHolding.fulfilled, (state, action) => {
        state.holdings = state.holdings.filter((h) => h._id !== action.payload);
      });
  },
});

export default holdingSlice.reducer;
