import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Grid,
  Skeleton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getUserSummary } from '../api/userApi';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';

// 🎨 Styled Components
const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  background: '#f5f7fa',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  paddingTop: theme.spacing(6),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  overflowX: 'hidden',
  boxSizing: 'border-box',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '90%',
  maxWidth: '1400px',
  padding: theme.spacing(4),
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  borderRadius: '8px',
  background: '#fff',
  marginTop: theme.spacing(-6), // Move the box upwards
}));

const StyledCard = styled(Box)(({ theme }) => ({
  borderRadius: '8px',
  padding: theme.spacing(2),
  textAlign: 'center',
  background: '#fdfdfd',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  fontSize: '1.2rem',
  textAlign: 'left',
}));

const GreenText = styled('span')({
  color: 'green',
  fontWeight: 'bold',
});

const RedText = styled('span')({
  color: 'red',
  fontWeight: 'bold',
});

// ✨ Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.5, ease: 'easeIn' } },
};

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

  if (loading) {
    return (
      <StyledContainer>
        <StyledPaper>
          {/* Skeleton for the Summary Page */}
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📋 Account Summary
          </Typography>
          <Grid container spacing={3} mb={4}>
            {[1, 2, 3].map((key) => (
              <Grid item xs={12} md={4} key={key}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '8px' }} />
              </Grid>
            ))}
          </Grid>
          <SectionHeader>📄 Ticker Summaries</SectionHeader>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((key) => (
              <Grid item xs={12} md={6} key={key}>
                <Skeleton variant="rectangular" height={60} sx={{ borderRadius: '8px' }} />
              </Grid>
            ))}
          </Grid>
        </StyledPaper>
      </StyledContainer>
    );
  }

  if (!summary) {
    return (
      <StyledContainer>
        <Typography color="error">No summary data found.</Typography>
      </StyledContainer>
    );
  }

  const tickerEntries = summary.ticker_summaries
    ? Object.entries(summary.ticker_summaries)
    : [];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <StyledContainer>
        <StyledPaper>
          {/* Snackbar for Error */}
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

          {/* Page Title */}
          <Typography variant="h4" fontWeight="bold" gutterBottom textAlign="center">
            📋 Account Summary
          </Typography>

          {/* Key Metrics */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <StyledCard>
                <Typography variant="subtitle1" fontWeight="bold">
                  💵 Cash Balance
                </Typography>
                <Typography variant="h5">
                  ${summary.cash_balance?.toLocaleString()}
                </Typography>
              </StyledCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StyledCard>
                <Typography variant="subtitle1" fontWeight="bold">
                  📈 Portfolio Value
                </Typography>
                <Typography variant="h5">
                  ${summary.portfolio_value?.toLocaleString()}
                </Typography>
              </StyledCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <StyledCard>
                <Typography variant="subtitle1" fontWeight="bold">
                  💲Total Unrealized P/L
                </Typography>
                <Typography variant="h5">{formatPL(summary.total_unrealized_pl)}</Typography>
              </StyledCard>
            </Grid>
          </Grid>

          {/* Ticker Summaries */}
          <SectionHeader>📄 Ticker Summaries</SectionHeader>
          <Grid container spacing={2}>
            {tickerEntries.map(([ticker, info]) => (
              <Grid item xs={12} md={6} key={ticker}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {ticker}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>Quantity: {info.quantity}</Typography>
                    <Typography>Avg Cost: ${info.avg_cost?.toFixed(2)}</Typography>
                    <Typography>Unrealized P/L: {formatPL(info.unrealized_pl)}</Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </StyledPaper>
      </StyledContainer>
    </motion.div>
  );
}

export default Summary;
