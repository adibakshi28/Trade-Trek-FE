// src/config/index.js
const config = {
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
    websocketUrl: process.env.REACT_APP_WEBSOCKET_BASE_URL || 'ws://localhost:3000',
  };
  
  export default config;  