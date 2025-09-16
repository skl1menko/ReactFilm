import express from 'express';
import Film from '../models/Film.js';

const router = express.Router();
const filmModel = new Film();

// GET /films - Получить все фильмы
router.get('/', (req, res) => {
  try {
    const films = filmModel.getAll();
    res.json(films);
  } catch (err) {
    console.error('Ошибка при получении фильмов:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /films/:id - Получить конкретный фильм со всеми актерами
router.get('/:id', (req, res) => {
  try {
    const episodeId = parseInt(req.params.id);
    
    if (isNaN(episodeId)) {
      return res.status(400).json({ error: 'Некорректный ID эпизода' });
    }
    
    const film = filmModel.getWithCharacters(episodeId);
    
    if (!film) {
      return res.status(404).json({ error: 'Фильм не найден' });
    }
    
    res.json(film);
  } catch (err) {
    console.error('Ошибка при получении фильма:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /films/:id/characters - Получить только персонажей фильма
router.get('/:id/characters', (req, res) => {
  try {
    const episodeId = parseInt(req.params.id);
    
    if (isNaN(episodeId)) {
      return res.status(400).json({ error: 'Некорректный ID эпизода' });
    }
    
    const characters = filmModel.getCharacters(episodeId);
    res.json(characters);
  } catch (err) {
    console.error('Ошибка при получении персонажей фильма:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /films/statistics - Получить статистику фильмов
router.get('/stats/overview', (req, res) => {
  try {
    const stats = filmModel.getStatistics();
    res.json(stats);
  } catch (err) {
    console.error('Ошибка при получении статистики:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;