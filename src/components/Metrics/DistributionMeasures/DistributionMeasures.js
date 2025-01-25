import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Box,
  Grid,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import './DistributionMeasures.css';

const DistributionMeasures = ({ settings, onUpdate, apiResponse }) => {
  const safeSettings = {
    measures: [],
    sector_breakdown: true,
    hhi_analysis: true,
    time_series: [],
    ...settings,
  };

  const handleToggleMeasure = (measure) => {
    const newMeasures = safeSettings.measures.includes(measure)
      ? safeSettings.measures.filter((m) => m !== measure)
      : [...safeSettings.measures, measure];
    onUpdate({ ...safeSettings, measures: newMeasures });
  };

  const handleToggleSetting = (field, value) => {
    onUpdate({ ...safeSettings, [field]: value });
  };

  const renderSectorDistribution = (sectorData) => {
    if (!sectorData) return null;

    return (
      <Box className="dist-results">
        <Typography variant="subtitle1" gutterBottom>
          Sector Distribution
        </Typography>
        <TableContainer component={Paper} className="dist-table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sector</TableCell>
                <TableCell align="right">Weight</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(sectorData).map(([sector, weight]) => (
                <TableRow key={sector}>
                  <TableCell>{sector}</TableCell>
                  <TableCell align="right">{(weight * 100).toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderHHI = (hhiValue) => {
    if (hhiValue === undefined || hhiValue === null) return null;

    return (
      <Box className="dist-results">
        <Typography variant="subtitle1" gutterBottom>
          Herfindahl-Hirschman Index (HHI)
        </Typography>
        <Typography variant="body1">
          HHI: {hhiValue.toFixed(4)}
        </Typography>
        <Typography variant="body2" color="textSecondary" className="dist-hhi-description">
          The HHI measures portfolio concentration. A higher value indicates greater concentration.
        </Typography>
      </Box>
    );
  };

  const renderResults = () => {
    if (!apiResponse?.metrics?.distribution) return null;

    const { sector_distribution, hhi } = apiResponse.metrics.distribution;

    return (
      <>
        {safeSettings.measures.includes('sector_distribution') &&
          renderSectorDistribution(sector_distribution)}
        {safeSettings.measures.includes('hhi') && renderHHI(hhi)}
      </>
    );
  };

  return (
    <Card className="dist-card">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Distribution Analysis
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Select Measures</Typography>
            <FormGroup row className="dist-form-group">
              {['sector_distribution', 'hhi'].map((measure) => (
                <FormControlLabel
                  key={measure}
                  control={
                    <Checkbox
                      checked={safeSettings.measures.includes(measure)}
                      onChange={() => handleToggleMeasure(measure)}
                      className="dist-checkbox"
                    />
                  }
                  label={measure.replace(/_/g, ' ').toUpperCase()}
                  className="dist-form-control-label"
                />
              ))}
            </FormGroup>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={safeSettings.sector_breakdown}
                  onChange={(e) =>
                    handleToggleSetting('sector_breakdown', e.target.checked)
                  }
                  className="dist-checkbox"
                />
              }
              label="Enable Sector Breakdown"
              className="dist-form-control-label"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={safeSettings.hhi_analysis}
                  onChange={(e) =>
                    handleToggleSetting('hhi_analysis', e.target.checked)
                  }
                  className="dist-checkbox"
                />
              }
              label="Enable HHI Analysis"
              className="dist-form-control-label"
              sx={{ mt: 2 }}
            />
          </Grid>
        </Grid>

        <Divider className="dist-divider" />

        {renderResults()}
      </CardContent>
    </Card>
  );
};

export default DistributionMeasures;
