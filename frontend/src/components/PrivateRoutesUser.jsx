import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoutesUser = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('userToken'); // Check if the user is authenticated

  return isAuthenticated ? children : <Navigate to="/userLogin" />;
};

export default PrivateRoutesUser;