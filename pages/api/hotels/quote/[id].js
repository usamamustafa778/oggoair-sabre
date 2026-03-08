import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hotel ID is required' 
      });
    }


    // Call the external API instead of creating a recursive call
    const response = await axios.get(`https://www.oggoair.com/api/hotels/quote/${id}`);

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching hotel quote:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hotel not found',
        error: error.response?.data || 'The requested hotel could not be found'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch hotel quote',
      error: error.response?.data || error.message 
    });
  }
} 