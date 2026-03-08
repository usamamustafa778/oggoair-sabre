import React, { useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronDown } from "lucide-react";

function UpComing({ bookings = [], loading = false, error = null }) {
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [expandedPassengers, setExpandedPassengers] = useState({});
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const options = { weekday: "short", month: "short", day: "numeric" };
      return date.toLocaleDateString("en-US", options);
    } catch (e) {
      return dateString;
    }
  };

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get booking type
  const getBookingType = (booking) => {
    if (booking.type) return booking.type;
    if (booking.bookingType) return booking.bookingType;
    if (booking.flightData || booking.flightDetails || booking.segments)
      return "Flight";
    if (booking.busDetails) return "Bus";
    if (booking.hotelDetails) return "Hotel";
    return "Booking";
  };

  // Get origin and destination
  const getRouteInfo = (booking) => {
    // Check flightData.slices structure (primary source from API)
    if (booking.flightData?.slices && booking.flightData.slices.length > 0) {
      const firstSlice = booking.flightData.slices[0];
      return {
        origin:
          firstSlice.origin?.city_name || firstSlice.origin?.name || "Origin",
        originStation: firstSlice.origin?.iata_code || "",
        destination:
          firstSlice.destination?.city_name ||
          firstSlice.destination?.name ||
          "Destination",
        destinationStation: firstSlice.destination?.iata_code || "",
      };
    }
    if (booking.origin && booking.destination) {
      return {
        origin: booking.origin,
        originStation: booking.originStation || booking.originAirport || "",
        destination: booking.destination,
        destinationStation:
          booking.destinationStation || booking.destinationAirport || "",
      };
    }
    if (booking.flightDetails) {
      return {
        origin:
          booking.flightDetails.origin?.city ||
          booking.flightDetails.origin?.name ||
          "Origin",
        originStation:
          booking.flightDetails.origin?.iata_code ||
          booking.flightDetails.origin?.name ||
          "",
        destination:
          booking.flightDetails.destination?.city ||
          booking.flightDetails.destination?.name ||
          "Destination",
        destinationStation:
          booking.flightDetails.destination?.iata_code ||
          booking.flightDetails.destination?.name ||
          "",
      };
    }
    if (booking.segments && booking.segments.length > 0) {
      const firstSegment = booking.segments[0];
      const lastSegment = booking.segments[booking.segments.length - 1];
      return {
        origin:
          firstSegment.origin?.city_name ||
          firstSegment.origin?.name ||
          "Origin",
        originStation:
          firstSegment.origin?.iata_code || firstSegment.origin?.name || "",
        destination:
          lastSegment.destination?.city_name ||
          lastSegment.destination?.name ||
          "Destination",
        destinationStation:
          lastSegment.destination?.iata_code ||
          lastSegment.destination?.name ||
          "",
      };
    }
    return {
      origin: "Origin",
      originStation: "",
      destination: "Destination",
      destinationStation: "",
    };
  };

  // Get booking date
  const getBookingDate = (booking) => {
    // Check flightData.slices[0].segments[0].departing_at (primary source)
    if (
      booking.flightData?.slices &&
      booking.flightData.slices.length > 0 &&
      booking.flightData.slices[0].segments &&
      booking.flightData.slices[0].segments.length > 0 &&
      booking.flightData.slices[0].segments[0].departing_at
    ) {
      return booking.flightData.slices[0].segments[0].departing_at;
    }
    return (
      booking.departureDate ||
      booking.travelDate ||
      booking.date ||
      booking.flightDetails?.departing_at ||
      (booking.segments && booking.segments[0]?.departing_at) ||
      booking.createdAt
    );
  };

  // Get booking time
  const getBookingTime = (booking) => {
    // Check flightData.slices[0].segments[0].departing_at (primary source)
    if (
      booking.flightData?.slices &&
      booking.flightData.slices.length > 0 &&
      booking.flightData.slices[0].segments &&
      booking.flightData.slices[0].segments.length > 0 &&
      booking.flightData.slices[0].segments[0].departing_at
    ) {
      return booking.flightData.slices[0].segments[0].departing_at;
    }
    return (
      booking.time ||
      booking.flightDetails?.departing_at ||
      (booking.segments && booking.segments[0]?.departing_at)
    );
  };

  // Get booking image
  const getBookingImage = (booking) => {
    if (booking.image || booking.img) return booking.image || booking.img;
    if (booking.flightData || booking.flightDetails || booking.segments)
      return "/st-images/booking/card1.png";
    if (booking.busDetails) return "/st-images/booking/card2.png";
    if (booking.hotelDetails) return "/st-images/booking/card5.png";
    return "/st-images/booking/card1.png";
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-12 lg:p-16">
            <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="animate-pulse space-y-4 w-full">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
          <div className="p-12 lg:p-16">
            <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Error Loading Bookings
              </h3>
              <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-lg mx-auto">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-12 lg:p-16">
            <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
              {/* Image */}
              <div className="w-32 h-32 md:w-40 md:h-40 mb-6 flex-shrink-0">
                <Image
                  src="/st-images/booking/upcoming.png"
                  alt="Upcoming Journey"
                  width={160}
                  height={160}
                  className="w-full h-full object-contain opacity-80"
                />
              </div>
              {/* Text Content */}
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  No Upcoming Journeys Scheduled
                </h3>
                <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-lg mx-auto">
                  Please retrieve any outstanding bookings not currently
                  displayed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const toggleBooking = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const togglePassengers = (bookingId) => {
    setExpandedPassengers((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  // Get booking details for display
  const getBookingDetails = (booking) => {
    const details = {
      bookingReference: booking.bookingReference || booking.id || "N/A",
      status: booking.bookingStatus || booking.status || "N/A",
      email: booking.email || "N/A",
      phone:
        booking.fullPhone ||
        (booking.phone
          ? `${booking.phone.dialingCode} ${booking.phone.number}`
          : "N/A"),
      passengers: booking.passengers || [],
      createdAt: booking.createdAt || booking.summary?.createdAt || "N/A",
      totalAmount:
        booking.flightData?.total_amount ||
        booking.flightData?.intended_total_amount ||
        "N/A",
      currency:
        booking.flightData?.total_currency ||
        booking.flightData?.base_currency ||
        "USD",
    };
    return details;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {bookings.map((booking, index) => {
        const routeInfo = getRouteInfo(booking);
        const bookingDate = getBookingDate(booking);
        const bookingTime = getBookingTime(booking);
        const bookingType = getBookingType(booking);
        const bookingImage = getBookingImage(booking);
        const bookingId =
          booking.id || booking._id || booking.bookingId || index;
        const isExpanded = expandedBooking === bookingId;
        const details = getBookingDetails(booking);
        const passengersExpanded = expandedPassengers[bookingId] || false;

        return (
          <div
            key={bookingId}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-6">
              {/* Image */}
              <div className="w-full md:w-48 lg:w-56 h-40 md:h-auto flex-shrink-0">
                <Image
                  src={bookingImage}
                  alt="Journey"
                  width={300}
                  height={200}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-primary-text px-3 py-1.5 rounded-full bg-primary-green/10 border border-primary-green/20">
                      {bookingType}
                    </span>
                    <button
                      onClick={() => toggleBooking(bookingId)}
                      className="p-2 bg-primary-green text-primary-text rounded-full hover:bg-primary-green/90 transition-all shadow-sm hover:shadow-md"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Route Info */}
                  <div className="flex items-start gap-4 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-shrink-0">
                      <Image
                        src="/st-images/booking/location.png"
                        alt="Location"
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <p className="font-bold text-base text-gray-900">
                          {routeInfo.origin}
                        </p>
                        {routeInfo.originStation && (
                          <p className="text-sm text-gray-600 mt-0.5">
                            {routeInfo.originStation}
                          </p>
                        )}
                      </div>
                      <div className="w-px h-4 bg-gray-300 mx-2 my-1"></div>
                      <div>
                        <p className="font-bold text-base text-gray-900">
                          {routeInfo.destination}
                        </p>
                        {routeInfo.destinationStation && (
                          <p className="text-sm text-gray-600 mt-0.5">
                            {routeInfo.destinationStation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/st-images/booking/calendar.png"
                      alt="Calendar"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      {formatDate(bookingDate)}
                    </span>
                  </div>
                  {bookingTime && (
                    <div className="flex items-center gap-2">
                      <Image
                        src="/st-images/booking/time.png"
                        alt="Time"
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        {formatTime(bookingTime)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expandable Details Section */}
            {isExpanded && (
              <div className="border-t border-gray-200 pt-6 px-6 pb-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Booking Information */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900 mb-4">
                      Booking Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">
                          Booking Reference
                        </p>
                        <p className="text-base text-gray-900">
                          {details.bookingReference}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600">
                          Status
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            details.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : details.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {details.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600">
                          Total Amount
                        </p>
                        <p className="text-base text-gray-900 font-semibold">
                          {details.currency} {details.totalAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600">
                          Booking Date
                        </p>
                        <p className="text-base text-gray-900">
                          {formatDate(details.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900 mb-4">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">
                          Email
                        </p>
                        <p className="text-base text-gray-900">
                          {details.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600">
                          Phone
                        </p>
                        <p className="text-base text-gray-900">
                          {details.phone}
                        </p>
                      </div>
                      {details.passengers.length > 0 && (
                        <div>
                          <button
                            onClick={() => togglePassengers(bookingId)}
                            className="w-full flex items-center justify-between text-sm font-semibold text-gray-600 mb-2 hover:text-gray-900 transition-colors"
                          >
                            <span>
                              Passengers ({details.passengers.length})
                            </span>
                            {passengersExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          {passengersExpanded && (
                            <div className="space-y-2 mt-2">
                              {details.passengers.map((passenger, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white p-3 rounded-lg border border-gray-200"
                                >
                                  <p className="text-sm text-gray-900 font-medium">
                                    {passenger.title} {passenger.firstName}{" "}
                                    {passenger.lastName}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {passenger.passengerType || "Adult"}
                                  </p>
                                  {passenger.dateOfBirth && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      DOB: {passenger.dateOfBirth.day}/
                                      {passenger.dateOfBirth.month}/
                                      {passenger.dateOfBirth.year}
                                    </p>
                                  )}
                                  {passenger.passportNumber && (
                                    <p className="text-xs text-gray-500">
                                      Passport: {passenger.passportNumber}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default UpComing;
