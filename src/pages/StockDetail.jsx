// src/pages/StockDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
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
  Skeleton,
} from '@mui/material';
// API calls
import { getStockInfo, getStockHistorical } from '../api/stockApi';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line } from 'react-chartjs-2';

// register chart.js components
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
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function StockDetail() {
  const { ticker } = useParams();
  const navigate = useNavigate();

  const [stockData, setStockData] = useState(null);
  const [historical, setHistorical] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [animate, setAnimate] = useState(false);

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

  // fade in once data is loaded
  useEffect(() => {
    if (!loading) setAnimate(true);
  }, [loading]);

  const handleCloseSnackbar = () => setShowSnackbar(false);

  // If still loading, show fancy placeholders or skeletons
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          <Skeleton variant="rectangular" width={300} height={40} />
          <Skeleton variant="rectangular" width="80%" height={20} />
          <Skeleton variant="rectangular" width="100%" height={300} />
        </Box>
      </Container>
    );
  }

  if (!stockData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Typography color="error">No data found for {ticker}</Typography>
      </Container>
    );
  }

  // Deconstruct the data
  const { asset_type, quote, profile, financials, news } = stockData;

  // daily change color
  let changeColor = 'inherit';
  if (quote?.d > 0) changeColor = 'green';
  if (quote?.d < 0) changeColor = 'red';

  // helper: format numeric values
  const fmt = (val) => (typeof val === 'number' ? val.toFixed(2) : val);

  // Prepare chart data
  const chartLabels = historical.map((item) => {
    if (item.t) {
      const d = new Date(item.t * 1000);
      return d.toLocaleDateString();
    }
    return '';
  });
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: `${ticker} Price`,
        data: historical.map((item) => item.close),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33,150,243,0.1)',
        fill: true,
        tension: 0.2,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: `${ticker} Historical Price` },
    },
    scales: {
      y: { beginAtZero: false },
    },
  };

  // On "Trade" button click, just navigate to the TradePage with ticker
  const handleGoTrade = () => {
    navigate('/dashboard/trade', {
      state: { defaultTicker: ticker.toUpperCase() },
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={error ? 'error' : 'success'} onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
          {error || ''}
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
            {/* Left column: Profile & chart */}
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

              <Card>
                <CardContent>
                  <Box sx={{ minHeight: 300 }}>
                    <Line data={chartData} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right column: Quote & Financials */}
            <Grid item xs={12} md={6} lg={7}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">
                      Quote
                    </Typography>
                    {/* The new Trade button that redirects */}
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleGoTrade}
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
                      <strong>Previous Close:</strong>{' '}
                      {quote?.pc ? fmt(quote.pc) : 'N/A'}
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
                      <strong>52W High:</strong> {fmt(financials?.['52WeekHigh'])}
                    </Typography>
                    <Typography variant="body2">
                      <strong>52W Low:</strong> {fmt(financials?.['52WeekLow'])}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Market Cap:</strong> {fmt(financials?.marketCapitalization)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Beta:</strong> {fmt(financials?.beta)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>PE (TTM):</strong> {fmt(financials?.peTTM)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Dividend Yield:</strong> {fmt(financials?.currentDividendYieldTTM)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>EPS Growth 5Y:</strong> {fmt(financials?.epsGrowth5Y)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Revenue Growth 5Y:</strong> {fmt(financials?.revenueGrowth5Y)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Gross Margin TTM:</strong> {fmt(financials?.grossMarginTTM)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ROA TTM:</strong> {fmt(financials?.roaTTM)}
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
                      Source: {item.source} | {new Date(item.datetime * 1000).toLocaleString()}
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
    </Container>
  );
}

export default StockDetail;
