import React from "react";
import Container from "../common/Container";
import FullContainer from "../common/FullContainer";
import Image from "next/image";
import Link from "next/link";

function BookingBanner({
  activeTab,
  bookingSubTab,
  setBookingSubTab,
  pageTitle,
}) {
  const getTitle = () => {
    switch (activeTab) {
      case "passenger-details":
        return "Passenger details";
      case "bookings":
        return "Your bookings";
      case "payment-methods":
        return "Payment methods";
      case "notifications":
        return "Notifications";
      case "refer-friend":
        return "Refer a Friend";
      default:
        return "Your bookings";
    }
  };

  const showTabs = activeTab === "bookings";

  return (
    <FullContainer className="h-[320px] md:h-[380px] relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          className="w-full h-full object-cover scale-110"
          src="/st-images/booking/booking-banner.jpg"
          alt="Booking Banner"
          width={1920}
          height={400}
          priority
          quality={90}
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-text/90 via-primary-text/85 to-primary-text/90 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
      
      {/* Content */}
      <Container className="relative z-20 h-full flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center">
          {/* Breadcrumb or indicator */}
          <div className="mb-3">
            <span className="text-xs md:text-sm font-medium text-white/70 uppercase tracking-wider">
              Dashboard
            </span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
            {getTitle()}
          </h1>
          
          {/* Subtitle or description */}
          <p className="text-sm md:text-base text-white/80 mb-6 max-w-2xl mx-auto leading-relaxed">
            {activeTab === "passenger-details" && "Manage your personal information and account settings"}
            {activeTab === "bookings" && "View and manage all your travel bookings in one place"}
            {activeTab === "payment-methods" && "Securely manage your payment methods and billing information"}
            {activeTab === "notifications" && "Stay updated with your booking notifications and travel alerts"}
            {activeTab === "refer-friend" && "Invite friends and earn rewards for every successful referral"}
          </p>
          
          {/* Sub-tabs for bookings */}
          {showTabs && (
            <div className="flex flex-row gap-3 bg-white/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl p-1.5 border border-white/40 justify-center mx-auto w-fit">
              <Link href="/dashboard/bookings?tab=upcoming">
                <button
                  className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 md:px-8 md:py-3.5 md:text-base ${
                    bookingSubTab === "upcoming"
                      ? "bg-primary-green text-primary-text shadow-lg scale-[1.02]"
                      : "bg-transparent text-gray-700 hover:bg-gray-100/80 hover:scale-[1.01]"
                  }`}
                >
                  Upcoming
                </button>
              </Link>
              <Link href="/dashboard/bookings?tab=archived">
                <button
                  className={`px-6 py-3 text-sm font-bold rounded-xl transition-all duration-200 md:px-8 md:py-3.5 md:text-base ${
                    bookingSubTab === "archived"
                      ? "bg-primary-green text-primary-text shadow-lg scale-[1.02]"
                      : "bg-transparent text-gray-700 hover:bg-gray-100/80 hover:scale-[1.01]"
                  }`}
                >
                  Archived
                </button>
              </Link>
            </div>
          )}
        </div>
      </Container>
      
      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-green/50 to-transparent z-20"></div>
    </FullContainer>
  );
}

export default BookingBanner;
