import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Star, MapPin, Building, CreditCard, MessageSquare } from 'lucide-react';
import { createHotelBooking, getHotelRoomTypes, getHotelAvailability } from '../services/api';

interface HotelBookingModalProps {
  hotel: any;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: any) => void;
}

const HotelBookingModal: React.FC<HotelBookingModalProps> = ({
  hotel,
  isOpen,
  onClose,
  onBookingSuccess
}) => {
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>('');
      const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [numGuests, setNumGuests] = useState<number>(1);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Load room types when modal opens
  useEffect(() => {
    if (isOpen && hotel) {
      loadRoomTypes();
    }
  }, [isOpen, hotel]);

  // Calculate total price when dates or room type changes
  useEffect(() => {
    if (selectedRoomType && checkInDate && checkOutDate) {
      calculateTotalPrice();
    }
  }, [selectedRoomType, checkInDate, checkOutDate, numGuests]);

  const loadRoomTypes = async () => {
    try {
      const types = await getHotelRoomTypes(hotel.id);
      setRoomTypes(types);
      if (types.length > 0) {
        setSelectedRoomType(types[0].room_type_name);
      }
    } catch (error) {
      console.error('Error loading room types:', error);
      setError('Failed to load room types');
    }
  };

  const loadAvailability = async () => {
    if (!selectedRoomType || !checkInDate || !checkOutDate) return;

    try {
      const avail = await getHotelAvailability(hotel.id, selectedRoomType, checkInDate, checkOutDate);
      setAvailability(avail);
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedRoomType || !checkInDate || !checkOutDate) return;

    const roomType = roomTypes.find(rt => rt.room_type_name === selectedRoomType);
    if (!roomType) return;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    const total = roomType.base_price_per_night * nights;
    setTotalPrice(total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoomType || !checkInDate || !checkOutDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      setError('Check-out date must be after check-in date');
      return;
    }

    if (new Date(checkInDate) < new Date()) {
      setError('Check-in date cannot be in the past');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        room_type: selectedRoomType,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_guests: numGuests,
        special_requests: specialRequests || undefined
      };

      const response = await createHotelBooking(hotel.id, bookingData);
      
      onBookingSuccess(response.booking);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const getMinCheckOutDate = () => {
    if (!checkInDate) return '';
    const minDate = new Date(checkInDate);
    minDate.setDate(minDate.getDate() + 1);
    return minDate.toISOString().split('T')[0];
  };

  const getMaxCheckInDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 365); // Allow booking up to 1 year in advance
    return maxDate.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <Building className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Book Hotel</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Hotel Info */}
        <div className="p-8 border-b border-gray-200 bg-white">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
              {hotel.image ? (
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
              ) : (
                <Building className="w-12 h-12 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{hotel.name}</h3>
              <div className="flex items-center space-x-2 text-base text-gray-600 mb-3">
                <MapPin className="w-5 h-5" />
                <span>{hotel.address}</span>
              </div>
              <div className="flex items-center space-x-2 text-base text-gray-600">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{hotel.rating || 'No rating'}</span>
                {hotel.review_count && (
                  <span className="text-gray-500">({hotel.review_count} reviews)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-w-4xl mx-auto">
          {/* Room Type Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Room Type *
            </label>
            <select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              required
            >
              <option value="">Select a room type</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.room_type_id} value={roomType.room_type_name}>
                  {roomType.room_type_name} - ${roomType.base_price_per_night}/night
                </option>
              ))}
            </select>
            {selectedRoomType && (
              <div className="mt-3 text-base text-gray-600 bg-blue-50 p-4 rounded-xl">
                {roomTypes.find(rt => rt.room_type_name === selectedRoomType)?.description}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                <Calendar className="w-5 h-5 inline mr-2" />
                Check-in Date *
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={getMaxCheckInDate()}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                <Calendar className="w-5 h-5 inline mr-2" />
                Check-out Date *
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={getMinCheckOutDate()}
                className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                required
              />
            </div>
          </div>

          {/* Number of Guests */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              <Users className="w-5 h-5 inline mr-2" />
              Number of Guests *
            </label>
            <select
              value={numGuests}
              onChange={(e) => setNumGuests(Number(e.target.value))}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
              required
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Special Requests
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests or preferences?"
              rows={4}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-lg"
            />
          </div>

          {/* Price Summary */}
          {totalPrice > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between text-2xl font-bold">
                <span className="text-gray-800">Total Price:</span>
                <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="text-lg text-gray-600 mt-2">
                {selectedRoomType && checkInDate && checkOutDate && (
                  <>
                    {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                    {roomTypes.find(rt => rt.room_type_name === selectedRoomType) && (
                      <span> × ${roomTypes.find(rt => rt.room_type_name === selectedRoomType)?.base_price_per_night}/night</span>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
              <p className="text-red-600 text-lg font-medium">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-6 pt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors text-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRoomType || !checkInDate || !checkOutDate}
              className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg font-semibold shadow-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-3" />
                  Book Now
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelBookingModal;
