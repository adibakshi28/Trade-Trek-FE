// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Snackbar,
  Alert,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

import { getUserDashboard } from '../api/userApi';
import { createRealtimeSocket } from '../api/websocketClient';

// ------------------------------------
// STYLED COMPONENTS
// ------------------------------------

// Side “header” or “app bar” 
const HeaderBar = styled('div')(({ theme }) => ({
  background: '#1565C0',
  color: '#fff',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  borderRadius: '4px',
}));


// Parent container for “stats bar”
const StatsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
}));

// Individual “stat card” in top bar
const StatCard = styled(Paper)(({ theme }) => ({
  flex: '1 1 auto',
  minWidth: 220,
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: '#f5f5f5',
}));

// For row-level highlight color
const RowHighlight = styled(TableRow)(({ flashColor }) => ({
  transition: 'background-color 0.5s ease',
  backgroundColor: flashColor || 'transparent',
}));

// Trade button with a small scale animation on hover
const TradeButton = styled(Button)({
  background: '#1976d2',
  color: '#fff',
  position: 'relative',
  padding: '10px 24px',
  transition: '0.25s',
  '&:hover': {
    background: '#1565c0',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px #1976d240',
    '&:after': {
      opacity: 1,
      transform: 'scale(1.5)',
    }
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle, #ffffff33 10%, transparent 70%)',
    opacity: 0,
    transform: 'scale(0.5)',
    transition: '0.2s',
  }
});

function Dashboard() {
  const navigate = useNavigate();

  const [funds, setFunds] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState({});
  const [prevPrices, setPrevPrices] = useState({});
  const [rowFlashColors, setRowFlashColors] = useState({});

  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioValueFlash, setPortfolioValueFlash] = useState('transparent');
  const [netUnrealizedPL, setNetUnrealizedPL] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const wsRef = useRef(null);

  // On mount: fetch user data + connect WebSocket once
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const dashData = await getUserDashboard();
        setFunds(dashData.funds);
        setPortfolio(dashData.portfolio);
        setLoading(false);

        // WebSocket
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
            const data = JSON.parse(evt.data); // e.g. [ { stock_ticker, ltp }, ...]
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

  // Recalc portfolio value & net P/L whenever portfolio changes or prices change
  useEffect(() => {
    if (!portfolio || portfolio.length === 0) {
      setPortfolioValue(0);
      setNetUnrealizedPL(0);
      return;
    }
    recalcPortfolioAndPL(prices);
    // eslint-disable-next-line
  }, [portfolio, prices]);

  // Handle new prices
  const handlePriceUpdates = (priceArray) => {
    setPrices((oldPrices) => {
      const newPrices = { ...oldPrices };
      const updatedPrev = { ...prevPrices };

      priceArray.forEach(({ stock_ticker, ltp }) => {
        const sym = stock_ticker.toUpperCase();
        const oldPrice = oldPrices[sym] || 0;
        updatedPrev[sym] = oldPrice;
        newPrices[sym] = ltp;

        let rowColor = 'transparent';
        if (ltp > oldPrice) rowColor = 'rgba(0,255,0,0.2)';
        else if (ltp < oldPrice) rowColor = 'rgba(255,0,0,0.2)';
        flashRowColor(sym, rowColor);
      });

      setPrevPrices(updatedPrev);
      return newPrices;
    });
  };

  const flashRowColor = (sym, color) => {
    if (color === 'transparent') return;
    setRowFlashColors((prev) => ({ ...prev, [sym]: color }));
    setTimeout(() => {
      setRowFlashColors((prev) => ({ ...prev, [sym]: 'transparent' }));
    }, 500);
  };

  // Recompute portfolio & net P/L
  const recalcPortfolioAndPL = (latestPrices) => {
    let newVal = 0;
    let newPL = 0;

    portfolio.forEach((pos) => {
      const sym = pos.stock_ticker.toUpperCase();
      const ltp = latestPrices[sym] || 0;

      // sum for portfolio ignoring direction
      newVal += ltp * pos.quantity;

      // net P/L
      if (pos.direction === 'BUY') {
        newPL += (ltp - pos.execution_price) * pos.quantity;
      } else {
        // SELL => (execPrice - ltp) * qty
        newPL += (pos.execution_price - ltp) * pos.quantity;
      }
    });

    // highlight portfolio value if changed
    highlightPortfolioValue(portfolioValue, newVal);
    setPortfolioValue(newVal);
    setNetUnrealizedPL(newPL);
  };

  // Compare old vs new portfolioValue => highlight color
  const highlightPortfolioValue = (oldVal, newVal) => {
    if (newVal > oldVal) {
      setPortfolioValueFlash('rgba(0,255,0,0.2)');
      setTimeout(() => setPortfolioValueFlash('transparent'), 500);
    } else if (newVal < oldVal) {
      setPortfolioValueFlash('rgba(255,0,0,0.2)');
      setTimeout(() => setPortfolioValueFlash('transparent'), 500);
    }
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  const handleTrade = (ticker) => {
    navigate('/dashboard/trade', { state: { defaultTicker: ticker.toUpperCase() } });
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, gap: 2, display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="text" width={200} />
        <Skeleton variant="rectangular" width="100%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={60} />
        <Skeleton variant="rectangular" width="80%" height={40} />
      </Box>
    );
  }

  if (!funds || !portfolio) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="error">No data found</Typography>
      </Paper>
    );
  }

  return (
    <>
      <HeaderBar>
        <Typography variant="h5" fontWeight="bold">
          Dashboard
        </Typography>
      </HeaderBar>

      <Box sx={{ p: 2 }}>
        {/* Error snackbar */}
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

        {/* Top stats bar */}
        <StatsBar>
          {/* Funds */}
          <StatCard>
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
          </StatCard>

          {/* Portfolio Value */}
          <StatCard
            sx={{
              backgroundColor: portfolioValueFlash, // highlight when it changes
              transition: 'background-color 0.5s ease',
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
          </StatCard>

          {/* Net Unrealized P/L */}
          <StatCard
            sx={{
              backgroundColor: 'white',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Net Unrealized P/L
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: netUnrealizedPL >= 0 ? 'green' : 'red' }}
            >
              {netUnrealizedPL >= 0 ? '+' : '-'}$
              {Math.abs(netUnrealizedPL).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </StatCard>
        </StatsBar>

        {/* Portfolio positions in a table */}
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Current Portfolio Positions
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.03rem' }}>Symbol</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.03rem' }}>Direction</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.03rem' }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.03rem' }}>Execution Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.03rem' }}>Current Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.03rem' }}>Value</TableCell>
                  <TableCell></TableCell> {/* For the Trade button */}
                </TableRow>
              </TableHead>

              <TableBody>
                {portfolio.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography>No positions found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  portfolio.map((pos) => {
                    const sym = pos.stock_ticker.toUpperCase();
                    const ltp = prices[sym] || 0;
                    const rowColor = rowFlashColors[sym] || 'transparent';
                    const posVal = ltp * pos.quantity;
                    const directionLabel = pos.direction === 'BUY' ? 'LONG' : 'SHORT';

                    return (
                      <RowHighlight key={pos.id} flashColor={rowColor}>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.9rem' }} variant="subtitle2" fontWeight="bold">
                            {pos.stock_ticker}
                          </Typography>
                          <Typography sx={{ fontSize: '0.9rem' }} variant="caption" color="text.secondary">
                            {pos.stock_name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>{directionLabel}</TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>{pos.quantity}</TableCell>
                        <TableCell sx={{ fontSize: '0.95rem' }}>${pos.execution_price.toFixed(2)}</TableCell>
                        <TableCell sx={{ fontSize: '0.95rem', fontWeight: 'bold', }}>${ltp.toFixed(2)}</TableCell>
                        <TableCell sx={{ fontSize: '0.95rem', fontWeight: 'bold', }}>${posVal.toFixed(2)}</TableCell>
                        <TableCell>
                          <TradeButton
                            size="small"
                            onClick={() => handleTrade(pos.stock_ticker)}
                          >
                            TRADE
                          </TradeButton>
                        </TableCell>
                      </RowHighlight>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  );
}

export default Dashboard;
