"use client";
import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

const EnhancedDatePicker = ({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  placeholder = "Select date",
  className = "",
  departureDate = null, // For range highlighting
  returnDate = null, // For range highlighting
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [nextMonth, setNextMonth] = useState(() => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    return next;
  });
  // Helpers to parse/format YYYY-MM-DD in LOCAL time (avoid UTC shift)
  const parseLocalISO = (iso) => {
    if (!iso || typeof iso !== "string") return null;
    const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };
  const formatLocalISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState(
    value ? parseLocalISO(value) : null
  );
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [dropdownDirection, setDropdownDirection] = useState("down");
  const dropdownRef = useRef(null);

  // Calculate dropdown position
  const calculatePosition = () => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const dropdownHeight = 400; // Approximate height of the dropdown
    const dropdownWidth = 640; // Approximate width for dual month view
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Calculate available space
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = viewportWidth - rect.left;

    // Determine vertical direction
    let top, direction;
    if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
      // Show below
      top = rect.bottom + 8;
      direction = "down";
    } else {
      // Show above
      top = rect.top - dropdownHeight - 8;
      direction = "up";
    }

    // Calculate horizontal position (responsive) - align to right edge of button
    let left = rect.right - dropdownWidth;

    // If dropdown would overflow left side, adjust to show from left edge of button
    if (left < 16) {
      left = rect.left;
      // If still overflows right, center it in viewport
      if (left + dropdownWidth > viewportWidth) {
        left = Math.max(16, viewportWidth - dropdownWidth - 16);
      }
    }

    // If dropdown would overflow right side, adjust
    if (left + dropdownWidth > viewportWidth) {
      left = Math.max(16, viewportWidth - dropdownWidth - 16);
    }

    setDropdownPosition({ top, left });
    setDropdownDirection(direction);
  };

  // Update position on scroll and resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      calculatePosition();
    };

    const handleResize = () => {
      calculatePosition();
    };

    // Add event listeners
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    // Initial calculation
    calculatePosition();

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown and not on a date picker element
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Check if the click target is part of the portal dropdown
        const isPortalElement = event.target.closest(
          '[data-portal="datepicker"]'
        );
        if (!isPortalElement) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      try {
        const date = parseLocalISO(value);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        } else {
          console.warn("Invalid date value:", value);
          setSelectedDate(null);
        }
      } catch (error) {
        console.error("Error parsing date value:", value, error);
        setSelectedDate(null);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Get calendar days for a specific month
  const getCalendarDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if date is in current month (for either displayed month)
  const isCurrentMonth = (date, monthToCheck) => {
    return (
      date.getMonth() === monthToCheck.getMonth() &&
      date.getFullYear() === monthToCheck.getFullYear()
    );
  };

  // Check if date is disabled
  const isDisabled = (date) => {
    if (minDate) {
      const min = parseLocalISO(minDate) || new Date(minDate);
      if (date < min) return true;
    }
    if (maxDate) {
      const max = parseLocalISO(maxDate) || new Date(maxDate);
      if (date > max) return true;
    }
    return false;
  };

  // Check if date is in range between departure and return dates
  const isInRange = (date) => {
    if (!departureDate || !returnDate) return false;

    const depDate = parseLocalISO(departureDate) || new Date(departureDate);
    const retDate = parseLocalISO(returnDate) || new Date(returnDate);
    const checkDate = parseLocalISO(date) || new Date(date);

    // Ensure we have the correct order (departure should be before return)
    const startDate = depDate < retDate ? depDate : retDate;
    const endDate = depDate < retDate ? retDate : depDate;

    // Check if date is between start and end (exclusive)
    return checkDate > startDate && checkDate < endDate;
  };

  // Check if date is departure date
  const isDepartureDate = (date) => {
    if (!departureDate) return false;

    const checkDate = parseLocalISO(date) || new Date(date);
    const depDate = parseLocalISO(departureDate) || new Date(departureDate);

    return checkDate.getTime() === depDate.getTime();
  };

  // Check if date is return date
  const isReturnDate = (date) => {
    if (!returnDate) return false;

    const checkDate = parseLocalISO(date) || new Date(date);
    const retDate = parseLocalISO(returnDate) || new Date(returnDate);

    return checkDate.getTime() === retDate.getTime();
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (isDisabled(date)) return;

    setSelectedDate(date);
    const formattedDate = formatLocalISO(date);
    onChange(formattedDate);
    setIsOpen(false);
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newCurrentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );
    const newNextMonth = new Date(
      newCurrentMonth.getFullYear(),
      newCurrentMonth.getMonth() + 1,
      1
    );
    setCurrentMonth(newCurrentMonth);
    setNextMonth(newNextMonth);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const newCurrentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    const newNextMonth = new Date(
      newCurrentMonth.getFullYear(),
      newCurrentMonth.getMonth() + 1,
      1
    );
    setCurrentMonth(newCurrentMonth);
    setNextMonth(newNextMonth);
  };

  // Get month name
  const getMonthName = (monthDate) => {
    return monthDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const currentMonthDays = getCalendarDays(currentMonth);
  const nextMonthDays = getCalendarDays(nextMonth);
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Render a single month calendar
  const renderMonth = (monthDate, monthDays) => (
    <div className="flex-1 min-w-0">
      {/* Week days header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-1 w-8"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {monthDays.map((date, index) => {
          const isInCurrentMonth = isCurrentMonth(date, monthDate);
          const isSelectedDate = isSelected(date);
          const isTodayDate = isToday(date);
          const isDisabledDate = isDisabled(date);
          const isRangeDate = isInRange(date);
          const isDeparture = isDepartureDate(date);
          const isReturn = isReturnDate(date);

          return (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateSelect(date);
              }}
              disabled={isDisabledDate}
              className={`
                w-10 h-10 text-sm font-medium transition-all duration-200 flex items-center justify-center cursor-pointer
                ${
                  isDisabledDate
                    ? "text-gray-300 cursor-not-allowed"
                    : isDeparture
                    ? "bg-primary-green text-primary-text hover:bg-secondary-green shadow-md"
                    : isReturn
                    ? "bg-primary-green text-primary-text hover:bg-secondary-green shadow-md rounded-lg"
                    : isSelectedDate
                    ? "bg-primary-green text-primary-text hover:bg-secondary-green shadow-md rounded-lg"
                    : isRangeDate
                    ? "bg-secondary-green text-primary-text hover:bg-primary-green"
                    : isTodayDate
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : isInCurrentMonth
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-gray-400 hover:bg-gray-50"
                }
              `}
              style={
                isDeparture || isReturn
                  ? {
                      backgroundColor: "var(--primary-green)",
                      color: "var(--primary-text)",
                      opacity: 1,
                    }
                  : undefined
              }
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input field */}
      <div
        className={`relative min-h-[60px] pt-6 pb-2 px-4 bg-white ${className} ${
          className.includes("border-l") ? "border-l border-gray-300" : ""
        }`}
      >
        <label className="block absolute top-2 left-4 text-xs font-medium text-gray-500">
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              // Calculate position when opening
              setTimeout(calculatePosition, 0);
            }
          }}
          className="w-full text-left  text-primary-text font-[500] text-lg focus:outline-none min-w-[160px]  flex items-center justify-between"
        >
          <span
            className={selectedDate ? "text-primary-text" : "text-gray-400"}
          >
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </span>
          {/* <Calendar className="w-5 h-5 text-gray-400" /> */}
        </button>
      </div>

      {/* Date picker dropdown */}
      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            data-portal="datepicker"
            className="fixed bg-white/95 rounded-xl shadow-2xl border border-gray-200 z-[9999] p-6 backdrop-blur-sm"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width:
                window.innerWidth < 768
                  ? "95vw"
                  : window.innerWidth < 1024
                  ? "600px"
                  : "650px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {/* Arrow indicator pointing to input */}
            <div
              className={`absolute w-0 h-0 border-l-5 border-r-5 border-transparent ${
                dropdownDirection === "down"
                  ? "border-b-5 border-b-white"
                  : "border-t-5 border-t-white"
              }`}
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                top: dropdownDirection === "down" ? "-5px" : "100%",
                right: "32px", // Changed from left to right positioning
              }}
            ></div>

            {/* Header with navigation and month names */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:shadow-md"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center justify-between flex-1 px-8">
                <h4 className="text-lg font-semibold text-primary-text">
                  {getMonthName(currentMonth)}
                </h4>
                <h4 className="text-lg font-semibold text-primary-text hidden md:block">
                  {getMonthName(nextMonth)}
                </h4>
              </div>

              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:shadow-md"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Dual month calendar */}
            <div className="flex flex-col md:flex-row justify-between w-full px-3 gap-6 md:gap-8">
              <div className="md:block w-fit">
                {renderMonth(currentMonth, currentMonthDays)}
              </div>
              <div className="md:block w-fit">
                {renderMonth(nextMonth, nextMonthDays)}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default EnhancedDatePicker;
