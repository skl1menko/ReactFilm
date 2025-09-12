import { Link } from "react-router"; // 🛠 ВАЖЛИВО: використовуємо react-router-dom, не просто react-router
import './Header.css';
import strLogo from './img/str-logo.png';

const Header = () => {
    return (
        <div className="header-container">
            <header>
                <Link to='/' className="st-logo">
                    <img src={strLogo} alt="Star Wars Logo" />
                </Link>
            </header>
            <nav className="navbar">
                <ul className="nav-links">
                    <li><Link to="/" className="nav-link">Films</Link></li>
                    <li><Link to="/characters" className="nav-link">Characters</Link></li>
                </ul>
            </nav>
        </div>
    );
};

export default Header;
