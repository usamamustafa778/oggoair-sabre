import React, { useState } from "react";
import { Star } from "phosphor-react";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";

const cities = [
  "Islamabad",
  "Kuala Lumpur",
  "Bangkok",
  "Karachi",
  "Makkah",
  "Phuket",
];

const hotels = [
  {
    city: "Islamabad",
    name: "Islamabad Serena Hotel",
    img: "/img/e1.png",
    price: "Start from₨ 5,082.21",
    rating: 4.9,
  },
  {
    city: "Islamabad",
    name: "Islamabad Serena Hotel",
    img: "/img/e2.png",
    price: "Start from₨ 5,082.21",
    rating: 4.9,
  },
  {
    city: "Islamabad",
    name: "Islamabad Serena Hotel",
    img: "/img/e3.png",
    price: "Start from₨ 5,082.21",
    rating: 4.9,
  },
  {
    city: "Islamabad",
    name: "Islamabad Serena Hotel",
    img: "/img/e4.png",
    price: "Start from₨ 5,082.21",
    rating: 4.9,
  },
];

export default function HotelRecommendations() {
  const [activeCity, setActiveCity] = useState(cities[0]);
  const [page, setPage] = useState(0);
  const cardsPerPage = 4;
  const filteredHotels = hotels.filter((h) => h.city === activeCity);
  const pagedHotels = filteredHotels.slice(
    page * cardsPerPage,
    (page + 1) * cardsPerPage
  );
  const totalPages = Math.ceil(filteredHotels.length / cardsPerPage) || 1;

  return (
    <FullContainer className="  ">
      <Container className=" py-8 sm:py-12 md:py-16 lg:py-20 ">
        {/* Heading */}

        <div className="bg-gradient-to-r from-primary-green via-primary-green to-primary-text/20 w-fit rounded-full p-[1.5px] mb-10 lg:mb-14">
          <span className="inline-block text-base md:text-2xl lg:text-[28px] font-semibold text-primary-text rounded-full px-4 py-1 bg-white">
            <span className="text-primary-text ">
              Exclusive Hotel Recommendations
            </span>
          </span>
        </div>

        {/* Tabs */}
        <div
          className="mb-6 sm:mb-8 overflow-x-scroll rounded-full"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitScrollbar: { display: "none" },
          }}
        >
          <div
            className="flex gap-1 sm:gap-2  bg-gray-100 w-full sm:w-fit rounded-full p-1.5 overflow-x-auto"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitScrollbar: { display: "none" },
            }}
          >
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setActiveCity(city);
                  setPage(0);
                }}
                className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 rounded-full font-semibold text-sm sm:text-base border-none focus:outline-none transition whitespace-nowrap flex-shrink-0 ${
                  activeCity === city
                    ? "bg-[#d7fa7c] text-[#22325a]"
                    : "bg-white text-[#22325a]"
                } shadow-sm hover:shadow-md`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {pagedHotels.map((hotel, idx) => (
            <div
              key={idx}
              className="rounded-[16px] flex flex-col overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white"
            >
              <img
                src={hotel.img}
                alt={hotel.name}
                className="w-full h-48 sm:h-52 md:h-60 object-cover object-center rounded-t-[16px]"
              />
              <div className="flex-1 flex flex-col justify-between p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <span className="text-[#22325a] font-bold text-sm sm:text-base leading-tight flex-1 min-w-0">
                    {hotel.name}
                  </span>
                  <span className="flex items-center gap-1 text-[#ff9800] font-bold text-sm sm:text-base flex-shrink-0">
                    <Star
                      size={16}
                      weight="fill"
                      className="text-[#ff9800] sm:w-[18px] sm:h-[18px]"
                    />
                    {hotel.rating}
                  </span>
                </div>
                <button className="w-full bg-primary-green text-primary-text font-medium text-sm sm:text-base rounded-full px-3 sm:px-4 py-2 mt-auto shadow hover:bg-primary-green/80 transition-colors duration-200">
                  {hotel.price}
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 sm:gap-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-200 hover:scale-110 ${
                i === page
                  ? "bg-[#22325a] shadow-md"
                  : "bg-[#e3eafc] hover:bg-[#d1d9f0]"
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </Container>
    </FullContainer>
  );
}
