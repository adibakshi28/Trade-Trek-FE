// src/components/Sidebar.jsx
import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transactions', path: '/dashboard/transactions' },
    { label: 'Summary', path: '/dashboard/summary' },
  ];

  return (
    <Box
      sx={{
        width: 240,
        backgroundColor: '#1976d2',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        {/* <Typography variant="h6">Mock Trader</Typography> */}
        {user && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="caption">{user.username}</Typography>
          </Box>
        )}
      </Box>

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.label}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'inherit',
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default Sidebar;
