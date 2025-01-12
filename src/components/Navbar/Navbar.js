// src/components/Navbar/Navbar.js

import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../api/authApi';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';
import './Navbar.css';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsDropdown from '../NotificationsDropdown/NotificationsDropdown';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken, clearAuth, user } = useContext(AuthContext);

  // State for Notifications Dropdown
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const openNotifications = Boolean(notificationsAnchorEl);

  // State for Profile Dropdown
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const openProfile = Boolean(profileAnchorEl);

  // Mock notifications data (Replace with real data as needed)
  const notifications = [
    { message: 'Your order for AAPL has been executed.', time: '2 mins ago' },
    { message: 'New message from John Doe.', time: '10 mins ago' },
    { message: 'Weekly report is ready.', time: '1 hour ago' },
    { message: 'Password changed successfully.', time: 'Yesterday' },
  ];

  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
    clearAuth();
    navigate('/');
  };

  return (
    <AppBar position="fixed" className="styled-appbar">
      <Toolbar className="toolbar">
        {/* Left Side: Logo */}
        <Box onClick={() => navigate('/')} className="logo-container">
          <img src={logo} alt="TradeTrek Logo" className="navbar-logo" />
          <Typography variant="h6" className="logo" aria-label="TradeTrek Home">
            TradeTrek
          </Typography>
        </Box>

        {/* Center: Navigation Links (only if logged in) */}
        {accessToken && (
          <Box className="nav-links">
            <Link
              to="/dashboard"
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              aria-label="Dashboard"
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}
              aria-label="Transactions"
            >
              Transactions
            </Link>
            <Link
              to="/social"
              className={`nav-link ${location.pathname === '/social' ? 'active' : ''}`}
              aria-label="Social"
            >
              Social
            </Link>
          </Box>
        )}

        {/* Right Side: Login/Register or Notifications + Account */}
        <Box className="right-section">
          {accessToken ? (
            <Box className="logged-in-section">
              {/* Notifications Icon */}
              <IconButton
                color="inherit"
                aria-label="Notifications"
                onClick={handleNotificationsClick}
                className='notifications-icon'
              >
                <Badge
                  badgeContent={notifications.length}
                  color="custom" /* Custom color */
                  className="custom-badge"
                >
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>

              {/* Profile Icon and Username */}
              <Box
                className="account-section"
                onClick={handleProfileClick}
                role="button"
                aria-label="Profile"
              >
                <AccountCircleIcon />
                <Typography variant="body1" className="username">
                  {user.username}
                </Typography>
              </Box>

              {/* Notifications Dropdown */}
              <NotificationsDropdown
                anchorEl={notificationsAnchorEl}
                open={openNotifications}
                handleClose={handleNotificationsClose}
                notifications={notifications}
              />

              {/* Profile Dropdown */}
              <ProfileDropdown
                anchorEl={profileAnchorEl}
                open={openProfile}
                handleClose={handleProfileClose}
                user={user}
                handleLogout={handleLogout}
              />
            </Box>
          ) : (
            <Box className="auth-links">
              <Link
                to="/login"
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                aria-label="Login"
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                aria-label="Register"
              >
                Register
              </Link>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
