import './CharacterInfo.css';
const CharacterInfo = ({details}) => {
return (
    <div className="character-info">
    <h2 className="character-title">{details.name}</h2>
    <div className="info-grid">
      <div className="info-item">
        <span className="info-label">Gender</span>
        <span className="info-value">{details.gender}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Birth Year</span>
        <span className="info-value">{details.birth_year}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Height</span>
        <span className="info-value">{details.height} cm</span>
      </div>
      <div className="info-item">
        <span className="info-label">Mass</span>
        <span className="info-value">{details.mass} kg</span>
      </div>
      <div className="info-item">
        <span className="info-label">Hair Color</span>
        <span className="info-value">{details.hair_color}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Eye Color</span>
        <span className="info-value">{details.eye_color}</span>
      </div>
      <div className="info-item">
        <span className="info-label">Skin Color</span>
        <span className="info-value">{details.skin_color}</span>
      </div>
    </div>
  </div>
)
}
export default CharacterInfo;