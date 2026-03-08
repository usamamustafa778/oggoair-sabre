import React, { useState } from "react";
import Image from "next/image";

const BaggageSelection = ({ onBaggageSelect, selectedBaggage = {} }) => {
  const baggageOptions = [
    {
      id: "personal",
      type: "Personal item",
      weight: "3 kg",
      dimensions: "15 × 30 × 40 cm",
      description: "Fits under the seat.",
      price: 0,
      included: true,
      image: "/st-images/extraservices/personal.png",
      popular: false,
    },
    {
      id: "cabin",
      type: "Cabin bag",
      weight: "7 kg",
      dimensions: "15 × 30 × 40 cm",
      description: "Stored in the overhead compartment.",
      price: 27.6,
      included: false,
      image: "/st-images/extraservices/cabin.png",
      popular: true,
    },
    {
      id: "checked-12",
      type: "Checked bag",
      weight: "12 kg",
      dimensions: "28 × 52 × 78 cm",
      description:
        "Checked in at the desk before security and stored in the aircraft's cargo hold.",
      price: 27.6,
      included: false,
      image: "/st-images/extraservices/checkedsmall.png",
      popular: false,
    },
    {
      id: "checked-23",
      type: "Checked bag",
      weight: "23 kg",
      dimensions: "28 × 52 × 78 cm",
      description:
        "Checked in at the desk before security and stored in the aircraft's cargo hold.",
      price: 27.6,
      included: false,
      image: "/st-images/extraservices/checkedlarge.png",
      popular: false,
    },
  ];

  const handleBaggageToggle = (baggage) => {
    // For radio buttons, we only want one selection at a time (excluding the included personal item)
    const newSelection = {};

    // Always keep the personal item if it's included
    const personalItem = baggageOptions.find((item) => item.included);
    if (personalItem) {
      newSelection[personalItem.id] = personalItem;
    }

    // Add the selected baggage if it's not already selected
    if (!selectedBaggage[baggage.id]) {
      newSelection[baggage.id] = baggage;
    }

    onBaggageSelect(newSelection);
  };

  return (
    <>
      <div className="border-2 border-gray-300 bg-white p-6  rounded-xl">
        <h3 className="text-lg font-semibold text-primary-text mb-2">
          Select your baggage
        </h3>
        <p className="text-sm text-primary-text mb-4">
          Our self-transfer travel hack means that your trip is cheaper. By
          combining flights from various carriers into a unique itinerary, we
          can offer a great price and get you where you want to go.{" "}
          <span className="text-blue-600 underline cursor-pointer">
            Learn more
          </span>
        </p>
      </div>
      <div className="">
        <div className="mb-6"> </div>

        <div className="space-y-4">
          {baggageOptions.map((baggage) => (
            <div
              className="border-2 bg-white border-gray-300 rounded-xl p-4"
              key={baggage.id}
            >
              <div
                className={`relative rounded-lg p-4 transition-all duration-200 ${
                  selectedBaggage[baggage.id]
                    ? "border-primary-green "
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-8 ">
                  <div className="w-auto h-full ">
                    <Image
                      src={baggage.image}
                      alt={baggage.type}
                      width={500}
                      height={500}
                      className={`w-auto object-contain ${
                        baggage.id === "personal" ? " h-20" : " h-25"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-primary-text">
                          {baggage.type} • {baggage.weight}
                        </h4>
                        <p className="text-sm text-primary-text mb-1">
                          {baggage.dimensions}
                        </p>
                        {baggage.id !== "personal" &&
                          baggage.id !== "cabin" && (
                            <p className="text-sm text-primary-text">
                              {baggage.description}
                            </p>
                          )}
                      </div>

                      <div className="flex items-center gap-3 "></div>
                    </div>

                    <div className="bg-gray-100 p-2 rounded">
                      <div className="text-sm flex items-center justify-between text-primary-text">
                        <div>
                          <span className="font-medium text-primary-text">
                            Naveed Abbas
                          </span>
                          {baggage.included && (
                            <div className="text-sm text-primary-text mt-1">
                              1× Personal item
                            </div>
                          )}
                        </div>

                        {baggage.included ? (
                          <span className="ml-16 text-primary-text bg-white p-2 rounded-lg">
                            Included
                          </span>
                        ) : (
                          <div className="w-fit p-2 rounded-lg bg-white flex items-center gap-2">
                            {!baggage.included && (
                              <input
                                type="radio"
                                value={baggage.id}
                                checked={!!selectedBaggage[baggage.id]}
                                onChange={() => handleBaggageToggle(baggage)}
                                className="w-5 h-5 text-primary-green border-gray-300 rounded focus:ring-primary-green"
                                name="baggage"
                              />
                            )}
                            <span className="text-primary-text">
                              ${baggage.price}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BaggageSelection;
