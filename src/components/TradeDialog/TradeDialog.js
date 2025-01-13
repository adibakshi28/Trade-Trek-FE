// src/components/TradeDialog/TradeDialog.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

import './TradeDialog.css';

import { useWebSocket } from '../../context/WebSocketContext'; 
import { getUserPortfolio } from '../../api/userApi';
import { placeStockTransaction, getTransactionValue } from '../../api/stockApi';

function TradeDialog({
  open,
  onClose,
  symbol,             // the ticker symbol
  refreshPortfolio,   // callback from parent to re-fetch portfolio on success
  showSnackbar,       // callback from parent to show success/error
}) {
  // Real-time data from WebSocket
  const { prices } = useWebSocket();

  // Local states
  const [name, setName] = useState('');           // Stock name if needed
  const [localPrice, setLocalPrice] = useState(0); // Real-time price
  const [localDayChange, setLocalDayChange] = useState(0);
  const [existingQty, setExistingQty] = useState(0);

  const [quantity, setQuantity] = useState('');
  const [txnValueResult, setTxnValueResult] = useState(null); // from /stock/transaction/value
  const [isLoadingValue, setIsLoadingValue] = useState(false);
  const [isPlacingTrade, setIsPlacingTrade] = useState(false);

  // 1) On open, reset everything and fetch existing quantity
  useEffect(() => {
    if (!open) return;

    // Reset fields
    setName('');
    setLocalPrice(0);
    setLocalDayChange(0);
    setQuantity('');
    setExistingQty(0);
    setTxnValueResult(null);

    // Attempt to get existing quantity
    fetchExistingQty();
  }, [open, symbol]);

  // 2) Also listen to changes in `prices[symbol]` from WebSocket for real-time price
  useEffect(() => {
    if (!open || !symbol) return;

    const symbolUpper = symbol.toUpperCase();
    const wsData = prices[symbolUpper]; // e.g. { ltp, day_change }
    if (wsData) {
      setLocalPrice(wsData.ltp);
      setLocalDayChange(wsData.day_change);
    }
  }, [open, symbol, prices]);

  // If quantity changes or real-time price changes => re-check transaction value
  useEffect(() => {
    if (open && quantity && Number(quantity) > 0 && localPrice > 0) {
      fetchTransactionValue();
    } else {
      setTxnValueResult(null);
    }
  }, [quantity, localPrice]);

  // Fetch the user’s existing quantity for this symbol from portfolio
  const fetchExistingQty = async () => {
    try {
      const portfolio = await getUserPortfolio();
      const position = portfolio.find(
        (p) => p.stock_ticker?.toUpperCase() === symbol?.toUpperCase()
      );
      setExistingQty(position ? position.quantity : 0);
    } catch (err) {
      console.error('Error fetching existing qty:', err);
    }
  };

  // Query /stock/transaction/value?...
  const fetchTransactionValue = async () => {
    try {
      setIsLoadingValue(true);
      const resp = await getTransactionValue(symbol, quantity, localPrice);
      // resp => { transaction_fee, required_funds_buy, required_funds_sell, buy_trade_possible, sell_trade_possible, ... }
      setTxnValueResult(resp);
    } catch (err) {
      console.error('Error fetching transaction value:', err);
      setTxnValueResult(null);
    } finally {
      setIsLoadingValue(false);
    }
  };

  // Called if user changes the quantity field
  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  // Cancel trade
  const handleCancel = () => {
    onClose();
  };

  // Place a BUY trade
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
        showSnackbar(`BUY success: Bought ${resp.quantity} of ${resp.stockTicker}`, 'success');
        await refreshPortfolio(); 
        onClose();
      } else {
        showSnackbar('Buy transaction failed', 'error');
      }
    } catch (err) {
      console.error('Error placing BUY transaction:', err);
      showSnackbar('Server Error. Try again', 'error');
    } finally {
      setIsPlacingTrade(false);
    }
  };

  // Place a SELL trade
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
        showSnackbar(`SELL success: Sold ${resp.quantity} of ${resp.stockTicker}`, 'success');
        await refreshPortfolio();
        onClose();
      } else {
        showSnackbar('Sell transaction failed', 'error');
      }
    } catch (err) {
      console.error('Error placing SELL transaction:', err);
      showSnackbar('Server Error. Try again', 'error');
    } finally {
      setIsPlacingTrade(false);
    }
  };

  // Are BUY/SELL possible from the transaction-value result?
  const isBuyPossible = txnValueResult?.buy_trade_possible;
  const isSellPossible = txnValueResult?.sell_trade_possible;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      classes={{ paper: 'trade-dialog__paper' }} // tie to CSS
      PaperProps={{
        style: {
          width: '400px',
          height: '520px',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          overflow: 'hidden', // fixed size
        },
      }}
    >
      <DialogTitle className="trade-dialog__title">
        Trade <span>{symbol}</span>
      </DialogTitle>

      <DialogContent className="trade-dialog__content">
        <Typography variant="body1" className="trade-dialog__stock-name">
          {name || symbol}
        </Typography>

        {/* Real-time price & dayChange */}
        <Typography variant="body2" className="trade-dialog__price">
          Price: ${localPrice?.toFixed(2)}
        </Typography>
        <Typography
          variant="body2"
          className={`trade-dialog__day-change ${
            localDayChange >= 0 ? 'positive' : 'negative'
          }`}
        >
          Day Change:{' '}
          {localDayChange >= 0
            ? `+${localDayChange.toFixed(2)}`
            : localDayChange.toFixed(2)}
        </Typography>

        <Typography variant="body2" className="trade-dialog__existing-qty">
          Existing Qty: {existingQty}
        </Typography>

        <TextField
          label="Quantity"
          type="number"
          variant="outlined"
          fullWidth
          size="small"
          sx={{ marginTop: '0.8rem' }}
          value={quantity}
          onChange={handleQuantityChange}
          className="trade-dialog__quantity-field"
        />

        {isLoadingValue && (
          <Box sx={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ marginRight: '0.5rem' }} />
            <Typography variant="body2">Calculating trade...</Typography>
          </Box>
        )}

        {txnValueResult && !isLoadingValue && (
          <Box className="trade-dialog__txn-box">
            <Typography variant="body2">
              Transaction Fee: ${txnValueResult.transaction_fee?.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              Required Funds (Buy): ${txnValueResult.required_funds_buy?.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              Required Funds (Sell): ${txnValueResult.required_funds_sell?.toFixed(2)}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions className="trade-dialog__actions">
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSell}
          disabled={
            !quantity ||
            isPlacingTrade ||
            !isSellPossible
          }
          sx={{
            backgroundColor: 'var(--color-error)',
            color: 'var(--color-text-primary)',
            marginRight: '0.5rem',
            ':hover': {
              backgroundColor: '#cc4f4f',
            },
          }}
        >
          Sell
        </Button>
        <Button
          onClick={handleBuy}
          disabled={
            !quantity ||
            isPlacingTrade ||
            !isBuyPossible
          }
          sx={{
            backgroundColor: 'var(--color-success)',
            color: 'var(--color-text-primary)',
            ':hover': {
              backgroundColor: '#4cad7c',
            },
          }}
        >
          Buy
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TradeDialog;
