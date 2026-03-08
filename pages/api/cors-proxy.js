import axios from 'axios';

export default async function handler(req, res) {
  // Handle CORS preflight requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Accept-Encoding, Duffel-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url, method = 'GET', headers = {}, data } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Forward the request to the target URL
    const response = await axios({
      method: method.toUpperCase(),
      url: url,
      headers: {
        'Accept-Encoding': 'gzip',
        'Accept': 'application/json',
        'Duffel-Version': 'v2',
        'Authorization': `Bearer ${process.env.DUFFEL_ACCESS_TOKEN || ''}`,
        'Content-Type': 'application/json',
        ...headers
      },
      data: data,
      timeout: 30000
    });



    // Transform Duffel API response to match frontend expectations
    if (url.includes('/air/airports') && response.data && response.data.data) {
      const transformedData = response.data.data.map(airport => ({
        id: airport.id,
        name: airport.name,
        iataCode: airport.iata_code,
        subType: 'AIRPORT',
        address: {
          cityName: airport.city_name,
          cityCode: airport.iata_city_code,
          countryName: airport.iata_country_code,
          countryCode: airport.iata_country_code
        },
        geoCode: {
          latitude: airport.latitude,
          longitude: airport.longitude
        },
        analytics: {
          travelers: {
            score: 0
          }
        }
      }));

      res.status(response.status).json({
        data: transformedData
      });
    } else if (url.includes('/air/cities') && response.data && response.data.data) {
      const transformedData = response.data.data.map(city => ({
        id: city.id,
        name: city.name,
        iataCode: city.iata_code,
        subType: 'CITY',
        address: {
          cityName: city.name,
          cityCode: city.iata_code,
          countryName: city.iata_country_code,
          countryCode: city.iata_country_code
        },
        geoCode: {
          latitude: city.airports?.[0]?.latitude || 0,
          longitude: city.airports?.[0]?.longitude || 0
        },
        analytics: {
          travelers: {
            score: 0
          }
        }
      }));

      res.status(response.status).json({
        data: transformedData
      });
    } else {
      // Return the response data as is for other endpoints
      res.status(response.status).json(response.data);
    }



  } catch (error) {
    console.error('CORS Proxy Error:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({
      error: 'Proxy request failed',
      details: error.response?.data || error.message
    });
  }
}
