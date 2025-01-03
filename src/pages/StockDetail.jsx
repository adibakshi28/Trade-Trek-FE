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
import { getStockInfo, getStockHistorical } from '../api/stockApi';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import 'chart.js/auto';
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
import BusinessIcon from '@mui/icons-material/Business';
import IndustryIcon from '@mui/icons-material/AccountBalance';
import IpoIcon from '@mui/icons-material/CalendarToday';
import WebsiteIcon from '@mui/icons-material/Language';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

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

  // Fetch data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const endDate = moment().format('YYYY-MM-DD'); // Today
        const startDate = moment().subtract(1, 'year').format('YYYY-MM-DD'); // 1 Year Back

        const info = await getStockInfo(ticker);
        const hist = await getStockHistorical(ticker, startDate, endDate, '1day');

        setStockData(info);
        setHistorical(hist.reverse() || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load stock information.');
        setShowSnackbar(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [ticker]);

  // Trigger animations once data is loaded
  useEffect(() => {
    if (!loading) setAnimate(true);
  }, [loading]);

  const handleCloseSnackbar = () => setShowSnackbar(false);

  // Loading State with Enhanced Skeletons
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Skeleton variant="text" width={250} height={50} />
          <Skeleton variant="rectangular" height={500} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          </Grid>
          <Skeleton variant="text" height={40} />
          <Skeleton variant="rectangular" height={350} />
        </Box>
      </Container>
    );
  }

  if (!stockData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          No data found for {ticker}.
        </Typography>
      </Container>
    );
  }

  // Deconstruct the data
  const { asset_type, quote, profile, financials, news } = stockData;

  // Determine change color and icon
  const isPositive = quote?.d > 0;
  const isNegative = quote?.d < 0;
  let changeColor = 'inherit';
  let ChangeIcon = null;

  if (isPositive) {
    changeColor = 'green';
    ChangeIcon = TrendingUpIcon;
  } else if (isNegative) {
    changeColor = 'red';
    ChangeIcon = TrendingDownIcon;
  }

  // Helper: format numeric values
  const fmt = (val) =>
    typeof val === 'number'
      ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : val;

  // Prepare chart data
  const chartData = {
    labels: historical.map((item) => moment(item.datetime).format('MMM YYYY')),
    datasets: [
      {
        label: `${ticker} Closing Price`,
        data: historical.map((item) => +item.close),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: `${ticker} Volume`,
        data: historical.map((item) => +item.volume),
        type: 'bar',
        backgroundColor: 'rgba(255, 152, 0, 0.4)',
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: `${ticker} 52-Week Price & Volume`, font: { size: 18 } },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: ({ dataset, raw }) =>
            dataset.label.includes('Price') ? `Close: $${raw}` : `Volume: ${raw.toLocaleString()}`,
        },
      },
    },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { display: true, ticks: { maxTicksLimit: 12, autoSkip: true } },
      y: { beginAtZero: false, title: { display: true, text: 'Closing Price ($)' } },
      y1: {
        beginAtZero: true,
        title: { display: true, text: 'Volume' },
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { callback: (value) => value.toLocaleString() },
      },
    },
  };

  // Handle Trade Button Click
  const handleGoTrade = () => {
    navigate('/dashboard/trade', {
      state: { defaultTicker: ticker.toUpperCase() },
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={error ? 'error' : 'success'}
          onClose={handleCloseSnackbar}
          sx={{ width: '100%' }}
        >
          {error || ''}
        </Alert>
      </Snackbar>

      <Fade in={animate} timeout={1000}>
        <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#fff' }}>
          {/* Header Section */}
          <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
            {/* Reduced font size from h3 to h4 */}
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {profile?.name} ({ticker})
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Asset Type: {asset_type}
            </Typography>
          </Box>

          {/* Quote and Graph Section */}
          <Grid container spacing={4}>
            {/* Stock Quote */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={3}
                sx={{
                  p: 3,
                  backgroundColor: '#f5f5f5',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Stock Quote
                  </Typography>
                  <Button variant="contained" color="primary" onClick={handleGoTrade}>
                    Trade
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    ${quote?.c ? fmt(quote.c) : 'N/A'}
                  </Typography>
                  <Box display="flex" alignItems="center" sx={{ color: changeColor, mb: 2 }}>
                    {ChangeIcon && <ChangeIcon sx={{ mr: 1 }} />}
                    <Typography variant="subtitle1" fontWeight="medium">
                      {quote?.d > 0 && '+'}
                      {quote?.d ? fmt(quote.d) : '0'} ({quote?.dp > 0 && '+'}
                      {quote?.dp ? fmt(quote.dp) : '0'}%)
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>High:</strong> {quote?.h ? fmt(quote.h) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Low:</strong> {quote?.l ? fmt(quote.l) : 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Previous Close:</strong> {quote?.pc ? fmt(quote.pc) : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Card>

              {/* Company Profile placed directly below Stock Quote */}
              <Box sx={{ mt: 4 }}>
                <Card
                  elevation={3}
                  sx={{
                    p: 3,
                    backgroundColor: '#fff',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.02)' },
                  }}
                >
                  <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                    {profile?.logo && (
                      <CardMedia
                        component="img"
                        sx={{ width: 120, height: 120, objectFit: 'contain', mb: 2 }}
                        image={profile.logo}
                        alt="Company Logo"
                      />
                    )}
                    <Typography variant="h6" fontWeight="bold">
                      Company Profile
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Exchange:</strong> {profile?.exchange}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <IndustryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Industry:</strong> {profile?.finnhubIndustry}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <IpoIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>IPO:</strong> {profile?.ipo}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <WebsiteIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <strong>Website:</strong>{' '}
                        <Link
                          href={profile?.weburl}
                          target="_blank"
                          rel="noopener"
                          underline="hover"
                        >
                          {profile?.weburl}
                        </Link>
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>
            </Grid>

            {/* Stock Graph */}
            <Grid item xs={12} md={8}>
              <Card
                elevation={3}
                sx={{
                  p: 2,
                  height: '100%',
                  backgroundColor: '#fafafa',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.01)' },
                }}
              >
                <CardContent sx={{ height: { xs: 300, md: 500 } }}>
                  <Line data={chartData} options={chartOptions} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Financial Highlights */}
          <Box sx={{ mt: 4 }}>
            <Card
              elevation={3}
              sx={{
                p: 3,
                backgroundColor: '#fff',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.01)' },
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Financial Highlights
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    <strong>52W High:</strong> {fmt(financials?.['52WeekHigh'])}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    <strong>52W Low:</strong> {fmt(financials?.['52WeekLow'])}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    <strong>Market Cap:</strong> {fmt(financials?.marketCapitalization)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    <strong>Beta:</strong> {fmt(financials?.beta)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    <strong>PE (TTM):</strong> {fmt(financials?.peTTM)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    <strong>Dividend Yield:</strong> {fmt(financials?.currentDividendYieldTTM)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    <strong>EPS Growth 5Y:</strong> {fmt(financials?.epsGrowth5Y)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    <strong>Revenue Growth 5Y:</strong> {fmt(financials?.revenueGrowth5Y)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    <strong>Gross Margin TTM:</strong> {fmt(financials?.grossMarginTTM)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2">
                    <strong>ROA TTM:</strong> {fmt(financials?.roaTTM)}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </Box>

          {/* News Section */}
          <Box sx={{ mt: 4 }}>
            <Card
              elevation={3}
              sx={{
                p: 3,
                backgroundColor: '#fff',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.01)' },
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent News
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {Array.isArray(news) && news.length > 0 ? (
                news.map((item) => (
                  <Accordion key={item.id} sx={{ mb: 2, boxShadow: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight="medium">{item.headline}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {item.image && (
                        <Box
                          component="img"
                          src={item.image}
                          alt="News"
                          sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: 200,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mb: 2,
                          }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Source: {item.source} |{' '}
                        {new Date(item.datetime * 1000).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {item.summary}
                      </Typography>
                      <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener"
                        underline="hover"
                        sx={{ color: 'primary.main' }}
                      >
                        Read more
                      </Link>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography>No news available.</Typography>
              )}
            </Card>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
}

export default StockDetail;
