import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/authApi';
import { AuthContext } from '../../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { motion } from 'framer-motion';
import LinkParticles from '../../components/Particles/LinkParticles';
import './Login.css';
 
// ✨ Animation Variants
const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.4, ease: 'easeIn' } },
};

function Login() {
  const navigate = useNavigate();
  const { saveAuth, accessToken, isAuthLoading } = useContext(AuthContext);

  const [form, setForm] = useState({
    email_or_username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

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
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        setSuccess(true);
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
      <div className="login-container">
        <LinkParticles />
        <Paper className="login-paper">
          <Box className="login-header">
            <LockOutlinedIcon className="login-icon" />
            <Typography variant="h5" className="login-title">
              Login to Your Account
            </Typography>
          </Box>
          <form onSubmit={handleSubmit} className="login-form">
            <TextField
              label="Email or Username"
              name="email_or_username"
              value={form.email_or_username}
              onChange={handleChange}
              disabled={loading || success}
              fullWidth
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              disabled={loading || success}
              fullWidth
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className="login-button"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                  Logging in...
                </>
              ) : success ? (
                'Logged In'
              ) : (
                'Login'
              )}
            </Button>
          </form>
          <Box mt={2} className="login-links">
            <Link href="/forgot-password" underline="hover">
              Forgot Password?
            </Link>
          </Box>
          <Box mt={1} textAlign="center">
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link href="/register" underline="hover">
                Create one here
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
          <Alert 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </motion.div>
  );
}

export default Login;
