import React, { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.get("http://localhost:3000/order", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
                
        setOrders(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };

    fetchOrders();

    // Get current user's info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  socket.on("orderCreated", (newOrder) => {
    if (newOrder.user === userInfo?.id) {
      setOrders((prevOrders) => [...prevOrders, newOrder]);
    }
  });

  socket.on("orderDeleted", (deletedOrder) => {
    if (deletedOrder.user === userInfo?.id) {
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== deletedOrder._id)
      );
    }
  });

  socket.on("orderUpdated", (updatedOrder) => {
    if (updatedOrder.user === userInfo?.id) {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    }
  });

    return () => {
      socket.off("orderCreated");
      socket.off("orderDeleted");
      socket.off("orderUpdated");
    };
  }, []);


  useEffect(() => {
      const interval = setInterval(() => {
        const newTimers = {};
        orders.forEach(order => {
          const orderTime = new Date(order.createdAt).getTime();
          const currentTime = new Date().getTime();
          let remainingTime = 10 * 60 * 1000 - (currentTime - orderTime);
          if (remainingTime <= 0) {
            remainingTime = 0;
          }
          newTimers[order.id] = remainingTime;
        });
        setTimers(newTimers);
      }, 1000);
  
      return () => clearInterval(interval);
    }, [orders]);
  
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

  if (loading) {
    return (
      <div className="text-black text-3xl text-center my-72">
        <Spinner />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-black text-3xl text-center my-72">
        No orders available.
      </div>
    );
  }

  return (
    <div className="p-4  max-w-[1400px] mx-auto">
      <h2 className="text-2xl font-semibold text-center my-6">Track Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="bg-white p-6 border  rounded-lg shadow-lg mb-4">
          <h3 className="text-xl font-semibold mb-4">Order Information</h3>
          <p className="text-gray-700 mb-2">
          <strong>Order for:</strong> {order.userName}
        </p>
          <p className="text-gray-700 mb-2">
            <strong>Seat Number:</strong> {order.seatNumber}
          </p>
          
          <p className="text-gray-700 mb-2">
            <strong>Total Price:</strong> Rs. {order.totalPrice.toFixed(2)}
          </p>
          <ul className="mb-4">
            {order.items.map((item, index) => (
              <li key={index} className="text-gray-600 ">
                {item.name} : {item.quantity}
              </li>
            ))}
          </ul>

          <p className="mt-10 mb-2"> <strong> Order placed at : </strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p
            className={`text-xl font-semibold ${
              order.timeLeft <= 2 * 60 * 1000 ? "text-red-500" : "text-black"
            }`}
          >
            Order arriving in : {formatTime(order.timeLeft || calculateTimeLeft(order.createdAt))}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TrackOrder;
