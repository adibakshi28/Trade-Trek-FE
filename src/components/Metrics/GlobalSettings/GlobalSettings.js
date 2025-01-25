import React from 'react';
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './GlobalSettings.css';

const GlobalSettings = ({
  timeframe,
  resolution,
  benchmark,
  settings,
  onTimeframeChange,
  onResolutionChange,
  onBenchmarkChange,
  onSettingsChange
}) => {
  const handleDateChange = (field) => (date) => {
    onTimeframeChange({
      ...timeframe,
      [field]: date.toISOString().split('T')[0]
    });
  };

  return (
    <Grid container spacing={2} className="gs-container">
      {/* Start Date */}
      <Grid item xs={12} sm={6} md={3} className="gs-grid-item">
        <FormControl fullWidth className="gs-form-control">
          <Typography variant="subtitle1" gutterBottom className="gs-label">
            Start Date
          </Typography>
          <DatePicker
            selected={new Date(timeframe.start_date)}
            onChange={handleDateChange('start_date')}
            customInput={<TextField fullWidth variant="outlined" className="gs-text-field" />}
          />
        </FormControl>
      </Grid>
      
      {/* End Date */}
      <Grid item xs={12} sm={6} md={3} className="gs-grid-item">
        <FormControl fullWidth className="gs-form-control">
          <Typography variant="subtitle1" gutterBottom className="gs-label">
            End Date
          </Typography>
          <DatePicker
            selected={new Date(timeframe.end_date)}
            onChange={handleDateChange('end_date')}
            customInput={<TextField fullWidth variant="outlined" className="gs-text-field" />}
          />
        </FormControl>
      </Grid>

      {/* Resolution */}
      <Grid item xs={12} sm={6} md={3} className="gs-grid-item">
        <FormControl fullWidth className="gs-form-control">
          <InputLabel className="gs-input-label">Resolution</InputLabel>
          <Select
            value={resolution}
            onChange={(e) => onResolutionChange(e.target.value)}
            label="Resolution"
            className="gs-select"
          >
            <MenuItem value="1day">1 Day</MenuItem>
            <MenuItem value="1h">1 Hour</MenuItem>
            <MenuItem value="15m">15 Minutes</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Benchmark */}
      <Grid item xs={12} sm={6} md={3} className="gs-grid-item">
        <FormControl fullWidth className="gs-form-control">
          <InputLabel className="gs-input-label">Benchmark</InputLabel>
          <Select
            value={benchmark}
            onChange={(e) => onBenchmarkChange(e.target.value)}
            label="Benchmark"
            className="gs-select"
          >
            <MenuItem value="SPY">SPY</MenuItem>
            {/* Add other benchmark options if available */}
          </Select>
        </FormControl>
      </Grid>

      {/* Return Type */}
      <Grid item xs={12} sm={6} md={3} className="gs-grid-item">
        <FormControl fullWidth className="gs-form-control">
          <InputLabel className="gs-input-label">Return Type</InputLabel>
          <Select
            value={settings.return_type}
            onChange={(e) => onSettingsChange({ ...settings, return_type: e.target.value })}
            label="Return Type"
            className="gs-select"
          >
            <MenuItem value="arithmetic">Arithmetic</MenuItem>
            <MenuItem value="geometric">Geometric</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Include Portfolio */}
      <Grid item xs={12} sm={6} md={3} className="gs-grid-item">
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.include_portfolio}
              onChange={(e) => onSettingsChange({ ...settings, include_portfolio: e.target.checked })}
              className="gs-checkbox"
            />
          }
          label="Include Portfolio"
          className="gs-form-control-label"
        />
      </Grid>

      {/* Include Benchmark Trend */}
      <Grid item xs={12} sm={6} md={3} className="gs-grid-item">
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.include_benchmark_trend}
              onChange={(e) => onSettingsChange({ ...settings, include_benchmark_trend: e.target.checked })}
              className="gs-checkbox"
            />
          }
          label="Include Benchmark Trend"
          className="gs-form-control-label"
        />
      </Grid>
    </Grid>
  );
};

export default GlobalSettings;
