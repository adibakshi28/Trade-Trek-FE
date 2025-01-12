// src/components/NotificationsDropdown/NotificationsDropdown.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ anchorEl, open, handleClose, notifications }) => {
  const navigate = useNavigate(); // If you want to navigate on notification click

  const handleNotificationClick = (notification) => {
    // Handle the click event, e.g., navigate to a specific page
    // navigate(notification.link); // Assuming each notification has a 'link' property
    handleClose();
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
      className="notifications-menu"
      PaperProps={{
        className: 'notifications-paper',
      }}
      MenuListProps={{
        'aria-labelledby': 'notifications-button',
      }}
    >
      <Box className="notifications-header">
        <Typography variant="h6" className="notifications-title">
          Notifications
        </Typography>
      </Box>
      <Divider />
      {notifications.length === 0 ? (
        <MenuItem disabled className="no-notifications">
          <Typography variant="body2">No notifications</Typography>
        </MenuItem>
      ) : (
        notifications.map((notification, index) => (
          <MenuItem
            key={index}
            onClick={() => handleNotificationClick(notification)}
            className="notification-menu-item"
          >
            <Typography variant="body1">{notification.message}</Typography>
            <Typography variant="caption" className="notification-time">
              {notification.time}
            </Typography>
          </MenuItem>
        ))
      )}
    </Menu>
  );
};

export default NotificationsDropdown;
