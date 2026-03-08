import React, { useState } from "react";
import {
  Check,
  Download,
  Share,
  Info,
  ChevronDown,
  ChevronUp,
  Plane,
  Calendar,
  User,
  Mail,
  Receipt,
} from "lucide-react";
import Image from "next/image";

export default function ConfirmationBody({
  bookingDetails,
  flightDetails,
  loading,
  error,
}) {
  const [showPassengerDetails, setShowPassengerDetails] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No booking details found.
      </div>
    );
  }

  // Ensure bookingDetails.bookingDetails exists (old project structure)
  if (!bookingDetails.bookingDetails) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Invalid booking details structure.
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    // Convert ISO duration (PT3H30M) to readable format
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;

    const hours = match[1] ? match[1].replace("H", "") : "0";
    const minutes = match[2] ? match[2].replace("M", "") : "0";

    if (hours === "0") return `${minutes}m`;
    if (minutes === "0") return `${hours}h`;
    return `${hours}h:${minutes}m`;
  };

  const getPassengerName = (passenger) => {
    if (passenger.given_name && passenger.family_name) {
      return `${passenger.given_name} ${passenger.family_name}`;
    }
    return "Unknown Passenger";
  };

  const getBookingReference = () => {
    return (
      bookingDetails.bookingDetails.booking_reference ||
      `OGG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    );
  };

  const getTotalAmount = () => {
    return (
      bookingDetails.payment?.totalAmount ||
      bookingDetails.bookingDetails.total_amount ||
      "0"
    );
  };

  const getCommissionAmount = () => {
    return bookingDetails.payment?.comissionAmount || "5.00";
  };

  return (
    <div className="space-y-6">
      {/* Booking Confirmation Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-200/20 border-2 border-green-200 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-primary-text mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-base text-gray-600 mb-4">
          Your booking is confirmed,{" "}
          <span className="font-semibold text-primary-text">
            {bookingDetails.leadPassenger?.given_name ||
              bookingDetails.leadPassenger?.firstName ||
              "Guest"}
          </span>
          !
        </p>
        <div className="bg-stone-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Receipt className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">
              Booking Reference
            </span>
          </div>
          <p className="text-lg font-bold text-primary-text font-mono">
            {getBookingReference()}
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>
            Confirmation email sent to{" "}
            <span className="font-medium text-primary-text">
              {bookingDetails.bookingEmail ||
                bookingDetails.leadPassenger?.email ||
                "N/A"}
            </span>
          </span>
        </div>
      </div>

      {/* Trip Summary Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-xl font-bold text-primary-text mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Trip Summary
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-stone-100">
            <span className="text-gray-600 font-medium">Passenger</span>
            <span className="font-semibold text-primary-text">
              {bookingDetails.leadPassenger
                ? `${
                    bookingDetails.leadPassenger.given_name ||
                    bookingDetails.leadPassenger.firstName ||
                    ""
                  } ${
                    bookingDetails.leadPassenger.family_name ||
                    bookingDetails.leadPassenger.lastName ||
                    ""
                  }`
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-stone-100">
            <span className="text-gray-600 font-medium">Passengers</span>
            <span className="font-semibold text-primary-text">
              {bookingDetails.bookingDetails.passengers?.filter(
                (p) => p.type === "adult"
              ).length || 0}{" "}
              Adult
              {(bookingDetails.bookingDetails.passengers?.filter(
                (p) => p.type === "adult"
              ).length || 0) !== 1 && "s"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-stone-100">
            <span className="text-gray-600 font-medium">Booking Date</span>
            <span className="font-semibold text-primary-text">
              {formatDate(bookingDetails.createdAt)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 bg-stone-50 rounded-lg px-4 -mx-4">
            <span className="text-lg font-bold text-primary-text">
              Total Paid
            </span>
            <span className="text-2xl font-bold text-primary-text">
              ${getTotalAmount()}
            </span>
          </div>
        </div>
      </div>

      {/* Passenger Details and Price Breakdown Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <button
          onClick={() => setShowPassengerDetails(!showPassengerDetails)}
          className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-stone-50 to-white hover:from-stone-100 hover:to-stone-50 transition-all border-b border-stone-100"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-primary-text" />
            <span className="text-lg font-bold text-primary-text">
              {bookingDetails.bookingDetails.passengers?.length || 0} Passenger
              {(bookingDetails.bookingDetails.passengers?.length || 0) !== 1 &&
                "s"}
            </span>
          </div>
          {showPassengerDetails ? (
            <ChevronUp className="w-5 h-5 text-primary-text" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary-text" />
          )}
        </button>

        {showPassengerDetails && (
          <div className="p-6 space-y-4">
            {bookingDetails.bookingDetails.passengers?.map(
              (passenger, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-3 border-b border-stone-100 last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="text-primary-text font-semibold">
                      {passenger.type === "adult"
                        ? "Adult"
                        : passenger.type === "child"
                        ? "Child"
                        : "Infant"}{" "}
                      {index + 1}
                    </span>
                    {passenger.given_name && passenger.family_name && (
                      <span className="text-sm text-gray-600 mt-1">
                        {passenger.given_name} {passenger.family_name}
                      </span>
                    )}
                    {(passenger.type === "child" ||
                      passenger.type === "infant") &&
                      passenger.born_on && (
                        <span className="text-xs text-gray-500 mt-1">
                          Age:{" "}
                          {passenger.type === "infant"
                            ? "Under 1 year"
                            : `${
                                new Date().getFullYear() -
                                new Date(passenger.born_on).getFullYear()
                              } years`}
                        </span>
                      )}
                  </div>
                  <span className="font-semibold text-primary-text">
                    ${bookingDetails.bookingDetails.total_amount}
                  </span>
                </div>
              )
            )}

            <div className="pt-4 space-y-3 border-t border-stone-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Agency Fee</span>
                <span className="font-semibold text-primary-text">
                  ${getCommissionAmount()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  Tickets ×{" "}
                  {bookingDetails.bookingDetails.passengers?.length || 1}
                </span>
                <span className="font-semibold text-primary-text">
                  ${getTotalAmount()}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-stone-200 bg-stone-50 rounded-lg px-4 py-3 -mx-4">
                <span className="text-lg font-bold text-primary-text">
                  Total (taxes included)
                </span>
                <span className="text-xl font-bold text-primary-text">
                  ${getTotalAmount()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flight Details Cards */}
      {bookingDetails.bookingDetails.slices?.map((slice, index) => (
        <div
          key={slice.id}
          className="bg-white rounded-xl shadow-sm border border-stone-200 p-6"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-primary-green/10 rounded-full px-4 py-2">
              <div className="bg-primary-green rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-primary-text">
                {index === 0 ? "OUTBOUND" : "RETURN"}
              </h3>
            </div>
          </div>

          {slice.segments?.map((segment, segIndex) => (
            <div
              key={segment.id}
              className={`space-y-4 ${
                segIndex < slice.segments.length - 1
                  ? "pb-6 mb-6 border-b border-stone-200"
                  : ""
              }`}
            >
              {/* Flight Times */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-shrink-0 text-left">
                  <div className="text-2xl font-bold text-primary-text mb-1">
                    {formatTime(segment.departing_at)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {segment.origin?.city_name ||
                      segment.origin?.name ||
                      "Unknown"}
                  </div>
                  <div className="text-xs font-semibold text-primary-text">
                    ({segment.origin?.iata_code || "N/A"})
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center px-4">
                  <div className="text-sm text-gray-600 mb-2">
                    {formatDuration(segment.duration)}
                  </div>
                  <div className="w-full relative flex items-center">
                    <div className="h-0.5 border-t-2 border-dotted border-primary-text w-full"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                      <Plane
                        size={16}
                        className="text-primary-text rotate-45 ml-1"
                      />
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-text rounded-full"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-text rounded-full"></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {slice.segments.length > 1
                      ? `${slice.segments.length - 1} stop${
                          slice.segments.length > 1 ? "s" : ""
                        }`
                      : "Direct"}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-primary-text mb-1">
                    {formatTime(segment.arriving_at)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {segment.destination?.city_name ||
                      segment.destination?.name ||
                      "Unknown"}
                  </div>
                  <div className="text-xs font-semibold text-primary-text">
                    ({segment.destination?.iata_code || "N/A"})
                  </div>
                </div>
              </div>

              {/* Airline Info */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <div className="flex items-center gap-3">
                  {segment.marketing_carrier?.logo_symbol_url && (
                    <Image
                      src={segment.marketing_carrier.logo_symbol_url}
                      alt={segment.marketing_carrier.name || "Airline"}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-primary-text">
                      {segment.marketing_carrier_flight_number ||
                        segment.operating_carrier_flight_number ||
                        "N/A"}
                    </span>
                    <span className="text-xs text-gray-600">
                      {segment.marketing_carrier?.name ||
                        segment.operating_carrier?.name ||
                        "Unknown Airline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Next Steps and Actions Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-bold text-primary-text mb-4">Next Steps</h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-primary-green" />
            </div>
            <span className="text-sm text-gray-700">
              Check your email for e-tickets and flight details
            </span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-primary-green" />
            </div>
            <span className="text-sm text-gray-700">
              Create a myOggoAir account to manage your bookings
            </span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-primary-green" />
            </div>
            <span className="text-sm text-gray-700">
              Need help? Contact our support team
            </span>
          </div>
        </div>

        <div className="flex gap-3 items-center justify-center pt-4 border-t border-stone-200">
          <button className="flex items-center gap-2 bg-primary-green hover:bg-primary-green/90 text-primary-text px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button className="flex items-center gap-2 bg-primary-text hover:bg-primary-text/90 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
            <Share className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Mobile Ticket Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm font-medium text-blue-900">
            Great news! Your mobile ticket is purchased. It's accessible offline
            and can be used conveniently right from your phone.
          </p>
        </div>
      </div>

      {/* Customer Support and Policies Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-lg font-bold text-primary-text mb-4">
          You'll never travel alone with oggoair
        </h3>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">
              Frequently Asked Questions
            </span>
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 underline text-sm"
            >
              here
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Online Support</span>
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 underline text-sm"
            >
              here
            </a>
          </div>
        </div>
        <div className="bg-stone-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700 mb-2">
            Worry-free Travel - Explore the world at ease—you'll always be
            backed by our Service Guarantee.
          </p>
          <p className="text-sm font-bold text-primary-text">
            Great deals with reliable service
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Thank you for choosing Oggoair Customer Service Department
        </p>
        <div className="text-xs text-gray-500 space-y-2 pt-4 border-t border-stone-200">
          <p>
            Do not forward this mail as it contains your personal information
            and booking details. Copyright @2024 oggoair all rights reserved.
          </p>
          <p>
            Using oggoair website means that you agree with{" "}
            <a href="#" className="text-red-600 hover:text-red-700 underline">
              oggoair
            </a>{" "}
            <a href="#" className="text-red-600 hover:text-red-700 underline">
              Cancellation or Refund Policy
            </a>{" "}
            and{" "}
            <a href="#" className="text-red-600 hover:text-red-700 underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

      {/* Exclusive Hotel Recommendations Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-primary-green/10 rounded-full px-4 py-2">
            <span className="text-primary-text font-bold text-sm">
              Exclusive Hotel Recommendations
            </span>
          </div>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
          {[1, 2, 3, 4].map((hotel) => (
            <div
              key={hotel}
              className="flex-shrink-0 w-56 bg-stone-50 rounded-lg overflow-hidden border border-stone-200 hover:shadow-md transition-shadow"
            >
              <div className="w-full h-40 bg-gradient-to-br from-primary-green/20 to-primary-green/10"></div>
              <div className="p-4">
                <p className="text-sm font-semibold text-primary-text mb-2">
                  Islamabad Serena Hotel
                </p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  <span className="text-yellow-500">★</span>
                  <span className="text-xs font-medium text-primary-text">
                    4.9
                  </span>
                </div>
                <button className="w-full bg-primary-green hover:bg-primary-green/90 text-primary-text px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                  From Rs 5,082.21
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-primary-text rounded-full"></div>
          <div className="w-2 h-2 bg-stone-300 rounded-full"></div>
          <div className="w-2 h-2 bg-stone-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
