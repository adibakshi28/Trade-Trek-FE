// src/components/Plot/Plot.js

import React from 'react';
import './Plot.css';
import PropTypes from 'prop-types';

// Import ApexCharts for STOCK type
import ReactApexChart from 'react-apexcharts';

// Import Chart.js components for PORTFOLIO type
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
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns'; // Date adapter for Chart.js

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend,
  Filler,
  TimeScale,
  CandlestickController,
  CandlestickElement
);

function Plot({ type, stock_name, price_data, portfolio_data }) {
  // Function to format datetime strings to Date objects
  const formatDate = (datetimeStr) => new Date(datetimeStr);

  // === STOCK Type: ApexCharts Candlestick + Volume ===
  const prepareStockData = () => {
    if (!price_data || !Array.isArray(price_data)) {
      console.error('Invalid price_data provided for STOCK type.');
      return { series: [], options: {} };
    }

    // Sort price_data by datetime ascending
    const sortedPriceData = [...price_data].sort(
      (a, b) => new Date(a.datetime) - new Date(b.datetime)
    );

    // Format data for ApexCharts
    const ohlcData = sortedPriceData.map((data) => ({
      x: formatDate(data.datetime),
      y: [data.open, data.high, data.low, data.close],
    }));

    const volumeData = sortedPriceData.map((data) => ({
      x: formatDate(data.datetime),
      y: data.volume,
    }));

    const series = [
      {
        name: 'OHLC',
        type: 'candlestick',
        data: ohlcData,
      },
      {
        name: 'Volume',
        type: 'column',
        data: volumeData,
      },
    ];

    const options = {
      chart: {
        type: 'candlestick',
        height: 410,
        background: 'var(--color-surface)', 
        toolbar: {
          show: true,
          tools: {
            zoom: true,
            zoomin: true,
            zoomout: true,
            reset: true,
          },
        },
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: true,
        },
      },
      title: {
        text: `${stock_name} Price and Volume`,
        align: 'center', // Align title to center
        style: {
          color: 'var(--color-text-primary)', // White color for title
          fontSize: '18px',
          fontWeight: 'bold',
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: 'var(--color-text-secondary)', // Light gray color for labels
            fontSize: '10px',
          },
        },
        tooltip: {
          enabled: true,
          x: {
            format: 'MMM dd, yyyy',
          },
        },
      },
      yaxis: [
        {
          title: {
            text: 'Price ($)',
            style: {
              color: 'var(--color-text-primary)', // White color for Y-axis title
              fontSize: '14px',
              fontWeight: 'bold',
            },
          },
          labels: {
            style: {
              colors: 'var(--color-text-secondary)', // Light gray color for Y-axis labels
              fontSize: '12px',
            }
          },
        },
        {
          opposite: true,
          title: {
            text: 'Volume',
            style: {
              color: 'var(--color-text-primary)', // White color for Y1-axis title
              fontSize: '14px',
              fontWeight: 'bold',
            },
          },
          labels: {
            style: {
              colors: 'var(--color-text-secondary)', // Light gray color for Y1-axis labels
              fontSize: '12px',
            }
          },
        },
      ],
      tooltip: {
        theme: 'dark', // Dark theme for tooltips
        x: {
          format: 'MMM dd, yyyy',
        },
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: 'var(--color-success)', // Green for upward candles
            downward: 'var(--color-error)', // Red for downward candles
          },
        },
        bar: {
          columnWidth: '80%', // Adjust as needed
        },
      },
      colors: ['#00E396', '#FEB019'], // Colors for OHLC and Volume
      theme: {
        mode: 'dark', // Dark theme
      },
    };

    return { series, options };
  };

  // === PORTFOLIO Type: Chart.js Line Chart ===
  const preparePortfolioData = () => {
    if (
      !portfolio_data ||
      !portfolio_data.portfolio_history ||
      !Array.isArray(portfolio_data.portfolio_history) ||
      !portfolio_data.stock_index ||
      !portfolio_data.stock_index_history ||
      !Array.isArray(portfolio_data.stock_index_history)
    ) {
      console.error('Invalid portfolio_data provided for PORTFOLIO type.');
      return { data: {}, options: {} };
    }

    const { portfolio_history, stock_index, stock_index_history } = portfolio_data;

    // Ensure both histories have the same length
    const minLength = Math.min(portfolio_history.length, stock_index_history.length);
    const trimmedPortfolioHistory = portfolio_history.slice(0, minLength);
    const trimmedStockIndexHistory = stock_index_history.slice(0, minLength);

    // Merge portfolio_history and stock_index_history based on index
    const mergedData = trimmedPortfolioHistory.map((ph, index) => {
      const si = trimmedStockIndexHistory[index] || {};
      return {
        datetime: formatDate(ph.timestamp),
        holding_value: ph.holding_value,
        unrealised_pnl: ph.unrealised_pnl,
        cash: ph.cash,
        price: si.price || 0,
      };
    });

    const labels = mergedData.map((data) =>
      data.datetime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    const holdingValues = mergedData.map((data) => data.holding_value);
    const unrealisedPnl = mergedData.map((data) => data.unrealised_pnl);
    const cashValues = mergedData.map((data) => data.cash);
    const indexPrices = mergedData.map((data) => data.price);

    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Holding Value',
          data: holdingValues,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        // {
        //   label: 'Unrealised PnL',
        //   data: unrealisedPnl,
        //   borderColor: 'rgba(255, 206, 86, 1)',
        //   backgroundColor: 'rgba(255, 206, 86, 0.2)',
        //   borderWidth: 2,
        //   pointRadius: 0,
        //   tension: 0.4,
        //   fill: true,
        //   yAxisID: 'y',
        // },
        // {
        //   label: 'Cash',
        //   data: cashValues,
        //   borderColor: 'rgba(153, 102, 255, 1)',
        //   backgroundColor: 'rgba(153, 102, 255, 0.2)',
        //   borderWidth: 2,
        //   pointRadius: 0,
        //   tension: 0.4,
        //   fill: true,
        //   yAxisID: 'y',
        // },
        {
          label: `${stock_index} Price`,
          data: indexPrices,
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          yAxisID: 'y1',
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#ffffff',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(20, 20, 30, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
        },
        title: {
          display: true,
          text: 'Portfolio Overview',
          color: '#ffffff',
          font: {
            size: 18,
            weight: 'bold',
          },
          padding: {
            top: 5,
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: '#cccccc',
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          position: 'left',
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            color: '#cccccc',
            font: { size: 12 },
            callback: function (value) {
              return `$${value}`;
            },
          },
          title: {
            display: true,
            text: 'Value ($)',
            color: '#ffffff',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
        y1: {
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: '#cccccc',
            font: { size: 12 },
            callback: function (value) {
              return `$${value}`;
            },
          },
          title: {
            display: true,
            text: `${stock_index} Price ($)`,
            color: '#ffffff',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
      },
    };

    return { data, options };
  };

  // Prepare data based on the type prop
  const stockData = type === 'STOCK' ? prepareStockData() : null;
  const portfolioDataPrepared = type === 'PORTFOLIO' ? preparePortfolioData() : null;

  return (
    <div className="plot-container">
      <div className="price-chart-card">
        {/* Render STOCK Type Chart using ApexCharts */}
        {type === 'STOCK' && stockData && stockData.series.length > 0 && (
          <ReactApexChart
            options={stockData.options}
            series={stockData.series}
            type="candlestick"
            height={410} // Set to 410 as per user observation
          />
        )}
        {/* Render PORTFOLIO Type Chart using Chart.js */}
        {type === 'PORTFOLIO' && portfolioDataPrepared && portfolioDataPrepared.data && (
          <Line
            data={portfolioDataPrepared.data}
            options={portfolioDataPrepared.options}
            height={600} // Adjust as needed
          />
        )}
        {/* Optional: Render a message if no data is available */}
        {type === 'STOCK' &&
          (!stockData ||
            !stockData.series ||
            stockData.series.length === 0) && (
            <p style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>No STOCK data available to display.</p>
          )}
        {type === 'PORTFOLIO' &&
          (!portfolioDataPrepared || !portfolioDataPrepared.data) && (
            <p style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>No PORTFOLIO data available to display.</p>
          )}
      </div>
    </div>
  );
}

// Define prop types for better type checking
Plot.propTypes = {
  type: PropTypes.oneOf(['STOCK', 'PORTFOLIO']).isRequired,
  // Props for STOCK type
  stock_name: (props, propName, componentName) => {
    if (props.type === 'STOCK' && typeof props[propName] !== 'string') {
      return new Error(
        `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected a string when type is 'STOCK'.`
      );
    }
    return null;
  },
  price_data: (props, propName, componentName) => {
    if (props.type === 'STOCK') {
      if (!props[propName] || !Array.isArray(props[propName])) {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected an array when type is 'STOCK'.`
        );
      }
      // Further validation for the structure of price_data
      for (let i = 0; i < props[propName].length; i++) {
        const item = props[propName][i];
        if (
          !item.datetime ||
          typeof item.open !== 'number' ||
          typeof item.high !== 'number' ||
          typeof item.low !== 'number' ||
          typeof item.close !== 'number' ||
          typeof item.volume !== 'number'
        ) {
          return new Error(
            `Invalid data structure in \`${propName}\` at index ${i} supplied to \`${componentName}\`. Each item must have datetime (string), open (number), high (number), low (number), close (number), and volume (number).`
          );
        }
      }
    }
    return null;
  },
  // Props for PORTFOLIO type
  portfolio_data: (props, propName, componentName) => {
    if (props.type === 'PORTFOLIO') {
      if (!props[propName] || typeof props[propName] !== 'object') {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected an object when type is 'PORTFOLIO'.`
        );
      }
      // Further validation for the structure of portfolio_data
      const { portfolio_history, stock_index, stock_index_history } = props[propName];
      if (!Array.isArray(portfolio_history) || !Array.isArray(stock_index_history)) {
        return new Error(
          `Invalid structure in \`${propName}\` supplied to \`${componentName}\`. Expected portfolio_history and stock_index_history to be arrays.`
        );
      }
      if (typeof stock_index !== 'string') {
        return new Error(
          `Invalid structure in \`${propName}\` supplied to \`${componentName}\`. Expected stock_index to be a string.`
        );
      }
      // Additional checks can be added as needed
    }
    return null;
  },
};

// Define default props (optional)
Plot.defaultProps = {
  type: 'STOCK',
  stock_name: 'Default Stock',
  price_data: [],
  portfolio_data: null,
};

export default Plot;
