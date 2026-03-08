import { Check, ShieldIcon } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const AdditionalServicesSection = ({
  onInsuranceSelect,
  selectedInsurance = null,
}) => {
  const features = [
    "Trip cancellation due to your illness, accident, death",
    "Medical expenses",
    "Lost baggage",
    "Air travel insurance",
    "Liability",
    "Assistance services",
  ];

  const insuranceOptions = [
    {
      id: "travel-plus",
      name: "Travel Plus",
      price: 59.56,
      icon: "🛡️",
      color: "orange",
    },
    {
      id: "travel-basic",
      name: "Travel Basic",
      price: 59.56,
      icon: "🛡️",
      color: "blue",
    },
    {
      id: "no-insurance",
      name: "No insurance",
      price: 0,
      icon: null,
      color: "gray",
    },
  ];

  const handleInsuranceSelect = (insurance) => {
    onInsuranceSelect(insurance);
  };

  return (
    <div className="bg-white flex flex-col gap-2 rounded-xl p-3.5 border-2 border-gray-300">
      <h3 className="text-lg font-semibold text-primary-text">
        Additional services
      </h3>

      {/* Travel Insurance Section */}
      <div className="bg-gray-50 flex flex-row gap-4  rounded-xl p-2.5 border-2 border-gray-300">
        <div className="w-[140px]">
          <Image
            src="/st-images/travelinsurance.png"
            alt="travel insurance"
            width={500}
            height={500}
            className=" border h-auto"
          />
        </div>
        <div className=" pl-3 rounded-xl w-full px-1">
          <div className="flex gap-6 mb-2 pt-2">
            <div className="flex-1 flex justify-between items-start">
              <div>
                <h4 className="text-[14.5px] font-medium text-primary-text">
                  Travel Insurance
                </h4>
                <p className="text-[10px] text-primary-text font-medium">
                  (Provided by AXA Assistance)
                </p>
              </div>

              <button className="flex items-center  gap-2 text-primary-text text-xs font-medium hover:text-blue-800">
                <div className="w-4 h-4 border-[1.5px] border-primary-text rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-bold">i</span>
                </div>
                Comparison and terms
              </button>
            </div>
          </div>

          {/* Insurance Options - Three Equal Columns (Red Box 3) */}
          <div className="grid  grid-cols-3 gap-0  rounded-lg overflow-hidden">
            {insuranceOptions.map((option, index) => (
              <div
                key={option.id}
                className={`border-r border-gray-300 last:border-r-0 cursor-pointer transition-all duration-200`}
                onClick={() => handleInsuranceSelect(option)}
              >
                {/* Option Header */}
                <div
                  className={`  flex flex-col ${
                    index === 0 ? "items-start" : "items-center"
                  }  `}
                >
                  <div className={`flex items-center gap-1.5 mb-0.5 w-fit`}>
                    <input
                      type="radio"
                      name="insurance"
                      checked={selectedInsurance?.id === option.id}
                      onChange={() => handleInsuranceSelect(option)}
                      className="w-3 h-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2">
                      {option.icon && (
                        <ShieldIcon
                          className="w-3 h-3 text-primary-text "
                          strokeWidth={2}
                        />
                      )}
                      <span className="s text-primary-text text-[14.5px]">
                        {option.name}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                </div>
                {option.price > 0 && (
                  <div className="text-xs s text-green-700 text-center">
                    +${option.price}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Features List */}
          <div className="grid grid-cols-2 gap-y-2 border-t border-gray-300 pt-3 gap-x-4 text-primary-text mt-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check
                  className="w-3 h-3 text-primary-text mt-0.5 flex-shrink-0"
                  strokeWidth={3}
                />
                <p className="text-[13.5px] font-light leading-4">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalServicesSection;
