// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { accessToken, clearAuth } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
    clearAuth();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: 1300 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Mock Trader
        </Typography>
        {accessToken ? (
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
