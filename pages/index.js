import React from "react";
import Navbar from "../components/Navbar";
import Promotion from "../components/Promotion";
import FlightRecommendations from "../components/FlightRecommendations";
import HotelRecommendations from "../components/HotelRecommendations";
import TopTours from "../components/TopTours";
import FeaturesAndBenefits from "../components/FeaturesAndBenefits";
import Footer from "../components/Footer";
import SearchSection from "../components/common/SearchSection";
import TravelPartnersSection from "@/components/TravelPartnersSection";
import Seo from "@/components/Seo";

export default function Home() {
  return (
    <>
      <Seo
        title="Cheap Flights, Hotels & Bus Tickets"
        description="Book cheap flights, hotels, and bus tickets worldwide. Compare prices from hundreds of airlines and travel providers to find the best deals on OggoAir."
      />
      <Navbar />
      <main className="pt-28 md:pt-32">
        <SearchSection />
        <Promotion />
        <FlightRecommendations />
        <HotelRecommendations />
        <TopTours />
        <FeaturesAndBenefits />
        <TravelPartnersSection />
        <Footer />
      </main>
    </>
  );
}
