// src/pages/RootRedirect.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function RootRedirect() {
  const { accessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [accessToken, navigate]);

  return null; 
}

export default RootRedirect;
