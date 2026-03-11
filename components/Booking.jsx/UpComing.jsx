import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Plane } from "lucide-react";
import { deriveBookingStatus, derivePaymentStatus } from "../../utils/bookingStatus";

function UpComing({ bookings = [], loading = false, error = null }) {
  const router = useRouter();
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

  // Get detailed flight segment info (for card layout)
  const getFlightSegments = (booking) => {
    if (booking.flightData?.slices && booking.flightData.slices.length > 0) {
      const firstSlice = booking.flightData.slices[0];
      const segments = firstSlice.segments || [];
      if (segments.length > 0) {
        return { slice: firstSlice, segments };
      }
    }
    if (booking.segments && booking.segments.length > 0) {
      return { slice: { duration: booking.duration }, segments: booking.segments };
    }
    if (booking.flightDetails?.segments && booking.flightDetails.segments.length > 0) {
      return {
        slice: { duration: booking.flightDetails.duration },
        segments: booking.flightDetails.segments,
      };
    }
    return { slice: null, segments: [] };
  };

  const formatDuration = (durationStr) => {
    if (!durationStr || durationStr === "N/A") return "N/A";

    if (durationStr.startsWith("PT")) {
      const hours = parseInt(durationStr.match(/(\d+)H/)?.[1] || "0", 10);
      const minutes = parseInt(durationStr.match(/(\d+)M/)?.[1] || "0", 10);
      const h = hours.toString().padStart(2, "0");
      const m = minutes.toString().padStart(2, "0");
      return `${h}h ${m}min`;
    }

    const hourMatch = durationStr.match(/(\d+)h/i);
    const minuteMatch = durationStr.match(/(\d+)min/i);
    if (hourMatch || minuteMatch) {
      const hours = parseInt(hourMatch?.[1] || "0", 10);
      const minutes = parseInt(minuteMatch?.[1] || "0", 10);
      const h = hours.toString().padStart(2, "0");
      const m = minutes.toString().padStart(2, "0");
      return `${h}h ${m}min`;
    }

    return durationStr;
  };

  const getStopInfo = (segments) => {
    if (!segments || segments.length <= 1) {
      return "Direct";
    }
    const numberOfStops = segments.length - 1;
    return `${numberOfStops} stop${numberOfStops > 1 ? "s" : ""}`;
  };

  const getBaggageInfo = (booking) => {
    const { segments } = getFlightSegments(booking);
    const firstSegment = segments?.[0];
    const passenger = firstSegment?.passengers?.[0];
    if (!passenger?.baggages) {
      return { checkedCount: 0, carryOnCount: 0, personalCount: 0 };
    }

    let checkedCount = 0;
    let carryOnCount = 0;
    let personalCount = 0;

    passenger.baggages.forEach((bag) => {
      if (bag.type === "checked") checkedCount = bag.quantity;
      else if (bag.type === "carry_on") carryOnCount = bag.quantity;
      else if (bag.type === "personal") personalCount = bag.quantity;
    });

    return { checkedCount, carryOnCount, personalCount };
  };

  const getPrice = (booking) => {
    const flightData = booking.flightData || booking.flightDetails || {};
    const amount =
      flightData.total_amount ||
      booking.amount ||
      booking.payment?.totalAmount ||
      booking.payment?.amount ||
      0;
    if (!amount) return null;
    const value = Number(amount);
    if (!isFinite(value) || value <= 0) return null;
    return `€${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
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

  // Get booking details for display
  const getBookingDetails = (booking) => {
    return {
      bookingReference: booking.bookingReference || booking.id || "N/A",
    };
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
        const details = getBookingDetails(booking);
        const { slice, segments } = getFlightSegments(booking);
        const firstSegment = segments?.[0] || {};
        const lastSegment = segments?.[segments.length - 1] || {};
        const airlineName =
          firstSegment.marketing_carrier?.name ||
          booking.flightData?.owner?.name ||
          "Unknown Airline";
        const airlineLogo =
          firstSegment.marketing_carrier?.logo_symbol_url ||
          booking.flightData?.owner?.logo_symbol_url ||
          "/st-images/flightSearch/a.png";
        const stopInfo = getStopInfo(segments);
        const durationText = formatDuration(slice?.duration || booking.duration);
        const baggageInfo = getBaggageInfo(booking);
        const priceText = getPrice(booking);

        return (
          <div
            key={bookingId}
            onClick={() => {
              if (details.bookingReference && typeof window !== "undefined") {
                router.push(`/dashboard/bookings/${details.bookingReference}`);
              }
            }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:border-primary-green/30 transition-all cursor-pointer"
          >
            <div className="flex flex-col md:flex-row">
              {/* Main flight info */}
              <div className="flex-1 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-primary-text px-3 py-1.5 rounded-full bg-primary-green/10 border border-primary-green/20">
                    {bookingType}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  {/* Airline Logo */}
                  <div className="flex-shrink-0">
                    <Image
                      src={airlineLogo}
                      alt={airlineName}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain"
                    />
                  </div>

                  {/* Departure */}
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-primary-text mb-1">
                      {formatTime(bookingTime || firstSegment.departing_at)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {firstSegment.origin?.iata_code || routeInfo.originStation}{" "}
                      {firstSegment.origin?.city_name || routeInfo.origin}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 flex flex-col items-center px-4">
                    <div className="text-sm text-gray-600 mb-2">
                      {durationText}
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
                    <div className="text-sm text-gray-600 mt-2">{stopInfo}</div>
                  </div>

                  {/* Arrival */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-primary-text mb-1">
                      {formatTime(lastSegment.arriving_at || bookingTime)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {lastSegment.destination?.iata_code ||
                        routeInfo.destinationStation}{" "}
                      {lastSegment.destination?.city_name ||
                        routeInfo.destination}
                    </div>
                  </div>
                </div>

                {/* Date + baggage row */}
                <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-gray-200">
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

                  {/* Baggage summary (moved from right column) */}
                  <div className="flex items-center gap-3">
                    {[
                      {
                        count: baggageInfo.personalCount || 0,
                        label: "Personal",
                        icon: "/st-images/bags/personal-bag.png",
                      },
                      {
                        count: baggageInfo.carryOnCount || 0,
                        label: "Cabin",
                        icon: "/st-images/bags/cabin-baggage.png",
                      },
                      {
                        count: baggageInfo.checkedCount || 0,
                        label: "Checked",
                        icon: "/st-images/bags/cabin-baggage-checked.png",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-1 text-primary-text"
                      >
                        <Image
                          src={item.icon}
                          alt={`${item.label} baggage`}
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain"
                        />
                        <span className="text-xs font-semibold text-gray-700">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default UpComing;
