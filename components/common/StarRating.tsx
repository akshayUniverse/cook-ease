import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
  showText?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 'md',
  showEmoji = true,
  showText = true
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const getEmoji = (stars: number) => {
    if (stars === 0) return '😐';
    if (stars === 1) return '😞';
    if (stars === 2) return '😕';
    if (stars === 3) return '😊';
    if (stars === 4) return '😄';
    if (stars === 5) return '🤩';
    return '😊';
  };

  const getText = (stars: number) => {
    if (stars === 0) return 'No rating';
    if (stars === 1) return 'Poor';
    if (stars === 2) return 'Fair';
    if (stars === 3) return 'Good';
    if (stars === 4) return 'Very Good';
    if (stars === 5) return 'Excellent';
    return 'Good';
  };

  const getStarColor = (starIndex: number) => {
    const effectiveRating = hoverRating || rating;
    if (starIndex <= effectiveRating) {
      if (effectiveRating <= 2) return 'text-red-400';
      if (effectiveRating <= 3) return 'text-yellow-400';
      return 'text-green-400';
    }
    return 'text-gray-300';
  };

  const currentRating = hoverRating || rating;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`${sizeClasses[size]} transition-all duration-200 hover:scale-110`}
          >
            <svg
              className={`${sizeClasses[size]} ${getStarColor(star)} fill-current`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      
      {showEmoji && (
        <span className="text-2xl ml-2">
          {getEmoji(currentRating)}
        </span>
      )}
      
      {showText && (
        <span className={`text-sm font-medium ml-2 ${
          currentRating <= 2 ? 'text-red-600' : 
          currentRating <= 3 ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {getText(currentRating)}
        </span>
      )}
    </div>
  );
};

export default StarRating; 