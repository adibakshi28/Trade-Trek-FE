// src/pages/Transactions.jsx
import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import { getUserTransactions } from '../api/userApi';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserTransactions();
        setTransactions(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load transactions');
        setShowSnackbar(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCloseSnackbar = () => setShowSnackbar(false);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>
      {transactions.length === 0 ? (
        <Typography>No transactions found.</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>S. No.</TableCell>
                <TableCell>Stock Ticker</TableCell>
                <TableCell>Direction</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Execution Price</TableCell>
                <TableCell>Transaction Fee</TableCell>
                <TableCell>Created At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx, index) => {
                const createdAt = tx.created_at
                  ? format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss')
                  : 'N/A';
                return (
                  <TableRow key={tx.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{tx.stock_ticker}</TableCell>
                    <TableCell>{tx.direction}</TableCell>
                    <TableCell>{tx.quantity}</TableCell>
                    <TableCell>${tx.execution_price}</TableCell>
                    <TableCell>${tx.transaction_fee}</TableCell>
                    <TableCell>{createdAt}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export default Transactions;
