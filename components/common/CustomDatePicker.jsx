"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

const CustomDatePicker = ({
  value,
  onChange,
  label,
  disabled = false,
  className = "",
  minDate,
  maxDate,
  yearOrder = "desc", // "desc" for descending, "asc" for ascending
  error = null, // Error message to display
}) => {
  const containerRef = useRef(null);

  // Individual dropdown states
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Search terms for auto-suggestion
  const [daySearchTerm, setDaySearchTerm] = useState("");
  const [monthSearchTerm, setMonthSearchTerm] = useState("");
  const [yearSearchTerm, setYearSearchTerm] = useState("");

  // Highlighted indices for keyboard navigation
  const [highlightedDayIndex, setHighlightedDayIndex] = useState(-1);
  const [highlightedMonthIndex, setHighlightedMonthIndex] = useState(-1);
  const [highlightedYearIndex, setHighlightedYearIndex] = useState(-1);

  // Refs for individual inputs
  const dayInputRef = useRef(null);
  const monthInputRef = useRef(null);
  const yearInputRef = useRef(null);

  // Individual dropdown positions
  const [dayDropdownPosition, setDayDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [monthDropdownPosition, setMonthDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [yearDropdownPosition, setYearDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Parse the value to get individual parts
  const dateParts = value ? value.split("-") : ["", "", ""];
  const [year, month, day] = dateParts;

  // Generate dropdown options
  const getDayOptions = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i.toString().padStart(2, "0"));
    }
    return days;
  };

  const getMonthOptions = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames.map((label, idx) => ({
      value: (idx + 1).toString().padStart(2, "0"),
      label,
    }));
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    let minYear, maxYear;
    let order = yearOrder;

    // Determine if this is date of birth or expiry based on constraints
    const isDateOfBirth = maxDate && new Date(maxDate).getFullYear() <= currentYear;
    const isExpiry = minDate && new Date(minDate).getFullYear() >= currentYear;

    if (isDateOfBirth) {
      // Date of birth: descending from current to last 100 years
      maxYear = currentYear;
      minYear = currentYear - 100;
      order = "desc";
    } else if (isExpiry) {
      // Expiry: ascending from current to next 50 years
      minYear = currentYear;
      maxYear = currentYear + 50;
      order = "asc";
    } else if (minDate && maxDate) {
      // Use provided minDate and maxDate
      minYear = new Date(minDate).getFullYear();
      maxYear = new Date(maxDate).getFullYear();
    } else if (minDate) {
      // Only minDate provided
      minYear = new Date(minDate).getFullYear();
      maxYear = currentYear + 10; // Default to 10 years in future
    } else if (maxDate) {
      // Only maxDate provided
      minYear = currentYear - 100; // Default to 100 years ago
      maxYear = new Date(maxDate).getFullYear();
    } else {
      // No date constraints, use default (current year and past 100 years)
      minYear = currentYear - 100;
      maxYear = currentYear;
    }

    const years = [];
    if (order === "asc") {
      // Ascending order (earliest years first)
      for (let i = minYear; i <= maxYear; i++) {
        years.push(i.toString());
      }
    } else {
      // Descending order (most recent years first)
      for (let i = maxYear; i >= minYear; i--) {
        years.push(i.toString());
      }
    }
    return years;
  };

  // Filter options based on search terms
  const getFilteredDayOptions = () => {
    const allDays = getDayOptions();
    if (!daySearchTerm) return allDays;
    return allDays.filter((day) => day.includes(daySearchTerm));
  };

  const getFilteredMonthOptions = () => {
    const allMonths = getMonthOptions();
    if (!monthSearchTerm) return allMonths;
    const search = monthSearchTerm.toLowerCase();
    return allMonths.filter(
      (m) => m.value.includes(search) || m.label.toLowerCase().includes(search)
    );
  };

  const getFilteredYearOptions = () => {
    const allYears = getYearOptions();
    if (!yearSearchTerm) return allYears;
    return allYears.filter((year) => year.includes(yearSearchTerm));
  };

  // Functions to handle dropdown opening (ensure only one is open at a time)
  const openDayDropdown = () => {
    // Disabled: day has no dropdown
    setIsDayDropdownOpen(false);
  };

  const openMonthDropdown = () => {
    setIsDayDropdownOpen(false);
    setIsYearDropdownOpen(false);
    setIsMonthDropdownOpen(true);
    // Don't clear search term if user is typing
    if (!monthSearchTerm) {
      setMonthSearchTerm("");
    }
    setHighlightedMonthIndex(-1);
    // Use requestAnimationFrame to ensure position is calculated after state updates
    requestAnimationFrame(() => {
      updateMonthDropdownPosition();
    });
  };

  const openYearDropdown = () => {
    setIsDayDropdownOpen(false);
    setIsMonthDropdownOpen(false);
    setIsYearDropdownOpen(true);
    // Don't clear search term if user is typing
    if (!yearSearchTerm) {
      setYearSearchTerm("");
    }
    setHighlightedYearIndex(-1);
    // Use requestAnimationFrame to ensure position is calculated after state updates
    requestAnimationFrame(() => {
      updateYearDropdownPosition();
    });
  };

  // Calculate dropdown position for individual dropdowns
  const calculateDropdownPosition = (inputRef) => {
    if (!inputRef.current) return { top: 0, left: 0, width: 0 };

    const rect = inputRef.current.getBoundingClientRect();
    const dropdownHeight = 200;
    const viewportHeight = window.innerHeight;

    // Calculate available space
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Determine vertical position
    let top;
    if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
      top = rect.bottom + 4;
    } else {
      top = rect.top - dropdownHeight - 4;
    }

    const left = rect.left;

    return { top, left, width: rect.width };
  };

  // Update individual dropdown positions
  const updateDayDropdownPosition = () => {
    if (dayInputRef.current) {
      setDayDropdownPosition(calculateDropdownPosition(dayInputRef));
    }
  };

  const updateMonthDropdownPosition = () => {
    if (monthInputRef.current) {
      setMonthDropdownPosition(calculateDropdownPosition(monthInputRef));
    }
  };

  const updateYearDropdownPosition = () => {
    if (yearInputRef.current) {
      setYearDropdownPosition(calculateDropdownPosition(yearInputRef));
    }
  };

  // Update position on scroll and resize for individual dropdowns
  useEffect(() => {
    if (!isDayDropdownOpen && !isMonthDropdownOpen && !isYearDropdownOpen)
      return;

    const handleScroll = () => {
      if (isDayDropdownOpen) updateDayDropdownPosition();
      if (isMonthDropdownOpen) updateMonthDropdownPosition();
      if (isYearDropdownOpen) updateYearDropdownPosition();
    };

    const handleResize = () => {
      if (isDayDropdownOpen) updateDayDropdownPosition();
      if (isMonthDropdownOpen) updateMonthDropdownPosition();
      if (isYearDropdownOpen) updateYearDropdownPosition();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDayDropdownOpen, isMonthDropdownOpen, isYearDropdownOpen]);

  // Keyboard navigation handlers
  const handleDayKeyDown = (event) => {
    if (!isDayDropdownOpen) return;

    const filteredDays = getFilteredDayOptions();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedDayIndex((prev) =>
          prev < filteredDays.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedDayIndex((prev) =>
          prev > 0 ? prev - 1 : filteredDays.length - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedDayIndex >= 0 && filteredDays[highlightedDayIndex]) {
          handleInputChange(filteredDays[highlightedDayIndex], "day");
          setIsDayDropdownOpen(false);
          setDaySearchTerm("");
          setHighlightedDayIndex(-1);
          // Focus next field (month)
          setTimeout(() => {
            monthInputRef.current?.focus();
          }, 100);
        } else if (filteredDays.length > 0) {
          // Auto-select first option if none highlighted
          handleInputChange(filteredDays[0], "day");
          setIsDayDropdownOpen(false);
          setDaySearchTerm("");
          setHighlightedDayIndex(-1);
          // Focus next field (month)
          setTimeout(() => {
            monthInputRef.current?.focus();
          }, 100);
        }
        break;
      case "Escape":
        setIsDayDropdownOpen(false);
        setDaySearchTerm("");
        setHighlightedDayIndex(-1);
        break;
      case "Tab":
        // Allow normal tab behavior to move to next field
        break;
    }
  };

  const handleMonthKeyDown = (event) => {
    if (!isMonthDropdownOpen) return;

    const filteredMonths = getFilteredMonthOptions();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedMonthIndex((prev) =>
          prev < filteredMonths.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedMonthIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMonths.length - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (
          highlightedMonthIndex >= 0 &&
          filteredMonths[highlightedMonthIndex]
        ) {
          handleInputChange(
            filteredMonths[highlightedMonthIndex].value,
            "month"
          );
          setIsMonthDropdownOpen(false);
          setMonthSearchTerm("");
          setHighlightedMonthIndex(-1);
          // Focus next field (year)
          setTimeout(() => {
            yearInputRef.current?.focus();
          }, 100);
        } else if (filteredMonths.length > 0) {
          // Auto-select first option if none highlighted
          handleInputChange(filteredMonths[0].value, "month");
          setIsMonthDropdownOpen(false);
          setMonthSearchTerm("");
          setHighlightedMonthIndex(-1);
          // Focus next field (year)
          setTimeout(() => {
            yearInputRef.current?.focus();
          }, 100);
        }
        break;
      case "Escape":
        setIsMonthDropdownOpen(false);
        setMonthSearchTerm("");
        setHighlightedMonthIndex(-1);
        break;
      case "Tab":
        // Allow normal tab behavior to move to next field
        break;
    }
  };

  const handleYearKeyDown = (event) => {
    if (!isYearDropdownOpen) return;

    const filteredYears = getFilteredYearOptions();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedYearIndex((prev) =>
          prev < filteredYears.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedYearIndex((prev) =>
          prev > 0 ? prev - 1 : filteredYears.length - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedYearIndex >= 0 && filteredYears[highlightedYearIndex]) {
          handleInputChange(filteredYears[highlightedYearIndex], "year");
          setIsYearDropdownOpen(false);
          setYearSearchTerm("");
          setHighlightedYearIndex(-1);
          yearInputRef.current?.blur();
        } else if (filteredYears.length > 0) {
          // Auto-select first option if none highlighted
          handleInputChange(filteredYears[0], "year");
          setIsYearDropdownOpen(false);
          setYearSearchTerm("");
          setHighlightedYearIndex(-1);
          yearInputRef.current?.blur();
        }
        break;
      case "Escape":
        setIsYearDropdownOpen(false);
        setYearSearchTerm("");
        setHighlightedYearIndex(-1);
        break;
      case "Tab":
        // Allow normal tab behavior to move to next field
        break;
    }
  };

  // Auto-highlight first matching item when search term changes
  useEffect(() => {
    if (daySearchTerm && getFilteredDayOptions().length > 0) {
      setHighlightedDayIndex(0);
    } else if (getFilteredDayOptions().length > 0) {
      setHighlightedDayIndex(0);
    } else {
      setHighlightedDayIndex(-1);
    }
  }, [daySearchTerm]);

  useEffect(() => {
    if (monthSearchTerm && getFilteredMonthOptions().length > 0) {
      setHighlightedMonthIndex(0);
    } else if (getFilteredMonthOptions().length > 0) {
      setHighlightedMonthIndex(0);
    } else {
      setHighlightedMonthIndex(-1);
    }
    // Update dropdown position when search term changes
    if (isMonthDropdownOpen) {
      // Use requestAnimationFrame to ensure position is calculated after any layout changes
      requestAnimationFrame(() => {
        updateMonthDropdownPosition();
      });
    }
  }, [monthSearchTerm, isMonthDropdownOpen]);

  useEffect(() => {
    if (yearSearchTerm && getFilteredYearOptions().length > 0) {
      setHighlightedYearIndex(0);
    } else if (getFilteredYearOptions().length > 0) {
      setHighlightedYearIndex(0);
    } else {
      setHighlightedYearIndex(-1);
    }
    // Update dropdown position when search term changes
    if (isYearDropdownOpen) {
      // Use requestAnimationFrame to ensure position is calculated after any layout changes
      requestAnimationFrame(() => {
        updateYearDropdownPosition();
      });
    }
  }, [yearSearchTerm, isYearDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        const isPortalElement = event.target.closest(
          '[data-portal="dropdown"]'
        );
        if (!isPortalElement) {
          setIsDayDropdownOpen(false);
          setIsMonthDropdownOpen(false);
          setIsYearDropdownOpen(false);
          setDaySearchTerm("");
          setMonthSearchTerm("");
          setYearSearchTerm("");
          setHighlightedDayIndex(-1);
          setHighlightedMonthIndex(-1);
          setHighlightedYearIndex(-1);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDayDropdownOpen, isMonthDropdownOpen, isYearDropdownOpen]);

  // Handle manual input changes
  const handleInputChange = (newValue, type) => {
    let newYear = year;
    let newMonth = month;
    let newDay = day;

    if (type === "day") {
      newDay = newValue;
      setDaySearchTerm(newValue);
    } else if (type === "month") {
      newMonth = newValue;
      setMonthSearchTerm(newValue);
    } else if (type === "year") {
      newYear = newValue;
      setYearSearchTerm(newValue);
    }

    // Always update with the current values (even partial)
    const formattedDate = `${newYear || ""}-${newMonth || ""}-${newDay || ""}`;
    onChange(formattedDate);
  };

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>

      <div className="flex gap-2 relative">
        {/* DD Input */}
        <div className="w-1/3 relative">
          <input
            ref={dayInputRef}
            placeholder="DD"
            maxLength={2}
            value={
              daySearchTerm !== undefined && daySearchTerm !== ""
                ? daySearchTerm
                : day || ""
            }
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              // Allow empty value or valid day range
              if (
                value === "" ||
                (value.length <= 2 && parseInt(value) <= 31)
              ) {
                setDaySearchTerm(value);
                handleInputChange(value, "day");
              }
            }}
            onFocus={() => {}}
            onKeyDown={handleDayKeyDown}
            disabled={disabled}
            className={`w-full px-3 text-center py-3.5 border text-sm rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50 ${
              error ? "border-red-500 bg-red-50" : "border-gray-100 bg-white"
            }`}
          />

          {/* Day Dropdown */}
          {false &&
            isDayDropdownOpen &&
            !disabled &&
            typeof window !== "undefined" &&
            createPortal(
              <div
                data-portal="dropdown"
                className="fixed bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] max-h-48 overflow-y-auto"
                style={{
                  top: dayDropdownPosition.top,
                  left: dayDropdownPosition.left,
                  width: dayDropdownPosition.width,
                  minWidth: 80,
                }}
              >
                {getFilteredDayOptions().map((dayOption, index) => (
                  <button
                    key={dayOption}
                    className={`w-full px-3 py-2 text-center transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                      highlightedDayIndex === index
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      handleInputChange(dayOption, "day");
                      setIsDayDropdownOpen(false);
                      setDaySearchTerm("");
                      setHighlightedDayIndex(-1);
                      // Focus next field (month)
                      setTimeout(() => {
                        monthInputRef.current?.focus();
                      }, 100);
                    }}
                    onMouseEnter={() => setHighlightedDayIndex(index)}
                  >
                    {dayOption}
                  </button>
                ))}
              </div>,
              document.body
            )}
        </div>

        {/* MM Input */}
        <div className="w-1/3 relative">
          <div className="relative">
            <input
              ref={monthInputRef}
              placeholder="Month"
              value={
                monthSearchTerm !== undefined && monthSearchTerm !== ""
                  ? monthSearchTerm
                  : month
                  ? getMonthOptions().find((m) => m.value === month)?.label ||
                    ""
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                setMonthSearchTerm(value);
                setHighlightedMonthIndex(-1);
                if (!isMonthDropdownOpen) {
                  openMonthDropdown();
                }
              }}
              onFocus={openMonthDropdown}
              onKeyDown={handleMonthKeyDown}
              disabled={disabled}
              className={`w-full px-3 py-3.5 border text-sm rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50 ${
                error ? "border-red-500 bg-red-50" : "border-gray-100 bg-white"
              }`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Month Dropdown */}
          {isMonthDropdownOpen &&
            !disabled &&
            typeof window !== "undefined" &&
            createPortal(
              <div
                data-portal="dropdown"
                className="fixed bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] max-h-60 overflow-hidden"
                style={{
                  top: monthDropdownPosition.top,
                  left: monthDropdownPosition.left,
                  width: Math.max(monthDropdownPosition.width, 200),
                  minWidth: 200,
                }}
              >
                <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {getFilteredMonthOptions().map((monthOption, index) => (
                    <button
                      key={monthOption.value}
                      className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center justify-between group ${
                        highlightedMonthIndex === index
                          ? "bg-gray-50 text-gray-700 border-l-4 border-gray-500"
                          : "hover:bg-gray-50 text-gray-700"
                      } ${
                        month === monthOption.value
                          ? "bg-gray-100 text-gray-800 font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        handleInputChange(monthOption.value, "month");
                        setIsMonthDropdownOpen(false);
                        setMonthSearchTerm(""); // Clear search term when month is selected
                        setHighlightedMonthIndex(-1);
                        // Focus next field (year)
                        setTimeout(() => {
                          yearInputRef.current?.focus();
                        }, 100);
                      }}
                      onMouseEnter={() => setHighlightedMonthIndex(index)}
                    >
                      <span className="text-sm font-medium">
                        {monthOption.label}
                      </span>
                      {month === monthOption.value && (
                        <Check className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>,
              document.body
            )}
        </div>

        {/* YYYY Input */}
        <div className="w-1/3 relative">
          <div className="relative">
            <input
              ref={yearInputRef}
              placeholder="YYYY"
              maxLength={4}
              value={
                yearSearchTerm !== undefined && yearSearchTerm !== ""
                  ? yearSearchTerm
                  : year || ""
              }
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setYearSearchTerm(value);
                setHighlightedYearIndex(-1);
                handleInputChange(value, "year");
                // Open dropdown when user starts typing
                if (!isYearDropdownOpen) {
                  openYearDropdown();
                }
              }}
              onFocus={openYearDropdown}
              onKeyDown={handleYearKeyDown}
              disabled={disabled}
              className={`w-full px-3 text-center py-3.5 border text-sm rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-50 ${
                error ? "border-red-500 bg-red-50" : "border-gray-100 bg-white"
              }`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Year Dropdown */}
          {isYearDropdownOpen &&
            !disabled &&
            typeof window !== "undefined" &&
            createPortal(
              <div
                data-portal="dropdown"
                className="fixed bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] max-h-60 overflow-hidden"
                style={{
                  top: yearDropdownPosition.top,
                  left: yearDropdownPosition.left,
                  width: Math.max(yearDropdownPosition.width, 200),
                  minWidth: 200,
                }}
              >
                <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {getFilteredYearOptions().map((yearOption, index) => (
                    <button
                      key={yearOption}
                      className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center justify-between group ${
                        highlightedYearIndex === index
                          ? "bg-gray-50 text-gray-700 border-l-4 border-gray-500"
                          : "hover:bg-gray-50 text-gray-700"
                      } ${
                        year === yearOption
                          ? "bg-gray-100 text-gray-800 font-medium"
                          : ""
                      }`}
                      onClick={() => {
                        handleInputChange(yearOption, "year");
                        setIsYearDropdownOpen(false);
                        setYearSearchTerm("");
                        setHighlightedYearIndex(-1);
                        yearInputRef.current?.blur();
                      }}
                      onMouseEnter={() => setHighlightedYearIndex(index)}
                    >
                      <span className="text-sm font-medium">{yearOption}</span>
                      {year === yearOption && (
                        <Check className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>,
              document.body
            )}
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default CustomDatePicker;
