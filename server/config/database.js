import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseConfig {
  constructor() {
    const dbPath = path.join(__dirname, '../../database.db');
    this.db = new Database(dbPath);
    this.initTables();
  }

  initTables() {
    // Создание таблицы фильмов
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS films(
        episode_id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        director TEXT NOT NULL,
        producer TEXT NOT NULL,
        release_date TEXT NOT NULL,
        opening_crawl TEXT,
        url TEXT NOT NULL
      )
    `).run();

    // Создание таблицы персонажей
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS people(
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        birth_year TEXT,
        eye_color TEXT,
        gender TEXT,
        hair_color TEXT,
        height TEXT,
        mass TEXT,
        skin_color TEXT,
        homeworld TEXT
      )
    `).run();

    // Создание таблицы связей с уникальными ключами
    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS film_people(
        film_id INTEGER,
        person_id INTEGER,
        PRIMARY KEY (film_id, person_id),
        FOREIGN KEY (film_id) REFERENCES films(episode_id),
        FOREIGN KEY (person_id) REFERENCES people(uid)
      )
    `).run();
  }

  getDatabase() {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

export default new DatabaseConfig();