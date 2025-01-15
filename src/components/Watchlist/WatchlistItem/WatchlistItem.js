// src/components/WatchlistItem/WatchlistItem.js

import React, { useState } from 'react';
import './WatchlistItem.css';
import { Box, Typography, IconButton, Button, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelineIcon from '@mui/icons-material/Timeline'; // Graph icon

function WatchlistItem({
  symbol,
  name,
  price,
  change,
  priceDirection,
  onDelete,
  onTrade,
  onShowPlot,    // new
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Day-change color
  const isDayChangePositive = change >= 0;

  // Price movement color
  let priceClass = 'watchlist-item__price'; 
  priceClass += isDayChangePositive ? ' positive' : ' negative';

  let changeClass = 'watchlist-item__change';
  if (priceDirection === 'up') {
    changeClass += ' positive';
  } else if (priceDirection === 'down') {
    changeClass += ' negative';
  } else{
    changeClass += '';
  }
  
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

  const handlePlotClick = () => {
    if (typeof onShowPlot === 'function') {
      onShowPlot(symbol);
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

      {/* Action Buttons (Visible on Hover) */}
      <Box className="watchlist-item__actions">
        {/* Graph/Plot icon */}
        <Tooltip title={"Plot instrument price and volume"} placement="top">
          <IconButton
              aria-label={`plot ${symbol}`}
              className="watchlist-item__plot-button"
              onClick={handlePlotClick}
            >
              <TimelineIcon fontSize="custom" />
            </IconButton>
        </Tooltip>

        {/* Dustbin (delete) */}
        <Tooltip title={"Remove instrument from watchlist"} placement="top">
          <IconButton
            aria-label={`delete ${symbol}`}
            className="watchlist-item__delete-button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            <DeleteIcon fontSize="custom" />
          </IconButton>
        </Tooltip>

        {/* Trade button */}
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
