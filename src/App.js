// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UniverseProvider } from './context/UniverseContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Public Routes
import Landing from './pages/LandingPage/Landing';
import Login from './pages/LoginPage/Login';
import Register from './pages/RegisterPage/Register';
import FAQ from './pages/FAQPage/FAQ';
import Contact from './pages/ContactPage/Contact';

// Protected Routes
import Dashboard from './pages/DashboardPage/Dashboard';
import Transactions from './pages/TransactionsPage/Transactions';
import Insights from './pages/InsightsPage/Insights';
import Social from './pages/SocialPage/Social';
import Research from './pages/ResearchPage/Research';

import RiskProfile from './pages/RiskProfilePage/RiskProfile';

import StockDetailsPage from './pages/StockDetailsPage/StockDetailsPage';

function App() {
  return (
    <AuthProvider>
      <UniverseProvider>
        <WebSocketProvider> 
          <ThemeProvider>
            <Router>
              <div className="app-layout">
                <Navbar />
                  <div className="main-content">
                    <Routes>
                      <Route path="/" element={<Landing />} />

                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/contact" element={<Contact />} />

                      <Route path="/risk-profile" element={<RiskProfile />} />

                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/transactions" element={<Transactions />} />
                      <Route path="/insights" element={<Insights />} />
                      <Route path="/social" element={<Social />} />
                      <Route path="/research" element={<Research />} />

                      <Route path="/stock/:ticker" element={<StockDetailsPage />} />

                      <Route path="*" element={<Landing />} />
                    </Routes>
                  </div>
                <Footer />
              </div>
            </Router>
          </ThemeProvider>
        </WebSocketProvider>
      </UniverseProvider>
    </AuthProvider>
  );
}

export default App;
