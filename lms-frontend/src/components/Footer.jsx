import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content container">
        <div className="footer-section">
          <h3 className="footer-logo">IntelliLearn</h3>
          <p className="footer-description">Transform your learning experience with our cutting-edge platform designed for the modern learner.</p>
          <div className="social-links">
            <a href="#" className="social-link">📘</a>
            <a href="#" className="social-link">🐦</a>
            <a href="#" className="social-link">📷</a>
            <a href="#" className="social-link">💼</a>
          </div>
        </div>
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/courses">Courses</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4 className="footer-heading">Categories</h4>
          <ul className="footer-links">
            <li><a href="/courses?category=technology">Technology</a></li>
            <li><a href="/courses?category=business">Business</a></li>
            <li><a href="/courses?category=design">Design</a></li>
            <li><a href="/courses?category=marketing">Marketing</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4 className="footer-heading">Contact Us</h4>
          <div className="contact-info">
            <p>📧 info@intellilearn.com</p>
            <p>📞 (123) 456-7890</p>
            <p>📍 123 Education St, Learning City</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2025 IntelliLearn. All rights reserved. Empowering learners worldwide.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;