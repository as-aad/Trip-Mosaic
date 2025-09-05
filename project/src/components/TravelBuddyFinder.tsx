import React, { useState } from 'react';
import { Users, MapPin, Calendar, MessageCircle, Star, Filter } from 'lucide-react';

const TravelBuddyFinder: React.FC = () => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedDates, setSelectedDates] = useState('');
  
  const buddies = [
    {
      id: 1,
      name: 'Sarah Chen',
      age: 28,
      location: 'Singapore',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
      destination: 'Bali, Indonesia',
      dates: 'March 15-22, 2025',
      interests: ['Photography', 'Yoga', 'Local Food'],
      rating: 4.8,
      trips: 12,
      bio: 'Love exploring new cultures and trying authentic local cuisine!',
    },
    {
      id: 2,
      name: 'Mike Johnson',
      age: 32,
      location: 'Australia',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      destination: 'Tokyo, Japan',
      dates: 'April 5-12, 2025',
      interests: ['Architecture', 'Technology', 'Nightlife'],
      rating: 4.9,
      trips: 18,
      bio: 'Tech enthusiast and adventure seeker looking for like-minded travelers.',
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      age: 25,
      location: 'Spain',
      image: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      destination: 'Santorini, Greece',
      dates: 'May 20-27, 2025',
      interests: ['Art', 'History', 'Wine Tasting'],
      rating: 4.7,
      trips: 9,
      bio: 'Art lover and history buff seeking cultural experiences.',
    },
  ];

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Find Your Travel Buddy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with like-minded travelers and share amazing experiences around the world
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Any Destination</option>
                  <option value="bali">Bali, Indonesia</option>
                  <option value="tokyo">Tokyo, Japan</option>
                  <option value="santorini">Santorini, Greece</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Travel Dates
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={selectedDates}
                  onChange={(e) => setSelectedDates(e.target.value)}
                  placeholder="Any dates"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors flex items-center justify-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Search Buddies</span>
              </button>
            </div>
          </div>
        </div>

        {/* Travel Buddies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buddies.map((buddy) => (
            <div
              key={buddy.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="relative">
                <img
                  src={buddy.image}
                  alt={buddy.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold">{buddy.rating}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{buddy.name}</h3>
                  <span className="text-gray-600">{buddy.age}y</span>
                </div>

                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">From {buddy.location}</span>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Traveling to:</div>
                  <div className="font-semibold text-sky-600">{buddy.destination}</div>
                  <div className="text-sm text-gray-600">{buddy.dates}</div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{buddy.bio}</p>

                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Interests:</div>
                  <div className="flex flex-wrap gap-2">
                    {buddy.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{buddy.trips} trips completed</span>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>Verified traveler</span>
                  </div>
                </div>

                <button className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Profile CTA */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-sky-600 to-green-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to find your travel buddy?</h3>
            <p className="text-sky-100 mb-6">Create your profile and connect with amazing travelers</p>
            <button className="bg-white text-sky-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Create Travel Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelBuddyFinder;