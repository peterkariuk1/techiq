
const ShopAllToggle = ({ showAll, setShowAll }) => {
  const handleClick = () => {
    setShowAll((prev) => !prev);
  };

  return (
    <button onClick={handleClick} className="shop-all-toggle-btn">
      {showAll ? "Hide All Products" : "Shop All Perfumes"}
    </button>
  );
};

export default ShopAllToggle;
