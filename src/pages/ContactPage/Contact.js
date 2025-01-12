// src/pages/Contact/Contact.js

import React from 'react';
import './Contact.css';
import {
  Box,
  Typography,
  Link,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PersonIcon from '@mui/icons-material/Person';

function Contact() {
  return (
    <Box className="contact-container">
      <Box className="contact-card">
        <Box className="contact-header">
          <PersonIcon className="contact-icon" />
          <Typography variant="h4" className="contact-heading">
            Contact
          </Typography>
        </Box>
        <Box className="contact-info">
          {/* Name */}
          <Box className="contact-item">
            <PersonIcon className="info-icon" />
            <Typography variant="h6" className="info-text">
              Aditya Bakshi
            </Typography>
          </Box>
          {/* Email */}
          <Box className="contact-item">
            <EmailIcon className="info-icon" />
            <Typography variant="h6" className="info-text">
              <Link href="mailto:adibakshi28@gmail.com" className="info-link">
                adibakshi28@gmail.com
              </Link>
            </Typography>
          </Box>
          {/* LinkedIn */}
          <Box className="contact-item">
            <LinkedInIcon className="info-icon" />
            <Typography variant="h6" className="info-text">
              <Link
                href="https://www.linkedin.com/in/adibakshi28/"
                target="_blank"
                rel="noopener noreferrer"
                className="info-link"
              >
                linkedin.com/in/adibakshi28/
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Contact;
