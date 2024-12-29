// src/pages/StockDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Link,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Fade,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { getStockInfo, getStockHistorical } from '../api/stockApi';
import TradeDialog from '../components/TradeDialog';

// register chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StockDetail() {
  const { ticker } = useParams();
  const [stockData, setStockData] = useState(null);
  const [historical, setHistorical] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const [animate, setAnimate] = useState(false);

  // For the trade dialog
  const [tradeOpen, setTradeOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // fetch data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const info = await getStockInfo(ticker);
        const hist = await getStockHistorical(ticker);

        setStockData(info);
        setHistorical(hist.historical_price || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load stock info');
        setShowSnackbar(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [ticker]);

  // fade in
  useEffect(() => {
    if (!loading) setAnimate(true);
  }, [loading]);

  const handleCloseSnackbar = () => setShowSnackbar(false);

  // handle transaction success
  const handleTransactionSuccess = (response) => {
    setSuccessMsg(
      `Transaction successful! ${response.direction} ${response.quantity} shares of ${response.stockTicker} @ $${response.executionPrice} \nCurrent cash balance: $${response.cashBalance}`
    );
    setShowSnackbar(true);
  };

  // chart data
  const chartLabels = historical.map((item) => {
    if (item.t) {
      const d = new Date(item.t * 1000);
      return d.toLocaleDateString();
    }
    return '';
  });
  const chartData = historical.map((item) => item.close);

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: `${ticker} Price`,
        data: chartData,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33,150,243,0.1)',
        fill: true,
        tension: 0.2,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: `${ticker} Historical Price` },
    },
    scales: {
      y: { beginAtZero: false },
    },
  };

  // helper to round
  const fmt = (val) => (typeof val === 'number' ? val.toFixed(2) : val);

  if (loading) return <CircularProgress sx={{ m: 2 }} />;

  if (!stockData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Typography color="error">No data found for {ticker}</Typography>
      </Container>
    );
  }

  const { asset_type, quote, profile, financials, news } = stockData;

  // daily change color
  let changeColor = 'inherit';
  if (quote?.d > 0) changeColor = 'green';
  if (quote?.d < 0) changeColor = 'red';

  // function to safely show financial
  const fin = (key) =>
    !financials || financials[key] === undefined
      ? 'N/A'
      : typeof financials[key] === 'number'
      ? financials[key].toFixed(2)
      : financials[key];

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      {/* Error / success Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || successMsg}
        </Alert>
      </Snackbar>

      <Fade in={animate} timeout={600}>
        <Paper sx={{ p: 3, backgroundColor: '#fafafa' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {profile?.name} ({ticker})
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Asset Type: {asset_type}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {/* Left: Profile & Chart */}
            <Grid item xs={12} md={6} lg={5}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                    {profile?.logo && (
                      <CardMedia
                        component="img"
                        sx={{ width: 100, objectFit: 'contain' }}
                        image={profile.logo}
                        alt="logo"
                      />
                    )}
                    <Typography variant="h6" fontWeight="bold">
                      Profile
                    </Typography>
                  </Box>
                  <Box mt={2} ml={1}>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Exchange:</strong> {profile?.exchange}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Industry:</strong> {profile?.finnhubIndustry}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>IPO:</strong> {profile?.ipo}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Website:</strong>{' '}
                      <Link href={profile?.weburl} target="_blank" rel="noopener">
                        {profile?.weburl}
                      </Link>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* chart */}
              <Card>
                <CardContent>
                  <Box sx={{ minHeight: 300 }}>
                    <Line data={data} options={options} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right: Quote & Financials */}
            <Grid item xs={12} md={6} lg={7}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">
                      Quote
                    </Typography>
                    {/* Trade button */}
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => setTradeOpen(true)}
                    >
                      Trade
                    </Button>
                  </Box>

                  <Box mt={1} ml={1}>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                      ${quote?.c ? fmt(quote.c) : 'N/A'}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: changeColor, mb: 0.5, fontWeight: 'bold' }}
                    >
                      Change: {quote?.d ? fmt(quote.d) : 'N/A'} (Daily %:{' '}
                      {quote?.dp ? fmt(quote.dp) : 'N/A'})
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>High:</strong> {quote?.h ? fmt(quote.h) : 'N/A'} /{' '}
                      <strong>Low:</strong> {quote?.l ? fmt(quote.l) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Previous Close:</strong> {quote?.pc ? fmt(quote.pc) : 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    Financial Highlights
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 1,
                      mt: 1,
                      ml: 1,
                    }}
                  >
                    <Typography variant="body2">
                      <strong>52W High:</strong> {fin('52WeekHigh')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>52W Low:</strong> {fin('52WeekLow')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Market Cap:</strong> {fin('marketCapitalization')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Beta:</strong> {fin('beta')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>PE (TTM):</strong> {fin('peTTM')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Dividend Yield:</strong> {fin('currentDividendYieldTTM')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>EPS Growth 5Y:</strong> {fin('epsGrowth5Y')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Revenue Growth 5Y:</strong> {fin('revenueGrowth5Y')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Gross Margin TTM:</strong> {fin('grossMarginTTM')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ROA TTM:</strong> {fin('roaTTM')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* News Section */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent News
            </Typography>
            {Array.isArray(news) && news.length > 0 ? (
              news.map((item) => (
                <Accordion key={item.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight="bold">{item.headline}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {item.image && (
                      <Box
                        component="img"
                        src={item.image}
                        alt="news-img"
                        sx={{
                          maxWidth: '100%',
                          mb: 1,
                          borderRadius: 1,
                          boxShadow: 1,
                        }}
                      />
                    )}
                    <Typography variant="subtitle2" gutterBottom>
                      Source: {item.source} |{' '}
                      {new Date(item.datetime * 1000).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {item.summary}
                    </Typography>
                    <Link href={item.url} target="_blank" rel="noopener">
                      Read more
                    </Link>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography>No news available.</Typography>
            )}
          </Box>
        </Paper>
      </Fade>

      {/* Trade dialog */}
      <TradeDialog
        open={tradeOpen}
        onClose={() => setTradeOpen(false)}
        ticker={ticker}
        onTransactionSuccess={handleTransactionSuccess}
      />
    </Container>
  );
}

export default StockDetail;
