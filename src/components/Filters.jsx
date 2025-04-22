import "../styles/filters.css";
import React, { useRef } from "react";
import diffuserImage from "../assets/lorisdiffusers.jpg";
import frequencesImage from "../assets/lorisfrequence.png";
import nicheImage from "../assets/lorisniche.jpeg";
import bodyCareImage from "../assets/lorisbodycare.webp";
import perfumeImage from "../assets/lorisperfume.jpg";
import cologneImage from "../assets/loriscologne.jpg";
import autoPerfumeImage from "../assets/lorisaautoperfume.jpg";

// Sample categories
const categories = [
  { id: 1, name: "Diffusers", image: diffuserImage },
  { id: 2, name: "Frequences", image: frequencesImage },
  { id: 3, name: "Niche", image: nicheImage },
  { id: 4, name: "Body Care", image: bodyCareImage },
  { id: 5, name: "Auto Perfume", image: autoPerfumeImage },
  { id: 6, name: "Loris Perfume", image: perfumeImage },
  { id: 8, name: "Cologne", image: cologneImage },
];

const Filters = () => {
  const scrollRef = useRef(null);

  // Function to scroll left or right by fixed pixels
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="filters-section">
      <div className="category-section">
        <h2 className="section-title">Browse Categories</h2>
        <button className="nav-arrow left" onClick={() => scroll("left")}>
          {"<"}
        </button>
        <div className="slider-wrapper">
          <div className="category-slider" ref={scrollRef}>
            {categories.map((cat) => (
              <div className="category-card" key={cat.id}>
                <img src={cat.image} alt={cat.name} className="category-img" />
                <p className="category-text">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
        <button className="nav-arrow right" onClick={() => scroll("right")}>
          {">"}
        </button>
      </div>
      <div className="filter-price-container">
        <div className="price--container">
          Price
          <input
            className="price-filter"
            type="range"
            // min="0"
            // max="5000"
            // value="500"
          />
        </div>
        <div className="sort-dropdown">
          <button className="dropbtn">Sort by:</button>
          <div className="dropdown-content">
            <p>Price: High to Low</p>
            <p> Price: Low to High</p>
            <p>Newest Arrivals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
