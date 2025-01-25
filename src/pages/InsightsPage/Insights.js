import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { postUserMetrics } from '../../api/userApi';
import GlobalSettings from '../../components/Metrics/GlobalSettings/GlobalSettings';
import MetricCheckboxes from '../../components/Metrics/MetricCheckboxes/MetricCheckboxes';
import VolatilityMeasures from '../../components/Metrics/VolatilityMeasures/VolatilityMeasures';
import CorrelationDiversification from '../../components/Metrics/CorrelationDiversification/CorrelationDiversification';
import DrawdownMeasures from '../../components/Metrics/DrawdownMeasures/DrawdownMeasures';
import TailRiskMeasures from '../../components/Metrics/TailRiskMeasures/TailRiskMeasures';
import RiskAdjustedPerformance from '../../components/Metrics/RiskAdjustedPerformance/RiskAdjustedPerformance';
import DistributionMeasures from '../../components/Metrics/DistributionMeasures/DistributionMeasures';
import PortfolioOptimization from '../../components/Metrics/PortfolioOptimization/PortfolioOptimization';
import { Box, Card, Typography, Button, Alert, CircularProgress, CardContent } from '@mui/material';

const DEFAULT_METRICS_CONFIG = {
  volatility_measures: {
    enable: false,
    measures: [],
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
    measures: [],
    benchmark: 'SPY',
    correlation_method: 'pearson'
  },
  drawdown_measures: {
    enable: false,
    measures: [],
    rolling_drawdown_window: 30,
    event_highlighting: true,
    time_series: []
  },
  tail_risk: {
    enable: false,
    measures: [],
    threshold_percentile: 0.01,
    distribution_model: 'empirical',
    time_series: []
  },
  risk_adjusted_performance: {
    enable: false,
    measures: [],
    benchmark: 'SPY',
    risk_free_rate: 0.03,
    comparison_periods: ['1M', '1Y', '3Y'],
    adjust_benchmark_weights: false,
    rolling_sharpe_window: 30,
    time_series: []
  },
  distribution: {
    enable: false,
    measures: [],
    sector_breakdown: true,
    hhi_analysis: true,
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
            ...metric // Spread all properties of the metric
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
    } catch (error) {
      setApiError(error.response?.data?.message || error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, height: '100vh', bgcolor: 'background.default' }}>
      <Card sx={{ width: '100%', maxWidth: 1200, maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Portfolio Insights
          </Typography>
          
          {apiResponse && <Alert severity="success" sx={{ mb: 2 }}>Analysis successful!</Alert>}
          {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
        </CardContent>

        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
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

        <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={24} />}
          >
            {isSubmitting ? 'Processing...' : 'Run Analysis'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default Insights;