import React, { useState, useEffect } from 'react';
import { Menu, X, Leaf } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
}

const Navbar = ({ onNavigate }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsOpen(false); // Close mobile menu after clicking
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-lg">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">NutriWise</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              Contact
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              Login
            </button>
            <button 
              onClick={() => onNavigate('register')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-full hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Register
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-sm rounded-lg mt-2">
            <button 
              onClick={() => scrollToSection('home')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              Contact
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              Login
            </button>
            <button 
              onClick={() => onNavigate('register')}
              className="w-full text-left bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;