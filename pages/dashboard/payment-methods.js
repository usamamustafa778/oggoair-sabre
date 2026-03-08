import React, { useState } from "react";
import DashboardLayout from "../../components/Booking.jsx/DashboardLayout";
import PaymentMethods from "../../components/Booking.jsx/PaymentMethods";

export default function PaymentMethodsPage() {
  const [bookingSubTab, setBookingSubTab] = useState("upcoming");

  return (
    <DashboardLayout bookingSubTab={bookingSubTab} setBookingSubTab={setBookingSubTab}>
      <PaymentMethods />
    </DashboardLayout>
  );
}

