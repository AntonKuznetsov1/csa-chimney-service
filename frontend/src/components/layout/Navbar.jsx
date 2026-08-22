import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import logoImage from '../../assets/images/logo.jpeg';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-brand-black font-medium">
            <a href="#services" className="hover:text-brand-orange transition-colors">Services</a>
            <Link to="/blog" className="hover:text-brand-orange transition-colors">Blog</Link>
            <a href="#contact" className="hover:text-brand-orange transition-colors">Contact</a>
            <Link to="/book">
              <Button variant="primary">Book Appointment</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-brand-black hover:text-brand-orange transition-colors focus:outline-none"
            >
              {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl pb-6 pt-2 px-4 flex flex-col space-y-4">
          <a href="#services" onClick={() => setIsOpen(false)} className="px-4 py-2 font-medium text-brand-black hover:text-brand-orange hover:bg-gray-50 rounded-lg">Services</a>
          <Link to="/blog" onClick={() => setIsOpen(false)} className="px-4 py-2 font-medium text-brand-black hover:text-brand-orange hover:bg-gray-50 rounded-lg">Blog</Link>
          <a href="#contact" onClick={() => setIsOpen(false)} className="px-4 py-2 font-medium text-brand-black hover:text-brand-orange hover:bg-gray-50 rounded-lg">Contact</a>
          <div className="pt-2 px-4">
            <Link to="/book" onClick={() => setIsOpen(false)} className="w-full flex">
              <Button variant="primary" className="w-full">Book Appointment</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}