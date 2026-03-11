import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "../../../components/Booking.jsx/DashboardLayout";
import Rightbar from "../../../components/Booking.jsx/layout";
import Image from "next/image";
import { tokenUtils } from "../../../config/api";
import { deriveBookingStatus, derivePaymentStatus } from "../../../utils/bookingStatus";
import Seo from "@/components/Seo";

const BookingDetailsPage = () => {
  const router = useRouter();
  const { reference } = router.query;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bookingRef = useRef(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!router.isReady || !reference) return;

      try {
        setLoading(true);
        setError(null);

        const token = tokenUtils.getToken();
        if (!token) {
          setError("Please login to view your booking.");
          setLoading(false);
          return;
        }

        const params = new URLSearchParams();
        params.append("page", "1");
        params.append("limit", "100");
        // Pass reference through in case backend supports filtering
        params.append("bookingReference", reference);

        const res = await fetch(
          `/api/bookings/my-bookings?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch booking");
        }

        const bookingsData =
          data.data?.data?.bookings ||
          data.data?.bookings ||
          data.bookings ||
          [];

        const all = Array.isArray(bookingsData) ? bookingsData : [];

        const found =
          all.find(
            (b) =>
              b.bookingReference === reference ||
              b.id === reference ||
              b._id === reference
          ) || null;

        if (!found) {
          setError("Booking not found.");
        }

        setBooking(found);
      } catch (err) {
        console.error("Error fetching booking detail:", err);
        setError(err.message || "Failed to load booking detail.");
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [router.isReady, reference]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getFlightSegments = (booking) => {
    // Frontend-only helper to expose whatever flight-related structure
    // already exists on the booking record. No derivation or search logic.
    if (!booking) return { slices: [] };

    // Primary: Duffel-style order stored as booking.flightData
    if (booking.flightData?.slices && booking.flightData.slices.length > 0) {
      return {
        slices: booking.flightData.slices,
      };
    }

    // Fallbacks for older bookings where segments were stored differently
    if (Array.isArray(booking.segments) && booking.segments.length > 0) {
      return {
        slices: [
          {
            segments: booking.segments,
          },
        ],
      };
    }

    if (
      booking.flightDetails?.segments &&
      Array.isArray(booking.flightDetails.segments)
    ) {
      return {
        slices: [
          {
            segments: booking.flightDetails.segments,
          },
        ],
      };
    }

    return { slices: [] };
  };

  const getBaggageInfo = (booking) => {
    if (!booking) {
      return { checkedCount: 0, carryOnCount: 0, personalCount: 0 };
    }
    const slices = booking.flightData?.slices;
    const firstSlice = slices?.[0];
    const firstSegment = firstSlice?.segments?.[0];
    const passenger = firstSegment?.passengers?.[0];
    if (!passenger?.baggages) {
      return { checkedCount: 0, carryOnCount: 0, personalCount: 0 };
    }

    let checkedCount = 0;
    let carryOnCount = 0;
    let personalCount = 0;

    passenger.baggages.forEach((bag) => {
      if (bag.type === "checked") checkedCount = bag.quantity;
      else if (bag.type === "carry_on") carryOnCount = bag.quantity;
      else if (bag.type === "personal") personalCount = bag.quantity;
    });

    return { checkedCount, carryOnCount, personalCount };
  };

  const handleDownloadBooking = async () => {
    try {
      if (!bookingRef.current || !reference) return;
      if (typeof window === "undefined") return;

      const element = bookingRef.current;

      const opt = {
        margin: 10,
        filename: `booking-${reference}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4" },
      };

      // Before calling html2pdf, patch any OKLCH colors to safe hex values
      const patchedStyles = [];
      const colorProps = [
        "color",
        "backgroundColor",
        "borderColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
      ];

      const patchNodeColors = (node) => {
        const computed = window.getComputedStyle(node);
        colorProps.forEach((prop) => {
          const value = computed[prop];
          if (value && typeof value === "string" && value.includes("oklch")) {
            // Remember previous inline style to restore later
            patchedStyles.push({
              node,
              prop,
              prev: node.style[prop],
            });

            // Fallbacks: text gets dark gray, others white
            const fallback = prop === "color" ? "#111827" : "#ffffff";
            node.style[prop] = fallback;
          }
        });
      };

      // Patch the root and all descendants
      patchNodeColors(element);
      element.querySelectorAll("*").forEach(patchNodeColors);

      // Dynamically import html2pdf only on the client each time
      const html2pdfModule = await import(
        "html2pdf.js/dist/html2pdf.bundle.min.js"
      );
      const html2pdf = html2pdfModule.default || html2pdfModule;

      // Use built-in save for reliability; triggers direct download every time
      await html2pdf().set(opt).from(element).save();

      // Restore any patched inline styles
      patchedStyles.forEach(({ node, prop, prev }) => {
        node.style[prop] = prev;
      });
    } catch (err) {
      console.error("Download booking PDF failed:", err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-10 text-center">
          <p className="text-gray-600 text-base">Loading booking details…</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-10">
          <p className="text-red-600 font-semibold mb-2">
            There was a problem loading this booking.
          </p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      );
    }

    if (!booking) {
      return null;
    }

    const bookingStatus = deriveBookingStatus(booking);
    const paymentStatus = derivePaymentStatus(booking);
    const slicesInfo = getFlightSegments(booking);
    const baggageInfo = getBaggageInfo(booking);

    const email = booking.email || "N/A";
    const phone =
      booking.fullPhone ||
      (booking.phone
        ? `${booking.phone.dialingCode} ${booking.phone.number}`
        : "N/A");

    const passengers = booking.passengers || [];

    const paymentAmount =
      booking.flightData?.total_amount ||
      booking.amount ||
      booking.payment?.totalAmount ||
      booking.payment?.amount ||
      null;

    const formattedAmount =
      paymentAmount && Number(paymentAmount) > 0
        ? `€${Number(paymentAmount).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`
        : null;

    return (
      <div ref={bookingRef} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Booking {booking.bookingReference || reference}
            </h1>
            <p className="text-sm text-gray-500">
              Created on {formatDate(booking.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                bookingStatus === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : bookingStatus === "pending"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Booking: {bookingStatus}
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                paymentStatus === "paid"
                  ? "bg-green-100 text-green-800"
                  : paymentStatus === "pending"
                  ? "bg-orange-100 text-orange-800"
                  : paymentStatus === "failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              Payment: {String(paymentStatus || "").toUpperCase()}
            </span>
            <button
              type="button"
              onClick={handleDownloadBooking}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-primary-green text-primary-text cursor-pointer hover:bg-primary-green/90 active:bg-primary-green/80 transition-colors shadow-sm"
            >
              Download booking
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Flight + passengers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight segments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Flight segments
              </h2>
              {(!slicesInfo.slices || slicesInfo.slices.length === 0) && (
                <p className="text-sm text-gray-500">
                  Flight information is not available for this booking.
                </p>
              )}
              <div className="space-y-5">
                {slicesInfo.slices?.map((slice, sliceIndex) => {
                  const firstSeg = slice.segments?.[0] || {};
                  const lastSeg =
                    slice.segments?.[slice.segments?.length - 1] || {};

                  const sliceAirlineName =
                    firstSeg.marketing_carrier?.name ||
                    booking.flightData?.owner?.name ||
                    "";
                  const sliceAirlineLogo =
                    firstSeg.marketing_carrier?.logo_symbol_url ||
                    booking.flightData?.owner?.logo_symbol_url ||
                    "";
                  const sliceDuration = slice.duration || "";

                  return (
                    <div
                      key={sliceIndex}
                      className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4"
                    >
                      {/* Slice-level summary (route + carrier) */}
                      <div className="flex items-center gap-3 mb-1.5">
                        {sliceAirlineLogo && (
                          <Image
                            src={sliceAirlineLogo}
                            alt={sliceAirlineName || "Airline logo"}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain"
                          />
                        )}
                        <div>
                          {sliceAirlineName && (
                            <p className="font-semibold text-gray-900">
                              {sliceAirlineName}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {firstSeg.origin?.iata_code} →{" "}
                            {lastSeg.destination?.iata_code}
                          </p>
                          {sliceDuration && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Duration: {sliceDuration}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Per-segment details (shows all legs / layovers) */}
                      <div className="space-y-3">
                        {slice.segments?.map((segment, segIndex) => {
                          const segAirlineName =
                            segment.marketing_carrier?.name ||
                            segment.operating_carrier?.name ||
                            sliceAirlineName;
                          const segAirlineLogo =
                            segment.marketing_carrier?.logo_symbol_url ||
                            segment.operating_carrier?.logo_symbol_url ||
                            sliceAirlineLogo;

                          const cabinClass =
                            segment.cabin_class_marketing_name ||
                            segment.cabin_class ||
                            segment.cabin ||
                            "";

                          const aircraft =
                            segment.aircraft?.name ||
                            segment.aircraft?.id ||
                            segment.aircraft ||
                            "";

                          const segDuration = segment.duration || "";

                          const segPassengers = segment.passengers || [];
                          const firstPassenger = segPassengers[0];
                          const baggages = firstPassenger?.baggages || [];

                          return (
                            <div
                              key={segment.id || `${sliceIndex}-${segIndex}`}
                              className="border border-gray-100 rounded-lg p-3 flex flex-col gap-2"
                            >
                              <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                                {/* Departure */}
                                <div>
                                  <div className="text-sm font-semibold text-primary-text">
                                    {formatTime(segment.departing_at)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {segment.origin?.iata_code}{" "}
                                    {segment.origin?.city_name}
                                  </div>
                                  <div className="text-[11px] text-gray-500">
                                    {formatDate(segment.departing_at)}
                                  </div>
                                </div>

                                {/* Arrow / airline */}
                                <div className="flex-1 text-center">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                                    {segAirlineName}
                                  </p>
                                  {segDuration && (
                                    <p className="text-[11px] text-gray-500">
                                      Duration: {segDuration}
                                    </p>
                                  )}
                                </div>

                                {/* Arrival */}
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-primary-text">
                                    {formatTime(segment.arriving_at)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {segment.destination?.iata_code}{" "}
                                    {segment.destination?.city_name}
                                  </div>
                                  <div className="text-[11px] text-gray-500">
                                    {formatDate(segment.arriving_at)}
                                  </div>
                                </div>
                              </div>

                              {/* Extra technical details row */}
                              {(cabinClass || aircraft || baggages.length > 0) && (
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
                                  {cabinClass && (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                      Cabin: {cabinClass}
                                    </span>
                                  )}
                                  {aircraft && (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                      Aircraft: {aircraft}
                                    </span>
                                  )}
                                  {baggages.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                      Baggage:{" "}
                                      {baggages
                                        .map(
                                          (bag) =>
                                            `${bag.quantity} ${bag.type || ""}`.trim()
                                        )
                                        .join(", ")}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Passengers */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Passengers
              </h2>
              {passengers.length === 0 && (
                <p className="text-sm text-gray-500">
                  No passenger information available.
                </p>
              )}
              <div className="space-y-3">
                {passengers.map((p, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {p.title} {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.passengerType || "Adult"}
                      </p>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {p.dateOfBirth && (
                        <p>
                          DOB: {p.dateOfBirth.day}/{p.dateOfBirth.month}/
                          {p.dateOfBirth.year}
                        </p>
                      )}
                      {p.passportNumber && (
                        <p>Passport: {p.passportNumber}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: contact + payment + baggage */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact info
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 mb-0.5">Email</p>
                  <p className="text-gray-900 font-medium break-all">{email}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-0.5">Phone</p>
                  <p className="text-gray-900 font-medium">{phone}</p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 mb-0.5">Status</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {paymentStatus || "pending"}
                  </p>
                </div>
                {formattedAmount && (
                  <div>
                    <p className="text-gray-500 mb-0.5">Total amount</p>
                    <p className="text-gray-900 font-semibold">
                      {formattedAmount}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Baggage */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Baggage
              </h2>
              <div className="flex items-center justify-between gap-3">
                {[
                  {
                    count: baggageInfo.personalCount || 0,
                    label: "Personal",
                    icon: "/st-images/bags/personal-bag.png",
                  },
                  {
                    count: baggageInfo.carryOnCount || 0,
                    label: "Cabin",
                    icon: "/st-images/bags/cabin-baggage.png",
                  },
                  {
                    count: baggageInfo.checkedCount || 0,
                    label: "Checked",
                    icon: "/st-images/bags/cabin-baggage-checked.png",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center justify-center gap-1 text-primary-text flex-1"
                  >
                    <span className="text-base font-semibold">
                      {item.count}
                    </span>
                    <Image
                      src={item.icon}
                      alt={`${item.label} baggage`}
                      width={24}
                      height={24}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-[11px] text-gray-500 uppercase tracking-wide">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout bookingSubTab="upcoming" setBookingSubTab={() => {}}>
      <Seo title="Booking Details" noindex />
      <Rightbar>{renderContent()}</Rightbar>
    </DashboardLayout>
  );
};

export default BookingDetailsPage;

