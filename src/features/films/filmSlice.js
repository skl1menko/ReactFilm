import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// thunk для загрузки персонажей
export const fetchAllCharacters = createAsyncThunk('film/fetchAllCharacters', async () => {
  const res = await fetch('http://localhost:3001/people');
  const data = await res.json();
  return data.map(person => ({
    id: person.id,
    name: person.name
  }));
});


export const fetchFilmById = createAsyncThunk('film/fetchFilmById', async (id) => {
  const res = await fetch(`http://localhost:3001/films/${id}`);
  const data = await res.json();
  return data;
});

const filmSlice = createSlice({
  name: 'film',
  initialState: {
    details: null,
    characters: [],      // персонажи текущего фильма (id + name)
    allCharacters: [],   // кэш всех персонажей (id + name)
    status: 'idle',
    error: null,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchFilmById.pending, (state) => {
        state.status = 'loading';
        state.characters = []; // очистить персонажей при загрузке нового фильма
        state.details = null;
      })
      .addCase(fetchFilmById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.details = action.payload;
      })
      .addCase(fetchFilmById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchAllCharacters.fulfilled, (state, action) => {
        state.allCharacters = action.payload;
      });
  },
});

export default filmSlice.reducer;
