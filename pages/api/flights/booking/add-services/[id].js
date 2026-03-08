import { setBookingProtection } from '../storage.js';

export default function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { selectedServices, selectedProtection } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Booking ID is required' });
  }

  if (!selectedServices || !Array.isArray(selectedServices)) {
    return res.status(400).json({ message: 'Selected services array is required' });
  }

  if (!selectedProtection) {
    return res.status(400).json({ message: 'Selected protection option is required' });
  }

  try {
    // Store the selected protection option for this booking
    setBookingProtection(id, selectedProtection);
    
    // In a real implementation, you would update the booking in the database
    // For now, we'll just return a success response

    res.status(200).json({
      success: true,
      message: 'Services and protection added successfully',
      data: {
        bookingId: id,
        addedServices: selectedServices,
        selectedProtection: selectedProtection
      }
    });
  } catch (error) {
    console.error('Error adding services to booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add services to booking'
    });
  }
} 