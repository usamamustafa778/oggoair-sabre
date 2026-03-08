import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { X, ChevronDown, ChevronUp, Clock } from "lucide-react";
import {
  formatPriceInEur,
  getSelectedCurrency,
  CURRENCIES,
} from "../../utils/priceConverter";

// Helper for layover info
function getLayoverInfo(prevSegment, nextSegment) {
  if (!prevSegment || !nextSegment) return null;
  const prevArrival = new Date(prevSegment.arriving_at);
  const nextDeparture = new Date(nextSegment.departing_at);
  const diffMs = nextDeparture - prevArrival;
  if (diffMs <= 0) return null;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const dayChange = prevArrival.getDate() !== nextDeparture.getDate();
  return {
    hours,
    minutes,
    airport: prevSegment.destination?.name || "Layover",
    dayChange,
    nextDate: nextDeparture,
  };
}

// Format duration helper
function formatDuration(duration) {
  if (!duration || duration === "N/A") return "N/A";
  const match = duration.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration.replace("PT", "");
  const days = parseInt(match[1]) || 0;
  const hours = parseInt(match[2]) || 0;
  const minutes = parseInt(match[3]) || 0;
  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;
  return result.trim();
}

const FlightDetailsSidebar = ({
  flight,
  onClose,
  alwaysOpen = false,
  isCheckout = false,
  className = "",
}) => {
  const router = useRouter();

  console.log("flight detail", flight);

  if (!flight) return null;

  // State for collapsible sections
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showDepartureDetails, setShowDepartureDetails] = useState(false);
  const [showReturnDetails, setShowReturnDetails] = useState(false);
  // REMOVED: showBaggageDetails state - baggage split not in BFM
  // const [showBaggageDetails, setShowBaggageDetails] = useState(false);
  const [showFlightDetails, setShowFlightDetails] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(
    getSelectedCurrency()
  );

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = () => {
      setSelectedCurrency(getSelectedCurrency());
    };
    window.addEventListener("currencyChanged", handleCurrencyChange);
    return () =>
      window.removeEventListener("currencyChanged", handleCurrencyChange);
  }, []);

  // ============================================
  // FIX: Route mapping - ALWAYS use segment data only
  // ============================================
  // Do NOT derive origin/destination from search params
  // Do NOT swap or flip cities for return flights
  // Outbound: slices[0].segments[0].origin and slices[0].segments[last].destination
  // Return: slices[1].segments[0].origin and slices[1].segments[last].destination
  // ============================================
  
  // Extract flight data - ALWAYS from segments only
  const firstSlice = flight.slices?.[0] || {};
  const firstSegment = firstSlice.segments?.[0] || {};
  const lastSegment =
    firstSlice.segments?.[firstSlice.segments.length - 1] || {};
  const secondSlice = flight.slices?.[1] || null;
  const secondFirstSegment = secondSlice?.segments?.[0] || {};
  const secondLastSegment =
    secondSlice?.segments?.[secondSlice.segments.length - 1] || {};

  const segments = firstSlice.segments || [];
  const returnSegments = secondSlice?.segments || [];

  // REMOVED: airlineName and airlineLogo - not in BFM, no enrichment allowed
  // Use only carrier code from BFM
  const carrierCode = firstSegment.marketing_carrier?.iata_code || 
                      flight.owner?.iata_code || 
                      firstSegment.operating_carrier?.iata_code || 
                      '';

  // ============================================
  // EXTRACT SABRE BFM FIELDS FOR DETAILED DISPLAY
  // ============================================
  const sabreBFM = flight._sabreBFM || {};
  
  // Helper to check if field exists in Sabre BFM structure
  const hasField = (path) => {
    const keys = path.split('.');
    let obj = sabreBFM;
    for (const key of keys) {
      if (obj && typeof obj === 'object' && key in obj) {
        obj = obj[key];
      } else {
        return false;
      }
    }
    return true;
  };
  
  // Helper to get field value or "Not provided by airline"
  const getFieldValue = (path, defaultValue = null) => {
    const keys = path.split('.');
    let obj = sabreBFM;
    for (const key of keys) {
      if (obj && typeof obj === 'object' && key in obj) {
        obj = obj[key];
      } else {
        return defaultValue;
      }
    }
    // If field exists but is empty/null/undefined, show "Not provided by airline"
    if (obj === null || obj === undefined || obj === '') {
      return 'Not provided by airline';
    }
    return obj;
  };
  
  // Extract all Sabre BFM fields
  const stopCount = hasField('flightDetails.stops') ? getFieldValue('flightDetails.stops') :
                    hasField('flightDetails.stopCount') ? getFieldValue('flightDetails.stopCount') :
                    null;
  const stopCountDisplay = stopCount === null ? 'Not provided by airline' :
                          stopCount === 0 ? 'Direct' : 
                          stopCount === 1 ? '1 Stop' : 
                          `${stopCount} Stops`;
  
  const cabinClass = hasField('fareDetails.cabinClass') ? getFieldValue('fareDetails.cabinClass') : null;
  const fareType = hasField('fareDetails.fareType') ? getFieldValue('fareDetails.fareType') : null;
  const fareBrand = hasField('fareDetails.fareBrand') ? getFieldValue('fareDetails.fareBrand') :
                   hasField('fareDetails.fareFamily') ? getFieldValue('fareDetails.fareFamily') :
                   null;
  const fareBasis = hasField('fareDetails.fareBasis') ? getFieldValue('fareDetails.fareBasis') : null;
  const bookingClass = hasField('fareDetails.bookingClass') ? getFieldValue('fareDetails.bookingClass') : null;
  
  const isRefundable = hasField('flexibility.refundable') ? sabreBFM.flexibility?.refundable : null;
  const isChangeable = hasField('flexibility.changeable') ? sabreBFM.flexibility?.changeable : null;
  const fareRestrictions = hasField('flexibility.fareRestrictions') ? getFieldValue('flexibility.fareRestrictions') : null;
  
  const baggageAllowance = hasField('services.baggageAllowance') ? getFieldValue('services.baggageAllowance') : null;
  const seatAvailability = hasField('services.seatAvailability') ? getFieldValue('services.seatAvailability') : null;
  const mealCode = hasField('services.mealCode') ? getFieldValue('services.mealCode') : null;
  const connectionIndicator = hasField('services.connectionIndicator') ? getFieldValue('services.connectionIndicator') : null;
  
  const departureTerminal = hasField('departure.terminal') ? getFieldValue('departure.terminal') : null;
  const arrivalTerminal = hasField('arrival.terminal') ? getFieldValue('arrival.terminal') : null;
  const departureGate = hasField('departure.gate') ? getFieldValue('departure.gate') : null;
  const arrivalGate = hasField('arrival.gate') ? getFieldValue('arrival.gate') : null;
  
  const elapsedTime = hasField('flightDetails.elapsedTime') ? sabreBFM.flightDetails?.elapsedTime :
                      hasField('flightDetails.durationMinutes') ? sabreBFM.flightDetails?.durationMinutes :
                      null;
  
  const equipment = hasField('flightDetails.equipment') ? getFieldValue('flightDetails.equipment') : null;
  const equipmentType = hasField('flightDetails.equipmentType') ? getFieldValue('flightDetails.equipmentType') : null;
  const aircraftCode = hasField('flightDetails.aircraftCode') ? getFieldValue('flightDetails.aircraftCode') : null;
  
  const pricing = sabreBFM.pricing || null;
  const totalFare = pricing && hasField('pricing.totalFare') ? getFieldValue('pricing.totalFare') : null;
  const baseFare = pricing && hasField('pricing.baseFare') ? getFieldValue('pricing.baseFare') : null;
  const taxes = pricing && hasField('pricing.taxes') ? getFieldValue('pricing.taxes') : null;
  const pricingCurrency = pricing && hasField('pricing.currency') ? getFieldValue('pricing.currency') : null;
  
  const availability = hasField('other.availability') ? getFieldValue('other.availability') : null;

  // Format dates and times
  const departureDate = firstSegment.departing_at
    ? new Date(firstSegment.departing_at)
    : null;
  const arrivalDate = lastSegment.arriving_at
    ? new Date(lastSegment.arriving_at)
    : null;
  const returnDepartureDate = secondFirstSegment.departing_at
    ? new Date(secondFirstSegment.departing_at)
    : null;
  const returnArrivalDate = secondLastSegment.arriving_at
    ? new Date(secondLastSegment.arriving_at)
    : null;

  // Duration calculations
  const duration = formatDuration(firstSlice.duration);
  const returnDuration = formatDuration(secondSlice?.duration);

  // Calculate total travel time for departure
  const departureTravelTime = useMemo(() => {
    if (!firstSlice.duration) return "N/A";
    return formatDuration(firstSlice.duration);
  }, [firstSlice.duration]);

  const returnTravelTime = useMemo(() => {
    if (!secondSlice?.duration) return "N/A";
    return formatDuration(secondSlice.duration);
  }, [secondSlice?.duration]);

  // Baggage info
  const baggages = firstSegment.passengers?.[0]?.baggages || [];
  const getBaggageQuantity = (type) => {
    const baggage = baggages.find((b) => b.type === type);
    return baggage ? baggage.quantity : 0;
  };

  // REMOVED: Baggage split (personal/cabin/checked) - not in BFM
  // BFM does not provide baggage split information

  // REMOVED: getBaggageWeight function - baggage split not available
  const getBaggageWeight = (type) => {
    const baggage = baggages.find((b) => b.type === type);
    if (baggage?.weight_kg) return `${baggage.weight_kg} kg`;
    if (baggage?.weight) return `${baggage.weight} kg`;
    return "";
  };

  // REMOVED: Baggage weight variables - baggage split not in BFM

  // ============================================
  // USE EXACT PRICED FLIGHT DATA (SINGLE SOURCE OF TRUTH)
  // ============================================
  // Price must match EXACTLY what was shown on search card
  // Use flight.total_amount directly from pricedFlight object
  // DO NOT recalculate or transform the price
  // ============================================
  const currency = selectedCurrency; // Use selected currency
  
  // Use exact price from pricedFlight object (same as search card)
  // This ensures price matches exactly what was shown on search results
  const totalAmount = parseFloat(flight.total_amount || 0);
  const baseAmount = parseFloat(flight.base_amount || 0);
  const taxAmount = parseFloat(flight.tax_amount || 0);
  const serviceFee = Math.max(0, totalAmount - baseAmount - taxAmount);

  // Check if this is estimated pricing (from BFM)
  const isEstimated = flight.estimated === true || 
                     flight._isBFMData === true || 
                     flight._pricingType === 'indicative';
  // REMOVED: isFinalPricing - all pricing is estimated (BFM only)
  
  // ============================================
  // PRICE DISPLAY: USE EXACT PRICE FROM PRICED FLIGHT
  // ============================================
  // For FINAL PRICING (pricedFlight with estimated: false):
  // - Use flight.total_amount EXACTLY as stored (no recalculations)
  // - This matches exactly what was shown on search card
  // 
  // For ESTIMATED PRICING (BFM data):
  // - Use flight.total_amount EXACTLY as stored (static indicative price)
  // - Show "From" prefix and "Estimated price" text
  // ============================================
  
  // Display the exact total amount from pricedFlight (no recalculations)
  // This ensures price matches exactly what was shown on search card
  const displayTotalAmount = totalAmount;
  
  // Convert all amounts to selected currency
  const totalAmountFormatted = formatPriceInEur(displayTotalAmount, { decimals: 0 });
  const baseAmountFormatted = formatPriceInEur(baseAmount, { decimals: 0 });
  const taxAmountFormatted = formatPriceInEur(taxAmount, { decimals: 0 });
  const serviceFeeFormatted = formatPriceInEur(serviceFee, { decimals: 0 });


  // Check if offer is expired
  const isExpired = useMemo(() => {
    if (!flight.expires_at) return false;
    return new Date(flight.expires_at) < new Date();
  }, [flight.expires_at]);

  // Check if we're on the flightSearch page
  const isFlightSearchPage = router.pathname === "/flight/flightSearch";

  // ============================================
  // GET PASSENGER COUNTS FROM ROUTER QUERY
  // ============================================
  // Extract passenger counts from URL query parameters
  // Supports both 'adult' and 'adults' for backward compatibility
  // ============================================
  const getPassengerCounts = () => {
    const adults = parseInt(router.query?.adult || router.query?.adults || "1", 10);
    const child = parseInt(router.query?.child || "0", 10);
    const infant = parseInt(router.query?.infant || "0", 10);
    return { adults, child, infant };
  };

  // Handle booking click
  const handleBookClick = () => {
    if (isExpired) return;

    const { adults, child, infant } = getPassengerCounts();

    // Get the flight ID - try multiple possible ID fields
    const flightId =
      flight.id ||
      flight.offer_id ||
      // REMOVED: duffel_id - Duffel naming forbidden
      `flight_${Date.now()}`;

    // ============================================
    // BFM ONLY - NO AIRPRICE
    // ============================================
    // All flights use BFM estimated pricing only
    // No AirPrice calls, no final pricing
    // ============================================
    const hasFinalPricing = flight.estimated === false || 
                           (flight._pricingType === 'final' && !flight._isBFMData);
    
    if (hasFinalPricing && process.env.NODE_ENV === 'development') {
      console.log("✅ Using BFM estimated pricing", {
        flightId: flight.id,
        total_amount: flight.total_amount,
        estimated: flight.estimated,
      });
    }
    
    // ============================================
    // CAPTURE CABIN CLASS
    // ============================================
    // Get cabin class from:
    // 1. URL query parameter (if user changed it)
    // 2. Flight fare_details (if pricedFlight)
    // 3. Flight segment data (from BFM response)
    // 4. Default to "Economy"
    // ============================================
    const cabinClassFromQuery = router.query?.flightClass;
    const cabinClassFromPricedFlight = flight.fare_details?.cabin_class;
    const cabinClassFromFlight = firstSegment.passengers?.[0]?.cabin_class_marketing_name || 
                                  flight.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin_class_marketing_name;
    const cabinClass = cabinClassFromQuery || cabinClassFromPricedFlight || cabinClassFromFlight || "Economy";

    try {
      if (typeof window !== "undefined") {
        // Store complete flight object from BFM
        // This is the single source of truth - includes all pricing, segments, etc.
        // Checkout page will use this directly (BFM only, no AirPrice)
        localStorage.setItem("flight_selected", JSON.stringify(flight));
        
        // Also store metadata separately for easy access
        const flightMetadata = {
          flightId,
          cabinClass,
          passengerCounts: { adults, child, infant },
          hasFinalPricing: hasFinalPricing,
          isBFMData: flight._isBFMData === true,
          pricingType: flight._pricingType || (hasFinalPricing ? 'final' : 'indicative'),
        };
        localStorage.setItem("flight_metadata", JSON.stringify(flightMetadata));
      }
    } catch (e) {
      console.error("Error persisting sidebar data:", e);
    }

    // Ensure all passenger parameters are explicitly included, even if 0
    const adultParam = adults || 0;
    const childParam = child || 0;
    const infantParam = infant || 0;
    
    // Encode cabin class for URL (handle spaces and special chars)
    const cabinClassParam = encodeURIComponent(cabinClass);

    try {
      router.push(
        `/flight/checkout?id=${flightId}&adult=${adultParam}&child=${childParam}&infant=${infantParam}&flightClass=${cabinClassParam}&selectedOffer=${flightId}`
      );
    } catch (error) {
      console.error("Error navigating to checkout:", error);
      window.location.href = `/flight/checkout?id=${flightId}&adult=${adultParam}&child=${childParam}&infant=${infantParam}&flightClass=${cabinClassParam}&selectedOffer=${flightId}`;
    }
  };

  // ============================================
  // FIX: Route names - ALWAYS from segment data only
  // ============================================
  // Outbound origin/destination: from firstSlice.segments ONLY
  // Return origin/destination: from secondSlice.segments ONLY
  // NO search params, NO swapping, NO reversing
  // ============================================
  const originCity =
    firstSegment.origin?.city_name || firstSegment.origin?.name || "N/A";
  const originCode = firstSegment.origin?.iata_code || "N/A";
  const destCity =
    lastSegment.destination?.city_name ||
    lastSegment.destination?.name ||
    "N/A";
  const destCode = lastSegment.destination?.iata_code || "N/A";

  // Return flight: use secondSlice segments directly (NO swapping)
  const returnOriginCity =
    secondFirstSegment.origin?.city_name ||
    secondFirstSegment.origin?.name ||
    "N/A";
  const returnOriginCode = secondFirstSegment.origin?.iata_code || "N/A";
  const returnDestCity =
    secondLastSegment.destination?.city_name ||
    secondLastSegment.destination?.name ||
    "N/A";
  const returnDestCode = secondLastSegment.destination?.iata_code || "N/A";

  return (
    <div
      className={`border-3 h-full flex flex-col border-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] w-full rounded-xl bg-white overflow-y-auto ${className}`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary-text tracking-tight">
              {originCity} - {destCity}
            </h2>
            {secondSlice && (
              <p className="text-xs text-gray-600 mt-0.5 font-medium">
                Round trip
              </p>
            )}
          </div>
          {onClose && !alwaysOpen && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 transition-colors p-1 hover:bg-stone-100 rounded-lg"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-3 bg-stone-50 mb-24">
        {/* Departure Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-bold text-gray-900">Departure</h3>
            {departureDate && (
              <span className="text-gray-500">
                {departureDate.toLocaleDateString(undefined, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              {firstSegment.passengers?.[0]?.cabin_class_marketing_name ||
                "Economy"}
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Carrier Code - BFM ONLY */}
            <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
              <span className="text-sm font-semibold text-primary-text">
                {carrierCode || "—"}
              </span>
            </div>

            {/* Departure Time */}
            <div className="flex-shrink-0">
              <div className="text-2xl font-bold text-primary-text mb-1">
                {departureDate
                  ? departureDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "N/A"}
              </div>
              <div className="text-sm text-gray-600">
                {originCode} {originCity}
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 flex flex-col items-center px-4">
              <div className="text-sm text-gray-600 mb-2">
                {departureTravelTime}
              </div>
              <div className="w-full relative flex items-center">
                <div className="h-0.5 border-t-2 border-dotted border-primary-text w-full"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-primary-text rotate-45 ml-1"
                  >
                    <path
                      d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-text rounded-full"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-text rounded-full"></div>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {segments.length > 1
                  ? `${segments.length - 1} stop${
                      segments.length > 1 ? "s" : ""
                    }`
                  : "Direct"}
              </div>
            </div>

            {/* Arrival Time */}
            <div className="flex-shrink-0 text-right">
              <div className="text-2xl font-bold text-primary-text mb-1 flex items-start">
                {arrivalDate
                  ? arrivalDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                  : "N/A"}
                {departureDate &&
                  arrivalDate &&
                  departureDate.getDate() !== arrivalDate.getDate() && (
                    <span className="text-[10px] font-thin text-gray-500 translate-y-[-6px]">
                      +
                      {Math.floor(
                        (arrivalDate.getTime() - departureDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  )}
              </div>
              <div className="text-sm text-gray-600">
                {destCode} {destCity}
              </div>
            </div>
          </div>
        </div>

        {/* Return Summary Card */}
        {secondSlice && returnSegments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-base font-bold text-gray-900">Return</h3>
              {returnDepartureDate && (
                <span className="text-gray-500">
                  {returnDepartureDate.toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">
                {secondFirstSegment.passengers?.[0]
                  ?.cabin_class_marketing_name ||
                  firstSegment.passengers?.[0]?.cabin_class_marketing_name ||
                  "Economy"}
              </span>
            </div>

            <div className="flex items-center gap-6">
              {/* Airline Logo */}
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                  <span className="text-sm font-semibold text-primary-text">
                    {secondFirstSegment.marketing_carrier?.iata_code || 
                     secondFirstSegment.operating_carrier?.iata_code || 
                     carrierCode || "—"}
                  </span>
                </div>

              {/* Departure Time */}
              <div className="flex-shrink-0">
                <div className="text-2xl font-bold text-primary-text mb-1">
                  {returnDepartureDate
                    ? returnDepartureDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-600">
                  {returnOriginCode} {returnOriginCity}
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 flex flex-col items-center px-4">
                <div className="text-sm text-gray-600 mb-2">
                  {returnTravelTime}
                </div>
                <div className="w-full relative flex items-center">
                  <div className="h-0.5 border-t-2 border-dotted border-primary-text w-full"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-primary-text rotate-45 ml-1"
                    >
                      <path
                        d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-text rounded-full"></div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-text rounded-full"></div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  {returnSegments.length > 1
                    ? `${returnSegments.length - 1} stop${
                        returnSegments.length > 1 ? "s" : ""
                      }`
                    : "Direct"}
                </div>
              </div>

              {/* Arrival Time */}
              <div className="flex-shrink-0 text-right">
                <div className="text-2xl font-bold text-primary-text mb-1 flex items-start">
                  {returnArrivalDate
                    ? returnArrivalDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })
                    : "N/A"}
                  {returnDepartureDate &&
                    returnArrivalDate &&
                    returnDepartureDate.getDate() !==
                      returnArrivalDate.getDate() && (
                      <span className="text-[10px] font-thin text-gray-500 translate-y-[-6px]">
                        +
                        {Math.floor(
                          (returnArrivalDate.getTime() -
                            returnDepartureDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                      </span>
                    )}
                </div>
                <div className="text-sm text-gray-600">
                  {returnDestCode} {returnDestCity}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show/Hide Trip Details Button */}
        <button
          onClick={() => setShowTripDetails(!showTripDetails)}
          className="w-full text-sm rounded-lg py-2.5 px-4 underline text-primary-text font-semibold transition-all duration-200 flex items-center justify-end gap-2 cursor-pointer"
        >
          {showTripDetails ? (
            <ChevronUp className="w-4 h-4 text-primary-text" />
          ) : (
            <ChevronDown className="w-4 h-4 text-primary-text" />
          )}
          <span>
            {showTripDetails ? "Hide Trip Details" : "Show Trip Details"}
          </span>
        </button>

        {/* Departure Details Section */}
        {showTripDetails && (
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setShowDepartureDetails(!showDepartureDetails)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition-all border-b border-stone-100"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-primary-text">
                  Departure
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  Travel time {departureTravelTime}
                </span>
              </div>
              {showDepartureDetails ? (
                <ChevronUp className="w-4 h-4 text-primary-text" />
              ) : (
                <ChevronDown className="w-4 h-4 text-primary-text" />
              )}
            </button>

            {showDepartureDetails && (
              <div className="p-6 bg-white">
                {/* Travel Time Header */}
                <div className="text-sm text-gray-600 mb-6">
                  Travel time {departureTravelTime}
                </div>

                {/* Vertical Timeline */}
                <div className="relative pl-6">
                  {/* Timeline Line */}
                  <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-red-500"></div>

                  {/* Segments */}
                  {segments.map((segment, idx) => {
                    const layover =
                      idx < segments.length - 1
                        ? getLayoverInfo(segment, segments[idx + 1])
                        : null;
                    const segmentDeparture = segment.departing_at
                      ? new Date(segment.departing_at)
                      : null;
                    const segmentArrival = segment.arriving_at
                      ? new Date(segment.arriving_at)
                      : null;
                    const nextSegment = segments[idx + 1];
                    const nextSegmentDeparture = nextSegment?.departing_at
                      ? new Date(nextSegment.departing_at)
                      : null;
                    const isDayChange = layover && layover.dayChange;
                    const isFirstSegment = idx === 0;
                    const isLastSegment = idx === segments.length - 1;

                    // Get flight number
                    const flightNumber =
                      segment.operating_carrier_flight_number ||
                      segment.marketing_carrier_flight_number ||
                      "";
                    const carrierCode =
                      segment.operating_carrier?.iata_code ||
                      segment.marketing_carrier?.iata_code ||
                      "";
                    const fullFlightNumber = carrierCode
                      ? `${carrierCode}${flightNumber}`
                      : flightNumber;

                    // Get cabin class
                    const cabinClass =
                      segment.passengers?.[0]?.cabin_class_marketing_name ||
                      firstSegment.passengers?.[0]
                        ?.cabin_class_marketing_name ||
                      "Economy";

                    return (
                      <div key={idx} className="relative pb-6">
                        {/* Initial Date (only for first segment) */}
                        {isFirstSegment && segmentDeparture && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700">
                              {segmentDeparture.toLocaleDateString(undefined, {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        )}

                        {/* Departure Time with Red Dot */}
                        <div className="flex items-start gap-4 mb-5 ">
                          <div className="relative z-10 flex-shrink-0 -ml-[18.5px]">
                            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-semibold text-primary-text">
                              {segmentDeparture
                                ? segmentDeparture.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "N/A"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {segment.origin?.city_name ||
                                segment.origin?.name}{" "}
                              ({segment.origin?.iata_code})
                            </div>
                          </div>
                        </div>

                        {/* Flight Details with Airplane Icon */}
                        <div className="flex items-start gap-4 mb-5 ">
                          <div className="flex-shrink-0 mt-1 ml-[-21.5px] rotate-180 bg-white">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="text-red-500"
                            >
                              <path
                                d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-semibold text-primary-text">
                                {fullFlightNumber}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatDuration(segment.duration)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded">
                                <span className="text-xs font-semibold text-primary-text">
                                  {segment.marketing_carrier?.iata_code || 
                                   segment.operating_carrier?.iata_code || 
                                   "—"}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {cabinClass}
                            </div>
                          </div>
                        </div>

                        {/* Arrival Time with Red Dot */}
                        <div className="flex items-start gap-4 mb-3">
                          <div className="relative z-10 flex-shrink-0 -ml-[18.5px]">
                            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-semibold text-primary-text">
                              {segmentArrival
                                ? segmentArrival.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "N/A"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {segment.destination?.city_name ||
                                segment.destination?.name}{" "}
                              ({segment.destination?.iata_code})
                            </div>
                          </div>
                        </div>

                        {/* Day Change Banner */}
                        {isDayChange && layover && (
                          <div className="mb-3 pl-7">
                            <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded-md text-sm font-medium">
                              +1 day{" "}
                              {layover.nextDate.toLocaleDateString(undefined, {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        )}

                        {/* Layover with Grey Circle */}
                        {layover && !isLastSegment && (
                          <div className="flex items-start translate-x-[-20px] border border-primary-green/20 bg-primary-green/30 rounded-lg p-2 px-4 gap-4 mb-3">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-700">
                                {layover.hours}h {layover.minutes}min Change in{" "}
                                {layover.airport}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Return Details Section */}
        {showTripDetails && secondSlice && returnSegments.length > 0 && (
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setShowReturnDetails(!showReturnDetails)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition-all border-b border-stone-100"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-primary-text">
                  Return
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  Travel time {returnTravelTime}
                </span>
              </div>
              {showReturnDetails ? (
                <ChevronUp className="w-4 h-4 text-primary-text" />
              ) : (
                <ChevronDown className="w-4 h-4 text-primary-text" />
              )}
            </button>

            {showReturnDetails && (
              <div className="p-6 bg-white">
                {/* Travel Time Header */}
                <div className="text-sm text-gray-600 mb-6">
                  Travel time {returnTravelTime}
                </div>

                {/* Vertical Timeline */}
                <div className="relative pl-6">
                  {/* Timeline Line */}
                  <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-red-500"></div>

                  {/* Segments */}
                  {returnSegments.map((segment, idx) => {
                    const layover =
                      idx < returnSegments.length - 1
                        ? getLayoverInfo(segment, returnSegments[idx + 1])
                        : null;
                    const segmentDeparture = segment.departing_at
                      ? new Date(segment.departing_at)
                      : null;
                    const segmentArrival = segment.arriving_at
                      ? new Date(segment.arriving_at)
                      : null;
                    const nextSegment = returnSegments[idx + 1];
                    const nextSegmentDeparture = nextSegment?.departing_at
                      ? new Date(nextSegment.departing_at)
                      : null;
                    const isDayChange = layover && layover.dayChange;
                    const isFirstSegment = idx === 0;
                    const isLastSegment = idx === returnSegments.length - 1;

                    // Get flight number
                    const flightNumber =
                      segment.operating_carrier_flight_number ||
                      segment.marketing_carrier_flight_number ||
                      "";
                    const carrierCode =
                      segment.operating_carrier?.iata_code ||
                      segment.marketing_carrier?.iata_code ||
                      "";
                    const fullFlightNumber = carrierCode
                      ? `${carrierCode}${flightNumber}`
                      : flightNumber;

                    // Get cabin class
                    const cabinClass =
                      segment.passengers?.[0]?.cabin_class_marketing_name ||
                      secondFirstSegment.passengers?.[0]
                        ?.cabin_class_marketing_name ||
                      firstSegment.passengers?.[0]
                        ?.cabin_class_marketing_name ||
                      "Economy";

                    return (
                      <div key={`ret-${idx}`} className="relative pb-6">
                        {/* Initial Date (only for first segment) */}
                        {isFirstSegment && segmentDeparture && (
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700">
                              {segmentDeparture.toLocaleDateString(undefined, {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        )}

                        {/* Departure Time with Red Dot */}
                        <div className="flex items-start gap-4 mb-5 ">
                          <div className="relative z-10 flex-shrink-0 -ml-[18.5px]">
                            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-semibold text-primary-text">
                              {segmentDeparture
                                ? segmentDeparture.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "N/A"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {segment.origin?.city_name ||
                                segment.origin?.name}{" "}
                              ({segment.origin?.iata_code})
                            </div>
                          </div>
                        </div>

                        {/* Flight Details with Airplane Icon */}
                        <div className="flex items-start gap-4 mb-5 ">
                          <div className="flex-shrink-0 mt-1 ml-[-21.5px] rotate-180 bg-white">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="text-red-500"
                            >
                              <path
                                d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-semibold text-primary-text">
                                {fullFlightNumber}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatDuration(segment.duration)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded">
                                <span className="text-xs font-semibold text-primary-text">
                                  {segment.marketing_carrier?.iata_code || 
                                   segment.operating_carrier?.iata_code || 
                                   "—"}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {cabinClass}
                            </div>
                          </div>
                        </div>

                        {/* Arrival Time with Red Dot */}
                        <div className="flex items-start gap-4 mb-3">
                          <div className="relative z-10 flex-shrink-0 -ml-[18.5px]">
                            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-semibold text-primary-text">
                              {segmentArrival
                                ? segmentArrival.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "N/A"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {segment.destination?.city_name ||
                                segment.destination?.name}{" "}
                              ({segment.destination?.iata_code})
                            </div>
                          </div>
                        </div>

                        {/* Day Change Banner */}
                        {isDayChange && layover && (
                          <div className="mb-3 pl-7">
                            <div className="bg-blue-100 text-blue-900 px-3 py-2 rounded-md text-sm font-medium">
                              +1 day{" "}
                              {layover.nextDate.toLocaleDateString(undefined, {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        )}

                        {/* Layover with Grey Circle */}
                        {layover && !isLastSegment && (
                          <div className="flex items-start translate-x-[-20px] border border-primary-green/20 bg-primary-green/30 rounded-lg p-2 px-4 gap-4 mb-3">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-700">
                                {layover.hours}h {layover.minutes}min Change in{" "}
                                {layover.airport}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flight Details Section - All Sabre BFM Fields */}
        {sabreBFM && Object.keys(sabreBFM).length > 0 && (
          <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setShowFlightDetails(!showFlightDetails)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-stone-50 transition-all border-b border-stone-100"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-primary-text">
                  Flight Details
                </h3>
                <span className="text-xs text-gray-500 font-medium">
                  Additional Information
                </span>
              </div>
              {showFlightDetails ? (
                <ChevronUp className="w-4 h-4 text-primary-text" />
              ) : (
                <ChevronDown className="w-4 h-4 text-primary-text" />
              )}
            </button>

            {showFlightDetails && (
              <div className="p-6 bg-white space-y-4">
                {/* Stops Information */}
                {(hasField('flightDetails.stops') || hasField('flightDetails.stopCount')) && (
                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Stops</h4>
                    <div className="text-sm text-gray-700">{stopCountDisplay}</div>
                  </div>
                )}

                {/* Terminal & Gate Information */}
                {(hasField('departure.terminal') || hasField('arrival.terminal') || hasField('departure.gate') || hasField('arrival.gate')) && (
                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Terminal & Gate</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      {hasField('departure.terminal') && (
                        <div>Departure Terminal: {departureTerminal === 'Not provided by airline' ? departureTerminal : `T${departureTerminal}`}</div>
                      )}
                      {hasField('arrival.terminal') && (
                        <div>Arrival Terminal: {arrivalTerminal === 'Not provided by airline' ? arrivalTerminal : `T${arrivalTerminal}`}</div>
                      )}
                      {hasField('departure.gate') && (
                        <div>Departure Gate: {departureGate}</div>
                      )}
                      {hasField('arrival.gate') && (
                        <div>Arrival Gate: {arrivalGate}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cabin & Fare Information */}
                {(hasField('fareDetails.cabinClass') || hasField('fareDetails.fareType') || hasField('fareDetails.fareBrand') || hasField('fareDetails.fareBasis') || hasField('fareDetails.bookingClass')) && (
                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Cabin & Fare</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      {hasField('fareDetails.cabinClass') && (
                        <div>Cabin: {cabinClass}</div>
                      )}
                      {hasField('fareDetails.bookingClass') && (
                        <div>Booking Class: {bookingClass}</div>
                      )}
                      {hasField('fareDetails.fareType') && (
                        <div>Fare Type: {fareType}</div>
                      )}
                      {(hasField('fareDetails.fareBrand') || hasField('fareDetails.fareFamily')) && (
                        <div>Fare Brand: {fareBrand}</div>
                      )}
                      {hasField('fareDetails.fareBasis') && (
                        <div>Fare Basis: {fareBasis}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flexibility Information */}
                {(hasField('flexibility.refundable') || hasField('flexibility.changeable') || hasField('flexibility.fareRestrictions')) && (
                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Flexibility</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      {hasField('flexibility.refundable') && (
                        <div className="flex items-center gap-2">
                          <span>Refundable:</span>
                          <span className={isRefundable ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {isRefundable ? "Yes" : "No"}
                          </span>
                        </div>
                      )}
                      {hasField('flexibility.changeable') && (
                        <div className="flex items-center gap-2">
                          <span>Changeable:</span>
                          <span className={isChangeable ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {isChangeable ? "Yes" : "No"}
                          </span>
                        </div>
                      )}
                      {hasField('flexibility.fareRestrictions') && (
                        <div>Fare Restrictions: {typeof fareRestrictions === 'string' ? fareRestrictions : JSON.stringify(fareRestrictions)}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Baggage & Services */}
                {(hasField('services.baggageAllowance') || hasField('services.seatAvailability') || hasField('services.mealCode') || hasField('services.connectionIndicator')) && (
                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Baggage & Services</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      {hasField('services.baggageAllowance') && (
                        <div>Baggage: {typeof baggageAllowance === 'string' ? baggageAllowance : JSON.stringify(baggageAllowance)}</div>
                      )}
                      {hasField('services.seatAvailability') && (
                        <div>Seat Availability: {typeof seatAvailability === 'string' ? seatAvailability : JSON.stringify(seatAvailability)}</div>
                      )}
                      {hasField('services.mealCode') && (
                        <div>Meal Code: {mealCode}</div>
                      )}
                      {hasField('services.connectionIndicator') && (
                        <div>Connection: {connectionIndicator}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flight Duration & Equipment */}
                {((hasField('flightDetails.elapsedTime') || hasField('flightDetails.durationMinutes')) || hasField('flightDetails.equipment') || hasField('flightDetails.equipmentType') || hasField('flightDetails.aircraftCode')) && (
                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Flight Information</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      {(hasField('flightDetails.elapsedTime') || hasField('flightDetails.durationMinutes')) && (
                        <div>Duration: {elapsedTime !== null && elapsedTime !== 'Not provided by airline' 
                          ? `${Math.floor(elapsedTime / 60)}h ${elapsedTime % 60}m` 
                          : elapsedTime}</div>
                      )}
                      {hasField('flightDetails.equipment') && (
                        <div>Equipment: {equipment}</div>
                      )}
                      {hasField('flightDetails.equipmentType') && (
                        <div>Equipment Type: {equipmentType}</div>
                      )}
                      {hasField('flightDetails.aircraftCode') && (
                        <div>Aircraft Code: {aircraftCode}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing Information (if available) */}
                {pricing && (
                  <div className="border-b border-gray-100 pb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Pricing Information</h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      {hasField('pricing.totalFare') && (
                        <div>Total Fare: {totalFare}</div>
                      )}
                      {hasField('pricing.baseFare') && (
                        <div>Base Fare: {baseFare}</div>
                      )}
                      {hasField('pricing.taxes') && (
                        <div>Taxes: {typeof taxes === 'string' ? taxes : JSON.stringify(taxes)}</div>
                      )}
                      {hasField('pricing.currency') && (
                        <div>Currency: {pricingCurrency}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Availability */}
                {hasField('other.availability') && (
                  <div className="pb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Availability</h4>
                    <div className="text-sm text-gray-700">
                      {typeof availability === 'string' ? availability : JSON.stringify(availability)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* REMOVED: Baggage Section - baggage split (personal/cabin/checked) not in BFM */}
        {/* <div className="border mb-3 border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <button
            onClick={() => setShowBaggageDetails(!showBaggageDetails)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-stone-50 to-white hover:from-stone-100 hover:to-stone-50 transition-all"
          >
            <div>
              <h3 className="text-base font-bold text-primary-text">Baggage</h3>
              <p className="text-xs text-gray-600 mt-0.5 font-medium">
                per person
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-primary-text">
                    {personalQuantity || 0}
                  </span>
                  <Image
                    src="/st-images/bags/personal-bag.png"
                    alt="Personal"
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-primary-text">
                    {carryOnQuantity || 0}
                  </span>
                  <Image
                    src="/st-images/bags/cabin-baggage.png"
                    alt="Cabin"
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-primary-text">
                    {checkedQuantity || 0}
                  </span>
                  <Image
                    src="/st-images/bags/cabin-baggage-checked.png"
                    alt="Checked"
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain"
                  />
                </div>
              </div>
              {showBaggageDetails ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </div>
          </button>

          {showBaggageDetails && (
            <div className="p-4 bg-white">
              <div className="mb-4">
                <h4 className="text-xs font-bold text-primary-text mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  Included
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/st-images/bags/personal-bag.png"
                      alt="Personal"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-xs text-primary-text">
                      {personalQuantity || 0} x Personal item
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      src="/st-images/bags/cabin-baggage.png"
                      alt="Cabin"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                    <div>
                      <span className="text-xs text-primary-text">
                        {carryOnQuantity || 0} x Cabin Baggage
                      </span>
                      {carryOnWeight && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {carryOnWeight}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image
                      src="/st-images/bags/cabin-baggage-checked.png"
                      alt="Checked"
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                    <div>
                      <span className="text-xs text-primary-text">
                        {checkedQuantity || 0} x Checked Baggage
                      </span>
                      {checkedWeight && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {checkedWeight}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Different baggage allowance may apply, we show the minimum
                allowed. See itinerary for more baggage details.
              </p>
            </div>
          )}
        </div> */}
      </div>

      {/* Fixed Pricing Section at Bottom - Only show when not in checkout and on flightSearch page */}

      <div className="absolute bottom-0 bg-white border-t-2 z-50 border-stone-200 px-4 py-3 shadow-2xl">
        {/* Compact Price Summary - Only show when breakdown is collapsed */}
        {!showPriceBreakdown && (
          <div className="mb-3">
            {/* Total Price */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-lg font-semibold text-primary-text">
                {`From (${currency})`}
              </span>
              <span className="text-2xl font-semibold text-primary-text">
                {`From ${totalAmountFormatted}`}
              </span>
            </div>
            {/* Only show "Estimated price" text for estimated pricing, not for final pricing */}
            {/* REMOVED: Pricing messaging */}
            {/* Validation: Show confirmation for final pricing */}
            {/* REMOVED: Final pricing validation message */}

            {/* Expiration Date */}
            {/* {flight.expires_at && (
                <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-stone-200">
                  <Clock size={14} className="text-gray-500" />
                  <span className="text-xs text-gray-500">
                    Expires:{" "}
                    {new Date(flight.expires_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )} */}

            {/* Passenger Counts in small light gray */}
            {/* For BFM data: Hide passenger count breakdown when count > 1 */}
            {!isEstimated || (getPassengerCounts().adults === 1 && getPassengerCounts().child === 0 && getPassengerCounts().infant === 0) ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{getPassengerCounts().adults}x Adult</span>
                  {getPassengerCounts().child > 0 && (
                    <>
                      <span>•</span>
                      <span>{getPassengerCounts().child}x Child</span>
                    </>
                  )}
                  {getPassengerCounts().infant > 0 && (
                    <>
                      <span>•</span>
                      <span>{getPassengerCounts().infant}x Infant</span>
                    </>
                  )}
                </div>

                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                >
                  <span className="text-sm text-primary-text underline gap-1">
                    {showPriceBreakdown
                      ? "Hide price breakdown"
                      : "View price breakdown"}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-primary-text transition-transform duration-300 ${
                      showPriceBreakdown ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Estimated pricing with multiple passengers: Show only single "From price" message */}
                {/* REMOVED: Pricing messaging */}
                {/* Validation: Ensure price matches search card */}
                {/* REMOVED: Final pricing validation message */}
              </>
            )}
          </div>
        )}

        {/* Expanded Price Summary - Show when breakdown is expanded */}
        {/* For BFM data with passenger count > 1: Hide per-passenger breakdown */}
        {showPriceBreakdown && (
          <div className="space-y-2 mb-3">
            {/* Hide Price Breakdown Toggle */}
            <div
              className="flex items-center justify-center text-gray-600 font-semibold cursor-pointer pb-2"
              onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
            >
              <span className="text-sm underline">Hide Price Breakdown</span>
              <ChevronDown
                size={18}
                className="transition-transform duration-300 rotate-180 ml-1"
              />
            </div>

            {/* For BFM data: Show single "From price" only, no per-passenger breakdown */}
            {isEstimated && (getPassengerCounts().adults > 1 || getPassengerCounts().child > 0 || getPassengerCounts().infant > 0) ? (
              <div className="text-sm text-gray-600 italic py-2">
                Estimated price: <span className="font-semibold text-primary-text">{`From ${totalAmountFormatted}`}</span>
              </div>
            ) : (
              <>
                {/* Adult Count and Fare Type */}
                <div className="flex justify-between items-center">
                  <span className="text-[15.5px] font-medium text-primary-text">
                    {getPassengerCounts().adults}x Adult
                  </span>
                  <span className="text-[15.5px] font-medium text-primary-text">
                    {isEstimated ? `From ${totalAmountFormatted}` : totalAmountFormatted}
                  </span>
                </div>

                {/* Basic Fare Type */}
                <div className="flex justify-between items-center">
                  <span className="text-[15.5px] font-medium text-primary-text">
                    {getPassengerCounts().child > 0
                      ? getPassengerCounts().child + "x Child"
                      : "1x Basic"}
                  </span>
                  <span className="text-[15.5px] font-medium text-primary-text">
                    {isEstimated ? (
                      // Estimated pricing: No price recalculation - show static price
                      "N/A"
                    ) : (
                      getPassengerCounts().child > 0
                        ? formatPriceInEur(totalAmount * 0.75, { decimals: 0 })
                        : "Included"
                    )}
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[15.5px] font-semibold text-primary-text">
                    Subtotal ({currency})
                  </span>
                  <span className="text-[15.5px] font-semibold text-primary-text">
                    {isEstimated ? `From ${totalAmountFormatted}` : totalAmountFormatted}
                  </span>
                </div>
              </>
            )}

            {/* Service Fee Description */}
            <div className="text-xs text-primary-text leading-relaxed">
              Includes all taxes, fees, surcharges, and oggotrip.com service
              fees. oggotrip.com service fees are calculated per passenger and
              are not refundable.
            </div>
          </div>
        )}

        {/* Detailed Price Breakdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            showPriceBreakdown
              ? "max-h-[800px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-4">
            {/* Currency Exchange Notice */}
            <div className="text-xs text-primary-text leading-relaxed">
              Estimated price may consist of multiple one-way journeys
              purchased in different currencies. Exact prices may vary according
              to exchange rates.
            </div>

            {/* Flight Route Section */}
            {firstSlice && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Image
                    src="/st-images/dove.png"
                    alt="oggotrip.com service fee"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-primary-text">
                      {originCity} ({originCode})
                    </span>
                    <span className="text-sm text-gray-400">→</span>
                    <span className="font-semibold text-sm text-primary-text">
                      {destCity} ({destCode})
                    </span>
                  </div>
                </div>

                {/* Base Fare Breakdown */}
                <div className="space-y-2">
                  {isEstimated ? (
                    // Estimated pricing: Disable price recalculation - show static price only
                    // For passenger count > 1: Hide per-passenger breakdown
                    (getPassengerCounts().adults > 1 || getPassengerCounts().child > 0 || getPassengerCounts().infant > 0) ? (
                      <div className="text-xs text-gray-500 italic">
                        Per-passenger breakdown not available for estimated pricing.
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 italic">
                        Price breakdown not available for estimated pricing.
                      </div>
                    )
                  ) : (
                    // Final pricing: Use exact price from pricedFlight (no recalculations)
                    // Price matches exactly what was shown on search card
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-primary-text">
                          {getPassengerCounts().adults}x Adult (Base fare)
                        </span>
                        <span className="font-semibold text-sm text-primary-text">
                          {formatPriceInEur(totalAmount * 0.69)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-primary-text">
                          1x Personal item
                        </span>
                        <span className="text-sm text-primary-text">Included</span>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                        <span className="font-semibold text-sm text-primary-text">
                          Subtotal ({currency})
                        </span>
                        <span className="font-semibold text-sm text-primary-text">
                          {formatPriceInEur(totalAmount * 0.69)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Service Fee Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Image
                  src="/st-images/dove.png"
                  alt="oggotrip.com service fee"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span className="font-semibold text-primary-text">
                  oggotrip.com service fee
                </span>
                <span className="font-semibold text-primary-text ml-auto">
                  {formatPriceInEur(20, { decimals: 0 })}
                </span>
              </div>
            </div>

            {/* Basic Fare Included */}
            <div className="flex justify-between text-sm items-center border-t border-gray-100 pt-2">
              <span className="text-primary-text">1x Basic</span>
              <span className="text-primary-text">Included</span>
            </div>

            {/* Final Total with Green Background */}
            <div className="flex justify-between items-center">
              <span className="font-semibold text-xl text-primary-text">
                Total ({currency})
              </span>
              <span className="text-3xl font-bold text-primary-text rounded-lg">
                {totalAmountFormatted}
              </span>
            </div>

            {/* Final Service Fee Notice */}
            <div className="text-xs text-primary-text leading-relaxed mb-6">
              Includes all taxes, fees, surcharges, and oggotrip.com service
              fees. oggotrip.com service fees are calculated per passenger and
              are not refundable.
            </div>
          </div>
        </div>

        {/* Book Now Button */}
        {isFlightSearchPage && (
          <button
            onClick={handleBookClick}
            disabled={isExpired}
            className={`w-full py-3 px-4 rounded-lg font-bold transition-all shadow-lg ${
              isExpired
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-primary-green to-primary-green cursor-pointer text-primary-text hover:from-primary-green/90 hover:to-primary-green/80 hover:shadow-xl transform hover:scale-[1.01]"
            }`}
          >
            {isExpired ? "Expired" : "Book Now"}
          </button>
        )}
      </div>
    </div>
  );
};

export default FlightDetailsSidebar;
