import express from 'express';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3001;

const db = new Database('database.db');

db.prepare(`
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

db.prepare(`
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

db.prepare(`
  CREATE TABLE IF NOT EXISTS film_people(
    film_id INTEGER,
    person_id INTEGER,
    PRIMARY KEY (film_id, person_id),
    FOREIGN KEY (film_id) REFERENCES films(episode_id),
    FOREIGN KEY (person_id) REFERENCES people(uid)
  )
  `).run();

app.get('/', (req, res) => {
  res.send('Backend сервер работает!');
});


// Эндпоинт для проверки содержимого таблицы people
app.get('/people', (req, res) => {
  const people = db.prepare('SELECT * FROM people').all();
  res.json(people);
});

// Эндпоинт для получения всех фильмов
app.get('/films', (req, res) => {
  const films = db.prepare('SELECT * FROM films ORDER BY episode_id').all();
  res.json(films);
});

// Эндпоинт для получения информации о фильме по episode_id
app.get('/films/:id', (req, res) => {
  const id = req.params.id;
  const film = db.prepare('SELECT * FROM films WHERE episode_id = ?').get(id);
  if (!film) {
    return res.status(404).json({ error: 'Фильм не найден' });
  }
  
  // Получаем всех персонажей, которые участвовали в фильме со всей информацией
  const characters = db.prepare(`
    SELECT p.*
    FROM people p
    JOIN film_people fp ON p.uid = fp.person_id
    WHERE fp.film_id = ?
    ORDER BY p.name
  `).all(id);
  
  res.json({
    ...film,
    characters: characters,
    characters_count: characters.length
  });
});

// Эндпоинт для получения информации о человеке по uid
app.get('/people/:id', async (req, res) => {
  const id = req.params.id;
  const person = db.prepare('SELECT * FROM people WHERE uid = ?').get(id);
  if (!person) {
    return res.status(404).json({ error: 'Человек не найден' });
  }
  
  // Получаем фильмы, в которых участвовал персонаж
  const films = db.prepare(`
    SELECT f.episode_id, f.title, f.director, f.producer, f.release_date, f.url
    FROM films f
    JOIN film_people fp ON f.episode_id = fp.film_id
    WHERE fp.person_id = ?
  `).all(id);
  
  // Возвращаем полную информацию о персонаже с фильмами
  res.json({
    ...person,
    films: films
  });
});

app.get('/test-db', (req, res) => {
  const row = db.prepare('SELECT 1 AS result').get();
  res.json(row);
});

// Эндпоинт для создания реальных связей из SWAPI
app.get('/create-real-links', async (req, res) => {
  try {
    await createRealLinksFromSWAPI();
    res.json({ success: true, message: 'Реальные связи из SWAPI созданы успешно' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Эндпоинт для создания связей между персонажами и фильмами
app.get('/create-links', async (req, res) => {
  try {
    await createRealLinksFromSWAPI();
    res.json({ success: true, message: 'Реальные связи из SWAPI созданы успешно' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


async function fetchPeopleFromSWAPI(){
  console.log('Начинаем загрузку всех персонажей...');
  
  // Загружаем всех персонажей сразу
  const response = await fetch('https://swapi.tech/api/people?page=1&limit=0');
  const data = await response.json();
  console.log(`Получено ${data.results.length} персонажей из SWAPI`);
  const people = data.results;
  
  // Обрабатываем персонажей пачками по 5 (уменьшили для избежания блокировок API)
  const batchSize = 5;
  for (let i = 0; i < people.length; i += batchSize) {
    const batch = people.slice(i, i + batchSize);
    console.log(`Обрабатываем пачку ${Math.floor(i/batchSize) + 1}/${Math.ceil(people.length/batchSize)} (персонажи ${i+1}-${Math.min(i+batchSize, people.length)})`);
    
    // Обрабатываем пачку параллельно
    await Promise.all(batch.map(async (person) => {
      // Проверяем, есть ли уже такой человек
      const exists = db.prepare('SELECT COUNT(*) AS cnt FROM people WHERE name = ? AND url = ?').get(person.name, person.url).cnt;
      if (exists === 0) {
        try {
          // Получаем полную информацию о персонаже
          const personResponse = await fetch(person.url);
          const personData = await personResponse.json();
          const properties = personData.result?.properties || {};
          
          const insertPerson = db.prepare(`
            INSERT INTO people (name, url, birth_year, eye_color, gender, hair_color, height, mass, skin_color, homeworld) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          insertPerson.run(
            person.name, 
            person.url,
            properties.birth_year || null,
            properties.eye_color || null,
            properties.gender || null,
            properties.hair_color || null,
            properties.height || null,
            properties.mass || null,
            properties.skin_color || null,
            properties.homeworld || null
          );
          
          console.log(`✓ ${person.name} добавлен`);
        } catch (err) {
          console.error(`Ошибка при загрузке ${person.name}:`, err.message);
          // Сохраняем базовую информацию при ошибке
          const insertPerson = db.prepare('INSERT INTO people (name, url) VALUES (?, ?)');
          insertPerson.run(person.name, person.url);
        }
      } else {
        console.log(`- ${person.name} уже существует`);
      }
    }));
    
    // Увеличенная пауза между пачками для избежания блокировок API
    if (i + batchSize < people.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

async function fetchFilmsFromSWAPI() {
  try {
    const response = await fetch('https://swapi.tech/api/films');
    const data = await response.json();
    const films = data.result;
    
    for (const film of films) {
      const exists = db.prepare('SELECT COUNT(*) AS cnt FROM films WHERE episode_id = ?').get(film.properties.episode_id).cnt;
      if (exists === 0) {
        const insertFilm = db.prepare(`
          INSERT INTO films (episode_id, title, director, producer, release_date, opening_crawl, url) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        insertFilm.run(
          film.properties.episode_id,
          film.properties.title,
          film.properties.director,
          film.properties.producer,
          film.properties.release_date,
          film.properties.opening_crawl,
          film.properties.url
        );
      }
    }
  } catch (err) {
    console.error('Ошибка при загрузке фильмов:', err);
  }
}

// Функция для очистки дублирующихся связей
function cleanupDuplicateLinks() {
  console.log('Очищаем дублирующиеся связи...');
  
  // Удаляем все связи
  db.prepare('DELETE FROM film_people').run();
  
  // Пересоздаем таблицу с правильным PRIMARY KEY
  db.prepare('DROP TABLE IF EXISTS film_people').run();
  db.prepare(`
    CREATE TABLE film_people(
      film_id INTEGER,
      person_id INTEGER,
      PRIMARY KEY (film_id, person_id),
      FOREIGN KEY (film_id) REFERENCES films(episode_id),
      FOREIGN KEY (person_id) REFERENCES people(uid)
    )
  `).run();
  
  console.log('Таблица film_people пересоздана с уникальными связями');
}

// Функция для создания правильных связей из SWAPI данных
async function createRealLinksFromSWAPI() {
  console.log('Создаем реальные связи персонажей с фильмами из SWAPI...');
  
  // Очищаем существующие связи
  cleanupDuplicateLinks();
  
  const insertLink = db.prepare('INSERT INTO film_people (film_id, person_id) VALUES (?, ?)');
  let totalLinks = 0;
  
  // Получаем всех персонажей из базы
  const people = db.prepare('SELECT uid, name, url FROM people').all();
  console.log(`Обрабатываем ${people.length} персонажей...`);
  
  for (const person of people) {
    try {
      console.log(`Обрабатываем ${person.name}...`);
      
      // Добавляем задержку между запросами
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Получаем информацию о персонаже из SWAPI
      const response = await fetch(person.url);
      if (!response.ok) {
        console.log(`  HTTP ошибка ${response.status} для ${person.name}`);
        continue;
      }
      
      const data = await response.json();
      const properties = data.result?.properties;
      
      if (properties && properties.films && Array.isArray(properties.films)) {
        console.log(`  Найдено ${properties.films.length} фильмов для ${person.name}`);
        
        for (const filmUrl of properties.films) {
          // Извлекаем episode_id из URL фильма
          const episodeMatch = filmUrl.match(/films\/(\d+)/);
          if (episodeMatch) {
            const episodeId = parseInt(episodeMatch[1]);
            
            // Проверяем, есть ли фильм в нашей базе
            const film = db.prepare('SELECT episode_id FROM films WHERE episode_id = ?').get(episodeId);
            if (film) {
              insertLink.run(episodeId, person.uid);
              totalLinks++;
              console.log(`    ✓ Связь: ${person.name} <-> Фильм ${episodeId}`);
            }
          }
        }
      }
    } catch (err) {
      console.error(`  Ошибка при обработке ${person.name}:`, err.message);
    }
  }
  
  console.log(`Всего создано связей из SWAPI: ${totalLinks}`);
  
  // Показываем статистику
  const linkCount = db.prepare('SELECT COUNT(*) AS cnt FROM film_people').get().cnt;
  console.log(`Финальное количество связей в базе: ${linkCount}`);
  
  // Показываем распределение по фильмам
  const filmStats = db.prepare(`
    SELECT f.title, f.episode_id, COUNT(fp.person_id) as character_count
    FROM films f
    LEFT JOIN film_people fp ON f.episode_id = fp.film_id
    GROUP BY f.episode_id
    ORDER BY f.episode_id
  `).all();
  
  console.log('Статистика по фильмам:');
  filmStats.forEach(stat => {
    console.log(`  ${stat.title} (${stat.episode_id}): ${stat.character_count} персонажей`);
  });
}
function createBasicLinks() {
  console.log('Создаем базовые связи персонажей с фильмами...');
  
  // Очищаем дубликаты сначала
  cleanupDuplicateLinks();
  
  const insertLink = db.prepare('INSERT INTO film_people (film_id, person_id) VALUES (?, ?)');
  
  // Эпизод 1: The Phantom Menace
  const phantomMenaceCharacters = [
    'Qui-Gon Jinn', 'Obi-Wan Kenobi', 'Anakin Skywalker', 'Padmé Amidala', 
    'Jar Jar Binks', 'C-3PO', 'R2-D2', 'Nute Gunray', 'Finis Valorum',
    'Roos Tarpals', 'Rugor Nass', 'Ric Olié', 'Watto', 'Sebulba',
    'Quarsh Panaka', 'Shmi Skywalker', 'Darth Maul', 'Bib Fortuna',
    'Ratts Tyerel', 'Dud Bolt', 'Gasgano', 'Ben Quadinaros', 'Mace Windu',
    'Ki-Adi-Mundi', 'Yoda', 'Yarael Poof', 'Plo Koon', 'Mas Amedda'
  ];
  
  console.log('Добавляем персонажей The Phantom Menace...');
  for (const characterName of phantomMenaceCharacters) {
    const person = db.prepare('SELECT uid FROM people WHERE name = ?').get(characterName);
    if (person) {
      insertLink.run(1, person.uid);
      console.log(`✓ Связь создана: ${characterName} <-> The Phantom Menace`);
    }
  }
  
  // Эпизод 2: Attack of the Clones
  const attackClonesCharacters = [
    'Obi-Wan Kenobi', 'Anakin Skywalker', 'Padmé Amidala', 'C-3PO', 'R2-D2',
    'Palpatine', 'Mace Windu', 'Ki-Adi-Mundi', 'Yoda', 'Saesee Tiin', 'Kit Fisto',
    'Eeth Koth', 'Adi Gallia', 'Plo Koon', 'Mas Amedda', 'Gregar Typho', 'Cordé',
    'Cliegg Lars', 'Shmi Skywalker', 'Owen Lars', 'Beru Whitesun lars', 
    'Poggle the Lesser', 'Luminara Unduli', 'Barriss Offee', 'Dormé', 'Dooku',
    'Bail Prestor Organa', 'Jango Fett', 'Zam Wesell', 'Dexter Jettster',
    'Lama Su', 'Taun We', 'Jocasta Nu', 'Wat Tambor', 'San Hill', 'Shaak Ti'
  ];
  
  console.log('Добавляем персонажей Attack of the Clones...');
  for (const characterName of attackClonesCharacters) {
    const person = db.prepare('SELECT uid FROM people WHERE name = ?').get(characterName);
    if (person) {
      insertLink.run(2, person.uid);
      console.log(`✓ Связь создана: ${characterName} <-> Attack of the Clones`);
    }
  }
  
  // Эпизод 3: Revenge of the Sith
  const revengeSithCharacters = [
    'Obi-Wan Kenobi', 'Anakin Skywalker', 'Padmé Amidala', 'C-3PO', 'R2-D2',
    'Palpatine', 'Mace Windu', 'Ki-Adi-Mundi', 'Yoda', 'Saesee Tiin', 'Kit Fisto',
    'Eeth Koth', 'Adi Gallia', 'Plo Koon', 'Luminara Unduli', 'Shaak Ti',
    'Grievous', 'Tarfful', 'Raymus Antilles', 'R4-P17', 'Sly Moore', 'Tion Medon',
    'Dooku', 'Bail Prestor Organa', 'Nute Gunray', 'Owen Lars', 'Beru Whitesun lars'
  ];
  
  console.log('Добавляем персонажей Revenge of the Sith...');
  for (const characterName of revengeSithCharacters) {
    const person = db.prepare('SELECT uid FROM people WHERE name = ?').get(characterName);
    if (person) {
      insertLink.run(3, person.uid);
      console.log(`✓ Связь создана: ${characterName} <-> Revenge of the Sith`);
    }
  }
  
  // Основные персонажи из "A New Hope" (episode_id = 4)
  const aNewHopeCharacters = [
    'Luke Skywalker', 'C-3PO', 'R2-D2', 'Darth Vader', 'Leia Organa',
    'Owen Lars', 'Beru Whitesun lars', 'R5-D4', 'Biggs Darklighter', 
    'Obi-Wan Kenobi', 'Wilhuff Tarkin', 'Chewbacca', 'Han Solo', 'Greedo',
    'Jabba Desilijic Tiure', 'Wedge Antilles', 'Jek Tono Porkins'
  ];
  
  console.log('Добавляем персонажей A New Hope...');
  for (const characterName of aNewHopeCharacters) {
    const person = db.prepare('SELECT uid FROM people WHERE name = ?').get(characterName);
    if (person) {
      insertLink.run(4, person.uid);
      console.log(`✓ Связь создана: ${characterName} <-> A New Hope`);
    }
  }
  
  // Основные персонажи из "The Empire Strikes Back" (episode_id = 5)
  const empireCharacters = [
    'Luke Skywalker', 'C-3PO', 'R2-D2', 'Darth Vader', 'Leia Organa',
    'Chewbacca', 'Han Solo', 'Wedge Antilles', 'Yoda', 'Palpatine',
    'Boba Fett', 'IG-88', 'Bossk', 'Lando Calrissian', 'Lobot'
  ];
  
  console.log('Добавляем персонажей The Empire Strikes Back...');
  for (const characterName of empireCharacters) {
    const person = db.prepare('SELECT uid FROM people WHERE name = ?').get(characterName);
    if (person) {
      insertLink.run(5, person.uid);
      console.log(`✓ Связь создана: ${characterName} <-> The Empire Strikes Back`);
    }
  }
  
  // Основные персонажи из "Return of the Jedi" (episode_id = 6)
  const jediCharacters = [
    'Luke Skywalker', 'C-3PO', 'R2-D2', 'Darth Vader', 'Leia Organa',
    'Chewbacca', 'Han Solo', 'Wedge Antilles', 'Yoda', 'Palpatine',
    'Boba Fett', 'Lando Calrissian', 'Ackbar', 'Mon Mothma', 
    'Arvel Crynyd', 'Wicket Systri Warrick', 'Nien Nunb', 'Jabba Desilijic Tiure'
  ];
  
  console.log('Добавляем персонажей Return of the Jedi...');
  for (const characterName of jediCharacters) {
    const person = db.prepare('SELECT uid FROM people WHERE name = ?').get(characterName);
    if (person) {
      insertLink.run(6, person.uid);
      console.log(`✓ Связь создана: ${characterName} <-> Return of the Jedi`);
    }
  }
  
  const totalLinks = db.prepare('SELECT COUNT(*) AS cnt FROM film_people').get().cnt;
  console.log(`Всего создано уникальных связей: ${totalLinks}`);
  
  // Показываем статистику по фильмам
  const filmStats = db.prepare(`
    SELECT f.title, f.episode_id, COUNT(fp.person_id) as character_count
    FROM films f
    LEFT JOIN film_people fp ON f.episode_id = fp.film_id
    GROUP BY f.episode_id
    ORDER BY f.episode_id
  `).all();
  
  console.log('Статистика по всем фильмам:');
  filmStats.forEach(stat => {
    console.log(`  ${stat.title} (${stat.episode_id}): ${stat.character_count} персонажей`);
  });
}

async function linkPeopleToFilmsSimple() {
  console.log('Создаем связи между персонажами и фильмами...');
  
  // Получаем всех персонажей, у которых нет связей с фильмами
  const people = db.prepare(`
    SELECT DISTINCT p.uid, p.name, p.url 
    FROM people p 
    LEFT JOIN film_people fp ON p.uid = fp.person_id 
    WHERE fp.person_id IS NULL
    LIMIT 20
  `).all();
  
  console.log(`Найдено ${people.length} персонажей без связей с фильмами`);
  
  for (const person of people) {
    try {
      console.log(`Обрабатываем связи для ${person.name}...`);
      
      // Добавляем задержку между запросами
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Получаем детальную информацию о персонаже
      const personResponse = await fetch(person.url);
      
      // Проверяем статус ответа
      if (!personResponse.ok) {
        console.log(`HTTP ошибка ${personResponse.status} для ${person.name}`);
        continue;
      }
      
      const personData = await personResponse.json();
      const properties = personData.result?.properties || {};
      
      if (properties.films && Array.isArray(properties.films)) {
        console.log(`  Найдено ${properties.films.length} фильмов для ${person.name}`);
        
        for (const filmUrl of properties.films) {
          // Извлекаем episode_id из URL фильма
          const episodeMatch = filmUrl.match(/films\/(\d+)/);
          if (episodeMatch) {
            const episodeId = parseInt(episodeMatch[1]);
            
            // Проверяем, есть ли фильм в базе
            const film = db.prepare('SELECT episode_id FROM films WHERE episode_id = ?').get(episodeId);
            
            if (film) {
              // Проверяем, есть ли уже связь
              const linkExists = db.prepare('SELECT COUNT(*) AS cnt FROM film_people WHERE film_id = ? AND person_id = ?')
                .get(episodeId, person.uid).cnt;
              
              if (linkExists === 0) {
                // Добавляем связь
                const insertLink = db.prepare('INSERT INTO film_people (film_id, person_id) VALUES (?, ?)');
                insertLink.run(episodeId, person.uid);
                console.log(`    ✓ Связь с фильмом ${episodeId} добавлена`);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`Ошибка при обработке ${person.name}:`, err.message);
      // Продолжаем с следующим персонажем
    }
  }
  
  // Проверяем результат
  const totalLinks = db.prepare('SELECT COUNT(*) AS cnt FROM film_people').get().cnt;
  console.log(`Общее количество связей персонаж-фильм: ${totalLinks}`);
}

async function processFilmForPerson(filmUrl, personName) {
  try {
    // Добавляем задержку между запросами к API
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Получаем информацию о фильме
    const filmResponse = await fetch(filmUrl);
    const filmData = await filmResponse.json();
    const filmProperties = filmData.result?.properties;
    
    if (filmProperties) {
      // Проверяем, есть ли фильм в базе
      let film = db.prepare('SELECT episode_id FROM films WHERE episode_id = ?').get(filmProperties.episode_id);
      
      if (!film) {
        // Добавляем фильм, если его нет
        const insertFilm = db.prepare(`
          INSERT INTO films (episode_id, title, director, producer, release_date, opening_crawl, url) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        insertFilm.run(
          filmProperties.episode_id,
          filmProperties.title,
          filmProperties.director,
          filmProperties.producer,
          filmProperties.release_date,
          filmProperties.opening_crawl,
          filmUrl
        );
      }
      
      // Получаем ID персонажа
      const person = db.prepare('SELECT uid FROM people WHERE name = ?').get(personName);
      
      if (person) {
        // Проверяем, есть ли уже связь
        const linkExists = db.prepare('SELECT COUNT(*) AS cnt FROM film_people WHERE film_id = ? AND person_id = ?')
          .get(filmProperties.episode_id, person.uid).cnt;
        
        if (linkExists === 0) {
          // Добавляем связь между фильмом и персонажем
          const insertLink = db.prepare('INSERT INTO film_people (film_id, person_id) VALUES (?, ?)');
          insertLink.run(filmProperties.episode_id, person.uid);
        }
      }
    }
  } catch (err) {
    console.error(`Ошибка при обработке фильма ${filmUrl} для персонажа ${personName}:`, err);
  }
}

// Запускаем сервер только после заполнения базы
(async () => {
  console.log('Загружаем фильмы из SWAPI...');
  await fetchFilmsFromSWAPI();
  console.log('Загружаем персонажей из SWAPI...');
  await fetchPeopleFromSWAPI();
  
  // Создаем базовые связи
  createBasicLinks();
  
  const count = db.prepare('SELECT COUNT(*) AS cnt FROM people').get().cnt;
  console.log('Количество людей:', count);
  
  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
})();
