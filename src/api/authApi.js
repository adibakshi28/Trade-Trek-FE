// src/api/authApi.js
import axiosClient from '../utils/axiosClient';

// REGISTER
export const registerUser = async (payload) => {
  // payload = { first_name, last_name, email, username, password }
  const response = await axiosClient.post('/auth/register', null, {
    params: payload,
  });
  return response.data;
};

// LOGIN
export const loginUser = async (payload) => {
  // payload = { email_or_username, password }
  const response = await axiosClient.post('/auth/login', null, {
    params: payload,
  });
  return response.data;
};

// LOGOUT
export const logoutUser = async () => {
  const response = await axiosClient.post('/auth/logout');
  return response.data;
};