// src/components/Metrics/PortfolioDistributionChart/PortfolioDistributionChart.js

import React, { useEffect, useState } from 'react';
import { getUserPortfolio } from '../../../api/userApi';
import { Pie, Bar } from 'react-chartjs-2';
import { Card, Typography, CircularProgress, Alert } from '@mui/material';
import Box from '@mui/material/Box';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import './PortfolioDistributionChart.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const PortfolioDistributionChart = () => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [sectorData, setSectorData] = useState({});
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch portfolio data on component mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await getUserPortfolio();
        setPortfolioData(data);
        processSectorData(data);
        processStockData(data);
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Process sector distribution data
  const processSectorData = (data) => {
    const sectorMap = {};

    data.forEach((position) => {
      const { sector, sector_percentage } = position;
      // Assume sector_percentage is consistent across the same sector
      if (!sectorMap[sector]) {
        sectorMap[sector] = sector_percentage;
      }
    });

    // Prepare data for Pie chart
    setSectorData({
      labels: Object.keys(sectorMap),
      datasets: [
        {
          label: 'Sector Distribution (%)',
          data: Object.values(sectorMap).map((val) => parseFloat(val.toFixed(2))),
          backgroundColor: generateColors(Object.keys(sectorMap).length),
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
        },
      ],
    });
  };

  // Process stock allocation data for Stacked Bar Chart
  const processStockData = (data) => {
    const stockMap = {};

    data.forEach((position) => {
      const { stock_ticker, direction, stock_percentage } = position;
      if (!stockMap[stock_ticker]) {
        stockMap[stock_ticker] = { LONG: 0, SHORT: 0 };
      }
      if (direction === 'LONG') {
        stockMap[stock_ticker].LONG += stock_percentage;
      } else if (direction === 'SHORT') {
        stockMap[stock_ticker].SHORT += stock_percentage;
      }
    });

    const stockLabels = Object.keys(stockMap);
    const longData = stockLabels.map((ticker) => parseFloat(stockMap[ticker].LONG.toFixed(2)));
    const shortData = stockLabels.map((ticker) => parseFloat(stockMap[ticker].SHORT.toFixed(2)));

    // Prepare data for Stacked Bar chart
    setStockData({
      labels: stockLabels,
      datasets: [
        {
          label: 'LONG (%)',
          data: longData,
          backgroundColor: 'rgba(62, 149, 205, 0.8)', // Blue for LONG
          borderColor: 'rgba(62, 149, 205, 1)',
          borderWidth: 1,
        },
        {
          label: 'SHORT (%)',
          data: shortData,
          backgroundColor: 'rgba(205, 62, 62, 0.8)', // Red for SHORT
          borderColor: 'rgba(205, 62, 62, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  // Utility function to generate colors for Pie chart
  const generateColors = (num) => {
    const colors = [];
    const colorPalette = [
      '#5087f0', // Primary
      '#f2994a', // Secondary
      '#62d49f', // Success
      '#e57373', // Error
      '#f2c94c', // Warning
      '#9b51e0', // Purple
      '#56CCF2', // Light Blue
      '#FF6B6B', // Coral
      '#4ECDC4', // Turquoise
      '#C7F464', // Lime
    ];

    for (let i = 0; i < num; i++) {
      colors.push(colorPalette[i % colorPalette.length]);
    }

    return colors;
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="error-container">
        <Alert severity="error">Failed to load portfolio data. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box className="portfolio-distribution-container">
      {/* Sector Distribution Pie Chart */}
      <Card className="chart-card">
        <Typography variant="h6" className="card-title">
          Sector Distribution
        </Typography>
        {sectorData.labels && sectorData.labels.length > 0 ? (
          <Box className="chart-container">
            <Pie
              data={sectorData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      color: 'white',
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value}%`;
                      },
                    },
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleColor: 'white',
                    bodyColor: 'white',
                  },
                },
                elements: {
                  arc: {
                    borderWidth: 0,
                  },
                },
                layout: {
                  padding: {
                    top: 0,
                    bottom: 0,
                    left: 125,
                    right: 125,
                  },
                },
                cutout: '45%',
                radius: '98%',
              }}
              height={200}
            />
          </Box>
        ) : (
          <Typography variant="body1" className="no-data">
            No sector data available.
          </Typography>
        )}
      </Card>

      {/* Stock Allocation Stacked Bar Chart */}
      <Card className="chart-card">
        <Typography variant="h6" className="card-title">
          Stock Allocation
        </Typography>
        {stockData.labels && stockData.labels.length > 0 ? (
          <Bar
            data={stockData}
            options={{
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    color: 'white',
                  },
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      const label = context.dataset.label || '';
                      const value = context.parsed.x || 0;
                      return `${label}: ${value}%`;
                    },
                  },
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  titleColor: 'white',
                  bodyColor: 'white',
                },
              },
              scales: {
                x: {
                  stacked: true,
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    callback: (value) => `${value}%`,
                    color: 'white',
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                  title: {
                    display: true,
                    text: 'Percentage (%)',
                    color: 'white',
                  },
                },
                y: {
                  stacked: true,
                  ticks: {
                    color: 'white',
                  },
                  grid: {
                    display: false,
                  },
                  title: {
                    display: true,
                    text: 'Stock Ticker',
                    color: 'white',
                  },
                },
              },
            }}
            height={200}
          />
        ) : (
          <Typography variant="body1" className="no-data">
            No stock allocation data available.
          </Typography>
        )}
      </Card>
    </Box>
  );
};

export default PortfolioDistributionChart;
