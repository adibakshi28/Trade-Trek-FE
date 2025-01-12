// src/components/Watchlist/Watchlist/Watchlist.js

import React, { useState, useEffect } from 'react';
import './Watchlist.css';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Alert,
  Skeleton,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';

import StockSearch from '../StockSearch/StockSearch';
import WatchlistItem from '../WatchlistItem/WatchlistItem';
import SearchResultItem from '../SearchResultItem/SearchResultItem';

import {
  getUserWatchlist,
  removeFromUserWatchlist,
  addToUserWatchlist,
} from '../../../api/userApi';

import { useUniverse } from '../../../context/UniverseContext';

function Watchlist() {
  const [stocks, setStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  
  // For showing skeleton loaders while fetching watchlist
  const [isLoading, setIsLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // 'success' | 'error' | 'warning' | 'info'
  });

  const { universeData, fetchUniverseData } = useUniverse();

  useEffect(() => {
    fetchWatchlist();
    fetchUniverseData();
  }, [fetchUniverseData]);

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      const data = await getUserWatchlist(); 
      const randomStocks = data.map((item) => ({
        symbol: item.stock_ticker,
        name: item.stock_name,
        price: 0,    
        change: 0,  
      }));
      setStocks(randomStocks);
    } catch (error) {
      showSnackbar('Server Error, try again later', 'error');
      console.error('Error fetching watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Called by StockSearch whenever user types
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  // Called by SearchResultItem's Add icon
  const handleAddTicker = async (ticker) => {
    try {
      const response = await addToUserWatchlist(ticker);
      // Check response.success
      if (response.success) {
        showSnackbar(response.message, 'success');
        // refresh the watchlist from response
        const updated = response.watchlist.map((item) => ({
          symbol: item.stock_ticker,
          name: item.stock_name,
          price: parseFloat((Math.random() * 1000).toFixed(2)),
          change: parseFloat((Math.random() * 20 - 10).toFixed(2)),
        }));
        setStocks(updated);
        // Clear search so we return to watchlist
        setSearchQuery('');
      } else {
        // success === false -> show error
        showSnackbar(response.message, 'error');
      }
    } catch (error) {
      showSnackbar('Server Error, try again later', 'error');
      console.error(`Error adding ${ticker} to watchlist:`, error);
    }
  };

  // Called by WatchlistItem's Delete icon
  const handleDelete = async (symbol) => {
    try {
      const response = await removeFromUserWatchlist(symbol);
      if (response.success) {
        showSnackbar(response.message, 'success');
        // Update local watchlist
        setStocks((prev) => prev.filter((s) => s.symbol !== symbol));
      } else {
        showSnackbar(response.message, 'error');
      }
    } catch (error) {
      showSnackbar('Server Error, try again later', 'error');
      console.error(`Error deleting ${symbol}:`, error);
    }
  };

  // Called by WatchlistItem "Trade" button
  const handleTrade = (symbol) => {
    console.log(`Initiate trade for ${symbol}`);
  };

  const handleFilter = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    if (filter === 'gainers') return stock.change > 0;
    if (filter === 'losers') return stock.change < 0;
    return true;
  });

  const isSearching = Boolean(searchQuery.trim());
  let searchResults = [];
  if (isSearching && universeData) {
    const text = searchQuery.toLowerCase();
    searchResults = universeData
      .filter(
        (item) =>
          item.stock_ticker.toLowerCase().includes(text) ||
          item.stock_name.toLowerCase().includes(text)
      )
      .slice(0, 50);
  }

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box className="watchlist-container">
      <Box className="watchlist-card">
        {/* Header: search + filter */}
        <Box className="watchlist-header">
          <StockSearch onSearchChange={handleSearchChange} />
          {!isSearching && (
            <Box className="filter-buttons">
              <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={handleFilter}
                aria-label="stock filter"
                size="small"
              >
                <ToggleButton value="all" aria-label="all stocks">
                  <AllInclusiveIcon fontSize="small" /> All
                </ToggleButton>
                <ToggleButton value="gainers" aria-label="gainers">
                  <TrendingUpIcon fontSize="small" /> Gainers
                </ToggleButton>
                <ToggleButton value="losers" aria-label="losers">
                  <TrendingDownIcon fontSize="small" /> Losers
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        </Box>

        {/* Main area: either searching or watchlist */}
        <Box className="watchlist">
          {isSearching ? (
            // Show search results
            searchResults.map((stock) => (
              <SearchResultItem
                key={stock.stock_ticker}
                ticker={stock.stock_ticker}
                name={stock.stock_name}
                onAddTicker={handleAddTicker}
              />
            ))
          ) : isLoading ? (
            // Show skeletons while loading the watchlist
            [...Array(8)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={40}
                sx={{ marginBottom: '0.5rem', borderRadius: '4px' }}
              />
            ))
          ) : (
            // Show the normal watchlist items
            filteredStocks.map((stock) => (
              <WatchlistItem
                key={stock.symbol}
                symbol={stock.symbol}
                name={stock.name}
                price={stock.price}
                change={stock.change}
                onDelete={handleDelete}
                onTrade={handleTrade}
              />
            ))
          )}
        </Box>
      </Box>

      {/* Snackbar for showing success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={1000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Watchlist;
