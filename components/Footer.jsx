import React from "react";
import FullContainer from "./common/FullContainer";
import Container from "./common/Container";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { CaretDown } from "phosphor-react";
import { Check, FacebookIcon, InstagramIcon, LinkedinIcon } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("GH");
  const langRef = useRef(null);

  const flag = [
    {
      countryCode: "GH",
      name: "Ghana",
      flag: "/st-images/flags/ghana.png",
    },
    {
      countryCode: "RO",
      name: "Romania",
      flag: "/st-images/flags/romania-rounded.png",
    },
    {
      countryCode: "RW",
      name: "Rwanda",
      flag: "/st-images/flags/rwanda-rounded.png",
    },
  ];

  const BRANCH_ADDRESSES = {
    GH: {
      line1: "Oggotrip Ghana",
      line2: "K. oppong close, House No.1 Comm. 25 Annex- Tema Ghana",
      website: "https://www.oggotrip.travel",
      email: "support@oggotrip.travel",
    },
    RO: {
      line1: "Oggotrip Romania",
      line2: "Bucureşti Sectorul 2, Calea MOŞILOR, Nr. 195, Bloc 1bis, Etaj 5, Apartament unit. 17",
      website: "https://www.oggotrip.com",
      email: "support@oggotrip.com",
    },
    RW: {
      line1: "Oggotrip Rwanda",
      line2: "KK 15 Rd 36, Kicukiro – Kigali",
      website: "https://www.oggotrip.africa",
      email: "support@oggotrip.africa",
    },
  };

  const selectedFlagData = flag.find(
    (item) => item.countryCode === selectedLanguage
  );

  const handleLanguageSelect = (countryCode) => {
    setSelectedLanguage(countryCode);
    setLangOpen(false);
  };

  const handleLanguageToggle = () => {
    setLangOpen(!langOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <FullContainer className="pt-10 md:pt-20">
        <div className="border-t w-full bg-[#FBFCFE] border-gray-200">
          <Container className="">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20">
              {/* Left: Mobile app illustration */}
              <div className="flex justify-center lg:justify-start order-1">
                <div className="relative w-full bg-white flex items-center justify-center py-8">
                  <Image
                    src="/img/mobile-app-qr.png"
                    alt="Oggoair mobile app"
                    width={500}
                    height={500}
                    className="w-full max-w-[520px] h-auto object-contain"
                  />
                </div>
              </div>

              {/* Right: App promotion */}
              <div className="flex flex-col justify-center order-2 text-center lg:text-left">
                <h2
                  className="text-2xl md:text-3xl lg:text-2xl font-bold mb-6 leading-tight"
                  style={{ color: "#132968" }}
                >
                  Get more out of oggotrip with our mobile app
                </h2>

                {/* Features - 2x2 bullet grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-9">
                  {[
                    "Download boarding passes",
                    "One click bookings",
                    "Get exclusive offers and prices",
                    "Trip notifications",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#F1FFB8] flex items-center justify-center">
                        <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#132968] flex items-center justify-center">
                          <Check
                            size={18}
                            style={{ color: "#D4FF5A" }}
                            strokeWidth={3}
                          />
                        </span>
                      </span>
                      <span
                        className="font-medium text-base md:text-lg"
                        style={{ color: "#132968" }}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* App store buttons */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <a href="#" className="block">
                    <Image
                      src="/st-images/footer1.webp"
                      alt="Download on the App Store"
                      width={160}
                      height={52}
                      className="h-12 w-auto object-contain hover:opacity-90 transition-opacity"
                    />
                  </a>
                  <a href="#" className="block">
                    <Image
                      src="/st-images/footer2.png"
                      alt="GET IT ON Google Play"
                      width={160}
                      height={52}
                      className="h-12 w-auto object-contain hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </FullContainer>

      {/* Newsletter / subscribe banner */}
      <FullContainer className="bg-[#132968] py-10">
        <Container>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-medium leading-7 sm:leading-8 lg:leading-9">
                We know how to save on vacations
                <br />
                and find discounts, and we'll show you how.
              </h2>
            </div>

            <div className="w-full max-w-xl space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 bg-[#F1FFB8] rounded-full px-4 py-2">
                <input
                  type="email"
                  placeholder="Where to send letters?"
                  className="flex-1 bg-transparent px-2 sm:px-4 py-2.5 sm:py-3 rounded-full focus:outline-none text-[#132968] text-xs sm:text-sm placeholder:text-[#132968]"
                />
                <button
                  type="submit"
                  className="bg-[#D4FF5A] text-[#132968] text-base sm:text-lg font-semibold rounded-full px-6 sm:px-8 py-2.5 sm:py-3 whitespace-nowrap hover:bg-[#c4ef4a] transition-colors"
                >
                  Subscribe
                </button>
              </div>

              <label
                htmlFor="privacy-agreement"
                className="flex items-center gap-2 text-white text-sm sm:text-base cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="privacy-agreement"
                  className="w-4 h-4 rounded border-white/60 text-[#D4FF5A] focus:ring-[#D4FF5A]"
                />
                <span>I agree to the privacy statement</span>
              </label>
            </div>
          </div>
        </Container>
      </FullContainer>

      <FullContainer>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 py-8 border-y border-gray-300 pt-10">
            {/* Quick links */}
            <div className="">
              <div className="font-semibold text-primary-text text-lg sm:text-xl mb-3 w-fit relative">
                Quick Links
              </div>
              <ul className="text-primary-text space-y-[10px] text-base sm:text-lg">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:underline">
                    About us
                  </Link>
                </li>
                <li>
                  <Link href="/promo" className="hover:underline">
                    Promo
                  </Link>
                </li>
                <li>
                  <Link href="/airline-info" className="hover:underline">
                    Airline Information
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="">
              <div className="font-semibold relative text-primary-text text-lg sm:text-xl mb-3 w-fit">
                Support
              </div>
              <ul className="text-primary-text space-y-[10px] text-base sm:text-lg">
                <li>
                  <Link href="/faqs" className="hover:underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/helpCenter" className="hover:underline">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Payment Methods */}
            <div>
              <div className="font-semibold text-primary-text text-lg sm:text-xl mb-3 w-fit relative">
                Payment Methods
              </div>
              <div className="grid grid-cols-3 gap-2 w-fit">
                {[1, 2, 3, 4, 5, 6].map((item, index) => (
                  <Image
                    key={index}
                    src={`/img/payment-methods/${item}.png`}
                    alt="Payment method"
                    width={100}
                    height={100}
                    unoptimized
                    className="w-fit h-10 shadow-md rounded-md object-contain"
                  />
                ))}
              </div>
              <div className="font-semibold text-primary-text text-lg sm:text-xl mt-10 mb-3 w-fit relative">
                Travel Partners
              </div>
              <div className="flex items-center gap-x-10 gap-y-5 flex-wrap">
                {[1, 2, 3].map((item, index) => (
                  <Image
                    key={index}
                    src={`/img/partner/${item}.png`}
                    alt="Travel partner"
                    width={100}
                    height={100}
                    unoptimized
                    className="w-fit scale-105 h-6 object-contain"
                  />
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <div className="font-semibold text-primary-text text-lg sm:text-xl mb-3 w-fit relative">
                Social Links
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <span className="bg-[#1a3166] rounded-full w-8 h-8 flex items-center justify-center">
                    <FacebookIcon size={19} className="text-white" strokeWidth={2.2} />
                  </span>
                </Link>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <span className="bg-[#1a3166] rounded-full w-8 h-8 flex items-center justify-center">
                    <InstagramIcon size={19} className="text-white" strokeWidth={2.2} />
                  </span>
                </Link>
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <span className="bg-[#1a3166] rounded-full w-8 h-8 flex items-center justify-center">
                    <LinkedinIcon size={19} className="text-white" strokeWidth={2.2} />
                  </span>
                </Link>
              </div>
            </div>

            {/* Worldwide Network with country dropdown */}
            <div className="flex flex-col items-start gap-2">
              <div className="font-semibold text-primary-text text-lg sm:text-xl mb-3 w-fit">
                Worldwide Network
              </div>
              <div
                className="flex flex-col gap-2 ext-primary-text space-y-[10px] text-base sm:text-lg"
                ref={langRef}
              >
                <div className="relative inline-block w-fit">
                  <button
                    onClick={handleLanguageToggle}
                    className="flex items-center gap-2 bg-[#132968] rounded-full px-4 py-2.5 text-white w-fit hover:opacity-95 transition-opacity"
                  >
                    <div className="rounded-full w-7 h-7 overflow-hidden flex-shrink-0">
                      <Image
                        src={selectedFlagData?.flag}
                        alt={selectedFlagData?.name}
                        width={28}
                        height={28}
                        className="rounded-full w-7 h-7 object-cover"
                      />
                    </div>
                    <span className="text-white text-base font-medium">
                      {selectedFlagData?.name}
                    </span>
                    <CaretDown
                      size={14}
                      weight="bold"
                      className="text-white flex-shrink-0 [&>path]:stroke-[2.5]"
                    />
                  </button>
                  {langOpen && (
                    <div className="absolute left-0 top-full mt-1 w-full min-w-[180px] border border-gray-300 bg-white rounded-xl shadow-lg z-20 py-2">
                      {flag.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => handleLanguageSelect(item.countryCode)}
                          className="flex items-center justify-between text-primary-text text-sm gap-3 px-4 py-2.5 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <div className="flex items-center text-primary-text gap-3">
                            <div className="rounded-full w-6 h-6 overflow-hidden flex-shrink-0">
                              <Image
                                src={item.flag}
                                alt={item.name}
                                width={24}
                                height={24}
                                className="rounded-full w-6 h-6 object-cover"
                              />
                            </div>
                            {item.name}
                          </div>
                          {selectedLanguage === item.countryCode && (
                            <Check className="w-4 h-4 text-primary-text" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {BRANCH_ADDRESSES[selectedLanguage] && (
                  <>
                    <p className="text-primary-text text-base sm:text-lg font-medium">
                      {BRANCH_ADDRESSES[selectedLanguage].line1}
                    </p>
                    <p className="text-primary-text text-base sm:text-lg">
                      {BRANCH_ADDRESSES[selectedLanguage].line2}
                    </p>
                    {BRANCH_ADDRESSES[selectedLanguage].website && (
                      <a
                        href={BRANCH_ADDRESSES[selectedLanguage].website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1A83FF] text-base sm:text-lg font-medium hover:underline mb-1 block"
                      >
                        {BRANCH_ADDRESSES[selectedLanguage].website.replace("https://", "")}
                      </a>
                    )}
                    <div className="flex flex-col gap-1">
                      <a
                        href={`mailto:${BRANCH_ADDRESSES[selectedLanguage].email}`}
                        className="text-[#1A83FF] text-base sm:text-lg font-medium hover:underline"
                      >
                        {BRANCH_ADDRESSES[selectedLanguage].email}
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-10 py-6">
            {/* Logo + tagline */}
            <div className="flex flex-col items-center md:items-start justify-center">
              <Image
                src="/logo.png"
                alt="oggoair"
                width={500}
                height={500}
                className="w-[110px] sm:w-[130px] md:w-[150px]"
              />
              <span className="text-primary-text text-xs sm:text-sm md:text-base mt-1">
                (official website of OGGO Travel Platform Ltd)
              </span>
            </div>

            {/* Email contact */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-primary-text text-base sm:text-lg">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden bg-white">
                <Image
                  src="/benefits/secure-payment.png"
                  alt="24/7 support"
                  width={48}
                  height={48}
                  className="w-11 h-11 object-contain"
                />
              </div>
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-sm sm:text-base text-gray-500">
                  Email us at:
                </span>
                <span className="font-semibold text-primary-text text-base sm:text-lg">
                  support@oggotrip.com
                </span>
              </div>
            </div>

            {/* WhatsApp contact */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-primary-text text-base sm:text-lg">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F5F7FB] flex items-center justify-center overflow-hidden">
                <Image
                  src="/benefits/whatsapp.png"
                  alt="WhatsApp"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-sm sm:text-base text-gray-500">
                  Get support via WhatsApp:
                </span>
                <span className="font-semibold text-primary-text text-lg sm:text-xl">
                  07377300000
                </span>
              </div>
            </div>
          </div>
        </Container>
      </FullContainer>

      <FullContainer className="bg-[#132968]">
        <Container>
          <div className="flex items-center justify-between gap-4 py-3 border-t border-white/20">
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-white text-sm sm:text-lg py-4 text-center sm:text-left">
              <a href="#" className="underline">
                Refund & Cancelation Policy
              </a>
              <a href="#" className="underline">
                Terms & Conditions
              </a>
              <a href="#" className="underline">
                Privacy Policy
              </a>
            </div>
            <div className="text-white text-sm sm:text-lg mt-2 md:mt-0 text-center">
              ©2024 OggoAir. – All Rights Reserved
            </div>
          </div>
        </Container>
      </FullContainer>
    </>
  );
}
