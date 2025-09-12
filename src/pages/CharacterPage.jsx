import { useParams } from "react-router"; 
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCharacterById } from "../features/characters/characterSlice";
import { fetchFilms } from "../features/films/filmsSlice";
import AnimatedPage from "../components/AnimatedPage";
import LoadingSpinner from "../components/LoadingSpinner";
import './CharacterPage.css';
import CharacterImg from "../components/CharacterPage/CharacterImg";
import CharacterInfo from "../components/CharacterPage/CharacterInfo";
import FilmsList from "../components/CharacterPage/FilmsList";


export default function CharacterPage() {
  const { charId } = useParams();
  const dispatch = useDispatch();
  const { details, status } = useSelector((state) => state.character);
  const { items: films, status: filmsStatus } = useSelector((state) => state.films);

  useEffect(() => {
    dispatch(fetchCharacterById(charId));
    dispatch(fetchFilms());
  }, [dispatch, charId]);


  if (status === "loading" || filmsStatus === "loading") return <LoadingSpinner />;
  if (!details) return <p>No character data</p>;



  return (
    <AnimatedPage>
      <div className="character-page">
        <div className="character-container">
          <div className="character-content">
            <CharacterImg details={details} />
            <CharacterInfo details={details} />
          </div>
          <FilmsList charId={charId} films={films} />
        </div>
      </div>
    </AnimatedPage>
  );
}
