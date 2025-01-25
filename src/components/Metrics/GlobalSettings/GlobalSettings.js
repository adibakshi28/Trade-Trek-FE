import React from 'react';
import { Grid, TextField, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox, Typography } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {/* Date Pickers */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <Typography variant="subtitle1" gutterBottom>Start Date</Typography>
          <DatePicker
            selected={new Date(timeframe.start_date)}
            onChange={handleDateChange('start_date')}
            customInput={<TextField fullWidth variant="outlined" />}
          />
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <Typography variant="subtitle1" gutterBottom>End Date</Typography>
          <DatePicker
            selected={new Date(timeframe.end_date)}
            onChange={handleDateChange('end_date')}
            customInput={<TextField fullWidth variant="outlined" />}
          />
        </FormControl>
      </Grid>

      {/* Resolution */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel>Resolution</InputLabel>
          <Select
            value={resolution}
            onChange={(e) => onResolutionChange(e.target.value)}
            label="Resolution"
          >
            <MenuItem value="1day">1 Day</MenuItem>
            <MenuItem value="1h">1 Hour</MenuItem>
            <MenuItem value="15m">15 Minutes</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Benchmark */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel>Benchmark</InputLabel>
          <Select
            value={benchmark}
            onChange={(e) => onBenchmarkChange(e.target.value)}
            label="Benchmark"
          >
            <MenuItem value="SPY">SPY</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Settings */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel>Return Type</InputLabel>
          <Select
            value={settings.return_type}
            onChange={(e) => onSettingsChange({ ...settings, return_type: e.target.value })}
            label="Return Type"
          >
            <MenuItem value="arithmetic">Arithmetic</MenuItem>
            <MenuItem value="geometric">Geometric</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.include_portfolio}
              onChange={(e) => onSettingsChange({ ...settings, include_portfolio: e.target.checked })}
            />
          }
          label="Include Portfolio"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.include_benchmark_trend}
              onChange={(e) => onSettingsChange({ ...settings, include_benchmark_trend: e.target.checked })}
            />
          }
          label="Include Benchmark Trend"
        />
      </Grid>
    </Grid>
  );
};

export default GlobalSettings;