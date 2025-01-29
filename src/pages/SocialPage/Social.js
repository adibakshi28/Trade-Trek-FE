// src/pages/SocialPage/Social.js
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import FriendsList from '../../components/Social/FriendsList/FriendsList';
import GroupsList from '../../components/Social/GroupsList/GroupsList';
import DetailCard from '../../components/Social/DetailCard/DetailCard';
import { getUserFriends, getUserGroups } from '../../api/userApi';
import {
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './Social.css';

const Social = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [errorFriends, setErrorFriends] = useState(false);
  const [errorGroups, setErrorGroups] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (!isAuthLoading && !accessToken) {
      navigate('/login');
    }
  }, [accessToken, isAuthLoading, navigate]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await getUserFriends();
        setFriends(data);
        setLoadingFriends(false);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setErrorFriends(true);
        setLoadingFriends(false);
      }
    };

    const fetchGroups = async () => {
      try {
        const data = await getUserGroups();
        setGroups(data);
        setLoadingGroups(false);
      } catch (err) {
        console.error('Error fetching groups:', err);
        setErrorGroups(true);
        setLoadingGroups(false);
      }
    };

    fetchFriends();
    fetchGroups();
  }, []);

  const handleSelect = (item, type) => {
    setSelectedItem({ ...item, type });
  };

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
    <Box className="social-container">
      <Box className="social-content">
        <Box className="lists-section">

          {loadingGroups ? (
            <Box className="loading-card">
              <CircularProgress className="circular-progress" size={60} />
              <Typography variant="body2" className="loading-text">
                Loading Groups...
              </Typography>
            </Box>
          ) : errorGroups ? (
            <Alert severity="error" className="error-card">
              Failed to load groups
            </Alert>
          ) : (
            <GroupsList
              groups={groups}
              onSelect={handleSelect}
              setGroups={setGroups}
              showSnackbar={showSnackbar}
            />
          )}

          {loadingFriends ? (
            <Box className="loading-card">
              <CircularProgress className="circular-progress" size={60} />
              <Typography variant="body2" className="loading-text">
                Loading Connections...
              </Typography>
            </Box>
          ) : errorFriends ? (
            <Alert severity="error" className="error-card">
              Failed to load connections
            </Alert>
          ) : (
            <FriendsList friends={friends} onSelect={handleSelect} />
          )}
          
        </Box>

        <Box className="detail-section">
          {selectedItem ? (
            <>
              <DetailCard item={selectedItem} />
            </>
          ) : (
            <Box className="no-selection">
              <Typography variant="h6" className="no-selection-title">
                Select Connection
              </Typography>
              <Typography variant="body2" className="no-selection-subtitle">
                Choose a friend or group to view detailed portfolio insights
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} className="snackbar-alert">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Social;