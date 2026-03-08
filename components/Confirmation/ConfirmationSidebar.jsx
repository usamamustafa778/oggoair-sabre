import React from "react";
import { Check, Clock, Plus, X } from "lucide-react";
import Image from "next/image";

export default function ConfirmationSidebar({ bookingDetails }) {
  if (!bookingDetails) {
    return null;
  }

  const getBookingReference = () => {
    return bookingDetails.bookingDetails?.booking_reference || `OG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const getBookingStatus = () => {
    return bookingDetails.payment?.status || "Pending";
  };

  const getCabinClass = () => {
    return bookingDetails.bookingDetails?.passengers?.[0]?.cabin_class_marketing_name || "Economy";
  };

  const isRefundable = () => {
    // Check if the booking has refund conditions
    return bookingDetails.bookingDetails?.conditions?.refund_before_departure !== null;
  };

  return (
    <div className="space-y-6">
      {/* App Download Section */}
      <div className="rounded-xl border-3 border-white pt-5 px-5 lg:px-9 pb-8 lg:pb-12 shadow-sm mb-5 bg-[#F7F7F9] flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="flex items-center lg:items-end justify-center gap-4">
          <div className="flex-shrink-0">
            <Image src="/st-images/booking/qr.png" alt="QR Code" width={150} height={150} className='w-[90px] h-[90px] lg:w-[115px] lg:h-[115px]' />
          </div>
          <div className="flex-1 lg:translate-y-2">
            <h3 className="text-sm lg:text-[16px] font-semibold text-black mb-3 lg:mb-4">
              Scan to discover more features and savings in our app
            </h3>
            <div className="space-y-1 lg:space-y-2">
              <div className="flex items-center space-x-2">
                <Check className='w-4 h-4 lg:w-5 lg:h-5' />
                <span className="text-xs lg:text-sm text-gray-700">Special in-app offers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className='w-4 h-4 lg:w-5 lg:h-5' />
                <span className="text-xs lg:text-sm text-gray-700">Tickets available offline</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className='w-4 h-4 lg:w-5 lg:h-5' />
                <span className="text-xs lg:text-sm text-gray-700">Live trip updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Status Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your booking</h3>

        <div className="space-y-4">
          {/* Booking Reference */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Booking confirmation:</span>
            <span className="text-sm font-medium text-gray-800">{getBookingReference()}</span>
          </div>

          {/* Status */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status:</span>
            <div className="flex items-center gap-2">
              {getBookingStatus() === "Pending" ? (
                <Clock className="w-4 h-4 text-yellow-600" />
              ) : (
                <Check className="w-4 h-4 text-green-600" />
              )}
              <span className={`text-sm font-medium ${getBookingStatus() === "Pending" ? "text-yellow-600" : "text-green-600"
                }`}>
                {getBookingStatus()}
              </span>
            </div>
          </div>

          {/* Class */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Class:</span>
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-800">{getCabinClass()}</span>
            </div>
          </div>

          {/* Refundable Status */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Refundable:</span>
            <div className="flex items-center gap-2">
              {isRefundable() ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Refundable</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Non-refundable</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 