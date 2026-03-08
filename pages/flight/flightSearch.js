import Navbar from "@/components/Navbar";
import SearchSection from "@/components/common/SearchSection";
import FlightSearchHeader from "@/components/FlightSearch/FlightSearchHeader";
import FlightFilters from "@/components/FlightSearch/FlightFilters";
import FlightResults from "@/components/FlightSearch/FlightResults";
import LoadingComponent from "@/components/common/LoadingComponent";
import Container from "@/components/common/Container";
import React, { useState, useEffect } from "react";
import FlightMap from "@/components/FlightMap";
import { useRouter } from "next/router";
import Seo from "@/components/Seo";

export default function FlightSearch() {
  const router = useRouter();

  // Add state for map coordinates
  const [mapFrom, setMapFrom] = useState(null);
  const [mapTo, setMapTo] = useState(null);
  const [showesearch, setShowesearch] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Extract coordinates from URL parameters and update map state
  useEffect(() => {
    if (router.isReady) {
      const { fromLat, fromLng, toLat, toLng } = router.query;

      if (fromLat && fromLng) {
        setMapFrom([parseFloat(fromLat), parseFloat(fromLng)]);
      }
      if (toLat && toLng) {
        setMapTo([parseFloat(toLat), parseFloat(toLng)]);
      }

      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [router.isReady, router.query]);

  const [filters, setFilters] = useState({
    stops: [],
    layover: [0, 24],
    luggage: [],
    airlines: [],
    ticketExchange: [],
    amenities: [],
    transitTime: [0, 12],
    language: [],
    stopsType: "any",
    overnightStopovers: [],
    selfTransfer: [],
    cabinBaggage: 0,
    checkedBaggage: 0,
    excludedCountries: [],
    departureTime: [0, 24],
    arrivalTime: [0, 24],
    maxTravelTime: [0, 48],
    stopoverDuration: [2, 24],
    priceRange: [0, 2000],
    selectedDay: undefined,
    selfTransferHack: [],
    throwawayTicketing: [],
    hiddenCities: [],
    kayakOnly: [],
    priceAlerts: false,
  });

  const [availableAirlines, setAvailableAirlines] = useState([]);

  // Function to handle edit search
  const handleEditSearch = () => {
    setShowesearch(!showesearch);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Function to handle search update in edit mode
  const handleSearchUpdate = () => {
    setShowesearch(false); // Hide the search section after update
    // The page will reload automatically due to router.push
  };

  // Function to handle airlines update from FlightResults
  const handleAirlinesUpdate = (airlines) => {
    // airlines may be array of strings or objects; normalize to objects
    const normalized = (airlines || []).map((a) =>
      typeof a === "string"
        ? { name: a, logo: "/st-images/flightSearch/a.png" }
        : a
    );
    setAvailableAirlines(normalized);

    // Clear any selected airlines that are no longer available
    setFilters((prevFilters) => {
      const currentSelectedAirlines = prevFilters.airlines || [];
      const validNames = new Set(normalized.map((a) => a.name));
      const validAirlines = currentSelectedAirlines.filter((airline) =>
        validNames.has(airline)
      );

      if (validAirlines.length !== currentSelectedAirlines.length) {
        return {
          ...prevFilters,
          airlines: validAirlines,
        };
      }

      return prevFilters;
    });
  };

  // Show loading state while page is initializing
  if (pageLoading) {
    return (
      <>
        <Seo
          title="Search Flights"
          description="Compare and book cheap flights from hundreds of airlines. Find the best flight deals for your destination on OggoAir."
        />
        <Navbar />
        <LoadingComponent option="flight-search" />
      </>
    );
  }

  return (
    <div className="bg-gray-50">
      <Seo
        title="Search Flights"
        description="Compare and book cheap flights from hundreds of airlines. Find the best flight deals for your destination on OggoAir."
      />
      <Navbar />
      <div className="pt-24">
        <div className="relative z-[999] ">
          <FlightSearchHeader
            searchParams={router.query}
            onEditClick={handleEditSearch}
            showEditMode={showesearch}
            onCloseEdit={() => setShowesearch(false)}
          />

          {showesearch && (
            <div className="mt-[-34px]  ">
              <SearchSection
                bg={false}
                mainHeader={true}
                isEditMode={true}
                showServiceTabs={false}
                type="flight"
                mapFrom={mapFrom}
                mapTo={mapTo}
                setMapFrom={setMapFrom}
                setMapTo={setMapTo}
                dropdown={true}
                onSearchUpdate={handleSearchUpdate}
              />
            </div>
          )}
        </div>

        <div className={`min-h-screen pb-8 relative z-99 ${showesearch ? "pt-4" : "pt-10"}`}>
          <Container>
            <div className="flex flex-col lg:flex-row gap-8 ">
              {/* Left sidebar - Filters and Map */}
              <div className="w-full lg:w-[25%] flex-shrink-0 space-y-6 ">
                <FlightMap from={mapFrom} to={mapTo} />
                <FlightFilters
                  filters={filters}
                  setFilters={setFilters}
                  availableAirlines={availableAirlines}
                />
              </div>

              {/* Main content - Flight results */}
              <div className="w-full lg:w-[75%] lg:min-w-0  ">
                <FlightResults
                  filters={filters}
                  onAirlinesUpdate={handleAirlinesUpdate}
                />
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
}
