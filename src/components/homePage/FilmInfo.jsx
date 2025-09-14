import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilms } from "../../features/films/filmsSlice";
import './FilmInfo.css';
import { Link } from "react-router";
import filmImages from '../../assets/filmImages';
const FilmInfo = () => {
    const dispatch = useDispatch();
    const { items, status } = useSelector((state) => state.films);

    useEffect(() => {
        if (status === "idle") dispatch(fetchFilms());
    }, [dispatch, status]);

    return (
        <div className="home-container">
            <h1 className="home-title">Star Wars Films</h1>
            <div className="film-container">
                {items.map((film) => (
                    <div key={film.uid} className="filmItem">
                        <Link to={`/films/${film.uid}`} className="link">
                            <div className="film-info">
                                <img
                                    src={filmImages[film.properties.title] || "https://example.com/default-image.jpg"}
                                    alt={film.properties.title}
                                    className="films-image"
                                />
                                <div className="film-details">
                                    <p className="film-title">{film.properties.title}</p>
                                    <p className="film-director">{film.properties.director}</p>
                                    <p className="film-release">{film.properties.release_date}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

        </div>
    )


}

export default FilmInfo;