// Next.js API route for bus searches
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const searchParams = req.body;
    
    // Mock bus search results - replace with your actual database query
    const mockBuses = [
      // Porto to Lisbon routes
      {
        id: 1,
        company: "BebaCar Bus",
        departureTime: "03:30",
        departureStation: "Porto, Terminal Intermodal de Campanhã",
        arrivalTime: "07:20",
        arrivalStation: "Lisbon - Oriente",
        duration: "4h 15m",
        price: "€ 263",
        type: "Direct",
        tripType: "3. One-way"
      },
      {
        id: 2,
        company: "FLIXBUS",
        departureTime: "15:30",
        departureStation: "Porto, Terminal Intermodal de Campanhã",
        arrivalTime: "19:45",
        arrivalStation: "Lisboa, Oriente",
        duration: "4h 15m",
        price: "€ 263",
        type: "Direct",
        tripType: "3. One-way"
      },
      {
        id: 3,
        company: "rede expressos",
        departureTime: "08:15",
        departureStation: "Porto, Terminal Intermodal de Campanhã",
        arrivalTime: "12:05",
        arrivalStation: "Lisboa, Oriente",
        duration: "4h 15m",
        price: "€ 263",
        type: "Direct",
        tripType: "3. One-way"
      },
      // Porto to Madrid routes (new routes for the current search)
      {
        id: 4,
        company: "ALSA",
        departureTime: "08:00",
        departureStation: "Porto, Terminal Intermodal de Campanhã",
        arrivalTime: "18:30",
        arrivalStation: "Madrid, Estación Sur",
        duration: "10h 30m",
        price: "€ 45",
        type: "Direct",
        tripType: "3. One-way"
      },
      {
        id: 5,
        company: "FLIXBUS",
        departureTime: "20:00",
        departureStation: "Porto, Terminal Intermodal de Campanhã",
        arrivalTime: "06:30",
        arrivalStation: "Madrid, Estación Sur",
        duration: "10h 30m",
        price: "€ 38",
        type: "Direct",
        tripType: "3. One-way"
      },
      {
        id: 6,
        company: "BebaCar Bus",
        departureTime: "14:00",
        departureStation: "Porto, Terminal Intermodal de Campanhã",
        arrivalTime: "00:30",
        arrivalStation: "Madrid, Estación Sur",
        duration: "10h 30m",
        price: "€ 42",
        type: "Direct",
        tripType: "3. One-way"
      },
      {
        id: 7,
        company: "Eurolines",
        departureTime: "06:30",
        departureStation: "Porto, Terminal Intermodal de Campanhã",
        arrivalTime: "17:00",
        arrivalStation: "Madrid, Estación Sur",
        duration: "10h 30m",
        price: "€ 35",
        type: "Direct",
        tripType: "3. One-way"
      },
      // Madrid to Barcelona routes
      {
        id: 8,
        company: "Eurolines",
        departureTime: "10:00",
        departureStation: "Madrid, Estación Sur",
        arrivalTime: "18:30",
        arrivalStation: "Barcelona, Estació del Nord",
        duration: "8h 30m",
        price: "€ 45",
        type: "Direct",
        tripType: "3. One-way"
      },
      {
        id: 9,
        company: "ALSA",
        departureTime: "14:15",
        departureStation: "Madrid, Estación Sur",
        arrivalTime: "22:45",
        arrivalStation: "Barcelona, Estació del Nord",
        duration: "8h 30m",
        price: "€ 38",
        type: "Direct",
        tripType: "3. One-way"
      },
      // Other European routes
      {
        id: 10,
        company: "FLIXBUS",
        departureTime: "06:00",
        departureStation: "Paris, Bercy Seine",
        arrivalTime: "14:30",
        arrivalStation: "Amsterdam, Sloterdijk",
        duration: "8h 30m",
        price: "€ 29",
        type: "Direct",
        tripType: "3. One-way"
      },
      {
        id: 11,
        company: "BlaBlaBus",
        departureTime: "08:30",
        departureStation: "Paris, Bercy Seine",
        arrivalTime: "16:45",
        arrivalStation: "Amsterdam, Sloterdijk",
        duration: "8h 15m",
        price: "€ 25",
        type: "Direct",
        tripType: "3. One-way"
      },
      {
        id: 12,
        company: "Deutsche Bahn",
        departureTime: "09:00",
        departureStation: "Berlin, Zentraler Omnibusbahnhof",
        arrivalTime: "16:30",
        arrivalStation: "Prague, Florenc",
        duration: "7h 30m",
        price: "€ 35",
        type: "Direct",
        tripType: "3. One-way"
      },
      {
        id: 13,
        company: "RegioJet",
        departureTime: "11:15",
        departureStation: "Berlin, Zentraler Omnibusbahnhof",
        arrivalTime: "18:45",
        arrivalStation: "Prague, Florenc",
        duration: "7h 30m",
        price: "€ 28",
        type: "Direct",
        tripType: "3. One-way"
      },
      {
        id: 14,
        company: "Student Agency",
        departureTime: "13:00",
        departureStation: "Vienna, Erdberg",
        arrivalTime: "20:30",
        arrivalStation: "Budapest, Népliget",
        duration: "7h 30m",
        price: "€ 22",
        type: "Direct",
        tripType: "3. One-way"
      }
    ];

    // Filter buses based on search parameters (improved filtering)
    let filteredBuses = mockBuses;
    
    if (searchParams.from) {
      const fromLower = searchParams.from.toLowerCase();
      filteredBuses = filteredBuses.filter(bus => {
        const departureStation = bus.departureStation.toLowerCase();
        // Check if the city name is in the departure station
        return departureStation.includes(fromLower.split(',')[0].trim()) || 
               departureStation.includes(fromLower);
      });
    }
    
    if (searchParams.to) {
      const toLower = searchParams.to.toLowerCase();
      filteredBuses = filteredBuses.filter(bus => {
        const arrivalStation = bus.arrivalStation.toLowerCase();
        // Check if the city name is in the arrival station
        return arrivalStation.includes(toLower.split(',')[0].trim()) || 
               arrivalStation.includes(toLower);
      });
    }

    // Filter by time if provided (optional filtering)
    if (searchParams.time) {
      const searchTime = searchParams.time;
      // For now, we'll just return all buses regardless of time
      // In a real implementation, you'd filter by time proximity
    }

    // Add a small delay to simulate API response time
    await new Promise(resolve => setTimeout(resolve, 200));

    res.status(200).json({
      success: true,
      data: filteredBuses,
      message: 'Bus search completed successfully',
      searchParams: searchParams
    });

  } catch (error) {
    console.error('Error searching buses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
} 