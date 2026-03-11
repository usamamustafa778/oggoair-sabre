import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../components/Booking.jsx/DashboardLayout";
import Rightbar from "../../components/Booking.jsx/layout";
import StatsCard from "../../components/Dashboard/StatsCard";
import RecentBookingsList from "../../components/Dashboard/RecentBookingsList";
import PassengerTypeChart from "../../components/Dashboard/PassengerTypeChart";
import { tokenUtils } from "../../config/api";
import Link from "next/link";
import Seo from "@/components/Seo";

export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = tokenUtils.getToken();
      if (!token) {
        setError("Please login to view your dashboard");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/bookings/my-stats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch dashboard stats");
      }

      // Extract stats from the nested response structure
      const statsData = data.data?.data || data.data || data;
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-300"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ErrorDisplay = () => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <div className="text-red-500 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-red-900 mb-2">
        Failed to Load Dashboard
      </h3>
      <p className="text-red-700 mb-4">{error}</p>
      <button
        onClick={fetchDashboardStats}
        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  const EmptyState = () => (
    <div className="bg-white rounded-xl shadow-md p-12 text-center">
      <div className="text-gray-400 mb-6">
        <svg
          className="w-24 h-24 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-gray-700 mb-3">
        Welcome to Your Dashboard!
      </h3>
      <Link href="/">
        <button className="px-8 py-3 bg-primary-green text-primary-text rounded-lg hover:bg-primary-green/90 transition-colors text-lg font-semibold">
          Search Flights
        </button>
      </Link>
    </div>
  );

  return (
    <DashboardLayout>
      <Seo title="Dashboard" noindex />
      <Rightbar>
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600">
              Welcome back! Here&apos;s a summary of your booking activity.
            </p>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorDisplay />
          ) : !stats || stats.overview?.totalBookings === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Bookings"
                  value={stats.overview?.totalBookings || 0}
                  icon="📋"
                  color="blue"
                />
                <StatsCard
                  title="Confirmed"
                  value={stats.overview?.confirmedBookings || 0}
                  icon="✅"
                  color="green"
                />
                <StatsCard
                  title="Pending"
                  value={stats.overview?.pendingBookings || 0}
                  icon="⏳"
                  color="orange"
                />
                <StatsCard
                  title="Total Passengers"
                  value={stats.overview?.totalPassengers || 0}
                  icon="👥"
                  color="purple"
                />
              </div>

              {/* Charts and Activity Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Passenger Distribution */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Passenger Distribution
                    </h2>
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <PassengerTypeChart data={stats.passengerTypes || []} />
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Bookings
                    </h2>
                    <Link href="/dashboard/bookings">
                      <button className="text-primary-green hover:text-primary-green/80 font-semibold text-sm flex items-center gap-1 transition-colors">
                        View All
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </Link>
                  </div>
                  <RecentBookingsList bookings={stats.recentBookings || []} />
                </div>
              </div>

              {/* Cancelled Bookings Card (if any) */}
              {stats.overview?.cancelledBookings > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Cancelled Bookings
                      </h3>
                      <p className="text-gray-600 text-sm">
                        You have {stats.overview.cancelledBookings} cancelled{" "}
                        {stats.overview.cancelledBookings === 1
                          ? "booking"
                          : "bookings"}
                      </p>
                    </div>
                    <div className="text-4xl text-red-500">
                      {stats.overview.cancelledBookings}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-primary-green to-primary-green/80 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Ready for Your Next Adventure?</h2>
                <p className="mb-6 text-white/90">
                  Search for flights and discover amazing destinations around the world.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/">
                    <button className="px-6 py-3 bg-white text-primary-text rounded-lg hover:bg-gray-100 transition-colors font-semibold">
                      Search Flights
                    </button>
                  </Link>
                  <Link href="/dashboard/bookings">
                    <button className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-semibold border border-white/40">
                      View All Bookings
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </Rightbar>
    </DashboardLayout>
  );
}
