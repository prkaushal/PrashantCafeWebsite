import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3000/order");
        const ordersWithTime = response.data.map((order) => ({
          ...order,
          timeLeft:
            600 -
            Math.floor(
              (Date.now() - new Date(order.createdAt).getTime()) / 1000
            ),
        }));
        setOrders(ordersWithTime);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };
    fetchOrders();

    socket.on("orderCreated", (newOrder) => {
      setOrders((prevOrders) => [...prevOrders, newOrder]);
    });

    socket.on("orderDeleted", (deletedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== deletedOrder._id)
      );
    });

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      socket.off("orderCreated");
      socket.off("orderDeleted");
      socket.off("orderUpdated");
    };
  }, []);

    // Calculate remaining time
    const calculateTimeLeft = (createdAt) => {
      const orderTime = new Date(createdAt).getTime();
      const currentTime = Date.now();
      const totalTime = 10 * 60 * 1000; // 10 minutes in milliseconds
      const timeLeft = totalTime - (currentTime - orderTime);
      return timeLeft > 0 ? timeLeft : 0;
    };
  
    // Timer logic
    useEffect(() => {
      const timer = setInterval(() => {
        setOrders((prevOrders) =>
          prevOrders.map((order) => ({
            ...order,
            timeLeft: calculateTimeLeft(order.createdAt),
          }))
        );
      }, 1000);
  
      return () => clearInterval(timer); // Cleanup on component unmount
    }, []);
  
    const formatTime = (milliseconds) => {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

  const handleCompleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:3000/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include auth token if required
        },
      });
      setOrders(orders.filter((order) => order._id !== orderId));
      localStorage.removeItem("orderInfo"); // Remove orderInfo from localStorage
    } catch (error) {
      console.error("Error deleting order:", error);
    }
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
                
              <p>Order Time: {new Date(order.createdAt).toLocaleString()}</p>
              <p
                className={`text-xl font-semibold ${
                  order.timeLeft <= 2 * 60 * 1000 ? "text-red-500" : "text-black"
                }`}
              >
                Time Remaining: {formatTime(order.timeLeft || calculateTimeLeft(order.createdAt))}
              </p>

              <button
                onClick={() => handleCompleteOrder(order._id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-300 mt-5"
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
