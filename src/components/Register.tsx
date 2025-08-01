import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Calendar, MapPin, Mail, Phone, Lock, Check, X, Apple, Chrome, ArrowLeft } from 'lucide-react';
import { apiService, RegisterData } from '../services/api';
interface RegisterProps {
  onNavigate: (page: string) => void;
}

const Register = ({ onNavigate }: RegisterProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    city: '',
    state: '',
    email: '',
    phone: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [validFields, setValidFields] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (value.length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = 'Please enter a valid email';
        break;
      case 'phone':
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        if (!phoneRegex.test(value)) error = 'Please enter a valid phone number';
        break;
      case 'password':
        if (value.length < 8) error = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) error = 'Password must contain uppercase, lowercase, and number';
        break;
      case 'dateOfBirth':
        if (!value) error = 'Date of birth is required';
        break;
      case 'city':
        if (value.length < 2) error = 'City is required';
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));

    if (!error && value) {
      setValidFields(prev => [...prev.filter(f => f !== name), name]);
    } else {
      setValidFields(prev => prev.filter(f => f !== name));
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    // Validate all fields before submission
    const fieldsToValidate = ['fullName', 'dateOfBirth', 'city', 'state', 'email', 'phone', 'password'];
    let hasErrors = false;

    fieldsToValidate.forEach(field => {
      validateField(field, formData[field as keyof typeof formData]);
      if (errors[field]) hasErrors = true;
    });

    if (hasErrors || !formData.state) {
      setSubmitError('Please fix all errors before submitting');
      setIsSubmitting(false);
      return;
    }

    try {
      const registerData: RegisterData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        city: formData.city,
        state: formData.state,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };
      await apiService.register(registerData);
      setSubmitSuccess(true);

      // Redirect to login after successful registration
      setTimeout(() => {
        onNavigate('login');
      }, 2000);

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500';
    if (passwordStrength < 50) return 'bg-orange-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl animate-bounce opacity-20">🍎</div>
        <div className="absolute top-40 right-20 text-3xl animate-pulse opacity-20">🥦</div>
        <div className="absolute bottom-32 left-32 text-3xl animate-bounce opacity-20" style={{ animationDelay: '1s' }}>🥕</div>
        <div className="absolute bottom-20 right-16 text-4xl animate-pulse opacity-20" style={{ animationDelay: '2s' }}>🍊</div>
        <div className="absolute top-60 left-1/4 text-2xl animate-bounce opacity-20" style={{ animationDelay: '0.5s' }}>🥬</div>
        <div className="absolute top-80 right-1/3 text-3xl animate-pulse opacity-20" style={{ animationDelay: '1.5s' }}>🍇</div>
      </div>

      <div className={`w-full max-w-md transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-all duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Start Your Health Journey in 30 Seconds
            </h1>
            <p className="text-gray-600 text-sm">
              Join thousands of users who transformed their lives with NutriWise
            </p>
          </div>

          {/* Social Login */}
          <div className="mb-6">
            <button className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 flex items-center justify-center space-x-3 hover:border-green-300 hover:bg-green-50 transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md">
              <Chrome className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-700">Quick Register with Google</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or register with email</span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="relative">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl transition-all duration-300 ${focusedField === 'fullName'
                    ? 'border-green-500 ring-4 ring-green-100'
                    : validFields.includes('fullName')
                      ? 'border-green-300'
                      : errors.fullName
                        ? 'border-red-300'
                        : 'border-gray-200'
                    } focus:outline-none bg-white/50`}
                  placeholder="Full Name"
                />
                {validFields.includes('fullName') && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 animate-pulse" />
                )}
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1 animate-slideDown">{errors.fullName}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="relative">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('dateOfBirth')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl transition-all duration-300 ${focusedField === 'dateOfBirth'
                    ? 'border-green-500 ring-4 ring-green-100'
                    : validFields.includes('dateOfBirth')
                      ? 'border-green-300'
                      : errors.dateOfBirth
                        ? 'border-red-300'
                        : 'border-gray-200'
                    } focus:outline-none bg-white/50`}
                />
                {validFields.includes('dateOfBirth') && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 animate-pulse" />
                )}
              </div>
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1 animate-slideDown">{errors.dateOfBirth}</p>
              )}
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl transition-all duration-300 ${focusedField === 'city'
                      ? 'border-green-500 ring-4 ring-green-100'
                      : validFields.includes('city')
                        ? 'border-green-300'
                        : errors.city
                          ? 'border-red-300'
                          : 'border-gray-200'
                      } focus:outline-none bg-white/50`}
                    placeholder="City"
                  />
                  {validFields.includes('city') && (
                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 animate-pulse" />
                  )}
                </div>
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1 animate-slideDown">{errors.city}</p>
                )}
              </div>

              <div className="relative">
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('state')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-3 py-3 border-2 rounded-xl transition-all duration-300 ${focusedField === 'state'
                    ? 'border-green-500 ring-4 ring-green-100'
                    : validFields.includes('state')
                      ? 'border-green-300'
                      : 'border-gray-200'
                    } focus:outline-none bg-white/50`}
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl transition-all duration-300 ${focusedField === 'email'
                    ? 'border-green-500 ring-4 ring-green-100'
                    : validFields.includes('email')
                      ? 'border-green-300'
                      : errors.email
                        ? 'border-red-300'
                        : 'border-gray-200'
                    } focus:outline-none bg-white/50`}
                  placeholder="Email Address"
                />
                {validFields.includes('email') && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 animate-pulse" />
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 animate-slideDown">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="relative">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl transition-all duration-300 ${focusedField === 'phone'
                    ? 'border-green-500 ring-4 ring-green-100'
                    : validFields.includes('phone')
                      ? 'border-green-300'
                      : errors.phone
                        ? 'border-red-300'
                        : 'border-gray-200'
                    } focus:outline-none bg-white/50`}
                  placeholder="+91 Phone Number"
                />
                {validFields.includes('phone') && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500 animate-pulse" />
                )}
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1 animate-slideDown">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl transition-all duration-300 ${focusedField === 'password'
                    ? 'border-green-500 ring-4 ring-green-100'
                    : validFields.includes('password')
                      ? 'border-green-300'
                      : errors.password
                        ? 'border-red-300'
                        : 'border-gray-200'
                    } focus:outline-none bg-white/50`}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Password Strength</span>
                    <span className={`text-xs font-medium ${passwordStrength < 50 ? 'text-red-500' : passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                      }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-xs mt-1 animate-slideDown">{errors.password}</p>
              )}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4">
                Registration successful! Redirecting to login...
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105'
                }`}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Already registered?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="font-bold text-green-600 hover:text-green-700 transition-colors duration-200"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Register;