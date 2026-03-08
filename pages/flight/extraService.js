import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Container from "@/components/common/Container";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { getBreadcrumbSteps } from "@/utils/breadcrumbUtils";
import FullContainer from "@/components/common/FullContainer";
import ExtraServiceBody from "@/components/ExtraService/ExtraServiceBody";
import FlightDetailsSidebar from "@/components/FlightSearch/FlightDetailsSidebar";
import { buildOrdersCreatePayload } from "@/utils/sabreRevalidate";
import toast from "react-hot-toast";

export default function ExtraService() {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [flightDetails, setFlightDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ancillaries, setAncillaries] = useState([]);
  const [ancillariesLoading, setAncillariesLoading] = useState(false);
  const [sabreOrderId, setSabreOrderId] = useState(null);
  const router = useRouter();

  // Load flight and passenger data from localStorage
  useEffect(() => {
    const { id, booking_id } = router.query;
    if (id && router.isReady) {
      try {
        // Load flight data
        let storedFlightData = localStorage.getItem("flight_selected");
        if (!storedFlightData)
          storedFlightData = localStorage.getItem(`flight_${id}`);
        
        if (storedFlightData) {
          const flightData = JSON.parse(storedFlightData);
          setFlightDetails(flightData);

          // Load passenger data from localStorage
          let passengerData = null;
          try {
            const storedPassengerData = localStorage.getItem("passenger_data");
            if (storedPassengerData) {
              passengerData = JSON.parse(storedPassengerData);
            }
          } catch (err) {
            console.warn("Could not load passenger data:", err);
          }

          // Load seat maps data (includes sabreOrderId if created)
          let seatMapsData = null;
          try {
            const storedSeatMaps = localStorage.getItem(`seatMaps_${id}`);
            if (storedSeatMaps) {
              seatMapsData = JSON.parse(storedSeatMaps);
              
              // Extract order ID from seat maps data (set by ViewDataModal)
              if (seatMapsData.sabreOrderId) {
                console.log("✅ Found Sabre Order ID from seat maps:", seatMapsData.sabreOrderId);
                setSabreOrderId(seatMapsData.sabreOrderId);
              }
            }
          } catch (err) {
            console.warn("Could not load seat maps data:", err);
          }

          // Set booking details with passenger info if available
          const leadPassenger = passengerData?.passengersInfo?.[0] || {
            firstName: "John",
            lastName: "Doe",
            email: passengerData?.contact?.email || "john.doe@example.com",
          };

          setBookingDetails({
            _id: booking_id || `booking_${id}`,
            bookingDetails: flightData,
            leadPassenger: {
              given_name: leadPassenger.firstName || "John",
              family_name: leadPassenger.lastName || "Doe",
              email: leadPassenger.email || passengerData?.contact?.email || "john.doe@example.com",
            },
            bookingEmail: passengerData?.contact?.email || "john.doe@example.com",
            passengersInfo: passengerData?.passengersInfo || [],
            contact: passengerData?.contact || {},
          });

          setLoading(false);
        } else {
          setError(
            "No flight data available. Please start from flight search."
          );
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading flight data:", error);
        setError("Could not load flight details.");
        setLoading(false);
      }
    } else if (router.isReady) {
      setLoading(false);
    }
  }, [router.query, router.isReady]);

  // Fetch ancillaries when sabreOrderId is available
  useEffect(() => {
    // Only fetch ancillaries if we have a Sabre order ID
    // Order ID is set by ViewDataModal when user clicks "Get Seats"
    if (!sabreOrderId) {
      console.log("ℹ️ No Sabre Order ID available. Ancillaries can be fetched after creating an order.");
      return;
    }

    // Fetch ancillaries using the order ID
    fetchAncillaries(sabreOrderId);
  }, [sabreOrderId]);

  /**
   * Fetch ancillaries for a Sabre NDC Order
   * @param {string} orderId - Sabre order ID
   */
  const fetchAncillaries = async (orderId) => {
    try {
      console.log("🛍️ Fetching ancillaries for order:", orderId);

      const response = await fetch("/api/sabre/ancillaries/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("❌ Failed to fetch ancillaries:", data);
        
        // Check for specific errors
        if (response.status === 403 || data.message?.includes("not authorized")) {
          console.warn("⚠️ Get Ancillaries API may not be enabled for your Sabre account");
          toast.error("Ancillaries feature requires API access", { duration: 4000 });
        } else if (response.status === 404) {
          console.warn("⚠️ No ancillaries found for this order");
        } else {
          toast.error(data.message || "Failed to load ancillaries");
        }
        
        setAncillariesLoading(false);
        return;
      }

      const ancillariesData = data.ancillaries || [];
      
      console.log("✅ Ancillaries fetched:", {
        count: ancillariesData.length,
        hasAncillaries: ancillariesData.length > 0,
      });

      setAncillaries(ancillariesData);
      
      if (ancillariesData.length > 0) {
        toast.success(`${ancillariesData.length} ancillaries available`, { duration: 3000 });
      } else {
        toast("No ancillaries available for this flight", { icon: "ℹ️", duration: 3000 });
      }

      setAncillariesLoading(false);

    } catch (error) {
      console.error("❌ Error fetching ancillaries:", error);
      toast.error("Could not load ancillaries: " + error.message);
      setAncillariesLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Breadcrumbs
        steps={getBreadcrumbSteps(router)}
        currentStep="Extra service"
      />
      <FullContainer className="py-8 bg-primary-bg min-h-screen">
        <Container className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[55%] rounded-xl">
            <ExtraServiceBody
              bookingDetails={bookingDetails}
              flightDetails={flightDetails}
              loading={loading}
              error={error}
              ancillaries={ancillaries}
              ancillariesLoading={ancillariesLoading}
              sabreOrderId={sabreOrderId}
            />
          </div>

          {flightDetails && (
            <FlightDetailsSidebar
              flight={flightDetails}
              alwaysOpen
              className="w-full lg:w-[45%] sticky top-24"
            />
          )}
        </Container>
      </FullContainer>
    </>
  );
}
