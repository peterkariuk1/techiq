import { useEffect, useState } from "react";
import "../styles/banner.css";

import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";
import banner4 from "../assets/banner4B.jpg";
import banner5 from "../assets/banner5.jpg";
import banner6 from "../assets/banner6.jpg";
import banner7 from "../assets/banner7.jpg";
import banner8 from "../assets/banner8.jpg";
import banner9 from "../assets/banner9.jpg";

const bannerImages = [
  {
    url: banner1,
    theme: "light",
    text1: "Sale up to 40% off",
    text2: "Room sprays that refresh every corner",
  },
  {
    url: banner2,
    theme: "light",
    text1: "Scents with a story",
    text2: "Elegant perfumes crafted just for you",
  },
  {
    url: banner3,
    theme: "light",
    text1: "Your calm, bottled",
    text2: "Aromatherapy diffusers made elegant",
  },
  {
    url: banner4,
    theme: "dark",
    text1: "Smell different",
    text2: "Explore our rare niche perfume collection",
  },
  {
    url: banner5,
    theme: "light",
    // correct
    text1: "Drive in style",
    text2: "Auto perfumes that match your vibe",
  },
  {
    url: banner6,
    theme: "light",
    text1: "Feel expensive, effortlessly",
    text2: "Elegant perfumes for every mood",
  },
  {
    url: banner7,
    theme: "dark",
    text1: "Bold on the go",
    text2: "Auto scents that turn heads",
  },
  {
    url: banner8,
    theme: "light",
    text1: "Ignite your senses",
text2: "Niche candles made to mesmerize"
  },
  {
    url: banner9,
    theme: "light",
    // Correct
    text1: "Freshen up your space",
    text2: "Limited-time room spray deals",
  },
  {
    url: banner3, // duplicated on purpose as per your array
    theme: "light",
    text1: "Redefine your space",
    text2: "Diffusers that speak luxury",
  },
];

const Banner = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerImages.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const scrollToGrid = () => {

    setTimeout(() => {
      const gridElement = document.getElementById("grid-section");
      if (gridElement) {
        gridElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100); // small delay after state update to let DOM update
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
            <button onClick={scrollToGrid} className="cta-banner-button">Shop Now</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Banner;
