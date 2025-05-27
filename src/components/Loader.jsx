import "../styles/loader.css";
import loaderAnimation from "../assets/loadervideo.webm";
const Loader = () => {
  return (
    <div className="loader-container">
      <video
        src={loaderAnimation}
        muted
        autoPlay
        loop
        onCanPlayThrough={(e) => e.target.play()}
        playsInline
      ></video>
      <p className="preloader-tagline">Impeccable Quality</p>{" "}
    </div>
  );
};

export default Loader;
