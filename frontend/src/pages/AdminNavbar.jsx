import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link } from "react-router-dom";

import DashboardIcon from "../components/DashboardIcon";

const AdminNavbar = () => {
  const [nav, setNav] = useState(false);
  const toggleNav = () => setNav(!nav);

  const logout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  };

  const loggedIn = !!localStorage.getItem("adminToken");


  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
      <div className="flex justify-between items-center p-4">
        <h2 className="text-xl text-white font-bold">Admin Panel</h2>

        <button onClick={toggleNav} className="text-white lg:hidden">
          {nav ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>

        <nav
          className={`${
            nav ? "flex" : "hidden"
          } absolute lg:static bg-green-600 w-full lg:w-auto lg:flex flex-col lg:flex-row items-center
                            space-y-5 lg:space-y-0 lg:space-x-6 top-14 left-0 right-0 py-5 lg:py-0 z-20`}
        >
          {loggedIn ? (
            <>
              <Link to="/admin" className={`relative ${location.pathname === '/admin' ? 'text-yellow-500' : 'text-white'}`}>
              Panel
              </Link>

              <Link to="/admin/dashboard" className={`relative ${location.pathname === '/admin/dashboard' ? 'text-yellow-500' : 'text-white'}`}>
                
                Dashboard
            <DashboardIcon />
              </Link>
              <button onClick={logout} className="text-white bg-red-400 px-3 py-1 rounded-md hover:bg-red-500">
                Logout
              </button>




            </>
          ) : (
            <Link to="/login" className="text-white">
              Login
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};





export default AdminNavbar;
