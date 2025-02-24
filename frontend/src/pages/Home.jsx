import React, { useEffect, useState } from "react";
import axios from "axios";
import FoodCard from "../components/FoodCard";

const Home = () => {
  const [food, setFood] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  


  useEffect(() => {
    setLoading(true);
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }


    setLoading(true);
    axios
      .get("http://localhost:3000/food")
      .then((response) => {
        setFood(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);



  return (
    <div className="p-4 max-w-[1400px] mx-auto ">
    <div className="">
    {userInfo && (
      <div className=" p-4 rounded-lg mb-4">
        <h1 className="text-2xl font-semibold">Welcome, {userInfo.name}</h1>
      </div>
    )}
  </div>
      <div
        className="rounded-lg bg-gradient-to-l from-green-400 to-green-600 h-[40px]
                        flex items-center justify-center "
      >
        <h1 className="text-2xl my-8 font-bold pl-8 text-white">Beverages</h1>
      </div>
      

      <FoodCard food={food} />
    </div>
  );
};

export default Home;
