// src/components/PortfolioMetrics/PortfolioMetrics.js
import React, { useRef, useEffect } from 'react';
import './PortfolioMetrics.css';
import {
  Paper,
  Typography,
  Divider,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  AccountBalanceWallet as AccountBalanceWalletIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import CountUp from 'react-countup';
import PropTypes from 'prop-types';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function PortfolioMetrics({ metrics, funds }) {
  // Always destructure metrics (or provide defaults)
  // so we don’t break if metrics is null/undefined
  const {
    totalInvestment = 0,
    currentValue = 0,
    dayPnL = 0,
    unrealizedPnL = 0,
    totalPortfolioValue = 0,
  } = metrics || {};

  // Always call the hook, even if metrics is empty
  const previousUnrealizedPnL = usePrevious(unrealizedPnL);

  // If metrics is null/undefined, show skeleton
  if (!metrics) {
    return (
      <Paper className="portfolio-metrics-card" elevation={3}>
        {[...Array(6)].map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            height={30}
            width="80%"
            style={{ margin: '10px 0' }}
          />
        ))}
      </Paper>
    );
  }

  // Now that hooks have been called, continue with your logic
  const isCurrentValuePositive = currentValue > totalInvestment;

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

  const metricsData = [
    {
      label: 'Portfolio Value',
      value: `$${Number(totalPortfolioValue).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <AccountBalanceWalletIcon className="icon-default" />,
      tip: 'Total value of your portfolio (funds + investments)',
    },
    {
      label: 'Funds',
      value: funds != null
        ? `$${Number(funds).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : '$0.00',
      icon: <MonetizationOnIcon className="icon-default" />,
      tip: 'Available funds for trading',
    },
    {
      label: 'Investment',
      value: `$${Number(totalInvestment).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: <TrendingUpIcon className="icon-default" />,
      tip: 'Total amount invested in the portfolio',
    },
    {
      label: 'Current Value',
      value: `$${Number(currentValue).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      isPositive: isCurrentValuePositive,
      icon: getUpDownIcon(isCurrentValuePositive),
      tip: 'Current value of your portfolio (Calculated based on current market prices)',
    },
    {
      label: 'Unrealised PnL',
      value: formatPnL(unrealizedPnL),
      isPositive: unrealizedPnL >= 0,
      isRolling: true,
      previousValue: previousUnrealizedPnL,
      icon: getUpDownIcon(unrealizedPnL >= 0),
      tip: 'Unrealised profit or loss (Calculated based on current market prices)',
    },
    {
      label: 'Day PnL',
      value: formatPnL(dayPnL),
      isPositive: dayPnL >= 0,
      icon: getUpDownIcon(dayPnL >= 0),
      tip: 'Profit or loss for the day (Calculated based on current market prices)',
    },
  ];

  return (
    <Paper className="portfolio-metrics-card" elevation={3}>
      {metricsData.map((metric, index) => (
        <React.Fragment key={index}>
          <div className="metric-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{metric.icon}</span>
              <Tooltip title={metric.tip} placement="top">
                <Typography variant="subtitle1" className="metric-name font-large">
                  {metric.label}
                </Typography>
              </Tooltip>
            </div>
            <Tooltip title={metric.value} placement="top">
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
            </Tooltip>
          </div>
          {index < metricsData.length - 1 && <Divider className="metric-divider" />}
        </React.Fragment>
      ))}
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
};

export default PortfolioMetrics;
