import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating }) {
  if (!rating || rating === 0) {
    return null;
  }

  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );
} 