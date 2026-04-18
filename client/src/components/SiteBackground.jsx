import React from 'react';
import './SiteBackground.css';

const SiteBackground = () => {
  return (
    <div className="site-bg">
      <div className="glow-blobs">
        <div className="blob glow-blue"></div>
        <div className="blob glow-purple"></div>
      </div>
      <div className="network-lines">
        {/* SVG for animated circuit paths */}
        <svg width="100%" height="100%" preserveAspectRatio="none">
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(59, 130, 246, 0.05)" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Animated Paths */}
          <path className="path path-1" d="M -50 200 Q 400 150 800 400 T 2000 600" />
          <path className="path path-2" d="M -100 800 Q 600 900 1100 600 T 2500 1000" />
          <path className="path path-3" d="M 500 -100 Q 700 400 300 800 T 800 1500" />
        </svg>
      </div>
      <div className="bg-overlay"></div>
    </div>
  );
};

export default SiteBackground;
