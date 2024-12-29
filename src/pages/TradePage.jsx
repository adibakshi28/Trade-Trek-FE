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
  Grid,
  Grow,
  Fade,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/system';
import { useLocation } from 'react-router-dom';

import { getStockQuote, placeStockTransaction } from '../api/stockApi';
import { getUserPortfolio, getUserFunds } from '../api/userApi';
import { getTransactionValue } from '../api/transactionApi';

const BigBuyButton = styled('button')({
  backgroundColor: '#2e7d32',
  color: '#fff',
  fontSize: '1rem',
  padding: '12px 24px',
  marginRight: '16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: '#1b5e20',
  },
  '&:disabled': {
    backgroundColor: '#ccc',
    cursor: 'default',
  },
});

const BigSellButton = styled('button')({
  backgroundColor: '#c62828',
  color: '#fff',
  fontSize: '1rem',
  padding: '12px 24px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: '#b71c1c',
  },
  '&:disabled': {
    backgroundColor: '#ccc',
    cursor: 'default',
  },
});

function TradePage() {
  const location = useLocation();
  const defaultTicker = location.state?.defaultTicker || '';

  const [ticker, setTicker] = useState(defaultTicker);
  const [quantity, setQuantity] = useState(1);

  const [quote, setQuote] = useState(null);  
  const [funds, setFunds] = useState(null);  
  const [portfolio, setPortfolio] = useState([]);

  // from /stock/transaction/value
  const [transactionValue, setTransactionValue] = useState(null);

  // loading states
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingValue, setLoadingValue] = useState(false);

  // animations
  const [showPage, setShowPage] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  // snackbar
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingUserData(true);
        const [fData, pData] = await Promise.all([
          getUserFunds(),
          getUserPortfolio(),
        ]);
        setFunds(fData);
        setPortfolio(pData);
      } catch (err) {
        console.error(err);
        showError('Failed to load user data');
      } finally {
        setLoadingUserData(false);
        setShowPage(true);
      }
    })();
  }, []);

  // fetch quote
  useEffect(() => {
    if (!ticker) {
      setQuote(null);
      setTransactionValue(null);
      return;
    }
    (async () => {
      try {
        setLoadingQuote(true);
        setShowQuote(false);
        const q = await getStockQuote(ticker);
        setQuote(q);
        // small delay, then show the fade/grow
        setTimeout(() => setShowQuote(true), 200);
      } catch (err) {
        console.error(err);
        showError('Could not fetch quote');
        setQuote(null);
      } finally {
        setLoadingQuote(false);
      }
    })();
  }, [ticker]);

  // fetch transactionValue
  useEffect(() => {
    if (!ticker || !quote?.c || !quantity) {
      setTransactionValue(null);
      return;
    }
    fetchTransactionValue();
    // eslint-disable-next-line
  }, [quantity, quote]);

  const fetchTransactionValue = async () => {
    try {
      setLoadingValue(true);
      const val = await getTransactionValue({
        ticker,
        quantity,
        current_price: quote.c,
      });
      setTransactionValue(val);
    } catch (err) {
      console.error(err);
      showError('Could not fetch transaction value');
      setTransactionValue(null);
    } finally {
      setLoadingValue(false);
    }
  };

  const handleTrade = async (direction) => {
    if (!ticker || !quantity) return;
    try {
      const response = await placeStockTransaction({ ticker, direction, quantity });
      if (response.success === false) {
        setSnackbarMsg(response.message || 'Transaction failed');
        setSnackbarSeverity('error');
        setShowSnackbar(true);
      } else {
        setSnackbarMsg(
          `Success! ${direction} ${quantity} of ${response.stockTicker} @ $${response.executionPrice.toFixed(2)}`
        );
        setSnackbarSeverity('success');
        setShowSnackbar(true);
        // refresh user data
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

  const showError = (msg) => {
    setSnackbarMsg(msg);
    setSnackbarSeverity('error');
    setShowSnackbar(true);
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  // check position
  const existingPosition = portfolio.find(
    (pos) => pos.stock_ticker?.toUpperCase() === ticker.toUpperCase()
  );
  const positionLabel = existingPosition
    ? existingPosition.direction === 'BUY'
      ? 'LONG'
      : 'SHORT'
    : '';

  const buyDisabled = !transactionValue?.buy_trade_possible;
  const sellDisabled = !transactionValue?.sell_trade_possible;

  return (
    <Fade in={showPage} timeout={500}>
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, margin: '0 auto', maxWidth: 600 }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Trade
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {/* Ticker input */}
              <TextField
                label="Ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                sx={{ width: 150, mb: 2 }}
              />

              {/* Show quote or skeleton */}
              {loadingQuote ? (
                // Instead of a spinner, use a skeleton
                <Skeleton variant="rectangular" width={200} height={50} />
              ) : quote && (
                <Grow in={showQuote} timeout={500}>
                  <Box>
                    <Typography variant="body1" fontWeight="bold" sx={{ color: 'primary.main' }}>
                      {quote.stock_name} ({quote.stock_ticker})
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Current Price: ${quote.c?.toFixed(2)}
                    </Typography>
                  </Box>
                </Grow>
              )}

              {/* Existing position */}
              {existingPosition ? (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  You have {existingPosition.quantity} shares: {positionLabel} @ $
                  {existingPosition.execution_price.toFixed(2)}
                </Typography>
              ) : (
                ticker && (
                  <Typography variant="body2" color="text.secondary">
                    No current position in {ticker}
                  </Typography>
                )
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* Funds or skeleton */}
              {loadingUserData ? (
                <Skeleton variant="rectangular" width={150} height={20} />
              ) : funds && (
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                  Available Funds: ${funds.cash?.toFixed(2)}
                </Typography>
              )}

              {/* Quantity */}
              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                sx={{ width: 100, mb: 2 }}
              />

              {/* Transaction Value Info (with skeleton) */}
              {loadingValue ? (
                <Skeleton variant="rectangular" width="80%" height={40} />
              ) : transactionValue ? (
                <Box
                  sx={{
                    backgroundColor: '#f8f9fa',
                    p: 2,
                    borderRadius: 1,
                    transition: 'background-color 0.3s',
                    '&:hover': { backgroundColor: '#f1f3f5' },
                  }}
                >
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Transaction Fee: $
                    {transactionValue.transaction_fee?.toFixed(2) ?? '0.00'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Required Funds (BUY): $
                    {transactionValue.required_funds_buy?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2">
                    Required Funds (SELL): $
                    {transactionValue.required_funds_sell?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Enter quantity to see required funds
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* Buttons */}
          <Box sx={{ mt: 3 }}>
            <BigBuyButton disabled={buyDisabled} onClick={() => handleTrade('BUY')}>
              BUY
            </BigBuyButton>
            <BigSellButton disabled={sellDisabled} onClick={() => handleTrade('SELL')}>
              SELL
            </BigSellButton>
          </Box>
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Container>
    </Fade>
  );
}

export default TradePage;
