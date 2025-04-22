import "../styles/App.css";
import Home from "../pages/Home.jsx";
import Admin from "../pages/Admin.jsx";
import Login from "../pages/Login.jsx";
import { Route, Routes, useLocation } from "react-router-dom";
import Register from "../pages/Register.jsx";

function App() {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/admin" element={<Admin />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/create-your-account" element={<Register />}></Route>
      </Routes>
    </>
  );
}

export default App;
