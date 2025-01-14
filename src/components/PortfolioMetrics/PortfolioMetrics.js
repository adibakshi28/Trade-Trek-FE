// src/components/PortfolioMetrics/PortfolioMetrics.js

import React, { useRef, useEffect, useState } from 'react';
import './PortfolioMetrics.css';
import {
  Paper,
  Typography,
  Divider,
  Tooltip,
  Skeleton,
  IconButton,
} from '@mui/material';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import TimelineIcon from '@mui/icons-material/Timeline';
import CountUp from 'react-countup';
import PropTypes from 'prop-types';

/** Custom hook to track previous value */
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * Renders the portfolio metrics with a hover-graph icon.
 * @param {object} props
 * @param {object} props.metrics
 * @param {number} props.metrics.totalInvestment
 * @param {number} props.metrics.currentValue
 * @param {number} props.metrics.dayPnL
 * @param {number} props.metrics.unrealizedPnL
 * @param {number} props.metrics.totalPortfolioValue
 * @param {number} props.funds
 * @param {function} props.onShowMetricPlot - Callback when user clicks graph icon
 */
function PortfolioMetrics({ metrics, funds, onShowMetricPlot }) {
  // 1) We'll define any hooks at the top—**unconditionally**.
  const [hoveringKey, setHoveringKey] = useState(null);

  // 2) destructure from metrics or provide defaults
  let totalInvestment = 0;
  let currentValue = 0;
  let dayPnL = 0;
  let unrealizedPnL = 0;
  let totalPortfolioValue = 0;

  if (metrics) {
    totalInvestment = metrics.totalInvestment ?? 0;
    currentValue = metrics.currentValue ?? 0;
    dayPnL = metrics.dayPnL ?? 0;
    unrealizedPnL = metrics.unrealizedPnL ?? 0;
    totalPortfolioValue = metrics.totalPortfolioValue ?? 0;
  }

  const previousUnrealizedPnL = usePrevious(unrealizedPnL);

  // 3) If metrics is null => show skeleton
  const showSkeleton = !metrics;

  // 4) define other logic (helper functions) below
  const formatPnL = (value) => {
    const sign = value >= 0 ? '+' : '';
    const formattedNumber = Math.abs(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${sign}$${formattedNumber}`;
  };

  const getUpDownIcon = (isPositive) =>
    isPositive ? (
      <ArrowUpwardIcon className="icon-positive" />
    ) : (
      <ArrowDownwardIcon className="icon-negative" />
    );

  const isCurrentValuePositive = currentValue > totalInvestment;

  // 5) if we do have metrics, build the array
  const metricsData = showSkeleton
    ? []
    : [
        {
          key: 'totalPortfolioValue',
          label: 'Portfolio Value',
          value: `$${Number(totalPortfolioValue).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          icon: <AccountBalanceWalletIcon className="icon-default" />,
          tip: 'Total value of your portfolio (funds + investments)',
        },
        {
          key: 'funds',
          label: 'Funds',
          value:
            funds != null
              ? `$${Number(funds).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : '$0.00',
          icon: <MonetizationOnIcon className="icon-default" />,
          tip: 'Available funds for trading',
        },
        {
          key: 'totalInvestment',
          label: 'Investment',
          value: `$${Number(totalInvestment).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          icon: <TrendingUpIcon className="icon-default" />,
          tip: 'Total amount invested in the portfolio',
        },
        {
          key: 'currentValue',
          label: 'Current Value',
          value: `$${Number(currentValue).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          isPositive: isCurrentValuePositive,
          icon: getUpDownIcon(isCurrentValuePositive),
          tip: 'Current value of your portfolio',
        },
        {
          key: 'unrealizedPnL',
          label: 'Unrealised PnL',
          value: formatPnL(unrealizedPnL),
          isPositive: unrealizedPnL >= 0,
          isRolling: true,
          previousValue: previousUnrealizedPnL,
          icon: getUpDownIcon(unrealizedPnL >= 0),
          tip: 'Unrealised profit or loss (current market prices)',
        },
        {
          key: 'dayPnL',
          label: 'Day PnL',
          value: formatPnL(dayPnL),
          isPositive: dayPnL >= 0,
          icon: getUpDownIcon(dayPnL >= 0),
          tip: 'Profit or loss for the day',
        },
      ];

  // Hover callbacks
  const handleMouseEnter = (metricKey) => {
    setHoveringKey(metricKey);
  };
  const handleMouseLeave = () => {
    setHoveringKey(null);
  };

  const handlePlotClick = (metricKey) => {
    if (typeof onShowMetricPlot === 'function') {
      onShowMetricPlot(metricKey);
    }
  };

  // 6) Render
  return (
    <Paper className="portfolio-metrics-card" elevation={3}>
      {/* If showSkeleton => display skeleton placeholders */}
      {showSkeleton ? (
        [...Array(6)].map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            height={30}
            width="80%"
            style={{ margin: '10px 0' }}
          />
        ))
      ) : (
        metricsData.map((metric, index) => (
          <React.Fragment key={metric.key}>
            <div
              className="metric-item"
              onMouseEnter={() => handleMouseEnter(metric.key)}
              onMouseLeave={handleMouseLeave}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{metric.icon}</span>
                <Tooltip title={metric.tip} placement="top">
                  <Typography variant="subtitle1" className="metric-name font-large">
                    {metric.label}
                  </Typography>
                </Tooltip>
              </div>

              {/* If we're hovering => show graph icon */}
              {hoveringKey === metric.key ? (
                <Tooltip title={`Plot ${metric.label}`} placement="top">
                  <IconButton
                    className="metric-plot-button"
                    onClick={() => handlePlotClick(metric.key)}
                    size="small"
                  >
                    <TimelineIcon fontSize="custom" />
                  </IconButton>
                </Tooltip>
              ) : (
                // <Tooltip title={metric.value} placement="top">
                  <Typography
                    variant="subtitle1"
                    className={
                      metric.isPositive !== undefined
                        ? metric.isPositive
                          ? 'text-success font-large'
                          : 'text-error font-large'
                        : 'font-large'
                    }
                    aria-live="polite"
                  >
                    {metric.isRolling && metric.previousValue !== undefined ? (
                      <CountUp
                        start={parseFloat(
                          formatPnL(metric.previousValue).replace(/[^0-9.-]/g, '')
                        )}
                        end={parseFloat(metric.value.replace(/[^0-9.-]/g, ''))}
                        duration={1}
                        separator=","
                        decimals={2}
                        prefix={
                          metric.value.startsWith('+')
                            ? '+$'
                            : metric.value.startsWith('-')
                            ? '-$'
                            : '$'
                        }
                      />
                    ) : (
                      metric.value
                    )}
                  </Typography>
                // </Tooltip>
              )}
            </div>
            {index < metricsData.length - 1 && (
              <Divider className="metric-divider" />
            )}
          </React.Fragment>
        ))
      )}
    </Paper>
  );
}

PortfolioMetrics.propTypes = {
  metrics: PropTypes.shape({
    totalInvestment: PropTypes.number,
    currentValue: PropTypes.number,
    dayPnL: PropTypes.number,
    unrealizedPnL: PropTypes.number,
    totalPortfolioValue: PropTypes.number,
  }),
  funds: PropTypes.number,
  onShowMetricPlot: PropTypes.func,
};

export default PortfolioMetrics;
