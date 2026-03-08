import React from 'react';
import { Share2 } from 'lucide-react';

const ShareJourney = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="text-center">
        <p className="text-gray-700 mb-3">Travelling with someone? Share your journey details with them now.</p>
        <div className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer">
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Share details</span>
        </div>
      </div>
    </div>
  );
};

export default ShareJourney; 