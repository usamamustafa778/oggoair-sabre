// Utility functions for persisting protection options

const PROTECTION_STORAGE_KEY = 'selectedProtection';

export const saveProtectionOption = (bookingId, protectionOption) => {
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `${PROTECTION_STORAGE_KEY}_${bookingId}`;
      localStorage.setItem(storageKey, protectionOption);
    } catch (error) {
      console.error('Error saving protection option to localStorage:', error);
    }
  }
};

export const loadProtectionOption = (bookingId) => {
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `${PROTECTION_STORAGE_KEY}_${bookingId}`;
      const protectionOption = localStorage.getItem(storageKey);
      return protectionOption;
    } catch (error) {
      console.error('Error loading protection option from localStorage:', error);
      return null;
    }
  }
  return null;
};

export const clearProtectionOption = (bookingId) => {
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `${PROTECTION_STORAGE_KEY}_${bookingId}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing protection option from localStorage:', error);
    }
  }
};
