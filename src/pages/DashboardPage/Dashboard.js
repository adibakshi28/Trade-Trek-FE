// src/pages/Dashboard/Dashboard.js

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

import { AuthContext } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';

// Child components
import Watchlist from '../../components/Watchlist/Watchlist/Watchlist';
import UserPortfolio from '../../components/UserPortfolio/UserPortfolio';
import PortfolioMetrics from '../../components/PortfolioMetrics/PortfolioMetrics';
import Plot from '../../components/Plot/Plot';

// APIs
import { getUserPortfolio, getUserFunds, getUserPortfolioHistory } from '../../api/userApi';

import './Dashboard.css';

export default function Dashboard() {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const { sendMessage, prices } = useWebSocket();

  // Portfolio data
  const [portfolioRaw, setPortfolioRaw] = useState([]);
  const [funds, setFunds] = useState(0);
  const [portfolioHistory, setPortfolioHistory] = useState(null);

  // Derived
  const [positions, setPositions] = useState([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState({
    totalInvestment: 0,
    currentValue: 0,
    dayPnL: 0,
    unrealizedPnL: 0,
    totalPortfolioValue: 0,
  });

  // On mount, check auth
  useEffect(() => {
    if (!isAuthLoading && !accessToken) {
      navigate('/login');
    }
  }, [accessToken, isAuthLoading, navigate]);

  // Subscribe & fetch data
  useEffect(() => {
    sendMessage({ type: 'subscribe_portfolio_watchlist' });
    refreshPortfolio();

    return () => {
      sendMessage({ type: 'unsubscribe_all' });
    };
  }, [sendMessage]);

  // Reusable function to fetch portfolio, funds, history
  const refreshPortfolio = async () => {
    await Promise.all([
      fetchPortfolio(),
      fetchFunds(),
      fetchPortfolioHistory(),
    ]);
  };

  // 1) get portfolio
  const fetchPortfolio = async () => {
    try {
      const data = await getUserPortfolio();
      setPortfolioRaw(data);
    } catch (err) {
      console.error('Error fetching user portfolio:', err);
    }
  };

  // 2) get funds
  const fetchFunds = async () => {
    try {
      const data = await getUserFunds();
      setFunds(data.cash);
    } catch (err) {
      console.error('Error fetching user funds:', err);
    }
  };

  // 3) get portfolio history
  const fetchPortfolioHistory = async () => {
    try {
      const data = await getUserPortfolioHistory();
      setPortfolioHistory(data);
    } catch (err) {
      console.error('Error fetching portfolio history:', err);
    }
  };

  // Merge real-time LTP => P&L
  useEffect(() => {
    const merged = portfolioRaw.map((pos) => {
      const symbol = pos.stock_ticker.toUpperCase();
      const wsData = prices[symbol]; // { ltp, day_change } or undefined
      const ltp = wsData ? Number(wsData.ltp) : pos.execution_price;

      const qty = pos.quantity || 0;
      const direction = (pos.direction || 'LONG').toUpperCase();
      const avgCost = Number(pos.execution_price || 0);

      let pnl = 0;
      if (direction === 'LONG') {
        pnl = (ltp - avgCost) * qty;
      } else {
        // SHORT
        pnl = (avgCost - ltp) * qty;
      }
      const curValue = ltp * qty;

      const cost = avgCost * qty;
      const netChgPct = cost !== 0 ? (pnl / cost) * 100 : 0;

      return {
        ...pos,
        ltp,
        pnl,
        curValue,
        netChg: netChgPct,
        dayChange: 0, // or from wsData.day_change if you want daily changes
      };
    });

    setPositions(merged);

    // Summaries
    let totalInvestment = 0;
    let currentValue = 0;
    let dayProfit = 0;
    let unrlzdPnL = 0;

    merged.forEach((m) => {
      const qty = m.quantity || 0;
      const cost = m.execution_price * qty;
      totalInvestment += cost;
      currentValue += m.curValue;
      unrlzdPnL += m.pnl;
      // dayProfit += ...
    });

    const totalPortfolioValue = currentValue + funds;
    setPortfolioMetrics({
      totalInvestment,
      currentValue,
      dayPnL: dayProfit,
      unrealizedPnL: unrlzdPnL,
      totalPortfolioValue,
    });
  }, [portfolioRaw, prices, funds]);

  return (
    <Box className="dashboard-container">
      <Box className="dashboard-watchlist">
        {/* Pass refreshPortfolio so that after a trade, watchlist can refresh */}
        <Watchlist refreshPortfolio={refreshPortfolio} />
      </Box>

      <Box className="dashboard-main">
        <Box className="dashboard-top-row">
          <Box className="dashboard-plot">
            {portfolioHistory ? (
              <Plot type="PORTFOLIO" portfolio_data={portfolioHistory} />
            ) : (
              <p style={{ color: 'white' }}>Loading Portfolio Overview...</p>
            )}
          </Box>

          <Box className="dashboard-portfolio-metrics">
            <PortfolioMetrics metrics={portfolioMetrics} funds={funds} />
          </Box>
        </Box>

        <Box className="dashboard-user-portfolio">
          <UserPortfolio positions={positions} />
        </Box>
      </Box>
    </Box>
  );
}
