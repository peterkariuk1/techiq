import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import logoImage from "../assets/lorislogo.png";
import searchIcon from "../assets/search.png";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/user.png";
import "../styles/nav.css";
import { useCart } from "../context/CartContext";
import { db, auth } from "../../firebase/firebaseConfig.js";
import { collection, getDocs, query, limit, getDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { FiLogOut, FiUser, FiSettings, FiShoppingBag } from "react-icons/fi";

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
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState("bounce-in");
  const [inputValue, setInputValue] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const { cartItemCount } = useCart();

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("recentSearches");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading recent searches:", e);
      return [];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const productsQuery = query(productsRef, limit(500));
        const snapshot = await getDocs(productsQuery);
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProducts(productsData);
      } catch (error) {
        console.error("Error fetching products for search:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim().length > 1) {
      setIsLoading(true);

      const results = allProducts.filter((product) => {
        if (product.name && product.name.toLowerCase().includes(value.toLowerCase())) {
          return true;
        }

        if (product.category && product.category.toLowerCase().includes(value.toLowerCase())) {
          return true;
        }

        if (product.description && product.description.toLowerCase().includes(value.toLowerCase())) {
          return true;
        }

        return false;
      });

      const productSuggestions = results.slice(0, 5).map((p) => ({
        type: "product",
        id: p.id,
        name: p.name,
        category: p.category,
      }));

      const categories = [...new Set(results.map((p) => p.category).filter(Boolean))];
      const categorySuggestions = categories.slice(0, 3).map((c) => ({
        type: "category",
        name: c,
      }));

      const combinedSuggestions = [...productSuggestions, ...categorySuggestions];

      setSuggestions(combinedSuggestions);
      setShowSuggestions(true);
      setIsLoading(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (term = inputValue) => {
    if (term.trim()) {
      const newRecent = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem("recentSearches", JSON.stringify(newRecent));

      navigate(`/?search=${encodeURIComponent(term)}`);

      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === "product") {
      navigate(`/product/?category=${encodeURIComponent(suggestion.category || "Uncategorized")}&pid=${suggestion.id}`);
    } else if (suggestion.type === "category") {
      navigate(`/?category=${encodeURIComponent(suggestion.name)}`);
    }

    const newRecent = [suggestion.name, ...recentSearches.filter((s) => s !== suggestion.name)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));

    setInputValue("");
    setShowSuggestions(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowProfileMenu(false);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }

      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
      e.preventDefault();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    if (inputValue !== "") return;

    const interval = setInterval(() => {
      setAnimate("fade-out");

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % placeholders.length);
        setAnimate("bounce-in");
      }, 200);
    }, 4000);

    return () => clearInterval(interval);
  }, [inputValue]);

  useEffect(() => {
    let timeoutId = null;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        setIsVisible(false);

        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsVisible(true);
        }, 100);
      } else {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className={`header ${isVisible ? "visible" : "hidden"}`}>
      <Link to="/">
        <img className="loris-logo" src={logoImage} alt="Loris Logo" />
      </Link>

      <div className="searchbox">
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          autoComplete="off"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.trim().length > 1 && setShowSuggestions(true)}
        />
        {inputValue === "" && (
          <span className={`placeholder-text ${animate}`}>
            {placeholders[index]}
          </span>
        )}
        <div className="search-button-container" onClick={() => handleSearch()}>
          <img src={searchIcon} alt="Search" />
        </div>

        {showSuggestions && (
          <div className="search-suggestions" ref={suggestionsRef}>
            {isLoading ? (
              <div className="suggestion-loading">
                <p>Loading suggestions...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={`${suggestion.type}-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={suggestion.type === "category" ? "category-suggestion" : ""}
                  >
                    {suggestion.type === "category" ? (
                      <>
                        <span className="suggestion-icon">🏷️</span>
                        <span>Category: {suggestion.name}</span>
                      </>
                    ) : (
                      <>
                        <span className="suggestion-icon">🔍</span>
                        <span className="product-suggestion">
                          <strong>{suggestion.name}</strong>
                          {suggestion.category && <small>{suggestion.category}</small>}
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : recentSearches.length > 0 ? (
              <div className="recent-searches">
                <h4>Recent Searches</h4>
                <ul>
                  {recentSearches.map((term, index) => (
                    <li key={index} onClick={() => handleSearch(term)}>
                      <span className="suggestion-icon">⏱️</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="no-suggestions">No matches found</p>
            )}
          </div>
        )}
      </div>

      <div className="right">
        <div className="nav-profile-container" ref={profileDropdownRef}>
          <div 
            className="profile-icon-wrapper" 
            onClick={() => isAuthenticated ? setShowProfileMenu(!showProfileMenu) : navigate("/login")}
          >
            <img src={profileIcon} alt="Profile" />
            {isAuthenticated && <span className="auth-indicator" />}
          </div>
          
          {isAuthenticated && showProfileMenu && (
            <div className="profile-dropdown">
              <div className="user-info">
                <span className="user-email">{currentUser.email}</span>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item">
                  <FiUser /> My Account
                </Link>
                
                <Link to="/orders" className="dropdown-item">
                  <FiShoppingBag /> My Orders
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" className="dropdown-item admin-link">
                    <FiSettings /> Admin Dashboard
                  </Link>
                )}
                
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
        
        <Link to="/checkout">
          <div className="cart-container">
            <img src={cartIcon} alt="Cart" />
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
