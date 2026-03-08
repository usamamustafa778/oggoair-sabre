"use client";

import Image from "next/image";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";

export default function TravelPartnersSection() {
  const airlines = [
    { name: "Bangladesh Airline", src: "/img/partner/p1.png" },
    { name: "Turkish Airline", src: "/img/partner/p2.png" },
    { name: "Nova Airline", src: "/img/partner/p3.png" },
    { name: "Malaysia Airline", src: "/img/partner/p4.png" },
    { name: "Singapore Airline", src: "/img/partner/p5.png" },
    { name: "Visatra Airline", src: "/img/partner/p6.png" },
    { name: "American Airline", src: "/img/partner/p7.png" },
    { name: "Pakistan Airline", src: "/img/partner/p8.png" },
  ];

  return (
    <FullContainer className="w-full bg-white mt-10 md:mt-8 py-16 md:pb-20 text-center">
      <Container className="max-w-7xl mx-auto">
        <h2
          className="text-2xl md:text-3xl font-semibold mb-4"
          style={{ color: "#132968" }}
        >
          All your travel options in one place
        </h2>

        <p className="max-w-2xl mx-auto text-gray-500 text-base md:text-lg mb-12">
          More than 1,000 trusted travel partners across trains, buses, flights,
          ferries, and airport transfers, so that you can focus on the journey.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {airlines.map((airline, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-100">
                <Image
                  src={airline.src}
                  alt={airline.name}
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span
                className="text-sm font-medium text-left flex-1"
                style={{ color: "#132968" }}
              >
                {airline.name}
              </span>
            </div>
          ))}
        </div>

        <button className="bg-[#D4FF5A] text-[#132968] font-semibold px-8 py-3 rounded-full hover:bg-[#b8e84d] transition-colors">
          See All Airline Partners
        </button>
      </Container>
      <Container>
        <div className="w-full mt-16 pt-8">
          <div className="mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-10 items-center">
            {/* Left copy */}
            <div className="text-left">
              <h2 className="text-3xl md:text-5xl font-semibold text-[#132968] mb-4 leading-tight">
                Your entire adventure, simplified.
              </h2>
              <p
                className="text-base md:text-xl mb-8"
                style={{ color: "#132968" }}
              >
                Hundreds of reliable transport providers for a seamless journey.
              </p>
              <button className="bg-[#D4FF5A] text-[#132968]  px-10 py-3 rounded-full text-sm md:text-base font-semibold hover:bg-[#b8e84d] transition-colors">
                Get started
              </button>
            </div>

            {/* Right logos block */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="grid grid-cols-3 gap-x-10 gap-y-10 justify-items-center">
                {[
                  "/img/l1.png",
                  "/img/l2.png",
                  "/img/l3.png",
                  "/img/l4.png",
                  "/img/l5.png",
                  "/img/l6.png",
                ].map((logo, idx) => (
                  <Image
                    key={idx}
                    src={logo}
                    alt={`partner-${idx}`}
                    width={150}
                    height={70}
                    className="object-contain"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </FullContainer>
  );
}
