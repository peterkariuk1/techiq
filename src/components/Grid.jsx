import "../styles/grid.css";
import { useState, useEffect } from "react";
import categoryIcon from "../assets/category-icon.png";
import shareIcon from "../assets/share-icon.png";
import addToCartIcon from "../assets/bag-icon.png";
import seeMoreIcon from "../assets/see-more.png";
import { db } from "../../firebase/firebaseConfig.js";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { useCart } from "../context/CartContext";

const Grid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 30;

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Notification state
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    product: null
  });

  const { addToCart } = useCart();

  // Function to show notification
  const showNotification = (product, qty = 1) => {
    setNotification({
      visible: true,
      message: `Added ${qty} ${qty > 1 ? 'items' : 'item'} to cart`,
      product: product
    });

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Function to open modal with product details
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1); // Reset quantity when opening a new product
    setIsModalOpen(true);
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  // Handle quantity change
  const updateQuantity = (newQty) => {
    if (newQty >= 1) {
      setQuantity(newQty);
    }
  };

  // Add to cart function
  const handleAddToCart = () => {
    if (selectedProduct) {
      // Add the selected product with quantity
      addToCart(selectedProduct, quantity);

      // Show notification
      showNotification(selectedProduct, quantity);

      // Close the modal
      closeModal();
    }
  };

  // Quick add to cart function
  const quickAddToCart = (product, qty = 1) => {
    addToCart(product, qty);
    showNotification(product, qty);
  };

  // Share product function
  const handleShare = async (product) => {
    // Construct a shareable URL for the product
    const productUrl = `${window.location.origin}/product/${product.id}`;
    
    // Product details for sharing
    const title = capitalizeWords(product.name);
    const text = product.description || 
      `Check out this ${product.category || ''} perfume from Loris Kenya!`;
    
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
          message: 'Product shared successfully!',
          product: product
        });
        
        setTimeout(() => {
          setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
        
      } catch (error) {
        // User cancelled or share failed
        console.error('Share failed:', error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      // Copy the product URL to clipboard
      try {
        await navigator.clipboard.writeText(productUrl);
        
        setNotification({
          visible: true,
          message: 'Link copied to clipboard!',
          product: product
        });
        
        setTimeout(() => {
          setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
        
      } catch (error) {
        console.error('Clipboard copy failed:', error);
        
        // Ultimate fallback: show the link in an alert
        alert(`Share this link: ${productUrl}`);
      }
    }
  };

  // Fetch products from Firestore
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);

        // Reference to products collection
        const productsRef = collection(db, "products");

        // Create query
        const productsQuery = query(
          productsRef,
          orderBy("created_at", "desc"),
          limit(1000)
        );

        // Get products
        const querySnapshot = await getDocs(productsQuery);

        // Process products data
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate total pages
        const total = Math.ceil(productsData.length / itemsPerPage);

        setProducts(productsData);
        setTotalPages(total);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Calculate which products to display based on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);





  // Page navigation
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
  
      setTimeout(() => {
        const gridElement = document.getElementById("grid-section");
        if (gridElement) {
          gridElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 100); // small delay after state update to let DOM update
    }
  };
  // Capitalize every word in the item's title
  function capitalizeWords(str) {
    if (!str) return '';
    return str
      .toString()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  // Format price as currency
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KSh 0';
    return `KSh ${Number(price).toLocaleString()}`;
  };

  // Default image for products without images
  const defaultImage = "https://placehold.co/300x300?text=No+Image";

  // Get product image with multiple possible field names
  const getProductImage = (product) => {
    // Try different possible image field names
    const imageUrl =
      product.image ||
      product.image_url ||
      product.img ||
      product.thumbnail ||
      product.photo;

    // Check if URL is valid
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      // If it's a relative path, convert to absolute URL
      if (imageUrl.startsWith('/')) {
        return `https://pos.loriskenya.com${imageUrl}`;
      }
      // If it's already a full URL, use it
      return imageUrl;
    }

    return defaultImage;
  };

  return (
    <div id='grid-section' className="paginated-grid-section">
      {/* Add notification component at the top */}
      {notification.visible && (
        <div className="cart-notification">
          <div className="notification-content">
            <div className="notification-icon">✓</div>
            <div className="notification-message">
              <strong>{notification.message}</strong>
              {notification.product && (
                <span className="product-name">{notification.product.name}</span>
              )}
            </div>
            <button
              className="notification-close"
              onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <h2 className="grid-title">
        All Products <span>Find your Signature Scent</span>
      </h2>

      {loading ? (
        <div className="loading-container">
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <p>No products found</p>
        </div>
      ) : (
        <>
          <div className="grid-container">
            {visibleProducts.map((product) => (
              <div className="grid-item" key={product.id}>
                <div className="cart-options">
                  <div title="Share" onClick={() => handleShare(product)}>
                    <img className="share--icon" src={shareIcon} alt="Share" />
                  </div>
                  <div title="Add to Cart" onClick={() => quickAddToCart(product, 1)}>
                    <img className="cart--icon" src={addToCartIcon} alt="Add to cart" />
                  </div>
                  <div
                    title="View Details"
                    onClick={() => openProductModal(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img className="more--icon" src={seeMoreIcon} alt="View details" />
                  </div>
                </div>
                <img
                  // loading="lazy"
                  src={getProductImage(product)}
                  alt={product.name || 'Product Image'}
                  className="grid-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                />
                <p className="grid-name">{capitalizeWords(product.name)}</p>
                <p className="category-name">
                  <img src={categoryIcon} alt="Category" />
                  {product.category || 'Uncategorized'}
                  {product["sub-category"] && ` - ${product["sub-category"]}`}
                </p>
                <p className="grid-item-price">{formatPrice(product.selling_price)}</p>
                <p className="grid-item-sku">
                  {product.sku_leave_blank_to_auto_generate_sku ?
                    `SKU: ${product.sku_leave_blank_to_auto_generate_sku}` : ''}
                </p>
              </div>
            ))}
          </div>

          {/* Product Detail Modal */}
          {isModalOpen && selectedProduct && (
            <div className="product-modal-overlay" onClick={closeModal}>
              <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={closeModal}>×</button>

                <div className="product-modal-container">
                  {/* Left Section - Product Image */}
                  <div className="product-modal-image">
                    <img
                      src={getProductImage(selectedProduct)}
                      alt={selectedProduct.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage;
                      }}
                    />
                  </div>

                  {/* Right Section - Product Details */}
                  <div className="product-modal-details">
                    <h2 className="product-modal-name">{capitalizeWords(selectedProduct.name)}</h2>
                    
                    <p className="product-modal-category">
                      <span className="category-label">Category: </span>
                      {selectedProduct.category || 'Uncategorized'}
                      {selectedProduct["sub-category"] && ` - ${selectedProduct["sub-category"]}`}
                    </p>
                    
                    {/* Share button */}
                    <button className="product-share-btn" onClick={() => handleShare(selectedProduct)}>
                      <img src={shareIcon} alt="Share" />
                      Share
                    </button>
                    
                    <div className="product-modal-description">
                      <p>{selectedProduct.description || 'No description available for this product.'}</p>
                    </div>

                    <div className="product-modal-quantity">
                      <span>Quantity:</span>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(quantity - 1)} disabled={quantity <= 1}>-</button>
                        <span>{quantity}</span>
                        <button onClick={() => updateQuantity(quantity + 1)}>+</button>
                      </div>
                    </div>

                    <div className="product-modal-purchase">
                      <div className="product-modal-price">
                        {formatPrice(selectedProduct.selling_price)}
                      </div>
                      <button className="add-to-cart-btn" onClick={handleAddToCart}>
                        Add to Cart
                      </button>
                    </div>

                    {selectedProduct.sku_leave_blank_to_auto_generate_sku && (
                      <p className="product-modal-sku">
                        SKU: {selectedProduct.sku_leave_blank_to_auto_generate_sku}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pagination">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return (
                  page === 1 || // always show first page
                  page === totalPages || // always show last page
                  Math.abs(currentPage - page) <= 1 // show current, previous, next
                );
              })
              .reduce((acc, page, index, array) => {
                if (index > 0 && page - array[index - 1] > 1) {
                  acc.push("ellipsis");
                }
                acc.push(page);
                return acc;
              }, [])
              .map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    className={currentPage === item ? "active" : ""}
                    onClick={() => goToPage(item)}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Grid;
