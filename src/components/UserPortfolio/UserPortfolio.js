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

const UserPortfolio = () => {
  const portfolioData = [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      qty: 50,
      direction: 'LONG',
      avgCost: 145.0,
      ltp: 150.5,
      curValue: 7525.0,
      pnl: 275.0,
      netChg: 3.8,
      dayChg: 2.5,
    },
    {
      ticker: 'MSFT',
      name: 'Microsoft Corp.',
      qty: 30,
      direction: 'LONG',
      avgCost: 295.0,
      ltp: 310.0,
      curValue: 9300.0,
      pnl: 450.0,
      netChg: 5.1,
      dayChg: 2.0,
    },
    {
      ticker: 'TSLA',
      name: 'Tesla Inc.',
      qty: 10,
      direction: 'SHORT',
      avgCost: 890.0,
      ltp: 870.0,
      curValue: 8700.0,
      pnl: -200.0,
      netChg: -2.2,
      dayChg: -1.5,
    },
    {
      ticker: 'NVDA',
      name: 'Tesla Inc.',
      qty: 10,
      direction: 'SHORT',
      avgCost: 890.0,
      ltp: 870.0,
      curValue: 8700.0,
      pnl: -200.0,
      netChg: -2.2,
      dayChg: -1.5,
    },
  ];

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
            {portfolioData.map((row, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell>
                    <Typography className="portfolio-ticker">{row.ticker}</Typography>
                    <Typography className="portfolio-name">{row.name}</Typography>
                  </TableCell>
                  <TableCell align="center" className="portfolio-text">{row.qty}</TableCell>
                  <TableCell align="center" className="portfolio-text">{row.direction}</TableCell>
                  <TableCell align="center" className="portfolio-text">{row.avgCost.toFixed(2)}</TableCell>
                  <TableCell align="center" className="portfolio-text">{row.ltp.toFixed(2)}</TableCell>
                  <TableCell
                    align="center"
                    className={`portfolio-value ${
                      row.curValue >= 0 ? 'portfolio-positive' : 'portfolio-negative'
                    }`}
                  >
                    {row.curValue.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={`portfolio-value ${
                      row.pnl >= 0 ? 'portfolio-positive' : 'portfolio-negative'
                    }`}
                  >
                    {row.pnl >= 0 ? `+${row.pnl.toFixed(2)}` : row.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={`portfolio-value ${
                      row.netChg >= 0 ? 'portfolio-positive' : 'portfolio-negative'
                    }`}
                  >
                    {row.netChg >= 0 ? `+${row.netChg.toFixed(1)}%` : `${row.netChg.toFixed(1)}%`}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={`portfolio-value ${
                      row.dayChg >= 0 ? 'portfolio-positive' : 'portfolio-negative'
                    }`}
                  >
                    {row.dayChg >= 0 ? `+${row.dayChg.toFixed(1)}%` : `${row.dayChg.toFixed(1)}%`}
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default UserPortfolio;
