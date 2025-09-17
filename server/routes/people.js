import express from 'express';
import Person from '../models/Person.js';
import SwapiService from '../services/swapiService.js';

const router = express.Router();
const personModel = new Person();
const swapiService = new SwapiService();

// GET /people - Получить всех персонажей
router.get('/', (req, res) => {
  try {
    const { sort } = req.query;
    let people;

    switch (sort) {
      case 'popularity':
        people = personModel.getAllByPopularity();
        break;
      case 'order':
        people = personModel.getAllByOrder();
        break;
      default:
        people = personModel.getAllWithFilms();
        break;
    }

    res.json(people);
  } catch (err) {
    console.error('Ошибка при получении персонажей:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /people/:id - Получить конкретного персонажа
router.get('/:id', async (req, res) => {
  try {
    const personId = parseInt(req.params.id);
    
    if (isNaN(personId)) {
      return res.status(400).json({ error: 'Некорректный ID персонажа' });
    }
    
    let person = personModel.getWithFilms(personId);
    
    if (!person) {
      return res.status(404).json({ error: 'Персонаж не найден' });
    }
    
    // Проверяем, есть ли детальная информация
    const hasDetails = person.birth_year !== null && person.birth_year !== undefined;
    
    if (!hasDetails && person.url) {
      console.log(`Загружаем детали для персонажа ${person.name} (ID: ${personId})...`);
      
      try {
        // Загружаем детали автоматически
        const updatedPerson = await swapiService.loadPersonDetails(personId);
        if (updatedPerson) {
          // Получаем обновленного персонажа с фильмами
          person = personModel.getWithFilms(personId);
          console.log(`✓ Детали для ${person.name} загружены и добавлены в ответ`);
        }
      } catch (err) {
        console.error(`Ошибка при автозагрузке деталей для ${person.name}:`, err.message);
        // Возвращаем персонажа без деталей, если загрузка не удалась
      }
    }
    
    res.json(person);
  } catch (err) {
    console.error('Ошибка при получении персонажа:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /people/search/:name - Поиск персонажа по имени
router.get('/search/:name', (req, res) => {
  try {
    const name = req.params.name;
    const people = personModel.searchByName(name);
    res.json(people);
  } catch (err) {
    console.error('Ошибка при поиске персонажей:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;