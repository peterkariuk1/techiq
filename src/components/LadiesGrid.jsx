import "../styles/grid.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import shareIcon from "../assets/share-icon.png";
import addToCartIcon from "../assets/bag-icon.png";
import { useCart } from "../context/CartContext.jsx";
import { db } from "../../firebase/firebaseConfig.js";
import { collection, getDocs, query, where } from "firebase/firestore";

const LadiesGrid = () => {
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

  // Fetch laptops from Firestore
  useEffect(() => {
    const fetchLaptops = async () => {
      try {
        setLoading(true);

        // Create a query against the "products" collection where category is "Laptops"
        const productsRef = collection(db, "products");
        const laptopsQuery = query(productsRef, where("category", "==", "Laptops"));

        const querySnapshot = await getDocs(laptopsQuery);

        // Process and set products
        const laptopProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(laptopProducts);
        setVisibleProducts(laptopProducts.slice(0, visibleCount));
        setIsAllLoaded(visibleCount >= laptopProducts.length);

        console.log("Total Laptop Products:", laptopProducts.length);
        console.log(
          "Visible Laptop Products Count:",
          Math.min(visibleCount, laptopProducts.length)
        );
      } catch (error) {
        console.error("Error fetching laptop products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLaptops();
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
  const navigateToProductDetails = (product) => {
    navigate(`/product?category=${encodeURIComponent(product.category || "Uncategorized")}&pid=${product.id}`);
  };

  // Quick add to cart function
  const quickAddToCart = (product, qty = 1) => {
    addToCart(product, qty);
    showNotification(product, qty);
  };

  // Share product function
  const handleShare = async (product) => {
    // Construct a shareable URL with the new format
    const productUrl = `${
      window.location.origin
    }/product/?category=${encodeURIComponent(
      product.category || "Uncategorized"
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
      // If it's a relative path, convert to absolute URL
      if (imageUrl.startsWith("/")) {
        return `${imageUrl}`;
      }
      // If it's already a full URL, use it
      return imageUrl;
    }

    return defaultImage;
  };

  if (loading) {
    return (
      <section className="paginated-grid-section">
        <p className="loading-text">Loading featured laptops...</p>
      </section>
    );
  }

  return (
    <section className="paginated-grid-section" id="laptops">
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
      <p className="generic-text">A spotlight on power, design, and innovation</p>
      <h2 className="title-mini-grid">Featured Laptops</h2>

      {visibleProducts.length === 0 ? (
        <p className="no-products-message">
          No laptops available at the moment.
        </p>
      ) : (
        <div className="grid-container">
          {visibleProducts.map((product) => (
            <div className="grid-item" key={product.id}>
              {/* Add out of stock overlay */}
              {product.inStock === false && (
                <div className="out-of-stock-overlay">
                  <span>Out of Stock</span>
                </div>
              )}
              <div className="cart-options">
                <div title="Share" onClick={() => handleShare(product)}>
                  <img className="share--icon" src={shareIcon} alt="Share" />
                </div>
                <div
                  title={
                    product.inStock === false ? "Out of Stock" : "Add to Cart"
                  }
                  onClick={() =>
                    product.inStock !== false && quickAddToCart(product, 1)
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
                onClick={() => navigateToProductDetails(product)} // Update to use navigation
                src={getProductImage(product)}
                alt={product.name || "Product Image"}
                className="grid-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImage;
                }}
              />
              <p 
                className="grid-name"
                onClick={() => navigateToProductDetails(product)} // Make product name clickable too
              >
                {(() => {
                  const words = capitalizeWords(product.name).split(" ");
                  return words.length > 15
                    ? words.slice(0, 18).join(" ") + "..."
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

export default LadiesGrid;
