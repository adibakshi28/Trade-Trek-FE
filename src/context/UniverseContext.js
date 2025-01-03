// src/context/UniverseContext.js
import React, { createContext, useState, useContext } from 'react';
import { getStockUniverse } from '../api/stockApi';

export const UniverseContext = createContext();

export const useUniverse = () => useContext(UniverseContext);

export const UniverseProvider = ({ children }) => {
  const [universeData, setUniverseData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUniverseData = async () => {
    if (universeData) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getStockUniverse();
      setUniverseData(data);
    } catch (err) {
      console.error('Failed to fetch stock universe:', err);
      setError('Failed to load data. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UniverseContext.Provider value={{ universeData, isLoading, error, fetchUniverseData }}>
      {children}
    </UniverseContext.Provider>
  );
};
