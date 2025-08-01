import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Chrome, ArrowLeft, UserCheck } from 'lucide-react';
import { apiService } from '../services/api';

interface LoginProps {
  onNavigate: (page: string) => void;
  onLogin?: (role: string, name: string) => void;
}

const Login = ({ onNavigate, onLogin }: LoginProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) error = 'Please enter a valid email';
        break;
      case 'password':
        if (value.length < 1) error = 'Password is required';
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    try {
      await apiService.login({
        email: formData.email,
        password: formData.password,
      });

      // Get user data after successful login
      const userData = await apiService.getCurrentUser();
      console.log('Logged in user:', userData);

      onNavigate('dashboard');

    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };



  if (loginSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 text-center max-w-md w-full">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Successful!</h2>
            <p className="text-gray-600">
              Welcome back, User!
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Abstract shapes matching landing page */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-emerald-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-10 h-10 bg-teal-200 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-16 w-14 h-14 bg-green-300 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-60 left-1/4 w-8 h-8 bg-emerald-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-80 right-1/3 w-12 h-12 bg-teal-300 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '1.5s' }}></div>

        {/* Geometric shapes */}
        <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-green-200 transform rotate-45 opacity-20 animate-spin" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-emerald-200 transform rotate-45 opacity-25 animate-spin" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
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
              Welcome Back to Your Health Plan!
            </h1>
            <p className="text-gray-600 text-sm">
              Continue your journey to better health and nutrition
            </p>
          </div>


          {/* Social Login */}
          <div className="mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 flex items-center justify-center space-x-3 hover:border-green-300 hover:bg-green-50 transition-all duration-300 transform hover:scale-[1.02] shadow-sm hover:shadow-md group"
            >
              <Chrome className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium text-gray-700">
                1-Click Login with Google
              </span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or login with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 animate-slideDown">
                <p className="text-red-600 text-sm font-medium">{errors.general}</p>
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-200" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl transition-all duration-300 ${focusedField === 'email'
                    ? 'border-green-500 ring-4 ring-green-100 shadow-lg'
                    : errors.email
                      ? 'border-red-300'
                      : 'border-gray-200 hover:border-gray-300'
                    } focus:outline-none bg-white/50 backdrop-blur-sm`}
                  placeholder="Email Address"
                  required
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 animate-slideDown">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-200" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl transition-all duration-300 ${focusedField === 'password'
                    ? 'border-green-500 ring-4 ring-green-100 shadow-lg'
                    : errors.password
                      ? 'border-red-300'
                      : 'border-gray-200 hover:border-gray-300'
                    } focus:outline-none bg-white/50 backdrop-blur-sm`}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 animate-slideDown">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700 hover:underline transition-all duration-200 font-medium"
              >
                Forgot Password?
              </a>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {loginError}
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
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-gray-600 text-sm">
              New here?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="font-bold text-green-600 hover:text-green-700 transition-colors duration-200"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Additional Features Info */}
        <div className="mt-6 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-xs text-gray-600 mb-2">
              🔒 Secure Login Features
            </p>
            <div className="flex justify-center space-x-4 text-xs text-gray-500">
              <span>• Face ID Support</span>
              <span>• Touch ID</span>
              <span>• 2FA Ready</span>
            </div>
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

export default Login;