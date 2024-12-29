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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

// API calls
import { getUserFunds, getUserPortfolio, getUserSummary } from '../api/userApi';
import { getStockQuote } from '../api/stockApi';

const GreenText = styled('span')({ color: 'green' });
const RedText = styled('span')({ color: 'red' });

const BuyButton = styled(Button)({
  backgroundColor: '#2e7d32',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1b5e20',
  },
  marginRight: '8px',
});
const SellButton = styled(Button)({
  backgroundColor: '#c62828',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#b71c1c',
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

        // 1) fetch funds, portfolio, summary
        const [fData, pData, sData] = await Promise.all([
          getUserFunds(),
          getUserPortfolio(),
          getUserSummary(),
        ]);
        setFunds(fData);
        setPortfolio(pData);
        setSummary(sData);

        // 2) fetch quotes for each distinct ticker in portfolio
        const tickers = pData.map((pos) => pos.stock_ticker.toUpperCase());
        const uniqueTickers = [...new Set(tickers)];
        const quotePromises = uniqueTickers.map(async (t) => {
          const q = await getStockQuote(t);
          return [t, q]; // store ticker -> quote
        });
        const results = await Promise.all(quotePromises);
        // convert array to object { TICKER: quoteData, ... }
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

  // handleTrade => navigate to the /dashboard/trade page with defaults
  const handleTrade = (ticker, direction) => {
    navigate('/dashboard/trade', { state: { defaultTicker: ticker, defaultDirection: direction } });
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

  // ticker_summaries from summary for reference
  const tickerEntries = summary.ticker_summaries
    ? Object.entries(summary.ticker_summaries)
    : [];

  return (
    <Box sx={{ p: 2 }}>
      {/* Error Snackbar */}
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

      {/* Top row of cards: Funds, Portfolio Value, Net Unrealized P/L */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold">
                Available Funds
              </Typography>
              <Typography variant="h5">
                ${funds.cash?.toLocaleString()}
              </Typography>
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

      {/* Current Portfolio Positions */}
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
              // get the quote from quotes dict
              const quoteData = quotes[tickerSym];
              const currentPrice = quoteData?.c ?? null;

              // positionValue = currentPrice * quantity (assuming quantity is positive or negative)
              const positionValue =
                currentPrice && pos.quantity
                  ? currentPrice * pos.quantity
                  : null;

              // If quantity > 0 => LONG, if < 0 => SHORT
              const isLong = pos.quantity > 0;
              const positionLabel = isLong ? 'LONG' : 'SHORT';

              return (
                <Box
                  key={pos.id}
                  sx={{
                    mb: 2,
                    pb: 1,
                    borderBottom: '1px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    transition: 'background-color 0.2s ease',
                    '&:hover': { backgroundColor: '#f9f9f9' },
                  }}
                >
                  {/* Left side: Ticker + Position Label + Stock Name */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {pos.stock_ticker} ({positionLabel})
                    </Typography>
                    <Typography variant="caption">{pos.stock_name}</Typography>
                  </Box>

                  {/* Middle: Qty / Price / Current Price / Value */}
                  <Box sx={{ textAlign: 'right', minWidth: '250px' }}>
                    <Typography variant="body2" fontWeight="bold">
                      Qty: {Math.abs(pos.quantity)} @ ${pos.execution_price.toFixed(2)}
                    </Typography>
                    {currentPrice ? (
                      <Typography variant="body2" sx={{ color: 'gray' }}>
                        Current: <strong>${currentPrice.toFixed(2)}</strong>
                        {positionValue && (
                          <>
                            {' '}
                            | Value: <strong>${positionValue.toFixed(2)}</strong>
                          </>
                        )}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Loading quote...
                      </Typography>
                    )}
                  </Box>

                  {/* Right side: Buy / Sell buttons */}
                  <Box>
                    <BuyButton size="small" onClick={() => handleTrade(pos.stock_ticker, 'BUY')}>
                      BUY
                    </BuyButton>
                    <SellButton size="small" onClick={() => handleTrade(pos.stock_ticker, 'SELL')}>
                      SELL
                    </SellButton>
                  </Box>
                </Box>
              );
            })
          )}
        </Paper>
      </Box>

      {/* Stock-Level Summaries */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Stock-Level Summary
        </Typography>
        {tickerEntries.length === 0 ? (
          <Typography>No ticker summary found.</Typography>
        ) : (
          tickerEntries.map(([ticker, info]) => (
            <Accordion key={ticker} TransitionProps={{ unmountOnExit: true }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{ticker}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>Quantity: {info.quantity}</Typography>
                <Typography>Avg Cost: ${info.avg_cost?.toFixed(2)}</Typography>
                <Typography>Current Price: ${info.current_price?.toFixed(2)}</Typography>
                <Typography>
                  Unrealized P/L: {formatPL(info.unrealized_pl)}
                </Typography>
                <Typography>
                  Realized P/L: {formatPL(info.realized_pl)}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;
