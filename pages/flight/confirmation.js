import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "@/components/Navbar";
import FullContainer from "@/components/common/FullContainer";
import Container from "@/components/common/Container";
import ConfirmationSidebar from "@/components/Confirmation/ConfirmationSidebar";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import ConfirmationBody from "@/components/Confirmation/ConfirmationBody";
import RevolutTestPanel from "@/components/RevolutTesting/RevolutTestPanel";
import { Check } from "lucide-react";
import { getBreadcrumbSteps } from "@/utils/breadcrumbUtils";
import { clearFlightData } from "@/utils/formPersistence";

export default function Confirmation() {
  const router = useRouter();
  const {
    id: flightId,
    booking_id: bookingId,
    order_id: orderId,
  } = router.query;

  const [bookingDetails, setBookingDetails] = useState(null);
  const [flightDetails, setFlightDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.isReady && flightId && bookingId) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          setError(null);

          // First, try to load flight data from localStorage
          let storedFlightData = localStorage.getItem("flight_selected");
          if (!storedFlightData) {
            storedFlightData = localStorage.getItem(`flight_${flightId}`);
          }

          // Load passenger data from localStorage (single key)
          const storedPassengerData = localStorage.getItem("passenger_data");

          if (storedFlightData) {
            const flightData = JSON.parse(storedFlightData);
            setFlightDetails(flightData);

            // Create booking details structure with localStorage data
            let bookingData = {
              _id: bookingId,
              bookingDetails: flightData,
              leadPassenger: {
                given_name: "John",
                family_name: "Doe",
                email: "john.doe@example.com",
              },
              bookingEmail: "john.doe@example.com",
            };

            // If passenger data exists, use it
            if (storedPassengerData) {
              const passengerData = JSON.parse(storedPassengerData);
              if (
                passengerData.passengersInfo &&
                passengerData.passengersInfo.length > 0
              ) {
                const mainPassenger = passengerData.passengersInfo[0];
                bookingData.leadPassenger = {
                  given_name: mainPassenger.firstName || "John",
                  family_name: mainPassenger.lastName || "Doe",
                  email:
                    passengerData.contact?.email ||
                    mainPassenger.email ||
                    "john.doe@example.com",
                };
                bookingData.bookingEmail =
                  passengerData.contact?.email ||
                  mainPassenger.email ||
                  "john.doe@example.com";

                // Map passenger data to booking structure
                bookingData.bookingDetails.passengers =
                  passengerData.passengersInfo.map((passenger) => ({
                    type: passenger.type || "adult",
                    given_name: passenger.firstName || "",
                    family_name: passenger.lastName || "",
                    born_on: passenger.dateOfBirth || "1990-01-01",
                    title: passenger.gender?.toLowerCase().startsWith("f")
                      ? "Ms"
                      : "Mr",
                    gender: passenger.gender?.toLowerCase().startsWith("f")
                      ? "f"
                      : "m",
                    email:
                      passenger.email || passengerData.contact?.email || "",
                    phone_number: `${passengerData.contact?.dialCode || ""}${
                      passengerData.contact?.phoneNumber || ""
                    }`,
                    country_of_residence: passenger.cityzenShip || "",
                    passport_number: passenger.passport || "",
                    passport_expiry: passenger.passportExpiryDate || "",
                  }));
              }
            }

            setBookingDetails(bookingData);

            // Clear stored form data since booking is complete
            if (flightId) {
              clearFlightData(flightId);
            }
          } else {
            // Fallback to API if no localStorage data
            const bookingRes = await axios.get(
              `/api/flights/booking/${bookingId}`
            );

            if (bookingRes.data.success) {
              setBookingDetails(bookingRes.data.data);
              setFlightDetails(bookingRes.data.data.bookingDetails);

              // Clear stored form data since booking is complete
              if (flightId) {
                clearFlightData(flightId);
              }
            } else {
              throw new Error(
                bookingRes.data.message || "Failed to fetch booking details"
              );
            }
          }
        } catch (err) {
          console.error("Error fetching details:", err);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load confirmation details."
          );
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [router.isReady, flightId, bookingId]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <Breadcrumbs
        steps={getBreadcrumbSteps(router)}
        currentStep="Confirmation"
      />
      <FullContainer className="py-12 min-h-screen">
        <Container className="flex flex-col lg:flex-row gap-6">
          <div className="bg-white w-full lg:w-[55%] relative shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-xl p-5 space-y-3 mb-6 text-primary-text">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <h3 className="font-semibold">Error Loading Page</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}
            {/* Revolut Test Panel - Only show in development */}
            {process.env.NODE_ENV === "development" && <RevolutTestPanel />}

            <ConfirmationBody
              bookingDetails={bookingDetails}
              flightDetails={flightDetails}
              loading={loading}
              error={error}
            />
          </div>
          <div
            className={`border-3 h-full flex flex-col border-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-xl bg-white overflow-y-auto w-full lg:w-[45%] sticky top-24`}
          >
            <ConfirmationSidebar bookingDetails={bookingDetails} />
          </div>
        </Container>
      </FullContainer>
    </div>
  );
}
