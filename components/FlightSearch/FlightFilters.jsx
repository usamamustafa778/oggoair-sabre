import React, { useState, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, SearchIcon } from "lucide-react";
const FlightFilters = ({ filters, setFilters, availableAirlines = [] }) => {
  console.log("FlightFilters received availableAirlines:", availableAirlines);
  console.log("FlightFilters received filters:", filters);
  const [expandedSections, setExpandedSections] = useState({
    priceAlerts: false,
    bags: true,
    stops: true,
    connections: true,
    carriers: true,
    bookingOptions: true,
    travelHacks: false,
    excludeCountries: false,
    times: false,
    duration: false,
    price: false,
    days: false,
  });

  const [carrierSearch, setCarrierSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [showAllCarriers, setShowAllCarriers] = useState(false);

  // Ref to maintain focus on search input
  const searchInputRef = useRef(null);

  // Memoize filtered airlines to prevent re-calculation on every render
  // Normalize airlines input to objects: { name, logo }
  const normalizedAirlines = useMemo(() => {
    const normalized = (availableAirlines || []).map((airline) =>
      typeof airline === "string"
        ? { name: airline, logo: "/st-images/flightSearch/a.png" }
        : airline
    );
    console.log("Normalized airlines for filters:", normalized);
    return normalized;
  }, [availableAirlines]);

  const filteredAirlines = useMemo(() => {
    if (!carrierSearch.trim()) return normalizedAirlines;
    return normalizedAirlines.filter((airline) =>
      airline.name.toLowerCase().includes(carrierSearch.toLowerCase())
    );
  }, [normalizedAirlines, carrierSearch]);

  const displayedAirlines = useMemo(
    () => (showAllCarriers ? filteredAirlines : filteredAirlines.slice(0, 7)),
    [filteredAirlines, showAllCarriers]
  );

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));

    // Reset "Show all carriers" when carriers section is toggled
    if (section === "carriers") {
      setShowAllCarriers(false);
    }
  };

  const handleCheckboxChange = useCallback(
    (section, value) => {
      console.log("Checkbox changed:", section, value);
      setFilters((prev) => {
        const arr = prev[section] || [];
        const newArr = arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value];
        console.log("New filter state:", { ...prev, [section]: newArr });
        return {
          ...prev,
          [section]: newArr,
        };
      });
    },
    [setFilters]
  );

  // Stable callbacks for SearchInput
  const handleSearchChange = useCallback((e) => {
    setCarrierSearch(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setCarrierSearch("");
  }, []);
  const handleSliderChange = (section, minOrMax, value) => {
    setFilters((prev) => {
      const arr = [...(prev[section] || [])];
      if (minOrMax === 0) arr[0] = value;
      else arr[1] = value;
      return { ...prev, [section]: arr };
    });
  };

  const handleRadioChange = (section, value) => {
    setFilters((prev) => ({
      ...prev,
      [section]: value,
    }));
  };

  const handleToggleChange = (section) => {
    setFilters((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCounterChange = (section, increment) => {
    setFilters((prev) => ({
      ...prev,
      [section]: Math.max(0, (prev[section] || 0) + increment),
    }));
  };

  // Track all default filter keys
  const defaultSections = {
    priceAlerts: false,
    bags: [],
    stops: [],
    connections: [],
    carriers: [],
    bookingOptions: [],
    travelHacks: [],
    excludeCountries: [],
    times: [],
    duration: [],
    price: [],
    days: [],
    airlines: [],
    stopsType: "",
    overnightStopovers: [],
    kayakOnly: false,
    selfTransfer: [],
    selfTransferHack: [],
    throwawayTicketing: [],
    hiddenCities: [],
    excludedCountries: [],
    selectedDay: "",
    departureTime: [0, 24],
    arrivalTime: [0, 24],
    priceRange: [0, 2000],
    maxTravelTime: [0, 48],
    stopoverDuration: [2, 24],
    checkedBaggage: 0,
    cabinBaggage: 0,
  };

  // Map section names to their actual filter keys
  const sectionToFilterKeys = {
    bags: ["cabinBaggage", "checkedBaggage"],
    stops: ["stopsType", "overnightStopovers"],
    connections: ["selfTransfer"],
    carriers: ["airlines"],
    bookingOptions: ["kayakOnly"],
    travelHacks: ["selfTransferHack", "throwawayTicketing", "hiddenCities"],
    excludeCountries: ["excludedCountries"],
    times: ["departureTime", "arrivalTime"],
    duration: ["maxTravelTime", "stopoverDuration"],
    price: ["priceRange"],
    days: ["selectedDay"],
  };

  // Utility to check if a filter section is at default
  const isDefaultSection = (section) => {
    // If it's a direct filter key (not a section name), check directly
    if (
      defaultSections.hasOwnProperty(section) &&
      !sectionToFilterKeys[section]
    ) {
      const current = filters[section];
      const def = defaultSections[section];
      if (Array.isArray(def))
        return JSON.stringify(current || []) === JSON.stringify(def);
      return (current ?? def) === def;
    }

    // If it's a section name, check all related filter keys
    const filterKeys = sectionToFilterKeys[section];
    if (!filterKeys) return true; // Section has no filters, consider it default

    return filterKeys.every((key) => {
      const current = filters[key];
      const def = defaultSections[key];
      if (Array.isArray(def))
        return JSON.stringify(current || []) === JSON.stringify(def);
      return (current ?? def) === def;
    });
  };

  // 1. Reset all filters to initial/default state - only reset filters that have been changed
  const handleResetAllFilters = () => {
    setFilters((prev) => {
      const updated = { ...prev };
      // Only reset filters that exist in prev and are different from default
      Object.keys(defaultSections).forEach((key) => {
        if (prev.hasOwnProperty(key)) {
          const current = prev[key];
          const def = defaultSections[key];
          // Check if current value is different from default
          let isDifferent = false;
          if (Array.isArray(def)) {
            isDifferent = JSON.stringify(current || []) !== JSON.stringify(def);
          } else {
            isDifferent = (current ?? def) !== def;
          }
          // Only reset if different from default
          if (isDifferent) {
            updated[key] = def;
          }
        }
      });
      return updated;
    });
    setCarrierSearch("");
    setCountrySearch("");
    setShowAllCarriers(false);
  };

  // 2. Reset only a section
  const handleResetSection = (section) => {
    const filterKeys = sectionToFilterKeys[section];
    if (filterKeys) {
      // Reset all related filter keys for this section
      setFilters((prev) => {
        const updated = { ...prev };
        filterKeys.forEach((key) => {
          updated[key] = defaultSections[key];
        });
        return updated;
      });
      // Reset search states if applicable
      if (section === "carriers") {
        setCarrierSearch("");
        setShowAllCarriers(false);
      }
      if (section === "excludeCountries") {
        setCountrySearch("");
      }
    } else {
      // Direct filter key reset
      setFilters((prev) => ({ ...prev, [section]: defaultSections[section] }));
    }
  };

  const FilterSection = ({
    title,
    section,
    children,
    isExpanded,
    onToggle,
  }) => (
    <div className="border-b border-gray-200 py-4 pb-5">
      <div className="flex justify-between items-center w-full mb-2">
        <button
          onClick={onToggle}
          className="flex justify-between items-center w-full text-left font-medium text-sm text-gray-900 hover:text-primary-text cursor-pointer"
        >
          <span className="font-bold text-[16px] text-primary-text">
            {title}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-primary-text ml-3 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-primary-text ml-3 flex-shrink-0" />
          )}
        </button>
      </div>
      {/* Per-section Reset button positioned under heading */}
      {isExpanded && (
        <button
          onClick={() => handleResetSection(section)}
          className={`text-[12.5px] font-semibold text-[#7d1436] underline underline-offset-2 tracking-wide mb-2 text-left ${
            isDefaultSection(section)
              ? "opacity-40 cursor-default"
              : "hover:opacity-80 cursor-pointer"
          }`}
          title={`Reset ${title} filter`}
          type="button"
          disabled={isDefaultSection(section)}
        >
          Reset filter
        </button>
      )}
      {isExpanded && <div className="space-y-1.5">{children}</div>}
    </div>
  );

  // Separate SearchInput component to prevent re-renders
  const SearchInput = React.memo(({ value, onChange, onClear }) => (
    <div className="flex-1 relative flex flex-row items-center gap-2 rounded-md px-2.5 h-9 bg-gray-50 border border-gray-200 focus-within:ring-2 focus-within:ring-primary-green/30">
      <SearchIcon className="w-5 h-5 text-primary-text/80" strokeWidth={2.5} />
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search airlines"
        value={value}
        onChange={onChange}
        className="w-full text-[13px] py-1.5 outline-none bg-transparent placeholder:text-primary-text/60 placeholder:font-medium"
      />
      {value && (
        <button
          onClick={onClear}
          className="text-gray-400 hover:text-gray-600 p-1"
          type="button"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  ));

  const CheckboxItem = ({
    label,
    checked = false,
    section,
    displayLabel = null,
    logo = null,
  }) => {
    const isChecked =
      Array.isArray(filters[section]) && filters[section].includes(label);
    return (
      <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-50">
        <div className="relative">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => handleCheckboxChange(section, label)}
            className="sr-only"
          />
          <div
            className={`w-4 h-4 border-2 border-primary-text rounded-[3px] transition-all duration-200 flex items-center justify-center ${
              isChecked ? "bg-primary-text text-white" : " bg-white "
            }`}
          >
            {isChecked && (
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
        <span className="flex items-center gap-2 text-[13px] font-medium text-primary-text">
          {logo && (
            <Image
              src={logo}
              alt={displayLabel || label}
              width={24}
              height={16}
              className="w-auto h-4 object-contain"
              onError={(e) => {
                console.log("Failed to load airline logo:", logo);
                e.target.style.display = "none";
              }}
            />
          )}
          <span className="truncate">{displayLabel || label}</span>
        </span>
      </label>
    );
  };

  const SliderRange = ({ min, max, unit = "h", section, label = null }) => {
    const formatTimeValue = (value, unit) => {
      if (
        unit === "" &&
        section &&
        (section.includes("Time") || section.includes("time"))
      ) {
        // Format as time (23.59 format)
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        if (value === 24 || (hours === 23 && minutes >= 59)) {
          return "23.59";
        }
        return `${hours.toString().padStart(2, "0")}.${minutes
          .toString()
          .padStart(2, "0")}`;
      }
      return `${value}${unit}`;
    };

    // Check if the current values are different from default range
    const currentMin = filters[section]?.[0] ?? min;
    const currentMax = filters[section]?.[1] ?? max;
    const isSelected = currentMin !== min || currentMax !== max;
    const isFullRange = currentMin === min && currentMax === max;

    return (
      <div className="space-y-2">
        {label && (
          <div className="text-[13.5px] pb-[13px] font-medium text-[#197ae4] tracking-widest">
            {label}
          </div>
        )}

        <div className="relative h-6 flex items-center">
          <div className="absolute w-full h-1 bg-gray-300 rounded-full"></div>

          {/* Selected Range Indicator */}
          <div
            className={`absolute h-1 rounded-full transition-all duration-200 ${
              isFullRange
                ? "bg-primary-text"
                : isSelected
                ? "bg-primary-green"
                : "bg-primary-text"
            }`}
            style={{
              left: `${((currentMin - min) / (max - min)) * 100}%`,
              width: `${((currentMax - currentMin) / (max - min)) * 100}%`,
            }}
          ></div>

          {/* Range Inputs */}
          <input
            type="range"
            min={min}
            max={max}
            step={unit === "" ? 0.25 : 1}
            value={currentMin}
            onChange={(e) =>
              handleSliderChange(section, 0, Number(e.target.value))
            }
            className={`absolute w-full h-1 bg-transparent appearance-none cursor-pointer z-10
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white 
                        [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
                        [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white 
                        [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 ${
                          isFullRange
                            ? "[&::-webkit-slider-thumb]:bg-primary-text [&::-webkit-slider-thumb]:hover:bg-primary-green [&::-moz-range-thumb]:bg-primary-text [&::-moz-range-thumb]:hover:bg-primary-green"
                            : isSelected
                            ? "[&::-webkit-slider-thumb]:bg-primary-green [&::-webkit-slider-thumb]:hover:bg-green-600 [&::-moz-range-thumb]:bg-primary-green [&::-moz-range-thumb]:hover:bg-green-600"
                            : "[&::-webkit-slider-thumb]:bg-primary-text [&::-webkit-slider-thumb]:hover:bg-primary-green [&::-moz-range-thumb]:bg-primary-text [&::-moz-range-thumb]:hover:bg-primary-green"
                        }`}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={unit === "" ? 0.25 : 1}
            value={currentMax}
            onChange={(e) =>
              handleSliderChange(section, 1, Number(e.target.value))
            }
            className={`absolute w-full h-1 bg-transparent appearance-none cursor-pointer z-10
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white 
                        [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
                        [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 
                        [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white 
                        [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-200 ${
                          isFullRange
                            ? "[&::-webkit-slider-thumb]:bg-primary-text [&::-webkit-slider-thumb]:hover:bg-primary-green [&::-moz-range-thumb]:bg-primary-text [&::-moz-range-thumb]:hover:bg-primary-green"
                            : isSelected
                            ? "[&::-webkit-slider-thumb]:bg-primary-green [&::-webkit-slider-thumb]:hover:bg-green-600 [&::-moz-range-thumb]:bg-primary-green [&::-moz-range-thumb]:hover:bg-green-600"
                            : "[&::-webkit-slider-thumb]:bg-primary-text [&::-webkit-slider-thumb]:hover:bg-primary-green [&::-moz-range-thumb]:bg-primary-text [&::-moz-range-thumb]:hover:bg-primary-green"
                        }`}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 font-semibold px-2 pt-2 tracking-widest">
          <span>{formatTimeValue(currentMin, unit)}</span>
          <span>{formatTimeValue(currentMax, unit)}</span>
        </div>
      </div>
    );
  };

  const RadioItem = ({ label, value, section, checked = false }) => (
    <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-50">
      <div className="relative flex items-center ">
        <input
          type="radio"
          checked={filters[section] === value}
          onChange={() => handleRadioChange(section, value)}
          className="w-5 h-5 text-primary-text accent-primary-text border-gray-300 rounded-full "
        />
      </div>
      <span className="text-[13px] font-medium text-primary-text">{label}</span>
    </label>
  );

  const ToggleSwitch = ({ section }) => (
    <div className="flex items-start justify-between cursor-pointer flex-col text-primary-text text-sm border-b border-gray-200 pb-7">
      <div className="flex items-center justify-between w-full">
        <span className="text-[16px] font-semibold">Set up price alerts</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters[section] || false}
            onChange={() => handleToggleChange(section)}
            className="sr-only"
          />
          <div
            className={`w-11 h-6.5 rounded-full ${
              filters[section] ? "bg-primary-green" : "bg-black"
            } transition-colors relative`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 flex items-center  bg-white justify-center rounded-full transition-transform ${
                filters[section] ? "translate-x-4.5" : "translate-x-0"
              }`}
            >
              <Image
                src="/st-images/bill.png"
                alt="check"
                width={20}
                height={20}
                className="w-auto h-[13.5px] object-contain"
              />
            </div>
          </div>
        </label>
      </div>
      <span className="text-[13px] mt-3 text-primary-text/80 flex-1 mr-3">
        Receive alerts when the prices for this route change.
      </span>
    </div>
  );

  const Counter = ({ section, label, min = 0, max = 10, icon }) => (
    <div className="flex items-center justify-between my-2.5 ">
      <div className="flex items-center gap-2">
        <Image
          src={icon || "/st-images/bags/cabin-baggage.png"}
          alt={label}
          width={20}
          height={20}
          className="w-5 h-5 object-contain"
        />
        <span className="text-sm text-primary-text">{label}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleCounterChange(section, -1)}
          disabled={(filters[section] || 0) <= min}
          aria-label={`Decrease ${label}`}
          className="w-6 h-6 bg-white rounded-full border border-gray-300 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-50 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-semibold text-primary-text">
          {filters[section] || 0}
        </span>
        <button
          onClick={() => handleCounterChange(section, 1)}
          disabled={(filters[section] || 0) >= max}
          aria-label={`Increase ${label}`}
          className="w-6 h-6 bg-white rounded-full border border-gray-300 flex items-center justify-center text-sm text-gray-600 hover:bg-gray-50 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );

  const DaySelector = () => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    const dayValues = [1, 2, 3, 4, 5, 6, 0]; // Monday = 1, Sunday = 0

    return (
      <div className="flex justify-center space-x-4 pt-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleRadioChange("selectedDay", dayValues[index])}
            className={`w-8 h-8 rounded-full text-[14.5px] font-semibold ${
              filters.selectedDay === dayValues[index]
                ? "bg-primary-text text-white "
                : "bg-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl pt-6 px-2.5 border border-gray-200 shadow-sm w-full sticky top-20 max-h-[calc(100vh-87px)] flex flex-col">
      <div className="px-3 flex-1 overflow-y-auto">
        <ToggleSwitch section="priceAlerts" />

        {/* Bags */}
        <FilterSection
          title="Bags"
          section="bags"
          isExpanded={expandedSections.bags}
          onToggle={() => toggleSection("bags")}
        >
          <Counter
            section="cabinBaggage"
            label="Cabin baggage"
            icon="/st-images/bags/cabin-baggage.png"
            min={0}
            max={5}
          />
          <Counter
            section="checkedBaggage"
            label="Checked baggage"
            icon="/st-images/bags/cabin-baggage-checked.png"
            min={0}
            max={5}
          />
        </FilterSection>

        {/* Stops */}
        <FilterSection
          title="Stops"
          section="stops"
          isExpanded={expandedSections.stops}
          onToggle={() => toggleSection("stops")}
        >
          <div className="space-y-0.5">
            <RadioItem label="Any" value="any" section="stopsType" />
            <RadioItem label="Direct" value="direct" section="stopsType" />
            <RadioItem label="Up to 1 stop" value="1stop" section="stopsType" />
            <RadioItem
              label="Up to 2 stops"
              value="2stops"
              section="stopsType"
            />
            <div className="mt-3">
              <CheckboxItem
                label="Allow overnight stopovers"
                section="overnightStopovers"
              />
            </div>
          </div>
        </FilterSection>

        {/* Connections */}
        <FilterSection
          title="Connections"
          section="connections"
          isExpanded={expandedSections.connections}
          onToggle={() => toggleSection("connections")}
        >
          <CheckboxItem
            label="Self-transfer to different station/airport"
            section="selfTransfer"
          />
        </FilterSection>

        {/* Carriers */}
        <FilterSection
          title="Carriers"
          section="carriers"
          isExpanded={expandedSections.carriers}
          onToggle={() => toggleSection("carriers")}
        >
          <div className="space-y-3 ">
            <div className="flex items-center space-x-4 py-1">
              <SearchInput
                value={carrierSearch}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
              />
            </div>
            <div className="text-base font-medium text-primary-text tracking-widest mb-2">
              In results
            </div>
            <div className="space-y-2">
              {normalizedAirlines.length > 0 ? (
                displayedAirlines.map((airline) => (
                  <CheckboxItem
                    key={airline.name}
                    label={airline.name}
                    logo={airline.logo}
                    section="airlines"
                  />
                ))
              ) : (
                <div className="text-xs text-gray-500">Loading airlines...</div>
              )}
            </div>
            {filteredAirlines.length > 7 && (
              <button
                onClick={() => setShowAllCarriers(!showAllCarriers)}
                className="text-sm text-primary-text hover:text-primary-text/50 text-center w-full font-medium tracking-widest"
              >
                {showAllCarriers ? "Show less carriers" : "Show all carriers"}
              </button>
            )}
          </div>
        </FilterSection>

        {/* Booking Options */}
        <FilterSection
          title="Booking options"
          section="bookingOptions"
          isExpanded={expandedSections.bookingOptions}
          onToggle={() => toggleSection("bookingOptions")}
        >
          <CheckboxItem
            label="Show only kayak.com results"
            section="kayakOnly"
          />
        </FilterSection>
        {/* travel hacks */}
        <FilterSection
          title="Travel hacks"
          section="travelHacks"
          isExpanded={expandedSections.travelHacks}
          onToggle={() => toggleSection("travelHacks")}
        >
          <CheckboxItem label="Self-transfer" section="selfTransferHack" />
          <CheckboxItem
            label="Throwaway ticketing"
            section="throwawayTicketing"
          />
          <CheckboxItem label="Hidden cities" section="hiddenCities" />
        </FilterSection>

        {/* Exclude Countries */}
        <FilterSection
          title="Exclude countries"
          section="excludeCountries"
          isExpanded={expandedSections.excludeCountries}
          onToggle={() => toggleSection("excludeCountries")}
        >
          <div className="space-y-3">
            <div className="text-[13.5px] font-medium tracking-widest text-primary-text pt-1">
              Please select any countries you do not want to travel through on
              your journey
            </div>
            <div className="flex items-center space-x-2 pt-1.5">
              <div className="flex-1 relative bg-gray-200 flex flex-row items-center gap-1 rounded-md px-[15px] py-0.5 h-10 ">
                <SearchIcon
                  className="w-5 h-5 text-primary-text"
                  strokeWidth={3}
                />
                <input
                  type="text"
                  placeholder="Search countries"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full text-sm p-2 outline-none placeholder:text-primary-text placeholder:font-medium placeholder:tracking-widest "
                />
              </div>
              <button className="text-[15.5px] text-primary-text font-medium min-w-[130px] ">
                Select all
              </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {["Azerbaijan", "Bahrain", "China", "Kuwait", "Oman"].map(
                (country) => (
                  <CheckboxItem
                    key={country}
                    label={country}
                    section="excludedCountries"
                  />
                )
              )}
            </div>
            <button className="text-sm text-primary-text hover:text-primary-text/50 text-center w-full font-medium tracking-widest">
              Show all countries
            </button>
          </div>
        </FilterSection>

        {/* Times */}
        <FilterSection
          title="Times"
          section="times"
          isExpanded={expandedSections.times}
          onToggle={() => toggleSection("times")}
        >
          <div className="space-y-4">
            <div className="mt-4">
              <div className="text-[18.5px] tracking-widest font-bold text-primary-text mb-1">
                Departure
              </div>
              <SliderRange
                min={0}
                max={24}
                unit=""
                section="departureTime"
                label="All day"
              />
            </div>
            <div>
              <div className="text-[18.5px] tracking-widest font-bold text-primary-text mb-1">
                Arrival
              </div>
              <SliderRange
                min={0}
                max={24}
                unit=""
                section="arrivalTime"
                label="All day"
              />
            </div>
          </div>
        </FilterSection>

        {/* Duration */}
        <FilterSection
          title="Duration"
          section="duration"
          isExpanded={expandedSections.duration}
          onToggle={() => toggleSection("duration")}
        >
          <div className="space-y-4">
            <div>
              <div className="text-[18.5px] tracking-widest font-bold text-primary-text mb-1.5">
                Max travel time
              </div>
              <SliderRange
                min={0}
                max={48}
                unit="h"
                section="maxTravelTime"
                label="All day"
              />
            </div>
            <div>
              <div className="text-[18.5px] tracking-widest font-bold text-primary-text mb-1.5">
                Stopover
              </div>
              <SliderRange
                min={2}
                max={24}
                unit=" hours"
                section="stopoverDuration"
                label="2 - 24 hours"
              />
            </div>
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection
          title="Price"
          section="price"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection("price")}
        >
          <SliderRange
            min={0}
            max={2000}
            unit="$"
            section="priceRange"
            label="Any price"
          />
        </FilterSection>

        {/* Days */}
        <FilterSection
          title="Days"
          section="days"
          isExpanded={expandedSections.days}
          onToggle={() => toggleSection("days")}
        >
          <DaySelector />
        </FilterSection>
      </div>
      {/* Reset All Filters Button at bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-3 pb-3 px-3 mt-auto">
        <button
          onClick={handleResetAllFilters}
          className="w-full text-[13px] font-semibold px-4 py-2 rounded-full bg-white text-primary-text border border-gray-300 hover:text-red-500 hover:border-red-400 transition-all shadow-sm"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default FlightFilters;
