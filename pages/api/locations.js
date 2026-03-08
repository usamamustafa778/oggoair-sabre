import axios from 'axios';
import { mapboxAccessToken } from '../../config/api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { search } = req.query;
    
    if (!search || search.length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Use Mapbox API like in oggoair-new
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${search}.json`,
      {
        params: {
          access_token: mapboxAccessToken,
          autocomplete: true,
          limit: 10,
        },
      }
    );

    // Transform Mapbox response to match expected format
    const locations = response.data.features.map((feature, index) => ({
      id: index + 1,
      name: feature.place_name,
      address: {
        cityName: feature.context?.find(ctx => ctx.id.includes('place'))?.text || feature.place_name.split(',')[0],
        countryName: feature.context?.find(ctx => ctx.id.includes('country'))?.text || feature.place_name.split(',').pop()?.trim()
      },
      geoCode: {
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0]
      },
      type: feature.place_type[0] === 'poi' ? 'hotel' : 'airport',
      place_name: feature.place_name,
      geometry: feature.geometry
    }));

    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch locations' });
  }
} 