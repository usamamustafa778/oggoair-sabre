// Utility functions for persisting form data in the flight booking flow

const STORAGE_KEYS = {
  FLIGHT_FORM_DATA: 'flight_form_data',
  BOOKING_ID: 'booking_id'
};

// Save complete form data to localStorage
export const saveFlightFormData = (passengersInfo, flightId) => {
  try {
    const data = {
      passengersInfo,
      flightId,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.FLIGHT_FORM_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving flight form data:', error);
  }
};

// Load complete form data from localStorage
export const loadFlightFormData = (flightId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FLIGHT_FORM_DATA);
    
    if (stored) {
      const data = JSON.parse(stored);
      
      // Only return data if it's for the same flight and not too old (24 hours)
      if (data.flightId === flightId && (Date.now() - data.timestamp) < 24 * 60 * 60 * 1000) {
        // Validate the data structure
        if (data.passengersInfo && Array.isArray(data.passengersInfo) && data.passengersInfo.length > 0) {
          return data.passengersInfo;
        }
      }
    }
  } catch (error) {
    console.error('Error loading flight form data:', error);
  }
  return null;
};

// Save booking ID to localStorage
export const saveBookingId = (bookingId, flightId) => {
  try {
    const data = {
      bookingId,
      flightId,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.BOOKING_ID, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving booking ID:', error);
  }
};

// Load booking ID from localStorage
export const loadBookingId = (flightId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKING_ID);
    if (stored) {
      const data = JSON.parse(stored);
      // Only return data if it's for the same flight and not too old (24 hours)
      if (data.flightId === flightId && (Date.now() - data.timestamp) < 24 * 60 * 60 * 1000) {
        return data.bookingId;
      }
    }
  } catch (error) {
    console.error('Error loading booking ID:', error);
  }
  return null;
};

// Clear all stored data for a specific flight
export const clearFlightData = (flightId) => {
  try {
    const keys = [STORAGE_KEYS.FLIGHT_FORM_DATA, STORAGE_KEYS.BOOKING_ID];
    keys.forEach(key => {
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.flightId === flightId) {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Error clearing flight data:', error);
  }
};

// Clear all stored data (useful for logout or session end)
export const clearAllFlightData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing all flight data:', error);
  }
};

// Check if there's saved data for a specific flight
export const hasSavedData = (flightId) => {
  try {
    const formData = localStorage.getItem(STORAGE_KEYS.FLIGHT_FORM_DATA);
    
    if (formData) {
      const data = JSON.parse(formData);
      if (data.flightId === flightId && (Date.now() - data.timestamp) < 24 * 60 * 60 * 1000) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking saved data:', error);
    return false;
  }
};

// Clean up old localStorage data that contains hardcoded defaults
export const cleanOldDefaults = () => {
  try {
    // Clear old flight form data that might have hardcoded +92 or Pakistan defaults
    const formData = localStorage.getItem(STORAGE_KEYS.FLIGHT_FORM_DATA);
    if (formData) {
      const data = JSON.parse(formData);
      if (data.passengersInfo && data.passengersInfo.length > 0) {
        const firstPassenger = data.passengersInfo[0];
        // If the first passenger has +92 dial code or Pakistan citizenship, clear the data
        if (firstPassenger.dialCode === "+92" || firstPassenger.cityzenShip === "Pakistan") {
          localStorage.removeItem(STORAGE_KEYS.FLIGHT_FORM_DATA);
          console.log("Cleared old form data with hardcoded defaults");
        }
      }
    }

    // Clear old passenger data that might have hardcoded defaults
    const passengerData = localStorage.getItem("passenger_data");
    if (passengerData) {
      const data = JSON.parse(passengerData);
      if (data.contact && data.contact.dialCode === "+92") {
        localStorage.removeItem("passenger_data");
        console.log("Cleared old passenger data with hardcoded dial code");
      }
    }

    // Clear any old flight data with hardcoded defaults
    const flightSelected = localStorage.getItem("flight_selected");
    if (flightSelected) {
      const data = JSON.parse(flightSelected);
      // Check if any passengers in flight data have hardcoded defaults
      if (data.passengers && data.passengers.some(p => p.dialCode === "+92")) {
        localStorage.removeItem("flight_selected");
        console.log("Cleared old flight data with hardcoded defaults");
      }
    }

    // Clear user data if it has hardcoded phone with +92
    const userData = localStorage.getItem("userData");
    if (userData) {
      const data = JSON.parse(userData);
      if (data.phone && data.phone.toString().startsWith("+92")) {
        // Clear the phone number to force user to re-enter
        data.phone = "";
        localStorage.setItem("userData", JSON.stringify(data));
        console.log("Cleared hardcoded phone number from user data");
      }
    }
  } catch (error) {
    console.error('Error cleaning old defaults:', error);
  }
};
