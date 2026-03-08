import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FaqsBanner from '../components/Faqs/FaqsBanner';

export default function FaqsPage() {
  return (
    <div className="bg-[#eaf1f7] min-h-screen">
        <Navbar/>
      <FaqsBanner />
      <Footer/>
    </div>
  );
} 