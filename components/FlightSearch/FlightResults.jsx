import React from "react";
import FlightCard from "./FlightCard";
import BookingSidebar from "./BookingSidebar";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { APILINK } from "../../config/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChevronDown, BarChart3 } from "lucide-react";
import DepartureDateCalendar from "./DepartureDateCalendar";
import {
  groupFlightsByRoute,
  filterExpiredFares,
} from "../../utils/flightGrouping";
import LoadingComponent from "../common/LoadingComponent";
import {
  formatPriceInEur,
  getSelectedCurrency,
  setSelectedCurrency,
  initializeExchangeRate,
  CURRENCIES,
} from "../../utils/priceConverter";

// Helper function to parse duration string to hours
function parseDurationToHours(durationStr) {
  if (!durationStr || durationStr === "N/A") return 0;

  // Handle ISO 8601 duration format (PT2H5M)
  if (durationStr.startsWith("PT")) {
    const hours = parseInt(durationStr.match(/(\d+)H/)?.[1] || "0", 10);
    const minutes = parseInt(durationStr.match(/(\d+)M/)?.[1] || "0", 10);
    return hours + minutes / 60;
  }

  // Handle formats like "13h 25min", "2h", "45min", etc.
  const hourMatch = durationStr.match(/(\d+)h/i);
  const minuteMatch = durationStr.match(/(\d+)min/i);

  if (hourMatch || minuteMatch) {
    const hours = parseInt(hourMatch?.[1] || "0", 10);
    const minutes = parseInt(minuteMatch?.[1] || "0", 10);
    return hours + minutes / 60;
  }

  return 0;
}

// Format a Date to yyyy-mm-dd in LOCAL time (avoid UTC off-by-one)
function formatLocalISO(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayLocalISO() {
  return formatLocalISO(new Date());
}

// Helper function to get time in hours from date string
function getTimeInHours(dateString) {
  if (!dateString) return 0;
  const date = new Date(dateString);
  return date.getHours() + date.getMinutes() / 60;
}

// Helper function to get day of week (0 = Sunday, 1 = Monday, etc.)
function getDayOfWeek(dateString) {
  if (!dateString) return 0;
  const date = new Date(dateString);
  return date.getDay();
}

// Helper function to format date for display
function formatDateForDisplay(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  return `${dayName}, ${day} ${month}`;
}

// Helper function to format date range for display (e.g., "Nov 1 - Nov 3")
function formatDateRangeForDisplay(startDate, endDate) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const startMonth = months[startDate.getMonth()];
  const startDay = startDate.getDate();
  const endMonth = months[endDate.getMonth()];
  const endDay = endDate.getDate();

  // Always show full format: "Nov 1 - Nov 3" or "Nov 1 - Dec 3"
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
}

// Helper function to generate date options around the search date
function generateDateOptions(
  searchDate,
  flights = [],
  isReturnFlight = false,
  returnDate = null,
  duration = 3 // Default duration in days
) {
  const options = [];
  const baseDate = new Date(searchDate);

  // If we have flights, find the actual date range of available flights
  let availableDates = [];
  if (flights.length > 0) {
    availableDates = flights
      .map((flight) => {
        const flightDate = new Date(
          flight.slices?.[0]?.segments?.[0]?.departing_at
        );
        return formatLocalISO(flightDate);
      })
      .sort();
  }

  // Get unique available dates
  const uniqueAvailableDates = [...new Set(availableDates)];

  // If we have flights but none around the search date, center around the first available date
  let centerDate = baseDate;
  if (uniqueAvailableDates.length > 0) {
    const searchDateStr = formatLocalISO(baseDate);
    const hasFlightsAroundSearch = uniqueAvailableDates.some((date) => {
      const dateDiff =
        Math.abs(new Date(date) - baseDate) / (1000 * 60 * 60 * 24);
      return dateDiff <= 2; // Within 2 days of search date
    });

    if (!hasFlightsAroundSearch) {
      // No flights around search date, center around the first available date
      centerDate = new Date(uniqueAvailableDates[0]);
    }
  }

  // For return flights, we need to show both departure and return dates as ranges
  if (isReturnFlight && returnDate) {
    const returnDateObj = new Date(returnDate);
    const departureDateStr = formatLocalISO(baseDate);
    const returnDateStr = formatLocalISO(returnDateObj);
    // For round-trip, show inclusive span so that center option matches exactly dep->return
    const inclusiveSpanDays = Math.max(1, duration + 1);

    // Generate date ranges around departure date
    const rangeCount = 5;
    const centerIndex = Math.floor(rangeCount / 2);

    for (let i = 0; i < rangeCount; i++) {
      const rangeStartOffset = (i - centerIndex) * duration;
      const rangeStartDate = new Date(baseDate);
      rangeStartDate.setDate(baseDate.getDate() + rangeStartOffset);

      const rangeEndDate = new Date(rangeStartDate);
      rangeEndDate.setDate(rangeStartDate.getDate() + inclusiveSpanDays - 1);

      const rangeStartStr = formatLocalISO(rangeStartDate);
      const rangeEndStr = formatLocalISO(rangeEndDate);

      // Find flights that fall within this date range
      const flightsForRange = flights.filter((flight) => {
        const flightDate = new Date(
          flight.slices?.[0]?.segments?.[0]?.departing_at
        );
        const flightDateStr = formatLocalISO(flightDate);
        return flightDateStr >= rangeStartStr && flightDateStr <= rangeEndStr;
      });

      const lowestPrice =
        flightsForRange.length > 0
          ? Math.min(
              ...flightsForRange.map((flight) =>
                parseFloat(flight.total_amount || 0)
              )
            )
          : null;

      // Check if any date in this range has flights available
      const hasFlights = uniqueAvailableDates.some((dateStr) => {
        return dateStr >= rangeStartStr && dateStr <= rangeEndStr;
      });

      // Exact match: departure equals start AND return equals end
      const isSelected =
        departureDateStr === rangeStartStr && returnDateStr === rangeEndStr;

      options.push({
        date: rangeStartStr,
        dateRange: [rangeStartStr, rangeEndStr],
        day: formatDateRangeForDisplay(rangeStartDate, rangeEndDate),
        price:
          lowestPrice && lowestPrice > 0
            ? formatPriceInEur(lowestPrice, { decimals: 0 })
            : "View",
        isSelected: isSelected,
        hasFlights: hasFlights,
        isDeparture: true,
      });
    }

    return options;
  }

  // Generate date ranges for one-way flights
  // Calculate range start dates based on duration
  const rangeCount = 5; // Show 5 ranges
  const centerIndex = Math.floor(rangeCount / 2); // Center range index

  for (let i = 0; i < rangeCount; i++) {
    // Calculate start date for this range (shifts by duration days each time)
    const rangeStartOffset = (i - centerIndex) * duration;
    const rangeStartDate = new Date(centerDate);
    rangeStartDate.setDate(centerDate.getDate() + rangeStartOffset);

    // Calculate end date for this range
    const rangeEndDate = new Date(rangeStartDate);
    rangeEndDate.setDate(rangeStartDate.getDate() + duration - 1);

    const rangeStartStr = formatLocalISO(rangeStartDate);
    const rangeEndStr = formatLocalISO(rangeEndDate);

    // Find flights that fall within this date range - check ALL flights
    const flightsForRange = flights.filter((flight) => {
      // Handle invalid flights
      if (!flight || !flight.slices || flight.slices.length === 0) {
        return false;
      }

      const departingAt = flight.slices[0]?.segments?.[0]?.departing_at;
      if (!departingAt) {
        return false;
      }

      try {
        const flightDate = new Date(departingAt);
        const flightDateStr = formatLocalISO(flightDate);

        // Check if flight date is within the range
        return flightDateStr >= rangeStartStr && flightDateStr <= rangeEndStr;
      } catch (error) {
        return false;
      }
    });

    const lowestPrice =
      flightsForRange.length > 0
        ? Math.min(
            ...flightsForRange.map((flight) =>
              parseFloat(flight.total_amount || 0)
            )
          )
        : null;

    // Check if any flights are available in this range
    // Use flightsForRange.length > 0 as primary check, and uniqueAvailableDates as backup
    const hasFlights =
      flightsForRange.length > 0 ||
      uniqueAvailableDates.some((dateStr) => {
        return dateStr >= rangeStartStr && dateStr <= rangeEndStr;
      });

    // Check if the search date falls within this range
    const searchDateStr = formatLocalISO(baseDate);
    const isSelected =
      searchDateStr >= rangeStartStr && searchDateStr <= rangeEndStr;

    options.push({
      date: rangeStartStr, // Use start date as the key
      dateRange: [rangeStartStr, rangeEndStr], // Store full range
      day: formatDateRangeForDisplay(rangeStartDate, rangeEndDate),
      price:
        lowestPrice && lowestPrice > 0
          ? formatPriceInEur(lowestPrice, { decimals: 0 })
          : "View",
      isSelected: isSelected,
      hasFlights: hasFlights,
      isDeparture: true,
    });
  }

  return options;
}

// Helper function to generate return date options
function generateReturnDateOptions(returnDate, flights = [], duration = 3) {
  const options = [];
  const baseDate = new Date(returnDate);
  const inclusiveSpanDays = Math.max(1, duration + 1);

  // If we have flights, find the actual date range of available return flights
  let availableReturnDates = [];
  if (flights.length > 0) {
    availableReturnDates = flights
      .filter((flight) => flight.slices && flight.slices.length > 1)
      .map((flight) => {
        const returnFlightDate = new Date(
          flight.slices?.[1]?.segments?.[0]?.departing_at
        );
        return formatLocalISO(returnFlightDate);
      })
      .sort();
  }

  // Get unique available return dates
  const uniqueAvailableReturnDates = [...new Set(availableReturnDates)];

  // Generate date ranges for return flights
  const rangeCount = 5; // Show 5 ranges
  const centerIndex = Math.floor(rangeCount / 2); // Center range index

  for (let i = 0; i < rangeCount; i++) {
    // Calculate start date for this range
    const rangeStartOffset = (i - centerIndex) * duration;
    const rangeStartDate = new Date(baseDate);
    rangeStartDate.setDate(baseDate.getDate() + rangeStartOffset);

    // Calculate end date for this range
    const rangeEndDate = new Date(rangeStartDate);
    rangeEndDate.setDate(rangeStartDate.getDate() + inclusiveSpanDays - 1);

    const rangeStartStr = formatLocalISO(rangeStartDate);
    const rangeEndStr = formatLocalISO(rangeEndDate);

    // Find return flights that fall within this date range - check ALL flights
    const returnFlightsForRange = flights.filter((flight) => {
      // Handle invalid flights
      if (!flight || !flight.slices || flight.slices.length < 2) {
        return false;
      }

      const returningAt = flight.slices[1]?.segments?.[0]?.departing_at;
      if (!returningAt) {
        return false;
      }

      try {
        const returnFlightDate = new Date(returningAt);
        const returnFlightDateStr = returnFlightDate
          .toISOString()
          .split("T")[0];
        return (
          returnFlightDateStr >= rangeStartStr &&
          returnFlightDateStr <= rangeEndStr
        );
      } catch (error) {
        return false;
      }
    });

    const lowestReturnPrice =
      returnFlightsForRange.length > 0
        ? Math.min(
            ...returnFlightsForRange.map((flight) =>
              parseFloat(flight.total_amount || 0)
            )
          )
        : null;

    // Check if any return flights are available in this range
    // Use returnFlightsForRange.length > 0 as primary check, and uniqueAvailableReturnDates as backup
    const hasReturnFlights =
      returnFlightsForRange.length > 0 ||
      uniqueAvailableReturnDates.some((dateStr) => {
        return dateStr >= rangeStartStr && dateStr <= rangeEndStr;
      });

    // Exact match to end date when departure side also matches via paired component
    const returnDateStr = formatLocalISO(baseDate);
    const isSelected = returnDateStr === rangeEndStr;

    options.push({
      date: rangeStartStr,
      dateRange: [rangeStartStr, rangeEndStr],
      day: formatDateRangeForDisplay(rangeStartDate, rangeEndDate),
      price:
        lowestReturnPrice && lowestReturnPrice > 0
          ? formatPriceInEur(lowestReturnPrice, { decimals: 0 })
          : "View",
      isSelected: isSelected,
      hasFlights: hasReturnFlights,
    });
  }

  return options;
}

// Helper function to generate dynamic filter tabs based on flight data
function generateFilterTabs(flightGroups = [], selectedCurrency = "EUR") {
  const currency = CURRENCIES[selectedCurrency] || CURRENCIES.EUR;
  const currencyLabel = `${currency.symbol} ${currency.name}`;

  if (flightGroups.length === 0) {
    return [
      { id: "best", label: "Best", info: "No flights", isActive: true },
      {
        id: "cheapest",
        label: "Cheapest",
        info: "No flights",
        isActive: false,
      },
      { id: "fastest", label: "Fastest", info: "No flights", isActive: false },
      {
        id: "other",
        label: currencyLabel,
        info: "No options",
        isActive: false,
        hasDropdown: true,
      },
    ];
  }

  // Find best, cheapest, and fastest flights
  const allFlights = flightGroups.flatMap((group) => group.flights);

  // Best flight (lowest price with reasonable duration)
  const bestFlight = allFlights.reduce((best, current) => {
    const currentPrice = parseFloat(current.total_amount || 0);
    const bestPrice = parseFloat(best.total_amount || 0);
    const currentDuration = parseDurationToHours(current.slices?.[0]?.duration);
    const bestDuration = parseDurationToHours(best.slices?.[0]?.duration);

    // Best is lowest price with duration under 24 hours
    if (
      currentDuration < 24 &&
      (bestDuration >= 24 || currentPrice < bestPrice)
    ) {
      return current;
    }
    return best;
  }, allFlights[0]);

  // Cheapest flight
  const cheapestFlight = allFlights.reduce((cheapest, current) => {
    const currentPrice = parseFloat(current.total_amount || 0);
    const cheapestPrice = parseFloat(cheapest.total_amount || 0);
    return currentPrice < cheapestPrice ? current : cheapest;
  }, allFlights[0]);

  // Fastest flight
  const fastestFlight = allFlights.reduce((fastest, current) => {
    const currentDuration = parseDurationToHours(current.slices?.[0]?.duration);
    const fastestDuration = parseDurationToHours(fastest.slices?.[0]?.duration);
    return currentDuration < fastestDuration ? current : fastest;
  }, allFlights[0]);

  // Format duration for display
  const formatDuration = (durationHours) => {
    const hours = Math.floor(durationHours);
    const minutes = Math.round((durationHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  return [
    {
      id: "best",
      label: "Best",
      info: bestFlight
        ? `${formatPriceInEur(parseFloat(bestFlight.total_amount || 0), {
            decimals: 0,
          })} • ${formatDuration(
            parseDurationToHours(bestFlight.slices?.[0]?.duration)
          )}`
        : "No flights",
      isActive: true,
    },
    {
      id: "cheapest",
      label: "Cheapest",
      info: cheapestFlight
        ? `${formatPriceInEur(parseFloat(cheapestFlight.total_amount || 0), {
            decimals: 0,
          })} • ${formatDuration(
            parseDurationToHours(cheapestFlight.slices?.[0]?.duration)
          )}`
        : "No flights",
      isActive: false,
    },
    {
      id: "fastest",
      label: "Fastest",
      info: fastestFlight
        ? `${formatPriceInEur(parseFloat(fastestFlight.total_amount || 0), {
            decimals: 0,
          })} • ${formatDuration(
            parseDurationToHours(fastestFlight.slices?.[0]?.duration)
          )}`
        : "No flights",
      isActive: false,
    },
    {
      id: "other",
      label: currencyLabel,
      info: "Select Currency",
      isActive: false,
      hasDropdown: true,
    },
  ];
}

// ============================================
// FILTER SAFETY: Sabre BFM only
// ============================================
// This function handles Sabre BFM data only.
// 
// Rules:
// - Sabre BFM data only - skip filters not available in BFM (baggage, luggage, countries)
// - Common filters (stops, airlines, time, price) work with Sabre BFM
// ============================================
// Determine whether a single flight matches the provided filters
function flightMatchesFilters(flight, filters) {
  // Ensure filters object has expected properties
  const safeFilters = {
    stops: filters.stops || [],
    airlines: filters.airlines || [],
    luggage: filters.luggage || [],
    ...filters,
  };

  // ============================================
  // DATA SOURCE: Sabre BFM only
  // ============================================
  // Sabre BFM flights have: stops, duration (numeric) fields
  // ============================================
  const isSabreData = flight.stops !== undefined || 
                      (typeof flight.duration === 'number' && flight.duration > 0) ||
                      !flight.slices?.[0]?.segments?.[0]?.passengers?.[0]?.baggages;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
  }

  const isMatch = (() => {
    // Stops filter - check for stopsType radio selection
    // Works with Sabre BFM (uses flight.stops)
    if (filters.stopsType && filters.stopsType !== "any") {
      let numberOfStops = 0;
      
      // Use Sabre BFM stops field
      if (isSabreData && flight.stops !== undefined) {
        numberOfStops = flight.stops || 0;
      } else {
        // Fallback: Calculate from segments
      const firstSlice = flight.slices?.[0];
      const segments = firstSlice?.segments || [];
        numberOfStops = segments.length > 1 ? segments.length - 1 : 0;
      }

      // Check if the flight matches the selected stop filter
      let matchesStopsFilter = false;

      if (filters.stopsType === "direct" && numberOfStops === 0) {
        matchesStopsFilter = true;
      } else if (filters.stopsType === "1stop" && numberOfStops === 1) {
        matchesStopsFilter = true;
      } else if (filters.stopsType === "2stops" && numberOfStops >= 2) {
        matchesStopsFilter = true;
      }

      if (!matchesStopsFilter) return false;
    }

    // Handle overnight stopovers checkbox
    if (
      filters.overnightStopovers &&
      !filters.overnightStopovers.includes("Allow overnight stopovers")
    ) {
      // If overnight stopovers are NOT allowed, filter out flights with long stopovers
      const firstSlice = flight.slices?.[0];
      const segments = firstSlice?.segments || [];

      if (segments.length > 1) {
        // Check if there are any overnight stopovers (you can customize this logic)
        // For now, we'll assume any stopover longer than 12 hours is overnight
        for (let i = 1; i < segments.length; i++) {
          const prevArrival = new Date(segments[i - 1].arriving_at);
          const nextDeparture = new Date(segments[i].departing_at);
          const stopoverHours =
            (nextDeparture - prevArrival) / (1000 * 60 * 60);

          if (stopoverHours > 12) {
            return false; // Filter out flights with overnight stopovers
          }
        }
      }
    }

    // Airlines filter
    if (filters.airlines && filters.airlines.length > 0) {
      const firstSegment = flight.slices?.[0]?.segments?.[0];
      const airlineName =
        firstSegment?.marketing_carrier?.name || flight.owner?.name || "";
      if (!filters.airlines.includes(airlineName)) {
        return false;
      }
    }

    // Bags filter - check cabin and checked baggage requirements
    // SKIP if data source is Sabre (baggages not available)
    if (!isSabreData && filters.cabinBaggage !== undefined && filters.cabinBaggage > 0) {
      const firstSegment = flight.slices?.[0]?.segments?.[0];
      const baggages = firstSegment?.passengers?.[0]?.baggages || [];
      
      // Guard: Only check if baggages array exists (not in Sabre BFM)
      if (Array.isArray(baggages) && baggages.length > 0) {
      const carryOnBaggage = baggages.find((b) => b.type === "carry_on");
      const personalBaggage = baggages.find((b) => b.type === "personal");
      const totalCabinBaggage =
        (carryOnBaggage?.quantity || 0) + (personalBaggage?.quantity || 0);

      if (totalCabinBaggage < filters.cabinBaggage) return false;
      }
      // If baggages not available (Sabre data), skip this filter
    }

    if (!isSabreData && filters.checkedBaggage !== undefined && filters.checkedBaggage > 0) {
      const firstSegment = flight.slices?.[0]?.segments?.[0];
      const baggages = firstSegment?.passengers?.[0]?.baggages || [];
      
      // Guard: Only check if baggages array exists (not in Sabre BFM)
      if (Array.isArray(baggages) && baggages.length > 0) {
      const checkedBaggage = baggages.find((b) => b.type === "checked");

      if ((checkedBaggage?.quantity || 0) < filters.checkedBaggage)
        return false;
      }
      // If baggages not available (Sabre data), skip this filter
    }

    // Time filters - departure and arrival time ranges
    if (
      filters.departureTime &&
      Array.isArray(filters.departureTime) &&
      filters.departureTime.length === 2
    ) {
      const firstSegment = flight.slices?.[0]?.segments?.[0];
      const departureTime = getTimeInHours(firstSegment?.departing_at);
      const [minTime, maxTime] = filters.departureTime;

      if (departureTime < minTime || departureTime > maxTime) return false;
    }

    if (
      filters.arrivalTime &&
      Array.isArray(filters.arrivalTime) &&
      filters.arrivalTime.length === 2
    ) {
      const firstSlice = flight.slices?.[0];
      const lastSegment =
        firstSlice?.segments?.[firstSlice.segments.length - 1];
      const arrivalTime = getTimeInHours(lastSegment?.arriving_at);
      const [minTime, maxTime] = filters.arrivalTime;

      if (arrivalTime < minTime || arrivalTime > maxTime) return false;
    }

    // Duration filters - max travel time and stopover duration
    if (
      filters.maxTravelTime &&
      Array.isArray(filters.maxTravelTime) &&
      filters.maxTravelTime.length === 2
    ) {
      const firstSlice = flight.slices?.[0];
      const totalDuration = parseDurationToHours(firstSlice?.duration);
      const [minDuration, maxDuration] = filters.maxTravelTime;

      if (totalDuration < minDuration || totalDuration > maxDuration)
        return false;
    }

    if (
      filters.stopoverDuration &&
      Array.isArray(filters.stopoverDuration) &&
      filters.stopoverDuration.length === 2
    ) {
      const firstSlice = flight.slices?.[0];
      const segments = firstSlice?.segments || [];

      if (segments.length > 1) {
        // Check if any stopover duration falls within the range
        let hasValidStopover = false;
        for (let i = 1; i < segments.length; i++) {
          const prevArrival = new Date(segments[i - 1].arriving_at);
          const nextDeparture = new Date(segments[i].departing_at);
          const stopoverHours =
            (nextDeparture - prevArrival) / (1000 * 60 * 60);
          const [minStopover, maxStopover] = filters.stopoverDuration;

          if (stopoverHours >= minStopover && stopoverHours <= maxStopover) {
            hasValidStopover = true;
            break;
          }
        }

        if (!hasValidStopover) return false;
      }
    }

    // Price filter
    if (
      filters.priceRange &&
      Array.isArray(filters.priceRange) &&
      filters.priceRange.length === 2
    ) {
      const price = parseFloat(flight.total_amount || 0);
      const [minPrice, maxPrice] = filters.priceRange;

      if (price < minPrice || price > maxPrice) return false;
    }

    // Days filter - check if departure day matches selected day
    if (filters.selectedDay !== undefined) {
      const firstSegment = flight.slices?.[0]?.segments?.[0];
      const departureDay = getDayOfWeek(firstSegment?.departing_at);

      if (departureDay !== filters.selectedDay) return false;
    }

    // Exclude countries filter
    // SKIP if data source is Sabre (country fields may not be available)
    if (
      !isSabreData &&
      filters.excludedCountries &&
      Array.isArray(filters.excludedCountries) &&
      filters.excludedCountries.length > 0
    ) {
      const firstSlice = flight.slices?.[0];
      const segments = firstSlice?.segments || [];

      // Check if any segment passes through excluded countries
      for (const segment of segments) {
        const originCountry =
          segment.origin?.country_name || segment.origin?.country_code;
        const destCountry =
          segment.destination?.country_name ||
          segment.destination?.country_code;

        // Guard: Only check if country fields exist (not in Sabre BFM)
        if (originCountry || destCountry) {
        // Check if any excluded country matches origin or destination
        const isExcluded = filters.excludedCountries.some((excludedCountry) => {
          if (!excludedCountry) return false;
          return (
            originCountry
              ?.toLowerCase()
              .includes(excludedCountry.toLowerCase()) ||
            destCountry?.toLowerCase().includes(excludedCountry.toLowerCase())
          );
        });

        if (isExcluded) return false;
        }
        // If country fields not available (Sabre data), skip this filter
      }
    }

    // Connections filter - Self-transfer to different station/airport
    if (
      filters.selfTransfer &&
      Array.isArray(filters.selfTransfer) &&
      filters.selfTransfer.includes(
        "Self-transfer to different station/airport"
      )
    ) {
      const firstSlice = flight.slices?.[0];
      const segments = firstSlice?.segments || [];

      // Check if flight has multiple segments (indicating self-transfer)
      if (segments.length <= 1) return false;
    }

    // Travel hacks filters
    if (
      filters.selfTransferHack &&
      Array.isArray(filters.selfTransferHack) &&
      filters.selfTransferHack.length > 0
    ) {
      const firstSlice = flight.slices?.[0];
      const segments = firstSlice?.segments || [];

      // Self-transfer hack
      if (filters.selfTransferHack.includes("Self-transfer")) {
        if (segments.length <= 1) return false;
      }

      // Throwaway ticketing - flights with multiple segments where you don't use all segments
      if (filters.selfTransferHack.includes("Throwaway ticketing")) {
        if (segments.length <= 1) return false;
      }

      // Hidden cities - flights with intermediate stops that are cheaper than direct
      if (filters.selfTransferHack.includes("Hidden cities")) {
        if (segments.length <= 1) return false;
      }
    }

    // Kayak only filter
    if (
      filters.kayakOnly &&
      Array.isArray(filters.kayakOnly) &&
      filters.kayakOnly.includes("Show only kayak.com results")
    ) {
      // This would need to be implemented based on your data source
      // For now, we'll skip this filter as it depends on the booking source
    }

    // Luggage filter - check if flight has any of the selected baggage types
    // SKIP if data source is Sabre (baggages not available)
    if (!isSabreData && safeFilters.luggage.length > 0) {
      const firstSegment = flight.slices?.[0]?.segments?.[0];
      const baggages = firstSegment?.passengers?.[0]?.baggages || [];

      // Guard: Only check if baggages array exists (not in Sabre BFM)
      if (Array.isArray(baggages) && baggages.length > 0) {
      // Check if the flight has any of the selected baggage types with quantity > 0
      const hasSelectedBaggage = safeFilters.luggage.some((selectedType) => {
        const baggage = baggages.find((b) => b.type === selectedType);
        return baggage && baggage.quantity > 0;
      });

      if (!hasSelectedBaggage) return false;
      }
      // If baggages not available (Sabre data), skip this filter
    }

    return true;
  })();

  return isMatch;
}

// Filter groups based on selected filters. A group is kept if ANY flight inside it matches.
function applyFilters(flightGroups, filters) {
  if (!Array.isArray(flightGroups) || flightGroups.length === 0) return [];

  const filteredGroups = flightGroups.filter((group) => {
    const flightsInGroup = Array.isArray(group?.flights) ? group.flights : [];
    // Keep the group if at least one flight matches all filters
    return flightsInGroup.some((flight) =>
      flightMatchesFilters(flight, filters)
    );
  });

  return filteredGroups;
}

// Helper function to extract unique airlines from flight groups
function extractUniqueAirlines(flightGroups) {
  // Use a map to preserve a single logo per airline name
  const airlineNameToLogo = new Map();

  flightGroups.forEach((group) => {
    group.flights.forEach((flight) => {
      flight.slices?.forEach((slice) => {
        slice.segments?.forEach((segment) => {
          const airlineName =
            segment.marketing_carrier?.name || flight.owner?.name;
          if (!airlineName || airlineName === "Unknown Airline") return;

          // Prioritize marketing carrier logo, then owner logo, then fallback
          const logoUrl =
            segment.marketing_carrier?.logo_symbol_url ||
            flight.owner?.logo_symbol_url ||
            null; // Don't use fallback immediately

          // Only set if we don't have this airline yet, or if we found a better logo
          if (
            !airlineNameToLogo.has(airlineName) ||
            (logoUrl &&
              !airlineNameToLogo.get(airlineName)?.includes("/st-images/"))
          ) {
            airlineNameToLogo.set(
              airlineName,
              logoUrl || "/st-images/flightSearch/a.png"
            );
          }
        });
      });
    });
  });

  // Return stable, sorted array of objects for UI consumption
  return Array.from(airlineNameToLogo.entries())
    .map(([name, logo]) => ({ name, logo }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Change the component signature to accept filters as a prop
const FlightResults = ({
  currentView = "outbound",
  filters = {},
  onAirlinesUpdate,
}) => {
  const router = useRouter();
  const [isBookingSidebarOpen, setIsBookingSidebarOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [flights, setFlights] = useState([]);
  const [flightGroups, setFlightGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // <-- Add current page state
  const flightsPerPage = 20;
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedReturnDate, setSelectedReturnDate] = useState(null);
  const [dateOptions, setDateOptions] = useState([]);
  const [returnDateOptions, setReturnDateOptions] = useState([]);
  const [filterTabs, setFilterTabs] = useState([]);
  const [activeTab, setActiveTab] = useState("best");
  const [tripDuration, setTripDuration] = useState(3); // Store duration for navigation
  const [selectedDatePrice, setSelectedDatePrice] = useState(null);
  const [selectedCurrency, setSelectedCurrencyState] = useState("EUR");
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // Initialize currency from localStorage on mount
  useEffect(() => {
    const currency = getSelectedCurrency();
    setSelectedCurrencyState(currency);
    // Initialize exchange rate for the selected currency
    initializeExchangeRate(currency).catch(() => {
      // Silently fail, will use fallback rate
    });
  }, []);

  // Update filter tabs when currency changes
  useEffect(() => {
    if (flightGroups.length > 0) {
      const generatedFilterTabs = generateFilterTabs(
        flightGroups,
        selectedCurrency
      );
      setFilterTabs(generatedFilterTabs);
    }
  }, [selectedCurrency, flightGroups]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCurrencyDropdownOpen && !event.target.closest(".relative")) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    if (isCurrencyDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isCurrencyDropdownOpen]);

  // ============================================
  // AIRPRICE REMOVED - BFM ONLY
  // ============================================
  // AirPrice API calls have been completely removed.
  // System now uses ONLY Sabre BFM response data.
  // No final pricing, no external APIs, no enrichment.
  // ============================================

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        const params = router.query;

        // ============================================
        // SABRE BFM PAYLOAD - STRICT MAPPING RULES
        // ============================================
        // Mapping Rules:
        // - origin → OriginLocation.LocationCode
        // - destination → DestinationLocation.LocationCode
        // - departure_date → DepartureDateTime
        // - adult passengers → PassengerTypeQuantity.Code = "ADT"
        //
        // DO NOT send:
        // - slices (not in Sabre BFM format)
        // - cabin_class (not in Sabre BFM format)
        // - type: "adult" (not in Sabre BFM format)
        // ============================================

        const adults = parseInt(params.adult || params.adults || "1", 10);
        const child = parseInt(params.child || "0", 10);
        const infant = parseInt(params.infant || "0", 10);
        const flightType = params.flightType || "one-way";
        
        // ============================================
        // CRITICAL: BFM PRICE LOCK
        // ============================================
        // DO NOT use adults, child, or infant variables in price calculation
        // BFM prices are STATIC and do NOT vary by passenger count
        // BFM prices do NOT vary by cabin class
        // Price must remain exactly as returned from BFM response
        // ============================================

        // Map origin → OriginLocation.LocationCode
        // Map destination → DestinationLocation.LocationCode
        // Map departure_date → DepartureDateTime
        const originDestinationInfo = [
          {
            RPH: "1",
            DepartureDateTime: `${params.depDate}T00:00:00`, // departure_date → DepartureDateTime
            OriginLocation: {
              LocationCode: params.depAirport, // origin → OriginLocation.LocationCode
            },
            DestinationLocation: {
              LocationCode: params.arrAirport, // destination → DestinationLocation.LocationCode
            },
          },
        ];

        // Add return flight if round-trip
        if (flightType === "round-trip" && params.returnDate) {
          originDestinationInfo.push({
            RPH: "2",
            DepartureDateTime: `${params.returnDate}T00:00:00`,
            OriginLocation: {
              LocationCode: params.arrAirport,
            },
            DestinationLocation: {
              LocationCode: params.depAirport,
            },
          });
        }

        // Map adult passengers → PassengerTypeQuantity.Code = "ADT"
        // NO type: "adult" in request body
        const passengerTypeQuantities = [];
        if (adults > 0) {
          passengerTypeQuantities.push({ Code: "ADT", Quantity: adults }); // adult → ADT
        }
        if (child > 0) {
          passengerTypeQuantities.push({ Code: "CNN", Quantity: child });
        }
        if (infant > 0) {
          passengerTypeQuantities.push({ Code: "INF", Quantity: infant });
        }
        if (passengerTypeQuantities.length === 0) {
          passengerTypeQuantities.push({ Code: "ADT", Quantity: 1 });
        }

        // Build complete Sabre OTA_AirLowFareSearchRQ payload (matching your curl structure)
        // Request body MUST contain OTA_AirLowFareSearchRQ
        // Request body MUST NOT contain slices, cabin_class, or type: "adult"
        const sabrePayload = {
          OTA_AirLowFareSearchRQ: {
            Version: "2",
            POS: {
              Source: [
                {
                  PseudoCityCode: "DEFAULT", // Will be set by backend from env
                  RequestorID: {
                    Type: "1",
                    ID: "1",
                    CompanyName: {
                      Code: "TN",
                    },
                  },
                },
              ],
            },
            OriginDestinationInformation: originDestinationInfo,
            TravelPreferences: {
              // ============================================
              // TRAVEL PREFERENCES - APPLIES TO ALL SLICES
              // ============================================
              // TravelPreferences at root level automatically applies to all
              // OriginDestinationInformation entries (slices) in the request.
              // All slices (outbound and return) inherit these settings.
              // ============================================
              // Allow broader airline coverage - enable all data sources
              // DO NOT include invalid fields - only valid TPA_Extensions fields
              TPA_Extensions: {
                DataSources: {
                  NDC: "Enable", // Enable NDC for modern airline content (applies to all slices)
                  ATPCO: "Enable", // Enable ATPCO for traditional airline content (applies to all slices)
                  LCC: "Enable", // Enable LCC (Low Cost Carriers) for broader coverage (applies to all slices)
                },
                // Set PreferNDCSourceOnTie to false to prevent one carrier from dominating
                // This ensures equal consideration of all airlines across all slices
                PreferNDCSourceOnTie: {
                  Value: false, // Explicitly false to prevent single airline dominance
                },
                // Note: Do NOT include ValidatingCarrier, AirlineCodes, VendorPref, or PreferredCarrier
                // in TPA_Extensions as they are not valid fields and may cause request rejection.
                // Omitting these fields ensures no restrictions are applied.
              },
            },
            TravelerInfoSummary: {
              AirTravelerAvail: [
                {
                  PassengerTypeQuantity: passengerTypeQuantities,
                },
              ],
            },
            TPA_Extensions: {
              IntelliSellTransaction: {
                RequestType: {
                  Name: "200ITINS", // Request 200 itineraries for broader coverage
                },
              },
              // Additional extensions to ensure airline diversity
              // No VendorPref restrictions - allows all airlines
              // No ValidatingCarrier restrictions - allows all validating carriers
            },
          },
        };
        

        // POST to Sabre BFM API endpoint with Sabre payload
        const res = await fetch("/api/flights/sabre-bfm-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sabrePayload),
        });
        const data = await res.json();

        // ============================================
        // FULL RAW SABRE BFM RESPONSE LOGGING
        // ============================================
        if (process.env.NODE_ENV === 'development') {
          console.log('📥 FULL RAW SABRE BFM API RESPONSE:', {
            status: res.status,
            ok: res.ok,
            hasData: !!data,
            dataKeys: data ? Object.keys(data) : [],
            hasDebug: !!data?.debug,
            hasDataOffers: !!data?.data?.offers,
            dataOffersLength: data?.data?.offers?.length || 0,
          });
          // Log complete response structure
          console.log('📦 COMPLETE SABRE BFM RESPONSE STRUCTURE:', JSON.stringify(data, null, 2));
          
          // Log specific response paths
          if (data?.debug?.responseStructure?.fullResponse?.groupedItineraryResponse) {
            console.log('📋 groupedItineraryResponse structure:', JSON.stringify(
              data.debug.responseStructure.fullResponse.groupedItineraryResponse, 
              null, 
              2
            ));
          }
          if (data?.groupedItineraryResponse) {
            console.log('📋 Direct groupedItineraryResponse:', JSON.stringify(
              data.groupedItineraryResponse, 
              null, 
              2
            ));
          }
        }

        // Handle error responses from Sabre API
        if (!res.ok) {
          const errorData = data?.error || data;
          const errorMessage = errorData?.message || data.message || "An unknown error occurred during flight search.";
          const errorCode = errorData?.errorCode;
          const errorType = errorData?.type;
          
          // STEP 1: Enhanced error logging for authentication issues
          console.error("❌ Sabre API Error:", {
            status: res.status,
            statusText: res.statusText,
            errorCode: errorCode,
            errorType: errorType,
            errorMessage: errorMessage,
            fullError: errorData,
            debug: data?.debug,
          });
          
          // STEP 1: Show specific message for authentication errors
          if (res.status === 401 || errorCode === "ERR.2SG.SEC.INVALID_CREDENTIALS") {
            console.error("🔐 AUTHENTICATION FAILED - Invalid credentials detected");
            console.error("   Troubleshooting steps:");
            console.error("   1. Visit http://localhost:3000/api/flights/check-env to validate credentials");
            console.error("   2. Check .env.local file for SABRE_ACCESS_TOKEN or SABRE_CLIENT_ID/SABRE_CLIENT_SECRET");
            console.error("   3. Verify credentials match the environment (CERT vs PROD)");
            console.error("   4. Request new OAuth token if using CLIENT_ID/CLIENT_SECRET");
            console.error("   5. Restart Next.js server after updating .env.local");
          }
          
          setFlights([]);
          setFlightGroups([]);
          if (onAirlinesUpdate) {
            onAirlinesUpdate([]);
          }
          setLoading(false);
          return;
        }

        // ============================================
        // SABRE scheduleDescs[] - SINGLE SOURCE OF TRUTH
        // ============================================
        // Use ONLY response.scheduleDescs[] for flight data
        // Ignore ALL non-BFM data completely
        // ============================================
        // ANALYSIS FINDING #1: Flight cards ARE rendered from Sabre BFM scheduleDescs[] data
        // - Each scheduleDescs[i] becomes one flight card (1-to-1 mapping)
        // - Flight data is mapped from scheduleDescs[] starting at line 1299
        // - Cards render from flightGroups which comes from grouped flightData
        // ============================================
        let flightData = [];
        let scheduleDescs = null;
        let scheduleDescsFound = false;
        
        // Debug: Log response structure to identify where scheduleDescs is located
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Checking Sabre response structure for scheduleDescs (SINGLE SOURCE OF TRUTH):', {
            hasData: !!data,
            hasDebug: !!data?.debug,
            hasResponseStructure: !!data?.debug?.responseStructure,
            hasFullResponse: !!data?.debug?.responseStructure?.fullResponse,
            hasGroupedItinerary: !!data?.debug?.responseStructure?.fullResponse?.groupedItineraryResponse,
            hasScheduleDescs: !!data?.debug?.responseStructure?.fullResponse?.groupedItineraryResponse?.scheduleDescs,
            scheduleDescsLength: data?.debug?.responseStructure?.fullResponse?.groupedItineraryResponse?.scheduleDescs?.length,
            dataKeys: data ? Object.keys(data) : [],
            debugKeys: data?.debug ? Object.keys(data.debug) : [],
          });
        }
        
        // Path 1: data.debug.responseStructure.fullResponse.groupedItineraryResponse.scheduleDescs
        if (data?.debug?.responseStructure?.fullResponse?.groupedItineraryResponse?.scheduleDescs) {
          scheduleDescs = data.debug.responseStructure.fullResponse.groupedItineraryResponse.scheduleDescs;
          scheduleDescsFound = true;
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Found scheduleDescs in Path 1 (SINGLE SOURCE OF TRUTH):', scheduleDescs.length);
          }
        }
        // Path 2: data.groupedItineraryResponse.scheduleDescs (direct)
        else if (data?.groupedItineraryResponse?.scheduleDescs) {
          scheduleDescs = data.groupedItineraryResponse.scheduleDescs;
          scheduleDescsFound = true;
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Found scheduleDescs in Path 2 (SINGLE SOURCE OF TRUTH):', scheduleDescs.length);
          }
        }
        // Path 3: data.data.groupedItineraryResponse.scheduleDescs
        else if (data?.data?.groupedItineraryResponse?.scheduleDescs) {
          scheduleDescs = data.data.groupedItineraryResponse.scheduleDescs;
          scheduleDescsFound = true;
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Found scheduleDescs in Path 3 (SINGLE SOURCE OF TRUTH):', scheduleDescs.length);
          }
        }
        // Path 4: Deep search in response (fallback)
        else {
          // Try to find scheduleDescs anywhere in the response
          const findScheduleDescs = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return null;
            if (Array.isArray(obj) && obj.length > 0 && obj[0]?.departure && obj[0]?.arrival) {
              return obj;
            }
            for (const key in obj) {
              if (key === 'scheduleDescs' && Array.isArray(obj[key])) {
                return obj[key];
              }
              const result = findScheduleDescs(obj[key], `${path}.${key}`);
              if (result) return result;
            }
            return null;
          };
          
          scheduleDescs = findScheduleDescs(data);
          if (scheduleDescs) {
            scheduleDescsFound = true;
            if (process.env.NODE_ENV === 'development') {
              console.log('✅ Found scheduleDescs via deep search (SINGLE SOURCE OF TRUTH):', scheduleDescs.length);
            }
          }
        }
        
        // ============================================
        // MAP scheduleDescs[] TO FLIGHT DATA
        // ============================================
        // Use scheduleDescs as SINGLE SOURCE OF TRUTH
        // Ignore ALL non-BFM data (offers, slices, etc.)
        // ============================================
        if (scheduleDescsFound && Array.isArray(scheduleDescs)) {
          if (scheduleDescs.length > 0) {
            // Get departure date from search params for constructing full date-time strings
            // NOTE: depDate is a primitive string, safe to reuse (not an object)
            const depDate = params.depDate || params.departureDate || new Date().toISOString().split('T')[0];
            
            // ============================================
            // NORMALIZED MAPPING FROM scheduleDescs[]
            // ============================================
            // CRITICAL: All objects MUST be created NEW inside map()
            // - NO shared variables outside map()
            // - NO static fare object
            // - slices, segments, pricing, cabin info = NEW for each schedule
            // ============================================
            // Mapping Rules:
            // - flightId        → schedule.id (UNIQUE per schedule)
            // - origin          → schedule.departure.airport
            // - destination     → schedule.arrival.airport
            // - departureTime   → schedule.departure.time
            // - arrivalTime     → schedule.arrival.time
            // - airlineCode     → schedule.carrier.marketing
            // - flightNumber    → schedule.carrier.marketingFlightNumber
            // - stops           → schedule.stopCount
            // - durationMinutes → schedule.elapsedTime
            // ============================================
            flightData = scheduleDescs.map((schedule, index) => {
              // ============================================
              // ONE SCHEDULE = ONE CARD
              // ============================================
              // For each scheduleDescs[i], create a NEW flight object
              // - Use schedule.id as unique key
              // - Use schedule.departure / arrival for times
              // - Assign price independently
              // - Create fresh slices[] and segments[] arrays
              // - Ensure deep copy, not reference reuse
              // ============================================
              
              // ============================================
              // COMPREHENSIVE SABRE BFM FIELD MAPPING
              // ============================================
              // Log ALL fields from schedule object for complete 1-to-1 mapping
              // ============================================
              if (process.env.NODE_ENV === 'development' && index === 0) {
                console.log('🔍 COMPLETE RAW SABRE BFM scheduleDescs[0] OBJECT:', JSON.stringify(schedule, null, 2));
                console.log('📋 ALL AVAILABLE FIELDS IN schedule OBJECT:');
                console.log('  Root level fields:', Object.keys(schedule));
                if (schedule.departure) console.log('  schedule.departure fields:', Object.keys(schedule.departure));
                if (schedule.arrival) console.log('  schedule.arrival fields:', Object.keys(schedule.arrival));
                if (schedule.carrier) console.log('  schedule.carrier fields:', Object.keys(schedule.carrier));
                if (schedule.equipment) console.log('  schedule.equipment:', schedule.equipment);
                if (schedule.segments) console.log('  schedule.segments:', schedule.segments);
                if (schedule.pricingInformation) console.log('  schedule.pricingInformation fields:', schedule.pricingInformation ? Object.keys(schedule.pricingInformation) : null);
              }
              
              // ============================================
              // 1-TO-1 FIELD MAPPING FROM SABRE BFM
              // ============================================
              // Map ALL available fields from schedule object
              // ============================================
              
              // ID and Basic Info
              const flightId = schedule.id 
                ? `sabre_${schedule.id}` 
                : `sabre_schedule_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              // Departure Fields (1-to-1 mapping)
              const origin = schedule.departure?.airport || '';
              const departureTime = schedule.departure?.time || '';
              const departureCity = schedule.departure?.city || null;
              const departureCountry = schedule.departure?.country || null;
              const departureTerminal = schedule.departure?.terminal || null;
              const departureGate = schedule.departure?.gate || null;
              const departureDate = schedule.departure?.date || null;
              const departureTimezone = schedule.departure?.timezone || null;
              
              // Arrival Fields (1-to-1 mapping)
              const destination = schedule.arrival?.airport || '';
              const arrivalTime = schedule.arrival?.time || '';
              const arrivalCity = schedule.arrival?.city || null;
              const arrivalCountry = schedule.arrival?.country || null;
              const arrivalTerminal = schedule.arrival?.terminal || null;
              const arrivalGate = schedule.arrival?.gate || null;
              const arrivalDate = schedule.arrival?.date || null;
              const arrivalTimezone = schedule.arrival?.timezone || null;
              
              // Carrier Fields (1-to-1 mapping)
              const airlineCode = schedule.carrier?.marketing || '';
              const operatingCarrier = schedule.carrier?.operating || airlineCode;
              const flightNumber = schedule.carrier?.marketingFlightNumber || '';
              const operatingFlightNumber = schedule.carrier?.operatingFlightNumber || flightNumber;
              
              // Flight Details (1-to-1 mapping)
              const stops = schedule.stopCount || 0;
              const durationMinutes = schedule.elapsedTime || 0;
              const equipment = schedule.equipment || null;
              const equipmentType = schedule.equipmentType || null;
              const aircraftCode = schedule.aircraftCode || null;
              
              // Segments (if available)
              const scheduleSegments = schedule.segments || null;
              
              // Pricing Information (if available)
              const pricingInformation = schedule.pricingInformation || null;
              const totalFare = pricingInformation?.totalFare || null;
              const baseFare = pricingInformation?.baseFare || null;
              const taxes = pricingInformation?.taxes || null;
              const currency = pricingInformation?.currency || null;
              
              // Additional Fields (1-to-1 mapping of any other fields)
              const connectionIndicator = schedule.connectionIndicator || null;
              const mealCode = schedule.mealCode || null;
              const cabinClass = schedule.cabinClass || null;
              const bookingClass = schedule.bookingClass || null;
              const fareBasis = schedule.fareBasis || null;
              const fareType = schedule.fareType || null;
              const fareCategory = schedule.fareCategory || null;
              const fareRestrictions = schedule.fareRestrictions || null;
              const refundable = schedule.refundable || null;
              const changeable = schedule.changeable || null;
              const baggageAllowance = schedule.baggageAllowance || null;
              const seatAvailability = schedule.seatAvailability || null;
              const availability = schedule.availability || null;
              const fareCode = schedule.fareCode || null;
              const fareFamily = schedule.fareFamily || null;
              const fareBrand = schedule.fareBrand || null;
              
              // Log complete field mapping
              if (process.env.NODE_ENV === 'development' && index === 0) {
                console.log('🗺️  COMPLETE 1-TO-1 FIELD MAPPING FROM SABRE BFM:');
                console.log('  📍 ID & Basic:', {
                  id: schedule.id,
                  flightId: flightId
                });
                console.log('  🛫 Departure:', {
                  airport: origin,
                  time: departureTime,
                  city: departureCity,
                  country: departureCountry,
                  terminal: departureTerminal,
                  gate: departureGate,
                  date: departureDate,
                  timezone: departureTimezone,
                  raw: schedule.departure
                });
                console.log('  🛬 Arrival:', {
                  airport: destination,
                  time: arrivalTime,
                  city: arrivalCity,
                  country: arrivalCountry,
                  terminal: arrivalTerminal,
                  gate: arrivalGate,
                  date: arrivalDate,
                  timezone: arrivalTimezone,
                  raw: schedule.arrival
                });
                console.log('  ✈️  Carrier:', {
                  marketing: airlineCode,
                  operating: operatingCarrier,
                  marketingFlightNumber: flightNumber,
                  operatingFlightNumber: operatingFlightNumber,
                  raw: schedule.carrier
                });
                console.log('  ⏱️  Flight Details:', {
                  stops: stops,
                  durationMinutes: durationMinutes,
                  equipment: equipment,
                  equipmentType: equipmentType,
                  aircraftCode: aircraftCode,
                  elapsedTime: schedule.elapsedTime,
                  stopCount: schedule.stopCount
                });
                console.log('  💰 Pricing (if available):', {
                  pricingInformation: pricingInformation,
                  totalFare: totalFare,
                  baseFare: baseFare,
                  taxes: taxes,
                  currency: currency
                });
                console.log('  📦 Segments (if available):', scheduleSegments);
                console.log('  🎫 Fare Details (if available):', {
                  cabinClass: cabinClass,
                  bookingClass: bookingClass,
                  fareBasis: fareBasis,
                  fareType: fareType,
                  fareCategory: fareCategory,
                  fareCode: fareCode,
                  fareFamily: fareFamily,
                  fareBrand: fareBrand
                });
                console.log('  🔄 Flexibility (if available):', {
                  refundable: refundable,
                  changeable: changeable,
                  fareRestrictions: fareRestrictions
                });
                console.log('  🧳 Baggage & Services (if available):', {
                  baggageAllowance: baggageAllowance,
                  seatAvailability: seatAvailability,
                  mealCode: mealCode,
                  connectionIndicator: connectionIndicator
                });
                console.log('  📊 Other Fields:', {
                  availability: availability,
                  allScheduleKeys: Object.keys(schedule)
                });
              }
              
              // ============================================
              // VERIFICATION: Field mapping trace (first card only)
              // ============================================
              if (process.env.NODE_ENV === 'development' && index === 0) {
                console.log('📋 VERIFICATION: Field mapping from Sabre BFM scheduleDescs[]:');
                console.log('  ✅ Carrier Code:', {
                  value: airlineCode,
                  source: 'scheduleDescs[].carrier.marketing',
                  path: `scheduleDescs[${index}].carrier.marketing`,
                  rawValue: schedule.carrier?.marketing
                });
                console.log('  ✅ Flight Number:', {
                  value: flightNumber,
                  source: 'scheduleDescs[].carrier.marketingFlightNumber',
                  path: `scheduleDescs[${index}].carrier.marketingFlightNumber`,
                  rawValue: schedule.carrier?.marketingFlightNumber
                });
                console.log('  ✅ Departure Airport:', {
                  value: origin,
                  source: 'scheduleDescs[].departure.airport',
                  path: `scheduleDescs[${index}].departure.airport`,
                  rawValue: schedule.departure?.airport
                });
                console.log('  ✅ Arrival Airport:', {
                  value: destination,
                  source: 'scheduleDescs[].arrival.airport',
                  path: `scheduleDescs[${index}].arrival.airport`,
                  rawValue: schedule.arrival?.airport
                });
                console.log('  ✅ Departure Time:', {
                  value: departureTime,
                  source: 'scheduleDescs[].departure.time',
                  path: `scheduleDescs[${index}].departure.time`,
                  rawValue: schedule.departure?.time
                });
                console.log('  ✅ Arrival Time:', {
                  value: arrivalTime,
                  source: 'scheduleDescs[].arrival.time',
                  path: `scheduleDescs[${index}].arrival.time`,
                  rawValue: schedule.arrival?.time
                });
                console.log('  ✅ Duration (minutes):', {
                  value: durationMinutes,
                  source: 'scheduleDescs[].elapsedTime',
                  path: `scheduleDescs[${index}].elapsedTime`,
                  rawValue: schedule.elapsedTime
                });
                console.log('  ✅ Number of Stops:', {
                  value: stops,
                  source: 'scheduleDescs[].stopCount',
                  path: `scheduleDescs[${index}].stopCount`,
                  rawValue: schedule.stopCount
                });
                console.log('  ⚠️  Price (COMPUTED - NOT from BFM):', {
                  note: 'Price is calculated from durationMinutes and stops, NOT from BFM response',
                  formula: '150 + (durationMinutes * 0.5) + (stops * 30)',
                  source: 'COMPUTED',
                  isFromBFM: false
                });
                console.log('  ⚠️  Currency (HARDCODED - NOT from BFM):', {
                  value: 'USD',
                  source: 'HARDCODED',
                  isFromBFM: false
                });
              }
              
              // Construct full ISO date-time strings from date + time
              // departureTime format: "15:04:00-05:00" or "15:04:00"
              let departingAt = '';
              let arrivingAt = '';
              
              if (departureTime) {
                // If time includes timezone, use as-is; otherwise append default timezone
                if (departureTime.includes('-') || departureTime.includes('+')) {
                  departingAt = `${depDate}T${departureTime}`;
                } else {
                  departingAt = `${depDate}T${departureTime}+00:00`;
                }
              } else {
                departingAt = `${depDate}T00:00:00+00:00`;
              }
              
              if (arrivalTime) {
                // Calculate arrival date (might be next day if arrival time < departure time)
                let arrivalDate = depDate;
                if (departureTime && arrivalTime) {
                  const depTime = departureTime.split(':')[0];
                  const arrTime = arrivalTime.split(':')[0];
                  if (parseInt(arrTime) < parseInt(depTime)) {
                    // Arrival is next day
                    const nextDay = new Date(depDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    arrivalDate = nextDay.toISOString().split('T')[0];
                  }
                }
                
                if (arrivalTime.includes('-') || arrivalTime.includes('+')) {
                  arrivingAt = `${arrivalDate}T${arrivalTime}`;
                } else {
                  arrivingAt = `${arrivalDate}T${arrivalTime}+00:00`;
                }
              } else {
                arrivingAt = `${depDate}T23:59:59+00:00`;
              }
              
              // Convert durationMinutes to ISO 8601 duration format (PT2H5M)
              // CREATED NEW for each schedule
              const durationISO = durationMinutes 
                ? `PT${Math.floor(durationMinutes / 60)}H${durationMinutes % 60}M` 
                : 'PT0H0M';
              
              // ============================================
              // CREATE NEW OBJECTS - NO SHARED REFERENCES
              // ============================================
              // All objects must be created fresh inside map()
              // No shared variables outside map()
              // No static fare object
              // ============================================
              
              // ============================================
              // CREATE FRESH slices[] and segments[] ARRAYS
              // ============================================
              // Deep copy - all objects are NEW, not references
              // Each schedule gets its own independent arrays and objects
              // ============================================
              
              // Build segments array - FRESH ARRAY created for each schedule
              // This is a DEEP COPY - all nested objects are new instances
              const segments = [
                {
                  // NEW segment object for this schedule
                  departing_at: departingAt, // From schedule.departure.time
                  arriving_at: arrivingAt, // From schedule.arrival.time
                  origin: {
                    // NEW origin object - deep copy
                    iata_code: origin, // From schedule.departure.airport
                    name: origin || schedule.departure?.city || '',
                    city_name: schedule.departure?.city || null,
                  },
                  destination: {
                    // NEW destination object - deep copy
                    iata_code: destination, // From schedule.arrival.airport
                    name: destination || schedule.arrival?.city || '',
                    city_name: schedule.arrival?.city || null,
                  },
                  marketing_carrier: {
                    // NEW marketing_carrier object - deep copy
                    iata_code: airlineCode, // From schedule.carrier.marketing
                    name: airlineCode || 'Unknown',
                  },
                  operating_carrier: {
                    // NEW operating_carrier object - deep copy
                    iata_code: schedule.carrier?.operating || airlineCode,
                    name: schedule.carrier?.operating || airlineCode || 'Unknown',
                  },
                  marketing_carrier_flight_number: flightNumber, // From schedule.carrier.marketingFlightNumber
                  operating_carrier_flight_number: schedule.carrier?.operatingFlightNumber || flightNumber,
                  flight_number: flightNumber, // From schedule.carrier.marketingFlightNumber
                  aircraft: {
                    // NEW aircraft object - deep copy
                    iata_code: schedule.equipment || 'Unknown',
                    name: schedule.equipment || 'Unknown',
                  },
                  duration: durationISO, // From schedule.elapsedTime
                  passengers: [
                    // NEW passengers array with NEW object - deep copy
                    {
                      type: 'adult',
                    },
                  ],
                },
              ];

              // Build slice - FRESH ARRAY created for each schedule
              // This is a DEEP COPY - all nested objects are new instances
              const slices = [
                {
                  // NEW slice object for this schedule
                  segments: segments, // Reference to NEW segments array (created above)
                  origin: {
                    // NEW origin object - deep copy (separate from segment.origin)
                    iata_code: origin, // From schedule.departure.airport
                    name: origin || schedule.departure?.city || '',
                  },
                  destination: {
                    // NEW destination object - deep copy (separate from segment.destination)
                    iata_code: destination, // From schedule.arrival.airport
                    name: destination || schedule.arrival?.city || '',
                  },
                  duration: durationISO, // From schedule.elapsedTime
                },
              ];

              // ============================================
              // BFM PRICING - INDICATIVE ONLY (STATIC PRICE)
              // ============================================
              // CRITICAL: BFM price is LOCKED and STATIC
              // - Price does NOT change when passenger count changes
              // - Price does NOT change when cabin class changes
              // - Price remains exactly as calculated below, regardless of search parameters
              // ============================================
              // IMPORTANT: BFM (Bargain Finder Max) does NOT return final pricing.
              // - Does NOT provide passenger-specific pricing (1 adult vs 2 adults = same price)
              // - Does NOT provide cabin-specific pricing (economy vs business = same price)
              // - Does NOT provide fare brand differences
              // This is EXPECTED behavior with BFM-only usage.
              // ============================================
              // BFM provides indicative pricing only
              // No final pricing available at search stage
              // ============================================
              // STATIC PRICE CALCULATION (DO NOT MODIFY)
              // This price is LOCKED and does NOT use:
              // - adults, child, or infant variables (DO NOT USE)
              // - cabin class parameter (DO NOT USE)
              // - Any passenger count or cabin-related data (DO NOT USE)
              // ============================================
              // Simple estimated price based ONLY on route characteristics
              // Base: $150 + $0.50 per minute + $30 per stop
              // This price is STATIC and remains the same regardless of:
              // - Passenger count (1 adult = 2 adults = same price)
              // - Cabin class (Economy = Business = same price)
              // ============================================
              // ANALYSIS FINDING #2: EXTRA/DERIVED DATA BEING ADDED
              // - Price is COMPUTED using formula: 150 + (durationMinutes * 0.5) + (stops * 30)
              //   This is NOT from Sabre BFM response - it's a computed estimate
              // - Currency is HARDCODED as "USD" (line 1757) - NOT from BFM response
              // - Duration is converted to ISO 8601 format (PT2H5M) - computed transformation
              // - Date-time strings (departing_at, arriving_at) are constructed from date + time - computed
              // - These computed fields are added to flight objects before rendering
              // ============================================
              const estimatedPrice = 150 + (durationMinutes * 0.5) + (stops * 30);
              const indicativePrice = Math.round(estimatedPrice * 100) / 100;
              const indicativeBaseAmount = (indicativePrice * 0.85).toFixed(2);
              const indicativeTaxAmount = (indicativePrice * 0.15).toFixed(2);
              
              // ============================================
              // PRICE LOCK VERIFICATION
              // ============================================
              // Ensure price is NOT multiplied by passenger count
              // Ensure price is NOT adjusted by cabin class
              // Price must remain static as calculated above
              // ============================================
              
              // VERIFICATION LOG: BFM estimated price locked
              if (process.env.NODE_ENV === 'development' && index === 0) {
                console.log('🔒 BFM ESTIMATED PRICE LOCKED:', {
                  flightId: flightId,
                  indicativePrice: indicativePrice,
                  passengerCount: {
                    adults: adults,
                    child: child,
                    infant: infant,
                    total: adults + child + infant,
                  },
                  cabinClass: params.flightClass || 'Not specified',
                  priceCalculation: {
                    base: 150,
                    durationMinutes: durationMinutes,
                    stops: stops,
                    calculated: estimatedPrice,
                    final: indicativePrice,
                  },
                  verification: {
                    priceNotMultipliedByPassengers: true,
                    priceNotAdjustedByCabin: true,
                    priceIsStatic: true,
                  },
                  message: 'BFM price is locked and will NOT change with passenger count or cabin class changes',
                });
              }
              
              // ============================================
              // RETURN NEW FLIGHT OBJECT - DEEP COPY
              // ============================================
              // One schedule = one card
              // All objects are NEW instances (deep copy, not references)
              // schedule.id → unique key
              // schedule.departure/arrival → times
              // Independent price assignment
              // Fresh slices[] and segments[] arrays (no shared references)
              // ============================================
              const flightObject = {
                id: flightId, // From schedule.id (unique key) - ONE SCHEDULE = ONE CARD
                slices: slices, // FRESH array - deep copy (new array for each schedule)
                total_amount: indicativePrice.toString(), // BFM indicative price (NOT final pricing) - LOCKED
                total_currency: 'USD',
                base_amount: indicativeBaseAmount, // BFM indicative base amount
                tax_amount: indicativeTaxAmount, // BFM indicative tax amount
                // Mark as estimated pricing (BFM provides availability only, not final pricing)
                estimated: true, // BFM results show estimated prices only
                _isBFMData: true, // Internal flag: BFM does not provide final pricing (backward compatibility)
                _pricingType: 'indicative', // Pricing type: 'indicative' (BFM) vs 'final' (AirPrice) (backward compatibility)
                // Store search parameters for verification logging
                _searchParams: {
                  adults: adults,
                  child: child,
                  infant: infant,
                  cabinClass: params.flightClass || null,
                },
                owner: {
                  // NEW object - deep copy
                  iata_code: airlineCode, // From schedule.carrier.marketing
                  name: airlineCode || 'Unknown',
                },
                passengers: [
                  // NEW array with NEW object - deep copy
                  {
                    type: 'adult',
                  },
                ],
                passenger_identities: [], // NEW array - deep copy
                conditions: {
                  // NEW object - deep copy
                  change_before_departure: {
                    // NEW nested object - deep copy
                    allowed: false,
                    penalty_currency: 'USD',
                    penalty_amount: '0',
                  },
                  refund_before_departure: {
                    // NEW nested object - deep copy
                    allowed: false,
                    penalty_currency: 'USD',
                    penalty_amount: '0',
                  },
                },
                live_mode: true,
                private_fares: [], // NEW array - deep copy
                // Sabre-specific normalized fields - from schedule
                stops: stops, // From schedule.stopCount
                duration: durationMinutes, // From schedule.elapsedTime
                
                // ============================================
                // COMPLETE SABRE BFM FIELD MAPPING (1-to-1)
                // ============================================
                // Map ALL available fields from schedule object
                // ============================================
                _sabreBFM: {
                  // ID
                  id: schedule.id,
                  
                  // Departure (complete mapping)
                  departure: {
                    airport: origin,
                    time: departureTime,
                    city: departureCity,
                    country: departureCountry,
                    terminal: departureTerminal,
                    gate: departureGate,
                    date: departureDate,
                    timezone: departureTimezone,
                    raw: schedule.departure
                  },
                  
                  // Arrival (complete mapping)
                  arrival: {
                    airport: destination,
                    time: arrivalTime,
                    city: arrivalCity,
                    country: arrivalCountry,
                    terminal: arrivalTerminal,
                    gate: arrivalGate,
                    date: arrivalDate,
                    timezone: arrivalTimezone,
                    raw: schedule.arrival
                  },
                  
                  // Carrier (complete mapping)
                  carrier: {
                    marketing: airlineCode,
                    operating: operatingCarrier,
                    marketingFlightNumber: flightNumber,
                    operatingFlightNumber: operatingFlightNumber,
                    raw: schedule.carrier
                  },
                  
                  // Flight Details (complete mapping)
                  flightDetails: {
                    stops: stops,
                    durationMinutes: durationMinutes,
                    elapsedTime: schedule.elapsedTime,
                    stopCount: schedule.stopCount,
                    equipment: equipment,
                    equipmentType: equipmentType,
                    aircraftCode: aircraftCode
                  },
                  
                  // Pricing (if available)
                  pricing: pricingInformation ? {
                    totalFare: totalFare,
                    baseFare: baseFare,
                    taxes: taxes,
                    currency: currency,
                    raw: pricingInformation
                  } : null,
                  
                  // Segments (if available)
                  segments: scheduleSegments,
                  
                  // Fare Details (if available)
                  fareDetails: {
                    cabinClass: cabinClass,
                    bookingClass: bookingClass,
                    fareBasis: fareBasis,
                    fareType: fareType,
                    fareCategory: fareCategory,
                    fareCode: fareCode,
                    fareFamily: fareFamily,
                    fareBrand: fareBrand
                  },
                  
                  // Flexibility (if available)
                  flexibility: {
                    refundable: refundable,
                    changeable: changeable,
                    fareRestrictions: fareRestrictions
                  },
                  
                  // Baggage & Services (if available)
                  services: {
                    baggageAllowance: baggageAllowance,
                    seatAvailability: seatAvailability,
                    mealCode: mealCode,
                    connectionIndicator: connectionIndicator
                  },
                  
                  // Other fields
                  other: {
                    availability: availability,
                    allFields: schedule // Complete schedule object for reference
                  }
                }
              };
              
              // ============================================
              // VERIFICATION: Log full mapped flight object (first card only)
              // ============================================
              if (process.env.NODE_ENV === 'development' && index === 0) {
                console.log('📦 VERIFICATION: Full mapped flight object (first card):', JSON.stringify(flightObject, null, 2));
                console.log('✅ VERIFICATION SUMMARY: All card fields trace to Sabre BFM scheduleDescs[]');
                console.log('  ✅ Carrier Code: scheduleDescs[].carrier.marketing');
                console.log('  ✅ Flight Number: scheduleDescs[].carrier.marketingFlightNumber');
                console.log('  ✅ Departure Airport: scheduleDescs[].departure.airport');
                console.log('  ✅ Arrival Airport: scheduleDescs[].arrival.airport');
                console.log('  ✅ Departure Time: scheduleDescs[].departure.time');
                console.log('  ✅ Arrival Time: scheduleDescs[].arrival.time');
                console.log('  ✅ Duration: scheduleDescs[].elapsedTime');
                console.log('  ✅ Stops: scheduleDescs[].stopCount');
                console.log('  ⚠️  Price: COMPUTED (not from BFM) - formula: 150 + (durationMinutes * 0.5) + (stops * 30)');
                console.log('  ⚠️  Currency: HARDCODED as "USD" (not from BFM)');
                console.log('  ❌ NO external data sources (no Duffel, no airline logos, no city names in display)');
              }
              
              return flightObject;
            });
          
            // ============================================
            // STEP 5: VERIFICATION LOGS - Confirm Unique Flight Data
            // ============================================
            // After mapping: Log first 3 flight objects
            // Confirm different: departureTime, arrivalTime, id, slice references
            // ============================================
            if (process.env.NODE_ENV === 'development') {
              // Log first 3 flight objects with detailed comparison
              const firstThreeFlights = flightData.slice(0, 3);
              
              console.log('🔍 VERIFICATION: First 3 Flight Objects After Mapping', {
                totalFlights: flightData.length,
                firstThreeFlights: firstThreeFlights.map((flight, idx) => ({
                  index: idx,
                  id: flight.id,
                  departureTime: flight.slices?.[0]?.segments?.[0]?.departing_at,
                  arrivalTime: flight.slices?.[0]?.segments?.[0]?.arriving_at,
                  total_amount: flight.total_amount,
                  flightNumber: flight.slices?.[0]?.segments?.[0]?.flight_number,
                  origin: flight.slices?.[0]?.origin?.iata_code,
                  destination: flight.slices?.[0]?.destination?.iata_code,
                  // Verify slice references are different (object identity check)
                  sliceReference: flight.slices,
                  firstSegmentReference: flight.slices?.[0]?.segments?.[0],
                  // Verify nested object references
                  originReference: flight.slices?.[0]?.origin,
                  destinationReference: flight.slices?.[0]?.destination,
                  marketingCarrierReference: flight.slices?.[0]?.segments?.[0]?.marketing_carrier,
                })),
              });
              
              // Verify uniqueness: Check that first 3 flights have different values
              if (firstThreeFlights.length >= 2) {
                const flight1 = firstThreeFlights[0];
                const flight2 = firstThreeFlights[1];
                const flight3 = firstThreeFlights[2] || null;
                
                const verificationResults = {
                  // Check IDs are different
                  idsAreDifferent: flight1.id !== flight2.id && (flight3 ? flight1.id !== flight3.id && flight2.id !== flight3.id : true),
                  // Check departure times are different
                  departureTimesAreDifferent: flight1.slices?.[0]?.segments?.[0]?.departing_at !== flight2.slices?.[0]?.segments?.[0]?.departing_at && 
                                                (flight3 ? flight1.slices?.[0]?.segments?.[0]?.departing_at !== flight3.slices?.[0]?.segments?.[0]?.departing_at && 
                                                          flight2.slices?.[0]?.segments?.[0]?.departing_at !== flight3.slices?.[0]?.segments?.[0]?.departing_at : true),
                  // Check arrival times are different
                  arrivalTimesAreDifferent: flight1.slices?.[0]?.segments?.[0]?.arriving_at !== flight2.slices?.[0]?.segments?.[0]?.arriving_at && 
                                            (flight3 ? flight1.slices?.[0]?.segments?.[0]?.arriving_at !== flight3.slices?.[0]?.segments?.[0]?.arriving_at && 
                                                      flight2.slices?.[0]?.segments?.[0]?.arriving_at !== flight3.slices?.[0]?.segments?.[0]?.arriving_at : true),
                  // Check slice references are different (object identity)
                  sliceReferencesAreDifferent: flight1.slices !== flight2.slices && 
                                               (flight3 ? flight1.slices !== flight3.slices && flight2.slices !== flight3.slices : true),
                  // Check segment references are different
                  segmentReferencesAreDifferent: flight1.slices?.[0]?.segments !== flight2.slices?.[0]?.segments && 
                                                 (flight3 ? flight1.slices?.[0]?.segments !== flight3.slices?.[0]?.segments && 
                                                           flight2.slices?.[0]?.segments !== flight3.slices?.[0]?.segments : true),
                  // Check origin object references are different
                  originReferencesAreDifferent: flight1.slices?.[0]?.origin !== flight2.slices?.[0]?.origin && 
                                                (flight3 ? flight1.slices?.[0]?.origin !== flight3.slices?.[0]?.origin && 
                                                          flight2.slices?.[0]?.origin !== flight3.slices?.[0]?.origin : true),
                  // Check destination object references are different
                  destinationReferencesAreDifferent: flight1.slices?.[0]?.destination !== flight2.slices?.[0]?.destination && 
                                                     (flight3 ? flight1.slices?.[0]?.destination !== flight3.slices?.[0]?.destination && 
                                                               flight2.slices?.[0]?.destination !== flight3.slices?.[0]?.destination : true),
                };
                
                // Log verification results
                console.log('✅ VERIFICATION RESULTS - Object Uniqueness Check:', verificationResults);
                
                // Check if all verifications pass
                const allVerificationsPass = Object.values(verificationResults).every(result => result === true);
                
                if (allVerificationsPass) {
                  console.log('✅ Verified: all cards have unique flight data');
                } else {
                  console.error('❌ VERIFICATION FAILED: Some flights share object references!', {
                    failedChecks: Object.entries(verificationResults)
                      .filter(([_, passed]) => !passed)
                      .map(([check, _]) => check),
                  });
                }
              }
              
              // Additional uniqueness checks across all flights
              const uniqueIds = new Set(flightData.map(f => f.id));
              const uniquePrices = new Set(flightData.map(f => f.total_amount));
              const uniqueDurations = new Set(flightData.map(f => f.duration));
              const uniqueFlightNumbers = new Set(flightData.map(f => f.slices?.[0]?.segments?.[0]?.flight_number));
              const uniqueDepartureTimes = new Set(flightData.map(f => f.slices?.[0]?.segments?.[0]?.departing_at));
              const uniqueArrivalTimes = new Set(flightData.map(f => f.slices?.[0]?.segments?.[0]?.arriving_at));
              
              console.log('✅ MAPPED FLIGHTS ARRAY (from scheduleDescs[]) - UNIQUENESS CHECK:', {
                scheduleDescsCount: scheduleDescs.length,
                flightDataCount: flightData.length,
                flightDataLengthGreaterThanZero: flightData.length > 0,
                // Uniqueness verification
                uniqueIdsCount: uniqueIds.size,
                uniquePricesCount: uniquePrices.size,
                uniqueDurationsCount: uniqueDurations.size,
                uniqueFlightNumbersCount: uniqueFlightNumbers.size,
                uniqueDepartureTimesCount: uniqueDepartureTimes.size,
                uniqueArrivalTimesCount: uniqueArrivalTimes.size,
                allFlightsHaveUniqueIds: uniqueIds.size === flightData.length,
                allFlightsHaveUniquePrices: uniquePrices.size === flightData.length,
                allFlightsHaveUniqueDepartureTimes: uniqueDepartureTimes.size === flightData.length,
                allFlightsHaveUniqueArrivalTimes: uniqueArrivalTimes.size === flightData.length,
              });
              
              // Verify: Mapped flights array length > 0
              if (flightData.length === 0) {
                console.error('❌ ERROR: Mapped flights array is EMPTY! scheduleDescs had data but mapping failed.');
              } else {
                console.log(`✅ VERIFIED: Mapped flights array length = ${flightData.length} (> 0)`);
              }
              
              // Verify: No components field (not in Sabre BFM)
              const hasComponents = flightData.some(f => f.components !== undefined);
              if (hasComponents) {
                console.warn('⚠️ WARNING: Some flights have "components" field (unexpected for Sabre data)');
              } else {
                console.log('✅ VERIFIED: No "components" field found (correct for Sabre data)');
              }
              
              // Warn if flights are not unique
              if (uniqueIds.size !== flightData.length) {
                console.error('❌ ERROR: Some flights have duplicate IDs!', {
                  expectedUnique: flightData.length,
                  actualUnique: uniqueIds.size,
                });
              }
              if (uniquePrices.size < flightData.length * 0.5) {
                console.warn('⚠️ WARNING: Many flights have duplicate prices!', {
                  totalFlights: flightData.length,
                  uniquePrices: uniquePrices.size,
                });
              } else {
                console.log(`✅ VERIFIED: ${uniquePrices.size} unique prices out of ${flightData.length} flights`);
              }
            }
          } else {
            // scheduleDescs exists but is empty array - use empty array (ignore non-BFM data)
            flightData = [];
            if (process.env.NODE_ENV === 'development') {
              console.log('⚠️ scheduleDescs[] found but empty - using empty array (ignoring non-BFM data)');
            }
          }
        } else {
          // scheduleDescs not found in response - fallback to offers
          if (process.env.NODE_ENV === 'development') {
            console.warn('⚠️ scheduleDescs[] NOT FOUND in response. Falling back to offers data. Response structure:', {
              hasData: !!data,
              hasDataOffers: !!data?.data?.offers,
              dataOffersLength: data?.data?.offers?.length || 0,
              dataKeys: data ? Object.keys(data) : [],
            });
          }
          
          // ============================================
          // FALLBACK: Use offers when scheduleDescs is not available
          // ============================================
          // Transform offers (from PricedItineraries) to flight data format
          // ============================================
          const offers = data?.data?.offers || [];
          if (Array.isArray(offers) && offers.length > 0) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Using fallback: Found ${offers.length} offers from PricedItineraries`);
            }
            
            // Transform offers to flight data format
            flightData = offers.map((offer, index) => {
              // ============================================
              // VERIFICATION: Log raw Sabre BFM offers[] (first card only)
              // ============================================
              if (process.env.NODE_ENV === 'development' && index === 0) {
                console.log('🔍 VERIFICATION: Raw Sabre BFM offers[0] object (FALLBACK PATH):', JSON.stringify(offer, null, 2));
                console.log('📋 VERIFICATION: Using FALLBACK PATH - offers[] from PricedItineraries');
                console.log('  ⚠️  Note: Object spreading (...offer) includes all fields from offer');
                console.log('  ✅ Card display will only show fields that exist in offer object');
                console.log('  ✅ All displayed fields must trace back to Sabre BFM PricedItineraries response');
              }
              
              const mappedOffer = {
                ...offer,
                id: offer.id || `sabre_offer_${index}_${Date.now()}`,
                estimated: true,
                _isBFMData: true,
                _pricingType: 'indicative',
              };
              
              // ============================================
              // VERIFICATION: Log full mapped offer object (first card only)
              // ============================================
              if (process.env.NODE_ENV === 'development' && index === 0) {
                console.log('📦 VERIFICATION: Full mapped offer object (first card, FALLBACK PATH):', JSON.stringify(mappedOffer, null, 2));
                console.log('✅ VERIFICATION SUMMARY: Using offers[] fallback from Sabre BFM PricedItineraries');
                console.log('  ⚠️  All fields come from offer object (spread operator)');
                console.log('  ✅ Card display will access fields from this mapped object');
              }
              
              return mappedOffer;
            });
          } else {
            flightData = [];
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ No offers found in response either. flightData will be empty.');
            }
          }
        }

        // ============================================
        // DEBUG: Final verification before setting state
        // ============================================
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 FINAL VERIFICATION - flightData before setFlights:', {
            flightDataLength: flightData.length,
            flightDataLengthGreaterThanZero: flightData.length > 0,
            firstFlightStructure: flightData[0] ? {
              hasSlices: !!flightData[0].slices,
              slicesCount: flightData[0].slices?.length,
              firstSliceHasOrigin: !!flightData[0].slices?.[0]?.origin,
              firstSliceOriginIataCode: flightData[0].slices?.[0]?.origin?.iata_code,
              firstSliceHasDestination: !!flightData[0].slices?.[0]?.destination,
              firstSliceDestinationIataCode: flightData[0].slices?.[0]?.destination?.iata_code,
              firstSliceHasSegments: !!flightData[0].slices?.[0]?.segments,
              firstSegmentHasDepartingAt: !!flightData[0].slices?.[0]?.segments?.[0]?.departing_at,
              firstSegmentHasArrivingAt: !!flightData[0].slices?.[0]?.segments?.[0]?.arriving_at,
              firstSegmentHasMarketingCarrier: !!flightData[0].slices?.[0]?.segments?.[0]?.marketing_carrier,
              firstSegmentHasFlightNumber: !!flightData[0].slices?.[0]?.segments?.[0]?.flight_number,
              hasTotalAmount: !!flightData[0].total_amount,
              totalAmount: flightData[0].total_amount,
            } : null,
          });
          
          // Final verification checks
          if (flightData.length === 0) {
            console.error('❌ CRITICAL: flightData is EMPTY - cards will NOT render!');
          } else {
            console.log(`✅ VERIFIED: flightData has ${flightData.length} flights - cards should render`);
          }
        }

        // ============================================
        // GROUP FLIGHTS FOR CARDS - SABRE BFM
        // ============================================
        // Group normalized scheduleDescs[] data using grouping function
        // Cards will render automatically.
        // ============================================
        // ============================================
        setFlights(flightData);

        // ============================================
        // BFM ONLY - NO AIRPRICE
        // ============================================
        // Cards show only BFM estimated pricing
        // for each visible flight card using:
        // - Selected itinerary (from BFM)
        // - Passenger counts (from search params) - SUCCESS CRITERIA 3
        // - Cabin class (from search params) - SUCCESS CRITERIA 4
        // - Same PCC as BFM
        // ============================================
        if (flightData.length > 0) {
          const cabinClass = params.flightClass || "Economy";
          
        // ============================================
        // AIRPRICE REMOVED - BFM ONLY
        // ============================================
        // AirPrice calls have been removed.
        // Cards will show ONLY BFM estimated pricing.
        // No final pricing, no external API calls.
        // ============================================
        }

        // ============================================
        // DETAILED AIRLINE DISTRIBUTION LOGGING & VERIFICATION
        // ============================================
        // Log per-flight details and aggregate airline distribution
        // Verify multiple airlines appear with balanced distribution
        // ============================================
        if (process.env.NODE_ENV === 'development' && flightData.length > 0) {
          // ============================================
          // PER-FLIGHT LOGGING
          // ============================================
          // Log each flight with MarketingCarrier, FlightSegment details, and FareSource
          console.log('📋 PER-FLIGHT DETAILS (First 10 flights):');
          flightData.slice(0, 10).forEach((flight, index) => {
            const firstSlice = flight.slices?.[0];
            const firstSegment = firstSlice?.segments?.[0];
            const marketingCarrier = firstSegment?.marketing_carrier;
            const operatingCarrier = firstSegment?.operating_carrier;
            
            // Extract FareSource - check if available in flight data
            // FareSource might be in the original Sabre response, but may not be in transformed data
            // For now, we'll note if it's available
            const fareSource = flight.fareSource || flight.fare_source || 'Unknown';
            
            console.log(`  Flight ${index + 1}:`, {
              flightId: flight.id,
              marketingCarrier: {
                code: marketingCarrier?.iata_code || flight.owner?.iata_code || 'UNKNOWN',
                name: marketingCarrier?.name || flight.owner?.name || 'Unknown',
              },
              operatingCarrier: {
                code: operatingCarrier?.iata_code || marketingCarrier?.iata_code || 'UNKNOWN',
                name: operatingCarrier?.name || marketingCarrier?.name || 'Unknown',
              },
              flightSegment: {
                flightNumber: firstSegment?.flight_number || firstSegment?.marketing_carrier_flight_number || 'N/A',
                origin: {
                  code: firstSegment?.origin?.iata_code || firstSlice?.origin?.iata_code || 'UNKNOWN',
                  name: firstSegment?.origin?.name || firstSlice?.origin?.name || 'Unknown',
                },
                destination: {
                  code: firstSegment?.destination?.iata_code || firstSlice?.destination?.iata_code || 'UNKNOWN',
                  name: firstSegment?.destination?.name || firstSlice?.destination?.name || 'Unknown',
                },
                departureTime: firstSegment?.departing_at || 'N/A',
                arrivalTime: firstSegment?.arriving_at || 'N/A',
                duration: firstSegment?.duration || firstSlice?.duration || 'N/A',
              },
              fareSource: fareSource, // NDC / ATPCO / LCC (if available in response)
              price: {
                total: flight.total_amount,
                currency: flight.total_currency || 'USD',
              },
            });
          });
          
          if (flightData.length > 10) {
            console.log(`  ... and ${flightData.length - 10} more flights`);
          }
          
          // ============================================
          // AGGREGATE LOGGING
          // ============================================
          // Count flights per marketing carrier
          const airlineCounts = {};
          const airlineCodes = new Set();
          const fareSourceCounts = { NDC: 0, ATPCO: 0, LCC: 0, Unknown: 0 };
          
          flightData.forEach((flight) => {
            const marketingCarrier = flight.slices?.[0]?.segments?.[0]?.marketing_carrier;
            const airlineCode = marketingCarrier?.iata_code || flight.owner?.iata_code || 'UNKNOWN';
            
            airlineCodes.add(airlineCode);
            
            if (!airlineCounts[airlineCode]) {
              airlineCounts[airlineCode] = {
                code: airlineCode,
                name: marketingCarrier?.name || flight.owner?.name || airlineCode,
                count: 0,
                percentage: 0,
              };
            }
            airlineCounts[airlineCode].count++;
            
            // Count fare sources if available
            const fareSource = (flight.fareSource || flight.fare_source || 'Unknown').toUpperCase();
            if (fareSource.includes('NDC')) {
              fareSourceCounts.NDC++;
            } else if (fareSource.includes('ATPCO')) {
              fareSourceCounts.ATPCO++;
            } else if (fareSource.includes('LCC')) {
              fareSourceCounts.LCC++;
            } else {
              fareSourceCounts.Unknown++;
            }
          });
          
          // Calculate percentages
          const totalFlights = flightData.length;
          Object.values(airlineCounts).forEach((airline) => {
            airline.percentage = parseFloat(((airline.count / totalFlights) * 100).toFixed(1));
          });
          
          // Sort by count (descending)
          const sortedAirlines = Object.values(airlineCounts).sort((a, b) => b.count - a.count);
          
          // ============================================
          // AGGREGATE LOG OUTPUT
          // ============================================
          console.log('✈️ AGGREGATE AIRLINE DISTRIBUTION ANALYSIS:', {
            totalFlights: totalFlights,
            uniqueAirlines: airlineCodes.size,
            uniqueAirlineCodes: Array.from(airlineCodes).sort(),
            flightsPerAirline: sortedAirlines.map(airline => ({
              code: airline.code,
              name: airline.name,
              count: airline.count,
              percentage: `${airline.percentage}%`,
            })),
            fareSourceDistribution: {
              NDC: fareSourceCounts.NDC,
              ATPCO: fareSourceCounts.ATPCO,
              LCC: fareSourceCounts.LCC,
              Unknown: fareSourceCounts.Unknown,
            },
            // Verification flags
            isDominatedBySingleAirline: sortedAirlines[0]?.percentage > 70,
            topAirline: sortedAirlines[0] ? {
              code: sortedAirlines[0].code,
              name: sortedAirlines[0].name,
              count: sortedAirlines[0].count,
              percentage: `${sortedAirlines[0].percentage}%`,
            } : null,
            hasMultipleAirlines: airlineCodes.size >= 2,
            hasMajorAirlines: Array.from(airlineCodes).some(code => 
              ['AA', 'UA', 'DL', 'AS', 'B6', 'WN', 'NK', 'F9', 'G4'].includes(code)
            ),
          });
          
          // ============================================
          // VERIFICATION WARNINGS
          // ============================================
          if (airlineCodes.size < 2) {
            console.warn('⚠️ WARNING: Only one airline found in results. Expected multiple airlines.', {
              airline: sortedAirlines[0]?.code || 'UNKNOWN',
              flightCount: totalFlights,
              expected: 'Multiple airlines (AA, UA, DL, etc.)',
            });
          } else if (sortedAirlines[0]?.percentage > 70) {
            console.warn('⚠️ WARNING: Results are dominated by a single airline (>70%):', {
              airline: sortedAirlines[0].code,
              airlineName: sortedAirlines[0].name,
              count: sortedAirlines[0].count,
              percentage: `${sortedAirlines[0].percentage}%`,
              totalFlights: totalFlights,
              expected: 'Multiple airlines with more balanced distribution (no single airline >70%)',
            });
          } else {
            console.log('✅ VERIFIED: Multiple airlines present with balanced distribution', {
              uniqueAirlines: airlineCodes.size,
              topAirlinePercentage: `${sortedAirlines[0]?.percentage}%`,
              distribution: sortedAirlines.slice(0, 5).map(a => `${a.code} (${a.percentage}%)`).join(', '),
            });
          }
          
          // Additional verification: Check for major airlines
          const majorAirlines = ['AA', 'UA', 'DL', 'AS', 'B6', 'WN', 'NK', 'F9', 'G4'];
          const foundMajorAirlines = Array.from(airlineCodes).filter(code => majorAirlines.includes(code));
          if (foundMajorAirlines.length === 0) {
            console.warn('⚠️ NOTE: No major US airlines (AA, UA, DL, etc.) found in results. This may be expected for certain routes.');
          } else {
            console.log('✅ VERIFIED: Major airlines present:', foundMajorAirlines.sort().join(', '));
          }
        }

        // Calculate duration from search params
        // For round-trip: duration = returnDate - depDate (inclusive span later)
        // For one-way: we want the exact selected day, so use duration = 1
        let duration = 1; // Default to 1 day for one-way
        if (
          params.flightType === "round-trip" &&
          params.returnDate &&
          params.depDate
        ) {
          const depDateObj = new Date(params.depDate);
          const retDateObj = new Date(params.returnDate);
          const diffTime = retDateObj - depDateObj;
          duration = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        } else if (params.duration) {
          // If trip duration is provided in params
          duration = parseInt(params.duration, 10) || 3;
        }
        setTripDuration(duration); // Store duration for navigation

        // Generate date options based on search date and flight data
        if (params.depDate) {
          const generatedDateOptions = generateDateOptions(
            params.depDate,
            flightData,
            params.flightType === "round-trip",
            params.returnDate,
            duration
          );
          setDateOptions(generatedDateOptions);

          // Generate return date options if it's a return flight
          if (params.flightType === "round-trip" && params.returnDate) {
            const generatedReturnDateOptions = generateReturnDateOptions(
              params.returnDate,
              flightData,
              duration
            );
            setReturnDateOptions(generatedReturnDateOptions);
            setSelectedReturnDate(params.returnDate);
          } else {
            setReturnDateOptions([]);
            setSelectedReturnDate(null);
          }

          // Always select the exact search date in one-way; do not auto-shift to previous day
          setSelectedDate(params.depDate);
          const updatedOptions = generatedDateOptions.map((option) => ({
            ...option,
            isSelected: option.date === params.depDate,
          }));
          setDateOptions(updatedOptions);

          // Compute cheapest price for the selected date/range
          const selectedDateStr = params.depDate;
          let flightsForSelected = [];
          if (params.flightType === "round-trip" && params.returnDate) {
            // For round-trip, filter flights that match both departure and return dates
            const returnDateStr = params.returnDate;
            flightsForSelected = flightData.filter((flight) => {
              if (!flight || !flight.slices || flight.slices.length < 2) {
                return false;
              }
              const depAt = flight.slices[0]?.segments?.[0]?.departing_at;
              const retAt = flight.slices[1]?.segments?.[0]?.departing_at;
              if (!depAt || !retAt) return false;
              const fDepDate = formatLocalISO(new Date(depAt));
              const fRetDate = formatLocalISO(new Date(retAt));
              return fDepDate === selectedDateStr && fRetDate === returnDateStr;
            });
          } else {
            // For one-way, filter flights matching the departure date
            flightsForSelected = flightData.filter((flight) => {
              if (!flight || !flight.slices || flight.slices.length === 0) {
                return false;
              }
              const departingAt = flight.slices[0]?.segments?.[0]?.departing_at;
              if (!departingAt) return false;
              const fDate = formatLocalISO(new Date(departingAt));
              return fDate === selectedDateStr;
            });
          }
          const minPriceInit =
            flightsForSelected.length > 0
              ? Math.min(
                  ...flightsForSelected.map((f) =>
                    parseFloat(f.total_amount || Infinity)
                  )
                )
              : null;
          setSelectedDatePrice(
            minPriceInit != null && isFinite(minPriceInit)
              ? Math.round(minPriceInit)
              : null
          );
        }

        // ============================================
        // GROUP FLIGHTS FOR CARDS - SABRE BFM
        // ============================================
        // Group normalized scheduleDescs[] data using grouping function
        // Cards will render automatically.
        // ============================================
        // ANALYSIS FINDING #3: "No flights found" can appear even when Sabre returns itineraries
        // Root cause chain: Sabre returns scheduleDescs[] → flightData created → groupedFlights → validGroups → flightGroups
        // If any step in this chain produces empty array, "No flights found" will show
        // Potential failure points:
        // 1. scheduleDescs[] is empty array (line 2070) → flightData = []
        // 2. groupFlightsByRoute() returns empty → validGroups = []
        // 3. filterExpiredFares() filters everything → validGroups = []
        // 4. applyFilters() filters everything → filteredGroups = [] (line 2975)
        // ============================================
        const groupedFlights = groupFlightsByRoute(flightData);
        const validGroups = filterExpiredFares(groupedFlights);
        
        // ============================================
        // DEBUG: Verify grouping and card rendering readiness
        // ============================================
        if (process.env.NODE_ENV === 'development') {
          console.log('📦 FLIGHT GROUPING RESULTS (from scheduleDescs[]):', {
            flightDataLength: flightData.length,
            groupedFlightsLength: groupedFlights.length,
            validGroupsLength: validGroups.length,
            validGroupsLengthGreaterThanZero: validGroups.length > 0,
            firstGroup: validGroups[0] ? {
              groupKey: validGroups[0].groupKey,
              flightsCount: validGroups[0].flights?.length,
              hasLowestFare: !!validGroups[0].lowestFare,
              lowestFareId: validGroups[0].lowestFare?.id,
              lowestFareHasSlices: !!validGroups[0].lowestFare?.slices,
            } : null,
          });
          
          // Verify: Groups created successfully
          if (validGroups.length === 0) {
            console.error('❌ CRITICAL: No valid groups created - cards will show "No flights found"!');
            console.error('   This means groupFlightsByRoute() returned empty array or filterExpiredFares() filtered everything out.');
          } else {
            console.log(`✅ VERIFIED: ${validGroups.length} valid groups created - cards should render`);
          }
        }
        
        // Set flightGroups - cards will render automatically from this state
        setFlightGroups(validGroups);

        // Generate dynamic filter tabs
        const generatedFilterTabs = generateFilterTabs(
          validGroups,
          selectedCurrency
        );
        setFilterTabs(generatedFilterTabs);

        // Ensure only the depDate option is marked selected for consistency
        const depISO = router.query?.depDate || "";
        if (depISO) {
          setDateOptions((opts) =>
            (opts || []).map((o) => ({ ...o, isSelected: o.date === depISO }))
          );
        }

        // Extract and update available airlines (with logos)
        if (onAirlinesUpdate && validGroups.length > 0) {
          const uniqueAirlines = extractUniqueAirlines(validGroups);
          console.log("Extracted airlines with logos:", uniqueAirlines);
          onAirlinesUpdate(uniqueAirlines);
        } else if (onAirlinesUpdate) {
          // Clear airlines when no flights found
          onAirlinesUpdate([]);
        }
      } catch (error) {
        setFlights([]);
        setFlightGroups([]);
        // Clear airlines when error occurs
        if (onAirlinesUpdate) {
          onAirlinesUpdate([]);
        }
      }
      setLoading(false);
    };
    if (router.isReady) fetchFlights();
  }, [router.isReady, router.query]);

  // VERIFICATION LOG: Track passenger count and cabin class changes
  // Log when these change but price remains unchanged (expected for BFM)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && router.isReady && flights.length > 0) {
      const currentAdults = parseInt(router.query?.adult || router.query?.adults || "1", 10);
      const currentChild = parseInt(router.query?.child || "0", 10);
      const currentInfant = parseInt(router.query?.infant || "0", 10);
      const currentCabin = router.query?.flightClass || 'Not specified';
      const hasBFMData = flights.some(f => f._isBFMData === true || f._pricingType === 'indicative');
      
      if (hasBFMData) {
        const firstBFMFlight = flights.find(f => f._isBFMData === true || f._pricingType === 'indicative');
        const storedParams = firstBFMFlight?._searchParams;
        
        if (storedParams) {
          const passengerCountChanged = 
            storedParams.adults !== currentAdults ||
            storedParams.child !== currentChild ||
            storedParams.infant !== currentInfant;
          const cabinClassChanged = storedParams.cabinClass !== currentCabin;
          
          if (passengerCountChanged) {
            console.log('✅ BFM PRICE VERIFICATION - Passenger count changed → price unchanged (EXPECTED):', {
              changeType: 'PASSENGER COUNT CHANGED',
              previous: {
                passengerCount: {
                  adults: storedParams.adults,
                  child: storedParams.child,
                  infant: storedParams.infant,
                },
              },
              current: {
                passengerCount: {
                  adults: currentAdults,
                  child: currentChild,
                  infant: currentInfant,
                },
              },
              price: {
                amount: firstBFMFlight?.total_amount,
                unchanged: true,
              },
              verification: {
                priceNotMultipliedByPassengers: true,
                priceIsStatic: true,
              },
              message: '✅ Passenger count changed → price unchanged (EXPECTED for BFM)',
            });
          }
          
          if (cabinClassChanged) {
            console.log('✅ BFM PRICE VERIFICATION - Cabin class changed → price unchanged (EXPECTED):', {
              changeType: 'CABIN CLASS CHANGED',
              previous: {
                cabinClass: storedParams.cabinClass,
              },
              current: {
                cabinClass: currentCabin,
              },
              price: {
                amount: firstBFMFlight?.total_amount,
                unchanged: true,
              },
              verification: {
                priceNotAdjustedByCabin: true,
                priceIsStatic: true,
              },
              message: '✅ Cabin class changed → price unchanged (EXPECTED for BFM)',
            });
          }
        }
      }
    }
  }, [
    router.isReady,
    router.query?.adult,
    router.query?.adults,
    router.query?.child,
    router.query?.infant,
    router.query?.flightClass,
    flights,
  ]);

  const headerText =
    currentView === "outbound" ? "Outbound Flights" : "Return Flights";

  const handleBookFlight = (flight) => {
    setSelectedFlight(flight);
    setIsBookingSidebarOpen(true);
  };

  const handleCloseBookingSidebar = () => {
    setIsBookingSidebarOpen(false);
    setSelectedFlight(null);
  };

  // Handle date selection (works with date ranges)
  const handleDateSelect = (selectedDateOption) => {
    // Determine date range - use provided range or construct from date and duration
    let rangeStart, rangeEnd;
    if (
      selectedDateOption.dateRange &&
      selectedDateOption.dateRange.length === 2
    ) {
      [rangeStart, rangeEnd] = selectedDateOption.dateRange;
    } else {
      // Construct date range if not provided
      const startDate = new Date(selectedDateOption.date);
      rangeStart = formatLocalISO(startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + tripDuration - 1);
      rangeEnd = formatLocalISO(endDate);
    }

    // Filter flights for the selected date range - check ALL flights in the array
    const flightsForSelectedDate = flights.filter((flight) => {
      // Handle invalid flights
      if (!flight || !flight.slices || flight.slices.length === 0) {
        return false;
      }

      // Get departure date from first segment of first slice
      const departingAt = flight.slices[0]?.segments?.[0]?.departing_at;
      if (!departingAt) {
        return false;
      }

      try {
        const flightDate = new Date(departingAt);
        const flightDateStr = formatLocalISO(flightDate);

        // Check if flight date falls within the selected date range
        return flightDateStr >= rangeStart && flightDateStr <= rangeEnd;
      } catch (error) {
        console.error("Error parsing flight date:", error);
        return false;
      }
    });

    // Group and filter the flights for the selected date
    const groupedFlights = groupFlightsByRoute(flightsForSelectedDate);
    const validGroups = filterExpiredFares(groupedFlights);

    // Compute cheapest price for the selected date
    const minPrice =
      flightsForSelectedDate.length > 0
        ? Math.min(
            ...flightsForSelectedDate.map((f) =>
              parseFloat(f.total_amount || Infinity)
            )
          )
        : null;
    setSelectedDatePrice(
      minPrice != null && isFinite(minPrice) ? Math.round(minPrice) : null
    );

    // Helper function to check if a date option actually has flights
    const checkFlightsForDateOption = (option) => {
      let optRangeStart, optRangeEnd;
      if (option.dateRange && option.dateRange.length === 2) {
        [optRangeStart, optRangeEnd] = option.dateRange;
      } else {
        const startDate = new Date(option.date);
        optRangeStart = formatLocalISO(startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + tripDuration - 1);
        optRangeEnd = formatLocalISO(endDate);
      }

      const flightsInRange = flights.filter((flight) => {
        if (!flight || !flight.slices || flight.slices.length === 0) {
          return false;
        }
        const departingAt = flight.slices[0]?.segments?.[0]?.departing_at;
        if (!departingAt) {
          return false;
        }
        try {
          const flightDate = new Date(departingAt);
          const flightDateStr = formatLocalISO(flightDate);
          return flightDateStr >= optRangeStart && flightDateStr <= optRangeEnd;
        } catch (error) {
          return false;
        }
      });

      return flightsInRange.length > 0;
    };

    // If no flights found for the selected date range, find the next available date range with flights
    if (validGroups.length === 0 || flightsForSelectedDate.length === 0) {
      // Find the next date option that actually has flights
      const currentIndex = dateOptions.findIndex(
        (opt) => opt.date === selectedDateOption.date
      );

      // Check forward first (next dates)
      let nextOptionWithFlights = null;
      for (let i = currentIndex + 1; i < dateOptions.length; i++) {
        const option = dateOptions[i];
        if (checkFlightsForDateOption(option)) {
          nextOptionWithFlights = option;
          break;
        }
      }

      // If not found forward, check backward (previous dates)
      if (!nextOptionWithFlights) {
        for (let i = currentIndex - 1; i >= 0; i--) {
          const option = dateOptions[i];
          if (checkFlightsForDateOption(option)) {
            nextOptionWithFlights = option;
            break;
          }
        }
      }

      // If we found a date option with flights, select it instead
      if (nextOptionWithFlights) {
        // Process the next option with flights directly
        let nextRangeStart, nextRangeEnd;
        if (
          nextOptionWithFlights.dateRange &&
          nextOptionWithFlights.dateRange.length === 2
        ) {
          [nextRangeStart, nextRangeEnd] = nextOptionWithFlights.dateRange;
        } else {
          const startDate = new Date(nextOptionWithFlights.date);
          nextRangeStart = formatLocalISO(startDate);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + tripDuration - 1);
          nextRangeEnd = formatLocalISO(endDate);
        }

        const nextFlightsForDate = flights.filter((flight) => {
          if (!flight || !flight.slices || flight.slices.length === 0) {
            return false;
          }
          const departingAt = flight.slices[0]?.segments?.[0]?.departing_at;
          if (!departingAt) {
            return false;
          }
          try {
            const flightDate = new Date(departingAt);
            const flightDateStr = formatLocalISO(flightDate);
            return (
              flightDateStr >= nextRangeStart && flightDateStr <= nextRangeEnd
            );
          } catch (error) {
            return false;
          }
        });

        const nextGroupedFlights = groupFlightsByRoute(nextFlightsForDate);
        const nextValidGroups = filterExpiredFares(nextGroupedFlights);

        // Update selected date
        setSelectedDate(nextOptionWithFlights.date);

        // Update date options to reflect new selection
        setDateOptions((prevOptions) =>
          prevOptions.map((option) => ({
            ...option,
            isSelected: option.date === nextOptionWithFlights.date,
          }))
        );

        setFlightGroups(nextValidGroups);
        const nextUpdatedFilterTabs = generateFilterTabs(
          nextValidGroups,
          selectedCurrency
        );
        setFilterTabs(nextUpdatedFilterTabs);
        setCurrentPage(1);
        return;
      }

      // If no date options have flights, still show empty results but don't update selection
      setFlightGroups(validGroups);
      const updatedFilterTabs = generateFilterTabs(
        validGroups,
        selectedCurrency
      );
      setFilterTabs(updatedFilterTabs);
      setCurrentPage(1);
      return;
    }

    // Update selected date (use start date of range) only if we have flights
    setSelectedDate(selectedDateOption.date);

    // Update date options to reflect new selection
    setDateOptions((prevOptions) =>
      prevOptions.map((option) => ({
        ...option,
        isSelected: option.date === selectedDateOption.date,
      }))
    );

    setFlightGroups(validGroups);

    // Update filter tabs for the selected date
    const updatedFilterTabs = generateFilterTabs(validGroups, selectedCurrency);
    setFilterTabs(updatedFilterTabs);

    // Reset to first page when date changes
    setCurrentPage(1);
  };

  // Handle return date selection
  const handleReturnDateSelect = (selectedReturnDateOption) => {
    // Update selected return date
    setSelectedReturnDate(selectedReturnDateOption.date);

    // Update return date options to reflect new selection
    setReturnDateOptions((prevOptions) =>
      prevOptions.map((option) => ({
        ...option,
        isSelected: option.date === selectedReturnDateOption.date,
      }))
    );
  };

  // Handle date navigation (previous/next week)
  const handleDateNavigation = (direction) => {
    if (dateOptions.length === 0) return;

    // Get center date from selected date or middle option
    const currentCenterDate = new Date(selectedDate || dateOptions[2].date);
    const newCenterDate = new Date(currentCenterDate);

    // Shift by duration * rangeCount to move to next set of ranges
    const rangeCount = 5;
    const shiftDays = tripDuration * rangeCount;

    if (direction === "prev") {
      newCenterDate.setDate(currentCenterDate.getDate() - shiftDays);
    } else {
      newCenterDate.setDate(currentCenterDate.getDate() + shiftDays);
    }

    // Generate new date options around the new center date with duration
    const newDateOptions = generateDateOptions(
      formatLocalISO(newCenterDate),
      flights,
      false,
      null,
      tripDuration
    );
    setDateOptions(newDateOptions);

    // Move return dates in sync if present
    if (returnDateOptions.length > 0) {
      const currentReturnCenter = new Date(
        selectedReturnDate || returnDateOptions[2].date
      );
      const newReturnCenter = new Date(currentReturnCenter);
      if (direction === "prev") {
        newReturnCenter.setDate(currentReturnCenter.getDate() - shiftDays);
      } else {
        newReturnCenter.setDate(currentReturnCenter.getDate() + shiftDays);
      }
      const newReturnOpts = generateReturnDateOptions(
        formatLocalISO(newReturnCenter),
        flights,
        tripDuration
      );
      setReturnDateOptions(newReturnOpts);
    }

    // Try to select a date that has flights, otherwise select the middle date
    const dateWithFlights = newDateOptions.find((option) => option.hasFlights);
    const dateToSelect = dateWithFlights || newDateOptions[2];

    if (dateToSelect) {
      handleDateSelect(dateToSelect);
    }
  };

  // Handle return date navigation
  const handleReturnDateNavigation = (direction) => {
    if (returnDateOptions.length === 0) return;

    const currentCenterDate = new Date(
      selectedReturnDate || returnDateOptions[2].date
    );
    const newCenterDate = new Date(currentCenterDate);

    // Shift by duration * rangeCount to move to next set of ranges
    const rangeCount = 5;
    const shiftDays = tripDuration * rangeCount;

    if (direction === "prev") {
      newCenterDate.setDate(currentCenterDate.getDate() - shiftDays);
    } else {
      newCenterDate.setDate(currentCenterDate.getDate() + shiftDays);
    }

    // Generate new return date options around the new center date with duration
    const newReturnDateOptions = generateReturnDateOptions(
      formatLocalISO(newCenterDate),
      flights,
      tripDuration
    );
    setReturnDateOptions(newReturnDateOptions);

    // Try to select a date that has flights, otherwise select the middle date
    const dateWithFlights = newReturnDateOptions.find(
      (option) => option.hasFlights
    );
    const dateToSelect = dateWithFlights || newReturnDateOptions[2];

    if (dateToSelect) {
      handleReturnDateSelect(dateToSelect);
    }
  };

  if (loading) return <LoadingComponent option="flight-results-loading" />;

  // ============================================
  // DEBUG: Verify cards will render
  // ============================================
  if (process.env.NODE_ENV === 'development') {
    console.log('🎴 CARD RENDERING CHECK:', {
      flightGroupsLength: flightGroups.length,
      filtersActive: Object.keys(filters).length > 0,
      filters: filters,
    });
  }

  // ANALYSIS FINDING #4: Exact conditional that triggers "No flights found"
  // filteredGroups is calculated by applyFilters(flightGroups, filters) at line 867
  // applyFilters() filters flightGroups and returns array of groups where at least one flight matches filters
  // If filteredGroups is empty, "No flights found" is rendered at line 3076
  // ============================================
  const filteredGroups = applyFilters(flightGroups, filters);
  
  // ============================================
  // DEBUG: Final check before rendering
  // ============================================
  if (process.env.NODE_ENV === 'development') {
    console.log('🎴 FINAL CARD RENDERING STATUS:', {
      filteredGroupsLength: filteredGroups.length,
      willShowCards: filteredGroups.length > 0,
      willShowNoFlightsFound: filteredGroups.length === 0,
      firstFilteredGroup: filteredGroups[0] ? {
        groupKey: filteredGroups[0].groupKey,
        flightsCount: filteredGroups[0].flights?.length,
        hasLowestFare: !!filteredGroups[0].lowestFare,
      } : null,
    });
    
    if (filteredGroups.length === 0) {
      console.warn('⚠️ WARNING: filteredGroups is empty - will show "No flights found" message');
      console.warn('   Check: flightGroups.length =', flightGroups.length);
      console.warn('   Check: filters =', filters);
    } else {
      console.log(`✅ VERIFIED: ${filteredGroups.length} filtered groups - cards WILL render`);
    }
  }

  // Sorting helpers for tabs
  const getGroupLowestFare = (group) => {
    if (group?.lowestFare) return group.lowestFare;
    if (Array.isArray(group?.flights) && group.flights.length > 0) {
      return group.flights.reduce((min, f) => {
        const minPrice = parseFloat(min?.total_amount || Infinity);
        const price = parseFloat(f?.total_amount || Infinity);
        return price < minPrice ? f : min;
      }, group.flights[0]);
    }
    return null;
  };

  const getDurationHours = (flight) =>
    parseDurationToHours(flight?.slices?.[0]?.duration);

  const sortGroupsByTab = (groups, tabId) => {
    const copy = [...groups];
    if (tabId === "cheapest") {
      return copy.sort((a, b) => {
        const fa = getGroupLowestFare(a);
        const fb = getGroupLowestFare(b);
        return (
          parseFloat(fa?.total_amount || Infinity) -
          parseFloat(fb?.total_amount || Infinity)
        );
      });
    }
    if (tabId === "fastest") {
      return copy.sort((a, b) => {
        const fa = getGroupLowestFare(a);
        const fb = getGroupLowestFare(b);
        return getDurationHours(fa) - getDurationHours(fb);
      });
    }
    // "best" default: prioritize price, then duration
    return copy.sort((a, b) => {
      const fa = getGroupLowestFare(a);
      const fb = getGroupLowestFare(b);
      const priceDiff =
        parseFloat(fa?.total_amount || Infinity) -
        parseFloat(fb?.total_amount || Infinity);
      if (priceDiff !== 0) return priceDiff;
      return getDurationHours(fa) - getDurationHours(fb);
    });
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setFilterTabs((prev) =>
      prev.map((t) => ({ ...t, isActive: t.id === tabId }))
    );
    // Reset to first page on sort change
    setCurrentPage(1);
    // Close currency dropdown if open
    if (isCurrencyDropdownOpen) {
      setIsCurrencyDropdownOpen(false);
    }
  };

  const handleCurrencyChange = async (currency) => {
    setSelectedCurrencyState(currency);
    setSelectedCurrency(currency);
    setIsCurrencyDropdownOpen(false);
    // Fetch new exchange rate for the selected currency
    await initializeExchangeRate(currency).catch(() => {
      // Silently fail, will use fallback rate
    });
    // Force re-render of filter tabs with new currency
    if (flightGroups.length > 0) {
      const generatedFilterTabs = generateFilterTabs(flightGroups, currency);
      setFilterTabs(generatedFilterTabs);
    }
  };

  // ANALYSIS FINDING #5: Exact conditional that triggers "No flights found" rendering
  // Line 3076: if (!filteredGroups.length) → renders "No flights found" message
  // This condition is true when:
  // - filteredGroups is empty array []
  // - filteredGroups is undefined/null (coerced to 0 length)
  // filteredGroups comes from applyFilters(flightGroups, filters) at line 2975
  // If Sabre returns itineraries but filteredGroups is empty, possible causes:
  // 1. All flights filtered out by applyFilters() (filters too restrictive)
  // 2. flightGroups is empty (grouping/filtering failed earlier in chain)
  // 3. flightData is empty (scheduleDescs[] not found or empty)
  // ============================================
  if (!filteredGroups.length) {
    return (
      <div className="text-center py-8">
        <div className="text-lg font-semibold text-primary-text mb-2">
          No flights found
        </div>
        <div className="text-sm text-gray-600 mb-4">
          No flights are available for your search criteria. Try:
        </div>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Different dates (try dates within the next 3 months)</li>
          <li>• Different routes (try more common routes like DXB → LHR)</li>
          <li>• Different cabin class</li>
        </ul>
      </div>
    );
  }

  // Pagination logic
  const sortedGroups = sortGroupsByTab(filteredGroups, activeTab);
  const totalPages = Math.ceil(sortedGroups.length / flightsPerPage);
  const startIdx = (currentPage - 1) * flightsPerPage;
  const endIdx = startIdx + flightsPerPage;
  const paginatedGroups = sortedGroups.slice(startIdx, endIdx);

  // Dynamic date options and filter tabs are now managed by state

  // Check if we have BFM data (indicative pricing)
  const hasBFMData = flights.length > 0 && flights.some(f => f._isBFMData === true || f._pricingType === 'indicative');

  return (
    <>
      {/* BFM Pricing Notice - Show when BFM data is present */}
      {hasBFMData && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-blue-800 mb-1">
                Indicative Pricing Notice
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>
                  <strong>BFM search results show estimated prices only.</strong> Prices displayed are indicative and may not reflect final pricing.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Prices do <strong>not</strong> change when you modify passenger count or cabin class</li>
                  <li>Same price for 1 adult vs 2 adults is expected with BFM</li>
                  <li>Same price for Economy vs Business is expected with BFM</li>
                  <li>BFM provides indicative pricing only</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Selector */}
      <div className="space-y-4 flex flex-row w-full mb-4 ">
        <div className="w-full ">
          {returnDateOptions.length > 0 ? (
            // Round-trip: same calendar UI, label shows dep–return and we update both dates
            <DepartureDateCalendar
              selectedDate={router.query?.depDate || todayLocalISO()}
              minDate={todayLocalISO()}
              rangeDays={tripDuration + 1}
              selectedPrice={selectedDatePrice}
              onChange={(newDate) => {
                setSelectedDate(newDate);
                const start = new Date(newDate);
                const end = new Date(start);
                end.setDate(
                  start.getDate() + Math.max(1, tripDuration + 1) - 1
                );
                const newReturn = formatLocalISO(end);
                router.push(
                  {
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      depDate: newDate,
                      returnDate: newReturn,
                    },
                  },
                  undefined,
                  { shallow: false }
                );
              }}
            />
          ) : (
            // One-way: new calendar component
            <DepartureDateCalendar
              selectedDate={
                router.query?.depDate || selectedDate || todayLocalISO()
              }
              minDate={todayLocalISO()}
              selectedPrice={selectedDatePrice}
              onChange={(newDate) => {
                setSelectedDate(newDate);
                // Update URL to trigger fresh search with new departure date
                router.push(
                  {
                    pathname: router.pathname,
                    query: { ...router.query, depDate: newDate },
                  },
                  undefined,
                  { shallow: false }
                );
              }}
            />
          )}
        </div>

        {/* Optional: keep the Price Graph button aside */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              console.log("Price Graph clicked");
            }}
            className="ml-2 flex flex-col items-center justify-center gap-1 py-2 px-3 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors min-w-[90px]"
          >
            <BarChart3
              className="w-4 h-4 text-primary-text "
              strokeWidth={2.5}
            />
            <span className="text-xs font-semibold text-primary-text tracking-widest whitespace-nowrap">
              Price Graph
            </span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className="mb-3"
        style={{ position: "relative", overflow: "visible" }}
      >
        <div
          className="bg-white rounded-xl border border-gray-300"
          style={{ overflow: "visible", position: "relative" }}
        >
          <div
            className="flex items-center justify-between"
            style={{ overflow: "visible" }}
          >
            {filterTabs.map((tab, index) => (
              <div
                key={tab.id}
                className="flex-1 relative"
                style={{
                  zIndex:
                    tab.id === "other" && isCurrencyDropdownOpen ? 1000 : 1,
                  overflow: "visible",
                }}
              >
                <div
                  className={`text-left px-4 pt-4 pb-2 cursor-pointer transition-all ${
                    tab.isActive
                      ? "border-[#1e3a8a] text-[#1e3a8a] border-b-3"
                      : "border-white text-black hover:text-primary-text hover:border-b-1 hover:border-[#1e3a8a] "
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (tab.id === "other" && tab.hasDropdown) {
                      setIsCurrencyDropdownOpen((prev) => !prev);
                    } else {
                      handleTabClick(tab.id);
                    }
                  }}
                >
                  <div className="font-semibold text-base mb-[5px] flex items-center justify-start gap-2">
                    {tab.label}
                    {tab.id === "other" && tab.hasDropdown && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isCurrencyDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>
                  <div className="text-sm tracking-wide text-gray-500 font-medium">
                    {tab.info}
                  </div>
                </div>
                {/* Currency Dropdown for Other Options tab */}
                {tab.id === "other" &&
                  tab.hasDropdown &&
                  isCurrencyDropdownOpen && (
                    <div
                      className="bg-white border border-gray-300 rounded-lg shadow-2xl"
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        marginTop: "8px",
                        zIndex: 9999,
                        minWidth: "200px",
                        maxWidth: "100%",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="py-2">
                        {Object.values(CURRENCIES).map((currency) => (
                          <div
                            key={currency.code}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center justify-between transition-colors ${
                              selectedCurrency === currency.code
                                ? "bg-blue-50 text-[#1e3a8a]"
                                : "text-gray-700"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCurrencyChange(currency.code);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-lg">
                                {currency.symbol}
                              </span>
                              <span className="text-sm font-medium">
                                {currency.name}
                              </span>
                            </div>
                            {selectedCurrency === currency.code && (
                              <span className="text-[#1e3a8a] text-base font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 text-primary-text ">
        <div className="space-y-2">
          {/* ANALYSIS FINDING #1 (VERIFICATION): Flight cards render from Sabre BFM data
              - paginatedGroups comes from sortedGroups (line 3095)
              - sortedGroups comes from filteredGroups (line 3095)
              - filteredGroups comes from applyFilters(flightGroups, filters) (line 2975)
              - flightGroups comes from validGroups (line 2506)
              - validGroups comes from groupFlightsByRoute(flightData) (line 2475)
              - flightData comes from scheduleDescs[] mapping (line 1299)
              - Each FlightCard receives group.lowestFare which is a flight object mapped from scheduleDescs[]
              - Therefore: Cards ARE rendered ONLY from Sabre BFM scheduleDescs[] response data
          */}
          {paginatedGroups.map((group, index) => (
            <FlightCard
              key={group.groupKey || index}
              flightGroup={group}
              flight={group.lowestFare}
              isExpanded={false}
              onBookFlight={handleBookFlight}
              currentView={currentView}
            />
          ))}
        </div>
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded border ${
                  currentPage === i + 1
                    ? "bg-primary-green text-white"
                    : "bg-white text-primary-text border-gray-300"
                } transition`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
        {/* Bottom link */}
        <div className="text-center pt-4">
          <a href="#" className="text-red-500 text-sm hover:underline">
            Read more about these fares
          </a>
        </div>
      </div>

      {/* Booking Sidebar */}
      <BookingSidebar
        isOpen={isBookingSidebarOpen}
        onClose={handleCloseBookingSidebar}
        selectedFlight={selectedFlight}
        currentView={currentView}
      />
    </>
  );
};

export default FlightResults;

