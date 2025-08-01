import React, { useState, useEffect } from 'react';
import { User, Heart, Target, Calendar, Clock, Star, CheckCircle, Video, MapPin, FileText, Users, Shield, Headphones } from 'lucide-react';

const ConnectWithDietician = () => {
  const [selectedService, setSelectedService] = useState('consultation');
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    goal: '',
    healthConditions: [] as string[],
    preferredTime: ''
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const featureIndex = parseInt(entry.target.getAttribute('data-feature') || '0');
            setVisibleFeatures((prev) => [...prev, featureIndex]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const featureElements = document.querySelectorAll('[data-feature]');
    featureElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      id: 'consultation',
      title: 'Personal Consultation',
      description: 'One-on-one session with our expert dietician',
      price: '₹999',
      originalPrice: '₹1,499',
      duration: '45 minutes',
      icon: <User className="h-5 w-5" />,
      features: ['Personalized assessment', 'Custom meal plan', 'Follow-up support', 'Progress tracking']
    },
    {
      id: 'diet-plan',
      title: 'Custom Diet Plan',
      description: 'Comprehensive nutrition plan tailored for you',
      price: '₹1,299',
      originalPrice: '₹1,999',
      duration: 'Lifetime access',
      icon: <Heart className="h-5 w-5" />,
      features: ['Detailed meal plans', 'Recipe suggestions', 'Shopping lists', 'Nutritional analysis']
    }
  ];

  const features = [
    {
      icon: <Video className="h-6 w-6" />,
      title: 'Online & Offline Consultations',
      description: 'Choose between video calls or in-person meetings based on your preference',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Expert Certified Dieticians',
      description: 'Connect with qualified nutritionists with 5+ years of experience',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Personalized Diet Plans',
      description: 'Get customized meal plans based on your health goals and preferences',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Safe & Secure Platform',
      description: 'Your health data is protected with enterprise-grade security',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: '24/7 Support',
      description: 'Get continuous support and guidance throughout your health journey',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Easy Booking System',
      description: 'Simple and user-friendly booking process with flexible scheduling',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const healthConditions = [
    'Diabetes', 'PCOS', 'Thyroid', 'Hypertension', 'Heart Disease', 'Obesity', 'None'
  ];

  const timeSlots = [
    '9:00 AM - 10:00 AM', '11:00 AM - 12:00 PM', '2:00 PM - 3:00 PM', 
    '4:00 PM - 5:00 PM', '6:00 PM - 7:00 PM', '8:00 PM - 9:00 PM'
  ];

  const handleConditionChange = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter(c => c !== condition)
        : [...prev.healthConditions, condition]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full mb-4">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-green-800 font-semibold text-sm">Expert Guidance</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Connect with the Dietician
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get personalized nutrition guidance from certified dieticians to achieve your health goals
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Choose Our Service?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                data-feature={index}
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${
                  visibleFeatures.includes(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-lg inline-block mb-4`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectWithDietician;