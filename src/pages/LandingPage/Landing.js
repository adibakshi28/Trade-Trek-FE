// src/pages/LandingPage/Landing.js
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LandingText from '../../components/LandingText/LandingText';

const Landing = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!isAuthLoading && accessToken) {
      navigate('/dashboard');
    }
  }, [accessToken, isAuthLoading, navigate]);

  return <div style={{ textAlign: 'center'}}>
    <LandingText />
  </div>;
};

export default Landing;
