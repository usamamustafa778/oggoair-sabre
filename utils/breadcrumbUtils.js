// Utility functions for generating breadcrumb URLs in the flight booking flow
import { loadBookingId, loadFlightFormData } from "@/utils/formPersistence";

export const getBreadcrumbUrls = (router) => {
  const { id, booking_id, adult, adults, child, infant, protection } =
    router.query;
  // Support new 'adult' param with backward compatibility for 'adults'
  const effectiveAdult = adult || adults;

  // Only try to get booking_id from localStorage if not in URL and we're in the browser
  let effectiveBookingId = booking_id;
  if (
    !effectiveBookingId &&
    id &&
    typeof window !== "undefined" &&
    router.isReady
  ) {
    effectiveBookingId = loadBookingId(id);
  }

  // Try to get passenger count from saved form data if not in URL
  let effectiveAdults = effectiveAdult;
  let effectiveChild = child;
  let effectiveInfant = infant;

  if (
    (!effectiveAdults || !effectiveChild || !effectiveInfant) &&
    id &&
    typeof window !== "undefined" &&
    router.isReady
  ) {
    const savedFormData = loadFlightFormData(id);
    if (savedFormData && savedFormData.length > 0) {
      const adultCount = savedFormData.filter((p) => p.type === "adult").length;
      const childCount = savedFormData.filter((p) => p.type === "child").length;
      const infantCount = savedFormData.filter(
        (p) => p.type === "infant"
      ).length;

      if (!effectiveAdults) effectiveAdults = adultCount.toString();
      if (!effectiveChild) effectiveChild = childCount.toString();
      if (!effectiveInfant) effectiveInfant = infantCount.toString();
    }
  }

  // Build query parameters safely
  const buildQueryParams = (params) => {
    const queryParams = new URLSearchParams();
    if (params.id) queryParams.append("id", params.id);
    if (params.booking_id) queryParams.append("booking_id", params.booking_id);
    if (params.adult) queryParams.append("adult", params.adult);
    if (params.child) queryParams.append("child", params.child);
    if (params.infant) queryParams.append("infant", params.infant);
    if (params.protection) queryParams.append("protection", params.protection);
    return queryParams.toString();
  };

  const queryString = buildQueryParams({
    id,
    booking_id: effectiveBookingId,
    adult: effectiveAdults,
    child: effectiveChild,
    infant: effectiveInfant,
    protection,
  });

  // Special handling for passenger details to ensure required parameters
  const passengerDetailsParams = new URLSearchParams();
  if (id) passengerDetailsParams.append("id", id);
  if (effectiveAdults) passengerDetailsParams.append("adult", effectiveAdults);
  if (effectiveChild) passengerDetailsParams.append("child", effectiveChild);
  if (effectiveInfant) passengerDetailsParams.append("infant", effectiveInfant);
  // Add defaults if not present
  if (!effectiveAdults) passengerDetailsParams.append("adult", "1");
  if (!effectiveChild) passengerDetailsParams.append("child", "0");
  if (!effectiveInfant) passengerDetailsParams.append("infant", "0");

  return {
    searchSection: "/flight/flightSearch",
    passengerDetails: `/flight/checkout?${passengerDetailsParams.toString()}`,
    extraService: `/flight/extraService?${queryString}`,
    reviewAndPay: `/flight/reviewAndPay?${queryString}`,
    confirmation: `/flight/confirmation?${queryString}`,
  };
};

export const getBreadcrumbSteps = (router) => {
  const urls = getBreadcrumbUrls(router);

  return [
    { id: "Search Option", label: "Search Section", href: urls.searchSection },
    {
      id: "Passenger Details",
      label: "Passenger Details",
      href: urls.passengerDetails,
    },
    { id: "Extra service", label: "Extra service", href: urls.extraService },
    { id: "Review and Pay", label: "Review and Pay", href: urls.reviewAndPay },
    { id: "Confirmation", label: "Confirmation", href: urls.confirmation },
  ];
};

// Helper function to check if a step should be clickable
export const isStepClickable = (stepIndex, currentStepIndex) => {
  return stepIndex < currentStepIndex;
};

// Helper function to get the previous step URL
export const getPreviousStepUrl = (router, currentStep) => {
  const steps = getBreadcrumbSteps(router);
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  if (currentStepIndex > 0) {
    const previousStep = steps[currentStepIndex - 1];
    // Return the URL if it exists and is not just a placeholder
    if (previousStep.href && previousStep.href !== "#") {
      return previousStep.href;
    }
  }

  return null;
};
