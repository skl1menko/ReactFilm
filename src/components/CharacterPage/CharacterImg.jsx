import charactersImages from '../../assets/characterImages';
import './CharacterImg.css';
const CharacterImg = ({details}) => {
    return (
        <div className="character-image-container">
            <img
                src={charactersImages[details.name]}
                alt={details.name}
                className="character-image"
            />
        </div>
    )
}
export default CharacterImg;