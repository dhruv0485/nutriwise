import React, { useState, useEffect } from 'react';
import { User, Bot, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.getAttribute('data-step') || '0');
            setVisibleSteps((prev) => [...prev, stepIndex]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const stepElements = document.querySelectorAll('[data-step]');
    stepElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: <User className="h-12 w-12" />,
      title: "Tell Us About You",
      description: "Share your health goals, dietary preferences, and lifestyle details",
      animation: "animate-bounce"
    },
    {
      icon: <Bot className="h-12 w-12" />,
      title: "Get Your AI Plan",
      description: "Our intelligent system creates a personalized nutrition plan just for you",
      animation: "animate-pulse"
    },
    {
      icon: <TrendingUp className="h-12 w-12" />,
      title: "Track & Improve",
      description: "Monitor your progress and get continuous plan optimizations",
      animation: "animate-bounce"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started with your personalized nutrition journey in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              data-step={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform ${
                visibleSteps.includes(index) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Step number */}
              <div className="absolute -top-4 -left-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`text-green-600 mb-6 ${visibleSteps.includes(index) ? step.animation : ''}`}>
                {step.icon}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>

              {/* Progress bar animation */}
              <div className="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`bg-gradient-to-r from-green-600 to-emerald-700 h-full rounded-full transition-all duration-1000 ${
                    visibleSteps.includes(index) ? 'w-full' : 'w-0'
                  }`}
                  style={{ transitionDelay: `${index * 200 + 500}ms` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Connecting arrows for desktop */}
        <div className="hidden md:block relative -mt-16">
          <div className="flex justify-center items-center space-x-32">
            <div className="w-16 h-0.5 bg-gradient-to-r from-green-600 to-emerald-700 opacity-30"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-600 to-teal-700 opacity-30"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;