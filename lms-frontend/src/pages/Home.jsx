import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      id: 1,
      content: "IntelliLearn transformed my career. The courses are comprehensive and the instructors are exceptional. I landed a job with 40% higher salary after completing their data science program.",
      author: "Sarah Johnson",
      role: "Data Scientist at TechCorp",
      rating: 5,
      avatar: "SJ"
    },
    {
      id: 2,
      content: "The flexibility of learning at my own pace while having access to expert instructors made all the difference. The community support is outstanding and keeps me motivated throughout my learning journey.",
      author: "Michael Chen",
      role: "Software Developer",
      rating: 5,
      avatar: "MC"
    },
    {
      id: 3,
      content: "As a busy professional, I needed a platform that could adapt to my schedule. IntelliLearn exceeded my expectations with its intuitive interface and high-quality content. Highly recommended!",
      author: "Emma Rodriguez",
      role: "Marketing Director",
      rating: 5,
      avatar: "ER"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content container">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-text">🌟 New Courses Available</span>
            </div>
            <h1 className="hero-title">
              Transform Your Future with <span className="highlight">IntelliLearn</span>
            </h1>
            <p className="hero-subtitle">
              Discover, learn, and master new skills with our world-class online learning platform designed for the modern learner.
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Active Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Quality Courses</span>
              </div>
            </div>
            <div className="hero-actions">
              <Link to="/courses" className="btn btn-primary">
                Explore Courses
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Start Free Trial
              </Link>
            </div>
          </div>
          <div className="hero-image">
            {/* Simplified static squares instead of animated graphics */}
            <div className="simple-squares">
              <div className="square square-1"></div>
              <div className="square square-2"></div>
              <div className="square square-3"></div>
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <span className="scroll-text">Scroll to explore</span>
          <div className="scroll-arrow"></div>
        </div>
      </div>
      
      {/* Trusted By Section */}
      <div className="trusted-section">
        <div className="container">
          <p className="trusted-title">Trusted by professionals at</p>
          <div className="trusted-logos">
            <div className="logo-item">Leading Tech Companies</div>
            <div className="logo-item">Fortune 500 Enterprises</div>
            <div className="logo-item">Global Organizations</div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose IntelliLearn?</h2>
            <p className="section-subtitle">We provide the tools and resources you need to succeed in your learning journey.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">🎓</span>
              </div>
              <h3 className="feature-title">Expert Instructors</h3>
              <p className="feature-description">Learn from industry professionals with real-world experience and proven teaching methods.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">📱</span>
              </div>
              <h3 className="feature-title">Learn Anywhere</h3>
              <p className="feature-description">Access courses 24/7 from any device. Learn at your own pace, anytime, anywhere.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">🏆</span>
              </div>
              <h3 className="feature-title">Certification</h3>
              <p className="feature-description">Earn recognized certificates to boost your career prospects and showcase skills.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">💬</span>
              </div>
              <h3 className="feature-title">Community Support</h3>
              <p className="feature-description">Connect with peers and instructors in our vibrant learning community.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">📊</span>
              </div>
              <h3 className="feature-title">Progress Tracking</h3>
              <p className="feature-description">Monitor your learning journey with detailed analytics and progress reports.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <span className="icon">💰</span>
              </div>
              <h3 className="feature-title">Affordable Pricing</h3>
              <p className="feature-description">High-quality education at competitive prices with flexible payment options.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">200+</div>
              <div className="stat-label">Expert Instructors</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Quality Courses</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What Our Students Say</h2>
            <p className="section-subtitle">Hear from learners who have transformed their careers with IntelliLearn.</p>
          </div>
          <div className="testimonials-slider">
            <div className="testimonial-track" style={{transform: `translateX(-${currentTestimonial * 100}%)`}}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-slide">
                  <div className="testimonial-card">
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="star">★</span>
                      ))}
                    </div>
                    <p className="testimonial-content">"{testimonial.content}"</p>
                    <div className="testimonial-author">
                      <div className="author-avatar">
                        <div className="avatar-placeholder">{testimonial.avatar}</div>
                      </div>
                      <div className="author-info">
                        <h4 className="author-name">{testimonial.author}</h4>
                        <p className="author-title">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="testimonial-nav">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`nav-dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Transform Your Skills?</h2>
            <p className="cta-subtitle">
              Join thousands of students who have advanced their careers with IntelliLearn. Start your learning journey today.
            </p>
            <div className="cta-actions">
              <Link to="/courses" className="btn btn-primary">
                Browse All Courses
              </Link>
              <Link to="/register" className="btn btn-outline">
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;