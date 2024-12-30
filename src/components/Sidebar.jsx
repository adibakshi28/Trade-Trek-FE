import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import { styled } from '@mui/system';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// 🎨 Styled Components
const SidebarContainer = styled(motion.div)(({ theme }) => ({
  width: '240px',
  height: '100vh',
  background: '#1976d2',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  top: 64, // Offset below the AppBar
  left: 0,
  overflowY: 'auto',
  boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid rgba(255,255,255,0.2)',
  textAlign: 'center',
}));

const SidebarListItem = styled(ListItemButton)(({ theme }) => ({
  color: '#fff',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  '&.active': {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderLeft: '4px solid #4fc3f7',
  },
}));

const SidebarIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1),
}));

// ✨ Animation Variants
const sidebarVariants = {
  hidden: { x: -240 },
  visible: { x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Transactions', path: '/dashboard/transactions', icon: <ReceiptIcon /> },
    { label: 'Summary', path: '/dashboard/summary', icon: <BarChartIcon /> },
    { label: 'Search Stocks', path: '/dashboard/stocks', icon: <SearchIcon /> },
    { label: 'Trade', path: '/dashboard/trade', icon: <TrendingUpIcon /> },
  ];

  return (
    <SidebarContainer
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Sidebar Header */}
      <SidebarHeader>
        {user ? (
          <>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              @{user.username}
            </Typography>
          </>
        ) : (
          <Typography variant="h6">Welcome</Typography>
        )}
      </SidebarHeader>

      {/* Sidebar Menu */}
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <SidebarListItem
              key={item.label}
              onClick={() => navigate(item.path)}
              className={isActive ? 'active' : ''}
            >
              <SidebarIcon>{item.icon}</SidebarIcon>
              <ListItemText primary={item.label} />
            </SidebarListItem>
          );
        })}
      </List>

      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />

      {/* Footer */}
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.8 }}>
          © 2024 Mock Trader
        </Typography>
      </Box>
    </SidebarContainer>
  );
}

export default Sidebar;
