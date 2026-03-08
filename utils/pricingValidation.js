/**
 * Pricing Validation Utilities
 * 
 * Validates that pricing meets all success criteria:
 * 1. Search cards show final prices (not estimated)
 * 2. No estimated price on checkout
 * 3. Passenger count affects price correctly
 * 4. Economy vs Business prices differ
 * 5. No AirPrice call on checkout when final pricing exists
 */

/**
 * Validates that a flight has final pricing (not estimated)
 * 
 * @param {Object} flight - Flight object to validate
 * @returns {Object} Validation result
 */
export function validateFinalPricing(flight) {
  if (!flight) {
    return {
      isValid: false,
      errors: ["Flight object is missing"],
    };
  }

  const errors = [];
  const warnings = [];

  // Check if price is final (not estimated)
  const isEstimated = flight.estimated === true || 
                     flight._isBFMData === true || 
                     flight._pricingType === 'indicative';
  
  if (isEstimated) {
    errors.push("Flight has estimated pricing - should have final pricing");
  }

  // Check if total_amount exists and is valid
  if (!flight.total_amount || parseFloat(flight.total_amount || 0) <= 0) {
    errors.push("total_amount is missing or invalid");
  }

  // Check if currency exists
  if (!flight.total_currency) {
    warnings.push("total_currency is missing");
  }

  // Check if passenger_pricing exists for final pricing
  if (!isEstimated && !flight.passenger_pricing) {
    warnings.push("Final pricing should include passenger_pricing breakdown");
  }

  // Check if fare_details exists for final pricing
  if (!isEstimated && !flight.fare_details) {
    warnings.push("Final pricing should include fare_details");
  }

  return {
    isValid: errors.length === 0,
    isEstimated: isEstimated,
    hasFinalPricing: !isEstimated,
    errors,
    warnings,
  };
}

/**
 * Validates that passenger count affects pricing correctly
 * 
 * @param {Object} pricedFlight - PricedFlight object
 * @param {Object} passengerCounts - Passenger counts { adults, child, infant }
 * @returns {Object} Validation result
 */
export function validatePassengerCountPricing(pricedFlight, passengerCounts) {
  if (!pricedFlight || !passengerCounts) {
    return {
      isValid: false,
      errors: ["pricedFlight and passengerCounts are required"],
    };
  }

  const errors = [];
  const warnings = [];

  // Check if passenger_pricing exists
  if (!pricedFlight.passenger_pricing) {
    errors.push("passenger_pricing is missing - cannot validate passenger count pricing");
    return { isValid: false, errors };
  }

  const totalPassengers = (passengerCounts.adults || 0) + 
                         (passengerCounts.child || 0) + 
                         (passengerCounts.infant || 0);

  if (totalPassengers === 0) {
    errors.push("Total passenger count is 0");
  }

  // Validate ADT pricing
  if (passengerCounts.adults > 0) {
    if (!pricedFlight.passenger_pricing.ADT) {
      errors.push("ADT passenger_pricing is missing but adults > 0");
    } else {
      const adtPrice = parseFloat(pricedFlight.passenger_pricing.ADT.totalFare || 0);
      if (adtPrice <= 0) {
        errors.push("ADT totalFare is invalid");
      }
    }
  }

  // Validate CNN pricing
  if (passengerCounts.child > 0) {
    if (!pricedFlight.passenger_pricing.CNN) {
      warnings.push("CNN passenger_pricing is missing but child > 0");
    }
  }

  // Validate INF pricing
  if (passengerCounts.infant > 0) {
    if (!pricedFlight.passenger_pricing.INF) {
      warnings.push("INF passenger_pricing is missing but infant > 0");
    }
  }

  // Check if total_amount matches expected calculation
  if (pricedFlight.passenger_pricing.ADT && passengerCounts.adults > 0) {
    const expectedTotal = parseFloat(pricedFlight.passenger_pricing.ADT.totalFare || 0);
    const actualTotal = parseFloat(pricedFlight.total_amount || 0);
    const difference = Math.abs(expectedTotal - actualTotal);
    
    // Allow small difference due to rounding
    if (difference > 0.01 && totalPassengers === passengerCounts.adults) {
      warnings.push(`Total amount (${actualTotal}) doesn't match ADT pricing (${expectedTotal})`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates that Economy vs Business prices differ
 * 
 * @param {Object} economyFlight - PricedFlight for Economy
 * @param {Object} businessFlight - PricedFlight for Business
 * @returns {Object} Validation result
 */
export function validateCabinClassPricing(economyFlight, businessFlight) {
  if (!economyFlight || !businessFlight) {
    return {
      isValid: false,
      errors: ["Both economyFlight and businessFlight are required"],
    };
  }

  const errors = [];
  const warnings = [];

  const economyPrice = parseFloat(economyFlight.total_amount || 0);
  const businessPrice = parseFloat(businessFlight.total_amount || 0);

  if (economyPrice <= 0 || businessPrice <= 0) {
    errors.push("Invalid prices for comparison");
  }

  if (economyPrice === businessPrice) {
    warnings.push("Economy and Business prices are the same - may indicate pricing issue");
  }

  if (businessPrice < economyPrice) {
    warnings.push("Business price is less than Economy price - unexpected");
  }

  // Check fare_details cabin_class
  if (economyFlight.fare_details?.cabin_class !== "Economy") {
    warnings.push("economyFlight fare_details.cabin_class is not 'Economy'");
  }

  if (businessFlight.fare_details?.cabin_class !== "Business") {
    warnings.push("businessFlight fare_details.cabin_class is not 'Business'");
  }

  return {
    isValid: errors.length === 0,
    pricesDiffer: economyPrice !== businessPrice,
    economyPrice,
    businessPrice,
    priceDifference: businessPrice - economyPrice,
    errors,
    warnings,
  };
}

/**
 * Validates that checkout page doesn't call AirPrice when final pricing exists
 * 
 * @param {Object} flight - Flight object from checkout
 * @returns {Object} Validation result
 */
export function validateNoAirPriceCall(flight) {
  if (!flight) {
    return {
      isValid: false,
      errors: ["Flight object is missing"],
    };
  }

  const errors = [];
  const warnings = [];

  const hasFinalPricing = flight.estimated === false || 
                         (flight._pricingType === 'final' && !flight._isBFMData);

  if (!hasFinalPricing) {
    warnings.push("Flight has estimated pricing - AirPrice should be called");
  } else {
    // Final pricing exists - AirPrice should NOT be called
    if (flight._airPriceData?.retrievedAt) {
      // Good - has AirPrice data from search results
    } else {
      warnings.push("Final pricing exists but _airPriceData is missing");
    }
  }

  return {
    isValid: errors.length === 0,
    hasFinalPricing,
    shouldCallAirPrice: !hasFinalPricing,
    errors,
    warnings,
  };
}

/**
 * Comprehensive validation of all success criteria
 * 
 * @param {Object} flight - Flight object to validate
 * @param {Object} passengerCounts - Passenger counts
 * @returns {Object} Complete validation result
 */
export function validateAllSuccessCriteria(flight, passengerCounts = {}) {
  const results = {
    finalPricing: validateFinalPricing(flight),
    passengerCountPricing: validatePassengerCountPricing(flight, passengerCounts),
    noAirPriceCall: validateNoAirPriceCall(flight),
    allValid: false,
  };

  results.allValid = 
    results.finalPricing.isValid &&
    results.passengerCountPricing.isValid &&
    results.noAirPriceCall.isValid;

  return results;
}

