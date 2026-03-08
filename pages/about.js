import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AboutBanner from "../components/About/AboutBanner";
import ServiceProfile from "../components/About/ServiceProfile";
import OurTechnologies from "../components/About/OurTechnologies";
import ContactForm from "../components/About/ContactForm";

export default function About() {
  return (
    <>
      <Navbar />
      <AboutBanner />
      <ServiceProfile />
      <OurTechnologies />
      <ContactForm />
      <Footer />
    </>
  );
} 