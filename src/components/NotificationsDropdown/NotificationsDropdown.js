// src/components/NotificationsDropdown/NotificationsDropdown.jsx

import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  IconButton,
  Button,
} from '@mui/material';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import './NotificationsDropdown.css';

const NotificationsDropdown = ({
  anchorEl,
  open,
  handleClose,
  notifications,
  handleMarkAsRead,
  handleAcceptFriendRequest,
  handleDeclineFriendRequest,
  handleAcceptGroupInvite,
  handleDeclineGroupInvite,
  handleAcceptGroupJoin,
  handleDeclineGroupJoin

}) => {
  const [processing, setProcessing] = useState({
    read: [],
    accept: [],
    decline: [],
  });

  const extractUsername = (description) => description.split(' ')[0];
  const extractGroupName = (description) => {
    const match = description.match(/join.*?'([^']+)'/);
    return match ? match[1] : null;
  };
  const extractGroupNameFromJoinRequest = (description) => {
    const match = description.match(/^(Group_\d+)/);
    return match ? match[1] : null;
  };
  const extractUsernameFromJoinRequest = (description) => {
    const usernameMatch = description.match(/from (\w+)/);
    return usernameMatch ? usernameMatch[1] : null;
  };

  const handleAction = async (notification, action) => {
    const { id, type, description } = notification;
    setProcessing((prev) => ({ ...prev, [action]: [...prev[action], id] }));

    try {
      if (type === 'FRIEND_REQUEST') {
        const username = extractUsername(description);
        action === 'accept'
          ? await handleAcceptFriendRequest(id, username)
          : await handleDeclineFriendRequest(id, username);
      } else if (type === 'GROUP_INVITE') {
        const groupName = extractGroupName(description);
        action === 'accept'
          ? await handleAcceptGroupInvite(id, groupName)
          : await handleDeclineGroupInvite(id, groupName);
      } else if (type === 'GROUP_JOIN_REQUEST') {
        const groupName = extractGroupNameFromJoinRequest(description);
        const user_name_joining = extractUsernameFromJoinRequest(description);
        action === 'accept'
          ? await handleAcceptGroupJoin(id, groupName, user_name_joining)
          : await handleDeclineGroupJoin(id, groupName, user_name_joining);
      }else if (action === 'read') {
        await handleMarkAsRead(id);
      }
    } catch (error) {
      console.error(`Error performing ${action} on notification ${id}:`, error);
    } finally {
      setProcessing((prev) => ({
        ...prev,
        [action]: prev[action].filter((notifId) => notifId !== id),
      }));
    }
  };

  const renderActionButtons = (notification) => {
    const { type, id } = notification;
    const isAcceptProcessing = processing.accept.includes(id);
    const isDeclineProcessing = processing.decline.includes(id);

    if (type === 'FRIEND_REQUEST' || type === 'GROUP_INVITE' || type === 'GROUP_JOIN_REQUEST') {
      return (
        <Box className="action-buttons">
          <Button
            className='accept-button'
            onClick={() => handleAction(notification, 'accept')}
            disabled={isAcceptProcessing || isDeclineProcessing}
          >
            {isAcceptProcessing ? 'ACCEPTING...' : 'ACCEPT'}
          </Button>
          <Button
            className='decline-button'
            onClick={() => handleAction(notification, 'decline')}
            disabled={isDeclineProcessing || isAcceptProcessing}
          >
            {isDeclineProcessing ? 'DECLINING...' : 'DECLINE'}
          </Button>
        </Box>
      );
    }
    return null;
  };

  const renderReadIcon = (notification) => {
    const { type, read, id } = notification;
    if (type !== 'FRIEND_REQUEST' && type !== 'GROUP_INVITE' & type !== 'GROUP_JOIN_REQUEST' && !read) {
      return (
        <IconButton
          aria-label="Mark as read"
          onClick={() => handleAction(notification, 'read')}
          className="read-icon-button"
          size="small"
          disabled={processing.read.includes(id)}
        >
          <MarkChatReadIcon fontSize="custom" />
        </IconButton>
      );
    }
    return null;
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      className="notifications-menu"
      PaperProps={{ className: 'notifications-paper' }}
      MenuListProps={{ 'aria-labelledby': 'notifications-button' }}
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
        <Box className="notifications-list">
          {/* Add sort() here */}
          {[...notifications].sort((a, b) => a.read - b.read).map((notification) => (
            <Box
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              {/* Rest of the notification item JSX remains the same */}
              <MenuItem className="notification-menu-item">
                <Box className="notification-main-row">
                  <Box className="notification-description">
                    <Typography variant="body1" className="notification-text">
                      {notification.description}
                    </Typography>
                    <Typography variant="caption" className="notification-time">
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  {renderReadIcon(notification)}
                </Box>
                {renderActionButtons(notification)}
              </MenuItem>
              <Divider />
            </Box>
          ))}
        </Box>
      )}
    </Menu>
  );
};

export default NotificationsDropdown;