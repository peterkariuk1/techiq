import { Route, Routes } from "react-router-dom";
import "../styles/App.css";
import Home from "../pages/Home.jsx";
import Admin from "../pages/Admin.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Reset from "../pages/Reset.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/admin" element={<Admin />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/reset" element={<Reset />}></Route>
      </Routes>
    </>
  );
}

export default App;
