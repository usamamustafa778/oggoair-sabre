import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import FullContainer from "@/components/common/FullContainer";
import Container from "@/components/common/Container";
import FlightDetailsSidebar from "@/components/FlightSearch/FlightDetailsSidebar";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import FareOptionsBody from "@/components/FareOptions/FareOptionsBody";
import { getBreadcrumbSteps } from "@/utils/breadcrumbUtils";

export default function FareOptions() {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [flightDetails, setFlightDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const { id } = router.query;
    if (id && router.isReady) {
      // Get flight data from localStorage (same pattern as extraService)
      try {
        let storedFlightData = localStorage.getItem("flight_selected");
        if (!storedFlightData)
          storedFlightData = localStorage.getItem(`flight_${id}`);
        if (storedFlightData) {
          const flightData = JSON.parse(storedFlightData);
          setFlightDetails(flightData);

          // Create simple booking details structure (no booking_id required)
          setBookingDetails({
            _id: id, // Use flight id instead of booking_id
            bookingDetails: flightData,
            leadPassenger: {
              given_name: "John",
              family_name: "Doe",
              email: "john.doe@example.com",
            },
            bookingEmail: "john.doe@example.com",
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
    }
  }, [router.query, router.isReady]);

  return (
    <>
      <Navbar />
      <Breadcrumbs
        steps={getBreadcrumbSteps(router)}
        currentStep="Fare options"
      />
      <FullContainer className="py-8 bg-primary-bg min-h-screen">
        <Container className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[55%] rounded-xl">
            <FareOptionsBody
              bookingDetails={bookingDetails}
              flightDetails={flightDetails}
              loading={loading}
              error={error}
            />
          </div>
          <div className="border-3 border-white w-full lg:w-[45%] rounded-xl shadow-[0_0_30px_0_rgba(0,0,0,0.1)] bg-white overflow-hidden">
            {flightDetails && (
              <FlightDetailsSidebar flight={flightDetails} alwaysOpen />
            )}
          </div>
        </Container>
      </FullContainer>
    </>
  );
}
