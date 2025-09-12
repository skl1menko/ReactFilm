import { useRef, useEffect } from "react";
import charactersImages from '../../assets/characterImages';
import { Link } from "react-router";
import './CharactersList2.css';

const CharactersList = ({ details, allCharacters }) => {
    const scrollContainerRef = useRef(null);
    const BUTTON_SCROLL_AMOUNT = 400; // Pixels to scroll when clicking buttons
    const WHEEL_SCROLL_MULTIPLIER = 5;

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const newScrollPosition = scrollContainerRef.current.scrollLeft +
                (direction === 'left' ? -BUTTON_SCROLL_AMOUNT : BUTTON_SCROLL_AMOUNT);
            scrollContainerRef.current.scrollTo({
                left: newScrollPosition,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const wheelHandler = (event) => {
            event.preventDefault();
            const scrollAmount = event.deltaY * WHEEL_SCROLL_MULTIPLIER;
            container.scrollLeft += scrollAmount;
        };

        container.addEventListener("wheel", wheelHandler, { passive: false });

        return () => {
            container.removeEventListener("wheel", wheelHandler);
        };
    }, []);

    const getNameByUrl = (url) => {
        const id = url.split('/').filter(Boolean).pop();
        const character = allCharacters.find(c => c.id === id);
        return character ? character.name : `Character ${id}`;
    };

    return (
        <div className="char-cont">
            <h3 className="subtitle">Characters</h3>
            <div className="character-scroll-container">
                <button className="scroll-button left" onClick={() => scroll('left')}>‹</button>
                <ul
                    className="character-list"
                    ref={scrollContainerRef}
                >
                    {details.characters?.map(url => (
                        <li key={url}>
                            <Link to={`/characters/${url.split('/').filter(Boolean).pop()}`} className="character-link">
                                <img src={charactersImages[getNameByUrl(url)]} alt="" />
                                <p>{getNameByUrl(url)}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
                <button className="scroll-button right" onClick={() => scroll('right')}>›</button>
            </div>
        </div>
    );
};

export default CharactersList;
