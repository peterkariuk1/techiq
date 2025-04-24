import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from "react";
import { CartProvider } from "../context/CartContext";
import "../styles/App.css";
import Home from "../pages/Home.jsx";
import Admin from "../pages/Admin.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Reset from "../pages/Reset.jsx";
import Checkout from "../pages/Checkout.jsx";
import Product from "../pages/Product.jsx";
import { bannerImages } from "../components/BannerImages.jsx";
import Loader from "../components/Loader.jsx";
import NotFound from "../pages/NotFound.jsx";
import OrderTracking from "../pages/OrderTracking.jsx";
import AdminOrders from "../pages/AdminOrders.jsx";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let loaded = 0;

    bannerImages.forEach((banner) => {
      const img = new Image();
      img.src = banner.url;
      img.onload = () => {
        loaded++;
        if (loaded === bannerImages.length) {
          setIsLoading(false);
        }
      };
    });
  }, []);
  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/load-test" element={<Loader />}></Route>
            <Route path="/admin" element={<Admin />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/reset" element={<Reset />}></Route>
            <Route path="/checkout" element={<Checkout />}></Route>
            <Route path="/product/:id" element={<Product />}></Route>
            <Route path="/product/" element={<Product />}></Route>
            <Route path="*" element={<NotFound />}></Route>
            <Route path="/my-orders" element={<OrderTracking />}></Route>
            <Route path="/all-orders" element={<AdminOrders />}></Route>
          </Routes>
        </CartProvider>
      )}
    </>
  );
}

<Routes />;
export default App;
