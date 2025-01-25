import React from 'react';
import { Card, CardContent, Typography, Checkbox, FormControlLabel, TextField, Grid, FormGroup, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Box } from '@mui/material';

const DrawdownMeasures = ({ settings, onUpdate, apiResponse }) => {
  const safeSettings = {
    measures: [],
    rolling_drawdown_window: 30,
    event_highlighting: true,
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
    if (!apiResponse?.metrics?.drawdown_measures) return null;
    
    const { per_ticker, portfolio } = apiResponse.metrics.drawdown_measures;
    const metrics = safeSettings.measures;

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Drawdown Analysis Results</Typography>

        <Typography variant="subtitle1" gutterBottom>Per Security Metrics</Typography>
        <TableContainer component={Paper} sx={{ mb: 4, maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                {metrics.map(metric => (
                  <TableCell key={metric}>
                    {metric.replace(/_/g, ' ').toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(per_ticker).map(([ticker, metricsData]) => (
                <TableRow key={ticker}>
                  <TableCell>{ticker}</TableCell>
                  {metrics.map(metric => (
                    <TableCell key={metric}>
                      {metric === 'recovery_time' 
                        ? (metricsData[metric] ?? 'N/A')
                        : metricsData[metric]?.toFixed(6) || 'N/A'}
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
                  <TableCell key={metric}>
                    {metric.replace(/_/g, ' ').toUpperCase()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Portfolio</TableCell>
                {metrics.map(metric => (
                  <TableCell key={metric}>
                    {metric === 'recovery_time' 
                      ? (portfolio[metric] ?? 'N/A')
                      : portfolio[metric]?.toFixed(6) || 'N/A'}
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
        <Typography variant="h6" gutterBottom>Drawdown Measures Configuration</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Select Measures</Typography>
            <FormGroup row>
              {['mdd', 'average_drawdown', 'recovery_time'].map(measure => (
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
              label="Rolling Window (Days)"
              type="number"
              fullWidth
              value={safeSettings.rolling_drawdown_window}
              onChange={e => handleValueChange('rolling_drawdown_window', parseInt(e.target.value))}
              margin="normal"
              inputProps={{ min: 1 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={safeSettings.event_highlighting}
                  onChange={e => handleValueChange('event_highlighting', e.target.checked)}
                />
              }
              label="Event Highlighting"
              sx={{ mt: 2 }}
            />
          </Grid>
        </Grid>

        {renderResults()}
      </CardContent>
    </Card>
  );
};

export default DrawdownMeasures;