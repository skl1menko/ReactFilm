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
      
      // Сначала получаем первую страницу, чтобы узнать общее количество
      let currentUrl = `${this.baseUrl}/people`;
      let page = 1;
      
      while (currentUrl && page <= 9) {
        console.log(`Загружаем страницу ${page}...`);
        console.log(`URL: ${currentUrl}`);
        
        const response = await fetch(currentUrl);
        const data = await response.json();
        
        console.log(`Ответ API для страницы ${page}:`, data);
        
        // Проверяем структуру ответа
        const people = data.results || data.result || [];
        
        if (people.length === 0) {
          console.log(`⚠ Страница ${page}: нет персонажей`);
          break;
        }
        
        console.log(`Найдено ${people.length} персонажей на странице ${page}`);
        
        for (const person of people) {
          const personName = person.name || person.properties?.name;
          const personUrl = person.url || person.properties?.url;
          
          if (personName && personUrl) {
            if (!this.personModel.exists(personName, personUrl)) {
              // Сохраняем только базовую информацию
              this.personModel.create({
                name: personName,
                url: personUrl
              });
              console.log(`✓ Персонаж "${personName}" добавлен`);
            } else {
              console.log(`- Персонаж "${personName}" уже существует`);
            }
          } else {
            console.log(`⚠ Пропускаем персонажа без имени или URL:`, person);
          }
        }
        
        // Получаем URL следующей страницы
        currentUrl = data.next;
        page++;
        
        console.log(`Следующая страница: ${currentUrl}`);
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

  // Загрузить и сохранить детальную информацию для конкретного персонажа
  async loadPersonDetails(personId) {
    try {
      const person = this.personModel.getById(personId);
      if (!person || !person.url) {
        throw new Error('Персонаж не найден или нет URL');
      }

      // Если детали уже загружены, возвращаем их
      if (person.birth_year !== null && person.birth_year !== undefined) {
        return person;
      }

      console.log(`Загружаем детальную информацию для "${person.name}"...`);
      const details = await this.getPersonDetails(person.url);
      
      if (details) {
        // Обновляем персонажа с детальной информацией
        const updatedPerson = this.personModel.update(personId, {
          birth_year: details.birth_year,
          eye_color: details.eye_color,
          gender: details.gender,
          hair_color: details.hair_color,
          height: details.height,
          mass: details.mass,
          skin_color: details.skin_color,
          homeworld: details.homeworld
        });
        
        console.log(`✓ Детальная информация для "${person.name}" загружена`);
        return updatedPerson;
      }
      
      return person;
    } catch (err) {
      console.error('Ошибка при загрузке деталей персонажа:', err);
      return null;
    }
  }

  // Обновить детальную информацию для всех персонажей
  async updatePeopleDetails() {
    try {
      console.log('Обновляем детальную информацию персонажей...');
      const people = this.personModel.getAll();
      
      for (const person of people) {
        if (person.url && !person.birth_year) { // Если детали еще не загружены
          const details = await this.getPersonDetails(person.url);
          if (details) {
            this.personModel.update(person.id, {
              birth_year: details.birth_year,
              eye_color: details.eye_color,
              gender: details.gender,
              hair_color: details.hair_color,
              height: details.height,
              mass: details.mass,
              skin_color: details.skin_color,
              homeworld: details.homeworld
            });
            console.log(`✓ Обновлен "${person.name}"`);
          }
        }
      }
    } catch (err) {
      console.error('Ошибка при обновлении персонажей:', err);
    }
  }
}

export default SwapiService;