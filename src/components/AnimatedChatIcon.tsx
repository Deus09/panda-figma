import React from 'react';

const AnimatedChatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className={`relative flex items-center justify-center ${className || ''}`.trim()} style={{ width: 28, height: 28 }}>
    {/* Balon */}
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4" width="24" height="16" rx="8" fill="#fff" fillOpacity="0.15" />
      <rect x="2" y="4" width="24" height="16" rx="8" stroke="#fff" strokeWidth="1.5" />
      <path d="M10 22L14 20L18 22" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    {/* Noktalar */}
    <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-0.5">
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
    </span>
  </span>
);

export default AnimatedChatIcon; 