// src/pages/Dashboard/Dashboard.js

import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import Watchlist from '../../components/Watchlist/Watchlist/Watchlist';
import PortfolioMetrics from '../../components/PortfolioMetrics/PortfolioMetrics';
import Plot from '../../components/Plot/Plot';
import UserPortfolio from '../../components/UserPortfolio/UserPortfolio';
import './Dashboard.css';

const Dashboard = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && !accessToken) {
      navigate('/login');
    }
  }, [accessToken, isAuthLoading, navigate]);

  return (
    <Box className="dashboard-container">
      <Box className="dashboard-watchlist">
        <Watchlist />
      </Box>
      <Box className="dashboard-main">
        <Box className="dashboard-top-row">
          <Box className="dashboard-plot">
            <Plot type="stock" />
          </Box>
          <Box className="dashboard-portfolio-metrics">
            <PortfolioMetrics />
          </Box>
        </Box>
        <Box className="dashboard-user-portfolio">
          <UserPortfolio />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
