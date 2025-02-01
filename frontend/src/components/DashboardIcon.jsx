import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io("http://localhost:3000");

const DashboardIcon = () => {
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get("http://localhost:3000/order/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        setOrderCount(response.data.length);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
    

    socket.on("orderCreated", (newOrder) => {
        setOrderCount((prevCount) => prevCount + 1);
      });
  
      socket.on("orderDeleted", (deletedOrder) => {
        setOrderCount((prevCount) => prevCount - 1);
      });
  

    return () => {
      socket.off('orderCreated');
      socket.off('orderDeleted');
    };
  }, []);

  return (
    <div className='relative'>
      {orderCount > 0 && (
        <span className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-2 py-1'>
          {orderCount}
        </span>
      )}
    </div>
  );
};

export default DashboardIcon;