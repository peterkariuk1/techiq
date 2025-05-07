import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import Banner from "../components/Banner.jsx";
import Categories from "../components/Categories.jsx";
import MensGrid from "../components/MensGrid.jsx";
import BestSellerGrid from "../components/BestSellerGrid.jsx";
import LadiesGrid from "../components/LadiesGrid.jsx";
import Footer from "../components/Footer.jsx";
import { Helmet } from "react-helmet-async";

const Home = () => {
  return (
    <div className="home-page">
      <Helmet>
        <title>Loris Perfumes | Original Scents for All</title>
        <meta
          name="description"
          content="Discover authentic perfumes for men and women. Fast delivery, affordable elegance, and top-rated fragrances."
        />
        <link rel="canonical" href="https://loriskenya.com/" />
        <script type="application/ld+json">
          {`
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Loris Kenya",
  "url": "https://loriskenya.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://loriskenya.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
`}
        </script>
      </Helmet>
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
