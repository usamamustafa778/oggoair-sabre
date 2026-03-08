import React from "react";
import FullContainer from "./common/FullContainer";
import Container from "./common/Container";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { CaretDown } from "phosphor-react";
import { Check, Facebook, Instagram, Linkedin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("US");
  const langRef = useRef(null);

  const flag = [
    {
      countryCode: "US",
      name: "English (US)",
      flag: "/st-images/flags/usa.webp",
    },
    // {
    //   countryCode: "SA",
    //   name: "Jordan",
    //   flag: "/st-images/flags/jordan.webp",
    // },
    // {
    //   countryCode: "DE",
    //   name: "Germany",
    //   flag: "/st-images/flags/germany.png",
    // },
    // {
    //   countryCode: "RO",
    //   name: "Romania",
    //   flag: "/st-images/flags/romania.png",
    // },
    {
      countryCode: "TR",
      name: "Turkey",
      flag: "/st-images/flags/turkey.png",
    },
    {
      countryCode: "RU",
      name: "Russia",
      flag: "/st-images/flags/russia.png",
    },
    {
      countryCode: "GH",
      name: "Ghana",
      flag: "/st-images/flags/ghana.png",
    },
    {
      countryCode: "KE",
      name: "Kenya",
      flag: "/st-images/flags/kenya.png",
    },
    {
      countryCode: "RW",
      name: "Rwanda",
      flag: "/st-images/flags/rwanda.png",
    },
  ];

  // Get the selected flag data
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
      // Close language dropdown if click is outside
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <FullContainer className="bg-primary-bg px-4 pt-8">
        <Container className="w-full grid grid-cols-1 md:grid-cols-2 items-center justify-center h-full pt-10 overflow-hidden">
          {/* Left: Mobile image */}
          <div className="flex-shrink-0 flex items-center justify-center pr-[20px] sm:pr-[40px] md:pr-[60px] pt-[30px] sm:pt-[40px] md:pt-[50px] h-full w-[95%]">
            <Image
              src="/st-images/footer.png"
              alt="Oggoair app on mobile"
              width={1000}
              height={1000}
              className="w-full h-auto rounded-xl lg:translate-y-11 -translate-x-1 sm:-translate-x-2"
            />
          </div>
          {/* Right: App info */}
          <div className="flex flex-col justify-between gap-4 h-full w-full translate-x-[-5px] sm:translate-x-[-10px] md:translate-x-[-15px] pb-4">
            <div className="flex flex-col gap-3">
              <div className="bg-primary-green text-primary-text font-semibold rounded-full px-4 sm:px-6 py-3 sm:py-4 mb-2 inline-block text-xl sm:text-2xl md:text-[28px] w-fit">
                Our free app
              </div>
              <div className="text-primary-text text-base sm:text-lg md:text-xl mb-8 sm:mb-10 md:mb-12 leading-6 sm:leading-7 md:leading-7.5">
                Unlock a world of travel possibilities with the Oggoair app -
                the best travel app for your mobile device.
              </div>
            </div>
            <div className="flex flex-col sm:flex-wrap gap-4 sm:gap-6 md:gap-8 mb-2">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="inline-flex items-center justify-center h-fit p-2 sm:p-3 rounded-full bg-secondary-green">
                  <Image
                    src="/st-images/footericon.png"
                    width={300}
                    height={300}
                    alt="Mobile Tickets"
                    className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                  />
                </span>
                <span className="font-bold text-primary-text text-lg sm:text-xl md:text-2xl pl-1 sm:pl-2">
                  Mobile Tickets
                </span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="inline-flex items-center justify-center p-2 sm:p-3 h-fit rounded-full bg-secondary-green">
                  <Image
                    src="/st-images/footericon.png"
                    width={300}
                    height={300}
                    className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                  />
                </span>
                <span className="font-bold text-primary-text text-lg sm:text-xl md:text-2xl">
                  Mobile Tickets
                </span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="inline-flex items-center justify-center w-fit p-2 sm:p-3 rounded-full bg-secondary-green">
                  <Image
                    src="/st-images/footericon.png"
                    width={300}
                    height={300}
                    className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                  />
                </span>
                <span className="font-bold text-primary-text text-lg sm:text-xl md:text-2xl">
                  Live journey updates
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <Image
                src="/st-images/footer1.webp"
                alt="App Store"
                className="w-full h-auto"
                width={1000}
                height={1000}
              />
              <Image
                src="/st-images/footer2.png"
                alt="Google Play"
                className="w-full h-auto"
                width={1000}
                height={1000}
              />
              <Image
                src="/st-images/footer3.png"
                alt="App Gallery"
                className="w-full h-auto"
                width={1000}
                height={1000}
              />
            </div>
          </div>
        </Container>
      </FullContainer>

      <FullContainer className="py-14">
        <Container>
          <div className="space-y-6 ">
            <h2 className="text-primary-text text-lg sm:text-xl lg:text-2xl font-medium leading-7 sm:leading-8 lg:leading-9">
              We know how to save on vacations
              <br />
              and find discounts, and we'll show you how.
            </h2>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 max-w-[485px] border-3 border-white bg-primary-green/30 sm:rounded-full rounded-3xl">
                <input
                  type="email"
                  placeholder="Where to send letters?"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-full focus:outline-none focus:border-primary-green text-primary-text bg-transparent text-sm sm:text-base placeholder:text-primary-text/70"
                />
                <button
                  type="submit"
                  className="bg-primary-green text-primary-text text-base sm:text-lg rounded-full px-4 sm:px-6 py-3 sm:py-4.5 transition-colors duration-200 whitespace-nowrap"
                >
                  Subscribe
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="privacy-agreement"
                  className="w-4 h-4 accent-[#22325a] rounded"
                />
                <label
                  htmlFor="privacy-agreement"
                  className="text-primary-text text-lg"
                >
                  I agree to the privacy statement
                </label>
              </div>
            </div>
          </div>
        </Container>
      </FullContainer>

      <FullContainer>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-y border-gray-300 pt-10">
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
                <li>
                  <Link
                    href="mailto:help@oggoair.com"
                    className="hover:underline"
                  >
                    help@oggoair.com
                  </Link>
                </li>
              </ul>
            </div>
            {/* Follow Us */}
            <div>
              <div className="font-semibold text-primary-text text-lg sm:text-xl mb-3 w-fit relative">
                Payment Methods
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6].map((item, index) => (
                  <Image
                    key={index}
                    src={`/img/payment-methods/${item}.png`}
                    alt="Visa"
                    width={100}
                    height={100}
                    className="w-fit"
                  />
                ))}
              </div>
              <div className="font-semibold text-primary-text text-lg sm:text-xl mt-10 mb-3 w-fit relative">
                Travel Partners
              </div>
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((item, index) => (
                  <Image
                    key={index}
                    src={`/img/partner/${item}.png`}
                    alt="Visa"
                    width={100}
                    height={100}
                    className="w-fit scale-105"
                  />
                ))}
              </div>
            </div>

            {/* Worldwide Network with country dropdown */}
            <div className="flex flex-col items-start gap-2">
              <div className="font-semibold text-primary-text text-lg sm:text-xl mb-3 w-fit">
                Worldwide Network
              </div>
              <div
                className="relative flex flex-col gap-2 ext-primary-text space-y-[10px] text-base sm:text-lg"
                ref={langRef}
              >
                <button
                  onClick={handleLanguageToggle}
                  className="flex items-center w-fit justify-between pr-2 md:pr-5 bg-white shadow-xs rounded-full border border-gray-300 p-2"
                >
                  <div className=" relative rounded-full flex  items-center justify-center overflow-hidden">
                    <Image
                      src={selectedFlagData?.flag}
                      alt={selectedFlagData?.name}
                      width={20}
                      height={20}
                      className="rounded-full h-5 w-5"
                    />
                  </div>
                  <h2 className="text-primary-text text-xs font-medium pl-2">
                    {selectedFlagData?.name}
                  </h2>
                  <CaretDown
                    size={10}
                    weight="bold"
                    className="md:text-base lg:text-lg text-gray-700 [&>path]:stroke-[2.5]"
                  />
                </button>
                <p className="text-primary-text text-sm sm:text-base font-medium">
                  location, str, 18
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-[#1A83FF] text-sm sm:text-base font-medium">
                    example.com
                  </p>
                  <p className="text-[#1A83FF] text-sm sm:text-base font-medium">
                    secondexample.com
                  </p>
                </div>

                {langOpen && (
                  <div className="absolute left-0 mt-10 border border-gray-200 w-40 bg-white rounded-xl shadow-lg z-10 p-2">
                    {flag.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleLanguageSelect(item.countryCode)}
                        className="flex items-center justify-between text-primary-text text-xs gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <div className="flex items-cente text-primary-text text-xs gap-2">
                          <Image
                            src={item.flag}
                            alt={item.name}
                            width={20}
                            height={20}
                            className="rounded-full w-[20px] h-[20px]"
                          />
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
            </div>
          </div>
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Image
                src="/logo.png"
                alt="oggoair"
                width={500}
                height={500}
                className="w-[100px] sm:w-[120px] md:w-[140px] lg:w-[150px]"
              />
              <span className="text-primary-text ml-2">
                (Official Website of OGGO Travel Platform Ltd.)
              </span>
            </div>
            <div className="flex items-center justify-end gap-3">
              <a
                href="#"
                className="bg-black rounded-full p-2 inline-flex items-center justify-center"
              >
                <Facebook size={20} className="text-primary-green" />
              </a>
              <a
                href="#"
                className="bg-black rounded-full p-2 inline-flex items-center justify-center"
              >
                <Instagram size={20} className="text-primary-green" />
              </a>
              <a
                href="#"
                className="bg-black rounded-full p-2 inline-flex items-center justify-center"
              >
                <Linkedin size={20} className="text-primary-green" />
              </a>
            </div>
          </div>
        </Container>
      </FullContainer>

      <FullContainer>
        <Container>
          <div className="flex items-center justify-between gap-4 py-3 border-t border-gray-300">
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-primary-text text-sm sm:text-lg py-4 text-center sm:text-left">
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
            <div className="text-primary-text text-sm sm:text-lg mt-2 md:mt-0 text-center">
              ©2024 OggoAir. – All Rights Reserved
            </div>
          </div>
        </Container>
      </FullContainer>
    </>
  );
}
