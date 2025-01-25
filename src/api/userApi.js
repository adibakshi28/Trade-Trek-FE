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

// /user/dashboard
export const getUserDashboard = async () => {
  const response = await axiosClient.get('/user/dashboard');
  return response.data; // e.g. { user, portfolio, fund, summary }
};


// GET /user/watchlist
export const getUserWatchlist = async () => {
  const res = await axiosClient.get('/user/watchlist');
  return res.data; // e.g. array of watchlist items containing stock_ticker, stock_name
};


// GET /user/watchlist/remove?ticker=xxx
export const removeFromUserWatchlist = async (ticker) => {
  const res = await axiosClient.get('/user/watchlist/remove', {
    params: { ticker },
  });
  return res.data;
};


// GET /user/watchlist/add?ticker=xxx
export const addToUserWatchlist = async (ticker) => {
  const res = await axiosClient.get('/user/watchlist/add', {
    params: { ticker },
  });
  return res.data;
};

// /user/portfolio/history
export const getUserPortfolioHistory = async () => {
  const response = await axiosClient.get('/user/portfolio/history');
  return response.data; 
};

// /user/metrics
export const postUserMetrics = async (config) => {
  const response = await axiosClient.post('/user/metrics', config);
  return response.data;
};