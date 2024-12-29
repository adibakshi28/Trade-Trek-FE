// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Box,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

import { getUserDashboard } from '../api/userApi';
import { createRealtimeSocket } from '../api/websocketClient';

const RowContainer = styled(Box)(({ flashColor }) => ({
  transition: 'background-color 0.5s ease',
  backgroundColor: flashColor || 'transparent',
  marginBottom: '16px',
  paddingBottom: '8px',
  borderBottom: '1px solid #ccc',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: '#f9f9f9',
  },
}));

const HighlightCard = styled(Card)(({ flashColor }) => ({
  transition: 'background-color 0.5s ease',
  backgroundColor: flashColor || 'transparent',
}));

const TradeButton = styled(Button)({
  backgroundColor: '#1976d2',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
});

function Dashboard() {
  const navigate = useNavigate();

  const [funds, setFunds] = useState(null);
  const [portfolio, setPortfolio] = useState([]);

  // Real-time LTP dictionary
  const [prices, setPrices] = useState({});
  const [prevPrices, setPrevPrices] = useState({});
  // For row-level highlight color
  const [rowFlashColors, setRowFlashColors] = useState({});

  // Real-time Portfolio Value + highlight
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioValueFlash, setPortfolioValueFlash] = useState('transparent');
  const [prevPortfolioValue, setPrevPortfolioValue] = useState(0);

  // Net UnRealized P/L
  const [netUnrealizedPL, setNetUnrealizedPL] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const wsRef = useRef(null);

  // 1) On mount: fetch dashboard + connect once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const dashData = await getUserDashboard();
        setFunds(dashData.funds);
        setPortfolio(dashData.portfolio);
        setLoading(false);

        // connect WebSocket
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No token found, skipping WebSocket');
          return;
        }
        const ws = createRealtimeSocket(token);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
        };

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data); // e.g. [ {stock_ticker, ltp}, ...]
            if (Array.isArray(data)) {
              handlePriceUpdates(data);
            }
          } catch (err) {
            console.error('Error parsing WS message', err);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket closed');
        };

        ws.onerror = (err) => {
          console.error('WebSocket error', err);
        };
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
        setShowSnackbar(true);
        setLoading(false);
      }
    })();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 2) Whenever portfolio or prices changes => recalc portfolio value & P/L
  // This ensures we always have the latest portfolio from state plus the latest prices
  useEffect(() => {
    if (!portfolio || portfolio.length === 0) {
      // no positions => 0
      setPortfolioValue(0);
      setNetUnrealizedPL(0);
      return;
    }
    recalcPortfolioValueAndPL(prices);
    // eslint-disable-next-line
  }, [portfolio, prices]);

  // 3) handle new LTP from the WS
  const handlePriceUpdates = (priceArray) => {
    setPrices((oldPrices) => {
      const newPrices = { ...oldPrices };
      const updatedPrev = { ...prevPrices };

      priceArray.forEach(({ stock_ticker, ltp }) => {
        const sym = stock_ticker.toUpperCase();
        const oldPrice = oldPrices[sym] || 0;
        updatedPrev[sym] = oldPrice;
        newPrices[sym] = ltp;

        // highlight the row
        let rowColor = 'transparent';
        if (ltp > oldPrice) rowColor = 'rgba(0,255,0,0.2)';
        else if (ltp < oldPrice) rowColor = 'rgba(255,0,0,0.2)';
        flashRowColor(sym, rowColor);
      });

      setPrevPrices(updatedPrev);
      return newPrices;
    });
  };

  // 4) flash row color for half sec
  const flashRowColor = (sym, color) => {
    if (color === 'transparent') return;
    setRowFlashColors((old) => ({
      ...old,
      [sym]: color,
    }));
    setTimeout(() => {
      setRowFlashColors((old) => ({
        ...old,
        [sym]: 'transparent',
      }));
    }, 500);
  };

  // 5) Recalc + highlight the top portfolio card
  const recalcPortfolioValueAndPL = (latestPrices) => {
    let newVal = 0;
    let newPL = 0;
    portfolio.forEach((pos) => {
      const sym = pos.stock_ticker.toUpperCase();
      const ltp = latestPrices[sym] || 0;

      // Portfolio value ignoring direction
      newVal += ltp * pos.quantity;

      // net P/L
      if (pos.direction === 'BUY') {
        newPL += (ltp - pos.execution_price) * pos.quantity;
      } else {
        newPL += (pos.execution_price - ltp) * pos.quantity;
      }
    });

    // highlight top if changed
    highlightPortfolioValue(newVal);
    setPortfolioValue(newVal);
    setNetUnrealizedPL(newPL);
  };

  // highlight the entire portfolio value card
  const highlightPortfolioValue = (newVal) => {
    const oldVal = portfolioValue;
    let color = 'transparent';
    if (newVal > oldVal) color = 'rgba(0,255,0,0.2)';
    else if (newVal < oldVal) color = 'rgba(255,0,0,0.2)';

    setPortfolioValueFlash(color);
    setTimeout(() => setPortfolioValueFlash('transparent'), 500);
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  const handleTrade = (ticker) => {
    navigate('/dashboard/trade', { state: { defaultTicker: ticker.toUpperCase() } });
  };

  if (loading) {
    return <CircularProgress sx={{ m: 2 }} />;
  }

  if (!funds || !portfolio) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="error">No data found</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Top row: funds, real-time portfolio value, net P/L */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Available Funds
            </Typography>
            <Typography variant="h5">
              $
              {funds.cash?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2,
              // transition: 'background-color 0.5s ease',
              // backgroundColor: portfolioValueFlash,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Portfolio Value (Realtime)
            </Typography>
            <Typography variant="h5">
              $
              {portfolioValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
        <Paper
            sx={{
              p: 2,
              transition: 'background-color 0.5s ease',
              backgroundColor: portfolioValueFlash,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Net Unrealized P/L
            </Typography>
            <Typography variant="h5">
              $
              {netUnrealizedPL.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Portfolio list */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Portfolio Positions
        </Typography>
        <Paper sx={{ p: 2 }}>
          {portfolio.length === 0 ? (
            <Typography>No positions found.</Typography>
          ) : (
            portfolio.map((pos) => {
              const sym = pos.stock_ticker.toUpperCase();
              const ltp = prices[sym] || 0;
              const rowColor = rowFlashColors[sym] || 'transparent';
              const posVal = ltp * pos.quantity;
              const directionLabel = pos.direction === 'BUY' ? 'LONG' : 'SHORT';

              return (
                <Box
                  key={pos.id}
                  sx={{
                    mb: 2,
                    pb: 1,
                    borderBottom: '1px solid #ccc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.5s ease',
                    backgroundColor: rowColor,
                  }}
                >
                  {/* left side */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {pos.stock_ticker} ({directionLabel})
                    </Typography>
                    <Typography variant="caption">{pos.stock_name}</Typography>
                  </Box>

                  {/* middle: quantity + real-time price + value */}
                  <Box sx={{ textAlign: 'right', flex: 1, mx: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Qty: {pos.quantity} @ ${pos.execution_price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'gray' }}>
                      Current: <strong>${ltp.toFixed(2)}</strong> | Value:{' '}
                      <strong>${posVal.toFixed(2)}</strong>
                    </Typography>
                  </Box>

                  {/* trade button */}
                  <Box>
                    <TradeButton
                      size="small"
                      onClick={() => handleTrade(pos.stock_ticker)}
                    >
                      TRADE
                    </TradeButton>
                  </Box>
                </Box>
              );
            })
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default Dashboard;
