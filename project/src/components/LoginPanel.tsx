import React, { useState } from 'react';
import { X, User, Shield, Building, MapPin, Utensils, Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LoginPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: UserRole, userData: any) => void;
}

export type UserRole = 'admin' | 'tourist' | 'hotel-owner' | 'guide' | 'restaurant-owner';

const LoginPanel: React.FC<LoginPanelProps> = ({ isOpen, onClose, onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('tourist');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });

  const roles = [
    {
      id: 'tourist' as UserRole,
      title: 'Tourist',
      description: 'Explore destinations and book experiences',
      icon: User,
      color: 'from-sky-500 to-blue-600',
      features: ['Book hotels & tours', 'Find travel buddies', 'Share travel stories', 'Calculate carbon footprint'],
    },
    {
      id: 'hotel-owner' as UserRole,
      title: 'Hotel Owner',
      description: 'Manage your hotel listings and bookings',
      icon: Building,
      color: 'from-green-500 to-emerald-600',
      features: ['List your property', 'Manage bookings', 'Set pricing & availability', 'View analytics'],
    },
    {
      id: 'guide' as UserRole,
      title: 'Local Guide',
      description: 'Offer guided tours and local experiences',
      icon: MapPin,
      color: 'from-orange-500 to-red-600',
      features: ['Create tour packages', 'Manage bookings', 'Build your profile', 'Earn from tours'],
    },
    {
      id: 'restaurant-owner' as UserRole,
      title: 'Restaurant Owner',
      description: 'Showcase your restaurant and menu',
      icon: Utensils,
      color: 'from-purple-500 to-pink-600',
      features: ['List your restaurant', 'Manage menu & pricing', 'Handle reservations', 'Promote local cuisine'],
    },
    {
      id: 'admin' as UserRole,
      title: 'Administrator',
      description: 'Manage platform operations and users',
      icon: Shield,
      color: 'from-gray-600 to-gray-800',
      features: ['User management', 'Content moderation', 'Analytics dashboard', 'System configuration'],
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const userData = {
      role: selectedRole,
      email: formData.email,
      name: formData.name || formData.email.split('@')[0],
      phone: formData.phone,
    };

    onLogin(selectedRole, userData);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-sky-600 to-orange-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Welcome to Trip Mosaic</h2>
            <p className="text-sky-100">Choose your role to get started</p>
          </div>
        </div>

        <div className="p-6">
          {/* Role Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Select Your Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedRole === role.id
                        ? 'border-sky-500 bg-sky-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${role.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{role.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                    <div className="space-y-1">
                      {role.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="text-xs text-gray-500 flex items-center">
                          <div className="w-1 h-1 bg-sky-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login/Signup Form */}
          <div className="max-w-md mx-auto">
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  !isSignUp ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  isSignUp ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required={isSignUp}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={isSignUp}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-600 to-orange-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                {isSignUp ? 'Create Account' : 'Sign In'} as {roles.find(r => r.id === selectedRole)?.title}
              </button>
            </form>

            {!isSignUp && (
              <div className="text-center mt-4">
                <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                  Forgot your password?
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center text-sm text-gray-600">
                By continuing, you agree to Trip Mosaic's{' '}
                <button className="text-sky-600 hover:text-sky-700 font-medium">Terms of Service</button>
                {' '}and{' '}
                <button className="text-sky-600 hover:text-sky-700 font-medium">Privacy Policy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;