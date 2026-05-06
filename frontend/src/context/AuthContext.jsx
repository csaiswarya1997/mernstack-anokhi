import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(
    localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
  );

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/api/users/login`, { email, password });
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post(`${API_URL}/api/users`, { name, email, password });
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  const updateProfile = async (userData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };
    const { data } = await axios.put(`${API_URL}/api/users/profile`, userData, config);
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
