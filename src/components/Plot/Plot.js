import React from 'react';
import './Plot.css';
import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Plot({ type, stock_name, price_data, portfolio_data }) {
  // Function to format datetime strings to Date objects
  const formatDate = (datetimeStr) => new Date(datetimeStr);

  // Prepare data for STOCK type
  const prepareStockData = () => {
    if (!price_data || !Array.isArray(price_data)) {
      console.error('Invalid price_data provided for STOCK type.');
      return { data: {}, options: {} };
    }

    const parsedData = price_data.map((data) => ({
      datetime: formatDate(data.datetime),
      close: data.close || 0,
      volume: data.volume || 0,
    }));

    const stockLabels = parsedData.map((data) =>
      data.datetime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    const stockPrices = parsedData.map((data) => data.close);
    const stockVolumes = parsedData.map((data) => data.volume);

    const stockChartData = {
      labels: stockLabels,
      datasets: [
        {
          type: 'line',
          label: `${stock_name} Price`,
          data: stockPrices,
          borderColor: 'rgba(0, 204, 255, 1)',
          backgroundColor: 'rgba(0, 204, 255, 0.2)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Volume',
          data: stockVolumes,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderWidth: 0,
          yAxisID: 'y1',
        },
      ],
    };

    const stockOptions = {
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
          text: `${stock_name} Price and Volume`,
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
            text: 'Price ($)',
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
          },
          title: {
            display: true,
            text: 'Volume',
            color: '#ffffff',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },
      },
    };

    return { data: stockChartData, options: stockOptions };
  };

  // Prepare data for PORTFOLIO type
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

    const portfolioLabels = mergedData.map((data) =>
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

    const portfolioChartData = {
      labels: portfolioLabels,
      datasets: [
        {
          type: 'line',
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
        {
          type: 'line',
          label: 'Unrealised PnL',
          data: unrealisedPnl,
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          type: 'line',
          label: 'Cash',
          data: cashValues,
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          type: 'line',
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

    const portfolioOptions = {
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

    return { data: portfolioChartData, options: portfolioOptions };
  };

  // Determine which data and options to use based on the type prop
  const { data, options } = type === 'PORTFOLIO' ? preparePortfolioData() : prepareStockData();

  return (
    <div className="plot-container">
      <div className="price-chart-card">
        {/* Only render the chart if data is available */}
        {data && Object.keys(data).length > 0 && (
          <Line data={data} options={options} style={{ width: '100%', height: '100%' }} />
        )}
        {/* Optionally, you can render a message if no data is available */}
        {(!data || Object.keys(data).length === 0) && (
          <p style={{ color: '#ffffff', textAlign: 'center' }}>No data available to display.</p>
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
      // Further validation can be added here for the structure of price_data
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
      // Further validation can be added here for the structure of portfolio_data
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
