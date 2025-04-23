import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logoImage from "../assets/lorislogo.png";
import searchIcon from "../assets/search.png";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/user.png";
import "../styles/nav.css";
import { useCart } from "../context/CartContext";

const placeholders = [
  "Loris Peach Reed Diffuser",
  "Search by Category",
  "Loris No. 102 Ocean Breeze",
  "Search by Name",
  "Loris Oud Touch",
  "Search by Type",
  "Loris Tobacco Vanilla",
  "Search by Category",
  "Loris Inspired by Sauvage",
  "Search by Name",
  "Loris Velvet Rose",
  "Search by Type",
  "Loris Black Orchid",
  "Search by Category",
  "Search by Name",
  "Loris No. 201 Floral Musk",
  "Search by Type",
  "Loris No. 54 Woody Citrus",
  "Search by Category",
  "Loris Intense Leather",
  "Search by Name",
  "Loris Sweet Caramel",
  "Search by Type",
  "Loris Amber Elixir",
  "Search by Category",
  "Search by Name",
  "Loris Dark Vanilla",
  "Search by Type",
  "Loris White Musk",
  "Search by Category",
  "Loris Fresh Aqua",
  "Search by Name",
  "Loris Fruity Bloom",
  "Search by Type",
];

const Header = () => {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState("bounce-in");
  const [inputValue, setInputValue] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const { cartItemCount } = useCart(); // Get cart item count from context

  // Rotate placeholder if no input
  useEffect(() => {
    if (inputValue !== "") return; // stop cycling if user types

    const interval = setInterval(() => {
      setAnimate("fade-out");

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % placeholders.length);
        setAnimate("bounce-in");
      }, 200);
    }, 4000);

    return () => clearInterval(interval);
  }, [inputValue]);

  // Detect scroll to hide/show header
  useEffect(() => {
    let timeoutId = null;

    const handleScroll = () => {
      setIsVisible(false);

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsVisible(true);
      }, 200); // reappear after 500ms idle
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={`header ${isVisible ? "visible" : "hidden"}`}>
      <img className="loris-logo" src={logoImage} alt="Loris Logo" />
      <div className="searchbox">
        <input
          type="text"
          className="search-input"
          autoComplete="off"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        {inputValue === "" && (
          <span className={`placeholder-text ${animate}`}>
            {placeholders[index]}
          </span>
        )}
        <div className="search-button-container">
          <img src={searchIcon} alt="Search" />
        </div>
      </div>
      <div className="right">
        <Link to="/login">
          <div className="profile-container">
            <img src={profileIcon} alt="Profile" />
          </div>
        </Link>
        <Link to="/checkout">
          <div className="cart-container">
            <img src={cartIcon} alt="Cart" />
            {/* Only show counter if there are items */}
            {cartItemCount > 0 && (
              <div className="cart-counter-container">
                <p>{cartItemCount}</p>
              </div>
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Header;
