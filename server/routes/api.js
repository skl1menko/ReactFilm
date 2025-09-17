import express from 'express';
import SwapiService from '../services/swapiService.js';
import LinkService from '../services/linkService.js';

const router = express.Router();
const swapiService = new SwapiService();
const linkService = new LinkService();

// POST /api/load-films - Загрузить фильмы из SWAPI
router.post('/load-films', async (req, res) => {
  try {
    await swapiService.loadFilms();
    res.json({ success: true, message: 'Фильмы успешно загружены' });
  } catch (err) {
    console.error('Ошибка при загрузке фильмов:', err);
    res.status(500).json({ error: 'Ошибка при загрузке фильмов' });
  }
});

// POST /api/load-people - Загрузить персонажей из SWAPI
router.post('/load-people', async (req, res) => {
  try {
    await swapiService.loadPeople();
    res.json({ success: true, message: 'Персонажи успешно загружены' });
  } catch (err) {
    console.error('Ошибка при загрузке персонажей:', err);
    res.status(500).json({ error: 'Ошибка при загрузке персонажей' });
  }
});

// POST /api/create-real-links - Создать реальные связи из SWAPI
router.post('/create-real-links', async (req, res) => {
  try {
    const result = await linkService.createRealLinksFromSWAPI();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    console.error('Ошибка при создании реальных связей:', err);
    res.status(500).json({ error: 'Ошибка при создании реальных связей' });
  }
});

// GET /api/links/stats - Получить статистику связей
router.get('/links/stats', (req, res) => {
  try {
    const stats = linkService.getLinksStatistics();
    res.json(stats);
  } catch (err) {
    console.error('Ошибка при получении статистики связей:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;