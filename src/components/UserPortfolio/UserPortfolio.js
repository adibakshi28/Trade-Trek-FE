// src/components/UserPortfolio/UserPortfolio.js
import React from 'react';
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
} from '@mui/material';

function UserPortfolio({ positions }) {
  // `positions` are already computed in Dashboard
  // with ltp, pnl, curValue, netChg, dayChange, etc.
  return (
    <Paper className="portfolio-card" elevation={3}>
      <TableContainer className="portfolio-table">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell className="portfolio-header">Instrument</TableCell>
              <TableCell className="portfolio-header" align="center">Qty</TableCell>
              <TableCell className="portfolio-header" align="center">Direction</TableCell>
              <TableCell className="portfolio-header" align="center">Avg. Cost</TableCell>
              <TableCell className="portfolio-header" align="center">LTP</TableCell>
              <TableCell className="portfolio-header" align="center">Cur. Value</TableCell>
              <TableCell className="portfolio-header" align="center">P&L</TableCell>
              <TableCell className="portfolio-header" align="center">Net Chg. (%)</TableCell>
              <TableCell className="portfolio-header" align="center">Day Chg. (%)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((pos, i) => {
              const isPositive = pos.pnl >= 0;
              return (
                <TableRow key={i}>
                  <TableCell>
                    <Typography className="portfolio-ticker">{pos.stock_ticker}</Typography>
                    <Typography className="portfolio-name">{pos.stock_name}</Typography>
                  </TableCell>
                  <TableCell align="center">{pos.quantity}</TableCell>
                  <TableCell align="center">{pos.direction}</TableCell>
                  <TableCell align="center">{pos.execution_price.toFixed(2)}</TableCell>
                  <TableCell align="center">{pos.ltp.toFixed(2)}</TableCell>
                  <TableCell
                    align="center"
                    className={pos.curValue >= 0 ? 'portfolio-positive' : 'portfolio-negative'}
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
                      ? `+${pos.dayChange.toFixed(2)}%`
                      : `${pos.dayChange.toFixed(2)}%`}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default UserPortfolio;
