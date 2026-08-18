import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyle = "px-6 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center";
  
  const variants = {
    primary: "bg-brand-orange text-white hover:bg-orange-600 hover:shadow-md",
    outline: "border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}