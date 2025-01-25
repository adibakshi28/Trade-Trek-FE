import React from 'react';
import { FormGroup, FormControlLabel, Checkbox, Typography, Grid } from '@mui/material';

const MetricCheckboxes = ({ metrics, onToggle }) => {
  const formatLabel = (metric) => {
    return metric
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Grid container spacing={2} sx={{ mb: 3, p: 2 }}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Select Analysis Modules
        </Typography>
        <FormGroup row>
          {Object.keys(metrics).map((metricKey) => (
            <FormControlLabel
              key={metricKey}
              control={
                <Checkbox
                  checked={metrics[metricKey].enable}
                  onChange={() => onToggle(metricKey)}
                />
              }
              label={formatLabel(metricKey)}
            />
          ))}
        </FormGroup>
      </Grid>
    </Grid>
  );
};

export default MetricCheckboxes;