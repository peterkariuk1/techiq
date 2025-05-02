import { useState } from "react";
import Header from "../components/Header.jsx";
import Banner from "../components/Banner.jsx";
import Filters from "../components/Filters.jsx";
import Grid from "../components/Grid.jsx";
import MensGrid from "../components/MensGrid.jsx";
import BestSellerGrid from "../components/BestSellerGrid.jsx";
import LadiesGrid from "../components/LadiesGrid.jsx";
import ShopAllToggle from "../components/shopAllToggle.jsx";
import Footer from "../components/Footer.jsx";


const Home = () => {
  const [showAll, setShowAll] = useState(false);
  return (
    <div className="home-page">
      <Header />
      <Banner />
      <Filters />
      {/* Added different categorised grids */}
      <BestSellerGrid />
      <LadiesGrid />
      <MensGrid />
      {/* This button will open the whole grid */}
      <ShopAllToggle showAll={showAll} setShowAll={setShowAll} />
      {/* Conditionally show the full product grid */}
      {showAll && <Grid />}
      <Footer />
    </div>
  );
};

export default Home;
