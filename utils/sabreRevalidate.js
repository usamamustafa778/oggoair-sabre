/**
 * Sabre Revalidate Utility Functions
 * Can be used client-side to build payload and call Sabre API directly
 */

/**
 * Build Sabre Revalidate payload - SABRE OTA_AirLowFareSearchRQ ONLY (no Duffel)
 * 
 * CRITICAL RULES FOR JOURNEY BUILD SUCCESS:
 * - Do NOT use Duffel-style payload or mapping
 * - Build revalidate request strictly from BFM response only
 * - Ensure segment count, order, carrier, flight number, booking class, and datetimes exactly match BFM
 * - Do NOT skip, filter, or reorder segments from BFM
 * - Keep BFM data (origin, destination, segments) unchanged - only format conversions allowed
 * 
 * Rules:
 * - Do NOT use Duffel-style payload
 * - Use OTA_AirLowFareSearchRQ only
 * - Map Origin/Destination, Flight Number, Airline, Departure/Arrival time strictly from BFM response
 * - ClassOfService must come from BFM booking class per segment
 * - Use SegmentType = "O" or "X" only (not "R")
 * 
 * Generate Sabre request payload exactly like the old working one:
 * - OTA_AirLowFareSearchRQ
 * - Version = "5" (same as old working version)
 * - OriginDestinationInformation as ARRAY
 * - Each OriginDestinationInformation contains:
 *   - DepartureDateTime
 *   - OriginLocation.LocationCode
 *   - DestinationLocation.LocationCode
 *   - TPA_Extensions.Flight array
 * - POS.Source with valid PseudoCityCode
 * - TravelerInfoSummary with ADT passenger
 * - TPA_Extensions.IntelliSellTransaction.RequestType.Name = "50ITINS"
 */
export function buildRevalidatePayload(flight, passengerCounts, pcc) {
  // ============================================
  // VALIDATE INPUTS
  // ============================================
  if (!flight || !flight.slices || flight.slices.length === 0) {
    throw new Error("Flight must have at least one slice");
  }
  
  if (!passengerCounts || typeof passengerCounts !== 'object') {
    throw new Error("Passenger counts must be an object");
  }

  if (!pcc || typeof pcc !== 'string' || pcc.trim() === '') {
    throw new Error("PCC (PseudoCityCode) is required");
  }

  const adults = parseInt(passengerCounts.adults || passengerCounts.ADT || 0, 10);
  const child = parseInt(passengerCounts.child || passengerCounts.CNN || 0, 10);
  const infant = parseInt(passengerCounts.infant || passengerCounts.INF || 0, 10);

  if (adults <= 0) {
    throw new Error("At least one adult passenger is required");
  }

  // ============================================
  // BUILD ORIGIN DESTINATION INFORMATION
  // ============================================
  // CRITICAL: Preserve BFM segment count, order, and data exactly
  // Do NOT modify, filter, or reorder segments from BFM
  // ============================================
  const originDestinationInformation = [];

  flight.slices.forEach((slice, sliceIndex) => {
    if (!slice.segments || slice.segments.length === 0) {
      console.warn(`Slice ${sliceIndex} has no segments, skipping`);
      return;
    }
    
    // Build Flight array for TPA_Extensions
    // CRITICAL: Preserve segment order and count from BFM exactly
    const flightSegments = [];
    
    // Process segments in exact BFM order - do not reorder or filter
    // CRITICAL: Every segment from BFM must be included - no skipping
    slice.segments.forEach((segment, segmentIndex) => {
      // ============================================
      // MAP STRICTLY FROM BFM RESPONSE
      // ============================================
      // Extract segment data - all fields from BFM response only
      // Do NOT modify dates, airlines, flight numbers, or segments from BFM
      let departureDateTime = segment.departing_at;
      if (!departureDateTime) {
        // Missing departure time is critical - cannot build valid payload
        throw new Error(
          `Segment ${segmentIndex} in slice ${sliceIndex} is missing departing_at. ` +
          `Cannot build revalidate payload without complete BFM segment data. ` +
          `All segments from selected BFM itinerary must have complete data.`
        );
      }
      
      // Format departure datetime: YYYY-MM-DDTHH:mm:ss (remove timezone)
      // Do NOT modify times from BFM - only format conversion for Sabre API
      // Ensure outbound and return dates exactly match BFM response
      if (typeof departureDateTime === 'string') {
        const dateObj = new Date(departureDateTime);
        if (isNaN(dateObj.getTime())) {
          throw new Error(
            `Segment ${segmentIndex} in slice ${sliceIndex} has invalid departure datetime: ${departureDateTime}. ` +
            `BFM segment data must be valid.`
          );
        }
        // Format conversion only - not modifying BFM time
        // Preserve exact date/time from BFM
        departureDateTime = dateObj.toISOString().replace('Z', '').substring(0, 19);
      }
      
      // Format arrival datetime: YYYY-MM-DDTHH:mm:ss (remove timezone)
      // Do NOT modify times from BFM - only format conversion for Sabre API
      let arrivalDateTime = segment.arriving_at;
      if (arrivalDateTime && typeof arrivalDateTime === 'string') {
        const dateObj = new Date(arrivalDateTime);
        if (!isNaN(dateObj.getTime())) {
          // Format conversion only - not modifying BFM time
          arrivalDateTime = dateObj.toISOString().replace('Z', '').substring(0, 19);
        }
      }
      
      // Extract carrier codes - STRICTLY from BFM response
      // Do NOT modify airlines from BFM - use exactly as provided
      // Do NOT mix carriers or segments that were not combined in BFM
      const marketingCarrier = segment.marketing_carrier?.iata_code || 
                               segment.carrier?.iata_code ||
                               flight.owner?.iata_code || 
                               "";
      
      // Operating carrier from BFM - use exactly as provided
      const operatingCarrier = segment.operating_carrier?.iata_code || 
                               segment.marketing_carrier?.iata_code || 
                               marketingCarrier;
      
      // Validate carrier exists - critical for journey build
      if (!marketingCarrier || marketingCarrier.trim() === "") {
        throw new Error(
          `Segment ${segmentIndex} in slice ${sliceIndex} is missing marketing carrier. ` +
          `Cannot build revalidate payload without carrier information from BFM.`
        );
      }
      
      // Extract flight number (numeric part only) - STRICTLY from BFM response
      // Do NOT modify flight numbers from BFM - only extract numeric part
      let flightNumberStr = segment.marketing_carrier_flight_number || 
                          segment.flight_number || 
                          segment.operating_carrier_flight_number || 
                          "";
      
      if (flightNumberStr != null) {
        flightNumberStr = String(flightNumberStr).trim();
        // Remove carrier code prefix if present (BFM may include it)
        if (marketingCarrier && flightNumberStr.toUpperCase().startsWith(marketingCarrier.toUpperCase())) {
          flightNumberStr = flightNumberStr.substring(marketingCarrier.length);
        }
        // Extract numeric part only (Sabre requires number, not string)
        flightNumberStr = flightNumberStr.replace(/\D/g, '');
      } else {
        flightNumberStr = "";
      }
      
      // Convert flight number to NUMBER (Sabre requirement)
      // This is format conversion only - not modifying BFM data
      const flightNumber = flightNumberStr ? parseInt(flightNumberStr, 10) : null;
      
      // Extract origin/destination codes - STRICTLY from BFM response
      const originCode = segment.origin?.iata_code || segment.origin || "";
      const destinationCode = segment.destination?.iata_code || segment.destination || "";
      
      // Get booking class from BFM response - per segment
      // MUST map exactly from BFM per segment - do not modify
      // ClassOfService must come from BFM booking class per segment
      // Priority: segment booking_class > _sabreBFM fareDetails > segment passengers > default "Y"
      // This ensures ClassOfService matches BFM exactly per segment
      let bookingClass = segment.booking_class;
      
      // If not in segment, check _sabreBFM fareDetails (BFM metadata)
      if (!bookingClass && flight._sabreBFM?.fareDetails?.bookingClass) {
        bookingClass = flight._sabreBFM.fareDetails.bookingClass;
      }
      
      // If still not found, check segment passengers
      if (!bookingClass) {
        bookingClass = segment.passengers?.[0]?.booking_class ||
                       segment.passengers?.[0]?.cabin_class;
      }
      
      // Default to "Y" only if absolutely no booking class found
      if (!bookingClass) {
        bookingClass = "Y";
        console.warn(
          `⚠️ Segment ${segmentIndex} in slice ${sliceIndex} has no booking class in BFM, using default "Y". ` +
          `This may cause journey build issues if BFM used a different class.`
        );
      }
      
      // Log booking class source for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`📋 Segment ${segmentIndex} booking class:`, {
          bookingClass,
          source: segment.booking_class ? 'segment.booking_class' :
                 flight._sabreBFM?.fareDetails?.bookingClass ? '_sabreBFM.fareDetails.bookingClass' :
                 segment.passengers?.[0]?.booking_class ? 'segment.passengers[0].booking_class' :
                 segment.passengers?.[0]?.cabin_class ? 'segment.passengers[0].cabin_class' :
                 'default "Y"',
        });
      }
      
      // Validate required fields
      // CRITICAL: All segments from selected BFM itinerary must have complete data
      // Do NOT skip segments - this changes segment count/order and causes "NO COMBINABLE SCHEDULES" errors
      if (!flightNumber || isNaN(flightNumber)) {
        throw new Error(
          `Segment ${segmentIndex} in slice ${sliceIndex} has invalid flight number. ` +
          `BFM segment must have valid flight number. Got: ${segment.marketing_carrier_flight_number || segment.flight_number || 'none'}`
        );
      }
      
      if (!originCode || originCode.trim() === "") {
        throw new Error(
          `Segment ${segmentIndex} in slice ${sliceIndex} is missing origin code. ` +
          `BFM segment must have origin location.`
        );
      }
      
      if (!destinationCode || destinationCode.trim() === "") {
        throw new Error(
          `Segment ${segmentIndex} in slice ${sliceIndex} is missing destination code. ` +
          `BFM segment must have destination location.`
        );
      }
      
      // Build Sabre Flight segment - OTA schema compliant
      // Flight MUST include: Number, Type, DepartureDateTime, ArrivalDateTime, 
      // ClassOfService, OriginLocation, DestinationLocation, Airline
      const flightSegment = {
        Number: flightNumber, // NUMBER type
        Type: "A", // "A" for Air segment (required by OTA schema)
        DepartureDateTime: departureDateTime, // Required in Flight
        ClassOfService: bookingClass,
        OriginLocation: {
          LocationCode: originCode, // Required in Flight
        },
        DestinationLocation: {
          LocationCode: destinationCode, // Required in Flight
        },
        Airline: {
          Marketing: marketingCarrier, // STRING, not { Code: "XX" }
        },
      };
      
      // Add ArrivalDateTime if available
      if (arrivalDateTime) {
        flightSegment.ArrivalDateTime = arrivalDateTime;
      }
      
      // Only include Operating if it's different from Marketing and not empty
      // Operating must be a STRING, not an object
      if (operatingCarrier && 
          operatingCarrier.trim() !== "" && 
          operatingCarrier !== marketingCarrier) {
        flightSegment.Airline.Operating = operatingCarrier.trim();
      }
      
      flightSegments.push(flightSegment);
    });
    
    // Build OriginDestinationInformation entry
    // CRITICAL: Ensure segment count matches BFM exactly
    if (flightSegments.length !== slice.segments.length) {
      throw new Error(
        `Segment count mismatch: BFM has ${slice.segments.length} segments but only ${flightSegments.length} were processed. ` +
        `This will cause journey build failure. All BFM segments must be included.`
      );
    }
    
    if (flightSegments.length > 0) {
      // Use first and last segment from BFM - do not modify
      const firstSegment = slice.segments[0];
      const lastSegment = slice.segments[slice.segments.length - 1];
      
      // Extract origin/destination from BFM exactly
      const originCode = firstSegment.origin?.iata_code || firstSegment.origin || "";
      const destinationCode = lastSegment.destination?.iata_code || lastSegment.destination || "";
      
      // Extract departure datetime from BFM exactly - format conversion only
      let departureDateTime = firstSegment.departing_at;
      if (typeof departureDateTime === 'string') {
        const dateObj = new Date(departureDateTime);
        if (!isNaN(dateObj.getTime())) {
          departureDateTime = dateObj.toISOString().replace('Z', '').substring(0, 19);
        }
      }
      
      // SegmentType.Code allowed values only: ARUNK, O, X
      // Use "O" for outbound/return segments, "X" for connections/stopovers
      // Do not use 'R' for return segments
      const isConnection = slice.segments.length > 1; // Multiple segments = connection
      const segmentTypeCode = isConnection ? "X" : "O";
      
      originDestinationInformation.push({
        RPH: String(sliceIndex + 1),
        DepartureDateTime: departureDateTime,
        OriginLocation: {
          LocationCode: originCode,
        },
        DestinationLocation: {
          LocationCode: destinationCode,
        },
        TPA_Extensions: {
          SegmentType: {
            Code: segmentTypeCode,
          },
          Flight: flightSegments, // All segments in exact BFM order
        },
      });
    }
  });
  
  // ============================================
  // VALIDATION & SAFETY: OriginDestinationInformation
  // ============================================
  // CRITICAL: Ensure payload exactly matches selected BFM itinerary
  // ============================================
  if (originDestinationInformation.length === 0) {
    throw new Error("No valid segments found in flight itinerary. OriginDestinationInformation cannot be empty.");
  }
  
  // Validate slice count matches BFM exactly
  if (originDestinationInformation.length !== flight.slices.length) {
    throw new Error(
      `Slice count mismatch: BFM has ${flight.slices.length} slice(s) but payload has ${originDestinationInformation.length}. ` +
      `Payload must exactly match selected BFM itinerary structure.`
    );
  }
  
  // Validate each slice's segment count matches BFM exactly
  flight.slices.forEach((slice, sliceIndex) => {
    const odi = originDestinationInformation[sliceIndex];
    if (!odi) {
      throw new Error(`Missing OriginDestinationInformation for slice ${sliceIndex} from BFM.`);
    }
    
    const bfmSegmentCount = slice.segments?.length || 0;
    const payloadSegmentCount = odi.TPA_Extensions?.Flight?.length || 0;
    
    if (bfmSegmentCount !== payloadSegmentCount) {
      throw new Error(
        `Segment count mismatch in slice ${sliceIndex}: BFM has ${bfmSegmentCount} segment(s) but payload has ${payloadSegmentCount}. ` +
        `Payload must exactly match selected BFM itinerary. All segments from BFM must be included.`
      );
    }
  });
  
  // Log validation success
  if (process.env.NODE_ENV === 'development') {
    console.log("✅ Revalidate payload validation passed:", {
      slices: originDestinationInformation.length,
      totalSegments: originDestinationInformation.reduce(
        (sum, odi) => sum + (odi.TPA_Extensions?.Flight?.length || 0), 0
      ),
      matchesBFM: true,
    });
  }

  // ============================================
  // BUILD TRAVELER INFO SUMMARY
  // ============================================
  const passengerTypeQuantities = [];
  
  // Always send ADT (adults)
  if (adults > 0) {
    passengerTypeQuantities.push({ Code: "ADT", Quantity: adults });
  } else {
    // Ensure at least one ADT
    passengerTypeQuantities.push({ Code: "ADT", Quantity: 1 });
  }
  
  // Optionally include child and infant if present
  if (child > 0) {
    passengerTypeQuantities.push({ Code: "CNN", Quantity: child });
  }
  if (infant > 0) {
    passengerTypeQuantities.push({ Code: "INF", Quantity: infant });
  }
  
  const seatsRequested = adults + child + infant;
  
  const travelerInfoSummary = {
    SeatsRequested: [seatsRequested],
    AirTravelerAvail: [
      {
        PassengerTypeQuantity: passengerTypeQuantities,
      },
    ],
  };

  // ============================================
  // BUILD COMPLETE SABRE REVALIDATE PAYLOAD
  // ============================================
  const revalidatePayload = {
    OTA_AirLowFareSearchRQ: {
      Version: "5",
      POS: {
        Source: [
          {
            PseudoCityCode: pcc.trim(),
            RequestorID: {
              Type: "1",
              ID: "1",
              CompanyName: {
                Code: "TN",
              },
            },
          },
        ],
      },
      OriginDestinationInformation: originDestinationInformation,
      TravelPreferences: {
        TPA_Extensions: {
          VerificationItinCallLogic: {
            Value: "B",
          },
        },
      },
      TravelerInfoSummary: travelerInfoSummary,
      TPA_Extensions: {
        IntelliSellTransaction: {
          RequestType: {
            Name: "50ITINS",
          },
        },
      },
    },
  };

  return revalidatePayload;
}

/**
 * Build Sabre NDC GetSeats payload from revalidate response and flight details
 * 
 * MANDATORY RULES:
 * - NO flightOfferId
 * - NO flat segments[] array
 * - NO passengers[] array
 * - Build ONLY from Sabre revalidate response
 * - Use Sabre NDC structure
 */
export function buildGetSeatsPayload(revalidateResponse, flightDetails, passengerCounts, pcc) {
  if (!flightDetails) {
    throw new Error("Flight details are required");
  }

  if (!pcc || typeof pcc !== 'string' || pcc.trim() === '') {
    throw new Error("PCC (PseudoCityCode) is required for GetSeats API");
  }

  // Get passenger counts
  const adults = parseInt(passengerCounts?.adults || passengerCounts?.ADT || 1, 10);
  const child = parseInt(passengerCounts?.child || passengerCounts?.CNN || 0, 10);
  const infant = parseInt(passengerCounts?.infant || passengerCounts?.INF || 0, 10);

  if (adults <= 0) {
    throw new Error("At least one adult passenger is required");
  }

  // Build paxes array (Sabre NDC format)
  const paxes = [];
  let paxIdCounter = 1;

  // Add adults
  for (let i = 0; i < adults; i++) {
    paxes.push({
      paxID: `PAX${paxIdCounter++}`,
      ptc: "ADT"
    });
  }

  // Add children
  for (let i = 0; i < child; i++) {
    paxes.push({
      paxID: `PAX${paxIdCounter++}`,
      ptc: "CNN"
    });
  }

  // Add infants
  for (let i = 0; i < infant; i++) {
    paxes.push({
      paxID: `PAX${paxIdCounter++}`,
      ptc: "INF"
    });
  }

  // Build paxSegments from flightDetails.slices
  // Extract segment data from BFM/revalidate response
  const paxSegments = [];
  const paxSegmentRefIds = [];
  let paxSegmentIdCounter = 1;
  
  // Track unique segments to avoid duplicates (Sabre rejects duplicate segments)
  const seenSegments = new Set();

  if (!flightDetails.slices || flightDetails.slices.length === 0) {
    throw new Error("Flight details must have at least one slice");
  }

  flightDetails.slices.forEach((slice, sliceIndex) => {
    if (!slice.segments || slice.segments.length === 0) {
      return;
    }

    slice.segments.forEach((segment, segmentIndex) => {
      // Extract origin/destination
      const origin = segment.origin?.iata_code || segment.origin || "";
      const destination = segment.destination?.iata_code || segment.destination || "";

      // Extract departure datetime - convert to YYYY-MM-DD for aircraftScheduledDate
      let departureDateTime = segment.departing_at;
      let departureDate = "";
      if (typeof departureDateTime === 'string') {
        const dateObj = new Date(departureDateTime);
        if (!isNaN(dateObj.getTime())) {
          // Format: YYYY-MM-DD (date only, no time)
          departureDate = dateObj.toISOString().substring(0, 10);
        }
      }

      // Extract carriers
      const marketingCarrier = segment.marketing_carrier?.iata_code || 
                               segment.carrier?.iata_code ||
                               flightDetails.owner?.iata_code || 
                               "";
      const operatingCarrier = segment.operating_carrier?.iata_code || 
                               segment.marketing_carrier?.iata_code || 
                               marketingCarrier;

      // Extract flight number (numeric part only)
      let flightNumberStr = segment.marketing_carrier_flight_number || 
                          segment.flight_number || 
                          segment.operating_carrier_flight_number || 
                          "";
      
      if (flightNumberStr != null) {
        flightNumberStr = String(flightNumberStr).trim();
        // Remove carrier code prefix if present
        if (marketingCarrier && flightNumberStr.toUpperCase().startsWith(marketingCarrier.toUpperCase())) {
          flightNumberStr = flightNumberStr.substring(marketingCarrier.length);
        }
        // Extract numeric part only
        flightNumberStr = flightNumberStr.replace(/\D/g, '');
      }
      
      const flightNumber = flightNumberStr || "";

      // Extract booking code (booking class) - MUST match revalidate response
      // Priority: segment booking_class > _sabreBFM fareDetails > default "Y"
      let bookingCode = segment.booking_class;
      
      // If not in segment, check _sabreBFM fareDetails (BFM metadata)
      if (!bookingCode && flightDetails._sabreBFM?.fareDetails?.bookingClass) {
        bookingCode = flightDetails._sabreBFM.fareDetails.bookingClass;
      }
      
      // If still not found, check segment passengers
      if (!bookingCode) {
        bookingCode = segment.passengers?.[0]?.booking_class ||
                       segment.passengers?.[0]?.cabin_class;
      }
      
      // Default to "Y" only if absolutely no booking class found
      if (!bookingCode) {
        bookingCode = "Y";
        console.warn(
          `⚠️ Segment ${segmentIndex} in slice ${sliceIndex} has no booking class, using default "Y". ` +
          `This may cause journey build issues if revalidate used a different class.`
        );
      }

      // Validate required fields
      if (!origin || !destination || !departureDate || !marketingCarrier || !flightNumber) {
        console.warn("⚠️ Skipping segment with missing required fields:", {
          origin,
          destination,
          departureDate,
          marketingCarrier,
          flightNumber,
        });
        return;
      }

      // Create a unique key for this segment to detect duplicates
      // Key includes all identifying information: carrier, flight number, date, origin, destination
      const segmentKey = `${marketingCarrier}${flightNumber}_${origin}_${destination}_${departureDate}_${bookingCode}`;
      
      // Check if we've already added this exact segment
      if (seenSegments.has(segmentKey)) {
        console.warn(
          `⚠️ Skipping duplicate segment in slice ${sliceIndex}, segment ${segmentIndex}: ${segmentKey}. ` +
          `Sabre API rejects duplicate segments even with different IDs.`
        );
        return; // Skip this duplicate segment
      }
      
      // Mark this segment as seen
      seenSegments.add(segmentKey);

      // Extract arrival date for arrival.aircraftScheduledDate
      let arrivalDate = departureDate; // Default to departure date
      let arrivalDateTime = segment.arriving_at;
      if (arrivalDateTime && typeof arrivalDateTime === 'string') {
        const dateObj = new Date(arrivalDateTime);
        if (!isNaN(dateObj.getTime())) {
          arrivalDate = dateObj.toISOString().substring(0, 10);
        }
      }

      // Generate unique paxSegmentId
      const paxSegmentId = `SEG${paxSegmentIdCounter++}`;
      paxSegmentRefIds.push(paxSegmentId);

      // Build paxSegment in Sabre NDC format (EXACT structure required)
      const paxSegment = {
        paxSegmentId: paxSegmentId,
        departure: {
          locationCode: origin,
          aircraftScheduledDate: {
            date: departureDate, // YYYY-MM-DD format only
          },
        },
        arrival: {
          locationCode: destination,
          aircraftScheduledDate: {
            date: arrivalDate, // YYYY-MM-DD format only
          },
        },
        marketingCarrierInfo: {
          carrierCode: marketingCarrier,
          carrierFlightNumber: flightNumber, // Must be carrierFlightNumber, not flightNumber
          bookingCode: bookingCode,
        },
        cabinType: {
          cabinTypeCode: "Y",
          cabinTypeName: "Economy"
        },
      };

      // Operating carrier info - ALWAYS include (even if same as marketing)
      // Must include carrierFlightNumber and bookingCode
      paxSegment.operatingCarrierInfo = {
        carrierCode: operatingCarrier,
        carrierFlightNumber: flightNumber, // Use same flight number
        bookingCode: bookingCode, // Use same booking code
      };

      paxSegments.push(paxSegment);
    });
  });

  if (paxSegments.length === 0) {
    throw new Error("No valid segments found in flight details");
  }

  // Build Sabre NDC GetSeats payload structure (EXACT format required)
  const payload = {
    requestType: "payload",
    party: {
      sender: {
        travelAgency: {
          pseudoCityID: pcc.trim(),
          agencyID: pcc.trim(), // Must match pseudoCityID
        },
      },
    },
    request: {
      paxSegmentRefIds: paxSegmentRefIds,
      originDest: {
        paxJourney: {
          paxSegments: paxSegments,
        },
      },
      paxes: paxes, // paxes is inside request, not at root level
    },
  };

  return payload;
}

/**
 * Build Sabre Orders/Create payload
 * Creates an NDC order from flight details and passenger information
 * 
 * @param {Object} flightDetails - Flight details from BFM/search
 * @param {Array} passengersInfo - Passenger information from checkout form
 * @param {Object} contact - Contact information (email, phone)
 * @returns {Object} Sabre Orders/Create payload
 */
export function buildOrdersCreatePayload(flightDetails, passengersInfo, contact) {
  if (!flightDetails) {
    throw new Error("Flight details are required");
  }

  if (!passengersInfo || !Array.isArray(passengersInfo) || passengersInfo.length === 0) {
    throw new Error("At least one passenger is required");
  }

  // Get offer ID from flight details
  const offerId = flightDetails.id || flightDetails.offer_id;
  
  if (!offerId) {
    throw new Error("Flight details must contain an offer ID (id or offer_id field)");
  }

  // Extract offer key and item ID
  // Sabre expects format: "{key}-{itemId}" in selectedOfferItems
  let offerKey = null;
  let offerItemId = null;
  
  // Try different possible locations for offer key and item ID
  if (flightDetails.offerKey && flightDetails.offerItemId) {
    offerKey = flightDetails.offerKey;
    offerItemId = flightDetails.offerItemId;
  } else if (flightDetails.offer_key && flightDetails.offer_item_id) {
    offerKey = flightDetails.offer_key;
    offerItemId = flightDetails.offer_item_id;
  } else if (flightDetails.offerItems && Array.isArray(flightDetails.offerItems) && flightDetails.offerItems.length > 0) {
    const firstItem = flightDetails.offerItems[0];
    offerKey = firstItem.key || firstItem.offerKey;
    offerItemId = firstItem.id || firstItem.itemId;
  } else if (flightDetails.items && Array.isArray(flightDetails.items) && flightDetails.items.length > 0) {
    const firstItem = flightDetails.items[0];
    offerKey = firstItem.key;
    offerItemId = firstItem.id || firstItem.itemId;
  }
  
  // Build the combined key-itemId format: "{key}-{itemId}"
  let combinedOfferItemId;
  
  // Log warning if not found - the API will likely fail, but let's try anyway
  if (!offerKey || !offerItemId) {
    console.warn("⚠️ Missing offer key or item ID in flight details");
    console.warn("Flight details structure:", {
      id: flightDetails.id,
      keys: Object.keys(flightDetails),
      hasOfferKey: !!flightDetails.offerKey || !!flightDetails.offer_key,
      hasOfferItemId: !!flightDetails.offerItemId || !!flightDetails.offer_item_id,
      hasOfferItems: !!flightDetails.offerItems,
      hasItems: !!flightDetails.items,
    });
    
    // Use fallback format - will likely fail at Sabre but let's try
    console.warn("⚠️ Using fallback format: offerId-1 (API will likely fail)");
    combinedOfferItemId = `${offerId}-1`;
  } else {
    combinedOfferItemId = `${offerKey}-${offerItemId}`;
  }
  
  console.log("📋 Extracted offer details:", {
    offerId: offerId,
    offerKey: offerKey,
    offerItemId: offerItemId,
    combinedFormat: combinedOfferItemId,
  });

  // Build contactInfos array (required - separate from passengers)
  const contactInfos = [
    {
      id: "CI-1",
      emailAddresses: [
        {
          address: contact?.email || passengersInfo[0]?.email || "noemail@example.com"
        }
      ],
      phones: [
        {
          number: contact?.phoneNumber || passengersInfo[0]?.phoneNumber || "1234567890"
        }
      ]
    }
  ];

  // Build passengers array in Sabre format
  const passengers = passengersInfo.map((passenger, index) => {
    // Map passenger type to Sabre type codes
    let typeCode = "ADT"; // Default to adult
    if (passenger.type === "child" || passenger.type === "CNN") {
      typeCode = "CNN";
    } else if (passenger.type === "infant" || passenger.type === "INF") {
      typeCode = "INF";
    }

    // Get passenger ID from flight details if available
    const passengerId = flightDetails.passengers?.[index]?.id || `PAX-${index + 1}`;

    // Build passenger object with REQUIRED fields
    const passengerObj = {
      contactInfoRefId: "CI-1", // Required - reference to contactInfos
      givenName: (passenger.firstName || "").toUpperCase().trim(), // Required - must not be empty
      surname: (passenger.lastName || "").toUpperCase().trim(), // Required - must not be empty
      id: passengerId, // Required - passenger ID from offer
      typeCode: typeCode, // Required - ADT, CNN, or INF
    };

    // Add birthdate if available (YYYY-MM-DD format)
    if (passenger.dateOfBirth) {
      passengerObj.birthdate = passenger.dateOfBirth;
    }

    // Add gender if available (M or F)
    if (passenger.gender) {
      const gender = passenger.gender.toLowerCase();
      if (gender.startsWith('m')) {
        passengerObj.gender = "M";
      } else if (gender.startsWith('f')) {
        passengerObj.gender = "F";
      }
    }

    return passengerObj;
  });

  // Validate that all passengers have required fields
  passengers.forEach((passenger, index) => {
    if (!passenger.givenName || passenger.givenName.trim() === "") {
      throw new Error(`Passenger ${index + 1}: First name is required`);
    }
    if (!passenger.surname || passenger.surname.trim() === "") {
      throw new Error(`Passenger ${index + 1}: Last name is required`);
    }
  });

  // Build createOrders array with offerId and selectedOfferItems
  // selectedOfferItems.id must be in format: "{key}-{itemId}"
  const createOrders = [
    {
      offerId: offerId,
      selectedOfferItems: [
        {
          id: combinedOfferItemId  // Format: "{key}-{itemId}"
        }
      ]
    }
  ];

  // Build complete Sabre Orders/Create payload (exact structure from API docs)
  const payload = {
    contactInfos: contactInfos,
    createOrders: createOrders,
    passengers: passengers,
  };

  return payload;
}

