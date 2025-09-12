import filmImages from '../../assets/filmImages';
import './FilmInfo2.css';

const FilmInfo2 = ({ details }) => {
  return (
    <div className="filmInf">
      <div className="poster-cont">
        <img src={filmImages[details.title]} />
      </div>
      <div className="filmInfo-cont">
        <h2 className="title">{details.title}</h2>
        <p className="info"><strong>Director:</strong> {details.director}</p>
        <p className="info"><strong>Producer:</strong> {details.producer}</p>
        <p className="info"><strong>Release Date:</strong> {details.release_date}</p>
        <p className="crawl"><strong>Opening Crawl:</strong> {details.opening_crawl}</p>
      </div>
    </div>
  )
}
export default FilmInfo2;