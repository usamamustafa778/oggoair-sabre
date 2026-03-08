import React from "react";
import {
  Plane,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Edit3,
} from "lucide-react";
import { useRouter } from "next/router";

export default function FlightSearchSummary({ searchData, onEdit }) {
  const router = useRouter();

  // Get search parameters from URL
  const {
    depAirport,
    arrAirport,
    depDate,
    returnDate,
    flightClass,
    adult,
    child,
    infant,
    adults, // Backward compatibility
    children, // Backward compatibility
    babies, // Backward compatibility
    flightType,
    fromLat,
    fromLng,
    toLat,
    toLng,
  } = router.query;

  // If no search parameters, don't render the summary
  if (!depAirport || !arrAirport) {
    return null;
  }

  // Calculate total passengers - support new params with backward compatibility
  const adultCount = parseInt(adult || adults || 0, 10);
  const childCount = parseInt(child || children || 0, 10);
  const infantCount = parseInt(infant || babies || 0, 10);
  const totalPassengers = adultCount + childCount + infantCount;

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-white p-1  mb-8  ">
      <div className="flex items-center justify-between bg-gray-100 p-4  ">
        <div className="flex items-center gap-3 flex-1">
          {/* Airplane icon */}
          <div className="text-black">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>

          {/* Route */}
          <div className="flex-1">
            <div className="text-lg font-bold text-blue-900">
              {depAirport} → {arrAirport}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <span>{formatDate(depDate)}</span>
              <span className="text-gray-300">|</span>
              <span>
                {totalPassengers} Passenger{totalPassengers !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-300">|</span>
              <span className="capitalize">{flightClass || "Economy"}</span>
            </div>
          </div>
        </div>

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
