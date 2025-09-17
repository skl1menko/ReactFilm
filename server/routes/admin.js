import express from 'express';
import databaseConfig from '../config/database.js';

const router = express.Router();
const db = databaseConfig.getDatabase();

// GET /admin/tables - Получить информацию о всех таблицах
router.get('/tables', (req, res) => {
  try {
    const tables = {
      films: {
        name: 'Films',
        description: 'Таблица фильмов Star Wars',
        count: db.prepare('SELECT COUNT(*) as count FROM films').get().count,
        columns: ['episode_id', 'title', 'director', 'producer', 'release_date', 'opening_crawl', 'url']
      },
      people: {
        name: 'People', 
        description: 'Таблица персонажей Star Wars',
        count: db.prepare('SELECT COUNT(*) as count FROM people').get().count,
        columns: ['uid', 'name', 'url', 'birth_year', 'eye_color', 'gender', 'hair_color', 'height', 'mass', 'skin_color', 'homeworld']
      },
      film_people: {
        name: 'Film-People Links',
        description: 'Связи между фильмами и персонажами',
        count: db.prepare('SELECT COUNT(*) as count FROM film_people').get().count,
        columns: ['film_id', 'person_id']
      }
    };
    
    res.json(tables);
  } catch (err) {
    console.error('Ошибка при получении информации о таблицах:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /admin/films - Получить все данные из таблицы films
router.get('/films', (req, res) => {
  try {
    const films = db.prepare('SELECT * FROM films ORDER BY episode_id').all();
    res.json(films);
  } catch (err) {
    console.error('Ошибка при получении фильмов:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /admin/people - Получить все данные из таблицы people
router.get('/people', (req, res) => {
  try {
    const people = db.prepare('SELECT * FROM people ORDER BY uid').all();
    res.json(people);
  } catch (err) {
    console.error('Ошибка при получении персонажей:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /admin/links - Получить все связи между фильмами и персонажами
router.get('/links', (req, res) => {
  try {
    const links = db.prepare(`
      SELECT 
        fp.film_id,
        fp.person_id,
        f.title as film_title,
        p.name as person_name
      FROM film_people fp
      LEFT JOIN films f ON fp.film_id = f.episode_id
      LEFT JOIN people p ON fp.person_id = p.uid
      ORDER BY fp.film_id, fp.person_id
    `).all();
    res.json(links);
  } catch (err) {
    console.error('Ошибка при получении связей:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /admin/stats - Получить статистику базы данных
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalFilms: db.prepare('SELECT COUNT(*) as count FROM films').get().count,
      totalPeople: db.prepare('SELECT COUNT(*) as count FROM people').get().count,
      totalLinks: db.prepare('SELECT COUNT(*) as count FROM film_people').get().count,
      
      // Персонажи без фильмов
      peopleWithoutFilms: db.prepare(`
        SELECT COUNT(*) as count 
        FROM people p 
        LEFT JOIN film_people fp ON p.uid = fp.person_id 
        WHERE fp.person_id IS NULL
      `).get().count,
      
      // Фильмы без персонажей  
      filmsWithoutPeople: db.prepare(`
        SELECT COUNT(*) as count 
        FROM films f 
        LEFT JOIN film_people fp ON f.episode_id = fp.film_id 
        WHERE fp.film_id IS NULL
      `).get().count,
      
      // Средне количество персонажей на фильм
      avgCharactersPerFilm: db.prepare(`
        SELECT ROUND(AVG(char_count), 2) as avg
        FROM (
          SELECT COUNT(fp.person_id) as char_count
          FROM films f
          LEFT JOIN film_people fp ON f.episode_id = fp.film_id
          GROUP BY f.episode_id
        )
      `).get().avg || 0
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Ошибка при получении статистики:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;