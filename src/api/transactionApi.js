// src/api/transactionApi.js
import axiosClient from '../utils/axiosClient';

// GET /stock/transaction/value?ticker=...&quantity=...&current_price=...
export const getTransactionValue = async ({ ticker, quantity, current_price }) => {
  const res = await axiosClient.get('/stock/transaction/value', {
    params: { ticker, quantity, current_price },
  });
  return res.data; // { transaction_fee, required_funds_buy, required_funds_sell, buy_trade_possible, sell_trade_possible, etc. }
};
