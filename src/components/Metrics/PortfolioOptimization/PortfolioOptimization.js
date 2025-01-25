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

const PortfolioOptimization = ({ settings, onUpdate, apiResponse }) => {
  const safeSettings = {
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

  const handleConstraintsChange = (field, value) => {
    onUpdate({
      ...safeSettings,
      constraints: {
        ...safeSettings.constraints,
        [field]: value
      }
    });
  };

  const renderResults = () => {
    if (!apiResponse?.metrics?.portfolio_optimization) return null;

    const { optimal_allocation, objective_value, goal, rebalance_frequency, note_on_transaction_costs } =
      apiResponse.metrics.portfolio_optimization;

    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Portfolio Optimization Results</Typography>

        <Typography variant="subtitle1" gutterBottom>Optimal Allocation</Typography>
        <TableContainer component={Paper} sx={{ mb: 4, maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                <TableCell>Allocation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(optimal_allocation).map(([ticker, allocation]) => (
                <TableRow key={ticker}>
                  <TableCell>{ticker}</TableCell>
                  <TableCell>{(allocation * 100).toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="subtitle1" gutterBottom>Objective Value</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {objective_value.toFixed(6)}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>Goal</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {goal}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>Rebalance Frequency</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {rebalance_frequency}
        </Typography>

        <Typography variant="subtitle1" gutterBottom>Note on Transaction Costs</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {note_on_transaction_costs}
        </Typography>
      </Box>
    );
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Portfolio Optimization Configuration</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Select Measures</Typography>
            <FormGroup row>
              {['optimal_allocation'].map(measure => (
                <FormControlLabel
                  key={measure}
                  control={
                    <Checkbox
                      checked={safeSettings.measures.includes(measure)}
                      onChange={() => handleToggleMeasure(measure)}
                    />
                  }
                  label={measure.toUpperCase()}
                />
              ))}
            </FormGroup>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Goal</InputLabel>
              <Select
                value={safeSettings.goal}
                onChange={e => handleValueChange('goal', e.target.value)}
              >
                {['maximize_return', 'minimize_risk', 'maximize_sharpe_ratio'].map(goal => (
                  <MenuItem key={goal} value={goal}>
                    {goal.replace(/_/g, ' ').toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Target Volatility"
              type="number"
              fullWidth
              value={safeSettings.target_volatility}
              onChange={e => handleValueChange('target_volatility', parseFloat(e.target.value))}
              margin="normal"
              inputProps={{ min: 0, max: 1, step: 0.01 }}
            />

            <TextField
              label="Min Return Constraint"
              type="number"
              fullWidth
              value={safeSettings.min_return_constraint}
              onChange={e => handleValueChange('min_return_constraint', parseFloat(e.target.value))}
              margin="normal"
              inputProps={{ min: 0, max: 1, step: 0.01 }}
            />

            <TextField
              label="Min Allocation"
              type="number"
              fullWidth
              value={safeSettings.constraints.min_allocation}
              onChange={e => handleConstraintsChange('min_allocation', parseFloat(e.target.value))}
              margin="normal"
              inputProps={{ min: 0, max: 1, step: 0.01 }}
            />

            <TextField
              label="Max Allocation"
              type="number"
              fullWidth
              value={safeSettings.constraints.max_allocation}
              onChange={e => handleConstraintsChange('max_allocation', parseFloat(e.target.value))}
              margin="normal"
              inputProps={{ min: 0, max: 1, step: 0.01 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={safeSettings.include_transaction_costs}
                  onChange={e => handleValueChange('include_transaction_costs', e.target.checked)}
                />
              }
              label="Include Transaction Costs"
            />

            {safeSettings.include_transaction_costs && (
              <TextField
                label="Transaction Costs"
                type="number"
                fullWidth
                value={safeSettings.transaction_costs}
                onChange={e => handleValueChange('transaction_costs', parseFloat(e.target.value))}
                margin="normal"
                inputProps={{ min: 0, max: 1, step: 0.01 }}
              />
            )}

            <FormControl fullWidth margin="normal">
              <InputLabel>Rebalance Frequency</InputLabel>
              <Select
                value={safeSettings.rebalance_frequency}
                onChange={e => handleValueChange('rebalance_frequency', e.target.value)}
              >
                {['daily', 'weekly', 'monthly', 'quarterly'].map(frequency => (
                  <MenuItem key={frequency} value={frequency}>
                    {frequency.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {renderResults()}
      </CardContent>
    </Card>
  );
};

export default PortfolioOptimization;