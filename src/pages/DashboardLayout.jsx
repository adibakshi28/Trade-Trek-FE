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
    if (!isAuthLoading && !accessToken) {
      navigate('/login');
    }
  }, [accessToken, isAuthLoading, navigate]);

  return (
    <Box sx={{ display: 'flex' }}>
      {/* The fixed sidebar */}
      <Sidebar />

      {/* The main content area, with top & left margin/offset */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: '240px',      // offset for sidebar width
          mt: '64px',       // offset for navbar height
          p: 2,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
