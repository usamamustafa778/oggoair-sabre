import React, { useState } from "react";
import FullContainer from "../common/FullContainer";
import Container from "../common/Container";
import Image from "next/image";

const tabs = ["Flight", "Hotels", "Cars", "Buses", "Rails"];

// Separate FAQ data for each tab
const faqsData = {
  Flight: [
    {
      question: "How to check my refund status?",
      answer: `For check your refund status, you can simply go to 'Orders' menu, then fill in your travelport code and your registered email. If you request for a refund, the status will be displayed there. If you have registered and have an travelport account before, please login to your travelport account first before go to 'Orders' menu.`,
    },
    {
      question: "Can I change my flight?",
      answer:
        "Yes, you can change your flight depending on the airline policy and fare type. Please contact our customer service or check your booking details for change options and any applicable fees.",
    },
    {
      question: "How to get or resend my e-ticket/itinerary?",
      answer:
        'You can download your e-ticket and itinerary from your booking confirmation email or by logging into your account and visiting the "My Bookings" section.',
    },
    {
      question: "How can I reserve a seat?",
      answer:
        "Seat reservation can be done during the booking process or later through your booking management. Some airlines offer free seat selection while others may charge a fee.",
    },
    {
      question: "I want to add excess baggage",
      answer:
        "You can add excess baggage during the booking process or by contacting our customer service. Additional fees will apply based on the airline policy.",
    },
    {
      question: "How will I receive my tickets?",
      answer:
        'Tickets are typically sent via email as e-tickets. You can also access them through your account dashboard under "My Bookings".',
    },
  ],
  Hotels: [
    {
      question: "What is the cancellation policy for hotel bookings?",
      answer:
        "Cancellation policies vary by hotel and rate type. Please check your booking confirmation for specific cancellation terms and any applicable fees.",
    },
    {
      question: "Can I modify my hotel reservation?",
      answer:
        "Yes, most hotel reservations can be modified depending on availability and the rate type you booked. Contact our customer service for assistance.",
    },
    {
      question: "What amenities are included in my hotel booking?",
      answer:
        "Amenities vary by hotel. Check your booking confirmation or hotel details page for a complete list of included amenities and services.",
    },
    {
      question: "How do I check-in to my hotel?",
      answer:
        "Check-in procedures vary by hotel. Most hotels require a valid ID and credit card. Some offer online check-in options for convenience.",
    },
    {
      question: "Can I request early check-in or late check-out?",
      answer:
        "Early check-in and late check-out requests are subject to hotel availability. Contact the hotel directly or our customer service to make arrangements.",
    },
  ],
  Cars: [
    {
      question: "What documents do I need to rent a car?",
      answer:
        "You typically need a valid driver's license, credit card, and proof of insurance. International travelers may need an International Driving Permit.",
    },
    {
      question: "What is the minimum age to rent a car?",
      answer:
        "Minimum age requirements vary by location and rental company, typically ranging from 18-25 years old. Young driver fees may apply.",
    },
    {
      question: "Can I add additional drivers to my rental?",
      answer:
        "Yes, you can usually add additional drivers for an extra fee. All drivers must meet the same age and license requirements.",
    },
    {
      question: "What happens if I return the car late?",
      answer:
        "Late returns may incur additional charges. Contact the rental company if you anticipate being late to avoid extra fees.",
    },
    {
      question: "Is insurance included in my car rental?",
      answer:
        "Basic insurance is often included, but additional coverage options are available. Check your booking details for specific coverage information.",
    },
  ],
  Buses: [
    {
      question: "Can I change my bus ticket?",
      answer:
        "Ticket change policies vary by bus company. Some allow changes with a fee, while others may have restrictions. Contact our customer service for assistance.",
    },
    {
      question: "What happens if I miss my bus?",
      answer:
        "If you miss your bus, you may need to purchase a new ticket depending on the bus company's policy. Some companies offer standby options.",
    },
    {
      question: "Are there luggage restrictions on buses?",
      answer:
        "Yes, most bus companies have luggage restrictions. Typically, you can bring one carry-on bag and one checked bag. Check with the specific company for details.",
    },
    {
      question: "Can I bring pets on the bus?",
      answer:
        "Pet policies vary by bus company. Some allow small pets in carriers, while others may not permit pets. Contact the bus company directly for their policy.",
    },
    {
      question: "How do I track my bus?",
      answer:
        "Many bus companies offer real-time tracking through their mobile apps or websites. Check your booking confirmation for tracking information.",
    },
  ],
  Rails: [
    {
      question: "Can I upgrade my train ticket?",
      answer:
        "Yes, you can often upgrade your train ticket to a higher class if seats are available. Additional fees will apply for the upgrade.",
    },
    {
      question: "What is the luggage policy for trains?",
      answer:
        "Train luggage policies are generally more generous than airlines. You can typically bring multiple bags, but there may be size and weight restrictions.",
    },
    {
      question: "Can I bring food on the train?",
      answer:
        "Yes, you can usually bring your own food and drinks on trains. Some trains also have dining cars or food service available.",
    },
    {
      question: "How do I find my train platform?",
      answer:
        "Platform information is typically displayed on departure boards at the station. Arrive early to check for any last-minute platform changes.",
    },
    {
      question: "Are there power outlets on trains?",
      answer:
        "Many modern trains have power outlets and WiFi available. Check with the specific train service for amenities on your route.",
    },
  ],
};

export default function FaqsBanner() {
  const [activeTab, setActiveTab] = useState("Flight");
  const [openIndex, setOpenIndex] = useState(0);

  // Get FAQs for the active tab
  const currentFaqs = faqsData[activeTab] || [];

  // Split FAQs into two columns
  const leftColumnFaqs = currentFaqs.slice(
    0,
    Math.ceil(currentFaqs.length / 2)
  );
  const rightColumnFaqs = currentFaqs.slice(Math.ceil(currentFaqs.length / 2));

  // Reset open index when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setOpenIndex(0); // Reset to first FAQ when changing tabs
  };

  return (
    <FullContainer className="bg-primary-bg min-h-screen">
      <Container className="flex flex-col items-center justify-center pt-28 md:pt-48 pb-12">
        <div className="flex flex-col items-center justify-center w-full lg:py-6">
          <h1 className="text-4xl lg:text-[45px] underline decoration-2 underline-offset-5 text-[#22325a] mb-12 font-regista-regular">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-[#22325a] mb-12 text-center mx-8 lg:mx-40">
            Here are some of the most common questions about our{" "}
            {activeTab.toLowerCase()} service, with clear answers to ensure a
            smooth experience.
          </p>
          <div className="flex flex-col items-center justify-center w-full border-8 p-2 sm:p-4 rounded-2xl border-white">
            <Image
              src="/st-images/faqs.png"
              alt="faqs-banner"
              width={1200}
              height={1200}
              className="h-[200px] sm:h-[300px] md:h-[400px] lg:h-[465px] w-auto object-contain"
            />
          </div>
        </div>
      </Container>

      {/* Tabs and FAQ Accordion */}
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors duration-200 whitespace-nowrap
                ${
                  activeTab === tab
                    ? "bg-lime-400 text-gray-800"
                    : "bg-gray-200 text-gray-700"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* FAQ Accordion - Two Column Layout */}
        {currentFaqs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-2">
              {leftColumnFaqs.map((faq, idx) => (
                <div
                  key={faq.question}
                  className="bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  <button
                    className="w-full flex justify-between items-center px-4 py-3 text-left font-semibold text-blue-900 focus:outline-none hover:bg-gray-50 rounded-lg"
                    onClick={() => setOpenIndex(idx === openIndex ? -1 : idx)}
                  >
                    <span className="text-lg py-2 md:py-3 pr-4">
                      {faq.question}
                    </span>
                    <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span
                        className={`text-white text-xs transition-transform duration-200 ${
                          openIndex === idx ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </div>
                  </button>
                  {openIndex === idx && (
                    <div className="px-4 pb-3 text-lg text-primary-text leading-relaxed -mt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              {rightColumnFaqs.map((faq, idx) => {
                const actualIndex = idx + leftColumnFaqs.length;
                return (
                  <div
                    key={faq.question}
                    className="bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <button
                      className="w-full flex justify-between items-center px-4 py-3 text-left font-semibold text-blue-900 focus:outline-none hover:bg-gray-50 rounded-lg"
                      onClick={() =>
                        setOpenIndex(
                          actualIndex === openIndex ? -1 : actualIndex
                        )
                      }
                    >
                      <span className="text-lg py-2 md:py-3 pr-4">
                        {faq.question}
                      </span>
                      <div className="w-6 h-6 bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <span
                          className={`text-white text-xs transition-transform duration-200 ${
                            openIndex === actualIndex ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                    </button>
                    {openIndex === actualIndex && (
                      <div className="px-4 pb-3 text-lg text-primary-text leading-relaxed -mt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No FAQs available for this category yet.
          </div>
        )}
      </div>
    </FullContainer>
  );
}
