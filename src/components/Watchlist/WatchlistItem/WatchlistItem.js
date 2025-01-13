// src/components/WatchlistItem/WatchlistItem.js

import React, { useState } from 'react';
import './WatchlistItem.css';
import { Box, Typography, IconButton, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

function WatchlistItem({
  symbol,
  name,
  price,
  change,
  priceDirection,  // "up", "down", or "none"
  onDelete,
  onTrade,
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Day-change color: if change >= 0 => green, else red
  const isDayChangePositive = change >= 0;

  // Price movement color: if priceDirection === 'up' => green, 'down' => red
  // If 'none', no highlight
  let priceClass = 'watchlist-item__price'; 
  if (priceDirection === 'up') {
    priceClass += ' price-up'; // define .price-up in CSS
  } else if (priceDirection === 'down') {
    priceClass += ' price-down'; // define .price-down in CSS
  }

  // Day-change class
  let changeClass = 'watchlist-item__change';
  changeClass += isDayChangePositive ? ' positive' : ' negative';

  const handleDeleteClick = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(symbol);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

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

      {/* Right Section: Price and Day Change */}
      <Box className="watchlist-item__right">
        <Typography variant="h6" className={priceClass}>
          ${price.toFixed(2)}
        </Typography>
        <Typography variant="body2" className={changeClass}>
          {isDayChangePositive ? `+${change.toFixed(2)}` : change.toFixed(2)}
        </Typography>
      </Box>

      {/* Action Buttons (Delete/Trade) */}
      <Box className="watchlist-item__actions">
        <IconButton
          aria-label={`delete ${symbol}`}
          className="watchlist-item__delete-button"
          onClick={handleDeleteClick}
          disabled={isDeleting}
        >
          <DeleteIcon fontSize="custom" />
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
