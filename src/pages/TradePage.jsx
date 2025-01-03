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
  Slide,
  Skeleton,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useUniverse } from '../context/UniverseContext';

import { getUserDashboard } from '../api/userApi';
import { getStockQuote, placeStockTransaction } from '../api/stockApi';
import { getTransactionValue } from '../api/transactionApi';

function TradePage() {
  const location = useLocation();
  
  const { universeData, isLoading, error, fetchUniverseData } = useUniverse();

  // Possibly a default ticker from the StockDetail "Trade" button
  const defaultTicker = location.state?.defaultTicker || '';

  // Ticker input
  const [tickerInput, setTickerInput] = useState(defaultTicker);
  // The "final" chosen ticker (only after user selects from suggestions or presses Enter)
  const [selectedTicker, setSelectedTicker] = useState(defaultTicker);

  // Universe data for suggestions
  const [universe, setUniverse] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Data from server
  const [funds, setFunds] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [quote, setQuote] = useState(null);
  const [transactionValue, setTransactionValue] = useState(null);

  // Loading states
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingValue, setLoadingValue] = useState(false);

  // Track if trade in progress
  const [tradeInProgress, setTradeInProgress] = useState(false); 

  // Animations
  const [showPage, setShowPage] = useState(false);
  const [showQuote, setShowQuote] = useState(false);

  // Trade form
  const [quantity, setQuantity] = useState('');

  // Snackbar
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    // 1) load user data
    (async () => {
      try {
        setLoadingUserData(true);
        const [dData] = await Promise.all([
          getUserDashboard(),
        ]);
        setFunds(dData.funds);
        setPortfolio(dData.portfolio);
        if (!universeData){
          await fetchUniverseData();
        } else{
          setUniverse(universeData);
        }
      } catch (err) {
        showError('Failed to load data/universe');
      } finally {
        setLoadingUserData(false);
        setShowPage(true); // once data is loaded, show the page
      }
    })();
  }, []);

  useEffect(() => {
    if (universeData) {
      setUniverse(universeData);
    }
  }, [universeData]);

  // Once user picks a final ticker, fetch the quote. We do NOT fetch quote while typing.
  useEffect(() => {
    if (!selectedTicker) {
      // reset quote & transaction
      setQuote(null);
      setTransactionValue(null);
      return;
    }
    fetchQuote(selectedTicker);
  }, [selectedTicker]);

  // After we have a quote and user changes quantity, fetch transactionValue
  useEffect(() => {
    if (quote?.c && quantity > 0 && selectedTicker) {
      fetchTransactionValue();
    } else {
      setTransactionValue(null);
    }
    // eslint-disable-next-line
  }, [quote, quantity]);

  const fetchQuote = async (sym) => {
    try {
      setLoadingQuote(true);
      setShowQuote(false);
      const q = await getStockQuote(sym);
      setQuote(q);
      // after retrieving, slight delay, then show
      setTimeout(() => setShowQuote(true), 200);
    } catch (err) {
      showError('Could not fetch quote');
      setQuote(null);
    } finally {
      setLoadingQuote(false);
    }
  };

  const fetchTransactionValue = async () => {
    if (!selectedTicker) return;
    try {
      setLoadingValue(true);
      const tv = await getTransactionValue({
        ticker: selectedTicker,
        quantity,
        current_price: quote.c,
      });
      setTransactionValue(tv);
    } catch (err) {
      showError('Could not fetch transaction value');
      setTransactionValue(null);
    } finally {
      setLoadingValue(false);
    }
  };

  const handleTrade = async (direction) => {
    if (!selectedTicker || !quantity || tradeInProgress) return;

    setTradeInProgress(true);

    try {
      const response = await placeStockTransaction({
        ticker: selectedTicker,
        direction,
        quantity,
      });
      if (!response.success) {
        showError(response.message || 'Transaction failed');
      } else {
        setSnackbarMsg(
          `Success! ${direction} ${quantity} of ${response.stockTicker} @ $${response.executionPrice.toFixed(2)}`
        );
        setSnackbarSeverity('success');
        setShowSnackbar(true);

        // refresh user data
        const [dData] = await Promise.all([getUserDashboard()]);
        setFunds(dData.funds);
        setPortfolio(dData.portfolio);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Trade failed');
    } finally {
      setTradeInProgress(false); 
    }
  };

  const showError = (msg) => {
    setSnackbarMsg(msg);
    setSnackbarSeverity('error');
    setShowSnackbar(true);
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  // Filter suggestions in memory (top 10)
  const handleTickerInputChange = (e) => {
    const input = e.target.value.toUpperCase();
    setTickerInput(input);

    // hide suggestions if empty
    if (!input) {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
      return;
    }
    // Filter in memory
    const filtered = universe.filter((item) =>
      item.stock_ticker.toUpperCase().includes(input)
    );
    if (filtered.length > 0) {
      setFilteredSuggestions(filtered.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // If user presses Enter in the textfield
  const handleTickerKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // We pick the first matching suggestion if any EXACT match
      const exact = filteredSuggestions.find(
        (item) => item.stock_ticker.toUpperCase() === tickerInput
      );
      if (exact) {
        // user typed exactly a ticker from universe
        handleSelectSuggestion(exact.stock_ticker);
      } else if (filteredSuggestions.length > 0) {
        // or pick the first suggestion if partial
        handleSelectSuggestion(filteredSuggestions[0].stock_ticker);
      } else {
        // user typed something not in the list. We can either set or do nothing
        setSelectedTicker(tickerInput); 
      }
    }
  };

  // On user clicks a suggestion
  const handleSelectSuggestion = (tickerSym) => {
    setTickerInput(tickerSym.toUpperCase());
    setSelectedTicker(tickerSym.toUpperCase());
    setShowSuggestions(false);
  };

  // find existing position
  const existingPosition = portfolio.find(
    (pos) => pos.stock_ticker?.toUpperCase() === selectedTicker.toUpperCase()
  );
  const positionLabel = existingPosition
    ? existingPosition.direction === 'BUY'
      ? 'LONG'
      : 'SHORT'
    : '';

  const buyDisabled = !transactionValue?.buy_trade_possible;
  const sellDisabled = !transactionValue?.sell_trade_possible;

  return (
    <Slide direction="up" in={showPage} mountOnEnter unmountOnExit>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backgroundColor: 'white',
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
            Trade
          </Typography>

          <Grid container spacing={3}>
            {/* Left side: Ticker & Quote */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Enter Ticker"
                  variant="outlined"
                  value={tickerInput}
                  onChange={handleTickerInputChange}
                  onKeyDown={handleTickerKeyDown}
                  sx={{ mb: 2 }}
                />
                {/* Suggestions panel */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <Paper
                    sx={{
                      position: 'absolute',
                      top: '72px',
                      width: '100%',
                      maxHeight: 200,
                      overflowY: 'auto',
                      zIndex: 999,
                    }}
                  >
                    <List>
                      {filteredSuggestions.map((item, idx) => (
                        <ListItemButton
                          key={idx}
                          onClick={() => handleSelectSuggestion(item.stock_ticker)}
                        >
                          <ListItemText
                            primary={`${item.stock_ticker} - ${item.stock_name}`}
                            secondary={item.asset_type}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>

              {/* Show quote */}
              {loadingQuote ? (
                <Skeleton variant="rectangular" width="100%" height={60} />
              ) : quote ? (
                <Grow in={showQuote}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ color: 'primary.main', fontWeight: 'bold' }}
                    >
                      {quote.stock_name} ({quote.stock_ticker})
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Current Price: ${quote.c?.toFixed(2)}
                    </Typography>
                  </Box>
                </Grow>
              ) : (
                selectedTicker && (
                  <Typography variant="caption" color="text.secondary">
                    No quote available.
                  </Typography>
                )
              )}

              {/* Existing position if any */}
              {existingPosition && (
                <Box mt={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Current Position:
                  </Typography>
                  <Typography>
                    {existingPosition.quantity} shares ({positionLabel}) @ $
                    {existingPosition.execution_price?.toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Right side: Funds, transactionValue */}
            <Grid item xs={12} md={6}>
              {loadingUserData ? (
                <Skeleton variant="text" width={150} />
              ) : (
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Available Funds: ${funds?.cash?.toFixed(2) || '0.00'}
                </Typography>
              )}

              <TextField
                fullWidth
                type="text"
                label="Quantity"
                variant="outlined"
                value={quantity}
                onChange={(e) => {
                  let value = e.target.value;

                  // Allow only numbers and a single decimal point
                  value = value.replace(/[^0-9.]/g, '');

                  // Ensure only one decimal point exists
                  if (value.split('.').length > 2) {
                    value = value.substring(0, value.lastIndexOf('.'));
                  }

                  // Remove leading zeros (but preserve single zero before decimal point)
                  if (value !== '' && !value.startsWith('0.') && value !== '0') {
                    value = value.replace(/^0+/, '');
                  }

                  setQuantity(value);
                }}
                sx={{ my: 2 }}
                disabled={!selectedTicker} // can't change quantity if no ticker
                inputProps={{
                  inputMode: 'decimal', // Ensure mobile users get a decimal keypad
                  pattern: '[0-9.]*',   // Ensure only numbers and decimal point are allowed
                }}
              />


              {loadingValue ? (
                <Skeleton variant="rectangular" width="100%" height={60} />
              ) : transactionValue ? (
                <Box sx={{ p: 2, backgroundColor: '#f3f4f6', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Transaction Fee:</strong>{' '}
                    ${transactionValue.transaction_fee?.toFixed(2) ?? '0.00'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Required Funds (BUY):</strong>{' '}
                    ${transactionValue.required_funds_buy?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Required Funds (SELL):</strong>{' '}
                    ${transactionValue.required_funds_sell?.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Select ticker & enter quantity to see trade values.
                </Typography>
              )}
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Action Buttons */}
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              color="success"
              sx={{ mr: 2, width: 120 }}
              disabled={buyDisabled || tradeInProgress}
              onClick={() => handleTrade('BUY')}
            >
              BUY
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ width: 120 }}
              disabled={sellDisabled || tradeInProgress}
              onClick={() => handleTrade('SELL')}
            >
              SELL
            </Button>
          </Box>
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={4000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </Container>
    </Slide>
  );
}

export default TradePage;
