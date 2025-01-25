import React from 'react';
import {
  FormGroup,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Box,
  Grid
} from '@mui/material';
import './CorrelationDiversification.css';

const CorrelationDiversification = ({ settings, onUpdate, apiResponse }) => {
  const safeSettings = {
    measures: [],
    benchmark: 'SPY',
    correlation_method: 'pearson',
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

  const renderMatrixTable = (matrixData, title) => {
    if (!matrixData) return null;
    
    const tickers = Object.keys(matrixData);
    if (tickers.length === 0) return null;

    return (
      <Box className="cd-results">
        <Typography variant="subtitle1" gutterBottom>{title}</Typography>
        <TableContainer component={Paper} className="cd-table-container">
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                {tickers.map(ticker => (
                  <TableCell key={ticker}>{ticker}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tickers.map(ticker => (
                <TableRow key={ticker}>
                  <TableCell>{ticker}</TableCell>
                  {tickers.map(colTicker => (
                    <TableCell key={colTicker}>
                      {typeof matrixData[ticker][colTicker] === 'number' 
                        ? matrixData[ticker][colTicker].toFixed(4)
                        : 'N/A'}
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

  const renderTrackingError = (trackingData) => {
    if (!trackingData) return null;

    return (
      <Box className="cd-results">
        <Typography variant="subtitle1" gutterBottom>Tracking Error</Typography>
        <TableContainer component={Paper} className="cd-table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(trackingData).map(([ticker, value]) => (
                <TableRow key={ticker}>
                  <TableCell>{ticker}</TableCell>
                  <TableCell>{value?.toFixed(6) || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderResults = () => {
    if (!apiResponse?.metrics?.correlation_diversification) return null;
    
    const { correlation_matrix, r_squared_matrix, tracking_error } = 
      apiResponse.metrics.correlation_diversification;

    return (
      <>
        {safeSettings.measures.includes('correlation_coefficient') && 
          renderMatrixTable(correlation_matrix, 'Correlation Matrix')}
        
        {safeSettings.measures.includes('r_squared') && 
          renderMatrixTable(r_squared_matrix, 'R-Squared Matrix')}
        
        {safeSettings.measures.includes('tracking_error') && 
          renderTrackingError(tracking_error)}
      </>
    );
  };

  return (
    <Card className="cd-card">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Correlation & Diversification Analysis
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Select Measures</Typography>
            <FormGroup row className="cd-form-group">
              {['correlation_coefficient', 'r_squared', 'tracking_error'].map(measure => (
                <FormControlLabel
                  key={measure}
                  control={
                    <Checkbox
                      checked={safeSettings.measures.includes(measure)}
                      onChange={() => handleToggleMeasure(measure)}
                      className="cd-checkbox"
                    />
                  }
                  label={measure.replace(/_/g, ' ').toUpperCase()}
                  className="cd-form-control-label"
                />
              ))}
            </FormGroup>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal" className="cd-form-control">
              <InputLabel>Benchmark</InputLabel>
              <Select
                value={safeSettings.benchmark}
                onChange={e => handleChange('benchmark', e.target.value)}
                className="cd-select"
                placeholder="Select benchmark"
              >
                <MenuItem value="SPY">SPY</MenuItem>
                <MenuItem value="QQQ">QQQ</MenuItem>
                <MenuItem value="DIA">DIA</MenuItem>
                {/* Add other benchmark options if available */}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" className="cd-form-control">
              <InputLabel>Correlation Method</InputLabel>
              <Select
                value={safeSettings.correlation_method}
                onChange={e => handleChange('correlation_method', e.target.value)}
                className="cd-select"
                placeholder="Select correlation method"
              >
                {['pearson', 'spearman', 'kendall'].map(method => (
                  <MenuItem key={method} value={method}>
                    {method.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider className="cd-divider" />

        {renderResults()}
      </CardContent>
    </Card>
  );
};

export default CorrelationDiversification;
