import React, { useState, useEffect } from "react";

/**
 * SeatMapDisplay Component
 * Displays seat maps from Sabre GetSeats API response
 * Structure: seatMaps[] → cabinCompartments[] → seatRows[] → seats[]
 * Only seats with occupationStatusCode === "F" are available
 */
export default function SeatMapDisplay({ seatMaps, onSeatSelect }) {
  const [selectedSegment, setSelectedSegment] = useState(0);
  // Store selected seats: { segmentIndex: { rowNumber: { seatNumber: { seatData, selected: boolean } } } }
  const [selectedSeats, setSelectedSeats] = useState({});

  // Helper: Map seat characteristics
  const getSeatCharacteristicLabel = (code) => {
    const characteristics = {
      W: "Window",
      A: "Aisle",
      "9": "Middle",
      OW: "OverWing",
      K: "Bulkhead",
    };
    return characteristics[code] || code;
  };

  // Handle seat selection
  const handleSeatClick = (segmentIndex, rowNumber, seatNumber, seatData) => {
    if (!seatData || !seatData.isAvailable) {
      return; // Don't allow selection of unavailable seats
    }

    // Normalize keys to strings for consistent comparison
    const segmentKey = String(segmentIndex);
    const rowKey = String(rowNumber);
    const seatKey = String(seatNumber);

    setSelectedSeats((prev) => {
      const newSelectedSeats = { ...prev };
      
      // Initialize segment if not exists
      if (!newSelectedSeats[segmentKey]) {
        newSelectedSeats[segmentKey] = {};
      }
      // Initialize row if not exists
      if (!newSelectedSeats[segmentKey][rowKey]) {
        newSelectedSeats[segmentKey][rowKey] = {};
      }
      
      // Toggle seat selection
      const isCurrentlySelected = newSelectedSeats[segmentKey][rowKey][seatKey]?.selected || false;
      
      if (isCurrentlySelected) {
        // Deselect seat
        delete newSelectedSeats[segmentKey][rowKey][seatKey];
        // Clean up empty objects
        if (Object.keys(newSelectedSeats[segmentKey][rowKey]).length === 0) {
          delete newSelectedSeats[segmentKey][rowKey];
        }
        if (Object.keys(newSelectedSeats[segmentKey]).length === 0) {
          delete newSelectedSeats[segmentKey];
        }
      } else {
        // Select seat
        newSelectedSeats[segmentKey][rowKey][seatKey] = {
          selected: true,
          seatData: seatData,
          segmentIndex: segmentIndex,
          rowNumber: rowNumber,
          seatNumber: seatNumber,
        };
      }

      // Notify parent component of seat selection change
      if (onSeatSelect) {
        onSeatSelect(newSelectedSeats);
      }

      // Store in localStorage
      try {
        const flightId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;
        if (flightId) {
          localStorage.setItem(`selectedSeats_${flightId}`, JSON.stringify(newSelectedSeats));
        }
      } catch (error) {
        console.error("Error storing selected seats:", error);
      }

      return newSelectedSeats;
    });
  };

  // Load selected seats from localStorage on mount
  useEffect(() => {
    if (seatMaps && Array.isArray(seatMaps) && seatMaps.length > 0) {
      try {
        const flightId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('id') : null;
        if (flightId) {
          const storedSeats = localStorage.getItem(`selectedSeats_${flightId}`);
          if (storedSeats) {
            const parsedSeats = JSON.parse(storedSeats);
            setSelectedSeats(parsedSeats);
            // Notify parent after state is set
            if (onSeatSelect && typeof onSeatSelect === 'function') {
              // Use setTimeout to ensure state is updated first
              setTimeout(() => {
                onSeatSelect(parsedSeats);
              }, 0);
            }
          }
        }
      } catch (error) {
        console.error("Error loading selected seats:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seatMaps]); // Only depend on seatMaps, not onSeatSelect to avoid infinite loops

  // Helper: Check if a seat is selected (normalize keys to strings for consistent comparison)
  const isSeatSelected = (segmentIndex, rowNumber, seatNumber) => {
    const segmentKey = String(segmentIndex);
    const rowKey = String(rowNumber);
    const seatKey = String(seatNumber);
    return selectedSeats[segmentKey]?.[rowKey]?.[seatKey]?.selected || false;
  };

  // If seat maps is null/undefined, don't show anything (no API call made yet)
  if (!seatMaps || !Array.isArray(seatMaps)) {
    return null;
  }

  // If seat maps array is explicitly empty (API returned empty array), show fallback message
  if (seatMaps.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-primary-text mb-4">Seat Selection</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No seat maps available for this flight.</p>
          <p className="text-xs mt-2">
            Seat selection may not be available for this route or airline.
          </p>
        </div>
      </div>
    );
  }

  // Handle multi-segment flights (outbound/return)
  const hasMultipleSegments = seatMaps.length > 1;

  return (
    <div className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary-text">Seat Selection</h2>
        {hasMultipleSegments && (
          <div className="flex gap-2">
            {seatMaps.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedSegment(index)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedSegment === index
                    ? "bg-primary-green text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index === 0 ? "Outbound" : index === 1 ? "Return" : `Flight ${index + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Display seat map for selected segment */}
      {seatMaps[selectedSegment] && (
        <div className="space-y-6">
          {/* Flight Information */}
          {(() => {
            // Extract flight number safely - handle both string and object formats
            let flightNumberValue = null;
            const flightNumber = seatMaps[selectedSegment].flightNumber;
            if (flightNumber) {
              if (typeof flightNumber === 'string' || typeof flightNumber === 'number') {
                flightNumberValue = String(flightNumber);
              } else if (typeof flightNumber === 'object' && flightNumber !== null) {
                flightNumberValue = flightNumber.number || flightNumber.value || flightNumber.name || String(flightNumber) || null;
              }
            }
            
            // Extract segment ID safely - handle both string and object formats
            let segmentIdValue = null;
            const segmentId = seatMaps[selectedSegment].paxSegmentRefID;
            if (segmentId) {
              if (typeof segmentId === 'string' || typeof segmentId === 'number') {
                segmentIdValue = String(segmentId);
              } else if (typeof segmentId === 'object' && segmentId !== null) {
                segmentIdValue = segmentId.id || segmentId.value || segmentId.refId || String(segmentId) || null;
              }
            }
            
            if (flightNumberValue || segmentIdValue) {
              return (
                <div className="text-sm text-gray-600 mb-4">
                  {flightNumberValue && (
                    <span className="font-medium">Flight: {flightNumberValue}</span>
                  )}
                  {segmentIdValue && (
                    <span className="ml-2">
                      Segment ID: {segmentIdValue}
                    </span>
                  )}
                </div>
              );
            }
            return null;
          })()}

          {/* Cabin Compartments */}
          {seatMaps[selectedSegment].cabinCompartments &&
          Array.isArray(seatMaps[selectedSegment].cabinCompartments) &&
          seatMaps[selectedSegment].cabinCompartments.length > 0 ? (
            seatMaps[selectedSegment].cabinCompartments.map((compartment, compIndex) => {
              // Extract cabin class name safely - handle both string and object formats
              // Remove any Duffel structures and extract string values only
              let cabinClassName = "Cabin";
              
              if (compartment.cabinClass) {
                if (typeof compartment.cabinClass === 'string') {
                  cabinClassName = compartment.cabinClass;
                } else if (typeof compartment.cabinClass === 'object') {
                  // Handle object structure (Duffel format - remove it)
                  cabinClassName = compartment.cabinClass.cabinClassName || 
                                  compartment.cabinClass.name || 
                                  compartment.cabinClass.value || 
                                  String(compartment.cabinClass) || 
                                  "Cabin";
                }
              } else if (compartment.cabinType) {
                // Handle if cabinType is an object (Duffel structure - remove it)
                if (typeof compartment.cabinType === 'string') {
                  cabinClassName = compartment.cabinType;
                } else if (typeof compartment.cabinType === 'object' && compartment.cabinType !== null) {
                  // Extract from object: prefer cabinTypeName, fallback to cabinTypeCode
                  // Handle Duffel structure with cabinTypeCode, cabinTypeName, cabinTypelataCode
                  cabinClassName = compartment.cabinType.cabinTypeName || 
                                  compartment.cabinType.name || 
                                  compartment.cabinType.cabinTypeCode || 
                                  compartment.cabinType.code || 
                                  compartment.cabinType.value ||
                                  (compartment.cabinType.cabinTypelataCode ? String(compartment.cabinType.cabinTypelataCode) : null) ||
                                  "Cabin";
                  
                  // Ensure it's a string (convert to string if it's still an object somehow)
                  if (typeof cabinClassName !== 'string') {
                    cabinClassName = String(cabinClassName) || "Cabin";
                  }
                }
              }
              
              // Extract cabin name safely - handle both string and object formats
              let cabinNameValue = null;
              if (compartment.cabinName) {
                if (typeof compartment.cabinName === 'string') {
                  cabinNameValue = compartment.cabinName;
                } else if (typeof compartment.cabinName === 'object' && compartment.cabinName !== null) {
                  // Handle object structure (Duffel format - remove it)
                  cabinNameValue = compartment.cabinName.name || 
                                  compartment.cabinName.value || 
                                  compartment.cabinName.cabinName || 
                                  String(compartment.cabinName) || 
                                  null;
                  // Ensure it's a string
                  if (cabinNameValue && typeof cabinNameValue !== 'string') {
                    cabinNameValue = String(cabinNameValue);
                  }
                }
              }

              return (
                <div key={compIndex} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">
                    {cabinClassName} Class
                    {cabinNameValue && (
                      <span className="text-sm text-gray-600 ml-2">({cabinNameValue})</span>
                    )}
                  </h3>

                  {/* Seat Rows */}
                  {compartment.seatRows &&
                  Array.isArray(compartment.seatRows) &&
                  compartment.seatRows.length > 0 ? (
                    <div className="space-y-3">
                      {compartment.seatRows.map((row, rowIndex) => {
                        // Extract row number safely - handle both string and object formats
                        let rowNumberValue = rowIndex + 1;
                        if (row.rowNumber !== undefined) {
                          rowNumberValue = typeof row.rowNumber === 'string' || typeof row.rowNumber === 'number'
                            ? row.rowNumber
                            : row.rowNumber.number || row.rowNumber.value || rowIndex + 1;
                        } else if (row.row !== undefined) {
                          rowNumberValue = typeof row.row === 'string' || typeof row.row === 'number'
                            ? row.row
                            : row.row.number || row.row.value || rowIndex + 1;
                        }

                        return (
                          <div key={rowIndex} className="flex items-center gap-3">
                            {/* Row Number */}
                            <div className="w-12 text-xs font-semibold text-gray-700 text-right">
                              {rowNumberValue}
                            </div>

                            {/* Seats */}
                            <div className="flex gap-1 flex-wrap">
                              {row.seats && Array.isArray(row.seats) && row.seats.length > 0 ? (
                                row.seats.map((seat, seatIndex) => {
                                  // Extract seat number safely - handle both string and object formats
                                  let seatNumberValue = seatIndex + 1;
                                  if (seat.seatNumber !== undefined) {
                                    seatNumberValue = typeof seat.seatNumber === 'string' || typeof seat.seatNumber === 'number'
                                      ? seat.seatNumber
                                      : seat.seatNumber.number || seat.seatNumber.value || seatIndex + 1;
                                  } else if (seat.seat !== undefined) {
                                    seatNumberValue = typeof seat.seat === 'string' || typeof seat.seat === 'number'
                                      ? seat.seat
                                      : seat.seat.number || seat.seat.value || seatIndex + 1;
                                  }

                                  // Extract occupation status - handle both string and object formats
                                  let occupationStatus = seat.occupationStatusCode || seat.occupationStatus;
                                  if (typeof occupationStatus === 'object') {
                                    occupationStatus = occupationStatus.code || occupationStatus.status || occupationStatus.value || "F";
                                  }
                                  const isAvailable = occupationStatus === "F";
                                  const isSelected = isSeatSelected(selectedSegment, rowNumberValue, seatNumberValue);

                                  // Extract characteristics safely - handle both array and object formats
                                  let characteristics = [];
                                  if (seat.characteristics) {
                                    if (Array.isArray(seat.characteristics)) {
                                      characteristics = seat.characteristics.map(char => 
                                        typeof char === 'string' ? char : char.code || char.value || char
                                      );
                                    } else if (typeof seat.characteristics === 'object') {
                                      characteristics = Object.values(seat.characteristics).map(val =>
                                        typeof val === 'string' ? val : val.code || val.value || String(val)
                                      );
                                    }
                                  }
                                  
                                  const charLabels = characteristics
                                    .map((char) => getSeatCharacteristicLabel(char))
                                    .filter(Boolean)
                                    .join(", ");

                                  // Determine button styling based on availability and selection
                                  let buttonClassName = "w-10 h-10 text-xs font-medium rounded border transition-all duration-200 ";
                                  if (!isAvailable) {
                                    buttonClassName += "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-60";
                                  } else if (isSelected) {
                                    buttonClassName += "bg-primary-green text-white border-primary-green cursor-pointer hover:bg-primary-green/90 hover:scale-105 shadow-md";
                                  } else {
                                    buttonClassName += "bg-green-100 hover:bg-green-200 text-green-800 border-green-300 cursor-pointer hover:scale-105";
                                  }

                                  return (
                                    <button
                                      key={seatIndex}
                                      disabled={!isAvailable}
                                      onClick={() => handleSeatClick(selectedSegment, rowNumberValue, seatNumberValue, {
                                        seatNumber: seatNumberValue,
                                        rowNumber: rowNumberValue,
                                        segmentIndex: selectedSegment,
                                        isAvailable: isAvailable,
                                        characteristics: characteristics,
                                        seatData: seat
                                      })}
                                      className={buttonClassName}
                                      title={
                                        isAvailable
                                          ? `${isSelected ? 'Selected - ' : ''}Seat ${seatNumberValue}${charLabels ? ` - ${charLabels}` : ""}`
                                          : `Seat ${seatNumberValue} - Not available`
                                      }
                                    >
                                      {seatNumberValue}
                                    </button>
                                  );
                                })
                              ) : (
                                <span className="text-xs text-gray-400 italic">
                                  No seats in this row
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic py-4">
                      No seat rows available in this cabin
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 italic py-4">
              No cabin compartments available for this flight segment
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary-green border border-primary-green rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded opacity-60"></div>
          <span>Occupied</span>
        </div>
      </div>

      {/* Selected Seats Summary */}
      {Object.keys(selectedSeats).length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Selected Seats:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedSeats).map(([segmentIdx, rows]) => (
              Object.entries(rows).map(([rowNum, seats]) => (
                Object.entries(seats).map(([seatNum, seatInfo]) => (
                  <span
                    key={`${segmentIdx}-${rowNum}-${seatNum}`}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                  >
                    {segmentIdx === "0" ? "Outbound" : segmentIdx === "1" ? "Return" : `Flight ${parseInt(segmentIdx) + 1}`}: Row {rowNum}, Seat {seatNum}
                  </span>
                ))
              ))
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
