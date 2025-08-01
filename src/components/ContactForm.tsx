import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MessageSquare, Send, CheckCircle, 
  MapPin, Clock, ArrowRight, Star, Heart, Award 
} from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [focusedField, setFocusedField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [visibleElements, setVisibleElements] = useState<number[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementIndex = parseInt(entry.target.getAttribute('data-element') || '0');
            setVisibleElements((prev) => [...prev, elementIndex]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-element]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('http://localhost:8000/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.detail || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visit Us",
      details: "123 Health Street, Wellness City, WC 12345",
      color: "text-green-600"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      color: "text-blue-600"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      details: "hello@nutriwise.com",
      color: "text-purple-600"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Business Hours",
      details: "Mon - Fri: 9AM - 6PM",
      color: "text-orange-600"
    }
  ];

  const stats = [
    { icon: <Star className="h-5 w-5" />, value: "4.9★", label: "Average Rating", color: "text-yellow-500" },
    { icon: <Heart className="h-5 w-5" />, value: "10K+", label: "Happy Users", color: "text-red-500" },
    { icon: <Award className="h-5 w-5" />, value: "95%", label: "Success Rate", color: "text-green-500" }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-green-50 relative overflow-hidden" id="contact">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-12 h-12 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-24 left-24 w-10 h-10 bg-purple-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-16 right-8 w-14 h-14 bg-orange-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-teal-300 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-emerald-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div 
            data-element={0}
            className={`inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full mb-4 shadow-sm transition-all duration-700 ${
              visibleElements.includes(0) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <MessageSquare className="h-4 w-4 text-green-600" />
            <span className="text-green-800 font-semibold text-sm">Get In Touch</span>
          </div>
          <h2 
            data-element={1}
            className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 leading-tight transition-all duration-700 ${
              visibleElements.includes(1) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            Let's Start Your Health Journey
          </h2>
          <p 
            data-element={2}
            className={`text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 transition-all duration-700 ${
              visibleElements.includes(2) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            Have questions about our services? Want to learn more about personalized nutrition plans? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  data-element={3 + index}
                  className={`bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-500 transform hover:scale-105 ${
                    visibleElements.includes(3 + index) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${info.color} p-2 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl`}>
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                      <p className="text-gray-600 text-sm">{info.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div 
              data-element={7}
              className={`bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white transition-all duration-700 ${
                visibleElements.includes(7) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              <h3 className="text-lg font-bold mb-4">Why Choose NutriWise?</h3>
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={stat.color}>{stat.icon}</div>
                      <span className="text-green-100 text-sm">{stat.label}</span>
                    </div>
                    <span className="font-bold text-lg">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div 
              data-element={8}
              className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6 sm:p-8 lg:p-10 transition-all duration-700 ${
                visibleElements.includes(8) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Name */}
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                          focusedField === 'name'
                            ? 'border-green-500 ring-4 ring-green-100 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        } focus:outline-none bg-white/50 backdrop-blur-sm`}
                        placeholder="Your Name"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                          focusedField === 'email'
                            ? 'border-green-500 ring-4 ring-green-100 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        } focus:outline-none bg-white/50 backdrop-blur-sm`}
                        placeholder="Your Email"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                          focusedField === 'phone'
                            ? 'border-green-500 ring-4 ring-green-100 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        } focus:outline-none bg-white/50 backdrop-blur-sm`}
                        placeholder="Your Phone"
                      />
                    </div>

                    {/* Subject */}
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('subject')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                          focusedField === 'subject'
                            ? 'border-green-500 ring-4 ring-green-100 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        } focus:outline-none bg-white/50 backdrop-blur-sm appearance-none`}
                        required
                      >
                        <option value="">Select Subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Nutrition Consultation">Nutrition Consultation</option>
                        <option value="Diet Plan Questions">Diet Plan Questions</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField('')}
                      rows={5}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 resize-none ${
                        focusedField === 'message'
                          ? 'border-green-500 ring-4 ring-green-100 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      } focus:outline-none bg-white/50 backdrop-blur-sm`}
                      placeholder="Tell us about your health goals, questions, or how we can help you..."
                      required
                    />
                  </div>

                  {/* Error Message */}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                      {submitError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send Message</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm; 