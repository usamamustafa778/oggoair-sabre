// API Configuration
// Use live Duffel API directly
export const APILINK = "https://api.duffel.com";

export const BACKEND_API_URL = "https://stingray-app-3fkqv.ondigitalocean.app";
// export const BACKEND_API_URL = "http://localhost:8000";
// Log the API configuration for debugging

// Mapbox Configuration - use NEXT_PUBLIC_MAPBOX_TOKEN from .env
export const mapboxAccessToken =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Duffel API Configuration
export const DUFFEL_CONFIG = {
  baseUrl: "https://api.duffel.com/air",
  version: "v2",
  accessToken:
    process.env.NEXT_PUBLIC_DUFFEL_ACCESS_TOKEN ||
    "your_duffel_access_token_here",
  headers: {
    "Accept-Encoding": "gzip",
    Accept: "application/json",
    "Content-Type": "application/json",
    "Duffel-Version": "v2",
  },
};

// API Endpoints - Use relative URLs for local Next.js API routes
export const API_ENDPOINTS = {
  // Flight endpoints
  flights: `/api/flights`,
  flightSearch: `/api/flights/search`,
  flightDetails: `/api/flights/details`,

  // Bus endpoints
  buses: `/api/buses`,
  busSearch: `/api/buses/search`,
  busDetails: `/api/buses/details`,

  // Booking endpoints
  bookings: `/api/bookings`,
  createBooking: `/api/bookings/create`,

  // User endpoints
  users: `/api/users`,
  auth: `/api/auth`,

  // Search endpoints
  search: `/api/search`,
  locations: `/api/locations`,
};

// Token management utilities
export const tokenUtils = {
  // Get access token from localStorage
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  },

  // Set access token in localStorage
  setToken: (token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  },

  // Get refresh token from localStorage
  getRefreshToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  },

  // Set refresh token in localStorage
  setRefreshToken: (refreshToken) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", refreshToken);
    }
  },

  // Remove tokens from localStorage
  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = tokenUtils.getToken();
    return !!token;
  },

  // Get user data from localStorage
  getUserData: () => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  },

  // Set user data in localStorage
  setUserData: (userData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  },

  // Remove user data from localStorage
  removeUserData: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userData");
    }
  },

  // Store complete authentication data
  setAuthData: (authData) => {
    if (typeof window !== "undefined") {
      const { user, token, refreshToken } = authData;
      
      // Store user data
      if (user) {
        tokenUtils.setUserData(user);
      }
      
      // Store access token
      if (token) {
        tokenUtils.setToken(token);
      }
      
      // Store refresh token
      if (refreshToken) {
        tokenUtils.setRefreshToken(refreshToken);
      }
    }
  },

  // Clear all authentication data
  clearAuthData: () => {
    if (typeof window !== "undefined") {
      tokenUtils.removeUserData();
      tokenUtils.removeToken();
    }
  },
};

// Request headers
export const getHeaders = (token = null) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Use provided token or get from localStorage
  const authToken = token || tokenUtils.getToken();
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  return headers;
};

// Duffel API headers
export const getDuffelHeaders = () => {
  return {
    ...DUFFEL_CONFIG.headers,
    Authorization: `Bearer ${DUFFEL_CONFIG.accessToken}`,
  };
};

// API request helper
export const apiRequest = async (endpoint, options = {}) => {
  // For development, use relative URLs to hit Next.js API routes
  const url = endpoint.startsWith("http") ? endpoint : endpoint;

  const config = {
    headers: getHeaders(options.token),
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Duffel API request helper
export const duffelApiRequest = async (endpoint, options = {}) => {
  const url = `${DUFFEL_CONFIG.baseUrl}${endpoint}`;

  const config = {
    headers: getDuffelHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Duffel API error! status: ${response.status}, message: ${
          errorData.errors?.[0]?.message || "Unknown error"
        }`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Duffel API request failed:", error);
    throw error;
  }
};
