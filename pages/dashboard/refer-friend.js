import React, { useState } from "react";
import DashboardLayout from "../../components/Booking.jsx/DashboardLayout";
import ReferAFriend from "../../components/Booking.jsx/ReferAFriend";

export default function ReferAFriendPage() {
  const [bookingSubTab, setBookingSubTab] = useState("upcoming");

  return (
    <DashboardLayout bookingSubTab={bookingSubTab} setBookingSubTab={setBookingSubTab}>
      <ReferAFriend />
    </DashboardLayout>
  );
}

