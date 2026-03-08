import React, { useState } from "react";
import DashboardLayout from "../../components/Booking.jsx/DashboardLayout";
import PassengerDetails from "../../components/Booking.jsx/PassengerDetails";

export default function PassengerDetailsPage() {
  const [bookingSubTab, setBookingSubTab] = useState("upcoming");

  return (
    <DashboardLayout bookingSubTab={bookingSubTab} setBookingSubTab={setBookingSubTab}>
      <PassengerDetails />
    </DashboardLayout>
  );
}

