import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Users, Zap } from 'lucide-react';

interface HeroCarouselProps {
  onNavigate: (page: string) => void;
}

const HeroCarousel = ({ onNavigate }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Your Personalized Diet Plan Awaits!",
      subtitle: "Get AI-powered nutrition recommendations tailored just for you",
      gradient: "from-green-600 to-emerald-700",
      backgroundImage: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920"
    },
    {
      title: "New Year, Healthier You – Book a Session Today!",
      subtitle: "Connect with certified dieticians for expert guidance",
      gradient: "from-emerald-600 to-teal-700",
      backgroundImage: "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=1920"
    },
    {
      title: "AI-Powered Nutrition – No Guesswork!",
      subtitle: "Smart recommendations based on your health goals and preferences",
      gradient: "from-teal-600 to-green-700",
      backgroundImage: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=1920"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Sliding Background Images */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-25"
              style={{ backgroundImage: `url(${slide.backgroundImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-transparent to-emerald-900/30" />
          </div>
        ))}
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/15 rounded-full backdrop-blur-sm animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 absolute'
              }`}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                {slide.title}
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-lg">
                {slide.subtitle}
              </p>
            </div>
          ))}
          <button 
            onClick={() => onNavigate('register')}
            className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2 backdrop-blur-sm border border-white/20"
          >
            <Play className="h-6 w-6" />
            <span>Get Started</span>
          </button>
        </div>

        {/* Slide indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-500 backdrop-blur-sm ${
                index === currentSlide 
                  ? 'bg-white w-8 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/70 border border-white/30'
              }`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      </div>
    </section>
  );
};

export default HeroCarousel;