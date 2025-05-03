import "../styles/filters.css";
import React, { useRef, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import diffuserImage from "../assets/lorisdiffusers.jpg";
import frequencesImage from "../assets/lorisfrequence.png";
import nicheImage from "../assets/lorisniche.jpeg";
import bodyCareImage from "../assets/lorisbodycare.webp";
import perfumeImage from "../assets/lorisperfume.jpg";
import cologneImage from "../assets/loriscologne.jpg";
import autoPerfumeImage from "../assets/lorisaautoperfume.jpg";
import ladiesImage from "../assets/womanperfume.jpeg";
import menImage from "../assets/manperfume.jpeg";

// Sample categories
const categories = [
    { id: 1, name: "Women", image: ladiesImage },
    { id: 2, name: "Men", image: menImage },
    { id: 3, name: "Diffusers", image: diffuserImage },
    { id: 4, name: "Frequence", image: frequencesImage },
    { id: 5, name: "Niche", image: nicheImage },
    { id: 6, name: "Body Care", image: bodyCareImage },
    { id: 7, name: "Auto Perfumes", image: autoPerfumeImage },
    { id: 8, name: "Loris Perfumes", image: perfumeImage },
    { id: 9, name: "Cologne", image: cologneImage },
];

function Categories() {
    const scrollRef = useRef(null);
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
      
    // Updated to handle category selection for men/women
    const handleCategoryClick = (categoryName) => {
        setSelectedCategory(categoryName);
        
        // Handles scroll to sections for Men and Ladies perfumes
        if (categoryName === "Men Perfume") {
            // Scroll to men section
            const menSection = document.getElementById('men');
            if (menSection) {
                menSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        } 
        else if (categoryName === "Ladies Perfume") {
            // Scroll to women section
            const womenSection = document.getElementById('women');
            if (womenSection) {
                womenSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        }
        
        // For all other categories, navigate to all-products
        const queryParams = new URLSearchParams();
        queryParams.append("category", categoryName);
        navigate(`/all-products?${queryParams.toString()}`);
    };
    
    // Clear all filters
    const clearAllFilters = () => {
        setSelectedCategory("");
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
                <button className="nav-arrow right" onClick={() => scroll("right")}>
                    {">"}
                </button>
            </div>
            {(selectedCategory) && (
                <button className="clear-all-filters" onClick={clearAllFilters}>
                    Clear All Filters
                </button>
            )}
        </div>
    );
}

export default Categories;