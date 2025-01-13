// src/api/stockApi.js
import axiosClient from '../utils/axiosClient';

// GET /stock/search?ticker=xxx&asset_type=STOCK|CRYPTO|FOREX (optional)
export const searchStocks = async (ticker, assetType) => {
  // build query params
  const params = { ticker };
  if (assetType) {
    params.asset_type = assetType; // optional
  }
  const res = await axiosClient.get('/stock/search', { params });
  return res.data; // array of top matches
};

// GET /stock?ticker=xxx
// returns asset_type, quote, profile, financials, news
export const getStockInfo = async (ticker) => {
  const res = await axiosClient.get('/stock', {
    params: { ticker },
  });
  return res.data;
};

// GET /stock/historical?ticker=xxx&start_date=yyyy-mm-dd&end_date=yyyy-mm-dd&resolution=1day
export const getStockHistorical = async (ticker, start_date, end_date, resolution) => {
  const res = await axiosClient.get('/stock/historical', {
    params: { ticker, start_date, end_date, resolution },
  });
  return res.data;
};

// POST /stock/transaction?ticker=xxx&direction=BUY&quantity=10
export const placeStockTransaction = async ({ ticker, direction, quantity }) => {
  const res = await axiosClient.post('/stock/transaction', null, {
    params: { ticker, direction, quantity },
  });
  return res.data;
};

// GET /stock/quote?ticker=xxx
export const getStockQuote = async (ticker) => {
  const res = await axiosClient.get('/stock/quote', {
    params: { ticker },
  });
  return res.data; // e.g. { c, d, dp, stock_ticker, stock_name, ... }
};

// GET /stock/universe
export const getStockUniverse = async () => {
  const res = await axiosClient.get('/stock/universe');
  return res.data; // array of { stock_ticker, stock_name, asset_type }
};

// GET /stock/transaction/value?ticker=...&quantity=...&current_price=...
export const getTransactionValue = async (ticker, quantity, currentPrice) => {
  const res = await axiosClient.get('/stock/transaction/value', {
    params: {
      ticker,
      quantity,
      current_price: currentPrice,
    },
  });
  return res.data; // { transaction_fee, required_funds_buy, required_funds_sell, buy_trade_possible, sell_trade_possible, etc. }
};