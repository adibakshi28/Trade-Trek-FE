// src/pages/StockDetailsPage/StockDetailsPage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStockInfo } from '../../api/stockApi';
import {
  Box,
  Typography,
  CircularProgress,
  Avatar,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip as MuiTooltip,
  Card,
} from '@mui/material';
import './StockDetailsPage.css';

const StockDetailsPage = () => {
  const { ticker } = useParams();
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStockData = async () => {
    try {
      const data = await getStockInfo(ticker);
      setStockData(data);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [ticker]);

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !stockData) {
    return (
      <Box className="error-container">
        <Typography variant="h6" color="error">
          Failed to load stock data. Please try again later.
        </Typography>
      </Box>
    );
  }

  const { profile, quote, news, financials } = stockData;

  return (
    <Box className="page-container">
      {/* Scrollable Card Container */}
      <Card className="scrollable-card">
        {/* Header Section */}
        <Paper className="header-section">
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                src={profile.logo}
                alt={`${profile.name} Logo`}
                className="stock-avatar"
              />
            </Grid>
            <Grid item>
              <Typography variant="h4" className="stock-name">
                {profile.name} ({profile.ticker})
              </Typography>
              <Typography variant="subtitle1" className="stock-industry">
                {profile.finnhubIndustry}
              </Typography>
              <Typography variant="subtitle2" className="stock-exchange">
                Exchange: {profile.exchange}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Quote Section */}
        <Paper className="quote-section">
          <Typography variant="h6" className="section-title">
            Current Quote
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body1" className="quote-text">
                <strong>Price:</strong> ${quote.c.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="body1"
                className={`quote-change ${
                  quote.d >= 0 ? 'positive-change' : 'negative-change'
                }`}
              >
                <strong>Change:</strong> {quote.d >= 0 ? `+${quote.d}` : quote.d} ({quote.dp.toFixed(2)}%)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body1" className="quote-text">
                <strong>High:</strong> ${quote.h}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body1" className="quote-text">
                <strong>Low:</strong> ${quote.l}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body1" className="quote-text">
                <strong>Open:</strong> ${quote.o}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body1" className="quote-text">
                <strong>Previous Close:</strong> ${quote.pc}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body1" className="quote-text">
                <strong>Timestamp:</strong> {new Date(quote.t * 1000).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Financials Section */}
        <Paper className="financials-section">
          <Typography variant="h6" className="section-title">
            Financials
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(financials).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Typography variant="body1" className="financials-text">
                  <strong>{formatFinancialKey(key)}:</strong> {value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* News Section */}
        <Paper className="news-section">
          <Typography variant="h6" className="section-title">
            Latest News
          </Typography>
          <List>
            {news.map((article) => (
              <React.Fragment key={article.id}>
                <ListItem
                  alignItems="flex-start"
                  button
                  component="a"
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-list-item"
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" className="news-headline">
                        {article.headline}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          className="news-meta"
                        >
                          {new Date(article.datetime * 1000).toLocaleString()} - {article.source}
                        </Typography>
                        <br />
                        <Typography variant="body2" className="news-summary">
                          {article.summary}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" className="news-divider" />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Card>
    </Box>
  );
};

// Helper function to format financial keys (e.g., 'marketCapitalization' to 'Market Capitalization')
const formatFinancialKey = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
};

export default StockDetailsPage;
