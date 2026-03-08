import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/Booking.jsx/DashboardLayout";
import UpComing from "../../components/Booking.jsx/UpComing";
import Archived from "../../components/Booking.jsx/Archived";
import Rightbar from "../../components/Booking.jsx/layout";
import { useRouter } from "next/router";
import { tokenUtils } from "../../config/api";

export default function BookingsPage() {
  const router = useRouter();
  const { tab } = router.query;
  const [bookingSubTab, setBookingSubTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = tokenUtils.getToken();
        if (!token) {
          setError("Please login to view your bookings");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/bookings/my-bookings", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch bookings");
        }

        // Extract bookings from the nested response structure
        // Response structure: { success: true, data: { status: "success", data: { bookings: [...], pagination: {...} } } }
        const bookingsData =
          data.data?.data?.bookings ||
          data.data?.bookings ||
          data.bookings ||
          [];
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(err.message || "Failed to load bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Update sub-tab when query changes
  useEffect(() => {
    if (tab && (tab === "upcoming" || tab === "archived")) {
      setBookingSubTab(tab);
    } else if (!tab) {
      // Default to upcoming if no tab specified
      router.replace("/dashboard/bookings?tab=upcoming", undefined, {
        shallow: true,
      });
    }
  }, [tab, router]);

  const handleSubTabChange = (newTab) => {
    setBookingSubTab(newTab);
    router.push(`/dashboard/bookings?tab=${newTab}`, undefined, {
      shallow: true,
    });
  };

  // Filter bookings into upcoming and archived
  const filterBookings = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcoming = [];
    const archived = [];

    bookings.forEach((booking) => {
      // Determine the booking date from flightData structure
      let bookingDate = null;

      // Check flightData.slices[0].segments[0].departing_at (primary source)
      if (
        booking.flightData?.slices &&
        booking.flightData.slices.length > 0 &&
        booking.flightData.slices[0].segments &&
        booking.flightData.slices[0].segments.length > 0 &&
        booking.flightData.slices[0].segments[0].departing_at
      ) {
        bookingDate = new Date(
          booking.flightData.slices[0].segments[0].departing_at
        );
      } else if (booking.departureDate) {
        bookingDate = new Date(booking.departureDate);
      } else if (booking.travelDate) {
        bookingDate = new Date(booking.travelDate);
      } else if (booking.date) {
        bookingDate = new Date(booking.date);
      } else if (booking.createdAt) {
        // If no travel date, use created date as fallback
        bookingDate = new Date(booking.createdAt);
      }

      if (bookingDate) {
        bookingDate.setHours(0, 0, 0, 0);
        if (bookingDate >= now) {
          upcoming.push(booking);
        } else {
          archived.push(booking);
        }
      } else {
        // If no date found, check status or default to archived
        if (
          booking.bookingStatus === "confirmed" ||
          booking.bookingStatus === "pending"
        ) {
          upcoming.push(booking);
        } else {
          archived.push(booking);
        }
      }
    });

    return { upcoming, archived };
  };

  const { upcoming, archived } = filterBookings();

  return (
    <DashboardLayout
      bookingSubTab={bookingSubTab}
      setBookingSubTab={handleSubTabChange}
    >
      <Rightbar>
        {bookingSubTab === "upcoming" ? (
          <UpComing bookings={upcoming} loading={loading} error={error} />
        ) : (
          <Archived bookings={archived} loading={loading} error={error} />
        )}
      </Rightbar>
    </DashboardLayout>
  );
}
