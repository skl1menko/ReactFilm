import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="lightsaber"></div>
      <p className="loading-text">A long time ago in a galaxy far, far away...</p>
    </div>
  );
};

export default LoadingSpinner; 