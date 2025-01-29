// src/components/Social/FriendDetails/FriendDetails.js
import React, { useEffect, useState, useCallback } from 'react';
import { getFriendSummary } from '../../../api/userApi';
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  MenuItem,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Pagination
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Search,
  Sort,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import './FriendDetails.css';

const ITEMS_PER_PAGE = 5;

const FriendDetails = ({ friend_username }) => {
  const [friendSummary, setFriendSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedTicker, setExpandedTicker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [holdingsPage, setHoldingsPage] = useState(1);

  useEffect(() => {
    const fetchFriendSummary = async () => {
      try {
        const data = await getFriendSummary(friend_username);
        if (data.success) {
          setFriendSummary(data);
        } else {
          setError(true);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching friend summary:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchFriendSummary();
  }, [friend_username]);

  const handleSortChange = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredTransactions = useCallback(() => {
    let filtered = friendSummary?.transactions || [];
    
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.stock_ticker.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const multiplier = sortConfig.direction === 'asc' ? 1 : -1;
      switch (sortConfig.key) {
        case 'date':
          return multiplier * (new Date(a.created_at) - new Date(b.created_at));
        case 'ticker':
          return multiplier * a.stock_ticker.localeCompare(b.stock_ticker);
        case 'amount':
          return multiplier * (a.quantity * a.execution_price - b.quantity * b.execution_price);
        default:
          return 0;
      }
    });
  }, [friendSummary, searchQuery, sortConfig]);

  const paginatedTransactions = filteredTransactions().slice(
    (transactionsPage - 1) * ITEMS_PER_PAGE,
    transactionsPage * ITEMS_PER_PAGE
  );

  const holdings = Object.entries(friendSummary?.trade_summary?.ticker_summaries || {});
  const paginatedHoldings = holdings.slice(
    (holdingsPage - 1) * ITEMS_PER_PAGE,
    holdingsPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <Box className="friend-details-loading">
        <CircularProgress className="circular-progress" size={60} />
      </Box>
    );
  }

  if (error || !friendSummary) {
    return (
      <Typography variant="body1" className="error-message">
        Failed to load friend details.
      </Typography>
    );
  }

  const { portfolio, trade_summary } = friendSummary;

  return (
    <Box className="friend-details">
      {/* Header Section */}
      <Box className="friend-header">
        <Typography variant="h5" className="detail-title">
          {friend_username}
        </Typography>
        <Box className="portfolio-stats">
          <div className="stat-item">
            <TrendingUp className="stat-icon positive" />
            <div>
              <span className="stat-label">Total Profit</span>
              <span className="stat-value positive">
                ${trade_summary.total_realized_pl}
              </span>
            </div>
          </div>
          <div className="stat-item">
            <TrendingDown className="stat-icon negative" />
            <div>
              <span className="stat-label">Total Loss</span>
              <span className="stat-value negative">
                ${Math.abs(trade_summary.total_unrealized_pl - trade_summary.total_realized_pl)}
              </span>
            </div>
          </div>
        </Box>
      </Box>

      {/* Key Metrics Grid */}
      <Box className="portfolio-grid">
        <Box className="portfolio-item">
          <strong>Holding Value</strong>
          <Typography variant="body2" className="highlight-number">
            {portfolio.holding_value}
          </Typography>
        </Box>
        <Box className="portfolio-item">
          <strong>Unrealised PnL</strong>
          <Typography 
            variant="body2" 
            className="highlight-number"
            style={{ color: portfolio.unrealised_pnl >= 0 
              ? 'var(--color-success)!important' 
              : 'var(--color-error)!important' }}
          >
            {portfolio.unrealised_pnl}
          </Typography>
        </Box>
        <Box className="portfolio-item">
          <strong>Available Cash</strong>
          <Typography variant="body2" className="highlight-number">
            {portfolio.cash}
          </Typography>
        </Box>
      </Box>

      {/* Transactions Section */}
      <Box className="transactions-section">
        <Box className="section-header">
          <Typography variant="h6" className="section-title">
            Recent Transactions
          </Typography>
          <Box className="controls">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Filter by ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='filter-input'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              value={sortConfig.key}
              onChange={(e) => handleSortChange(e.target.value)}
              className='filter-input'
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Sort />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="ticker">Ticker</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
            </TextField>
          </Box>
        </Box>

        <List className="transactions-list">
          {paginatedTransactions.map(transaction => (
            <ListItem key={transaction.id} className="transaction-item">
              <ListItemText
                primary={
                  <Box className="transaction-content">
                    <span className={`direction-indicator ${transaction.direction}`}>
                      {transaction.direction.toUpperCase()}
                    </span>
                    <span className="ticker">{transaction.stock_ticker}</span>
                    <span className="quantity">{transaction.quantity} shares</span>
                  </Box>
                }
                secondary={
                  <Box className="transaction-details">
                    <span className="price">${transaction.execution_price}</span>
                    <span className="date">
                      {new Date(transaction.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        <Pagination
          count={Math.ceil(filteredTransactions().length / ITEMS_PER_PAGE)}
          page={transactionsPage}
          onChange={(_, page) => setTransactionsPage(page)}
          color="primary"
          className="pagination"
        />
      </Box>

      {/* Holdings Section */}
      <Box className="holdings-section">
        <Box className="section-header">
          <Typography variant="h6" className="section-title">
            Asset Allocation
          </Typography>
          <Box className="diversification-summary">
            <div className="diversification-item">
              <span className="dot large"></span>
              <span>{holdings.length} Assets</span>
            </div>
            <div className="diversification-item">
              <span className="dot medium"></span>
              <span>Top 3: {holdings.slice(0,3).map(h => h[0]).join(', ')}</span>
            </div>
          </Box>
        </Box>

        <List className="holdings-list">
          {paginatedHoldings.map(([ticker, summary]) => (
            <ListItem key={ticker} className="ticker-summary-item">
              <ListItemText
                primary={
                  <Box 
                    className="holding-header"
                    onClick={() => setExpandedTicker(expandedTicker === ticker ? null : ticker)}
                  >
                    <Typography variant="subtitle1" className="ticker-name">
                      {ticker}
                      <span className="pl-badge" style={{
                        backgroundColor: summary.unrealized_pl >= 0 ? 
                          'var(--color-success)' : 'var(--color-error)'
                      }}>
                        ${summary.unrealized_pl}
                      </span>
                    </Typography>
                    {expandedTicker === ticker ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                }
                secondary={
                  <Collapse in={expandedTicker === ticker}>
                    <Box className="holding-details-grid">
                      <div className="holding-metric">
                        <span>Quantity</span>
                        <strong>{summary.quantity}</strong>
                      </div>
                      <div className="holding-metric">
                        <span>Avg Cost</span>
                        <strong>${summary.avg_cost}</strong>
                      </div>
                      <div className="holding-metric">
                        <span>Current Price</span>
                        <strong>${summary.current_price}</strong>
                      </div>
                      <div className="holding-metric">
                        <span>Invested</span>
                        <strong>${summary.invested_cost_basis}</strong>
                      </div>
                      <div className="holding-metric">
                        <span>Market Value</span>
                        <strong>${summary.current_value}</strong>
                      </div>
                      <div className="holding-metric">
                        <span>Weight</span>
                        <strong>
                          {((summary.current_value / trade_summary.portfolio_value) * 100).toFixed(1)}%
                        </strong>
                      </div>
                    </Box>
                  </Collapse>
                }
              />
            </ListItem>
          ))}
        </List>

        <Pagination
          count={Math.ceil(holdings.length / ITEMS_PER_PAGE)}
          page={holdingsPage}
          onChange={(_, page) => setHoldingsPage(page)}
          color="primary"
          className="pagination"
        />
      </Box>
    </Box>
  );
};

export default FriendDetails;