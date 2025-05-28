import "../styles/grid.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import shareIcon from "../assets/share-icon.png";
import addToCartIcon from "../assets/bag-icon.png";
import { useCart } from "../context/CartContext.jsx";
import { db } from "../../firebase/firebaseConfig.js";
import { collection, getDocs, query, where } from "firebase/firestore";

const MenPerfumes = () => {
  // Add navigate hook
  const navigate = useNavigate();

  // State for products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [isAllLoaded, setIsAllLoaded] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    product: null,
  });

  const { addToCart } = useCart();

  // Fetch men's products from Firestore
  useEffect(() => {
    const fetchMenProducts = async () => {
      try {
        setLoading(true);

        // Create a query against the "products" collection where gender is "men"
        const productsRef = collection(db, "products");
        const menQuery = query(productsRef, where("category", "==", "Accessories"));

        const querySnapshot = await getDocs(menQuery);

        // Process and set products
        const menProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(menProducts);
        setVisibleProducts(menProducts.slice(0, visibleCount));
        setIsAllLoaded(visibleCount >= menProducts.length);

        console.log("Total Accessories Products:", menProducts.length);
        console.log(
          "Visible Accessories Products Count:",
          Math.min(visibleCount, menProducts.length)
        );
      } catch (error) {
        console.error("Error fetching accessories products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenProducts();
  }, []);

  // Update visible products when visibleCount changes
  useEffect(() => {
    const slicedProducts = products.slice(0, visibleCount);
    setVisibleProducts(slicedProducts);
    setIsAllLoaded(visibleCount >= products.length);
  }, [visibleCount, products]);

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  function capitalizeWords(str) {
    if (!str) return "";
    return str
      .toString()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Function to show notification
  const showNotification = (product, qty = 1) => {
    setNotification({
      visible: true,
      message: `Added ${qty} ${qty > 1 ? "items" : "item"} to cart`,
      product: product,
    });

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };
  // Navigate to product details page
  const navigateToProductDetails = (product, event) => {
    // Prevent event bubbling if this was triggered from a nested element
    if (event) {
      event.stopPropagation();
    }
    navigate(`/product?category=${encodeURIComponent(product.category || "Accessories")}&pid=${product.id}`);
  };

  // Quick add to cart function
  const quickAddToCart = (product, qty = 1, event) => {
    // Prevent navigation when clicking the add to cart button
    if (event) {
      event.stopPropagation();
    }
    addToCart(product, qty);
    showNotification(product, qty);
  };

  // Share product function
  const handleShare = async (product, event) => {
    // Prevent navigation when clicking the share button
    if (event) {
      event.stopPropagation();
    }

    // Construct a shareable URL with the new format
    const productUrl = `${window.location.origin
      }/product/?category=${encodeURIComponent(
        product.category || "Accessories"
      )}&pid=${product.id}`;

    // Product details for sharing
    const title = capitalizeWords(product.name);
    const text =
      product.description ||
      `Check out this ${product.category || ""} from TechIQ!`;

    // Check if the Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: productUrl,
        });

        // Show a success notification
        setNotification({
          visible: true,
          message: "Product shared successfully!",
          product: product,
        });

        setTimeout(() => {
          setNotification((prev) => ({ ...prev, visible: false }));
        }, 3000);
      } catch (error) {
        // User cancelled or share failed
        console.error("Share failed:", error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      // Copy the product URL to clipboard
      try {
        await navigator.clipboard.writeText(productUrl);

        setNotification({
          visible: true,
          message: "Link copied to clipboard!",
          product: product,
        });

        setTimeout(() => {
          setNotification((prev) => ({ ...prev, visible: false }));
        }, 3000);
      } catch (error) {
        console.error("Clipboard copy failed:", error);

        // Ultimate fallback: show the link in an alert
        alert(`Share this link: ${productUrl}`);
      }
    }
  };

  // Format price as currency
  const formatPrice = (price) => {
    if (price === undefined || price === null || price < 0) return "KSh 0";
    return `KSh ${Number(price).toLocaleString()}`;
  };

  // Default image for products without images
  const defaultImage = "https://placehold.co/300x300?text=No+Image";

  // Get product image with multiple possible field names
  const getProductImage = (product) => {
    // Try different possible image field names
    const imageUrl =
      (product.images && product.images[0]) ||
      product.image_url ||
      product.img ||
      product.thumbnail ||
      product.photo;

    // Check if URL is valid
    if (imageUrl && typeof imageUrl === "string" && imageUrl.trim() !== "") {
      return imageUrl;
    }

    return defaultImage;
  };

  if (loading) {
    return (
      <section className="paginated-grid-section">
        <p className="loading-text">Loading featured accessories...</p>
      </section>
    );
  }

  return (
    <section className="paginated-grid-section" id="accessories">
      {/* Add notification component at the top */}
      {notification.visible && (
        <div className="cart-notification">
          <div className="notification-content">
            <div className="notification-icon">✓</div>
            <div className="notification-message">
              <strong>{notification.message}</strong>
              {notification.product && (
                <span className="product-name">
                  {notification.product.name}
                </span>
              )}
            </div>
            <button
              className="notification-close"
              onClick={() =>
                setNotification((prev) => ({ ...prev, visible: false }))
              }
            >
              ×
            </button>
          </div>
        </div>
      )}
      <p className="generic-text">Essential gear for peak performance</p>
      <h2 className="title-mini-grid">Featured Accessories</h2>

      {visibleProducts.length === 0 ? (
        <p className="no-products-message">
          No laptop accessories available at the moment.
        </p>
      ) : (
        <div className="grid-container">
          {visibleProducts.map((product) => (
            <div
              className="grid-item"
              key={product.id}
              onClick={() => navigateToProductDetails(product)}
              style={{ cursor: "pointer" }}
            >
              {/* Add out of stock overlay */}
              {product.inStock === false && (
                <div className="out-of-stock-overlay">
                  <span>Out of Stock</span>
                </div>
              )}
              <div className="cart-options">
                <div title="Share" onClick={(e) => handleShare(product, e)}>
                  <img className="share--icon" src={shareIcon} alt="Share" />
                </div>
                <div
                  title={
                    product.inStock === false ? "Out of Stock" : "Add to Cart"
                  }
                  onClick={(e) =>
                    product.inStock !== false && quickAddToCart(product, 1, e)
                  }
                  className={
                    product.inStock === false ? "disabled-cart-option" : ""
                  }
                >
                  <img
                    className="cart--icon"
                    src={addToCartIcon}
                    alt="Add to cart"
                  />
                </div>
              </div>
              <img
                src={getProductImage(product)}
                alt={product.name || "Product Image"}
                className="grid-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImage;
                }}
              />
              <p className="grid-name">
                {(() => {
                  const words = capitalizeWords(product.name).split(" ");
                  return words.length > 15
                    ? words.slice(0, 15).join(" ") + "..."
                    : words.join(" ");
                })()}
              </p>

              {/* Add quantities display */}
              {product.quantities && product.quantities.length > 0 && (
                <div className="grid-item-quantities">
                  {product.quantities.map((qty, index) => (
                    <span key={index} className="quantity-chip">
                      {qty}
                    </span>
                  ))}
                </div>
              )}

              <p className="grid-item-price">{formatPrice(product.price)}</p>
            </div>
          ))}
        </div>
      )}

      {!isAllLoaded && visibleProducts.length > 0 && (
        <button className="view-collection-button" onClick={handleViewMore}>
          View Collection
        </button>
      )}
    </section>
  );
};

export default MenPerfumes;
