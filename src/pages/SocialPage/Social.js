// src/pages/DashboardLayout.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import SocialText from '../../components/SocialText/SocialText';


const Social = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && !accessToken) {
      navigate('/login');
    }
  }, [accessToken, isAuthLoading, navigate]);

  return <div style={{ textAlign: 'center'}}>
    <SocialText />
  </div>;
};

export default Social;
