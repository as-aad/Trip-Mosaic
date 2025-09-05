import React from 'react';
import { Star, Quote, Heart, Users, Globe, Award } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'New York, USA',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      text: 'Trip Mosaic made our Bali vacation absolutely perfect! The local guide was amazing and the hotel recommendations were spot-on. Everything was seamlessly organized.',
      trip: 'Bali Adventure',
      emoji: '🏝️'
    },
    {
      id: 2,
      name: 'Michael Chen',
      location: 'Singapore',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      text: 'As a hotel owner, Trip Mosaic has significantly increased our bookings. The platform is user-friendly and the support team is incredibly responsive.',
      trip: 'Business Partner',
      emoji: '🏨'
    },
    {
      id: 3,
      name: 'Elena Rodriguez',
      location: 'Madrid, Spain',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      text: 'The carbon calculator helped us plan an eco-friendly trip to Iceland. We loved being able to offset our footprint and support local conservation efforts.',
      trip: 'Iceland Eco Tour',
      emoji: '🌱'
    },
    {
      id: 4,
      name: 'David Kim',
      location: 'Seoul, South Korea',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      text: 'Found my perfect travel buddy through the platform! We explored Tokyo together and it was an incredible experience. The safety features gave us peace of mind.',
      trip: 'Tokyo Discovery',
      emoji: '🤝'
    },
    {
      id: 5,
      name: 'Maria Santos',
      location: 'São Paulo, Brazil',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      text: 'The local products feature is fantastic! I was able to pre-order authentic souvenirs from Greece before my trip. Everything was ready for pickup when I arrived.',
      trip: 'Greek Islands',
      emoji: '🛍️'
    },
    {
      id: 6,
      name: 'James Wilson',
      location: 'London, UK',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
      rating: 5,
      text: 'The emergency tools saved our trip when we got lost in Dubai. The SOS feature and local emergency contacts were incredibly helpful. Highly recommend!',
      trip: 'Dubai Adventure',
      emoji: '🆘'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-sky-200 to-blue-300 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-5 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            What Our Travelers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied travelers who have discovered amazing experiences through Trip Mosaic
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-gray-200 shadow-lg"
            >
              {/* Header with Avatar and Rating */}
              <div className="flex items-center mb-6">
                <div className="relative">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-sky-100 group-hover:ring-sky-200 transition-all duration-300"
                  />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg">
                    {testimonial.emoji}
                  </div>
                </div>
                <div className="flex-1 ml-4">
                  <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
                <div className="flex items-center bg-yellow-50 rounded-full px-3 py-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-10 h-10 text-sky-200" />
                <p className="text-gray-700 italic pl-8 leading-relaxed text-lg">
                  "{testimonial.text}"
                </p>
              </div>

              {/* Trip and Rating */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm font-bold text-sky-600 bg-sky-50 px-4 py-2 rounded-full">
                  {testimonial.trip}
                </span>
                <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold">{testimonial.rating}.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Stats Section */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl transform hover:scale-105 transition-transform duration-500">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-4">Our Travel Community in Numbers</h3>
            <p className="text-sky-100 text-lg">
              Join the growing community of travelers who trust Trip Mosaic for their adventures
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold mb-2 text-yellow-200">50K+</div>
              <div className="text-sky-100 text-lg">Happy Travelers</div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold mb-2 text-green-200">195</div>
              <div className="text-sky-100 text-lg">Countries Covered</div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold mb-2 text-purple-200">10K+</div>
              <div className="text-sky-100 text-lg">Destinations</div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>
              <div className="text-4xl font-bold mb-2 text-red-200">4.9</div>
              <div className="text-sky-100 text-lg">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;