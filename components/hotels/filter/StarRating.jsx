  import React from 'react';
  import { Star } from 'lucide-react';

  export default function StarRating({ filterTypes, setFilterTypes, filterAbleTypes }) {
    const handleRatingChange = (rating) => {
      if (filterTypes.rating.includes(rating)) {
        setFilterTypes(prev => ({
          ...prev,
          rating: prev.rating.filter(r => r !== rating)
        }));
      } else {
        setFilterTypes(prev => ({
          ...prev,
          rating: [...prev.rating, rating]
        }));
      }
    };

    const renderStars = (rating) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ));
    };

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-300">
        <div className="">
          <p className="text-base font-semibold text-primary-text mb-2">Star Rating</p>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => (
              <label key={stars} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterTypes.rating.includes(stars)}
                  onChange={() => handleRatingChange(stars)}
                  className="mr-3"
                />
                <div className="flex mr-2">
                  {renderStars(stars)}
                </div>
                  <span className="text-base text-primary-text font-medium">({stars} stars)</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  } 