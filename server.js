import express from 'express';
import databaseConfig from './server/config/database.js';
import peopleRoutes from './server/routes/people.js';
import filmsRoutes from './server/routes/films.js';
import apiRoutes from './server/routes/api.js';
import Film from './server/models/Film.js';
import People from './server/models/Person.js';
import SwapiService from './server/services/swapiService.js';
import LinkService from './server/services/linkService.js';
const app = express();
const PORT = 3001;

// Инициализация базы данных
databaseConfig.initTables();

// Middleware
app.use(express.json());

// Маршруты
app.get('/', (req, res) => {
  res.send('Backend сервер работает!');
});

// Подключение модульных маршрутов
app.use('/people', peopleRoutes);
app.use('/films', filmsRoutes);
app.use('/api', apiRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступно по адресу: http://localhost:${PORT}`);
  console.log('Маршруты:');
  console.log('  GET  /people           - все персонажи');
  console.log('  GET  /people/:id       - конкретный персонаж');
  console.log('  GET  /films            - все фильмы');
  console.log('  GET  /films/:id        - конкретный фильм');
});

const filmModel = new Film();
const peopleModel = new People();
const filmsCount = await filmModel.getAll().length;
const peopleCount = await peopleModel.getAll().length;
const swapiService = new SwapiService();
const linkService = new LinkService();
 (async () => {
    if (filmsCount === 0) {
      console.log('База фильмов пуста. Загружаем фильмы из SWAPI...');
      await swapiService.loadFilms();
    }
    if (peopleCount === 0) {
      console.log('База персонажей пуста. Загружаем персонажей из SWAPI...');
      await swapiService.loadPeople();
      // Обновляем детали персонажей
      //await swapiService.updatePeopleDetails();
    }
    if (filmsCount === 0 || peopleCount === 0) {
      console.log('Создаем реальные связи между персонажами и фильмами...');
      const result = await linkService.createRealLinksFromSWAPI();
    }
  })();
