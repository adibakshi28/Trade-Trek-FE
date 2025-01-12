// src/pages/FAQPage/FAQ.js

import React from 'react';
import './FAQ.css';
import faqData from './faqData.json';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

function FAQ() {
  return (
    <Box className="faq-container">
      <Box className="faq-card">
        <Box className="faq-header">
          <QuestionAnswerIcon className="faq-header-icon" />
          <Typography variant="h4" className="faq-heading">
            Frequently Asked Questions
          </Typography>
        </Box>
        {faqData.map((item, index) => (
          <Accordion key={index} className="faq-accordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon className="faq-expand-icon" />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography className="faq-question-text">
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography className="faq-answer-text">
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}

export default FAQ;
