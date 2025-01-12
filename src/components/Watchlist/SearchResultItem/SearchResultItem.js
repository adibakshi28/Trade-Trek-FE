// src/components/SearchResultItem/SearchResultItem.js

import React, { useState } from 'react';
import { Box } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import './SearchResultItem.css';

function SearchResultItem({ ticker, name, onAddTicker }) {
  // Track whether we are currently adding
  const [isAdding, setIsAdding] = useState(false);

  const handleAddClick = async () => {
    // Prevent double-click
    if (isAdding) return;
    setIsAdding(true);

    try {
      await onAddTicker(ticker);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Box className="search-result-item">
      <Box className="search-result-item__left">
        <strong>{ticker}</strong>
        <small>{name}</small>
      </Box>
      <Box className="search-result-item__right">
        <AddCircleIcon
          className="search-result-item__add-icon"
          onClick={handleAddClick}
          style={{
            cursor: isAdding ? 'not-allowed' : 'pointer',
            opacity: isAdding ? 0.6 : 1,
          }}
        />
      </Box>
    </Box>
  );
}

export default SearchResultItem;
