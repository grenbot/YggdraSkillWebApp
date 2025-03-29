import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import TestCrashButton from './TestCrashButton';

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Welcome to Skill Trees</h1>
        <p>Your journey to personal growth starts here.</p>
      </header>
      <main className="home-main">
        <section className="hero">
          <h2>Explore, Learn, and Grow</h2>
          <p>
            Browse hundreds of skill trees across various domains like math,
            science, art, and more. Take the first step towards mastering new
            skills and reaching your full potential.
          </p>
          <div className="cta-buttons">
            <Link to="/develop" className="btn primary">
              Browse Trees
            </Link>
            <Link to="/signup" className="btn secondary">
              Get Started
            </Link>
          </div>
        </section>
        <section className="features">
          <h2>Why Skill Trees?</h2>
          <div className="feature-list">
            <div className="feature">
              <h3>Free Browsing</h3>
              <p>
                Access and explore all our skill trees for free, no registration
                required.
              </p>
            </div>
            <div className="feature">
              <h3>Progress Tracking</h3>
              <p>
                Save your progress and track your journey with a free account.
              </p>
            </div>
            <div className="feature">
              <h3>Gamification</h3>
              <p>Unlock achievements and compete with friends (coming soon).</p>
            </div>
          </div>
          <TestCrashButton />
        </section>
      </main>
      <footer className="home-footer">
        <p>
          &copy; {new Date().getFullYear()} Skill Trees. Empowering growth, one
          skill at a time.
        </p>
        <p>
          <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
