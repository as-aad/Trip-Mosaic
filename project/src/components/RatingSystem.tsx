import React, { useState } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { createReview, ReviewCreate } from '../services/api';

interface RatingSystemProps {
  destinationId: string;
}

const RatingSystem: React.FC<RatingSystemProps> = ({ destinationId }) => {
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const features = [
    { name: 'Hotels', rating: 4.7, reviews: 2341 },
    { name: 'Local Guides', rating: 4.8, reviews: 1876 },
    { name: 'Local Products', rating: 4.6, reviews: 1234 },
    { name: 'Restaurants', rating: 4.9, reviews: 3456 },
    { name: 'Transport', rating: 4.5, reviews: 2987 },
    { name: 'Overall Experience', rating: 4.8, reviews: 5678 },
  ];

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      alert('Please select a rating before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      const reviewData: ReviewCreate = {
        destination_id: 1, // This should be the actual destination ID from the database
        rating: userRating,
        comment: comment.trim() || undefined,
      };

      await createReview(destinationId, reviewData);
      setSubmitted(true);
      setUserRating(0);
      setComment('');
      
      // Reset after 3 seconds
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-green-600 fill-current" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600">Your review has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Ratings & Reviews</h3>

      {/* Feature Ratings */}
      <div className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{feature.name}</span>
                <span className="text-sm text-gray-500">{feature.reviews} reviews</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${(feature.rating / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{feature.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Rating */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Rate Your Experience</h4>
        <div className="flex items-center space-x-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setUserRating(star)}
              className="p-1 transition-colors"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || userRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {userRating > 0 && (
            <span className="ml-2 text-lg font-medium text-gray-900">
              {userRating}/5
            </span>
          )}
        </div>

        <textarea
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          rows={3}
        />

        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">Helpful</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Comment</span>
            </button>
          </div>
          <button 
            onClick={handleSubmitReview}
            disabled={isSubmitting || userRating === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isSubmitting || userRating === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingSystem;