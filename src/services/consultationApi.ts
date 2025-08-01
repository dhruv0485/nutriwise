import axios from 'axios';

const API_BASE_URL = 'https://nutriwise-m0ob.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const consultationApi = {
  // Get available dietitians
  getDietitians: () => api.get('/consultations/dietitians'),
  
  // Book a consultation
  bookConsultation: (bookingData) => api.post('/consultations/book', bookingData),
  
  // Get user's bookings
  getMyBookings: () => api.get('/consultations/my-bookings'),
  
  // Cancel a booking
  cancelBooking: (bookingId) => api.put(`/consultations/cancel/${bookingId}`),
};
