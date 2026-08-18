import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import wettImage from '../../assets/images/WETT.jpeg';
import heartPatioImage from '../../assets/images/HeartAndPatioAssociation.png';
import nbcettImage from '../../assets/images/NBCETT.png';

const certs = [
  { name: 'WETT Certified', src: wettImage },
  { name: 'Heart & Patio Association', src: heartPatioImage },
  { name: 'NBCETT', src: nbcettImage },
];

export default function CertTicker() {
  const tickerItems = [...certs, ...certs, ...certs, ...certs];
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  return (
    <div className="relative w-full bg-brand-black py-10 overflow-hidden flex items-center border-y-4 border-brand-orange">
      {/* Full screen-edge fade gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 z-10 bg-gradient-to-r from-brand-black to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 z-10 bg-gradient-to-l from-brand-black to-transparent pointer-events-none"></div>

      <div className="w-full overflow-x-auto md:overflow-hidden touch-pan-x md:touch-auto">
        <motion.div
          className="flex min-w-max space-x-16 sm:space-x-20 items-center px-4 md:px-0"
          animate={isMobile ? false : { x: ["0%", "-50%"] }}
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