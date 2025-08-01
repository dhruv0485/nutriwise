import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Bell, Globe,
  Edit3, Save, X, Plus, Trash2, Heart, Activity, AlertTriangle,
  Stethoscope, Pill, FileText, ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';
import profileService from '../services/profileService';
import type { 
  UserProfile, 
  HealthCondition, 
  DiseaseHistory, 
  HealthConditionRequest, 
  DiseaseHistoryRequest 
} from '../services/profileService';

interface ProfileSettingsProps {
  onNavigate: (page: string) => void;
  userName: string;
}

const ProfileSettings = ({ onNavigate, userName }: ProfileSettingsProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['personal']));
  
  // Health condition form state
  const [showHealthConditionForm, setShowHealthConditionForm] = useState(false);
  const [editingHealthCondition, setEditingHealthCondition] = useState<HealthCondition | null>(null);
  const [healthConditionForm, setHealthConditionForm] = useState<HealthConditionRequest>({
    condition_name: '',
    diagnosed_date: '',
    severity: '',
    medications: [],
    notes: '',
    is_chronic: false
  });

  // Disease history form state
  const [showDiseaseHistoryForm, setShowDiseaseHistoryForm] = useState(false);
  const [editingDiseaseHistory, setEditingDiseaseHistory] = useState<DiseaseHistory | null>(null);
  const [diseaseHistoryForm, setDiseaseHistoryForm] = useState<DiseaseHistoryRequest>({
    disease_name: '',
    onset_date: '',
    recovery_date: '',
    treatment_received: '',
    complications: [],
    family_history: false,
    notes: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const profile = await profileService.getCurrentUserProfile();
      setUserProfile(profile);
      setError(null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Health Condition handlers
  const handleAddHealthCondition = () => {
    setHealthConditionForm({
      condition_name: '',
      diagnosed_date: '',
      severity: '',
      medications: [],
      notes: '',
      is_chronic: false
    });
    setEditingHealthCondition(null);
    setShowHealthConditionForm(true);
  };

  const handleEditHealthCondition = (condition: HealthCondition) => {
    setHealthConditionForm({
      condition_name: condition.condition_name,
      diagnosed_date: condition.diagnosed_date || '',
      severity: condition.severity || '',
      medications: condition.medications || [],
      notes: condition.notes || '',
      is_chronic: condition.is_chronic
    });
    setEditingHealthCondition(condition);
    setShowHealthConditionForm(true);
  };

  const handleSaveHealthCondition = async () => {
    try {
      if (editingHealthCondition) {
        await profileService.updateHealthCondition(editingHealthCondition.id, healthConditionForm);
      } else {
        await profileService.addHealthCondition(healthConditionForm);
      }
      setShowHealthConditionForm(false);
      await fetchUserProfile();
    } catch (error) {
      console.error('Error saving health condition:', error);
      setError('Failed to save health condition');
    }
  };

  const handleDeleteHealthCondition = async (conditionId: string) => {
    if (window.confirm('Are you sure you want to delete this health condition?')) {
      try {
        await profileService.deleteHealthCondition(conditionId);
        await fetchUserProfile();
      } catch (error) {
        console.error('Error deleting health condition:', error);
        setError('Failed to delete health condition');
      }
    }
  };

  // Disease History handlers
  const handleAddDiseaseHistory = () => {
    setDiseaseHistoryForm({
      disease_name: '',
      onset_date: '',
      recovery_date: '',
      treatment_received: '',
      complications: [],
      family_history: false,
      notes: ''
    });
    setEditingDiseaseHistory(null);
    setShowDiseaseHistoryForm(true);
  };

  const handleEditDiseaseHistory = (disease: DiseaseHistory) => {
    setDiseaseHistoryForm({
      disease_name: disease.disease_name,
      onset_date: disease.onset_date || '',
      recovery_date: disease.recovery_date || '',
      treatment_received: disease.treatment_received || '',
      complications: disease.complications || [],
      family_history: disease.family_history,
      notes: disease.notes || ''
    });
    setEditingDiseaseHistory(disease);
    setShowDiseaseHistoryForm(true);
  };

  const handleSaveDiseaseHistory = async () => {
    try {
      if (editingDiseaseHistory) {
        await profileService.updateDiseaseHistory(editingDiseaseHistory.id, diseaseHistoryForm);
      } else {
        await profileService.addDiseaseHistory(diseaseHistoryForm);
      }
      setShowDiseaseHistoryForm(false);
      await fetchUserProfile();
    } catch (error) {
      console.error('Error saving disease history:', error);
      setError('Failed to save disease history');
    }
  };

  const handleDeleteDiseaseHistory = async (diseaseId: string) => {
    if (window.confirm('Are you sure you want to delete this disease history?')) {
      try {
        await profileService.deleteDiseaseHistory(diseaseId);
        await fetchUserProfile();
      } catch (error) {
        console.error('Error deleting disease history:', error);
        setError('Failed to delete disease history');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUserProfile}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Back to Dashboard Button */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 text-white/90 hover:text-white transition-all duration-300 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mr-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold">Profile & Settings</h1>
            </div>
            <p className="text-xl lg:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
              Manage your account and health information
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">User ID</div>
                <div className="text-green-100">{userProfile.user_id}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">Member Since</div>
                <div className="text-green-100">{new Date(userProfile.created_at).getFullYear()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6 sticky top-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{userProfile.full_name}</h2>
                <p className="text-gray-600 mb-2">{userProfile.email}</p>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  userProfile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {userProfile.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Phone className="h-4 w-4 mr-3 text-green-600" />
                  <span>{userProfile.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <MapPin className="h-4 w-4 mr-3 text-green-600" />
                  <span>{userProfile.city}, {userProfile.state}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="h-4 w-4 mr-3 text-green-600" />
                  <span>{new Date(userProfile.date_of_birth).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Shield className="h-4 w-4 mr-3 text-green-600" />
                  <span className="capitalize">{userProfile.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div 
                className="p-6 border-b border-gray-100/50 cursor-pointer bg-gradient-to-r from-gray-50 to-green-50"
                onClick={() => toggleSection('personal')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  {expandedSections.has('personal') ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {expandedSections.has('personal') && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                        <span className="text-gray-900 font-medium">{userProfile.full_name}</span>
                        <Edit3 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-green-600 transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200/50">
                        <span className="text-gray-900 font-medium">{userProfile.email}</span>
                        <Mail className="h-4 w-4 text-green-600" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                        <span className="text-gray-900 font-medium">{userProfile.phone}</span>
                        <Edit3 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-green-600 transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200/50">
                        <span className="text-gray-900 font-medium">
                          {new Date(userProfile.date_of_birth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                        <span className="text-gray-900 font-medium">{userProfile.city}</span>
                        <Edit3 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-green-600 transition-colors" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300">
                        <span className="text-gray-900 font-medium">{userProfile.state}</span>
                        <Edit3 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-green-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Health Conditions */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div 
                className="p-6 border-b border-gray-100/50 cursor-pointer bg-gradient-to-r from-gray-50 to-green-50"
                onClick={() => toggleSection('health')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-red-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Health Conditions</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddHealthCondition();
                      }}
                      className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-4 py-2 rounded-xl text-sm hover:from-green-700 hover:to-emerald-800 flex items-center shadow-lg transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                    {expandedSections.has('health') ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedSections.has('health') && (
                <div className="p-6">
                  {userProfile.health_profile?.health_conditions?.length > 0 ? (
                    <div className="space-y-4">
                      {userProfile.health_profile.health_conditions.map((condition) => (
                        <div key={condition.id} className="bg-gradient-to-r from-gray-50 to-green-50 border border-gray-200/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="font-semibold text-gray-900">{condition.condition_name}</h4>
                                {condition.is_chronic && (
                                  <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                    Chronic
                                  </span>
                                )}
                                {condition.severity && (
                                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                                    condition.severity === 'Severe' ? 'bg-red-100 text-red-800' :
                                    condition.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {condition.severity}
                                  </span>
                                )}
                              </div>
                              
                              {condition.diagnosed_date && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Diagnosed:</strong> {new Date(condition.diagnosed_date).toLocaleDateString()}
                                </p>
                              )}
                              
                              {condition.medications && condition.medications.length > 0 && (
                                <p className="text-sm text-gray-600 mb-1">
                                  <strong>Medications:</strong> {condition.medications.join(', ')}
                                </p>
                              )}
                              
                              {condition.notes && (
                                <p className="text-sm text-gray-600">
                                  <strong>Notes:</strong> {condition.notes}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditHealthCondition(condition)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteHealthCondition(condition.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No health conditions recorded</p>
                      <button
                        onClick={handleAddHealthCondition}
                        className="mt-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-emerald-800 shadow-lg transition-all duration-300"
                      >
                        Add First Condition
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Disease History */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div 
                className="p-6 border-b border-gray-100/50 cursor-pointer bg-gradient-to-r from-gray-50 to-green-50"
                onClick={() => toggleSection('disease')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-purple-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Disease History</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddDiseaseHistory();
                      }}
                      className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-4 py-2 rounded-xl text-sm hover:from-purple-700 hover:to-indigo-800 flex items-center shadow-lg transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                    {expandedSections.has('disease') ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedSections.has('disease') && (
                <div className="p-6">
                  {userProfile.health_profile?.disease_history?.length > 0 ? (
                    <div className="space-y-4">
                      {userProfile.health_profile.disease_history.map((disease) => (
                        <div key={disease.id} className="bg-gradient-to-r from-gray-50 to-green-50 border border-gray-200/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="font-semibold text-gray-900">{disease.disease_name}</h4>
                                {disease.family_history && (
                                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    Family History
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                {disease.onset_date && (
                                  <p><strong>Onset:</strong> {new Date(disease.onset_date).toLocaleDateString()}</p>
                                )}
                                {disease.recovery_date && (
                                  <p><strong>Recovery:</strong> {new Date(disease.recovery_date).toLocaleDateString()}</p>
                                )}
                              </div>
                              
                              {disease.treatment_received && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Treatment:</strong> {disease.treatment_received}
                                </p>
                              )}
                              
                              {disease.complications && disease.complications.length > 0 && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Complications:</strong> {disease.complications.join(', ')}
                                </p>
                              )}
                              
                              {disease.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Notes:</strong> {disease.notes}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditDiseaseHistory(disease)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDiseaseHistory(disease.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No disease history recorded</p>
                      <button
                        onClick={handleAddDiseaseHistory}
                        className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-2 rounded-xl hover:from-purple-700 hover:to-indigo-800 shadow-lg transition-all duration-300"
                      >
                        Add History Entry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Health Condition Modal */}
      {showHealthConditionForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingHealthCondition ? 'Edit Health Condition' : 'Add Health Condition'}
              </h3>
              <button
                onClick={() => setShowHealthConditionForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition Name</label>
                <input
                  type="text"
                  value={healthConditionForm.condition_name}
                  onChange={(e) => setHealthConditionForm(prev => ({ 
                    ...prev, 
                    condition_name: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  placeholder="e.g., Diabetes Type 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosed Date</label>
                <input
                  type="date"
                  value={healthConditionForm.diagnosed_date}
                  onChange={(e) => setHealthConditionForm(prev => ({ 
                    ...prev, 
                    diagnosed_date: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={healthConditionForm.severity}
                  onChange={(e) => setHealthConditionForm(prev => ({ 
                    ...prev, 
                    severity: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                >
                  <option value="">Select severity</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={healthConditionForm.notes}
                  onChange={(e) => setHealthConditionForm(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  rows={3}
                  placeholder="Additional notes about this condition..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_chronic"
                  checked={healthConditionForm.is_chronic}
                  onChange={(e) => setHealthConditionForm(prev => ({ 
                    ...prev, 
                    is_chronic: e.target.checked 
                  }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="is_chronic" className="ml-2 text-sm text-gray-700">
                  This is a chronic condition
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowHealthConditionForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHealthCondition}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 shadow-lg transition-all duration-300"
              >
                {editingHealthCondition ? 'Update' : 'Add'} Condition
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disease History Modal */}
      {showDiseaseHistoryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDiseaseHistory ? 'Edit Disease History' : 'Add Disease History'}
              </h3>
              <button
                onClick={() => setShowDiseaseHistoryForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disease Name</label>
                <input
                  type="text"
                  value={diseaseHistoryForm.disease_name}
                  onChange={(e) => setDiseaseHistoryForm(prev => ({ 
                    ...prev, 
                    disease_name: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  placeholder="e.g., COVID-19"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Onset Date</label>
                  <input
                    type="date"
                    value={diseaseHistoryForm.onset_date}
                    onChange={(e) => setDiseaseHistoryForm(prev => ({ 
                      ...prev, 
                      onset_date: e.target.value 
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Date</label>
                  <input
                    type="date"
                    value={diseaseHistoryForm.recovery_date}
                    onChange={(e) => setDiseaseHistoryForm(prev => ({ 
                      ...prev, 
                      recovery_date: e.target.value 
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Received</label>
                <input
                  type="text"
                  value={diseaseHistoryForm.treatment_received}
                  onChange={(e) => setDiseaseHistoryForm(prev => ({ 
                    ...prev, 
                    treatment_received: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  placeholder="Treatment details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={diseaseHistoryForm.notes}
                  onChange={(e) => setDiseaseHistoryForm(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="family_history"
                  checked={diseaseHistoryForm.family_history}
                  onChange={(e) => setDiseaseHistoryForm(prev => ({ 
                    ...prev, 
                    family_history: e.target.checked 
                  }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="family_history" className="ml-2 text-sm text-gray-700">
                  Family history of this disease
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDiseaseHistoryForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDiseaseHistory}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl hover:from-purple-700 hover:to-indigo-800 shadow-lg transition-all duration-300"
              >
                {editingDiseaseHistory ? 'Update' : 'Add'} History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
