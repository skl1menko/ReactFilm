import { fetchCharacters } from '../../features/characters/charactersSlice';
import { useEffect } from 'react';
import { Link } from 'react-router';
import characterImages from '../../assets/characterImages';
import LoadingSpinner from '../LoadingSpinner';
import './CharactersList.css';
const CharactersList = ({ dispatch, characters, status, currentPage }) => {
    useEffect(() => {
        dispatch(fetchCharacters(currentPage));
    }, [dispatch, currentPage]);

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    if (status === 'failed') {
        return <p>Error loading characters</p>;
    }

    return (
        <div className="char-ctr">
            {characters.map((character) => (
                <div className="characterItem" key={character.uid}>
                    <Link to={`/characters/${character.uid}`} className="link">
                        <div className="characters-info">
                            <img
                                src={characterImages[character.name]}
                                alt={character.name}
                                className="characters-image"
                            />
                            <p className="characters-name">{character.name}</p>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default CharactersList;