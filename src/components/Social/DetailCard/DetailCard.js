// src/components/Social/DetailCard/DetailCard.js
import React from 'react';
import GroupDetails from '../GroupDetails/GroupDetails';
import FriendDetails from '../FriendDetails/FriendDetails';
import './DetailCard.css';

const DetailCard = ({ item }) => {
  if (item.type === 'friend') {
    return (
      <FriendDetails friend_username={item.username} />
    );
  } else if (item.type === 'group') {
    return (
      <GroupDetails group_name={item.group_name} />
    );
  } else {
    return null;
  }
};

export default DetailCard;
