import "../styles/filters.css";
import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

const Filters = () => {
  const scrollRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial filter values from URL or use defaults
  const [minPrice, setMinPrice] = useState(() => {
    const urlMinPrice = searchParams.get("min_price");
    return urlMinPrice ? parseInt(urlMinPrice) : 0;
  });

  const [maxPrice, setMaxPrice] = useState(() => {
    const urlMaxPrice = searchParams.get("max_price");
    return urlMaxPrice ? parseInt(urlMaxPrice) : 30000;
  });

  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get("category") || "";
  });

  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get("sort") || "newest";
  });

  // Function to update URL parameters
  const updateUrlParams = () => {
    const params = {};

    // Only add parameters that have values
    if (minPrice > 0) params.min_price = minPrice;
    if (maxPrice < 30000) params.max_price = maxPrice;
    if (selectedCategory) params.category = selectedCategory;
    if (sortBy !== "newest") params.sort = sortBy;

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
  }, [minPrice, maxPrice, selectedCategory, sortBy]);

  // Function to scroll left or right by fixed pixels
  // const scroll = (direction) => {
  //   if (scrollRef.current) {
  //     const { scrollLeft, clientWidth } = scrollRef.current;
  //     const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
  //     scrollRef.current.scrollTo({
  //       left: scrollLeft + scrollAmount,
  //       behavior: "smooth",
  //     });
  //   }
  // };

  // Handle category selection
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(prev => prev === categoryName ? "" : categoryName);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(30000);
    setSelectedCategory("");
    setSortBy("newest");
  };

  return (
    <div className="filters-section">
      <div className="category-section">
        <h2 className="section-title">Browse Categories</h2>
        {/* <button className="nav-arrow left" onClick={() => scroll("left")}>
          {"<"}
        </button> */}
        <div className="slider-wrapper">
          <div className="category-slider" ref={scrollRef}>
            {categories.map((cat) => (
              <div
                className={`category-card ${selectedCategory === cat.name ? 'selected' : ''}`}
                key={cat.id}
                onClick={() => handleCategoryClick(cat.name)}
              >
                <img src={cat.image} alt={cat.name} className="category-img" />
                <p className="category-text">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
        {/* <button className="nav-arrow right" onClick={() => scroll("right")}>
          {">"}
        </button> */}
      </div>
      <div className="filter-price-container">
        <div className="price--container">
          Filter by Price
          <div className="max-min-price-inputs">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Min"
            />
            -
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Math.max(minPrice, parseInt(e.target.value) || 0))}
              placeholder="Max"
            />
          </div>
          <div className="price-range-slider">
            <input
              className="price-filter"
              type="range"
              min="0"
              max="30000"
              value={minPrice}
              onChange={(e) => setMinPrice(parseInt(e.target.value))}
            />
            <input
              className="price-filter"
              type="range"
              min="0"
              max="30000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            />
          </div>
          <div className="price-range-labels">
            <span>KSh 0</span>
            <span>KSh 30,000</span>
          </div>
        </div>
        <div className="sort-dropdown">
          <button className="dropbtn">Sort by: {sortBy.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</button>
          <div className="dropdown-content">
            <p onClick={() => setSortBy("price-high-to-low")}>Price: High to Low</p>
            <p onClick={() => setSortBy("price-low-to-high")}>Price: Low to High</p>
            <p onClick={() => setSortBy("newest")}>Newest Arrivals</p>
          </div>
        </div>
      </div>
      {selectedCategory && (
        <div className="active-filters">
          <span className="filter-tag">
            {selectedCategory}
            <button onClick={() => setSelectedCategory("")}>×</button>
          </span>
        </div>
      )}
      {(selectedCategory || minPrice > 0 || maxPrice < 30000 || sortBy !== "newest") && (
        <button className="clear-all-filters" onClick={clearAllFilters}>
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default Filters;
