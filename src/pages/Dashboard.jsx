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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/system';

// API calls
import { getUserFunds, getUserPortfolio, getUserSummary } from '../api/userApi';

const GreenText = styled('span')({ color: 'green' });
const RedText = styled('span')({ color: 'red' });

function Dashboard() {
  const [funds, setFunds] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [fData, pData, sData] = await Promise.all([
          getUserFunds(),
          getUserPortfolio(),
          getUserSummary(),
        ]);
        setFunds(fData);
        setPortfolio(pData);
        setSummary(sData);
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

  if (loading) {
    return <CircularProgress />;
  }

  if (!funds || !summary) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="error">No data found</Typography>
      </Paper>
    );
  }

  // Extract ticker_summaries from summary
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
              <Typography variant="subtitle1">Available Funds</Typography>
              <Typography variant="h5">
                ${funds.cash?.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Portfolio Value</Typography>
              <Typography variant="h5">
                ${summary.portfolio_value?.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Net Unrealized P/L</Typography>
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
            portfolio.map((pos) => (
              <Box
                key={pos.id}
                sx={{
                  mb: 2,
                  pb: 1,
                  borderBottom: '1px solid #ccc',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {pos.stock_ticker} ({pos.direction})
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2">
                    Qty: {pos.quantity} @ ${pos.execution_price}
                  </Typography>
                  <Typography variant="caption">{pos.stock_name}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption">{pos.created_at}</Typography>
                </Box>
              </Box>
            ))
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
