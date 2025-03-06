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
  Snackbar,
  Alert,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../api/authApi';
import { AuthContext } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';
import './Navbar.css';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';
import NotificationsDropdown from '../NotificationsDropdown/NotificationsDropdown';

import {
  getUserNotifications,
  getRiskScore,
  markNotificationAsRead,
  acceptFriendRequest,
  declineFriendRequest,
  acceptGroupInvite,
  declineGroupInvite,
  acceptGroupJoin,
  declineGroupJoin,
} from '../../api/userApi';

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

  // State for Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(false);

  // State for Risk Profile
  const [riskScore, setriskScore] = useState(null);
  const [riskCategory, setRiskCategory] = useState('');

  // Fetch notifications on mount and when accessToken changes
  useEffect(() => {
    if (accessToken) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoadingNotifications(false);
    }
  }, [accessToken]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const data = await getUserNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
      setErrorNotifications(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setErrorNotifications(true);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchRiskScore = async () => {
    try {
      const data = await getRiskScore();
      setriskScore(data.risk_score);
      setRiskCategory(data.risk_category || 'Moderate');
    } catch (err) {
      console.error('Error fetching risk score:', err);
    }
  };

  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    fetchNotifications(); // Fetch notifications each time the icon is clicked
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
    fetchRiskScore(); // Fetch risk score each time the icon is clicked
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

  // Handler functions for notifications

  // Mark a notification as read
  const handleMarkAsRead = async (notification_id) => {
    try {
      const response = await markNotificationAsRead(notification_id);
      // Assuming response contains 'notifications' and 'unread_count'
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
      // Optionally, show a success message
      showSnackbar('Notification marked as read.', 'success');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      showSnackbar('Failed to mark notification as read.', 'error');
    }
  };

  // Accept Friend Request
  const handleAcceptFriendRequest = async (notification_id, accepted_username) => {
    try {
      const response = await acceptFriendRequest(accepted_username);
      if (response.success) {
        // Optionally, update friends list
        // Fetch updated notifications to mark as read
        await fetchNotifications();
        // Show success message
        showSnackbar(response.message, 'success');
      } else {
        // Handle error
        showSnackbar(response.message, 'error');
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      showSnackbar('An error occurred while accepting the friend request.', 'error');
    }
  };

  // Decline Friend Request
  const handleDeclineFriendRequest = async (notification_id, declined_username) => {
    try {
      const response = await declineFriendRequest(declined_username);
      if (response.success) {
        // Optionally, update friends list
        // Fetch updated notifications to mark as read
        await fetchNotifications();
        // Show success message
        showSnackbar(response.message, 'success');
      } else {
        // Handle error
        showSnackbar(response.message, 'error');
      }
    } catch (err) {
      console.error('Error declining friend request:', err);
      showSnackbar('An error occurred while declining the friend request.', 'error');
    }
  };

  // Accept Group Invite
  const handleAcceptGroupInvite = async (notification_id, group_name) => {
    try {
      const response = await acceptGroupInvite(group_name);
      if (response.success) {
        // Optionally, update groups list
        // Fetch updated notifications to mark as read
        await fetchNotifications();
        // Show success message
        showSnackbar(response.message, 'success');
      } else {
        // Handle error
        showSnackbar(response.message, 'error');
      }
    } catch (err) {
      console.error('Error accepting group invite:', err);
      showSnackbar('An error occurred while accepting the group invite.', 'error');
    }
  };

  // Decline Group Invite
  const handleDeclineGroupInvite = async (notification_id, group_name) => {
    try {
      const response = await declineGroupInvite(group_name);
      if (response.success) {
        // Optionally, update groups list
        // Fetch updated notifications to mark as read
        await fetchNotifications();
        // Show success message
        showSnackbar(response.message, 'success');
      } else {
        // Handle error
        showSnackbar(response.message, 'error');
      }
    } catch (err) {
      console.error('Error declining group invite:', err);
      showSnackbar('An error occurred while declining the group invite.', 'error');
    }
  };


  // Accept Group Join Request
  const handleAcceptGroupJoin = async (notification_id, group_name, user_name_joining) => {
    try {
      const response = await acceptGroupJoin(group_name, user_name_joining);
      if (response.success) {
        // Optionally, update groups list
        // Fetch updated notifications to mark as read
        await fetchNotifications();
        // Show success message
        showSnackbar(response.message, 'success');
      } else {
        // Handle error
        showSnackbar(response.message, 'error');
      }
    } catch (err) {
      console.error('Error accepting group join request:', err);
      showSnackbar('An error occurred while accepting the group join request.', 'error');
    }
  };

  // Decline Group Join Request
  const handleDeclineGroupJoin = async (notification_id, group_name, user_name_joining) => {
    try {
      const response = await declineGroupJoin(group_name, user_name_joining);
      if (response.success) {
        // Optionally, update groups list
        // Fetch updated notifications to mark as read
        await fetchNotifications();
        // Show success message
        showSnackbar(response.message, 'success');
      } else {
        // Handle error
        showSnackbar(response.message, 'error');
      }
    } catch (err) {
      console.error('Error declining group join request:', err);
      showSnackbar('An error occurred while declining the group join rquest.', 'error');
    }
  };


  // Snackbar state and handler
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
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
              Network 
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
                  badgeContent={unreadCount}
                  color="custom" // Use MUI's 'error' color for badge
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
                handleMarkAsRead={handleMarkAsRead}
                handleAcceptFriendRequest={handleAcceptFriendRequest}
                handleDeclineFriendRequest={handleDeclineFriendRequest}
                handleAcceptGroupInvite={handleAcceptGroupInvite}
                handleDeclineGroupInvite={handleDeclineGroupInvite}
                handleAcceptGroupJoin={handleAcceptGroupJoin}
                handleDeclineGroupJoin={handleDeclineGroupJoin}
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
                riskScore={riskScore}
                riskCategory={riskCategory}
              />
            </Box>
          ) : (
            <Box className="auth-links">
              <Link
                to="/login"
                className="auth-button login"
                aria-label="Login"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="auth-button register"
                aria-label="Register"
              >
                Register
              </Link>
            </Box>
          )}
        </Box>

        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
