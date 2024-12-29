// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
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

// API calls
import { getUserDashboard } from '../api/userApi';
import { getStockQuote } from '../api/stockApi';

const GreenText = styled('span')({ color: 'green' });
const RedText = styled('span')({ color: 'red' });

// Single "TRADE" button
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
  const [summary, setSummary] = useState(null);
  const [quotes, setQuotes] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) fetch dashboard (funds, portfolio, summary)
        const [dData] = await Promise.all([
          getUserDashboard(),
        ]);
        setFunds(dData.funds);
        setPortfolio(dData.portfolio);
        setSummary(dData.summary);

        // 2) fetch quotes for each ticker in portfolio
        const tickers = dData.portfolio.map((pos) => pos.stock_ticker.toUpperCase());
        const uniqueTickers = [...new Set(tickers)];
        const quotePromises = uniqueTickers.map(async (t) => {
          const q = await getStockQuote(t);
          return [t, q];
        });
        const results = await Promise.all(quotePromises);
        const quotesObj = {};
        results.forEach(([tickerSym, quoteData]) => {
          quotesObj[tickerSym] = quoteData;
        });
        setQuotes(quotesObj);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
        setShowSnackbar(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCloseSnackbar = () => setShowSnackbar(false);

  const formatPL = (plValue = 0) => {
    if (plValue > 0) {
      return <GreenText>+{plValue.toFixed(2)}</GreenText>;
    }
    if (plValue < 0) {
      return <RedText>{plValue.toFixed(2)}</RedText>;
    }
    return plValue.toFixed(2);
  };

  // Single trade button -> go to /dashboard/trade
  const handleTrade = (ticker) => {
    navigate('/dashboard/trade', { state: { defaultTicker: ticker } });
  };

  if (loading) {
    return <CircularProgress sx={{ m: 2 }} />;
  }

  if (!funds || !summary) {
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
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                Available Funds
              </Typography>
              <Typography variant="h5">${funds.cash?.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                Portfolio Value
              </Typography>
              <Typography variant="h5">
                ${summary.portfolio_value?.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                Net Unrealized P/L
              </Typography>
              <Typography variant="h5">
                {formatPL(summary.total_unrealized_pl)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Portfolio Positions
        </Typography>

        <Paper sx={{ p: 2 }}>
          {portfolio.length === 0 ? (
            <Typography>No positions found.</Typography>
          ) : (
            portfolio.map((pos) => {
              const tickerSym = pos.stock_ticker.toUpperCase();
              const quoteData = quotes[tickerSym];
              const currentPrice = quoteData?.c ?? null;

              // Based on pos.direction
              const positionLabel = pos.direction === 'BUY' ? 'LONG' : 'SHORT';

              let positionValue = null;
              if (currentPrice) {
                positionValue = currentPrice * pos.quantity;
              }

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
                    '&:hover': { backgroundColor: '#f9f9f9' },
                  }}
                >
                  {/* Left box: Ticker & posType */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {pos.stock_ticker} ({positionLabel})
                    </Typography>
                    <Typography variant="caption">{pos.stock_name}</Typography>
                  </Box>

                  {/* Middle box: Qty and current stats */}
                  <Box sx={{ textAlign: 'right', flex: 1, mx: 2 }}>
                    <Typography variant="body2" fontWeight="bold">
                      Qty: {pos.quantity} @ ${pos.execution_price.toFixed(2)}
                    </Typography>
                    {currentPrice ? (
                      <Typography variant="body2" sx={{ color: 'gray' }}>
                        Current: <strong>${currentPrice.toFixed(2)}</strong>
                        {positionValue && (
                          <>
                            {' '}| Value: <strong>${positionValue.toFixed(2)}</strong>
                          </>
                        )}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Loading quote...
                      </Typography>
                    )}
                  </Box>

                  {/* Right box: single TRADE button */}
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
