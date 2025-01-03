// src/pages/StockSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  TextField,
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
  Skeleton,
  Grow,
  Slide,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUniverse } from '../context/UniverseContext';

function StockSearch() {
  const navigate = useNavigate();

  // Access Universe Context
  const { universeData, isLoading, error, fetchUniverseData } = useUniverse();

  // State Management
  const [universe, setUniverse] = useState([]);
  const [loadingUniverse, setLoadingUniverse] = useState(true);
  const [ticker, setTicker] = useState('');
  const [assetType, setAssetType] = useState('');
  const [results, setResults] = useState([]);
  const [localError, setLocalError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Prevent Duplicate API Calls
  const hasFetchedData = useRef(false);

  useEffect(() => {
    const loadUniverseData = async () => {
      if (!hasFetchedData.current && !universeData) {
        try {
          setLoadingUniverse(true);
          await fetchUniverseData();
          hasFetchedData.current = true;
        } catch (err) {
          console.error(err);
          setLocalError('Failed to load data. Try again later.');
          setShowSnackbar(true);
        } finally {
          setLoadingUniverse(false);
        }
      }
    };

    loadUniverseData();
  }, [universeData, fetchUniverseData]);

  useEffect(() => {
    if (universeData) {
      setUniverse(universeData);
      setLoadingUniverse(false);
    }
    if (error) {
      setLocalError(error);
      setShowSnackbar(true);
      setLoadingUniverse(false);
    }
  }, [universeData, error]);

  const handleCloseSnackbar = () => setShowSnackbar(false);

  // Dynamic Filtering
  const handleTickerChange = (e) => {
    const value = e.target.value.trim().toUpperCase();
    setTicker(value);

    if (!value) {
      setResults([]);
      setShowSuggestions(false);
      return;
    }

    let filtered = universe.filter((item) =>
      item.stock_ticker.toUpperCase().includes(value)
    );

    if (assetType) {
      filtered = filtered.filter((item) => item.asset_type === assetType);
    }

    setResults(filtered.slice(0, 10)); // Top 10 suggestions
    setShowSuggestions(true);
  };

  const handleSelectStock = (stockTicker) => {
    navigate(`/dashboard/stocks/${stockTicker}`);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'linear-gradient(to bottom, #ffffff, #f9fafc)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h5" mb={3} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Search Stocks / Crypto / Forex
        </Typography>

        {/* Search and Filter */}
        {loadingUniverse || isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="text" width={200} />
            <Skeleton variant="rectangular" width="100%" height={40} />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
              mb: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: '#f4f6f8',
            }}
          >
            {/* Search Input */}
            <TextField
              label="Search Ticker"
              variant="outlined"
              value={ticker}
              onChange={handleTickerChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              sx={{ flex: 2, minWidth: 200 }}
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />

            {/* Asset Type Dropdown */}
            <FormControl sx={{ flex: 1, minWidth: 150 }}>
              <InputLabel>Asset Type</InputLabel>
              <Select
                value={assetType}
                label="Asset Type"
                onChange={(e) => setAssetType(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="STOCK">STOCK</MenuItem>
                <MenuItem value="CRYPTO">CRYPTO</MenuItem>
                <MenuItem value="FOREX">FOREX</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Suggestions with Animations */}
        <Slide direction="up" in={showSuggestions} mountOnEnter unmountOnExit>
          <Box
            sx={{
              maxHeight: 350,
              overflowY: 'auto',
              mt: 2,
              border: '1px solid #ddd',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
            }}
          >
            {results.length > 0 && (
              <List>
                {results.map((item, idx) => (
                  <Grow in={true} timeout={500} key={idx}>
                    <ListItemButton
                      onClick={() => handleSelectStock(item.stock_ticker)}
                      sx={{
                        transition: 'background-color 0.3s',
                        '&:hover': { backgroundColor: '#f0f4ff' },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1">
                            {item.stock_ticker} - {item.stock_name}
                          </Typography>
                        }
                        secondary={`Type: ${item.asset_type}`}
                      />
                    </ListItemButton>
                  </Grow>
                ))}
              </List>
            )}
            {results.length === 0 && ticker && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ p: 2, textAlign: 'center' }}
              >
                No matching results found.
              </Typography>
            )}
          </Box>
        </Slide>
      </Paper>

      {/* Snackbar for Errors */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {localError || error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default StockSearch;
