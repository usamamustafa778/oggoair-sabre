import React from 'react';

const ReviewButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-green-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-600 transition-colors"
    >
      Review journey details
    </button>
  );
};

export default ReviewButton; 