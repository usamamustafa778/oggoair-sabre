import SearchSection from "@/components/common/SearchSection";
import Navbar from "@/components/Navbar";
import FlightSearchHeader from "@/components/FlightSearch/FlightSearchHeader";
import FlightMap from "@/components/FlightMap";
import FlightFilters from "@/components/FlightSearch/FlightFilters";
import FlightResults from "@/components/FlightSearch/FlightResults";
import Container from "@/components/common/Container";
import React, { useState } from "react";
import TravelPartnersSection from "@/components/TravelPartnersSection";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, Pencil } from "phosphor-react";

export default function ReturnFlights(){
  const [filters, setFilters] = useState({
    stops: [],
    layover: [0, 24],
    luggage: [],
    airlines: [],
    ticketExchange: [],
    amenities: [],
    transitTime: [0, 12],
    language: []
  });

  return(
        <>
            <Navbar/>
            <div className="">
                <FlightSearchHeader/>
                <SearchSection mainHeader={true} type="flight"/>
                
                <div className="bg-[#E4ECEF] min-h-screen pb-8">
                    <Container>
                      

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left sidebar - Filters and Map */}
                            <div className="w-full lg:w-[33.5%] lg:min-w-[400px] lg:max-w-[400px] flex-shrink-0 space-y-6">
                                <FlightMap />
                                <FlightFilters filters={filters} setFilters={setFilters} />
                            </div>
                            
                            {/* Main content - Flight results */}
                            <div className="w-full lg:flex-1 lg:min-w-0">
                                <FlightResults currentView="return" filters={filters} />
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
            <TravelPartnersSection/>
            <Footer/>
        </>
    )
} 