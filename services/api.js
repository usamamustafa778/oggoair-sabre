import { API_ENDPOINTS, apiRequest } from '../config/api';

// Flight Services
export const flightServices = {
    // Search flights
    searchFlights: async (searchParams) => {
        return await apiRequest(API_ENDPOINTS.flightSearch, {
            method: 'POST',
            body: JSON.stringify(searchParams),
        });
    },

    // Get flight details
    getFlightDetails: async (flightId) => {
        return await apiRequest(`${API_ENDPOINTS.flightDetails}/${flightId}`);
    },

    // Get all flights
    getAllFlights: async () => {
        return await apiRequest(API_ENDPOINTS.flights);
    },
};

// Bus Services
export const busServices = {
    // Search buses
    searchBuses: async (searchParams) => {
        return await apiRequest(API_ENDPOINTS.busSearch, {
            method: 'POST',
            body: JSON.stringify(searchParams),
        });
    },

    // Get bus details
    getBusDetails: async (busId) => {
        return await apiRequest(`${API_ENDPOINTS.busDetails}/${busId}`);
    },

    // Get all buses
    getAllBuses: async () => {
        return await apiRequest(API_ENDPOINTS.buses);
    },
};

// Booking Services
export const bookingServices = {
    // Create booking
    createBooking: async (bookingData) => {
        return await apiRequest(API_ENDPOINTS.createBooking, {
            method: 'POST',
            body: JSON.stringify(bookingData),
        });
    },

    // Get user bookings
    getUserBookings: async (userId, token) => {
        return await apiRequest(`${API_ENDPOINTS.bookings}/user/${userId}`, {
            token,
        });
    },

    // Get booking details
    getBookingDetails: async (bookingId, token) => {
        return await apiRequest(`${API_ENDPOINTS.bookings}/${bookingId}`, {
            token,
        });
    },
};

// User Services
export const userServices = {
    // User authentication
    login: async (credentials) => {
        return await apiRequest(`${API_ENDPOINTS.auth}/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    },

    // User registration
    register: async (userData) => {
        return await apiRequest(`${API_ENDPOINTS.auth}/register`, {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    // Get user profile
    getUserProfile: async (token) => {
        return await apiRequest(`${API_ENDPOINTS.users}/profile`, {
            token,
        });
    },

    // Update user profile
    updateUserProfile: async (userData, token) => {
        return await apiRequest(`${API_ENDPOINTS.users}/profile`, {
            method: 'PUT',
            body: JSON.stringify(userData),
            token,
        });
    },
};

// Search Services
export const searchServices = {
    // General search
    search: async (query) => {
        return await apiRequest(`${API_ENDPOINTS.search}?q=${encodeURIComponent(query)}`);
    },

    // Get locations
    getLocations: async () => {
        return await apiRequest(API_ENDPOINTS.locations);
    },

    // Search locations
    searchLocations: async (query) => {
        return await apiRequest(`${API_ENDPOINTS.locations}/search?q=${encodeURIComponent(query)}`);
    },
}; 