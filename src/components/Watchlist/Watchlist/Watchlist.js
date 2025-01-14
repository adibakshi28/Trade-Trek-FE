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
import TradeDialog from '../../TradeDialog/TradeDialog';

import {
  getUserWatchlist,
  removeFromUserWatchlist,
  addToUserWatchlist,
} from '../../../api/userApi';

import { useUniverse } from '../../../context/UniverseContext';
import { useWebSocket } from '../../../context/WebSocketContext';

function Watchlist({ refreshPortfolio, onShowPlot }) {
  // onShowPlot is a callback that fetches historical data in Dashboard

  const [stocks, setStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // For trade dialog
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [tradeData, setTradeData] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const { universeData, fetchUniverseData } = useUniverse();
  const { prices, sendMessage } = useWebSocket();

  useEffect(() => {
    fetchWatchlist();
    fetchUniverseData();
  }, [fetchUniverseData]);

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true);
      const data = await getUserWatchlist();
      const initial = data.map((item) => ({
        symbol: item.stock_ticker,
        name: item.stock_name,
        price: 0,
        change: 0,
        priceDirection: 'none',
      }));
      setStocks(initial);
    } catch (error) {
      showSnackbar('Server Error, try again later', 'error');
      console.error('Error fetching watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time updates
  useEffect(() => {
    setStocks((prev) =>
      prev.map((s) => {
        const symbolUpper = s.symbol.toUpperCase();
        const wsData = prices[symbolUpper];
        if (wsData) {
          const newPrice = Number(wsData.ltp);
          const newChange = Number(wsData.day_change);

          let direction = s.priceDirection;
          if (newPrice > s.price) direction = 'up';
          else if (newPrice < s.price) direction = 'down';

          return {
            ...s,
            price: newPrice,
            change: newChange,
            priceDirection: direction,
          };
        }
        return s;
      })
    );
  }, [prices]);

  // Searching
  const handleSearchChange = (val) => {
    setSearchQuery(val);
  };

  // Add
  const handleAddTicker = async (ticker) => {
    try {
      const resp = await addToUserWatchlist(ticker);
      if (resp.success) {
        showSnackbar(resp.message, 'success');
        const updated = resp.watchlist.map((item) => ({
          symbol: item.stock_ticker,
          name: item.stock_name,
          price: 0,
          change: 0,
          priceDirection: 'none',
        }));
        setStocks(updated);
        sendMessage({ type: 'subscribe', symbol: ticker });
        setSearchQuery('');
      } else {
        showSnackbar(resp.message, 'error');
      }
    } catch (error) {
      showSnackbar('Server Error, try again later', 'error');
      console.error('Error adding ticker:', error);
    }
  };

  // Delete
  const handleDelete = async (symbol) => {
    try {
      const resp = await removeFromUserWatchlist(symbol);
      if (resp.success) {
        showSnackbar(resp.message, 'success');
        setStocks((prev) => prev.filter((s) => s.symbol !== symbol));
      } else {
        showSnackbar(resp.message, 'error');
      }
    } catch (error) {
      showSnackbar('Server Error, try again later', 'error');
      console.error(`Error deleting ${symbol}:`, error);
    }
  };

  // Trade
  const handleTrade = (symbol) => {
    const found = stocks.find((s) => s.symbol === symbol);
    if (!found) return;
    setTradeData({
      symbol: found.symbol,
      name: found.name,
      price: found.price,
      dayChange: found.change,
    });
    setIsTradeOpen(true);
  };

  // Show plot (calls parent's onShowPlot)
  const handleShowPlot = (symbol) => {
    if (typeof onShowPlot === 'function') {
      onShowPlot(symbol);
    }
  };

  // Filter
  const handleFilter = (e, newFilter) => {
    if (newFilter !== null) setFilter(newFilter);
  };

  const filteredStocks = stocks.filter((stk) => {
    if (filter === 'gainers') return stk.change > 0;
    if (filter === 'losers') return stk.change < 0;
    return true;
  });

  // Build search results
  const isSearching = Boolean(searchQuery.trim());
  let searchResults = [];
  if (isSearching && universeData) {
    const text = searchQuery.toLowerCase();
    searchResults = universeData
      .filter((item) =>
        item.stock_ticker.toLowerCase().includes(text) ||
        item.stock_name.toLowerCase().includes(text)
      )
      .slice(0, 50);
  }

  // Snackbar
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box className="watchlist-container">
      <Box className="watchlist-card">
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
                <ToggleButton value="all">
                  <AllInclusiveIcon fontSize="small" /> All
                </ToggleButton>
                <ToggleButton value="gainers">
                  <TrendingUpIcon fontSize="small" /> Gainers
                </ToggleButton>
                <ToggleButton value="losers">
                  <TrendingDownIcon fontSize="small" /> Losers
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        </Box>

        <Box className="watchlist">
          {isSearching ? (
            searchResults.map((stock) => (
              <SearchResultItem
                key={stock.stock_ticker}
                ticker={stock.stock_ticker}
                name={stock.stock_name}
                onAddTicker={handleAddTicker}
              />
            ))
          ) : isLoading ? (
            [...Array(8)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={40}
                sx={{ marginBottom: '0.5rem', borderRadius: '4px' }}
              />
            ))
          ) : (
            filteredStocks.map((stock) => (
              <WatchlistItem
                key={stock.symbol}
                symbol={stock.symbol}
                name={stock.name}
                price={stock.price}
                change={stock.change}
                priceDirection={stock.priceDirection}
                onDelete={handleDelete}
                onTrade={handleTrade}
                onShowPlot={handleShowPlot} // add
              />
            ))
          )}
        </Box>
      </Box>

      {tradeData && (
        <TradeDialog
          open={isTradeOpen}
          onClose={() => setIsTradeOpen(false)}
          symbol={tradeData.symbol}
          refreshPortfolio={refreshPortfolio}
          showSnackbar={showSnackbar}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={1500}
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
