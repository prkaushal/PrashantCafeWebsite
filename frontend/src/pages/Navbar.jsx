import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { Link } from "react-router-dom";
import CartIcon from "../components/CartIcon";
import TrackOrderIcon from "../components/TrackOrderIcon";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const toggleNav = () => setNav(!nav);

  const logout = () => {
    localStorage.removeItem("userToken");
    window.location.href = "/userLogin";
  };

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 shadow-lg">
      <div className="flex justify-between items-center p-4 max-w-[1400px] mx-auto">
        <a href="/" className="flex items-center">
          <h1 className=" text-white font-extrabold  ">Prashant Cafe</h1>
        </a>
        <div className="flex flex-row justify-between gap-10">
          <Link
            to="/cart"
            className={`relative ${
              location.pathname === "/cart" ? "text-yellow-500" : "text-white"
            }`}
          >
            <CartIcon />
          </Link>

          <Link
            to="/orders"
            className={`relative ${
              location.pathname === "/orders" ? "text-yellow-500" : "text-white"
            }`}
          >
            My Orders
            <TrackOrderIcon />
          </Link>
        </div>

        <button onClick={toggleNav} className="text-white lg:hidden">
          {nav ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>

        <nav
          className={`${
            nav ? "flex bg-green-600" : "hidden"
          } absolute  lg:static w-full lg:w-auto lg:flex flex-col lg:flex-row items-center
                            space-y-5 lg:space-y-0 lg:space-x-6 top-14 left-0 right-0 py-5 lg:py-0 z-20`}
        >
          <Link to="/" className="text-white">
            Home
          </Link>
          <Link to="/contact" className="text-white">
            Contact
          </Link>
          <button
            onClick={logout}
            className="text-white bg-red-400 px-3 py-1 rounded-md hover:bg-red-500"
          >
            Logout
          </button>
        </nav>
        
      </div>
    </div>
  );
};

export default Navbar;
