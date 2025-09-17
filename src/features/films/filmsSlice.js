// src/features/films/filmsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchFilms = createAsyncThunk('films/fetchFilms', async () => {
  const res = await fetch('http://localhost:3001/films');
  const data = await res.json();
  return data;
});

const filmsSlice = createSlice({
  name: 'films',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilms.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFilms.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFilms.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default filmsSlice.reducer;
