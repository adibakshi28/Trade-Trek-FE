// src/components/Navbar/Navbar.js

import React, { useContext, useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../api/authApi';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';
import './Navbar.css';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';
import NotificationsDropdown from '../NotificationsDropdown/NotificationsDropdown';

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

  // Prevent the dropdowns from staying open after logging in or out
  useEffect(() => {     
    setProfileAnchorEl(null);
    setNotificationsAnchorEl(null);
  }, [accessToken]);

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
              to="/insights"
              className={`nav-link ${location.pathname === '/insights' ? 'active' : ''}`}
              aria-label="Insights"
            >
              Insights
            </Link>
            <Link
              to="/social"
              className={`nav-link ${location.pathname === '/social' ? 'active' : ''}`}
              aria-label="Social"
            >
              Social
            </Link>
            <Link
              to="/research"
              className={`nav-link ${location.pathname === '/research' ? 'active' : ''}`}
              aria-label="Research"
            >
              Research
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
                id="notifications-button" // Added ID for aria-labelledby
              >
                <Badge
                  badgeContent={notifications.length}
                  color="custom" /* Ensure 'custom' is defined in the theme or use a predefined color */
                  className="custom-badge"
                >
                  <NotificationsNoneIcon fontSize="custom" />
                </Badge>
              </IconButton>

              {/* Notifications Dropdown */}
              <NotificationsDropdown
                anchorEl={notificationsAnchorEl}
                open={openNotifications}
                handleClose={handleNotificationsClose}
                notifications={notifications}
              />

              {/* Profile Icon */}
              <IconButton
                aria-label="Account"
                onClick={handleProfileClick}
                className='account-icon-button'
                size='small'
                id="account-button" // Added ID for aria-labelledby
              >
                <Avatar alt={user.username} src={user.avatarUrl}>
                  {/* If no avatarUrl, display first letter */}
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

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
