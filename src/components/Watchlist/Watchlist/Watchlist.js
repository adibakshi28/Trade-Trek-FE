// src/components/Watchlist/Watchlist/Watchlist.js

import React, { useState } from 'react';
import WatchlistItem from '../WatchlistItem/WatchlistItem';
import StockSearch from '../StockSearch/StockSearch';
import './Watchlist.css';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

const initialStocks = [
  { symbol: 'AAPL', name: 'Apple Inc', price: 139.95, change: 1.52 },
  { symbol: 'MSGS', name: 'Madison Square Grdn Sprt Corp', price: 152.87, change: -2.78 },
  { symbol: 'SITM', name: 'SITIME CORP', price: 142.53, change: 1.20 },
  { symbol: 'JJSF', name: 'J J Snack Foods', price: 140.16, change: -2.57 },
  { symbol: 'KWR', name: 'QUAKER HOUGHTON', price: 154.32, change: 3.32 },
  { symbol: 'BCPC', name: 'Balchem Corp', price: 122.43, change: 0.05 },
  { symbol: 'NOVT', name: 'Novanta Inc', price: 236.11, change: -2.78 },
  { symbol: 'SLAB', name: 'Silicon Labs', price: 182.75, change: 0.43 },
  { symbol: 'SYNA', name: 'Synaptics Inc', price: 121.42, change: 3.44 },
  { symbol: 'NVEE', name: 'Nv5 Global Inc', price: 75.95, change: -0.43 },
];

function Watchlist() {
  const [stocks, setStocks] = useState(initialStocks);
  const [filter, setFilter] = useState('all');

  const handleSearch = (query) => {
    // Implement actual search logic here
    console.log(`Searching for: ${query}`);
  };

  const handleFilter = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleDelete = (symbol) => {
    const updatedStocks = stocks.filter((stock) => stock.symbol !== symbol);
    setStocks(updatedStocks);
    console.log(`Deleted ${symbol} from watchlist`);
  };

  const handleTrade = (symbol) => {
    // Implement trade functionality here
    console.log(`Initiate trade for ${symbol}`);
  };

  const filteredStocks = stocks.filter((stock) => {
    if (filter === 'gainers') return stock.change > 0;
    if (filter === 'losers') return stock.change < 0;
    return true; // for 'all'
  });

  return (
    <Box className="watchlist-container">
      <Box className="watchlist-card">
        <Box className="watchlist-header">
          <StockSearch onSearch={handleSearch} />
          <Box className="filter-buttons">
            <ToggleButtonGroup
              value={filter}
              exclusive
              onChange={handleFilter}
              aria-label="stock filter"
              size="small"
            >
              <ToggleButton value="all" aria-label="all stocks" className="filter-button">
                <AllInclusiveIcon fontSize="small" /> All
              </ToggleButton>
              <ToggleButton value="gainers" aria-label="gainers" className="filter-button">
                <TrendingUpIcon fontSize="small" /> Gainers
              </ToggleButton>
              <ToggleButton value="losers" aria-label="losers" className="filter-button">
                <TrendingDownIcon fontSize="small" /> Losers
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        <Box className="watchlist">
          {filteredStocks.map((stock) => (
            <WatchlistItem
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.name}
              price={stock.price}
              change={stock.change}
              onDelete={handleDelete}
              onTrade={handleTrade}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default Watchlist;
