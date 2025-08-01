import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, TrendingUp, Heart, Award } from 'lucide-react';

const Reviews = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  const reviews = [
    {
      name: "Priya Sharma",
      age: 28,
      location: "Mumbai",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "Lost 8kg in 2 months! The personalized plan was perfect for my PCOS condition. Dr. Sarah understood my lifestyle and created a plan that actually works.",
      result: "8kg weight loss",
      condition: "PCOS",
      timeframe: "2 months",
      beforeAfter: { before: "68kg", after: "60kg" }
    },
    {
      name: "Raj Patel",
      age: 42,
      location: "Delhi",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "I finally understand nutrition and my blood sugar levels are perfect! The diabetes-friendly plan is a lifesaver. My HbA1c dropped significantly.",
      result: "Blood sugar normalized",
      condition: "Diabetes",
      timeframe: "3 months",
      beforeAfter: { before: "HbA1c 8.2", after: "HbA1c 6.1" }
    },
    {
      name: "Anita Menon",
      age: 35,
      location: "Bangalore",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "The consultation was amazing! Dr. Sarah understood my busy lifestyle and created a practical plan. I've gained so much confidence.",
      result: "15kg weight loss",
      condition: "Busy Lifestyle",
      timeframe: "4 months",
      beforeAfter: { before: "78kg", after: "63kg" }
    },
    {
      name: "Vikram Singh",
      age: 29,
      location: "Pune",
      image: "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "Gained 5kg of muscle mass with their expert guidance! The nutrition plan was perfectly tailored for my fitness goals.",
      result: "5kg muscle gain",
      condition: "Fitness Goals",
      timeframe: "3 months",
      beforeAfter: { before: "65kg", after: "70kg" }
    },
    {
      name: "Meera Gupta",
      age: 31,
      location: "Chennai",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
      text: "My thyroid condition made weight loss seem impossible, but this program changed everything! My energy levels are through the roof.",
      result: "12kg weight loss",
      condition: "Thyroid",
      timeframe: "5 months",
      beforeAfter: { before: "72kg", after: "60kg" }
    }
  ];

  useEffect(() => {
    if (!isAutoPlay) return;
    
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [isAutoPlay, reviews.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardIndex = parseInt(entry.target.getAttribute('data-card') || '0');
            setVisibleCards((prev) => [...prev, cardIndex]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cardElements = document.querySelectorAll('[data-card]');
    cardElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
    setIsAutoPlay(false);
  };

  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsAutoPlay(false);
  };

  const stats = [
    { icon: <TrendingUp className="h-6 w-6" />, value: "10,000+", label: "Happy Users", color: "text-green-600" },
    { icon: <Heart className="h-6 w-6" />, value: "95%", label: "Success Rate", color: "text-red-500" },
    { icon: <Award className="h-6 w-6" />, value: "4.9★", label: "Average Rating", color: "text-yellow-500" }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-green-50 relative overflow-hidden">
      {/* Enhanced Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-12 h-12 bg-orange-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-24 left-24 w-10 h-10 bg-emerald-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-16 right-8 w-14 h-14 bg-teal-200 rounded-full opacity-20 animate-bounce"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-green-300 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-emerald-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 left-1/3 w-10 h-10 bg-teal-300 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full mb-4 shadow-sm">
            <Star className="h-4 w-4 text-green-600" />
            <span className="text-green-800 font-semibold text-sm">Success Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            What Our Users Say
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Real transformations from people who achieved their health goals with NutriWise
          </p>
        </div>

        {/* Main Review Carousel */}
        <div className="relative max-w-5xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="relative">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ease-in-out ${
                    index === currentReview 
                      ? 'opacity-100 transform translate-x-0' 
                      : index < currentReview 
                        ? 'opacity-0 transform -translate-x-full absolute inset-0'
                        : 'opacity-0 transform translate-x-full absolute inset-0'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]">
                    {/* User Profile Section */}
                    <div className="lg:w-2/5 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                      {/* Enhanced Background pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
                        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full -translate-x-8 -translate-y-8"></div>
                      </div>
                      
                      <div className="text-center relative z-10 w-full">
                        <div className="relative mb-4 sm:mb-6">
                          <img
                            src={review.image}
                            alt={review.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto border-4 border-white shadow-xl object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-lg">
                            <Star className="h-3 w-3 fill-yellow-600 text-yellow-600" />
                          </div>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">{review.name}</h3>
                        <p className="text-green-100 mb-1 text-xs sm:text-sm">{review.age} years old</p>
                        <p className="text-green-100 mb-3 sm:mb-4 text-xs sm:text-sm">{review.location}</p>
                        
                        <div className="flex justify-center mb-3 sm:mb-4">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400 mx-0.5" />
                          ))}
                        </div>

                        {/* Before/After Stats */}
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-center">
                            <div>
                              <p className="text-white/80 text-xs font-medium">Before</p>
                              <p className="text-white font-bold text-xs sm:text-sm">{review.beforeAfter.before}</p>
                            </div>
                            <div>
                              <p className="text-white/80 text-xs font-medium">After</p>
                              <p className="text-white font-bold text-xs sm:text-sm">{review.beforeAfter.after}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Content Section */}
                    <div className="lg:w-3/5 p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
                      <div className="mb-4 sm:mb-6">
                        <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-green-200 mb-3" />
                        <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed font-medium mb-4 sm:mb-6">
                          {review.text}
                        </p>
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <div className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-2 sm:px-3 py-1 rounded-full">
                            <span className="font-semibold text-xs">Result: </span>
                            <span className="text-xs">{review.result}</span>
                          </div>
                          <div className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-2 sm:px-3 py-1 rounded-full">
                            <span className="font-semibold text-xs">Condition: </span>
                            <span className="text-xs">{review.condition}</span>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full inline-block">
                          <span className="font-semibold text-xs">Timeframe: </span>
                          <span className="text-xs">{review.timeframe}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevReview}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
          </button>
          
          <button
            onClick={nextReview}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-10 backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
          </button>

          {/* Progress Indicators */}
          <div className="flex justify-center mt-4 sm:mt-6 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentReview(index);
                  setIsAutoPlay(false);
                }}
                className={`transition-all duration-300 rounded-full ${
                  index === currentReview 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 w-8 h-3' 
                    : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              data-card={index}
              className={`bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200/50 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 text-center ${
                visibleCards.includes(index) 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className={`${stat.color} mb-3 sm:mb-4 flex justify-center`}>
                <div className="p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl">
                  {stat.icon}
                </div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium text-sm sm:text-base">
                {stat.label}
              </div>
              
              {/* Animated progress bar */}
              <div className="mt-3 sm:mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className={`bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-1000 ${
                    visibleCards.includes(index) ? 'w-full' : 'w-0'
                  }`}
                  style={{ transitionDelay: `${index * 150 + 400}ms` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8 sm:mt-12 lg:mt-16">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 lg:mb-6">
                Ready to Start Your Transformation?
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-green-100 mb-4 sm:mb-6 lg:mb-8 max-w-2xl mx-auto px-4">
                Join thousands of satisfied users who have achieved their health goals with our expert guidance
              </p>
              <button className="bg-white/95 backdrop-blur-sm text-green-700 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:bg-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Your Journey Today
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;