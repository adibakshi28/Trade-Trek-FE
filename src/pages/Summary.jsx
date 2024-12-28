// src/pages/Summary.jsx
import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getUserSummary } from '../api/userApi';
import { styled } from '@mui/system';

const GreenText = styled('span')({ color: 'green' });
const RedText = styled('span')({ color: 'red' });

function Summary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserSummary();
        setSummary(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load summary');
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
    } else if (plValue < 0) {
      return <RedText>{plValue.toFixed(2)}</RedText>;
    }
    return plValue.toFixed(2);
  };

  if (loading) return <CircularProgress />;

  if (!summary) {
    return (
      <Typography color="error">No summary data found.</Typography>
    );
  }

  const tickerEntries = summary.ticker_summaries
    ? Object.entries(summary.ticker_summaries)
    : [];

  return (
    <Paper sx={{ p: 3 }}>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Typography variant="h5" gutterBottom>
        Detailed Summary
      </Typography>
      <Typography>Cash Balance: ${summary.cash_balance?.toLocaleString()}</Typography>
      <Typography>Portfolio Value: ${summary.portfolio_value?.toLocaleString()}</Typography>
      <Typography>Positions Market Value: {summary.positions_market_value}</Typography>
      <Typography>Total Realized P/L: {formatPL(summary.total_realized_pl)}</Typography>
      <Typography>Total Unrealized P/L: {formatPL(summary.total_unrealized_pl)}</Typography>

      <Typography variant="h6" sx={{ mt: 2 }}>
        Ticker Summaries
      </Typography>
      {tickerEntries.length === 0 ? (
        <Typography>No ticker summary found.</Typography>
      ) : (
        tickerEntries.map(([ticker, info]) => (
          <Accordion key={ticker}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{ticker}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Quantity: {info.quantity}</Typography>
              <Typography>Avg Cost: ${info.avg_cost?.toFixed(2)}</Typography>
              <Typography>Current Price: ${info.current_price?.toFixed(2)}</Typography>
              <Typography>Unrealized P/L: {formatPL(info.unrealized_pl)}</Typography>
              <Typography>Realized P/L: {formatPL(info.realized_pl)}</Typography>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Paper>
  );
}

export default Summary;
