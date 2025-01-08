// src/context/WebSocketContext.js

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { useAuthContext } from './AuthContext';
import { createRealtimeSocket } from '../api/websocketClient';

// Create WebSocket Context
const WebSocketContext = createContext(null);

// Custom hook for consuming WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

// Constants for reconnection logic
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

// WebSocket Provider Component
export const WebSocketProvider = ({ children }) => {
  const { accessToken, isAuthLoading, clearAuth } = useAuthContext();
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [prices, setPrices] = useState({});
  const [error, setError] = useState(null);
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef(null);
  
  // Message Queue to store messages sent before connection is open
  const messageQueue = useRef([]);

  // Function to establish WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!accessToken) {
      console.warn('⚠️ No access token available. WebSocket not connected.');
      return;
    }

    // Initialize WebSocket connection
    ws.current = createRealtimeSocket(accessToken);

    // Handle WebSocket open event
    ws.current.onopen = () => {
      setConnectionStatus('connected');
      setError(null);
      reconnectAttempts.current = 0; // Reset reconnection attempts on successful connection
      console.log('✅ WebSocket Connected');

      // Flush the message queue
      messageQueue.current.forEach((message) => {
        ws.current.send(JSON.stringify(message));
        console.log('📤 Sent queued message:', message);
      });
      messageQueue.current = []; // Clear the queue after sending
    };

    // Handle incoming messages
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Assuming data is an array of price updates
        if (Array.isArray(data)) {
          setPrices((prevPrices) => {
            const updatedPrices = { ...prevPrices };
            data.forEach(({ stock_ticker, ltp }) => {
              const sym = stock_ticker.toUpperCase();
              updatedPrices[sym] = Number(ltp).toFixed(2);
            });
            return updatedPrices;
          });
        }
      } catch (parseError) {
        console.error('❌ Failed to parse WebSocket message:', parseError);
      }
    };

    // Handle WebSocket errors
    ws.current.onerror = (errorEvent) => {
      console.error('❌ WebSocket Error:', errorEvent);
      setError(errorEvent);
      setConnectionStatus('error');
    };

    // Handle WebSocket close event
    ws.current.onclose = (event) => {
      setConnectionStatus('disconnected');
      console.log('🔌 WebSocket Disconnected', event.reason);

      // Attempt to reconnect unless the closure was intentional (code 1000)
      if (event.code !== 1000) {
        const delay = Math.min(
          INITIAL_RECONNECT_DELAY * 2 ** reconnectAttempts.current,
          MAX_RECONNECT_DELAY
        );
        console.log(`🔄 Attempting WebSocket reconnection in ${delay / 1000}s...`);
        reconnectTimeout.current = setTimeout(connectWebSocket, delay);
        reconnectAttempts.current += 1;
      }
    };
  }, [accessToken]);

  // Establish WebSocket connection when accessToken is available
  useEffect(() => {
    if (isAuthLoading) return; // Wait until auth state is resolved

    if (accessToken) {
      connectWebSocket();
    }

    // Cleanup on component unmount or accessToken change
    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmount or logout');
        console.log('🛑 WebSocket Connection Closed');
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [accessToken, isAuthLoading, connectWebSocket]);

  // Handle accessToken changes (e.g., token refresh)
  useEffect(() => {
    if (!isAuthLoading) {
      // If accessToken changes, reconnect WebSocket with the new token
      if (ws.current) {
        ws.current.close(1000, 'Access token changed');
        console.log('🔄 Reconnecting WebSocket due to access token change');
      }
    }
    // The main connection logic in the above useEffect will handle reconnection
  }, [accessToken, isAuthLoading]);

  // Send message via WebSocket with queuing
  const sendMessage = useCallback(
    (message) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
        console.log('📤 Sent message:', message);
      } else {
        console.warn('⚠️ WebSocket not open. Queuing message:', message);
        messageQueue.current.push(message);
      }
    },
    [] // No dependencies since ws.current is mutable
  );

  // Memoize context value to optimize performance
  const contextValue = useMemo(
    () => ({
      sendMessage,
      prices,
      connectionStatus,
      error,
    }),
    [sendMessage, prices, connectionStatus, error]
  );

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
