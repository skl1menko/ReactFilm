import Film from '../models/Film.js';
import Person from '../models/Person.js';
import FilmPerson from '../models/FilmPerson.js';
import SwapiService from './swapiService.js';

class LinkService {
  constructor() {
    this.filmModel = new Film();
    this.personModel = new Person();
    this.filmPersonModel = new FilmPerson();
    this.swapiService = new SwapiService();
  }

  // Создать базовые связи для всех эпизодов
  async createBasicLinks() {
    try {
      console.log('Создаем базовые связи между персонажами и фильмами...');
      
      const episodeMapping = {
        'A New Hope': 1,
        'The Empire Strikes Back': 2,
        'Return of the Jedi': 3,
        'The Phantom Menace': 4,
        'Attack of the Clones': 5,
        'Revenge of the Sith': 6
      };

      const films = this.filmModel.getAll();
      const allPeople = this.personModel.getAll();
      
      for (const film of films) {
        console.log(`\nОбрабатываем фильм: ${film.title}`);
        
        for (const person of allPeople) {
          try {
            const personDetails = await this.swapiService.getPersonDetails(person.url);
            
            if (personDetails && personDetails.films) {
              const appearsInFilm = personDetails.films.some(filmUrl => {
                const filmId = filmUrl.split('/').filter(part => part)[4];
                const episodeId = episodeMapping[film.title];
                return filmId == episodeId;
              });

              if (appearsInFilm) {
                if (!this.filmPersonModel.exists(film.episode_id, person.id)) {
                  this.filmPersonModel.create(film.episode_id, person.id);
                  console.log(`✓ Связь: ${person.name} ↔ ${film.title}`);
                }
              }
            }
          } catch (err) {
            console.error(`Ошибка при обработке ${person.name}:`, err.message);
          }
        }
      }
      
      console.log('Базовые связи созданы!');
      return { success: true, message: 'Базовые связи созданы' };
    } catch (err) {
      console.error('Ошибка при создании базовых связей:', err);
      return { success: false, error: err.message };
    }
  }

  // Создать реальные связи из SWAPI
  async createRealLinksFromSWAPI() {
    try {
      console.log('Создаем реальные связи из SWAPI...');
      
      // Очищаем старые связи
      this.filmPersonModel.recreateTable();
      console.log('Таблица связей очищена');

      const allPeople = this.personModel.getWithoutFilmLinks();
      console.log(`Обрабатываем ${allPeople.length} персонажей...`);
      
      // Обрабатываем пачками для избежания блокировки API
      const batchSize = 5;
      let linksCreated = 0;
      
      for (let i = 0; i < allPeople.length; i += batchSize) {
        const batch = allPeople.slice(i, i + batchSize);
        console.log(`\nПачка ${Math.floor(i/batchSize) + 1}/${Math.ceil(allPeople.length/batchSize)} (персонажи ${i+1}-${Math.min(i+batchSize, allPeople.length)})`);
        
        await Promise.all(batch.map(async (person) => {
          try {
            const personDetails = await this.swapiService.getPersonDetails(person.url);
            
            if (personDetails && personDetails.films && Array.isArray(personDetails.films)) {
              console.log(`${person.name}: найдено ${personDetails.films.length} фильмов`);
              
              for (const filmUrl of personDetails.films) {
                const episodeId = this.extractEpisodeFromUrl(filmUrl);
                
                if (episodeId && !this.filmPersonModel.exists(episodeId, person.id)) {
                  this.filmPersonModel.create(episodeId, person.id);
                  linksCreated++;
                  console.log(`  ✓ Связь: ${person.name} ↔ Эпизод ${episodeId}`);
                }
              }
            }
          } catch (err) {
            console.error(`Ошибка при обработке ${person.name}:`, err.message);
          }
        }));
        
        // Пауза между пачками
        if (i + batchSize < allPeople.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log(`\nГотово! Создано ${linksCreated} связей.`);
      return { success: true, message: `Создано ${linksCreated} связей`, linksCreated };
    } catch (err) {
      console.error('Ошибка при создании реальных связей:', err);
      return { success: false, error: err.message };
    }
  }

  // Извлечь номер эпизода из URL фильма
  extractEpisodeFromUrl(filmUrl) {
    try {
      const urlParts = filmUrl.split('/').filter(part => part);
      const filmId = parseInt(urlParts[urlParts.length - 1]);
      return filmId;
    } catch (err) {
      console.error('Ошибка при извлечении ID фильма:', err);
      return null;
    }
  }

  // Получить статистику связей
  getLinksStatistics() {
    const totalLinks = this.filmPersonModel.getTotalCount();
    const filmsWithCharacters = this.filmModel.getWithCharacters();
    
    return {
      totalLinks,
      filmsCount: filmsWithCharacters.length,
      characterCount: this.personModel.getTotalCount(),
      averageCharactersPerFilm: totalLinks / filmsWithCharacters.length || 0
    };
  }
}

export default LinkService;