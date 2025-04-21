import {Link} from 'react-router-dom';
import logoImage from "../assets/lorislogo.png";
import searchIcon from "../assets/search.png";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/user.png";
import "../styles/nav.css";

const Header = () => {
  return (
    <nav>
      <img className='loris-logo' src={logoImage} />
      <div className="searchbox">
        <input type="text" placeholder="Search by category" />
        <div className="search-button-container">
          <img src={searchIcon} />
        </div>
      </div>
      <div className="right">
        <Link to='/admin'>
        <div className="profile-container">
          <img src={profileIcon} />
        </div>
        </Link>
        <div className="cart-container">
          <img src={cartIcon} />
          <div className="cart-counter-container">
            <p>3</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
