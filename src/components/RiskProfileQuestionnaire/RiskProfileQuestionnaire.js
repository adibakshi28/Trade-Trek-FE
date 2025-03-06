import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import {
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Button,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { getRiskProfileQuestionnaire, submitUserRiskProfile } from '../../api/userApi';
import './RiskProfileQuestionnaire.css';

const RiskProfileQuestionnaire = () => {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [riskScore, setRiskScore] = useState(null);
  const [riskCategory, setRiskCategory] = useState('');
  const [confetti, setConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const data = await getRiskProfileQuestionnaire();
        setQuestionnaire(data);
      } catch (error) {
        console.error('Error fetching questionnaire:', error);
      }
    };
    fetchQuestionnaire();
  }, []);

  const handleChange = (questionId, answerId) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const questionnaire_result = Object.entries(selectedAnswers).map(
      ([question_id, answer_id]) => ({
        question_id: Number(question_id),
        answer_id: Number(answer_id)
      })
    );

    try {
      setLoading(true);
      const response = await submitUserRiskProfile(questionnaire_result);
      setRiskScore(response.risk_score);
      setRiskCategory(response.risk_category || 'Moderate');
      setOpenDialog(true);
      setConfetti(true);
      setTimeout(() => setConfetti(false), 10000);
    } catch (error) {
      console.error('Error submitting risk profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => navigate('/dashboard');

  return (
    <Container maxWidth="xxl" className="risk-profile-container">
      {confetti && <Confetti 
        className="confetti"
        width={windowSize.width} 
        height={windowSize.height}
        numberOfPieces={500}
        recycle={false}
      />}

      <Box className="header-container">
        <Typography variant="h1" className="main-title">
          Investment Risk Assessment
        </Typography>
        <Typography variant="subtitle1" className="subtitle">
          Answer these questions to discover your optimal investment strategy
        </Typography>
      </Box>

      {questionnaire.length === 0 ? (
        <Box className="loading-container">
          <CircularProgress className="loading-spinner" />
        </Box>
      ) : (
        <form onSubmit={handleSubmit} className="questionnaire-form">
          <Box className="questions-scroll-container">
            <Grid container spacing={3} className="questions-grid">
              {questionnaire.map((question) => (
                <Grid item xs={12} sm={6} md={3} key={question.id} className="grid-item">
                  <Box className="question-card">
                    <FormControl component="fieldset" className="form-control">
                      <Typography component="legend" className="question-text">
                        {question.question}
                      </Typography>
                      <RadioGroup className="radio-group">
                        {question.answers?.map((answer) => (
                          <FormControlLabel
                            key={answer.id}
                            value={answer.id}
                            control={<Radio className="radio-button" />}
                            label={answer.answer}
                            className={`radio-label ${
                              selectedAnswers[question.id] === answer.id ? 'selected' : ''
                            }`}
                            onChange={(e) => handleChange(question.id, Number(e.target.value))}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box className="action-button-panel">
            <Button
              variant="outlined"
              onClick={handleSkip}
              className="skip-btn"
            >
              Skip Assessment
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading ? <CircularProgress className="submit-spinner" /> : 'Calculate Risk Score'}
            </Button>
          </Box>
        </form>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} className="result-dialog">
        <Box className="dialog-container">
          <DialogTitle className="dialog-title">
            Risk Assessment Complete
          </DialogTitle>
          <DialogContent>
            <Box className="score-container">
              <Typography variant="h1" className="score">
                {riskScore}
              </Typography>
            </Box>
            <DialogContentText className="category-label">
              Your risk tolerance is categorized as
            </DialogContentText>
            <Typography variant="h3" className="category">
              {riskCategory}
            </Typography>
          </DialogContent>
          <DialogActions className="dialog-actions">
            <Button
              className="dialog-btn-close" 
              onClick={() => setOpenDialog(false)}
            >
              Close
            </Button>

            <Button 
              className="dialog-btn-view"
              onClick={handleSkip}
            >
              View Recommendations
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
};

export default RiskProfileQuestionnaire;