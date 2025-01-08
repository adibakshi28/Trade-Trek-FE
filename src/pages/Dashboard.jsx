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
// Remove the local WebSocket import
// import { createRealtimeSocket } from '../api/websocketClient';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

// Import the WebSocket context
import { useWebSocket } from '../context/WebSocketContext';

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

// Table Row Highlight with Gradient Transition
const RowHighlight = styled(TableRow)(({ flashColor }) => ({
  transition: 'background 1s ease',
  background: flashColor || 'transparent',
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
    opacity: 0;
    transform: translateY(0) scale(1) rotate(0deg);
    filter: drop-shadow(0 0 0px rgba(0,0,0,0));
  }
  10% {
    opacity: 1;
    transform: translateY(0) scale(1.3) rotate(0deg);
    filter: drop-shadow(0 0 5px rgba(0,0,0,0.3));
  }
  70% {
    opacity: 1;
    transform: translateY(-30px) scale(1.1) rotate(-10deg);
    filter: drop-shadow(0 0 10px rgba(0,0,0,0.3));
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) scale(0.8) rotate(-20deg);
    filter: drop-shadow(0 0 0px rgba(0,0,0,0));
  }
`;

const moveDownFade = keyframes`
  0% {
    opacity: 0;
    transform: translateY(0) scale(1) rotate(0deg);
    filter: drop-shadow(0 0 0px rgba(0,0,0,0));
  }
  10% {
    opacity: 1;
    transform: translateY(0) scale(1.3) rotate(0deg);
    filter: drop-shadow(0 0 5px rgba(0,0,0,0.3));
  }
  70% {
    opacity: 1;
    transform: translateY(30px) scale(1.1) rotate(10deg);
    filter: drop-shadow(0 0 10px rgba(0,0,0,0.3));
  }
  100% {
    opacity: 0;
    transform: translateY(50px) scale(0.8) rotate(20deg);
    filter: drop-shadow(0 0 0px rgba(0,0,0,0));
  }
`;

// Styled Component for Animated Arrows with Enhanced Animations
const AnimatedArrow = styled('div')(({ direction }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  animation: `${direction === 'up' ? moveUpFade : moveDownFade} 2s forwards`,
  // Adjust positioning to prevent layout shifts
  position: 'absolute',
  right: '10px',
  // Ensure arrows are on top
  zIndex: 1,
}));

function Dashboard() {
  const navigate = useNavigate();

  // Access WebSocket context
  const { prices, connectionStatus, error: wsError, sendMessage } = useWebSocket();

  const [funds, setFunds] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [prevPrices, setPrevPrices] = useState({});
  const [rowFlashColors, setRowFlashColors] = useState({});
  const [arrowAnimations, setArrowAnimations] = useState({});

  const [portfolioValue, setPortfolioValue] = useState(0);
  const [netUnrealizedPL, setNetUnrealizedPL] = useState(0);
  const [netUnrealizedPLPrev, setNetUnrealizedPLPrev] = useState(0);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const initialPricesLoaded = useRef(false); // To track initial price load

  // Function to flash row color and trigger arrow animation
  const flashRowColor = (sym, color, direction) => {
    if (color === 'transparent') return;

    // Set the row flash color with a gradient
    setRowFlashColors((prev) => ({
      ...prev,
      [sym]: color === 'rgba(0,255,0,0.2)'
        ? 'linear-gradient(90deg, rgba(0,255,0,0.2) 0%, rgba(0,255,0,0) 100%)'
        : 'linear-gradient(90deg, rgba(255,0,0,0.2) 0%, rgba(255,0,0,0) 100%)',
    }));

    // Initiate arrow animation
    const animationId = Date.now(); // Unique identifier for the animation instance
    setArrowAnimations((prev) => ({
      ...prev,
      [sym]: { direction, id: animationId },
    }));

    // Reset row flash color after 1 second to allow the gradient to display smoothly
    setTimeout(() => {
      setRowFlashColors((prev) => ({
        ...prev,
        [sym]: 'transparent',
      }));
    }, 1000);

    // Remove arrow animation after the animation duration
    setTimeout(() => {
      setArrowAnimations((prev) => ({
        ...prev,
        [sym]: null,
      }));
    }, 2000); // Duration matches the arrow animation duration
  };

  // Fetch user data on mount
  useEffect(() => {
    (async () => {
      try {
        const dashData = await getUserDashboard();
        setFunds(dashData.funds);
        setPortfolio(dashData.portfolio);

        // Initialize portfolio value and net P/L with initial prices if available
        recalcPortfolioAndPL(dashData.portfolio, dashData.prices || {});

        setLoading(false);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load dashboard data');
        setShowSnackbar(true);
        setLoading(false);
      }
    })();
  }, []);

  // Subscribe to portfolio updates when Dashboard mounts
  useEffect(() => {
    // Send subscription message
    sendMessage({ type: 'subscribe_portfolio_watchlist' });
    console.log('📥 Sent subscribe_portfolio_watchlist message');

    // Cleanup function to unsubscribe when Dashboard unmounts
    return () => {
      sendMessage({ type: 'unsubscribe_all' });
      console.log('📤 Sent unsubscribe_all message');
    };
  }, [sendMessage]);

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
  useEffect(() => {
    // Compare previous prices with current prices to determine changes
    if (!initialPricesLoaded.current) {
      initialPricesLoaded.current = true;
      setPrevPrices(prices);
      return;
    }

    Object.keys(prices).forEach((sym) => {
      const newPrice = Number(prices[sym]);
      const oldPrice = Number(prevPrices[sym]) || 0;

      if (newPrice > oldPrice) {
        // Price increased
        flashRowColor(sym, 'rgba(0,255,0,0.2)', 'up'); // Green highlight and up direction
      } else if (newPrice < oldPrice) {
        // Price decreased
        flashRowColor(sym, 'rgba(255,0,0,0.2)', 'down'); // Red highlight and down direction
      }
    });

    setPrevPrices(prices);
  }, [prices, prevPrices]);

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

  // Handle WebSocket errors
  useEffect(() => {
    if (wsError) {
      console.error('WebSocket encountered an error:', wsError);
      setErrorMsg('WebSocket encountered an error.');
      setShowSnackbar(true);
    }
  }, [wsError]);

  // Optional: Connection Status Indicator
  const renderConnectionStatus = () => {
    let color;
    let label;

    switch (connectionStatus) {
      case 'connected':
        color = 'green';
        label = 'Connected';
        break;
      case 'disconnected':
        color = 'red';
        label = 'Disconnected';
        break;
      case 'error':
        color = 'orange';
        label = 'Error';
        break;
      default:
        color = 'grey';
        label = 'Unknown';
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2">
          Connection Status: {label}
        </Typography>
        <Box
          sx={{
            width: 10,
            height: 10,
            backgroundColor: color,
            borderRadius: '50%',
            ml: 1,
          }}
        />
      </Box>
    );
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
        {/* Optional: Display Connection Status */}
        {renderConnectionStatus()}
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
            {errorMsg}
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
                            {/* Enhanced Animated Arrow */}
                            {arrowAnimations[sym] && (
                              <AnimatedArrow direction={arrowAnimations[sym].direction}>
                                {arrowAnimations[sym].direction === 'up' ? (
                                  <TrendingUpIcon
                                    sx={{ color: 'green', fontSize: '1.5rem' }}
                                    aria-label="Price increased"
                                  />
                                ) : (
                                  <TrendingDownIcon
                                    sx={{ color: 'red', fontSize: '1.5rem' }}
                                    aria-label="Price decreased"
                                  />
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
