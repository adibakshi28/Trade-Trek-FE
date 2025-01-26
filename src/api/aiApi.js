// src/api/aiApi.js
import axiosClient from '../utils/axiosClient';

// /ai/ask-deepseek
export const getAskAI = async (input_str) => {
  const res = await axiosClient.get('/ai/ask-deepseek', {
    params: { input_str },
  });
  return res.data;
};

// /ai/metric-insights
export const postMetricInsights = async (config) => {
  const response = await axiosClient.post('/ai/metric-insights', config);
  return response.data;
};


// /ai/stock-insights
export const postStockInsights = async (config) => {
  const response = await axiosClient.post('/ai/stock-insights', config);
  return response.data;
};