import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    setLoading(true);

    axios
      .get("http://localhost:3000/order")
      .then((response) => {
        const ordersWithTime = response.data.map(order => ({
          ...order,
          timeLeft: 120 // Initialize with 10 minutes (600 seconds)
        }));
        
        setOrders(ordersWithTime);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // WebSocket connection to receive time updates
    const ws = new WebSocket("ws://localhost:3000");

    ws.onmessage = (event) => {
      const { orderId, timeLeft } = JSON.parse(event.data);
      console.log(`Order ID: ${orderId}, Time Left: ${timeLeft}`);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, timeLeft } : order
        )
      );
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    // Local timer to decrement timeLeft every second
    const interval = setInterval(() => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => ({
          ...order,
          timeLeft: order.timeLeft > 0 ? order.timeLeft - 1 : 0,
        }))
      );
    }, 1000);

    return () => {
      clearInterval(interval); // Cleanup the interval on component unmount
    };
  }, []);

  const handleCompleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:3000/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include auth token if required
        },
      });
      setOrders(orders.filter((order) => order._id !== orderId));
      localStorage.removeItem("orderInfo"); // Remove orderInfo from localStorage
      alert("Order delivered successfully"); // Show notification
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto bg-gray-50">
      {loading && <Spinner />}

      <div>
        <h2 className="text-3xl font-bold mb-6 text-center">Orders</h2>
        <div className="grid grid-cols-1 gap-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h1 className="text-gray-700  mb-2">
                <strong>Order by:</strong> {order.userName}
              </h1>
              <p className="text-gray-700 mb-2">
                <strong>Seat Number:</strong> {order.seatNumber}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Total Price:</strong> Rs. {order.totalPrice.toFixed(2)}
              </p>
              <ul className="mb-4">
                {order.items.map((item, index) => (
                  <li key={index} className="text-gray-600">
                    {item.name} - Quantity: {item.quantity}
                  </li>
                ))}
              </ul>
              <p className={`text-xl font-semibold ${order.timeLeft <= 120 ? "text-red-500" : "text-black"}`}>
                Time Left: {formatTime(order.timeLeft)}
              </p>
              <button
                onClick={() => handleCompleteOrder(order._id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
              >
                Complete Order
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
