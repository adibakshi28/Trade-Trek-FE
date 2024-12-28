// src/pages/DashboardLayout.jsx
import React, { useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';

const DashboardLayout = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // If no token after loading, navigate to login
  useEffect(() => {
    if (!isAuthLoading && !accessToken) {
      navigate('/login');
    }
  }, [accessToken, isAuthLoading, navigate]);

  return (
    <Box display="flex" minHeight="100vh">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content area */}
      <Box component="main" flexGrow={1} p={2} sx={{ backgroundColor: '#f5f5f5' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
