import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TrackOrderIcon = () => {
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3000/order");
        setOrderCount(response.data.length);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
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

export default TrackOrderIcon;