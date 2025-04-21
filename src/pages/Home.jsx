import Header from "../components/Header.jsx";
import Banner from "../components/Banner.jsx";
import Filters from "../components/Filters.jsx";
import Grid from "../components/Grid.jsx";
import Footer from "../components/Footer.jsx";

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <Banner />
      <Filters />
      <Grid />
      <Footer />
    </div>
  );
};

export default Home;
