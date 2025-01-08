// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UniverseProvider } from './context/UniverseContext';
import { WebSocketProvider } from './context/WebSocketContext';

// Layout / Components
import Navbar from './components/Navbar';
import DashboardLayout from './pages/DashboardLayout';
import RootRedirect from './pages/RootRedirect';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Summary from './pages/Summary';
import StockSearch from './pages/StockSearch';
import TradePage from './pages/TradePage';
import StockDetail from './pages/StockDetail';

function App() {
  return (
    <AuthProvider>
      <UniverseProvider>
        <WebSocketProvider> 
        <Router>
          {/* Always show top Navbar */}
          <Navbar />

          <Routes>
            {/* Root route that checks token and redirects accordingly */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Dashboard Layout */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              {/* Dashboard default index */}
              <Route index element={<Dashboard />} />

              {/* Our other child routes */}
              <Route path="transactions" element={<Transactions />} />
              <Route path="summary" element={<Summary />} />
              <Route path="stocks" element={<StockSearch />} />
              <Route path="trade" element={<TradePage />} />
              <Route path="stocks/:ticker" element={<StockDetail />} />
            </Route>

            {/* Catch-all fallback -> RootRedirect */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
        </WebSocketProvider>
      </UniverseProvider>
    </AuthProvider>
  );
}

export default App;
