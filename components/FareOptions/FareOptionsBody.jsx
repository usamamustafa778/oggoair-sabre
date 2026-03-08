import React, { useState } from "react";
import { useRouter } from "next/router";
import { Check } from "lucide-react";
import Image from "next/image";

export default function FareOptionsBody({ bookingDetails, loading, error }) {
  const router = useRouter();
  const [selectedFareOption, setSelectedFareOption] = useState("Standard");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fare options data
  const fareOptions = [
    {
      id: "saver",
      name: "Saver",
      price: 553,
      icon: "💰",
      features: [
        {
          type: "negative",
          text: "No flexibility to change your trip",
        },
      ],
      refundPolicy: {
        type: "standard",
        text: "Refund: Your amount depends on airline rules",
      },
      benefits: [],
      description: "Basic fare with no flexibility",
      buttonText: "Continue with saver",
      buttonColor: "gray",
    },
    {
      id: "standard",
      name: "Standard",
      price: 691.25,
      icon: "💰",
      features: [
        {
          type: "positive",
          text: "Free trip changes or only pay the different",
        },
      ],
      refundPolicy: {
        type: "standard",
        text: "Refund: Your amount depends on airline rules",
      },
      benefits: [],
      description: "Recommended option with trip flexibility",
      recommended: true,
      buttonText: "Continue with Standard",
      buttonColor: "green",
    },
    {
      id: "flexi",
      name: "Flexi",
      price: 746.55,
      icon: "💰",
      features: [
        {
          type: "positive",
          text: "Free trip changes or only pay the different",
        },
      ],
      refundPolicy: {
        type: "enhanced",
        text: "80% refund of the ticket and any airline services if you cancel",
      },
      benefits: [],
      description: "Maximum flexibility with cancellation options",
      buttonText: "Continue with Flexi",
      buttonColor: "gray",
    },
  ];

  const handleContinue = async () => {
    setIsProcessing(true);

    try {
      // Store selected fare option in localStorage
      const selectedFare = fareOptions.find(
        (option) => option.name === selectedFareOption
      );

      // Clean any legacy per-offer keys so we don't accumulate duplicates
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

      // Save using a single stable key (no id)
      localStorage.setItem("fareOption", JSON.stringify(selectedFare));

      // Navigate to review and pay page (no booking_id required)
      const { id: flightId } = router.query;
      router.push(`/flight/reviewAndPay?id=${flightId}`);
    } catch (err) {
      console.error("Error proceeding to next step:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    const { id: flightId } = router.query;
    router.push(`/flight/extraService?id=${flightId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fare options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 bg-[#F7F7F9] p-[22px] rounded-xl border-2 border-gray-100 ">
        <div>
          {/* Header */}
          <div className="border-1 border-dotted bg-primary-text border-gray-400 rounded-lg p-4 flex items-center justify-center  mb-3">
            <span className="text-[16px] text-white  text-center">
              Fare options
            </span>
          </div>

          <div className="bg-[#F7F7F9] border-2 mb-4 border-gray-300 rounded-xl p-4 py-6.5 flex flex-col items-start">
            <h3 className="font-semibold text-lg text-primary-text mb-1.5">
              Get the option to change or cancel your trip
            </h3>
            <p className="text-gray-600 text-[13.5px]">
              Upgrade your ticket so you can rebook or get a refund if you
              decide to change your plans.{" "}
              <span className="text-red-500 underline cursor-pointer">
                Learn more
              </span>
            </p>
          </div>

          {/* Fare Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-8">
            {fareOptions.map((option) => (
              <div
                key={option.id}
                className="relative bg-white border-2 flex flex-col justify-between border-gray-300 rounded-2xl p-3 cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={() => setSelectedFareOption(option.name)}
              >
                {/* Icon and Title */}
                <div className="flex flex-col">
                  <div className="text-center mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Image
                        src="/st-images/fare/farehand.png"
                        alt="Fare Options Icon"
                        width={500}
                        height={500}
                      />
                    </div>
                    <h3 className="text-sm font-light text-primary-text mb-0.5">
                      {option.name}
                    </h3>
                    <p className="text-base font-semibold text-primary-text">
                      ${option.price}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-4">
                    {option.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-1 border-b border-gray-300 pb-2"
                      >
                        {feature.type === "positive" ? (
                          <Check className="w-5 h-5 text-primary-text flex-shrink-0 mt-0.5" />
                        ) : (
                          <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="w-3 h-0.5 bg-primary-text"></span>
                          </span>
                        )}
                        <span className="text-[13.5px] text-primary-text leading-relaxed">
                          {feature.text}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-start gap-1 border-b border-gray-300 pb-2">
                      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="w-3 h-0.5 bg-primary-text"></span>
                      </span>
                      <span className="text-[13.5px] text-primary-text leading-relaxed">
                        {option.refundPolicy.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <div className="mt-auto flex justify-center">
                  <button
                    className={`py-1 px-3 rounded-xs font-medium text-primary-text w-fit text-[13.5px] transition-all duration-200 ${
                      option.buttonColor === "green"
                        ? "bg-primary-green hover:bg-primary-green/80 text-primary-text"
                        : option.buttonColor === "blue"
                        ? "bg-gray-200 hover:bg-gray-300 text-primary-text"
                        : "bg-gray-200 hover:bg-gray-300 text-primary-text"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFareOption(option.name);
                    }}
                  >
                    {option.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="border-2 border-gray-300 rounded-lg p-4 mb-6">
            <p className="text-primary-text text-[13.5px]">
              Rebooking and cancellation options are available up to 4 hours
              before the first departure in your itinerary.
            </p>
          </div>

          {/* Footer Section - Matching ExtraService Style */}
        </div>
      </div>
      <div className="w-full flex items-center justify-between mt-7">
        <button
          onClick={handleBack}
          className="bg-gray-200 text-primary-text px-6 py-4 rounded-lg font-semibold w-fit  disabled:bg-gray-400 min-w-[130px] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={isProcessing}
          className="bg-primary-text text-primary-green cursor-pointer active:scale-90 transition-all duration-200 px-6 py-4 rounded-lg font-semibold w-fit  disabled:bg-gray-400 min-w-[130px] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </>
  );
}
