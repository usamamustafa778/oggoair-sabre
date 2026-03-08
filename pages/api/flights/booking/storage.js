// Simple in-memory storage for demo purposes
// In a real implementation, this would be stored in a database
const bookingStorage = new Map();

export const getBookingProtection = (bookingId) => {
  return bookingStorage.get(bookingId) || "cancellation";
};

export const setBookingProtection = (bookingId, protection) => {
  bookingStorage.set(bookingId, protection);
};

export default bookingStorage;
