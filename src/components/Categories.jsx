import "../styles/filters.css";
import React, { useRef, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import gamingImage from "../assets/gamecat.jpg";
import lenovoImage from "../assets/lenovocat.jpg";
import monitorImage from "../assets/monitorcat.jpg";
import macbookImage from "../assets/macat.jpg";
import dellImage from "../assets/dellcat.jpg";
import desktopImage from "../assets/deskcat.jpg";
import hpImage from "../assets/hpcat.jpg";
import accessoriesImage from "../assets/acccat.jpg";

// Sample categories
const categories = [
  { id: 1, name: "HP Laptops", image: hpImage },
  { id: 2, name: "Gaming Laptops", image: gamingImage },
  { id: 5, name: "Monitors", image: monitorImage },
  { id: 3, name: "Laptop Accessories", image: accessoriesImage },
  { id: 4, name: "Lenovo Laptops", image: lenovoImage },
  { id: 6, name: "Macbooks", image: macbookImage },
  { id: 7, name: "Desktops", image: desktopImage },
  { id: 8, name: "Dell Laptops", image: dellImage },
];

function Categories() {
  const scrollRef = useRef();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get("category") || "";
  });

  // Function to update URL parameters
  const updateUrlParams = () => {
    const params = {};

    // Only add parameters that have values
    if (selectedCategory) params.category = selectedCategory;

    // Update URL without causing a page reload
    setSearchParams(params);
  };

  // Update URL when filters change
  useEffect(() => {
    // Add a small delay to avoid too many URL updates when typing
    const timer = setTimeout(() => {
      updateUrlParams();
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedCategory]);

  // Updated to handle category selection for men/women
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);

    // For all other categories, navigate to all-products
    const queryParams = new URLSearchParams();
    queryParams.append("category", categoryName);
    navigate(`/all-products?${queryParams.toString()}`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategory("");
  };

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    console.log('hello')
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="filters-section">
      <div className="category-section">
        <h2 className="section-title">Browse Categories</h2>
        <button className="nav-arrow left" onClick={scrollLeft}>
          {"<"}
        </button>
        <div  ref={scrollRef} className="slider-wrapper">
          <div className= "category-slider"  >
            {categories.map((cat) => (
              <div
                className={`category-card ${
                  selectedCategory === cat.name ? "selected" : ""
                }`}
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <img src={cat.image} alt={cat.name} className="category-img" />
                <p className="category-text">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
        <button className="nav-arrow right" onClick={scrollRight}>
          {">"}
        </button>
      </div>
      {selectedCategory && (
        <button className="clear-all-filters" onClick={clearAllFilters}>
          Clear All Filters
        </button>
      )}
    </div>
  );
}

export default Categories;
