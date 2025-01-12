// src/components/PortfolioMetrics/PortfolioMetrics.js

import React from 'react';
import './PortfolioMetrics.css';
import { Box, Typography } from '@mui/material';

function PortfolioMetrics() {
  const metrics = [
    { name: 'Total Investment', value: '$50,000' },
    { name: 'Current Value', value: '$55,000' },
    { name: 'Day PnL', value: '+$500' },
    { name: 'Unrealised PnL', value: '+$5,000' },
    { name: 'Available Funds', value: '+$500' },
    { name: 'Total Portfolio Value', value: '+$5,500' },
  ];

  return (
    <Box className="portfolio-metrics-card">
      {metrics.map((metric, index) => (
        <React.Fragment key={index}>
          <Box className="metric-item">
            <Typography className="metric-name">{metric.name}</Typography>
            <Typography className="metric-value">{metric.value}</Typography>
          </Box>
          {index < metrics.length - 1 && <Box className="metric-divider"></Box>}
        </React.Fragment>
      ))}
    </Box>
  );
}

export default PortfolioMetrics;
