import axios from 'axios';
const APILINK = "https://www.oggoair.com";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const response = await axios.post(`${APILINK}/api/flights/search-list`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
} 