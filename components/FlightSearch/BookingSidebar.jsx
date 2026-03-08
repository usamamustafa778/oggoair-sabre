import React, { useState } from 'react';
import { X, Share, Bookmark, Clock, MapPin, Airplane, Calendar, WarningCircle } from 'phosphor-react';
import Image from 'next/image';

const BookingSidebar = ({ isOpen, onClose, selectedFlight, currentView = 'return' }) => {
  const [luggageCount, setLuggageCount] = useState(1);

  if (!isOpen) return null;

  const getRouteText = () => {
    return 'Istanbul To Dubai';
  };

  const getItineraryData = () => {
    return {
      departure: { time: '09:45', city: 'Istanbul', airport: 'SAW' },
      arrival: { time: '13:35', city: 'Dubai', airport: 'DXB' },
      duration: '7h5m',
      date: '10 Sept'
    };
  };

  const itineraryData = getItineraryData();

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary-text">{getRouteText()}</h2>
          <div className="flex items-center gap-2">
            <button className="text-gray-500 hover:text-gray-700">
              <Bookmark size={20} />
            </button>
            <button className="text-gray-500 hover:text-gray-700">
              <Share size={20} />
            </button>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Itinerary Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{itineraryData.date} - Economy</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 flex items-center justify-center rounded">
                <Image src="/st-images/flightSearch/a.png" alt="airline" width={20} height={20} className="w-auto h-3" />
              </div>
              <span className="text-sm font-medium">A Jet</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-lg font-bold">{itineraryData.departure.time}</div>
              <div className="text-xs text-gray-600">{itineraryData.departure.city} ({itineraryData.departure.airport})</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">{itineraryData.duration}</div>
              <div className="text-xs text-gray-600">Direct</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{itineraryData.arrival.time}</div>
              <div className="text-xs text-gray-600">{itineraryData.arrival.city} ({itineraryData.arrival.airport})</div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-text">Return</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock size={16} />
            <span>Travel time 5h29m</span>
          </div>
        </div>

        {/* Alert Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <WarningCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              Alternative departure/destination airport. The arrival and/or departure airports for this flight differ from the airports you have selected to provide you with the most cost-effective choice for your journey. Please check the details of your itinerary carefully before confirming your booking.
            </div>
          </div>
        </div>

        {/* Itinerary Timeline */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-0.5 h-8 bg-red-500 mt-2"></div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Wednesday, September 10, 2025</div>
              <div className="text-lg font-bold mt-1">09:45 Istanbul</div>
              <div className="text-sm text-gray-600">Istanbul (SAW)</div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-red-500"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-0.5 h-4 bg-red-500 mt-2"></div>
            </div>
            <div className="flex-1">
              <div className="bg-blue-50 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Airplane size={16} className="text-blue-600" />
                  <span className="font-medium">Flight F3521 (1h 55min)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-blue-500 flex items-center justify-center rounded">
                    <Image src="/st-images/flightSearch/a.png" alt="airline" width={16} height={16} className="w-auto h-2" />
                  </div>
                  <span>A Jet</span>
                  <span>•</span>
                  <span>Flight class Economy</span>
                </div>
              </div>
              <div className="text-lg font-bold">11:40 Dubai</div>
              <div className="text-sm text-gray-600">Dubai (DXB)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Luggage Section */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-primary-text mb-4">Luggage per person</h3>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-gray-600">Quantity:</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button 
              onClick={() => setLuggageCount(Math.max(0, luggageCount - 1))}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="px-4 py-1 border-x border-gray-300">{luggageCount}</span>
            <button 
              onClick={() => setLuggageCount(luggageCount + 1)}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Included:</span>
            <span className="text-sm font-medium">1 Personal item</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Possible to add in the next step:</span>
            <span className="text-sm font-medium">Hand luggage (56 x 40 x 20) - 8kg</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600"></span>
            <span className="text-sm font-medium">Checked baggage</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">
            Baggage allowances may vary by airline and fare type. Please check with your airline for specific details.
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-primary-text mb-4">Return flight price for 1 adult</h3>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">€98.85</div>
            <div className="text-sm text-green-700">per adult</div>
          </div>
        </div>

        <button className="w-full bg-primary-green text-white py-3 rounded-lg font-medium text-lg mt-4 hover:bg-green-600 transition">
          Continue to Booking
        </button>
      </div>
    </div>
  );
};

export default BookingSidebar; 