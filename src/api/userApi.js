// src/api/userApi.js
import axiosClient from '../utils/axiosClient';

// /user
export const getUser = async () => {
  const response = await axiosClient.get('/user');
  return response.data; // e.g. {id:21, first_name:'aditya', ...}
};

// /user/funds
export const getUserFunds = async () => {
  const response = await axiosClient.get('/user/funds');
  return response.data; // e.g. { user_id:21, cash: 97824.8 }
};

// /user/portfolio
export const getUserPortfolio = async () => {
  const response = await axiosClient.get('/user/portfolio');
  return response.data; // e.g. array of positions
};

// /user/transactions
export const getUserTransactions = async () => {
  const response = await axiosClient.get('/user/transactions');
  return response.data; // e.g. array of transactions
};

// /user/summary
export const getUserSummary = async () => {
  const response = await axiosClient.get('/user/summary');
  return response.data; // e.g. { cash_balance, positions_market_value, portfolio_value, ...}
};
