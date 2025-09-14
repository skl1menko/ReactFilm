import express from 'express';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3001;

const db = new Database('database.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS films(
    episode_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    director TEXT NOT NULL,
    producer TEXT NOT NULL,
    release_date TEXT NOT NULL
  )
  `).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS people(
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL
  )
  `).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS film_people(
    film_id INTEGER,
    person_id INTEGER,
    FOREIGN KEY (film_id) REFERENCES films(episode_id),
    FOREIGN KEY (person_id) REFERENCES people(uid)
  )
  `).run();

app.get('/', (req, res) => {
  res.send('Backend сервер работает!');
});

app.get('/test-db', (req, res) => {
// Эндпоинт для проверки содержимого таблицы people
app.get('/people', (req, res) => {
  const people = db.prepare('SELECT * FROM people').all();
  res.json(people);
});

// Эндпоинт для получения информации о человеке по uid
app.get('/people/:id', async (req, res) => {
  const id = req.params.id;
  const person = db.prepare('SELECT * FROM people WHERE uid = ?').get(id);
  if (!person) {
    return res.status(404).json({ error: 'Человек не найден' });
  }
  try {
    const response = await fetch(person.url);
    const data = await response.json();
    const attributes = data.result?.properties || {};
    res.json({
      ...person,
      ...attributes
    });
  } catch (err) {
    res.json(person);
  }
});
  const row = db.prepare('SELECT 1 AS result').get();
  res.json(row);
});


async function fetchPeopleFromSWAPI(){
  const response = await fetch('https://swapi.tech/api/people?page=2&limit=0');
  const data = await response.json();
  const people = data.results;
  
  for (const person of people) {
    // Проверяем, есть ли уже такой человек по имени и url
    const exists = db.prepare('SELECT COUNT(*) AS cnt FROM people WHERE name = ? AND url = ?').get(person.name, person.url).cnt;
    if (exists === 0) {
      const insertPerson = db.prepare('INSERT INTO people (name, url) VALUES (?, ?)');
      insertPerson.run(person.name, person.url);
    }
  }
}

// Запускаем сервер только после заполнения базы
(async () => {
  await fetchPeopleFromSWAPI();
  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
})();

const count = db.prepare('SELECT COUNT(*) AS cnt FROM people').get().cnt;
console.log('Количество людей:', count);
const allPeople = db.prepare('SELECT * FROM people').all();
console.log(allPeople);
