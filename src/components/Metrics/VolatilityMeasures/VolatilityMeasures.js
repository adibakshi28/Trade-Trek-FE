import React from 'react';
import { FormGroup, Card, CardContent, Typography, Checkbox, FormControlLabel, TextField, Select, MenuItem, Grid, FormControl, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Box } from '@mui/material';

const VolatilityMeasures = ({ settings, onUpdate, apiResponse }) => {
  const safeSettings = {
    measures: [],
    rolling_window: 30,
    historical_period: '1Y',
    time_series: [],
    var_es_settings: {
      periods: '1D',
      resolution: '1h',
      confidence_level: 0.95,
      method: 'historical'
    },
    ...settings
  };

  const handleToggleMeasure = (measure) => {
    const newMeasures = safeSettings.measures.includes(measure)
      ? safeSettings.measures.filter(m => m !== measure)
      : [...safeSettings.measures, measure];
    onUpdate({ ...safeSettings, measures: newMeasures });
  };

  const handleChange = (field, value) => {
    onUpdate({ ...safeSettings, [field]: value });
  };

  const handleVarEsChange = (field, value) => {
    onUpdate({
      ...safeSettings,
      var_es_settings: {
        ...safeSettings.var_es_settings,
        [field]: value
      }
    });
  };

  const renderResults = () => {
    if (!apiResponse?.metrics?.volatility_measures) return null;
    
    const { per_ticker, portfolio } = apiResponse.metrics.volatility_measures;
    const metrics = [...new Set([
      ...Object.values(per_ticker).flatMap(t => Object.keys(t)),
      ...Object.keys(portfolio)
    ])];

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Analysis Results</Typography>

        <Typography variant="subtitle1" gutterBottom>Per Security Metrics</Typography>
        <TableContainer component={Paper} sx={{ mb: 4, maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                {metrics.map(metric => (
                  <TableCell key={metric}>{metric.replace(/_/g, ' ').toUpperCase()}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(per_ticker).map(([ticker, metricsData]) => (
                <TableRow key={ticker}>
                  <TableCell>{ticker}</TableCell>
                  {metrics.map(metric => (
                    <TableCell key={metric}>
                      {metricsData[metric]?.toFixed(6) || 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle1" gutterBottom>Portfolio Metrics</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                {metrics.map(metric => (
                  <TableCell key={metric}>{metric.replace(/_/g, ' ').toUpperCase()}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Portfolio</TableCell>
                {metrics.map(metric => (
                  <TableCell key={metric}>
                    {portfolio[metric]?.toFixed(6) || 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Volatility Measures Configuration</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Select Metrics</Typography>
            <FormGroup row>
              {['standard_deviation', 'beta', 'var', 'es'].map(measure => (
                <FormControlLabel
                  key={measure}
                  control={
                    <Checkbox
                      checked={safeSettings.measures.includes(measure)}
                      onChange={() => handleToggleMeasure(measure)}
                    />
                  }
                  label={measure.replace(/_/g, ' ').toUpperCase()}
                />
              ))}
            </FormGroup>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Rolling Window"
              type="number"
              fullWidth
              value={safeSettings.rolling_window}
              onChange={e => handleChange('rolling_window', parseInt(e.target.value))}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Historical Period</InputLabel>
              <Select
                value={safeSettings.historical_period}
                onChange={e => handleChange('historical_period', e.target.value)}
              >
                {['1Y', '2Y', '5Y'].map(period => (
                  <MenuItem key={period} value={period}>{period}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Confidence Level"
              type="number"
              fullWidth
              value={safeSettings.var_es_settings.confidence_level}
              onChange={e => handleVarEsChange('confidence_level', parseFloat(e.target.value))}
              inputProps={{ min: 0, max: 1, step: 0.01 }}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Calculation Method</InputLabel>
              <Select
                value={safeSettings.var_es_settings.method}
                onChange={e => handleVarEsChange('method', e.target.value)}
              >
                {['historical', 'parametric', 'monte_carlo'].map(method => (
                  <MenuItem key={method} value={method}>{method.toUpperCase()}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Data Resolution"
              fullWidth
              value={safeSettings.var_es_settings.resolution}
              onChange={e => handleVarEsChange('resolution', e.target.value)}
              margin="normal"
            />
            <TextField
              label="Analysis Period"
              fullWidth
              value={safeSettings.var_es_settings.periods}
              onChange={e => handleVarEsChange('periods', e.target.value)}
              margin="normal"
            />
          </Grid>
        </Grid>

        {renderResults()}
      </CardContent>
    </Card>
  );
};

export default VolatilityMeasures;