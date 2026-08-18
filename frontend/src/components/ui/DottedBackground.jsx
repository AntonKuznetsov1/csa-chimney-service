import React from 'react';

export default function DottedBackground({ children }) {
  return (
    <div className="relative min-h-screen bg-white">
      {/* Subtle dotted pattern using background-image radial gradient */}
      <div
        className="absolute inset-0 z-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(#111827 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}