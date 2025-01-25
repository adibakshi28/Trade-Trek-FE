import React from 'react';
import { Card, CardContent, Typography, Checkbox, FormControlLabel, TextField, Grid, FormGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const RiskAdjustedPerformance = ({ settings, onUpdate, apiResponse }) => {
  const safeSettings = {
    measures: [],
    benchmark: 'SPY',
    risk_free_rate: 0.03,
    comparison_periods: ['1M', '1Y', '3Y'],
    adjust_benchmark_weights: false,
    rolling_sharpe_window: 30,
    time_series: [],
    ...settings
  };

  const handleToggleMeasure = (measure) => {
    const newMeasures = safeSettings.measures.includes(measure)
      ? safeSettings.measures.filter(m => m !== measure)
      : [...safeSettings.measures, measure];
    onUpdate({ ...safeSettings, measures: newMeasures });
  };

  const handleValueChange = (field, value) => {
    onUpdate({ ...safeSettings, [field]: value });
  };

  const renderResults = () => {
    if (!apiResponse?.metrics?.risk_adjusted_performance) return null;
    
    const { per_ticker, portfolio } = apiResponse.metrics.risk_adjusted_performance;
    const periods = ['1M', '1Y', '3Y', 'full_period'];
    const measures = safeSettings.measures;

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Risk Adjusted Performance Results</Typography>

        {Object.entries(per_ticker).map(([ticker, data]) => (
          <Box key={ticker} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>{ticker}</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    {measures.map(measure => (
                      <TableCell key={measure}>{measure.replace(/_/g, ' ').toUpperCase()}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {periods.map(period => (
                    <TableRow key={period}>
                      <TableCell>{period.replace(/_/g, ' ').toUpperCase()}</TableCell>
                      {measures.map(measure => (
                        <TableCell key={measure}>
                          {data[period]?.[measure]?.toFixed(4) || 'N/A'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}

        <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>Portfolio Performance</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Period</TableCell>
                {measures.map(measure => (
                  <TableCell key={measure}>{measure.replace(/_/g, ' ').toUpperCase()}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {periods.map(period => (
                <TableRow key={period}>
                  <TableCell>{period.replace(/_/g, ' ').toUpperCase()}</TableCell>
                  {measures.map(measure => (
                    <TableCell key={measure}>
                      {portfolio[period]?.[measure]?.toFixed(4) || 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Risk Adjusted Performance Settings</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Select Measures</Typography>
            <FormGroup row>
              {['sharpe_ratio', 'information_ratio'].map(measure => (
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
            
            <TextField
              label="Risk Free Rate"
              type="number"
              fullWidth
              value={safeSettings.risk_free_rate}
              onChange={e => handleValueChange('risk_free_rate', parseFloat(e.target.value))}
              margin="normal"
              inputProps={{ step: 0.01 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Comparison Periods</InputLabel>
              <Select
                multiple
                value={safeSettings.comparison_periods}
                onChange={e => handleValueChange('comparison_periods', e.target.value)}
                renderValue={(selected) => selected.join(', ')}
              >
                {['1M', '1Y', '3Y'].map(period => (
                  <MenuItem key={period} value={period}>
                    {period}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Rolling Sharpe Window"
              type="number"
              fullWidth
              value={safeSettings.rolling_sharpe_window}
              onChange={e => handleValueChange('rolling_sharpe_window', parseInt(e.target.value))}
              margin="normal"
              inputProps={{ min: 1 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={safeSettings.adjust_benchmark_weights}
                  onChange={e => handleValueChange('adjust_benchmark_weights', e.target.checked)}
                />
              }
              label="Adjust Benchmark Weights"
              sx={{ mt: 2 }}
            />
          </Grid>
        </Grid>

        {renderResults()}
      </CardContent>
    </Card>
  );
};

export default RiskAdjustedPerformance;