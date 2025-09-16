import databaseConfig from '../config/database.js';

class FilmPerson {
  constructor() {
    this.db = databaseConfig.getDatabase();
  }

  // Создать связь между фильмом и персонажем
  create(filmId, personId) {
    const stmt = this.db.prepare('INSERT INTO film_people (film_id, person_id) VALUES (?, ?)');
    return stmt.run(filmId, personId);
  }

  // Проверить существование связи
  exists(filmId, personId) {
    const count = this.db.prepare('SELECT COUNT(*) AS cnt FROM film_people WHERE film_id = ? AND person_id = ?')
      .get(filmId, personId);
    return count.cnt > 0;
  }

  // Получить все связи
  getAll() {
    return this.db.prepare(`
      SELECT fp.film_id, fp.person_id, f.title as film_title, p.name as person_name
      FROM film_people fp
      JOIN films f ON fp.film_id = f.episode_id
      JOIN people p ON fp.person_id = p.uid
      ORDER BY fp.film_id, p.name
    `).all();
  }

  // Получить количество связей
  getCount() {
    return this.db.prepare('SELECT COUNT(*) AS cnt FROM film_people').get().cnt;
  }

  // Получить общее количество связей (алиас для совместимости)
  getTotalCount() {
    return this.getCount();
  }

  // Удалить все связи
  deleteAll() {
    return this.db.prepare('DELETE FROM film_people').run();
  }

  // Пересоздать таблицу с правильными ограничениями
  recreateTable() {
    this.db.prepare('DROP TABLE IF EXISTS film_people').run();
    this.db.prepare(`
      CREATE TABLE film_people(
        film_id INTEGER,
        person_id INTEGER,
        PRIMARY KEY (film_id, person_id),
        FOREIGN KEY (film_id) REFERENCES films(episode_id),
        FOREIGN KEY (person_id) REFERENCES people(uid)
      )
    `).run();
  }

  // Получить персонажей фильма
  getCharactersByFilm(filmId) {
    return this.db.prepare(`
      SELECT p.*
      FROM people p
      JOIN film_people fp ON p.uid = fp.person_id
      WHERE fp.film_id = ?
      ORDER BY p.name
    `).all(filmId);
  }

  // Получить фильмы персонажа
  getFilmsByCharacter(personId) {
    return this.db.prepare(`
      SELECT f.*
      FROM films f
      JOIN film_people fp ON f.episode_id = fp.film_id
      WHERE fp.person_id = ?
      ORDER BY f.episode_id
    `).all(personId);
  }
}

export default FilmPerson;