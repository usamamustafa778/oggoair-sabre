"use client";
import { useState, useRef, useEffect } from "react";
import {
  CornerDownRight,
  Plane,
  PlaneTakeoff,
  ChevronDown,
  ArrowUpDown,
  Building2,
  Loader2,
  Users,
  Plus,
  Bus,
  Car,
  Train,
  X,
  ArrowRight,
} from "lucide-react";

import axios from "axios";
import toast from "react-hot-toast";
import FullContainer from "./FullContainer";
import Container from "./Container";
import { useRouter } from "next/router";
import { searchDateFormateMaker } from "@/utils/dateFormate";
import { mapboxAccessToken, APILINK } from "../../config/api";
import EnhancedDatePicker from "./EnhancedDatePicker";

// Passenger limits for flight search
const FLIGHT_PASSENGER_LIMITS = {
  MAX_ADULTS: 3,
  MAX_CHILDREN: 2,
  MAX_INFANTS: 1,
  MAX_TOTAL: 5,
};

export default function SearchSection({
  bg,
  dropdown,
  setMapFrom,
  setMapTo,
  type: propType,
  mainHeader,
  isEditMode,
  showServiceTabs,
}) {
  const router = useRouter();
  const { type: queryType } = router.query; // Get travel type from URL query
  const type = propType || queryType; // Use prop type if provided, otherwise use query type

  const formatLocalISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [searchData, setSearchData] = useState({
    from: "",
    fromIata: "",
    fromLat: null,
    fromLng: null,
    to: "",
    toIata: "",
    toLat: null,
    toLng: null,
    departureDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return formatLocalISO(tomorrow);
    })(),
    returnDate: "",
    showReturn: false,
    adults: 1,
    students: 0,
    children: 0,
    babies: 0,
    seniors: 0,
    classType: "Economy",
    tripType: "return", // Add trip type state
  });

  // Hotel-specific state
  const [hotelSearchData, setHotelSearchData] = useState({
    destination: "",
    checkIn: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return formatLocalISO(tomorrow);
    })(),
    checkOut: (() => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 8);
      return formatLocalISO(nextWeek);
    })(),
    rooms: 1,
  });

  // EuroBus-specific state
  const [busSearchData, setBusSearchData] = useState({
    from: "",
    to: "",
    departureDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return formatLocalISO(tomorrow);
    })(),
    departureTime: "",
    showReturn: false,
    passengers: 1,
  });

  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [flightFromSearchData, setFlightFromSearchData] = useState([]);
  const [flightToSearchData, setFlightToSearchData] = useState([]);
  const [hotelDestinationData, setHotelDestinationData] = useState([]);
  const [busFromSearchData, setBusFromSearchData] = useState([]);
  const [busToSearchData, setBusToSearchData] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showBusFromDropdown, setShowBusFromDropdown] = useState(false);
  const [showBusToDropdown, setShowBusToDropdown] = useState(false);
  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [destinationSearchQuery, setDestinationSearchQuery] = useState("");
  const [busFromSearchQuery, setBusFromSearchQuery] = useState("");
  const [busToSearchQuery, setBusToSearchQuery] = useState("");
  const [isSearchingFrom, setIsSearchingFrom] = useState(false);
  const [focusedFromIndex, setFocusedFromIndex] = useState(0);
  const [focusedToIndex, setFocusedToIndex] = useState(0);

  // Multi-city dropdown states
  const [multiCityFromDropdowns, setMultiCityFromDropdowns] = useState({});
  const [multiCityToDropdowns, setMultiCityToDropdowns] = useState({});
  const [multiCityPassengerDropdowns, setMultiCityPassengerDropdowns] =
    useState({});

  // Multi-city search data states
  const [multiCityFromSearchData, setMultiCityFromSearchData] = useState({});
  const [multiCityToSearchData, setMultiCityToSearchData] = useState({});
  const [multiCityFromSearching, setMultiCityFromSearching] = useState({});
  const [multiCityToSearching, setMultiCityToSearching] = useState({});

  // Multi-city flight segments state
  const [multiCitySegments, setMultiCitySegments] = useState([
    {
      id: 1,
      from: "",
      fromIata: "",
      fromLat: null,
      fromLng: null,
      to: "",
      toIata: "",
      toLat: null,
      toLng: null,
      departureDate: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
      })(),
      adults: 1,
      students: 0,
      children: 0,
      babies: 0,
      seniors: 0,
      classType: "Economy",
    },
  ]);

  // Validation functions for flight passenger limits
  const validatePassengerLimits = (newData) => {
    // Only apply limits for flight search
    if (type !== "flight") {
      return true;
    }

    const totalPassengers =
      newData.adults +
      newData.students +
      newData.children +
      newData.babies +
      newData.seniors;

    // Check individual limits first with specific messages
    if (newData.adults > FLIGHT_PASSENGER_LIMITS.MAX_ADULTS) {
      try {
        toast.error(
          `Maximum ${FLIGHT_PASSENGER_LIMITS.MAX_ADULTS} adults allowed for flight search`
        );
      } catch (error) {
        console.error("Toast error:", error);
        alert(
          `Maximum ${FLIGHT_PASSENGER_LIMITS.MAX_ADULTS} adults allowed for flight search`
        );
      }
      return false;
    }

    if (newData.children > FLIGHT_PASSENGER_LIMITS.MAX_CHILDREN) {
      try {
        toast.error(
          `Maximum ${FLIGHT_PASSENGER_LIMITS.MAX_CHILDREN} children allowed for flight search`
        );
      } catch (error) {
        console.error("Toast error:", error);
        alert(
          `Maximum ${FLIGHT_PASSENGER_LIMITS.MAX_CHILDREN} children allowed for flight search`
        );
      }
      return false;
    }

    if (newData.babies > FLIGHT_PASSENGER_LIMITS.MAX_INFANTS) {
      try {
        toast.error(
          `Maximum ${FLIGHT_PASSENGER_LIMITS.MAX_INFANTS} infant allowed for flight search`
        );
      } catch (error) {
        console.error("Toast error:", error);
        alert(
          `Maximum ${FLIGHT_PASSENGER_LIMITS.MAX_INFANTS} infant allowed for flight search`
        );
      }
      return false;
    }

    // Check for students and seniors (not typically allowed in flight search)
    if (newData.students > 0) {
      try {
        toast.error(`Students are not allowed for flight search`);
      } catch (error) {
        console.error("Toast error:", error);
        alert(`Students are not allowed for flight search`);
      }
      return false;
    }

    if (newData.seniors > 0) {
      try {
        toast.error(`Seniors are not allowed for flight search`);
      } catch (error) {
        console.error("Toast error:", error);
        alert(`Seniors are not allowed for flight search`);
      }
      return false;
    }

    // Check total passengers limit
    if (totalPassengers > FLIGHT_PASSENGER_LIMITS.MAX_TOTAL) {
      try {
        toast.error(
          `Maximum ${FLIGHT_PASSENGER_LIMITS.MAX_TOTAL} total passengers allowed for flight search`
        );
      } catch (error) {
        console.error("Toast error:", error);
        alert(
          `Maximum ${FLIGHT_PASSENGER_LIMITS.MAX_TOTAL} total passengers allowed for flight search`
        );
      }
      return false;
    }

    return true;
  };

  const updatePassengerCount = (passengerType, increment) => {
    const newData = { ...searchData };

    if (increment) {
      newData[passengerType] += 1;
    } else {
      newData[passengerType] = Math.max(
        passengerType === "adults" ? 1 : 0,
        newData[passengerType] - 1
      );
    }

    const isValid = validatePassengerLimits(newData);

    if (isValid) {
      setSearchData(newData);
      // Show success message for increment
      if (increment && type === "flight") {
        const passengerLabels = {
          adults: "Adult",
          children: "Child",
          babies: "Infant",
          students: "Student",
          seniors: "Senior",
        };
        toast.success(`${passengerLabels[passengerType]} added successfully`);
      }
    }
  };

  // Function to update passenger count for multi-city segments
  const updateMultiCityPassengerCount = (
    segmentId,
    passengerType,
    increment
  ) => {
    setMultiCitySegments((prev) =>
      prev.map((segment) => {
        if (segment.id === segmentId) {
          const newValue = increment
            ? segment[passengerType] + 1
            : Math.max(
                passengerType === "adults" ? 1 : 0,
                segment[passengerType] - 1
              );
          return { ...segment, [passengerType]: newValue };
        }
        return segment;
      })
    );
  };

  // Initialize passenger data for existing segments that might not have it
  useEffect(() => {
    setMultiCitySegments((prev) =>
      prev.map((segment) => ({
        ...segment,
        adults: segment.adults ?? 1,
        students: segment.students ?? 0,
        children: segment.children ?? 0,
        babies: segment.babies ?? 0,
        seniors: segment.seniors ?? 0,
        classType: segment.classType ?? "Economy",
      }))
    );
  }, []);

  const [isSearchingTo, setIsSearchingTo] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [isSearchingBusFrom, setIsSearchingBusFrom] = useState(false);
  const [isSearchingBusTo, setIsSearchingBusTo] = useState(false);
  const [fromAirportSelected, setFromAirportSelected] = useState(false);
  const [toAirportSelected, setToAirportSelected] = useState(false);
  const [busFromSelected, setBusFromSelected] = useState(false);
  const [busToSelected, setBusToSelected] = useState(false);

  const popularDestinations = [
    {
      place_name: "Dubai, United Arab Emirates",
      coordinates: [55.2708, 25.2048],
    },
    { place_name: "Dubai Downtown, UAE", coordinates: [55.2744, 25.1972] },
    { place_name: "Dubai Marina, UAE", coordinates: [55.1395, 25.0922] },
    {
      place_name: "New York, NY, United States",
      coordinates: [-74.006, 40.7128],
    },
    { place_name: "London, UK", coordinates: [-0.1276, 51.5074] },
    { place_name: "Paris, France", coordinates: [2.3522, 48.8566] },
    { place_name: "Tokyo, Japan", coordinates: [139.6917, 35.6895] },
    { place_name: "Singapore", coordinates: [103.8198, 1.3521] },
  ];

  // EuroBus popular destinations
  // Initialize search data from URL parameters
  useEffect(() => {
    if (router.isReady && type === "flight") {
      const {
        from,
        to,
        fromIata,
        toIata,
        depAirport, // Also check for depAirport parameter
        arrAirport, // Also check for arrAirport parameter
        depDate, // Also check for depDate parameter
        departureDate,
        returnDate,
        adult,
        child,
        infant,
        adults, // Backward compatibility
        children, // Backward compatibility
        babies, // Backward compatibility
        classType,
        flightType,
        flightClass, // Also check for flightClass parameter
        fromLat,
        fromLng,
        toLat,
        toLng,
      } = router.query;

      if (
        from ||
        to ||
        fromIata ||
        toIata ||
        depAirport ||
        arrAirport ||
        departureDate ||
        depDate ||
        returnDate
      ) {
        setSearchData((prev) => {
          const newSearchData = {
            ...prev,
            from: from || prev.from,
            to: to || prev.to,
            fromIata: fromIata || depAirport || prev.fromIata, // Use depAirport as fallback
            toIata: toIata || arrAirport || prev.toIata, // Use arrAirport as fallback
            fromLat: fromLat ? parseFloat(fromLat) : prev.fromLat,
            fromLng: fromLng ? parseFloat(fromLng) : prev.fromLng,
            toLat: toLat ? parseFloat(toLat) : prev.toLat,
            toLng: toLng ? parseFloat(toLng) : prev.toLng,
            departureDate: departureDate || depDate || prev.departureDate, // Use depDate as fallback
            returnDate: returnDate || prev.returnDate,
            adults: adult
              ? parseInt(adult)
              : adults
              ? parseInt(adults)
              : prev.adults, // Support new 'adult' param with backward compatibility
            children: child
              ? parseInt(child)
              : children
              ? parseInt(children)
              : prev.children, // Support new 'child' param with backward compatibility
            babies: infant
              ? parseInt(infant)
              : babies
              ? parseInt(babies)
              : prev.babies, // Support new 'infant' param with backward compatibility
            classType: classType || flightClass || prev.classType, // Use flightClass as fallback
            showReturn: flightType === "round-trip",
            tripType:
              flightType === "round-trip" ? "return" : flightType || "one-way",
          };

          return newSearchData;
        });

        // Also update the search queries to match the selected airports
        if (from) {
          setFromSearchQuery(from);
          setFromAirportSelected(true);
        }
        if (to) {
          setToSearchQuery(to);
          setToAirportSelected(true);
        }

        // Update map coordinates if available
        if (setMapFrom && fromLat && fromLng) {
          setMapFrom([parseFloat(fromLat), parseFloat(fromLng)]);
        }
        if (setMapTo && toLat && toLng) {
          setMapTo([parseFloat(toLat), parseFloat(toLng)]);
        }
      }
    }
  }, [router.isReady, router.query, type, setMapFrom, setMapTo]);

  const dropdownRef = useRef(null);
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);
  const destinationDropdownRef = useRef(null);
  const busFromDropdownRef = useRef(null);
  const busToDropdownRef = useRef(null);
  const fromAbortControllerRef = useRef(null);
  const toAbortControllerRef = useRef(null);
  const destinationAbortControllerRef = useRef(null);
  const busFromAbortControllerRef = useRef(null);
  const busToAbortControllerRef = useRef(null);
  const fromInputRef = useRef(null);
  const [fromDropdownPos, setFromDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const toInputRef = useRef(null);
  const [toDropdownPos, setToDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Update From dropdown position when shown
  useEffect(() => {
    if (showFromDropdown && fromInputRef.current) {
      const rect = fromInputRef.current.getBoundingClientRect();
      setFromDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showFromDropdown]);

  // Update To dropdown position when shown
  useEffect(() => {
    if (showToDropdown && toInputRef.current) {
      const rect = toInputRef.current.getBoundingClientRect();
      setToDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showToDropdown]);

  // Process and sort API results for better relevance
  const processSearchResults = (data, query) => {
    if (!data || !Array.isArray(data)) return [];

    // Filter and deduplicate results
    const processedResults = data
      .filter((item) => {
        // Handle the new API response structure
        const cityName = item.city_name?.toLowerCase() || "";
        const itemName = item.name?.toLowerCase() || "";
        const iataCode = (item.iata_code || "").toLowerCase();
        const iataCityCode = (item.iata_city_code || "").toLowerCase();
        const idCode = (item.id?.toString() || "").toLowerCase();
        const countryCode = (item.iata_country_code || "").toLowerCase();
        const queryLower = query.toLowerCase();

        return (
          cityName.includes(queryLower) ||
          itemName.includes(queryLower) ||
          iataCode.includes(queryLower) ||
          iataCityCode.includes(queryLower) ||
          idCode.includes(queryLower) ||
          countryCode.includes(queryLower)
        );
      })
      .sort((a, b) => {
        // Sort by relevance: exact matches, then alphabetical
        // Prioritize exact code matches
        const queryUpper = query.toUpperCase();
        const iataCodeA = (a.iata_code || "").toUpperCase();
        const iataCodeB = (b.iata_code || "").toUpperCase();
        const iataCityCodeA = (a.iata_city_code || "").toUpperCase();
        const iataCityCodeB = (b.iata_city_code || "").toUpperCase();
        const idCodeA = (a.id?.toString() || "").toUpperCase();
        const idCodeB = (b.id?.toString() || "").toUpperCase();
        const exactMatchA =
          iataCodeA === queryUpper ||
          iataCityCodeA === queryUpper ||
          idCodeA === queryUpper
            ? 1000
            : 0;
        const exactMatchB =
          iataCodeB === queryUpper ||
          iataCityCodeB === queryUpper ||
          idCodeB === queryUpper
            ? 1000
            : 0;

        // Prioritize city name starts with query
        const cityStartsA = a.city_name
          ?.toLowerCase()
          .startsWith(query.toLowerCase())
          ? 100
          : 0;
        const cityStartsB = b.city_name
          ?.toLowerCase()
          .startsWith(query.toLowerCase())
          ? 100
          : 0;

        // Prioritize name starts with query
        const nameStartsA = a.name
          ?.toLowerCase()
          .startsWith(query.toLowerCase())
          ? 150
          : 0;
        const nameStartsB = b.name
          ?.toLowerCase()
          .startsWith(query.toLowerCase())
          ? 150
          : 0;

        // Prioritize cities over individual airports - highest priority
        const typeScoreA = a.type === "city" ? 2000 : 0;
        const typeScoreB = b.type === "city" ? 2000 : 0;

        const totalScoreA =
          exactMatchA + cityStartsA + nameStartsA + typeScoreA;
        const totalScoreB =
          exactMatchB + cityStartsB + nameStartsB + typeScoreB;

        return totalScoreB - totalScoreA;
      })
      .slice(0, 8); // Limit to top 8 results for performance

    return processedResults;
  };

  // Airport search API call with cancellation support
  const apiCall = async (value, option) => {
    if (!value || value === "undefined" || value.includes("(undefined)")) {
      return;
    }

    // Cancel previous request for this option
    const abortControllerRef =
      option === "from" ? fromAbortControllerRef : toAbortControllerRef;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Try cities endpoint first, then airports if no results
      let res;
      try {
        res = await axios.post(
          "/api/cors-proxy",
          {
            url: `${APILINK}/places/suggestions?query=${value}&limit=20`,
            method: "GET",
          },
          {
            signal: abortController.signal,
            timeout: 10000, // 10 second timeout
          }
        );

        // If cities endpoint returns no results, try airports endpoint
        if (!res.data?.data || res.data.data.length === 0) {
          res = await axios.post(
            "/api/cors-proxy",
            {
              url: `${APILINK}/places/suggestions?query=${value}&limit=20`,
              method: "GET",
            },
            {
              signal: abortController.signal,
              timeout: 10000, // 10 second timeout
            }
          );
        }
      } catch (error) {
        // If cities endpoint fails, try airports endpoint
        res = await axios.post(
          "/api/cors-proxy",
          {
            url: `${APILINK}/places/suggestions?query=${value}&limit=20`,
            method: "GET",
          },
          {
            signal: abortController.signal,
            timeout: 10000, // 10 second timeout
          }
        );
      }

      // Only process if this request wasn't cancelled
      if (!abortController.signal.aborted && res.data?.data) {
        const processedResults = processSearchResults(res.data.data, value);

        if (option === "from") {
          setFlightFromSearchData(processedResults);
        } else {
          setFlightToSearchData(processedResults);
        }
      }
    } catch (error) {
      if (error.name !== "CanceledError" && !abortController.signal.aborted) {
        // Clear results on error
        if (option === "from") {
          setFlightFromSearchData([]);
        } else {
          setFlightToSearchData([]);
        }
      }
    }
  };

  // Instant search for From input
  useEffect(() => {
    const performSearch = async () => {
      if (fromSearchQuery.length < 1) {
        setFlightFromSearchData([]);
        setShowFromDropdown(false);
        setIsSearchingFrom(false);
        return;
      }

      setIsSearchingFrom(true);
      try {
        await apiCall(fromSearchQuery, "from");
        // Ensure loading shows for at least 300ms for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));
      } finally {
        setIsSearchingFrom(false);
      }
    };

    performSearch();
  }, [fromSearchQuery]);

  // Instant search for To input
  useEffect(() => {
    const performSearch = async () => {
      if (toSearchQuery.length < 1) {
        setFlightToSearchData([]);
        setShowToDropdown(false);
        setIsSearchingTo(false);
        return;
      }

      setIsSearchingTo(true);
      try {
        await apiCall(toSearchQuery, "to");
        // Ensure loading shows for at least 300ms for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));
      } finally {
        setIsSearchingTo(false);
      }
    };

    performSearch();
  }, [toSearchQuery]);

  // Show/hide dropdowns based on search data
  useEffect(() => {
    if (fromSearchQuery.length >= 1 && !fromAirportSelected) {
      setShowFromDropdown(true);
    } else {
      setShowFromDropdown(false);
    }
  }, [
    flightFromSearchData,
    fromSearchQuery,
    isSearchingFrom,
    fromAirportSelected,
  ]);

  useEffect(() => {
    if (toSearchQuery.length >= 1 && !toAirportSelected) {
      setShowToDropdown(true);
    } else {
      setShowToDropdown(false);
    }
  }, [flightToSearchData, toSearchQuery, isSearchingTo, toAirportSelected]);

  // Auto-focus first item when From dropdown data changes
  useEffect(() => {
    if (flightFromSearchData.length > 0 && showFromDropdown) {
      setFocusedFromIndex(0);
    }
  }, [flightFromSearchData, showFromDropdown]);

  // Auto-focus first item when To dropdown data changes
  useEffect(() => {
    if (flightToSearchData.length > 0 && showToDropdown) {
      setFocusedToIndex(0);
    }
  }, [flightToSearchData, showToDropdown]);

  // Hotel destination search
  useEffect(() => {
    const performSearch = async () => {
      if (destinationSearchQuery.length < 1) {
        setHotelDestinationData([]);
        setShowDestinationDropdown(false);
        setIsSearchingDestination(false);
        return;
      }

      setIsSearchingDestination(true);
      try {
        await apiCallDestination(destinationSearchQuery);
        await new Promise((resolve) => setTimeout(resolve, 300));
      } finally {
        setIsSearchingDestination(false);
      }
    };

    if (type === "hotel") {
      performSearch();
    }
  }, [destinationSearchQuery, type]);

  // Hotel destination API call using Mapbox
  const apiCallDestination = async (value) => {
    if (!value) return;

    if (destinationAbortControllerRef.current) {
      destinationAbortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    destinationAbortControllerRef.current = abortController;

    try {
      // Use Mapbox API directly like in oggoair-new
      const res = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json`,
        {
          params: {
            access_token: mapboxAccessToken,
            autocomplete: true,
            limit: 10,
            types: "place,poi,address",
          },
          signal: abortController.signal,
          timeout: 10000,
        }
      );

      if (!abortController.signal.aborted && res.data?.features) {
        setHotelDestinationData(res.data.features);
      } else {
        setHotelDestinationData([]);
      }
    } catch (error) {
      if (error.name !== "CanceledError" && !abortController.signal.aborted) {
        setHotelDestinationData([]);
      }
    }
  };

  const handleDestinationSelect = (destination) => {
    const displayText = destination.place_name;
    setHotelSearchData((prev) => ({
      ...prev,
      destination: displayText,
    }));
    setDestinationSearchQuery(displayText);
    setShowDestinationDropdown(false);
  };

  const handleDestinationInputChange = (value) => {
    setHotelSearchData((prev) => ({ ...prev, destination: value }));
    setDestinationSearchQuery(value);
    if (value.length >= 1) {
      setShowDestinationDropdown(true);
    } else {
      setShowDestinationDropdown(false);
      setHotelDestinationData([]);
    }
  };

  const handleAirportSelect = (airport, isFrom = true) => {
    // Safely construct display text with null checks
    let displayText;
    let iataCode;

    // Handle the new API response structure
    if (airport.type === "city") {
      // For cities, use city information
      const cityName = airport.name || airport.city_name || "Unknown City";
      const cityCode = airport.iata_code || airport.iata_city_code || "";
      displayText = cityCode ? `${cityName} (${cityCode})` : cityName;
      iataCode = cityCode;
    } else {
      // For airports, use airport information
      const airportName = airport.name || "Unknown Airport";
      // Use the correct IATA code field from the new API structure
      const airportIataCode = airport.iata_code || "";
      displayText = airportIataCode
        ? `${airportName} (${airportIataCode})`
        : airportName;
      iataCode = airportIataCode;
    }

    // Set coordinates for map if available - use the direct latitude/longitude fields
    const lat = airport.latitude;
    const lng = airport.longitude;

    if (isFrom) {
      setSearchData((prev) => ({
        ...prev,
        from: displayText,
        fromIata: iataCode,
        fromLat: lat,
        fromLng: lng,
      }));
      setFromSearchQuery(displayText);
      setFromAirportSelected(true);
      setShowFromDropdown(false);
      if (setMapFrom && lat && lng) {
        setMapFrom([lat, lng]);
      }
    } else {
      setSearchData((prev) => ({
        ...prev,
        to: displayText,
        toIata: iataCode,
        toLat: lat,
        toLng: lng,
      }));
      setToSearchQuery(displayText);
      setToAirportSelected(true);
      setShowToDropdown(false);
      if (setMapTo && lat && lng) {
        setMapTo([lat, lng]);
      }
    }
  };

  const handleFromInputChange = (value) => {
    setSearchData((prev) => ({ ...prev, from: value }));
    setFromSearchQuery(value);
    setFromAirportSelected(false); // Reset selection flag when user starts typing
    if (value.length >= 1) {
      setShowFromDropdown(true);
    }
  };

  const handleToInputChange = (value) => {
    setSearchData((prev) => ({ ...prev, to: value }));
    setToSearchQuery(value);
    setToAirportSelected(false); // Reset selection flag when user starts typing
    if (value.length >= 1) {
      setShowToDropdown(true);
    }
  };

  // Keyboard navigation for From dropdown
  const handleFromKeyDown = (e) => {
    if (!showFromDropdown || flightFromSearchData.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedFromIndex((prev) =>
          prev < flightFromSearchData.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedFromIndex((prev) =>
          prev > 0 ? prev - 1 : flightFromSearchData.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (flightFromSearchData[focusedFromIndex]) {
          handleAirportSelect(flightFromSearchData[focusedFromIndex], true);
        }
        break;
      case "Escape":
        setShowFromDropdown(false);
        break;
    }
  };

  // Keyboard navigation for To dropdown
  const handleToKeyDown = (e) => {
    if (!showToDropdown || flightToSearchData.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedToIndex((prev) =>
          prev < flightToSearchData.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedToIndex((prev) =>
          prev > 0 ? prev - 1 : flightToSearchData.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (flightToSearchData[focusedToIndex]) {
          handleAirportSelect(flightToSearchData[focusedToIndex], false);
        }
        break;
      case "Escape":
        setShowToDropdown(false);
        break;
    }
  };

  const handleSearch = () => {
    if (!searchData.fromIata || !searchData.toIata) {
      alert(
        "Please select both origin and destination airports from the dropdown."
      );
      return;
    }

    // Validate departure date
    if (!searchData.departureDate) {
      alert("Please select a departure date.");
      return;
    }

    // Format dates as YYYY-MM-DD
    let depDate = searchData.departureDate;
    let returnDate = searchData.returnDate;

    // The EnhancedDatePicker already returns dates in YYYY-MM-DD format
    // so we just need to ensure they're properly formatted
    if (depDate instanceof Date) {
      depDate = searchDateFormateMaker(depDate);
    } else if (
      typeof depDate === "string" &&
      !/^\d{4}-\d{2}-\d{2}$/.test(depDate)
    ) {
      // If it's not in YYYY-MM-DD format, try to parse it
      const parsed = new Date(depDate);
      if (!isNaN(parsed)) {
        depDate = searchDateFormateMaker(parsed);
      } else {
        alert("Invalid departure date format.");
        return;
      }
    }

    if (returnDate) {
      if (returnDate instanceof Date) {
        returnDate = searchDateFormateMaker(returnDate);
      } else if (
        typeof returnDate === "string" &&
        !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)
      ) {
        const parsed = new Date(returnDate);
        if (!isNaN(parsed)) {
          returnDate = searchDateFormateMaker(parsed);
        } else {
          alert("Invalid return date format.");
          return;
        }
      }
    }
    const params = new URLSearchParams({
      depAirport: searchData.fromIata,
      arrAirport: searchData.toIata,
      from: searchData.from,
      to: searchData.to,
      depDate,
      returnDate,
      flightClass: searchData.classType,
      adult: searchData.adults.toString(),
      child: searchData.children.toString(),
      infant: searchData.babies.toString(),
      flightType:
        searchData.tripType === "return" ? "round-trip" : searchData.tripType,
    });

    // Add coordinates if available
    if (searchData.fromLat && searchData.fromLng) {
      params.append("fromLat", searchData.fromLat.toString());
      params.append("fromLng", searchData.fromLng.toString());
    }
    if (searchData.toLat && searchData.toLng) {
      params.append("toLat", searchData.toLat.toString());
      params.append("toLng", searchData.toLng.toString());
    }

    router.push(`/flight/flightSearch?${params.toString()}`);
  };

  const handleHotelSearch = () => {
    if (!hotelSearchData.destination) {
      alert("Please enter a destination.");
      return;
    }

    // Validate dates
    const checkInDate = new Date(hotelSearchData.checkIn);
    const checkOutDate = new Date(hotelSearchData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      alert("Check-in date must be today or in the future.");
      return;
    }

    if (checkOutDate <= checkInDate) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    // Extract coordinates from the selected destination
    const selectedDestination = hotelDestinationData.find(
      (dest) => dest.place_name === hotelSearchData.destination
    );

    const params = new URLSearchParams({
      destination: hotelSearchData.destination,
      place_name: hotelSearchData.destination, // Add place_name parameter
      checkin: hotelSearchData.checkIn,
      checkout: hotelSearchData.checkOut,
      adults: searchData.adults.toString(),
      child: searchData.children.toString(),
      infant: searchData.babies.toString(),
      rooms: hotelSearchData.rooms.toString(),
    });

    // Add coordinates if available (Mapbox format: [longitude, latitude])
    if (selectedDestination?.geometry?.coordinates) {
      const [longitude, latitude] = selectedDestination.geometry.coordinates;
      params.append("latitude", latitude.toString());
      params.append("longitude", longitude.toString());
    } else {
      // If no coordinates from dropdown, use default coordinates or try to get from popular destinations
      const popularDestination = popularDestinations.find(
        (dest) => dest.place_name === hotelSearchData.destination
      );

      if (popularDestination) {
        const [longitude, latitude] = popularDestination.coordinates;
        params.append("latitude", latitude.toString());
        params.append("longitude", longitude.toString());
      } else {
        // Try to match partial destination names for better coordinate selection
        const partialMatch = popularDestinations.find((dest) =>
          hotelSearchData.destination
            .toLowerCase()
            .includes(dest.place_name.toLowerCase().split(",")[0])
        );

        if (partialMatch) {
          const [longitude, latitude] = partialMatch.coordinates;
          params.append("latitude", latitude.toString());
          params.append("longitude", longitude.toString());
        } else {
          // Default coordinates (Dubai Downtown)
          params.append("latitude", "25.1972"); // Dubai Downtown latitude
          params.append("longitude", "55.2744"); // Dubai Downtown longitude
        }
      }
    }

    // Add optional parameters
    params.append("freeCancellation", "false");
    params.append("bestRating", "false");

    // Navigate to hotel search results page
    router.push(`/hotelSearch?${params.toString()}`);
  };

  // EuroBus search API call
  const apiCallBus = async (value, option) => {
    if (!value) {
      return;
    }

    // Cancel previous request for this option
    const abortControllerRef =
      option === "from" ? busFromAbortControllerRef : busToAbortControllerRef;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // TODO: Replace with actual EuroBus API call when backend is available
      // For now, return empty results since no backend API is available
      if (!abortController.signal.aborted) {
        if (option === "from") {
          setBusFromSearchData([]);
        } else {
          setBusToSearchData([]);
        }
      }
    } catch (error) {
      if (error.name !== "CanceledError" && !abortController.signal.aborted) {
        // Clear results on error
        if (option === "from") {
          setBusFromSearchData([]);
        } else {
          setBusToSearchData([]);
        }
      }
    }
  };

  // EuroBus search handlers
  const handleBusFromInputChange = (value) => {
    setBusSearchData((prev) => ({ ...prev, from: value }));
    setBusFromSearchQuery(value);
    setBusFromSelected(false);
    if (value.length >= 1) {
      setShowBusFromDropdown(true);
    }
  };

  const handleBusToInputChange = (value) => {
    setBusSearchData((prev) => ({ ...prev, to: value }));
    setBusToSearchQuery(value);
    setBusToSelected(false);
    if (value.length >= 1) {
      setShowBusToDropdown(true);
    }
  };

  const handleBusDestinationSelect = (destination, isFrom = true) => {
    const displayText = `${destination.cityName}, ${destination.countryName}`;
    const [lng, lat] = destination.coordinates;

    if (isFrom) {
      setBusSearchData((prev) => ({
        ...prev,
        from: displayText,
      }));
      setBusFromSearchQuery(displayText);
      setBusFromSelected(true);
      setShowBusFromDropdown(false);
      if (setMapFrom && lat && lng) {
        setMapFrom([lat, lng]);
      }
    } else {
      setBusSearchData((prev) => ({
        ...prev,
        to: displayText,
      }));
      setBusToSearchQuery(displayText);
      setBusToSelected(true);
      setShowBusToDropdown(false);
      if (setMapTo && lat && lng) {
        setMapTo([lat, lng]);
      }
    }
  };

  const handleBusSearch = () => {
    if (!busSearchData.from || !busSearchData.to) {
      alert("Please select both origin and destination.");
      return;
    }

    const params = new URLSearchParams({
      from: busSearchData.from,
      to: busSearchData.to,
      date: busSearchData.departureDate,
      time: busSearchData.departureTime,
      passengers: busSearchData.passengers.toString(),
      tripType: busSearchData.showReturn ? "round-trip" : "one-way",
    });

    router.push(`/bus/busSearch?${params.toString()}`);
  };

  const handleBusSwap = () => {
    setBusSearchData((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));

    const tempQuery = busFromSearchQuery;
    setBusFromSearchQuery(busToSearchQuery);
    setBusToSearchQuery(tempQuery);

    const tempSelected = busFromSelected;
    setBusFromSelected(busToSelected);
    setBusToSelected(tempSelected);
  };

  // EuroBus search effects
  useEffect(() => {
    const performSearch = async () => {
      if (busFromSearchQuery.length < 1) {
        setBusFromSearchData([]);
        setShowBusFromDropdown(false);
        setIsSearchingBusFrom(false);
        return;
      }

      setIsSearchingBusFrom(true);
      try {
        await apiCallBus(busFromSearchQuery, "from");
        await new Promise((resolve) => setTimeout(resolve, 300));
      } finally {
        setIsSearchingBusFrom(false);
      }
    };

    performSearch();
  }, [busFromSearchQuery]);

  useEffect(() => {
    const performSearch = async () => {
      if (busToSearchQuery.length < 1) {
        setBusToSearchData([]);
        setShowBusToDropdown(false);
        setIsSearchingBusTo(false);
        return;
      }

      setIsSearchingBusTo(true);
      try {
        await apiCallBus(busToSearchQuery, "to");
        await new Promise((resolve) => setTimeout(resolve, 300));
      } finally {
        setIsSearchingBusTo(false);
      }
    };

    performSearch();
  }, [busToSearchQuery]);

  // Show/hide bus dropdowns based on search data
  useEffect(() => {
    if (busFromSearchQuery.length >= 1 && !busFromSelected) {
      setShowBusFromDropdown(true);
    } else {
      setShowBusFromDropdown(false);
    }
  }, [
    busFromSearchData,
    busFromSearchQuery,
    isSearchingBusFrom,
    busFromSelected,
  ]);

  useEffect(() => {
    if (busToSearchQuery.length >= 1 && !busToSelected) {
      setShowBusToDropdown(true);
    } else {
      setShowBusToDropdown(false);
    }
  }, [busToSearchData, busToSearchQuery, isSearchingBusTo, busToSelected]);

  // Render hotel search interface
  const renderHotelSearch = () => (
    <FullContainer className="bg-[#E4ECEF] min-h-[470px] h-[80vh] lg:h-[470px] py-10 md:py-20 flex items-center justify-center">
      <Container className="relative">
        <div className="relative lg:absolute w-full lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 mt-10 md:mt-20 lg:px-3 ">
          <div className="bg-gray-100 border-[6px] border-white rounded-2xl p-4 lg:p-5 shadow-lg w-full py-5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              {/* Destination input - takes up more space */}
              <div
                className="relative flex-[2] w-full"
                ref={destinationDropdownRef}
              >
                <div className="relative min-h-[60px] rounded-md pt-6 pb-0 px-4 bg-white">
                  {isSearchingDestination && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                  )}
                  <label className="block absolute top-2 left-4 text-xs font-medium text-gray-400">
                    To where?
                  </label>
                  <input
                    type="text"
                    value={hotelSearchData.destination}
                    onChange={(e) =>
                      handleDestinationInputChange(e.target.value)
                    }
                    onFocus={() => {
                      if (hotelSearchData.destination.length >= 1)
                        setShowDestinationDropdown(true);
                    }}
                    placeholder="City, Destination"
                    className="w-full bg-white text-primary-text mt-1 placeholder:font-medium placeholder:text-primary-text font-[500] text-lg focus:border-transparent outline-none"
                  />

                  {/* Destination dropdown */}
                  {showDestinationDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-[9999] max-h-80 overflow-hidden w-full lg:w-screen max-w-screen-md">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-700">
                          Choose Destination
                        </h3>
                        <button
                          onClick={() => setShowDestinationDropdown(false)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {/* Popular Destinations */}
                        {!destinationSearchQuery && !isSearchingDestination && (
                          <>
                            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                              <p className="text-sm font-medium text-gray-700">
                                Popular Destinations
                              </p>
                            </div>
                            {popularDestinations.map((destination, index) => (
                              <button
                                key={`popular-${index}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDestinationSelect({
                                    place_name: destination.place_name,
                                    geometry: {
                                      coordinates: destination.coordinates,
                                    },
                                  });
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="w-full text-left px-6 py-2 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100 flex items-start gap-4"
                              >
                                <div className="mt-1 flex-shrink-0 ">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-gray-400" />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-black text-sm">
                                    {destination.place_name}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* Search Results */}
                        {destinationSearchQuery.length >= 1 && (
                          <>
                            {isSearchingDestination ? (
                              <div className="px-4 py-8 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <Loader2 className="w-8 h-8 animate-spin text-primary-green mb-3" />
                                  <div className="text-sm font-medium text-gray-600">
                                    Searching destinations...
                                  </div>
                                </div>
                              </div>
                            ) : hotelDestinationData.length > 0 ? (
                              hotelDestinationData.map((destination, index) => (
                                <button
                                  key={`${destination.id || index}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDestinationSelect(destination);
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className="w-full text-left px-6 py-2 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100 flex items-start gap-4"
                                >
                                  <div className="mt-1 flex-shrink-0">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center">
                                      <Building2 className="w-5 h-5 text-gray-400" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-black text-sm">
                                      {destination.place_name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {destination.context
                                        ?.map((c) => c.text)
                                        .join(", ") ||
                                        destination.place_type?.join(", ")}
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-6 text-center text-gray-500">
                                No destinations found for "
                                {destinationSearchQuery}"
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Date inputs and guests - responsive layout */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-0 w-full lg:w-auto">
                {/* Dates container */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-0 w-full lg:w-auto">
                  {/* Check-in date */}
                  <div className="w-full sm:w-auto ">
                    <EnhancedDatePicker
                      value={hotelSearchData.checkIn}
                      onChange={(value) =>
                        setHotelSearchData((prev) => ({
                          ...prev,
                          checkIn: value,
                        }))
                      }
                      label="Check-in"
                      minDate={new Date().toISOString().split("T")[0]}
                      placeholder="Select check-in date"
                      className="sm:rounded-l-md sm:rounded-r-none"
                    />
                  </div>

                  {/* Check-out date */}
                  <div className="w-full sm:w-auto">
                    <EnhancedDatePicker
                      value={hotelSearchData.checkOut}
                      onChange={(value) =>
                        setHotelSearchData((prev) => ({
                          ...prev,
                          checkOut: value,
                        }))
                      }
                      label="Check-out"
                      minDate={
                        hotelSearchData.checkIn ||
                        new Date().toISOString().split("T")[0]
                      }
                      placeholder="Select check-out date"
                      className="sm:rounded-none sm:border-l sm:border-gray-300"
                    />
                  </div>
                </div>

                {/* Guests selector */}
                <div
                  className="relative max-h-[60px] w-full lg:w-auto"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() =>
                      setShowPassengerDropdown(!showPassengerDropdown)
                    }
                    className="w-full flex items-center justify-between px-4 h-[64px] bg-white rounded-md sm:rounded-r-md sm:rounded-l-none sm:border-l sm:border-gray-300 lg:border-l lg:border-gray-300 text-primary-text min-w-[200px] text-lg font-[500]"
                  >
                    <span className="text-left">
                      <Users className="w-5 h-5 inline mr-2" />
                      {searchData.adults +
                        searchData.students +
                        searchData.children +
                        searchData.babies +
                        searchData.seniors}{" "}
                      Guests
                    </span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Passenger dropdown */}
                  {showPassengerDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white shadow-lg border border-gray-200 z-[9999] p-6 rounded-md w-screen max-w-full lg:max-w-[500px]">
                      <div className="space-y-4">
                        {/* Adults */}
                        <div className="flex items-center justify-between">
                          <div className="font-[500] text-primary-text block">
                            Adult
                            <span className="text-sm text-gray-500 ml-2">
                              (18 and over)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updatePassengerCount("adults", false)
                              }
                              className="w-8 h-6 rounded-lg bg-gray-200 text-primary-text hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
                              disabled={searchData.adults <= 1}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-primary-text font-medium">
                              {searchData.adults}
                            </span>
                            <button
                              onClick={() =>
                                updatePassengerCount("adults", true)
                              }
                              className="w-8 h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                              disabled={
                                type === "flight" &&
                                searchData.adults >=
                                  FLIGHT_PASSENGER_LIMITS.MAX_ADULTS
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Students */}
                        <div className="flex items-center justify-between">
                          <div className="font-[500] text-primary-text block">
                            Student
                            <span className="text-sm text-gray-500 ml-2">
                              (12-24)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updatePassengerCount("students", false)
                              }
                              className="w-8 h-6 rounded-lg bg-gray-200 text-primary-text hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              disabled={searchData.students <= 0}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-primary-text font-medium">
                              {searchData.students}
                            </span>
                            <button
                              onClick={() =>
                                updatePassengerCount("students", true)
                              }
                              className="w-8 h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex items-center justify-between">
                          <div className="font-[500] text-primary-text block">
                            Child
                            <span className="text-sm text-gray-500 ml-2">
                              (2-11)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updatePassengerCount("children", false)
                              }
                              className="w-8 h-6 rounded-lg bg-gray-200 text-primary-text hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              disabled={searchData.children <= 0}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-primary-text font-medium">
                              {searchData.children}
                            </span>
                            <button
                              onClick={() =>
                                updatePassengerCount("children", true)
                              }
                              className="w-8 h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                              disabled={
                                type === "flight" &&
                                searchData.children >=
                                  FLIGHT_PASSENGER_LIMITS.MAX_CHILDREN
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Babies */}
                        <div className="flex items-center justify-between">
                          <div className="font-[500] text-primary-text block">
                            Infant
                            <span className="text-sm text-gray-500 ml-2">
                              (Under 2 years old)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updatePassengerCount("babies", false)
                              }
                              className="w-8 h-6 rounded-lg bg-gray-200 text-primary-text hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              disabled={searchData.babies <= 0}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-primary-text font-medium">
                              {searchData.babies}
                            </span>
                            <button
                              onClick={() =>
                                updatePassengerCount("babies", true)
                              }
                              className="w-8 h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                              disabled={
                                type === "flight" &&
                                searchData.babies >=
                                  FLIGHT_PASSENGER_LIMITS.MAX_INFANTS
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Seniors */}
                        <div className="flex items-center justify-between">
                          <div className="font-[500] text-primary-text block">
                            Old
                            <span className="text-sm text-gray-500 ml-2">
                              (65 and over)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updatePassengerCount("seniors", false)
                              }
                              className="w-8 h-6 rounded-lg bg-gray-200 text-primary-text hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              disabled={searchData.seniors <= 0}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-primary-text font-medium">
                              {searchData.seniors}
                            </span>
                            <button
                              onClick={() =>
                                updatePassengerCount("seniors", true)
                              }
                              className="w-8 h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Rooms */}
                        <div className="flex items-center justify-between">
                          <div className="font-[500] text-primary-text block">
                            Rooms
                            <span className="text-sm text-gray-500 ml-2">
                              (Number of rooms)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setHotelSearchData((prev) => ({
                                  ...prev,
                                  rooms: Math.max(1, prev.rooms - 1),
                                }))
                              }
                              className="w-8 h-6 rounded-lg bg-gray-200 text-primary-text hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              disabled={hotelSearchData.rooms <= 1}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-primary-text font-medium">
                              {hotelSearchData.rooms}
                            </span>
                            <button
                              onClick={() =>
                                setHotelSearchData((prev) => ({
                                  ...prev,
                                  rooms: prev.rooms + 1,
                                }))
                              }
                              className="w-8 h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search button */}
              <div className="flex items-end w-full lg:w-auto">
                <button
                  onClick={handleHotelSearch}
                  className="bg-primary-green cursor-pointer text-primary-text font-semibold px-8 h-[60px] rounded-md hover:bg-secondary-green transition-colors whitespace-nowrap flex items-center justify-center gap-2 w-full lg:w-auto"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </FullContainer>
  );

  // Render flight search interface (existing code)
  const renderFlightSearch = () => {
    // Calculate dynamic height for multi-city
    const getMultiCityHeight = () => {
      if (searchData.tripType !== "multi-city") return "lg:h-[350px]";

      const baseHeight = 500;
      const segmentHeight = 80;
      const additionalHeight = (multiCitySegments.length - 1) * segmentHeight;
      const totalHeight = Math.max(baseHeight, baseHeight + additionalHeight);

      // Use Tailwind classes for common heights
      if (totalHeight <= 500) return "lg:h-[500px]";
      if (totalHeight <= 580) return "lg:h-[580px]";
      if (totalHeight <= 660) return "lg:h-[660px]";
      if (totalHeight <= 740) return "lg:h-[740px]";
      if (totalHeight <= 820) return "lg:h-[820px]";
      if (totalHeight <= 900) return "lg:h-[900px]";
      return "lg:h-[980px]";
    };

    const handleTabChange = (tabType) => {
      if (tabType === "hotel") router.push("/hotelSearch");
      else if (tabType === "eurobus") router.push("/bus/busSearch");
      else if (tabType === "flight") router.push("/");
    };

    const serviceTabs = [
      { id: "flight", label: "Flights", icon: Plane },
      { id: "hotel", label: "Hotels", icon: Building2 },
      { id: "car", label: "Cars", icon: Car },
      { id: "eurobus", label: "Buses", icon: Bus },
      { id: "train", label: "Trains", icon: Train },
    ];

    const shouldShowServiceTabs =
      (showServiceTabs ?? true) && !isEditMode;

    return (
      <div className={`min-h-0 bg-white ${getMultiCityHeight()}`}>
        <Container
          className={`relative h-full  ${
            isEditMode ? "pt-4 md:pt-5 lg:pt-5 !max-h-fit border-2 border-gray-200 !max-w-[1240px] mx-auto !px-0 " : "pt-10 md:pt-12 lg:pt-20 pb-4 md:pb-6 lg:pb-6 "
          }  `}
        >
          <div className="w-full  ">
            {/* Service Tabs - centered, spacing above and below */}
            {shouldShowServiceTabs && (
              <div className="flex flex-wrap justify-start gap-4 lg:gap-3 mb-3 mt-6 overflow-visible scroll-mt-28">
                {serviceTabs.map((tab) => {
                  const isActive =
                    (tab.id === "flight" && (!type || type === "flight")) ||
                    type === tab.id;
                  const Icon = tab.icon;
                  const iconColor = isActive ? "#132968" : "#7688BE";
                  const isDisabledTab = tab.id !== "flight";

                  return (
                    <button
                      key={tab.id}
                      onClick={
                        isDisabledTab ? undefined : () => handleTabChange(tab.id)
                      }
                      type="button"
                      className={`flex items-center  justify-start gap-1 px-6 py-1.5 transition-all flex-shrink-0 overflow-visible whitespace-nowrap bg-white ${
                        isActive
                          ? "shadow-md font-semibold text-[#132968]"
                          : "shadow-sm text-[#7688BE] hover:bg-gray-50"
                      } ${isDisabledTab ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="inline-flex flex-shrink-0">
                        <Icon size={22} strokeWidth={2.5} color={iconColor} />
                      </span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Floating search card - centered, max-w-6xl */}
            <div
              className={`p-5 lg:p-6 w-full mx-auto rounded-2xl shadow-lg bg-white border border-gray-100 ${
                dropdown ? "border-none" : ""
              }`}
            >
              {/* Trip Type Radio Buttons */}
              <div className="flex gap-6 mb-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    value="one-way"
                    checked={searchData.tripType === "one-way"}
                    onChange={(e) => handleTripTypeChange(e.target.value)}
                    className="w-4 lg:w-5 h-4 lg:h-5 accent-[#132968]"
                  />
                  <span className="text-sm lg:text-base font-medium" style={{ color: "#132968" }}>
                    One-Way
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    value="return"
                    checked={searchData.tripType === "return"}
                    onChange={(e) => handleTripTypeChange(e.target.value)}
                    className="w-4 lg:w-5 h-4 lg:h-5 text-primary-green accent-primary-text "
                  />
                  <span className="text-sm lg:text-base font-medium" style={{ color: "#132968" }}>
                    Return
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tripType"
                    value="multi-city"
                    checked={searchData.tripType === "multi-city"}
                    onChange={(e) => handleTripTypeChange(e.target.value)}
                    className="w-4 lg:w-5 h-4 lg:h-5 text-primary-green accent-primary-text "
                  />
                  <span className="text-sm lg:text-base font-medium" style={{ color: "#132968" }}>
                    Multi-City
                  </span>
                </label>
              </div>

              {/* Multi-city segments */}
              {searchData.tripType === "multi-city" ? (
                <div className="space-y-6 lg:space-y-2 w-full bg-gray-50/80 rounded-2xl p-3 lg:p-4">
                  {multiCitySegments.map((segment, index) => (
                    <div
                      key={segment.id}
                      className="relative bg-white/50 rounded-lg  border border-white pt-9 lg:pt-0  p-4 lg:p-0 lg:border-none lg:bg-transparent"
                    >
                      {/* Flight number label for mobile */}
                      <div className="absolute -top-2 left-4 bg-white px-2 py-1 text-xs font-medium text-gray-600 rounded lg:hidden border border-gray-200">
                        Flight {index + 1}
                      </div>

                      <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 gap-4 lg:gap-0 items-stretch lg:items-end">
                        <div className="flex flex-col lg:w-[43%] lg:flex-row space-y-2 lg:space-y-0 items-stretch lg:items-end">
                          {/* From input */}
                          <div className="flex-1  relative lg:mr-1.5">
                            <div className="relative min-h-[60px] rounded-lg pt-6 pb-2 px-4 bg-gray-100">
                              {multiCityFromSearching[segment.id] && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                              )}
                              <label className="block absolute top-2 left-4 text-xs font-medium text-gray-400">
                                From
                              </label>
                              <input
                                type="text"
                                value={segment.from}
                                onChange={(e) =>
                                  handleMultiCityFromInputChange(
                                    e.target.value,
                                    segment.id
                                  )
                                }
                                onFocus={() => {
                                  // Show dropdown for this specific segment when focused
                                  setMultiCityFromDropdowns((prev) => ({
                                    ...prev,
                                    [segment.id]: true,
                                  }));
                                }}
                                placeholder="City, Airport"
                                className="w-full bg-transparent text-primary-text placeholder:font-medium placeholder:text-[#132968] font-[500] text-lg focus:border-transparent outline-none"
                              />
                            </div>

                            {/* Multi-city From dropdown */}
                            {multiCityFromDropdowns[segment.id] && (
                              <div
                                data-multi-city-from-dropdown
                                className="bg-white rounded-lg shadow-lg  border z-[9999] border-gray-200 max-h-80 overflow-hidden absolute top-0 left-0 mt-[68px] w-full lg:w-screen max-w-screen-md"
                              >
                                <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100 bg-gray-50">
                                  <h3 className="text-sm font-medium text-gray-600">
                                    Choose Origin
                                  </h3>
                                  <button
                                    onClick={() =>
                                      setMultiCityFromDropdowns((prev) => ({
                                        ...prev,
                                        [segment.id]: false,
                                      }))
                                    }
                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                  >
                                    <X className="w-4 h-4 text-gray-500" />
                                  </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                  {multiCityFromSearching[segment.id] ? (
                                    <div className="px-4 py-8 text-center">
                                      <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary-green mb-3" />
                                        <div className="text-sm font-medium text-gray-600">
                                          Searching airports...
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                          Finding the best matches for "
                                          {segment.from}"
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                      multiCityFromSearchData[segment.id] || []
                                    ).length > 0 ? (
                                    (
                                      multiCityFromSearchData[segment.id] || []
                                    ).map((airport) => (
                                      <button
                                        key={`${
                                          airport.iataCode || airport.id
                                        }-${airport.subType}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleMultiCityAirportSelect(
                                            airport,
                                            segment.id,
                                            true
                                          );
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100 flex items-start gap-3"
                                      >
                                        <div className="mt-1 flex-shrink-0">
                                          {airport.type === "city" ? (
                                            <PlaneTakeoff className="w-5 h-5 text-gray-400 mx-2" />
                                          ) : (
                                            <CornerDownRight className="w-5 h-5 text-gray-400 ml-12" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium">
                                            {airport.type === "city" ? (
                                              <span>
                                                {airport.iata_code} -{" "}
                                                {airport.name} All Airports
                                              </span>
                                            ) : (
                                              <span>
                                                {airport.iata_code} -{" "}
                                                {airport.name}
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-gray-500 text-xs mt-0.5">
                                            {airport.city_name || airport.name},{" "}
                                            {airport.iata_country_code}
                                          </div>
                                        </div>
                                      </button>
                                    ))
                                  ) : segment.from.length > 0 ? (
                                    <div className="px-4 py-6 text-center text-gray-500">
                                      No airports found for "{segment.from}"
                                    </div>
                                  ) : (
                                    <div className="px-4 py-6 text-center text-gray-500">
                                      Start typing to search for airports and
                                      cities
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* To input */}
                          <div className="flex-1 relative  w-full lg:mr-1.5">
                            <div className="relative min-h-[60px] rounded-lg pt-6 pb-2 px-4 bg-gray-100">
                              {multiCityToSearching[segment.id] && (
                                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                              )}
                              <label className="block absolute top-2 left-4 text-xs font-medium text-gray-500">
                                To
                              </label>
                              <input
                                type="text"
                                value={segment.to}
                                onChange={(e) =>
                                  handleMultiCityToInputChange(
                                    e.target.value,
                                    segment.id
                                  )
                                }
                                onFocus={() => {
                                  // Show dropdown for this specific segment when focused
                                  setMultiCityToDropdowns((prev) => ({
                                    ...prev,
                                    [segment.id]: true,
                                  }));
                                }}
                                placeholder="City, Airport"
                                className="w-full bg-transparent text-primary-text placeholder:font-medium placeholder:text-[#132968] font-[500] text-lg focus:border-transparent outline-none"
                              />
                            </div>

                            {/* Multi-city To dropdown */}
                            {multiCityToDropdowns[segment.id] && (
                              <div
                                data-multi-city-to-dropdown
                                className="bg-white rounded-lg shadow-lg border z-[9999] border-gray-200 max-h-80 overflow-hidden absolute top-0 left-0 mt-[68px] w-full lg:w-screen max-w-screen-md"
                              >
                                <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100 bg-gray-50">
                                  <h3 className="text-sm font-medium text-gray-600">
                                    Choose Destination
                                  </h3>
                                  <button
                                    onClick={() =>
                                      setMultiCityToDropdowns((prev) => ({
                                        ...prev,
                                        [segment.id]: false,
                                      }))
                                    }
                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                  >
                                    <X className="w-4 h-4 text-gray-500" />
                                  </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                  {multiCityToSearching[segment.id] ? (
                                    <div className="px-4 py-8 text-center">
                                      <div className="flex flex-col items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary-green mb-3" />
                                        <div className="text-sm font-medium text-gray-600">
                                          Searching airports...
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                          Finding the best matches for "
                                          {segment.to}"
                                        </div>
                                      </div>
                                    </div>
                                  ) : (multiCityToSearchData[segment.id] || [])
                                      .length > 0 ? (
                                    (
                                      multiCityToSearchData[segment.id] || []
                                    ).map((airport) => (
                                      <button
                                        key={`${
                                          airport.iataCode || airport.id
                                        }-${airport.subType}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleMultiCityAirportSelect(
                                            airport,
                                            segment.id,
                                            false
                                          );
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100 flex items-start gap-3"
                                      >
                                        <div className="mt-1 flex-shrink-0">
                                          {airport.type === "city" ? (
                                            <PlaneTakeoff className="w-5 h-5 text-gray-400 mx-1" />
                                          ) : (
                                            <CornerDownRight className="w-5 h-5 text-gray-400 ml-10" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium">
                                            {airport.type === "city" ? (
                                              <span>
                                                {airport.iata_code} -{" "}
                                                {airport.name} All Airports
                                              </span>
                                            ) : (
                                              <span>
                                                {airport.iata_code} -{" "}
                                                {airport.name}
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-gray-500 text-xs mt-0.5">
                                            {airport.city_name || airport.name},{" "}
                                            {airport.iata_country_code}
                                          </div>
                                        </div>
                                      </button>
                                    ))
                                  ) : segment.to.length > 0 ? (
                                    <div className="px-4 py-6 text-center text-gray-500">
                                      No airports found for "{segment.to}"
                                    </div>
                                  ) : (
                                    <div className="px-4 py-6 text-center text-gray-500">
                                      Start typing to search for airports and
                                      cities
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex  flex-col lg:w-[57%] lg:flex-row space-y-2 lg:space-y-0  items-stretch lg:items-end">
                          {/* Departure date */}
                          <div className="flex-1 w-[100%] rounded-md  lg:rounded-tr-none lg:rounded-br-none overflow-hidden lg:ml-1.5">
                            <EnhancedDatePicker
                              value={segment.departureDate}
                              onChange={(value) =>
                                updateMultiCitySegment(
                                  segment.id,
                                  "departureDate",
                                  value
                                )
                              }
                              label="Departure"
                              minDate={new Date().toISOString().split("T")[0]}
                              placeholder="Select departure date"
                              className="lg:rounded-l-xl lg:rounded-r-none lg:border-r lg:border-gray-300 w-full bg-gray-100"
                            />
                          </div>

                          {/* Passenger and class selector - show for all segments */}
                          <div
                            className="relative lg:mr-1.5  lg:w-[48%] "
                            ref={index === 0 ? dropdownRef : null}
                          >
                            <button
                              onClick={() =>
                                setMultiCityPassengerDropdowns((prev) => ({
                                  ...prev,
                                  [segment.id]: !prev[segment.id],
                                }))
                              }
                              className="w-full flex items-center justify-between px-4 h-[60px] bg-gray-100 rounded-xl lg:rounded-l-none text-primary-text text-lg font-[500]"
                            >
                              <span className="text-left">
                                {(segment.adults || 1) +
                                  (segment.students || 0) +
                                  (segment.children || 0) +
                                  (segment.babies || 0) +
                                  (segment.seniors || 0)}
                                . {segment.classType || "Economy"}
                              </span>
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            </button>

                            {multiCityPassengerDropdowns[segment.id] && (
                              <div
                                data-multi-city-passenger-dropdown
                                className="absolute top-full right-0 mt-2 bg-white shadow-lg border border-gray-200 z-[9999] p-6 rounded-md w-screen max-w-full lg:max-w-[500px]"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-medium text-gray-600">
                                    Passengers & Class
                                  </h3>
                                  <button
                                    onClick={() =>
                                      setMultiCityPassengerDropdowns(
                                        (prev) => ({
                                          ...prev,
                                          [segment.id]: false,
                                        })
                                      )
                                    }
                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                  >
                                    <X className="w-4 h-4 text-gray-500" />
                                  </button>
                                </div>
                                <div className="border-b border-gray-200 mb-5 pb-4 grid grid-cols-2 gap-4">
                                  <button
                                    onClick={() =>
                                      updateMultiCitySegment(
                                        segment.id,
                                        "classType",
                                        "Economy"
                                      )
                                    }
                                    className={`py-2 px-5 rounded-lg border-2 font-medium transition-all ${
                                      (segment.classType || "Economy") ===
                                      "Economy"
                                        ? "bg-primary-green text-primary-text border-primary-green"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                    }`}
                                  >
                                    Economy
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateMultiCitySegment(
                                        segment.id,
                                        "classType",
                                        "Business"
                                      )
                                    }
                                    className={`py-2 px-5 rounded-lg border-2 font-medium transition-all ${
                                      (segment.classType || "Economy") ===
                                      "Business"
                                        ? "bg-primary-green text-primary-text border-primary-green"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                                    }`}
                                  >
                                    Business
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex text-sm lg:text-base   items-center gap-2">
                                      <span className="font-[500] text-primary-text">
                                        Adult
                                      </span>
                                      <span className="text-[10px] lg:text-sm text-gray-500">
                                        (18 and over)
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          updateMultiCityPassengerCount(
                                            segment.id,
                                            "adults",
                                            false
                                          )
                                        }
                                        className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        disabled={(segment.adults || 1) <= 1}
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center text-sm lg:text-base text-primary-text font-medium">
                                        {segment.adults || 1}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateMultiCityPassengerCount(
                                            segment.id,
                                            "adults",
                                            true
                                          )
                                        }
                                        className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                                        disabled={
                                          type === "flight" &&
                                          (segment.adults || 1) >=
                                            FLIGHT_PASSENGER_LIMITS.MAX_ADULTS
                                        }
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex text-sm lg:text-base items-center gap-2 text-primary-text">
                                      Child
                                      <span className="text-[10px] lg:text-sm text-gray-500">
                                        (2-11)
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          updateMultiCityPassengerCount(
                                            segment.id,
                                            "children",
                                            false
                                          )
                                        }
                                        className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        disabled={(segment.children || 0) <= 0}
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center text-sm lg:text-base text-primary-text font-medium">
                                        {segment.children || 0}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateMultiCityPassengerCount(
                                            segment.id,
                                            "children",
                                            true
                                          )
                                        }
                                        className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                                        disabled={
                                          type === "flight" &&
                                          (segment.children || 0) >=
                                            FLIGHT_PASSENGER_LIMITS.MAX_CHILDREN
                                        }
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex text-sm lg:text-base items-center gap-2 text-primary-text">
                                      Infant
                                      <span className="text-[10px] lg:text-sm text-gray-500">
                                        (Under 2 years old)
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          updateMultiCityPassengerCount(
                                            segment.id,
                                            "babies",
                                            false
                                          )
                                        }
                                        className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                        disabled={(segment.babies || 0) <= 0}
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center text-sm lg:text-base text-primary-text font-medium">
                                        {segment.babies || 0}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateMultiCityPassengerCount(
                                            segment.id,
                                            "babies",
                                            true
                                          )
                                        }
                                        className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                                        disabled={
                                          type === "flight" &&
                                          (segment.babies || 0) >=
                                            FLIGHT_PASSENGER_LIMITS.MAX_INFANTS
                                        }
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {multiCitySegments.length > 1 && (
                            <button
                              onClick={() => removeMultiCitySegment(segment.id)}
                              className="lg:aspect-square lg:h-full lg:min-h-[62px] flex items-center justify-center rounded-xl cursor-pointer bg-white hover:bg-red-50 transition-colors hover:border hover:border-red-400 p-2 lg:p-0 self-start lg:self-auto"
                            >
                              <X className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Another Flight button */}

                  <div className="flex flex-col lg:flex-row justify-between gap-4 lg:gap-0 py-4">
                    {multiCitySegments.length < 8 ? (
                      <button
                        onClick={addMultiCitySegment}
                        className="flex items-center justify-center gap-2 px-6 py-2 cursor-pointer text-white bg-primary-text rounded-xl hover:bg-primary-green hover:text-primary-text transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                      >
                        <Plus className="w-5 h-5" />
                        Add destinations
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 px-6 py-2 text-gray-400 border-2 border-gray-300 bg-gray-100 rounded-lg transition-all duration-200 font-medium shadow-sm cursor-not-allowed"
                      >
                        Maximum 8 destinations allowed
                      </button>
                    )}

                    {/* Search button */}
                    <div className="flex items-end w-full lg:w-auto">
                      <button
                        onClick={handleMultiCitySearch}
                        className="bg-primary-green cursor-pointer text-primary-text font-semibold px-8 py-3.5 text-lg rounded-xl hover:bg-secondary-green transition-colors whitespace-nowrap flex items-center justify-center gap-2 w-full lg:w-auto"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* From and To inputs with swap */
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 flex-1 lg:items-stretch">
                  {/* From and To inputs container */}
                  <div className="relative flex flex-col lg:flex-row lg:gap-3 flex-1 lg:border-0 lg:border-gray-200 lg:pr-4">
                    {/* From input */}
                    <div className="flex-1 relative" ref={fromDropdownRef}>
                      <div className="relative h-[60px] min-h-[60px] rounded-xl pt-6 pb-2 px-4 bg-gray-100 flex items-center">
                        {isSearchingFrom && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                        )}
                        <label className="block absolute top-2 left-4 text-xs font-medium" style={{ color: "#6b7280" }}>
                          From
                        </label>
                        <input
                          ref={fromInputRef}
                          type="text"
                          value={searchData.from}
                          onChange={(e) =>
                            handleFromInputChange(e.target.value)
                          }
                          onFocus={() => {
                            if (searchData.from.length >= 1)
                              setShowFromDropdown(true);
                          }}
                          onKeyDown={handleFromKeyDown}
                          placeholder="City, Airport"
                          className={`w-full bg-transparent text-[#132968] placeholder:font-medium placeholder:text-[#132968] font-[500] text-lg focus:border-transparent outline-none ${
                            isSearchingFrom
                              ? "border-primary-green bg-green-50"
                              : ""
                          }`}
                        />
                      </div>

                      {/* Origins Dropdown */}
                      {showFromDropdown && fromSearchQuery.length >= 1 && (
                        <div className="bg-white rounded-xl shadow-lg border z-[9999] border-gray-200 max-h-80 overflow-hidden absolute top-0 left-0 mt-[68px] w-full lg:w-screen max-w-screen-md">
                          <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-sm font-medium text-gray-600">
                              Choose Origin
                            </h3>
                            <button
                              onClick={() => setShowFromDropdown(false)}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            {isSearchingFrom ? (
                              <div className="px-4 py-8 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <Loader2 className="w-8 h-8 animate-spin text-primary-green mb-3" />
                                  <div className="text-sm font-medium text-gray-600">
                                    Searching airports...
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Finding the best matches for "
                                    {fromSearchQuery}"
                                  </div>
                                </div>
                              </div>
                            ) : flightFromSearchData.length > 0 ? (
                              flightFromSearchData.map((airport, index) => (
                                <button
                                  key={`${airport.iataCode || airport.id}-${
                                    airport.subType
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAirportSelect(airport, true);
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onMouseEnter={() =>
                                    setFocusedFromIndex(index)
                                  }
                                  className={`w-full text-left px-4 py-2.5 transition-colors border-b last:border-b-0 border-gray-100 flex items-start gap-3 ${
                                    index === focusedFromIndex
                                      ? "bg-primary-green bg-opacity-10 border-primary-green"
                                      : "hover:bg-gray-50"
                                  }`}
                                >
                                  <div className="mt-1 flex-shrink-0">
                                    {airport.type === "city" ? (
                                      <PlaneTakeoff className="w-5 h-5 text-gray-400 mx-2" />
                                    ) : (
                                      <CornerDownRight className="w-5 h-5 text-gray-400 ml-12" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium">
                                      {airport.type === "city" ? (
                                        <span>
                                          {airport.iata_code} - {airport.name}{" "}
                                          All Airports
                                        </span>
                                      ) : (
                                        <span>
                                          {airport.iata_code} - {airport.name}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-gray-500 text-xs mt-0.5">
                                      {airport.city_name || airport.name},{" "}
                                      {airport.iata_country_code}
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-6 text-center text-gray-500">
                                No airports found for "{fromSearchQuery}"
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Swap button */}
                    <div className="flex justify-center lg:absolute lg:top-1/2 lg:left-1/2 lg:z-20 lg:-translate-x-[70%] lg:-translate-y-1/2 lg:items-center">
                      <button
                        onClick={handleSwap}
                        type="button"
                        className="rounded-full border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                        style={{ width: 30, height: 30 }}
                      >
                        {searchData.tripType === "return" ? (
                          <ArrowUpDown className="w-3.5 h-3.5 lg:rotate-90" style={{ color: "#132968" }} strokeWidth={2.3} />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" style={{ color: "#132968" }} strokeWidth={2.3} />
                        )}
                      </button>
                    </div>

                    {/* Destinations input */}
                    <div className="flex-1 relative" ref={toDropdownRef}>
                      <div className="relative h-[60px] min-h-[60px] rounded-xl pt-6 pb-2 px-4 bg-gray-100 flex items-center">
                        {isSearchingTo && (
                          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                        )}
                        <label className="block absolute top-2 left-4 text-xs font-medium" style={{ color: "#6b7280" }}>
                          To
                        </label>
                        <input
                          ref={toInputRef}
                          type="text"
                          value={searchData.to}
                          onChange={(e) => handleToInputChange(e.target.value)}
                          onFocus={() => {
                            if (searchData.to.length >= 1)
                              setShowToDropdown(true);
                          }}
                          onKeyDown={handleToKeyDown}
                          placeholder="City, Airport"
                          className={`w-full bg-transparent text-[#132968] placeholder:font-medium placeholder:text-[#132968] font-[500] text-lg focus:border-transparent outline-none ${
                            isSearchingTo
                              ? "border-primary-green bg-green-50"
                              : ""
                          }`}
                        />

                        {/* Destinations Dropdown */}
                        {showToDropdown && toSearchQuery.length >= 1 && (
                          <div className="bg-white rounded-xl shadow-lg border z-[9999] border-gray-200 max-h-80 overflow-hidden absolute top-0 left-0 mt-[68px] w-full lg:w-screen max-w-screen-md">
                            <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100 bg-gray-50">
                              <h3 className="text-sm font-medium text-gray-600">
                                Choose Destination
                              </h3>
                              <button
                                onClick={() => setShowToDropdown(false)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                              >
                                <X className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {isSearchingTo ? (
                                <div className="px-4 py-8 text-center">
                                  <div className="flex flex-col items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-green mb-3" />
                                    <div className="text-sm font-medium text-gray-600">
                                      Searching airports...
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      Finding the best matches for "
                                      {toSearchQuery}"
                                    </div>
                                  </div>
                                </div>
                              ) : flightToSearchData.length > 0 ? (
                                flightToSearchData.map((airport, index) => (
                                  <button
                                    key={`${airport.iataCode || airport.id}-${
                                      airport.subType
                                    }`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAirportSelect(airport, false);
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseEnter={() =>
                                      setFocusedToIndex(index)
                                    }
                                    className={`w-full text-left px-4 py-2.5 transition-colors border-b last:border-b-0 border-gray-100 flex items-start gap-3 ${
                                      index === focusedToIndex
                                        ? "bg-primary-green bg-opacity-10 border-primary-green"
                                        : "hover:bg-gray-50"
                                    }`}
                                  >
                                    <div className="mt-1 flex-shrink-0">
                                      {airport.type === "city" ? (
                                        <PlaneTakeoff className="w-5 h-5 text-gray-400 mx-1" />
                                      ) : (
                                        <CornerDownRight className="w-5 h-5 text-gray-400 ml-10" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium">
                                        {airport.type === "city" ? (
                                          <span>
                                            {airport.iata_code} - {airport.name}{" "}
                                            All Airports
                                          </span>
                                        ) : (
                                          <span>
                                            {airport.iata_code} - {airport.name}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-gray-500 text-xs mt-0.5">
                                        {airport.city_name || airport.name},{" "}
                                        {airport.iata_country_code}
                                      </div>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-6 text-center text-gray-500">
                                  No airports found for "{toSearchQuery}"
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date inputs and passenger selector */}
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-0 overflow-visible divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                    {/* Departure date */}
                    <div className="flex-1 w-full lg:w-auto">
                      <EnhancedDatePicker
                        value={searchData.departureDate}
                        onChange={(value) => {
                          setSearchData((prev) => ({
                            ...prev,
                            departureDate: value,
                          }));
                        }}
                        label="Departure"
                        minDate={new Date().toISOString().split("T")[0]}
                        placeholder="Select departure date"
                        className="rounded-l-xl bg-gray-100"
                        departureDate={searchData.departureDate}
                        returnDate={searchData.returnDate}
                      />
                    </div>

                    {/* Return date - only show when return trip is selected */}
                    {searchData.tripType === "return" && (
                      <div className="flex-1 w-full lg:w-auto">
                        <EnhancedDatePicker
                          value={searchData.returnDate}
                          onChange={(value) => {
                            setSearchData((prev) => ({
                              ...prev,
                              returnDate: value,
                              showReturn: value ? true : false,
                            }));
                          }}
                          label="Return"
                          usePrimaryColor
                          minDate={
                            searchData.departureDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          placeholder="+ Add return"
                          className="bg-gray-100"
                          departureDate={searchData.departureDate}
                          returnDate={searchData.returnDate}
                        />
                      </div>
                    )}

                    {/* Passenger and class selector */}
                    <div
                      className="relative z-10 flex-shrink-0 min-h-[60px] w-full lg:w-auto"
                      ref={dropdownRef}
                    >
                      <button
                        onClick={() =>
                          setShowPassengerDropdown(!showPassengerDropdown)
                        }
                        className="relative z-10 w-full flex items-center justify-between gap-2 pt-6 pb-2 px-4 h-[60px] min-h-[60px] bg-gray-100 rounded-b-xl lg:rounded-r-xl lg:rounded-l-none min-w-[200px] text-base font-[500] text-left pointer-events-auto"
                        style={{ color: "#132968" }}
                      >
                        <span className="flex items-center gap-2 flex-1 min-w-0">
                          <Users className="w-5 h-5 flex-shrink-0" style={{ color: "#132968" }} strokeWidth={2} />
                          <span>
                            {searchData.adults +
                              searchData.students +
                              searchData.children +
                              searchData.babies +
                              searchData.seniors}
                            . {searchData.classType} class
                          </span>
                        </span>
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </button>
                      <label className="block absolute top-2 left-4 text-xs font-medium pointer-events-none" style={{ color: "#6b7280" }}>
                        Passenger, class
                      </label>

                      {/* Passenger dropdown */}
                      {showPassengerDropdown && (
                        <div className="absolute top-full right-0 mt-2 bg-white shadow-lg border border-gray-200 z-[9999] p-6 rounded-md w-screen max-w-full lg:max-w-[500px]">
                          {/* Class Selection */}
                          <div className="border-b border-gray-200 mb-5 pb-4 grid grid-cols-2 gap-4">
                            <button
                              onClick={() =>
                                setSearchData((prev) => ({
                                  ...prev,
                                  classType: "Economy",
                                }))
                              }
                              className={`py-2 px-5 rounded-lg border-2 font-medium transition-all ${
                                searchData.classType === "Economy"
                                  ? "bg-primary-green text-primary-text border-primary-green"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              Economy
                            </button>
                            <button
                              onClick={() =>
                                setSearchData((prev) => ({
                                  ...prev,
                                  classType: "Business",
                                }))
                              }
                              className={`py-2 px-5 rounded-lg border-2 font-medium transition-all ${
                                searchData.classType === "Business"
                                  ? "bg-primary-green text-primary-text border-primary-green"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              Business
                            </button>
                          </div>
                          <div className="space-y-3">
                            {/* Adults */}
                            <div className="flex items-center justify-between">
                              <div className="flex text-sm lg:text-base   items-center gap-2">
                                <span className="font-[500] text-primary-text">
                                  Adult
                                </span>
                                <span className="text-[10px] lg:text-sm text-gray-500">
                                  (18 and over)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updatePassengerCount("adults", false)
                                  }
                                  className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                  disabled={searchData.adults <= 1}
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-sm lg:text-base text-primary-text font-medium">
                                  {searchData.adults}
                                </span>
                                <button
                                  onClick={() =>
                                    updatePassengerCount("adults", true)
                                  }
                                  className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                                  disabled={
                                    type === "flight" &&
                                    searchData.adults >=
                                      FLIGHT_PASSENGER_LIMITS.MAX_ADULTS
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Students */}
                            {/* <div className="flex items-center justify-between">
                          <div className="flex text-sm lg:text-base items-center gap-2 text-primary-text">
                            Student
                            <span className="text-[10px] lg:text-sm text-gray-500">
                              (12-24)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updatePassengerCount('students', false)}
                              className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              disabled={searchData.students <= 0}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm lg:text-base text-primary-text font-medium">
                              {searchData.students}
                            </span>
                            <button
                              onClick={() => updatePassengerCount('students', true)}
                              className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                            >
                              +
                            </button>
                          </div>
                        </div> */}

                            {/* Children */}
                            <div className="flex items-center justify-between">
                              <div className="flex text-sm lg:text-base items-center gap-2 text-primary-text">
                                Child
                                <span className="text-[10px] lg:text-sm text-gray-500">
                                  (2-11)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updatePassengerCount("children", false)
                                  }
                                  className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                  disabled={searchData.children <= 0}
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-sm lg:text-base text-primary-text font-medium">
                                  {searchData.children}
                                </span>
                                <button
                                  onClick={() =>
                                    updatePassengerCount("children", true)
                                  }
                                  className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                                  disabled={
                                    type === "flight" &&
                                    searchData.children >=
                                      FLIGHT_PASSENGER_LIMITS.MAX_CHILDREN
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Babies */}
                            <div className="flex items-center justify-between">
                              <div className="flex text-sm lg:text-base items-center gap-2 text-primary-text">
                                Infant
                                <span className="text-[10px] lg:text-sm text-gray-500">
                                  (Under 2 years old)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updatePassengerCount("babies", false)
                                  }
                                  className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                  disabled={searchData.babies <= 0}
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-sm lg:text-base text-primary-text font-medium">
                                  {searchData.babies}
                                </span>
                                <button
                                  onClick={() =>
                                    updatePassengerCount("babies", true)
                                  }
                                  className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                                  disabled={
                                    type === "flight" &&
                                    searchData.babies >=
                                      FLIGHT_PASSENGER_LIMITS.MAX_INFANTS
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Seniors */}
                            {/* <div className="flex items-center justify-between">
                          <div className="flex text-sm lg:text-base items-center gap-2 text-primary-text">
                            Old
                            <span className="text-[10px] lg:text-sm text-gray-500">
                              (65 and over)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updatePassengerCount('seniors', false)}
                              className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              disabled={searchData.seniors <= 0}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm lg:text-base text-primary-text font-medium">
                              {searchData.seniors}
                            </span>
                            <button
                              onClick={() => updatePassengerCount('seniors', true)}
                              className="w-6 lg:w-8 h-4 lg:h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                            >
                              +
                            </button>
                          </div>
                        </div> */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Search button */}
                  <div className="flex items-end w-full lg:w-auto lg:pl-4">
                    <button
                      onClick={handleSearch}
                      className="bg-[#D4FF5A] text-lg cursor-pointer font-semibold px-10 rounded-xl hover:bg-[#b8e84d] transition-colors whitespace-nowrap flex items-center justify-center gap-2 w-full lg:w-auto shadow-sm min-w-[140px]"
                      style={{ color: "#132968", height: 60 }}
                    >
                      Search
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    );
  };

  // Render EuroBus search interface
  const renderEuroBusSearch = () => (
    <div className="bg-[#E4ECEF] min-h-[470px] lg:h-[470px] py-10 lg:py-20">
      <Container className="relative h-full">
        <div className="relative lg:absolute w-full lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 mt-10 md:mt-20 lg:px-3 ">
          <div className="bg-gray-100 border-[6px] border-white rounded-2xl p-4 lg:p-5 shadow-lg w-full py-5">
            {/* From and To inputs with swap */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              {/* From and To inputs container */}
              <div className="relative flex flex-col lg:flex-row lg:gap-3 flex-1">
                {/* From input */}
                <div className="flex-1 relative" ref={busFromDropdownRef}>
                  <div className="relative min-h-[60px] rounded-md pt-6 pb-2 px-4 bg-white">
                    {isSearchingBusFrom && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                    )}
                    <label className="block absolute top-2 left-4 text-xs font-medium text-gray-400">
                      From
                    </label>
                    <input
                      type="text"
                      value={busSearchData.from}
                      onChange={(e) => handleBusFromInputChange(e.target.value)}
                      onFocus={() => {
                        if (busSearchData.from.length >= 1)
                          setShowBusFromDropdown(true);
                      }}
                      placeholder="City, Bus Station"
                      className={`w-full bg-white text-primary-text mt-1 placeholder:font-medium placeholder:text-primary-text font-[500] text-lg focus:border-transparent outline-none ${
                        isSearchingBusFrom
                          ? "border-primary-green bg-green-50"
                          : ""
                      }`}
                    />
                  </div>

                  {/* Bus From Dropdown */}
                  {showBusFromDropdown && busFromSearchQuery.length >= 1 && (
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-hidden absolute top-0 left-0 mt-[68px] w-full lg:w-screen max-w-screen-md z-[9999]">
                      <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-600">
                          Choose Origin
                        </h3>
                        <button
                          onClick={() => setShowBusFromDropdown(false)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {isSearchingBusFrom ? (
                          <div className="px-4 py-8 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Loader2 className="w-8 h-8 animate-spin text-primary-green mb-3" />
                              <div className="text-sm font-medium text-gray-600">
                                Searching destinations...
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Finding the best matches for "
                                {busFromSearchQuery}"
                              </div>
                            </div>
                          </div>
                        ) : busFromSearchData.length > 0 ? (
                          busFromSearchData.map((destination) => (
                            <button
                              key={destination.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleBusDestinationSelect(destination, true);
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100 flex items-start gap-3"
                            >
                              <div className="mt-1 flex-shrink-0">
                                <Bus className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium">
                                  {destination.cityName}
                                </div>
                                <div className="text-gray-500 text-xs mt-0.5">
                                  {destination.countryName}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center text-gray-500">
                            No destinations found for "{busFromSearchQuery}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Swap button */}
                <div className="flex justify-center lg:absolute lg:top-1/2 lg:right-1/2 lg:z-20 lg:translate-x-1/2 lg:transform lg:-translate-y-1/2 lg:items-center">
                  <button
                    onClick={handleBusSwap}
                    className="p-1.5 rounded-full border border-gray-300 bg-white transition-colors"
                  >
                    <ArrowUpDown className="w-4 h-4 lg:rotate-90 text-gray-600" />
                  </button>
                </div>

                {/* To input */}
                <div className="flex-1 relative" ref={busToDropdownRef}>
                  <div className="relative min-h-[60px] rounded-md pt-6 pb-2 px-4 bg-white">
                    {isSearchingBusTo && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
                    )}
                    <label className="block absolute top-2 left-4 text-xs font-medium text-gray-400">
                      To
                    </label>
                    <input
                      type="text"
                      value={busSearchData.to}
                      onChange={(e) => handleBusToInputChange(e.target.value)}
                      onFocus={() => {
                        if (busSearchData.to.length >= 1)
                          setShowBusToDropdown(true);
                      }}
                      placeholder="City, Bus Station"
                      className={`w-full bg-white text-primary-text placeholder:text-primary-text mt-1 font-[500] text-lg focus:border-transparent outline-none ${
                        isSearchingBusTo
                          ? "border-primary-green bg-green-50"
                          : ""
                      }`}
                    />

                    {/* Bus To Dropdown */}
                    {showBusToDropdown && busToSearchQuery.length >= 1 && (
                      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-hidden absolute top-0 left-0 mt-[68px] w-full lg:w-screen max-w-screen-md z-[9999]">
                        <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-100 bg-gray-50">
                          <h3 className="text-sm font-medium text-gray-600">
                            Choose Destination
                          </h3>
                          <button
                            onClick={() => setShowBusToDropdown(false)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {isSearchingBusTo ? (
                            <div className="px-4 py-8 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-green mb-3" />
                                <div className="text-sm font-medium text-gray-600">
                                  Searching destinations...
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Finding the best matches for "
                                  {busToSearchQuery}"
                                </div>
                              </div>
                            </div>
                          ) : busToSearchData.length > 0 ? (
                            busToSearchData.map((destination) => (
                              <button
                                key={destination.id}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleBusDestinationSelect(
                                    destination,
                                    false
                                  );
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100 flex items-start gap-3"
                              >
                                <div className="mt-1 flex-shrink-0">
                                  <Bus className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">
                                    {destination.cityName}
                                  </div>
                                  <div className="text-gray-500 text-xs mt-0.5">
                                    {destination.countryName}
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-6 text-center text-gray-500">
                              No destinations found for "{busToSearchQuery}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Date inputs and passenger selector */}
              <div className="flex flex-col lg:flex-row items-center gap-2 md:gap-0">
                {/* Departure date */}
                <div className="flex-1 w-full lg:w-auto">
                  <EnhancedDatePicker
                    value={busSearchData.departureDate}
                    onChange={(value) =>
                      setBusSearchData((prev) => ({
                        ...prev,
                        departureDate: value,
                      }))
                    }
                    label="Departure Date"
                    minDate={new Date().toISOString().split("T")[0]}
                    placeholder="Select departure date"
                    className="lg:rounded-l-md lg:rounded-r-none"
                  />
                </div>

                {/* Departure Time */}
                <div className="flex-1 relative min-h-[60px] w-full lg:w-auto">
                  <div className="relative min-h-[60px] pt-6 pb-2 px-2 bg-white rounded-md lg:rounded-none lg:border-l lg:border-gray-300">
                    <label className="block absolute top-2 left-3 text-xs font-medium text-gray-400">
                      Time
                    </label>
                    <input
                      type="time"
                      value={busSearchData.departureTime}
                      onChange={(e) =>
                        setBusSearchData((prev) => ({
                          ...prev,
                          departureTime: e.target.value,
                        }))
                      }
                      className="w-full bg-white text-primary-text mt-1 placeholder:text-primary-text font-[500] text-lg focus:border-transparent outline-none min-w-[160px] border-none"
                    />
                  </div>
                </div>

                {/* Passenger selector */}
                <div
                  className="relative min-h-[60px] w-full lg:w-auto"
                  ref={dropdownRef}
                >
                  <button
                    onClick={() =>
                      setShowPassengerDropdown(!showPassengerDropdown)
                    }
                    className="w-full flex items-center justify-between px-4 h-[64px] bg-white rounded-md lg:rounded-r-md lg:rounded-l-none lg:border-l lg:border-gray-300 text-primary-text min-w-[200px] text-lg font-[500]"
                  >
                    <span className="text-left">
                      {busSearchData.passengers} Passenger
                      {busSearchData.passengers !== 1 ? "s" : ""}
                    </span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Passenger dropdown */}
                  {showPassengerDropdown && (
                    <div className="absolute top-full right-0 mt-2 bg-white shadow-lg border border-gray-200 z-[9999] p-6 rounded-md min-w-[300px]">
                      <div className="space-y-4">
                        {/* Passengers */}
                        <div className="flex items-center justify-between">
                          <div className="font-[500] text-primary-text block">
                            Passengers
                            <span className="text-sm text-gray-500 ml-2">
                              (All ages)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setBusSearchData((prev) => ({
                                  ...prev,
                                  passengers: Math.max(1, prev.passengers - 1),
                                }))
                              }
                              className="w-8 h-6 rounded-lg bg-gray-200 text-primary-text hover:bg-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              disabled={busSearchData.passengers <= 1}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-primary-text font-medium">
                              {busSearchData.passengers}
                            </span>
                            <button
                              onClick={() =>
                                setBusSearchData((prev) => ({
                                  ...prev,
                                  passengers: prev.passengers + 1,
                                }))
                              }
                              className="w-8 h-6 rounded-lg bg-primary-green hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Search button */}
              <div className="flex items-end w-full lg:w-auto">
                <button
                  onClick={handleBusSearch}
                  className="bg-primary-green  cursor-pointer text-primary-text font-semibold px-8 h-[60px] rounded-md hover:bg-secondary-green transition-colors whitespace-nowrap flex items-center justify-center gap-2 w-full lg:w-auto"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on a portal dropdown element
      const isPortalDropdown = event.target.closest("[data-portal-dropdown]");
      if (isPortalDropdown) {
        return; // Don't close if clicking inside portal dropdown
      }

      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPassengerDropdown(false);
      }
      if (
        fromDropdownRef.current &&
        !fromDropdownRef.current.contains(event.target)
      ) {
        setShowFromDropdown(false);
      }
      if (
        toDropdownRef.current &&
        !toDropdownRef.current.contains(event.target)
      ) {
        setShowToDropdown(false);
      }
      if (
        destinationDropdownRef.current &&
        !destinationDropdownRef.current.contains(event.target)
      ) {
        setShowDestinationDropdown(false);
      }
      if (
        busFromDropdownRef.current &&
        !busFromDropdownRef.current.contains(event.target)
      ) {
        setShowBusFromDropdown(false);
      }
      if (
        busToDropdownRef.current &&
        !busToDropdownRef.current.contains(event.target)
      ) {
        setShowBusToDropdown(false);
      }

      // Close multi-city dropdowns when clicking outside
      const isMultiCityFromDropdown = event.target.closest(
        "[data-multi-city-from-dropdown]"
      );
      const isMultiCityToDropdown = event.target.closest(
        "[data-multi-city-to-dropdown]"
      );
      const isMultiCityPassengerDropdown = event.target.closest(
        "[data-multi-city-passenger-dropdown]"
      );

      if (!isMultiCityFromDropdown) {
        setMultiCityFromDropdowns({});
      }
      if (!isMultiCityToDropdown) {
        setMultiCityToDropdowns({});
      }
      if (!isMultiCityPassengerDropdown) {
        setMultiCityPassengerDropdowns({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup function to cancel pending requests
  useEffect(() => {
    return () => {
      if (fromAbortControllerRef.current) {
        fromAbortControllerRef.current.abort();
      }
      if (toAbortControllerRef.current) {
        toAbortControllerRef.current.abort();
      }
      if (destinationAbortControllerRef.current) {
        destinationAbortControllerRef.current.abort();
      }
      if (busFromAbortControllerRef.current) {
        busFromAbortControllerRef.current.abort();
      }
      if (busToAbortControllerRef.current) {
        busToAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Function to handle trip type change
  const handleTripTypeChange = (tripType) => {
    setSearchData((prev) => ({
      ...prev,
      tripType,
      showReturn: tripType === "return",
      returnDate: tripType === "return" ? prev.returnDate : "", // Clear return date when not return trip
    }));
  };

  // Multi-city functionality functions
  const addMultiCitySegment = () => {
    if (multiCitySegments.length >= 8) {
      toast.error("Maximum 8 flight segments allowed");
      return;
    }

    // Get the last segment to auto-fill "From" with previous "To"
    const lastSegment = multiCitySegments[multiCitySegments.length - 1];

    const newSegment = {
      id: Date.now(),
      // Auto-fill "From" with the "To" destination from the previous segment
      from: lastSegment && lastSegment.to ? lastSegment.to : "",
      fromIata: lastSegment && lastSegment.toIata ? lastSegment.toIata : "",
      fromLat: lastSegment && lastSegment.toLat ? lastSegment.toLat : null,
      fromLng: lastSegment && lastSegment.toLng ? lastSegment.toLng : null,
      to: "",
      toIata: "",
      toLat: null,
      toLng: null,
      departureDate: (() => {
        if (lastSegment && lastSegment.departureDate) {
          const lastDate = new Date(
            lastSegment.departureDate.replace(/T.+$/, "")
          );
          lastDate.setDate(lastDate.getDate() + 3); // Add 3 days to last segment
          return lastDate.toISOString().split("T")[0];
        }
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
      })(),
      adults: 1,
      students: 0,
      children: 0,
      babies: 0,
      seniors: 0,
      classType: "Economy",
    };

    setMultiCitySegments((prev) => [...prev, newSegment]);
  };

  const removeMultiCitySegment = (segmentId) => {
    if (multiCitySegments.length <= 1) {
      toast.error("At least one flight segment is required");
      return;
    }

    setMultiCitySegments((prev) =>
      prev.filter((segment) => segment.id !== segmentId)
    );
  };

  const updateMultiCitySegment = (segmentId, field, value) => {
    setMultiCitySegments((prev) =>
      prev.map((segment) =>
        segment.id === segmentId ? { ...segment, [field]: value } : segment
      )
    );
  };

  const handleMultiCityFromInputChange = (value, segmentId) => {
    updateMultiCitySegment(segmentId, "from", value);
    // Show dropdown when user starts typing
    setMultiCityFromDropdowns((prev) => ({ ...prev, [segmentId]: true }));
    // Trigger API search for multi-city from
    if (value.length >= 1) {
      multiCityApiCall(value, segmentId, "from");
    } else {
      // Clear search data when input is empty
      setMultiCityFromSearchData((prev) => ({ ...prev, [segmentId]: [] }));
      setMultiCityFromSearching((prev) => ({ ...prev, [segmentId]: false }));
    }
  };

  const handleMultiCityToInputChange = (value, segmentId) => {
    updateMultiCitySegment(segmentId, "to", value);
    // Show dropdown when user starts typing
    setMultiCityToDropdowns((prev) => ({ ...prev, [segmentId]: true }));
    // Trigger API search for multi-city to
    if (value.length >= 1) {
      multiCityApiCall(value, segmentId, "to");
    } else {
      // Clear search data when input is empty
      setMultiCityToSearchData((prev) => ({ ...prev, [segmentId]: [] }));
      setMultiCityToSearching((prev) => ({ ...prev, [segmentId]: false }));
    }
  };

  // Multi-city API call function
  const multiCityApiCall = async (value, segmentId, option) => {
    if (!value || value === "undefined" || value.includes("(undefined)")) {
      return;
    }

    // Set loading state for this specific segment
    if (option === "from") {
      setMultiCityFromSearching((prev) => ({ ...prev, [segmentId]: true }));
    } else {
      setMultiCityToSearching((prev) => ({ ...prev, [segmentId]: true }));
    }

    try {
      // Try cities endpoint first, then airports if no results
      let res;
      try {
        res = await axios.post(
          "/api/cors-proxy",
          {
            url: `${APILINK}/places/suggestions?query=${value}&limit=20`,
            method: "GET",
          },
          {
            timeout: 10000, // 10 second timeout
          }
        );

        // If cities endpoint returns no results, try airports endpoint
        if (!res.data?.data || res.data.data.length === 0) {
          res = await axios.post(
            "/api/cors-proxy",
            {
              url: `${APILINK}/places/suggestions?query=${value}&limit=20`,
              method: "GET",
            },
            {
              timeout: 10000, // 10 second timeout
            }
          );
        }
      } catch (error) {
        // If cities endpoint fails, try airports endpoint
        res = await axios.post(
          "/api/cors-proxy",
          {
            url: `${APILINK}/places/suggestions?query=${value}&limit=20`,
            method: "GET",
          },
          {
            timeout: 10000, // 10 second timeout
          }
        );
      }

      if (res.data?.data) {
        const processedResults = processSearchResults(res.data.data, value);

        if (option === "from") {
          setMultiCityFromSearchData((prev) => ({
            ...prev,
            [segmentId]: processedResults,
          }));
        } else {
          setMultiCityToSearchData((prev) => ({
            ...prev,
            [segmentId]: processedResults,
          }));
        }
      }
    } catch (error) {
      // Clear results on error
      if (option === "from") {
        setMultiCityFromSearchData((prev) => ({ ...prev, [segmentId]: [] }));
      } else {
        setMultiCityToSearchData((prev) => ({ ...prev, [segmentId]: [] }));
      }
    } finally {
      // Clear loading state
      if (option === "from") {
        setMultiCityFromSearching((prev) => ({ ...prev, [segmentId]: false }));
      } else {
        setMultiCityToSearching((prev) => ({ ...prev, [segmentId]: false }));
      }
    }
  };

  const handleMultiCityAirportSelect = (airport, segmentId, isFrom = true) => {
    // Safely construct display text with null checks
    let displayText;
    let iataCode;

    // Handle the new API response structure
    if (airport.type === "city") {
      // For cities, use city information
      const cityName = airport.name || airport.city_name || "Unknown City";
      const cityCode = airport.iata_code || airport.iata_city_code || "";
      displayText = cityCode ? `${cityName} (${cityCode})` : cityName;
      iataCode = cityCode;
    } else {
      // For airports, use airport information
      const airportName = airport.name || "Unknown Airport";
      // Use the correct IATA code field from the new API structure
      const airportIataCode = airport.iata_code || "";
      displayText = airportIataCode
        ? `${airportName} (${airportIataCode})`
        : airportName;
      iataCode = airportIataCode;
    }

    // Set coordinates for map if available - use the direct latitude/longitude fields
    const lat = airport.latitude;
    const lng = airport.longitude;

    // Update the specific segment
    setMultiCitySegments((prev) => {
      const updatedSegments = prev.map((segment) =>
        segment.id === segmentId
          ? {
              ...segment,
              [isFrom ? "from" : "to"]: displayText,
              [isFrom ? "fromIata" : "toIata"]: iataCode,
              [isFrom ? "fromLat" : "toLat"]: lat,
              [isFrom ? "fromLng" : "toLng"]: lng,
            }
          : segment
      );

      // If this was a "To" field change, auto-update the next segment's "From" field
      if (!isFrom) {
        const currentSegmentIndex = updatedSegments.findIndex(
          (seg) => seg.id === segmentId
        );
        const nextSegmentIndex = currentSegmentIndex + 1;

        // If there's a next segment, update its "From" field
        if (nextSegmentIndex < updatedSegments.length) {
          updatedSegments[nextSegmentIndex] = {
            ...updatedSegments[nextSegmentIndex],
            from: displayText,
            fromIata: iataCode,
            fromLat: lat,
            fromLng: lng,
          };
        }
      }

      return updatedSegments;
    });

    // Close the dropdown
    if (isFrom) {
      setMultiCityFromDropdowns((prev) => ({ ...prev, [segmentId]: false }));
    } else {
      setMultiCityToDropdowns((prev) => ({ ...prev, [segmentId]: false }));
    }
  };

  const handleMultiCitySearch = () => {
    // Validate all segments
    for (const segment of multiCitySegments) {
      if (!segment.fromIata || !segment.toIata) {
        alert(
          "Please select both origin and destination airports for all flight segments."
        );
        return;
      }
      if (!segment.departureDate) {
        alert("Please select departure dates for all flight segments.");
        return;
      }
    }

    // Build search parameters
    const params = new URLSearchParams({
      tripType: "multi-city",
      flightClass: searchData.classType,
      adult: searchData.adults.toString(),
      child: searchData.children.toString(),
      infant: searchData.babies.toString(),
    });

    // Add segment data
    multiCitySegments.forEach((segment, index) => {
      params.append(`segment${index + 1}From`, segment.from);
      params.append(`segment${index + 1}FromIata`, segment.fromIata);
      params.append(`segment${index + 1}To`, segment.to);
      params.append(`segment${index + 1}ToIata`, segment.toIata);
      params.append(`segment${index + 1}Date`, segment.departureDate);

      if (segment.fromLat && segment.fromLng) {
        params.append(`segment${index + 1}FromLat`, segment.fromLat.toString());
        params.append(`segment${index + 1}FromLng`, segment.fromLng.toString());
      }
      if (segment.toLat && segment.toLng) {
        params.append(`segment${index + 1}ToLat`, segment.toLat.toString());
        params.append(`segment${index + 1}ToLng`, segment.toLng.toString());
      }
    });

    router.push(`/flight/flightSearch?${params.toString()}`);
  };

  const handleSwap = () => {
    setSearchData((prev) => ({
      ...prev,
      from: prev.to,
      fromIata: prev.toIata,
      fromLat: prev.toLat,
      fromLng: prev.toLng,
      to: prev.from,
      toIata: prev.fromIata,
      toLat: prev.fromLat,
      toLng: prev.fromLng,
    }));
    // Also swap the search queries
    const tempQuery = fromSearchQuery;
    setFromSearchQuery(toSearchQuery);
    setToSearchQuery(tempQuery);

    // Swap the selection flags
    const tempSelected = fromAirportSelected;
    setFromAirportSelected(toAirportSelected);
    setToAirportSelected(tempSelected);

    // Swap map coordinates if available
    if (
      setMapFrom &&
      setMapTo &&
      searchData.toLat &&
      searchData.toLng &&
      searchData.fromLat &&
      searchData.fromLng
    ) {
      setMapFrom([searchData.toLat, searchData.toLng]);
      setMapTo([searchData.fromLat, searchData.fromLng]);
    }
  };

  // Main render - conditionally show hotel, EuroBus, or flight search
  if (type === "hotel") {
    return renderHotelSearch();
  }

  if (type === "eurobus") {
    return renderEuroBusSearch();
  }

  // Default to flight search
  return renderFlightSearch();
}
