import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchNotes = createAsyncThunk(
  'note/fetchNotes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addNote = createAsyncThunk(
  'note/addNote',
  async (note, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateNote = createAsyncThunk(
  'note/updateNote',
  async ({ id, note }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteNote = createAsyncThunk(
  'note/deleteNote',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.error);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const noteSlice = createSlice({
  name: 'note',
  initialState: {
    notes: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notes = action.payload || [];
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addNote.fulfilled, (state, action) => {
        if (action.payload) state.notes.unshift(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          const index = state.notes.findIndex((n) => n._id === action.payload._id);
          if (index !== -1) state.notes[index] = action.payload;
        }
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((n) => n._id !== action.payload);
      });
  },
});

export default noteSlice.reducer;
