import React from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaMinus, FaPlus } from 'react-icons/fa';

export default function Travelers({ travelers, setTravelers, setShowHotelTravelersSelection, option }) {
  const updateTravelers = (type, value) => {
    setTravelers(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + value)
    }));
  };

  const getTotalTravelers = () => {
    return travelers.adults + travelers.child + travelers.infant;
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 min-w-[300px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">Travelers</h3>
        <button
          onClick={() => setShowHotelTravelersSelection(false)}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <IoMdClose className="text-xl" />
        </button>
      </div>

      <div className="p-4">
        {/* Adults */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium">Adults</p>
            <p className="text-sm text-gray-500">Age 13+</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateTravelers('adults', -1)}
              disabled={travelers.adults <= 1}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaMinus className="text-xs" />
            </button>
            <span className="w-8 text-center font-medium">{travelers.adults}</span>
            <button
              onClick={() => updateTravelers('adults', 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <FaPlus className="text-xs" />
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium">Children</p>
            <p className="text-sm text-gray-500">Age 0-12</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateTravelers('child', -1)}
              disabled={travelers.child <= 0}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaMinus className="text-xs" />
            </button>
            <span className="w-8 text-center font-medium">{travelers.child}</span>
            <button
              onClick={() => updateTravelers('child', 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <FaPlus className="text-xs" />
            </button>
          </div>
        </div>

        {/* Infants */}
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium">Infants</p>
            <p className="text-sm text-gray-500">Under 2</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateTravelers('infant', -1)}
              disabled={travelers.infant <= 0}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaMinus className="text-xs" />
            </button>
            <span className="w-8 text-center font-medium">{travelers.infant}</span>
            <button
              onClick={() => updateTravelers('infant', 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <FaPlus className="text-xs" />
            </button>
          </div>
        </div>

        {/* Rooms - only show for hotel option */}
        {option === 'hotel' && (
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Rooms</p>
              <p className="text-sm text-gray-500">Number of rooms</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateTravelers('rooms', -1)}
                disabled={travelers.rooms <= 1}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaMinus className="text-xs" />
              </button>
              <span className="w-8 text-center font-medium">{travelers.rooms}</span>
              <button
                onClick={() => updateTravelers('rooms', 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
              >
                <FaPlus className="text-xs" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total: {getTotalTravelers()} guest{getTotalTravelers() > 1 ? 's' : ''}
            {option === 'hotel' && `, ${travelers.rooms} room${travelers.rooms > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>
    </div>
  );
} 