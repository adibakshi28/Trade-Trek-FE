// src/components/ProfileDropdown/ProfileDropdown.js

import React from 'react';
import {
  Popover,
  Typography,
  Button,
  Box,
} from '@mui/material';
import './ProfileDropdown.css';

const ProfileDropdown = ({ anchorEl, open, handleClose, user, handleLogout }) => {
  const id = open ? 'profile-popover' : undefined;

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
      className="profile-popover"
    >
      <Box className="profile-container">
        <Typography variant="subtitle1" className="profile-name">
          {user.first_name} {user.last_name}
        </Typography>
        <Button
          variant="contained"
          color="error" /* Assuming logout is a critical action */
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </Button>
      </Box>
    </Popover>
  );
};

export default ProfileDropdown;
