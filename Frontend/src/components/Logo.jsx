import React from 'react';

const Logo = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background - Client's Green Square */}
      <rect 
        x="5" 
        y="5" 
        width="90" 
        height="90" 
        rx="20" 
        fill="#4CAF50" 
      />
      
      {/* Stylized Stencil 'F' */}
      <path 
        d="M38 32H62M38 32V68M38 48H56" 
        stroke="white" 
        strokeWidth="12" 
        strokeLinecap="square" 
      />
      
      {/* Orange Slice - Detailed */}
      <path 
        d="M44 26C44 20 56 20 56 26C56 30 44 30 44 26Z" 
        fill="#FF9800" 
      />
    </svg>
  );
};

export default Logo;
