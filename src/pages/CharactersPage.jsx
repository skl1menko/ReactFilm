import { useDispatch, useSelector } from 'react-redux';
import AnimatedPage from '../components/AnimatedPage';
import './CharactersPage.css';
import Pagination from '../components/CharactersPage/Pagination';
import CharactersList from '../components/CharactersPage/CharactersList';

const CharactersPage = () => {
    const dispatch = useDispatch();
    const { characters, status, currentPage } = useSelector((state) => state.characters);

    return (
        <AnimatedPage>
            <div className="characters-container">
                <h1 className="characters-title">Star Wars Characters</h1>
                <CharactersList dispatch={dispatch} characters={characters} status={status} currentPage={currentPage}/>
                <Pagination dispatch={dispatch} />
            </div>
        </AnimatedPage>
    );
};

export default CharactersPage;
