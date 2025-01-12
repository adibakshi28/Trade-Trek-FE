// src/pages/WatchlistItem/WatchlistItem.js

import React from 'react';
import './WatchlistItem.css';
import { Box, Typography, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // Using AttachMoney as Trade Icon

function WatchlistItem({ symbol, name, price, change, onDelete, onTrade }) {
  const isPositive = change >= 0;

  return (
    <Box className="watchlist-item">
      {/* Left Section: Ticker and Name */}
      <Box className="watchlist-item__left">
        <Typography variant="h6" className="watchlist-item__symbol">
          {symbol}
        </Typography>
        <Typography variant="body2" className="watchlist-item__name">
          {name}
        </Typography>
      </Box>

      {/* Right Section: Price and Change */}
      <Box className="watchlist-item__right">
        <Typography variant="h6" 
          className={`watchlist-item__price ${
            isPositive ? 'positive' : 'negative'
          }`}
        >
          ${price.toFixed(2)}
        </Typography>
        <Typography
          variant="body2"
          className={`watchlist-item__change ${
            isPositive ? 'positive' : 'negative'
          }`}
        >
          {isPositive ? `+${change.toFixed(2)}` : change.toFixed(2)}
        </Typography>
      </Box>

      {/* Action Buttons (Visible on Hover) */}
      <Box className="watchlist-item__actions">
        <IconButton
          aria-label={`delete ${symbol}`}
          className="watchlist-item__delete-button"
          onClick={() => onDelete(symbol)}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AttachMoneyIcon />}
          className="watchlist-item__trade-button"
          onClick={() => onTrade(symbol)}
        >
          Trade
        </Button>
      </Box>
    </Box>
  );
}

export default WatchlistItem;
