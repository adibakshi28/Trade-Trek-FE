import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiTrendingUp, FiActivity, FiShield, FiDollarSign, FiChevronDown, FiZap } from 'react-icons/fi';
import './Landing.css';

const screenshots = [
  '/ss/1.png',
  '/ss/2.png',
  '/ss/3.png',
  '/ss/4.png',
  '/ss/5.png',
];

const features = [
  {
    title: 'Neural Market Predictions',
    description: 'Forecast market movements with precision using deep neural networks.',
    icon: <FiTrendingUp size={32} />
  },
  {
    title: 'Portfolio Genome Analysis',
    description: 'Uncover hidden strengths and weaknesses in your portfolio.',
    icon: <FiActivity size={32} />
  },
  {
    title: 'Risk DNA Profiling',
    description: 'Assess your unique risk profile with innovative AI algorithms.',
    icon: <FiShield size={32} />
  },
  {
    title: 'Liquid Asset Tracking',
    description: 'Monitor asset liquidity in real time to seize trading opportunities.',
    icon: <FiDollarSign size={32} />
  },
  {
    title: 'Sentiment Horizon Scan',
    description: 'Capture market sentiment trends to stay ahead of emerging shifts.',
    icon: <FiChevronDown size={32} />
  },
  {
    title: 'Quantum Trade Engine',
    description: 'Experience ultra-fast trade execution with quantum-inspired algorithms.',
    icon: <FiZap size={32} />
  }
];

function LandingPage() {
  const { accessToken, isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!isAuthLoading && accessToken) {
      navigate('/dashboard');
    }
  }, [accessToken, isAuthLoading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
  };

  return (
    <div className="landing-page" onMouseMove={handleMouseMove}>
      {/* Background Effects */}
      <div className="background-effects">
        <div
          className="gradient-blob"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        ></div>
        <div className="particle-layer"></div>
      </div>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Empower Your <span className="highlight">Trading Journey</span> with{' '}
            <span className="highlight">TradeTrek</span>
          </h1>
          <p className="hero-subtitle">
            Leverage AI-driven insights &amp; portfolio recommendations to stay ahead of the market.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="cta-button primary">
              Get Started
            </Link>
            <Link to="/faq" className="cta-button secondary">
              Learn More
            </Link>
          </div>
        </div>
        <div className="scroll-indicator" aria-hidden="true">
          <span></span>
        </div>
      </header>

      {/* Market Ticker */}
      <section className="market-ticker">
        <div className="ticker">
          <div className="ticker-item">BTC: $40,000</div>
          <div className="ticker-item">ETH: $2,800</div>
          <div className="ticker-item">NASDAQ: 14,000</div>
          <div className="ticker-item">S&amp;P 500: 4,200</div>
          <div className="ticker-item">DJIA: 35,000</div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="showcase-section">
        <h2 className="section-title">
          Intelligent Trading <span className="gradient-text">Redefined</span>
        </h2>
        <div className="slider-wrapper">
          <div
            className="slider-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {screenshots.map((img, index) => {
              const isActive = index === currentIndex;
              const activeStyle = isActive
                ? { transform: `translate(${mousePos.x / 2}px, ${mousePos.y / 2}px) scale(1.05)` }
                : {};
              return (
                <div className={`slide ${isActive ? 'active' : ''}`} key={index}>
                  <img src={img} alt={`Feature ${index + 1}`} loading="lazy" style={activeStyle} />
                </div>
              );
            })}
          </div>
          <div className="slider-nav">
            {screenshots.map((_, i) => (
              <button
                key={i}
                className={`nav-dot ${i === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Advanced Tools &amp; Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon" aria-hidden="true">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Transform Your Trading Experience</h2>
          <p>
            Join the revolution in market analytics and gain the competitive edge.
          </p>
          <Link to="/register" className="cta-button glow">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
