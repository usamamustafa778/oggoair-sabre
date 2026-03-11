export const deriveBookingStatus = (booking = {}) => {
  return booking.bookingStatus ?? booking.status ?? 'pending';
};

export const derivePaymentStatus = (booking = {}) => {
  return (
    booking.paymentStatus ??
    booking.payment?.status ??
    booking.revolutData?.state ??
    'pending'
  );
};

