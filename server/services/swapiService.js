import Film from '../models/Film.js';
import Person from '../models/Person.js';

class SwapiService {
  constructor() {
    this.filmModel = new Film();
    this.personModel = new Person();
    this.baseUrl = 'https://swapi.tech/api';
  }

  // Загрузить фильмы из SWAPI
  async loadFilms() {
    try {
      console.log('Загружаем фильмы из SWAPI...');
      const response = await fetch(`${this.baseUrl}/films`);
      const data = await response.json();
      const films = data.result;
      
      for (const film of films) {
        if (!this.filmModel.exists(film.properties.episode_id)) {
          this.filmModel.create({
            episode_id: film.properties.episode_id,
            title: film.properties.title,
            director: film.properties.director,
            producer: film.properties.producer,
            release_date: film.properties.release_date,
            opening_crawl: film.properties.opening_crawl,
            url: film.properties.url
          });
          console.log(`✓ Фильм "${film.properties.title}" добавлен`);
        }
      }
    } catch (err) {
      console.error('Ошибка при загрузке фильмов:', err);
    }
  }

  // Загрузить персонажей из SWAPI
  async loadPeople() {
    try {
      console.log('Загружаем персонажей из SWAPI...');
      
      // Загружаем всех персонажей
      const response = await fetch(`${this.baseUrl}/people?page=1&limit=0`);
      const data = await response.json();
      console.log(`Получено ${data.results.length} персонажей из SWAPI`);
      const people = data.results;
      
      // Обрабатываем персонажей пачками
      const batchSize = 5;
      for (let i = 0; i < people.length; i += batchSize) {
        const batch = people.slice(i, i + batchSize);
        console.log(`Обрабатываем пачку ${Math.floor(i/batchSize) + 1}/${Math.ceil(people.length/batchSize)} (персонажи ${i+1}-${Math.min(i+batchSize, people.length)})`);
        
        await Promise.all(batch.map(async (person) => {
          if (!this.personModel.exists(person.name, person.url)) {
            try {
              // Получаем детальную информацию
              const personResponse = await fetch(person.url);
              const personData = await personResponse.json();
              const properties = personData.result?.properties || {};
              
              this.personModel.create({
                name: person.name,
                url: person.url,
                birth_year: properties.birth_year,
                eye_color: properties.eye_color,
                gender: properties.gender,
                hair_color: properties.hair_color,
                height: properties.height,
                mass: properties.mass,
                skin_color: properties.skin_color,
                homeworld: properties.homeworld
              });
              
              console.log(`✓ ${person.name} добавлен`);
            } catch (err) {
              console.error(`Ошибка при загрузке ${person.name}:`, err.message);
              // Сохраняем базовую информацию при ошибке
              this.personModel.createBasic(person.name, person.url);
            }
          } else {
            console.log(`- ${person.name} уже существует`);
          }
        }));
        
        // Пауза между пачками
        if (i + batchSize < people.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (err) {
      console.error('Ошибка при загрузке персонажей:', err);
    }
  }

  // Получить информацию о персонаже из SWAPI
  async getPersonDetails(url) {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.result?.properties;
    } catch (err) {
      console.error(`Ошибка при получении данных с ${url}:`, err.message);
      return null;
    }
  }
}

export default SwapiService;