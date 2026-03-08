/**
 * PricedFlight - Single Source of Truth for Priced Flight Data
 * 
 * This utility provides a standardized structure for priced flight data
 * that includes final pricing, passenger breakdown, fare details, and segments.
 * 
 * This structure must be reused everywhere:
 * - Search results (after AirPrice)
 * - Checkout page
 * - Booking confirmation
 * - Fare options
 * - Any other component that needs priced flight data
 */

/**
 * Creates a standardized pricedFlight object from AirPrice response
 * 
 * @param {Object} flight - Original flight object (from BFM)
 * @param {Object} airPriceResponse - AirPrice API response
 * @param {Object} passengerCounts - Passenger counts { adults, child, infant }
 * @param {string} cabinClass - Cabin class (Economy, Business, First)
 * @returns {Object} Standardized pricedFlight object
 */
export function createPricedFlight(flight, airPriceResponse, passengerCounts = {}, cabinClass = "Economy") {
  if (!flight || !airPriceResponse) {
    throw new Error("Flight and AirPrice response are required");
  }

  // Extract pricing from AirPrice response
  const pricing = airPriceResponse.pricing || {};
  const passengerPricing = airPriceResponse.passenger_pricing || {};
  const taxBreakdown = airPriceResponse.tax_breakdown || [];

  // Build standardized pricedFlight object
  const pricedFlight = {
    // ============================================
    // IDENTIFICATION
    // ============================================
    id: flight.id || flight.offer_id,
    offer_id: flight.offer_id || flight.id,
    
    // ============================================
    // FINAL PRICING (from AirPrice)
    // ============================================
    total_amount: pricing.total_amount || airPriceResponse.total_amount || "0",
    total_currency: pricing.total_currency || airPriceResponse.total_currency || "USD",
    base_amount: pricing.base_amount || airPriceResponse.base_amount || "0",
    tax_amount: pricing.tax_amount || airPriceResponse.tax_amount || "0",
    
    // ============================================
    // PASSENGER BREAKDOWN
    // ============================================
    passenger_counts: {
      adults: passengerCounts.adults || passengerCounts.ADT || 0,
      child: passengerCounts.child || passengerCounts.CNN || 0,
      infant: passengerCounts.infant || passengerCounts.INF || 0,
    },
    
    passenger_pricing: {
      // Per passenger type pricing
      ADT: passengerPricing.ADT || null,
      CNN: passengerPricing.CNN || null,
      INF: passengerPricing.INF || null,
      // Summary
      total_passengers: (passengerCounts.adults || 0) + (passengerCounts.child || 0) + (passengerCounts.infant || 0),
    },
    
    // ============================================
    // FARE DETAILS
    // ============================================
    fare_details: {
      cabin_class: cabinClass,
      fare_basis: airPriceResponse.fare_basis || null,
      fare_type: airPriceResponse.fare_type || null,
      booking_class: airPriceResponse.booking_class || null,
      refundable: airPriceResponse.refundable || false,
      changeable: airPriceResponse.changeable || false,
    },
    
    // ============================================
    // TAX BREAKDOWN
    // ============================================
    tax_breakdown: taxBreakdown.map(tax => ({
      code: tax.code || tax.TaxCode || "",
      amount: tax.amount || tax.Amount || "0",
      currency: tax.currency || tax.CurrencyCode || pricing.total_currency || "USD",
      description: tax.description || tax.TaxName || tax.Description || "",
    })),
    
    // ============================================
    // SEGMENTS/SLICES (from original flight)
    // ============================================
    slices: flight.slices || [],
    
    // ============================================
    // AIRLINE INFORMATION
    // ============================================
    owner: flight.owner || {},
    carrier: flight.carrier || flight.owner?.iata_code || "",
    
    // ============================================
    // METADATA
    // ============================================
    estimated: false, // Final pricing from AirPrice
    _isBFMData: false, // Not BFM data (backward compatibility)
    _pricingType: 'final', // Final pricing (backward compatibility)
    _pricingSource: 'airprice', // Source of pricing
    _pricedAt: new Date().toISOString(), // When pricing was retrieved
    
    // ============================================
    // FULL AIRPRICE DATA (for reference)
    // ============================================
    _airPriceData: {
      total_amount: pricing.total_amount || airPriceResponse.total_amount,
      total_currency: pricing.total_currency || airPriceResponse.total_currency,
      base_amount: pricing.base_amount || airPriceResponse.base_amount,
      tax_amount: pricing.tax_amount || airPriceResponse.tax_amount,
      tax_breakdown: taxBreakdown,
      passenger_pricing: passengerPricing,
      retrievedAt: new Date().toISOString(),
    },
    
    // ============================================
    // PRESERVE OTHER FLIGHT DATA
    // ============================================
    passengers: flight.passengers || [],
    passenger_identities: flight.passenger_identities || [],
    conditions: flight.conditions || {},
    live_mode: flight.live_mode !== undefined ? flight.live_mode : true,
    private_fares: flight.private_fares || [],
  };

  return pricedFlight;
}

/**
 * Validates if an object is a valid pricedFlight
 * 
 * @param {Object} obj - Object to validate
 * @returns {boolean} True if valid pricedFlight
 */
export function isValidPricedFlight(obj) {
  if (!obj || typeof obj !== 'object') return false;
  
  // Required fields
  const required = ['id', 'total_amount', 'total_currency', 'slices'];
  return required.every(field => obj[field] !== undefined);
}

/**
 * Merges pricedFlight data into existing flight object
 * Useful for updating flight objects with final pricing
 * 
 * @param {Object} flight - Existing flight object
 * @param {Object} pricedFlight - PricedFlight object to merge
 * @returns {Object} Merged flight object
 */
export function mergePricedFlight(flight, pricedFlight) {
  if (!isValidPricedFlight(pricedFlight)) {
    console.warn("Invalid pricedFlight object, returning original flight");
    return flight;
  }

  return {
    ...flight,
    ...pricedFlight,
    // Preserve original ID and slices
    id: flight.id || pricedFlight.id,
    slices: flight.slices || pricedFlight.slices,
  };
}

/**
 * Extracts pricing summary from pricedFlight
 * 
 * @param {Object} pricedFlight - PricedFlight object
 * @returns {Object} Pricing summary
 */
export function getPricingSummary(pricedFlight) {
  if (!isValidPricedFlight(pricedFlight)) {
    return null;
  }

  return {
    total: {
      amount: pricedFlight.total_amount,
      currency: pricedFlight.total_currency,
    },
    base: {
      amount: pricedFlight.base_amount,
      currency: pricedFlight.total_currency,
    },
    taxes: {
      amount: pricedFlight.tax_amount,
      currency: pricedFlight.total_currency,
      breakdown: pricedFlight.tax_breakdown || [],
    },
    passengers: pricedFlight.passenger_counts || {},
    cabin: pricedFlight.fare_details?.cabin_class || "Economy",
  };
}

/**
 * Formats pricedFlight for display
 * 
 * @param {Object} pricedFlight - PricedFlight object
 * @param {Function} formatPrice - Price formatting function (optional)
 * @returns {Object} Formatted display data
 */
export function formatPricedFlightForDisplay(pricedFlight, formatPrice = null) {
  if (!isValidPricedFlight(pricedFlight)) {
    return null;
  }

  const summary = getPricingSummary(pricedFlight);
  const totalAmount = parseFloat(pricedFlight.total_amount || 0);
  
  return {
    price: formatPrice ? formatPrice(totalAmount) : totalAmount.toFixed(2),
    currency: pricedFlight.total_currency,
    formattedPrice: `${pricedFlight.total_currency} ${totalAmount.toFixed(2)}`,
    isEstimated: pricedFlight.estimated === true,
    passengerCount: summary.passengers.adults + summary.passengers.child + summary.passengers.infant,
    cabinClass: summary.cabin,
  };
}

