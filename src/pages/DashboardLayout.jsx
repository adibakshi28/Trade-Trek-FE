// src/pages/DashboardLayout.jsx
import React, { useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const DashboardLayout = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If we've finished loading and have no token, go to /login
    if (!isAuthLoading && !accessToken) {
      navigate('/login');
    }
  }, [accessToken, isAuthLoading, navigate]);

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar />
      <Box component="main" flexGrow={1} p={2} sx={{ backgroundColor: '#f5f5f5' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
