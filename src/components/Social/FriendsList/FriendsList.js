// src/components/Social/FriendsList/FriendsList.js
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
  Avatar,
  Chip,
  InputAdornment,
  IconButton
} from '@mui/material';
import { AuthContext } from '../../../context/AuthContext';
import { searchUserToAddFriend, sendFriendRequest } from '../../../api/userApi';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import './FriendsList.css';

const FriendsList = ({ friends, onSelect }) => {
  const { user } = useContext(AuthContext); // Get current user from AuthContext

  // States for managing search input
  const [searchTerm, setSearchTerm] = useState('');

  // States for existing friends filtering
  const [filteredFriends, setFilteredFriends] = useState(friends);

  // States for searching users to add as friends
  const [addSearchResults, setAddSearchResults] = useState([]);
  const [addSearchLoading, setAddSearchLoading] = useState(false);
  const [addSearchError, setAddSearchError] = useState(false);
  const [sendingRequestUserIds, setSendingRequestUserIds] = useState([]);

  // Snackbar state for user feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Effect for filtering existing friends based on searchTerm when not searching
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFriends(friends);
    } else {
      const filtered = friends.filter(friend =>
        `${friend.first_name} ${friend.last_name}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredFriends(filtered);
    }
  }, [searchTerm, friends]);

  // Effect for searching users to add as friends with debounce
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setAddSearchResults([]);
      setAddSearchError(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const fetchAddSearchResults = async () => {
        setAddSearchLoading(true);
        try {
          const results = await searchUserToAddFriend(searchTerm);
          setAddSearchResults(results);
          setAddSearchError(false);
        } catch (err) {
          console.error('Error searching users to add:', err);
          setAddSearchError(true);
        } finally {
          setAddSearchLoading(false);
        }
      };

      fetchAddSearchResults();
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle sending friend request
  const handleSendFriendRequest = async (userToAdd) => {
    setSendingRequestUserIds(prev => [...prev, userToAdd.id]);
    try {
      const response = await sendFriendRequest(userToAdd.username);
      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message,
          severity: 'success',
        });
        // Optionally, remove the user from add search results
        setAddSearchResults(prev => prev.filter(u => u.id !== userToAdd.id));
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to send friend request.',
          severity: 'error',
        });
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      setSnackbar({
        open: true,
        message: 'An error occurred while sending the friend request.',
        severity: 'error',
      });
    } finally {
      setSendingRequestUserIds(prev => prev.filter(id => id !== userToAdd.id));
    }
  };

  // Handle Snackbar Close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // If user is not logged in
  if (!user) {
    return (
      <Box className="friends-list">
        <Box className="friends-header">
          <Typography variant="h5" className="section-title">
            Friends
          </Typography>
        </Box>
        <Box className="auth-prompt-card">
          <PersonIcon className="auth-prompt-icon" />
          <Typography variant="body1" className="auth-prompt-text">
            Sign in to connect with other traders
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="friends-list">
      {/* Header Section */}
      <Box className="friends-header">
        <Typography variant="h5" className="section-title">
          Friends
        </Typography>
      </Box>

      {/* Search Input */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search friends or traders..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        className="search-input"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon className="search-icon" />
            </InputAdornment>
          ),
        }}
      />

      {/* Friends Content */}
      {searchTerm.trim() === '' ? (
        <Box className="friends-content">
          <Typography variant="subtitle1" className="friends-subtitle">
            Your Connections ({filteredFriends.length})
          </Typography>
          <List className="friends-list-container">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <ListItem key={friend.id} disablePadding className="friend-list-item">
                  <ListItemButton onClick={() => onSelect(friend, 'friend')} className="friend-button">
                    <Avatar className="friend-avatar">
                      {friend.first_name[0]}{friend.last_name[0]}
                    </Avatar>
                    <ListItemText
                      primary={`${friend.first_name} ${friend.last_name}`}
                      secondary={`@${friend.username}`}
                      className="friend-text"
                    />
                    <Chip
                      label="View"
                      color="primary"
                      variant="outlined"
                      className="friend-action-chip"
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Box className="empty-state">
                <PersonIcon className="empty-icon" />
                <Typography variant="body2" className="empty-text">
                  No connections yet. Start by adding friends!
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      ) : (
        <Box className="add-friends-section">
          <Box className="add-friends-header">
            <Typography variant="subtitle1" className="add-friends-title">
              Discover Traders
            </Typography>
            {addSearchLoading && <CircularProgress size={24} className="loading-spinner" />}
          </Box>
          
          {!addSearchLoading && (
            <List className="friends-list-container">
              {addSearchResults.length > 0 ? (
                addSearchResults.map((userToAdd) => (
                  <ListItem key={userToAdd.id} disablePadding className="add-friend-item">
                    <Box className="add-friend-content">
                      <Avatar className="friend-avatar">
                        {userToAdd.first_name[0]}{userToAdd.last_name[0]}
                      </Avatar>
                      <ListItemText
                        primary={`${userToAdd.first_name} ${userToAdd.last_name}`}
                        secondary={`${userToAdd.follower_count} followers`}
                        className="friend-text"
                      />
                    </Box>
                    <Button
                      variant="gradient"
                      size="small"
                      onClick={() => handleSendFriendRequest(userToAdd)}
                      disabled={sendingRequestUserIds.includes(userToAdd.id)}
                      className="invite-button"
                      startIcon={<PersonAddIcon />}
                    >
                      {sendingRequestUserIds.includes(userToAdd.id) ? (
                        <CircularProgress size={20} className="invite-progress" />
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  </ListItem>
                ))
              ) : (
                <Box className="empty-state">
                  <Typography variant="body2" className="empty-text">
                    No matching traders found
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Box>
      )}

      {/* Snackbar for Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FriendsList;