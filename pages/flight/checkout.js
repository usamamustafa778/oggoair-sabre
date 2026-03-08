import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { tokenUtils, BACKEND_API_URL, getHeaders } from "../../config/api";
import Navbar from "@/components/Navbar";
import FullContainer from "@/components/common/FullContainer";
import Container from "@/components/common/Container";
import FlightDetailsSidebar from "@/components/FlightSearch/FlightDetailsSidebar";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import ViewDataModal from "@/components/ExtraService/ViewDataModal";
import ModernAuthForm from "@/components/Login/ModernAuthForm";
import { getBreadcrumbSteps } from "@/utils/breadcrumbUtils";
import { buildRevalidatePayload, buildOrdersCreatePayload } from "@/utils/sabreRevalidate";

import Link from "next/link";
import {
  saveFlightFormData,
  loadFlightFormData,
  loadBookingId,
} from "@/utils/formPersistence";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function FlightCheckout() {  
  const [passengersInfo, setPassengersInfo] = useState([]);
  const [flightDetails, setFlightDetails] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contact, setContact] = useState({
    email: "",
    phoneNumber: "",
    dialCode: "",
  });
  const [validationError, setValidationError] = useState(false);
  const [countries, setCountries] = useState([]);
  const [showViewDataModal, setShowViewDataModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [revalidateResponse, setRevalidateResponse] = useState(null);
  const router = useRouter();

  // Toast notification functions using react-hot-toast
  const showSuccessToast = (message) => {
    toast.dismiss(); // Dismiss all previous toasts
    toast.success(message);
  };
  const showErrorToast = (message) => {
    toast.dismiss(); // Dismiss all previous toasts
    toast.error(message);
  };
  const showWarningToast = (message) => {
    toast.dismiss(); // Dismiss all previous toasts
    toast(message, { icon: "⚠️" });
  };
  const showInfoToast = (message) => {
    toast.dismiss(); // Dismiss all previous toasts
    toast(message, { icon: "ℹ️" });
  };

  // Function to validate if a dial code is valid using the countries data
  const isValidDialCode = (dialCode, countriesList = countries) => {
    if (!dialCode) return false;
    // Check if dial code exists in the countries list
    return countriesList.some((country) => country.dialCode === dialCode);
  };

  // Function to get country name from dial code
  const getCountryNameFromDialCode = (dialCode, countriesList = countries) => {
    if (!dialCode) return null;
    const country = countriesList.find((c) => c.dialCode === dialCode);
    return country?.name || null;
  };

  // Use refs to store current values for beforeunload event
  const passengersInfoRef = useRef(passengersInfo);
  const contactRef = useRef(contact);
  const urlUpdatedRef = useRef(false);

  const [showPassengerDetails, setShowPassengerDetails] = useState(false);

  // Check if user is authenticated
  const checkAuthentication = () => {
    const token = tokenUtils.getToken();
    const userData = tokenUtils.getUserData();
    return !!(token && userData);
  };

  // Handle authentication success
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    // After successful authentication, proceed with booking
    proceedWithBooking();
  };

  // Check authentication status on component mount
  useEffect(() => {
    setIsAuthenticated(checkAuthentication());
  }, []);

  useEffect(() => {
    // Removed cleanup that was wiping user-entered data on reload

    // Fetch all countries and their flags
    async function fetchCountries() {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2"
        );
        const data = await response.json();
        const formattedCountries = data
          .map((country) => ({
            name: country.name.common,
            flag: country.flags.svg,
            dialCode: country.idd.root
              ? `${country.idd.root}${
                  country.idd.suffixes ? country.idd.suffixes[0] : ""
                }`
              : "N/A",
            code: country.cca2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(formattedCountries);
      } catch (error) {
        // ignore
      }
    }
    fetchCountries();
  }, []);

  // Open payment modal if flagged (e.g., after login/OTP success with reload)
  useEffect(() => {
    try {
      const shouldOpen = localStorage.getItem("openPaymentModal");
      if (shouldOpen) {
        setShowViewDataModal(true);
        localStorage.removeItem("openPaymentModal");
      }
    } catch (_) {}
  }, []);

 

  useEffect(() => {
    const {
      id,
      adult,
      adults, // Backward compatibility
      child,
      infant,
      flightData,
      selectedOffer: selectedOfferParam,
    } = router.query;

    // Use new 'adult' param with backward compatibility for 'adults'
    const adultsCount = adult
      ? parseInt(adult, 10)
      : adults
      ? parseInt(adults, 10)
      : 1;

    // Parse child and infant with proper defaults
    const childCount = child ? parseInt(child, 10) : 0;
    const infantCount = infant ? parseInt(infant, 10) : 0;

    const initializeData = async () => {
      if (id && router.isReady) {
        
        if (selectedOfferParam && typeof selectedOfferParam === "string") {
          setSelectedOffer(selectedOfferParam);
        }
        // Always load sidebar data from localStorage to keep URL short
        try {
          // Prefer the single fixed key first; fallback to old per-offer key
          let stored = localStorage.getItem("flight_selected");
          if (!stored) stored = localStorage.getItem(`flight_${id}`);
          if (stored) {
            const parsedFlight = JSON.parse(stored);
            setFlightDetails(parsedFlight);
            // Reset revalidate called flag when new flight is loaded
            if (parsedFlight.id !== revalidateCalledRef.current?.flightId) {
              revalidateCalledRef.current = { called: false, flightId: parsedFlight.id };
            }
           
            if (process.env.NODE_ENV === 'development') {
              const hasFinalPricing = parsedFlight.estimated === false;
              console.log("✅ [PricedFlight Reused] Passenger Details Screen:", {
                flightId: parsedFlight.id || parsedFlight.offer_id,
                source: "localStorage (from search results)",
                pricing: {
                  total_amount: parsedFlight.total_amount,
                  total_currency: parsedFlight.total_currency || 'USD',
                  base_amount: parsedFlight.base_amount,
                  tax_amount: parsedFlight.tax_amount,
                  estimated: parsedFlight.estimated === true,
                  hasFinalPricing: hasFinalPricing,
                },
                pricingType: parsedFlight._pricingType || (hasFinalPricing ? 'final' : 'indicative'),
                itinerary: {
                slicesCount: parsedFlight.slices?.length || 0,
                segmentsCount: parsedFlight.slices?.[0]?.segments?.length || 0,
                hasCompleteItinerary: !!(parsedFlight.slices && parsedFlight.slices.length > 0),
                },
                passengerData: {
                  hasPassengerPricing: !!parsedFlight.passenger_pricing,
                  hasPassengerCounts: !!parsedFlight.passenger_counts,
                  ADT: parsedFlight.passenger_pricing?.ADT?.totalFare,
                  CNN: parsedFlight.passenger_pricing?.CNN?.totalFare,
                  INF: parsedFlight.passenger_pricing?.INF?.totalFare,
                },
                fareDetails: parsedFlight.fare_details ? {
                  cabin_class: parsedFlight.fare_details.cabin_class,
                  refundable: parsedFlight.fare_details.refundable,
                  changeable: parsedFlight.fare_details.changeable,
                } : null,
                // REMOVED: airPriceData - AirPrice removed, BFM only
                timestamp: new Date().toISOString(),
                action: hasFinalPricing ? "Using final pricing - NO AirPrice call needed" : "Estimated pricing - AirPrice will be called",
                message: "This pricedFlight object will be used to render flight card - price must match search card exactly",
              });
            }
          } else if (flightData) {
            // Backward compatibility: support old long URLs once, then store locally
            try {
              const decoded = JSON.parse(decodeURIComponent(flightData));
              setFlightDetails(decoded);
              // Reset revalidate called flag for new flight
              if (decoded.id !== revalidateCalledRef.current?.flightId) {
                revalidateCalledRef.current = { called: false, flightId: decoded.id };
              }
              localStorage.setItem("flight_selected", JSON.stringify(decoded));
            } catch (err) {
              setError(
                "Could not load flight details. Please try searching for flights again."
              );
            }
          } else {
            setError(
              "Could not load flight details. Please try searching for flights again."
            );
          }
        } catch (e) {
          setError(
            "Could not load flight details. Please try searching for flights again."
          );
        }

        // If flightData exists, strip it from the URL for cleanliness
        if (flightData) {
          const { flightData: _ignored, ...rest } = router.query;
          router.replace(
            { pathname: router.pathname, query: { ...rest } },
            undefined,
            { shallow: true }
          );
        }

        // Skip old-defaults cleanup to preserve user-entered data

        // Try to load saved data from localStorage
        const savedFormData = loadFlightFormData(id);
        const savedBookingId = loadBookingId(id);

        // Get user data from localStorage
        const userData = tokenUtils.getUserData();

        // Fetch countries if not already loaded
        let formattedCountries = countries;
        if (!countries || countries.length === 0) {
          try {
            const countriesResponse = await fetch(
              "https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2"
            );
            const countriesData = await countriesResponse.json();
            formattedCountries = countriesData
              .map((country) => ({
                name: country.name.common,
                flag: country.flags.svg,
                dialCode: country.idd.root
                  ? `${country.idd.root}${
                      country.idd.suffixes ? country.idd.suffixes[0] : ""
                    }`
                  : "N/A",
                code: country.cca2,
              }))
              .sort((a, b) => a.name.localeCompare(b.name));
            setCountries(formattedCountries);
          } catch (error) {
            console.error("Error fetching countries:", error);
            formattedCountries = [];
          }
        }

        // Build initial passengers array
        const tempTravelersInfo = [];
        for (let i = 0; i < adultsCount; i++) {
          // For the first adult passenger, pre-fill with localStorage data if available
          const isFirstPassenger = i === 0;
          const fullName = userData?.name || "";
          const nameParts = fullName.trim().split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          // Determine default residence country based on dial code
          let defaultResidence = "";
          if (isFirstPassenger && userData?.phone) {
            const phoneStr = userData.phone.toString();
            // Try to extract dial code and get corresponding country
            for (let j = 2; j <= 4; j++) {
              const potentialCode = phoneStr.substring(0, j);
              if (isValidDialCode(potentialCode, formattedCountries)) {
                defaultResidence =
                  getCountryNameFromDialCode(
                    potentialCode,
                    formattedCountries
                  ) || "";
                break;
              }
            }
          }

          tempTravelersInfo.push({
            type: "adult",
            firstName: isFirstPassenger && userData ? firstName : "",
            lastName: isFirstPassenger && userData ? lastName : "",
            dateOfBirth: "",
            gender: "",
            cityzenShip: defaultResidence,
            passport: "",
            passportExpiryDate: "",
            email: isFirstPassenger && userData ? userData.email || "" : "",
            phoneNumber: "",
            dialCode: "",
          });
        }
        // Get default residence for child/infant passengers (same as adult)
        let defaultResidenceForAll = "";
        if (userData?.phone) {
          const phoneStr = userData.phone.toString();
          for (let j = 2; j <= 4; j++) {
            const potentialCode = phoneStr.substring(0, j);
            if (isValidDialCode(potentialCode, formattedCountries)) {
              defaultResidenceForAll =
                getCountryNameFromDialCode(potentialCode, formattedCountries) ||
                "";
              break;
            }
          }
        }

        for (let i = 0; i < childCount; i++)
          tempTravelersInfo.push({
            type: "child",
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            gender: "",
            cityzenShip: defaultResidenceForAll,
            passport: "",
            passportExpiryDate: "",
          });
        for (let i = 0; i < infantCount; i++)
          tempTravelersInfo.push({
            type: "infant",
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            gender: "",
            cityzenShip: defaultResidenceForAll,
            passport: "",
            passportExpiryDate: "",
          });

        // Restore saved data if available
        if (savedFormData && savedFormData.length > 0) {
          setPassengersInfo(savedFormData);

          // Extract contact info from main passenger (first passenger)
          if (savedFormData[0]) {
            const mainPassenger = savedFormData[0];
            const savedDialCode = mainPassenger.dialCode;

            // Validate the saved dial code
            const validDialCode = isValidDialCode(
              savedDialCode,
              formattedCountries
            )
              ? savedDialCode
              : "";

            const savedContact = {
              email: mainPassenger.email || "",
              phoneNumber: mainPassenger.phoneNumber || "",
              dialCode: validDialCode,
            };

            setContact(savedContact);
          }
        } else {
          setPassengersInfo(tempTravelersInfo);

          // If no saved form data but we have user data from localStorage, set contact info
          if (userData) {
            let extractedDialCode = "";
            let cleanPhoneNumber = "";

            if (userData.phone) {
              // Try to extract dial code from phone number
              const phoneStr = userData.phone.toString();

              // Check if it starts with a valid dial code
              for (let i = 2; i <= 4; i++) {
                const potentialCode = phoneStr.substring(0, i);
                if (isValidDialCode(potentialCode, formattedCountries)) {
                  extractedDialCode = potentialCode;
                  cleanPhoneNumber = phoneStr.substring(i);
                  break;
                }
              }

              // If no valid dial code found, keep the full phone number
              if (!extractedDialCode) {
                cleanPhoneNumber = phoneStr;
              }
            }

            const newContact = {
              email: userData.email || "",
              phoneNumber: cleanPhoneNumber,
              dialCode: extractedDialCode,
            };

            setContact(newContact);
          }
        }

        if (
          savedBookingId &&
          !router.query.booking_id &&
          !urlUpdatedRef.current
        ) {
          // Update URL with booking_id if we have it and it's not already in the URL
          urlUpdatedRef.current = true;
          router.replace(
            {
              pathname: router.pathname,
              query: { ...router.query, booking_id: savedBookingId },
            },
            undefined,
            { shallow: true }
          );
        }
      }
    };

    initializeData();
  }, [
    router.isReady,
    router.query.id,
    router.query.adult || router.query.adults, // Support new 'adult' param with backward compatibility
    router.query.child,
    router.query.infant,
    router.query.booking_id,
    router.query.flightData,
    router.query.selectedOffer,
  ]);

  // ============================================
  // REVALIDATE API CALL - AUTOMATIC ON PAGE LOAD
  // ============================================
  // When passenger details page loads, automatically call revalidate API
  // to get final pricing from Sabre and update the highlighted price section
  // ============================================
  const revalidateCalledRef = useRef({ called: false, flightId: null });
  
  useEffect(() => {
    // Only call revalidate if:
    // 1. Flight details are loaded
    // 2. Flight has estimated pricing (not final)
    // 3. Haven't called revalidate yet for this flight
    // 4. Router is ready
    if (
      !flightDetails ||
      !router.isReady ||
      flightDetails.estimated === false
    ) {
      return;
    }

    // Check if we've already called revalidate for this flight
    if (revalidateCalledRef.current.called && 
        revalidateCalledRef.current.flightId === flightDetails.id) {
      return;
    }

    const callRevalidate = async () => {
      try {
        // Get passenger counts from URL or flight metadata
        const adultsCount = parseInt(router.query.adult || router.query.adults || 1, 10);
        const childCount = parseInt(router.query.child || 0, 10);
        const infantCount = parseInt(router.query.infant || 0, 10);

        const passengerCounts = {
          adults: adultsCount,
          child: childCount,
          infant: infantCount,
        };

        console.log("🔄 Calling Revalidate API automatically on page load:", {
          flightId: flightDetails.id,
          passengerCounts,
          estimated: flightDetails.estimated,
        });

        // Mark as called to prevent duplicate calls
        revalidateCalledRef.current = {
          called: true,
          flightId: flightDetails.id,
        };

        // Get Sabre token first
        const tokenResponse = await fetch("/api/flights/sabre-token", {
          method: "GET",
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenData.success) {
          console.error("❌ Failed to get Sabre token:", tokenData);
          return;
        }

        const sabreToken = tokenData.token;
        
        // Get PCC from API (server-side only)
        const pccResponse = await fetch("/api/flights/sabre-pcc", {
          method: "GET",
        });

        let pcc = "";
        if (pccResponse.ok) {
          const pccData = await pccResponse.json();
          pcc = pccData.pcc || "";
        }

        if (!pcc) {
          console.error("❌ Failed to get PCC");
          return;
        }

        // Use default Sabre CERT environment URL (can be overridden with NEXT_PUBLIC_SABRE_BASE_URL)
        const sabreBaseUrl = process.env.NEXT_PUBLIC_SABRE_BASE_URL || "https://api.cert.platform.sabre.com";
        const sabreRevalidateUrl = `${sabreBaseUrl}/v5/shop/flights/revalidate`;
        
        console.log("🚀 Calling Sabre Revalidate API directly:", {
          url: sabreRevalidateUrl,
          pcc: pcc,
        });

        // Build revalidate payload
        // CRITICAL: Payload must be built STRICTLY from selected BFM itinerary
        // Do NOT modify dates, airlines, flight numbers, class, or segments from BFM
        let revalidatePayload;
        try {
          revalidatePayload = buildRevalidatePayload(flightDetails, passengerCounts, pcc);
          
          // Log payload validation for debugging
          if (process.env.NODE_ENV === 'development') {
            console.log("✅ Revalidate payload built from BFM:", {
              slices: flightDetails.slices?.length || 0,
              totalSegments: flightDetails.slices?.reduce((sum, slice) => sum + (slice.segments?.length || 0), 0) || 0,
              payloadSlices: revalidatePayload.OTA_AirLowFareSearchRQ.OriginDestinationInformation?.length || 0,
              payloadSegments: revalidatePayload.OTA_AirLowFareSearchRQ.OriginDestinationInformation?.reduce(
                (sum, odi) => sum + (odi.TPA_Extensions?.Flight?.length || 0), 0
              ) || 0,
            });
          }
        } catch (payloadError) {
          // If payload building fails, log and keep estimated price
          console.error("❌ Failed to build revalidate payload from BFM:", payloadError.message);
          console.log("ℹ️ Keeping estimated price - cannot revalidate without valid BFM data");
          return; // Gracefully fallback to BFM estimated price
        }

        // Call Sabre revalidate API directly
        const response = await fetch(sabreRevalidateUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sabreToken}`,
          },
          body: JSON.stringify(revalidatePayload),
        });

        const revalidateResponse = await response.json();

        // ============================================
        // HANDLE SABRE REVALIDATE ERRORS
        // ============================================
        // Check for business rule failures (not system errors)
        // "NO COMBINABLE FARES FOR CLASS USED" is a business rule, not a system error
        // ============================================
        if (!response.ok) {
          // Check for specific business rule errors
          const errorMessage = revalidateResponse?.message || 
                              revalidateResponse?.error?.message || 
                              revalidateResponse?.OTA_AirLowFareSearchRS?.Errors?.Error?.ShortText ||
                              JSON.stringify(revalidateResponse);
          
          // Check for business rule / availability errors (not system errors)
          const isFareCombinabilityError = errorMessage?.includes("NO COMBINABLE FARES FOR CLASS USED") ||
                                          errorMessage?.includes("NO COMBINABLE FARES") ||
                                          errorMessage?.includes("COMBINABLE FARES");
          
          const isJourneyBuildError = errorMessage?.includes("NO COMBINABLE SCHEDULES RETURNED") ||
                                     errorMessage?.includes("No complete journey can be built") ||
                                     errorMessage?.includes("COMBINABLE SCHEDULES") ||
                                     errorMessage?.includes("journey can be built") ||
                                     errorMessage?.includes("journey build");
          
          if (isFareCombinabilityError || isJourneyBuildError) {
            // These are availability/business rule failures, not system errors
            // Keep estimated price and show user-friendly message
            const errorType = isFareCombinabilityError ? "fare combinability" : "journey build";
            console.warn(`⚠️ ${errorType} error (availability issue):`, errorMessage);
            console.log(`ℹ️ Keeping estimated price - ${errorType} is an availability issue, not a system error`);
            
            // Show user-friendly message (optional - can be displayed in UI)
            // For now, just log and keep estimated price
            return;
          }
          
          // For other errors, log and return
          console.error("❌ Sabre Revalidate API failed:", revalidateResponse);
          return;
        }

        // Check for errors in successful response (Sabre can return 200 with errors)
        const sabreErrors = revalidateResponse?.OTA_AirLowFareSearchRS?.Errors;
        if (sabreErrors) {
          const errors = sabreErrors.Error || [];
          const errorArray = Array.isArray(errors) ? errors : [errors];
          
          // Check for business rule / availability errors in response
          const fareCombinabilityError = errorArray.find(err => 
            err.ShortText?.includes("NO COMBINABLE FARES FOR CLASS USED") ||
            err.Message?.includes("NO COMBINABLE FARES FOR CLASS USED") ||
            err.ShortText?.includes("NO COMBINABLE FARES") ||
            err.Message?.includes("NO COMBINABLE FARES")
          );
          
          const journeyBuildError = errorArray.find(err => 
            err.ShortText?.includes("NO COMBINABLE SCHEDULES RETURNED") ||
            err.Message?.includes("NO COMBINABLE SCHEDULES RETURNED") ||
            err.ShortText?.includes("No complete journey can be built") ||
            err.Message?.includes("No complete journey can be built") ||
            err.ShortText?.includes("COMBINABLE SCHEDULES") ||
            err.Message?.includes("COMBINABLE SCHEDULES") ||
            err.ShortText?.includes("journey can be built") ||
            err.Message?.includes("journey can be built") ||
            err.ShortText?.includes("journey build") ||
            err.Message?.includes("journey build")
          );
          
          if (fareCombinabilityError || journeyBuildError) {
            // These are availability/business rule failures, not system errors
            // Keep estimated price - do not return 500
            const error = fareCombinabilityError || journeyBuildError;
            const errorType = fareCombinabilityError ? "fare combinability" : "journey build";
            console.warn(`⚠️ ${errorType} error in response (availability issue):`, error);
            console.log(`ℹ️ Keeping estimated price - ${errorType} is an availability issue, not a system error`);
            return;
          }
          
          // Other errors - log and return
          console.error("❌ Sabre Revalidate returned errors:", errorArray);
          return;
        }

        // ============================================
        // EXTRACT FINAL PRICING FROM REVALIDATE RESPONSE
        // ============================================
        // Use groupedItineraryResponse structure
        // Prefer pricingInformation where revalidated === true
        // If multiple pricingInformation exist, use the FIRST revalidated one
        // 
        // CRITICAL: Always read currency from pricingInformation.fare.totalFare.currency
        // Do NOT assume EUR or any currency
        // If currency is RON, show RON explicitly
        // Do not auto-convert unless conversion logic exists
        // ============================================
        let totalAmount = flightDetails.total_amount; // Fallback to BFM estimated price
        let currency = null; // Do NOT assume currency - must come from revalidate response
        let baseAmount = flightDetails.base_amount || totalAmount;
        let taxAmount = flightDetails.tax_amount || "0";
        let passengerPricing = flightDetails.passenger_pricing || {};
        let taxBreakdown = flightDetails.tax_breakdown || [];
        
        // Try groupedItineraryResponse structure first (new format)
        const groupedItineraryResponse = revalidateResponse?.groupedItineraryResponse;
        if (groupedItineraryResponse?.itineraryGroups?.[0]?.itineraries?.[0]) {
          const itinerary = groupedItineraryResponse.itineraryGroups[0].itineraries[0];
          const pricingInformationArray = itinerary.pricingInformation || [];
          const pricingInfoArray = Array.isArray(pricingInformationArray) ? pricingInformationArray : [pricingInformationArray];
          
          // Find FIRST pricingInformation where revalidated === true
          const revalidatedPricing = pricingInfoArray.find(p => p.revalidated === true);
          
          if (revalidatedPricing?.fare?.totalFare) {
            const totalFare = revalidatedPricing.fare.totalFare;
            
            // Map final price from revalidated pricing
            // Always read currency from pricingInformation.fare.totalFare.currency
            totalAmount = totalFare.totalPrice?.toString() || totalAmount;
            currency = totalFare.currency || null; // Do NOT fallback - currency must come from response
            
            // Optional: Base fare and taxes if available
            if (totalFare.baseFareAmount !== undefined) {
              baseAmount = totalFare.baseFareAmount.toString();
            }
            if (totalFare.totalTaxAmount !== undefined) {
              taxAmount = totalFare.totalTaxAmount.toString();
            }
            
            console.log("✅ Using revalidated pricing from groupedItineraryResponse:", {
              totalPrice: totalAmount,
              currency: currency,
              baseFareAmount: baseAmount,
              totalTaxAmount: taxAmount,
            });
          } else {
            // Fallback: Use first pricingInformation if no revalidated one found
            const firstPricing = pricingInfoArray[0];
            if (firstPricing?.fare?.totalFare) {
              const totalFare = firstPricing.fare.totalFare;
              totalAmount = totalFare.totalPrice?.toString() || totalAmount;
              currency = totalFare.currency || null; // Do NOT fallback - currency must come from response
              
              if (totalFare.baseFareAmount !== undefined) {
                baseAmount = totalFare.baseFareAmount.toString();
              }
              if (totalFare.totalTaxAmount !== undefined) {
                taxAmount = totalFare.totalTaxAmount.toString();
              }
              
              console.warn("⚠️ No revalidated pricing found, using first pricingInformation:", {
                totalPrice: totalAmount,
                currency: currency,
              });
            } else {
              console.warn("⚠️ No valid pricingInformation in groupedItineraryResponse, keeping BFM estimated price");
            }
          }
        } else {
          // Fallback: Try OTA_AirLowFareSearchRS structure (old format)
          const pricedItinerary = revalidateResponse?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary;
          
          if (pricedItinerary) {
            const itineraryArray = Array.isArray(pricedItinerary) ? pricedItinerary : [pricedItinerary];
            if (itineraryArray.length > 0) {
              const firstItinerary = itineraryArray[0];
              const pricingInfo = firstItinerary.AirItineraryPricingInfo;
              const itinTotalFare = pricingInfo?.ItinTotalFare || {};
              
              const totalFare = itinTotalFare.TotalFare || {};
              totalAmount = totalFare.Amount?.toString() || totalAmount;
              // Always read currency from response - do NOT assume or fallback
              if (totalFare.CurrencyCode) {
                currency = totalFare.CurrencyCode;
              }
              
              const baseFare = itinTotalFare.BaseFare || {};
              baseAmount = baseFare.Amount?.toString() || baseAmount;
              
              // Extract taxes
              if (itinTotalFare.Taxes) {
                const taxes = itinTotalFare.Taxes.Tax || [];
                const taxArray = Array.isArray(taxes) ? taxes : [taxes];
                taxAmount = taxArray.reduce((sum, tax) => {
                  return sum + parseFloat(tax.Amount || 0);
                }, 0).toFixed(2);
              }
              
              // Extract passenger pricing
              // Use currency from response - do NOT assume or fallback
              const ptcFareBreakdowns = pricingInfo?.PTC_FareBreakdowns?.PTC_FareBreakdown || [];
              const fareBreakdownArray = Array.isArray(ptcFareBreakdowns) ? ptcFareBreakdowns : [ptcFareBreakdowns];
              
              fareBreakdownArray.forEach((breakdown) => {
                if (!breakdown) return;
                
                const passengerType = breakdown.PassengerTypeQuantity?.Code || "";
                const quantity = parseInt(breakdown.PassengerTypeQuantity?.Quantity || "0", 10);
                
                if (!passengerType || quantity === 0) return;
                
                const passengerTotalFare = breakdown.PassengerFare?.TotalFare || {};
                const passengerBaseFare = breakdown.PassengerFare?.BaseFare || {};
                const passengerTaxes = breakdown.PassengerFare?.Taxes || {};
                
                let passengerTaxAmount = "0";
                if (passengerTaxes.Tax) {
                  const passengerTaxArray = Array.isArray(passengerTaxes.Tax) ? passengerTaxes.Tax : [passengerTaxes.Tax];
                  passengerTaxAmount = passengerTaxArray.reduce((sum, tax) => {
                    return sum + parseFloat(tax.Amount || 0);
                  }, 0).toFixed(2);
                }
                
                // Use currency from passenger fare, or fallback to main currency from response
                const passengerCurrency = passengerTotalFare.CurrencyCode || currency;
                
                passengerPricing[passengerType] = {
                  quantity: quantity,
                  totalFare: passengerTotalFare.Amount || "0",
                  baseFare: passengerBaseFare.Amount || "0",
                  taxes: passengerTaxAmount,
                  currency: passengerCurrency, // From response, not assumed
                  perPassenger: {
                    totalFare: quantity > 0 ? (parseFloat(passengerTotalFare.Amount || 0) / quantity).toFixed(2) : "0",
                    baseFare: quantity > 0 ? (parseFloat(passengerBaseFare.Amount || 0) / quantity).toFixed(2) : "0",
                    taxes: quantity > 0 ? (parseFloat(passengerTaxAmount) / quantity).toFixed(2) : "0",
                  },
                };
              });
              
              // Extract tax breakdown
              // Use currency from response - do NOT assume
              if (itinTotalFare.Taxes) {
                const taxes = itinTotalFare.Taxes.Tax || [];
                const taxArray = Array.isArray(taxes) ? taxes : [taxes];
                taxBreakdown = taxArray.map(tax => ({
                  code: tax.TaxCode || tax.Code || "",
                  amount: tax.Amount || "0",
                  currency: tax.CurrencyCode || currency, // From response, not assumed
                  description: tax.TaxName || tax.Description || "",
                }));
              }
              
              console.log("✅ Using pricing from OTA_AirLowFareSearchRS (fallback):", {
                totalAmount: totalAmount,
                currency: currency,
              });
            }
          } else {
            console.warn("⚠️ No pricing found in revalidate response, keeping BFM estimated price");
          }
        }

        // ============================================
        // UPDATE FLIGHT DETAILS WITH FINAL PRICING
        // ============================================
        // Replace Estimated Price with Final Price from revalidate response
        // Keep UI unchanged - only update pricing values
        // Origin, destination, segments, timing remain from BFM (no remap)
        // 
        // CRITICAL: Currency must come from revalidate response
        // Always read currency from pricingInformation.fare.totalFare.currency
        // If currency is RON, show RON explicitly
        // Do not auto-convert unless conversion logic exists
        // ============================================
        
        // Validate currency was extracted from revalidate response
        // If missing, fallback to BFM currency but log warning
        if (!currency) {
          console.warn("⚠️ No currency found in revalidate response, using BFM currency as fallback");
          currency = flightDetails.total_currency || "USD"; // Fallback only if response currency missing
        }
        
        const updatedFlight = {
          ...flightDetails,
          // Update pricing fields only - replace estimated with final
          total_amount: totalAmount.toString(),
          total_currency: currency, // Always from revalidate response (RON, EUR, USD, etc.)
          base_amount: baseAmount.toString(),
          tax_amount: taxAmount.toString(),
          passenger_pricing: passengerPricing,
          tax_breakdown: taxBreakdown,
          // Mark as final pricing (replaces estimated)
          estimated: false,
          _pricingType: 'final',
          _pricingSource: 'revalidate',
          _pricedAt: new Date().toISOString(),
        };
        
        // Log price update for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log("💰 Price update - Estimated → Final:", {
            estimated: flightDetails.total_amount,
            estimatedCurrency: flightDetails.total_currency,
            final: totalAmount,
            finalCurrency: currency,
            source: 'revalidate',
            note: currency === 'RON' ? 'RON currency explicitly shown' : `Currency: ${currency}`,
          });
        }

        // Update state - this will update the right-side pricing card
        setFlightDetails(updatedFlight);

        // Update localStorage to persist final pricing
        localStorage.setItem("flight_selected", JSON.stringify(updatedFlight));

        // Store revalidate response for GetSeats API
        setRevalidateResponse(revalidateResponse);

        console.log("✅ Revalidate API success - Final pricing updated:", {
          flightId: updatedFlight.id,
          total_amount: updatedFlight.total_amount,
          total_currency: updatedFlight.total_currency,
          estimated: updatedFlight.estimated,
        });
      } catch (error) {
        console.error("❌ Error calling revalidate API:", error);
        // Gracefully fallback to BFM estimated price - do not break UI
        // Revalidate failures are handled gracefully - user can still proceed with estimated pricing
        console.log("ℹ️ Falling back to BFM estimated price - revalidate failed but UI remains functional");
        // Don't block the UI if revalidate fails - show estimated pricing
        // UI continues showing origin, destination, segments, and cards exactly as before
      }
    };

    callRevalidate();
  }, [flightDetails, router.isReady, router.query.adult, router.query.adults, router.query.child, router.query.infant]);

  // Update refs when state changes
  useEffect(() => {
    passengersInfoRef.current = passengersInfo;
    contactRef.current = contact;
  }, [passengersInfo, contact]);

  // Save data when user leaves the page (page unload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      const flightId = router.query.id;

      if (flightId && passengersInfoRef.current.length > 0) {
        saveFlightFormData(passengersInfoRef.current, flightId);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [router.query.id]); // Only depend on router.query.id

  const passengersInfoChange = (value, option, index) => {
    const oldData = [...passengersInfo];
    oldData[index][option] = value;

    // If this is the main passenger (index 0), also update contact info
    if (
      index === 0 &&
      (option === "email" || option === "phoneNumber" || option === "dialCode")
    ) {
      setContact((prev) => ({
        ...prev,
        [option]: value,
      }));
    }

    setPassengersInfo(oldData);

    // Save to localStorage
    if (router.query.id) {
      saveFlightFormData(oldData, router.query.id);
    }
  };

  const handleContactChange = (field, value) => {
    const newContact = { ...contact, [field]: value };
    setContact(newContact);

    // Also update the main passenger's contact info
    const updatedPassengers = [...passengersInfo];
    if (updatedPassengers[0]) {
      updatedPassengers[0] = { ...updatedPassengers[0], [field]: value };
      setPassengersInfo(updatedPassengers);
    }

    // Save to localStorage
    if (router.query.id) {
      saveFlightFormData(updatedPassengers, router.query.id);
    }
  };

  const checkValidationFunction = () => {
    let isValid = true;
    const errors = [];

    if (!contact.email) {
      errors.push("Email missing");
      isValid = false;
    }
    if (!contact.phoneNumber) {
      errors.push("Phone missing");
      isValid = false;
    }
    if (!contact.dialCode) {
      errors.push("Dial code missing");
      isValid = false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      errors.push("Invalid email format");
      isValid = false;
    }

    // Validate phone number format
    const phoneRegex = /^\d+$/;
    if (!phoneRegex.test(contact.phoneNumber)) {
      errors.push("Invalid phone format");
      isValid = false;
    }

    passengersInfo.forEach((passenger, index) => {
      if (!passenger.firstName) {
        errors.push(`Passenger ${index + 1}: First name missing`);
        isValid = false;
      }
      if (!passenger.lastName) {
        errors.push(`Passenger ${index + 1}: Last name missing`);
        isValid = false;
      }
      if (!passenger.dateOfBirth) {
        errors.push(`Passenger ${index + 1}: Date of birth missing`);
        isValid = false;
      }
      if (!passenger.gender) {
        errors.push(`Passenger ${index + 1}: Gender missing`);
        isValid = false;
      }
      if (!passenger.cityzenShip) {
        errors.push(`Passenger ${index + 1}: Citizenship missing`);
        isValid = false;
      }
      if (!passenger.passport) {
        errors.push(`Passenger ${index + 1}: Passport missing`);
        isValid = false;
      }
      if (!passenger.passportExpiryDate) {
        errors.push(`Passenger ${index + 1}: Passport expiry missing`);
        isValid = false;
      }
    });

    if (errors.length > 0) {
    }

    return isValid;
  };

  // Helper function to format date for Duffel API
  const formatDateForDuffel = (dateString) => {
    if (!dateString || dateString === "") return null;

    // Handle current format (e.g., "2003-2-3" or "2003-02-03")
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1].padStart(2, "0");
      const day = parts[2].padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      return formattedDate;
    }

    return null;
  };

  const handleBook = async () => {
    const checkValidation = checkValidationFunction();
    if (!checkValidation) {
      setValidationError(true);
      return;
    }
    setValidationError(false);

    // Check if user is authenticated
    if (!checkAuthentication()) {
      setShowAuthModal(true);
      return;
    }

    proceedWithBooking();
  };

  // New function to handle the booking process after authentication
  const proceedWithBooking = async () => {
    try {
      setLoading(true);
      
      // Save passenger data to localStorage (single key, overwrite to update)
      const passengerData = {
        passengersInfo: passengersInfo,
        contact: contact,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("passenger_data", JSON.stringify(passengerData));

      // Create Sabre NDC Order before showing modal
      const flightId = flightDetails?.id || 
                     flightDetails?.offer_id || 
                     router.query?.id || 
                     `flight_${Date.now()}`;
      
      // Check if order already exists
      let sabreOrderId = localStorage.getItem(`sabre_order_${flightId}`);
      
      if (!sabreOrderId) {
        console.log("📦 Creating Sabre NDC Order on form submission...");
        
        try {
          // Build Orders/Create payload
          const orderPayload = buildOrdersCreatePayload(
            flightDetails,
            passengersInfo,
            contact
          );

          console.log("📤 Sending Orders/Create request:", {
            offerId: orderPayload.createOrders?.[0]?.offerId,
            offerItemId: orderPayload.createOrders?.[0]?.selectedOfferItems?.[0]?.id,
            passengersCount: orderPayload.passengers?.length || 0,
          });

          // Call Orders/Create API
          const orderResponse = await fetch("/api/sabre/orders/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderPayload),
          });

          const orderData = await orderResponse.json();

          if (!orderResponse.ok || !orderData.success) {
            console.error("❌ Failed to create NDC Order:", orderData);
            showWarningToast("Could not create order. Continuing without order ID.");
            // Continue without blocking
          } else {
            // Extract order ID
            sabreOrderId = orderData.orderID || orderData.sabreOrderID;
            
            if (sabreOrderId) {
              console.log("✅ Sabre NDC Order created:", {
                orderId: sabreOrderId,
                recordLocator: orderData.recordLocator,
              });

              // Store order ID for ancillaries
              localStorage.setItem(`sabre_order_${flightId}`, sabreOrderId);
              showSuccessToast("Order created successfully!");
            } else {
              console.warn("⚠️ No order ID in response");
            }
          }
        } catch (orderError) {
          console.error("❌ Error creating NDC Order:", orderError);
          console.warn("⚠️ Continuing without order ID");
          showWarningToast("Could not create order. Continuing...");
          // Don't block the user - continue to modal
        }
      } else {
        console.log("✅ Using existing Sabre Order ID:", sabreOrderId);
      }

      // Open the View Data modal after order is created
      setShowViewDataModal(true);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error in proceedWithBooking:", error);
      showErrorToast(error.message || "Failed to proceed with booking.");
      setLoading(false);
    }
  };

  // Create Duffel hold order (type: hold)
  const handleCreateHoldOrder = async () => {
    const offerId =
      selectedOffer || router.query.selectedOffer || router.query.id;
    if (!offerId) throw new Error("Missing selected offer id");

    // CRITICAL: Validate that flightDetails matches the current offerId
    // Passenger IDs are ONLY valid for the offer they came from
    const storedOfferId = flightDetails?.id || flightDetails?.offer_id;
    let offerPassengers = flightDetails?.passengers || [];
    let currentOfferData = flightDetails;

    // If offer IDs don't match OR we don't have passenger data, fetch fresh offer
    if (
      (storedOfferId && storedOfferId !== offerId) ||
      !offerPassengers ||
      offerPassengers.length === 0
    ) {
      console.warn(
        `Offer ID mismatch or missing passenger data. ` +
          `Stored: ${storedOfferId}, Current: ${offerId}. ` +
          `Fetching fresh offer data from Duffel API...`
      );

      try {
        // Fetch fresh offer from Duffel API via cors-proxy
        // CRITICAL: Use Duffel-Version v1 for offers endpoint
        const offerResponse = await fetch("/api/cors-proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: `https://api.duffel.com/air/offers/${offerId}`,
            method: "GET",
            headers: {
              "Duffel-Version": "v1", // Use v1 for offers endpoint
            },
          }),
        });

        if (!offerResponse.ok) {
          throw new Error(
            `Failed to fetch offer ${offerId} from Duffel API. Status: ${offerResponse.status}`
          );
        }

        const offerData = await offerResponse.json();

        // Handle different response structures
        if (offerData.data) {
          currentOfferData = offerData.data;
          offerPassengers = offerData.data.passengers || [];
        } else if (offerData.passengers) {
          offerPassengers = offerData.passengers;
        } else {
          throw new Error(
            "Unexpected offer response structure from Duffel API"
          );
        }

        console.log(
          `Successfully fetched fresh offer ${offerId} with ${offerPassengers.length} passenger(s)`
        );
      } catch (fetchError) {
        console.error("Error fetching fresh offer:", fetchError);
        throw new Error(
          `Could not fetch offer ${offerId} from Duffel API. ` +
            `Passenger IDs must come from the exact same offer. ` +
            `Error: ${fetchError.message}`
        );
      }
    }

    // CRITICAL: Get passenger IDs from the selected offer
    // These MUST be the exact IDs from the offer response - Duffel validates this strictly
    // Passenger IDs from one offer CANNOT be used with a different offer

    // Final validation: Ensure we have passenger data
    if (!offerPassengers || offerPassengers.length === 0) {
      throw new Error(
        `No passenger data found in offer ${offerId}. ` +
          `Please ensure the offer contains passenger information. ` +
          `Passenger IDs must come from the exact same offer you're booking.`
      );
    }

    // Additional validation: Ensure passenger IDs look valid (start with "pas_")
    const invalidPassengerIds = offerPassengers.filter(
      (p) => !p.id || !p.id.startsWith("pas_")
    );
    if (invalidPassengerIds.length > 0) {
      throw new Error(
        `Invalid passenger IDs found in offer. All passenger IDs must start with "pas_" and come from the Duffel API. ` +
          `Invalid IDs: ${invalidPassengerIds.map((p) => p.id).join(", ")}`
      );
    }

    // Create a map of passenger IDs by type for accurate matching
    // Store the full passenger object to preserve the exact ID from offer
    const passengerIdMap = {};
    const passengerObjectsByType = {};

    offerPassengers.forEach((offerPassenger) => {
      const type = offerPassenger.type || "adult";
      if (!passengerIdMap[type]) {
        passengerIdMap[type] = [];
        passengerObjectsByType[type] = [];
      }
      passengerIdMap[type].push(offerPassenger.id);
      passengerObjectsByType[type].push(offerPassenger);
    });

    // Validate that we have adult passengers (required for infants)
    const adultIds = passengerIdMap.adult || [];
    if (adultIds.length === 0) {
      throw new Error("Offer must contain at least one adult passenger");
    }

    // Map UI passengers -> Duffel passenger schema (exact format required)
    // IMPORTANT: Process passengers in order: adults first, then children, then infants
    // This ensures that when infants reference adults via associated_adult_id,
    // the adult passengers already exist in the array (Duffel API requirement)

    // Separate passengers by type
    const adults = passengersInfo.filter((p) => p.type === "adult");
    const children = passengersInfo.filter((p) => p.type === "child");
    const infants = passengersInfo.filter(
      (p) => p.type === "infant" || p.type === "infant_without_seat"
    );

    const typeCounters = { adult: 0, child: 0, infant_without_seat: 0 };
    const adultPassengerIds = []; // Track adult passenger IDs for infant association (from offer)
    const duffelPassengers = [];

    // Helper function to build passenger object
    // CRITICAL: passengerId must be the exact ID from the offer response
    const buildPassengerObj = (p, passengerId, passengerType) => {
      const givenName = p.firstName || "";
      const familyName = p.lastName || "";

      const passengerObj = {
        id: passengerId, // Must be exact ID from offer
        type: passengerType,
      };

      // Add associated_adult_id for infant_without_seat passengers
      // CRITICAL: This MUST reference an adult passenger ID that exists in the offer
      if (passengerType === "infant_without_seat") {
        if (adultPassengerIds.length === 0) {
          throw new Error(
            "Cannot create infant passenger: No adult passengers found in offer to associate with"
          );
        }
        // Link infant to the first adult, or cycle through adults if there are multiple infants
        const infantIndex = typeCounters.infant_without_seat;
        const adultIndex = Math.min(infantIndex, adultPassengerIds.length - 1);
        const associatedAdultId = adultPassengerIds[adultIndex];

        // Validate that the associated adult ID exists in the offer's adult passengers
        // This ensures Duffel API validation will pass
        const adultExistsInOffer = adultIds.includes(associatedAdultId);
        if (!adultExistsInOffer) {
          throw new Error(
            `Invalid associated_adult_id "${associatedAdultId}" for infant. This ID must match an adult passenger ID from the offer. Available adult IDs from offer: ${adultIds.join(
              ", "
            )}`
          );
        }

        passengerObj.associated_adult_id = associatedAdultId;
      }

      // Add common fields
      passengerObj.title = (p.gender || "mr").toLowerCase();
      passengerObj.gender = (p.gender || "m").toLowerCase().startsWith("f")
        ? "f"
        : "m";
      passengerObj.given_name = givenName;
      passengerObj.family_name = familyName;
      passengerObj.born_on = formatDateForDuffel(p.dateOfBirth) || "1990-01-01";

      // Add email and phone_number for all passengers (including infants)
      passengerObj.email = contact.email || "";
      passengerObj.phone_number = `${contact.dialCode || ""}${
        contact.phoneNumber || ""
      }`;

      return passengerObj;
    };

    // Process adults first
    // CRITICAL: Use exact passenger IDs from offer - no fallbacks or temp IDs
    // Duffel validates that passenger IDs match the offer exactly
    if (adults.length > (passengerIdMap.adult?.length || 0)) {
      throw new Error(
        `Mismatch: Found ${adults.length} adult(s) in form but only ${
          passengerIdMap.adult?.length || 0
        } adult passenger(s) in offer`
      );
    }
    adults.forEach((p, idx) => {
      const passengerId = passengerIdMap.adult?.[idx];
      if (!passengerId) {
        throw new Error(
          `Missing adult passenger ID at index ${idx} from offer. Offer passenger IDs must match exactly.`
        );
      }
      typeCounters.adult = (typeCounters.adult || 0) + 1;
      adultPassengerIds.push(passengerId);
      duffelPassengers.push(buildPassengerObj(p, passengerId, "adult"));
    });

    // Process children second
    // CRITICAL: Use exact passenger IDs from offer
    if (children.length > (passengerIdMap.child?.length || 0)) {
      throw new Error(
        `Mismatch: Found ${children.length} child(ren) in form but only ${
          passengerIdMap.child?.length || 0
        } child passenger(s) in offer`
      );
    }
    children.forEach((p, idx) => {
      const passengerId = passengerIdMap.child?.[idx];
      if (!passengerId) {
        throw new Error(
          `Missing child passenger ID at index ${idx} from offer. Offer passenger IDs must match exactly.`
        );
      }
      typeCounters.child = (typeCounters.child || 0) + 1;
      duffelPassengers.push(buildPassengerObj(p, passengerId, "child"));
    });

    // Process infants last (they can now reference adults that are already in the array)
    // CRITICAL: Use exact passenger IDs from offer and ensure associated_adult_id matches an adult ID from offer
    if (infants.length > (passengerIdMap.infant_without_seat?.length || 0)) {
      throw new Error(
        `Mismatch: Found ${infants.length} infant(s) in form but only ${
          passengerIdMap.infant_without_seat?.length || 0
        } infant passenger(s) in offer`
      );
    }
    infants.forEach((p, idx) => {
      const passengerId = passengerIdMap.infant_without_seat?.[idx];
      if (!passengerId) {
        throw new Error(
          `Missing infant passenger ID at index ${idx} from offer. Offer passenger IDs must match exactly.`
        );
      }
      typeCounters.infant_without_seat =
        (typeCounters.infant_without_seat || 0) + 1;
      duffelPassengers.push(
        buildPassengerObj(p, passengerId, "infant_without_seat")
      );
    });

    // Final validation: Ensure all passenger IDs are from the offer
    // Log for debugging
    console.log("Creating hold order with:", {
      offerId,
      passengerCount: duffelPassengers.length,
      passengerIds: duffelPassengers.map((p) => ({
        id: p.id,
        type: p.type,
        associated_adult_id: p.associated_adult_id,
      })),
      offerPassengerIds: offerPassengers.map((p) => ({
        id: p.id,
        type: p.type,
      })),
    });

    const payload = {
      data: {
        type: "hold",
        selected_offers: [offerId],
        passengers: duffelPassengers,
      },
    };

    const resp = await fetch("/api/flights/hold-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) {
      console.error("Hold order error response:", data);
      // Return error data instead of throwing so we can handle it in proceedToPayment
      return { error: true, data };
    }

    return data;
  };

  // Build payload for backend bookings API
  const buildBookingPayload = () => {
    const mapDate = (isoDate) => {
      if (!isoDate) return null;
      const [yearStr, monthStr, dayStr] = isoDate.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);
      if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
        return null;
      }
      return { day, month, year };
    };

    const passengers = passengersInfo.map((p) => ({
      title: p.gender?.toLowerCase().startsWith("f") ? "Ms" : "Mr",
      firstName: p.firstName || "",
      lastName: p.lastName || "",
      dateOfBirth: mapDate(p.dateOfBirth),
      countryOfResidence: p.cityzenShip || "",
      passportNumber: p.passport || "",
      passportExpiry: mapDate(p.passportExpiryDate),
    }));

    // Get authenticated user data
    const userData = tokenUtils.getUserData();

    // Get full name from first passenger (main passenger) or authenticated user
    const fullName = passengersInfo[0]
      ? `${passengersInfo[0].firstName || ""} ${
          passengersInfo[0].lastName || ""
        }`.trim()
      : userData?.name || "";

    return {
      email: userData?.email || contact.email || "",
      fullName: fullName,
      phone: {
        dialingCode: contact.dialCode || "",
        number: contact.phoneNumber || "",
      },
      passengers,
      notes: {
        type: "hold",
        text: "",
      },
      flightData: flightDetails || {},
      extraServices: {},
      userId: userData?.id || null, // Include user ID if available
    };
  };

  // Call backend bookings API to create booking
  const createBackendBooking = async (payload) => {
    const resp = await fetch(`${BACKEND_API_URL}/api/bookings`, {
      method: "POST",
      headers: { ...getHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      const message =
        data?.message || data?.error || "Failed to create booking";
      throw new Error(message);
    }
    return data;
  };

  // Modal handlers
  const closeViewDataModal = () => {
    setShowViewDataModal(false);
    setLoading(false);
  };

  const proceedToPayment = async () => {
    try {
      setLoading(true);
      showInfoToast("Processing your booking...");

      // Step 1: Create hold order first (validate offer availability)
      const holdOrderResult = await handleCreateHoldOrder();

      // Check if hold order returned an error
      if (holdOrderResult?.error) {
        const errorData = holdOrderResult.data;
        setLoading(false);

        // Check for specific error codes
        const errors = errorData?.error?.errors || errorData?.errors || [];
        const bornOnMismatchError = errors.find(
          (err) => err.code === "born_on_does_not_match"
        );

        if (bornOnMismatchError) {
          // Show the error message from API in a toast
          showErrorToast(
            errorData?.message ||
              bornOnMismatchError?.message ||
              "Passenger type does not match date of birth. Please check the passenger details."
          );
          setError(
            errorData?.message || "Passenger type does not match date of birth"
          );
          return;
        }

        // Handle price change errors
        const hasPriceChanged = errors.some(
          (err) => err.code === "price_changed"
        );

        if (hasPriceChanged) {
          showWarningToast(
            "Flight price has changed. Please search again for updated pricing."
          );
          setError("Flight price has changed");
          return;
        }

        // Handle offer no longer available
        if (
          errorData?.message?.includes("no longer available") ||
          errorData?.message?.includes("retrieve the offer again")
        ) {
          showWarningToast(
            "This flight is no longer available. Please select another option."
          );
          setError("Flight no longer available");
          return;
        }

        // Handle general API errors
        showErrorToast(
          errorData?.message || "Failed to create hold order. Please try again."
        );
        setError(errorData?.message || "Failed to create hold order");
        return;
      }

      // Step 2: Create backend booking (only after hold order succeeds)
      const bookingPayload = buildBookingPayload();
      await createBackendBooking(bookingPayload);

      setShowViewDataModal(false);
      setLoading(false);
      showSuccessToast("Booking created successfully!");

      // Step 3: Navigate to next page
      const { id } = router.query;
      if (id) {
        router.push(`/flight/extraService?id=${id}`);
      }
    } catch (err) {
      console.error("Booking creation failed:", err);
      setLoading(false);

      // Handle specific API errors
      if (err?.response?.data) {
        const errorData = err.response.data;

        // Handle price change errors
        const hasPriceChanged =
          errorData.error?.errors?.some(
            (err) => err.code === "price_changed"
          ) || errorData.errors?.some((err) => err.code === "price_changed");

        if (hasPriceChanged) {
          showWarningToast(
            "Flight price has changed. Please search again for updated pricing."
          );
        }
        // Handle offer no longer available
        else if (
          errorData.message?.includes("no longer available") ||
          errorData.message?.includes("retrieve the offer again")
        ) {
          showWarningToast(
            "This flight is no longer available. Please select another option."
          );
        }
        // Handle general API errors
        else {
          showErrorToast(
            errorData.message || "Booking failed. Please try again."
          );
        }
      } else {
        showErrorToast(err?.message || "Booking failed. Please try again.");
      }

      setError(err?.message || "Failed to create booking");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <Breadcrumbs
        steps={useMemo(
          () => getBreadcrumbSteps(router),
          [
            router,
            router.isReady,
            router.query.id,
            router.query.booking_id,
            router.query.adult || router.query.adults, // Support new 'adult' param with backward compatibility
            router.query.child,
            router.query.infant,
          ]
        )}
        currentStep="Passenger Details"
      />
      <FullContainer className="py-8 min-h-screen">
        <Container className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[55%] rounded-xl ">
            {/* Error Message Display */}
            {error && (
              <div
                id="error-message"
                className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">Flight Booking Error</h3>
                    <p className="text-sm mt-1">{error}</p>
                    {(error.includes("already been booked") ||
                      error.includes("no longer available") ||
                      error.includes("offer_no_longer_available") ||
                      error.includes("offer_request_already_booked") ||
                      error.includes("Can't book multiple offers")) && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-red-600">
                          {error.includes("offer_request_already_booked") ||
                          error.includes("Can't book multiple offers")
                            ? "This flight offer has already been booked or is no longer available. Please search for alternative flights."
                            : "This flight offer is no longer available. Please search for alternative flights."}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.back()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                          >
                            Search New Flights
                          </button>
                          <button
                            onClick={() => setError("")}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setError("")}
                    className="text-red-500 hover:text-red-700 text-xl font-bold ml-4"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <CheckoutForm
              flightDetails={flightDetails}
              passengersInfo={passengersInfo}
              countries={countries}
              contact={contact}
              validationError={validationError}
              passengersInfoChange={passengersInfoChange}
              handleContactChange={handleContactChange}
              handleBook={handleBook}
              loading={loading}
              setLoading={setLoading}
              error={error}
            />
          </div>

          {flightDetails && (
            <FlightDetailsSidebar
              flight={flightDetails}
              alwaysOpen
              isCheckout={true}
              className="w-full lg:w-[45%] sticky top-24"
            />
          )}
        </Container>
      </FullContainer>

      {/* View Data Modal */}
      <ViewDataModal
        isOpen={showViewDataModal}
        onClose={closeViewDataModal}
        onProceedToPayment={proceedToPayment}
        contact={contact}
        passengersInfo={passengersInfo}
        loading={loading}
        revalidateResponse={revalidateResponse}
        flightDetails={flightDetails}
        passengerCounts={{
          adults: parseInt(router.query.adult || router.query.adults || 1, 10),
          child: parseInt(router.query.child || 0, 10),
          infant: parseInt(router.query.infant || 0, 10),
        }}
      />

      {/* Authentication Modal */}
      {showAuthModal && (
        <ModernAuthForm
          setShowAuthModal={setShowAuthModal}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
