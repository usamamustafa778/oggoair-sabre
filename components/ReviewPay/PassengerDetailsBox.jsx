import React from 'react';
import { Mail } from 'lucide-react';

const PassengerDetailsBox = ({ passenger }) => {
  return (
    <div className="bg-white rounded-lg p-6 border-2 border-dashed border-gray-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Passenger details</h2>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{passenger.firstName} {passenger.lastName}</span>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {passenger.ageType || 'ADULT'}
          </span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            Your ticket will be sent to {passenger.email}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetailsBox; 