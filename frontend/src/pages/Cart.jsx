import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import axios from "axios";
import { BiPlus, BiMinus } from "react-icons/bi";
import { useSnackbar } from "notistack";
import Spinner from "../components/Spinner";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const Cart = () => {
  // Basic order details
  const [seatNumber, setSeatNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { cartItems, decreaseCartItemQuantity, addToCart, clearCart } = useCart();
  

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const placeOrder = async () => {
    if (!seatNumber || !userName) {
      enqueueSnackbar("Name and seat number are required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        enqueueSnackbar("You must be logged in to place an order", { variant: "warning" });
        return;
      }
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const orderData = {
        user: userInfo.id,
        items: cartItems,
        seatNumber,
        userName,
        totalPrice,   
      };
      
      const response = await axios.post("/order", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      enqueueSnackbar(response.data.message || "Order placed successfully", { variant: "success" });
      clearCart();
      setLoading(false);
    } catch (error) {
      console.error("Error placing order:", error);
      enqueueSnackbar("Order placement failed", { variant: "error" });
      setLoading(false);
    }
  };





  if (cartItems.length === 0) {
    return (
      <div className="text-black text-3xl text-center my-72">
        Your cart is empty.
      </div>
    );
  }


  

  return (
    <div className="p-4 max-w-[1400px] mx-auto">
      <h2 className="text-2xl font-semibold text-center my-6">Shopping Cart</h2>
      {loading && <Spinner />}

      <div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cartItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
              <img
                src={item.image}
                alt={item.name}
                className="rounded-md mb-4 w-full h-64 object-contain"
              />
              <h2 className="text-lg font-bold mb-2">{item.name}</h2>
              <p className="text-md mb-1">Price: Rs. {item.price}</p>
              <div className="flex items-center justify-between text-md mb-3">
                <p>Quantity: {item.quantity}</p>
                <div className="flex items-center">
                  <button
                    onClick={() => decreaseCartItemQuantity(item._id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded-lg"
                  >
                    <BiMinus />
                  </button>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold p-2 rounded-lg"
                  >
                    <BiPlus />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        
        <div className="text-center mt-8 rounded-lg mb-10 border border-black py-10 flex flex-col md:flex-row justify-around">
          <div className="mb-4 md:mb-0">
            <label className="block mb-2 font-semibold">Order for</label>
            <input
              type="text"
              placeholder="Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border p-2 rounded mr-4"
            />
          </div>

          <div className="mb-4 md:mb-0">
            <label className="block mb-2 font-semibold">Seat Number</label>
            <select
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              className="border p-2 rounded mr-4"
            >
              <option value="">Select Seat Number</option>
              {Array.from({ length: 40 }, (_, i) => i + 1).map((number) => (
                <option key={number} value={number}>
                  {number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-2xl font-semibold mb-4">
              Total Price: Rs. {totalPrice}
            </p>
            
            { (
              <button
                onClick={placeOrder}
                className="bg-green-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded"
              >
                Pay and Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
