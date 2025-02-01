import Admin from "./pages/Admin";
import React from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateRoutesUser from "./components/PrivateRoutesUser";
// import { Routes, Route, useLocation } from "react-router-dom";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import CreateFood from "./pages/CreateFood";
import EditFood from "./pages/EditFood";
import DeleteFood from "./pages/DeleteFood";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminNavbar from "./pages/AdminNavbar";
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import DeleteOrder from "./pages/DeleteOrder";
import TrackOrder from "./pages/TrackOrder";
import UserRegister from "./pages/UserRegister";
import UserLogin from "./pages/UserLogin";

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.includes("/admin");
  const isNoNavbarRoute = [
    "/userLogin",
    "/userRegister",
    "/login",
    "/register",
  ].includes(location.pathname);

  return (
    <>
      {isAdminRoute && <AdminNavbar />}
      {!isNoNavbarRoute && !isAdminRoute && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoutesUser>
              <Home />
            </PrivateRoutesUser>
          }
        />
        <Route
          path="/contact"
          element={
            <PrivateRoutesUser>
              <Contact />
            </PrivateRoutesUser>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoutesUser>
              <Cart />
            </PrivateRoutesUser>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/orders"
          element={
            <PrivateRoutesUser>
              <TrackOrder />
            </PrivateRoutesUser>
          }
        />
        <Route path="/userRegister" element={<UserRegister />} />
        <Route path="/userLogin" element={<UserLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Admin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/order/delete/:id" element={<DeleteOrder />} />
      <Route path="/food/create" element={<CreateFood />} />
      <Route path="/food/edit/:id" element={<EditFood />} />
      <Route path="/food/delete/:id" element={<DeleteFood />} />
    </Routes>
  );
};

export default App;
