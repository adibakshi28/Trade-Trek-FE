import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';
import { styled } from '@mui/system';

// 🎨 Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1e3a8a', // Solid dark blue
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  zIndex: 1300,
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#ffffff',
  '&:hover': {
    color: '#f1f5f9',
  },
}));

const NavLink = styled(Button)(({ theme, active }) => ({
  fontWeight: active ? 'bold' : 'normal',
  textTransform: 'capitalize',
  color: active ? '#ffffff' : '#cbd5e1',
  backgroundColor: active ? '#2563eb' : 'transparent',
  borderRadius: '8px',
  margin: '0 8px',
  padding: '6px 16px',
  transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.2s ease',
  '&:hover': {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    transform: 'scale(1.05)',
  },
}));

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
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
    <StyledAppBar position="fixed">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
          <Logo variant="h6">Trade Trek</Logo>
        </Box>

        {/* Navigation Links */}
        <Box display="flex" alignItems="center" gap={1}>
          {accessToken ? (
            <>
              <NavLink
                onClick={() => navigate('/dashboard')}
                active={location.pathname === '/dashboard'}
              >
                Dashboard
              </NavLink>
              <NavLink
                onClick={handleLogout}
                active={location.pathname === '/logout'}
              >
                Logout
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                onClick={() => navigate('/login')}
                active={location.pathname === '/login'}
              >
                Login
              </NavLink>
              <NavLink
                onClick={() => navigate('/register')}
                active={location.pathname === '/register'}
              >
                Register
              </NavLink>
            </>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}

export default Navbar;
