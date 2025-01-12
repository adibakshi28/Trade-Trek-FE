import React, { useState, useContext, useEffect } from 'react';
import { registerUser } from '../../api/authApi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { motion } from 'framer-motion';
import './Register.css';

// Validation functions
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 8;

// ✨ Animation Variants
const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.4, ease: 'easeIn' } },
};

function Register() {
  const navigate = useNavigate();
  const { accessToken, isAuthLoading } = useContext(AuthContext);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!isAuthLoading && accessToken) {
      navigate('/dashboard');
    }
  }, [accessToken, isAuthLoading, navigate]);

  // Disable scrolling globally
  useEffect(() => {
    document.body.style.overflow = 'hidden'; // Disable scrolling
    return () => {
      document.body.style.overflow = 'auto'; // Restore scrolling on unmount
    };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: '',
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!validateEmail(form.email)) {
      newErrors.email = 'Invalid email format.';
    }
    if (!validatePassword(form.password)) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSnackbar({ open: false, message: '', severity: 'info' });

    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix all errors.',
        severity: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser(form);
      setSnackbar({
        open: true,
        message: response.message || 'User registered successfully!',
        severity: 'success',
      });

      setSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.details
          ? `${err.response.data.error}: ${err.response.data.details}`
          : err.response?.data?.error ||
            'Registration failed. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="register-container">
        <Paper className="register-paper">
          <Box className="register-header">
            <PersonAddOutlinedIcon className="register-icon" />
            <Typography variant="h5" className="register-title">
              Create Your Account
            </Typography>
          </Box>
          <form onSubmit={handleSubmit} className="register-form">
            <TextField
              required
              label="First Name"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              disabled={loading || success}
              fullWidth
            />
            <TextField
              required
              label="Last Name"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              disabled={loading || success}
              fullWidth
            />
            <TextField
              required
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading || success}
              fullWidth
            />
            <TextField
              required
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={loading || success}
              fullWidth
            />
            <TextField
              required
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading || success}
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className="register-button"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                  Registering...
                </>
              ) : success ? (
                'Registered'
              ) : (
                'Register'
              )}
            </Button>
          </form>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Already have an account?{' '}
              <Link href="/login" underline="hover">
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </div>
    </motion.div>
  );
}

export default Register;
