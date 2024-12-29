// src/components/TradeDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import { placeStockTransaction } from '../api/stockApi'; 

function TradeDialog({
  open,
  onClose,
  ticker,
  availableFunds,    
  currentPrice,     
  existingPosition,   
  onTransactionSuccess,
}) {

  const [direction, setDirection] = useState('BUY');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleCloseSnackbar = () => setShowSnackbar(false);

  const handleTrade = async () => {
    try {
      const payload = { ticker, direction, quantity };
      const response = await placeStockTransaction(payload);
      onTransactionSuccess(response);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to execute transaction');
      setShowSnackbar(true);
    }
  };

  const fmt = (val) =>
    typeof val === 'number' ? val.toFixed(2) : val;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Make a Transaction</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {/* Show user data: available funds, current price, position */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Ticker:</strong> {ticker}
          </Typography>
          <Typography variant="body2">
            <strong>Current Price:</strong>{' '}
            {currentPrice !== undefined ? `$${fmt(currentPrice)}` : 'N/A'}
          </Typography>
          <Typography variant="body2">
            <strong>Available Funds:</strong>{' '}
            {availableFunds !== undefined ? `$${fmt(availableFunds)}` : 'N/A'}
          </Typography>
          {existingPosition ? (
            <Typography variant="body2">
              <strong>Your Position:</strong> {existingPosition.direction} {existingPosition.quantity} shares
            </Typography>
          ) : (
            <Typography variant="body2">
              <em>No current position</em>
            </Typography>
          )}
        </Box>

        {/* direction & quantity */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            select
            label="Direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="BUY">BUY</MenuItem>
            <MenuItem value="SELL">SELL</MenuItem>
          </TextField>

          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            sx={{ width: '100px' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleTrade} color="primary">
          Confirm
        </Button>
      </DialogActions>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default TradeDialog;
