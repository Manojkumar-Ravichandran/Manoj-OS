import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchEvents = createAsyncThunk(
  "calendar/fetchEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addEvent = createAsyncThunk(
  "calendar/addEvent",
  async (event, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  "calendar/updateEvent",
  async ({ id, event }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "calendar/deleteEvent",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState: {
    events: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.events = action.payload || [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        if (action.payload) {
          state.events.push(action.payload);
        }
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          const index = state.events.findIndex((e) => e._id === action.payload._id);
          if (index !== -1) {
            state.events[index] = action.payload;
          }
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e._id !== action.payload);
      });
  },
});

export default calendarSlice.reducer;
