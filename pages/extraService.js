import React, { useState } from "react";
import { useRouter } from "next/router";
import BookingLayout from "../components/common/BookingLayout";
import UserEmailBox from "../components/ExtraService/UserEmailBox";
import ProtectionOptions from "../components/ExtraService/ProtectionOptions";
import SelfTransferInfo from "../components/ExtraService/SelfTransferInfo";
import ExtraServiceFooter from "../components/ExtraService/ExtraServiceFooter";

const ExtraService = () => {
  const [selectedProtection, setSelectedProtection] = useState("none");
  const router = useRouter();

  const breadcrumbSteps = [
    { id: "search", label: "Search Option", href: "/search" },
    { id: "passenger", label: "Passenger details", href: "/passengerDetails" },
    { id: "extra", label: "Extra Service", href: "/extraService" },
    { id: "review", label: "Review and pay", href: "/reviewPay" },
    { id: "confirmation", label: "Confirmation", href: "/confirmation" },
  ];

  const handlePaymentProcess = () => {
    // Store selected protection in localStorage if needed
    if (selectedProtection) {
      try {
        const extraServicesData = {
          selectedProtection,
        };
        localStorage.setItem("extraServices", JSON.stringify(extraServicesData));
      } catch (error) {
        console.error("Error saving protection option:", error);
      }
    }

    // Navigate to review and pay page
    const flightId = router.query.id;
    const protectionParam = selectedProtection
      ? `&protection=${selectedProtection}`
      : "";
    if (flightId) {
      router.push(`/flight/reviewAndPay?id=${flightId}${protectionParam}`);
    } else {
      router.push(`/reviewPay${protectionParam ? `?${protectionParam.substring(1)}` : ""}`);
    }
  };

  const leftColumn = (
    <div className="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-xl p-5 space-y-3 mb-6 text-primary-text">
      {/* User Email Box */}
      <UserEmailBox email="khurramiqbal2449@gmail.com" />

      {/* Protection Options */}
      <ProtectionOptions
        selectedOption={selectedProtection}
        onOptionChange={setSelectedProtection}
      />

      {/* Self Transfer Info */}
      <SelfTransferInfo />
    </div>
  );

  return (
    <BookingLayout
      breadcrumbSteps={breadcrumbSteps}
      currentStep="extra"
      leftColumn={leftColumn}
      footer={<ExtraServiceFooter onProceedToPayment={handlePaymentProcess} selectedServices={[]} />}
    />
  );
};

export default ExtraService;
