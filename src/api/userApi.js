// src/api/userApi.js
import axiosClient from '../utils/axiosClient';

// /user
export const getUser = async () => {
  const response = await axiosClient.get('/user');
  return response.data; // e.g. {id:21, first_name:'aditya', ...}
};

// /user/funds
export const getUserFunds = async () => {
  const response = await axiosClient.get('/user/funds');
  return response.data; // e.g. { user_id:21, cash: 97824.8 }
};

// /user/portfolio
export const getUserPortfolio = async () => {
  const response = await axiosClient.get('/user/portfolio');
  return response.data; // e.g. array of positions
};

// /user/transactions
export const getUserTransactions = async () => {
  const response = await axiosClient.get('/user/transactions');
  return response.data; // e.g. array of transactions
};

// /user/summary
export const getUserSummary = async () => {
  const response = await axiosClient.get('/user/summary');
  return response.data; // e.g. { cash_balance, positions_market_value, portfolio_value, ...}
};

// /user/dashboard
export const getUserDashboard = async () => {
  const response = await axiosClient.get('/user/dashboard');
  return response.data; // e.g. { user, portfolio, fund, summary }
};


// GET /user/watchlist
export const getUserWatchlist = async () => {
  const res = await axiosClient.get('/user/watchlist');
  return res.data; // e.g. array of watchlist items containing stock_ticker, stock_name
};


// GET /user/watchlist/remove?ticker=xxx
export const removeFromUserWatchlist = async (ticker) => {
  const res = await axiosClient.get('/user/watchlist/remove', {
    params: { ticker },
  });
  return res.data;
};


// GET /user/watchlist/add?ticker=xxx
export const addToUserWatchlist = async (ticker) => {
  const res = await axiosClient.get('/user/watchlist/add', {
    params: { ticker },
  });
  return res.data;
};

// /user/portfolio/history
export const getUserPortfolioHistory = async () => {
  const response = await axiosClient.get('/user/portfolio/history');
  return response.data; 
};

// /user/metrics
export const postUserMetrics = async (config) => {
  const response = await axiosClient.post('/user/metrics', config);
  return response.data;
};

// /user/notifications
export const getUserNotifications = async () => {
  const response = await axiosClient.get('/user/notifications');
  return response.data;
};

// /user/notifications/read
export const markNotificationAsRead = async (notification_id) => {
  const response = await axiosClient.get('/user/notifications/read', {
    params: { notification_id },
  });
  return response.data; 
};

// /user/friend
export const getUserFriends = async () => {
  const response = await axiosClient.get('/user/friend');
  return response.data; 
};

// /user/friend/search/to-add
export const searchUserToAddFriend = async (user_name_str) => {
  const response = await axiosClient.get('/user/friend/search/to-add', {
    params: { user_name_str },
  });
  return response.data; 
};

// /user/friend/request/send
export const sendFriendRequest = async (request_to_username) => {
  const response = await axiosClient.get('/user/friend/request/send', {
    params: { request_to_username },
  });
  return response.data; 
};

// /user/friend/request/accept
export const acceptFriendRequest = async (accepted_username) => {
  const response = await axiosClient.get('/user/friend/request/accept', {
    params: { accepted_username },
  });
  return response.data;
};

// /user/friend/request/decline
export const declineFriendRequest = async (declined_username) => {
  const response = await axiosClient.get('/user/friend/request/decline', {
    params: { declined_username },
  });
  return response.data; 
};

// /user/friend/summary
export const getFriendSummary = async (friend_username) => {
  const response = await axiosClient.get('/user/friend/summary', {
    params: { friend_username },
  });
  return response.data; 
};

// /user/group
export const getUserGroups = async () => {
  const response = await axiosClient.get('/user/group');
  return response.data; 
};

// /user/group/search/to-add
export const searchUserToAddInGroup = async (group_name, user_name_str) => {
  const response = await axiosClient.get('/user/group/search/to-add', {
    params: { group_name, user_name_str },
  });
  return response.data; 
};


// /user/group/search/to-join
export const searchGroupToJoin = async (group_name_str) => {
  const response = await axiosClient.get('/user/group/search/to-join', {
    params: { group_name_str },
  });
  return response.data; 
};

// /user/group/request/join
export const joinGroupRequest = async (group_name) => {
  const response = await axiosClient.get('/user/group/request/join', {
    params: { group_name },
  });
  return response.data; 
};

// /user/group/request/join/accept
export const acceptGroupJoin = async (group_name, user_name_joining) => {
  const response = await axiosClient.get('/user/group/request/join/accept', {
    params: { group_name, user_name_joining },
  });
  return response.data; 
};

// /user/group/request/join/decline
export const declineGroupJoin = async (group_name, user_name_joining) => {
  const response = await axiosClient.get('/user/group/request/join/decline', {
    params: { group_name, user_name_joining },
  });
  return response.data; 
};

// /user/group/create
export const createGroup = async (group_name, group_description) => {
  console.log('group_name:', group_name);
  console.log('group_description:', group_description);
  const response = await axiosClient.post('/user/group/create', null, {
    params: { group_name, group_description },
  });
  return response.data;
};

// /user/group/info
export const getGroupInfo = async (group_name) => {
  const response = await axiosClient.post('/user/group/info', null, {
    params: { group_name },
  });
  return response.data;
};

// /user/group/request/invite
export const sendGroupInvite = async (request_to_username, group_name) => {
  const response = await axiosClient.get('/user/group/request/invite', {
    params: { request_to_username, group_name },
  });
  return response.data; 
};

// /user/group/request/accept
export const acceptGroupInvite = async (group_name) => {
  const response = await axiosClient.get('/user/group/request/accept', {
    params: { group_name },
  });
  return response.data; 
};

// /user/group/request/decline
export const declineGroupInvite = async (group_name) => {
  const response = await axiosClient.get('/user/group/request/decline', {
    params: { group_name },
  });
  return response.data; 
};

// /user/group/leaderboard
export const getGroupLeaderboard = async (group_name) => {
  const response = await axiosClient.get('/user/group/leaderboard', {
    params: { group_name },
  });
  return response.data; 
};

// /user/risk-profile/questionnaire
export const getRiskProfileQuestionnaire = async () => {
  const response = await axiosClient.get('/user/risk-profile/questionnaire');
  return response.data; 
};

// /user/risk-profile
export const submitUserRiskProfile = async (questionnaire_result) => {
  const response = await axiosClient.post('/user/risk-profile', questionnaire_result);
  return response.data;
};

// /user/risk-score
export const getRiskScore = async () => {
  const response = await axiosClient.get('/user/risk-score');
  return response.data; 
};
