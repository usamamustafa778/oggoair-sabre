"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Heart } from "phosphor-react";
import { ArrowLeftRight } from "lucide-react";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";
import { getSelectedCurrency, CURRENCIES } from "@/utils/priceConverter";

const tours = [
  {
    location: "New York City, New York",
    title: "New York City Skyline at Night Guided Tour",
    img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80",
    price: 54,
    rating: 4.7,
    reviews: 211,
  },
  {
    location: "London, United Kingdom",
    title: "London Skyline at Dusk Guided Tour",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=400&q=80",
    price: 48,
    rating: 4.8,
    reviews: 189,
  },
  {
    location: "Paris, France",
    title: "Paris by Night Seine River Cruise",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80",
    price: 62,
    rating: 4.9,
    reviews: 312,
  },
  {
    location: "Dubai, UAE",
    title: "Dubai Marina & Burj Khalifa Evening Tour",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80",
    price: 89,
    rating: 4.6,
    reviews: 156,
  },
  {
    location: "Singapore",
    title: "Singapore Night Safari Experience",
    img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=400&q=80",
    price: 72,
    rating: 4.7,
    reviews: 245,
  },
  {
    location: "Tokyo, Japan",
    title: "Tokyo Neon Lights Walking Tour",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80",
    price: 58,
    rating: 4.8,
    reviews: 198,
  },
  {
    location: "Barcelona, Spain",
    title: "Barcelona Gothic Quarter Night Walk",
    img: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=400&q=80",
    price: 45,
    rating: 4.7,
    reviews: 167,
  },
  {
    location: "Istanbul, Turkey",
    title: "Bosphorus Night Cruise with Dinner",
    img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=400&q=80",
    price: 78,
    rating: 4.9,
    reviews: 289,
  },
  {
    location: "Sydney, Australia",
    title: "Sydney Opera House & Harbour Night Tour",
    img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=400&q=80",
    price: 65,
    rating: 4.8,
    reviews: 234,
  },
  {
    location: "Rome, Italy",
    title: "Rome Illuminated Monuments Tour",
    img: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80",
    price: 52,
    rating: 4.6,
    reviews: 178,
  },
  {
    location: "Bangkok, Thailand",
    title: "Bangkok Night Markets & Temples Tour",
    img: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=400&q=80",
    price: 42,
    rating: 4.7,
    reviews: 201,
  },
];

const CARDS_PER_PAGE = 6;

export default function TopTours() {
  const [page, setPage] = useState(0);
  const [currency, setCurrency] = useState("EUR");

  useEffect(() => {
    setCurrency(getSelectedCurrency());
    const handleCurrencyChange = () => setCurrency(getSelectedCurrency());
    window.addEventListener("currencyChanged", handleCurrencyChange);
    return () => window.removeEventListener("currencyChanged", handleCurrencyChange);
  }, []);

  const symbol = CURRENCIES[currency]?.symbol ?? "€";
  const pagedTours = tours.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);

  return (
    <FullContainer className="py-12 md:py-16 bg-white">
      <Container className="mx-auto max-w-7xl">
        {/* Section title */}
        <div className="mb-8 md:mb-10 text-center">
          <h2
            className="text-2xl md:text-3xl font-medium"
            style={{ color: "#132968" }}
          >
            Exclusive Top Tours
          </h2>
        </div>

        {/* Tour cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pagedTours.map((tour, idx) => (
            <Link key={idx} href="/" className="block group">
              <div className="bg-white rounded-lg overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.25)] transition-shadow">
                <div className="relative aspect-[3/3] overflow-hidden">
                  {/* Tour image */}
                  <img
                    src={tour.img}
                    alt={tour.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient overlay (for default state) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-0" />

                  {/* Favorite button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="absolute top-3 right-3 z-20 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                    aria-label="Add to favorites"
                  >
                    <Heart size={18} weight="regular" className="text-gray-700" />
                  </button>

                  {/* Text overlay - on image, turns white on hover (like hotel slider) */}
                  <div className="absolute inset-x-0 bottom-0 z-10 ">
                    <div className=" group-hover:bg-white text-white group-hover:text-[#132968] transition-colors duration-300">
                      <div className="px-4 py-3 md:py-4">
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <span className="flex items-center gap-1.5 text-sm sm:text-base">
                            <ArrowLeftRight size={14} strokeWidth={2} />
                            {tour.location}
                          </span>
                          <span className="flex items-center gap-1 text-xs sm:text-sm flex-shrink-0">
                            <Star size={16} weight="fill" className="text-amber-400" />
                            <span>
                              {tour.rating}({tour.reviews})
                            </span>
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base mb-2 text-center leading-snug line-clamp-2">
                          {tour.title}
                        </h3>
                        <div className="text-sm sm:text-base text-center">
                          <span className="text-xs sm:text-sm opacity-80">
                            from{" "}
                          </span>
                          <span className="font-bold text-base sm:text-lg">
                            {symbol}
                            {tour.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </FullContainer>
  );
}
