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


  // Создать реальные связи из SWAPI
  async createRealLinksFromSWAPI() {
    try {
      console.log('Создаем реальные связи из SWAPI...');
      
      // Очищаем старые связи
      this.filmPersonModel.recreateTable();
      console.log('Таблица связей очищена');

      const allPeople = this.personModel.getAll(); // Изменено: получаем ВСЕХ персонажей
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
                
                if (episodeId && !this.filmPersonModel.exists(episodeId, person.uid)) {
                  this.filmPersonModel.create(episodeId, person.uid);
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