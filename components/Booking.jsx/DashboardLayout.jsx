import React from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import BookingBanner from "./BookingBanner";
import Link from "next/link";
import { useRouter } from "next/router";
import Container from "../common/Container";
import Image from "next/image";
import { Check } from "lucide-react";

export default function DashboardLayout({
  children,
  bookingSubTab,
  setBookingSubTab,
}) {
  const router = useRouter();
  const currentPath = router.pathname;

  const menuItems = [
    {
      id: "passenger-details",
      label: "Passenger details",
      href: "/dashboard/passenger-details",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "bookings",
      label: "Your bookings",
      href: "/dashboard/bookings",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      id: "payment-methods",
      label: "Payment methods",
      href: "/dashboard/payment-methods",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
    },
    {
      id: "refer-friend",
      label: "Refer a Friend",
      href: "/dashboard/refer-friend",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
    },
  ];

  // Determine active tab from current path
  const getActiveTab = () => {
    if (currentPath.includes("passenger-details")) return "passenger-details";
    if (currentPath.includes("bookings")) return "bookings";
    if (currentPath.includes("payment-methods")) return "payment-methods";
    if (currentPath.includes("refer-friend")) return "refer-friend";
    return "passenger-details"; // default
  };

  const activeTab = getActiveTab();

  return (
    <>
      <Navbar />
      <BookingBanner
        activeTab={activeTab}
        bookingSubTab={bookingSubTab}
        setBookingSubTab={setBookingSubTab}
      />
      <Container className="flex flex-col xl:flex-row bg-primary-bg min-h-screen">
        {/* Left column: sidebar (sticky) */}
        <div className="w-full lg:w-72 lg:min-w-[288px] mt-10 z-20 space-y-6 lg:sticky lg:top-24 self-start">
          {/* Sidebar navigation card */}
          <div className="bg-white border border-gray-200 shadow-xl relative rounded-xl overflow-hidden h-fit">
            <div className="p-5 pt-7 pb-6">
              <nav className="space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = item.id === activeTab;
                  return (
                    <Link key={item.id} href={item.href}>
                      <div
                        className={`group flex items-center px-5 py-4 text-sm font-semibold transition-all duration-300 w-full text-left cursor-pointer rounded-xl relative ${
                          isActive
                            ? "text-primary-text bg-gradient-to-r from-primary-green/15 to-primary-green/5 border-l-4 border-primary-green shadow-md transform translate-x-1"
                            : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent hover:text-primary-text border-l-4 border-transparent hover:border-gray-200 hover:shadow-sm"
                        }`}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-green rounded-r-full shadow-lg"></div>
                        )}
                        <span
                          className={`mr-4 transition-all duration-300 flex-shrink-0 ${
                            isActive
                              ? "text-primary-text scale-110"
                              : "text-gray-500 group-hover:text-primary-text group-hover:scale-110"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="flex-1 whitespace-nowrap tracking-wide">
                          {item.label}
                        </span>
                        {isActive && (
                          <div className="w-2.5 h-2.5 bg-primary-green rounded-full ml-3 flex-shrink-0 animate-pulse shadow-lg"></div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 py-8 lg:py-10">
          <div className="max-w-7xl mx-auto pl-4 lg:pl-6">{children}</div>
        </div>
      </Container>
    </>
  );
}

