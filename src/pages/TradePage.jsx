// src/pages/TradePage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import { useLocation } from 'react-router-dom';

import { getStockQuote, placeStockTransaction } from '../api/stockApi';
import { getUserPortfolio, getUserFunds } from '../api/userApi';

const BuyButton = styled('button')({
  backgroundColor: '#2e7d32',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  marginRight: '8px',
  borderRadius: '4px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#1b5e20',
  },
});
const SellButton = styled('button')({
  backgroundColor: '#c62828',
  color: '#fff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '4px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#b71c1c',
  },
});

function TradePage() {
  const location = useLocation();
  // We can read defaultTicker, defaultDirection from location.state if we want
  const defaultTicker = location.state?.defaultTicker || '';
  const defaultDirection = location.state?.defaultDirection || '';

  const [ticker, setTicker] = useState(defaultTicker);
  const [quantity, setQuantity] = useState(1);

  const [quote, setQuote] = useState(null); // { c, stock_ticker, stock_name, ... }
  const [funds, setFunds] = useState(null);
  const [portfolio, setPortfolio] = useState([]);

  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    // load user funds & portfolio on mount
    (async () => {
      try {
        setLoadingData(true);
        const [fData, pData] = await Promise.all([getUserFunds(), getUserPortfolio()]);
        setFunds(fData);
        setPortfolio(pData);
      } catch (err) {
        console.error(err);
        setSnackbarMsg('Failed to load user data');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
      } finally {
        setLoadingData(false);
      }
    })();
  }, []);

  // fetch quote whenever ticker changes
  useEffect(() => {
    if (!ticker) {
      setQuote(null);
      return;
    }
    (async () => {
      try {
        setLoadingQuote(true);
        const data = await getStockQuote(ticker);
        setQuote(data);
      } catch (err) {
        console.error(err);
        setSnackbarMsg('Could not fetch quote');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
        setQuote(null);
      } finally {
        setLoadingQuote(false);
      }
    })();
  }, [ticker]);

  const handleCloseSnackbar = () => setShowSnackbar(false);

  // find if we have a position in the typed ticker
  const existingPosition = portfolio.find(
    (pos) => pos.stock_ticker?.toUpperCase() === ticker.toUpperCase()
  );
  const isLong = existingPosition?.quantity > 0;
  const positionLabel = isLong ? 'LONG' : 'SHORT';

  // handle trade
  const handleTrade = async (direction) => {
    if (!ticker || !quantity) return;
    try {
      const response = await placeStockTransaction({ ticker, direction, quantity });
      // Check success
      if (response.success === false) {
        // show error
        setSnackbarMsg(response.message || 'Transaction failed');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
      } else {
        // success
        setSnackbarMsg(
          `Success! ${direction} ${quantity} of ${response.stockTicker} @ ${response.executionPrice.toFixed(
            2
          )}`
        );
        setSnackbarSeverity('success');
        setShowSnackbar(true);
        // refresh portfolio & funds
        const [fData, pData] = await Promise.all([getUserFunds(), getUserPortfolio()]);
        setFunds(fData);
        setPortfolio(pData);
      }
    } catch (err) {
      console.error(err);
      setSnackbarMsg(err.response?.data?.message || 'Trade API call failed');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    }
  };

  return (
    <Container sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Trade
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
          {/* Ticker input */}
          <TextField
            label="Ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
          />

          {/* Stock name + Current Price */}
          {loadingQuote ? (
            <CircularProgress size={24} />
          ) : quote ? (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {quote.stock_name} ({quote.stock_ticker})
              </Typography>
              <Typography variant="body2">
                Current Price: {quote.c ? `$${quote.c.toFixed(2)}` : 'N/A'}
              </Typography>
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Enter ticker to see price & name
            </Typography>
          )}

          {/* Available Funds */}
          {loadingData ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="body2" fontWeight="bold">
              Available Funds: {funds?.cash ? `$${funds.cash.toFixed(2)}` : 'N/A'}
            </Typography>
          )}

          {/* Existing position */}
          {existingPosition ? (
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              You have {Math.abs(existingPosition.quantity)} shares,{' '}
              {positionLabel} @ ${existingPosition.execution_price.toFixed(2)}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: 'gray' }}>
              No current position in {ticker || 'this ticker'}
            </Typography>
          )}

          {/* Quantity input */}
          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            sx={{ width: 120 }}
          />

          {/* BUY / SELL buttons */}
          <Box>
            <BuyButton onClick={() => handleTrade('BUY')}>BUY</BuyButton>
            <SellButton onClick={() => handleTrade('SELL')}>SELL</SellButton>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for feedback */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbarSeverity} onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default TradePage;
