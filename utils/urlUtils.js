/**
 * Utility functions for URL handling
 */

/**
 * Creates a clean, SEO-friendly URL slug from a hotel name
 * @param {string} hotelName - The hotel name to convert
 * @returns {string} - Clean URL slug
 */
export const createHotelSlug = (hotelName) => {
    if (!hotelName) return 'hotel';
    
    return hotelName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };
  
  /**
   * Creates a hotel details URL
   * @param {string} hotelName - The hotel name
   * @param {string} hotelId - The hotel ID
   * @returns {string} - Complete hotel details URL
   */
  export const createHotelDetailsUrl = (hotelName, hotelId) => {
    const slug = createHotelSlug(hotelName);
    return `/hotel/${slug}?id=${hotelId}`;
  };
  
  /**
   * Creates a hotel checkout URL
   * @param {string} hotelName - The hotel name
   * @param {string} hotelId - The hotel ID
   * @param {string} roomId - The room ID (optional)
   * @param {string} rateIndex - The rate index (optional)
   * @returns {string} - Complete hotel checkout URL
   */
  export const createHotelCheckoutUrl = (hotelName, hotelId, roomId = '', rateIndex = '') => {
    const slug = createHotelSlug(hotelName);
    const params = new URLSearchParams({ id: hotelId });
    
    if (roomId) params.append('room', roomId);
    if (rateIndex) params.append('rate', rateIndex);
    
    return `/hotel/checkout/${slug}?${params.toString()}`;
  };