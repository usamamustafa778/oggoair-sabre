// Utility functions for user data management
import { tokenUtils } from "@/config/api";

/**
 * Get current user information from localStorage
 * @returns {Object|null} User data object with name, email, phone or null if not found
 */
export const getCurrentUser = () => {
  return tokenUtils.getUserData();
};

/**
 * Check if user is logged in and has complete profile data
 * @returns {boolean} True if user is authenticated and has profile data
 */
export const isUserProfileComplete = () => {
  const userData = tokenUtils.getUserData();
  const isAuthenticated = tokenUtils.isAuthenticated();

  return isAuthenticated && userData && userData.name && userData.email;
};

/**
 * Get user display name for UI
 * @returns {string} User's name or 'Guest' if not available
 */
export const getUserDisplayName = () => {
  const userData = tokenUtils.getUserData();
  return userData?.name || "Guest";
};

/**
 * Update user data in localStorage
 * @param {Object} newUserData - Updated user data
 */
export const updateUserData = (newUserData) => {
  const currentData = tokenUtils.getUserData() || {};
  const updatedData = { ...currentData, ...newUserData };
  tokenUtils.setUserData(updatedData);
};

/**
 * Clear all user data (for logout)
 */
export const clearUserData = () => {
  tokenUtils.removeToken();
  tokenUtils.removeUserData();
};
