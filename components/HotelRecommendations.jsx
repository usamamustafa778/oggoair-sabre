"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";
import { Star } from "phosphor-react";
import { getSelectedCurrency, CURRENCIES } from "@/utils/priceConverter";

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
    price: 435,
    rating: 4.9,
  },
  {
    city: "Islamabad",
    name: "Islamabad Serena Hotel",
    img: "/img/e2.png",
    price: 435,
    rating: 4.9,
  },
  {
    city: "Islamabad",
    name: "Islamabad Serena Hotel",
    img: "/img/e3.png",
    price: 435,
    rating: 4.9,
  },
  {
    city: "Islamabad",
    name: "Islamabad Serena Hotel",
    img: "/img/e4.png",
    price: 435,
    rating: 4.9,
  },
];

export default function HotelRecommendations() {
  const [activeCity, setActiveCity] = useState(cities[0]);
  const [page, setPage] = useState(0);
  const [currency, setCurrency] = useState("EUR");
  const cardsPerPage = 4;
  const filteredHotels = hotels.filter((h) => h.city === activeCity);
  const pagedHotels = filteredHotels.slice(
    page * cardsPerPage,
    (page + 1) * cardsPerPage
  );
  const totalPages = Math.ceil(filteredHotels.length / cardsPerPage) || 1;

  useEffect(() => {
    setCurrency(getSelectedCurrency());
    const handleCurrencyChange = () => setCurrency(getSelectedCurrency());
    window.addEventListener("currencyChanged", handleCurrencyChange);
    return () => window.removeEventListener("currencyChanged", handleCurrencyChange);
  }, []);

  const symbol = CURRENCIES[currency]?.symbol ?? "€";


  return (
    <FullContainer className="py-12 md:py-16 bg-white">
      <Container className="mx-auto max-w-7xl">
        {/* Title with lime-green accent behind "Exclusive Hotel" */}
        <div className="mb-8 md:mb-10 lg:mb-14 ">
          <h2 className="text-2xl md:text-3xl font-medium" style={{ color: "#132968" }}>
            <span className="relative inline-block">
              <span className="relative z-10">Exclusive Hotel</span>
            </span>{" "}
            Recommendations
          </h2>
        </div>

        {/* Hotel cards - horizontal scrollable row */}
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-2 px-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {pagedHotels.map((hotel, idx) => (
            <Link
              key={idx}
              href="/hotelSearch"
              className="flex-shrink-0 snap-start w-[75%] sm:w-[48%] md:w-[24%]"
            >
              <div className="relative rounded-2xl overflow-hidden bg-white group hover:shadow-[0_5px_20px_rgba(0,0,0,0.1)]">
                <div className="relative aspect-3/4 overflow-hidden">
                  {/* Hotel image */}
                  <img
                    src={hotel.img}
                    alt={hotel.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark gradient for default state (text over image) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-0" />

                  {/* Default text over image */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col justify-center items-center p-4 text-white opacity-100 translate-y-0 transition-all duration-300  group-hover:bg-white group-hover:text-[#132968] ">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="font-semibold text-sm sm:text-base truncate">
                        {hotel.name}
                      </span>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Star size={16} weight="fill" className="text-amber-400" />
                        <span className="font-semibold text-xs sm:text-sm">
                          {hotel.rating}
                        </span>
                      </span>
                    </div>
                    <p className="font-semibold text-sm sm:text-base">
                      Book from {hotel.price} {symbol}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`rounded-full transition-all duration-200 ${
                i === page
                  ? "w-4 h-4"
                  : "w-3 h-3"
              }`}
              style={{
                backgroundColor: i === page ? "#132968" : "#e5e7eb",
              }}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </Container>
    </FullContainer>
  );
}
