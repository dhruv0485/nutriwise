import React from 'react';
import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import HowItWorks from './components/HowItWorks';
import ConnectWithDietician from './components/ConnectWithDietician';
import ContactForm from './components/ContactForm';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AIDietPlan from './components/AIDietPlan';
import GoalTracker from './components/GoalTracker';
import Consultations from './components/Consultations';
import EducationHub from './components/EducationHub';
import ProfileSettings from './components/ProfileSettings';
import NutritionChatbot from './components/NutritionChatbot';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  const renderPage = () => {
    switch (currentPage) {
      case 'register':
        return <Register onNavigate={setCurrentPage} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} onLogin={(role, name) => {
          setUserRole(role);
          setUserName(name);
          if (role === 'patient') {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage('home'); // For dietician, redirect to home for now
          }
        }} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} userName={userName} />;
      case 'ai-diet-plan':
        return <AIDietPlan onNavigate={setCurrentPage} userName={userName} />;
      case 'goal-tracker':
        return <GoalTracker onNavigate={setCurrentPage} userName={userName} />;
      case 'consultations':
        return <Consultations onNavigate={setCurrentPage} userName={userName} />;
      case 'education-hub':
        return <EducationHub onNavigate={setCurrentPage} userName={userName} />;
      case 'profile-settings':
        return <ProfileSettings onNavigate={setCurrentPage} userName={userName} />;
      case 'chatbot':
        return <NutritionChatbot onNavigate={setCurrentPage} />;
      default:
        return (
          <>
            <Navbar onNavigate={setCurrentPage} />
            <HeroCarousel onNavigate={setCurrentPage} />
            <HowItWorks />
            <ConnectWithDietician />
            <ContactForm />
            <Reviews />
            <Footer />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
    </div>
  );
}

export default App;