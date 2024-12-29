// src/pages/Register.jsx
import React, { useState } from 'react';
import { registerUser } from '../api/authApi';
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

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
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
      const response = await registerUser(form);
      setSnackbar({
        open: true,
        message: response.message || 'User registered successfully!',
        severity: 'success',
      });

      // Navigate to login after success
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.error ||
          'Registration failed. Please try again.',
        severity: 'error',
      });

      if (err.response?.data?.details) {
        console.error('Details:', err.response.data.details);
        setSnackbar({
          open: true,
          message: `${err.response.data.error}: ${err.response.data.details}`,
          severity: 'error',
        });
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" mb={2}>
          Register
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            required
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
          />
          <TextField
            required
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
          />
          <TextField
            required
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            required
            label="Username"
            name="username"
            value={form.username}
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
            Register
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center'}}
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

export default Register;
