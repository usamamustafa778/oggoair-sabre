import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
// Removed axios and APILINK imports since we no longer make API calls
import AdditionalServiceCard from "./AdditionalServiceCard";
import ProtectionOptions from "./ProtectionOptions";
import SelfTransferInfo from "./SelfTransferInfo";
import UserEmailBox from "./UserEmailBox";
import BaggageSelection from "./BaggageSelection";
import AdditionalServicesSection from "./AdditionalServicesSection";
import ExtraServiceFooter from "./ExtraServiceFooter";
import ViewDataModal from "./ViewDataModal";
import {
  saveProtectionOption,
  loadProtectionOption,
} from "../../utils/protectionPersistence";
import SeatMapDisplay from "./SeatMapDisplay";

export default function ExtraServiceBody({
  bookingDetails,
  flightDetails,
  loading,
  error,
}) {
  const [selectedServices, setSelectedServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [selectedProtection, setSelectedProtection] = useState(null);
  const [selectedBaggage, setSelectedBaggage] = useState({});
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [showViewDataModal, setShowViewDataModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [seatMapsData, setSeatMapsData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState({});
  const router = useRouter();

  // Initialize selected protection from URL parameters or localStorage
  useEffect(() => {
    if (router.isReady) {
      if (router.query.protection) {
        setSelectedProtection(router.query.protection);
      } else if (bookingDetails?._id) {
        // Fallback to localStorage if not in URL
        const storedProtection = loadProtectionOption(bookingDetails._id);
        if (storedProtection) {
          setSelectedProtection(storedProtection);
        }
      }
    }
  }, [router.isReady, router.query.protection, bookingDetails?._id]);

  // Load seat maps from localStorage when component mounts or flight ID changes
  useEffect(() => {
    if (router.isReady && router.query.id) {
      const flightId = router.query.id;
      const seatMapStorageKey = `seatMaps_${flightId}`;
      
      try {
        const storedSeatMaps = localStorage.getItem(seatMapStorageKey);
        if (storedSeatMaps) {
          const parsedData = JSON.parse(storedSeatMaps);
          const seatMaps = parsedData.seatMaps || parsedData.fullResponse?.response?.seatMaps || parsedData.fullResponse?.seatMaps || [];
          
          console.log("✅ Loaded seat maps from localStorage:", {
            storageKey: seatMapStorageKey,
            seatMapsCount: Array.isArray(seatMaps) ? seatMaps.length : 0,
            seatMapsPath: parsedData.fullResponse?.response?.seatMaps ? 'response.response.seatMaps' : 
                         parsedData.fullResponse?.seatMaps ? 'response.seatMaps' : 
                         parsedData.seatMaps ? 'seatMaps' : 'not found',
            fullData: parsedData
          });
          
          setSeatMapsData(Array.isArray(seatMaps) && seatMaps.length > 0 ? seatMaps : null);
        } else {
          console.log("ℹ️ No seat maps found in localStorage for key:", seatMapStorageKey);
          setSeatMapsData(null);
        }
      } catch (error) {
        console.error("❌ Error loading seat maps from localStorage:", error);
        setSeatMapsData(null);
      }
    }
  }, [router.isReady, router.query.id]);

  const toggleServices = (service) => {
    if (selectedServices.includes(service)) {
      const newData = [...selectedServices].filter((ser) => ser !== service);
      setSelectedServices(newData);
    } else {
      const newData = [...selectedServices];
      newData.push(service);
      setSelectedServices(newData);
    }
  };

  const handleBaggageSelect = (baggageSelection) => {
    setSelectedBaggage(baggageSelection);
  };

  const handleInsuranceSelect = (insurance) => {
    setSelectedInsurance(insurance);
  };

  const handleSeatSelect = (seats) => {
    setSelectedSeats(seats);
    // Store selected seats in extra services data
    try {
      const flightId = flightDetails?.id || router.query.id;
      if (flightId) {
        localStorage.setItem(`selectedSeats_${flightId}`, JSON.stringify(seats));
      }
    } catch (error) {
      console.error("Error storing selected seats:", error);
    }
  };

  const closeViewDataModal = () => {
    setShowViewDataModal(false);
  };

  const proceedToReviewPay = () => {
    try {
      const keysToDelete = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.startsWith("extraServices_") || k.startsWith("fareOption_"))
        ) {
          keysToDelete.push(k);
        }
      }
      keysToDelete.forEach((k) => localStorage.removeItem(k));
    } catch {}

    // Store using a single stable key (no id) so the latest selection always applies
    const extraServicesData = {
      selectedServices,
      selectedProtection,
      selectedBaggage,
      selectedInsurance,
      selectedSeats: selectedSeats, // Include selected seats in extra services data
    };
    localStorage.setItem("extraServices", JSON.stringify(extraServicesData));

    // Navigate directly to Review and Pay page
    const flightId = flightDetails?.id || router.query.id;
    const protectionParam = selectedProtection
      ? `&protection=${selectedProtection}`
      : "";
    router.push(`/flight/reviewAndPay?id=${flightId}${protectionParam}`);
  };

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

  return (
    <>
      <div className="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-xl p-5 space-y-3 mb-6 text-primary-text">
        {/* User Information */}
        <UserEmailBox bookingDetails={bookingDetails} />

        {/* Additional Services Section */}
        <AdditionalServicesSection
          selectedInsurance={selectedInsurance}
          onInsuranceSelect={handleInsuranceSelect}
        />

        <SelfTransferInfo />
        <BaggageSelection
          selectedBaggage={selectedBaggage}
          onBaggageSelect={handleBaggageSelect}
        />

        {/* Seat Map Display */}
        <SeatMapDisplay seatMaps={seatMapsData} onSeatSelect={handleSeatSelect} />

        {allServices.length > 0 &&
          allServices.map((service, index) => (
            <AdditionalServiceCard
              key={service._id || index}
              service={service}
              selectedServices={selectedServices}
              toggleServices={toggleServices}
            />
          ))}

        {/* View Data Modal */}
        <ViewDataModal
          isOpen={showViewDataModal}
          onClose={closeViewDataModal}
          onProceedToPayment={proceedToReviewPay}
          bookingDetails={bookingDetails}
          contact={bookingDetails?.leadPassenger}
          passengersInfo={bookingDetails?.bookingDetails?.passengers}
          loading={modalLoading}
        />
      </div>

      <div className="w-full flex items-center justify-between mt-7">
        <button
          onClick={() => router.push("/flight/extraService")}
          className="bg-gray-200 text-primary-text px-6 py-4 rounded-lg font-semibold w-fit  disabled:bg-gray-400 min-w-[130px] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Back
        </button>
        <button
          onClick={proceedToReviewPay}
          disabled={modalLoading}
          className="bg-primary-text text-primary-green cursor-pointer active:scale-90 transition-all duration-200 px-6 py-4 rounded-lg font-semibold w-fit  disabled:bg-gray-400 min-w-[130px] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {modalLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
              Loading...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </>
  );
}
