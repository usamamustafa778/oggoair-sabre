import axios from 'axios';

const DUFFEL_API_TOKEN = process.env.DUFFEL_ACCESS_TOKEN || '';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { search } = req.query;

    if (!search || search.length < 1) {
      return res.status(400).json({ message: 'Search query is required' });
    }


    // Call Duffel API directly - try multiple endpoints for better search results
    let response;
    let error;

    // Try the places endpoint first (most comprehensive)
    try {
      response = await axios.get('https://api.duffel.com/air/places', {
        headers: {
          'Accept-Encoding': 'gzip',
          'Accept': 'application/json',
          'Duffel-Version': 'v2',
          'Authorization': `Bearer ${DUFFEL_API_TOKEN}`,
        },
        params: {
          query: search,
          limit: 20
        },
        timeout: 10000
      });
    } catch (placesError) {
      error = placesError;
    }

    // If places endpoint fails, try airports endpoint
    if (!response) {
      try {
        response = await axios.get('https://api.duffel.com/air/airports', {
          headers: {
            'Accept-Encoding': 'gzip',
            'Accept': 'application/json',
            'Duffel-Version': 'v2',
            'Authorization': `Bearer ${DUFFEL_API_TOKEN}`,
          },
          params: {
            query: search,
            limit: 20
          },
          timeout: 10000
        });
      } catch (airportsError) {
        error = airportsError;
      }
    }

    // If both endpoints fail, try cities endpoint
    if (!response) {
      try {
        response = await axios.get('https://api.duffel.com/air/cities', {
          headers: {
            'Accept-Encoding': 'gzip',
            'Accept': 'application/json',
            'Duffel-Version': 'v2',
            'Authorization': `Bearer ${DUFFEL_API_TOKEN}`,
          },
          params: {
            query: search,
            limit: 20
          },
          timeout: 10000
        });
      } catch (citiesError) {
        error = citiesError;
      }
    }

    if (!response) {
      console.error('All Duffel API endpoints failed:', error?.response?.data || error?.message);
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch airport data from Duffel API',
        error: error?.response?.data || error?.message,
      });
    }


    // Check if we have data from Duffel
    if (!response.data.data || response.data.data.length === 0) {
      // Add popular airports as fallback for common searches
      const popularAirports = [
        {
          id: 'arp_dxb_ae',
          name: 'Dubai International Airport',
          iata_code: 'DXB',
          type: 'airport',
          city_name: 'Dubai',
          iata_city_code: 'DXB',
          country_name: 'United Arab Emirates',
          iata_country_code: 'AE',
          latitude: 25.2532,
          longitude: 55.3657
        },
        {
          id: 'arp_lhr_gb',
          name: 'London Heathrow Airport',
          iata_code: 'LHR',
          type: 'airport',
          city_name: 'London',
          iata_city_code: 'LON',
          country_name: 'United Kingdom',
          iata_country_code: 'GB',
          latitude: 51.4700,
          longitude: -0.4543
        },
        {
          id: 'arp_jfk_us',
          name: 'John F. Kennedy International Airport',
          iata_code: 'JFK',
          type: 'airport',
          city_name: 'New York',
          iata_city_code: 'NYC',
          country_name: 'United States',
          iata_country_code: 'US',
          latitude: 40.6413,
          longitude: -73.7781
        },
        {
          id: 'arp_khi_pk',
          name: 'Jinnah International Airport',
          iata_code: 'KHI',
          type: 'airport',
          city_name: 'Karachi',
          iata_city_code: 'KHI',
          country_name: 'Pakistan',
          iata_country_code: 'PK',
          latitude: 24.9065,
          longitude: 67.1602
        },
        {
          id: 'arp_atl_us',
          name: 'Hartsfield-Jackson Atlanta International Airport',
          iata_code: 'ATL',
          type: 'airport',
          city_name: 'Atlanta',
          iata_city_code: 'ATL',
          country_name: 'United States',
          iata_country_code: 'US',
          latitude: 33.6407,
          longitude: -84.4277
        }
      ];

      // Filter popular airports based on search query
      const searchLower = search.toLowerCase();
      const filteredPopular = popularAirports.filter(airport => 
        airport.name.toLowerCase().includes(searchLower) ||
        airport.iata_code.toLowerCase().includes(searchLower) ||
        airport.city_name.toLowerCase().includes(searchLower) ||
        airport.country_name.toLowerCase().includes(searchLower)
      );

      const transformedPopular = filteredPopular.map(airport => ({
        id: airport.id,
        name: airport.name,
        iataCode: airport.iata_code,
        subType: 'AIRPORT',
        address: {
          cityName: airport.city_name,
          cityCode: airport.iata_city_code,
          countryName: airport.country_name,
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

      return res.status(200).json({
        data: transformedPopular
      });
    }

    // Transform Duffel response to match your existing format
    const transformedData = response.data.data.map(place => {
      // Handle different response formats from different endpoints
      const isAirport = place.type === 'airport' || place.iata_code;
      const isCity = place.type === 'city' || place.city_name;
      
      return {
        id: place.id,
        name: place.name || place.city_name || place.iata_code,
        iataCode: place.iata_code || place.city_code || '',
        subType: isCity ? 'CITY' : 'AIRPORT',
        address: {
          cityName: place.city_name || place.name || '',
          cityCode: place.iata_city_code || place.city_code || place.iata_code || '',
          countryName: place.country_name || '',
          countryCode: place.iata_country_code || place.country_code || ''
        },
        geoCode: {
          latitude: place.latitude || 0,
          longitude: place.longitude || 0
        },
        analytics: {
          travelers: {
            score: 0 // Duffel doesn't provide this, so we'll use 0
          }
        }
      };
    });

    // Filter results to match the search query more flexibly
    const filteredData = transformedData.filter(place => {
      const searchLower = search.toLowerCase();
      const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
      
      return searchTerms.some(term => 
        place.name?.toLowerCase().includes(term) ||
        place.iataCode?.toLowerCase().includes(term) ||
        place.address?.cityName?.toLowerCase().includes(term) ||
        place.address?.countryCode?.toLowerCase().includes(term)
      );
    });

    res.status(200).json({
      data: filteredData
    });

  } catch (error) {
    console.error('Duffel API Error:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Airport search failed',
      error: error.response?.data || error.message,
    });
  }
}
