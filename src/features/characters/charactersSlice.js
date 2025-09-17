// src/features/characters/charactersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCharacters = createAsyncThunk(
  'characters/fetchCharacters',
  async (page = 1) => {
    const response = await fetch(`http://localhost:3001/people`);
    const data = await response.json();
    
    // Имитируем пагинацию на клиенте, так как API возвращает всех персонажей
    const limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      characters: paginatedData,
      nextPage: endIndex < data.length ? page + 1 : null,
    };
  }
);

const charactersSlice = createSlice({
  name: 'characters',
  initialState: {
    characters: [],
    status: 'idle',
    error: null,
    currentPage: 1,
    nextPage: null,
  },
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharacters.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCharacters.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.characters = action.payload.characters;
        state.nextPage = action.payload.nextPage;
      })
      .addCase(fetchCharacters.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setPage } = charactersSlice.actions;

export default charactersSlice.reducer;
