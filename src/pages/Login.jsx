import React, { useState, useContext, useEffect } from 'react';
import { loginUser } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
import { styled } from '@mui/system';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { motion } from 'framer-motion';

// 🎨 Styled Components for Modern Design
const StyledContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to bottom, #f0f9ff, #a6e1fa)',
  overflow: 'hidden',
  margin: 0,
  padding: 0,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  textAlign: 'center',
  width: '400px',
  background: '#fff',
  marginTop: '-1vh', // Move box slightly upwards
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: '48px',
  fontSize: '16px',
  fontWeight: 'bold',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ccc',
    },
    '&:hover fieldset': {
      borderColor: '#4facfe',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4facfe',
    },
  },
}));

// ✨ Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.4, ease: 'easeIn' } },
};

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
    severity: 'info',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden'; // Disable scrolling
    return () => {
      document.body.style.overflow = 'auto'; // Restore scrolling
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
    setSnackbar({ open: false, message: '', severity: 'info' });
    setLoading(true);

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
      <StyledContainer>
        <StyledPaper>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <LockOutlinedIcon sx={{ fontSize: 48, color: '#4facfe' }} />
            <Typography variant="h5" mt={1} mb={2} fontWeight="bold">
              Login to Your Account
            </Typography>
          </Box>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <StyledTextField
              required
              label="Email or Username"
              name="email_or_username"
              value={form.email_or_username}
              onChange={handleChange}
              disabled={loading || success}
            />
            <StyledTextField
              required
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              disabled={loading || success}
            />
            <StyledButton
              variant="contained"
              color="primary"
              type="submit"
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
            </StyledButton>
          </Box>

          {/* Links */}
          <Box mt={2} textAlign="center">
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
        </StyledPaper>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </StyledContainer>
    </motion.div>
  );
}

export default Login;
