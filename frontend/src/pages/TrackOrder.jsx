import React, { useState, useEffect } from "react";
import axios from "axios";

const TrackOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const response = await axios.get("http://localhost:3000/order");
            const ordersWithTime = response.data.map(order => ({
              ...order,
              timeLeft: 60 // Initialize with 10 minutes (600 seconds)
            }));
            setOrders(ordersWithTime);
            setLoading(false);
          } catch (error) {
            console.error("Error fetching orders:", error);
            setLoading(false);
          }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const ws = new WebSocket("ws://localhost:3000");

      ws.onopen = () => {
        // Send a message to start the timer for each order
        orders.forEach((order) => {
          ws.send(JSON.stringify({ orderId: order._id, action: "startTimer" }));
        });
      };

      ws.onmessage = (event) => {
        const { orderId, timeLeft } = JSON.parse(event.data);
        console.log(`TrackOrder - Order ID: ${orderId}, Time Left: ${timeLeft}`); // Add this line to print the timer
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
    }
  }, [orders]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };


  if (loading) {
    return (
      <div className="text-black text-3xl text-center my-72">
        Loading orders...
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
    <div className="p-4 mt-16 max-w-[1400px] mx-auto">
      <h2 className="text-2xl font-semibold text-center my-6">Track Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="bg-white p-6 rounded-lg shadow-lg mb-4">
          <h3 className="text-xl font-semibold mb-4">Order Information</h3>
          <p className="text-gray-700 mb-2">
            <strong>Order ID:</strong> {order._id}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Seat Number:</strong> {order.seatNumber}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Order by:</strong> {order.userName}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Total Price:</strong> Rs. {order.totalPrice.toFixed(2)}
          </p>
          <ul className="mb-4">
            {order.items.map((item, index) => (
              <li key={index} className="text-gray-600">
                {item.name} : {item.quantity}
              </li>
            ))}
          </ul>
          <p className={`text-xl font-semibold ${order.timeLeft <= 120 ? 'text-red-500' : 'text-black'}`}>
            Time Left: {formatTime(order.timeLeft)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TrackOrder;