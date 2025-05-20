import { useEffect, useState } from "react";
import "../styles/banner.css";
import { bannerImages } from "./BannerImages.jsx";


const Banner = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerImages.length);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const scrollToGrid = () => {
    setTimeout(() => {
      const gridElement = document.getElementById("grid-section");
      if (gridElement) {
        gridElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 5); // small delay after state update to let DOM update
  };

  return (
    <div className="banner-container">
      {bannerImages.map((img, index) => (
        <div
          key={index}
          className={`banner-slide ${index === activeIndex ? "active" : ""}`}
          style={{
            backgroundImage: `url(${img.url})`,
          }}
        >
          <div className={`banner-overlay ${img.theme}-text`}>
            <h1>{img.text1}</h1>
            <h3> {img.text2}</h3>
            <button onClick={scrollToGrid} className="cta-banner-button">
              Discover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Banner;
