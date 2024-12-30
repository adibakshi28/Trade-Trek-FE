import React, { useState, useEffect } from 'react';
import { registerUser } from '../api/authApi';
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
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { motion } from 'framer-motion';

// 🎨 Styled Components
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
  marginTop: '-8vh', // Slight upward adjustment
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
      <StyledContainer>
        <StyledPaper>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <PersonAddOutlinedIcon sx={{ fontSize: 48, color: '#4facfe' }} />
            <Typography variant="h5" mt={1} mb={2} fontWeight="bold">
              Create Your Account
            </Typography>
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <StyledTextField required label="First Name" name="first_name" value={form.first_name} onChange={handleChange} disabled={loading || success} />
            <StyledTextField required label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} disabled={loading || success} />
            <StyledTextField required label="Email" name="email" value={form.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} disabled={loading || success} />
            <StyledTextField required label="Username" name="username" value={form.username} onChange={handleChange} disabled={loading || success} />
            <StyledTextField required label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} disabled={loading || success} />
            <StyledButton variant="contained" color="primary" type="submit" disabled={loading || success}>
              {loading ? <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} /> : success ? 'Registered' : 'Register'}
            </StyledButton>
          </Box>
          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              Already have an account?{' '}
              <Link href="/login" underline="hover">
                Login here
              </Link>
            </Typography>
          </Box>
        </StyledPaper>
        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </StyledContainer>
    </motion.div>
  );
}

export default Register;
