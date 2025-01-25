// src/utils/axiosClient.js
import axios from 'axios';
import config from '../config';

const axiosClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 600000,
});

axiosClient.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
