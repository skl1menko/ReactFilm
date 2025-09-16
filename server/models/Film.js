import databaseConfig from '../config/database.js';

class Film {
  constructor() {
    this.db = databaseConfig.getDatabase();
  }

  // Получить все фильмы
  getAll() {
    return this.db.prepare('SELECT * FROM films ORDER BY episode_id').all();
  }

  // Получить фильм по episode_id
  getById(episodeId) {
    return this.db.prepare('SELECT * FROM films WHERE episode_id = ?').get(episodeId);
  }

  // Получить фильм с персонажами
  getWithCharacters(episodeId) {
    const film = this.getById(episodeId);
    if (!film) return null;

    const characters = this.db.prepare(`
      SELECT p.*
      FROM people p
      JOIN film_people fp ON p.uid = fp.person_id
      WHERE fp.film_id = ?
      ORDER BY p.name
    `).all(episodeId);

    return {
      ...film,
      characters: characters,
      characters_count: characters.length
    };
  }

  // Создать новый фильм
  create(filmData) {
    const stmt = this.db.prepare(`
      INSERT INTO films (episode_id, title, director, producer, release_date, opening_crawl, url) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      filmData.episode_id,
      filmData.title,
      filmData.director,
      filmData.producer,
      filmData.release_date,
      filmData.opening_crawl,
      filmData.url
    );
  }

  // Проверить существование фильма
  exists(episodeId) {
    const count = this.db.prepare('SELECT COUNT(*) AS cnt FROM films WHERE episode_id = ?').get(episodeId);
    return count.cnt > 0;
  }

  // Получить статистику по фильмам
  getStatistics() {
    return this.db.prepare(`
      SELECT f.title, f.episode_id, COUNT(fp.person_id) as character_count
      FROM films f
      LEFT JOIN film_people fp ON f.episode_id = fp.film_id
      GROUP BY f.episode_id
      ORDER BY f.episode_id
    `).all();
  }

  // Получить персонажей конкретного фильма
  getCharacters(episodeId) {
    return this.db.prepare(`
      SELECT p.*
      FROM people p
      JOIN film_people fp ON p.uid = fp.person_id
      WHERE fp.film_id = ?
      ORDER BY p.name
    `).all(episodeId);
  }
}

export default Film;