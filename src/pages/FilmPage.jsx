import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchFilmById, fetchAllCharacters } from "../features/films/filmSlice";
import AnimatedPage from "../components/AnimatedPage";
import LoadingSpinner from "../components/LoadingSpinner";
import './FilmPage.css';
import FilmInfo2 from "../components/FilmPage/FilmInfo2";
import CharactersList2 from "../components/FilmPage/CharactersList2";


export default function FilmPage() {
  const { filmId } = useParams();
  const dispatch = useDispatch();
  const { details, status, allCharacters } = useSelector((state) => state.film);

  useEffect(() => {
    dispatch(fetchFilmById(filmId));
    dispatch(fetchAllCharacters());
  }, [dispatch, filmId]);


  if (status === "loading") return <LoadingSpinner />; if (!details) return <p>No data available</p>;

  return (
    <AnimatedPage>
      <div className="bd">
        <div className="container">
          <FilmInfo2 details={details} />
          <CharactersList2 details={details} allCharacters={allCharacters} />
        </div>
      </div>
    </AnimatedPage>
  );
}
