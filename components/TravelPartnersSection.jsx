"use client";

import Image from "next/image";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";

export default function TravelPartnersSection() {
  return (
    <FullContainer className="w-full bg-white/90 py-16 text-center">
      <Container className=" ">
        <div className="bg-gradient-to-r from-primary-green via-primary-green mx-auto to-primary-text/20 w-fit rounded-full p-[1.5px] mb-10 lg:mb-14">
          <span className="inline-block text-base md:text-2xl lg:text-[28px] font-semibold text-primary-text rounded-full px-4 py-1 bg-white">
            <span className="text-primary-text ">
              All your travel options in one place
            </span>
          </span>
        </div>

        <p className="lg:mx-72 text-gray-600 text-lg mt-8 mb-8">
          More than 1,000 trusted travel partners across trains, buses, flights,
          ferries, and airport transfers, so that you can focus on the journey.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {[
            { name: "Bangladesh Airline", src: "/img/partner/p1.png" },
            { name: "Turkish Airline", src: "/img/partner/p2.png" },
            { name: "Nova Airline", src: "/img/partner/p3.png" },
            { name: "Malaysia Airline", src: "/img/partner/p4.png" },
            { name: "Singapore Airline", src: "/img/partner/p5.png" },
            { name: "Visatra Airline", src: "/img/partner/p6.png" },
            { name: "American Airline", src: "/img/partner/p7.png" },
            { name: "Pakistan Airline", src: "/img/partner/p8.png" },
          ].map((airline, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-md  justify-center"
            >
              <Image
                src={airline.src}
                alt={airline.name}
                width={50}
                height={50}
              />
              <span className="text-sm font-medium text-gray-700">
                {airline.name}
              </span>
            </div>
          ))}
        </div>

        <button className="bg-primary-green text-primary-text px-6 py-3 mt-8 rounded-full hover:bg-primary-green/80">
          See All Airline Partners
        </button>
      </Container>
      <Container>
        <div className="w-full  mt-32 py-12">
          <div className=" mx-auto  text-start grid grid-cols-1 lg:grid-cols-2 ">
            <div>
              <h2 className="text-5xl font-semibold text-gray-800 mb-2">
                Your entire adventure, <br className="sm:hidden" /> simplified.
              </h2>
              <p className="text-gray-600 mb-6">
                Hundreds of reliable transport providers for a seamless journey.
              </p>
              <button className="bg-primary-green text-primary-text px-6 py-3 rounded-full hover:bg-primary-green/80">
                Get started
              </button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
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
                  width={90}
                  height={40}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </FullContainer>
  );
}
