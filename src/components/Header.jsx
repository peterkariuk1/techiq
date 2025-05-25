import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import logoImage from "../assets/techiq-logo.png";
import searchIcon from "../assets/search2.png";
import cartIcon from "../assets/cart2.png";
import loveIcon from "../assets/love2.png";
import profileIcon from "../assets/profile2.png";
import "../styles/nav.css";
import { useCart } from "../context/CartContext";
import { db, auth } from "../../firebase/firebaseConfig.js";
import {
  collection,
  getDocs,
  query,
  limit,
  getDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { FiLogOut, FiUser, FiSettings, FiShoppingBag } from "react-icons/fi";

const placeholders = [
  "HP Pavilion x360 Touchscreen",
  "Search by Category",
  "Dell Inspiron 15 3000 Series",
  "Search by Name",
  "Lenovo ThinkPad X1 Carbon",
  "Search by Type",
  "MacBook Air M2 Chip",
  "Search by Category",
  "HP EliteBook 840 G9",
  "Search by Name",
  "Dell XPS 13 Plus OLED",
  "Search by Type",
  "Lenovo IdeaPad Slim 5",
  "Search by Category",
  "Search by Name",
  "MacBook Pro 14-inch M3",
  "Search by Type",
  "Dell Latitude 7430",
  "Search by Category",
  "HP Spectre x360 14",
  "Search by Name",
  "Lenovo Legion 5 Pro",
  "Search by Type",
  "MacBook Air 15-inch M2",
  "Search by Category",
  "Search by Name",
  "HP Envy 16 Creator Edition",
  "Search by Type",
  "Dell G15 Gaming Laptop",
  "Search by Category",
  "Lenovo Yoga 9i Gen 8",
  "Search by Name",
  "Asus ROG Zephyrus G14",
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
        if (
          product.name &&
          product.name.toLowerCase().includes(value.toLowerCase())
        ) {
          return true;
        }

        if (
          product.category &&
          product.category.toLowerCase().includes(value.toLowerCase())
        ) {
          return true;
        }

        if (
          product.description &&
          product.description.toLowerCase().includes(value.toLowerCase())
        ) {
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

      const categories = [
        ...new Set(results.map((p) => p.category).filter(Boolean)),
      ];
      const categorySuggestions = categories.slice(0, 3).map((c) => ({
        type: "category",
        name: c,
      }));

      const combinedSuggestions = [
        ...productSuggestions,
        ...categorySuggestions,
      ];

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
      const newRecent = [
        term,
        ...recentSearches.filter((s) => s !== term),
      ].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem("recentSearches", JSON.stringify(newRecent));

      navigate(`/?search=${encodeURIComponent(term)}`);

      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === "product") {
      navigate(
        `/product/?category=${encodeURIComponent(
          suggestion.category || "Uncategorized"
        )}&pid=${suggestion.id}`
      );
    } else if (suggestion.type === "category") {
      navigate(`/?category=${encodeURIComponent(suggestion.name)}`);
    }

    const newRecent = [
      suggestion.name,
      ...recentSearches.filter((s) => s !== suggestion.name),
    ].slice(0, 5);
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
        <img className="loris-logo" src={logoImage} alt="Techiq Logo" />
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
          onFocus={() =>
            inputValue.trim().length > 1 && setShowSuggestions(true)
          }
        />
        {inputValue === "" && (
          <span className={`placeholder-text ${animate}`}>
            {placeholders[index]}
          </span>
        )}
        <div className="search-button-container" onClick={() => handleSearch()}>
          <img className="search-logo-image" src={searchIcon} alt="Search" />
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
                    className={
                      suggestion.type === "category"
                        ? "category-suggestion"
                        : ""
                    }
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
                          {suggestion.category && (
                            <small>{suggestion.category}</small>
                          )}
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
        <div className="cart-container">
          <img src={loveIcon} alt="love" />
          {cartItemCount > 0 && (
            <div className="cart-counter-container">
              <p>3</p>
            </div>
          )}
        </div>

        <div className="nav-profile-container" ref={profileDropdownRef}>
          <div
            className="profile-icon-wrapper"
            onClick={() =>
              isAuthenticated
                ? setShowProfileMenu(!showProfileMenu)
                : navigate("/login")
            }
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

                <button
                  onClick={handleLogout}
                  className="dropdown-item logout-btn"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
