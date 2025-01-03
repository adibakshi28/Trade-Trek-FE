// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Paper,
  Typography,
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
import { styled, keyframes } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { getUserDashboard } from '../api/userApi';
import { createRealtimeSocket } from '../api/websocketClient';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// ------------------------------------
// STYLED COMPONENTS
// ------------------------------------

// Header Bar
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

// Stats Bar Container
const StatsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
}));

// Individual Stat Card
const StatCard = styled(Paper)(({ theme }) => ({
  flex: '1 1 auto',
  minWidth: 220,
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: '#f5f5f5',
}));

// Table Row Highlight
const RowHighlight = styled(TableRow)(({ flashColor }) => ({
  transition: 'background-color 0.5s ease',
  backgroundColor: flashColor || 'transparent',
}));

// Trade Button with Hover Animation
const TradeButton = styled(Button)({
  background: '#1976d2',
  color: '#fff',
  padding: '10px 24px',
  transition: '0.25s',
  '&:hover': {
    background: '#1565c0',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px #1976d240',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});

// Keyframes for Arrow Animations
const moveUpFade = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0) scale(1.3);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0.7);
  }
`;

const moveDownFade = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0) scale(1.3);
  }
  100% {
    opacity: 0;
    transform: translateY(30px) scale(0.7);
  }
`;

// Styled Component for Animated Arrows
const AnimatedArrow = styled('div')(({ direction }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  animation: `${direction === 'up' ? moveUpFade : moveDownFade} 2s forwards`,
  // Adjust positioning to prevent layout shifts
  position: 'absolute',
  right: '75px',
}));

function Dashboard() {
  const navigate = useNavigate();

  const [funds, setFunds] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState({});
  const [prevPrices, setPrevPrices] = useState({});
  const [rowFlashColors, setRowFlashColors] = useState({});

  const [portfolioValue, setPortfolioValue] = useState(0);
  const [netUnrealizedPL, setNetUnrealizedPL] = useState(0);
  const [netUnrealizedPLPrev, setNetUnrealizedPLPrev] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [wbMsgReceived, setWbMsgReceived] = useState(0);

  const wsRef = useRef(null);
  const initialPricesLoaded = useRef(false); // To track initial price load

  // Fetch user data and set up WebSocket on mount
  useEffect(() => {
    (async () => {
      try {
        const dashData = await getUserDashboard();
        setFunds(dashData.funds);
        setPortfolio(dashData.portfolio);

        // Initialize portfolio value and net P/L with initial prices if available
        recalcPortfolioAndPL(dashData.portfolio, dashData.prices || {});

        // Setup WebSocket
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('No token found, skipping WebSocket');
          setLoading(false);
          return;
        }
        const ws = createRealtimeSocket(token);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
        };

        ws.onmessage = (evt) => {
          setWbMsgReceived((prev) => {
            const newCount = prev + 1;

            if (loading && newCount > 1) {
              setLoading(false);
            }

            return newCount;
          });

          try {
            const data = JSON.parse(evt.data); // e.g., [ { stock_ticker, ltp }, ...]
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
    // eslint-disable-next-line
  }, []);

  // Recompute portfolio value & net P/L whenever portfolio or prices change
  useEffect(() => {
    if (!portfolio || portfolio.length === 0) {
      setPortfolioValue(0);
      setNetUnrealizedPL(0);
      return;
    }
    recalcPortfolioAndPL(portfolio, prices);
    // eslint-disable-next-line
  }, [portfolio, prices]);

  // Handle incoming price updates
  const handlePriceUpdates = (priceArray) => {
    setPrices((oldPrices) => {
      const newPrices = { ...oldPrices };
      const updatedPrev = { ...prevPrices };

      priceArray.forEach(({ stock_ticker, ltp }) => {
        const sym = stock_ticker.toUpperCase();
        const oldPrice = Number(oldPrices[sym]).toFixed(2) || 0;

        if (initialPricesLoaded.current) {
          updatedPrev[sym] = oldPrices[sym];
        }

        newPrices[sym] = Number(ltp).toFixed(2);

        let rowColor = 'transparent';
        if (ltp > oldPrice) rowColor = 'rgba(0,255,0,0.2)';
        else if (ltp < oldPrice) rowColor = 'rgba(255,0,0,0.2)';
        flashRowColor(sym, rowColor);
      });

      // After handling the first batch of prices, set initialPricesLoaded to true
      if (!initialPricesLoaded.current) {
        initialPricesLoaded.current = true;
        // For the first set of prices, prevent delta calculation
        setPrevPrices(newPrices);
      } else {
        setPrevPrices(updatedPrev);
      }

      return newPrices;
    });
  };

  // Flash row background color on price change
  const flashRowColor = (sym, color) => {
    if (color === 'transparent') return;
    setRowFlashColors((prev) => ({ ...prev, [sym]: color }));
    setTimeout(() => {
      setRowFlashColors((prev) => ({ ...prev, [sym]: 'transparent' }));
    }, 500);
  };

  // Recompute portfolio value and net P/L
  const recalcPortfolioAndPL = (currentPortfolio, currentPrices) => {
    let newVal = 0;
    let newPL = 0;

    currentPortfolio.forEach((pos) => {
      const sym = pos.stock_ticker.toUpperCase();
      const ltp = Number(currentPrices[sym]) || 0;

      // Sum for portfolio ignoring direction
      newVal += ltp * pos.quantity;

      // Net P/L
      if (pos.direction === 'BUY') {
        newPL += (ltp - pos.execution_price) * pos.quantity;
      } else {
        // SELL => (execPrice - ltp) * qty
        newPL += (pos.execution_price - ltp) * pos.quantity;
      }
    });

    // Update Net Unrealized P/L with previous value for animation
    setNetUnrealizedPLPrev(netUnrealizedPL);
    setNetUnrealizedPL(newPL);

    // Update Portfolio Value
    setPortfolioValue(newVal);
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
        {/* Error Snackbar */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity="error"
            onClose={handleCloseSnackbar}
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>

        {/* Top Stats Bar */}
        <StatsBar>
          {/* Available Funds */}
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
          <StatCard>
            <Typography variant="subtitle1" fontWeight="bold">
              Portfolio Value (Realtime)
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              $
              {portfolioValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </StatCard>

          {/* Net Unrealized P/L */}
          <StatCard>
            <Typography variant="subtitle1" fontWeight="bold">
              Net Unrealized P/L
            </Typography>
            <Typography
              variant="h5"
              sx={{ 
                color: netUnrealizedPL >= 0 ? 'green' : 'red',
                fontWeight: 'bold',
              }}
            >
              <CountUp
                start={netUnrealizedPLPrev}
                end={netUnrealizedPL}
                duration={2}
                separator=","
                prefix={netUnrealizedPL >= 0 ? '+' : ''}
                decimals={2}
                decimal="."
              />
            </Typography>
          </StatCard>
        </StatsBar>

        {/* Portfolio Positions Table */}
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
                    const ltp = prices[sym] ? Number(prices[sym]) : 0;
                    const rowColor = rowFlashColors[sym] || 'transparent';
                    const posVal = ltp * pos.quantity;
                    const directionLabel = pos.direction === 'BUY' ? 'LONG' : 'SHORT';

                    // Calculate price change
                    const prevPrice = prevPrices[sym] ? Number(prevPrices[sym]) : 0;
                    const priceChange = ltp - prevPrice;
                    const priceChangeType = priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : null;

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
                        <TableCell sx={{ fontSize: '0.95rem' }}>
                          ${pos.execution_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.95rem', fontWeight: 'bold', position: 'relative', paddingRight: '40px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                            <Typography>
                              ${ltp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Typography>
                            {/* Animated Arrow */}
                            {priceChangeType && (
                              <AnimatedArrow direction={priceChangeType}>
                                {priceChangeType === 'up' ? (
                                  <TrendingUpIcon sx={{ color: 'green', fontSize: '1.2rem' }} />
                                ) : (
                                  <TrendingDownIcon sx={{ color: 'red', fontSize: '1.2rem' }} />
                                )}
                              </AnimatedArrow>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                          ${posVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
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
