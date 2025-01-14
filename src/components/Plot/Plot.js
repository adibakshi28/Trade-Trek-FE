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

/**
 * Plot component that handles:
 *  - type="STOCK": Candlestick chart with volume using ApexCharts
 *  - type="PORTFOLIO": Single line (based on plot_line) plus the stock_index line using Chart.js
 */

function Plot({ type, stock_name, price_data, portfolio_data, plot_line }) {
  // Helper to parse date strings
  const formatDate = (datetimeStr) => new Date(datetimeStr);

  // ========== STOCK TYPE (ApexCharts) ==========
  const prepareStockData = () => {
    if (!price_data || !Array.isArray(price_data)) {
      console.error('Invalid price_data provided for STOCK type.');
      return { series: [], options: {} };
    }

    // Sort by ascending date
    const sorted = [...price_data].sort(
      (a, b) => new Date(a.datetime) - new Date(b.datetime)
    );

    // Prepare OHLC and volume
    const ohlcData = sorted.map((d) => ({
      x: formatDate(d.datetime),
      y: [d.open, d.high, d.low, d.close],
    }));
    const volumeData = sorted.map((d) => ({
      x: formatDate(d.datetime),
      y: d.volume,
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
        align: 'center',
        style: {
          color: 'var(--color-text-primary)',
          fontSize: '18px',
          fontWeight: 'bold',
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: 'var(--color-text-secondary)',
            fontSize: '10px',
          },
        },
        tooltip: {
          enabled: true,
          x: { format: 'MMM dd, yyyy' },
        },
      },
      yaxis: [
        {
          title: {
            text: 'Price ($)',
            style: {
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontWeight: 'bold',
            },
          },
          labels: {
            style: {
              colors: 'var(--color-text-secondary)',
              fontSize: '12px',
            },
          },
        },
        {
          opposite: true,
          title: {
            text: 'Volume',
            style: {
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontWeight: 'bold',
            },
          },
          labels: {
            style: {
              colors: 'var(--color-text-secondary)',
              fontSize: '12px',
            },
          },
        },
      ],
      tooltip: {
        theme: 'dark',
        x: { format: 'MMM dd, yyyy' },
      },
      plotOptions: {
        candlestick: {
          colors: {
            upward: 'var(--color-success)', 
            downward: 'var(--color-error)', 
          },
        },
        bar: {
          columnWidth: '80%',
        },
      },
      colors: ['#00E396', '#FEB019'],
      theme: {
        mode: 'dark',
      },
    };

    return { series, options };
  };

  // ========== PORTFOLIO TYPE (Chart.js) ==========
  const preparePortfolioData = () => {
    if (
      !portfolio_data ||
      !portfolio_data.portfolio_history ||
      !Array.isArray(portfolio_data.portfolio_history) ||
      !portfolio_data.stock_index ||
      !portfolio_data.stock_index_history ||
      !Array.isArray(portfolio_data.stock_index_history)
    ) {
      console.error('Invalid portfolio_data for PORTFOLIO type.');
      return { data: null, options: null };
    }

    const { portfolio_history, stock_index, stock_index_history } = portfolio_data;

    // We only want to plot:
    //   1) The stock_index line
    //   2) The user-chosen line from: totalPortfolioValue, funds, totalInvestment, unrealizedPnL
    // => holding_value => totalInvestment
    // => cash => funds
    // => unrealised_pnl => unrealizedPnL
    // => totalPortfolioValue => holding_value + cash

    // Match length
    const minLength = Math.min(portfolio_history.length, stock_index_history.length);
    const phTrim = portfolio_history.slice(0, minLength);
    const siTrim = stock_index_history.slice(0, minLength);

    // merged
    const merged = phTrim.map((ph, i) => {
      const si = siTrim[i] || {};
      return {
        datetime: formatDate(ph.timestamp),
        holding_value: ph.holding_value,
        unrealised_pnl: ph.unrealised_pnl,
        cash: ph.cash,
        indexPrice: si.price || 0,
      };
    });

    // Build the line we want from "plot_line"
    let mainLabel = '';
    let mainData = [];
    switch (plot_line) {
      case 'funds':
        mainLabel = 'Funds';
        mainData = merged.map((m) => m.cash);
        break;
      case 'totalInvestment':
        mainLabel = 'Holding Value';
        mainData = merged.map((m) => m.holding_value);
        break;
      case 'unrealizedPnL':
      case 'unrealisedPnL': // either spelling
        mainLabel = 'Unrealized PnL';
        mainData = merged.map((m) => m.unrealised_pnl);
        break;
      case 'totalPortfolioValue':
        mainLabel = 'Portfolio Value';
        mainData = merged.map((m) => m.holding_value + m.cash);
        break;
      default:
        // If we have no or invalid plot_line => default to 'holding_value' as "Holding Value"
        mainLabel = 'Holding Value';
        mainData = merged.map((m) => m.holding_value);
        break;
    }

    // stock_index line
    const indexLabel = `${portfolio_data.stock_index} Price`;
    const indexData = merged.map((m) => m.indexPrice);

    const labels = merged.map((d) =>
      d.datetime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    const data = {
      labels,
      datasets: [
        {
          label: mainLabel,
          data: mainData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: indexLabel,
          data: indexData,
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
        padding: { top: 0, left: 0, right: 0, bottom: 0 },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#ffffff' },
        },
        tooltip: {
          backgroundColor: 'rgba(20, 20, 30, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
        },
        title: {
          display: true,
          text: `Portfolio: ${mainLabel} & ${indexLabel}`,
          color: '#ffffff',
          font: { size: 18, weight: 'bold' },
          padding: { top: 5 },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: {
            color: '#cccccc',
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          position: 'left',
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          ticks: {
            color: '#cccccc',
            font: { size: 12 },
            callback: (value) => `$${value}`,
          },
          title: {
            display: true,
            text: 'Value ($)',
            color: '#ffffff',
            font: { size: 14, weight: 'bold' },
          },
        },
        y1: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: '#cccccc',
            font: { size: 12 },
            callback: (value) => `$${value}`,
          },
          title: {
            display: true,
            text: `${indexLabel}`,
            color: '#ffffff',
            font: { size: 14, weight: 'bold' },
          },
        },
      },
    };

    return { data, options };
  };

  // Prepare data
  const stockData = type === 'STOCK' ? prepareStockData() : null;
  const portfolioDataPrepared =
    type === 'PORTFOLIO' ? preparePortfolioData() : { data: null, options: null };

  // Render
  return (
    <div className="plot-container">
      <div className="price-chart-card">
        {/* STOCK (ApexCharts) */}
        {type === 'STOCK' && stockData && stockData.series.length > 0 && (
          <ReactApexChart
            options={stockData.options}
            series={stockData.series}
            type="candlestick"
            height={410}
          />
        )}

        {/* PORTFOLIO (Chart.js) */}
        {type === 'PORTFOLIO' &&
          portfolioDataPrepared &&
          portfolioDataPrepared.data &&
          portfolioDataPrepared.data.labels?.length > 0 && (
            <Line
              data={portfolioDataPrepared.data}
              options={portfolioDataPrepared.options}
              height={600}
            />
          )}

        {/* Fallback messages */}
        {type === 'STOCK' &&
          (!stockData || !stockData.series || stockData.series.length === 0) && (
            <p style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>
              No STOCK data available to display.
            </p>
          )}
        {type === 'PORTFOLIO' &&
          (!portfolioDataPrepared ||
            !portfolioDataPrepared.data ||
            !portfolioDataPrepared.data.labels ||
            portfolioDataPrepared.data.labels.length === 0) && (
            <p style={{ color: 'var(--color-text-primary)', textAlign: 'center' }}>
              No PORTFOLIO data available to display.
            </p>
          )}
      </div>
    </div>
  );
}

// propTypes
Plot.propTypes = {
  type: PropTypes.oneOf(['STOCK', 'PORTFOLIO']).isRequired,
  // STOCK
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
      // Validate structure
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
            `Invalid data structure in \`${propName}\` at index ${i}. Each item must have datetime (string), open/high/low/close (number), volume (number).`
          );
        }
      }
    }
    return null;
  },
  // PORTFOLIO
  portfolio_data: (props, propName, componentName) => {
    if (props.type === 'PORTFOLIO') {
      if (!props[propName] || typeof props[propName] !== 'object') {
        return new Error(
          `Invalid prop \`${propName}\` supplied to \`${componentName}\`. Expected an object when type is 'PORTFOLIO'.`
        );
      }
      const { portfolio_history, stock_index, stock_index_history } = props[propName];
      if (!Array.isArray(portfolio_history) || !Array.isArray(stock_index_history)) {
        return new Error(
          `Invalid structure in \`${propName}\` for \`${componentName}\`. Expected portfolio_history & stock_index_history arrays.`
        );
      }
      if (typeof stock_index !== 'string') {
        return new Error(
          `Invalid structure in \`${propName}\` for \`${componentName}\`. stock_index must be a string.`
        );
      }
    }
    return null;
  },
  plot_line: PropTypes.oneOf([
    'totalPortfolioValue',
    'funds',
    'totalInvestment',
    'unrealizedPnL',
    undefined, // optional if not specifying
  ]),
};

// default props
Plot.defaultProps = {
  type: 'STOCK',
  stock_name: 'Default Stock',
  price_data: [],
  portfolio_data: null,
  plot_line: undefined,
};

export default Plot;
