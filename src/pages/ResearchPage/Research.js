// src/pages/DashboardLayout.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ResearchText from '../../components/ResearchText/ResearchText';


const Research = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && !accessToken) {
      navigate('/login');
    }
  }, [accessToken, isAuthLoading, navigate]);

  return <div style={{ textAlign: 'center'}}>
    <ResearchText />
  </div>;
};

export default Research;
