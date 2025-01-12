// src/components/StockSearch/StockSearch.js

import React, { useState, useEffect } from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useUniverse } from '../../../context/UniverseContext';
import './StockSearch.css';

function StockSearch({ onSearchChange }) {
  const [localQuery, setLocalQuery] = useState('');
  const { fetchUniverseData } = useUniverse();

  // Ensure universe is fetched once
  useEffect(() => {
    fetchUniverseData();
  }, [fetchUniverseData]);

  const handleChange = (e) => {
    setLocalQuery(e.target.value);
    onSearchChange(e.target.value);
  };

  // If user presses Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      console.log('Search pressed Enter:', localQuery);
    }
  };

  return (
    <Box className="stock-search-container">
      <TextField
        variant="outlined"
        placeholder="Search Ticker or Name"
        value={localQuery}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        className="stock-search__input"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

export default StockSearch;
