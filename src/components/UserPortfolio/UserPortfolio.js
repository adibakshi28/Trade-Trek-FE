// src/components/UserPortfolio/UserPortfolio.js

import React, { useState, useMemo } from 'react';
import './UserPortfolio.css';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Typography,
  Paper,
  TableSortLabel,
  Box,
} from '@mui/material';

function UserPortfolio({ positions }) {
  // State for sorting
  const [order, setOrder] = useState('asc'); // 'asc' or 'desc'
  const [orderBy, setOrderBy] = useState('stock_ticker'); // Column to sort by

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Comparator functions
  const descendingComparator = (a, b, property) => {
    if (typeof a[property] === 'string') {
      return b[property].localeCompare(a[property]);
    }
    if (b[property] < a[property]) {
      return -1;
    }
    if (b[property] > a[property]) {
      return 1;
    }
    return 0;
  };

  const getComparator = (order, property) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, property)
      : (a, b) => -descendingComparator(a, b, property);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const comp = comparator(a[0], b[0]);
      if (comp !== 0) return comp;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  // Sorted positions
  const sortedPositions = useMemo(() => {
    return stableSort(positions, getComparator(order, orderBy));
  }, [positions, order, orderBy]);

  // Define table headers with sortable properties
  const headCells = [
    { id: 'instrument', label: 'Instrument', sortable: false },
    { id: 'quantity', label: 'Qty', sortable: true },
    { id: 'direction', label: 'Direction', sortable: true },
    { id: 'execution_price', label: 'Avg. Cost', sortable: true },
    { id: 'ltp', label: 'LTP', sortable: true },
    { id: 'curValue', label: 'Cur. Value', sortable: true },
    { id: 'pnl', label: 'P&L', sortable: true },
    { id: 'netChg', label: 'Net Chg. (%)', sortable: true },
    { id: 'dayPnL', label: 'Day P&L', sortable: true },
  ];

  return (
    <Paper className="portfolio-card" elevation={3}>
      {/* Table Container */}
      <TableContainer className="portfolio-table">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  className="portfolio-header"
                  align={headCell.id === 'instrument' ? 'left' : 'center'}
                  sortDirection={orderBy === headCell.id ? order : false}
                >
                  {headCell.sortable ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={() => handleRequestSort(headCell.id)}
                      hideSortIcon={false}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPositions.map((pos, i) => {
              const isPositive = pos.pnl >= 0;
              return (
                <TableRow key={i} className="portfolio-row">
                  <TableCell className="portfolio-cell">
                    <Typography className="portfolio-ticker">{pos.stock_ticker}</Typography>
                    <Typography className="portfolio-name">{pos.stock_name}</Typography>
                  </TableCell>
                  <TableCell align="center" className="portfolio-value">
                    {pos.quantity}
                  </TableCell>
                  <TableCell align="center" className="portfolio-value">
                    {pos.direction}
                  </TableCell>
                  <TableCell align="center" className="portfolio-value">
                    {pos.execution_price.toFixed(2)}
                  </TableCell>
                  <TableCell align="center" className="portfolio-value">
                    {pos.ltp.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={pos.pnl >= 0 ? 'portfolio-positive' : 'portfolio-negative'}
                  >
                    {pos.curValue.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={isPositive ? 'portfolio-positive' : 'portfolio-negative'}
                  >
                    {pos.pnl >= 0 ? `+${pos.pnl.toFixed(2)}` : pos.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={pos.netChg >= 0 ? 'portfolio-positive' : 'portfolio-negative'}
                  >
                    {pos.netChg >= 0
                      ? `+${pos.netChg.toFixed(2)}%`
                      : `${pos.netChg.toFixed(2)}%`}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={pos.dayChange >= 0 ? 'portfolio-positive' : 'portfolio-negative'}
                  >
                    {pos.dayChange >= 0
                      ? `+${pos.dayChange.toFixed(2)}`
                      : `${pos.dayChange.toFixed(2)}`}
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Display message if no data available */}
            {sortedPositions.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" className="portfolio-header">
                  No portfolio positions available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default UserPortfolio;
