/**
 * Transform Duffel payload to Sabre BFM JSON structure
 * 
 * This function takes a Duffel-format payload and transforms it into
 * the exact Sabre Bargain Finder Max (BFM) JSON structure.
 * 
 * @param {Object} duffelPayload - Duffel format payload
 * @param {Array} duffelPayload.slices - Array of flight slices
 * @param {String} duffelPayload.slices[].origin - Origin airport code (e.g., "ATL")
 * @param {String} duffelPayload.slices[].destination - Destination airport code (e.g., "CHI")
 * @param {String} duffelPayload.slices[].departure_date - Departure date in YYYY-MM-DD format
 * @param {Array} duffelPayload.passengers - Array of passenger objects
 * @param {String} duffelPayload.passengers[].type - Passenger type ("adult", "child", "infant_without_seat")
 * @param {String} duffelPayload.cabin_class - Cabin class ("economy", "business")
 * @param {String} duffelPayload.flightType - Flight type ("one-way", "round-trip")
 * @returns {Object} Sabre OTA_AirLowFareSearchRQ structure
 * 
 * @example
 * const duffelPayload = {
 *   "slices": [{"origin": "ATL", "destination": "CHI", "departure_date": "2025-12-27"}],
 *   "cabin_class": "economy",
 *   "flightType": "one-way",
 *   "passengers": [{"type": "adult"}]
 * };
 * 
 * const sabreRequest = transformDuffelToSabre(duffelPayload);
 */
export function transformDuffelToSabre(duffelPayload) {
  const { slices, passengers, cabin_class, flightType } = duffelPayload;

  // Step 1: Build OriginDestinationInformation array
  // Logic: If flightType is "one-way", only include first slice (1 object)
  // If flightType is "round-trip", include both slices (2 objects)
  const originDestinationInfo = [];

  // Always include first slice (outbound) - RPH: "1"
  if (slices.length > 0) {
    const firstSlice = slices[0];
    originDestinationInfo.push({
      RPH: "1",
      DepartureDateTime: `${firstSlice.departure_date}T00:00:00`, // Format: YYYY-MM-DDTHH:mm:ss
      OriginLocation: {
        LocationCode: firstSlice.origin, // Map from slices[0].origin
      },
      DestinationLocation: {
        LocationCode: firstSlice.destination, // Map from slices[0].destination
      },
    });
  }

  // Only include second slice if round-trip
  if (flightType === "round-trip" && slices.length > 1) {
    const returnSlice = slices[1];
    originDestinationInfo.push({
      RPH: "2",
      DepartureDateTime: `${returnSlice.departure_date}T00:00:00`,
      OriginLocation: {
        LocationCode: returnSlice.origin,
      },
      DestinationLocation: {
        LocationCode: returnSlice.destination,
      },
    });
  }

  // Step 2: Map passengers to Sabre PassengerTypeQuantity
  // Map passengers[].type to Sabre codes:
  // - "adult" -> "ADT"
  // - "child" -> "CNN"
  // - "infant_without_seat" or "infant" -> "INF"
  const passengerCounts = { ADT: 0, CNN: 0, INF: 0 };
  
  passengers.forEach((passenger) => {
    if (passenger.type === "adult") {
      passengerCounts.ADT++;
    } else if (passenger.type === "child") {
      passengerCounts.CNN++;
    } else if (passenger.type === "infant_without_seat" || passenger.type === "infant") {
      passengerCounts.INF++;
    } else {
      // Default to adult if unknown type
      passengerCounts.ADT++;
    }
  });

  // Build PassengerTypeQuantity array
  const passengerTypeQuantities = [];
  if (passengerCounts.ADT > 0) {
    passengerTypeQuantities.push({
      Code: "ADT", // Mapped from passengers[].type == "adult"
      Quantity: passengerCounts.ADT,
    });
  }
  if (passengerCounts.CNN > 0) {
    passengerTypeQuantities.push({
      Code: "CNN", // Mapped from passengers[].type == "child"
      Quantity: passengerCounts.CNN,
    });
  }
  if (passengerCounts.INF > 0) {
    passengerTypeQuantities.push({
      Code: "INF", // Mapped from passengers[].type == "infant_without_seat"
      Quantity: passengerCounts.INF,
    });
  }

  // Ensure at least one passenger
  if (passengerTypeQuantities.length === 0) {
    passengerTypeQuantities.push({
      Code: "ADT",
      Quantity: 1,
    });
  }

  // Step 3: Build complete Sabre OTA_AirLowFareSearchRQ structure
  return {
    OTA_AirLowFareSearchRQ: {
      Version: "2", // As specified
      POS: {
        Source: [
          {
            PseudoCityCode: process.env.SABRE_PCC || "DEFAULT",
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
      OriginDestinationInformation: originDestinationInfo, // Built in Step 1
      TravelPreferences: {
        TPA_Extensions: {
          DataSources: {
            NDC: "Disable",
            ATPCO: "Enable",
            LCC: "Disable",
          },
          PreferNDCSourceOnTie: {
            Value: true,
          },
        },
      },
      TravelerInfoSummary: {
        AirTravelerAvail: [
          {
            PassengerTypeQuantity: passengerTypeQuantities, // Built in Step 2
          },
        ],
      },
      TPA_Extensions: {
        IntelliSellTransaction: {
          RequestType: {
            Name: "200ITINS", // As specified
          },
        },
      },
    },
  };
}


