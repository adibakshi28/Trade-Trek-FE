// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { loginUser } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';

function Login() {
  const navigate = useNavigate();
  const { saveAuth } = useContext(AuthContext);

  const [form, setForm] = useState({
    email_or_username: '',
    password: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info', // info | success | warning | error
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSnackbar({ open: false, message: '', severity: 'info' });

    try {
      const response = await loginUser(form);
      if (response.access_token) {
        saveAuth(response.access_token);
        setSnackbar({
          open: true,
          message: 'Login successful! Redirecting...',
          severity: 'success',
        });
        // Go to /dashboard after success
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed';
      const details = err.response?.data?.details || '';
      setSnackbar({
        open: true,
        message: details ? `${error}: ${details}` : error,
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" mb={2}>
          Login
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            required
            label="Email or Username"
            name="email_or_username"
            value={form.email_or_username}
            onChange={handleChange}
          />
          <TextField
            required
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          <Button variant="contained" color="primary" type="submit">
            Login
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;
