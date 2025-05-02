import "../styles/grid.css";
import React, { useState } from "react";
import products from "../assets/mockProducts.js";
import categoryIcon from "../assets/category-icon.png";
import shareIcon from "../assets/share-icon.png";
import addToCartIcon from "../assets/bag-icon.png";
import seeMoreIcon from "../assets/see-more.png";

const MenPerfumes = () => {
  const [visibleCount, setVisibleCount] = useState(8);

  console.log(products.map((p) => p.gender));

  // Filter products for gender "men"
  const menProducts = products.filter((p) => p.gender === "men");
  const visibleProducts = menProducts.slice(0, visibleCount);
  const isAllLoaded = visibleCount >= menProducts.length;

  console.log("Total Men Products:", menProducts.length);
  console.log("Visible Products Count:", visibleProducts.length);

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

  return (
    <section className="paginated-grid-section">
      <p className="generic-text"> Confident, Crisp, Bold!</p>
      <h2 className="title-mini-grid">Men Best Sellers</h2>{" "}
      <div className="grid-container">
        {visibleProducts.map((product) => {
          return (
            <div className="grid-item" key={product.id}>
              <div className="cart-options">
                <div
                  title="Share"
                  //   onClick={() => handleShare(product)}
                >
                  <img className="share--icon" src={shareIcon} alt="Share" />
                </div>
                <div
                  title="Add to Cart"
                  // onClick={() => quickAddToCart(product, 1)}
                >
                  <img
                    className="cart--icon"
                    src={addToCartIcon}
                    alt="Add to cart"
                  />
                </div>
                <div
                  title="View Details"
                  // onClick={() => openProductModal(product)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    className="more--icon"
                    src={seeMoreIcon}
                    alt="View details"
                  />
                </div>
              </div>
              <img
                // loading="lazy"
                src={product.image}
                alt={product.name || "Product Image"}
                className="grid-image"
                //    onError={(e) => {
                //      e.target.onerror = null;
                //      e.target.src = defaultImage;
                //    }}
              />
              <p className="grid-name">{capitalizeWords(product.name)}</p>
              <p className="category-name">
                <img src={categoryIcon} alt="Category" />
                {product.category || "Uncategorized"}
                {/* {product["sub-category"] && ` - ${product["sub-category"]}`} */}
              </p>
              <p className="grid-item-price">{product.price}</p>
              <p className="grid-item-sku">
                {/* {product.sku_leave_blank_to_auto_generate_sku
                ? `SKU: ${product.sku_leave_blank_to_auto_generate_sku}`
                : ""} */}
              </p>
              {/* {product.isBestSeller && (
                <span className="badge">Best Seller</span>
              )} */}
            </div>
          );
        })}
      </div>
      {!isAllLoaded && <button className="view-collection-button" onClick={handleViewMore}>View Collection</button>}
    </section>
  );
};

export default MenPerfumes;
