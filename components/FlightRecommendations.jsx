"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "./common/Container";
import FullContainer from "./common/FullContainer";
import { ArrowLeftRight, ChevronRight } from "lucide-react";
import { getSelectedCurrency, CURRENCIES } from "@/utils/priceConverter";

// Safe fallback city if IP lookup fails
const FALLBACK_CITY = "Islamabad";

// Simple mapping from city name → departure airport metadata
const CITY_TO_AIRPORT = {
  Islamabad: { code: "ISB", fullName: "Islamabad (ISB)" },
  Dubai: { code: "DXB", fullName: "Dubai (DXB)" },
  "Kuala Lumpur": { code: "KUL", fullName: "Kuala Lumpur (KUL)" },
  Bangkok: { code: "BKK", fullName: "Bangkok (BKK)" },
  Singapore: { code: "SIN", fullName: "Singapore (SIN)" },
  Penang: { code: "PEN", fullName: "Penang (PEN)" },
};

// Base flight data (default)
const DEFAULT_FLIGHTS = [
  {
    city: "Dubai",
    label: "Jeddah, Saudi Arabia",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80",
    price: 435,
  },
  {
    city: "Kuala Lumpur",
    label: "Langkawi, Malaysia",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    price: 125,
  },
  {
    city: "Bangkok",
    label: "Phuket, Thailand",
    img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    price: 89,
  },
  {
    city: "Bali Denpasar",
    label: "Kuala Lumpur, Malaysia",
    img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    price: 211,
  },
  {
    city: "Singapore",
    label: "Bali, Indonesia",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80",
    price: 156,
  },
  {
    city: "Penang",
    label: "Phnom Penh, Cambodia",
    img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    price: 198,
  },
  {
    city: "Dubai",
    label: "Riyadh, Saudi Arabia",
    img: "https://images.unsplash.com/photo-1545243424-0ce743321e11?auto=format&fit=crop&w=400&q=80",
    price: 240,
  },
  {
    city: "Singapore",
    label: "Jakarta, Indonesia",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80",
    price: 175,
  },
];

// Example regional variations re-using the same shape
const MIDDLE_EAST_FLIGHTS = DEFAULT_FLIGHTS;
const SOUTHEAST_ASIA_FLIGHTS = [
  DEFAULT_FLIGHTS[1],
  DEFAULT_FLIGHTS[2],
  DEFAULT_FLIGHTS[3],
  DEFAULT_FLIGHTS[4],
  DEFAULT_FLIGHTS[5],
  DEFAULT_FLIGHTS[0],
  DEFAULT_FLIGHTS[6],
  DEFAULT_FLIGHTS[7],
];

// Location → flights mapping (keys are lowercase)
const LOCATION_TO_FLIGHTS = {
  default: DEFAULT_FLIGHTS,
  dubai: MIDDLE_EAST_FLIGHTS,
  "united arab emirates": MIDDLE_EAST_FLIGHTS,
  uae: MIDDLE_EAST_FLIGHTS,
  "kuala lumpur": SOUTHEAST_ASIA_FLIGHTS,
  malaysia: SOUTHEAST_ASIA_FLIGHTS,
  bangkok: SOUTHEAST_ASIA_FLIGHTS,
  thailand: SOUTHEAST_ASIA_FLIGHTS,
};

// Mapping from card content → flight search route params
const FLIGHT_SEARCH_ROUTE_MAP = {
  "Dubai|Jeddah, Saudi Arabia": {
    depAirport: "DXB",
    arrAirport: "JED",
    from: "Dubai (DXB)",
    to: "Jeddah (JED)",
  },
  "Kuala Lumpur|Langkawi, Malaysia": {
    depAirport: "KUL",
    arrAirport: "LGK",
    from: "Kuala Lumpur (KUL)",
    to: "Langkawi (LGK)",
  },
  "Bangkok|Phuket, Thailand": {
    depAirport: "BKK",
    arrAirport: "HKT",
    from: "Bangkok (BKK)",
    to: "Phuket (HKT)",
  },
  "Bali Denpasar|Kuala Lumpur, Malaysia": {
    depAirport: "DPS",
    arrAirport: "KUL",
    from: "Bali Denpasar (DPS)",
    to: "Kuala Lumpur (KUL)",
  },
  "Singapore|Bali, Indonesia": {
    depAirport: "SIN",
    arrAirport: "DPS",
    from: "Singapore (SIN)",
    to: "Bali (DPS)",
  },
  "Penang|Phnom Penh, Cambodia": {
    depAirport: "PEN",
    arrAirport: "PNH",
    from: "Penang (PEN)",
    to: "Phnom Penh (PNH)",
  },
  "Dubai|Riyadh, Saudi Arabia": {
    depAirport: "DXB",
    arrAirport: "RUH",
    from: "Dubai (DXB)",
    to: "Riyadh (RUH)",
  },
  "Singapore|Jakarta, Indonesia": {
    depAirport: "SIN",
    arrAirport: "CGK",
    from: "Singapore (SIN)",
    to: "Jakarta (CGK)",
  },
};

function selectFlightsForLocation(locationData) {
  if (!locationData) return LOCATION_TO_FLIGHTS.default;

  const { city, country_name, country } = locationData;
  const keysToTry = [
    city && city.toLowerCase(),
    country_name && country_name.toLowerCase(),
    country && country.toLowerCase(),
  ].filter(Boolean);

  for (const key of keysToTry) {
    if (LOCATION_TO_FLIGHTS[key]) {
      return LOCATION_TO_FLIGHTS[key];
    }
  }

  return LOCATION_TO_FLIGHTS.default;
}

function buildSearchHrefFromFlight(flight) {
  const hasNormalizedRoute =
    flight.depAirport && flight.arrAirport && flight.from && flight.to;

  const route = hasNormalizedRoute
    ? {
        depAirport: flight.depAirport,
        arrAirport: flight.arrAirport,
        from: flight.from,
        to: flight.to,
      }
    : FLIGHT_SEARCH_ROUTE_MAP[`${flight.city}|${flight.label}`];

  if (!route) {
    return "/flight/flightSearch";
  }

  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 1);
  const depDate = departureDate.toISOString().slice(0, 10);

  const returnDate = new Date(departureDate);
  returnDate.setDate(returnDate.getDate() + 7);
  const retDate = returnDate.toISOString().slice(0, 10);

  return {
    pathname: "/flight/flightSearch",
    query: {
      depAirport: route.depAirport,
      arrAirport: route.arrAirport,
      depDate,
      returnDate: retDate,
      from: route.from,
      to: route.to,
      flightType: "round-trip",
      adult: "1",
      child: "0",
      infant: "0",
      flightClass: "Economy",
    },
  };
}

async function fetchLocationByIP() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) return null;
    const data = await response.json();
    return {
      city: data?.city || null,
      country_name: data?.country_name || null,
      country: data?.country || null,
    };
  } catch {
    return null;
  }
}

function buildFlightsForCity(locationData) {
  const effectiveCity =
    (locationData && locationData.city) || FALLBACK_CITY;

  const regionalFlights =
    selectFlightsForLocation(
      locationData || { city: FALLBACK_CITY }
    ) || DEFAULT_FLIGHTS;

  const seenLabels = new Set();
  const templateFlights = [];

  for (const f of [...regionalFlights, ...DEFAULT_FLIGHTS]) {
    if (!f || !f.label) continue;
    if (seenLabels.has(f.label)) continue;
    seenLabels.add(f.label);
    templateFlights.push(f);
    if (templateFlights.length === 8) break;
  }

  const departureMeta =
    CITY_TO_AIRPORT[effectiveCity] || CITY_TO_AIRPORT[FALLBACK_CITY];

  return templateFlights.map((flight, index) => {
    const templateKey = `${flight.city}|${flight.label}`;
    const templateRoute = FLIGHT_SEARCH_ROUTE_MAP[templateKey];

    return {
      ...flight,
      id: `${effectiveCity}-${index}-${templateKey}`,
      fromCity: effectiveCity,
      city: effectiveCity,
      depAirport: departureMeta?.code,
      from: departureMeta?.fullName,
      arrAirport: templateRoute?.arrAirport,
      to: templateRoute?.to || flight.label,
    };
  });
}

function ExclusiveFlightCard({ flight, symbol, layoutClass }) {
  return (
    <Link
      href={buildSearchHrefFromFlight(flight)}
      className={`group relative block overflow-hidden rounded-3xl min-h-[200px]
                transition-all duration-300 ease-out
                 hover:shadow-[0_10px_32px_rgba(15,23,42,0.25)]   shadow-[0_18px_45px_rgba(15,23,42,0.35)]
                ${layoutClass}`}
    >
      <div className="relative w-full h-full transition-all duration-300 ease-out group-hover:scale-105">
      <Image
        src={flight.img}
        alt={flight.label}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover   "
        priority={false}
      />
      </div>


      {/* Image darkening gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent transition-opacity duration-300 group-hover:opacity-60" />

      {/* Text block: on hover background becomes white behind text */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="inline-block w-full group-hover:bg-white text-white group-hover:text-[#132968]  px-4 py-3 sm:px-5 sm:py-4 transition-colors duration-300">
          <div className="flex  gap-2 text-xs sm:text-sm mb-1 text-center justify-center items-center">
            <span className="font-semibold">
              {flight.fromCity || flight.city}
            </span>
            <ArrowLeftRight className="w-4 h-4   " />
            <span className="truncate">{flight.label}</span>
            <ChevronRight className="w-4 h-4" />
          </div>

          <div className="font-bold text-sm sm:text-lg text-center">
            Tickets from {flight.price} {symbol}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FlightRecommendations() {
  const [currency, setCurrency] = useState("EUR");
  const [recommendedFlights, setRecommendedFlights] = useState(() =>
    buildFlightsForCity({ city: FALLBACK_CITY })
  );

  useEffect(() => {
    setCurrency(getSelectedCurrency());
    const handleCurrencyChange = () =>
      setCurrency(getSelectedCurrency());

    window.addEventListener("currencyChanged", handleCurrencyChange);

    const initLocationAndFlights = async () => {
      const location = await fetchLocationByIP();
      const flightsForCity = buildFlightsForCity(location);
      setRecommendedFlights(flightsForCity);
    };

    initLocationAndFlights();

    return () => {
      window.removeEventListener("currencyChanged", handleCurrencyChange);
    };
  }, []);

  const symbol = CURRENCIES[currency]?.symbol ?? "€";

  const primaryFlights = recommendedFlights.slice(0, 4);
  let secondaryFlights = recommendedFlights.slice(4, 8);

  if (secondaryFlights.length < 4 && recommendedFlights.length > 4) {
    const needed = 4 - secondaryFlights.length;
    const fillers = recommendedFlights.slice(0, needed);
    secondaryFlights = [...secondaryFlights, ...fillers];
  }

  return (
    <FullContainer
      className="pt-12 md:pt-16 pb-6 md:pb-8"
      style={{ backgroundColor: "#f3f4fb" }}
    >
      <Container className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h2
            className="text-2xl md:text-3xl font-medium"
            style={{ color: "#132968" }}
          >
            Exclusive Flight Recommendations
          </h2>
        </div>

        {/* PRIMARY masonry grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[200px] lg:grid-flow-dense">
          {primaryFlights.map((flight, idx) => {
            const layoutClass =
              idx === 0
                ? "lg:col-start-1 lg:row-start-1 lg:row-span-2"
                : idx === 1
                ? "lg:col-start-2 lg:row-start-1"
                : idx === 2
                ? "lg:col-start-2 lg:row-start-2"
                : idx === 3
                ? "lg:col-start-3 lg:row-start-1 lg:row-span-2"
                : idx === 4
                ? "lg:col-start-1 lg:row-start-3"
                : idx === 5
                ? "lg:col-start-2 lg:row-start-3"
                : "";

            return (
              <ExclusiveFlightCard
                key={flight.id || `${flight.city}-${idx}`}
                flight={flight}
                symbol={symbol}
                layoutClass={layoutClass}
              />
            );
          })}
        </div>
        {/* Secondary masonry grid */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[200px] lg:grid-flow-dense">
          {secondaryFlights.map((flight, idx) => {
            const layoutClass =
              idx === 0
                ? "lg:col-start-1 lg:row-start-1 lg:row-span-2"
                : idx === 1
                ? "lg:col-start-2 lg:row-start-1"
                : idx === 2
                ? "lg:col-start-2 lg:row-start-2"
                : idx === 3
                ? "lg:col-start-3 lg:row-start-1 lg:row-span-2"
                : idx === 4
                ? "lg:col-start-1 lg:row-start-3"
                : idx === 5
                ? "lg:col-start-2 lg:row-start-3"
                : "";

            return (
              <ExclusiveFlightCard
                key={flight.id || `secondary-${flight.city}-${idx}`}
                flight={flight}
                symbol={symbol}
                layoutClass={layoutClass}
              />
            );
          })}
        </div>
      </Container>
    </FullContainer>
  );
}
