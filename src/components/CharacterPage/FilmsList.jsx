import filmImages from '../../assets/filmImages';
import { Link } from 'react-router';
import './FilmsList.css';
const FilmsList = ({charId,films}) => {
    const characterFilms = films
        .filter(film =>
            film.properties.characters.some(charUrl => charUrl.includes(`people/${charId}`))
        )
        .sort((a, b) => a.properties.episode_id - b.properties.episode_id);
    
    return (
        <div className="character-films">
            <h3>Films</h3>
            <div className="films-grid">
                {characterFilms.map((film) => (
                    <Link to={`/films/${film.uid}`} key={film.uid} className="film-card">
                        <img
                            src={filmImages[film.properties.title]}
                            alt={film.properties.title}
                            className="film-image"
                        />
                        <h4>{film.properties.title}</h4>
                        <p>Episode {film.properties.episode_id}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}
export default FilmsList;