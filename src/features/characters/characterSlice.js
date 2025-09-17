// src/features/characters/characterSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCharacterById = createAsyncThunk(
  'character/fetchCharacterById',
  async (id) => {
    const res = await fetch(`http://localhost:3001/people/${id}`);
    const data = await res.json();
    return data;
  }
);

const characterSlice = createSlice({
  name: 'character',
  initialState: {
    details: null,
    status: 'idle',
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharacterById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCharacterById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.details = action.payload;
      })
      .addCase(fetchCharacterById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default characterSlice.reducer;
