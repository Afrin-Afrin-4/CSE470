import React, { useState, useEffect } from 'react';
import './SmoothAnimationDemo.css';

const SmoothAnimationDemo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Toggle visibility for fade animation
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Handle mouse move for smooth tracking
  const handleMouseMove = (e) => {
    setPosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  // Add mouse move listener
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="smooth-demo-container">
      <h2 className="demo-title">Smooth Animation Demo</h2>
      
      {/* Fade In/Out Demo */}
      <div className="demo-section">
        <h3>Fade Animation</h3>
        <button 
          className="demo-button"
          onClick={toggleVisibility}
        >
          Toggle Visibility
        </button>
        <div className={`fade-box ${isVisible ? 'visible' : ''}`}>
          <p>This box fades in and out smoothly!</p>
        </div>
      </div>
      
      {/* Hover Effect Demo */}
      <div className="demo-section">
        <h3>Hover Effects</h3>
        <div 
          className={`hover-box ${isHovered ? 'hovered' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <p>Hover over me for a smooth effect!</p>
        </div>
      </div>
      
      {/* Mouse Follower Demo */}
      <div className="demo-section">
        <h3>Mouse Follower</h3>
        <p>Move your mouse around to see the smooth follower:</p>
        <div 
          className="mouse-follower"
          style={{
            transform: `translate(${position.x - 25}px, ${position.y - 25}px)`
          }}
        ></div>
      </div>
      
      {/* Smooth Transition Demo */}
      <div className="demo-section">
        <h3>Smooth Transitions</h3>
        <div className="transition-container">
          <div className="transition-box">
            <p>All these animations use CSS transitions for smooth effects</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmoothAnimationDemo;