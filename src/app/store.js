// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import filmsReducer from '../features/films/filmsSlice';
import filmReducer from '../features/films/filmSlice';
import characterReducer from '../features/characters/characterSlice';
import charactersReducer from '../features/characters/charactersSlice'

export const store = configureStore({
  reducer: {
    films: filmsReducer,
    film: filmReducer,
    character: characterReducer,
    characters: charactersReducer,
  },
});
