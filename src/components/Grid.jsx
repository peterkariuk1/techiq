import "../styles/grid.css";
import { useState } from "react";
import perfumeImage from "../assets/lorisdiffusers.jpg";
import categoryIcon from "../assets/category-icon.png";
import shareIcon from "../assets/share-icon.png";
import addToCartIcon from "../assets/bag-icon.png";
import seeMoreIcon from "../assets/see-more.png";

// Sample data (replace with real categories/products)
const items = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `10ml auto perfume ocean breeze ${i + 1}`,
  category: "Auto Perfume",
  price: ` ${i + 300}`,
  image: perfumeImage,
}));
const Grid = () => {
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };
  // This function capitalises every word in the item's title
  function capitalizeWords(str) {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return (
    <div className="paginated-grid-section">
      <h2 className="grid-title">
        All Products <span>Find your Signature Scent</span>
      </h2>

      <div className="grid-container">
        {visibleItems.map((item) => (
          <div className="grid-item" key={item.id}>
            {/*
KWA UPLOADS TUTAEKA IZI JUU IZO PICS ZAO NI HEAVY MBAYA


npm install browser-image-compression

import imageCompression from 'browser-image-compression';

const handleImageUpload = async (file) => {
  const options = {
    maxSizeMB: 1,              // Max size in MB
    maxWidthOrHeight: 1200,    // Resize if larger
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    // upload compressedFile to backend or cloud
  } catch (error) {
    console.error('Compression error:', error);
  }
}; */}
            <div className="cart-options">
              <div title="Share">
                <img className="share--icon" src={shareIcon} />
              </div>
              <div title="Add to Cart">
                <img className="cart--icon" src={addToCartIcon} />
              </div>
              <div title="View Details">
                <img className="more--icon" src={seeMoreIcon} />
              </div>
            </div>
            <img
              loading="lazy"
              src={item.image}
              alt={item.name}
              className="grid-image"
            />
            <p className="grid-name">{capitalizeWords(item.name)}</p>
            <p className="category-name">
              <img src={categoryIcon} />
              {item.category}
            </p>
            <p className="grid-item-price">KSh {item.price}</p>
            <div className="new-icon">New</div>
          </div>
        ))}
      </div>

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
    </div>
  );
};

export default Grid;
