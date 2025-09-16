import databaseConfig from '../config/database.js';

class Person {
  constructor() {
    this.db = databaseConfig.getDatabase();
  }

  // Получить всех персонажей
  getAll() {
    return this.db.prepare('SELECT * FROM people ORDER BY name COLLATE NOCASE').all();
  }

  // Получить всех персонажей с их фильмами
  getAllWithFilms() {
    return this.db.prepare(`
      SELECT p.*, 
             GROUP_CONCAT(f.title, ', ') as film_titles,
             COUNT(f.episode_id) as films_count
      FROM people p
      LEFT JOIN film_people fp ON p.uid = fp.person_id
      LEFT JOIN films f ON fp.film_id = f.episode_id
      GROUP BY p.uid
    `).all().map(person => ({
      ...person,
      films: person.film_titles ? person.film_titles.split(', ') : []
    }));
  }

  // Получить персонажа по uid
  getById(uid) {
    return this.db.prepare('SELECT * FROM people WHERE uid = ?').get(uid);
  }

  // Получить персонажа по имени
  getByName(name) {
    return this.db.prepare('SELECT * FROM people WHERE name = ?').get(name);
  }

  // Получить персонажа с фильмами
  getWithFilms(uid) {
    const person = this.getById(uid);
    if (!person) return null;

    const films = this.db.prepare(`
      SELECT f.episode_id, f.title, f.director, f.producer, f.release_date, f.url
      FROM films f
      JOIN film_people fp ON f.episode_id = fp.film_id
      WHERE fp.person_id = ?
      ORDER BY f.episode_id
    `).all(uid);

    return {
      ...person,
      films: films
    };
  }

  // Создать нового персонажа
  create(personData) {
    const stmt = this.db.prepare(`
      INSERT INTO people (name, url, birth_year, eye_color, gender, hair_color, height, mass, skin_color, homeworld) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(
      personData.name,
      personData.url,
      personData.birth_year || null,
      personData.eye_color || null,
      personData.gender || null,
      personData.hair_color || null,
      personData.height || null,
      personData.mass || null,
      personData.skin_color || null,
      personData.homeworld || null
    );
  }

  // Создать базового персонажа (только имя и URL)
  createBasic(name, url) {
    const stmt = this.db.prepare('INSERT INTO people (name, url) VALUES (?, ?)');
    return stmt.run(name, url);
  }

  // Проверить существование персонажа
  exists(name, url) {
    const count = this.db.prepare('SELECT COUNT(*) AS cnt FROM people WHERE name = ? AND url = ?').get(name, url);
    return count.cnt > 0;
  }

  // Получить количество персонажей
  getCount() {
    return this.db.prepare('SELECT COUNT(*) AS cnt FROM people').get().cnt;
  }

  // Поиск персонажей без связей с фильмами
  getWithoutFilmLinks(limit = 20) {
    return this.db.prepare(`
      SELECT DISTINCT p.uid, p.name, p.url 
      FROM people p 
      LEFT JOIN film_people fp ON p.uid = fp.person_id 
      WHERE fp.person_id IS NULL
      LIMIT ?
    `).all(limit);
  }

  // Поиск персонажей по имени
  searchByName(name) {
    return this.db.prepare(`
      SELECT p.*, 
             GROUP_CONCAT(f.title) as film_titles
      FROM people p
      LEFT JOIN film_people fp ON p.uid = fp.person_id
      LEFT JOIN films f ON fp.film_id = f.episode_id
      WHERE p.name LIKE ?
      GROUP BY p.uid
      ORDER BY p.name COLLATE NOCASE
    `).all(`%${name}%`);
  }

  // Получить общее количество персонажей
  getTotalCount() {
    return this.db.prepare('SELECT COUNT(*) as count FROM people').get().count;
  }

  // Получить персонажей, отсортированных по количеству фильмов (по популярности)
  getAllByPopularity() {
    return this.db.prepare(`
      SELECT p.*, 
             GROUP_CONCAT(f.title, ', ') as film_titles,
             COUNT(f.episode_id) as films_count
      FROM people p
      LEFT JOIN film_people fp ON p.uid = fp.person_id
      LEFT JOIN films f ON fp.film_id = f.episode_id
      GROUP BY p.uid
      ORDER BY films_count DESC, p.name COLLATE NOCASE
    `).all().map(person => ({
      ...person,
      films: person.film_titles ? person.film_titles.split(', ') : []
    }));
  }

  // Получить персонажей, отсортированных по ID (порядок добавления)
  getAllByOrder() {
    return this.db.prepare(`
      SELECT p.*, 
             GROUP_CONCAT(f.title, ', ') as film_titles,
             COUNT(f.episode_id) as films_count
      FROM people p
      LEFT JOIN film_people fp ON p.uid = fp.person_id
      LEFT JOIN films f ON fp.film_id = f.episode_id
      GROUP BY p.uid
      ORDER BY p.uid
    `).all().map(person => ({
      ...person,
      films: person.film_titles ? person.film_titles.split(', ') : []
    }));
  }
}

export default Person;