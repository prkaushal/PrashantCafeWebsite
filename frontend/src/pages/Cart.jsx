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
  const [upiId, setUpiId] = useState("");
  
  // New states for our manual UPI flow
  const [orderInfo, setOrderInfo] = useState(() => {
    const savedOrder = localStorage.getItem("orderInfo");
    return savedOrder ? JSON.parse(savedOrder) : null;
  });
  const [paymentRefInput, setPaymentRefInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const { cartItems, decreaseCartItemQuantity, addToCart, clearCart } = useCart();

  // Persist orderInfo to localStorage
  useEffect(() => {
    if (orderInfo) {
      localStorage.setItem("orderInfo", JSON.stringify(orderInfo));
    } else {
      localStorage.removeItem("orderInfo");
    }
  }, [orderInfo]);


  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.priceInCents * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="text-black text-3xl text-center my-72">
        Your cart is empty.
      </div>
    );
  }

  // Step 1: Request Payment (create order with status pending)
  const requestPayment = async () => {
    if (!seatNumber || !userName || !upiId) {
      enqueueSnackbar("Name, seat number, and UPI ID are required", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const orderData = {
        user: userInfo.id,
        items: cartItems,
        seatNumber,
        userName,
        upiId,         // Save the user's UPI id
        totalPrice,    // Total amount in paise
      };

      // Call the backend to create an order (with a pending payment status)
      const response = await axios.post("http://localhost:3000/order", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      enqueueSnackbar(response.data.message || "Payment request sent", { variant: "success" });
      setOrderInfo(response.data.order);
      setLoading(false);
    } catch (error) {
      console.error("Error requesting payment:", error);
      enqueueSnackbar("Payment request failed", { variant: "error" });
      setLoading(false);
    }
  };

  // Step 2: Confirm Payment (user enters transaction reference after paying)
  const confirmPayment = async () => {
    if (!paymentRefInput) {
      enqueueSnackbar("Please enter the transaction reference", { variant: "warning" });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      const response = await axios.post(
        "http://localhost:3000/order/confirm",
        {
          orderId: orderInfo.orderId,
          transactionReference: paymentRefInput,
        },
        {
          headers: { Authorization: `Bearer ${token}`},
        }
      );
      enqueueSnackbar("Payment confirmed and order placed", { variant: "success" });
      clearCart();
      setOrderInfo(response.data.order);
      setLoading(false);
    } catch (error) {
      console.error("Error confirming payment:", error);
      enqueueSnackbar("Payment confirmation failed", { variant: "error" });
      setLoading(false);
    }
  };

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
                className="rounded-md mb-4 w-full h-64 object-cover"
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

        {/* Order details input */}
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
          
          <div className="mb-4 md:mb-0">
            <label className="block mb-2 font-semibold">Your UPI ID</label>
            <input
              type="text"
              placeholder="example@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="border p-2 rounded mr-4"
            />
          </div>

          <div>
            <p className="text-2xl font-semibold mb-4">
              Total Price: Rs. {totalPrice}
            </p>
            {/* Show "Request Payment" button if order is not yet created */}
            {!orderInfo && (
              <button
                onClick={requestPayment}
                className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded"
              >
                Pay Now
              </button>
            )}
          </div>
        </div>

        {/* If an order was created (pending payment), show payment instructions */}
        {orderInfo && orderInfo.paymentStatus === "pending" && (
          <div className="text-center border border-gray-400 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Payment Request Sent</h3>
            <p className="mb-4">
              Please send Rs. {totalPrice} to your UPI app using your UPI ID (
              <strong>{upiId}</strong>). Use the reference code: <strong>{orderInfo.orderId}</strong>.
            </p>
            <div className="mb-4">
              <label className="block mb-2 font-semibold">
                Enter Transaction Reference Once Payment Is Done
              </label>
              <input
                type="text"
                placeholder="Enter transaction reference"
                value={paymentRefInput}
                onChange={(e) => setPaymentRefInput(e.target.value)}
                className="border p-2 rounded w-full max-w-xs mx-auto"
              />
            </div>
            <button
              onClick={confirmPayment}
              className="bg-green-600 hover:bg-green-800 text-white font-bold py-3 px-6 rounded"
            >
              Confirm Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
