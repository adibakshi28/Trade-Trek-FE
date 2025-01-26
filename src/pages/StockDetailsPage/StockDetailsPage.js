// src/pages/StockDetailsPage/StockDetailsPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStockInfo, getStockHistorical } from '../../api/stockApi';
import { postStockInsights } from '../../api/aiApi';
import {
  Box,
  Typography,
  CircularProgress,
  Avatar,
  Grid,
  Paper,
  Chip,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  Filler,
} from 'chart.js';
import { format } from 'date-fns';
import ExplainText from '../../components/Metrics/ExplainText/ExplainText';
import './StockDetailsPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend,
  Filler
);

const StockDetailsPage = () => {
  const { ticker } = useParams();
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [insightsReply, setInsightsReply] = useState(null);
  const [isExplainLoading, setIsExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchStockData = async () => {
    try {
      const data = await getStockInfo(ticker);
      setStockData(data);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(true);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const startDate = oneYearAgo.toISOString().split('T')[0];

      const data = await getStockHistorical(ticker, startDate, endDate, '1day');
      setHistoricalData(data);
    } catch (err) {
      console.error('Error fetching historical data:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchStockData();
      await fetchHistoricalData();
      setLoading(false);
    };
    fetchData();
  }, [ticker]);

  useEffect(() => {
    if (insightsReply) {
      setSnackbarSeverity('success');
      setSnackbarMessage('Stock analysis report generated successfully!');
      setSnackbarOpen(true);
    }
    if (explainError) {
      setSnackbarSeverity('error');
      setSnackbarMessage(explainError);
      setSnackbarOpen(true);
    }
  }, [insightsReply, explainError]);

  const handleExplain = async () => {
    setIsExplainLoading(true);
    setExplainError(null);
    setInsightsReply('');

    try {
      const response = await postStockInsights({
        ticker: ticker,
        context: {
          profile: stockData?.profile,
          financials: stockData?.financials,
          quote: stockData?.quote,
          news: stockData?.news
        }
      });
      setInsightsReply(response.reply);
    } catch (error) {
      setExplainError(error.response?.data?.message || error.message || 'Failed to generate insights');
      setInsightsReply(null);
    } finally {
      setIsExplainLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={80} thickness={4} />
      </Box>
    );
  }

  if (error || !stockData) {
    return (
      <Box className="error-container">
        <Typography variant="h4">Data Unavailable</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Failed to load stock data for {ticker}
        </Typography>
      </Box>
    );
  }

  const { profile, quote, news, financials } = stockData;

  const chartData = {
    labels: historicalData.map(d => format(new Date(d.datetime), 'MMM yyyy')).reverse(),
    datasets: [
      {
        label: 'Price',
        data: historicalData.map(d => d.close).reverse(),
        borderColor: '#5087f0',
        yAxisID: 'y',
        tension: 0.3,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(80,135,240, 0.2)');
          gradient.addColorStop(1, 'rgba(80,135,240, 0.05)');
          return gradient;
        },
        pointRadius: 0,
      },
      {
        label: 'Volume',
        data: historicalData.map(d => d.volume).reverse(),
        yAxisID: 'y-volume',
        type: 'bar',
        backgroundColor: 'rgba(242, 152, 74)',
        borderWidth: 0,
        borderRadius: 2,
        barThickness: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'var(--color-surface)',
        titleColor: 'var(--color-text-secondary)',
        bodyColor: 'var(--color-text-secondary)',
        borderColor: 'var(--color-border-subtle)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            if (label === 'Price') {
              return `Price: $${context.parsed.y.toFixed(2)}`;
            }
            if (label === 'Volume') {
              return `Volume: ${formatNumber(context.parsed.y)}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        grid: { 
          display: false,
          color: '#3a3f5c'
        },
        ticks: { 
          color: '#e6e9ef',
          font: { family: 'inherit' }
        }
      },
      y: {
        position: 'left',
        grid: { 
          color: '#3a3f5c',
          borderDash: [5] 
        },
        ticks: { 
          color: '#e6e9ef',
          font: { family: 'inherit' }
        }
      },
      'y-volume': {
        position: 'right',
        grid: { display: false },
        ticks: { 
          color: '#e6e9ef',
          font: { family: 'inherit' },
          callback: (value) => formatNumber(value)
        }
      }
    }
  };

  return (
    <Box className="container">
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        <Grid item xs={12} md={insightsReply ? 8 : 12}>
          <Paper className="header-card">
            <Box className="company-info">
              <Avatar src={profile.logo} className="company-logo" />
              <Box>
                <Typography variant="h3" className="company-name">
                  {profile.name} ({profile.ticker})
                </Typography>
                <Typography variant="subtitle1" className="industry">
                  {profile.finnhubIndustry}
                </Typography>
                <Chip label={profile.exchange} className="exchange-chip" />
              </Box>
            </Box>
            
            <Box className="price-section">
              <Typography variant="h2" className="price">
                ${quote.c.toFixed(2)}
              </Typography>
              <Chip
                label={`${quote.d >= 0 ? '+' : ''}${quote.d.toFixed(2)} (${quote.dp.toFixed(2)}%)`}
                className={`change-chip ${quote.d >= 0 ? 'positive' : 'negative'}`}
              />
            </Box>
          </Paper>

          <Grid container spacing={2} className="stats-grid">
            {[
              { label: 'Open', value: `$${quote.o}` },
              { label: 'Previous Close', value: `$${quote.pc}` },
              { label: 'Day High', value: `$${quote.h}` },
              { label: 'Day Low', value: `$${quote.l}` },
              { label: 'Market Cap (M)', value: `$${formatNumber(financials.marketCapitalization)}` },
              { label: 'Volume', value: formatNumber(quote.v) },
            ].map((stat, i) => (
              <Grid item xs={6} md={4} lg={2} key={i}>
                <Paper className="stat-card">
                  <Typography variant="body2" className="stat-label">
                    {stat.label}
                  </Typography>
                  <Typography variant="h6" className="stat-value">
                    {stat.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper className="chart-card">
            <Typography variant="h5" className="section-title">
              Past Year Performance
            </Typography>
            <Box className="chart-container">
              {historicalData.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <Typography variant="body1" className="no-data">
                  Historical data unavailable
                </Typography>
              )}
            </Box>
          </Paper>

          <Paper className="financials-card">
            <Typography variant="h5" className="section-title">
              Key Financial Metrics
            </Typography>
            
            <Box className="metric-category">
              <Typography variant="subtitle1" className="category-title">
                Valuation Multiples
              </Typography>
              <Grid container spacing={2}>
                {[
                  { key: 'peTTM', label: 'P/E Ratio (TTM)', type: 'ratio' },
                  { key: 'dividendYieldIndicatedAnnual', label: 'Dividend Yield', type: 'percentage' },
                  { key: 'pbQuarterly', label: 'Price/Book', type: 'ratio' },
                  { key: 'psTTM', label: 'Price/Sales', type: 'ratio' },
                ].map(({ key, label, type }) => (
                  <Grid item xs={6} md={3} key={key}>
                    <Paper className="metric-card">
                      <Typography variant="body2" className="metric-label">
                        {label}
                      </Typography>
                      <Typography variant="h6" className="metric-value">
                        {formatFinancialValue(key, financials[key])}
                        {type === 'percentage' && '%'}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box className="metric-category">
              <Typography variant="subtitle1" className="category-title">
                Profitability
              </Typography>
              <Grid container spacing={2}>
                {[
                  { key: 'roeTTM', label: 'Return on Equity', type: 'percentage' },
                  { key: 'netProfitMarginTTM', label: 'Net Profit Margin', type: 'percentage' },
                  { key: 'operatingMarginTTM', label: 'Operating Margin', type: 'percentage' },
                ].map(({ key, label, type }) => (
                  <Grid item xs={6} md={4} key={key}>
                    <Paper className="metric-card">
                      <Typography variant="body2" className="metric-label">
                        {label}
                      </Typography>
                      <Typography variant="h6" className="metric-value">
                        {formatFinancialValue(key, financials[key])}%
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box className="metric-category">
              <Typography variant="subtitle1" className="category-title">
                Growth
              </Typography>
              <Grid container spacing={2}>
                {[
                  { key: 'revenueGrowthTTMYoy', label: 'Revenue Growth (YoY)', type: 'percentage' },
                  { key: 'epsGrowthTTMYoy', label: 'EPS Growth (YoY)', type: 'percentage' },
                  { key: 'dividendGrowthRate5Y', label: 'Dividend Growth (5Y)', type: 'percentage' },
                ].map(({ key, label, type }) => (
                  <Grid item xs={6} md={4} key={key}>
                    <Paper className="metric-card">
                      <Typography variant="body2" className="metric-label">
                        {label}
                      </Typography>
                      <Typography variant="h6" className={`metric-value ${getTrendClass(financials[key])}`}>
                        {formatFinancialValue(key, financials[key])}%
                        {renderTrendArrow(financials[key])}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box className="metric-category">
              <Typography variant="subtitle1" className="category-title">
                Financial Health
              </Typography>
              <Grid container spacing={2}>
                {[
                  { key: 'totalDebt/totalEquityQuarterly', label: 'Debt/Equity Ratio', type: 'ratio' },
                  { key: 'currentRatioQuarterly', label: 'Current Ratio', type: 'ratio' },
                  { key: 'beta', label: 'Beta (Volatility)', type: 'raw' },
                ].map(({ key, label, type }) => (
                  <Grid item xs={6} md={4} key={key}>
                    <Paper className="metric-card">
                      <Typography variant="body2" className="metric-label">
                        {label}
                      </Typography>
                      <Typography variant="h6" className="metric-value">
                        {type === 'percentage' ? `${financials[key]}%` : financials[key]}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>

          <Paper className="insights-action-card">
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleExplain}
              disabled={isExplainLoading}
              className="generate-report-button"
              startIcon={isExplainLoading && <CircularProgress size={24} className="button-spinner" />}
            >
              {isExplainLoading ? 'Analyzing...' : `Analyze ${ticker}`}
            </Button>
          </Paper>

          <Paper className="news-card">
            <Typography variant="h5" className="section-title">
              Latest News
            </Typography>
            <Box className="news-grid">
              {news.map((article) => (
                <a href={article.url} key={article.id} className="news-article-link" target="_blank" rel="noopener noreferrer">
                  <Paper className="news-article" style={{ 
                    backgroundImage: `linear-gradient(to bottom, rgba(16, 19, 33, 0.7), rgba(16, 19, 33, 0.9)), url(${article.image || ''})`
                  }}>
                    <div className="news-content">
                      <Typography variant="subtitle2" className="news-source">
                        {article.source} • {format(new Date(article.datetime * 1000), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="subtitle1" className="news-headline">
                        {article.headline}
                      </Typography>
                      {article.summary && (
                        <Typography variant="body2" className="news-summary">
                          {article.summary}
                        </Typography>
                      )}
                    </div>
                  </Paper>
                </a>
              ))}
            </Box>
          </Paper>
        </Grid>

        {insightsReply !== null && (
          <Grid item xs={12} md={4}>
            <ExplainText 
              replyText={insightsReply} 
              loading={isExplainLoading}
              heading={`${ticker} Analysis Report`}
              sx={{
                position: 'sticky',
                height: 'calc(100vh - 40px)',
                overflowY: 'hidden',
                p: 2,
                backgroundColor: 'background.paper',
                borderRadius: 8
              }}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

const formatNumber = (num) => {
  if (!num) return '-';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
};

const formatFinancialValue = (key, value) => {
  if (typeof value !== 'number') return '-';
  if (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('return')) {
    return `${value.toFixed(2)}`;
  }
  if (value >= 1e9) return `${(value/1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value/1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value/1e3).toFixed(1)}K`;
  return value.toFixed(2);
};

const getTrendClass = (value) => {
  if (value > 0) return 'positive-trend';
  if (value < 0) return 'negative-trend';
  return '';
};

const renderTrendArrow = (value) => {
  if (value > 0) return <span className="trend-arrow">▲</span>;
  if (value < 0) return <span className="trend-arrow">▼</span>;
  return null;
};

export default StockDetailsPage;