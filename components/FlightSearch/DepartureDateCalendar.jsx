import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPriceInEur } from "../../utils/priceConverter";

// Format helper kept small and local to avoid cross-file coupling
function formatDateLabel(date) {
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
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

function formatMonthDay(date) {
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
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Util to get yyyy-mm-dd in LOCAL time
function toISODate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Parse an ISO yyyy-mm-dd string into a LOCAL Date (midnight local)
function parseISOToLocalDate(iso) {
  if (!iso) return new Date();
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

/**
 * DepartureDateCalendar
 * - Shows 5 dates at a time centered around the selected date
 * - Arrow buttons move the 5-day window left/right
 * - Clicking a date calls onChange with ISO date string
 * - Price text is static for now (per requirements)
 */
const DepartureDateCalendar = ({
  selectedDate,
  onChange,
  minDate,
  rangeDays = 0,
  selectedPrice = null,
}) => {
  const initialCenter = useMemo(
    () =>
      typeof selectedDate === "string"
        ? parseISOToLocalDate(selectedDate)
        : new Date(selectedDate),
    [selectedDate]
  );
  const [centerDate, setCenterDate] = useState(initialCenter);

  // Re-center when external selected date changes
  React.useEffect(() => {
    setCenterDate(
      typeof selectedDate === "string"
        ? parseISOToLocalDate(selectedDate)
        : new Date(selectedDate)
    );
  }, [selectedDate]);

  const minDateObj = useMemo(
    () => (minDate ? parseISOToLocalDate(minDate) : null),
    [minDate]
  );

  const windowDates = useMemo(() => {
    // Compute start so we never go before minDate
    const start = new Date(centerDate);
    start.setDate(centerDate.getDate() - 2);
    if (minDateObj && start < minDateObj) {
      // Align left edge to minDate
      start.setTime(minDateObj.getTime());
    }

    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [centerDate, minDateObj]);

  const handlePrev = () => {
    // Determine if prev would go before minDate; if so, do nothing
    const leftMost = windowDates[0];
    if (minDateObj && leftMost <= minDateObj) return;
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() - 1); // slide window by 1 day
    setCenterDate(d);
  };

  const handleNext = () => {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + 1); // slide window by 1 day
    setCenterDate(d);
  };

  // When selectedDate is already an ISO string (YYYY-MM-DD), use it directly to avoid UTC shifts
  const selectedISO =
    typeof selectedDate === "string" ? selectedDate : toISODate(selectedDate);

  const prevDisabled = !!(
    minDateObj &&
    windowDates.length > 0 &&
    windowDates[0] <= minDateObj
  );

  return (
    <div className="bg-white rounded-xl border-gray-200">
      <div className="flex h-full items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={prevDisabled}
          className={`w-8 h-15 rounded-md flex items-center justify-center transition-colors ${
            prevDisabled
              ? "bg-gray-300 text-white cursor-not-allowed"
              : "bg-primary-text hover:bg-[#1e40af] text-white"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 flex justify-center bg-white mx-1.5">
          {windowDates.map((d) => {
            const iso = toISODate(d);
            const isSelected = iso === selectedISO;
            return (
              <div
                key={iso}
                onClick={() => onChange(iso)}
                className={`flex-1 p-2 text-center transition-all ${
                  isSelected
                    ? "text-primary-text cursor-pointer border-l border-r border-l-gray-100 border-r-gray-100 border-b-2 border-b-primary-text"
                    : "bg-white text-primary-text/60 cursor-pointer border-l border-r border-l-gray-100 border-r-gray-100 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-sm text-gray-800">
                  {rangeDays > 0
                    ? `${formatMonthDay(d)} – ${formatMonthDay(
                        new Date(
                          d.getFullYear(),
                          d.getMonth(),
                          d.getDate() + Math.max(1, rangeDays) - 1
                        )
                      )}`
                    : formatDateLabel(d)}
                </div>
                <div
                  className={`font-semibold text-base mt-1 ${
                    isSelected ? "text-primary-text" : "text-gray-600"
                  }`}
                >
                  {isSelected
                    ? selectedPrice != null
                      ? formatPriceInEur(selectedPrice, { decimals: 0 })
                      : "View"
                    : "View"}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          className="bg-primary-text hover:bg-[#1e40af] text-white w-8 h-15 rounded-md flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DepartureDateCalendar;
