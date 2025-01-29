// src/components/Social/GroupsList/GroupsList.js
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  InputAdornment,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import GroupsIcon from '@mui/icons-material/Groups';
import { createGroup, searchGroupToJoin, joinGroupRequest } from '../../../api/userApi';
import { AuthContext } from '../../../context/AuthContext';
import './GroupsList.css';

const GroupsList = ({ groups, onSelect, setGroups }) => {
  const { user } = useContext(AuthContext); // Get current user from AuthContext

  // States for managing search input
  const [searchTerm, setSearchTerm] = useState('');

  // States for existing groups filtering
  const [filteredGroups, setFilteredGroups] = useState(groups);

  // States for searching groups to join
  const [joinSearchResults, setJoinSearchResults] = useState([]);
  const [joinSearchLoading, setJoinSearchLoading] = useState(false);
  const [joinSearchError, setJoinSearchError] = useState(false);
  const [joiningGroupIds, setJoiningGroupIds] = useState([]);

  // States for creating a new group
  const [openDialog, setOpenDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Snackbar state for user feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Effect for filtering existing groups based on searchTerm when not searching
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(group =>
        group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  }, [searchTerm, groups]);

  // Effect for searching groups to join with debounce
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setJoinSearchResults([]);
      setJoinSearchError(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const fetchJoinSearchResults = async () => {
        setJoinSearchLoading(true);
        try {
          const results = await searchGroupToJoin(searchTerm);
          setJoinSearchResults(results);
          setJoinSearchError(false);
        } catch (err) {
          console.error('Error searching groups to join:', err);
          setJoinSearchError(true);
        } finally {
          setJoinSearchLoading(false);
        }
      };

      fetchJoinSearchResults();
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle sending join request
  const handleSendJoinRequest = async (group) => {
    setJoiningGroupIds(prev => [...prev, group.id]);
    try {
      const response = await joinGroupRequest(group.group_name);
      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message,
          severity: 'success',
        });
        // Remove the joined group from search results
        setJoinSearchResults(prev => prev.filter(g => g.id !== group.id));
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to send join request.',
          severity: 'error',
        });
      }
    } catch (err) {
      console.error('Error sending join request:', err);
      setSnackbar({
        open: true,
        message: 'An error occurred while sending the join request.',
        severity: 'error',
      });
    } finally {
      setJoiningGroupIds(prev => prev.filter(id => id !== group.id));
    }
  };

  // Handle Snackbar Close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle Create Group
  const handleCreateGroup = async () => {
    if (!groupName.trim() || !groupDescription.trim()) {
      setSnackbar({
        open: true,
        message: 'Group name and description are required.',
        severity: 'error',
      });
      return;
    }
    setCreatingGroup(true);
    try {
      const response = await createGroup(groupName, groupDescription);
      if (response.success) {
        setSnackbar({
          open: true,
          message: response.message,
          severity: 'success',
        });
        // Add the new group to the state with a temporary ID
        setGroups(prevGroups => [
          ...prevGroups,
          {
            id: Date.now(), // Temporary unique ID
            group_name: groupName,
            description: groupDescription,
          },
        ]);
        // Reset form and close dialog
        setGroupName('');
        setGroupDescription('');
        setOpenDialog(false);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to create group.',
          severity: 'error',
        });
      }
    } catch (err) {
      console.error('Error creating group:', err);
      setSnackbar({
        open: true,
        message: 'An error occurred while creating the group.',
        severity: 'error',
      });
    } finally {
      setCreatingGroup(false);
    }
  };

  // If user is not logged in
  if (!user) {
    return (
      <Box className="groups-list">
        <Box className="groups-header">
          <Typography variant="h5" className="section-title">
            Groups
          </Typography>
        </Box>
        <Box className="auth-prompt-card">
          <GroupsIcon className="auth-prompt-icon" />
          <Typography variant="body1" className="auth-prompt-text">
            Sign in to access and manage your trading groups
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="groups-list">
      {/* Header Section */}
      <Box className="groups-header">
        <Typography variant="h5" className="section-title">
          Groups
        </Typography>
        <Button
          variant="gradient"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          className="create-group-button"
        >
          New Group
        </Button>
      </Box>

      {/* Search Input */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Search groups..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        className="search-input"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Groups Content */}
      {searchTerm.trim() === '' ? (
        <Box className="groups-content">
          <Typography variant="subtitle1" className="groups-subtitle">
            Your Groups ({filteredGroups.length})
          </Typography>
          <List className="groups-list-container">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <ListItem key={group.id} disablePadding className="group-list-item">
                  <ListItemButton onClick={() => onSelect(group, 'group')} className="group-button">
                    <GroupsIcon className="group-icon" />
                    <ListItemText
                      primary={group.group_name}
                      secondary={group.description}
                      className="group-text"
                    />
                    <Chip
                      label="View"
                      color="primary"
                      variant="outlined"
                      className="group-action-chip"
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <Box className="empty-state">
                <GroupsIcon className="empty-icon" />
                <Typography variant="body2" className="empty-text">
                  No groups found. Start by creating a new one!
                </Typography>
              </Box>
            )}
          </List>
        </Box>
      ) : (
        <Box className="join-groups-section">
          <Box className="join-groups-header">
            <Typography variant="subtitle1" className="join-groups-title">
              Discover Groups
            </Typography>
            {joinSearchLoading && <CircularProgress size={24} className="loading-spinner" />}
          </Box>
          
          {!joinSearchLoading && (
            <List className="groups-list-container">
              {joinSearchResults.length > 0 ? (
                joinSearchResults.map((group) => (
                  <ListItem key={group.id} disablePadding className="join-group-item">
                    <Box className="join-group-content">
                      <GroupsIcon className="group-icon" />
                      <ListItemText
                        primary={group.group_name}
                        secondary={`${group.member_count} members`}
                        className="group-text"
                      />
                    </Box>
                    <Button
                      variant="gradient"
                      size="small"
                      onClick={() => handleSendJoinRequest(group)}
                      disabled={joiningGroupIds.includes(group.id)}
                      className="join-button"
                    >
                      {joiningGroupIds.includes(group.id) ? (
                        <CircularProgress size={20} className="join-progress" />
                      ) : (
                        'Join Group'
                      )}
                    </Button>
                  </ListItem>
                ))
              ) : (
                <Box className="empty-state">
                  <Typography variant="body2" className="empty-text">
                    No matching groups found
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Box>
      )}

      {/* Create Group Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} className="group-dialog">
        <Box className="dialog-header">
          <DialogTitle className="dialog-title">Create New Group</DialogTitle>
        </Box>
        <DialogContent className="dialog-content">
          <TextField
            autoFocus
            // margin="dense"
            // label="Group Name"
            fullWidth
            variant="outlined"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="dialog-input"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GroupsIcon className="input-icon" />
                </InputAdornment>
              ),
            }}
          />

      
          <TextField
            // margin="dense"
            // label="Group Description"
            placeholder="Group Description"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="dialog-input"
          />
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setOpenDialog(false)} className="dialog-cancel">
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            variant="gradient"
            disabled={creatingGroup}
            className="dialog-confirm"
          >
            {creatingGroup ? <CircularProgress size={24} /> : 'Create Group'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default GroupsList;