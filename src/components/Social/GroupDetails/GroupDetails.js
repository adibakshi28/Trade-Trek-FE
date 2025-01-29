// src/components/Social/GroupDetails/GroupDetails.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
  Snackbar,
  Alert,
  Chip,
  Avatar,
  Pagination,
} from '@mui/material';
import { AuthContext } from '../../../context/AuthContext';
import {
  getGroupInfo,
  getGroupLeaderboard,
  searchUserToAddInGroup,
  sendGroupInvite,
} from '../../../api/userApi';
import './GroupDetails.css';

const ITEMS_PER_PAGE = 10;

const GroupDetails = ({ group_name }) => {
  const { user } = useContext(AuthContext);
  const [groupInfo, setGroupInfo] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [invitingUserIds, setInvitingUserIds] = useState([]);
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchData = useCallback(async () => {
    try {
      const [infoData, leaderboardData] = await Promise.all([
        getGroupInfo(group_name),
        getGroupLeaderboard(group_name),
      ]);
      
      if (!infoData || !leaderboardData.success) {
        throw new Error('Failed to load group data');
      }

      setGroupInfo(infoData);
      setLeaderboard(leaderboardData.members || []);
    } catch (err) {
      console.error('Error fetching group data:', err);
      setError('Failed to load group information.');
    } finally {
      setLoading(false);
    }
  }, [group_name]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchData();
  }, [user, group_name, fetchData]);

  useEffect(() => {
    if (!user || searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchUserToAddInGroup(group_name, searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, group_name, user]);

  const handleSendInvite = async (userToInvite) => {
    setInvitingUserIds(prev => [...prev, userToInvite.id]);
    try {
      const response = await sendGroupInvite(userToInvite.username, group_name);
      setSnackbar({
        open: true,
        message: response.message || 'Invite sent successfully',
        severity: response.success ? 'success' : 'error'
      });
      if (response.success) {
        setSearchResults(prev => prev.filter(u => u.id !== userToInvite.id));
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to send invite', severity: 'error' });
    } finally {
      setInvitingUserIds(prev => prev.filter(id => id !== userToInvite.id));
    }
  };

  const handleSnackbarClose = () => setSnackbar(prev => ({ ...prev, open: false }));
  const isLeader = user?.username === groupInfo?.leader;

  if (!user) {
    return (
      <Box className="group-error">
        <Typography variant="h6">🔒 Please login to view this group</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="group-loading">
        <CircularProgress className="spinner" size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="group-error">
        <Typography variant="h6" className="error-title">⚠️ {error}</Typography>
        <Button 
          variant="contained" 
          className="retry-button"
          onClick={fetchData}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const paginatedLeaderboard = leaderboard.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <Box className="group-container">
      {/* Group Header */}
      <Box className="group-header">
        <Typography variant="h3" className="group-title">
          {groupInfo.group_name}
        </Typography>
        <Chip 
          label={`Leader: ${groupInfo.leader}`} 
          className="leader-chip"
          avatar={<Avatar>{groupInfo.leader[0]}</Avatar>}
        />
      </Box>

      {/* Group Info */}
      <Box className="info-section">
        <Typography className="group-description">
          {groupInfo.description || "No description provided"}
        </Typography>
        <Divider className="section-divider" />
        
        <Box className="metrics-grid">
          <Box className="metric-card">
            <span className="metric-label">Total Members</span>
            <span className="metric-value">{groupInfo.members?.length || 0}</span>
          </Box>
          <Box className="metric-card">
            <span className="metric-label">Created At</span>
            <span className="metric-value">
              {new Date(groupInfo.created_at).toLocaleDateString()}
            </span>
          </Box>
        </Box>
      </Box>

      {/* Add Member Section */}
      {isLeader && (
        <Box className="add-member-section">
          <Typography variant="h5" className="section-title">
            Invite Members
          </Typography>
          <Box className="search-container">
            <TextField
              fullWidth
              variant="outlined"
              // label="Search by username or email"
              placeholder="Search by username or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              InputProps={{
                endAdornment: searchLoading && <CircularProgress size={24} />
              }}
            />
            
            {searchResults.length > 0 && (
              <List className="search-results">
                {searchResults.map(user => (
                  <ListItem key={user.id} className="result-item">
                    <ListItemText
                      primary={user.username}
                      secondary={user.email}
                      className="user-info"
                    />
                    <Button
                      variant="contained"
                      className="invite-button"
                      onClick={() => handleSendInvite(user)}
                      disabled={invitingUserIds.includes(user.id)}
                    >
                      {invitingUserIds.includes(user.id) ? 'Sending...' : 'Invite'}
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
          <Divider className="section-divider" />
        </Box>
      )}

      {/* Leaderboard Section */}
      <Box className="leaderboard-section">
        <Typography variant="h5" className="section-title">
          🏆 Leaderboard
        </Typography>
        
        <List className="leaderboard-list">
          {paginatedLeaderboard.map((member, index) => (
            <ListItem key={member.username} className="leaderboard-item">
              <span className="rank-badge">#{index + 1 + (page - 1) * ITEMS_PER_PAGE}</span>
              <ListItemText
                primary={member.username}
                secondary={
                  <>
                    <span className="metric">Value: ${member.portfolio.holding_value}</span>
                    <span className={`pnl ${member.portfolio.unrealised_pnl >= 0 ? 'positive' : 'negative'}`}>
                      PnL: ${member.portfolio.unrealised_pnl}
                    </span>
                  </>
                }
              />
              {(member.username === groupInfo.leader) && (
                <Chip label="Leader" className="leader-tag" />
              )}
            </ListItem>
          ))}
        </List>

        <Pagination
          count={Math.ceil(leaderboard.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={(_, p) => setPage(p)}
          className="pagination"
          color="primary"
        />
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          className="snackbar-alert"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GroupDetails;