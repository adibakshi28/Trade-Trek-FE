// src/components/TradeDialog/TradeDialog.js

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  Skeleton,
  InputAdornment,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import NumbersIcon from '@mui/icons-material/Numbers';

import './TradeDialog.css';

import { useWebSocket } from '../../context/WebSocketContext';
import { getUserPortfolio } from '../../api/userApi';
import { placeStockTransaction, getTransactionValue } from '../../api/stockApi';

function TradeDialog({
  open,
  onClose,
  symbol,
  refreshPortfolio,
  showSnackbar,
}) {
  // Real-time data from WebSocket
  const { prices } = useWebSocket();

  // Local states
  const [name, setName] = useState(''); // If you have a way to fetch stock name, do so
  const [localPrice, setLocalPrice] = useState(0);
  const [localDayChange, setLocalDayChange] = useState(0);
  const [existingQty, setExistingQty] = useState(0);

  const [quantity, setQuantity] = useState('');
  const [txnValueResult, setTxnValueResult] = useState(null);
  const [isLoadingValue, setIsLoadingValue] = useState(false);
  const [isPlacingTrade, setIsPlacingTrade] = useState(false);

  // On open, reset everything and fetch existing qty
  useEffect(() => {
    if (!open) return;
    // Reset
    setName('');
    setLocalPrice(0);
    setLocalDayChange(0);
    setQuantity('');
    setExistingQty(0);
    setTxnValueResult(null);

    fetchExistingQty();
  }, [open, symbol]);

  // Listen for real-time price updates from WebSocket
  useEffect(() => {
    if (!open || !symbol) return;
    const symbolUpper = symbol.toUpperCase();
    const wsData = prices[symbolUpper];
    if (wsData) {
      setLocalPrice(wsData.ltp);
      setLocalDayChange(wsData.day_change);
    }
  }, [open, symbol, prices]);

  // When quantity changes, fetch transaction value
  useEffect(() => {
    if (open && quantity && parseFloat(quantity) > 0 && localPrice > 0) {
      fetchTransactionValue();
    } else {
      setTxnValueResult(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity]);

  const fetchExistingQty = async () => {
    try {
      const portfolio = await getUserPortfolio();
      const pos = portfolio.find(
        (p) => p.stock_ticker?.toUpperCase() === symbol?.toUpperCase()
      );
      setExistingQty(pos ? pos.quantity : 0);
    } catch (err) {
      console.error('Error fetching existing qty:', err);
    }
  };

  // Manually re-fetch transaction value if user hits Refresh
  const handleRefreshValue = async () => {
    fetchTransactionValue();
  };

  // GET /stock/transaction/value
  const fetchTransactionValue = async () => {
    if (!quantity || Number(quantity) <= 0) {
      setTxnValueResult(null);
      return;
    }
    setIsLoadingValue(true);
    try {
      const resp = await getTransactionValue(symbol, quantity, localPrice);
      setTxnValueResult(resp);
    } catch (err) {
      console.error('Error fetching transaction value:', err);
      setTxnValueResult(null);
    } finally {
      setIsLoadingValue(false);
    }
  };

  const handleQuantityChange = (e) => {
    // Only allow digits & decimal points:
    const val = e.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(val)) {
      setQuantity(val);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBuy = async () => {
    if (!quantity) return;
    setIsPlacingTrade(true);
    try {
      const resp = await placeStockTransaction({
        ticker: symbol,
        direction: 'BUY',
        quantity,
      });
      if (resp.success) {
        showSnackbar(
          `BUY success: Bought ${resp.quantity} of ${resp.stockTicker} at $${resp.executionPrice}`,
          'success'
        );
        await refreshPortfolio();
        onClose();
      } else {
        showSnackbar('Buy transaction failed.', 'error');
      }
    } catch (err) {
      console.error('Error placing BUY transaction:', err);
      showSnackbar('Server Error. Try again.', 'error');
    } finally {
      setIsPlacingTrade(false);
    }
  };

  const handleSell = async () => {
    if (!quantity) return;
    setIsPlacingTrade(true);
    try {
      const resp = await placeStockTransaction({
        ticker: symbol,
        direction: 'SELL',
        quantity,
      });
      if (resp.success) {
        showSnackbar(
          `SELL success: Sold ${resp.quantity} of ${resp.stockTicker} at $${resp.executionPrice}`,
          'success'
        );
        await refreshPortfolio();
        onClose();
      } else {
        showSnackbar('Sell transaction failed.', 'error');
      }
    } catch (err) {
      console.error('Error placing SELL transaction:', err);
      showSnackbar('Server Error. Try again.', 'error');
    } finally {
      setIsPlacingTrade(false);
    }
  };

  const isBuyPossible = txnValueResult?.buy_trade_possible;
  const isSellPossible = txnValueResult?.sell_trade_possible;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      classes={{ paper: 'trade-dialog__paper' }}
      PaperProps={{
        style: {
          width: '450px', // Fixed width
          height: '650px', // Fixed height
          maxWidth: '90%',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          overflow: 'hidden',
          borderRadius: '12px',
          animation: 'fadeIn 0.3s ease-in-out',
        },
      }}

      TransitionProps={{
        // Adding fade-in animation
        onEntering: (node) => {
          node.style.opacity = 0;
          setTimeout(() => {
            node.style.transition = 'opacity 0.3s';
            node.style.opacity = 1;
          }, 10);
        },
      }}
    >
      <DialogTitle className="trade-dialog__title">
        Trade {symbol.toUpperCase()}
      </DialogTitle>

      <DialogContent className="trade-dialog__content">
        <Box className="trade-dialog__stock-info">
          <Typography variant="h6" className="trade-dialog__stock-name">
            {name || symbol}
          </Typography>
          <Typography variant="body1" className="trade-dialog__price">
            Price: ${localPrice?.toFixed(2)}
          </Typography>
          <Typography
            variant="body1"
            className={`trade-dialog__day-change ${
              localDayChange >= 0 ? 'positive' : 'negative'
            }`}
          >
            Day Change:{' '}
            {localDayChange >= 0
              ? `+${localDayChange.toFixed(2)}%`
              : `${localDayChange.toFixed(2)}%`}
          </Typography>
        </Box>

        <Typography variant="body1" className="trade-dialog__existing-qty">
          Existing Qty: {existingQty}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginY: '0rem',
          }}
        >
          <Typography variant="body2" className="trade-dialog__market-label">
            Market Order
          </Typography>
          {/* Refresh icon to recalc the transaction value manually */}
          <IconButton
            size="small"
            onClick={handleRefreshValue}
            className="trade-dialog__refresh-button"
            aria-label="Refresh Transaction Value"
          >
            <RefreshIcon fontSize="custom" />
          </IconButton>
        </Box>

        <TextField
          variant="outlined"
          placeholder="Enter Quantity"
          value={quantity}
          onChange={handleQuantityChange}
          className="trade-dialog__quantity-field"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <NumbersIcon />
              </InputAdornment>
            ),
          }}
        />

        {isLoadingValue && (
          <Box
            sx={{
              marginBottom: '1rem',
            }}
          >
            <Skeleton variant="rectangular" height={60} />
          </Box>
        )}

        {txnValueResult && !isLoadingValue && (
          <Box className="trade-dialog__txn-box">
            <Typography variant="body2" className="txn-row">
              Transaction Fee: ${txnValueResult.transaction_fee?.toFixed(2)}
            </Typography>
            <Typography variant="body2" className="txn-row">
              Required Funds (Buy): ${txnValueResult.required_funds_buy?.toFixed(
                2
              )}
            </Typography>
            <Typography variant="body2" className="txn-row">
              Required Funds (Sell): ${txnValueResult.required_funds_sell?.toFixed(
                2
              )}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="trade-dialog__actions">
        <Box className="trade-dialog__buttons-container">
          <Button
            onClick={handleBuy}
            disabled={!quantity || isPlacingTrade || !isBuyPossible}
            className="trade-dialog__action-button buy-button"
            variant="contained"
          >
            Buy
          </Button>
          <Button
            onClick={handleSell}
            disabled={!quantity || isPlacingTrade || !isSellPossible}
            className="trade-dialog__action-button sell-button"
            variant="contained"
          >
            Sell
          </Button>
        </Box>
        <Button
          onClick={handleCancel}
          className="trade-dialog__cancel-button"
          variant="outlined"
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TradeDialog;
