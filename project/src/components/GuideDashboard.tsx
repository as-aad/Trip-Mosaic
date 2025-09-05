import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Clock, 
  DollarSign, 
  Languages, 
  Award, 
  Phone, 
  Mail, 
  Camera, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Plus, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw
} from 'lucide-react';

import { 
  createGuideProfile, 
  updateGuideProfile, 
  deleteGuideProfile, 
  getGuideByUser,
  getCurrentUser,
  signOut
} from '../services/api';


interface GuideProfile {
  id?: number;
  user_id: number;
  destination_id: number;
  bio: string;
  experience_years: number;
  languages: string;
  specialties?: string;
  hourly_rate: number;
  phone?: string;
  email?: string;
  profile_image?: string;
  certifications?: string;
  rating?: number;
  total_reviews?: number;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  destination?: any;
}

const GuideDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [guideProfile, setGuideProfile] = useState<GuideProfile | null>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(false);
  const [destinationsLoaded, setDestinationsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    user_id: 0,
    destination_id: 0,
    bio: '',
    experience_years: 0,
    languages: '',
    specialties: '',
    hourly_rate: 0,
    phone: '',
    email: '',
    profile_image: '',
    certifications: ''
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'guide') {
      setUser(currentUser);
    } else {
      window.location.href = '/signin';
    }
  }, []);

  // Separate useEffect for data loading after user is set
  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Only load destinations if not already loaded
      let destinationsData = destinations;
      if (!destinationsLoaded) {
        const destinationsResponse = await fetch('http://localhost:8000/destinations');
        if (destinationsResponse.ok) {
          destinationsData = await destinationsResponse.json();
          setDestinations(destinationsData);
          setDestinationsLoaded(true);
        } else {
          throw new Error('Failed to load destinations');
        }
      }

      // Load profile data
      const existingProfile = await getGuideByUser(user.id);
      if (existingProfile) {
        const completeProfile = {
          ...existingProfile,
          destination: destinationsData.find((dest: any) => dest.id === existingProfile.destination_id)
        };
        
        setGuideProfile(completeProfile);
        setIsCreating(false);
        setIsEditing(false);
      } else {
        setGuideProfile(null);
        setIsCreating(true);
        setIsEditing(false);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' || name === 'hourly_rate' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isCreating) {
        const newProfile = await createGuideProfile(formData);
        
        // Ensure we have a valid profile object
        if (newProfile && newProfile.id) {
          // Create a complete profile object with destination information
          const completeProfile = {
            ...newProfile,
            destination: destinations.find((dest: any) => dest.id === newProfile.destination_id)
          };
          
          setGuideProfile(completeProfile);
          setIsCreating(false);
          setIsEditing(false);
          setSuccess('Guide profile created successfully!');
          
          // Only reset form data for new profiles, not updates
          setFormData(prev => ({
            ...prev,
            user_id: newProfile.user_id,
            destination_id: newProfile.destination_id
          }));
        } else {
          setError('Profile created but received invalid response. Please refresh the page.');
        }
      } else {
        const updatedProfile = await updateGuideProfile(guideProfile!.id!, formData);
        
        // Create a complete profile object with destination information
        const completeUpdatedProfile = {
          ...updatedProfile,
          destination: destinations.find((dest: any) => dest.id === updatedProfile.destination_id)
        };

        setGuideProfile(completeUpdatedProfile);
        setIsEditing(false);
        setIsCreating(false);
        setSuccess('Guide profile updated successfully!');
        
        // Don't reset form data for updates - keep current form state
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setFormData({
      user_id: guideProfile!.user_id,
      destination_id: guideProfile!.destination_id,
      bio: guideProfile!.bio || '',
      experience_years: guideProfile!.experience_years || 0,
      languages: guideProfile!.languages || '',
      specialties: guideProfile!.specialties || '',
      hourly_rate: guideProfile!.hourly_rate || 0,
      phone: guideProfile!.phone || '',
      email: guideProfile!.email || '',
      profile_image: guideProfile!.profile_image || '',
      certifications: guideProfile!.certifications || ''
    });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData({
      user_id: guideProfile!.user_id,
      destination_id: guideProfile!.destination_id,
      bio: guideProfile!.bio || '',
      experience_years: guideProfile!.experience_years || 0,
      languages: guideProfile!.languages || '',
      specialties: guideProfile!.specialties || '',
      hourly_rate: guideProfile!.hourly_rate || 0,
      phone: guideProfile!.phone || '',
      email: guideProfile!.email || '',
      profile_image: guideProfile!.profile_image || '',
      certifications: guideProfile!.certifications || ''
    });
  };

  // Function to refresh profile data
  const refreshProfileData = async () => {
    if (user?.id) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        // Only refresh profile data, not destinations (they don't change often)
        const existingProfile = await getGuideByUser(user.id);
        if (existingProfile) {
          const completeProfile = {
            ...existingProfile,
            destination: destinations.find((dest: any) => dest.id === existingProfile.destination_id)
          };
          
          setGuideProfile(completeProfile);
          setIsCreating(false);
          setIsEditing(false);
        } else {
          setGuideProfile(null);
          setIsCreating(true);
          setIsEditing(false);
        }
      } catch (error) {
        setError('Failed to refresh profile data.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!guideProfile?.id) return;
    
    if (window.confirm('Are you sure you want to delete your guide profile? This action cannot be undone.')) {
      try {
        await deleteGuideProfile(guideProfile.id);
        setGuideProfile(null);
        setIsCreating(true);
        setIsEditing(false);
        setSuccess('Guide profile deleted successfully!');
      } catch (error: any) {
        setError(error.message || 'Failed to delete profile. Please try again.');
      }
    }
  };

  const handleSignOut = () => {
    signOut();
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading your guide dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
        {/* Header Skeleton */}
        <div className="bg-white/20 backdrop-blur-md shadow-2xl border border-white/30 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl animate-pulse"></div>
                <div>
                  <div className="w-48 h-8 bg-gray-300 rounded animate-pulse mb-2"></div>
                  <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-10 bg-gray-300 rounded-xl animate-pulse"></div>
                <div className="text-right">
                  <div className="w-32 h-4 bg-gray-300 rounded animate-pulse mb-1"></div>
                  <div className="w-24 h-3 bg-gray-300 rounded animate-pulse"></div>
                </div>
                <div className="w-20 h-10 bg-gray-300 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Profile Card Skeleton */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="w-48 h-8 bg-gray-300 rounded animate-pulse"></div>
                <div className="flex space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-24 h-10 bg-gray-300 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                    <div className="w-full h-12 bg-gray-300 rounded-xl animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-md shadow-2xl border border-white/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  Guide Dashboard
                </h1>
                <p className="text-gray-600 text-sm">Manage your guide profile and services</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshProfileData}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Data</span>
              </button>
              <div className="text-right text-gray-700">
                <p className="font-semibold">Welcome, {user.name}!</p>
                <p className="text-sm text-gray-500">Ready to help travelers explore?</p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700">{success}</p>
            <button 
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Profile Display (when not editing) */}
        {guideProfile && !isEditing && !isCreating && !isProfileCollapsed && (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">About Me</h3>
                  <p className="text-gray-600 leading-relaxed">{guideProfile.bio}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-700">Experience</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{guideProfile.experience_years} years</p>
                  </div>

                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-700">Hourly Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">${guideProfile.hourly_rate}</p>
                  </div>

                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-gray-700">Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{guideProfile.rating || 'N/A'}</p>
                  </div>

                  <div className="bg-white/50 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-gray-700">Status</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      {guideProfile.is_verified ? 'Verified' : 'Pending Verification'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Languages</h4>
                    <p className="text-gray-600">{guideProfile.languages}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Specialties</h4>
                    <p className="text-gray-600">{guideProfile.specialties || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Phone</h4>
                    <p className="text-gray-600">{guideProfile.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Email</h4>
                    <p className="text-gray-600">{guideProfile.email || 'Not provided'}</p>
                  </div>
                </div>

                {guideProfile.certifications && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Certifications</h4>
                    <p className="text-gray-600">{guideProfile.certifications}</p>
                  </div>
                )}
              </div>

              {/* Profile Sidebar */}
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="text-center">
                  {guideProfile.profile_image ? (
                    <img
                      src={guideProfile.profile_image}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
                  <p className="text-gray-600">Professional Guide</p>
                </div>

                {/* Destination */}
                <div className="bg-white/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-gray-700">Current Destination</span>
                  </div>
                  {guideProfile.destination && (
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">{guideProfile.destination.name}</p>
                      <p className="text-sm text-gray-600">{guideProfile.destination.city}, {guideProfile.destination.country}</p>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="bg-white/50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Profile Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Reviews</span>
                      <span className="font-semibold">{guideProfile.total_reviews || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-semibold">
                        {guideProfile.created_at ? new Date(guideProfile.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <User className="w-6 h-6 mr-2 text-green-500" />
              {isCreating ? 'Create Guide Profile' : 'Guide Profile'}
            </h2>
            
            {!isCreating && !isEditing && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsProfileCollapsed(!isProfileCollapsed)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  {isProfileCollapsed ? (
                    <>
                      <User className="w-4 h-4" />
                      <span>Show Profile</span>
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      <span>Hide Profile</span>
                    </>
                  )}
                </button>
                <button
                  onClick={startEditing}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={refreshProfileData}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Profile</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Destination Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2 text-green-500" />
                  Destination *
                </label>
                <select
                  name="destination_id"
                  value={formData.destination_id}
                  onChange={handleInputChange}
                  required
                  disabled={!isCreating && !isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80"
                >
                  <option value="">Select a destination</option>
                  {destinations.map((dest) => (
                    <option key={dest.id} value={dest.id}>
                      {dest.name}, {dest.city}, {dest.country}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  You can only be a guide at one destination at a time
                </p>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2 text-green-500" />
                  Bio *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  disabled={!isCreating && !isEditing}
                  rows={4}
                  placeholder="Tell travelers about yourself, your passion for this destination, and what makes you a great guide..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80 resize-none"
                />
              </div>

              {/* Experience Years */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2 text-green-500" />
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="50"
                  disabled={!isCreating && !isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80"
                />
              </div>

              {/* Hourly Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2 text-green-500" />
                  Hourly Rate (USD) *
                </label>
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  disabled={!isCreating && !isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80"
                />
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Languages className="w-4 h-4 inline mr-2 text-green-500" />
                  Languages Spoken *
                </label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., English, Spanish, French"
                  disabled={!isCreating && !isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80"
                />
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="w-4 h-4 inline mr-2 text-green-500" />
                  Specialties
                </label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleInputChange}
                  placeholder="e.g., Cultural tours, Adventure, Food tours"
                  disabled={!isCreating && !isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2 text-green-500" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  disabled={!isCreating && !isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2 text-green-500" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  disabled={!isCreating && !isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80"
                />
              </div>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Camera className="w-4 h-4 inline mr-2 text-green-500" />
                  Profile Image URL
                </label>
                <input
                  type="url"
                  name="profile_image"
                  value={formData.profile_image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/your-image.jpg"
                  disabled={!isCreating && !isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80"
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="w-4 h-4 inline mr-2 text-green-500" />
                  Certifications
                </label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  placeholder="e.g., Licensed Tour Guide, First Aid Certified"
                  disabled={!isCreating && !isEditing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/80"
                />
              </div>
            </div>

            {/* Action Buttons */}
            {(isCreating || isEditing) && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isCreating ? 'Create Profile' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* No Profile State */}
        {!guideProfile && !isCreating && (
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Your Guide Dashboard!</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't created your guide profile yet. Create one to start offering your services to travelers and share your expertise about your chosen destination.
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Guide Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideDashboard;
