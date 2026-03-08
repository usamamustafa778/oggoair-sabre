import React from "react";
import Container from "../common/Container";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChevronUp, Edit } from "lucide-react";

const FlightSearchHeader = ({
  searchParams,
  onEditClick,
  showEditMode,
  onCloseEdit,
}) => {
  const router = useRouter();

  console.log("searchParams", searchParams?.depAirport);

  // Extract search parameters from URL or props
  const fromIata = searchParams?.depAirport;
  const toIata = searchParams?.arrAirport || router.query.arrAirport;
  const date = searchParams?.depDate || router.query.depDate;
  const returnDate = searchParams?.returnDate || router.query.returnDate;
  // Support new 'adult' param with backward compatibility for 'adults'
  const adult =
    searchParams?.adult ||
    router.query.adult ||
    searchParams?.adults ||
    router.query.adults ||
    "1";
  const child = searchParams?.child || router.query.child || "0";
  const infant = searchParams?.infant || router.query.infant || "0";
  // Calculate total passengers
  const totalPassengers = parseInt(adult) + parseInt(child) + parseInt(infant);
  const passengers = totalPassengers.toString();
  const tripType = searchParams?.flightType || router.query.flightType;
  const classType = searchParams?.flightClass || router.query.flightClass;

  // Get city names from IATA codes or use defaults
  const from = searchParams?.from || router.query.from;
  const to = searchParams?.to || router.query.to;

  // Parse ISO yyyy-mm-dd into LOCAL date to avoid UTC shifting previous day
  const parseISOToLocalDate = (iso) => {
    try {
      const [y, m, d] = (iso || "").split("-").map((n) => parseInt(n, 10));
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d, 0, 0, 0, 0);
    } catch {
      return null;
    }
  };

  // Format date for display using local parsing
  const formatDateForDisplay = (dateString) => {
    const date = parseISOToLocalDate(dateString) || new Date(dateString);
    if (!date || Number.isNaN(date.getTime())) return "Wed, 10 Sept";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${
      months[date.getMonth()]
    }`;
  };

  const displayDate = formatDateForDisplay(date);
  const displayReturnDate = returnDate ? formatDateForDisplay(returnDate) : "";

  return (
    <div className=" pt-4 sm:pt-6 lg:pt-6.5 relative z-30">
      <Container>
        {/* Current Search Cards */}
        <div className="flex flex-col  gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* First card - One way */}
          <div className="bg-white border-2 border-gray-200 sm  rounded-[10px] sm:rounded-2xl">
            <div className=" rounded-lg border-2 border-white sm:rounded-xl  px-4 sm:px-7 py-4 sm:py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <Image
                  src="/st-images/flightSearch/flight.png"
                  alt="Flight"
                  width={26}
                  height={26}
                  className="text-gray-800 w-[20px] sm:w-[24px] h-auto"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base sm:text-lg lg:text-xl text-primary-text mb-1 sm:mb-3 leading-tight">
                    <span className="block sm:inline">{from}</span>
                    <span className="hidden sm:inline"> → </span>
                    <span className="block sm:inline sm:ml-1">{to}</span>
                  </div>
                  <div className="text-sm sm:text-base text-primary-text leading-tight">
                    {tripType === "round-trip" && displayReturnDate
                      ? `${displayDate} - ${displayReturnDate}`
                      : displayDate}
                    {` | ${passengers} Passenger${
                      passengers !== "1" ? "s" : ""
                    }`}
                    {tripType === "round-trip" && " | Return"}
                    {` | ${classType}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto relative z-40">
                <button
                  className={`cursor-pointer text-base sm:text-lg lg:text-xl text-gray-800  min-h-[45px] px-4 rounded-lg font-medium flex items-center justify-center gap-2 sm:gap-3 transition flex-1 sm:flex-none relative z-50 ${
                    showEditMode
                      ? "bg-gray-200 hover:bg-gray-300"
                      : "bg-primary-green hover:bg-lime-400"
                  }`}
                  onClick={onEditClick}
                >
                  {showEditMode ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <>
                      Edit <Edit className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Single card only; round-trip details are included above */}
        </div>
      </Container>
    </div>
  );
};

export default FlightSearchHeader;
