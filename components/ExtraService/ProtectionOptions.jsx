import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

const ProtectionOptions = ({ selectedProtection, onProtectionSelect }) => {
  // Add console log to debug
  const [expandedDetails, setExpandedDetails] = useState({});

  const toggleDetails = (optionId) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }));
  };

  const protectionOptions = [
    {
      id: "cancellation",
      title: "Cancellation Protection",
      description:
        "You'll receive a refund in the event of delays, cancellations or COVID-19.",
      price: "$6.33",
      forPassengers: "For 1 passenger",
    },
    {
      id: "comprehensive",
      title: "Comprehensive Protection",
      description:
        "You're covered in the event of delays, cancellations, COVID-19, medical expenses, lost luggage and more.",
      price: "+$22.30",
      forPassengers: "For 1 passenger",
    },
    {
      id: "none",
      title: "I want to travel without protection",
      description: "",
      price: "",
      forPassengers: "",
    },
  ];

  return (
    <div className="bg-white rounded-xl p-3 border-2 border-gray-300">
      <div className="flex items-center justify-between px-3 py-2.5">
        <h3 className="text-base font-bold text-primary-text">
          Travel with peace of mind
        </h3>
        <Image
          src="/st-images/travelwithmind.png"
          alt="shield"
          width={100}
          height={100}
          className="w-auto h-13"
        />
      </div>

      <div className="space-y-4 mt-[-8px] ">
        {protectionOptions.map((option) => (
          <div
            key={option.id}
            className={`px-2 pt-2  border-b border-gray-300 ${
              option.id === "none" ? "border-none" : " "
            }`}
          >
            <div className="flex items-start gap-3 max-w-[454px]">
              <div className="flex-1">
                <div
                  className={`flex items-center justify-start gap-2 mb-1  ${
                    option.id === "none"
                      ? "w-fit bg-secondary-green rounded-sm px-1 py-2 pr-6"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="protection"
                    id={option.id}
                    value={option.id}
                    checked={selectedProtection === option.id}
                    onChange={(e) => onProtectionSelect(e.target.value)}
                    className="w-6 h-6 text-green-600"
                  />
                  <label
                    htmlFor={option.id}
                    className="font-semibold text-base text-primary-text cursor-pointer "
                  >
                    {option.title}
                  </label>
                </div>
                <p className="text-base text-primary-text mb-2 tracking-tight">
                  {option.description}
                </p>
                <div className="flex flex-col justify-betweens gap-2">
                  <div className="flex flex-col gap-2 items-end">
                    {option.price && (
                      <span className="font-semibold text-primary-text">
                        {option.price}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-row items-center justify-between  ">
                    {option.id !== "none" && (
                      <button
                        onClick={() => toggleDetails(option.id)}
                        className="text-primary-text bg-secondary-green py-1.5 px-4 rounded-full text-base font-medium flex items-center gap-4"
                      >
                        Details
                        {expandedDetails[option.id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <span className="text-base text-primary-text">
                      {option.forPassengers}
                    </span>
                  </div>
                  <div
                    className={`mt-4 overflow-hidden transition-all duration-500 ease-in-out  ${
                      expandedDetails[option.id] && option.id !== "none"
                        ? "max-h-32 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-primary-text">
                        {option.id === "cancellation"
                          ? "Get peace of mind with our cancellation protection. Covers flight delays, cancellations, and COVID-19 related issues with full refund guarantee."
                          : "Comprehensive travel protection covering medical expenses, lost luggage, flight disruptions, and more. 24/7 assistance included."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProtectionOptions;
