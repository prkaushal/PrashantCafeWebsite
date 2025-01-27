import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import axios from "axios";
import { BiPlus, BiMinus } from "react-icons/bi";
import { useSnackbar } from "notistack";
import Spinner from "../components/Spinner";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const Cart = () => {
  const [seatNumber, setSeatNumber] = useState("");
  const [userName, setUserName] = useState("");
  const [orderInfo, setOrderInfo] = useState(() => {
    const savedOrderInfo = localStorage.getItem("orderInfo");
    return savedOrderInfo ? JSON.parse(savedOrderInfo) : null;
  });
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { cartItems, decreaseCartItemQuantity, addToCart, clearCart } =
    useCart();

  // Save orderInfo to localStorage whenever it changes
  useEffect(() => {
    if (orderInfo) {
      localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
    } else {
      localStorage.removeItem("orderInfo");
    }
  }, [orderInfo]);

  if (cartItems.length === 0 ) {
    return (
      <div className="text-black text-3xl text-center my-72">
        Your cart is empty.
      </div>
    );
  }

  const handleOrder = async () => {
    if (!seatNumber || !userName) {
      enqueueSnackbar("Seat number and name are required", {
        variant: "warning",
      });
      return;
    }

    const orderData = {
      items: cartItems,
      seatNumber,
      userName,
      totalPrice: cartItems.reduce((acc, item) => acc + item.priceInCents * item.quantity, 0),
      orderTime: Date.now(), // Add order time
    };

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/order",
        orderData
      );
      enqueueSnackbar("Order placed successfully", { variant: "success" });
      clearCart();
      setOrderInfo(response.data);
      console.log(response.data);

      
      setLoading(false);
    } catch (error) {
      console.error("Error placing order:", error);
      enqueueSnackbar("Failed to place order", { variant: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mt-16 max-w-[1400px] mx-auto">
      <h2 className="text-2xl font-semibold text-center my-6">Shopping Cart</h2>

      {loading && <Spinner />}

      <div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cartItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-4 flex flex-col"
            >
              <img
                src={item.image}
                alt={item.name}
                className="rounded-md mb-4 w-full h-64 object-cover"
              />
              <h2 className="text-lg font-bold mb-2">{item.name}</h2>
              <p className="text-md mb-1">Price: Rs. {item.priceInCents}</p>
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

        <div className="text-center mt-8 flex flex-col md:flex-row justify-around ">
          <div className="mb-4 md:mb-0">
            <label className="block mb-2">Name</label>
            <input
              type="text"
              placeholder="Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border p-2 rounded mr-4"
            />
          </div>

          <div className="mb-4 md:mb-0">
            <label className="block mb-2">Seat Number</label>
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
              Total Price: Rs.{" "}
              {cartItems.reduce(
                (acc, item) => acc + item.priceInCents * item.quantity,
                0
              )}
            </p>
            <button
              onClick={handleOrder}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Pay and Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
