import React, { useState } from "react";
import DashboardLayout from "../../components/Booking.jsx/DashboardLayout";
import Notifications from "../../components/Booking.jsx/Notifications";

export default function NotificationsPage() {
  const [bookingSubTab, setBookingSubTab] = useState("upcoming");

  return (
    <DashboardLayout bookingSubTab={bookingSubTab} setBookingSubTab={setBookingSubTab}>
      <Notifications />
    </DashboardLayout>
  );
}

