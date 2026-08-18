import React from 'react';
import { motion } from 'framer-motion';

const certs = [
  { name: "WETT Certified", src: "/src/assets/images/WETT.jpeg" },
  { name: "Heart & Patio Association", src: "/src/assets/images/HeartAndPatioAssociation.png" },
  { name: "NBCETT", src: "/src/assets/images/NBCETT.png" }
];

export default function CertTicker() {
  const tickerItems = [...certs, ...certs, ...certs, ...certs];

  return (
    <div className="relative w-full bg-brand-black py-10 overflow-hidden flex items-center border-y-4 border-brand-orange">
      {/* Full screen-edge fade gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 z-10 bg-gradient-to-r from-brand-black to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 z-10 bg-gradient-to-l from-brand-black to-transparent pointer-events-none"></div>

      <div className="w-full">
        <motion.div
          className="flex space-x-16 sm:space-x-20 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 18, repeat: Infinity }}
        >
          {tickerItems.map((cert, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 flex items-center justify-center min-w-[220px] sm:min-w-[250px] h-24 bg-white rounded-xl p-4 shadow-sm hover:scale-105 transition-transform duration-300"
            >
              <img 
                src={cert.src} 
                alt={cert.name} 
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'block';
                  }
                }}
              />
              <span className="hidden text-brand-orange font-bold text-base tracking-wider uppercase text-center">
                {cert.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}