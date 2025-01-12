// src/pages/Transactions.jsx

import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import TransactionsTable from '../../components/TransactionsTable/TransactionsTable';
import './Transactions.css';

const Transactions = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && !accessToken) {
      navigate('/login');
    }
  }, [accessToken, isAuthLoading, navigate]);

  return (
    <Box className="transactions-container">
      <Box className="transactions-wrapper">
        <TransactionsTable />
      </Box>
    </Box>
  );
};

export default Transactions;
