import filmImages from '../../assets/filmImages';
import { Link } from 'react-router';
import './FilmsList.css';
const FilmsList = ({character}) => {
    // Используем фильмы, которые уже приходят с персонажем из API
    const characterFilms = character?.films || [];
    
    return (
        <div className="character-films">
            <h3>Films</h3>
            <div className="films-grid">
                {characterFilms.map((film) => (
                    <Link to={`/films/${film.episode_id}`} key={film.episode_id} className="film-card">
                        <img
                            src={filmImages[film.title]}
                            alt={film.title}
                            className="film-image"
                        />
                        <h4>{film.title}</h4>
                        <p>Episode {film.episode_id}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}
export default FilmsList;