// src/components/TransactionsTable/TransactionsTable.js

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
  Snackbar,
  Alert,
  Skeleton,
  Box,
  TablePagination,
} from '@mui/material';
import { format } from 'date-fns';
import { getUserTransactions } from '../../api/userApi';
import { motion } from 'framer-motion';
import './TransactionsTable.css'; // Import the separate CSS file

// ✨ **Animation Variants**
const pageVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.5, ease: 'easeIn' } },
};

function TransactionsTable() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated data
  const paginatedTransactions = transactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="transactions-container">
        <Paper className="transactions-paper" elevation={3}>
          {/* Snackbar for Error Messages */}
          <Snackbar
            open={showSnackbar}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          </Snackbar>

          {/* Page Title */}
          <Typography variant="h5" fontWeight="bold" gutterBottom className="transactions-title">
            📑 Transaction History
          </Typography>

          {/* Loading State with Skeleton */}
          {loading ? (
            <Box>
              {[...Array(5)].map((_, index) => (
                <div className="skeleton-row" key={index}>
                  <Skeleton variant="text" width="10%" height={30} />
                  <Skeleton variant="text" width="15%" height={30} />
                  <Skeleton variant="text" width="10%" height={30} />
                  <Skeleton variant="text" width="10%" height={30} />
                  <Skeleton variant="text" width="10%" height={30} />
                  <Skeleton variant="text" width="15%" height={30} />
                  <Skeleton variant="text" width="20%" height={30} />
                </div>
              ))}
            </Box>
          ) : transactions.length === 0 ? (
            <Typography className="no-transactions">No transactions found.</Typography>
          ) : (
            <>
              <TableContainer className="transactions-table-container">
                <Table stickyHeader className="transactions-table">
                  <TableHead className="transactions-table-head">
                    <TableRow>
                      <TableCell className="transactions-header-cell">#</TableCell>
                      <TableCell className="transactions-header-cell">Stock Ticker</TableCell>
                      <TableCell className="transactions-header-cell">Direction</TableCell>
                      <TableCell className="transactions-header-cell">Quantity</TableCell>
                      <TableCell className="transactions-header-cell">Execution Price</TableCell>
                      <TableCell className="transactions-header-cell">Transaction Fee</TableCell>
                      <TableCell className="transactions-header-cell">Trade Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTransactions.map((tx, index) => {
                      const createdAt = tx.created_at
                        ? format(new Date(tx.created_at), 'dd MMM yy')
                        : 'N/A';
                      const createdAtTime = tx.created_at
                        ? format(new Date(tx.created_at), 'hh:mm a')
                        : '';
                      return (
                        <TableRow key={tx.id} className="transactions-table-row">
                          <TableCell className="transactions-cell">
                            {index + 1 + page * rowsPerPage}
                          </TableCell>
                          <TableCell className="transactions-cell">{tx.stock_ticker}</TableCell>
                          <TableCell className={`transactions-cell ${tx.direction.toLowerCase()}`}>
                            {tx.direction}
                          </TableCell>
                          <TableCell className="transactions-cell">{tx.quantity}</TableCell>
                          <TableCell className="transactions-cell">${tx.execution_price}</TableCell>
                          <TableCell className="transactions-cell">${tx.transaction_fee}</TableCell>
                          <TableCell className="transactions-cell">
                            {createdAt}
                            <div className="trade-time">{createdAtTime}</div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                component="div"
                count={transactions.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                className="transactions-pagination"
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </Paper>
      </div>
    </motion.div>
  );
}

export default TransactionsTable;
