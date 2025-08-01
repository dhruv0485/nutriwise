import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Video, Phone, MapPin, Plus, CheckCircle, X, Star, 
  ArrowLeft, ArrowRight, DollarSign, CalendarDays, User, Settings,
  Loader, AlertCircle, ChevronRight, CreditCard, Shield, Clock3
} from 'lucide-react';
import { consultationApi } from '../services/consultationApi';

interface Dietitian {
  _id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  bio: string;
  profile_image?: string;
  hourly_rate: number;
  available_slots: Array<{
    date: string;
    time: string;
    is_available: boolean;
  }>;
}

interface Booking {
  id: string;
  booking_id: number;
  patient_user_id: number;
  dietitian: {
    name: string;
    specialization: string;
    profile_image?: string;
  };
  consultation_type: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  notes: string;
  status: string;
  meeting_link?: string;
  created_at: string;
  price?: number;
}

interface BookingData {
  dietitian_id: string;
  consultation_type: string;
  appointment_date: string;
  appointment_time: string;
  duration: number;
  notes: string;
}

interface ConsultationsProps {
  onNavigate: (page: string) => void;
  userName: string;
}

const Consultations: React.FC<ConsultationsProps> = ({ onNavigate, userName }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'book'>('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDietitian, setSelectedDietitian] = useState<Dietitian | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dietitians, setDietitians] = useState<Dietitian[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Fetch data on component mount
  useEffect(() => {
    fetchBookings();
    fetchDietitians();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await consultationApi.getMyBookings();
      setBookings(response.data);
    } catch (err: any) {
      setError('Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDietitians = async () => {
    try {
      const response = await consultationApi.getDietitians();
      setDietitians(response.data);
    } catch (err: any) {
      setError('Failed to fetch dietitians');
      console.error('Error fetching dietitians:', err);
    }
  };

  const handleBookConsultation = async () => {
    if (!selectedDietitian || !selectedMethod || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const bookingData: BookingData = {
        dietitian_id: selectedDietitian._id,
        consultation_type: selectedMethod,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        duration: 60,
        notes: notes
      };

      await consultationApi.bookConsultation(bookingData);
      
      // Reset form and close modal
      resetBookingForm();
      setShowBookingModal(false);
      
      // Refresh bookings
      await fetchBookings();
      
      // Show success (you can replace this with a proper toast/notification)
      alert('Consultation booked successfully!');
    } catch (err: any) {
      setError('Failed to book consultation');
      console.error('Error booking consultation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setLoading(true);
      await consultationApi.cancelBooking(bookingId);
      await fetchBookings();
      alert('Booking cancelled successfully!');
    } catch (err: any) {
      setError('Failed to cancel booking');
      console.error('Error cancelling booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetBookingForm = () => {
    setBookingStep(1);
    setSelectedDietitian(null);
    setSelectedMethod('');
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
  };

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'video_call': return <Video className="w-4 h-4" />;
      case 'phone_call': return <Phone className="w-4 h-4" />;
      case 'in_person': return <MapPin className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const getConsultationLabel = (type: string) => {
    switch (type) {
      case 'video_call': return 'Video Call';
      case 'phone_call': return 'Phone Call';
      case 'in_person': return 'In Person';
      default: return 'Video Call';
    }
  };

  const getConsultationPrice = (type: string) => {
    switch (type) {
      case 'video_call': return 1500;
      case 'phone_call': return 1200;
      case 'in_person': return 2000;
      default: return 1500;
    }
  };

  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'scheduled' && 
    new Date(`${booking.appointment_date} ${booking.appointment_time}`) > new Date()
  );

  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || 
    (booking.status === 'scheduled' && new Date(`${booking.appointment_date} ${booking.appointment_time}`) <= new Date())
  );

  // Calendar view helpers
  const getCurrentMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    
    return dates;
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.appointment_date === dateStr);
  };

  const renderCalendarView = () => {
    const dates = getCurrentMonthDates();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Calendar View</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                viewMode === 'calendar' 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
          
          {dates.map((date, index) => {
            const dayBookings = getBookingsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isPast = date < new Date();
            
            return (
              <div
                key={index}
                className={`p-2 min-h-[80px] border border-gray-100 ${
                  isToday ? 'bg-green-50 border-green-200' : ''
                } ${isPast ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className={`text-sm font-medium ${
                  isToday ? 'text-green-600' : isPast ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
                {dayBookings.map((booking, bookingIndex) => (
                  <div
                    key={bookingIndex}
                    className="mt-1 p-1 bg-blue-100 rounded text-xs text-blue-800 truncate"
                    title={`${booking.dietitian.name} - ${booking.appointment_time}`}
                  >
                    {booking.dietitian.name}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBookingStep = () => {
    switch (bookingStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Choose a Dietitian</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div
                className="p-4 border border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg cursor-pointer transition-all duration-300"
                onClick={() => setSelectedDietitian({
                  _id: '507f1f77bcf86cd799439011',
                  name: 'Dr. Priya Singh',
                  specialization: 'Clinical Nutritionist & Dietitian',
                  experience: 8,
                  rating: 4.8,
                  bio: 'Specialized in weight management, diabetes care, and sports nutrition. Certified clinical nutritionist with expertise in personalized diet plans.',
                  profile_image: 'https://images.pexels.com/photos/3376790/photo-1582750433449-648ed127bb54?auto=compress&cs=tinysrgb&w=400',
                  hourly_rate: 1500,
                  available_slots: []
                })}
              >
                <div className="flex items-start space-x-3">
                  <img
                    src="https://images.pexels.com/photos/3376790/photo-1582750433449-648ed127bb54?auto=compress&cs=tinysrgb&w=400"
                    alt="Dr. Priya Singh"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Dr. Priya Singh</h4>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-green-600">₹1500/hr</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Clinical Nutritionist & Dietitian</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.8</span>
                      </div>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-gray-600">8 years exp</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Specialized in weight management, diabetes care, and sports nutrition. Certified clinical nutritionist with expertise in personalized diet plans.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Choose your preferred consultation method</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'video_call', label: 'Video Call', icon: Video, desc: 'Face-to-face consultation via video', price: 1500 },
                { id: 'phone_call', label: 'Phone Call', icon: Phone, desc: 'Voice consultation via phone', price: 1200 },
                { id: 'in_person', label: 'In Person', icon: MapPin, desc: 'Meet at the clinic', price: 2000 }
              ].map((method) => (
                <div
                  key={method.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
                    selectedMethod === method.id
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedMethod === method.id 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <method.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{method.label}</h4>
                        <p className="text-sm text-gray-600">{method.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">₹{method.price}</div>
                      <div className="text-xs text-gray-500">per session</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select your preferred date and time</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Any specific concerns or requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        );

      case 4:
        const totalPrice = selectedMethod ? getConsultationPrice(selectedMethod) : 0;
        
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Please review your appointment details</h3>
            <div className="bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedDietitian?.profile_image || '/api/placeholder/50/50'}
                  alt={selectedDietitian?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{selectedDietitian?.name}</h4>
                  <p className="text-sm text-gray-600">{selectedDietitian?.specialization}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Method:</span>
                  <div className="flex items-center space-x-1 mt-1">
                    {getConsultationIcon(selectedMethod)}
                    <span>{getConsultationLabel(selectedMethod)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Date & Time:</span>
                  <p className="mt-1">{selectedDate} at {selectedTime}</p>
                </div>
              </div>
              {notes && (
                <div>
                  <span className="text-gray-600 text-sm">Notes:</span>
                  <p className="text-sm mt-1">{notes}</p>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="text-xl font-bold text-green-600">₹{totalPrice}</span>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800">We've sent a confirmation and calendar invite to your email.</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && !bookings.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-green-200 rounded-full animate-spin border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Loading Consultations</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <Loader className="animate-spin h-4 w-4 mr-3 text-green-600" />
              <span>📅 Fetching your appointments...</span>
            </div>
            <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <Loader className="animate-spin h-4 w-4 mr-3 text-green-600" />
              <span>👨‍⚕️ Loading dietitian profiles...</span>
            </div>
            <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <Loader className="animate-spin h-4 w-4 mr-3 text-green-600" />
              <span>📋 Preparing booking options...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white shadow-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-white hover:text-green-200 transition-colors bg-white/20 p-2 rounded-xl backdrop-blur-sm"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm inline-block mb-6">
              <Calendar className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Consultations</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">Manage your appointments with expert dietitians, {userName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation - Desktop Only */}
        <div className="hidden md:flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-xl border border-gray-100">
            <div className="flex space-x-2">
              {[
                { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
                { id: 'history', label: 'History', count: pastBookings.length },
                { id: 'book', label: 'Book New', count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                Upcoming Appointments
              </h2>
              <button
                className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center text-sm sm:text-base"
                onClick={() => setShowBookingModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Book New Session
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm ${
                      viewMode === 'calendar' 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Calendar View
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : viewMode === 'calendar' ? (
              renderCalendarView()
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-2xl inline-block mb-4">
                  <Calendar className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-600 mb-6">Book your first consultation to get started</p>
                <button
                  className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-lg transform hover:scale-105"
                  onClick={() => setShowBookingModal(true)}
                >
                  Book Now
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={booking.dietitian.profile_image || '/api/placeholder/60/60'}
                          alt={booking.dietitian.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-lg text-gray-900">{booking.dietitian.name}</h3>
                          <p className="text-gray-600">{booking.dietitian.specialization}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{booking.appointment_date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{booking.appointment_time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getConsultationIcon(booking.consultation_type)}
                              <span>{getConsultationLabel(booking.consultation_type)}</span>
                            </div>
                          </div>
                          {booking.notes && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Notes:</strong> {booking.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        {booking.meeting_link && (
                          <a
                            href={booking.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-300 text-sm shadow-lg"
                          >
                            Join Call
                          </a>
                        )}
                        <button
                          onClick={() => handleCancelBooking(booking.booking_id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 text-sm shadow-lg"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              Consultation History
            </h2>
            {pastBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-2xl inline-block mb-4">
                  <Clock className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No consultation history</h3>
                <p className="text-gray-600">Your consultation history will appear here</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl opacity-75 hover:opacity-100 transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <img
                        src={booking.dietitian.profile_image || '/api/placeholder/60/60'}
                        alt={booking.dietitian.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-lg text-gray-900">{booking.dietitian.name}</h3>
                        <p className="text-gray-600">{booking.dietitian.specialization}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{booking.appointment_date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{booking.appointment_time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getConsultationIcon(booking.consultation_type)}
                            <span>{getConsultationLabel(booking.consultation_type)}</span>
                          </div>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Book New Consultation</h2>
                    <p className="text-gray-600">Step {bookingStep} of 4</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      resetBookingForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {renderBookingStep()}

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setBookingStep(Math.max(1, bookingStep - 1))}
                    className={`px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 ${
                      bookingStep === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    disabled={bookingStep === 1}
                  >
                    Previous
                  </button>

                  {bookingStep < 4 ? (
                    <button
                      onClick={() => setBookingStep(bookingStep + 1)}
                      className={`px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 ${
                        (bookingStep === 1 && !selectedDietitian) ||
                        (bookingStep === 2 && !selectedMethod) ||
                        (bookingStep === 3 && (!selectedDate || !selectedTime))
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 shadow-lg'
                      }`}
                      disabled={
                        (bookingStep === 1 && !selectedDietitian) ||
                        (bookingStep === 2 && !selectedMethod) ||
                        (bookingStep === 3 && (!selectedDate || !selectedTime))
                      }
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleBookConsultation}
                      className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-lg"
                      disabled={loading}
                    >
                      {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating macOS Style Bottom Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-2xl px-2 py-3">
          <div className="flex items-center space-x-1">
            {[
              { id: 'upcoming', icon: Calendar },
              { id: 'history', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-green-600 bg-green-50 shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`h-6 w-6 ${
                  activeTab === tab.id ? 'text-green-600' : 'text-gray-500'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consultations;
