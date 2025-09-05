import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  MapPin, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Building,
  Utensils,
  Camera,
  Heart,
  MessageSquare,
  Bookmark
} from 'lucide-react';
import { UserRole } from './LoginPanel';

interface User {
  role: UserRole;
  email: string;
  name: string;
  phone?: string;
}

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTouristDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Trips Planned</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <MapPin className="w-8 h-8 text-sky-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Bookings</p>
              <p className="text-2xl font-bold text-gray-900">7</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reviews Written</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Saved Places</p>
              <p className="text-2xl font-bold text-gray-900">25</p>
            </div>
            <Bookmark className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { type: 'Hotel', name: 'Grand Paradise Resort', location: 'Bali', date: 'Mar 15-22', status: 'Confirmed' },
              { type: 'Guide', name: 'Made Wayan', location: 'Ubud', date: 'Mar 18', status: 'Pending' },
              { type: 'Restaurant', name: 'Warung Made', location: 'Sanur', date: 'Mar 16', status: 'Confirmed' },
            ].map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{booking.name}</h4>
                    <p className="text-sm text-gray-600">{booking.type} • {booking.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Places */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Saved Places</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Santorini, Greece', image: 'https://images.pexels.com/photos/161901/santorini-greece-island-sunset-161901.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Tokyo, Japan', image: 'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { name: 'Dubai, UAE', image: 'https://images.pexels.com/photos/1467300/pexels-photo-1467300.jpeg?auto=compress&cs=tinysrgb&w=400' },
            ].map((place, index) => (
              <div key={index} className="relative group cursor-pointer">
                <img src={place.image} alt={place.name} className="w-full h-32 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-6 h-6 text-white fill-current" />
                </div>
                <p className="mt-2 font-medium text-gray-900">{place.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900">342</p>
            </div>
            <Building className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$45,230</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">+12.5%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Management Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'users', label: 'Users', icon: Users },
              { key: 'hotels', label: 'Hotels', icon: Building },
              { key: 'guides', label: 'Guides', icon: MapPin },
              { key: 'restaurants', label: 'Restaurants', icon: Utensils },
              { key: 'reviews', label: 'Reviews', icon: Star },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Grand Paradise Resort', type: 'Hotel', status: 'Active', created: '2024-01-15' },
                  { name: 'Made Wayan', type: 'Guide', status: 'Active', created: '2024-01-20' },
                  { name: 'Warung Made', type: 'Restaurant', status: 'Pending', created: '2024-01-25' },
                ].map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-gray-600">{item.type}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{item.created}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 text-gray-400 hover:text-sky-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHotelOwnerDashboard = () => (
    <div className="space-y-6">
      {/* Hotel Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Occupancy Rate</p>
              <p className="text-2xl font-bold text-gray-900">78%</p>
            </div>
            <Building className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$12,450</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
            </div>
            <Star className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Hotel Management */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">My Hotels</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="w-4 h-4" />
              <span>Add Hotel</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'Grand Paradise Resort',
                image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=400',
                location: 'Seminyak, Bali',
                rating: 4.8,
                bookings: 45,
                revenue: '$8,230'
              },
              {
                name: 'Villa Serenity',
                image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=400',
                location: 'Ubud, Bali',
                rating: 4.9,
                bookings: 32,
                revenue: '$4,220'
              }
            ].map((hotel, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <img src={hotel.image} alt={hotel.name} className="w-full h-32 object-cover" />
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{hotel.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{hotel.location}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Rating</p>
                      <p className="font-semibold">{hotel.rating}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Bookings</p>
                      <p className="font-semibold">{hotel.bookings}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold">{hotel.revenue}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button className="text-green-600 hover:text-green-700 font-medium">Manage</button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGuideDashboard = () => (
    <div className="space-y-6">
      {/* Guide Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Tours</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Bookings</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Earnings</p>
              <p className="text-2xl font-bold text-gray-900">$3,560</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Rating</p>
              <p className="text-2xl font-bold text-gray-900">4.9</p>
            </div>
            <Star className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tour Management */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">My Tours</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              <Plus className="w-4 h-4" />
              <span>Create Tour</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                title: 'Temple Hopping & Rice Terraces',
                description: 'Explore ancient temples and stunning rice terraces in Ubud',
                duration: '8 hours',
                price: '$45',
                bookings: 12,
                rating: 4.9
              },
              {
                title: 'Volcano Sunrise Adventure',
                description: 'Watch the sunrise from Mount Batur with breakfast',
                duration: '12 hours',
                price: '$65',
                bookings: 8,
                rating: 4.8
              }
            ].map((tour, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{tour.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{tour.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Duration: {tour.duration}</span>
                      <span>Price: {tour.price}</span>
                      <span>Bookings: {tour.bookings}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span>{tour.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRestaurantOwnerDashboard = () => (
    <div className="space-y-6">
      {/* Restaurant Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">234</p>
            </div>
            <Utensils className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$5,670</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">4.7</p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Menu Items</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
            <Camera className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Restaurant Management */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">My Restaurants</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Plus className="w-4 h-4" />
              <span>Add Restaurant</span>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'Warung Made',
                image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
                cuisine: 'Traditional Balinese',
                location: 'Sanur Beach',
                rating: 4.7,
                orders: 156,
                revenue: '$3,240'
              },
              {
                name: 'Bebek Tepi Sawah',
                image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
                cuisine: 'Indonesian',
                location: 'Ubud',
                rating: 4.8,
                orders: 78,
                revenue: '$2,430'
              }
            ].map((restaurant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <img src={restaurant.image} alt={restaurant.name} className="w-full h-32 object-cover" />
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{restaurant.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{restaurant.cuisine}</p>
                  <p className="text-sm text-gray-500 mb-3">{restaurant.location}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Rating</p>
                      <p className="font-semibold">{restaurant.rating}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Orders</p>
                      <p className="font-semibold">{restaurant.orders}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold">{restaurant.revenue}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button className="text-red-600 hover:text-red-700 font-medium">Manage Menu</button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardContent = () => {
    switch (user.role) {
      case 'tourist':
        return renderTouristDashboard();
      case 'admin':
        return renderAdminDashboard();
      case 'hotel-owner':
        return renderHotelOwnerDashboard();
      case 'guide':
        return renderGuideDashboard();
      case 'restaurant-owner':
        return renderRestaurantOwnerDashboard();
      default:
        return renderTouristDashboard();
    }
  };

  const getRoleTitle = () => {
    switch (user.role) {
      case 'tourist': return 'Tourist Dashboard';
      case 'admin': return 'Admin Dashboard';
      case 'hotel-owner': return 'Hotel Owner Dashboard';
      case 'guide': return 'Guide Dashboard';
      case 'restaurant-owner': return 'Restaurant Owner Dashboard';
      default: return 'Dashboard';
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'tourist': return 'from-sky-600 to-blue-600';
      case 'admin': return 'from-gray-600 to-gray-800';
      case 'hotel-owner': return 'from-green-600 to-emerald-600';
      case 'guide': return 'from-orange-600 to-red-600';
      case 'restaurant-owner': return 'from-purple-600 to-pink-600';
      default: return 'from-sky-600 to-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className={`bg-gradient-to-r ${getRoleColor()} text-white py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{getRoleTitle()}</h1>
              <p className="text-blue-100 mt-2">Welcome back, {user.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default UserDashboard;