import React from "react";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";
import { PlaneIcon } from "lucide-react";

const flights = [
  {
    city: "Kuala Lumpur",
    label: "Langkawi",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    price: "Start from₨ 5,082.21",
  },
  {
    city: "Bangkok",
    label: "Phuket",
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    price: "Start from₨ 5,082.21",
  },
  {
    city: "Bali Denpasar",
    label: "Kuala Lumpur",
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    price: "Start from ₨ 11,100.61",
  },
  {
    city: "Penang George Town",
    label: "Phnom Penh",
    img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    price: "Start from₨ 5,082.21",
  },
  {
    city: "Penang George Town",
    label: "Langkawi",
    img: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80",
    price: "Start from₨ 5,082.21",
  },
  {
    city: "Kuala Lumpur",
    label: "Langkawi",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    price: "Start from₨ 5,082.21",
  },
  {
    city: "Kuala Lumpur",
    label: "Langkawi",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    price: "Start from₨ 5,082.21",
  },
  {
    city: "Kuala Lumpur",
    label: "Langkawi",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    price: "Start from₨ 5,082.21",
  },
];

export default function FlightRecommendations() {
  return (
    <FullContainer className="">
      <Container className="mx-auto max-w-7xl py-14 md:py-28">
        {/* Heading */}
        <div className="bg-gradient-to-r from-primary-green via-primary-green to-white w-fit rounded-full p-[1.5px] mb-10 lg:mb-14">
          <span className="inline-block text-base md:text-2xl lg:text-[28px] font-semibold text-primary-text rounded-full px-4 py-1 bg-white">
            <span className="text-primary-text ">
              Exclusive Flight Recommendations
            </span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {flights.map((flight, idx) => (
            <div
              key={idx}
              className="bg-gray-100 rounded-[16px] border-2 border-white shadow-md flex flex-col overflow-hidden"
            >
              <img
                src={flight.img}
                alt={flight.city}
                className="w-full h-48 object-cover object-center rounded-t-[16px]"
              />
              <div className="flex-1 flex flex-col justify-between p-4">
                <div className="text-xs bg-primary-green/50 p-0.5 px-2 rounded-full w-fit mb-1">
                  {flight.label}
                </div>
                <div className="flex items-center gap-2 my-2">
                  <PlaneIcon size={18} className="text-primary-text" />
                  <span className="text-primary-text font-semibold text-base">
                    {flight.city}
                  </span>
                </div>
                <button className="w-full bg-primary-green text-primary-text font-medium text-base rounded-full px-4 py-2 mt-auto shadow hover:bg-primary-green/80 transition">
                  {flight.price}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </FullContainer>
  );
}
