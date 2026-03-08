// Converts a Date object to a YYYY-MM-DD string format
export const searchDateFormateMaker = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero for single-digit months
  const day = String(date.getDate()).padStart(2, "0"); // Add leading zero for single-digit days
  return `${year}-${month}-${day}`; // Example: "2025-06-01"
};

// Formats a date in a short format (e.g., "Jun 20")
export const ShortDate = (date) => {
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}; 