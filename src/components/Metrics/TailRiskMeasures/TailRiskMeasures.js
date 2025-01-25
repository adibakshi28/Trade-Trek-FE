import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Grid,
  FormGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import './TailRiskMeasures.css';

const TailRiskMeasures = ({ settings, onUpdate, apiResponse }) => {
  const safeSettings = {
    measures: [],
    threshold_percentile: 0.01,
    distribution_model: 'empirical',
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
    if (!apiResponse?.metrics?.tail_risk) return null;
    
    const { per_ticker, portfolio } = apiResponse.metrics.tail_risk;
    const metrics = safeSettings.measures;

    return (
      <Box className="tr-results">
        <Typography variant="h6" gutterBottom>Tail Risk Analysis Results</Typography>

        <Typography variant="subtitle1" gutterBottom>Per Security Metrics</Typography>
        <TableContainer component={Paper} className="tr-table-container">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                {metrics.map(metric => (
                  <TableCell key={metric}>
                    {metric.toUpperCase()}
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
                      {metricsData[metric]?.toFixed(6) || 'N/A'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle1" gutterBottom>Portfolio Metrics</Typography>
        <TableContainer component={Paper} className="tr-table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                {metrics.map(metric => (
                  <TableCell key={metric}>
                    {metric.toUpperCase()}
                  </TableCell>
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
    <Card className="tr-card">
      <CardContent>
        <Typography variant="h6" gutterBottom>Tail Risk Configuration</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Select Measures</Typography>
            <FormGroup row className="tr-form-group">
              {['skewness', 'kurtosis'].map(measure => (
                <FormControlLabel
                  key={measure}
                  control={
                    <Checkbox
                      checked={safeSettings.measures.includes(measure)}
                      onChange={() => handleToggleMeasure(measure)}
                      className="tr-checkbox"
                    />
                  }
                  label={measure.toUpperCase()}
                  className="tr-form-control-label"
                />
              ))}
            </FormGroup>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Threshold Percentile"
              type="number"
              fullWidth
              value={safeSettings.threshold_percentile}
              onChange={e => handleValueChange('threshold_percentile', parseFloat(e.target.value))}
              margin="normal"
              className="tr-text-field"
              placeholder="Enter threshold percentile"
              inputProps={{ min: 0, max: 1, step: 0.01 }}
            />
            
            <FormControl fullWidth margin="normal" className="tr-form-control">
              <InputLabel>Distribution Model</InputLabel>
              <Select
                value={safeSettings.distribution_model}
                onChange={e => handleValueChange('distribution_model', e.target.value)}
                className="tr-select"
                placeholder="Select distribution model"
              >
                {['empirical', 'normal', 'student-t'].map(model => (
                  <MenuItem key={model} value={model}>
                    {model.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider className="tr-divider" />

        {renderResults()}
      </CardContent>
    </Card>
  );
};

export default TailRiskMeasures;
