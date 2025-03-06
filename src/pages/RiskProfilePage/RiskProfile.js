// src/pages/RiskProfilePage/RiskProfile.js
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import RiskProfileQuestionnaire from '../../components/RiskProfileQuestionnaire/RiskProfileQuestionnaire';


const RiskProfile = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthLoading && !accessToken) {
      navigate('/login');
    }
  }, [accessToken, isAuthLoading, navigate]);

  return <div>
    <RiskProfileQuestionnaire />
  </div>;
};

export default RiskProfile;
