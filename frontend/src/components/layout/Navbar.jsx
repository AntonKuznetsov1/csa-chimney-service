import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import logoImage from '../../assets/images/logo.jpeg';

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <Link to="/" className="flex-shrink-0 flex items-center gap-3">
            <img 
              src={logoImage}
              alt="CSA Chimney Service Logo" 
              className="h-16 w-auto object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
            <span className="text-2xl font-bold text-brand-black uppercase tracking-tight">
              CSA <span className="text-brand-orange">Chimney</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8 text-brand-black font-medium">
            <a href="#services" className="hover:text-brand-orange transition-colors">Services</a>
            <a href="#contact" className="hover:text-brand-orange transition-colors">Contact</a>
            <Link to="/blog" className="hover:text-brand-orange transition-colors">Blog</Link>
            <Link to="/book">
              <Button variant="primary">Book Appointment</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}