import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import FullContainer from "@/components/common/FullContainer";
import Container from "@/components/common/Container";
import FlightDetailsSidebar from "@/components/FlightSearch/FlightDetailsSidebar";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import ReviewAndPayBody from "@/components/ReviewAndPay/ReviewAndPayBody";
import { getBreadcrumbSteps } from "@/utils/breadcrumbUtils";

export default function ReviewAndPay() {
  const router = useRouter();
  const { id: flightId } = router.query;

  const [bookingDetails, setBookingDetails] = useState(null);
  const [flightDetails, setFlightDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.isReady && flightId) {
      try {
        setLoading(true);
        setError(null);

        // Get flight data from localStorage (prefer single fixed key, fallback to old key)
        let storedFlightData = localStorage.getItem("flight_selected");
        if (!storedFlightData)
          storedFlightData = localStorage.getItem(`flight_${flightId}`);
        if (storedFlightData) {
          const flightData = JSON.parse(storedFlightData);
          setFlightDetails(flightData);

          // Get selected fare option from localStorage (single key)
          const selectedFare = localStorage.getItem("fareOption");
          let fareOption = null;
          if (selectedFare) {
            fareOption = JSON.parse(selectedFare);
          }

          // Get extra services from localStorage (single key)
          const extraServices = localStorage.getItem("extraServices");
          let servicesData = null;
          if (extraServices) {
            servicesData = JSON.parse(extraServices);
          }

          // Read main passenger/contact snapshot from localStorage
          const passengerSnapshot = localStorage.getItem("passenger_data");
          let leadPassenger = {
            given_name: "John",
            family_name: "Doe",
            email: "john.doe@example.com",
          };
          let bookingEmail = "john.doe@example.com";
          if (passengerSnapshot) {
            try {
              const parsed = JSON.parse(passengerSnapshot);
              const main = parsed?.passengersInfo?.[0];
              if (main) {
                leadPassenger = {
                  given_name: main.firstName || "John",
                  family_name: main.lastName || "Doe",
                  email:
                    parsed?.contact?.email ||
                    main.email ||
                    "john.doe@example.com",
                };
                bookingEmail =
                  parsed?.contact?.email ||
                  main.email ||
                  "john.doe@example.com";
              }
            } catch {}
          }

          // Create booking details structure using localStorage data
          setBookingDetails({
            _id: flightId,
            bookingDetails: flightData,
            selectedFare: fareOption,
            extraServices: servicesData,
            leadPassenger,
            bookingEmail,
          });

          setLoading(false);
        } else {
          setError(
            "No flight data available. Please start from flight search."
          );
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Could not load flight details.");
        setLoading(false);
      }
    }
  }, [router.isReady, flightId]);

  return (
    <>
      <Navbar />
      <Breadcrumbs
        steps={getBreadcrumbSteps(router)}
        currentStep="Review and Pay"
      />
      <FullContainer className="py-8 bg-primary-bg min-h-screen">
        <Container className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[55%] rounded-xl">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <h3 className="font-semibold">Error Loading Page</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}
            <ReviewAndPayBody
              bookingDetails={bookingDetails}
              loading={loading}
              error={error}
              flightDetails={flightDetails}
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
