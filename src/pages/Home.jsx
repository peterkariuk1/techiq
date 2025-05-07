import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Banner from "../components/Banner.jsx";
import Categories from "../components/Categories.jsx";
import MensGrid from "../components/MensGrid.jsx";
import BestSellerGrid from "../components/BestSellerGrid.jsx";
import LadiesGrid from "../components/LadiesGrid.jsx";
import Footer from "../components/Footer.jsx";

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <Banner />
      <Categories />
      {/* Added different categorised grids */}
      <BestSellerGrid />
      <LadiesGrid />
      <MensGrid />

      <Link to="/all-products">
        <button style={{ textDecoration: "none" }} className="view-all-button">
          View All Products
        </button>
      </Link>

      <Footer />
    </div>
  );
};

export default Home;
