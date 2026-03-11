import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/Booking.jsx/DashboardLayout";
import UpComing from "../../components/Booking.jsx/UpComing";
import Archived from "../../components/Booking.jsx/Archived";
import Rightbar from "../../components/Booking.jsx/layout";
import { useRouter } from "next/router";
import Image from "next/image";
import { Check } from "lucide-react";
import { tokenUtils } from "../../config/api";
import { deriveBookingStatus } from "../../utils/bookingStatus";
import Seo from "@/components/Seo";

export default function BookingsPage() {
  const router = useRouter();
  const { tab, status: statusFilter, page: pageQuery } = router.query;
  const [bookingSubTab, setBookingSubTab] = useState("upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [activeStatusFilter, setActiveStatusFilter] = useState("");

  // Sync status filter from URL when page loads or query changes
  useEffect(() => {
    if (statusFilter && ["confirmed", "pending", "cancelled"].includes(statusFilter)) {
      setActiveStatusFilter(statusFilter);
    } else if (!statusFilter) {
      setActiveStatusFilter("");
    }
  }, [statusFilter]);

  // Fetch bookings from API with pagination and filtering
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

        // Build query parameters
        const params = new URLSearchParams();
        const currentPage = pageQuery ? parseInt(pageQuery) : 1;
        params.append("page", currentPage);
        params.append("limit", "10");

        // Add status filter if active
        if (activeStatusFilter) {
          params.append("status", activeStatusFilter);
        }

        const response = await fetch(
          `/api/bookings/my-bookings?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

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
        const paginationData =
          data.data?.data?.pagination ||
          data.data?.pagination ||
          data.pagination;

        setBookings(Array.isArray(bookingsData) ? bookingsData : []);

        // Update pagination if available
        if (paginationData) {
          setPagination(paginationData);
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(err.message || "Failed to load bookings");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [pageQuery, activeStatusFilter]);

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
    // Reset status filter and page when changing tabs
    setActiveStatusFilter("");
    router.push(`/dashboard/bookings?tab=${newTab}`, undefined, {
      shallow: true,
    });
  };

  const handleStatusFilter = (status) => {
    setActiveStatusFilter(status);
    // Update URL to reflect the filter and reset to page 1
    const params = new URLSearchParams();
    params.append("tab", bookingSubTab);
    if (status === "confirmed") {
      params.append("status", "confirmed");
    } else if (status === "pending") {
      params.append("status", "pending");
    } else if (status === "cancelled") {
      params.append("status", status);
    }
    params.append("page", "1");
    router.push(`/dashboard/bookings?${params.toString()}`, undefined, {
      shallow: true,
    });
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams();
    params.append("tab", bookingSubTab);
    if (activeStatusFilter) {
      params.append("status", activeStatusFilter);
    }
    params.append("page", newPage);
    router.push(`/dashboard/bookings?${params.toString()}`, undefined, {
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
      const derivedStatus = deriveBookingStatus(booking);
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
        if (derivedStatus === "confirmed" || derivedStatus === "pending") {
          upcoming.push(booking);
        } else if (derivedStatus === "cancelled") {
          archived.push(booking);
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
      <Seo title="My Bookings" noindex />
      <Rightbar>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6">
          {/* Left column: filters + booking list */}
          <div className="space-y-6">
            {/* Status Filter Buttons */}
            <div className="mb-6 bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Filter by Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusFilter("")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeStatusFilter === ""
                        ? "bg-primary-green text-primary-text shadow-md"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleStatusFilter("confirmed")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeStatusFilter === "confirmed"
                        ? "bg-primary-green text-primary-text shadow-md"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    Confirmed
                  </button>
                  <button
                    onClick={() => handleStatusFilter("pending")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeStatusFilter === "pending"
                        ? "bg-orange-500 text-primary-text shadow-md"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusFilter("cancelled")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      activeStatusFilter === "cancelled"
                        ? "bg-red-500 text-primary-text shadow-md"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>

            {bookingSubTab === "upcoming" ? (
              <UpComing
                bookings={upcoming}
                loading={loading}
                error={error}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            ) : (
              <Archived
                bookings={archived}
                loading={loading}
                error={error}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* Right column: QR panel (sticky on desktop) */}
          <div className="space-y-6 lg:sticky lg:top-24 self-start">
            <div className="bg-white border border-gray-200 shadow-xl relative rounded-xl overflow-hidden h-fit">
              <div className="p-5">
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src="/st-images/booking/qr.png"
                    alt="QR Code"
                    width={96}
                    height={96}
                    className="w-24 h-24 object-contain"
                  />
                  <div className="text-center space-y-3">
                    <h3 className="text-sm font-bold text-gray-900">
                      Scan to discover more features and savings in our app
                    </h3>
                    <div className="space-y-2.5 text-left">
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-primary-green flex-shrink-0" />
                        <span className="text-xs text-gray-700 font-medium">
                          Special in-app offers
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-primary-green flex-shrink-0" />
                        <span className="text-xs text-gray-700 font-medium">
                          Tickets available offline
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-primary-green flex-shrink-0" />
                        <span className="text-xs text-gray-700 font-medium">
                          Live trip updates
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Rightbar>
    </DashboardLayout>
  );
}
