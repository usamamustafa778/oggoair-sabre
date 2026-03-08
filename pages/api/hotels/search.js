import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      latitude,
      longitude,
      checkin,
      checkout,
      adults,
      child,
      infant,
      rooms,
      freeCancellation,
      bestRating
    } = req.body;


    // Call the external API instead of creating a recursive call
    const response = await axios.post(`https://www.oggoair.com/api/hotels`, {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      checkin,
      checkout,
      adults,
      child,
      infant,
      rooms,
      freeCancellation,
      bestRating
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch hotels',
      error: error.response?.data || error.message 
    });
  }
} 