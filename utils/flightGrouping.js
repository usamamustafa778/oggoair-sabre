/**
 * Utility functions for grouping flights to avoid duplicate rows
 * and providing fare options based on the same flight route.
 */

/**
 * Creates a unique key for grouping flights based on:
 * - Origin + Destination + DepartureTime + FlightNumber
 * 
 * This prevents different flights from being merged together.
 * Only flights with the same origin, destination, departure time, and flight number are grouped.
 */
function createFlightGroupKey(flight) {
  if (!flight.slices || !flight.slices.length) {
    return `unknown-${flight.id}`;
  }

  const keyParts = [];
  
  flight.slices.forEach((slice, sliceIndex) => {
    if (!slice.segments || !slice.segments.length) return;
    
    // Get origin and destination from slice
    const origin = slice.origin?.iata_code || 'UNK';
    const destination = slice.destination?.iata_code || 'UNK';
    
    // For each segment, create a key with origin + destination + departureTime + flightNumber
    const segmentKeys = slice.segments.map(segment => {
      // Get flight number (required for grouping)
      const flightNum = segment.marketing_carrier_flight_number || 
                       segment.operating_carrier_flight_number || 
                       segment.flight_number || 
                       'UNK';
      
      // Get full departure time (required for grouping - prevents different flights from merging)
      // Use ISO string format for precise time matching
      let departureTime = 'UNK';
      if (segment.departing_at) {
        try {
          // Use the full ISO datetime string for precise grouping
          const depDate = new Date(segment.departing_at);
          if (!isNaN(depDate.getTime())) {
            departureTime = depDate.toISOString(); // Full ISO string: "2025-01-25T15:04:00.000Z"
          }
        } catch (e) {
          // Fallback to original string if date parsing fails
          departureTime = segment.departing_at;
        }
      }
      
      // Group key: origin + destination + departureTime + flightNumber
      // This ensures only identical flights are grouped together
      return `${origin}-${destination}-${departureTime}-${flightNum}`;
    }).join('|');
    
    keyParts.push(segmentKeys);
  });
  
  return keyParts.join('~');
}

/**
 * Groups flights by the same airline, flight number(s), and departure time
 * Returns an array of flight groups, each containing multiple fare options
 */
export function groupFlightsByRoute(flights) {
  if (!Array.isArray(flights)) {
    return [];
  }

  const groupsMap = new Map();
  
  flights.forEach(flight => {
    const groupKey = createFlightGroupKey(flight);
    
    
    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        groupKey,
        flights: [],
        lowestFare: null,
        fareOptions: []
      });
    }
    
    const group = groupsMap.get(groupKey);
    group.flights.push(flight);
    
    // Determine if this is the lowest fare
    const currentPrice = parseFloat(flight.total_amount);
    if (!group.lowestFare || currentPrice < parseFloat(group.lowestFare.total_amount)) {
      group.lowestFare = flight;
    }
  });
  
  // Process each group to create fare options
  groupsMap.forEach(group => {
    // Sort flights by price (ascending)
    const sortedFlights = group.flights.sort((a, b) => 
      parseFloat(a.total_amount) - parseFloat(b.total_amount)
    );
    
    // Categorize fares into Basic/Average/Premium tiers
    group.fareOptions = categorizeFares(sortedFlights);
    
  });
  
  const result = Array.from(groupsMap.values());
  return result;
}

/**
 * Categorizes flights into Basic/Average/Premium fare tiers
 */
function categorizeFares(flights) {
  if (flights.length === 0) return [];
  
  // Sort by price first to ensure proper tier assignment
  const sortedFlights = [...flights].sort((a, b) => 
    parseFloat(a.total_amount) - parseFloat(b.total_amount)
  );
  
  // Create fare options with specific naming
  const fareOptions = sortedFlights.map((flight, index) => {
    // Get cabin class from the flight data
    const cabinClass = flight.slices?.[0]?.segments?.[0]?.passengers?.[0]?.cabin_class || 
                      flight.cabin_class || 
                      'economy';
    
    const fareBrand = flight.slices?.[0]?.fare_brand_name?.toLowerCase() || '';
    
    let fareName = '';
    let tier = 'Basic';
    
    if (cabinClass.toLowerCase() === 'business') {
      // Business class fares
      if (fareBrand.includes('flex') || fareBrand.includes('premium') || fareBrand.includes('plus')) {
        fareName = 'Business Flexible (Business)';
        tier = 'Premium';
      } else {
        fareName = 'Business Lowest (Business)';
        tier = 'Average';
      }
    } else {
      // Economy class fares
      if (fareBrand.includes('flex') || fareBrand.includes('premium') || fareBrand.includes('plus')) {
        fareName = 'Flex (Economy)';
        tier = 'Premium';
      } else {
        fareName = 'Latitude (Economy)';
        tier = 'Basic';
      }
    }
    
    return {
      ...flight,
      tier,
      fareName,
      fareFeatures: extractFareFeatures(flight)
    };
  });
  
  return fareOptions;
}

/**
 * Extracts fare features from flight data for display
 */
function extractFareFeatures(flight) {
  const features = {
    baggage: [],
    flexibility: [],
    amenities: [],
    refundability: 'Non-refundable'
  };
  
  if (!flight.slices || !flight.slices.length) return features;
  
  // Extract baggage information from first segment of first slice
  const firstSegment = flight.slices[0]?.segments?.[0];
  const baggages = firstSegment?.passengers?.[0]?.baggages || [];
  
  baggages.forEach(baggage => {
    if (baggage.type === 'carry_on' && baggage.quantity > 0) {
      features.baggage.push(`${baggage.quantity} carry-on bag${baggage.quantity > 1 ? 's' : ''}`);
    }
    if (baggage.type === 'checked' && baggage.quantity > 0) {
      features.baggage.push(`${baggage.quantity} checked bag${baggage.quantity > 1 ? 's' : ''}`);
    }
  });
  
  // Extract amenities
  const amenities = firstSegment?.passengers?.[0]?.cabin?.amenities || {};
  if (amenities.wifi?.available) {
    features.amenities.push(`WiFi ${amenities.wifi.cost === 'free' ? '(free)' : '(paid)'}`);
  }
  if (amenities.power?.available) {
    features.amenities.push('Power outlets');
  }
  if (amenities.seat?.pitch) {
    features.amenities.push(`${amenities.seat.pitch}" seat pitch`);
  }
  
  // Extract flexibility info
  const conditions = flight.conditions || {};
  if (conditions.change_before_departure?.allowed) {
    const penalty = conditions.change_before_departure.penalty_amount;
    features.flexibility.push(`Changes allowed${penalty ? ` ($${penalty} fee)` : ''}`);
  } else {
    features.flexibility.push('No changes allowed');
  }
  
  if (conditions.refund_before_departure?.allowed) {
    const penalty = conditions.refund_before_departure.penalty_amount;
    features.refundability = `Refundable${penalty ? ` ($${penalty} fee)` : ''}`;
  }
  
  // Extract fare brand specific features
  const fareBrand = flight.slices?.[0]?.fare_brand_name || '';
  if (fareBrand.toLowerCase().includes('flex')) {
    features.flexibility.push('Flexible booking');
  }
  if (fareBrand.toLowerCase().includes('saver')) {
    features.flexibility.push('Restricted booking');
  }
  
  return features;
}

/**
 * Checks if a fare has expired
 */
export function isFareExpired(flight) {
  if (!flight.expires_at) return false;
  
  const expiryTime = new Date(flight.expires_at);
  const now = new Date();
  
  return now > expiryTime;
}

/**
 * Filters out expired fares from flight groups
 */
export function filterExpiredFares(flightGroups) {
  return flightGroups.map(group => ({
    ...group,
    flights: group.flights.filter(flight => !isFareExpired(flight)),
    fareOptions: group.fareOptions.filter(option => !isFareExpired(option))
  })).filter(group => group.flights.length > 0); // Remove groups with no valid fares
}

