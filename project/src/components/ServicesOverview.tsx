import React from 'react';
import { 
  Building, 
  Users, 
  Utensils, 
  ShoppingBag, 
  Car, 
  MapPin, 
  BookOpen, 
  Leaf,
  Shield,
  Star,
  ArrowRight,
  Globe,
  Compass,
  Heart
} from 'lucide-react';

interface ServicesOverviewProps {
  onExplore: () => void;
}

const ServicesOverview: React.FC<ServicesOverviewProps> = ({ onExplore }) => {
  const services = [
    {
      icon: MapPin,
      title: 'Destination Explorer',
      description: 'Discover amazing places by country, city, or interactive map',
      color: 'from-sky-500 to-blue-600',
      bgColor: 'from-sky-50 to-blue-50',
      features: ['195+ Countries', 'Interactive Maps', 'Local Insights'],
      emoji: '🗺️'
    },
    {
      icon: Building,
      title: 'Hotel Booking',
      description: 'Find and book the perfect accommodation for your stay',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      features: ['Best Prices', 'Verified Reviews', 'Instant Booking'],
      emoji: '🏨'
    },
    {
      icon: Users,
      title: 'Local Guides',
      description: 'Connect with verified local guides for authentic experiences',
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      features: ['Expert Guides', 'Custom Tours', 'Local Knowledge'],
      emoji: '👥'
    },
    {
      icon: ShoppingBag,
      title: 'Local Products',
      description: 'Pre-order authentic souvenirs and local specialties',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      features: ['Authentic Items', 'Pre-order', 'Local Artisans'],
      emoji: '🛍️'
    },
    {
      icon: Utensils,
      title: 'Restaurant Finder',
      description: 'Discover the best local cuisine and dining experiences',
      color: 'from-red-500 to-pink-600',
      bgColor: 'from-red-50 to-pink-50',
      features: ['Top Rated', 'Local Cuisine', 'Reservations'],
      emoji: '🍽️'
    },
    {
      icon: Car,
      title: 'Transport Booking',
      description: 'Book cabs, bikes, and public transport passes easily',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50',
      features: ['Multiple Options', 'Best Rates', 'Easy Booking'],
      emoji: '🚗'
    }
  ];

  const additionalFeatures = [
    {
      icon: Users,
      title: 'Travel Buddy Finder',
      description: 'Connect with like-minded travelers for shared adventures',
      emoji: '🤝'
    },
    {
      icon: BookOpen,
      title: 'Travel Blog & Stories',
      description: 'Share experiences and discover inspiring travel stories',
      emoji: '📖'
    },
    {
      icon: Leaf,
      title: 'Carbon Calculator',
      description: 'Calculate your footprint and choose eco-friendly options',
      emoji: '🌱'
    },
    {
      icon: Shield,
      title: 'Emergency & Safety',
      description: 'SOS tools and local emergency information for peace of mind',
      emoji: '🆘'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-sky-200 to-blue-300 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-5 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Complete Travel Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need for the perfect trip, all in one comprehensive platform designed for modern travelers
          </p>
        </div>

        {/* Main Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-gray-100 hover:border-gray-200"
              >
                <div className={`h-3 bg-gradient-to-r ${service.color}`}></div>
                <div className={`p-8 bg-gradient-to-br ${service.bgColor}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-4xl">{service.emoji}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-sky-600 transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                  

                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-3xl shadow-xl p-10 mb-16 border border-gray-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Enhanced Travel Experience
            </h3>
            <p className="text-gray-600 text-lg">
              Additional features to make your journey safer, more social, and environmentally conscious
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-r from-sky-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-10 h-10 text-sky-600" />
                  </div>
                  <div className="text-3xl mb-3">{feature.emoji}</div>
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">{feature.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rating System Highlight */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-10 text-center text-white shadow-2xl transform hover:scale-105 transition-transform duration-500">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm">
              <Star className="w-8 h-8 text-white fill-current" />
            </div>
            <h3 className="text-3xl font-bold">Comprehensive Rating System</h3>
          </div>
          <p className="text-yellow-100 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
            Rate and review all services including hotels, guides, restaurants, transport, and local products. 
            Help fellow travelers make informed decisions with your honest feedback.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-yellow-200 mb-2">4.9</div>
              <div className="text-yellow-100 text-lg">Average Rating</div>
            </div>
            <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-orange-200 mb-2">50K+</div>
              <div className="text-yellow-100 text-lg">Reviews</div>
            </div>
            <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-red-200 mb-2">6</div>
              <div className="text-yellow-100 text-lg">Service Categories</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;