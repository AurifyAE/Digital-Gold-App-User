import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on component mount
    const savedUser = localStorage.getItem('token');
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (data) => {
    setIsLoading(true);
    try {
      const response = await loginUser(data);
      const userData = response.data.data;
      // console.log('Login successful:', userData);
      setUser(userData);
      localStorage.setItem('user', userData.user.name);
      localStorage.setItem('userId', userData.user.id); 
      localStorage.setItem('token', userData.token); 
      localStorage.setItem('email', userData.user.email); 
      setIsLoading(false);
      return userData;
    } catch (error) {
      console.log('Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    try {
      const userData = await registerUser(data);
      // setUser(userData);
      // localStorage.setItem('user', JSON.stringify(userData));
      // localStorage.setItem('userId', userData.id); // Ensure userId is stored
      // localStorage.setItem('token', userData.token); // Store token if provided
      // localStorage.setItem('email', JSON.stringify(userData.email)); // Store email
      setIsLoading(false);
      return userData;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    // Clear all relevant localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('schemes');
    localStorage.removeItem('aims');
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};