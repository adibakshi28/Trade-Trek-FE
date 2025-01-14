// Footer.js

import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';

import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

import './Footer.css';

const Footer = () => {
  return (
    <Box component="footer" className="footer">
      {/* Left Side: Copyright */}
      <Box className="footer-section footer-left">
        <Typography variant="body2" className="footer-text">
          {/* © {new Date().getFullYear()} TradeTrek. All rights reserved. */}
          {new Date().getFullYear()} TradeTrek
        </Typography>
      </Box>

      {/* Center: Navigation Links */}
      <Box className="footer-section footer-center">
        <Link to="/faq" className="footer-link" aria-label="FAQ">
          FAQ
        </Link>
        <Link to="/contact" className="footer-link" aria-label="Contact">
          Contact
        </Link>
      </Box>

      {/* Right Side: Social Media Icons */}
      <Box className="footer-section footer-right">
        <IconButton
          size="small"
          color="inherit"
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icon-button"
          aria-label="Instagram"
        >
          <InstagramIcon />
        </IconButton>
        <IconButton
          size="small"
          color="inherit"
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icon-button"
          aria-label="Facebook"
        >
          <FacebookIcon />
        </IconButton>
        <IconButton
          size="small"
          color="inherit"
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-icon-button"
          aria-label="Twitter"
        >
          <TwitterIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Footer;
