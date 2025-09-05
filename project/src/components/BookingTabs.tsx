import React from 'react';
import { Star, MapPin, Clock, DollarSign, Users, Car, Utensils, ShoppingBag } from 'lucide-react';

interface BookingTabsProps {
  activeTab: 'hotels' | 'guides' | 'products' | 'food' | 'transport';
  destination: string;
}

const BookingTabs: React.FC<BookingTabsProps> = ({ activeTab, destination }) => {
  const renderHotels = () => (
    <div className="space-y-6">
      {[
        {
          name: 'Grand Paradise Resort',
          image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.8,
          price: '$120',
          location: 'Beachfront, Seminyak',
          amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi'],
        },
        {
          name: 'Villa Serenity',
          image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.9,
          price: '$85',
          location: 'Ubud Center',
          amenities: ['Garden', 'Breakfast', 'AC', 'WiFi'],
        },
      ].map((hotel, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <img src={hotel.image} alt={hotel.name} className="w-full sm:w-32 h-24 object-cover rounded-lg" />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{hotel.name}</h4>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{hotel.rating}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {hotel.location}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {hotel.amenities.map((amenity) => (
                  <span key={amenity} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {amenity}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-sky-600">{hotel.price}/night</span>
                <button className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-700 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGuides = () => (
    <div className="space-y-6">
      {[
        {
          name: 'Made Wayan',
          image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.9,
          price: '$40',
          specialties: ['Temple Tours', 'Rice Terraces', 'Cultural Experiences'],
          languages: ['English', 'Indonesian', 'Balinese'],
          experience: '8 years',
        },
        {
          name: 'Kadek Sari',
          image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.8,
          price: '$45',
          specialties: ['Adventure Tours', 'Volcano Hikes', 'Beach Activities'],
          languages: ['English', 'Indonesian'],
          experience: '6 years',
        },
      ].map((guide, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <img src={guide.image} alt={guide.name} className="w-full sm:w-24 h-24 object-cover rounded-full" />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{guide.name}</h4>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{guide.rating}</span>
                </div>
              </div>
              <div className="text-gray-600 text-sm mb-2">{guide.experience} experience</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {guide.specialties.map((specialty) => (
                  <span key={specialty} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                    {specialty}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                Languages: {guide.languages.join(', ')}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">{guide.price}/day</span>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                  Hire Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProducts = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        {
          name: 'Batik Sarong',
          image: 'https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=400',
          price: '$25',
          description: 'Traditional handwoven batik sarong',
        },
        {
          name: 'Wooden Mask',
          image: 'https://images.pexels.com/photos/8447526/pexels-photo-8447526.jpeg?auto=compress&cs=tinysrgb&w=400',
          price: '$45',
          description: 'Authentic Balinese carved mask',
        },
        {
          name: 'Coffee Beans',
          image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=400',
          price: '$18',
          description: 'Premium Kopi Luwak coffee beans',
        },
      ].map((product, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
            <p className="text-gray-600 text-sm mb-3">{product.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-orange-600">{product.price}</span>
              <button className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors">
                Order
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFood = () => (
    <div className="space-y-6">
      {[
        {
          name: 'Warung Made',
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.7,
          cuisine: 'Traditional Balinese',
          price: '$$',
          location: 'Sanur Beach',
          specialties: ['Nasi Goreng', 'Satay', 'Gado-gado'],
        },
        {
          name: 'Bebek Tepi Sawah',
          image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.8,
          cuisine: 'Indonesian',
          price: '$$',
          location: 'Ubud',
          specialties: ['Crispy Duck', 'Rice Terraces View', 'Local Vegetables'],
        },
      ].map((restaurant, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <img src={restaurant.image} alt={restaurant.name} className="w-full sm:w-32 h-24 object-cover rounded-lg" />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{restaurant.name}</h4>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{restaurant.rating}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <Utensils className="w-4 h-4 mr-1" />
                {restaurant.cuisine} • {restaurant.price}
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                {restaurant.location}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {restaurant.specialties.map((specialty) => (
                  <span key={specialty} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                    {specialty}
                  </span>
                ))}
              </div>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
                View Menu
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTransport = () => (
    <div className="space-y-6">
      {[
        {
          name: 'Airport Transfer',
          image: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400',
          price: '$15',
          duration: '45 min',
          capacity: '4 passengers',
          type: 'Private Car',
        },
        {
          name: 'Scooter Rental',
          image: 'https://images.pexels.com/photos/1149960/pexels-photo-1149960.jpeg?auto=compress&cs=tinysrgb&w=400',
          price: '$8',
          duration: 'Per day',
          capacity: '2 passengers',
          type: 'Motorbike',
        },
        {
          name: 'Island Day Tour',
          image: 'https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=400',
          price: '$45',
          duration: '8 hours',
          capacity: '12 passengers',
          type: 'Group Tour',
        },
      ].map((transport, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row gap-4">
            <img src={transport.image} alt={transport.name} className="w-full sm:w-32 h-24 object-cover rounded-lg" />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{transport.name}</h4>
                <span className="text-lg font-bold text-purple-600">{transport.price}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <Car className="w-4 h-4 mr-1" />
                {transport.type}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {transport.duration}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {transport.capacity}
                </div>
              </div>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
                Book Transport
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  switch (activeTab) {
    case 'hotels':
      return renderHotels();
    case 'guides':
      return renderGuides();
    case 'products':
      return renderProducts();
    case 'food':
      return renderFood();
    case 'transport':
      return renderTransport();
    default:
      return renderHotels();
  }
};

export default BookingTabs;