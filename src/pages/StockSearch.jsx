// src/pages/StockSearch.jsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Snackbar,
  Alert,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { searchStocks } from '../api/stockApi';
import { useNavigate } from 'react-router-dom';

function StockSearch() {
  const navigate = useNavigate();

  // form state
  const [ticker, setTicker] = useState('');
  const [assetType, setAssetType] = useState('');
  // search results
  const [results, setResults] = useState([]);
  // loading + error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setResults([]);
    setError('');
    try {
      const data = await searchStocks(ticker.trim(), assetType || null);
      setResults(data); // array of { stock_ticker, stock_name, asset_type }
    } catch (err) {
      console.error(err);
      setError('Failed to search stocks');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStock = (stockTicker) => {
    // navigate to /dashboard/stocks/<ticker>
    navigate(`/dashboard/stocks/${stockTicker}`);
  };

  const handleCloseSnackbar = () => setShowSnackbar(false);

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Search Stocks / Crypto / Forex</Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Enter Ticker"
            variant="outlined"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Asset Type</InputLabel>
            <Select
              value={assetType}
              label="Asset Type"
              onChange={(e) => setAssetType(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="STOCK">STOCK</MenuItem>
              <MenuItem value="CRYPTO">CRYPTO</MenuItem>
              <MenuItem value="FOREX">FOREX</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </Box>

        {loading && <CircularProgress sx={{ mt: 2 }} />}

        {results.length > 0 && (
          <List sx={{ mt: 2, maxHeight: 500, overflowY: 'auto' }}>
            {results.map((item, idx) => (
              <ListItemButton
                key={idx}
                onClick={() => handleSelectStock(item.stock_ticker)}
              >
                <ListItemText
                  primary={`${item.stock_ticker} - ${item.stock_name}`}
                  secondary={`Type: ${item.asset_type}`}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default StockSearch;
