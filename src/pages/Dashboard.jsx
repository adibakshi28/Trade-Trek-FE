// src/pages/Dashboard.jsx
import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Typography, Container, Paper } from '@mui/material';

function Dashboard() {
  const { accessToken, user, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading) {
      if (!accessToken) {
        navigate('/login');
      }
    }
  }, [accessToken, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">
          Welcome, {user.first_name} {user.last_name}!
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          This is a protected page only visible to authenticated users.
          <br />
          Your user_id is: {user.user_id}
          <br />
          Your username is: {user.username}
        </Typography>
      </Paper>
    </Container>
  );
}

export default Dashboard;
