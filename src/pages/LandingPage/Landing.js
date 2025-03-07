// src/pages/DashboardLayout.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Landing from '../../components/Landing/Landing';


const LandingPage = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!isAuthLoading && accessToken) {
      navigate('/dashboard');
    }
  }, [accessToken, isAuthLoading, navigate]);

  return <div>
    <Landing />
  </div>;
};

export default LandingPage;