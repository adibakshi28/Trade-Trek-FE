// src/components/ProfileDropdown/ProfileDropdown.js

import React, { useContext } from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  Switch,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './ProfileDropdown.css';
import { ThemeContext } from '../../context/ThemeContext';

const ProfileDropdown = ({ anchorEl, open, handleClose, user, handleLogout }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleProfileNavigation = () => {
    navigate('/profile');
    handleClose();
  };

  const handleSettingsNavigation = () => {
    navigate('/settings');
    handleClose();
  };

  const onLogout = () => {
    handleLogout();
    handleClose();
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      MenuListProps={{
        'aria-labelledby': 'account-button',
      }}
      classes={{
        paper: 'profile-paper',
      }}
    >
      {/* Profile Header */}
      <Box className="profile-header">
        <Typography variant="subtitle1" className="profile-title">
          {user.first_name} {user.last_name}
        </Typography>
      </Box>
      <Divider />

      {/* Profile Menu Items */}
      <MenuItem onClick={handleProfileNavigation} className="profile-menu-item">
        Profile
      </MenuItem>
      <MenuItem onClick={handleSettingsNavigation} className="profile-menu-item">
        Settings
      </MenuItem>

      {/* Logout */}
      <MenuItem onClick={onLogout} className="profile-menu-item logout-menu-item">
        Logout
      </MenuItem>

      {/* Theme Selection */}
      <Box className="theme-section">
        <Typography variant="subtitle2" className="theme-label">
          Dark Mode
        </Typography>
        <Switch
          checked={theme === 'dark'}
          onChange={handleThemeToggle}
          color="primary"
          inputProps={{ 'aria-label': 'Toggle dark mode' }}
        />
      </Box>

    </Menu>
  );
};

export default ProfileDropdown;
