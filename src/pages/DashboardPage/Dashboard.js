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
import { 
  getUserPortfolio, 
  getUserFunds, 
  getUserPortfolioHistory 
} from '../../api/userApi';
import { getStockHistorical } from '../../api/stockApi'; // you have to create or have it

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

  // For showing a stock plot
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(null);
  const [selectedStockPlotData, setSelectedStockPlotData] = useState(null);

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
        pnl = (avgCost - ltp) * qty; // SHORT
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
        dayChange: 0, 
      };
    });

    setPositions(merged);

    // Summaries
    let totalInv = 0;
    let currVal = 0;
    let dayProfit = 0;
    let unrlzdPnL = 0;

    merged.forEach((m) => {
      const cost = (m.execution_price || 0) * (m.quantity || 0);
      totalInv += cost;
      currVal += m.curValue;
      unrlzdPnL += m.pnl;
    });

    const totalPortfolioValue = currVal + funds;
    setPortfolioMetrics({
      totalInvestment: totalInv,
      currentValue: currVal,
      dayPnL: dayProfit,
      unrealizedPnL: unrlzdPnL,
      totalPortfolioValue,
    });
  }, [portfolioRaw, prices, funds]);

  // 4) Show stock plot
  // fetch /stock/historical for last 3 months, pass data to Plot
  const handleShowPlot = async (ticker) => {
    try {
      setSelectedStockSymbol(ticker.toUpperCase());
      // Build 3-month date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(endDate.getMonth() - 3);

      // Format as YYYY-MM-DD
      const yyyyEnd = endDate.getFullYear();
      const mmEnd = String(endDate.getMonth() + 1).padStart(2, '0');
      const ddEnd = String(endDate.getDate()).padStart(2, '0');
      const endDateStr = `${yyyyEnd}-${mmEnd}-${ddEnd}`;

      const yyyySt = startDate.getFullYear();
      const mmSt = String(startDate.getMonth() + 1).padStart(2, '0');
      const ddSt = String(startDate.getDate()).padStart(2, '0');
      const startDateStr = `${yyyySt}-${mmSt}-${ddSt}`;

      // resolution=1day
      const histData = await getStockHistorical(ticker, startDateStr, endDateStr, '1day');

      // histData might be an array of candle data: { datetime, open, high, low, close, volume }
      setSelectedStockPlotData(histData);
    } catch (err) {
      console.error('Error fetching stock historical:', err);
      setSelectedStockPlotData(null);
    }
  };

  return (
    <Box className="dashboard-container">
      <Box className="dashboard-watchlist">
        <Watchlist
          refreshPortfolio={refreshPortfolio}
          onShowPlot={handleShowPlot}
        />
      </Box>

      <Box className="dashboard-main">
        <Box className="dashboard-top-row">
          <Box className="dashboard-plot">
            {/* If we have selectedStockPlotData => show Plot for that stock */}
            {selectedStockSymbol && selectedStockPlotData ? (
              <Plot
                type="STOCK"
                stock_name={selectedStockSymbol}
                price_data={selectedStockPlotData}
              />
            ) : portfolioHistory ? (
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
