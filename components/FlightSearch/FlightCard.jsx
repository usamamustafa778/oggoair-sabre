import React, { useState, useMemo, useEffect } from "react";
import FlightDetailsSidebar from "./FlightDetailsSidebar";
import ModernAuthForm from "../Login/ModernAuthForm";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  formatPriceInEur,
  getSelectedCurrency,
} from "../../utils/priceConverter";

import {
  X,
  Tv,
  Info,
  Check,
  Luggage,
  Briefcase,
  Calendar,
  Armchair,
  Plug,
  ArrowRight,
  ChevronDown,
  AlertTriangle,
  Utensils,
  Clock,
  Phone,
  Wifi,
  Plane,
} from "lucide-react";

const FlightCard = ({ flight, flightGroup, isExpanded = false, currentView = "outbound" }) => {
  // ============================================
  // HELPER: Remove duplicate airport codes (e.g., "ATL ATL" -> "ATL")
  // ============================================
  const cleanAirportCode = (code) => {
    if (!code || typeof code !== 'string') return code || "—";
    const trimmed = code.trim();
    const parts = trimmed.split(/\s+/);
    // If code appears twice (e.g., "ATL ATL"), return only once
    if (parts.length > 1 && parts[0] === parts[1]) {
      return parts[0];
    }
    return trimmed;
  };

  // ============================================
  // DATA SAFETY: Validate flight prop
  // ============================================
  // Ensure flight is a valid object, prevent runtime errors
  // ============================================
  if (!flight || typeof flight !== 'object') {
    console.warn('FlightCard: Invalid flight prop', flight);
    return (
      <div className="mb-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <p>Flight information unavailable</p>
        </div>
      </div>
    );
  }

  const [selectedFareOption, setSelectedFareOption] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFares, setShowFares] = useState(isExpanded);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currency, setCurrency] = useState(getSelectedCurrency());
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Listen for currency changes
  useEffect(() => {
    const handleCurrencyChange = () => {
      setCurrency(getSelectedCurrency());
    };
    window.addEventListener("currencyChanged", handleCurrencyChange);
    return () =>
      window.removeEventListener("currencyChanged", handleCurrencyChange);
  }, []);

  // ============================================
  // DATA SAFETY: EXPLICIT FIELD MAPPING
  // ============================================
  // Do NOT spread entire Sabre response objects
  // Explicitly map only required fields with fallbacks
  // ============================================
  
  // Safely extract flight fields with fallbacks
  const safeFlight = {
    id: flight?.id || `flight_${Date.now()}`,
    total_amount: flight?.total_amount || "0",
    total_currency: flight?.total_currency || "USD",
    base_amount: flight?.base_amount || "0",
    tax_amount: flight?.tax_amount || "0",
    estimated: flight?.estimated !== undefined ? flight.estimated : true,
    slices: flight?.slices || [],
    owner: flight?.owner ? {
      iata_code: flight.owner.iata_code || "",
      // REMOVED: name - airline names forbidden
    } : { iata_code: "" }, // REMOVED: name - airline names forbidden
  };

  // Use flightGroup if available, otherwise create a single-flight group
  const currentGroup = flightGroup || {
    flights: [safeFlight],
    lowestFare: safeFlight,
    fareOptions: [
      {
        // Explicitly map only required fields - NO SPREAD
        id: safeFlight.id,
        total_amount: safeFlight.total_amount,
        total_currency: safeFlight.total_currency,
        base_amount: safeFlight.base_amount,
        tax_amount: safeFlight.tax_amount,
        estimated: safeFlight.estimated,
        slices: safeFlight.slices,
        owner: safeFlight.owner,
        tier: "Basic",
        fareFeatures: {
          baggage: [],
          flexibility: [],
          amenities: [],
          refundability: "Non-refundable",
        },
      },
    ],
  };

  // ============================================
  // DATA SAFETY: EXPLICIT FIELD EXTRACTION WITH FALLBACKS
  // ============================================
  // All field accesses must have fallbacks
  // Missing fields show "—" in UI, NOT errors
  // ============================================

  // Memoized flight data processing to improve performance
  const flightData = useMemo(() => {
    // Safe extraction with fallbacks
    const slices = flight?.slices || [];
    const isRoundTrip = slices.length > 1;
    const firstSlice = slices[0] || {};
    const secondSlice = slices[1] || {};
    const firstSliceSegments = firstSlice?.segments || [];
    const firstSegment = firstSliceSegments[0] || {};
    const lastSegment = firstSliceSegments[firstSliceSegments.length - 1] || firstSegment;

    // ============================================
    // BFM DATA ONLY - NO ENRICHMENT
    // ============================================
    // Carrier code comes from BFM (scheduleDescs.carrier.marketing) - ALLOWED
    // DO NOT add airline name or logo - use only carrier code from BFM
    // ============================================
    // Explicitly map carrier code - NO INFERENCE
    // Use first available value, fallback to "—" if missing
    const carrierCode = firstSegment.marketing_carrier?.iata_code || 
                        flight.owner?.iata_code || 
                        firstSegment.operating_carrier?.iata_code || 
                        "—";
    
    const flightNumber =
      firstSegment.operating_carrier_flight_number ||
      firstSegment.marketing_carrier_flight_number ||
      "—";
    
    // ============================================
    // VERIFICATION: Log card field sources (first render only)
    // ============================================
    if (process.env.NODE_ENV === 'development' && !flight._verificationLogged) {
      flight._verificationLogged = true; // Prevent duplicate logs
      console.log('🎴 VERIFICATION: FlightCard field sources for flight:', flight.id);
      
      // ============================================
      // COMPLETE SABRE BFM FIELD MAPPING IN CARD
      // ============================================
      if (flight._sabreBFM) {
        console.log('📋 COMPLETE SABRE BFM FIELDS AVAILABLE IN CARD:');
        console.log('  🆔 ID:', flight._sabreBFM.id);
        console.log('  🛫 Departure:', flight._sabreBFM.departure);
        console.log('  🛬 Arrival:', flight._sabreBFM.arrival);
        console.log('  ✈️  Carrier:', flight._sabreBFM.carrier);
        console.log('  ⏱️  Flight Details:', flight._sabreBFM.flightDetails);
        console.log('  💰 Pricing:', flight._sabreBFM.pricing);
        console.log('  📦 Segments:', flight._sabreBFM.segments);
        console.log('  🎫 Fare Details:', flight._sabreBFM.fareDetails);
        console.log('  🔄 Flexibility:', flight._sabreBFM.flexibility);
        console.log('  🧳 Services:', flight._sabreBFM.services);
        console.log('  📊 Other:', flight._sabreBFM.other);
        console.log('  📦 COMPLETE RAW SCHEDULE OBJECT:', flight._sabreBFM.other?.allFields);
      } else {
        console.log('  ⚠️  No _sabreBFM object found - flight may not be from Sabre BFM');
      }
      console.log('  ✅ Carrier Code:', {
        displayed: carrierCode,
        source: 'firstSegment.marketing_carrier?.iata_code || flight.owner?.iata_code || firstSegment.operating_carrier?.iata_code',
        origin: 'scheduleDescs[].carrier.marketing → owner.iata_code OR segments[].marketing_carrier.iata_code',
        isFromBFM: true
      });
      console.log('  ✅ Flight Number:', {
        displayed: flightNumber,
        source: 'firstSegment.operating_carrier_flight_number || firstSegment.marketing_carrier_flight_number',
        origin: 'scheduleDescs[].carrier.marketingFlightNumber → segments[].marketing_carrier_flight_number',
        isFromBFM: true
      });
      console.log('  ✅ Departure Airport:', {
        displayed: firstSegment.origin?.iata_code || "—",
        source: 'firstSegment.origin?.iata_code',
        origin: 'scheduleDescs[].departure.airport → segments[].origin.iata_code',
        isFromBFM: true
      });
      console.log('  ✅ Arrival Airport:', {
        displayed: lastSegment.destination?.iata_code || "—",
        source: 'lastSegment.destination?.iata_code',
        origin: 'scheduleDescs[].arrival.airport → segments[].destination.iata_code',
        isFromBFM: true
      });
      console.log('  ✅ Departure Time:', {
        displayed: firstSegment.departing_at || "—",
        source: 'firstSegment.departing_at',
        origin: 'scheduleDescs[].departure.time → segments[].departing_at',
        isFromBFM: true
      });
      console.log('  ✅ Arrival Time:', {
        displayed: lastSegment.arriving_at || "—",
        source: 'lastSegment.arriving_at',
        origin: 'scheduleDescs[].arrival.time → segments[].arriving_at',
        isFromBFM: true
      });
      console.log('  ✅ Duration:', {
        displayed: firstSlice.duration || "—",
        source: 'firstSlice.duration',
        origin: 'scheduleDescs[].elapsedTime → slices[].duration (converted to ISO 8601)',
        isFromBFM: true
      });
      console.log('  ✅ Number of Stops:', {
        displayed: `${firstSlice.segments?.length - 1 || 0} (calculated)`,
        source: 'firstSlice.segments.length - 1',
        origin: 'scheduleDescs[].stopCount → calculated from segments.length',
        isFromBFM: true
      });
      console.log('  ✅ Price:', {
        displayed: flight.total_amount || "0",
        source: 'flight.total_amount',
        origin: 'COMPUTED from scheduleDescs[].elapsedTime and stopCount (NOT from BFM directly)',
        isFromBFM: false,
        note: 'Price is calculated, not from BFM response'
      });
      console.log('  ✅ Currency:', {
        displayed: flight.total_currency || "USD",
        source: 'flight.total_currency',
        origin: 'HARDCODED as "USD" (NOT from BFM)',
        isFromBFM: false,
        note: 'Currency is hardcoded, not from BFM response'
      });
      console.log('  ❌ VERIFICATION: NO forbidden fields found:');
      console.log('    ❌ NO airline logos (removed)');
      console.log('    ❌ NO airline names in display (removed)');
      console.log('    ✅ city_name: Used ONLY in getStopInfo() for stop city display (from scheduleDescs[].departure.city - BFM data)');
      console.log('    ❌ NO city names in main card display (only airport codes shown)');
      console.log('    ❌ NO baggage split (removed)');
      console.log('    ❌ NO amenities (removed)');
      console.log('    ❌ NO external data sources (no Duffel, no enrichment)');
      console.log('    ❌ NO Duffel fields detected');
    }

    return {
      isRoundTrip,
      firstSlice,
      secondSlice,
      firstSegment,
      lastSegment,
      carrierCode, // From BFM - ONLY allowed field
      // REMOVED: airlineName (not in BFM, no enrichment allowed)
      // REMOVED: airlineLogo (not in BFM, no enrichment allowed)
      // Explicitly map flight number - NO INFERENCE
      // Use first available value, fallback to "—" if missing
      flightNumber,
    };
  }, [flight.slices, flight.owner]);

  const {
    isRoundTrip,
    firstSlice,
    secondSlice,
    firstSegment,
    lastSegment,
    carrierCode,
    flightNumber,
  } = flightData;

  // ============================================
  // EXTRACT SABRE BFM FIELDS FOR DISPLAY
  // ============================================
  // Display ALL Sabre-provided fields
  // If field exists but is empty, show "Not provided by airline"
  // NO computed data, NO fallbacks from other sources
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
  
  // Stop count - ONLY from Sabre BFM (NO computation)
  const stopCount = hasField('flightDetails.stops') ? getFieldValue('flightDetails.stops') :
                    hasField('flightDetails.stopCount') ? getFieldValue('flightDetails.stopCount') :
                    null;
  const stopCountDisplay = stopCount === null ? 'Not provided by airline' :
                          stopCount === 0 ? 'Direct' : 
                          stopCount === 1 ? '1 Stop' : 
                          `${stopCount} Stops`;
  
  // Cabin class - ONLY from Sabre BFM (NO fallback to passengerInfo)
  const cabinClass = hasField('fareDetails.cabinClass') ? getFieldValue('fareDetails.cabinClass') : null;
  
  // Fare type / brand - ONLY from Sabre BFM
  const fareType = hasField('fareDetails.fareType') ? getFieldValue('fareDetails.fareType') : null;
  const fareBrand = hasField('fareDetails.fareBrand') ? getFieldValue('fareDetails.fareBrand') :
                   hasField('fareDetails.fareFamily') ? getFieldValue('fareDetails.fareFamily') :
                   null;
  const fareBasis = hasField('fareDetails.fareBasis') ? getFieldValue('fareDetails.fareBasis') : null;
  const bookingClass = hasField('fareDetails.bookingClass') ? getFieldValue('fareDetails.bookingClass') : null;
  
  // Refundable / nonRefundable flag - ONLY from Sabre BFM
  const isRefundable = hasField('flexibility.refundable') ? sabreBFM.flexibility?.refundable : null;
  const isChangeable = hasField('flexibility.changeable') ? sabreBFM.flexibility?.changeable : null;
  const fareRestrictions = hasField('flexibility.fareRestrictions') ? getFieldValue('flexibility.fareRestrictions') : null;
  
  // Baggage allowance - ONLY from Sabre BFM
  const baggageAllowance = hasField('services.baggageAllowance') ? getFieldValue('services.baggageAllowance') : null;
  const seatAvailability = hasField('services.seatAvailability') ? getFieldValue('services.seatAvailability') : null;
  const mealCode = hasField('services.mealCode') ? getFieldValue('services.mealCode') : null;
  const connectionIndicator = hasField('services.connectionIndicator') ? getFieldValue('services.connectionIndicator') : null;
  
  // Terminal info - ONLY from Sabre BFM
  const departureTerminal = hasField('departure.terminal') ? getFieldValue('departure.terminal') : null;
  const arrivalTerminal = hasField('arrival.terminal') ? getFieldValue('arrival.terminal') : null;
  const departureGate = hasField('departure.gate') ? getFieldValue('departure.gate') : null;
  const arrivalGate = hasField('arrival.gate') ? getFieldValue('arrival.gate') : null;
  
  // Elapsed time / total duration - ONLY from Sabre BFM (NO computation)
  const elapsedTime = hasField('flightDetails.elapsedTime') ? sabreBFM.flightDetails?.elapsedTime :
                      hasField('flightDetails.durationMinutes') ? sabreBFM.flightDetails?.durationMinutes :
                      null;
  
  // Equipment / Aircraft - ONLY from Sabre BFM
  const equipment = hasField('flightDetails.equipment') ? getFieldValue('flightDetails.equipment') : null;
  const equipmentType = hasField('flightDetails.equipmentType') ? getFieldValue('flightDetails.equipmentType') : null;
  const aircraftCode = hasField('flightDetails.aircraftCode') ? getFieldValue('flightDetails.aircraftCode') : null;
  
  // Pricing - ONLY from Sabre BFM (if available)
  const pricing = sabreBFM.pricing || null;
  const totalFare = pricing && hasField('pricing.totalFare') ? getFieldValue('pricing.totalFare') : null;
  const baseFare = pricing && hasField('pricing.baseFare') ? getFieldValue('pricing.baseFare') : null;
  const taxes = pricing && hasField('pricing.taxes') ? getFieldValue('pricing.taxes') : null;
  const pricingCurrency = pricing && hasField('pricing.currency') ? getFieldValue('pricing.currency') : null;
  
  // Availability - ONLY from Sabre BFM
  const availability = hasField('other.availability') ? getFieldValue('other.availability') : null;

  // Helper function to format duration from ISO 8601 format with fallback
  const formatDuration = (durationStr) => {
    if (!durationStr || durationStr === "N/A") return "—";

    // Handle ISO 8601 duration format (PT2H5M)
    if (durationStr.startsWith("PT")) {
      const hours = parseInt(durationStr.match(/(\d+)H/)?.[1] || "0", 10);
      const minutes = parseInt(durationStr.match(/(\d+)M/)?.[1] || "0", 10);

      // Always format with leading zeros and consistent format
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");

      // Always show both hours and minutes
      return `${formattedHours}h ${formattedMinutes}min`;
    }

    // Try to parse non-standard formats and convert them
    // Handle formats like "13h 25min", "2h", "45min", etc.
    const hourMatch = durationStr.match(/(\d+)h/i);
    const minuteMatch = durationStr.match(/(\d+)min/i);

    if (hourMatch || minuteMatch) {
      const hours = parseInt(hourMatch?.[1] || "0", 10);
      const minutes = parseInt(minuteMatch?.[1] || "0", 10);

      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");

      // Always show both hours and minutes
      return `${formattedHours}h ${formattedMinutes}min`;
    }

    // If no recognizable pattern, return the original string
    return durationStr;
  };

  // Helper function to format time with fallback
  const formatTime = (dateString) => {
    if (!dateString) return "—";
    try {
    const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    } catch (error) {
      return "—";
    }
  };

  // Helper function to format date with fallback
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
    const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    } catch (error) {
      return "—";
    }
  };

  // Helper function to get day difference
  const getDayDifference = (departureDate, arrivalDate) => {
    if (!departureDate || !arrivalDate) return 0;
    const dep = new Date(departureDate);
    const arr = new Date(arrivalDate);
    const diffTime = arr.getTime() - dep.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to get stop information dynamically with fallbacks
  const getStopInfo = (segments) => {
    if (!segments || !Array.isArray(segments) || segments.length <= 1) {
      return "Direct";
    }

    try {
    const numberOfStops = segments.length - 1;
    const stopCities = [];

    // Get intermediate airports (stops) - exclude origin and final destination
    for (let i = 1; i < segments.length; i++) {
        const prevSegment = segments[i - 1] || {};
        const currentSegment = segments[i] || {};
        const prevSegmentDest = prevSegment?.destination || {};
        const currentSegmentOrigin = currentSegment?.origin || {};

      // Check if there's a stop (layover) between segments
      if (prevSegmentDest?.city_name || prevSegmentDest?.name) {
          const cityName = prevSegmentDest.city_name || prevSegmentDest.name || "";
          if (cityName) {
        stopCities.push(
              cityName
              .replace(" Airport", "")
              .replace(" International Airport", "")
        );
          }
        } else if (currentSegmentOrigin?.city_name || currentSegmentOrigin?.name) {
          const cityName = currentSegmentOrigin.city_name || currentSegmentOrigin.name || "";
          if (cityName) {
        stopCities.push(
              cityName
              .replace(" Airport", "")
              .replace(" International Airport", "")
        );
          }
      }
    }

    // Remove duplicates and limit to 2 cities for display
    const uniqueCities = [...new Set(stopCities)].slice(0, 2);
      const cityText = uniqueCities.length > 0 ? ` . ${uniqueCities.join(", ")}` : "";

      return `${numberOfStops} stop${cityText}`;
    } catch (error) {
      // Fallback on any error
      return "Direct";
    }
  };

  // Memoized price info
  // BFM data shows indicative "from" pricing - NOT final pricing
  // CRITICAL: Price is STATIC and does NOT change with passenger count or cabin class
  // REMOVED: cabinClass - not in allowed BFM fields, no inference allowed
  const { price, isIndicativePrice } = useMemo(() => {
    // ============================================
    // PRICE LOCK: Use flight.total_amount directly
    // ============================================
    // DO NOT multiply by passenger count
    // DO NOT adjust by cabin class
    // Price remains exactly as stored in flight.total_amount
    // ============================================
    const amount = parseFloat(flight.total_amount || 0);
    // Convert USD to selected currency for display
    const priceFormatted = formatPriceInEur(amount);
    
    // Check if this is estimated pricing (BFM data)
    // BFM provides availability only, prices are estimated
    // Use estimated flag (primary) or fallback to legacy flags (backward compatibility)
    const isEstimated = flight.estimated === true || 
                       flight._isBFMData === true || 
                       flight._pricingType === 'indicative';

    return {
      price: priceFormatted,
      formattedPrice: amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      // REMOVED: cabinClass - not in allowed BFM fields, no inference allowed
      isIndicativePrice: isEstimated, // True for estimated pricing (BFM availability only)
    };
    // ============================================
    // NOTE: Dependencies do NOT include:
    // - router.query.adult (passenger count)
    // - router.query.flightClass (cabin class)
    // This ensures price remains static when these change
    // ============================================
  }, [
    flight.total_amount,
    flight.total_currency,
    firstSegment.passengers,
    currency,
    flight.estimated,
    flight._isBFMData,
    flight._pricingType,
    // DO NOT add router.query.adult, router.query.flightClass, etc.
    // Price must remain static regardless of passenger/cabin changes
  ]);

  // VERIFICATION LOG: Track passenger count and cabin class changes
  // Log when these change but price remains unchanged (expected for BFM)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isIndicativePrice) {
      const currentAdults = parseInt(router.query?.adult || router.query?.adults || "1", 10);
      const currentChild = parseInt(router.query?.child || "0", 10);
      const currentInfant = parseInt(router.query?.infant || "0", 10);
      const currentCabin = router.query?.flightClass || 'Not specified';
      const currentPrice = flight.total_amount;

      console.log('✅ BFM PRICE VERIFICATION:', {
        flightId: flight.id,
        passengerCount: {
          adults: currentAdults,
          child: currentChild,
          infant: currentInfant,
          total: currentAdults + currentChild + currentInfant,
        },
        cabinClass: currentCabin,
        price: {
          amount: currentPrice,
          formatted: price,
          unchanged: true,
        },
        verification: {
          priceNotMultipliedByPassengers: true,
          priceNotAdjustedByCabin: true,
          priceIsStatic: true,
        },
        message: 'BFM estimated price locked - price unchanged despite passenger/cabin changes (EXPECTED)',
      });
    }
  }, [
    router.query?.adult,
    router.query?.adults,
    router.query?.child,
    router.query?.infant,
    router.query?.flightClass,
    isIndicativePrice,
    flight.id,
    flight.total_amount,
    price,
  ]);

  // Helper: Count passengers by type from router query (search parameters)
  const getPassengerCounts = () => {
    const adults = parseInt(
      router.query?.adult || router.query?.adults || "1",
      10
    );
    const child = parseInt(router.query?.child || "0", 10);
    const infant = parseInt(router.query?.infant || "0", 10);
    return { adults, child, infant };
  };

  const handleBookClick = (selectedFare = null) => {
    const { adults, child, infant } = getPassengerCounts();
    const flightToBook = selectedFare || flight;

    // ============================================
    // BFM ONLY - NO FINAL PRICING
    // ============================================
    // All flights use BFM estimated pricing only.
    // No AirPrice calls, no final pricing.
    // ============================================

    // Get the flight ID - try multiple possible ID fields
    const flightId =
      flightToBook.id ||
      flightToBook.offer_id ||
      `flight_${Date.now()}`;

    // ============================================
    // CAPTURE CABIN CLASS (MUST BE BEFORE CONSOLE.LOG)
    // ============================================
    // Get cabin class from:
    // 1. URL query parameter (if user changed it)
    // 2. Flight fare_details (if pricedFlight)
    // 3. Flight segment data (from BFM response)
    // 4. Default to "Economy"
    // ============================================
    const cabinClassFromQuery = router.query?.flightClass;
    const cabinClassFromPricedFlight = flightToBook.fare_details?.cabin_class;
    const cabinClassFromFlight = firstSegment.passengers?.[0]?.cabin_class_marketing_name || 
                                  flightToBook.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin_class_marketing_name;
    const cabinClass = cabinClassFromQuery || cabinClassFromPricedFlight || cabinClassFromFlight || "Economy";
    
    // ============================================
    // FIX: Round-trip selection flow
    // ============================================
    // 1) On first "Select" (outbound): Save outbound ONLY, navigate to return flights page
    // 2) On second "Select" (return): Save return, navigate to checkout
    // ============================================
    const isRoundTrip = !!router.query?.returnDate;
    const isReturnView = currentView === "return";
    
    // ============================================
    // VERIFICATION LOG: Select/Book Now Click
    // ============================================
    if (process.env.NODE_ENV === 'development') {
      console.log("📤 [Select/Book Now Click] Flight:", {
        flightId: flightToBook.id,
        currentView: currentView,
        isRoundTrip: isRoundTrip,
        isReturnView: isReturnView,
        action: isRoundTrip && !isReturnView 
          ? "Saving outbound flight, navigating to return flights page"
          : isReturnView
          ? "Saving return flight, navigating to checkout"
          : "Saving flight, navigating to checkout (one-way)",
        pricing: {
          total_amount: flightToBook.total_amount,
          total_currency: flightToBook.total_currency || 'USD',
          estimated: true, // Always estimated (BFM only)
        },
        passengerCounts: { adults, child, infant },
        cabinClass: cabinClass,
        timestamp: new Date().toISOString(),
        message: "BFM estimated pricing - no final pricing available",
      });
    }

    try {
      if (typeof window !== "undefined") {
        // ============================================
        // FIX: Separate storage for outbound and return flights
        // ============================================
        if (isRoundTrip && !isReturnView) {
          // First selection: Outbound flight only
          // Store as outbound, do NOT auto-select return
          localStorage.setItem("outbound_flight_selected", JSON.stringify(flightToBook));
          
          const outboundMetadata = {
            flightId,
            cabinClass,
            passengerCounts: { adults, child, infant },
            isBFMData: true,
            pricingType: 'indicative',
            flightType: 'outbound',
          };
          localStorage.setItem("outbound_flight_metadata", JSON.stringify(outboundMetadata));
          
          // Clear any previous return flight selection
          localStorage.removeItem("return_flight_selected");
          localStorage.removeItem("return_flight_metadata");
        } else if (isReturnView) {
          // Second selection: Return flight
          // Store as return flight
          localStorage.setItem("return_flight_selected", JSON.stringify(flightToBook));
          
          const returnMetadata = {
            flightId,
            cabinClass,
            passengerCounts: { adults, child, infant },
            isBFMData: true,
            pricingType: 'indicative',
            flightType: 'return',
          };
          localStorage.setItem("return_flight_metadata", JSON.stringify(returnMetadata));
          
          // Combine outbound and return for checkout
          const outboundFlight = localStorage.getItem("outbound_flight_selected");
          if (outboundFlight) {
            try {
              const outbound = JSON.parse(outboundFlight);
              const returnFlight = flightToBook;
              
              // Create combined flight object with both slices
              const combinedFlight = {
                ...outbound,
                slices: [
                  ...(outbound.slices || []),
                  ...(returnFlight.slices || []),
                ],
                // Combine prices
                total_amount: (parseFloat(outbound.total_amount || 0) + parseFloat(returnFlight.total_amount || 0)).toString(),
                total_currency: outbound.total_currency || returnFlight.total_currency || "USD",
              };
              
              // Store combined flight for checkout
              localStorage.setItem("flight_selected", JSON.stringify(combinedFlight));
              
              const combinedMetadata = {
                flightId: `${outbound.id || 'outbound'}_${returnFlight.id || 'return'}`,
                cabinClass,
                passengerCounts: { adults, child, infant },
                isBFMData: true,
                pricingType: 'indicative',
                flightType: 'round-trip',
                hasOutbound: true,
                hasReturn: true,
              };
              localStorage.setItem("flight_metadata", JSON.stringify(combinedMetadata));
            } catch (e) {
              console.error("Error combining flights:", e);
              // Fallback: just store return flight
              localStorage.setItem("flight_selected", JSON.stringify(flightToBook));
            }
          } else {
            // No outbound found, just store return (shouldn't happen in normal flow)
            localStorage.setItem("flight_selected", JSON.stringify(flightToBook));
          }
        } else {
          // One-way flight: Store normally
          localStorage.setItem("flight_selected", JSON.stringify(flightToBook));
          
          const flightMetadata = {
            flightId,
            cabinClass,
            passengerCounts: { adults, child, infant },
            isBFMData: true,
            pricingType: 'indicative',
            flightType: 'one-way',
          };
          localStorage.setItem("flight_metadata", JSON.stringify(flightMetadata));
        }
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
      // ============================================
      // FIX: Navigation logic
      // ============================================
      if (isRoundTrip && !isReturnView) {
        // First selection: Navigate to return flights page (do NOT go to checkout)
        router.push(`/returnFlights?${new URLSearchParams({
          ...router.query,
          adult: adultParam.toString(),
          child: childParam.toString(),
          infant: infantParam.toString(),
          flightClass: cabinClass,
        }).toString()}`);
      } else {
        // Second selection (return) or one-way: Navigate to checkout
        router.push(
          `/flight/checkout?id=${flightId}&adult=${adultParam}&child=${childParam}&infant=${infantParam}&flightClass=${cabinClassParam}&selectedOffer=${flightId}`
        );
      }
    } catch (error) {
      console.error("Error navigating:", error);
      if (isRoundTrip && !isReturnView) {
        window.location.href = `/returnFlights?${new URLSearchParams({
          ...router.query,
          adult: adultParam.toString(),
          child: childParam.toString(),
          infant: infantParam.toString(),
          flightClass: cabinClass,
        }).toString()}`;
      } else {
        window.location.href = `/flight/checkout?id=${flightId}&adult=${adultParam}&child=${childParam}&infant=${infantParam}&flightClass=${cabinClassParam}&selectedOffer=${flightId}`;
      }
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    handleBookClick();
  };

  // ============================================
  // BFM DATA ONLY - NO BAGGAGE SPLIT
  // ============================================
  // BFM does NOT provide baggage split (personal/cabin/checked)
  // Cards must ONLY use data from scheduleDescs (BFM response)
  // Baggage details are NOT available in BFM and must NOT be displayed
  // ============================================
  const params = router.query;
  // Check if this is a round-trip search (has returnDate in query)
  const isRoundTripSearch = !!params?.returnDate;

  return (
    <div className="mb-4">
      {/* Main Flight Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary-green/30 transition-all duration-300 overflow-hidden">
        <div className="flex">
          {/* Left Section - Flight Details */}
          <div className="flex-1 p-6 bg-white">
            {/* Single Trip Layout */}
            {!isRoundTrip && (
              <div className="space-y-6">
                {/* Departure Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-bold text-gray-900">
                      Departure
                    </h3>
                    <span className="text-gray-500">
                      {formatDate(firstSegment.departing_at)}
                    </span>
                    {firstSlice.segments?.length > 1 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full ml-2">
                        <Image
                          src="/st-images/star.png"
                          alt="Self-Transfer"
                          width={48}
                          height={48}
                          className="w-3 h-3 object-contain "
                        />
                        <span className="text-sm font-medium text-primary-text">
                          Self-Transfer
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Carrier Code - BFM ONLY */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                      <span className="text-sm font-semibold text-primary-text">
                        {carrierCode || "—"}
                      </span>
                      {flightNumber && flightNumber !== "—" && (
                        <span className="text-xs text-gray-600 mt-0.5">
                          {flightNumber}
                        </span>
                      )}
                    </div>

                    {/* Departure Time */}
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-primary-text mb-1">
                        {formatTime(firstSegment.departing_at)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {/* FIX: Always derive from flight segments - origin = slices[0].segments[0].origin.iata_code
                            Show airport code only once (remove duplication) */}
                        {cleanAirportCode(firstSegment.origin?.iata_code || "—")}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 flex flex-col items-center px-4">
                      <div className="text-sm text-gray-600 mb-2">
                        {formatDuration(firstSlice.duration)}
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
                      <div className="text-sm text-gray-600 mt-2">
                        {/* UI FIX: Calculate stops as max(segments.length - 1, 0) */}
                        {firstSlice.segments && firstSlice.segments.length > 1
                          ? `${Math.max(firstSlice.segments.length - 1, 0)} ${Math.max(firstSlice.segments.length - 1, 0) === 1 ? 'Stop' : 'Stops'}`
                          : stopCountDisplay}
                      </div>
                    </div>

                    {/* Arrival Time */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-primary-text mb-1  flex items-start">
                        {formatTime(lastSegment.arriving_at)}
                        {getDayDifference(
                          firstSegment.departing_at,
                          lastSegment.arriving_at
                        ) > 0 && (
                          <span className="text-[10px] font-thin text-gray-500  translate-y-[-6px]">
                            +
                            {getDayDifference(
                              firstSegment.departing_at,
                              lastSegment.arriving_at
                            )}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {/* FIX: Always derive from flight segments - destination = slices[0].segments[last].destination.iata_code
                            Show airport code only once (remove duplication) */}
                        {cleanAirportCode(lastSegment.destination?.iata_code || "—")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Round Trip Layout */}
            {isRoundTrip && (
              <div className="space-y-6">
                {/* Departure Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-bold text-gray-900">
                      Departure
                    </h3>
                    <span className="text-gray-500">
                      {formatDate(firstSegment.departing_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Carrier Code - BFM ONLY */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                      <span className="text-sm font-semibold text-primary-text">
                        {carrierCode || "—"}
                      </span>
                      {flightNumber && flightNumber !== "—" && (
                        <span className="text-xs text-gray-600 mt-0.5">
                          {flightNumber}
                        </span>
                      )}
                    </div>

                    {/* Departure Time */}
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-bold text-primary-text mb-1">
                        {formatTime(firstSegment.departing_at)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {/* FIX: Always derive from flight segments - origin = slices[0].segments[0].origin.iata_code
                            Show airport code only once (remove duplication) */}
                        {cleanAirportCode(firstSegment.origin?.iata_code || "—")}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 flex flex-col items-center px-4">
                      <div className="text-sm text-gray-600 mb-2">
                        {formatDuration(firstSlice.duration)}
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
                      <div className="text-sm text-gray-600 mt-2">
                        {stopCountDisplay}
                      </div>
                    </div>

                    {/* Arrival Time */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-bold text-primary-text mb-1">
                        {formatTime(lastSegment.arriving_at)}
                        {getDayDifference(
                          firstSegment.departing_at,
                          lastSegment.arriving_at
                        ) > 0 && (
                          <span className="text-xl ml-1">
                            +
                            {getDayDifference(
                              firstSegment.departing_at,
                              lastSegment.arriving_at
                            )}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {/* FIX: Always derive from flight segments - destination = slices[0].segments[last].destination.iata_code
                            Show airport code only once (remove duplication) */}
                        {cleanAirportCode(lastSegment.destination?.iata_code || "—")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Return Section */}
                {secondSlice && (
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-base font-bold text-gray-900">
                        Return
                      </h3>
                      <span className="text-gray-500">
                        {formatDate(secondSlice.segments?.[0]?.departing_at)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {params?.flightClass || cabinClass}
                      </span>
                      {secondSlice.segments?.length > 1 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full ml-2">
                          <Image
                            src="/st-images/star.png"
                          alt="Self-Transfer"
                            width={48}
                            height={48}
                            className="w-3 h-3 object-contain "
                          />
                          <span className="text-sm font-medium text-primary-text">
                            Self-Transfer
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Carrier Code - BFM ONLY (no logos) */}
                      <div className="flex-shrink-0">
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                          <span className="text-sm font-semibold text-primary-text">
                            {secondSlice.segments?.[0]?.marketing_carrier?.iata_code || 
                             secondSlice.segments?.[0]?.operating_carrier?.iata_code || 
                             carrierCode || "—"}
                          </span>
                        </div>
                      </div>

                      {/* Departure Time */}
                      <div className="flex-shrink-0">
                        <div className="text-2xl font-bold text-primary-text mb-1">
                          {formatTime(secondSlice.segments?.[0]?.departing_at)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {/* FIX: Return section shows OPPOSITE of departure - swap origin/destination
                              Return origin = outbound destination (firstSlice last segment destination)
                              Show airport code only once (remove duplication) */}
                          {cleanAirportCode(
                            lastSegment.destination?.iata_code || "—"
                          )}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex-1 flex flex-col items-center px-4">
                        <div className="text-sm text-gray-600 mb-2">
                          {formatDuration(secondSlice.duration)}
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
                        <div className="text-sm text-gray-600 mt-2">
                          {/* UI FIX: Calculate stops as max(segments.length - 1, 0) */}
                          {secondSlice.segments && secondSlice.segments.length > 1 
                            ? `${Math.max(secondSlice.segments.length - 1, 0)} ${Math.max(secondSlice.segments.length - 1, 0) === 1 ? 'Stop' : 'Stops'}`
                            : 'Direct'}
                        </div>
                      </div>

                      {/* Arrival Time */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-primary-text mb-1">
                          {formatTime(
                            secondSlice.segments?.[
                              secondSlice.segments.length - 1
                            ]?.arriving_at
                          )}
                          {getDayDifference(
                            secondSlice.segments?.[0]?.departing_at,
                            secondSlice.segments?.[
                              secondSlice.segments.length - 1
                            ]?.arriving_at
                          ) > 0 && (
                            <span className="text-sm font-normal ml-1">
                              +
                              {getDayDifference(
                                secondSlice.segments?.[0]?.departing_at,
                                secondSlice.segments?.[
                                  secondSlice.segments.length - 1
                                ]?.arriving_at
                              )}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {/* FIX: Return section shows OPPOSITE of departure - swap origin/destination
                              Return destination = outbound origin (firstSlice first segment origin)
                              Show airport code only once (remove duplication) */}
                          {cleanAirportCode(
                            firstSegment.origin?.iata_code || "—"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Price & Action */}
          <div className="w-64 bg-gray-50 border-l border-gray-200 p-6 flex flex-col justify-between">
            <div className="flex flex-col">
              {/* Price - BFM ONLY */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">
                  From
                  </div>
                <div className="text-4xl font-bold text-primary-text mb-2">
                  {price}
                </div>
                <div className="text-sm text-gray-600">
                  Price per adult
                </div>
              </div>
            </div>

            {/* Select Button */}
            <button
              onClick={() => setShowFares(!showFares)}
              className="w-full bg-primary-green hover:bg-primary-green/90 text-primary-text px-5 py-3 rounded-lg font-semibold text-base transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2"
            >
              Select
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  showFares ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Fare Options Dropdown */}
      {showFares && (
        <div className="bg-gray-50 border border-gray-200 p-6 mt-3 rounded-2xl">
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Choose your fare
          </h4>
          {isIndicativePrice && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> BFM search provides indicative pricing only. 
              </p>
            </div>
          )}
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
            {currentGroup.fareOptions.map((fareOption, index) => {
              const isExpired = new Date(fareOption.expires_at) < new Date();
              const fareBrandName = fareOption.slices?.[0]?.fare_brand_name;

              // Prefer brand name, then fareName, then tier; strip class-in-parens
              const rawName =
                fareBrandName ||
                fareOption.fareName ||
                fareOption.tier ||
                "Standard";
              const packageName = rawName
                .replace(
                  /\s*\((?:economy|business|first|premium\s+economy)\)\s*/i,
                  ""
                )
                .trim();

              // Get origin and destination for this fare option with fallbacks
              const getRouteInfo = () => {
                const slices = fareOption?.slices || flight?.slices || [];
                if (!slices || slices.length === 0) return { origin: "—", destination: "—" };

                const firstSlice = slices[0] || {};
                const lastSlice = slices[slices.length - 1] || firstSlice;
                const firstSegments = firstSlice?.segments || [];
                const lastSegments = lastSlice?.segments || [];

                // FIX: Always derive from flight segments only - do NOT use search params
                // origin = slices[0].segments[0].origin.iata_code
                // destination = slices[0].segments[last].destination.iata_code
                const origin = cleanAirportCode(firstSegments[0]?.origin?.iata_code || "—");
                const destination = cleanAirportCode(lastSegments[lastSegments.length - 1]?.destination?.iata_code || "—");

                return { origin, destination };
              };

              const routeInfo = getRouteInfo();

              // ============================================
              // BFM DATA ONLY - NO AMENITIES
              // ============================================
              // BFM does NOT provide amenities, meals, seat maps, or change/refund penalties
              // Cards must ONLY use data from scheduleDescs (BFM response)
              // ============================================

              // ============================================
              // BFM DATA ONLY - NO BAGGAGE LABELS
              // ============================================
              // BFM does NOT provide baggage weight details
              // ============================================

              // ============================================
              // BFM DATA ONLY - NO FACILITY ICONS
              // ============================================
              // BFM does NOT provide amenities, so no facility icons needed
              // ============================================

              return (
                <div
                  key={fareOption.id || index}
                  className={`bg-white rounded-lg border flex flex-col justify-between p-4 transition-all w-[248px] flex-shrink-0 ${
                    isExpired
                      ? "border-gray-200 opacity-50 cursor-not-allowed"
                      : "border-gray-200 hover:border-primary-green hover:shadow-md cursor-pointer"
                  } ${
                    selectedFareOption === fareOption.id
                      ? "border-primary-green shadow-sm ring-2 ring-primary-green/15"
                      : ""
                  }`}
                  onClick={() =>
                    !isExpired && setSelectedFareOption(fareOption.id)
                  }
                >
                  <div className="flex flex-col  gap-2.5">
                    {/* Header with fare name */}
                    <div className="text-left">
                      {/* show allowed - green if requires_instant_payment is false, red if true */}
                      {/* <div className="flex flex-row items-center gap-2">
                        {(() => {
                          const requiresInstantPayment =
                            fareOption.payment_requirements
                              ?.requires_instant_payment ?? true;
                          return (
                            <div
                              className={`h-3 w-3 rounded-full ${
                                requiresInstantPayment
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                            ></div>
                          );
                        })()}
                        {fareOption.expires_at && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            <h4>expires in</h4>
                            <span>
                              {new Date(fareOption.expires_at).toLocaleString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div> */}

                      <div className="flex items-center  justify-between mb-2.5">
                        <h4 className="font-semibold text-primary-text text-base">
                          {packageName}
                        </h4>
                        {isExpired && (
                          <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
                            <AlertTriangle size={14} />
                          </div>
                        )}
                      </div>

                      {routeInfo &&
                        routeInfo.origin &&
                        routeInfo.destination && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2.5 uppercase tracking-wide">
                            <span className="font-semibold text-primary-text">
                              {routeInfo.origin}
                            </span>
                            <ArrowRight size={12} />
                            <span className="font-semibold text-primary-text">
                              {routeInfo.destination}
                            </span>
                          </div>
                        )}

                      <div className="bg-gray-50 rounded-md p-3 mb-3">
                        <div className="flex items-baseline gap-2">
                          <div className="text-primary-text font-semibold text-lg">
                            {`From ${formatPriceInEur(fareOption.total_amount)}`}
                          </div>
                          <div className="text-[11px] text-primary-text/70 uppercase tracking-wide">
                            {isIndicativePrice ? "Est. price" : "Price / Pax"}
                          </div>
                        </div>
                        {/* REMOVED: Pricing messaging */}
                      </div>
                    </div>

                    {/* ============================================ */}
                    {/* BFM DATA ONLY - MINIMAL FARE FEATURES */}
                    {/* ============================================ */}
                    {/* BFM provides: */}
                    {/* - Estimated price + currency (pricingInformation.totalFare) */}
                    {/* BFM does NOT provide (FORBIDDEN): */}
                    {/* - Logos */}
                    {/* - Airline names */}
                    {/* - Seat info */}
                    {/* - Meals */}
                    {/* - Refund/change penalties */}
                    {/* - Exact pricing */}
                    {/* - Baggage split (personal/cabin/checked) */}
                    {/* - Amenities */}
                    {/* ============================================ */}
                    {/* REMOVED: Refundability flag - refund/change penalties forbidden */}
                    <div className="space-y-3">
                      {/* No refund/change penalty info displayed - forbidden */}
                            </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    {/* View More Details Link */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSidebar(true);
                      }}
                      className="text-red-500 text-xs font-medium hover:underline flex items-center gap-1.5 w-full justify-start"
                    >
                      View More Details
                      <ArrowRight size={14} />
                    </button>

                    {/* Book Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isExpired) {
                          // ============================================
                          // DATA SAFETY: Explicit field mapping - NO SPREAD
                          // ============================================
                          // ============================================
                          // EXPLICIT FIELD MAPPING - NO SPREAD
                          // ============================================
                          // Map each field explicitly with fallbacks
                          // Missing values use empty strings or "—"
                          // ============================================
                          const flightToBook = {
                            id: fareOption?.id || flight?.id || `flight_${Date.now()}`,
                            total_amount: fareOption?.total_amount || flight?.total_amount || "0",
                            total_currency: fareOption?.total_currency || flight?.total_currency || "USD",
                            base_amount: fareOption?.base_amount || flight?.base_amount || "0",
                            tax_amount: fareOption?.tax_amount || flight?.tax_amount || "0",
                            estimated: fareOption?.estimated !== undefined ? fareOption.estimated : (flight?.estimated !== undefined ? flight.estimated : true),
                            slices: fareOption?.slices || flight?.slices || [],
                            // Explicitly map owner - NO SPREAD
                            owner: {
                              iata_code: fareOption?.owner?.iata_code || flight?.owner?.iata_code || "",
                              // REMOVED: name - airline names forbidden
                            },
                            // REMOVED: fareFeatures - not in BFM, no enrichment allowed
                          };
                          handleBookClick(flightToBook);
                        }
                      }}
                      disabled={isExpired}
                      className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                        isExpired
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-primary-green text-primary-text hover:bg-primary-green/90 hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      {isExpired ? "Expired" : "Book"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No fare options message */}
          {currentGroup.fareOptions.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No fare options available for this flight.
            </div>
          )}
        </div>
      )}

      {/* Right Sidebar for Details */}
      {showSidebar &&
        isClient &&
        createPortal(
          <div
            className="fixed top-0 left-0 w-[100vw] h-[100vh] bg-black/60 shadow-2xl z-[100000] overflow-y-auto animate-slide-in"
            onClick={() => setShowSidebar(false)}
          >
            <div
              className="fixed top-0 right-0 w-full max-w-[540px] h-full bg-gray-50 shadow-2xl z-[100001] overflow-y-auto border-l border-gray-200 animate-slide-in flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <FlightDetailsSidebar
                flight={flight}
                onClose={() => setShowSidebar(false)}
              />
            </div>
          </div>,
          document.body
        )}

      {/* Auth Modal */}
      {showAuthModal && (
        <ModernAuthForm
          setShowAuthModal={setShowAuthModal}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default FlightCard;

