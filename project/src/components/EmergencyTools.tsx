import React, { useState } from 'react';
import { Shield, Phone, MapPin, AlertTriangle, Plus, Guitar as Hospital, Car, Heart, Globe, Compass, Star, ArrowRight, Plane, Zap, Waves, Mountain, Users, Clock } from 'lucide-react';

const EmergencyTools: React.FC = () => {
  const [userLocation, setUserLocation] = useState<string>('Bali, Indonesia');
  const [sosPressed, setSosPressed] = useState(false);

  const emergencyContacts = [
    { country: 'Indonesia', police: '110', ambulance: '118', fire: '113', flag: '🇮🇩' },
    { country: 'Japan', police: '110', ambulance: '119', fire: '119', flag: '🇯🇵' },
    { country: 'Greece', police: '100', ambulance: '166', fire: '199', flag: '🇬🇷' },
    { country: 'UAE', police: '999', ambulance: '999', fire: '997', flag: '🇦🇪' },
    { country: 'Thailand', police: '191', ambulance: '1669', fire: '199', flag: '🇹🇭' },
    { country: 'Australia', police: '000', ambulance: '000', fire: '000', flag: '🇦🇺' },
  ];

  const nearbyServices = [
    {
      type: 'Hospital',
      name: 'BIMC Hospital Kuta',
      distance: '2.3 km',
      address: 'Jl. Bypass Ngurah Rai No.100X, Kuta',
      phone: '+62 361 761263',
      icon: Hospital,
      rating: 4.8,
      emoji: '🏥'
    },
    {
      type: 'Police Station',
      name: 'Polsek Kuta',
      distance: '1.8 km',
      address: 'Jl. Raya Kuta No.2, Kuta',
      phone: '+62 361 751598',
      icon: Shield,
      rating: 4.5,
      emoji: '👮'
    },
    {
      type: 'Embassy',
      name: 'US Consular Agency',
      distance: '5.4 km',
      address: 'Jl. Hayam Wuruk No.188, Denpasar',
      phone: '+62 361 233605',
      icon: Shield,
      rating: 4.7,
      emoji: '🏛️'
    },
    {
      type: 'Pharmacy',
      name: 'Guardian Pharmacy',
      distance: '0.8 km',
      address: 'Jl. Legian No.138, Kuta',
      phone: '+62 361 755566',
      icon: Hospital,
      rating: 4.6,
      emoji: '💊'
    },
  ];

  const handleSOS = () => {
    setSosPressed(true);
    // In a real app, this would trigger emergency services
    setTimeout(() => setSosPressed(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-200 to-orange-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-200 to-orange-300 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-red-200 to-pink-200 rounded-full opacity-5 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Emergency & Safety Tools
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Stay safe while traveling with instant access to emergency services, safety information, and peace of mind
          </p>
          
          {/* Floating Safety Icons */}
          <div className="flex justify-center space-x-8 text-4xl opacity-20 animate-bounce">
            <span className="animate-bounce delay-300">🆘</span>
            <span className="animate-bounce delay-700">🛡️</span>
            <span className="animate-bounce delay-1000">🚨</span>
            <span className="animate-bounce delay-500">📞</span>
          </div>
        </div>

        {/* SOS Button */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-16 text-center border border-gray-100 transform hover:scale-105 transition-transform duration-500">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Emergency SOS</h2>
          </div>
          
          <button
            onClick={handleSOS}
            className={`w-40 h-40 rounded-full font-bold text-3xl transition-all duration-300 transform hover:scale-105 ${
              sosPressed
                ? 'bg-gradient-to-r from-red-600 to-red-800 text-white animate-pulse shadow-2xl'
                : 'bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700 shadow-2xl hover:shadow-red-500/25'
            }`}
          >
            {sosPressed ? 'CALLING...' : 'SOS'}
          </button>
          
          <p className="text-gray-600 mt-6 text-lg">
            Press and hold for 3 seconds to call emergency services
          </p>
          
          {sosPressed && (
            <div className="mt-6 p-6 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl border border-red-200">
              <div className="text-red-800 font-bold text-lg">Emergency Alert Sent!</div>
              <div className="text-red-600">Contacting local emergency services...</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Emergency Contacts */}
          <div className="group bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 transition-all duration-500">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Emergency Numbers</h3>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Current Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={userLocation}
                  onChange={(e) => setUserLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300"
                >
                  <option value="Bali, Indonesia">🇮🇩 Bali, Indonesia</option>
                  <option value="Tokyo, Japan">🇯🇵 Tokyo, Japan</option>
                  <option value="Santorini, Greece">🇬🇷 Santorini, Greece</option>
                  <option value="Dubai, UAE">🇦🇪 Dubai, UAE</option>
                  <option value="Bangkok, Thailand">🇹🇭 Bangkok, Thailand</option>
                  <option value="Sydney, Australia">🇦🇺 Sydney, Australia</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    userLocation.includes(contact.country)
                      ? 'border-red-200 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{contact.flag}</span>
                    <h4 className="font-bold text-gray-900 text-lg">{contact.country}</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                      <div className="text-gray-600 font-medium mb-1">Police</div>
                      <div className="font-bold text-lg text-red-600">{contact.police}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                      <div className="text-gray-600 font-medium mb-1">Ambulance</div>
                      <div className="font-bold text-lg text-green-600">{contact.ambulance}</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-xl border border-gray-200">
                      <div className="text-gray-600 font-medium mb-1">Fire</div>
                      <div className="font-bold text-lg text-orange-600">{contact.fire}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Services */}
          <div className="group bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1 transition-all duration-500">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Nearby Services</h3>
            </div>
            
            <div className="space-y-4">
              {nearbyServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div key={index} className="group/item p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:scale-105">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{service.emoji}</span>
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">{service.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-semibold text-gray-700">{service.rating}</span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{service.distance}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2 font-medium">{service.type}</div>
                        <div className="text-sm text-gray-500 mb-3">{service.address}</div>
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-bold transition-all duration-300 group-hover/item:scale-105">
                          <Phone className="w-4 h-4" />
                          <span>{service.phone}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Safety Tips */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-16 border border-gray-100">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full mb-6 shadow-lg">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Travel Safety Tips</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Essential safety practices to ensure your travels remain secure and worry-free
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Keep Emergency Contacts Handy</h4>
                  <p className="text-gray-600 leading-relaxed">Save local emergency numbers in your phone and keep a physical copy as backup</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-200">
                <MapPin className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Share Your Location</h4>
                  <p className="text-gray-600 leading-relaxed">Let trusted contacts know your travel itinerary and check in regularly</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                <Shield className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Travel Insurance</h4>
                  <p className="text-gray-600 leading-relaxed">Ensure you have comprehensive coverage for medical emergencies and trip disruptions</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                <Phone className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-2">Embassy Contacts</h4>
                  <p className="text-gray-600 leading-relaxed">Know your embassy or consulate information and keep their contact details accessible</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <button className="group bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-2xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex flex-col items-center space-y-3 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
            <Plus className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            <span>Add Contact</span>
          </button>
          
          <button className="group bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-2xl font-bold hover:from-green-600 hover:to-teal-700 transition-all duration-300 flex flex-col items-center space-y-3 transform hover:scale-105 shadow-lg hover:shadow-green-500/25">
            <MapPin className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            <span>Share Location</span>
          </button>
          
          <button className="group bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-2xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex flex-col items-center space-y-3 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
            <Car className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            <span>Call Taxi</span>
          </button>
          
          <button className="group bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-2xl font-bold hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex flex-col items-center space-y-3 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25">
            <Phone className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            <span>Embassy</span>
          </button>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-20">
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-3xl p-12 text-white shadow-2xl transform hover:scale-105 transition-transform duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-4xl font-bold mb-6">Travel with Confidence!</h3>
            <p className="text-red-100 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Your safety is our priority. Access emergency tools, safety information, and peace of mind wherever your adventures take you
            </p>
            <button className="bg-white text-red-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg">
              Stay Safe & Travel Smart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyTools;