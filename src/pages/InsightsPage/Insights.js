// src/pages/Insights/Insights.js

import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { postUserMetrics } from '../../api/userApi';
import { postMetricInsights } from '../../api/aiApi'; 
import PortfolioDistributionChart from '../../components/Metrics/PortfolioDistributionChart/PortfolioDistributionChart';
import GlobalSettings from '../../components/Metrics/GlobalSettings/GlobalSettings';
import MetricCheckboxes from '../../components/Metrics/MetricCheckboxes/MetricCheckboxes';
import VolatilityMeasures from '../../components/Metrics/VolatilityMeasures/VolatilityMeasures';
import CorrelationDiversification from '../../components/Metrics/CorrelationDiversification/CorrelationDiversification';
import DrawdownMeasures from '../../components/Metrics/DrawdownMeasures/DrawdownMeasures';
import TailRiskMeasures from '../../components/Metrics/TailRiskMeasures/TailRiskMeasures';
import RiskAdjustedPerformance from '../../components/Metrics/RiskAdjustedPerformance/RiskAdjustedPerformance';
import DistributionMeasures from '../../components/Metrics/DistributionMeasures/DistributionMeasures';
import PortfolioOptimization from '../../components/Metrics/PortfolioOptimization/PortfolioOptimization';
import ExplainText from '../../components/Metrics/ExplainText/ExplainText';
import { Box, Card, Button, Snackbar, CircularProgress, Alert, Grid } from '@mui/material';
import './Insights.css';

const DEFAULT_METRICS_CONFIG = {
  volatility_measures: {
    enable: false,
    measures: ['var'],
    rolling_window: 30,
    historical_period: '1Y',
    time_series: [],
    var_es_settings: {
      periods: '1D',
      resolution: '1h',
      confidence_level: 0.95,
      method: 'historical'
    }
  },
  correlation_diversification: {
    enable: false,
    measures: ['correlation_coefficient'],
    benchmark: 'SPY',
    correlation_method: 'pearson'
  },
  drawdown_measures: {
    enable: false,
    measures: ['mdd'],
    rolling_drawdown_window: 30,
    event_highlighting: true,
    time_series: []
  },
  tail_risk: {
    enable: false,
    measures: ['skewness'],
    threshold_percentile: 0.01,
    distribution_model: 'empirical',
    time_series: []
  },
  risk_adjusted_performance: {
    enable: false,
    measures: ['sharpe_ratio'],
    benchmark: 'SPY',
    risk_free_rate: 0.03,
    comparison_periods: ['1Y'],
    adjust_benchmark_weights: false,
    rolling_sharpe_window: 30,
    time_series: []
  },
  distribution: {
    enable: false,
    measures: ['sector_distribution'],
    sector_breakdown: false,
    hhi_analysis: false,
    time_series: []
  },
  portfolio_optimization: {
    enable: false,
    measures: ['optimal_allocation'],
    goal: 'maximize_return',
    constraints: {
      min_allocation: 0.05,
      max_allocation: 0.5
    },
    target_volatility: 0.2,
    min_return_constraint: 0.1,
    include_transaction_costs: true,
    transaction_costs: 0.01,
    rebalance_frequency: 'monthly',
    risk_free_rate: 0.03,
    time_series: []
  }
};

const Insights = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // New state variables for Insights
  const [insightsReply, setInsightsReply] = useState(null);
  const [isExplainLoading, setIsExplainLoading] = useState(false);
  const [explainError, setExplainError] = useState(null);

  const [config, setConfig] = useState({
    timeframe: {
      start_date: '2023-01-01',
      end_date: '2024-01-01'
    },
    resolution: '1day',
    benchmark: 'SPY',
    metrics: { ...DEFAULT_METRICS_CONFIG },
    settings: {
      return_type: 'arithmetic',
      include_portfolio: false,
      include_benchmark_trend: false
    }
  });

  useEffect(() => {
    if (!isAuthLoading && !accessToken) navigate('/login');
  }, [accessToken, isAuthLoading, navigate]);

  useEffect(() => {
    if (apiResponse) {
      setSnackbarSeverity('success');
      setSnackbarMessage('Analysis successful!');
      setSnackbarOpen(true);
    }
    if (apiError) {
      setSnackbarSeverity('error');
      setSnackbarMessage(apiError);
      setSnackbarOpen(true);
    }
    if (insightsReply) {
      setSnackbarSeverity('success');
      setSnackbarMessage('Insights retrieved successfully!');
      setSnackbarOpen(true);
    }
    if (explainError) {
      setSnackbarSeverity('error');
      setSnackbarMessage(explainError);
      setSnackbarOpen(true);
    }
  }, [apiResponse, apiError, insightsReply, explainError]);

  const handleMetricToggle = (metricKey) => {
    setConfig(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metricKey]: {
          ...prev.metrics[metricKey],
          enable: !prev.metrics[metricKey].enable
        }
      }
    }));
  };

  const handleSettingsChange = (metricKey, newSettings) => {
    setConfig(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metricKey]: {
          ...prev.metrics[metricKey],
          ...newSettings
        }
      }
    }));
  };

  const handleGlobalChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const payload = {
      timeframe: config.timeframe,
      resolution: config.resolution,
      benchmark: config.benchmark,
      metrics: Object.keys(config.metrics).reduce((acc, metricKey) => {
        const metric = config.metrics[metricKey];
        if (metric.enable) {
          acc[metricKey] = {
            enable: true,
            ...metric
          };
        }
        return acc;
      }, {}),
      settings: config.settings
    };

    try {
      const response = await postUserMetrics(payload);
      setApiResponse(response);
      setApiError(null);
      // Reset insightsReply when new analysis is run
      setInsightsReply(null);
      setExplainError(null);
    } catch (error) {
      setApiError(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExplain = async () => {
    setIsExplainLoading(true);
    setExplainError(null);
    setInsightsReply(''); // Initialize as empty string to render the ExplainText card with loading

    try {
      const metricConfig = {
        timeframe: config.timeframe,
        resolution: config.resolution,
        benchmark: config.benchmark,
        metrics: Object.keys(config.metrics).reduce((acc, metricKey) => {
          const metric = config.metrics[metricKey];
          if (metric.enable) {
            acc[metricKey] = {
              enable: true,
              ...metric
            };
          }
          return acc;
        }, {}),
        settings: config.settings
      };
      const response = await postMetricInsights(metricConfig);
      setInsightsReply(response.reply);
    } catch (error) {
      setExplainError(error.response?.data?.message || error.message || 'An error occurred while fetching insights');
      setInsightsReply(null); // Optionally hide the ExplainText card if there's an error
    } finally {
      setIsExplainLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Determine if at least one metric is enabled
  const isAnyMetricEnabled = Object.values(config.metrics).some(metric => metric.enable);

  return (
    <Box className={`insights-container ${insightsReply !== null ? 'with-insights' : ''}`}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} className="insights-alert">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Main Insights Card */}
      <Card className="insights-card">
        <Box className="insights-content">
          <Box className="insights-chart">
            <PortfolioDistributionChart />
          </Box>

          <GlobalSettings
            timeframe={config.timeframe}
            resolution={config.resolution}
            benchmark={config.benchmark}
            settings={config.settings}
            onTimeframeChange={(newTimeframe) => handleGlobalChange('timeframe', newTimeframe)}
            onResolutionChange={(newResolution) => handleGlobalChange('resolution', newResolution)}
            onBenchmarkChange={(newBenchmark) => handleGlobalChange('benchmark', newBenchmark)}
            onSettingsChange={(newSettings) => handleGlobalChange('settings', newSettings)}
          />

          <MetricCheckboxes
            metrics={config.metrics}
            onToggle={handleMetricToggle}
            className="insights-checkbox"
          />

          {config.metrics.volatility_measures.enable && (
            <VolatilityMeasures
              settings={config.metrics.volatility_measures}
              onUpdate={(newSettings) => handleSettingsChange('volatility_measures', newSettings)}
              apiResponse={apiResponse}
            />
          )}

          {config.metrics.correlation_diversification.enable && (
            <CorrelationDiversification
              settings={config.metrics.correlation_diversification}
              onUpdate={(newSettings) => handleSettingsChange('correlation_diversification', newSettings)}
              apiResponse={apiResponse}
            />
          )}

          {config.metrics.drawdown_measures.enable && (
            <DrawdownMeasures
              settings={config.metrics.drawdown_measures}
              onUpdate={(newSettings) => handleSettingsChange('drawdown_measures', newSettings)}
              apiResponse={apiResponse}
            />
          )}

          {config.metrics.tail_risk.enable && (
            <TailRiskMeasures
              settings={config.metrics.tail_risk}
              onUpdate={(newSettings) => handleSettingsChange('tail_risk', newSettings)}
              apiResponse={apiResponse}
            />
          )}

          {config.metrics.risk_adjusted_performance.enable && (
            <RiskAdjustedPerformance
              settings={config.metrics.risk_adjusted_performance}
              onUpdate={(newSettings) => handleSettingsChange('risk_adjusted_performance', newSettings)}
              apiResponse={apiResponse}
            />
          )}

          {config.metrics.distribution.enable && (
            <DistributionMeasures
              settings={config.metrics.distribution}
              onUpdate={(newSettings) => handleSettingsChange('distribution', newSettings)}
              apiResponse={apiResponse}
            />
          )}

          {config.metrics.portfolio_optimization.enable && (
            <PortfolioOptimization
              settings={config.metrics.portfolio_optimization}
              onUpdate={(newSettings) => handleSettingsChange('portfolio_optimization', newSettings)}
              apiResponse={apiResponse}
            />
          )}
        </Box>

        {/* Footer with Run Analysis and EXPLAIN buttons */}
        <Box className="insights-footer">
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                disabled={isSubmitting || !isAnyMetricEnabled}
                startIcon={isSubmitting && <CircularProgress size={24} className="button-spinner" />}
                className="insights-button"
              >
                {isSubmitting ? 'Processing...' : 'Run Analysis'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleExplain}
                disabled={!isAnyMetricEnabled || isExplainLoading}
                className="insights-explain-button"
                startIcon={isExplainLoading && <CircularProgress size={24} className="button-spinner" />}
              >
                {isExplainLoading ? 'Analyzing...' : 'Report & Recommendations'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Insights Reply Card */}
      {/* Render ExplainText when the user has clicked EXPLAIN */}
      {insightsReply !== null && (
        <ExplainText replyText={insightsReply} loading={isExplainLoading} />
      )}
    </Box>
  );
};

export default Insights;
