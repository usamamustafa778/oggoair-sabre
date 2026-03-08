import Navbar from "../Navbar";
import Breadcrumbs from "./Breadcrumbs";
import FlightDetails from "../PassengerDetails/FlightDetails";
import ShareJourney from "../PassengerDetails/ShareJourney";
import PriceSummary from "../PassengerDetails/PriceSummary";
import Container from "./Container";

const BookingLayout = ({
  breadcrumbSteps,
  currentStep,
  leftColumn,
  rightColumnCustom = null,
  footer,
}) => {
  return (
    <div className="min-h-screen bg-[#E4ECEF]">
      <Navbar />

      <Breadcrumbs steps={breadcrumbSteps} currentStep={currentStep} />

      <Container className="py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Reusable content */}
          <div className="lg:w-[64%] space-y-6 border">{leftColumn}</div>

          {/* Right Column - Flight Details and Summary (or custom content) */}
          <div className="space-y-6 border">
            {rightColumnCustom || (
              <>
                <FlightDetails />
                <ShareJourney />
                <PriceSummary />
              </>
            )}
          </div>
        </div>
      </Container>

      {footer}
    </div>
  );
};

export default BookingLayout;
