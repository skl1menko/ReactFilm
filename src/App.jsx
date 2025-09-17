// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import FilmPage from "./pages/FilmPage";
import CharacterPage from "./pages/CharacterPage";
import CharactersPage from "./pages/CharactersPage";
import AdminPage from "./pages/AdminPage";
import Header from './components/Header.jsx'
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/films/:filmId" element={<FilmPage />} />
        <Route path="/characters/:charId" element={<CharacterPage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <Header/>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
