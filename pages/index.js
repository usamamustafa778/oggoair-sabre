import React from "react";
import Navbar from "../components/Navbar";
import Promotion from "../components/Promotion";
import Features from "../components/Features";
import FlightRecommendations from "../components/FlightRecommendations";
import HotelRecommendations from "../components/HotelRecommendations";
import Footer from "../components/Footer";
import SearchSection from "../components/common/SearchSection";
import SecurePayement from "@/components/SecurePayement";
import TravelPartnersSection from "@/components/TravelPartnersSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <SearchSection bg={true} />
      <Promotion />
      <Features />
      <FlightRecommendations />
      <HotelRecommendations />
      <SecurePayement />
      <TravelPartnersSection />
      <Footer />
    </>
  );
}
