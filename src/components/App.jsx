import { Route, Routes } from "react-router-dom";
import { CartProvider } from "../context/CartContext";
import "../styles/App.css";
import Home from "../pages/Home.jsx";
import Admin from "../pages/Admin.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Reset from "../pages/Reset.jsx";
import Checkout from "../pages/Checkout.jsx";
import Product from "../pages/Product.jsx";

function App() {
  return (
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/admin" element={<Admin />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/reset" element={<Reset />}></Route>
          <Route path="/checkout" element={<Checkout />}></Route>
          <Route path="/product/:id" element={<Product />}></Route>
        </Routes>
      </CartProvider>

  );
}

export default App;
