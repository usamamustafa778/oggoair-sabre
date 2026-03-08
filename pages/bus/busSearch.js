import SearchSection from "@/components/common/SearchSection";
import Navbar from "@/components/Navbar";
import BusSearchHeader from "@/components/BusSearch/BusSearchHeader";
import FlightMap from "@/components/FlightMap";
import BusFilters from "@/components/BusSearch/BusFilters";
import BusResults from "@/components/BusSearch/BusResults";
import Container from "@/components/common/Container";
import React, { useState } from "react";
import TravelPartnersSection from "@/components/TravelPartnersSection";
import Footer from "@/components/Footer";

export default function BusSearch() {
    // Add state for map coordinates
    const [mapFrom, setMapFrom] = useState(null); // [lat, lng] or null
    const [mapTo, setMapTo] = useState(null);     // [lat, lng] or null

    const [filters, setFilters] = useState({
        stops: [],
        price: [0, 1000],
        departure: [0, 24],
        arrival: [0, 24],
        departureStations: [],
        arrivalStations: [],
        duration: [0, 12],
        companies: []
    });

    return (
        <>
            <Navbar />
            <div className=" pt-34 bg-primary-bg">
                <div className="">
                    <BusSearchHeader />
                    <div className="b -mt-[50px] lg:-mt-[235px]">
                        <SearchSection mainHeader={true} mapFrom={mapFrom} mapTo={mapTo} setMapFrom={setMapFrom} setMapTo={setMapTo} />
                    </div>
                </div>
                <div className="bg-[#E4ECEF] min-h-screen pb-8">
                    <Container>
                        <div className="flex flex-col lg:flex-row pt-7 gap-8">
                            {/* Left sidebar - Filters and Map */}
                            <div className="lg:w-[33.5%] space-y-6">
                                <FlightMap from={mapFrom} to={mapTo} />
                                <BusFilters filters={filters} setFilters={setFilters} />
                            </div>

                            {/* Main content - Bus results */}
                            <div className="lg:w-[66.5%]">
                                <BusResults filters={filters} />
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
            <TravelPartnersSection />
            <Footer />
        </>
    )
} 