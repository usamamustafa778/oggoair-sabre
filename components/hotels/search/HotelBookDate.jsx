import React from 'react';
import { IoMdClose } from 'react-icons/io';
import { FaCalendarDays } from 'react-icons/fa6';

export default function HotelBookDate({ 
  setshowHotelBookDate,
  hoteBookingCheckinDate, 
  setHotelBookingCheckinDate, 
  hoteBookingCheckoutDate, 
  setHotelBookingCheckoutDate
}) {
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCheckinChange = (e) => {
    const newDate = new Date(e.target.value);
    setHotelBookingCheckinDate(newDate);
    
    // Ensure checkout date is after checkin date
    if (hoteBookingCheckoutDate <= newDate) {
      const nextDay = new Date(newDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setHotelBookingCheckoutDate(nextDay);
    }
  };

  const handleCheckoutChange = (e) => {
    const newDate = new Date(e.target.value);
    setHotelBookingCheckoutDate(newDate);
  };

  const getMinCheckoutDate = () => {
    const minDate = new Date(hoteBookingCheckinDate);
    minDate.setDate(minDate.getDate() + 1);
    return formatDate(minDate);
  };

  const getDaysDifference = () => {
    const diffTime = hoteBookingCheckoutDate - hoteBookingCheckinDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-50 min-w-[400px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FaCalendarDays className="text-blue-500" />
          Select Dates
        </h3>
        <button
          onClick={() => setshowHotelBookDate(false)}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <IoMdClose className="text-xl" />
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Check-in Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Date
            </label>
            <input
              type="date"
              value={formatDate(hoteBookingCheckinDate)}
              onChange={handleCheckinChange}
              min={formatDate(new Date())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Check-out Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Date
            </label>
            <input
              type="date"
              value={formatDate(hoteBookingCheckoutDate)}
              onChange={handleCheckoutChange}
              min={getMinCheckoutDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Date Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Check-in:</span>
            <span className="font-medium">{hoteBookingCheckinDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Check-out:</span>
            <span className="font-medium">{hoteBookingCheckoutDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{getDaysDifference()} night{getDaysDifference() > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Quick Date Options */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Options:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const nextWeek = new Date(today);
                nextWeek.setDate(nextWeek.getDate() + 7);
                setHotelBookingCheckinDate(tomorrow);
                setHotelBookingCheckoutDate(nextWeek);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            >
              Next Week
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const nextMonth = new Date(today);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                const nextMonthPlusWeek = new Date(nextMonth);
                nextMonthPlusWeek.setDate(nextMonthPlusWeek.getDate() + 7);
                setHotelBookingCheckinDate(nextMonth);
                setHotelBookingCheckoutDate(nextMonthPlusWeek);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            >
              Next Month
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const weekend = new Date(today);
                const daysUntilWeekend = 6 - today.getDay(); // Saturday
                weekend.setDate(weekend.getDate() + daysUntilWeekend);
                const nextWeekend = new Date(weekend);
                nextWeekend.setDate(nextWeekend.getDate() + 2); // Sunday
                setHotelBookingCheckinDate(weekend);
                setHotelBookingCheckoutDate(nextWeekend);
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            >
              This Weekend
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setshowHotelBookDate(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm Dates
          </button>
        </div>
      </div>
    </div>
  );
} 