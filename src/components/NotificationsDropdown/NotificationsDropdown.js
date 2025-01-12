// src/components/NotificationsDropdown/NotificationsDropdown.jsx

import React from 'react';
import {
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from '@mui/material';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({ anchorEl, open, handleClose, notifications }) => {
  const id = open ? 'notifications-popover' : undefined;

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      className="notifications-popover"
    >
      <Box className="notifications-container">
        <Typography variant="h6" className="notifications-title">
          Notifications
        </Typography>
        <Divider />
        <List>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="No notifications" />
            </ListItem>
          ) : (
            notifications.map((notification, index) => (
              <ListItem key={index} button className="notification-item">
                <ListItemText
                  primary={notification.message}
                  secondary={notification.time}
                />
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Popover>
  );
};

export default NotificationsDropdown;
